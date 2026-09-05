import { useCallback, useState } from 'react'
import type { Address } from 'viem'
import { useAccount, useReadContract, useReadContracts, useWatchContractEvent } from 'wagmi'
import { irsAgentAbi } from '../abi'
import { addresses, configured } from '../config/addresses'
import { FEED_INTERVAL_SEC, type RankId } from '../config/protocol'
import { useChainClock } from './useChainClock'
import { useEpoch } from './useEpoch'
import { DEMO, demo } from '../config/demo'

export type Agent = {
  id: bigint
  rank: RankId | null
  revealed: boolean
  dead: boolean
  alive: boolean
  lastFed: number
  starvesAt: number
  secondsUntilStarving: number
  lastAttackEpoch: number | null
  canAttackThisEpoch: boolean
  pendingLastEpoch: bigint | undefined
}

/**
 * Roster comes from contract state via `agentsOf`, not wallet NFT enumeration.
 * `agentsOf` is an O(n) view — fine at prototype scale, and the swap to a
 * Transfer/Minted indexer is contained to this hook.
 */
export function useAgentRoster(account?: Address) {
  const { address: connected } = useAccount()
  const owner = account ?? connected
  const enabled = configured('irsAgent') && !!owner && !DEMO
  const { nowSec } = useChainClock(1000)
  const { epoch } = useEpoch()
  const base = { address: addresses.irsAgent as Address, abi: irsAgentAbi } as const

  const { data: ids, refetch: refetchIds } = useReadContract({
    ...base,
    functionName: 'agentsOf',
    args: owner ? [owner] : undefined,
    query: { enabled, refetchInterval: 20_000 },
  })

  const idList = (ids ?? []) as readonly bigint[]
  const prevEpoch = epoch !== undefined && epoch > 0 ? epoch - 1 : undefined

  const { data: details, refetch: refetchDetails } = useReadContracts({
    contracts: idList.flatMap((id) => [
      { ...base, functionName: 'agents', args: [id] } as const,
      { ...base, functionName: 'alive', args: [id] } as const,
      {
        ...base,
        functionName: 'pending',
        args: [id, prevEpoch ?? 0],
      } as const,
    ]),
    query: { enabled: enabled && idList.length > 0, refetchInterval: 15_000 },
  })

  const agents: Agent[] = idList.map((id, i) => {
    const info = details?.[i * 3]
    const aliveRes = details?.[i * 3 + 1]
    const pendingRes = details?.[i * 3 + 2]

    // Real tuple: (uint8 tier, uint40 lastFed, uint32 lastAtkEpoch1,
    // bool revealed, bool dead). uint40/uint32 decode to number, not bigint —
    // my placeholder had them as uint64 and this silently mistyped them.
    const tuple =
      info?.status === 'success'
        ? (info.result as readonly [number, number, number, boolean, boolean])
        : undefined

    const rank = tuple && tuple[3] ? ((tuple[0] as RankId) ?? null) : null
    const lastFed = tuple ? tuple[1] : 0
    const lastAttackEpoch = tuple ? tuple[2] : 0
    const revealed = tuple ? tuple[3] : false
    const dead = tuple ? tuple[4] : false
    const starvesAt = lastFed + FEED_INTERVAL_SEC

    return {
      id,
      rank,
      revealed,
      dead,
      alive: aliveRes?.status === 'success' ? (aliveRes.result as boolean) : !dead,
      lastFed,
      starvesAt,
      secondsUntilStarving: starvesAt - nowSec,
      lastAttackEpoch: lastAttackEpoch || null,
      // lastAtkEpoch1 is 1-indexed per its name: a value of 0 means "never
      // attacked", and epoch N is stored as N+1. VERIFY.
      canAttackThisEpoch:
        epoch === undefined ? false : lastAttackEpoch !== epoch + 1,
      pendingLastEpoch:
        pendingRes?.status === 'success' ? (pendingRes.result as bigint) : undefined,
    }
  })

  const refetch = useCallback(() => {
    void refetchIds()
    void refetchDetails()
  }, [refetchIds, refetchDetails])

  if (DEMO) {
    const demoAgents: Agent[] = demo.agents.map((d) => {
      const starvesAt = nowSec - d.fedAgo + FEED_INTERVAL_SEC
      return {
        id: d.id,
        rank: d.revealed ? (d.tier as RankId) : null,
        revealed: d.revealed,
        dead: d.dead,
        alive: !d.dead,
        lastFed: nowSec - d.fedAgo,
        starvesAt,
        secondsUntilStarving: starvesAt - nowSec,
        lastAttackEpoch: d.atkOffset ? demo.epoch + 1 : null,
        canAttackThisEpoch: d.atkOffset === 0 && d.revealed && !d.dead,
        pendingLastEpoch: d.pending,
      }
    })
    return {
      agents: demoAgents,
      living: demoAgents.filter((a) => a.alive),
      dead: demoAgents.filter((a) => !a.alive),
      refetch,
      configured: true,
    }
  }

  return {
    agents,
    living: agents.filter((a) => a.alive),
    dead: agents.filter((a) => !a.alive),
    refetch,
    configured: enabled,
  }
}

export type PendingReveal = { id: bigint; rank: RankId }
export type PendingAudit = { id: bigint; epoch: number; hit: boolean }

/**
 * VRF results land seconds-to-minutes after the transaction. Subscribe and let
 * the rest of the UI stay interactive; nothing here blocks.
 *
 * `useWatchContractEvent` falls back to polling `eth_getLogs` when the
 * transport has no websocket, which covers the RPC-only case.
 */
export function useAsyncResults(onChange?: () => void) {
  const [reveals, setReveals] = useState<PendingReveal[]>([])
  const [audits, setAudits] = useState<PendingAudit[]>([])
  const enabled = configured('irsAgent') && !DEMO

  useWatchContractEvent({
    address: addresses.irsAgent as Address,
    abi: irsAgentAbi,
    eventName: 'Revealed',
    enabled,
    poll: true,
    pollingInterval: 4_000,
    onLogs(logs) {
      const next = logs
        .map((l) => l.args)
        .filter((a): a is { id: bigint; tier: number } => a.id !== undefined && a.tier !== undefined)
        .map((a) => ({ id: a.id, rank: a.tier as RankId }))
      if (next.length) {
        setReveals((prev) => [...prev, ...next])
        onChange?.()
      }
    },
  })

  useWatchContractEvent({
    address: addresses.irsAgent as Address,
    abi: irsAgentAbi,
    eventName: 'Attacked',
    enabled,
    poll: true,
    pollingInterval: 4_000,
    onLogs(logs) {
      const next = logs
        .map((l) => l.args)
        .filter(
          (a): a is { id: bigint; epoch: number; hit: boolean } =>
            a.id !== undefined && a.epoch !== undefined && a.hit !== undefined,
        )
      if (next.length) {
        setAudits((prev) => [...prev, ...next])
        onChange?.()
      }
    },
  })

  const clearReveal = (id: bigint) =>
    setReveals((prev) => prev.filter((r) => r.id !== id))
  const clearAudit = (id: bigint) => setAudits((prev) => prev.filter((a) => a.id !== id))

  return { reveals, audits, clearReveal, clearAudit }
}

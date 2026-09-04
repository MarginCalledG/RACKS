import type { Address } from 'viem'
import { useAccount, useReadContracts } from 'wagmi'
import { caymanAbi } from '../abi'
import { addresses, configured } from '../config/addresses'
import { LOCK_TIERS, type TierId } from '../config/protocol'
import { useChainClock } from './useChainClock'
import { DEMO, demo } from '../config/demo'

export type LockPosition = {
  tier: TierId
  /** Protected balance in this tier, exact. */
  amount: bigint
  /** Unlock timestamp in seconds, 0 when there is no position. */
  unlockAt: number
  /** Fee to open/renew, in USDG base units, straight from the contract. */
  fee: bigint | undefined
  durationSec: number | undefined
  hasPosition: boolean
  isExpired: boolean
  secondsRemaining: number
}

export function useLockPositions(account?: Address) {
  const { address: connected } = useAccount()
  const owner = account ?? connected
  const enabled = configured('cayman') && !!owner && !DEMO
  const { nowSec } = useChainClock(1000)
  const base = { address: addresses.cayman as Address, abi: caymanAbi } as const

  const { data, isLoading, refetch } = useReadContracts({
    contracts: [
      ...LOCK_TIERS.flatMap((t) => [
        { ...base, functionName: 'claimOf', args: [owner as Address, t.id] } as const,
        { ...base, functionName: 'unlockAt', args: [owner as Address, t.id] } as const,
        { ...base, functionName: 'FEE', args: [t.id] } as const,
        { ...base, functionName: 'DURATION', args: [t.id] } as const,
      ]),
      { ...base, functionName: 'potBalance' } as const,
    ],
    query: { enabled, refetchInterval: 10_000 },
  })

  if (DEMO) {
    const demoPositions: LockPosition[] = LOCK_TIERS.map((t, i) => {
      const d = demo.locks[i]
      const hasPosition = d.amount > 0n
      const secondsRemaining = d.unlockAt - nowSec
      return {
        tier: t.id as TierId,
        amount: d.amount,
        unlockAt: d.unlockAt,
        fee: demo.fees[i],
        durationSec: demo.durations[i],
        hasPosition,
        isExpired: hasPosition && secondsRemaining <= 0,
        secondsRemaining,
      }
    })
    return {
      positions: demoPositions,
      potBalance: demo.potBalance,
      isLoading: false,
      refetch,
      configured: true,
    }
  }

  const positions: LockPosition[] = LOCK_TIERS.map((t, i) => {
    const at = (n: number) => data?.[i * 4 + n]
    const amount = at(0)?.status === 'success' ? (at(0)!.result as bigint) : 0n
    const unlockAt = at(1)?.status === 'success' ? Number(at(1)!.result as bigint) : 0
    const fee = at(2)?.status === 'success' ? (at(2)!.result as bigint) : undefined
    const durationSec =
      at(3)?.status === 'success' ? Number(at(3)!.result as bigint) : undefined

    const hasPosition = amount > 0n
    const secondsRemaining = unlockAt - nowSec
    return {
      tier: t.id as TierId,
      amount,
      unlockAt,
      fee,
      durationSec,
      hasPosition,
      isExpired: hasPosition && unlockAt > 0 && secondsRemaining <= 0,
      secondsRemaining,
    }
  })

  const potIndex = LOCK_TIERS.length * 4
  const potBalance =
    data?.[potIndex]?.status === 'success' ? (data[potIndex].result as bigint) : undefined

  return { positions, potBalance, isLoading, refetch, configured: enabled }
}

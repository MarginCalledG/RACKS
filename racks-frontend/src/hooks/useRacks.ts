import { useEffect, useRef } from 'react'
import type { Address } from 'viem'
import { useAccount, useReadContract, useReadContracts } from 'wagmi'
import { racksAbi } from '../abi'
import { addresses, configured } from '../config/addresses'
import { projectBalance, rayToPct } from '../lib/melt'
import { useChainClock } from './useChainClock'

const REFETCH_MS = 6_000

export function useRacksStats() {
  const enabled = configured('racks')
  const base = { address: addresses.racks as Address, abi: racksAbi } as const

  const { data, isLoading } = useReadContracts({
    contracts: [
      { ...base, functionName: 'ratePerDayBps' },
      { ...base, functionName: 'instantFreeFloatRay' },
      { ...base, functionName: 'totalSupply' },
      { ...base, functionName: 'decimals' },
    ],
    query: { enabled, refetchInterval: REFETCH_MS },
  })

  const rateBps = data?.[0].status === 'success' ? Number(data[0].result) : undefined
  const freeFloatRay = data?.[1].status === 'success' ? data[1].result : undefined
  const totalSupply = data?.[2].status === 'success' ? data[2].result : undefined
  const decimals = data?.[3].status === 'success' ? Number(data[3].result) : 18

  return {
    configured: enabled,
    isLoading,
    rateBps,
    freeFloatPct: freeFloatRay === undefined ? undefined : rayToPct(freeFloatRay),
    totalSupply,
    decimals,
  }
}

/**
 * The headline number. Returns BOTH:
 *   - `onChain`: the exact bigint from the last read. Use this for anything
 *     that becomes a transaction argument.
 *   - `live`: a float projected forward to the current chain second. Display
 *     only. See lib/melt.ts for why this is honest rather than invented.
 */
export function useMeltingBalance(account?: Address) {
  const { address: connected } = useAccount()
  const owner = account ?? connected
  const enabled = configured('racks') && !!owner
  const { rateBps, decimals } = useRacksStats()
  const { nowSec } = useChainClock()

  const { data: onChain, refetch } = useReadContract({
    address: addresses.racks as Address,
    abi: racksAbi,
    functionName: 'balanceOf',
    args: owner ? [owner] : undefined,
    query: { enabled, refetchInterval: REFETCH_MS },
  })

  /**
   * Anchor the projection to the chain second at which we received the read.
   * The read reflects the chain head at that moment, so this lags by at most
   * one block time — bounded, and small next to the quantities on screen.
   */
  const anchor = useRef<{ value: bigint; atSec: number } | null>(null)
  useEffect(() => {
    if (onChain === undefined) return
    anchor.current = { value: onChain, atSec: nowSec }
    // nowSec intentionally omitted: re-anchoring every tick would freeze the
    // display at the last read instead of decaying from it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onChain])

  const live =
    anchor.current && rateBps !== undefined
      ? projectBalance(
          anchor.current.value,
          decimals,
          nowSec - anchor.current.atSec,
          rateBps,
        )
      : undefined

  return { onChain, live, decimals, rateBps, refetch, configured: enabled }
}

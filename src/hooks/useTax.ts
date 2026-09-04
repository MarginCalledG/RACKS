import type { Address } from 'viem'
import { useReadContracts } from 'wagmi'
import { twapOracleAbi } from '../abi'
import { addresses, configured } from '../config/addresses'
import { bpsToPct } from '../lib/melt'

/**
 * The exact tax for THIS trade size, both directions, so the panel can show
 * the cost of the trade the user is about to make rather than a generic band.
 * Size matters: tax is dynamic, so quoting 4% on a preview and charging 7% on
 * execution would be the dark pattern §7 rules out.
 *
 * Refetched aggressively — a stale tax number is a wrong tax number.
 */
export function useTradeTax(amount: bigint | undefined) {
  const enabled = configured('twapOracle') && amount !== undefined && amount > 0n
  const base = { address: addresses.twapOracle as Address, abi: twapOracleAbi } as const

  const { data, isFetching } = useReadContracts({
    contracts: [
      { ...base, functionName: 'taxBps', args: [amount ?? 0n, false] },
      { ...base, functionName: 'taxBps', args: [amount ?? 0n, true] },
    ],
    query: { enabled, refetchInterval: 5_000 },
  })

  const buyBps = data?.[0].status === 'success' ? Number(data[0].result) : undefined
  const sellBps = data?.[1].status === 'success' ? Number(data[1].result) : undefined

  return {
    buyBps,
    sellBps,
    buyPct: buyBps === undefined ? undefined : bpsToPct(buyBps),
    sellPct: sellBps === undefined ? undefined : bpsToPct(sellBps),
    isFetching,
    configured: configured('twapOracle'),
  }
}

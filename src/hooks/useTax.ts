import type { Address } from 'viem'
import { useReadContracts } from 'wagmi'
import { twapOracleV4Abi, wracksAbi } from '../abi'
import { addresses, configured } from '../config/addresses'
import { bpsToPct } from '../lib/melt'
import { DEMO, demo } from '../config/demo'

/**
 * The exact tax for THIS trade size, both directions, so the panel can show
 * the cost of the trade the user is about to make rather than a generic band.
 * Size matters: tax is dynamic, so quoting 4% on a preview and charging 7% on
 * execution would be the dark pattern §7 rules out.
 *
 * Refetched aggressively — a stale tax number is a wrong tax number.
 */
export function useTradeTax(amount: bigint | undefined) {
  const enabled =
    configured('twapOracleV4') && amount !== undefined && amount > 0n && !DEMO
  const base = {
    address: addresses.twapOracleV4 as Address,
    abi: twapOracleV4Abi,
  } as const

  const { data, isFetching } = useReadContracts({
    contracts: [
      { ...base, functionName: 'taxBps', args: [amount ?? 0n, false] },
      { ...base, functionName: 'taxBps', args: [amount ?? 0n, true] },
    ],
    query: { enabled, refetchInterval: 5_000 },
  })

  // The tax now lives on the wrapper, not on Racks. TAX_CAP is the hard
  // ceiling the contract will not exceed — worth quoting alongside the current
  // rate so "it can go higher" has a concrete number attached.
  const { data: capData } = useReadContracts({
    contracts: [
      { address: addresses.wracks as Address, abi: wracksAbi, functionName: 'TAX_CAP' },
    ],
    query: { enabled: configured('wracks') && !DEMO, staleTime: Infinity },
  })
  const capBps =
    capData?.[0]?.status === 'success' ? Number(capData[0].result) : undefined

  const buyBps = data?.[0].status === 'success' ? Number(data[0].result) : undefined
  const sellBps = data?.[1].status === 'success' ? Number(data[1].result) : undefined

  if (DEMO) {
    return {
      buyBps: demo.buyTaxBps,
      sellBps: demo.sellTaxBps,
      buyPct: bpsToPct(demo.buyTaxBps),
      sellPct: bpsToPct(demo.sellTaxBps),
      isFetching: false,
      cap: 700,
      configured: true,
    }
  }

  return {
    buyBps,
    sellBps,
    buyPct: buyBps === undefined ? undefined : bpsToPct(buyBps),
    sellPct: sellBps === undefined ? undefined : bpsToPct(sellBps),
    isFetching,
    cap: capBps,
    configured: configured('twapOracleV4'),
  }
}

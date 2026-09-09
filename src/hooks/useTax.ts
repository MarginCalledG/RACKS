import type { Address } from 'viem'
import { useReadContracts } from 'wagmi'
import { taxHookAbi, twapOracleV4Abi } from '../abi'
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

  // The tax has moved again: it now lives in a Uniswap V4 hook, not on the
  // wrapper and not on Racks. WRacks lost TAX_CAP entirely, so the previous
  // read here pointed at a function that no longer exists.
  //
  // wiringOk() is the hook's own deploy sanity check — if it is false the hook
  // is misconfigured and the tax the UI quotes may not be what actually gets
  // charged, which is worth knowing before signing anything.
  const hook = { address: addresses.taxHook as Address, abi: taxHookAbi } as const
  const { data: hookData } = useReadContracts({
    contracts: [
      { ...hook, functionName: 'TAX_CAP' },
      { ...hook, functionName: 'LAUNCH_TAX_BPS' },
      { ...hook, functionName: 'baseBps' },
      { ...hook, functionName: 'wiringOk' },
    ],
    query: { enabled: configured('taxHook') && !DEMO, staleTime: 60_000 },
  })
  const capBps =
    hookData?.[0]?.status === 'success' ? Number(hookData[0].result) : undefined
  const launchTaxBps =
    hookData?.[1]?.status === 'success' ? Number(hookData[1].result) : undefined
  const baseBps =
    hookData?.[2]?.status === 'success' ? Number(hookData[2].result) : undefined
  const wiringOk =
    hookData?.[3]?.status === 'success' ? (hookData[3].result as boolean) : undefined

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
      launchTaxBps: 1500,
      baseBps: 400,
      wiringOk: true,
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
    launchTaxBps,
    baseBps,
    wiringOk,
    configured: configured('twapOracleV4'),
  }
}

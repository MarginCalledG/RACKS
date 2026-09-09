import type { Address } from 'viem'
import { isAddress } from 'viem'
import { isTestnet } from './chains'
import { DEMO } from './demo'

/**
 * Nothing is deployed yet. Every address here is read from env and may be
 * blank. `configured()` lets a screen say "not deployed yet" instead of
 * firing eth_calls at the zero address and rendering plausible-looking zeros —
 * a UI that shows 0.00 when it actually means "no contract" is a §7 problem.
 */
function env(key: string): Address | null {
  const raw = import.meta.env[key as keyof ImportMetaEnv] as string | undefined
  if (!raw) return null
  if (!isAddress(raw)) {
    console.warn(`[config] ${key} is not a valid address: ${raw}`)
    return null
  }
  return raw as Address
}

/** USDG on RH Chain mainnet, per docs.robinhood.com/chain/contracts. */
const USDG_MAINNET = '0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168' as Address
/** WETH on RH Chain mainnet, same source. Kept for router paths. */
export const WETH_MAINNET = '0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73' as Address

export const addresses = {
  racks: env('VITE_RACKS_ADDRESS'),
  cayman: env('VITE_CAYMAN_ADDRESS'),
  irsAgent: env('VITE_IRSAGENT_ADDRESS'),
  taxSwapper: env('VITE_TAXSWAPPER_ADDRESS'),
  twapOracle: env('VITE_TWAPORACLE_ADDRESS'),
  wracks: env('VITE_WRACKS_ADDRESS'),
  zap: env('VITE_ZAP_ADDRESS'),
  v4Swap: env('VITE_V4SWAP_ADDRESS'),
  twapOracleV4: env('VITE_TWAPORACLEV4_ADDRESS'),
  taxHook: env('VITE_TAXHOOK_ADDRESS'),
  spy: env('VITE_SPY_ADDRESS'),
  usdg: env('VITE_USDG_ADDRESS') ?? (isTestnet ? null : USDG_MAINNET),
} as const

/**
 * Resolved: the pool holds wRACKS, not RACKS, and trading is Uniswap V4.
 *
 * The route is USDG <-> SPY <-> wRACKS across two V4 pools. Zap owns both hops
 * plus the wrap/unwrap, so the frontend calls one function per direction and
 * never touches a pool key, a router or the wrapper directly.
 */
export const tradesThroughWrapper = true

export type ContractKey = keyof typeof addresses

export function configured(...keys: ContractKey[]): boolean {
  if (DEMO) return true
  return keys.every((k) => addresses[k] !== null)
}

/** Which required addresses are still missing — used by the setup banner. */
export function missing(...keys: ContractKey[]): ContractKey[] {
  if (DEMO) return []
  return keys.filter((k) => addresses[k] === null)
}

/* ===========================================================================
 * Real ABIs, generated from the Foundry artifacts as `as const` modules —
 * JSON imports lose the literal types wagmi needs to infer call signatures.
 *
 * To refresh:
 *   for c in Racks CaymanIslands IRSAgent TaxSwapper TwapOracle WRacks; do
 *     jq '.abi' out/$c.sol/$c.json > src/abi/$c.json
 *   done
 *
 * NOTE: trading is Uniswap V4, not V2. There is no router or pair ABI here on
 * purpose — the V2 Router02 and pair fragments were removed when the V4
 * contracts landed. User-facing trades go through Zap.buyRacks/sellRacks.
 *
 * NOTE: DynamicTax's ABI is an empty array — it exposes no external functions,
 * so there is nothing for the frontend to call. The dynamic tax is read
 * through TwapOracle.taxBps() instead.
 * =========================================================================== */

import { parseAbi } from 'viem'

export { racksAbi } from './Racks'
export { caymanAbi } from './CaymanIslands'
export { irsAgentAbi } from './IRSAgent'
export { taxSwapperAbi } from './TaxSwapper'
export { twapOracleAbi } from './TwapOracle'
export { wracksAbi } from './WRacks'
export { twapOracleV4Abi } from './TwapOracleV4'
export { v4SwapAbi } from './V4Swap'
export { zapAbi } from './Zap'

/** Plain ERC20, for USDG and SPY. */
export const erc20Abi = parseAbi([
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
])



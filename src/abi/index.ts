/* ===========================================================================
 * Real ABIs, generated from the Foundry artifacts as `as const` modules —
 * JSON imports lose the literal types wagmi needs to infer call signatures.
 *
 * To refresh:
 *   for c in Racks CaymanIslands IRSAgent TaxSwapper TwapOracle WRacks; do
 *     jq '.abi' out/$c.sol/$c.json > src/abi/$c.json
 *   done
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

/** Canonical Uniswap V2 Router02 subset — standard, not protocol-specific. */
export const routerAbi = parseAbi([
  'function getAmountsOut(uint256 amountIn, address[] path) view returns (uint256[] amounts)',
  'function getAmountsIn(uint256 amountOut, address[] path) view returns (uint256[] amounts)',
  'function swapExactTokensForTokensSupportingFeeOnTransferTokens(uint256 amountIn, uint256 amountOutMin, address[] path, address to, uint256 deadline)',
  'function swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address[] path, address to, uint256 deadline) returns (uint256[] amounts)',
])

export const pairAbi = parseAbi([
  'function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)',
  'function token0() view returns (address)',
  'function token1() view returns (address)',
])

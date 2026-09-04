import { parseAbi } from 'viem'

/* ===========================================================================
 * ⚠️  PLACEHOLDER ABIs — NOT FROM THE BUILD ARTIFACTS
 * ---------------------------------------------------------------------------
 * These fragments were reconstructed by hand from the build brief because the
 * compiled artifacts did not arrive with the message. They are almost
 * certainly wrong in the details: argument widths, whether views are `view` or
 * `pure`, exact event parameter indexing, and the return tuple of `agents()`
 * are all guesses.
 *
 * REPLACE THIS FILE with generated ABIs before wiring to a live deployment:
 *
 *   for c in Racks CaymanIslands IRSAgent TaxSwapper TwapOracle WRacks; do
 *     jq '.abi' out/$c.sol/$c.json > src/abi/$c.json
 *   done
 *
 * then import the JSON and delete the fragments below. Do not "fix" a decode
 * error by tweaking a fragment here — get the real artifact.
 * =========================================================================== */

export const erc20Abi = parseAbi([
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function transferFrom(address from, address to, uint256 amount) returns (bool)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)',
])

/** Racks — the demurrage ERC20 (was KarrotCore). */
export const racksAbi = parseAbi([
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function transferFrom(address from, address to, uint256 amount) returns (bool)',
  // demurrage
  'function ratePerDayBps() view returns (uint256)',
  'function instantFreeFloatRay() view returns (uint256)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
])

/** CaymanIslands — the locker (was Locker). */
export const caymanAbi = parseAbi([
  'function lock(uint8 tier, uint256 amount)',
  'function unlock(uint8 tier)',
  'function relock(uint8 tier)',
  'function claimOf(address account, uint8 tier) view returns (uint256)',
  'function unlockAt(address account, uint8 tier) view returns (uint256)',
  'function FEE(uint8 tier) view returns (uint256)',
  'function DURATION(uint8 tier) view returns (uint256)',
  'function potBalance() view returns (uint256)',
  'function totalLocked() view returns (uint256)',
])

/**
 * IRSAgent — the game NFT (was Rabbit). Now ERC721.
 *
 * `agents(id)` tuple shape is a GUESS. The brief listed the old `rabbits(id)`
 * as (owner, tier, lastFed, lastAtkEpoch1, revealed, dead) and the new
 * `agents(id)` as (tier, lastFed, lastAtkEpoch1, revealed, dead) — owner
 * dropped because ERC721 `ownerOf` covers it. Integer widths below are
 * invented; verify.
 */
export const irsAgentAbi = parseAbi([
  // ERC721 surface
  'function ownerOf(uint256 id) view returns (address)',
  'function balanceOf(address owner) view returns (uint256)',
  // roster
  'function agentsOf(address owner) view returns (uint256[])',
  'function agents(uint256 id) view returns (uint8 tier, uint64 lastFed, uint64 lastAtkEpoch1, bool revealed, bool dead)',
  'function alive(uint256 id) view returns (bool)',
  'function ownedLiving(address owner) view returns (uint256)',
  'function livingCount() view returns (uint256)',
  // economy
  'function mint()',
  'function feed(uint256 id)',
  'function attack(uint256 id)',
  'function reap(uint256 id)',
  'function settle(uint256 epoch)',
  'function pending(uint256 id, uint256 epoch) view returns (uint256)',
  'function claim(uint256 id, uint256 epoch)',
  // constants
  'function MINT_PRICE() view returns (uint256)',
  'function HITRATE(uint8 tier) view returns (uint256)',
  'function WEIGHT(uint8 tier) view returns (uint256)',
  'function FEED(uint8 tier) view returns (uint256)',
  'function FEED_INTERVAL() view returns (uint256)',
  'function MAX_PER_WALLET() view returns (uint256)',
  // epochs
  'function currentEpoch() view returns (uint256)',
  'function EPOCH() view returns (uint256)',
  'function startTime() view returns (uint256)',
  // async results
  'event Minted(address indexed to, uint256 indexed id)',
  'event Revealed(uint256 indexed id, uint8 tier)',
  'event Attacked(uint256 indexed id, uint256 indexed epoch, bool hit)',
  'event Claimed(uint256 indexed id, uint256 indexed epoch, uint256 amount)',
])

/** TwapOracle — powers the pre-trade tax disclosure. */
export const twapOracleAbi = parseAbi([
  'function taxBps(uint256 amount, bool isSell) view returns (uint256)',
])

/** TaxSwapper — treasury/reserve stats. */
export const taxSwapperAbi = parseAbi([
  'function pending() view returns (uint256)',
  'function swap()',
])

/** WRacks — non-rebasing wrapper, only used if the pool holds wRACKS. */
export const wracksAbi = parseAbi([
  'function deposit(uint256 amount) returns (uint256)',
  'function withdraw(uint256 shares) returns (uint256)',
  'function balanceOf(address) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function decimals() view returns (uint8)',
])

/** Canonical Uniswap V2 Router02 subset. This one is safe — it's standard. */
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

# RACKS frontend — scaffold

React + TypeScript + Vite + wagmi/viem. Typechecks and builds clean. Nothing is
connected to a live contract yet because nothing is deployed.

```bash
npm install
cp .env.example .env   # fill in addresses after deploy
npm run dev
```

## Where things are

```
src/config/chains.ts      RH Chain mainnet (4663) + testnet (46630)
src/config/addresses.ts   every address, all env-driven, all nullable
src/config/protocol.ts    tiers, ranks, fees — display fallbacks only
src/abi/index.ts          ⚠️ hand-written placeholder ABIs — replace
src/lib/melt.ts           the demurrage curve, in one place
src/hooks/                chain clock, balance, locks, agents, epoch, tax
src/screens/              Wallet, Trade, Cayman, Agents, Dashboard, How it works
```

## Replace the ABIs first

`src/abi/index.ts` was reconstructed by hand from the build brief because the
compiled artifacts never arrived. Argument widths, view/pure modifiers, event
indexing, and the `agents()` return tuple are all guesses. Before touching a
live deployment:

```bash
for c in Racks CaymanIslands IRSAgent TaxSwapper TwapOracle WRacks; do
  jq '.abi' out/$c.sol/$c.json > src/abi/$c.json
done
```

then import the JSON and delete the fragments. If a decode fails, fix the
artifact import — don't tweak a fragment until the error goes away.

## Open questions that need a contract read

Each of these is marked with a comment at the site that depends on it.

1. **Decay curve** (`src/lib/melt.ts`). Is the demurrage index
   `(1-r)^days` or `exp(-r·days)`? At 6.9%/day they diverge ~0.25% after one
   day, which is visible on a balance and grows over a session. `MODEL` is set
   to `discrete`; confirm against `Racks.sol`.
2. **Epoch indexing** (`src/hooks/useEpoch.ts`). Assumes epoch 0 is the first
   epoch after `startTime`. The field name `lastAtkEpoch1` suggests attack
   epochs may be 1-indexed, which is why `canAttackThisEpoch` compares against
   `epoch + 1`. If either assumption is wrong the audit button enables at the
   wrong time.
3. **`agents()` tuple** — assumed `(tier, lastFed, lastAtkEpoch1, revealed,
   dead)` with `owner` dropped in favour of ERC721 `ownerOf`.
4. **USDG decimals** — assumed 6 where fees are formatted. Cheap to get wrong
   by a factor of 10^12.
5. **`MINT_PRICE()`** — guessed getter name; the brief only gave the 99 USDG
   figure.
6. **Native currency** on RH Chain — assumed ETH/18 for gas display.

## Wrapper-vs-direct routing

`VITE_TRADE_TOKEN_ADDRESS` + `VITE_PAIR_ADDRESS` decide what the DEX trades.
Nothing under `src/` hardcodes RACKS vs wRACKS, so if the rebasing question
lands on the wrapper pool it's an env change plus wiring the deposit/withdraw
calls in `Trade.tsx`. `tradesThroughWrapper` already flips the explanatory
copy.

## What's wired vs. shells

Reads are wired: balances, melt rate, free float, lock positions and
countdowns, agent roster, epoch clock, audit pool, tax preview, treasury
pending. Event subscriptions for `Revealed` and `Attacked` are live with
polling fallback (no websocket assumed).

Writes are shells — buttons render and disable correctly but don't submit.
They need real ABIs and a settled approval sequence first:

- USDG → CaymanIslands (lock fees), USDG → IRSAgent (mint + feed)
- RACKS → CaymanIslands (lock pulls RACKS), RACKS → WRacks (if wrapping)

## Known scaffold limits

- Claimable winnings show the **previous epoch only**. Full history needs a
  `Claimed`/`Attacked` indexer.
- `agentsOf` is O(n); fine now, swap to a `Transfer`/`Minted` indexer if the
  population grows. That change is contained to `useAgentRoster`.
- Reads poll on an interval rather than on every block. Fine for a prototype;
  block-driven invalidation is a small change in the hooks.

## Demo mode (design work before deploy)

With no contract addresses every figure renders as `—`, which makes the
populated states impossible to review. Set:

```
VITE_DEMO_MODE=true
```

and every screen fills with invented data: a ticking balance, one empty lock,
one mid-countdown, one expired, agents of each rank including a dead one and
one still revealing, live tax percentages, dashboard stats.

The numbers are fake; the behaviour is not. The balance decays through the same
`projectBalance` the live app uses, countdowns run against the same clock, and
states are derived rather than hardcoded — so what you're looking at is the
real UI with fake inputs. A banner says so at the top of every screen.

Fixtures live in `src/config/demo.ts`. To remove demo mode entirely, delete
that file and the `if (DEMO)` branches in `src/hooks`.

Never set this true on a build pointing at real contracts.

## The honesty invariants

These aren't styling choices — breaking one is a §7 regression:

- `MeltStrip` renders above every screen and is never conditional. Not while
  loading, not during a pending tx, not on the trade screen.
- The balance ticks. A frozen number would misrepresent a token that is
  actively shrinking. It's projected forward from the last on-chain read using
  the contract's own curve, so it shows what `balanceOf` returns *now*.
- Transaction amounts use the exact on-chain bigint, never the projected
  float. The trade screen says so where it matters, and prefers max flows.
- Unconfigured contracts render "not wired up yet", never `0.00`. A zero that
  means "no contract" is indistinguishable from a zero that means "no money".
- The Agents screen opens with the losing case — 75% Junior, the running feed
  cost, "most agents lose money" — above the mint button, not below it.
- Trade tax is quoted for the user's actual size in both directions, refreshed
  every 5s, with the 7%/5% ceilings stated.
- No countdowns that aren't real contract deadlines. Every clock on screen
  reads from `unlockAt`, `startTime + EPOCH`, or `lastFed + FEED_INTERVAL`.

## Design

The app is a 1990s desktop. Screens are windows with title bars, navigation is
a desktop of icons plus a taskbar, and windows are draggable, stackable,
minimisable and closable. Below 760px the geometry is ignored and one window
fills the screen, switched from the taskbar — dragging overlapping windows on
a phone is unusable and the taskbar already does the job.

No Microsoft assets are used or reproduced. The bevels are plain CSS borders,
every icon is drawn on a 16px grid in `src/components/win/Icons.tsx`, and the
type is Tahoma/Verdana with fallbacks — fonts that ship with the OS, so no
webfont is loaded at all.

The bevel is the whole visual language, and getting it backwards is what makes
a fake 95 UI feel off: `.raised` for anything clickable or sitting on top,
`.sunken` for anything you read out of or type into.

**Why the taskbar tray matters.** The brief requires the melt to be visible at
all times, and a windowed UI breaks that the moment someone closes a window.
The tray solves it the way a real OS solves it for the clock: it's chrome, not
content, and there is no control anywhere that hides it. The full readout also
appears inside the Wallet window.

The wallpaper is `src/assets/desktop-wallpaper.webp` — Miami-at-dusk pixel art,
`background-size: cover` with `image-rendering: pixelated` so the browser
doesn't smooth it when scaling. Teal remains the fallback colour: it paints
instantly and is what shows if the image fails.

It lives under `src/` rather than `public/` on purpose: Vite fingerprints
assets it bundles, so swapping the image changes its filename and browsers
fetch it immediately. A file in `public/` keeps its name and stays cached,
which is exactly the trap this hit once already.

Two constraints if it's ever swapped. The upper-left area must stay dark,
because the desktop icon labels are white and sit there (this one averages
16/255 with nothing above 140). And keep it well under 300KB — the source was
1.7MB, reduced to 108KB as WebP.

The risk page ("Read me first") opens on load. It's the one screen the brief
wants one click away, and on an empty desktop nothing competes with it.


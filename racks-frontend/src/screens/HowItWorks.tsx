import { Field } from '../components/ui'
import {
  AGENT_RANKS,
  EXPIRED_BLEED_PCT_PER_DAY,
  LOCK_TIERS,
  MINT_PRICE_USDG,
  TAX,
} from '../config/protocol'
import { bpsToPct } from '../lib/melt'
import { usdg } from '../lib/format'

/**
 * §7's "plain-language what you're risking page". Written flat, without the
 * offshore joke, because the joke is what the rest of the app is for and this
 * page's only job is to be understood.
 */
export function HowItWorks() {
  return (
    <div className="stack">
      <Field title="What RACKS is">
        <p>
          RACKS is a token that shrinks. Holding it costs you between 4.2% and
          6.9% of your balance every day, continuously, automatically. This is
          the design, not a bug and not a fee you can avoid by holding still.
          Roughly half of an unprotected balance is gone in ten to sixteen days.
        </p>
        <p>
          The rate depends on how much of the total supply is locked. When more
          is locked, the rate falls; when more is free, it rises.
        </p>
      </Field>

      <Field title="Locking">
        <p>
          Locking RACKS in a vault protects it. There are three lengths, each
          with a fee in USDG paid up front:
        </p>
        <ul>
          {LOCK_TIERS.map((t) => (
            <li key={t.id}>
              <strong>{t.name}</strong> — {usdg(t.feeUsdg)}.{' '}
              {t.bleedPctPerDay === 0
                ? 'Loses nothing while active.'
                : `Still loses about ${t.bleedPctPerDay}% a day.`}
            </li>
          ))}
        </ul>
        <p>
          Locks expire. An expired position is not returned to you
          automatically — it starts losing {EXPIRED_BLEED_PCT_PER_DAY}% a day
          until you withdraw or relock, and relocking costs the fee again. If
          you lock and forget, you lose money.
        </p>
        <p>
          Locking protects the number of tokens you hold. It does nothing for
          what they are worth. You can complete a perfect 14-day lock and
          withdraw into a lower price.
        </p>
      </Field>

      <Field title="The IRS Agent game">
        <p>
          This is a casino. Minting an agent costs {usdg(MINT_PRICE_USDG)} and
          the rank you get is random:
        </p>
        <ul>
          {AGENT_RANKS.map((r) => (
            <li key={r.id}>
              <strong>{r.name}</strong> — {r.mintChancePct}% chance. Wins an
              audit {r.hitRatePct}% of the time, share weight {r.weight}, costs{' '}
              {usdg(r.feedUsdg)} every three days to keep alive.
            </li>
          ))}
        </ul>
        <p>
          Three quarters of mints return the weakest rank. Each agent can audit
          once per eight-hour epoch, and winners split that epoch's pool
          between them — so a good epoch for everyone is a small payout for
          everyone. Agents you stop feeding die, stop earning, and take up a
          slot until you clear them.
        </p>
        <p>
          Add it up before you play: the mint price, plus feed costs every three
          days for as long as you hold the agent, against a share of a pool you
          are competing for. Most agents do not earn back what they cost.
        </p>
      </Field>

      <Field title="Trading tax">
        <p>
          Buying and selling against the pool is taxed. The base rate is{' '}
          {bpsToPct(TAX.baseBps)}%, and it moves with market pressure — up to{' '}
          {bpsToPct(TAX.maxSellBps)}% on sells and {bpsToPct(TAX.maxBuyBps)}% on
          buys, down to {bpsToPct(TAX.floorBps)}% when pressure is low. The
          exact rate for your trade size is shown on the trade screen before you
          confirm.
        </p>
        <p>
          Sending RACKS from one wallet to another is never taxed. Only pool
          trades are.
        </p>
      </Field>

      <Field title="What can go wrong">
        <ul>
          <li>
            The melt is relentless. Doing nothing is the most expensive option.
          </li>
          <li>
            Every protective action costs a fee, so small balances can be eaten
            by fees faster than by the melt.
          </li>
          <li>
            The agent game has a negative expected value for most players. Treat
            money spent there as spent.
          </li>
          <li>
            Token price is separate from token quantity. Both can fall at once.
          </li>
          <li>
            This is unaudited software on a new chain. Smart contracts can have
            bugs that take everything, regardless of how the mechanics are
            supposed to work.
          </li>
        </ul>
        <p className="muted">
          Nothing here is financial advice, and none of it is a real tax
          strategy — the theme is a joke, the losses are not.
        </p>
      </Field>
    </div>
  )
}

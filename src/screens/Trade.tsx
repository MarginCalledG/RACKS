import { useState } from 'react'
import { parseUnits } from 'viem'
import { Field, Gate, Notice, Pair } from '../components/ui'
import { useTradeTax } from '../hooks/useTax'
import { useMeltingBalance, useRacksStats } from '../hooks/useRacks'
import { num, pct, token } from '../lib/format'
import { TAX } from '../config/protocol'
import { bpsToPct } from '../lib/melt'
import { tradesThroughWrapper } from '../config/addresses'

type Side = 'buy' | 'sell'

export function Trade() {
  const [side, setSide] = useState<Side>('buy')
  const [amountStr, setAmountStr] = useState('')
  const { decimals, live } = useMeltingBalance()
  const { inLaunchWindow, maxWallet } = useRacksStats()

  let amount: bigint | undefined
  try {
    amount = amountStr ? parseUnits(amountStr, decimals) : undefined
  } catch {
    amount = undefined
  }

  const { buyPct, sellPct, buyBps, sellBps, configured: oracleReady } =
    useTradeTax(amount)

  const activeBps = side === 'buy' ? buyBps : sellBps
  const activePct = side === 'buy' ? buyPct : sellPct
  const parsedAmount = amountStr ? Number(amountStr) : 0
  const taxCost =
    activeBps !== undefined && parsedAmount > 0
      ? (parsedAmount * activeBps) / 10_000
      : undefined

  return (
    <div className="stack">
      {/* Two limits the contracts enforce that nothing in the brief mentioned.
          Both change what a trade actually does, so they belong here rather
          than in a docs page nobody opens. */}
      {inLaunchWindow ? (
        <Notice kind="warn">
          <p>
            Launch window is active. A higher fixed launch tax applies to
            trades right now instead of the usual dynamic rate, and it ends on
            a timer set at deployment.
          </p>
        </Notice>
      ) : null}

      {maxWallet !== undefined ? (
        <Notice kind="setup">
          <p>
            There is a maximum wallet size of{' '}
            <span className="figure-sm">{token(maxWallet, decimals, 0)}</span>{' '}
            RACKS. A buy that would take you over it reverts — the transaction
            fails and you pay gas for nothing.
          </p>
        </Notice>
      ) : null}

      <Gate needs={['racks', 'router', 'pair', 'spy', 'twapOracle']}>
        <Notice kind="calm">
          <p>
            Wallet-to-wallet transfers of RACKS are never taxed. The tax below
            applies only to trades against the pool.
          </p>
        </Notice>
      </Gate>

      <div className="grid">
        <Field title={side === 'buy' ? 'Buy RACKS with SPY' : 'Sell RACKS for SPY'}>
          <div className="btn-row" style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <button
              className={`btn ${side === 'buy' ? '' : 'secondary'}`}
              onClick={() => setSide('buy')}
            >
              Buy
            </button>
            <button
              className={`btn ${side === 'sell' ? '' : 'secondary'}`}
              onClick={() => setSide('sell')}
            >
              Sell
            </button>
          </div>

          <label htmlFor="amt">
            Amount {side === 'buy' ? 'of SPY to spend' : 'of RACKS to sell'}
          </label>
          <input
            id="amt"
            type="text"
            inputMode="decimal"
            placeholder="0.00"
            value={amountStr}
            onChange={(e) => setAmountStr(e.target.value)}
          />

          {side === 'sell' && live !== undefined ? (
            <p className="muted" style={{ marginTop: '0.5rem' }}>
              You hold {num(live, 4)} RACKS. That figure is falling as you read
              it — a sell settles at the next block, so it will consume
              marginally less than shown. Use “sell max” to let the contract
              read the balance itself.
            </p>
          ) : null}

          <div className="btn-row">
            <button className="btn" disabled>
              Approve
            </button>
            <button className="btn" disabled>
              {side === 'buy' ? 'Buy RACKS' : 'Sell RACKS'}
            </button>
          </div>
          <p className="muted" style={{ marginTop: '0.5rem' }}>
            Swap execution is wired to the router but disabled until the pair
            address exists.
          </p>
        </Field>

        {/* §7: the tax is shown BEFORE the trade, for this exact size, in both
            directions, with the ceiling stated. Never a generic "4%". */}
        <Field
          title="Tax on this trade"
          note={oracleReady ? 'live from the oracle' : 'oracle not configured'}
        >
          {amount === undefined ? (
            <p className="muted">
              Enter an amount. The tax is dynamic — it depends on trade size and
              current pressure, so there is no single number to quote in
              advance.
            </p>
          ) : (
            <>
              <dl>
                <Pair
                  label="Buy tax now"
                  value={buyPct === undefined ? '—' : pct(buyPct)}
                />
                <Pair
                  label="Sell tax now"
                  value={
                    <span className="loss">
                      {sellPct === undefined ? '—' : pct(sellPct)}
                    </span>
                  }
                />
                {taxCost !== undefined ? (
                  <Pair
                    label="You pay in tax"
                    value={<span className="loss">{num(taxCost, 4)}</span>}
                  />
                ) : null}
                {activePct !== undefined && parsedAmount > 0 ? (
                  <Pair
                    label="Reaches the pool"
                    value={num(parsedAmount - (taxCost ?? 0), 4)}
                  />
                ) : null}
              </dl>
              <p className="muted" style={{ marginTop: '0.75rem' }}>
                Base is {bpsToPct(TAX.baseBps)}%. It rises to{' '}
                {bpsToPct(TAX.maxSellBps)}% on sells under sell pressure and{' '}
                {bpsToPct(TAX.maxBuyBps)}% on buys under buy pressure, and can
                fall to {bpsToPct(TAX.floorBps)}%. It is re-read every few
                seconds; the figure at signing is the one that applies.
              </p>
            </>
          )}
        </Field>
      </div>

      {tradesThroughWrapper ? (
        <Notice kind="calm">
          <p>
            Trades route through wRACKS, a non-rebasing wrapper. Your RACKS is
            wrapped before the swap and unwrapped after. The wrapper does not
            melt; the RACKS behind it does.
          </p>
        </Notice>
      ) : null}
    </div>
  )
}

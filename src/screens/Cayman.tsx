import { useState } from 'react'
import { formatUnits, parseUnits } from 'viem'
import { Field, Gate, Notice, Pair } from '../components/ui'
import { EXPIRED_BLEED_PCT_PER_DAY, tierOf } from '../config/protocol'
import { useProtocolConstants, useTiers } from '../hooks/useProtocolConstants'
import { ConstantsWarning } from '../components/ConstantsWarning'
import { useLockPositions } from '../hooks/useCayman'
import { useMeltingBalance } from '../hooks/useRacks'
import { duration, num, token, usdg } from '../lib/format'

export function Cayman() {
  const { positions, potBalance, minLock, configured } = useLockPositions()
  const { decimals, live } = useMeltingBalance()
  const [amounts, setAmounts] = useState<Record<number, string>>({})
  const tiers = useTiers()
  const { usdgDecimals } = useProtocolConstants()

  const expired = positions.filter((p) => p.isExpired)

  /** Guard the button rather than letting the contract reject it. */
  const belowMin = (raw: string | undefined) => {
    if (minLock === undefined || !raw) return false
    try {
      return parseUnits(raw, decimals) < minLock
    } catch {
      return true
    }
  }

  return (
    <div className="stack">
      <ConstantsWarning />
      {expired.length > 0 ? (
        <Notice kind="warn">
          <p>
            <span className="stamp">Expired</span>{' '}
            {expired.length === 1 ? 'A position has' : `${expired.length} positions have`}{' '}
            run out and {expired.length === 1 ? 'is' : 'are'} now losing{' '}
            {EXPIRED_BLEED_PCT_PER_DAY}% a day into the audit pool. Relock or
            withdraw to stop it.
          </p>
        </Notice>
      ) : null}

      <Field
        title="Offshore vaults"
        note={
          potBalance !== undefined
            ? `audit pool holds ${token(potBalance, decimals, 2)} RACKS`
            : undefined
        }
      >
        <p>
          Locking moves RACKS out of reach of the melt. Longer locks protect
          more. Whatever a locked position still loses goes into the audit pool
          that IRS Agents fight over — including the penalty on an expired
          position.
        </p>
        {minLock !== undefined ? (
          <p className="muted">
            Minimum lock: {token(minLock, decimals, 2)} RACKS. Anything smaller
            is rejected by the contract — the transaction fails and you pay gas
            for nothing.
          </p>
        ) : null}
        {live !== undefined ? (
          <p className="muted">
            Unlocked and melting right now: {num(live, 4)} RACKS.
          </p>
        ) : null}
      </Field>

      <Gate needs={['cayman', 'racks', 'usdg']}>
        <div className="grid">
          {tiers.map((tier) => {
            const pos = positions.find((p) => p.tier === tier.id)
            const feeOnChain = pos?.fee
            const remaining = pos?.secondsRemaining ?? 0
            const clock = duration(remaining)

            return (
              <Field
                key={tier.id}
                title={`${tier.name} lock`}
                note={
                  feeOnChain !== undefined
                    ? `fee ${usdg(Number(formatUnits(feeOnChain, usdgDecimals)))}`
                    : `fee ${usdg(tier.feeUsdg)}`
                }
              >
                <p className="muted">{tier.summary}</p>

                <dl>
                  <Pair
                    label="Bleed while locked"
                    value={
                      tier.bleedPctPerDay === 0 ? (
                        <span className="protected">0%/day</span>
                      ) : (
                        <span className="loss">
                          {tier.bleedPctPerDay.toFixed(2)}%/day
                        </span>
                      )
                    }
                  />
                  <Pair label="Fee to lock or relock" value={usdg(tier.feeUsdg)} />
                  <Pair
                    label="Protected here"
                    value={
                      <span className="protected">
                        {token(pos?.amount, decimals)}
                      </span>
                    }
                  />
                  {pos?.hasPosition ? (
                    <Pair
                      label={pos.isExpired ? 'Expired' : 'Unlocks in'}
                      value={
                        pos.isExpired ? (
                          <span className="stamp">Expired</span>
                        ) : (
                          clock ?? '—'
                        )
                      }
                    />
                  ) : null}
                </dl>

                {pos?.isExpired ? (
                  <p className="muted loss" style={{ marginTop: '0.5rem' }}>
                    Losing {EXPIRED_BLEED_PCT_PER_DAY}%/day into the audit pool
                    until you relock or withdraw.
                  </p>
                ) : null}

                <label htmlFor={`amt-${tier.id}`} style={{ marginTop: '0.75rem' }}>
                  RACKS to lock
                </label>
                <input
                  id={`amt-${tier.id}`}
                  type="text"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={amounts[tier.id] ?? ''}
                  onChange={(e) =>
                    setAmounts((a) => ({ ...a, [tier.id]: e.target.value }))
                  }
                />

                <div className="btn-row">
                  <button
                    className="btn"
                    disabled={
                      !configured ||
                      !amounts[tier.id] ||
                      belowMin(amounts[tier.id])
                    }
                    onClick={() => {
                      // Wired at deploy: approve RACKS -> CaymanIslands and
                      // USDG -> CaymanIslands, then lock(tier, amount).
                      void parseUnits(amounts[tier.id] ?? '0', decimals)
                    }}
                  >
                    Lock
                  </button>
                  <button
                    className="btn secondary"
                    disabled={!pos?.hasPosition}
                    onClick={() => {}}
                  >
                    Relock
                  </button>
                  <button
                    className="btn secondary"
                    disabled={!pos?.hasPosition || (!pos?.isExpired && remaining > 0)}
                    onClick={() => {}}
                  >
                    Withdraw
                  </button>
                </div>

                <p className="muted" style={{ marginTop: '0.5rem' }}>
                  Locking costs {usdg(tier.feeUsdg)} in USDG plus gas, and needs
                  two approvals the first time. Relocking costs the fee again.
                </p>
              </Field>
            )
          })}
        </div>
      </Gate>

      <Field title="What locking does not do">
        <p>
          A lock protects RACKS from the melt. It does not protect its price. A
          fully locked 14-day position keeps every token it started with and can
          still be worth less when you withdraw.
        </p>
        <p className="muted">
          Fees are charged per lock and per relock, not per day. Over 14 days,
          three sequential 1-day locks cost more in fees than one 14-day lock
          and protect less. {tierOf(2)?.name} is the cheapest full protection.
        </p>
      </Field>
    </div>
  )
}

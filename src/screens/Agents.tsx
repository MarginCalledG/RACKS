import { Field, Gate, Notice, Pair } from '../components/ui'
import {
  AGENT_RANKS,
  MAX_AGENTS_PER_WALLET,
  MINT_PRICE_USDG,
  rankOf,
} from '../config/protocol'
import { useAgentRoster, useAsyncResults } from '../hooks/useAgents'
import { useEpoch } from '../hooks/useEpoch'
import { useLockPositions } from '../hooks/useCayman'
import { useMeltingBalance } from '../hooks/useRacks'
import { duration, num, token, usdg } from '../lib/format'
import { RankMascot, UnknownAgent } from '../components/Mascots'

export function Agents() {
  const { agents, living, dead, refetch, configured } = useAgentRoster()
  const { reveals, audits, clearReveal, clearAudit } = useAsyncResults(refetch)
  const { epoch, secondsRemaining } = useEpoch()
  const { potBalance } = useLockPositions()
  const { decimals } = useMeltingBalance()

  const epochClock = secondsRemaining === undefined ? null : duration(secondsRemaining)

  /** Weighted average feed cost across the rank distribution — the number that
   *  makes the running cost of ownership concrete rather than abstract. */
  const expectedFeedPer3Days = AGENT_RANKS.reduce(
    (sum, r) => sum + (r.mintChancePct / 100) * r.feedUsdg,
    0,
  )

  return (
    <div className="stack">
      {/* §7: never imply guaranteed profit. This is the first thing on the
          screen, not a footnote under the mint button. */}
      <Notice kind="warn">
        <p>
          This is gambling. Minting costs {usdg(MINT_PRICE_USDG)} and three out
          of four agents come back Junior, which wins its audit 30% of the time
          and takes the smallest share when it does. Agents also cost roughly{' '}
          {usdg(expectedFeedPer3Days)} every three days to keep alive, forever.
          Most agents lose money over their lifetime. A few win. Very few win
          big.
        </p>
      </Notice>

      <div className="grid">
        <Field
          title="Mint an agent"
          note={`${usdg(MINT_PRICE_USDG)} in USDG`}
        >
          <div className="mascot-row" style={{ marginBottom: '0.875rem' }}>
            {AGENT_RANKS.map((r) => (
              <div key={r.id} style={{ textAlign: 'center', flex: '1 1 0' }}>
                <RankMascot rank={r.id} size={84} />
                <div className="figure-sm" style={{ fontSize: '0.875rem' }}>
                  {r.name}
                </div>
                <div className="muted" style={{ fontSize: '0.8125rem' }}>
                  {r.mintChancePct}% chance
                </div>
              </div>
            ))}
          </div>
          <table className="rows">
            <thead>
              <tr>
                <th>Rank</th>
                <th className="n">Chance</th>
                <th className="n">Wins audit</th>
                <th className="n">Share weight</th>
                <th className="n">Feed / 3d</th>
              </tr>
            </thead>
            <tbody>
              {AGENT_RANKS.map((r) => (
                <tr key={r.id}>
                  <td className={r.id === 2 ? 'special' : undefined}>{r.name}</td>
                  <td className="n">{r.mintChancePct}%</td>
                  <td className="n">{r.hitRatePct}%</td>
                  <td className="n">{r.weight}</td>
                  <td className="n">{usdg(r.feedUsdg)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="btn-row">
            <button className="btn" disabled={!configured || living.length >= MAX_AGENTS_PER_WALLET}>
              Mint for {usdg(MINT_PRICE_USDG)}
            </button>
          </div>
          <p className="muted" style={{ marginTop: '0.5rem' }}>
            {living.length} of {MAX_AGENTS_PER_WALLET} agent slots used. Rank is
            random and decided after the transaction confirms — you are buying a
            75% chance of the weakest rank.
          </p>
        </Field>

        <Field title="This epoch" note={epoch !== undefined ? `epoch ${epoch}` : undefined}>
          <dl>
            <Pair
              label="Audit pool"
              value={
                potBalance === undefined ? '—' : `${token(potBalance, decimals, 2)} RACKS`
              }
            />
            <Pair label="Epoch ends in" value={epochClock ?? '—'} />
            <Pair label="Audits per agent" value="1 per 8-hour epoch" />
            <Pair label="Your living agents" value={String(living.length)} />
          </dl>
          <p className="muted" style={{ marginTop: '0.75rem' }}>
            Winners split the pool pari-mutuel by rank weight. The more agents
            that hit in an epoch, the smaller each share — the pool does not
            grow to match the number of winners.
          </p>
        </Field>
      </div>

      {/* Async VRF states. These sit above the roster so a pending result is
          visible without blocking anything else on the screen. */}
      {reveals.length > 0 || audits.length > 0 ? (
        <Field title="Results">
          <dl>
            {reveals.map((r) => (
              <Pair
                key={`rev-${r.id}`}
                label={`Agent #${r.id.toString()} revealed`}
                value={
                  <span className={r.rank === 2 ? 'special reveal' : 'reveal'}>
                    {rankOf(r.rank)?.name ?? 'Unknown'}{' '}
                    <button
                      className="btn secondary"
                      style={{ padding: '0 0.375rem', fontSize: '0.75rem' }}
                      onClick={() => clearReveal(r.id)}
                    >
                      Dismiss
                    </button>
                  </span>
                }
              />
            ))}
            {audits.map((a) => (
              <Pair
                key={`atk-${a.id}-${a.epoch}`}
                label={`Agent #${a.id.toString()} audit, epoch ${a.epoch.toString()}`}
                value={
                  <span className={a.hit ? 'protected reveal' : 'loss reveal'}>
                    {a.hit ? 'Hit' : 'Missed'}{' '}
                    <button
                      className="btn secondary"
                      style={{ padding: '0 0.375rem', fontSize: '0.75rem' }}
                      onClick={() => clearAudit(a.id)}
                    >
                      Dismiss
                    </button>
                  </span>
                }
              />
            ))}
          </dl>
        </Field>
      ) : null}

      <Gate needs={['irsAgent', 'usdg']}>
        <Field title="Your agents" note={`${living.length} alive · ${dead.length} dead`}>
          {agents.length === 0 ? (
            <p className="muted">
              No agents yet. Read the odds above before minting one.
            </p>
          ) : (
            <table className="rows">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Rank</th>
                  <th>Status</th>
                  <th className="n">Starves in</th>
                  <th className="n">Claimable</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {agents.map((a) => {
                  const rank = rankOf(a.rank)
                  const starves = duration(a.secondsUntilStarving)
                  return (
                    <tr key={a.id.toString()}>
                      <td className="figure-sm">{a.id.toString()}</td>
                      <td className={a.rank === 2 ? 'special' : undefined}>
                        <span
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4375rem',
                          }}
                        >
                          {!a.revealed || a.rank === null ? (
                            <>
                              <UnknownAgent size={30} />
                              <span className="tag">revealing rank…</span>
                            </>
                          ) : (
                            <>
                              <RankMascot rank={a.rank} size={30} />
                              {rank?.name ?? '—'}
                            </>
                          )}
                        </span>
                      </td>
                      <td>
                        {a.alive ? (
                          <span className="protected">Alive</span>
                        ) : (
                          <span className="stamp">Dead</span>
                        )}
                      </td>
                      <td className="n">
                        {!a.alive ? '—' : (starves ?? <span className="loss">starving</span>)}
                      </td>
                      <td className="n">
                        {a.pendingLastEpoch === undefined
                          ? '—'
                          : num(Number(a.pendingLastEpoch) / 10 ** decimals, 2)}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                          {a.alive ? (
                            <>
                              <button
                                className="btn secondary"
                                style={{ fontSize: '0.75rem', padding: '0.1875rem 0.5rem' }}
                                disabled={!a.canAttackThisEpoch || !a.revealed}
                                title={
                                  a.canAttackThisEpoch
                                    ? 'Run an audit this epoch'
                                    : 'Already audited this epoch'
                                }
                              >
                                Audit
                              </button>
                              <button
                                className="btn secondary"
                                style={{ fontSize: '0.75rem', padding: '0.1875rem 0.5rem' }}
                              >
                                Feed {rank ? usdg(rank.feedUsdg) : ''}
                              </button>
                              {a.pendingLastEpoch && a.pendingLastEpoch > 0n ? (
                                <button
                                  className="btn"
                                  style={{ fontSize: '0.75rem', padding: '0.1875rem 0.5rem' }}
                                >
                                  Claim
                                </button>
                              ) : null}
                            </>
                          ) : (
                            <button
                              className="btn danger"
                              style={{ fontSize: '0.75rem', padding: '0.1875rem 0.5rem' }}
                            >
                              Reap
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
          <p className="muted" style={{ marginTop: '0.75rem' }}>
            Claimable shows the previous epoch only. A full history needs an
            event indexer — see the notes in the README.
          </p>
        </Field>
      </Gate>
    </div>
  )
}

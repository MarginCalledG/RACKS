import type { Address } from 'viem'
import { useReadContract } from 'wagmi'
import { taxSwapperAbi } from '../abi'
import { addresses, configured as isConfigured } from '../config/addresses'
import { Field, Pair } from '../components/ui'
import { MintStatus } from '../components/MintStatus'
import { useRacksStats } from '../hooks/useRacks'
import { useLockPositions } from '../hooks/useCayman'
import { useEpoch } from '../hooks/useEpoch'
import { bpsToPct, halfLifeDays } from '../lib/melt'
import { duration, pct, token } from '../lib/format'
import { MELT } from '../config/protocol'
import { DEMO, demo } from '../config/demo'

export function Dashboard() {
  const { rateBps, freeFloatPct, totalSupply, decimals } = useRacksStats()
  const { potBalance } = useLockPositions()
  const { epoch, secondsRemaining } = useEpoch()

  const { data: treasuryPending } = useReadContract({
    address: addresses.taxSwapper as Address,
    abi: taxSwapperAbi,
    functionName: 'pending',
    query: { enabled: isConfigured('taxSwapper') && !DEMO, refetchInterval: 15_000 },
  })

  const treasury = DEMO ? demo.treasuryPending : treasuryPending

  const lockedPct = freeFloatPct === undefined ? undefined : 100 - freeFloatPct
  const clock = secondsRemaining === undefined ? null : duration(secondsRemaining)

  return (
    <div className="stack">
      <MintStatus />
      <div className="grid">
        <Field title="Supply">
          <dl>
            <Pair label="Total supply" value={token(totalSupply, decimals, 0)} />
            <Pair
              label="Locked offshore"
              value={
                <span className="protected">
                  {lockedPct === undefined ? '—' : pct(lockedPct, 1)}
                </span>
              }
            />
            <Pair
              label="Free float"
              value={freeFloatPct === undefined ? '—' : pct(freeFloatPct, 1)}
            />
          </dl>
          <p className="muted" style={{ marginTop: '0.75rem' }}>
            The melt rate falls as more of the supply locks up, so these two
            numbers move together.
          </p>
        </Field>

        <Field title="Melt">
          <dl>
            <Pair
              label="Rate today"
              value={
                <span className="loss">
                  {rateBps === undefined ? '—' : pct(bpsToPct(rateBps))}
                </span>
              }
            />
            <Pair
              label="Range"
              value={`${bpsToPct(MELT.minBps)}–${bpsToPct(MELT.maxBps)}% per day`}
            />
            <Pair
              label="Half-life"
              value={
                rateBps === undefined
                  ? '—'
                  : `${halfLifeDays(rateBps).toFixed(1)} days`
              }
            />
          </dl>
        </Field>

        <Field title="Audit pool" note={epoch !== undefined ? `epoch ${epoch}` : undefined}>
          <dl>
            <Pair
              label="Pool size"
              value={potBalance === undefined ? '—' : token(potBalance, decimals, 2)}
            />
            <Pair label="Epoch ends in" value={clock ?? '—'} />
          </dl>
          <p className="muted" style={{ marginTop: '0.75rem' }}>
            Fed by the bleed on short locks and the penalty on expired ones.
          </p>
        </Field>

        <Field title="Treasury">
          <dl>
            <Pair
              label="Tax awaiting conversion"
              value={token(treasury, decimals, 2)}
            />
          </dl>
          <p className="muted" style={{ marginTop: '0.75rem' }}>
            Trading tax accumulates here and is converted into the SPY-backed
            reserve. Anyone can trigger the conversion.
          </p>
        </Field>
      </div>
    </div>
  )
}

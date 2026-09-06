import type { Address } from 'viem'
import { useReadContracts } from 'wagmi'
import { irsAgentAbi } from '../abi'
import { addresses, configured } from '../config/addresses'
import { EPOCH_SEC } from '../config/protocol'
import { useChainClock } from './useChainClock'
import { DEMO, demo } from '../config/demo'

/**
 * Epoch numbering assumption: epoch N spans
 *   [startTime + N*EPOCH, startTime + (N+1)*EPOCH)
 * i.e. the first epoch after startTime is epoch 0. If IRSAgent.sol is
 * 1-indexed (the field name `lastAtkEpoch1` hints it might be) the countdown
 * will be one full epoch out. VERIFY against currentEpoch() on testnet:
 * the value shown here should match the contract exactly, not approximately.
 */
export function useEpoch() {
  const enabled = configured('irsAgent') && !DEMO
  const base = { address: addresses.irsAgent as Address, abi: irsAgentAbi } as const
  const { nowSec } = useChainClock(1000)

  const { data } = useReadContracts({
    contracts: [
      { ...base, functionName: 'currentEpoch' },
      { ...base, functionName: 'EPOCH' },
      { ...base, functionName: 'startTime' },
      { ...base, functionName: 'CLAIM_WINDOW' },
    ],
    query: { enabled, refetchInterval: 15_000 },
  })

  const epoch = data?.[0].status === 'success' ? Number(data[0].result) : undefined
  const epochSec = data?.[1].status === 'success' ? Number(data[1].result) : EPOCH_SEC
  const startTime = data?.[2].status === 'success' ? Number(data[2].result) : undefined
  /**
   * How many epochs you have to claim a win before anyone can call
   * sweepStale() and it's gone. Winnings expiring is not something a user
   * would assume, so it has to be stated rather than left to be discovered.
   */
  const claimWindow = data?.[3]?.status === 'success' ? Number(data[3].result) : undefined

  const endsAt =
    epoch !== undefined && startTime !== undefined
      ? startTime + (epoch + 1) * epochSec
      : undefined

  if (DEMO) {
    const end = demo.epochStart + (demo.epoch + 1) * demo.epochSec
    return {
      claimWindow: 3,
      epoch: demo.epoch,
      epochSec: demo.epochSec,
      startTime: demo.epochStart,
      endsAt: end,
      secondsRemaining: end - nowSec,
      configured: true,
    }
  }

  return {
    claimWindow,
    epoch,
    epochSec,
    startTime,
    endsAt,
    secondsRemaining: endsAt === undefined ? undefined : endsAt - nowSec,
    configured: enabled,
  }
}

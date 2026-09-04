import type { Address } from 'viem'
import { useReadContracts } from 'wagmi'
import { irsAgentAbi } from '../abi'
import { addresses, configured } from '../config/addresses'
import { EPOCH_SEC } from '../config/protocol'
import { useChainClock } from './useChainClock'

/**
 * Epoch numbering assumption: epoch N spans
 *   [startTime + N*EPOCH, startTime + (N+1)*EPOCH)
 * i.e. the first epoch after startTime is epoch 0. If IRSAgent.sol is
 * 1-indexed (the field name `lastAtkEpoch1` hints it might be) the countdown
 * will be one full epoch out. VERIFY against currentEpoch() on testnet:
 * the value shown here should match the contract exactly, not approximately.
 */
export function useEpoch() {
  const enabled = configured('irsAgent')
  const base = { address: addresses.irsAgent as Address, abi: irsAgentAbi } as const
  const { nowSec } = useChainClock(1000)

  const { data } = useReadContracts({
    contracts: [
      { ...base, functionName: 'currentEpoch' },
      { ...base, functionName: 'EPOCH' },
      { ...base, functionName: 'startTime' },
    ],
    query: { enabled, refetchInterval: 15_000 },
  })

  const epoch = data?.[0].status === 'success' ? Number(data[0].result) : undefined
  const epochSec = data?.[1].status === 'success' ? Number(data[1].result) : EPOCH_SEC
  const startTime = data?.[2].status === 'success' ? Number(data[2].result) : undefined

  const endsAt =
    epoch !== undefined && startTime !== undefined
      ? startTime + (epoch + 1) * epochSec
      : undefined

  return {
    epoch,
    epochSec,
    startTime,
    endsAt,
    secondsRemaining: endsAt === undefined ? undefined : endsAt - nowSec,
    configured: enabled,
  }
}

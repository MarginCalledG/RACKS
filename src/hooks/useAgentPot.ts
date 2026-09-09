import type { Address } from 'viem'
import { useReadContracts } from 'wagmi'
import { irsAgentAbi } from '../abi'
import { addresses, configured } from '../config/addresses'
import { DEMO, demo } from '../config/demo'

/**
 * The pot as the agent contract sees it.
 *
 * `potPreview()` is the agent-facing figure — what an audit this epoch would
 * actually be competing for. It differs from CaymanIslands.potBalance(),
 * which only counts bleed that has already been harvested into the pot.
 * Quoting the smaller number would understate the prize.
 *
 * `allocatedPot()` is the part already committed to winners of settled epochs
 * and is therefore not available to this epoch's audits.
 */
export function useAgentPot() {
  const base = { address: addresses.irsAgent as Address, abi: irsAgentAbi } as const

  const { data } = useReadContracts({
    contracts: [
      { ...base, functionName: 'potPreview' },
      { ...base, functionName: 'allocatedPot' },
      { ...base, functionName: 'autoHarvest' },
      { ...base, functionName: 'paused' },
    ],
    query: { enabled: configured('irsAgent') && !DEMO, refetchInterval: 15_000 },
  })

  if (DEMO) {
    return {
      potPreview: demo.potBalance,
      allocatedPot: 0n,
      autoHarvest: 5,
      paused: false,
    }
  }

  return {
    potPreview: data?.[0]?.status === 'success' ? (data[0].result as bigint) : undefined,
    allocatedPot: data?.[1]?.status === 'success' ? (data[1].result as bigint) : undefined,
    autoHarvest: data?.[2]?.status === 'success' ? Number(data[2].result) : undefined,
    /**
     * The owner can halt the game. Minting, feeding and auditing all stop,
     * while feed timers presumably keep running — so a pause can cost you
     * agents you already paid for. Stated rather than left to be discovered
     * when a button silently reverts.
     */
    paused: data?.[3]?.status === 'success' ? (data[3].result as boolean) : undefined,
  }
}

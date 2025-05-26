import {
  ProposalCreated as ProposalCreatedEvent,
  ProposalCanceled as ProposalCanceledEvent,
  ProposalExecuted as ProposalExecutedEvent,
  ProposalQueued as ProposalQueuedEvent,
  VoteCast as VoteCastEvent,
  VoteCastWithParams as VoteCastWithParamsEvent,
  ProposalThresholdSet as ProposalThresholdSetEvent,
  QuorumNumeratorUpdated as QuorumNumeratorUpdatedEvent,
  VotingDelaySet as VotingDelaySetEvent,
  VotingPeriodSet as VotingPeriodSetEvent,
  TimelockChange as TimelockChangeEvent
} from "../generated/SteleGovernor/SteleGovernor"

import { Bytes } from "@graphprotocol/graph-ts"

import {
  ProposalCreated,
  ProposalCanceled,
  ProposalExecuted,
  ProposalQueued,
  VoteCast,
  VoteCastWithParams,
  ProposalThresholdSet,
  QuorumNumeratorUpdated,
  VotingDelaySet,
  VotingPeriodSet,
  TimelockChange,
  ProposalVoteResult,
  Vote
} from "../generated/schema"

import { BigInt, BigDecimal, ethereum } from "@graphprotocol/graph-ts"

export function handleProposalCreated(event: ProposalCreatedEvent): void {
  let entity = new ProposalCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.proposalId = event.params.proposalId
  entity.proposer = event.params.proposer
  
  // Convert Address[] to Bytes[]
  let targets: Bytes[] = []
  for (let i = 0; i < event.params.targets.length; i++) {
    targets.push(event.params.targets[i])
  }
  entity.targets = targets
  
  entity.values = event.params.values
  entity.signatures = event.params.signatures
  entity.calldatas = event.params.calldatas
  entity.voteStart = event.params.voteStart
  entity.voteEnd = event.params.voteEnd
  entity.description = event.params.description

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  // Initialize ProposalVoteResult
  let voteResult = new ProposalVoteResult(event.params.proposalId.toString())
  voteResult.proposalId = event.params.proposalId
  voteResult.forVotes = BigInt.fromI32(0)
  voteResult.againstVotes = BigInt.fromI32(0)
  voteResult.abstainVotes = BigInt.fromI32(0)
  voteResult.totalVotes = BigInt.fromI32(0)
  voteResult.forPercentage = BigDecimal.fromString("0")
  voteResult.againstPercentage = BigDecimal.fromString("0")
  voteResult.abstainPercentage = BigDecimal.fromString("0")
  voteResult.voterCount = BigInt.fromI32(0)
  voteResult.lastUpdatedBlock = event.block.number
  voteResult.lastUpdatedTimestamp = event.block.timestamp
  voteResult.isFinalized = false
  voteResult.save()
}

export function handleProposalCanceled(event: ProposalCanceledEvent): void {
  let entity = new ProposalCanceled(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.proposalId = event.params.proposalId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  // Finalize vote result
  let voteResult = ProposalVoteResult.load(event.params.proposalId.toString())
  if (voteResult) {
    voteResult.isFinalized = true
    voteResult.lastUpdatedBlock = event.block.number
    voteResult.lastUpdatedTimestamp = event.block.timestamp
    voteResult.save()
  }
}

export function handleProposalExecuted(event: ProposalExecutedEvent): void {
  let entity = new ProposalExecuted(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.proposalId = event.params.proposalId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  // Finalize vote result
  let voteResult = ProposalVoteResult.load(event.params.proposalId.toString())
  if (voteResult) {
    voteResult.isFinalized = true
    voteResult.lastUpdatedBlock = event.block.number
    voteResult.lastUpdatedTimestamp = event.block.timestamp
    voteResult.save()
  }
}

export function handleProposalQueued(event: ProposalQueuedEvent): void {
  let entity = new ProposalQueued(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.proposalId = event.params.proposalId
  entity.eta = event.params.eta

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleVoteCast(event: VoteCastEvent): void {
  // Save individual vote record
  let voteEntity = new Vote(
    event.params.proposalId.toString() + "-" + event.params.voter.toHexString()
  )
  voteEntity.proposalId = event.params.proposalId
  voteEntity.voter = event.params.voter
  voteEntity.support = event.params.support
  voteEntity.weight = event.params.weight
  voteEntity.reason = event.params.reason
  voteEntity.blockNumber = event.block.number
  voteEntity.blockTimestamp = event.block.timestamp
  voteEntity.transactionHash = event.transaction.hash
  voteEntity.save()

  // Save original VoteCast entity for backward compatibility
  let entity = new VoteCast(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.voter = event.params.voter
  entity.proposalId = event.params.proposalId
  entity.support = event.params.support
  entity.weight = event.params.weight
  entity.reason = event.params.reason
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash
  entity.save()

  // Update vote aggregation
  updateProposalVoteResult(event.params.proposalId, event.params.support, event.params.weight, event.block)
}

function updateProposalVoteResult(proposalId: BigInt, support: i32, weight: BigInt, block: ethereum.Block): void {
  let voteResult = ProposalVoteResult.load(proposalId.toString())
  if (!voteResult) {
    // Create if doesn't exist (shouldn't happen if proposal was created properly)
    voteResult = new ProposalVoteResult(proposalId.toString())
    voteResult.proposalId = proposalId
    voteResult.forVotes = BigInt.fromI32(0)
    voteResult.againstVotes = BigInt.fromI32(0)
    voteResult.abstainVotes = BigInt.fromI32(0)
    voteResult.totalVotes = BigInt.fromI32(0)
    voteResult.voterCount = BigInt.fromI32(0)
  }

  // Update vote counts based on support type
  // support: 0 = Against, 1 = For, 2 = Abstain
  if (support == 0) {
    voteResult.againstVotes = voteResult.againstVotes.plus(weight)
  } else if (support == 1) {
    voteResult.forVotes = voteResult.forVotes.plus(weight)
  } else if (support == 2) {
    voteResult.abstainVotes = voteResult.abstainVotes.plus(weight)
  }

  // Update totals
  voteResult.totalVotes = voteResult.forVotes.plus(voteResult.againstVotes).plus(voteResult.abstainVotes)
  voteResult.voterCount = voteResult.voterCount.plus(BigInt.fromI32(1))

  // Calculate percentages
  if (voteResult.totalVotes.gt(BigInt.fromI32(0))) {
    let totalVotesDecimal = voteResult.totalVotes.toBigDecimal()
    voteResult.forPercentage = voteResult.forVotes.toBigDecimal().div(totalVotesDecimal).times(BigDecimal.fromString("100"))
    voteResult.againstPercentage = voteResult.againstVotes.toBigDecimal().div(totalVotesDecimal).times(BigDecimal.fromString("100"))
    voteResult.abstainPercentage = voteResult.abstainVotes.toBigDecimal().div(totalVotesDecimal).times(BigDecimal.fromString("100"))
  } else {
    voteResult.forPercentage = BigDecimal.fromString("0")
    voteResult.againstPercentage = BigDecimal.fromString("0")
    voteResult.abstainPercentage = BigDecimal.fromString("0")
  }

  // Update metadata
  voteResult.lastUpdatedBlock = block.number
  voteResult.lastUpdatedTimestamp = block.timestamp

  // Check if voting period has ended (we'll update this in other handlers)
  // For now, keep isFinalized as false until proposal is executed/canceled

  voteResult.save()
}

export function handleVoteCastWithParams(event: VoteCastWithParamsEvent): void {
  let entity = new VoteCastWithParams(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.voter = event.params.voter
  entity.proposalId = event.params.proposalId
  entity.support = event.params.support
  entity.weight = event.params.weight
  entity.reason = event.params.reason
  entity.params = event.params.params

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleProposalThresholdSet(event: ProposalThresholdSetEvent): void {
  let entity = new ProposalThresholdSet(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.oldProposalThreshold = event.params.oldProposalThreshold
  entity.newProposalThreshold = event.params.newProposalThreshold

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleQuorumNumeratorUpdated(event: QuorumNumeratorUpdatedEvent): void {
  let entity = new QuorumNumeratorUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.oldQuorumNumerator = event.params.oldQuorumNumerator
  entity.newQuorumNumerator = event.params.newQuorumNumerator

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleVotingDelaySet(event: VotingDelaySetEvent): void {
  let entity = new VotingDelaySet(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.oldVotingDelay = event.params.oldVotingDelay
  entity.newVotingDelay = event.params.newVotingDelay

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleVotingPeriodSet(event: VotingPeriodSetEvent): void {
  let entity = new VotingPeriodSet(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.oldVotingPeriod = event.params.oldVotingPeriod
  entity.newVotingPeriod = event.params.newVotingPeriod

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleTimelockChange(event: TimelockChangeEvent): void {
  let entity = new TimelockChange(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.oldTimelock = event.params.oldTimelock
  entity.newTimelock = event.params.newTimelock

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
} 
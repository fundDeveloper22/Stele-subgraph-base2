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
  Vote,
  Proposal
} from "../generated/schema"

import { BigInt, BigDecimal, ethereum } from "@graphprotocol/graph-ts"

// Helper function to determine initial proposal status based on creation time
function getInitialProposalStatus(voteStart: BigInt, creationTimestamp: BigInt): string {
  if (creationTimestamp.lt(voteStart)) {
    return "PENDING"
  } else {
    return "ACTIVE"
  }
}

// Helper function to create or update Proposal entity
function createOrUpdateProposal(
  proposalId: BigInt,
  proposer: Bytes,
  targets: Bytes[],
  values: BigInt[],
  signatures: string[],
  calldatas: Bytes[],
  voteStart: BigInt,
  voteEnd: BigInt,
  description: string,
  timestamp: BigInt,
  blockNumber: BigInt
): void {
  let proposal = Proposal.load(proposalId.toString())
  
  if (!proposal) {
    proposal = new Proposal(proposalId.toString())
    proposal.proposalId = proposalId
    proposal.proposer = proposer
    proposal.targets = targets
    proposal.values = values
    proposal.signatures = signatures
    proposal.calldatas = calldatas
    proposal.voteStart = voteStart
    proposal.voteEnd = voteEnd
    proposal.description = description
    proposal.createdAt = timestamp
    proposal.createdAtBlock = blockNumber
    proposal.queuedAt = null
    proposal.executedAt = null
    proposal.canceledAt = null
    proposal.eta = null
    
    // Set initial status based on creation time vs vote start time
    proposal.status = getInitialProposalStatus(voteStart, timestamp)
  }
  
  proposal.lastUpdatedBlock = blockNumber
  
  // Link to vote result if exists
  let voteResult = ProposalVoteResult.load(proposalId.toString())
  if (voteResult) {
    proposal.voteResult = voteResult.id
  }
  
  proposal.save()
}

export function handleProposalCreated(event: ProposalCreatedEvent): void {
  // Save ProposalCreated event entity
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

  // Create comprehensive Proposal entity
  createOrUpdateProposal(
    event.params.proposalId,
    event.params.proposer,
    targets,
    event.params.values,
    event.params.signatures,
    event.params.calldatas,
    event.params.voteStart,
    event.params.voteEnd,
    event.params.description,
    event.block.timestamp,
    event.block.number
  )
}

export function handleProposalCanceled(event: ProposalCanceledEvent): void {
  // Save ProposalCanceled event entity
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

  // Update Proposal status to CANCELED
  let proposal = Proposal.load(event.params.proposalId.toString())
  if (proposal) {
    proposal.status = "CANCELED"
    proposal.canceledAt = event.block.timestamp
    proposal.lastUpdatedBlock = event.block.number
    proposal.save()
  }
}

export function handleProposalExecuted(event: ProposalExecutedEvent): void {
  // Save ProposalExecuted event entity
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

  // Update Proposal status to EXECUTED
  let proposal = Proposal.load(event.params.proposalId.toString())
  if (proposal) {
    proposal.status = "EXECUTED"
    proposal.executedAt = event.block.timestamp
    proposal.lastUpdatedBlock = event.block.number
    proposal.save()
  }
}

export function handleProposalQueued(event: ProposalQueuedEvent): void {
  // Save ProposalQueued event entity
  let entity = new ProposalQueued(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.proposalId = event.params.proposalId
  entity.eta = event.params.eta
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash
  entity.save()

  // Update Proposal status to QUEUED
  let proposal = Proposal.load(event.params.proposalId.toString())
  if (proposal) {
    proposal.status = "QUEUED"
    proposal.queuedAt = event.block.timestamp
    proposal.eta = event.params.eta
    proposal.lastUpdatedBlock = event.block.number
    proposal.save()
  }
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

export function handleVoteCastWithParams(event: VoteCastWithParamsEvent): void {
  // Save VoteCastWithParams event entity
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

  // Update vote aggregation (same as VoteCast)
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

  // Keep isFinalized as false until proposal is executed/canceled
  voteResult.save()

  // Update proposal's vote result link
  let proposal = Proposal.load(proposalId.toString())
  if (proposal) {
    proposal.voteResult = voteResult.id
    proposal.save()
  }
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
import { Address, BigDecimal, BigInt, Bytes, ethereum } from '@graphprotocol/graph-ts'
import {
  Stele,
  SteleSnapshot,
  Challenge,
  ChallengeSnapshot,
  Investor,
  InvestorSnapshot
} from '../../generated/schema'
import { STELE_ADDRESS } from './constants'
import { getInvestorID } from './investor'

export function steleSnapshot(event: ethereum.Event): void {
  let stele = Stele.load(Bytes.fromHexString(STELE_ADDRESS))
  if (!stele) return 

  let timestamp = event.block.timestamp.toI32()
  let dayID = timestamp / 86400 // rounded
  
  let steleSnapshot = SteleSnapshot.load(dayID.toString())
  if (steleSnapshot === null) {
    steleSnapshot = new SteleSnapshot(dayID.toString())
  }
  steleSnapshot.date = dayID
  steleSnapshot.rewardRatio = stele.rewardRatio
  steleSnapshot.seedMoney = stele.seedMoney
  steleSnapshot.entryFee = stele.entryFee
  steleSnapshot.maxAssets = stele.maxAssets
  steleSnapshot.owner = stele.owner
  steleSnapshot.challengeCounter = stele.challengeCounter
  steleSnapshot.investorCounter = stele.investorCounter
  steleSnapshot.totalRewardUSD = stele.totalRewardUSD
  steleSnapshot.save()
}

export function challengeSnapshot(
  challengeId: string,
  event: ethereum.Event
): void {
  let challenge = Challenge.load(challengeId)
  if (!challenge) return

  let timestamp = event.block.timestamp.toI32()
  let dayID = timestamp / 86400 // rounded

  let challengeSnapshot = ChallengeSnapshot.load(challengeId + "-" + dayID.toString())
  if (challengeSnapshot == null) {
    challengeSnapshot = new ChallengeSnapshot(challengeId + "-" + dayID.toString())
  }
  challengeSnapshot.challengeId = challenge.challengeId
  challengeSnapshot.timestamp = event.block.timestamp
  challengeSnapshot.investorCount = challenge.investorCounter
  challengeSnapshot.rewardAmountUSD = challenge.rewardAmountUSD
  challengeSnapshot.topUsers = challenge.topUsers
  challengeSnapshot.score = challenge.score
  challengeSnapshot.save()
}

export function investorSnapshot(
  challengeId: BigInt,
  investorAddress: Bytes,
  event: ethereum.Event
): void {
  const investorId = getInvestorID(
    challengeId, 
    Address.fromString(investorAddress.toHexString()))
  let investor = Investor.load(investorId)
  if (!investor) return 

  let dayID = event.block.timestamp.toI32() / 86400 // rounded

  let investorSnapshot = InvestorSnapshot.load(investorId + "-" + dayID.toString())
  if (investorSnapshot == null) {
    investorSnapshot = new InvestorSnapshot(investorId + "-" + dayID.toString())
  }
  investorSnapshot.challengeId = investor.challengeId
  investorSnapshot.timestamp = event.block.timestamp
  investorSnapshot.investor = investor.investor
  investorSnapshot.seedMoneyUSD = investor.seedMoneyUSD
  investorSnapshot.currentUSD = investor.currentUSD
  investorSnapshot.tokens = investor.tokens
  investorSnapshot.tokensAmount = investor.tokensAmount
  investorSnapshot.profitRatio = investor.profitRatio
  investorSnapshot.save()
}

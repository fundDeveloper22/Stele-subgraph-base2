import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
import {
  AddToken,
  Create,
  DebugJoin,
  DebugTokenPrice,
  EntryFee,
  Join,
  MaxAssets,
  OwnershipTransferred,
  Register,
  RemoveToken,
  Reward,
  RewardRatio,
  SeedMoney,
  SteleCreated,
  Swap
} from "../generated/Stele/Stele"

export function createAddTokenEvent(tokenAddress: Address): AddToken {
  let addTokenEvent = changetype<AddToken>(newMockEvent())

  addTokenEvent.parameters = new Array()

  addTokenEvent.parameters.push(
    new ethereum.EventParam(
      "tokenAddress",
      ethereum.Value.fromAddress(tokenAddress)
    )
  )

  return addTokenEvent
}

export function createCreateEvent(
  challengeId: BigInt,
  challengeType: i32,
  seedMoney: BigInt,
  entryFee: BigInt
): Create {
  let createEvent = changetype<Create>(newMockEvent())

  createEvent.parameters = new Array()

  createEvent.parameters.push(
    new ethereum.EventParam(
      "challengeId",
      ethereum.Value.fromUnsignedBigInt(challengeId)
    )
  )
  createEvent.parameters.push(
    new ethereum.EventParam(
      "challengeType",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(challengeType))
    )
  )
  createEvent.parameters.push(
    new ethereum.EventParam(
      "seedMoney",
      ethereum.Value.fromUnsignedBigInt(seedMoney)
    )
  )
  createEvent.parameters.push(
    new ethereum.EventParam(
      "entryFee",
      ethereum.Value.fromUnsignedBigInt(entryFee)
    )
  )

  return createEvent
}

export function createDebugJoinEvent(
  tokenAddress: Address,
  amount: BigInt,
  totalRewards: BigInt
): DebugJoin {
  let debugJoinEvent = changetype<DebugJoin>(newMockEvent())

  debugJoinEvent.parameters = new Array()

  debugJoinEvent.parameters.push(
    new ethereum.EventParam(
      "tokenAddress",
      ethereum.Value.fromAddress(tokenAddress)
    )
  )
  debugJoinEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )
  debugJoinEvent.parameters.push(
    new ethereum.EventParam(
      "totalRewards",
      ethereum.Value.fromUnsignedBigInt(totalRewards)
    )
  )

  return debugJoinEvent
}

export function createDebugTokenPriceEvent(
  baseToken: Address,
  baseAmount: BigInt,
  quoteToken: Address,
  quoteAmount: BigInt
): DebugTokenPrice {
  let debugTokenPriceEvent = changetype<DebugTokenPrice>(newMockEvent())

  debugTokenPriceEvent.parameters = new Array()

  debugTokenPriceEvent.parameters.push(
    new ethereum.EventParam("baseToken", ethereum.Value.fromAddress(baseToken))
  )
  debugTokenPriceEvent.parameters.push(
    new ethereum.EventParam(
      "baseAmount",
      ethereum.Value.fromUnsignedBigInt(baseAmount)
    )
  )
  debugTokenPriceEvent.parameters.push(
    new ethereum.EventParam(
      "quoteToken",
      ethereum.Value.fromAddress(quoteToken)
    )
  )
  debugTokenPriceEvent.parameters.push(
    new ethereum.EventParam(
      "quoteAmount",
      ethereum.Value.fromUnsignedBigInt(quoteAmount)
    )
  )

  return debugTokenPriceEvent
}

export function createEntryFeeEvent(newEntryFee: BigInt): EntryFee {
  let entryFeeEvent = changetype<EntryFee>(newMockEvent())

  entryFeeEvent.parameters = new Array()

  entryFeeEvent.parameters.push(
    new ethereum.EventParam(
      "newEntryFee",
      ethereum.Value.fromUnsignedBigInt(newEntryFee)
    )
  )

  return entryFeeEvent
}

export function createJoinEvent(
  challengeId: BigInt,
  user: Address,
  seedMoney: BigInt
): Join {
  let joinEvent = changetype<Join>(newMockEvent())

  joinEvent.parameters = new Array()

  joinEvent.parameters.push(
    new ethereum.EventParam(
      "challengeId",
      ethereum.Value.fromUnsignedBigInt(challengeId)
    )
  )
  joinEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  joinEvent.parameters.push(
    new ethereum.EventParam(
      "seedMoney",
      ethereum.Value.fromUnsignedBigInt(seedMoney)
    )
  )

  return joinEvent
}

export function createMaxAssetsEvent(newMaxAssets: i32): MaxAssets {
  let maxAssetsEvent = changetype<MaxAssets>(newMockEvent())

  maxAssetsEvent.parameters = new Array()

  maxAssetsEvent.parameters.push(
    new ethereum.EventParam(
      "newMaxAssets",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(newMaxAssets))
    )
  )

  return maxAssetsEvent
}

export function createOwnershipTransferredEvent(
  previousOwner: Address,
  newOwner: Address
): OwnershipTransferred {
  let ownershipTransferredEvent =
    changetype<OwnershipTransferred>(newMockEvent())

  ownershipTransferredEvent.parameters = new Array()

  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  )
  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownershipTransferredEvent
}

export function createRegisterEvent(
  challengeId: BigInt,
  user: Address,
  performance: BigInt
): Register {
  let registerEvent = changetype<Register>(newMockEvent())

  registerEvent.parameters = new Array()

  registerEvent.parameters.push(
    new ethereum.EventParam(
      "challengeId",
      ethereum.Value.fromUnsignedBigInt(challengeId)
    )
  )
  registerEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  registerEvent.parameters.push(
    new ethereum.EventParam(
      "performance",
      ethereum.Value.fromUnsignedBigInt(performance)
    )
  )

  return registerEvent
}

export function createRemoveTokenEvent(tokenAddress: Address): RemoveToken {
  let removeTokenEvent = changetype<RemoveToken>(newMockEvent())

  removeTokenEvent.parameters = new Array()

  removeTokenEvent.parameters.push(
    new ethereum.EventParam(
      "tokenAddress",
      ethereum.Value.fromAddress(tokenAddress)
    )
  )

  return removeTokenEvent
}

export function createRewardEvent(
  challengeId: BigInt,
  user: Address,
  rewardAmount: BigInt
): Reward {
  let rewardEvent = changetype<Reward>(newMockEvent())

  rewardEvent.parameters = new Array()

  rewardEvent.parameters.push(
    new ethereum.EventParam(
      "challengeId",
      ethereum.Value.fromUnsignedBigInt(challengeId)
    )
  )
  rewardEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  rewardEvent.parameters.push(
    new ethereum.EventParam(
      "rewardAmount",
      ethereum.Value.fromUnsignedBigInt(rewardAmount)
    )
  )

  return rewardEvent
}

export function createRewardRatioEvent(
  newRewardRatio: Array<BigInt>
): RewardRatio {
  let rewardRatioEvent = changetype<RewardRatio>(newMockEvent())

  rewardRatioEvent.parameters = new Array()

  rewardRatioEvent.parameters.push(
    new ethereum.EventParam(
      "newRewardRatio",
      ethereum.Value.fromUnsignedBigIntArray(newRewardRatio)
    )
  )

  return rewardRatioEvent
}

export function createSeedMoneyEvent(newSeedMoney: BigInt): SeedMoney {
  let seedMoneyEvent = changetype<SeedMoney>(newMockEvent())

  seedMoneyEvent.parameters = new Array()

  seedMoneyEvent.parameters.push(
    new ethereum.EventParam(
      "newSeedMoney",
      ethereum.Value.fromUnsignedBigInt(newSeedMoney)
    )
  )

  return seedMoneyEvent
}

export function createSteleCreatedEvent(
  owner: Address,
  usdToken: Address,
  maxAssets: i32,
  seedMoney: BigInt,
  entryFee: BigInt,
  rewardRatio: Array<BigInt>
): SteleCreated {
  let steleCreatedEvent = changetype<SteleCreated>(newMockEvent())

  steleCreatedEvent.parameters = new Array()

  steleCreatedEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  )
  steleCreatedEvent.parameters.push(
    new ethereum.EventParam("usdToken", ethereum.Value.fromAddress(usdToken))
  )
  steleCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "maxAssets",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(maxAssets))
    )
  )
  steleCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "seedMoney",
      ethereum.Value.fromUnsignedBigInt(seedMoney)
    )
  )
  steleCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "entryFee",
      ethereum.Value.fromUnsignedBigInt(entryFee)
    )
  )
  steleCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "rewardRatio",
      ethereum.Value.fromUnsignedBigIntArray(rewardRatio)
    )
  )

  return steleCreatedEvent
}

export function createSwapEvent(
  challengeId: BigInt,
  user: Address,
  fromAsset: Address,
  toAsset: Address,
  fromAmount: BigInt,
  toAmount: BigInt
): Swap {
  let swapEvent = changetype<Swap>(newMockEvent())

  swapEvent.parameters = new Array()

  swapEvent.parameters.push(
    new ethereum.EventParam(
      "challengeId",
      ethereum.Value.fromUnsignedBigInt(challengeId)
    )
  )
  swapEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  swapEvent.parameters.push(
    new ethereum.EventParam("fromAsset", ethereum.Value.fromAddress(fromAsset))
  )
  swapEvent.parameters.push(
    new ethereum.EventParam("toAsset", ethereum.Value.fromAddress(toAsset))
  )
  swapEvent.parameters.push(
    new ethereum.EventParam(
      "fromAmount",
      ethereum.Value.fromUnsignedBigInt(fromAmount)
    )
  )
  swapEvent.parameters.push(
    new ethereum.EventParam(
      "toAmount",
      ethereum.Value.fromUnsignedBigInt(toAmount)
    )
  )

  return swapEvent
}

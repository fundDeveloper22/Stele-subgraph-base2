import { BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
  Stele,
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
import { ExampleEntity } from "../generated/schema"

export function handleAddToken(event: AddToken): void {
  // Entities can be loaded from the store using an ID; this ID
  // needs to be unique across all entities of the same type
  const id = event.transaction.hash.concat(
    Bytes.fromByteArray(Bytes.fromBigInt(event.logIndex))
  )
  let entity = ExampleEntity.load(id)

  // Entities only exist after they have been saved to the store;
  // `null` checks allow to create entities on demand
  if (!entity) {
    entity = new ExampleEntity(id)

    // Entity fields can be set using simple assignments
    entity.count = BigInt.fromI32(0)
  }

  // BigInt and BigDecimal math are supported
  entity.count = entity.count + BigInt.fromI32(1)

  // Entity fields can be set based on event parameters
  entity.tokenAddress = event.params.tokenAddress

  // Entities can be written to the store with `.save()`
  entity.save()

  // Note: If a handler doesn't require existing field values, it is faster
  // _not_ to load the entity from the store. Instead, create it fresh with
  // `new Entity(...)`, set the fields that should be updated and save the
  // entity back to the store. Fields that were not set or unset remain
  // unchanged, allowing for partial updates to be applied.

  // It is also possible to access smart contracts from mappings. For
  // example, the contract that has emitted the event can be connected to
  // with:
  //
  // let contract = Contract.bind(event.address)
  //
  // The following functions can then be called on this contract to access
  // state variables and other data:
  //
  // - contract.WETH(...)
  // - contract.challengeCounter(...)
  // - contract.challenges(...)
  // - contract.entryFee(...)
  // - contract.getTokenPrice(...)
  // - contract.isInvestable(...)
  // - contract.latestChallengesByType(...)
  // - contract.maxAssets(...)
  // - contract.owner(...)
  // - contract.rewardRatio(...)
  // - contract.seedMoney(...)
  // - contract.uniswapV3Factory(...)
  // - contract.usdToken(...)
  // - contract.usdTokenDecimals(...)
}

export function handleCreate(event: Create): void {}

export function handleDebugJoin(event: DebugJoin): void {}

export function handleDebugTokenPrice(event: DebugTokenPrice): void {}

export function handleEntryFee(event: EntryFee): void {}

export function handleJoin(event: Join): void {}

export function handleMaxAssets(event: MaxAssets): void {}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {}

export function handleRegister(event: Register): void {}

export function handleRemoveToken(event: RemoveToken): void {}

export function handleReward(event: Reward): void {}

export function handleRewardRatio(event: RewardRatio): void {}

export function handleSeedMoney(event: SeedMoney): void {}

export function handleSteleCreated(event: SteleCreated): void {}

export function handleSwap(event: Swap): void {}

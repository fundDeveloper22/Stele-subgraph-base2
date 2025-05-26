import {
  AddToken as AddTokenEvent,
  Reward as RewardEvent,
  Create as CreateEvent,
  EntryFee as EntryFeeEvent,
  Join as JoinEvent,
  MaxAssets as MaxAssetsEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
  Register as RegisterEvent,
  RemoveToken as RemoveTokenEvent,
  RewardRatio as RewardRatioEvent,
  SeedMoney as SeedMoneyEvent,
  Swap as SwapEvent,
  SteleCreated as SteleCreatedEvent,
  Stele as SteleContract
} from "../generated/Stele/Stele"
import {
  Reward,
  Create,
  Join,
  Register,
  Swap,
  Token,
  Stele,
  Challenge,
  SteleSnapshot,
  ChallengeSnapshot,
  Investor,
  ActiveChallenges
} from "../generated/schema"
import { BigInt, BigDecimal, Bytes, log, Address } from "@graphprotocol/graph-ts"
import { ChallengeType, getDuration, STELE_ADDRESS } from "./utils/constants"
import { ERC20 } from "../generated/Stele/ERC20"
import { steleSnapshot, challengeSnapshot, investorSnapshot } from "./utils/snapshots"
import { getEthPriceInUSD, getTokenPriceETH } from "./utils/pricing"
import { exponentToBigDecimal } from "./utils/index"
import { getInvestorID } from "./utils/investor"

function fetchTokenDecimals(tokenAddress: Bytes): BigInt | null {
  let contract = ERC20.bind(Address.fromBytes(tokenAddress))
  let decimalsResult = contract.try_decimals()
  if (!decimalsResult.reverted) {
    return BigInt.fromI32(decimalsResult.value)
  }
  return null
}

function fetchTokenSymbol(tokenAddress: Bytes): string {
  let contract = ERC20.bind(Address.fromBytes(tokenAddress))
  let symbolResult = contract.try_symbol()
  if (!symbolResult.reverted) {
    return symbolResult.value
  }
  return "UNKNOWN"
}

export function handleSteleCreated(event: SteleCreatedEvent): void {
  let stele = new Stele(Bytes.fromHexString(STELE_ADDRESS))
  stele.owner = event.params.owner
  stele.usdToken = event.params.usdToken
  stele.rewardRatio = event.params.rewardRatio
  stele.seedMoney = event.params.seedMoney
  stele.entryFee = event.params.entryFee
  stele.maxAssets = event.params.maxAssets
  stele.challengeCounter= BigInt.fromI32(0)
  stele.investorCounter = BigInt.fromI32(0)
  stele.totalRewardUSD = BigDecimal.fromString("0")
  stele.save()

  let activeChallenges = new ActiveChallenges(Bytes.fromHexString(STELE_ADDRESS))
  activeChallenges.id = Bytes.fromHexString(STELE_ADDRESS)
  activeChallenges.one_week_id = "0"
  activeChallenges.one_week_startTime = BigInt.fromI32(0)
  activeChallenges.one_week_investorCounter = BigInt.fromI32(0)
  activeChallenges.one_week_rewardAmountUSD = BigInt.fromI32(0)
  activeChallenges.one_week_isCompleted = true
  activeChallenges.one_month_id = "0"
  activeChallenges.one_month_startTime = BigInt.fromI32(0)
  activeChallenges.one_month_investorCounter = BigInt.fromI32(0)
  activeChallenges.one_month_rewardAmountUSD = BigInt.fromI32(0)
  activeChallenges.one_month_isCompleted = true
  activeChallenges.three_month_id = "0"
  activeChallenges.three_month_startTime = BigInt.fromI32(0)
  activeChallenges.three_month_investorCounter = BigInt.fromI32(0)
  activeChallenges.three_month_rewardAmountUSD = BigInt.fromI32(0)
  activeChallenges.three_month_isCompleted = true
  activeChallenges.six_month_id = "0"
  activeChallenges.six_month_startTime = BigInt.fromI32(0)
  activeChallenges.six_month_investorCounter = BigInt.fromI32(0)
  activeChallenges.six_month_rewardAmountUSD = BigInt.fromI32(0)
  activeChallenges.six_month_isCompleted = true
  activeChallenges.one_year_id = "0"
  activeChallenges.one_year_startTime = BigInt.fromI32(0)
  activeChallenges.one_year_investorCounter = BigInt.fromI32(0)
  activeChallenges.one_year_rewardAmountUSD = BigInt.fromI32(0)
  activeChallenges.one_year_isCompleted = true
  activeChallenges.save()
}

export function handleAddToken(event: AddTokenEvent): void {
  let token = Token.load(event.params.tokenAddress)
  if (!token) {
    token = new Token(event.params.tokenAddress)
    token.tokenAddress = event.params.tokenAddress
    
    let decimals = fetchTokenDecimals(event.params.tokenAddress)
    if (decimals === null) {
      log.debug('the decimals on {} token was null', [event.params.tokenAddress.toHexString()])
      return
    }
    token.decimals = decimals
    token.symbol = fetchTokenSymbol(event.params.tokenAddress)
    token.isInvestable = true
    token.updatedTimestamp = event.block.timestamp
    token.save()
  } else {
    token.isInvestable = true
    token.updatedTimestamp = event.block.timestamp
    token.save()
  }
}

export function handleRemoveToken(event: RemoveTokenEvent): void {
  let token = Token.load(event.params.tokenAddress)
  if (token != null) {
    token.isInvestable = false
    token.updatedTimestamp = event.block.timestamp
    token.save()
  }
}

export function handleRewardRatio(event: RewardRatioEvent): void {
  let stele = Stele.load(Bytes.fromHexString(STELE_ADDRESS))
  if (stele != null) {
    stele.rewardRatio = event.params.newRewardRatio
    stele.save()
  }
}

export function handleSeedMoney(event: SeedMoneyEvent): void {
  let stele = Stele.load(Bytes.fromHexString(STELE_ADDRESS))
  if (stele != null) {
    stele.seedMoney = event.params.newSeedMoney
    stele.save()
  }
}

export function handleEntryFee(event: EntryFeeEvent): void {
  let stele = Stele.load(Bytes.fromHexString(STELE_ADDRESS))
  if (stele != null) {
    stele.entryFee = event.params.newEntryFee
    stele.save()
  }
}

export function handleMaxAssets(event: MaxAssetsEvent): void {
  let stele = Stele.load(Bytes.fromHexString(STELE_ADDRESS))
  if (stele != null) {
    stele.maxAssets = event.params.newMaxAssets
    stele.save()
  }
}

export function handleOwnershipTransferred(
  event: OwnershipTransferredEvent
): void {
  let stele = Stele.load(Bytes.fromHexString(STELE_ADDRESS))
  if (stele != null) {
    stele.owner = event.params.newOwner
    stele.save()
  }
}

export function handleCreate(event: CreateEvent): void {
  let create = new Create(event.transaction.hash)
  create.challengeId = event.params.challengeId
  create.challengeType = event.params.challengeType
  create.blockNumber = event.block.number
  create.blockTimestamp = event.block.timestamp
  create.transactionHash = event.transaction.hash
  create.save()

  let timestamp = event.block.timestamp.toI32()
  let dayID = timestamp / 86400 // rounded
  
  // create stele snapshot
  let stele = Stele.load(Bytes.fromHexString(STELE_ADDRESS))
  if (stele == null) {
    log.debug('[CREATE] Stele not found, Stele : {}', [STELE_ADDRESS])
    return
  }
  stele.challengeCounter = stele.challengeCounter.plus(BigInt.fromI32(1))
  stele.save()

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

  // Create challenge and challenge snapshot
  let challenge = new Challenge(
    event.params.challengeId.toString()
  )
  challenge.challengeId = event.params.challengeId.toString()
  challenge.challengeType = create.challengeType
  challenge.startTime = event.block.timestamp
  challenge.endTime = challenge.startTime.plus(getDuration(event.params.challengeType))
  challenge.investorCounter = BigInt.fromI32(0)
  challenge.seedMoney = event.params.seedMoney
  challenge.entryFee = event.params.entryFee
  challenge.rewardAmountUSD = BigInt.fromI32(0)
  challenge.isActive = true
  challenge.topUsers = []
  challenge.score = []
  challenge.save()

  let challengeSnapshot = ChallengeSnapshot.load(event.params.challengeId.toString() + "-" + dayID.toString())
  if (challengeSnapshot == null) {
    challengeSnapshot = new ChallengeSnapshot(event.params.challengeId.toString() + "-" + dayID.toString())
  }
  challengeSnapshot.challengeId = event.params.challengeId.toString()
  challengeSnapshot.timestamp = event.block.timestamp
  challengeSnapshot.investorCount = BigInt.fromI32(0)
  challengeSnapshot.rewardAmountUSD = BigInt.fromI32(0)
  challengeSnapshot.topUsers = []
  challengeSnapshot.score = []
  challengeSnapshot.save()

  let activeChallenges = ActiveChallenges.load(Bytes.fromHexString(STELE_ADDRESS))
  if (activeChallenges == null) {
    log.debug('[CREATE] ActiveChallenges not found, ChallengeId : {}', [event.params.challengeId.toString()])
    return
  }
  switch (challenge.challengeType) {
    case ChallengeType.OneWeek:
      activeChallenges.one_week_id = event.params.challengeId.toString()
      activeChallenges.one_week_startTime = event.block.timestamp
      activeChallenges.one_week_investorCounter = BigInt.fromI32(0)
      activeChallenges.one_week_rewardAmountUSD = BigInt.fromI32(0)
      activeChallenges.one_week_isCompleted = false
      break;
    case ChallengeType.OneMonth:
      activeChallenges.one_month_id = event.params.challengeId.toString()
      activeChallenges.one_month_startTime = event.block.timestamp
      activeChallenges.one_month_investorCounter = BigInt.fromI32(0)
      activeChallenges.one_month_rewardAmountUSD = BigInt.fromI32(0)
      activeChallenges.one_month_isCompleted = false
      break;
    case ChallengeType.ThreeMonths:
      activeChallenges.three_month_id = event.params.challengeId.toString()
      activeChallenges.three_month_startTime = event.block.timestamp
      activeChallenges.three_month_investorCounter = BigInt.fromI32(0)
      activeChallenges.three_month_rewardAmountUSD = BigInt.fromI32(0)
      activeChallenges.three_month_isCompleted = false
      break;
    case ChallengeType.SixMonths:
      activeChallenges.six_month_id = event.params.challengeId.toString()
      activeChallenges.six_month_startTime = event.block.timestamp
      activeChallenges.six_month_investorCounter = BigInt.fromI32(0)
      activeChallenges.six_month_rewardAmountUSD = BigInt.fromI32(0)
      activeChallenges.six_month_isCompleted = false
      break;
    case ChallengeType.OneYear:
      activeChallenges.one_year_id = event.params.challengeId.toString()
      activeChallenges.one_year_startTime = event.block.timestamp
      activeChallenges.one_year_investorCounter = BigInt.fromI32(0)
      activeChallenges.one_year_rewardAmountUSD = BigInt.fromI32(0)
      activeChallenges.one_year_isCompleted = false
      break;
    default:
      break;
  }
  activeChallenges.save()
}

export function handleJoin(event: JoinEvent): void {
  let join = new Join(event.transaction.hash)
  join.challengeId = event.params.challengeId
  join.user = event.params.user
  join.seedMoney = event.params.seedMoney
  join.blockNumber = event.block.number
  join.blockTimestamp = event.block.timestamp
  join.transactionHash = event.transaction.hash
  join.save()

  // Update Stele and create SteleSnapshot
  let stele = Stele.load(Bytes.fromHexString(STELE_ADDRESS))
  if (stele == null) {
    log.debug('[JOIN] Stele not found, Stele : {}', [STELE_ADDRESS])
    return
  }
  stele.investorCounter = stele.investorCounter.plus(BigInt.fromI32(1))
  stele.save()
  steleSnapshot(event)

  // Update Challenge and create ChallengeSnapshot
  let challenge = Challenge.load(event.params.challengeId.toString())
  if (challenge == null) {
    log.debug('[JOIN] Challenge not found, Challenge : {}', [event.params.challengeId.toString()])
    return
  }
  challenge.investorCounter = challenge.investorCounter.plus(BigInt.fromI32(1))
  challenge.save()
  challengeSnapshot(event.params.challengeId.toString(), event)

  // Create new Investor and InvestorSnapshot
  let investor = new Investor(getInvestorID(event.params.challengeId, event.params.user))
  investor.challengeId = event.params.challengeId.toString()
  investor.createdAtTimestamp = event.block.timestamp
  investor.updatedAtTimestamp = event.block.timestamp
  investor.investor = event.params.user
  investor.seedMoneyUSD = BigDecimal.fromString(event.params.seedMoney.toString())
  investor.currentUSD = BigDecimal.fromString("0")
  investor.tokens = [stele.usdToken]
  
  let usdTokenContract = ERC20.bind(Address.fromBytes(stele.usdToken))
  let decimalsResult = usdTokenContract.try_decimals()
  if (!decimalsResult.reverted) {
    let decimals = decimalsResult.value as u8
    let seedMoneyWithDecimals = event.params.seedMoney.times(BigInt.fromI32(10).pow(decimals))
    investor.tokensAmount = [BigDecimal.fromString(seedMoneyWithDecimals.toString())]
  } else {
    log.debug('[JOIN] Failed to get decimals for USD token: {}', [stele.usdToken.toHexString()])
    investor.tokensAmount = [BigDecimal.fromString("0")]
  }

  investor.profitUSD = investor.currentUSD.minus(investor.seedMoneyUSD)
  investor.profitRatio = investor.profitUSD.div(investor.seedMoneyUSD)
  investor.save()

  investorSnapshot(event.params.challengeId, event.params.user, event)

  let activeChallenges = ActiveChallenges.load(Bytes.fromHexString(STELE_ADDRESS))
  if (activeChallenges == null) {
    log.debug('[JOIN] ActiveChallenges not found, ChallengeId : {}', [event.params.challengeId.toString()])
    return
  }
  switch (challenge.challengeType) {
    case ChallengeType.OneWeek:
      activeChallenges.one_week_investorCounter = activeChallenges.one_week_investorCounter.plus(BigInt.fromI32(1))
      activeChallenges.one_week_rewardAmountUSD = activeChallenges.one_week_rewardAmountUSD.plus(challenge.entryFee)
      break;
    case ChallengeType.OneMonth:
      activeChallenges.one_month_investorCounter = activeChallenges.one_month_investorCounter.plus(BigInt.fromI32(1))
      activeChallenges.one_month_rewardAmountUSD = activeChallenges.one_month_rewardAmountUSD.plus(challenge.entryFee)
      break;
    case ChallengeType.ThreeMonths:
      activeChallenges.three_month_investorCounter = activeChallenges.three_month_investorCounter.plus(BigInt.fromI32(1))
      activeChallenges.three_month_rewardAmountUSD = activeChallenges.three_month_rewardAmountUSD.plus(challenge.entryFee)
      break;
    case ChallengeType.SixMonths:
      activeChallenges.six_month_investorCounter = activeChallenges.six_month_investorCounter.plus(BigInt.fromI32(1))
      activeChallenges.six_month_rewardAmountUSD = activeChallenges.six_month_rewardAmountUSD.plus(challenge.entryFee)
      break;
    case ChallengeType.OneYear:
      activeChallenges.one_year_investorCounter = activeChallenges.one_year_investorCounter.plus(BigInt.fromI32(1))
      activeChallenges.one_year_rewardAmountUSD = activeChallenges.one_year_rewardAmountUSD.plus(challenge.entryFee)
      break;
    default:
      break;
  }  
  activeChallenges.save()
}

export function handleSwap(event: SwapEvent): void {
  let swap = new Swap(event.transaction.hash)
  swap.challengeId = event.params.challengeId
  swap.user = event.params.user
  swap.fromAsset = event.params.fromAsset
  swap.toAsset = event.params.toAsset
  swap.fromAmount = event.params.fromAmount
  swap.toAmount = event.params.toAmount
  swap.blockNumber = event.block.number
  swap.blockTimestamp = event.block.timestamp
  swap.transactionHash = event.transaction.hash
  swap.save()

  // Update Investor and create investorSnapshot
  let investor = Investor.load(event.params.challengeId.toString() + "-" + event.params.user.toHexString())
  if (investor == null) {
    log.debug('[SWAP] Investor not found, Investor : {}', [event.params.challengeId.toString() + "-" + event.params.user.toHexString()])
    return
  }
  investor.updatedAtTimestamp = event.block.timestamp
  // get tokens data from getUserPortfolio function
  let steleContract = SteleContract.bind(Address.fromBytes(Bytes.fromHexString(STELE_ADDRESS)))
  let tokenAddresses: Bytes[] = []
  let tokensAmount: BigDecimal[] = []
  let result = steleContract.getUserPortfolio(event.params.challengeId, event.params.user)
  tokenAddresses = result.value0.map<Bytes>(addr => Bytes.fromHexString(addr.toHexString()))
  tokensAmount = result.value1.map<BigDecimal>(amount => BigDecimal.fromString(amount.toString()))

  let ethPriceInUSD = getEthPriceInUSD()

  let tokensDeAmount: BigDecimal[] = []
  for (let i = 0; i < tokenAddresses.length; i++) {
    let token = tokenAddresses[i]
    let amount = tokensAmount[i]
    let deAmount = BigDecimal.fromString("0")
    const decimals = fetchTokenDecimals(token)
    if (decimals === null) {
      log.debug('[SWAP] Failed to get decimals for token: {}', [token.toHexString()])
      tokensDeAmount.push(BigDecimal.fromString("0"))
      continue
    }
    const tokenDecimal = exponentToBigDecimal(decimals)
    deAmount = amount.div(tokenDecimal)
    tokensDeAmount.push(deAmount) 
  }

  // get total tokens price in USD with sum of tokens
  let totalPriceUSD = BigDecimal.fromString("0")
  for (let i = 0; i < tokenAddresses.length; i++) {
    let token = tokenAddresses[i]
    let deAmount = tokensDeAmount[i]
    let tokenPriceETH = getTokenPriceETH(Address.fromBytes(token))
    if (tokenPriceETH === null) {
      log.debug('[SWAP] User {} in challenge {} Failed to get price ETH for token: {}', 
        [event.params.user.toHexString(), event.params.challengeId.toString(), token.toHexString()])
      continue
    }
    const amountETH = deAmount.times(tokenPriceETH)
    const amountUSD = amountETH.times(ethPriceInUSD)
    totalPriceUSD = totalPriceUSD.plus(amountUSD)
  }
  investor.tokens = tokenAddresses
  investor.tokensAmount = tokensDeAmount
  investor.currentUSD = totalPriceUSD
  investor.profitUSD = investor.currentUSD.minus(investor.seedMoneyUSD)
  investor.profitRatio = investor.profitUSD.div(investor.seedMoneyUSD)
  investor.save()

  investorSnapshot(event.params.challengeId, event.params.user, event)
}

export function handleRegister(event: RegisterEvent): void {
  let register = new Register(event.transaction.hash)
  register.challengeId = event.params.challengeId
  register.user = event.params.user
  register.performance = event.params.performance
  register.blockNumber = event.block.number
  register.blockTimestamp = event.block.timestamp
  register.transactionHash = event.transaction.hash
  register.save()
}

export function handleReward(event: RewardEvent): void {
  let reward = new Reward(event.transaction.hash)
  reward.challengeId = event.params.challengeId
  reward.user = event.params.user
  reward.rewardAmount = event.params.rewardAmount
  reward.blockNumber = event.block.number
  reward.blockTimestamp = event.block.timestamp
  reward.transactionHash = event.transaction.hash
  reward.save()

  let activeChallenges = ActiveChallenges.load(Bytes.fromHexString(STELE_ADDRESS))
  if (activeChallenges == null) {
    log.debug('[REWARD] ActiveChallenges not found, ChallengeId : {}', [event.params.challengeId.toString()])
    return
  }
  let challenge = Challenge.load(event.params.challengeId.toString())
  if (challenge == null) {
    log.debug('[REWARD] Challenge not found, ChallengeId : {}', [event.params.challengeId.toString()])
    return
  }
  switch (challenge.challengeType) {
    case ChallengeType.OneWeek:
      activeChallenges.one_week_isCompleted = true
      break;
    case ChallengeType.OneMonth:
      activeChallenges.one_month_isCompleted = true
      break;
    case ChallengeType.ThreeMonths:
      activeChallenges.three_month_isCompleted = true
      break;
    case ChallengeType.SixMonths:
      activeChallenges.six_month_isCompleted = true
      break;
    case ChallengeType.OneYear:
      activeChallenges.one_year_isCompleted = true
      break;
    default:
      break;
  }
  activeChallenges.save()
}
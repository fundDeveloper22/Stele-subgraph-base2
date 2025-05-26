import { BigInt, BigDecimal, Address } from '@graphprotocol/graph-ts'

// //mainnet
// export const WETH9 = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
// export const WBTC = '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599'
// export const USDC = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
// export const DAI = '0x6B175474E89094C44Da98b954EedeAC495271d0F'
// export const UNI = '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984'

// Challenge type definition
export enum ChallengeType { OneWeek, OneMonth, ThreeMonths, SixMonths, OneYear }
// Duration in seconds for each challenge type
export function getDuration(challengeType: ChallengeType): BigInt {
  if (challengeType == ChallengeType.OneWeek) return BigInt.fromI32(7 * 24 * 60 * 60);
  if (challengeType == ChallengeType.OneMonth) return BigInt.fromI32(30 * 24 * 60 * 60);
  if (challengeType == ChallengeType.ThreeMonths) return BigInt.fromI32(90 * 24 * 60 * 60);
  if (challengeType == ChallengeType.SixMonths) return BigInt.fromI32(180 * 24 * 60 * 60);
  if (challengeType == ChallengeType.OneYear) return BigInt.fromI32(365 * 24 * 60 * 60);
  return BigInt.fromI32(0);
}

// BASE Mainnet
export const STELE_ADDRESS = '0x0CbF0816CDFd0bC56eFC9a80Af88cC2210Ff5548'
export const UNISWAP_V3_FACTORY = '0x33128a8fC17869897dcE68Ed026d694621f6FDfD'
export const WETH = '0x4200000000000000000000000000000000000006'
export const USDC = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
export const cbBTC = '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf'


export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'
export const DECIMAL_18 = '1000000000000000000'
export const DECIMAL_6 = '1000000'

export const UNKNWON = 'Unknown'

export const TYPE_NORMAL = 0
export const TYPE_DEPOSIT = 1
export const TYPE_WITHDRAW = 2

export let ZERO_BI = BigInt.fromI32(0)
export let ONE_BI = BigInt.fromI32(1)
export let ZERO_BD = BigDecimal.fromString('0')
export let ONE_BD = BigDecimal.fromString('1')
export let BI_18 = BigInt.fromI32(18)

export const WETH_DECIMAL = BigDecimal.fromString(DECIMAL_18)
export const USDC_DECIMAL = BigDecimal.fromString(DECIMAL_6)

// export let settingContract = SteleContract.bind(Address.fromString(STELE_ADDRESS))

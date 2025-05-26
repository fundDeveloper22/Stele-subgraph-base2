import { BigDecimal, Address, Bytes, BigInt, log } from '@graphprotocol/graph-ts'

export function getInvestorID(challengeID: BigInt, investor: Address): string {
  const investorID = challengeID.toString() + '-' + investor.toHexString().toUpperCase()
  return investorID
}
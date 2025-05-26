import { BigInt, Address } from '@graphprotocol/graph-ts'
import { ERC20 } from '../../generated/Stele/ERC20'
import { UNKNWON } from './constants'

export function fetchTokenSymbol(tokenAddress: Address): string {
    let contract = ERC20.bind(tokenAddress)
  
    // try types string and bytes32 for symbol
    let symbolValue = UNKNWON
    let symbolResult = contract.try_symbol()
    if (symbolResult.reverted) {

    } else {
      symbolValue = symbolResult.value
    }
    return symbolValue
  }
  
  export function fetchTokenDecimals(tokenAddress: Address): BigInt {
    let contract = ERC20.bind(tokenAddress)
    // try types uint8 for decimals
    let decimalValue = 0
    let decimalResult = contract.try_decimals()
    if (decimalResult.reverted) {

    } else {
        decimalValue = decimalResult.value
    }
    return BigInt.fromI32(decimalValue as i32)
  }
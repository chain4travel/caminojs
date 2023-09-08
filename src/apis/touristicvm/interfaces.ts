import { Buffer } from "buffer/"
import { OutputOwners } from "caminojs/common"
import { TransferableInput } from "./inputs"
import { TransferableOutput } from "./outputs"
import { UTXOSet } from "./utxos"
import { BalanceDict, UTXOID } from "caminojs/apis/platformvm"

export interface StartIndexInterface {
  address: string
  utxo: string
}
export interface GetUTXOsParams {
  addresses: string[] | string
  limit: number
  sourceChain?: string
  startIndex?: StartIndexInterface
  encoding?: string
}

export interface EndIndex {
  address: string
  utxo: string
}

export interface GetUTXOsResponse {
  numFetched: number
  utxos: UTXOSet
  endIndex: EndIndex
}
export interface SpendParams {
  from: string[] | string
  signer: string[] | string
  to?: OwnerParam
  change?: OwnerParam
  lockMode: 0 | 1
  amountToLock: string
  amountToUnlock: string
  amountToBurn: string
  asOf: string
  encoding?: string
}

export interface SpendReply {
  ins: TransferableInput[]
  out: TransferableOutput[]
  owners: OutputOwners[]
}
export interface OwnerParam {
  locktime: string
  threshold: number
  addresses: string[]
}

export type FromSigner = {
  from: Buffer[]
  signer: Buffer[]
}

export interface GetBalanceResponse {
  balances: BalanceDict
  unlockedOutputs: BalanceDict
  lockedOutputs: BalanceDict
  utxoIDs: UTXOID[]
}

export interface Cheque {
  issuer: string
  beneficiary: string
  amount: number
  signature: string
}

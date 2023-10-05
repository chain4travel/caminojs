import { Buffer } from "buffer/"
import { OutputOwners } from "../../common"
import { TransferableInput } from "./inputs"
import { TransferableOutput } from "./outputs"
import { UTXOSet } from "./utxos"
import { BalanceDict, UTXOID } from "../platformvm"
import BN from "bn.js"

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
  agent?: string
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

export interface ChequeParams {
  issuer: string
  beneficiary: string
  amount: string
  serialID: string
  agent?: string
  unnormalizedAgent?: string
  signature: string
}
export interface IssueChequeResponse extends ChequeParams {
  msgToSign: string
}

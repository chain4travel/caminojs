import { Buffer } from "buffer/"
import { OutputOwners } from "caminojs/common"
import { TransferableInput } from "caminojs/apis/touristicvm/inputs"
import { TransferableOutput } from "caminojs/apis/touristicvm/outputs"
import { UTXOSet } from "caminojs/apis/touristicvm/utxos"

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

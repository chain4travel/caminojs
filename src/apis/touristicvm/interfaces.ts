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

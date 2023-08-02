import { Avalanche, BN, Buffer } from "caminojs/index"
import { TouristicVMAPI } from "caminojs/apis/touristicvm/api"
import {
  PrivateKeyPrefix,
  DefaultLocalGenesisPrivateKey,
  UnixNow,
  DefaultLocalGenesisPrivateKey2
} from "caminojs/utils"
import { GetUTXOsResponse } from "caminojs/apis/touristicvm/interfaces"
import { Tx, UnsignedTx, UTXOSet } from "caminojs/apis/touristicvm"

const avalanche: Avalanche = new Avalanche("localhost", 9650, "http", 1002)

const asOf: BN = UnixNow()
const privKey: string = `${PrivateKeyPrefix}${DefaultLocalGenesisPrivateKey2}`
const threshold: number = 1
const locktime: BN = new BN(0)
const memo: Buffer = Buffer.from("TVM utility method buildImportTx")

let avaxAssetID: string = undefined
let tchain: TouristicVMAPI
let tkeyChain: any
let tAddresses: Buffer[]
let tAddressStrings: string[]
let pChainBlockchainID: string

const InitAvalanche = async () => {
  await avalanche.fetchNetworkSettings()
  tchain = avalanche.TChain()
  tkeyChain = tchain.keyChain()
  tkeyChain.importKey(privKey)
  tAddresses = tchain.keyChain().getAddresses()
  tAddressStrings = tchain.keyChain().getAddressStrings()
  avaxAssetID = avalanche.getNetwork().X.avaxAssetID
  pChainBlockchainID = avalanche.getNetwork().P.blockchainID
}

const main = async (): Promise<any> => {
  await InitAvalanche()

  const tvmUTXOResponse: GetUTXOsResponse = await tchain.getUTXOs([
    "T-kopernikus1g65uqn6t77p656w64023nh8nd9updzmxh8ttv3"
  ])
  const utxoSet: UTXOSet = tvmUTXOResponse.utxos

  const unsignedTx: UnsignedTx = await tchain.buildImportTx(
    utxoSet,
    tAddressStrings,
    pChainBlockchainID,
    tAddressStrings,
    tAddressStrings,
    tAddressStrings,
    memo,
    asOf,
    locktime,
    threshold
  )
  const tx: Tx = unsignedTx.sign(tkeyChain)
  // console.log(tx.toBuffer().toString("hex"))
  const txid: string = await tchain.issueTx(tx)
  console.log(`Success! TXID: ${txid}`)
}

main()

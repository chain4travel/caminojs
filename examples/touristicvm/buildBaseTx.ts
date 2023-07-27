import { Avalanche, BinTools, BN, Buffer } from "caminojs/index"
import { UnixNow } from "caminojs/utils"
import { ExamplesConfig } from "../common/examplesConfig"
import { TouristicVMAPI } from "caminojs/apis/touristicvm/api"
import { Tx, UnsignedTx, UTXOSet } from "caminojs/apis/touristicvm"
import { GetUTXOsResponse } from "caminojs/apis/touristicvm/interfaces"

const config: ExamplesConfig = require("../common/examplesConfig.json")
const avalanche: Avalanche = new Avalanche("localhost", 9650, "http", 1002)
const bintools: BinTools = BinTools.getInstance()
const privKey: string =
  "PrivateKey-vmRQiZeXEXYMyJhEiqdC2z5JhuDbxL8ix9UVvjgMu2Er1NepE"
const asOf: BN = UnixNow()
const threshold: number = 1
const locktime: BN = new BN(0)
const memo: Buffer = Buffer.from(
  "AVM utility method buildBaseTx to send an ANT"
)

let avaxAssetID: string = undefined
let tchain: TouristicVMAPI
let tkeyChain: any
let tAddresses: Buffer[]
let tAddressStrings: string[]

const InitAvalanche = async () => {
  await avalanche.fetchNetworkSettings()
  tchain = avalanche.TChain()
  tkeyChain = tchain.keyChain()
  tkeyChain.importKey(privKey)
  tAddresses = tchain.keyChain().getAddresses()
  tAddressStrings = tchain.keyChain().getAddressStrings()
  avaxAssetID = avalanche.getNetwork().X.avaxAssetID
}

const main = async (): Promise<any> => {
  await InitAvalanche()
  const amount: BN = new BN(1)
  console.log(avalanche.getNetwork())
  console.log(tAddressStrings)

  const tvmUTXOResponse: GetUTXOsResponse = await tchain.getUTXOs([
    "T-kopernikus1g65uqn6t77p656w64023nh8nd9updzmxh8ttv3"
  ])
  const utxoSet: UTXOSet = tvmUTXOResponse.utxos

  const unsignedTx: UnsignedTx = await tchain.buildBaseTx(
    utxoSet,
    amount,
    avaxAssetID,
    ["T-kopernikus18jma8ppw3nhx5r4ap8clazz0dps7rv5uuvjh68"],
    ["T-kopernikus1g65uqn6t77p656w64023nh8nd9updzmxh8ttv3"], //TODO check again
    ["T-kopernikus1g65uqn6t77p656w64023nh8nd9updzmxh8ttv3"],
    memo,
    asOf,
    locktime,
    threshold
  )
  console.log(JSON.stringify(unsignedTx))

  const tx: Tx = unsignedTx.sign(tkeyChain)
  // console.log(tx.toBuffer().toString("hex"))
  const txid: string = await tchain.issueTx(tx)
  console.log(`Success! TXID: ${txid}`)
}

main()

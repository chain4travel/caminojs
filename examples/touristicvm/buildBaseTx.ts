import { Avalanche, BN, Buffer } from "caminojs/index"
import { ONEAVAX, UnixNow } from "caminojs/utils"
import { ExamplesConfig } from "../common/examplesConfig"
import { TouristicVMAPI } from "caminojs/apis/touristicvm/api"
import { Tx, UnsignedTx } from "caminojs/apis/touristicvm"

const config: ExamplesConfig = require("../common/examplesConfig.json")
const avalanche: Avalanche = new Avalanche("localhost", 9650, "http", 1002)
const privKey: string =
  "PrivateKey-vmRQiZeXEXYMyJhEiqdC2z5JhuDbxL8ix9UVvjgMu2Er1NepE"
const asOf: BN = UnixNow()
const threshold: number = 1
const locktime: BN = new BN(0)
const memo: Buffer = Buffer.from(
  "TVM utility method buildBaseTx to send an ANT"
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
  const amount: BN = new BN(ONEAVAX)

  const unsignedTx: UnsignedTx = await tchain.buildBaseTx(
    amount,
    ["T-kopernikus14a2jhd78jptyhna6qc0mdaglzsyt7d5rs0vkum"],
    ["T-kopernikus1g65uqn6t77p656w64023nh8nd9updzmxh8ttv3"],
    ["T-kopernikus1g65uqn6t77p656w64023nh8nd9updzmxh8ttv3"],
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

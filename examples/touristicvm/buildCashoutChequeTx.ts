import { Avalanche, BN, Buffer } from "caminojs/index"
import { UnixNow } from "caminojs/utils"
import { TouristicVMAPI } from "caminojs/apis/touristicvm/api"
import { Tx, UnsignedTx } from "caminojs/apis/touristicvm"
import { Cheque } from "caminojs/apis/touristicvm/interfaces"

const avalanche: Avalanche = new Avalanche("localhost", 9650, "http", 1002)
const privKey: string =
  "PrivateKey-vmRQiZeXEXYMyJhEiqdC2z5JhuDbxL8ix9UVvjgMu2Er1NepE"
const asOf: BN = UnixNow()
const threshold: number = 1
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
  const issuer = "T-kopernikus1g65uqn6t77p656w64023nh8nd9updzmxh8ttv3"
  const beneficiary = "T-kopernikus18jma8ppw3nhx5r4ap8clazz0dps7rv5uuvjh68"
  const amount = 10000
  const serialID = 1
  const cheque: Cheque = tchain.issueCheque(
    issuer,
    beneficiary,
    amount,
    serialID
  )
  const unsignedTx: UnsignedTx = await tchain.buildCashoutChequeTx(
    [issuer],
    [issuer],
    memo,
    asOf,
    cheque,
    threshold
  )

  const tx: Tx = unsignedTx.sign(tkeyChain)
  const txid: string = await tchain.issueTx(tx)
  console.log(`Success! TXID: ${txid}`)
}

main()

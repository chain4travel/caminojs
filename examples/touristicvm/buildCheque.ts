import Avalanche, { BN } from "caminojs/index"
import { TouristicVMAPI } from "caminojs/apis/touristicvm"
import { ChequeParams } from "caminojs/apis/touristicvm/interfaces"

const { v4: uuid } = require("uuid")
const avalanche: Avalanche = new Avalanche("localhost", 9650, "http", 1002)
const privateKeyOfIssuer =
  "PrivateKey-vmRQiZeXEXYMyJhEiqdC2z5JhuDbxL8ix9UVvjgMu2Er1NepE"

let tchain: TouristicVMAPI
let tkeyChain: any

const InitAvalanche = async () => {
  await avalanche.fetchNetworkSettings()
  tchain = avalanche.TChain()
  tkeyChain = tchain.keyChain()
  tkeyChain.importKey(privateKeyOfIssuer)
}
const main = async (): Promise<any> => {
  await InitAvalanche()
  const agent = uuid()
  const cheque: ChequeParams = await tchain.issueCheque(
    "T-kopernikus1g65uqn6t77p656w64023nh8nd9updzmxh8ttv3",
    "T-kopernikus18jma8ppw3nhx5r4ap8clazz0dps7rv5uuvjh68",
    "10000",
    "1",
    agent
  )

  console.log(`Cheque: ${JSON.stringify(cheque)}`)

  // validate cheque
  const isValid = await tchain.validateCheque(cheque)
  console.log(`Cheque is valid: ${isValid}`)
}

main()

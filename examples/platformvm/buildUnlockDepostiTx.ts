import {
  UnlockDepositTx,
  KeyChain,
  PlatformVMAPI,
  UnsignedTx
} from "caminojs/apis/platformvm"

import { Avalanche, BinTools, Buffer } from "caminojs/index"
import { DefaultLocalGenesisPrivateKey, PrivateKeyPrefix } from "caminojs/utils"
import { ExamplesConfig } from "../common/examplesConfig"
import BN from "bn.js"

const config: ExamplesConfig = require("../common/examplesConfig.json")
const avalanche: Avalanche = new Avalanche(
  config.host,
  config.port,
  config.protocol,
  config.networkID
)

let privKey: string = `${PrivateKeyPrefix}${DefaultLocalGenesisPrivateKey}`

let pchain: PlatformVMAPI
let pKeychain: KeyChain
let pAddressStrings: string[]

const InitAvalanche = async () => {
  await avalanche.fetchNetworkSettings()
  pchain = avalanche.PChain()
  pKeychain = pchain.keyChain()
  pKeychain.importKey(privKey)

  pAddressStrings = pchain.keyChain().getAddressStrings()
}

const main = async (): Promise<any> => {
  await InitAvalanche()
  const depositTxID: string = "..." // TODO: should caminojs find it instead?
  const unlockDepositTx: UnlockDepositTx = new UnlockDepositTx()

  const platformVMUTXOResponse = await pchain.getUTXOs(pAddressStrings)

  try {
    // TODO: Add an example
    // let unsignedTx = await pchain.buildUnlockDepositTx()
    // const tx = unsignedTx.sign(pKeychain)
    // let txid = await pchain.issueTx(tx)
    // console.log(txid)
  } catch (e) {
    console.log(e)
  }
}

main()

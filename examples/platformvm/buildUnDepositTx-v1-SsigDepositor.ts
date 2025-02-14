import { Avalanche, Buffer } from "caminojs/index"
import {
  PlatformVMAPI,
  KeyChain,
  UnsignedTx,
  Tx,
  UTXOSet,
  GetUTXOsResponse
} from "caminojs/apis/platformvm"
import { ExamplesConfig } from "../common/examplesConfig"
import BN from "bn.js"


//const config: ExamplesConfig = require("../common/examplesConfig.json")
const avalanche: Avalanche = new Avalanche(
  "kopernikus.camino.network",
  443,
  "https",
  1002
)


const privKey: string = "PrivateKey-XXXX"
let pchain: PlatformVMAPI
let pKeychain: KeyChain
let pAddresses: Buffer[]
let pAddressStrings: string[]

const InitAvalanche = async () => {
  await avalanche.fetchNetworkSettings()
  pchain = avalanche.PChain()
  pKeychain = pchain.keyChain()
  pKeychain.importKey(privKey) // P-kopernikus18jma8ppw3nhx5r4ap8clazz0dps7rv5uuvjh68
  pAddresses = pchain.keyChain().getAddresses()
  pAddressStrings = pchain.keyChain().getAddressStrings()
}

const main = async (): Promise<any> => {
  await InitAvalanche()
  const amount_cam = 0.3
  const amountToUnLock = new BN(amount_cam * 1000000000)
  const memo: Buffer = Buffer.from("unDepositTx with singlesig deposit ")

  let utxoStrings: string[] = [""]
  let platformvmUTXOResponse: GetUTXOsResponse
  let utxoSet: UTXOSet
  // utxoset takes time to be updated. here we check if the utxoset is the same like the previous one
  // we put a slight delay of 100 ms
  while (true) {
    platformvmUTXOResponse = await pchain.getUTXOs(pAddressStrings)
    utxoSet = platformvmUTXOResponse.utxos

    if (
      utxoSet.getAllUTXOStrings().sort().toString() !=
      utxoStrings.sort().toString()
    ) {
      utxoStrings = utxoSet.getAllUTXOStrings()
      break
    }
    delay(100)
  }

  utxoStrings = utxoSet.getAllUTXOStrings()

  // This gets all deposit transaction IDs. Specify certain (1) deposit transaction IDs
  const depositTxIDs: string[] = utxoSet.getLockedTxIDs().depositIDs
  const unsignedTx: UnsignedTx = await pchain.buildUnlockDepositTx(
    utxoSet,
    pAddressStrings,
    pAddressStrings,
    memo,
    new BN(0),
    amountToUnLock,
    depositTxIDs
  )

  const tx: Tx = unsignedTx.sign(pKeychain)
  const txid: string = await pchain.issueTx(tx)
  console.log(`Success! TXID: ${txid}`)
  console.log(`Success! TX: ${tx}`)
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

main()

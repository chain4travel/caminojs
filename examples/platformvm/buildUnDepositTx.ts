import { Avalanche, Buffer } from "caminojs/index"
import {
  PlatformVMAPI,
  KeyChain,
  UnlockDepositTx
} from "caminojs/apis/platformvm"
import {
  DefaultLocalGenesisPrivateKey2,
  PrivateKeyPrefix
} from "caminojs/utils"
import BN from "bn.js"
import config from "../common/examplesConfig.json"

const avalanche: Avalanche = new Avalanche(
  config.host,
  config.port,
  config.protocol,
  config.networkID
)

const privKey: string = `${PrivateKeyPrefix}${DefaultLocalGenesisPrivateKey2}`

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
  const platformvmUTXOResponse = await pchain.getUTXOs(pAddressStrings)

  // You can specify certain (1) deposit transaction IDs.
  // This example gets ALL deposit transaction IDs.
  const undeposits = [
    {
      amount: 100_000_000_000,
      depositTxID: "fGxf9SVv7mBmeENu58njFSCFWRHPLXhu6qxvj4S3Tj7qiFTKY"
    }
  ]

  const unsignedTx = await pchain.buildUnlockDepositTx(
    platformvmUTXOResponse.utxos,
    pAddressStrings, // from addresses
    Buffer.from("unDepositTx with single-sig deposit "), // memo
    undeposits
  )

  const tx = unsignedTx.sign(pKeychain)
  const hex = tx.toStringHex().slice(2)

  const unlockDepositTx = unsignedTx.getTransaction() as UnlockDepositTx
  const unlockDepositTxTypeName: string = unlockDepositTx.getTypeName()
  const unlockDepositTxTypeID: number = unlockDepositTx.getTypeID()

  console.log(`Tx type: ${unlockDepositTxTypeID} ${unlockDepositTxTypeName}`)
  console.log("Tx bytes:", hex)

  const txID = await pchain.issueTx(tx)
  console.log(`Issued tx: ${txID}`)

  const txStatus = await pchain.awaitTx(txID)
  console.log("Tx status:", txStatus)
}

main()

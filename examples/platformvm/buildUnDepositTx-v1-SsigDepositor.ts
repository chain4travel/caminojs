import { Avalanche, Buffer } from "caminojs/index"
import {
  PlatformVMAPI,
  KeyChain,
  UnsignedTx,
  Tx,
} from "caminojs/apis/platformvm"
import { DefaultLocalGenesisPrivateKey, PrivateKeyPrefix } from "caminojs/utils"
import BN from "bn.js"
import config from "../common/examplesConfig.json"

const avalanche: Avalanche = new Avalanche(
  config.host,
  config.port,
  config.protocol,
  config.networkID
)

const privKey: string = `${PrivateKeyPrefix}${DefaultLocalGenesisPrivateKey}`
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
  const memo: Buffer = Buffer.from("unDepositTx with single-sig deposit ")
  const platformvmUTXOResponse = await pchain.getUTXOs(pAddressStrings)

  // You can specify certain (1) deposit transaction IDs.
  // This example gets ALL deposit transaction IDs.
  const depositTxIDs: string[] = platformvmUTXOResponse.utxos.getLockedTxIDs().depositIDs

  const unsignedTx: UnsignedTx = await pchain.buildUnlockDepositTx(
    platformvmUTXOResponse.utxos,
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

main()

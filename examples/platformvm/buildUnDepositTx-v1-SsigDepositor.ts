import { Avalanche, BinTools, Buffer } from "caminojs/index"
import {
  PlatformVMAPI,
  KeyChain,
  UnsignedTx,
  Tx,
  UTXOSet,
  GetUTXOsResponse
} from "caminojs/apis/platformvm"
import { OutputOwners } from "caminojs/common/output"
import { PrivateKeyPrefix, DefaultLocalGenesisPrivateKey } from "caminojs/utils"
import { ExamplesConfig } from "../common/examplesConfig"
import BN from "bn.js"
import createHash from "create-hash"
import { SignerKeyPair } from "caminojs/common"

//const config: ExamplesConfig = require("../common/examplesConfig.json")
const avalanche: Avalanche = new Avalanche(
  "kopernikus.camino.network",
  443,
  "https",
  1002
)
const ownerPrivKey: string =
  "PrivateKey-XXXX"

const bintools: BinTools = BinTools.getInstance()
const privKey: string = "PrivateKey-XXX"
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
  const depositOwner = "P-kopernikus1d0ydd4wyq670lzrp0y7xd3wej4z7ysp2surum8"
  const amount_cam = 0.3
  const amountToUnLock = new BN(amount_cam*1000000000)
  const depositOfferID = "BKLeCFQtxR9HKjBE3QbZtqjdWpWc59B2JwVf8pC37vneiEvJY"
  const depositDuration = 10 * 24 * 3600
  const depositTxID = "xP7nExUDq4STJodLE5sznnpprKEWrhmEKwTjFgLZJdmSN3jrV"
  const memo: Buffer = Buffer.from(
    "unDepositTx with singlesig deposit "
  )

  const depositCreator = pAddresses[0]
  const rewardsOwner = new OutputOwners([depositCreator], undefined, 1)
  const depositCreatorAuth: [number, string | Buffer][] = [[0, depositCreator]]

  const depositOfferOwnerAuth: [number, string | Buffer][] = [[0, depositOwner]]

  // hash concatenated bytes of offer id and deposit owner address
  const msgHashed: Buffer = Buffer.from(
    createHash("sha256")
      .update(
        Buffer.concat([bintools.cb58Decode(depositOfferID), depositCreator])
      )
      .digest()
  )

  const keypair: SignerKeyPair = pKeychain.importKey(ownerPrivKey)
  // sign the hash
  const signatureBuffer: Buffer = keypair.sign(msgHashed)

  let utxoStrings:  string[] = [""]       
  let platformvmUTXOResponse: GetUTXOsResponse
  let utxoSet: UTXOSet
  // utxoset takes time to be updated. here we check if the utxoset is the same like the previous one
  // we put a slight delay of 100 ms
  while (true) {
    platformvmUTXOResponse = await pchain.getUTXOs(pAddressStrings)
    utxoSet = platformvmUTXOResponse.utxos
    
    if (utxoSet.getAllUTXOStrings().sort().toString() != utxoStrings.sort().toString()){
      utxoStrings = utxoSet.getAllUTXOStrings()
      break
    }
    delay(100)
  }
  let utxo = utxoSet.getUTXO("2DWBL7TXUfSKnGRzX8CbHVDCUJY9HMAYsiYBGwzv3NmuHrnhMo")
  let utxoSet2: UTXOSet = new UTXOSet()
  utxoSet2.add(utxo)

  utxoStrings = utxoSet.getAllUTXOStrings()
  console.log(`UTXos: ${utxoStrings}`)

  const unsignedTx: UnsignedTx = await pchain.buildUnlockDepositTx(
    utxoSet,
    pAddressStrings,
    pAddressStrings,
    memo,
    new BN(0),
    amountToUnLock,
  )

  const tx: Tx = unsignedTx.sign(pKeychain)
  const txid: string = await pchain.issueTx(tx)
  console.log(`Success! TXID: ${txid}`)
}

function delay(ms: number) {
  return new Promise( resolve => setTimeout(resolve, ms) );
}

main()

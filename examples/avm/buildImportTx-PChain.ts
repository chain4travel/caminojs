import { Avalanche, BN, Buffer } from "@c4tplatform/caminojs/dist"
import {
  AVMAPI,
  KeyChain,
  UTXOSet,
  UnsignedTx,
  Tx
} from "@c4tplatform/caminojs/dist/apis/avm"
import { GetUTXOsResponse } from "@c4tplatform/caminojs/dist/apis/avm/interfaces"
import {
  PrivateKeyPrefix,
  DefaultLocalGenesisPrivateKey,
  UnixNow
} from "@c4tplatform/caminojs/dist/utils"
import { ExamplesConfig } from "../common/examplesConfig"

const config: ExamplesConfig = require("../common/examplesConfig.json")
const avalanche: Avalanche = new Avalanche(
  config.host,
  config.port,
  config.protocol,
  config.networkID
)
const privKey: string = `${PrivateKeyPrefix}${DefaultLocalGenesisPrivateKey}`
const threshold: number = 1
const locktime: BN = new BN(0)
const asOf: BN = UnixNow()
const memo: Buffer = Buffer.from(
  "AVM utility method buildImportTx to import AVAX to the X-Chain from the P-Chain"
)

let xchain: AVMAPI
let xKeychain: KeyChain
let xAddressStrings: string[]
let avaxAssetID: string
let fee: BN
let pChainBlockchainID: string

const InitAvalanche = async () => {
  await avalanche.fetchNetworkSettings()
  xchain = avalanche.XChain()
  xKeychain = xchain.keyChain()
  xKeychain.importKey(privKey)
  xAddressStrings = xchain.keyChain().getAddressStrings()
  avaxAssetID = avalanche.getNetwork().X.avaxAssetID
  fee = xchain.getDefaultTxFee()
  pChainBlockchainID = avalanche.getNetwork().P.blockchainID
}

const main = async (): Promise<any> => {
  await InitAvalanche()

  const avmUTXOResponse: GetUTXOsResponse = await xchain.getUTXOs(
    xAddressStrings,
    pChainBlockchainID
  )
  const utxoSet: UTXOSet = avmUTXOResponse.utxos

  const unsignedTx: UnsignedTx = await xchain.buildImportTx(
    utxoSet,
    xAddressStrings,
    pChainBlockchainID,
    xAddressStrings,
    xAddressStrings,
    xAddressStrings,
    memo,
    asOf,
    locktime,
    threshold
  )
  const tx: Tx = unsignedTx.sign(xKeychain)
  const txid: string = await xchain.issueTx(tx)
  console.log(`Success! TXID: ${txid}`)
}

main()

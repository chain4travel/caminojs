import { Avalanche, BinTools, BN, Buffer } from "caminojs/index"
import {
  AVMAPI,
  KeyChain,
  UTXOSet,
  UnsignedTx,
  Tx,
  AVMConstants,
  UTXO
} from "caminojs/apis/avm"
import { GetUTXOsResponse } from "caminojs/apis/avm/interfaces"
import {
  PrivateKeyPrefix,
  DefaultLocalGenesisPrivateKey,
  UnixNow
} from "caminojs/utils"
import { ExamplesConfig } from "../common/examplesConfig"

const getUTXOIDs = (
  utxoSet: UTXOSet,
  txid: string,
  outputType: number = AVMConstants.SECPXFEROUTPUTID_CODECONE,
  assetID = "2fombhL7aGPwj3KH4bfrmJwW6PVnMobf9Y2fn9GwxiAAJyFDbe"
): string[] => {
  const utxoids: string[] = utxoSet.getUTXOIDs()
  let result: string[] = []
  for (let index: number = 0; index < utxoids.length; ++index) {
    if (
      utxoids[index].indexOf(txid.slice(0, 10)) != -1 &&
      utxoSet.getUTXO(utxoids[index]).getOutput().getOutputID() == outputType &&
      assetID ==
        bintools.cb58Encode(utxoSet.getUTXO(utxoids[index]).getAssetID())
    ) {
      result.push(utxoids[index])
    }
  }
  return result
}

const config: ExamplesConfig = require("../common/examplesConfig.json")
const avalanche: Avalanche = new Avalanche(
  config.host,
  config.port,
  config.protocol,
  config.networkID
)
const privKey: string = `${PrivateKeyPrefix}${DefaultLocalGenesisPrivateKey}`
const bintools: BinTools = BinTools.getInstance()
const threshold: number = 1
const locktime: BN = new BN(0)
const memo: Buffer = Buffer.from(
  "AVM utility method buildNFTTransferTx to transfer an ANT"
)
const asOf: BN = UnixNow()

let xchain: AVMAPI
let xKeychain: KeyChain
let xAddressStrings: string[]

const InitAvalanche = async () => {
  await avalanche.fetchNetworkSettings()
  xchain = avalanche.XChain()
  xKeychain = xchain.keyChain()
  xKeychain.importKey(privKey)
  xAddressStrings = xchain.keyChain().getAddressStrings()
}

const main = async (): Promise<any> => {
  await InitAvalanche()

  const avmUTXOResponse: GetUTXOsResponse = await xchain.getUTXOs(
    xAddressStrings
  )
  const utxoSet: UTXOSet = avmUTXOResponse.utxos
  const utxos: UTXO[] = utxoSet.getAllUTXOs()
  let txid: Buffer = Buffer.from("")
  let assetID: Buffer = Buffer.from("")
  utxos.forEach((utxo: UTXO) => {
    if (utxo.getOutput().getTypeID() === 11) {
      txid = utxo.getTxID()
      assetID = utxo.getAssetID()
    }
  })
  const nftTransferOutputUTXOIDs: string[] = getUTXOIDs(
    utxoSet,
    bintools.cb58Encode(txid),
    AVMConstants.NFTXFEROUTPUTID,
    bintools.cb58Encode(assetID)
  )
  const nftTransferOutputUTXOID: string = nftTransferOutputUTXOIDs[0]

  const unsignedTx: UnsignedTx = await xchain.buildNFTTransferTx(
    utxoSet,
    xAddressStrings,
    xAddressStrings,
    xAddressStrings,
    nftTransferOutputUTXOID,
    memo,
    asOf,
    locktime,
    threshold
  )

  const tx: Tx = unsignedTx.sign(xKeychain)
  const id: string = await xchain.issueTx(tx)
  console.log(`Success! TXID: ${id}`)
}

main()

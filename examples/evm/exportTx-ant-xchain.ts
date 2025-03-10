import { Avalanche, BinTools, BN, Buffer } from "caminojs/index"
import { AVMAPI, KeyChain as AVMKeyChain } from "caminojs/apis/avm"
import {
  EVMAPI,
  KeyChain as EVMKeyChain,
  UnsignedTx,
  Tx,
  EVMInput,
  ExportTx,
  SECPTransferOutput,
  TransferableOutput
} from "caminojs/apis/evm"
import { RequestResponseData } from "caminojs/common"
import { PrivateKeyPrefix, DefaultLocalGenesisPrivateKey } from "caminojs/utils"
import { ExamplesConfig } from "../common/examplesConfig"

const config: ExamplesConfig = require("../common/examplesConfig.json")
const avalanche: Avalanche = new Avalanche(
  config.host,
  config.port,
  config.protocol,
  config.networkID
)
const bintools: BinTools = BinTools.getInstance()
const privKey: string = `${PrivateKeyPrefix}${DefaultLocalGenesisPrivateKey}`
const cHexAddress: string = "0x8db97C7cEcE249c2b98bDC0226Cc4C2A57BF52FC"
const evmInputs: EVMInput[] = []
let exportedOuts: TransferableOutput[] = []
const Web3 = require("web3")
const path: string = "/ext/bc/C/rpc"
const web3 = new Web3(
  `${config.protocol}://${config.host}:${config.port}${path}`
)
const threshold: number = 1

let xchain: AVMAPI
let cchain: EVMAPI
let xKeychain: AVMKeyChain
let cKeychain: EVMKeyChain
let xAddresses: Buffer[]
let cAddresses: Buffer[]
let xChainBlockchainIdStr: string
let xChainBlockchainIdBuf: Buffer
let cChainBlockchainIdStr: string
let cChainBlockchainIdBuf: Buffer
let avaxAssetID: string
let avaxAssetIDBuf: Buffer

const InitAvalanche = async () => {
  await avalanche.fetchNetworkSettings()
  xchain = avalanche.XChain()
  cchain = avalanche.CChain()
  xKeychain = xchain.keyChain()
  cKeychain = cchain.keyChain()
  xKeychain.importKey(privKey)
  cKeychain.importKey(privKey)
  xAddresses = xchain.keyChain().getAddresses()
  cAddresses = cchain.keyChain().getAddresses()
  xChainBlockchainIdStr = avalanche.getNetwork().X.blockchainID
  xChainBlockchainIdBuf = bintools.cb58Decode(xChainBlockchainIdStr)
  cChainBlockchainIdStr = avalanche.getNetwork().C.blockchainID
  cChainBlockchainIdBuf = bintools.cb58Decode(cChainBlockchainIdStr)
  avaxAssetID = avalanche.getNetwork().X.avaxAssetID
  avaxAssetIDBuf = bintools.cb58Decode(avaxAssetID)
}

const main = async (): Promise<any> => {
  await InitAvalanche()

  const antAssetIDStr: string =
    "verma4Pa9biWKbjDGNsTXU47cYCyDSNGSU1iBkxucfVSFVXdv"
  const antAssetIDBuf: Buffer = bintools.cb58Decode(antAssetIDStr)
  const antAssetBalanceResponse: RequestResponseData = await cchain.callMethod(
    "eth_getAssetBalance",
    [cHexAddress, "latest", antAssetIDStr],
    "ext/bc/C/rpc"
  )
  const antAssetBalance: number = parseInt(
    antAssetBalanceResponse.data.result,
    16
  )
  let avaxBalance: BN = await web3.eth.getBalance(cHexAddress)
  avaxBalance = new BN(avaxBalance.toString().substring(0, 17))
  const fee: BN = cchain.getDefaultTxFee()
  const txcount = await web3.eth.getTransactionCount(cHexAddress)
  const nonce: number = txcount
  const locktime: BN = new BN(0)

  let evmInput: EVMInput = new EVMInput(
    cHexAddress,
    avaxBalance,
    avaxAssetID,
    nonce
  )
  evmInput.addSignatureIdx(0, cAddresses[0])
  evmInputs.push(evmInput)

  evmInput = new EVMInput(cHexAddress, antAssetBalance, antAssetIDStr, nonce)
  evmInput.addSignatureIdx(0, cAddresses[0])
  evmInputs.push(evmInput)

  let secpTransferOutput: SECPTransferOutput = new SECPTransferOutput(
    avaxBalance.sub(fee),
    xAddresses,
    locktime,
    threshold
  )
  let transferableOutput: TransferableOutput = new TransferableOutput(
    avaxAssetIDBuf,
    secpTransferOutput
  )
  exportedOuts.push(transferableOutput)

  secpTransferOutput = new SECPTransferOutput(
    new BN(antAssetBalance),
    xAddresses,
    locktime,
    threshold
  )
  transferableOutput = new TransferableOutput(antAssetIDBuf, secpTransferOutput)
  exportedOuts.push(transferableOutput)
  exportedOuts = exportedOuts.sort(TransferableOutput.comparator())

  const exportTx: ExportTx = new ExportTx(
    config.networkID,
    cChainBlockchainIdBuf,
    xChainBlockchainIdBuf,
    evmInputs,
    exportedOuts
  )

  const unsignedTx: UnsignedTx = new UnsignedTx(exportTx)
  const tx: Tx = unsignedTx.sign(cKeychain)
  const txid: string = await cchain.issueTx(tx)
  console.log(`Success! TXID: ${txid}`)
}

main()

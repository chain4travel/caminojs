import { Avalanche, BinTools, BN, Buffer } from "caminojs/index"
import {
  AVMAPI,
  SECPTransferOutput,
  SECPTransferInput,
  TransferableOutput,
  TransferableInput,
  UTXOSet,
  UTXO,
  AmountOutput,
  UnsignedTx,
  AVMConstants,
  OperationTx,
  TransferableOperation,
  Tx,
  KeyChain,
  NFTMintOperation,
  NFTMintOutput
} from "caminojs/apis/avm"
import { OutputOwners } from "caminojs/common"
import { PrivateKeyPrefix, DefaultLocalGenesisPrivateKey } from "caminojs/utils"
import { ExamplesConfig } from "../common/examplesConfig"

// before you run this example buildCreateNFTAssetTx.ts

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
const bintools: BinTools = BinTools.getInstance()
const privKey: string = `${PrivateKeyPrefix}${DefaultLocalGenesisPrivateKey}`
const outputs: TransferableOutput[] = []
const inputs: TransferableInput[] = []
const operations: TransferableOperation[] = []
const threshold: number = 1
const locktime: BN = new BN(0)
const memo: Buffer = Buffer.from("AVM manual OperationTx to mint an NFT")
const payload: Buffer = Buffer.from("NFT Payload")
const groupID: number = 0
// Uncomment for codecID 00 01
// const codecID: number = 1

let xchain: AVMAPI
let xKeychain: KeyChain
let xAddresses: Buffer[]
let xAddressStrings: string[]
let avaxAssetID: string
let fee: BN
let xBlockchainID: string
let avaxAssetIDBuf: Buffer

const InitAvalanche = async () => {
  await avalanche.fetchNetworkSettings()
  xchain = avalanche.XChain()
  xKeychain = xchain.keyChain()
  xKeychain.importKey(privKey)
  xAddresses = xchain.keyChain().getAddresses()
  xAddressStrings = xchain.keyChain().getAddressStrings()
  avaxAssetID = avalanche.getNetwork().X.avaxAssetID
  fee = xchain.getDefaultTxFee()
  xBlockchainID = avalanche.getNetwork().X.blockchainID
  avaxAssetIDBuf = bintools.cb58Decode(avaxAssetID)
}

const main = async (): Promise<any> => {
  await InitAvalanche()

  const avmUTXOResponse: any = await xchain.getUTXOs(xAddressStrings)
  const utxoSet: UTXOSet = avmUTXOResponse.utxos
  const utxos: UTXO[] = utxoSet.getAllUTXOs()
  utxos.forEach((utxo: UTXO): void => {
    const txid: Buffer = utxo.getTxID()
    const outputidx: Buffer = utxo.getOutputIdx()
    const assetID: Buffer = utxo.getAssetID()
    if (
      utxo.getOutput().getTypeID() != 10 &&
      utxo.getOutput().getTypeID() != 11
    ) {
      const amountOutput: AmountOutput = utxo.getOutput() as AmountOutput
      const amt: BN = amountOutput.getAmount().clone()

      if (assetID.toString("hex") === avaxAssetIDBuf.toString("hex")) {
        const secpTransferOutput: SECPTransferOutput = new SECPTransferOutput(
          amt.sub(fee),
          xAddresses,
          locktime,
          threshold
        )
        // Uncomment for codecID 00 01
        // secpTransferOutput.setCodecID(codecID)
        const transferableOutput: TransferableOutput = new TransferableOutput(
          avaxAssetIDBuf,
          secpTransferOutput
        )
        outputs.push(transferableOutput)

        const secpTransferInput: SECPTransferInput = new SECPTransferInput(amt)
        // Uncomment for codecID 00 01
        // secpTransferInput.setCodecID(codecID)
        secpTransferInput.addSignatureIdx(0, xAddresses[0])
        const input: TransferableInput = new TransferableInput(
          txid,
          outputidx,
          avaxAssetIDBuf,
          secpTransferInput
        )
        inputs.push(input)
      } else {
        const secpTransferOutput: SECPTransferOutput = new SECPTransferOutput(
          amt,
          xAddresses,
          locktime,
          threshold
        )
        // Uncomment for codecID 00 01
        // secpTransferOutput.setCodecID(codecID)
        const transferableOutput: TransferableOutput = new TransferableOutput(
          assetID,
          secpTransferOutput
        )
        outputs.push(transferableOutput)

        const secpTransferInput: SECPTransferInput = new SECPTransferInput(amt)
        // Uncomment for codecID 00 01
        // secpTransferInput.setCodecID(codecID)
        secpTransferInput.addSignatureIdx(0, xAddresses[0])
        const input: TransferableInput = new TransferableInput(
          txid,
          outputidx,
          assetID,
          secpTransferInput
        )
        inputs.push(input)
      }
    } else if (
      utxo.getOutput().getTypeID() != 7 &&
      utxo.getOutput().getTypeID() != 11
    ) {
      const outputOwners: OutputOwners = new OutputOwners(
        xAddresses,
        locktime,
        threshold
      )
      const nftMintOutputUTXOIDs: string[] = getUTXOIDs(
        utxoSet,
        bintools.cb58Encode(txid),
        AVMConstants.NFTMINTOUTPUTID,
        bintools.cb58Encode(assetID)
      )
      const mintOwner: NFTMintOutput = utxo.getOutput() as NFTMintOutput
      // Uncomment for codecID 00 01
      //   mintOwner.setCodecID(codecID)
      const nftMintOperation: NFTMintOperation = new NFTMintOperation(
        groupID,
        payload,
        [outputOwners]
      )
      //   Uncomment for codecID 00 01
      //   nftMintOperation.setCodecID(codecID)
      const spenders: Buffer[] = mintOwner.getSpenders(xAddresses)
      const nftMintOutputUTXOID: string = utxo.getUTXOID()
      if (nftMintOutputUTXOID === nftMintOutputUTXOIDs[0]) {
        spenders.forEach((spender: Buffer) => {
          const idx: number = mintOwner.getAddressIdx(spender)
          nftMintOperation.addSignatureIdx(idx, spender)
        })

        const transferableOperation: TransferableOperation =
          new TransferableOperation(
            utxo.getAssetID(),
            [nftMintOutputUTXOID],
            nftMintOperation
          )
        operations.push(transferableOperation)
      }
    }
  })
  const operationTx: OperationTx = new OperationTx(
    config.networkID,
    bintools.cb58Decode(xBlockchainID),
    outputs,
    inputs,
    memo,
    operations
  )
  // Uncomment for codecID 00 01
  //   operationTx.setCodecID(codecID)

  const unsignedTx: UnsignedTx = new UnsignedTx(operationTx)
  const tx: Tx = unsignedTx.sign(xKeychain)
  const txid: string = await xchain.issueTx(tx)
  console.log(`Success! TXID: ${txid}`)
}

main()

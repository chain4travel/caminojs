import {
  AddVoteTx,
  KeyChain,
  PlatformVMAPI,
  UnsignedTx
} from "caminojs/apis/platformvm"
import { Avalanche, BinTools, Buffer } from "caminojs/index"
import { DefaultLocalGenesisPrivateKey, PrivateKeyPrefix } from "caminojs/utils"
import { ExamplesConfig } from "../common/examplesConfig"

const config: ExamplesConfig = require("../common/examplesConfig.json")
const avalanche: Avalanche = new Avalanche(
  config.host,
  config.port,
  config.protocol,
  config.networkID
)
/**
 * @ignore
 */
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
//TODO: @VjeraTurk add missing example for adding vote to General and Base Fee Proposal
const main = async (): Promise<any> => {
  await InitAvalanche()
  const platformVMUTXOResponse = await pchain.getUTXOs(pAddressStrings)
  // TODO: How to get proposalID?
  let proposalID = "mYFYkuzAV6tdGPHMUReNAnTPU5u8yC5ogR4PpYQPPxAa52BmT"

  try {
    //TODO:  @VjeraTurk add missing example for adding vote to Proposal
    const vote = new AddVoteTx()
    let unsignedTxAV = await pchain.buildAddVoteTx(
      platformVMUTXOResponse.utxos, // utxoset
      pAddressStrings, // fromAddresses
      pAddressStrings, // changeAddresses
      proposalID, // proposalID
      0, // option
      pKeychain.getAddresses()[0], // sourceChain
      0, // version
      Buffer.alloc(20) // memo
    )
    const txAV = unsignedTxAV.sign(pKeychain)
    const hexAV = txAV.toStringHex().slice(2)
    const unsignedTx2AV = new UnsignedTx()
    unsignedTx2AV.fromBuffer(Buffer.from(hexAV, "hex"))

    const addVoteTx = unsignedTx2AV.getTransaction() as AddVoteTx

    const addVoteTxTypeName: string = addVoteTx.getTypeName()
    const addVoteTxTypeID: number = addVoteTx.getTypeID()

    console.log(proposalID, addVoteTxTypeID, addVoteTxTypeName)

    const txid: string = await pchain.issueTx(txAV)
    console.log(`Success! TXID: ${txid}`)
  } catch (e) {
    console.log(e)
  }
}
main()

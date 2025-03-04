import { AddVoteTx, KeyChain, PlatformVMAPI } from "caminojs/apis/platformvm"
import { Avalanche, Buffer } from "caminojs/index"
import {
  DefaultLocalGenesisPrivateKey2,
  PrivateKeyPrefix
} from "caminojs/utils"
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
let privKey: string = `${PrivateKeyPrefix}${DefaultLocalGenesisPrivateKey2}`

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

  // To find the proposal ID:
  // 1. First create a proposal using addProposalTx.generalProposal.ts
  // 2. The transaction ID returned from issueTx() is your proposal ID
  // 3. You can also get it from the blockchain explorer or by querying the node
  // Example proposal ID (replace with your actual proposal ID):
  const proposalID = "2fCDUyUDjdiFYFHu62dKmsEESewFwSR96SnmaDMGrnMUAwmEVf" // This is an example ID, replace with your actual proposal ID

  // Both voters will vote for option 0
  const voteOptionIndex = 0

  const platformVMUTXOResponse = await pchain.getUTXOs(pAddressStrings)

  try {
    // Create unsigned transaction for the first voter
    let unsignedTx = await pchain.buildAddVoteTx(
      platformVMUTXOResponse.utxos, // utxoset
      pAddressStrings, // fromAddresses
      pAddressStrings, // changeAddresses
      proposalID, // proposalID - must be a string in CB58 format
      voteOptionIndex, // votePayload - the index of the option to vote for
      pKeychain.getAddresses()[0], // voterAddress
      0, // version
      Buffer.alloc(20) // memo
    )

    // Sign and issue the transaction for the first voter
    const tx = unsignedTx.sign(pKeychain)
    const hex = tx.toStringHex().slice(2)

    const addVoteTx = unsignedTx.getTransaction() as AddVoteTx
    const addVoteTxTypeName: string = addVoteTx.getTypeName()
    const addVoteTxTypeID: number = addVoteTx.getTypeID()

    console.log("First voter transaction:")
    console.log("Type ID:", addVoteTxTypeID)
    console.log("Type Name:", addVoteTxTypeName)
    console.log("Transaction Hex:", hex)

    const txid: string = await pchain.issueTx(tx)
    console.log(`Success! TXID: ${txid}`)
  } catch (e) {
    console.log("Error:", e)
  }
}
main()

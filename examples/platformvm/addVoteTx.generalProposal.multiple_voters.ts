import { AddVoteTx, KeyChain, PlatformVMAPI } from "caminojs/apis/platformvm"
import { Avalanche, Buffer } from "caminojs/index"
import {
  DefaultLocalGenesisPrivateKey,
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
let privKey: string = `${PrivateKeyPrefix}${DefaultLocalGenesisPrivateKey}`
let privKey2: string = `${PrivateKeyPrefix}${DefaultLocalGenesisPrivateKey2}`
let privKey3: string = `${PrivateKeyPrefix}ADD_PRIVATE_KEY_HERE`

let pchain: PlatformVMAPI
let pKeychain: KeyChain
let pAddressStrings: string[]
const InitAvalanche = async () => {
  await avalanche.fetchNetworkSettings()
}
const main = async (): Promise<any> => {
  await InitAvalanche()

  // To find the proposal ID:
  // 1. First create a proposal using addProposalTx.generalProposal.ts
  // 2. The transaction ID returned from issueTx() is your proposal ID
  // 3. You can also get it from the blockchain explorer or by querying the node
  // Example proposal ID (replace with your actual proposal ID):
  const proposalID = "tXyEwjKTnhrVFk1Ngskv9N3A8KeXcga6qkyhpp7XkJdyJNvgS" // This is an example ID, replace with your actual proposal ID

  // Both voters will vote for option 0
  const voteOptionIndex0 = 0
  const voteOptionIndex1 = 1
  const voteOptionIndex2 = 2

  pchain = avalanche.PChain()
  pKeychain = pchain.keyChain()
  try {
    let keyPair = pKeychain.importKey(privKey)
    pAddressStrings = pchain.keyChain().getAddressStrings()
    let platformVMUTXOResponse = await pchain.getUTXOs(pAddressStrings)

    // Create unsigned transaction for the first voter
    let unsignedTx = await pchain.buildAddVoteTx(
      platformVMUTXOResponse.utxos, // utxoset
      pAddressStrings, // fromAddresses
      pAddressStrings, // changeAddresses
      proposalID, // proposalID - must be a string in CB58 format
      voteOptionIndex0, // votePayload - the index of the option to vote for
      pKeychain.getAddresses()[0], // voterAddress
      0, // version
      Buffer.alloc(20) // memo
    )

    // Sign and issue the transaction for the first voter
    const tx = unsignedTx.sign(pKeychain)
    const hex = tx.toStringHex().slice(2)
    pKeychain.removeKey(keyPair)

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

  try {
    let keyPair = pKeychain.importKey(privKey2)
    pAddressStrings = pchain.keyChain().getAddressStrings()
    let platformVMUTXOResponse = await pchain.getUTXOs(pAddressStrings)

    // Create unsigned transaction for the first voter
    let unsignedTx = await pchain.buildAddVoteTx(
      platformVMUTXOResponse.utxos, // utxoset
      pAddressStrings, // fromAddresses
      pAddressStrings, // changeAddresses
      proposalID, // proposalID - must be a string in CB58 format
      voteOptionIndex0, // votePayload - the index of the option to vote for
      pKeychain.getAddresses()[0], // voterAddress
      0, // version
      Buffer.alloc(20) // memo
    )

    // Sign and issue the transaction for the first voter
    const tx = unsignedTx.sign(pKeychain)
    pKeychain.removeKey(keyPair)

    const hex = tx.toStringHex().slice(2)

    const addVoteTx = unsignedTx.getTransaction() as AddVoteTx
    const addVoteTxTypeName: string = addVoteTx.getTypeName()
    const addVoteTxTypeID: number = addVoteTx.getTypeID()

    console.log("Second voter transaction:")
    console.log("Type ID:", addVoteTxTypeID)
    console.log("Type Name:", addVoteTxTypeName)
    console.log("Transaction Hex:", hex)

    const txid: string = await pchain.issueTx(tx)
    console.log(`Success! TXID: ${txid}`)
  } catch (e) {
    console.log("Error:", e)
  }

  try {
    pchain = avalanche.PChain()
    pKeychain = pchain.keyChain()
    let keyPair = pKeychain.importKey(privKey3)

    pAddressStrings = pchain.keyChain().getAddressStrings()
    let platformVMUTXOResponse = await pchain.getUTXOs(pAddressStrings)

    // Create unsigned transaction for the first voter
    let unsignedTx = await pchain.buildAddVoteTx(
      platformVMUTXOResponse.utxos, // utxoset
      pAddressStrings, // fromAddresses
      pAddressStrings, // changeAddresses
      proposalID, // proposalID - must be a string in CB58 format
      voteOptionIndex1, // votePayload - the index of the option to vote for
      pKeychain.getAddresses()[0], // voterAddress
      0, // version
      Buffer.alloc(20) // memo
    )

    // Sign and issue the transaction for the first voter
    const tx = unsignedTx.sign(pKeychain)
    pKeychain.removeKey(keyPair)

    const hex = tx.toStringHex().slice(2)

    const addVoteTx = unsignedTx.getTransaction() as AddVoteTx
    const addVoteTxTypeName: string = addVoteTx.getTypeName()
    const addVoteTxTypeID: number = addVoteTx.getTypeID()

    console.log("Third voter transaction:")
    console.log("Type ID:", addVoteTxTypeID)
    console.log("Type Name:", addVoteTxTypeName)
    console.log("Transaction Hex:", hex)

    const txid: string = await pchain.issueTx(tx)
    console.log(`Success! TXID: ${txid}`)
  } catch (e) {
    console.log("Error:", e)
  }
  /*
  try {
    pchain = avalanche.PChain()
    pKeychain = pchain.keyChain()
    pKeychain.importKey(privKey4)
    pAddressStrings = pchain.keyChain().getAddressStrings()

    // Create unsigned transaction for the first voter
    let unsignedTx = await pchain.buildAddVoteTx(
      platformVMUTXOResponse.utxos, // utxoset
      pAddressStrings, // fromAddresses
      pAddressStrings, // changeAddresses
      proposalID, // proposalID - must be a string in CB58 format
      voteOptionIndex2, // votePayload - the index of the option to vote for
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

    console.log("Fourth voter transaction:")
    console.log("Type ID:", addVoteTxTypeID)
    console.log("Type Name:", addVoteTxTypeName)
    console.log("Transaction Hex:", hex)

    const txid: string = await pchain.issueTx(tx)
    console.log(`Success! TXID: ${txid}`)
  } catch (e) {
    console.log("Error:", e)
  }

  try {
    // Create unsigned transaction for the first voter
    let unsignedTx = await pchain.buildAddVoteTx(
      platformVMUTXOResponse.utxos, // utxoset
      pAddressStrings, // fromAddresses
      pAddressStrings, // changeAddresses
      proposalID, // proposalID - must be a string in CB58 format
      voteOptionIndex0, // votePayload - the index of the option to vote for
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

    console.log("Fifth voter transaction:")
    console.log("Type ID:", addVoteTxTypeID)
    console.log("Type Name:", addVoteTxTypeName)
    console.log("Transaction Hex:", hex)

    const txid: string = await pchain.issueTx(tx)
    console.log(`Success! TXID: ${txid}`)
  } catch (e) {
    console.log("Error:", e)
  }*/
}
main()

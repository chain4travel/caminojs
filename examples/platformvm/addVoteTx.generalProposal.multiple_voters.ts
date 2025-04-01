/* example meant to be run on local network with 5 validators (genesis_local_5_validators_2_multisigs.json) */
import { AddVoteTx, KeyChain, PlatformVMAPI } from "caminojs/apis/platformvm"
import { Avalanche, Buffer } from "caminojs/index"
import {
  DefaultLocalGenesisPrivateKey,
  DefaultLocalGenesisPrivateKey2,
  FiveValidatorsGenesisPrivateKey,
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
let privKey: string = `${PrivateKeyPrefix}${DefaultLocalGenesisPrivateKey}`
let privKey2: string = `${PrivateKeyPrefix}${DefaultLocalGenesisPrivateKey2}`
let privKey3: string = `${PrivateKeyPrefix}${FiveValidatorsGenesisPrivateKey}`
let privKeys = [privKey, privKey2, privKey3]

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
  const proposalID = "PROPOSAL_ID" // This is an example ID, replace with your actual proposal ID

  // 0, 30 If 3 of 5 voters vote the same option, the proposal should pass - with 3 same votes
  const allCases = [
    [0, 0, 0], // case A - 5 validators, 3 votes, expect Successful
    [0, 0, 1], // case B - 5 validators, 3 votes, expect Failed
    [0, 1, 1] // case C - 5 validators, 3 votes, expect Failed
  ]
  const cases = [allCases[0]]

  pchain = avalanche.PChain()
  pKeychain = pchain.keyChain()

  console.log("Voting for proposal:", proposalID)

  for (let i = 0; i < cases.length; i++) {
    for (let j = 0; j < cases[i].length; j++) {
      try {
        let keyPair = pKeychain.importKey(privKeys[j])
        pAddressStrings = pchain.keyChain().getAddressStrings()
        let platformVMUTXOResponse = await pchain.getUTXOs(pAddressStrings)

        // Create unsigned transaction for the first voter
        let unsignedTx = await pchain.buildAddVoteTx(
          platformVMUTXOResponse.utxos, // utxoset
          pAddressStrings, // fromAddresses
          pAddressStrings, // changeAddresses
          proposalID, // proposalID - must be a string in CB58 format
          cases[i][j], // votePayload - the index of the option to vote for
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

        console.log(`${j + 1}. voter transaction:`)

        console.log(
          "Type ID:",
          addVoteTxTypeID,
          "Type Name:",
          addVoteTxTypeName
        )
        console.log("Transaction Hex:", hex)

        const txid: string = await pchain.issueTx(tx)
        console.log(`Success! TXID: ${txid}`)
        console.log(
          `Voter address: ${pAddressStrings} voted for option ${cases[i][j]}`
        )
      } catch (e) {
        console.log("Error:", e)
      }
      console.log("This was voting for proposal:", proposalID)
    }
  }
}
main()

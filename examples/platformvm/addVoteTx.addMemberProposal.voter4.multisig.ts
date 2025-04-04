/* example meant to be run on local network with 5 validators (genesis_local_5_validators_2_multisigs.json) */
import {
  AddVoteTx,
  KeyChain,
  PlatformVMAPI,
  PlatformVMConstants,
  Tx
} from "caminojs/apis/platformvm"
import { Avalanche, BinTools, Buffer } from "caminojs/index"
import {
  DefaultLocalGenesisPrivateKey2,
  PrivateKeyPrefix,
  PChainAlias
} from "caminojs/utils"
import { ExamplesConfig } from "../common/examplesConfig"

const config: ExamplesConfig = require("../common/examplesConfig.json")
import createHash from "create-hash"

const avalanche: Avalanche = new Avalanche(
  config.host,
  config.port,
  config.protocol,
  config.networkID
)
import BN from "bn.js"
import {
  MultisigKeyChain,
  MultisigKeyPair,
  OutputOwners
} from "caminojs/common"

const bintools = BinTools.getInstance()

// Multisig voter:
const multiSigAliasMemberPrivateKey = `${PrivateKeyPrefix}${DefaultLocalGenesisPrivateKey2}`
// Multisig Example where creator is an Multisig address with 1 owner (threshold 1)
const msig_one_owner = "P-kopernikus1z5tv4tg04kf4l9ghclw6ssek8zugs7yd65prpl" // Multisig Address with 1 owner (threshold 1)

const msigAlias = msig_one_owner

let pchain: PlatformVMAPI
let pKeychain: KeyChain
let pAddresses: Buffer[]
let pAddressStrings: string[]

const InitAvalanche = async () => {
  await avalanche.fetchNetworkSettings()
  pchain = avalanche.PChain()
  pKeychain = pchain.keyChain()
  pKeychain.importKey(multiSigAliasMemberPrivateKey)

  pAddresses = pchain.keyChain().getAddresses()
  pAddressStrings = pchain.keyChain().getAddressStrings()
}
const main = async (): Promise<any> => {
  await InitAvalanche()
  const msigAliasBuffer = pchain.parseAddress(msigAlias)
  const owner = await pchain.getMultisigAlias(msigAlias)
  // To find the proposal ID:
  // 1. First create a proposal using addProposalTx.addMemberProposal.ts
  // 2. The transaction ID returned from issueTx() is your proposal ID
  // 3. You can also get it from the blockchain explorer or by querying the node
  // Example proposal ID (replace with your actual proposal ID):
  const proposalID = "PROPOSAL_ID" // This is an example ID, replace with your actual proposal ID

  // Both voters will vote for option 0
  const voteOptionIndex = 0

  const platformVMUTXOResponse = await pchain.getUTXOs(pAddressStrings)

  try {
    let signatures: [string, string][] = []
    // Create unsigned transaction for the first voter
    let unsignedTx = await pchain.buildAddVoteTx(
      platformVMUTXOResponse.utxos, // utxoset
      pAddressStrings, // fromAddresses
      pAddressStrings, // changeAddresses
      proposalID, // proposalID - must be a string in CB58 format
      voteOptionIndex, // votePayload - the index of the option to vote for
      msigAliasBuffer, // voterAddress
      0, // version
      Buffer.alloc(20) // memo
    )

    // Create the hash from the tx
    const txbuff = unsignedTx.toBuffer()
    const msg: Buffer = Buffer.from(
      createHash("sha256").update(txbuff).digest()
    )
    for (let address of pAddresses) {
      // We need the keychain for signing
      const keyPair = pKeychain.getKey(address)
      // The signature
      const signature = keyPair.sign(msg)
      // save the signature
      signatures.push([keyPair.getAddressString(), signature.toString("hex")])
    }
    const msKeyChain = new MultisigKeyChain(
      avalanche.getHRP(),
      PChainAlias,
      msg,
      PlatformVMConstants.SECPMULTISIGCREDENTIAL,
      unsignedTx.getTransaction().getOutputOwners(),
      new Map([
        [
          msigAliasBuffer.toString("hex"),
          new OutputOwners(
            owner.addresses.map((a) => bintools.parseAddress(a, "P")),
            new BN(owner.locktime),
            owner.threshold
          )
        ]
      ])
    )
    // load the signatures from the store/map/signavault
    for (let [addressString, hexSignature] of signatures) {
      let address = pchain.parseAddress(addressString)
      let signature = Buffer.from(hexSignature, "hex")
      msKeyChain.addKey(new MultisigKeyPair(msKeyChain, address, signature))
    }

    msKeyChain.buildSignatureIndices()

    // Apply the signatures and send the tx
    const tx: Tx = unsignedTx.sign(msKeyChain)
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

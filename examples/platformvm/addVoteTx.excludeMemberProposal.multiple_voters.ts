/* example meant to be run on local network with 5 validators (genesis_local_5_validators_2_multisigs.json) */
import {
  AddVoteTx,
  GetTxStatusResponse,
  KeyChain,
  PlatformVMAPI,
  PlatformVMConstants
} from "caminojs/apis/platformvm"
import { Avalanche, BinTools, Buffer } from "caminojs/index"
import {
  DefaultLocalGenesisPrivateKey,
  DefaultLocalGenesisPrivateKey2,
  FiveValidatorsGenesisPrivateKey,
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
} from "caminojs/common/"
import { getProposalIdFromArgs, getProposalIds } from "./proposal-utils"

const bintools = BinTools.getInstance()

let privKey: string = `${PrivateKeyPrefix}${DefaultLocalGenesisPrivateKey}`
let privKey2: string = `${PrivateKeyPrefix}${DefaultLocalGenesisPrivateKey2}`
let privKey3: string = `${PrivateKeyPrefix}${FiveValidatorsGenesisPrivateKey}`

const msig_one_owner = "P-kopernikus1z5tv4tg04kf4l9ghclw6ssek8zugs7yd65prpl"
const msig_two_owners_threshold_2 =
  "P-kopernikus1t5qgr9hcmf2vxj7k0hz77kawf9yr389cxte5j0"

const multiSigAliasMember1PrivateKey = `${PrivateKeyPrefix}${DefaultLocalGenesisPrivateKey}`
const multiSigAliasMember2PrivateKey = `${PrivateKeyPrefix}${DefaultLocalGenesisPrivateKey2}`

let privKeys = [, privKey2, privKey3, privKey]
let multisigAliases = [msig_one_owner, , , , msig_two_owners_threshold_2]

let pchain: PlatformVMAPI
let pKeychain: KeyChain
let pAddressStrings: string[]

const InitAvalanche = async () => {
  await avalanche.fetchNetworkSettings()
  pchain = avalanche.PChain()
}
const main = async (): Promise<any> => {
  await InitAvalanche()

  // To find the proposal ID:
  // 1. First create a proposal using addProposalTx
  // 2. The transaction ID returned from issueTx() is your proposal ID
  // 3. You can also get it from the blockchain explorer or by querying the node

  // Try to get proposal ID from command-line arguments
  const cmdLineProposalId = getProposalIdFromArgs()

  // Read proposal IDs from file if no command-line argument
  const savedProposalIds = cmdLineProposalId
    ? [cmdLineProposalId]
    : [getProposalIds()[0]]

  // Use saved proposal IDs if available, otherwise use example IDs
  const proposalIDs =
    savedProposalIds.length > 0 ? savedProposalIds : ["PROPOSAL_ID"] // This is an example ID

  console.log("Using proposal IDs:", proposalIDs)
  // 50% or more have to vote the same option, the proposal should pass
  // Once the proposal is accepted or rejected (reaches >50%), it cannot be voted on again
  const allCases = [[1, 0, 1, 0, 0]]

  let pAddresses: Buffer[]

  for (let p = 0; p < proposalIDs.length; p++) {
    console.log("Voting for proposal:", proposalIDs[p])
    let cases = allCases[p]

    // Proposal is passed with 3/5 votes
    for (let j = 0; j < cases.length; j++) {
      console.log("Voting for case:", cases[j])

      try {
        let unsignedTx
        let tx
        let keyPair1
        let keyPair2

        let platformVMUTXOResponse

        pKeychain = pchain.keyChain()

        if (privKeys[j] !== undefined) {
          // Not multisig
          let keyPair = pKeychain.importKey(privKeys[j])
          pAddressStrings = pchain.keyChain().getAddressStrings()
          platformVMUTXOResponse = await pchain.getUTXOs(pAddressStrings)

          // Create unsigned transaction for the first voter
          unsignedTx = await pchain.buildAddVoteTx(
            platformVMUTXOResponse.utxos, // utxoset
            pAddressStrings, // fromAddresses
            pAddressStrings, // changeAddresses
            proposalIDs[p], // proposalID - must be a string in CB58 format
            cases[j], // votePayload - the index of the option to vote for
            pKeychain.getAddresses()[0], // voterAddress
            0, // version
            Buffer.alloc(20) // memo
          )
          // Not multisig
          // Sign and issue the transaction for the first voter
          tx = unsignedTx.sign(pKeychain)
          pKeychain.removeKey(keyPair)
        } else {
          let signatures: [string, string][] = []
          // Multisig
          if (multisigAliases[j] === msig_one_owner) {
            keyPair2 = pKeychain.importKey(multiSigAliasMember2PrivateKey)
          } else {
            keyPair1 = pKeychain.importKey(multiSigAliasMember1PrivateKey)
            keyPair2 = pKeychain.importKey(multiSigAliasMember2PrivateKey)
          }

          pAddresses = pchain.keyChain().getAddresses()
          pAddressStrings = pchain.keyChain().getAddressStrings()
          // pAddressMSStrings = [multisigAliases[j], pAddressMSStrings]
          platformVMUTXOResponse = await pchain.getUTXOs([multisigAliases[j]])
          let msigAliasBuffer = pchain.parseAddress(multisigAliases[j])

          unsignedTx = await pchain.buildAddVoteTx(
            platformVMUTXOResponse.utxos, // utxoset
            [[multisigAliases[j]], pAddressStrings], // fromAddresses
            [], // changeAddresses
            proposalIDs[p], // proposalID - must be a string in CB58 format
            cases[j],
            msigAliasBuffer, // voterAddress
            0, // version
            Buffer.alloc(20) // memo
          )
          // Multisig
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
            signatures.push([
              keyPair.getAddressString(),
              signature.toString("hex")
            ])
          }

          const owners = await pchain.getMultisigAlias(multisigAliases[j])

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
                  owners.addresses.map((a) => bintools.parseAddress(a, "P")),
                  new BN(owners.locktime),
                  owners.threshold
                )
              ]
            ])
          )

          // load the signatures from the store/map/signavault
          for (let [addressString, hexSignature] of signatures) {
            let address = pchain.parseAddress(addressString)
            let signature = Buffer.from(hexSignature, "hex")
            msKeyChain.addKey(
              new MultisigKeyPair(msKeyChain, address, signature)
            )
          }

          msKeyChain.buildSignatureIndices()
          tx = unsignedTx.sign(msKeyChain)
          if (multisigAliases[j] === msig_one_owner) {
            pKeychain.removeKey(keyPair2)
          } else if (multisigAliases[j] === msig_two_owners_threshold_2) {
            pKeychain.removeKey(keyPair1)
            pKeychain.removeKey(keyPair2)
          }
        }
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
        // console.log("Transaction Hex:", hex)

        let attempts = 1
        const txid: string = await pchain.issueTx(tx)

        await new Promise((resolve) => setTimeout(resolve, attempts + 1000))
        let txStatus: string | GetTxStatusResponse = await avalanche
          .PChain()
          .getTxStatus(txid)

        console.log(
          "Transaction status: after ",
          attempts,
          "s timeout",
          txStatus
        )

        if (
          (typeof txStatus == "string" && txStatus == "Committed") ||
          (typeof txStatus == "object" && txStatus.status == "Committed")
        ) {
          console.log(
            `for proposal ${proposalIDs[p]} Result: Success! Voter address: ${
              multisigAliases[j] ?? pAddressStrings
            } voted for option ${cases[j]} TXID: ${txid}`
          )
        } else {
          while (
            ((typeof txStatus == "object" && txStatus.status !== "Committed") ||
              (typeof txStatus == "string" && txStatus !== "Committed")) &&
            attempts < 21
          ) {
            await new Promise((resolve) => setTimeout(resolve, attempts + 1000))
            txStatus = await avalanche.PChain().getTxStatus(txid)
            console.log(
              "Transaction status: after ",
              attempts,
              " s timeout",
              txStatus
            )
            if (
              (typeof txStatus == "string" && txStatus == "Committed") ||
              (typeof txStatus == "object" && txStatus.status == "Committed")
            ) {
              console.log(
                `for proposal ${
                  proposalIDs[p]
                } Result: Success! Voter address: ${
                  multisigAliases[j] ?? pAddressStrings
                } voted for option ${cases[j]} TXID: ${txid}`
              )
              break
            } else if (typeof txStatus == "object" && attempts >= 20) {
              console.log(
                `For proposal ${proposalIDs[p]} Result: Status: ${
                  txStatus.status
                } Voter address: ${
                  multisigAliases[j] ?? pAddressStrings
                } tried to vote for option ${cases[j]}`
              )
            }

            attempts++
          }
        }
      } catch (e) {
        console.log(
          `For proposal ${proposalIDs[p]} Result: Failed! Voter address: ${
            multisigAliases[j] ?? pAddressStrings
          } tried to vote for option ${cases[j]} "Error:", ${e})`
        )
      }
      console.log("This was voting for proposal:", proposalIDs[p])
      console.log("__________________________________________________")
    }
  }
}
main()

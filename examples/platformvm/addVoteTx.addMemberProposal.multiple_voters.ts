/* example meant to be run on local network with 5 validators (genesis_local_5_validators_2_multisigs.json) */
import {
  AddVoteTx,
  KeyChain,
  MultisigAlias,
  PlatformVMAPI,
  PlatformVMConstants
} from "caminojs/apis/platformvm"
import { Avalanche, BinTools, Buffer } from "caminojs/index"
import BN from "bn.js"
import {
  DefaultLocalGenesisPrivateKey,
  DefaultLocalGenesisPrivateKey2,
  FiveValidatorsGenesisPrivateKey,
  PChainAlias,
  PrivateKeyPrefix
} from "caminojs/utils"
import { ExamplesConfig } from "../common/examplesConfig"
import createHash from "create-hash"
import {
  MultisigKeyChain,
  MultisigKeyPair,
  OutputOwners,
  ZeroBN
} from "caminojs/common/"

const bintools = BinTools.getInstance()

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

const MultisigAlias1 = "P-kopernikus1z5tv4tg04kf4l9ghclw6ssek8zugs7yd65prpl"
const MultisigAlias2 = "P-kopernikus1t5qgr9hcmf2vxj7k0hz77kawf9yr389cxte5j0"

const multiSigAliasMember1PrivateKey = `${PrivateKeyPrefix}${DefaultLocalGenesisPrivateKey2}`
const multiSigAliasMember2PrivateKey = `${PrivateKeyPrefix}${DefaultLocalGenesisPrivateKey2}`

let privKeys = [privKey, privKey2, privKey3, ,]
let multisigAliases = [, , , MultisigAlias1, MultisigAlias2]

let pchain: PlatformVMAPI
let pKeychain: KeyChain
let pAddressStrings: string[]
const InitAvalanche = async () => {
  await avalanche.fetchNetworkSettings()
}
const main = async (): Promise<any> => {
  await InitAvalanche()

  // To find the proposal ID:
  // 1. First create a proposal using addProposalTx
  // 2. The transaction ID returned from issueTx() is your proposal ID
  // 3. You can also get it from the blockchain explorer or by querying the node
  // Example proposal ID (replace with your actual proposal ID):
  const proposalIDs = [
    "HhzicFgu6Zh9yJDv5PZwPiPoRtuq5XbxbV5QSTfN4oYKCkGeL",
    "wKLztetaVLZEwVYmVt6whTjCp7DnoaCWeKgurXVYW2W4Lhz63",
    "oVoHKgRREoK96cSqoY3bJGQNPwPYXLt7XFAsevzC9yZToXbpx"
  ] // This are example IDs, replace with your actual proposal IDs

  // 50% or more have to vote the same option, the proposal should pass
  const allCases = [
    [0, 0, 0, 1, 1], // 5 validators, 5 votes, expect Successful & Accepted
    [0, 0, 1, 1, 1], // 5 validators, 5 votes, expect Successful & Rejected
    [0, 0, 0, 0, 0], // 5 validators, 5 votes, expect Successful & Accepted

    [1, 1, 1, 1, 1] // 5 validators, 5 votes, expect Successful & Rejected
  ]

  pchain = avalanche.PChain()
  pKeychain = pchain.keyChain()

  let pAddresses: Buffer[]
  let pAddressMSStrings

  for (let p = 0; p < proposalIDs.length; p++) {
    console.log("Voting for proposal:", proposalIDs[p])
    let cases = allCases[p]

    for (let j = 0; j < cases.length; j++) {
      console.log("Voting for case:", cases[j])
      try {
        let tx
        let keyPair
        let signatures: [string, string][] = []

        let platformVMUTXOResponse

        if (privKeys[j] !== undefined) {
          // Not multisig
          keyPair = pKeychain.importKey(privKeys[j])
          pAddressStrings = pchain.keyChain().getAddressStrings()
          platformVMUTXOResponse = await pchain.getUTXOs(pAddressStrings)
        } else {
          // Multisig
          pKeychain.importKey(multiSigAliasMember1PrivateKey)
          pKeychain.importKey(multiSigAliasMember2PrivateKey)
          pAddresses = pchain.keyChain().getAddresses()
          pAddressMSStrings = pchain.keyChain().getAddressStrings()
          pAddressStrings = [multisigAliases[j], pAddressMSStrings]
          platformVMUTXOResponse = await pchain.getUTXOs([multisigAliases[j]])
        }

        // Create unsigned transaction for the first voter
        let unsignedTx = await pchain.buildAddVoteTx(
          platformVMUTXOResponse.utxos, // utxoset
          pAddressStrings, // fromAddresses
          privKeys[j] ? pAddressStrings : [], // changeAddresses
          proposalIDs[p], // proposalID - must be a string in CB58 format
          cases[j], // votePayload - the index of the option to vote for
          privKeys[j]
            ? pKeychain.getAddresses()[0]
            : pchain.parseAddress(multisigAliases[j]), // voterAddress
          0, // version
          Buffer.alloc(20) // memo
        )

        if (privKeys[j] !== undefined) {
          // Not multisig
          // Sign and issue the transaction for the first voter
          tx = unsignedTx.sign(pKeychain)
          const hex = tx.toStringHex().slice(2)
          pKeychain.removeKey(keyPair)
        } else {
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

          const msigAliasAddrBuffer = pchain.parseAddress(multisigAliases[j]) // voter and ins owner
          const msigAlias = await pchain.getMultisigAlias(multisigAliases[j])

          const msKeyChain = new MultisigKeyChain(
            avalanche.getHRP(),
            PChainAlias,
            msg,
            PlatformVMConstants.SECPMULTISIGCREDENTIAL,
            unsignedTx.getTransaction().getOutputOwners(),
            new Map([
              [
                msigAliasAddrBuffer.toString("hex"),
                new OutputOwners(
                  msigAlias.addresses.map((a) => bintools.parseAddress(a, "P")),
                  ZeroBN,
                  msigAlias.threshold
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

        const txid: string = await pchain.issueTx(tx)
        console.log(
          `for proposal ${proposalIDs[p]} Result: Success! Voter address: ${pAddressStrings} voted for option ${cases[j]} TXID: ${txid}`
        )
        console.log()
      } catch (e) {
        console.log(
          `For proposal ${proposalIDs[p]} Result: Failed! Voter address: ${pAddressStrings} tried to vote for option ${cases[j]} "Error:", ${e})`
        )
      }
      console.log("This was voting for proposal:", proposalIDs[p])
    }
  }
}
main()

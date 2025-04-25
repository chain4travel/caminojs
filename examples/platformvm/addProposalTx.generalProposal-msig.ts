/* example meant to be run on local network with 5 validators (genesis_local_5_validators.json) */
import {
  AddProposalTx,
  GeneralProposal,
  KeyChain,
  PlatformVMAPI,
  PlatformVMConstants,
  Tx
} from "caminojs/apis/platformvm"
import { Avalanche, BinTools, Buffer } from "caminojs/index"
import {
  DefaultLocalGenesisPrivateKey,
  DefaultLocalGenesisPrivateKey2,
  PChainAlias,
  PrivateKeyPrefix
} from "caminojs/utils"
import { ExamplesConfig } from "../common/examplesConfig"
import BN from "bn.js"
import {
  MultisigKeyChain,
  MultisigKeyPair,
  OutputOwners
} from "caminojs/common"
import createHash from "create-hash"
import { fractionDenominator } from "./proposal-utils"

const config: ExamplesConfig = require("../common/examplesConfig.json")

const avalanche: Avalanche = new Avalanche(
  config.host,
  config.port,
  config.protocol,
  config.networkID
)
const bintools = BinTools.getInstance()
// Multisig creator:
const multiSigAliasMember1PrivateKey = `${PrivateKeyPrefix}${DefaultLocalGenesisPrivateKey}`
const multiSigAliasMember2PrivateKey = `${PrivateKeyPrefix}${DefaultLocalGenesisPrivateKey2}`
// Multisig Example where creator is an Multisig address with 2 owners (threshold 1 or 2)
const msigAliasAddr = "P-kopernikus1t5qgr9hcmf2vxj7k0hz77kawf9yr389cxte5j0"

let pchain: PlatformVMAPI
let pKeychain: KeyChain
let pAddresses: Buffer[]
let pAddressStrings: string[]

const InitAvalanche = async () => {
  await avalanche.fetchNetworkSettings()
  pchain = avalanche.PChain()
  pKeychain = pchain.keyChain()
  pKeychain.importKey(multiSigAliasMember1PrivateKey)
  pKeychain.importKey(multiSigAliasMember2PrivateKey)

  pAddresses = pchain.keyChain().getAddresses()
  pAddressStrings = pchain.keyChain().getAddressStrings()
}

const main = async (): Promise<any> => {
  await InitAvalanche()

  const msigAliasAddrBuffer = pchain.parseAddress(msigAliasAddr) // proposer and ins owner
  const msigAlias = await pchain.getMultisigAlias(msigAliasAddr)

  const startDelay = 5 // seconds
  const startTimestamp: number = Date.now() / 1000 + startDelay // seconds
  const endTimestamp: number = startTimestamp + 2592000 // +30 days
  const platformVMUTXOResponse = await pchain.getUTXOs([msigAliasAddr])

  const mostVotedThresholdNominator = 39 * fractionDenominator / 100  // >39% (2/5 voters)
  const totalVotedThresholdNominator = 39 * fractionDenominator / 100 // >39% (2/5 voters)
  const allowEarlyFinish = true

  const timestamp = new Date().toISOString()
  const proposalDescription = Buffer.from(
    `This is a general proposal. Created by caminojs examples at: ${timestamp}.
    \nAllow early finish: ${allowEarlyFinish}.
    \nTotal voted threshold: ${totalVotedThresholdNominator}.
    \nMost voted threshold: ${mostVotedThresholdNominator}.`
  )

  const proposal = new GeneralProposal(
    startTimestamp,
    endTimestamp,
    totalVotedThresholdNominator,
    mostVotedThresholdNominator,
    allowEarlyFinish
  )
  proposal.addGeneralOption("Option 1")
  proposal.addGeneralOption("Option 2")
  proposal.addGeneralOption("Option 3")

  try {
    let buffer = proposal.toBuffer()
    console.log(buffer)
  } catch (e) {
    console.log(e)
  }

  try {
    const unsignedTx = await pchain.buildAddProposalTx(
      platformVMUTXOResponse.utxos,
      [[msigAliasAddr], pAddressStrings], // fromAddresses
      [], // changeAddresses
      proposalDescription,
      proposal,
      msigAliasAddrBuffer, // proposerAddress
      0, // version
      Buffer.alloc(20) // memo
    )

    // Create signatures as part of the example
    const msg: Buffer = Buffer.from(createHash("sha256").update(unsignedTx.toBuffer()).digest())
    let signatures: [string, string][] = []
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
          msigAliasAddrBuffer.toString("hex"),
          new OutputOwners(
            msigAlias.addresses.map((a) => bintools.parseAddress(a, "P")),
            new BN(msigAlias.locktime),
            msigAlias.threshold
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

    const addProposalTx = unsignedTx.getTransaction() as AddProposalTx
    const addProposalTxTypeName: string = addProposalTx.getTypeName()
    const addProposalTxTypeID: number = addProposalTx.getTypeID()


    console.log(`Tx type: ${addProposalTxTypeID} ${addProposalTxTypeName}`)
    console.log(hex)

    const txID: string = await pchain.issueTx(tx)
    console.log("Proposer address:", msigAliasAddr)
    console.log(proposalDescription.toString())
    console.log(`Issued tx: ${txID}`)

    const txStatus = await pchain.awaitTx(txID)
    console.log("Tx status:", txStatus)
  } catch (e) {
    console.log(e)
  }
}

main()

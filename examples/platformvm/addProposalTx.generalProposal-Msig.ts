/* example meant to be run on local network with 5 validators (genesis_local_5_validators_2_multisigs.json) */
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

const config: ExamplesConfig = require("../common/examplesConfig.json")

const avalanche: Avalanche = new Avalanche(
  config.host,
  config.port,
  config.protocol,
  config.networkID
)
const bintools = BinTools.getInstance()

// Multisig creator:
const multiSigAliasMemberPrivateKey = `${PrivateKeyPrefix}${DefaultLocalGenesisPrivateKey2}`
// Multisig Example where creator is an Multisig Address with 1 owner (threshold 1)
const msigAliasAddr = "P-kopernikus1z5tv4tg04kf4l9ghclw6ssek8zugs7yd65prpl"

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
  const msigAliasAddrBuffer = pchain.parseAddress(msigAliasAddr) // proposer and ins owner
  const msigAlias = await pchain.getMultisigAlias(msigAliasAddr)
  const msigAliasOwners = new OutputOwners(
    msigAlias.addresses.map((a) => bintools.parseAddress(a, "P")),
    new BN(msigAlias.locktime),
    msigAlias.threshold
  )

  const bondAmount: any = await pchain.getMinStake()

  const timestamp = new Date().toISOString()
  let startTimestamp: number = Date.now() / 1000 // add + 60  to  start after 1 minute
  let endTimestamp: number = startTimestamp + 2592000 // exact 30 days

  const platformVMUTXOResponse = await pchain.getUTXOs([msigAliasAddr])

  const totalVotedThresholdNominator: number = 39 * 10000 // 0 - 100%
  const mostVotedThresholdNominator: number = 50 * 10000 // 0 - 100%
  const allowEarlyFinish: boolean = true

  const proposalDescription = Buffer.from(
    `This is a description of this general proposal. Vote on new color of the Camino logo. Created by caminojs examples at: ${timestamp}.
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
  proposal.addGeneralOption("Blue")
  proposal.addGeneralOption("Red")
  proposal.addGeneralOption("Green")

  try {
    let buffer = proposal.toBuffer()
    console.log(buffer)
  } catch (e) {
    console.log(e)
  }

  try {
    let signatures: [string, string][] = []
    let unsignedTx = await pchain.buildAddProposalTx(
      platformVMUTXOResponse.utxos, // utxoset
      [[msigAliasAddr], pAddressStrings], // fromAddresses
      [], // changeAddresses
      proposalDescription, // description
      proposal, // proposal
      msigAliasAddrBuffer, // proposerAddress
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

    const generalProposal = addProposalTx.getProposalPayload()

    console.log(addProposalTxTypeID, addProposalTxTypeName, timestamp)
    console.log(hex)
    const txid: string = await pchain.issueTx(tx)
    console.log("Proposer address:", msigAliasAddr)
    console.log(proposalDescription.toString())
    console.log(`Success! TXID: ${txid}`)
  } catch (e) {
    console.log(e)
  }
}

main()

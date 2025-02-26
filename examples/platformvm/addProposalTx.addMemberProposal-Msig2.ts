import {
  AddProposalTx,
  AddMemberProposal,
  KeyChain,
  PlatformVMAPI,
  UnsignedTx,
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
// Multisig Example where creator is an Multisig address with 1 owner or 2 owners (threshold 1 or 2)
const msig_one_owner = ""
const msig_two_owners_threshold_1 = ""
const msig_two_owners_threshold_2 = ""

const new_member_address = "" // New member address - must not be in the network already

// const msigAliasAddr = msig_one_owner
// const msigAliasAddr = msig_two_owners_threshold_1
const msigAliasAddr = msig_two_owners_threshold_2

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
  const msigAliasOwners = new OutputOwners(
    msigAlias.addresses.map((a) => bintools.parseAddress(a, "P")),
    new BN(msigAlias.locktime),
    msigAlias.threshold
  )

  const bondAmount: any = await pchain.getMinStake()

  const proposalDescription = Buffer.from("Proposal for new member.")

  let startTimestamp: number = Date.now() / 1000 + 600 // start after 10 minutes
  let endTimestamp: number = startTimestamp + 5184000 // exact 60 days
  const platformVMUTXOResponse = await pchain.getUTXOs([msigAliasAddr])

  const proposal = new AddMemberProposal(
    startTimestamp,
    endTimestamp,
    new_member_address
  )

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
      // for (let address of [...pAddresses].reverse()) { // uncomment for signing with last added address
      // We need the keychain for signing
      const keyPair = pKeychain.getKey(address)
      // The signature
      const signature = keyPair.sign(msg)
      // save the signature
      signatures.push([keyPair.getAddressString(), signature.toString("hex")])
      // break // Uncomment for single signature
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

    const memberProposal = addProposalTx.getProposalPayload()

    console.log(addProposalTxTypeID, addProposalTxTypeName)
    console.log(hex)
    const txid: string = await pchain.issueTx(tx)
    console.log(`Success! TXID: ${txid}`)
  } catch (e) {
    console.log(e)
  }
}

main()

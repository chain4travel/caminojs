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
import { PChainAlias } from "caminojs/utils"
import { ExamplesConfig } from "../common/examplesConfig"
import BN from "bn.js"
import {
  MultisigKeyChain,
  MultisigKeyPair,
  OutputOwners
} from "caminojs/common"
import createHash from "create-hash"

// const config: ExamplesConfig = require("../common/examplesConfigDevKopernikus.json")
const config: ExamplesConfig = require("../common/examplesConfigDevKopernikus.json")

const avalanche: Avalanche = new Avalanche(
  config.host,
  config.port,
  config.protocol,
  config.networkID
)
const bintools = BinTools.getInstance()

// seed3y
const member1 = "P-kopernikus1qfyvkqnv8yd9rmlf6sv0gdx20dgg4erslxurav"
// presale3y
const member2 = "P-kopernikus102uap4au55t22m797rr030wyrw0jlgw25ut8vj"

// Multisig creator:
const multiSigAliasMember1PrivateKey =
  "PrivateKey-XXX" // P-kopernikus1qfyvkqnv8yd9rmlf6sv0gdx20dgg4erslxurav
const multiSigAliasMember2PrivateKey =
  "PrivateKey-XXX" // P-kopernikus102uap4au55t22m797rr030wyrw0jlgw25ut8vj

const msig_one_owner = "P-kopernikus1r2udpjtvlkj6muetx3906vfvuna4nmg5mv5vxn"

const new_member_address = "P-kopernikus1fa2tyhqvh408pk7gx375wkcqunl2zczcl4acht"

const msigAlias = msig_one_owner

let pchain: PlatformVMAPI
let pKeychain: KeyChain
let pAddresses: Buffer[]
let pAddressStrings: string[]

const InitAvalanche = async () => {
  await avalanche.fetchNetworkSettings()
  pchain = avalanche.PChain()
  pKeychain = pchain.keyChain()
  pKeychain.importKey(multiSigAliasMember1PrivateKey)

  pAddresses = pchain.keyChain().getAddresses()
  pAddressStrings = pchain.keyChain().getAddressStrings()
}

const main = async (): Promise<any> => {
  await InitAvalanche()
  const msigAliasBuffer = pchain.parseAddress(msigAlias)
  const owner = await pchain.getMultisigAlias(msigAlias)

  const bondAmount: any = await pchain.getMinStake()

  let startTimestamp: number = Date.now() / 1000 + 600 // start after 10 minutes
  let endTimestamp: number = startTimestamp + 5184000 // exact 60 days
  const platformVMUTXOResponse = await pchain.getUTXOs([msigAlias])

  const proposalMsigCreator = msigAlias

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
      [[proposalMsigCreator], pAddressStrings], // fromAddresses
      [], // changeAddresses
      Buffer.from("hello world"), // description
      proposal, // proposal
      Buffer.from(proposalMsigCreator), // proposerAddress
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
    const unsignedTx2 = new UnsignedTx()
    unsignedTx2.fromBuffer(Buffer.from(hex, "hex"))

    const addProposalTx = unsignedTx2.getTransaction() as AddProposalTx
    const addProposalTxTypeName: string = addProposalTx.getTypeName()
    const addProposalTxTypeID: number = addProposalTx.getTypeID()

    const addMemberProposal = addProposalTx.getProposalPayload()

    console.log(addProposalTxTypeID, addProposalTxTypeName)
    console.log(hex)
    const txid: string = await pchain.issueTx(tx)
    console.log(`Success! TXID: ${txid}`)
  } catch (e) {
    console.log(e)
  }
}

main()

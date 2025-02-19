import {
  AddProposalTx,
  GeneralProposal,
  KeyChain,
  PlatformVMAPI,
  UnsignedTx,
  PlatformVMConstants,
  Tx
} from "caminojs/apis/platformvm"
import { Avalanche, BinTools, Buffer } from "caminojs/index"
import {
  DefaultLocalGenesisPrivateKey,
  PrivateKeyPrefix,
  PChainAlias
} from "caminojs/utils"
import { ExamplesConfig } from "../common/examplesConfig"
import BN from "bn.js"
import {
  MultisigKeyChain,
  MultisigKeyPair,
  OutputOwners
} from "caminojs/common"
import createHash from "create-hash"

// const config: ExamplesConfig = require("../common/examplesConfigDevKopernikus.json")
const config: ExamplesConfig = require("../common/examplesConfigLocalKopernikus.json")

const avalanche: Avalanche = new Avalanche(
  config.host,
  config.port,
  config.protocol,
  config.networkID
)
const bintools = BinTools.getInstance()
const member1 = "P-kopernikus1jla8ty5c9ud6lsj8s4re2dvzvfxpzrxdcrd8q7"
const member2 = "P-kopernikus13kyf72ftu4l77kss7xm0kshm0au29s48zjaygq"

// Multisig creator:
const multiSigAliasMember1PrivateKey =
  "PrivateKey-2Vtf2ZhTRz6WcVcSH7cS7ghKneZxZ2L5W8assdCcaNDVdpoYfY" // P-kopernikus1jla8ty5c9ud6lsj8s4re2dvzvfxpzrxdcrd8q7
const multiSigAliasMember2PrivateKey =
  "PrivateKey-Ge71NJhUY3TjZ9dLohijSnNq46QxobjqxHGMUDAPoVsNFA93w" // P-kopernikus13kyf72ftu4l77kss7xm0kshm0au29s48zjaygq

const msigAlias = "P-kopernikus15fpw65ge47lhnxgsnwxwmwm9ncpa8jg0yt0c97"

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
  const msigAliasBuffer = pchain.parseAddress(msigAlias)
  const owner = await pchain.getMultisigAlias(msigAlias)

  const bondAmount: any = await pchain.getMinStake()
  let startDate = new Date()
  startDate.setDate(startDate.getDate() + 1)
  let endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + 10)

  let startTimestamp: number = Math.floor(startDate.getTime() / 1000)
  let endTimestamp = Math.floor(endDate.getTime() / 1000)
  const platformVMUTXOResponse = await pchain.getUTXOs([msigAlias])

  const proposalMsigCreator = msigAlias
  const proposalMsigCreatorAuth: [number, string | Buffer][] = [
    [0, proposalMsigCreator]
  ]
  const proposal = new GeneralProposal(
    startTimestamp,
    endTimestamp,
    390000,
    680000,
    false
  )
  proposal.addGeneralOption(
    "THIS OPTION CONTENT IS 256 CHARACTERS LONG xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
  )
  proposal.addGeneralOption(
    "THIS OPTION CONTENT IS 250 CHARACTERS LONG yxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
  )
  proposal.addGeneralOption(
    "THIS OPTION CONTENT IS 256 CHARACTERS LONG zxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
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
      // [[proposalMsigCreator]], // fromAddresses
      [[proposalMsigCreator], pAddressStrings], // fromAddresses
      //[proposalMsigCreator], // changeAddresses
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

    const generalProposal = addProposalTx.getProposalPayload()

    console.log(addProposalTxTypeID, addProposalTxTypeName)
    console.log(hex)
    const txid: string = await pchain.issueTx(tx)
    console.log(`Success! TXID: ${txid}`)
  } catch (e) {
    console.log(e)
  }
}

main()

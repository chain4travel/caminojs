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
  Address,
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

const msig_one_threshold = "P-kopernikus1jht6eknptgycuykg6zd50sg8he5t4fap0a36fq"
const msig_two_threshold = "P-kopernikus1fa2tyhqvh408pk7gx375wkcqunl2zczcl4acht"

const new_member_address = "P-kopernikus1fa2tyhqvh408pk7gx375wkcqunl2zczcl4acht"
const msigAliasAddr = msig_one_owner

let pchain: PlatformVMAPI
let pKeychain: KeyChain
let pAddresses: Buffer[]
let pAddressStrings: string[]

const InitAvalanche = async () => {
  await avalanche.fetchNetworkSettings()
  pchain = avalanche.PChain()
  pKeychain = pchain.keyChain()
  pKeychain.importKey(multiSigAliasMember1PrivateKey)
  //pKeychain.importKey(multiSigAliasMember2PrivateKey)

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
  const aliasesMap = new Map([
    [msigAliasAddrBuffer.toString("hex"), msigAliasOwners]
  ])

  const bondAmount: any = await pchain.getMinStake()
  // let startDate =
  // startDate.setDate(startDate.getDate() + 1)
  // let endDate = new Date(startDate)
  // endDate.setDate(endDate.getDate() + 10)

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
  // https://github.com/chain4travel/camino-suite-voting/blob/suite-c4t/src/hooks/useProposals.ts#L410
  try {
    let signatures: [string, string][] = []
    let unsignedTx = await pchain.buildAddProposalTx(
      platformVMUTXOResponse.utxos, // utxoset
      [[msigAliasAddr], pAddressStrings], // fromAddresses
      [], // changeAddresses
      Buffer.from("hello world"), // description
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

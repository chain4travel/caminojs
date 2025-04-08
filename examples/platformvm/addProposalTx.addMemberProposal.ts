/* example meant to be run on local network with 5 validators (genesis_local_5_validators_2_multisigs.json) */
import {
  AddMemberProposal,
  AddProposalTx,
  KeyChain,
  PlatformVMAPI
} from "caminojs/apis/platformvm"
import { Avalanche, BinTools, Buffer } from "caminojs/index"
import { DefaultLocalGenesisPrivateKey, PrivateKeyPrefix } from "caminojs/utils"
import { ExamplesConfig } from "../common/examplesConfig"
import BN from "bn.js"

const config: ExamplesConfig = require("../common/examplesConfig.json")
const avalanche: Avalanche = new Avalanche(
  config.host,
  config.port,
  config.protocol,
  config.networkID
)
let privKey: string = `${PrivateKeyPrefix}${DefaultLocalGenesisPrivateKey}`

let pchain: PlatformVMAPI
let pKeychain: KeyChain
let pAddressStrings: string[]
const targetAddress = "P-kopernikus122gtala73kjrf34xtdq0d9vssqlccxjjam7kk8" // New member address - must be KYC verified
const bintools: BinTools = BinTools.getInstance()
const InitAvalanche = async () => {
  await avalanche.fetchNetworkSettings()
  pchain = avalanche.PChain()
  pKeychain = pchain.keyChain()
  pKeychain.importKey(privKey)

  pAddressStrings = pchain.keyChain().getAddressStrings()
}

const main = async (): Promise<any> => {
  await InitAvalanche()
  // TODO: @VjeraTurk get bondAmount from node
  let startTimestamp: number = Date.now() / 1000 + 60 // start after 1 minute
  let endTimestamp: number = startTimestamp + 5184000 // exact 60 days
  const timestamp = new Date().toISOString()

  const proposalDescription = `Add new member ${targetAddress} to the network. Created by caminojs examples at: ${timestamp}`
  const platformVMUTXOResponse = await pchain.getUTXOs(pAddressStrings)
  const proposal = new AddMemberProposal(
    startTimestamp,
    endTimestamp,
    targetAddress
  )
  try {
    let unsignedTx = await pchain.buildAddProposalTx(
      platformVMUTXOResponse.utxos, // utxoset
      pAddressStrings, // fromAddresses
      pAddressStrings, // changeAddresses
      Buffer.from(proposalDescription), // description
      proposal, // proposal
      pKeychain.getAddresses()[0], // proposerAddress
      0, // version
      Buffer.alloc(20) // memo
    )

    const tx = unsignedTx.sign(pKeychain)
    const hex = tx.toStringHex().slice(2)

    const addProposalTx = unsignedTx.getTransaction() as AddProposalTx
    const addProposalTxTypeName: string = addProposalTx.getTypeName()
    const addProposalTxTypeID: number = addProposalTx.getTypeID()
    console.log(hex)
    const txid: string = await pchain.issueTx(tx)
    console.log(addProposalTxTypeID, addProposalTxTypeName, timestamp)
    console.log("Proposer address:", pKeychain.getAddressStrings()[0])
    console.log(proposalDescription)
    console.log(`Success! TXID: ${txid}`)
  } catch (e) {
    console.log(e)
  }
}

main()

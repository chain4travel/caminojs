import {
  AddProposalTx,
  GeneralProposal,
  KeyChain,
  PlatformVMAPI
} from "caminojs/apis/platformvm"
import { Avalanche, Buffer } from "caminojs/index"
import { DefaultLocalGenesisPrivateKey, PrivateKeyPrefix } from "caminojs/utils"
import { ExamplesConfig } from "../common/examplesConfig"

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
const InitAvalanche = async () => {
  await avalanche.fetchNetworkSettings()
  pchain = avalanche.PChain()
  pKeychain = pchain.keyChain()
  pKeychain.importKey(privKey)

  pAddressStrings = pchain.keyChain().getAddressStrings()
}

const main = async (): Promise<any> => {
  await InitAvalanche()
  const bondAmount: any = await pchain.getMinStake()
  let startDate = new Date()
  startDate.setDate(startDate.getDate() + 1)
  let endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + 10)

  let startTimestamp: number = Date.now() / 1000 + 60 // add + 60 to start in 1 minute
  let endTimestamp: number = startTimestamp + 2592000 // exact 30 days

  const platformVMUTXOResponse = await pchain.getUTXOs(pAddressStrings)

  const timestamp = new Date().toISOString()
  const totalVotedThresholdNominator: number = 0 * 10000 // 0 - 100%
  const mostVotedThresholdNominator: number = 30 * 10000 // 0 - 100%
  const allowEarlyFinish: boolean = true

  const proposalDescription = Buffer.from(
    `This is a general proposal. Created by caminojs examples at: ${timestamp}.
    \nAllow early finish: ${allowEarlyFinish}.
    \nTotal voted threshold: ${totalVotedThresholdNominator}.
    \nMost voted threshold: ${mostVotedThresholdNominator}.`
  ) // description

  const proposal = new GeneralProposal(
    startTimestamp,
    endTimestamp,
    // 50, 50 If 1 of 2 voters vote, the proposal should pass - with just one vote
    // 0, 30 If 3 of 5 voters vote the same option, the proposal should pass - with 3 same votes
    totalVotedThresholdNominator,
    mostVotedThresholdNominator,
    allowEarlyFinish
  )
  proposal.addGeneralOption("General Proposal Option 1 is - color RED")
  proposal.addGeneralOption("General Proposal Option 2 is - color GREEN")
  proposal.addGeneralOption("General Proposal Option 3 is - color BLUE")

  try {
    let buffer = proposal.toBuffer()
    console.log(buffer)
  } catch (e) {
    console.log(e)
  }

  try {
    let unsignedTx = await pchain.buildAddProposalTx(
      platformVMUTXOResponse.utxos, // utxoset
      pAddressStrings, // fromAddresses
      pAddressStrings, // changeAddresses
      proposalDescription, // description
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

    const generalProposal = addProposalTx.getProposalPayload()

    console.log(addProposalTxTypeID, addProposalTxTypeName, timestamp)
    console.log(hex)
    const txid: string = await pchain.issueTx(tx)
    console.log("Proposer address:", pKeychain.getAddressStrings()[0])
    console.log(proposalDescription.toString())
    console.log(`Success! TXID: ${txid}`)
  } catch (e) {
    console.log(e)
  }
}

main()

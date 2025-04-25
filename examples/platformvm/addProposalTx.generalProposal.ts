import {
  AddProposalTx,
  GeneralProposal,
  KeyChain,
  PlatformVMAPI
} from "caminojs/apis/platformvm"
import { Avalanche, Buffer } from "caminojs/index"
import { DefaultLocalGenesisPrivateKey2, PrivateKeyPrefix } from "caminojs/utils"
import { fractionDenominator } from "./proposal-utils"
import config from "../common/examplesConfig.json"

const avalanche: Avalanche = new Avalanche(
  config.host,
  config.port,
  config.protocol,
  config.networkID
)
let privKey: string = `${PrivateKeyPrefix}${DefaultLocalGenesisPrivateKey2}`

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

  const startDelay = 5 // seconds
  const startTimestamp: number = Date.now() / 1000 + startDelay // seconds
  const endTimestamp: number = startTimestamp + 2592000 // +30 days
  let platformVMUTXOResponse = await pchain.getUTXOs(pAddressStrings)

  const exitCondition = {
    mostVotedThresholdNominator: 39 * fractionDenominator / 100,  // >39% (2/5 voters)
    totalVotedThresholdNominator: 39 * fractionDenominator / 100, // >39% (2/5 voters)
    allowEarlyFinish: true
  }

  let timestamp = new Date().toISOString()
  const proposalDescription = Buffer.from(
    `This is a general proposal. Created by caminojs examples at: ${timestamp}.
        \nAllow early finish: ${exitCondition.allowEarlyFinish}.
        \nTotal voted threshold: ${exitCondition.totalVotedThresholdNominator}.
        \nMost voted threshold: ${exitCondition.mostVotedThresholdNominator}.`
  )

  const proposal = new GeneralProposal(
    startTimestamp,
    endTimestamp,
    // 50, 50 If 1 of 2 voters vote, the proposal should pass - with just one vote
    // 0, 30 If 3 of 5 voters vote the same option, the proposal should pass - with 3 same votes
    exitCondition.totalVotedThresholdNominator,
    exitCondition.mostVotedThresholdNominator,
    exitCondition.allowEarlyFinish
  )
  proposal.addGeneralOption("General Proposal Option 1 is - color RED")
  proposal.addGeneralOption("General Proposal Option 2 is - color GREEN")
  proposal.addGeneralOption("General Proposal Option 3 is - color BLUE")

  try {
    let unsignedTx = await pchain.buildAddProposalTx(
      platformVMUTXOResponse.utxos,
      pAddressStrings, // fromAddresses
      pAddressStrings, // changeAddresses
      proposalDescription,
      proposal,
      pKeychain.getAddresses()[0], // proposerAddress
      0, // version
      Buffer.alloc(20) // memo
    )

    const tx = unsignedTx.sign(pKeychain)
    const hex = tx.toStringHex().slice(2)

    const addProposalTx = unsignedTx.getTransaction() as AddProposalTx
    const addProposalTxTypeName: string = addProposalTx.getTypeName()
    const addProposalTxTypeID: number = addProposalTx.getTypeID()

    console.log(`Tx type: ${addProposalTxTypeID} ${addProposalTxTypeName}`)
    console.log("Tx bytes:", hex)

    console.log(addProposalTxTypeID, addProposalTxTypeName, timestamp)
    const txID: string = await pchain.issueTx(tx)
    console.log("Proposer address:", pKeychain.getAddressStrings()[0])
    console.log(proposalDescription.toString())
    console.log(`Issued tx: ${txID}`)

    const txStatus = await pchain.awaitTx(txID)
    console.log("Tx status:", txStatus)
  } catch (e) {
    console.log(e)
  }
}

main()

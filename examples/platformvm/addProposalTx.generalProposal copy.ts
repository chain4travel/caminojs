import {
  AddProposalTx,
  GeneralProposal,
  KeyChain,
  PlatformVMAPI
} from "caminojs/apis/platformvm"
import { Avalanche, Buffer } from "caminojs/index"
import { DefaultLocalGenesisPrivateKey, PrivateKeyPrefix } from "caminojs/utils"
import { ExamplesConfig } from "../common/examplesConfig"
import {
  allCases,
  checkWhenEarlyFinishIsExpected,
  fractionDenominator
} from "./proposal-utils"

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

type exitConditions = {
  mostVotedThresholdNominator: number
  totalVotedThresholdNominator: number
  allowEarlyFinish: boolean
}
const main = async (): Promise<any> => {
  await InitAvalanche()
  let startDate = new Date()
  startDate.setDate(startDate.getDate() + 1)
  let endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + 10)

  let startTimestamp: number = Date.now() / 1000 + 15 // add + 60 to start in 1 minute
  let endTimestamp: number = startTimestamp + 2592000 // exact 30 days

  const exitConditions: exitConditions[] = [
    {
      mostVotedThresholdNominator: 0,
      totalVotedThresholdNominator: 39 * fractionDenominator,
      allowEarlyFinish: true
    },
    {
      mostVotedThresholdNominator: 0,
      totalVotedThresholdNominator: 0,
      allowEarlyFinish: true
    },
    {
      mostVotedThresholdNominator: 50 * fractionDenominator,
      totalVotedThresholdNominator: 50 * fractionDenominator,
      allowEarlyFinish: true
    },
    {
      mostVotedThresholdNominator: 100 * fractionDenominator,
      totalVotedThresholdNominator: 100 * fractionDenominator,
      allowEarlyFinish: true
    }
  ]

  for (const exitCondition of exitConditions) {
    for (let i = 0; i < allCases.length; i++) {
      let platformVMUTXOResponse = await pchain.getUTXOs(pAddressStrings)

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
        let buffer = proposal.toBuffer()
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
        // const hex = tx.toStringHex().slice(2)

        const addProposalTx = unsignedTx.getTransaction() as AddProposalTx
        const addProposalTxTypeName: string = addProposalTx.getTypeName()
        const addProposalTxTypeID: number = addProposalTx.getTypeID()

        // const generalProposal = addProposalTx.getProposalPayload()

        console.log(addProposalTxTypeID, addProposalTxTypeName, timestamp)
        // console.log(hex)
        const txid: string = await pchain.issueTx(tx)
        console.log("Proposer address:", pKeychain.getAddressStrings()[0])
        console.log(proposalDescription.toString())
        console.log(`Issued tx: ${txid}`)

        const txStatus = await pchain.getTxStatus(txid)
        console.log("Tx status:", txStatus)

        console.log(
          checkWhenEarlyFinishIsExpected(
            exitCondition.totalVotedThresholdNominator,
            exitCondition.mostVotedThresholdNominator,
            exitCondition.allowEarlyFinish,
            5,
            allCases[i],
            3
          )
        )
        console.log("--------------------------------")
      } catch (e) {
        console.log(e)
      }
    }
  }
}

main()

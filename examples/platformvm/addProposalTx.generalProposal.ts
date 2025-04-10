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

/**
 * In order to determine whether a proposal is successful or not, the conditions for a winning option must be configurable following this framework:
 * “Qualified majority”: there is a minimum threshold on the percentage of casted votes for one option, which must be a number between 50% (exclusive) and 100% (inclusive): 50% < VOTES <= 100%
 * “Relative majority”: Otherwise, no minimum threshold on percentages
 * The “quorum” of voters above which a proposal can be deemed valid, so that a winning option can be selected, is also configurable (but only in the backend): X% of active validators at proposal time must have voted
 * The backend makes the values for “majority” and “quorum” configurable in the proposal but the frontend will for now always choose the 50% for both.

  n - voters allowed to vote   -> TotalAllowedVoters (can only become less if somebody is excluded mid voting ?)
  m - voters voted so far     -> allowedVoters = n - m

  i - option index (range 0-2)

  totalVotedThresholdNominator- If the value is 100000 , it is enough that 10%  (m/n>=0.1) of voters submit their votes
  mostVotedThresholdNominator - If the value is 100000 , it is enough that 10% (votes[i]>= 0.1) of voters all pick the option i

  Allowed voters are all active validator at the time of proposal creation
**/
const fractionDenominator_v100_000 = 1000000
const checkWhenEarlyFinishIsExpected = (
  totalVotedThresholdNominator: number,
  mostVotedThresholdNominator: number,
  allowEarlyFinish: boolean,
  allowedVoters: number,
  votes: number[]
) => {
  let votesForOption = [0, 0, 0]

  let totalVotedThresholdReached = false
  let mostVotedThresholdReached = false

  for (let i = 0; i < votes.length; i++) {
    let votedSofarPercent = (i + 1) / allowedVoters
    if (
      votedSofarPercent * fractionDenominator_v100_000 >
      totalVotedThresholdNominator
    ) {
      totalVotedThresholdReached = true
    }

    votesForOption[votes[i]]++

    for (let j = 0; j < votesForOption.length; j++) {
      let votedSofarPercentForOption = votesForOption[j] / allowedVoters
      if (
        votedSofarPercentForOption * fractionDenominator_v100_000 >
        mostVotedThresholdNominator
      ) {
        mostVotedThresholdReached = true
      }
    }

    if (
      allowEarlyFinish &&
      totalVotedThresholdReached &&
      mostVotedThresholdReached &&
      i + 1 !== allowedVoters // TODO: will it still trigger ?!
    ) {
      return (
        "For" +
        " allowEarlyFinish " +
        allowEarlyFinish +
        "\nvotes " +
        votes +
        "\ntotalVotedThresholdNominator " +
        totalVotedThresholdNominator +
        "(" +
        totalVotedThresholdNominator / v10_000 +
        "%)" +
        "\nmostVotedThresholdNominator " +
        mostVotedThresholdNominator +
        "(" +
        mostVotedThresholdNominator / v10_000 +
        "%)" +
        "\nallowedVoters " +
        allowedVoters +
        "\n______________________________" +
        "\nEarly finish is expected after " +
        (i + 1) +
        " votes" +
        "\n______________________________"
      )
    }
  }

  return (
    "For" +
    " allowEarlyFinish " +
    allowEarlyFinish +
    "\nvotes " +
    votes +
    "\ntotalVotedThresholdNominator " +
    totalVotedThresholdNominator +
    "(" +
    totalVotedThresholdNominator / v10_000 +
    "%)" +
    "\nmostVotedThresholdNominator " +
    mostVotedThresholdNominator +
    "(" +
    mostVotedThresholdNominator / v10_000 +
    "%)" +
    "\nallowedVoters " +
    allowedVoters +
    "\n______________________________" +
    "\nEarly finish not expected" +
    "\n______________________________"
  )
}
const v10_000 = 10000
const main = async (): Promise<any> => {
  await InitAvalanche()
  const bondAmount: any = await pchain.getMinStake()
  let startDate = new Date()
  startDate.setDate(startDate.getDate() + 1)
  let endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + 10)

  let startTimestamp: number = Date.now() / 1000 // add + 60 to start in 1 minute
  let endTimestamp: number = startTimestamp + 2592000 // exact 30 days

  const platformVMUTXOResponse = await pchain.getUTXOs(pAddressStrings)

  const timestamp = new Date().toISOString()
  const totalVotedThresholdNominator: number = 0 * v10_000 // 0 - 100% // 0
  const mostVotedThresholdNominator: number = 39 * v10_000 // 0 - 100% // 390000
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

  console.log(
    checkWhenEarlyFinishIsExpected(
      totalVotedThresholdNominator,
      mostVotedThresholdNominator,
      allowEarlyFinish,
      5,
      [0, 1, 0, 1, 0]
    )
  )

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

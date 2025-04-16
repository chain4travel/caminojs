import * as fs from "fs"
import * as path from "path"
// Path to store proposal IDs
const proposalIdsPath = path.resolve(
  __dirname,
  "../common/latestProposalIds.json"
)

export const addProposalId = (txid: string) => {
  try {
    let data = { proposalIds: [txid] }

    // Check if file exists and read it
    if (fs.existsSync(proposalIdsPath)) {
      const fileContent = fs.readFileSync(proposalIdsPath, "utf8")
      const jsonData = JSON.parse(fileContent)

      // Add new proposal ID to the beginning of the array
      jsonData.proposalIds.unshift(txid)

      // Keep only the latest 5 proposal IDs
      if (jsonData.proposalIds.length > 5) {
        jsonData.proposalIds = jsonData.proposalIds.slice(0, 5)
      }

      data = jsonData
    }

    // Write updated data back to file
    fs.writeFileSync(proposalIdsPath, JSON.stringify(data, null, 2))
    console.log(`Proposal ID saved to ${proposalIdsPath}`)
  } catch (error) {
    console.error("Error saving proposal ID:", error)
  }
}

// Function to read proposal IDs
export const getProposalIds = (): string[] => {
  try {
    if (fs.existsSync(proposalIdsPath)) {
      const fileContent = fs.readFileSync(proposalIdsPath, "utf8")
      const jsonData = JSON.parse(fileContent)
      return jsonData.proposalIds || []
    }
  } catch (error) {
    console.error("Error reading proposal IDs:", error)
  }
  return []
}

// Parse command-line arguments to get proposal ID
export const getProposalIdFromArgs = (): string | null => {
  const args = process.argv.slice(2)
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--proposalId" && i + 1 < args.length) {
      return args[i + 1]
    }
  }
  return null
}

const AllCases = [
  [0, 0, 0, 0, 0],
  [0, 0, 0, 0, 1],
  [0, 0, 0, 1, 0],
  [0, 0, 0, 1, 1],
  [0, 0, 1, 0, 0],
  [0, 0, 1, 0, 1],
  [0, 0, 1, 1, 0],
  [0, 0, 1, 1, 1],
  [0, 1, 0, 0, 0],
  [0, 1, 0, 0, 1],
  [0, 1, 0, 1, 0],
  [0, 1, 0, 1, 1],
  [0, 1, 1, 0, 0],
  [0, 1, 1, 0, 1],
  [0, 1, 1, 1, 0],
  [0, 1, 1, 1, 1],
  [1, 0, 0, 0, 0],
  [1, 0, 0, 0, 1],
  [1, 0, 0, 1, 0],
  [1, 0, 0, 1, 1],
  [1, 0, 1, 0, 0],
  [1, 0, 1, 0, 1],
  [1, 0, 1, 1, 0],
  [1, 0, 1, 1, 1],
  [1, 1, 0, 0, 0],
  [1, 1, 0, 0, 1],
  [1, 1, 0, 1, 0],
  [1, 1, 0, 1, 1],
  [1, 1, 1, 0, 0],
  [1, 1, 1, 0, 1],
  [1, 1, 1, 1, 0],
  [1, 1, 1, 1, 1]
]

export const allCases = [
  [0, 1, 0, 1, 0],
  [0, 0, 0, 0, 0],
  [1, 1, 1, 1, 1],
  [0, 0, 1, 0, 0]
]

/**
 * In order to determine whether a proposal is successful or not, the conditions for a winning option must be configurable following this framework:
 *
 * "Qualified majority": there is a minimum threshold on the percentage of casted votes for one option, which must be a number between 50% (exclusive) and 100% (inclusive): 50% < VOTES <= 100%
 * "Relative majority": Otherwise, no minimum threshold on percentages
 * The "quorum" of voters above which a proposal can be deemed valid, so that a winning option can be selected, is also configurable (but only in the backend): X% of active validators at proposal time must have voted
 * The backend makes the values for "majority" and "quorum" configurable in the proposal

  n - voters allowed to vote   -> TotalAllowedVoters (what happens if somebody is excluded mid voting ?)
  m - voters voted so far     -> allowedVoters = n - m

  j - option index (range 0-2)

  totalVotedThresholdNominator- If the value is 50 0000 , it is enough that 50%  (m/n>0.5) of voters submit their votes
  mostVotedThresholdNominator - If the value is 50 0000 , it is enough that 50% (votes[i]> 0.5) of voters all pick the same option j

  Backend and frontend provide the possibility to configure an early exist condition as a boolean which checks that the criteria for winning the proposal is already met and no other option can win at that time. In this case it exists early with a successful result. Default is for early exit to be disabled.

  Allowed voters are all active validator at the time of proposal activation

**/
export const fractionDenominator = 1000000

export const checkWhenEarlyFinishIsExpected = (
  totalVotedThresholdNominator: number,
  mostVotedThresholdNominator: number,
  allowEarlyFinish: boolean,
  allowedVoters: number,
  votes: number[],
  numberOfOptions: number
) => {
  const votesForOption = new Array(numberOfOptions).fill(0)

  for (let i = 0; i < votes.length; i++) {
    votesForOption[votes[i]]++
    const voted = i + 1
    const totalVotedThreshold =
      (totalVotedThresholdNominator * allowedVoters) / fractionDenominator

    const mostVotedThreshold =
      (voted * mostVotedThresholdNominator) / fractionDenominator

    const maxVotes = Math.max(...votesForOption)
    const leaders = votesForOption
      .map((v, idx) => ({ idx, v }))
      .filter((o) => o.v === maxVotes)
    const unambiguous = leaders.length === 1

    const mostVotedIndex = leaders[0]?.idx ?? 0
    const remainingVotes = allowedVoters - voted

    // second most voted
    const secondVotes = Math.max(
      ...votesForOption.map((v, idx) => (idx !== mostVotedIndex ? v : 0))
    )

    const noOtherOptionCanWin = remainingVotes + secondVotes < maxVotes

    const mostVotedThresholdReached = maxVotes > mostVotedThreshold
    const totalVotedThresholdReached = voted > totalVotedThreshold

    const canFinish =
      allowEarlyFinish &&
      (voted === allowedVoters ||
        (unambiguous &&
          (noOtherOptionCanWin || numberOfOptions === 1) &&
          mostVotedThresholdReached &&
          totalVotedThresholdReached))

    if (canFinish) {
      return (
        "✅ Finish is expected after " +
        voted +
        " votes\n" +
        `votes so far: [${votes.slice(0, voted)}]\n` +
        `all votes: [${votes}]\n` +
        `numberOfOptions: ${numberOfOptions}\n` +
        `allowedVoters: ${allowedVoters}\n` +
        `totalVotedThresholdNominator: ${totalVotedThresholdNominator}\n` +
        `mostVotedThresholdNominator: ${mostVotedThresholdNominator}\n` +
        `_______________________________\n` +
        `totalVotedThreshold: ${totalVotedThreshold.toFixed(2)}\n` +
        `mostVotedThreshold: ${mostVotedThreshold.toFixed(2)}\n` +
        `leadingOptionIndex: ${mostVotedIndex} with ${maxVotes} votes\n` +
        `secondHighestVotes: ${secondVotes} with index ${votesForOption.indexOf(
          secondVotes
        )}\n` +
        `remainingVotes: ${remainingVotes}\n` +
        `unambiguous: ${unambiguous}\n`
      )
    }
  }

  return (
    "❌ Finish not triggered " +
    `earlyFinish: ${allowEarlyFinish}\n` +
    `_______________________________` +
    `votes: [${votes}]\n` +
    `numberOfOptions: ${numberOfOptions}\n` +
    `allowedVoters: ${allowedVoters}\n`
  )
}

const testAllCases = () => {
  for (let i = 0; i < allCases.length; i++) {
    for (let j = 100000; j < 1000000; j = j + 100000) {
      console.log(
        checkWhenEarlyFinishIsExpected(j, 500000, true, 5, allCases[i], 3)
      )
    }
  }
}

const main = async (): Promise<any> => {
  testAllCases()
}

main()

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

export const fractionDenominator = 1000000

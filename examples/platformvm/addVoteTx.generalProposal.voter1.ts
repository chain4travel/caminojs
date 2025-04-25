import { AddVoteTx } from "caminojs/apis/platformvm"
import { Avalanche, Buffer, BinTools } from "caminojs/index"
import { 
  DefaultLocalGenesisPrivateKey2,
  DefaultLocalGenesisPrivateKey,
  DefaultLocalGenesisPrivateKey3,
  DefaultLocalGenesisPrivateKey4,
  DefaultLocalGenesisPrivateKey5,
  PrivateKeyPrefix
} from "caminojs/utils"
import config from "../common/examplesConfig.json"
const avalanche: Avalanche = new Avalanche(
  config.host,
  config.port,
  config.protocol,
  config.networkID
)

let voters: [string, number][] = [
  [DefaultLocalGenesisPrivateKey2,  0],
  [DefaultLocalGenesisPrivateKey, 1],
  [DefaultLocalGenesisPrivateKey3, 0],
  [DefaultLocalGenesisPrivateKey4, 2],
  [DefaultLocalGenesisPrivateKey5, 2],
]
for (let i = 0; i < 5; i++) voters[i][0]=`${PrivateKeyPrefix}${voters[i][0]}`


const main = async (): Promise<any> => {
  await avalanche.fetchNetworkSettings()
  const pchain = avalanche.PChain()
  const bintools: BinTools = BinTools.getInstance()

  // To find the proposal ID:
  // 1. First create a proposal using addProposalTx.generalProposal.ts
  // 2. The transaction ID returned from issueTx() is your proposal ID
  // 3. You can also get it from the blockchain explorer or by querying the node
  const proposalID = "2EE97uACw3y13uTXokoZqmaoNLaQhztzVsPybmMHwiGfSLHz7i" // This is an example ID, replace with your actual proposal ID

  // Both voters will vote for option 0
  const voteOptionIndex = 0

  for (let i = 0; i < voters.length; i++) {
    const pKeychain = pchain.newKeyChain()
    pKeychain.importKey(voters[i][0])
    const pAddressStrings = pchain.keyChain().getAddressStrings()

    const platformVMUTXOResponse = await pchain.getUTXOs(pAddressStrings)

    try {
      console.log(`keys[${i}] ${voters[i]} ${bintools.addressToString("kopernikus", "P", pKeychain.getAddresses()[0])} voting for proposal ${proposalID}`)
      console.log(pAddressStrings)
      let unsignedTx = await pchain.buildAddVoteTx(
        platformVMUTXOResponse.utxos,
        pAddressStrings, // fromAddresses
        pAddressStrings, // changeAddresses
        proposalID,
        voters[i][1],
        pKeychain.getAddresses()[0], // voterAddress
        0, // version
        Buffer.alloc(20) // memo
      )
  
      // Sign and issue the transaction for the first voter
      const tx = unsignedTx.sign(pKeychain)
      const hex = tx.toStringHex().slice(2)
  
      const addVoteTx = unsignedTx.getTransaction() as AddVoteTx
      const addVoteTxTypeName: string = addVoteTx.getTypeName()
      const addVoteTxTypeID: number = addVoteTx.getTypeID()
  
      console.log("Type ID:", addVoteTxTypeID)
      console.log("Type Name:", addVoteTxTypeName)
      console.log("Transaction Hex:", hex)
  
      const txID: string = await pchain.issueTx(tx)
      console.log(`Issued tx: ${txID}`)
      const txStatus = await pchain.awaitTx(txID)
      console.log("Tx status:", txStatus)
    } catch (e) {
      console.log("Error:", e)
    }
  }
}
main()

import { Avalanche, Buffer } from "caminojs/index"
import {
  PlatformVMAPI,
  KeyChain,
  AddMemberProposal
} from "caminojs/apis/platformvm"
import {
  PrivateKeyPrefix,
  DefaultLocalGenesisPrivateKey2,
  Serialization
} from "caminojs/utils"
import { ExamplesConfig } from "../common/examplesConfig"

const serialization = Serialization.getInstance()
const config: ExamplesConfig = require("../common/examplesConfig.json")
const avalanche: Avalanche = new Avalanche(
  config.host,
  config.port,
  config.protocol,
  config.networkID
)

// Owner address:
// P-kopernikus1auqztcq6nf6qxvswuzluxxea8ua85sxr9l5tpp
// PrivateKey-A6sGxNKkf8U1CG41EkgrFEEQSxk6HS1hfDocaUpsaCmxao1dE

// Multisig (1 owner, 1 participant, threshold 1):
// P-kopernikus1fyddgjw0vgqy498vsutlgtc998ltjxe4l2fy4a

// Mutisig allias:
const msigAlias = "P-kopernikus1fyddgjw0vgqy498vsutlgtc998ltjxe4l2fy4a"

const pkeys = ["PrivateKey-A6sGxNKkf8U1CG41EkgrFEEQSxk6HS1hfDocaUpsaCmxao1dE"] // privateKey of the owner
const owner = {
  addresses: ["P-kopernikus1auqztcq6nf6qxvswuzluxxea8ua85sxr9l5tpp"], // address of the owner
  threshold: 1,
  locktime: 0
}

let pchain: PlatformVMAPI
let pKeychain: KeyChain
let pAddresses: Buffer[]
let pAddressStrings: string[]

const InitAvalanche = async () => {
  await avalanche.fetchNetworkSettings()
  pchain = avalanche.PChain()
  pKeychain = pchain.keyChain()
  pKeychain.importKey(pkeys[0])
  pAddresses = pchain.keyChain().getAddresses()
  pAddressStrings = pchain.keyChain().getAddressStrings()
}

const main = async (): Promise<any> => {
  await InitAvalanche()
  const msigAliasBuffer = pchain.parseAddress(msigAlias)
  const memo: Buffer = Buffer.from("hello world")
  const txs = await pchain?.getUTXOs([msigAlias])
  let startDate = new Date()
  startDate.setDate(startDate.getDate() + 1)
  let endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + 60)

  let startTimestamp = Math.floor(startDate.getTime() / 1000)
  let endTimestamp = Math.floor(endDate.getTime() / 1000)
  const proposal = new AddMemberProposal(
    startTimestamp,
    endTimestamp,
    "P-kopernikus13kyf72ftu4l77kss7xm0kshm0au29s48zjaygq" //target address
  )
  try {
    const unsignedTx = await pchain.buildAddProposalTx(
      txs.utxos,
      [msigAlias, ...owner.addresses],
      [],
      serialization.typeToBuffer("Heelloooo world", "utf8"),
      proposal,
      msigAliasBuffer,
      0
    )
    console.log({ unsignedTx })
    const tx = unsignedTx.sign(pKeychain)
    const txid: string = await pchain.issueTx(tx)
    console.log(`Success! TXID: ${txid}`)
  } catch (e) {
    console.log(e)
  }

  // const unsignedTx: UnsignedTx = await pchain.buildAddProposalTx()
}

main()

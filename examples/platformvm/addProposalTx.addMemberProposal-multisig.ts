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
const msigAlias = "P-kopernikus1u4acv3z62ezyat59jl86twknve89nlhrw3a0mf"
const pkeys = [""] // privateKey of the owner
const owner = {
  addresses: [""], // address of the owner
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
    "" //target address
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
  } catch (e) {
    console.log(e)
  }

  // const unsignedTx: UnsignedTx = await pchain.buildAddProposalTx()
}

main()

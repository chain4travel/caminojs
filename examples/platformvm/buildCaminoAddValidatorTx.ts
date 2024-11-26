import { Avalanche, BN, Buffer } from "caminojs/index"
import {
  PlatformVMAPI,
  KeyChain,
  UTXOSet,
  UnsignedTx,
  Tx
} from "caminojs/apis/platformvm"
import {
  PrivateKeyPrefix,
  DefaultLocalGenesisPrivateKey,
  UnixNow
} from "caminojs/utils"
import { ExamplesConfig } from "../common/examplesConfig"

const config: ExamplesConfig = require("../common/examplesConfig.json")
const avalanche: Avalanche = new Avalanche(
  config.host,
  config.port,
  config.protocol,
  config.networkID
)

const privKey: string = `${PrivateKeyPrefix}${DefaultLocalGenesisPrivateKey}`
const threshold: number = 1
const locktime: BN = new BN(0)
const memo: Buffer = Buffer.from(
  "PlatformVM utility method buildAddValidatorTx to add a validator to the primary subnet"
)
const nodeID: string = "NodeID-D1LbWvUf9iaeEyUbTYYtYq4b7GaYR5tnJ"
const startTime: BN = UnixNow().add(new BN(60 * 1))
const endTime: BN = startTime.add(new BN(26300000))
const delegationFee: number = 10

let pchain: PlatformVMAPI
let pKeychain: KeyChain
let pAddressStrings: string[]

const msigAliasArray = [
  "P-kopernikus1fq0jc8svlyazhygkj0s36qnl6s0km0h3uuc99w",
  "P-kopernikus1k4przmfu79ypp4u7y98glmdpzwk0u3sc7saazy"
]
const msigAlias = msigAliasArray[0]

const InitAvalanche = async () => {
  await avalanche.fetchNetworkSettings()
  pchain = avalanche.PChain()
  pKeychain = pchain.keyChain()
  pKeychain.importKey(privKey)
  pAddressStrings = pchain.keyChain().getAddressStrings()
}

type NodeOwnerType = {
  address: string
  auth: [number, string][]
}
const main = async (): Promise<any> => {
  await InitAvalanche()

  const stakeAmount: any = await pchain.getMinStake()
  const platformVMUTXOResponse: any = await pchain.getUTXOs(pAddressStrings)
  const utxoSet: UTXOSet = platformVMUTXOResponse.utxos

  const nodeOwner: NodeOwnerType = { address: "", auth: [] }
  const unsignedTx: UnsignedTx = await pchain.buildCaminoAddValidatorTx(
    utxoSet,
    pAddressStrings,
    pAddressStrings,
    nodeID,
    /*    {
      address: msigAlias,
      auth: [[0, msigAliasArray[0]]]
    },
    */
    nodeOwner,
    // nodeOwner,
    startTime,
    endTime,
    stakeAmount.minValidatorStake,
    pAddressStrings,
    locktime,
    threshold,
    memo
  )

  const tx: Tx = unsignedTx.sign(pKeychain)
  const txid: string = await pchain.issueTx(tx)
  console.log(`Success! TXID: ${txid}`)
}

main()

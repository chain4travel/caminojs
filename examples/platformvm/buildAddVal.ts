import { Avalanche, BN, Buffer } from "caminojs/index"
import {
  PlatformVMAPI,
  KeyChain,
  UTXOSet,
  UnsignedTx,
  Tx
} from "caminojs/apis/platformvm"
import { UnixNow } from "caminojs/utils"

type NodeOwnerType = {
  address: string
  auth: [number, string][]
}

const avalanche: Avalanche = new Avalanche(
  "kopernikus.camino.network",
  443,
  "https",
  1002
)

const privKey: string =
  "PrivateKey-2Wvi67aaZHHJH6YXofwb4h4QBMT88BB6xSXEqE6JgpUxuoA6jf"
const threshold: number = 1
const locktime: BN = new BN(0)
const memo: Buffer = Buffer.from(
  "PlatformVM utility method buildAddValidatorTx to add a validator to the primary subnet"
)
const nodeID: string = "NodeID-NLA8UKjhuMHV4QS4DbX3sFACCXC5oQVp7"
const startTime: BN = UnixNow().add(new BN(60 * 1))
const endTime: BN = startTime.add(new BN(26300000))
const delegationFee: number = 10

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

  const stakeAmount: any = await pchain.getMinStake()
  const platformVMUTXOResponse: any = await pchain.getUTXOs(pAddressStrings)
  const utxoSet: UTXOSet = platformVMUTXOResponse.utxos
  const nodeOwner: NodeOwnerType = { address: "", auth: [] }
  const unsignedTx: UnsignedTx = await pchain.buildCaminoAddValidatorTx(
    utxoSet,
    pAddressStrings,
    pAddressStrings,
    nodeID,
    nodeOwner,
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

main().then((r) => {})

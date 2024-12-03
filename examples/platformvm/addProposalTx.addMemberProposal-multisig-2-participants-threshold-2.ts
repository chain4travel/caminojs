import { Avalanche, BN, Buffer } from "caminojs/index"
import BinTools from "caminojs/utils/bintools"

import {
  PlatformVMAPI,
  KeyChain,
  AddMemberProposal,
  PlatformVMConstants,
  Tx
} from "caminojs/apis/platformvm"
import {
  PrivateKeyPrefix,
  DefaultLocalGenesisPrivateKey2,
  Serialization,
  DefaultLocalGenesisPrivateKey,
  PChainAlias
} from "caminojs/utils"
const bintools: BinTools = BinTools.getInstance()
import { ExamplesConfig } from "../common/examplesConfig"
import createHash from "create-hash"
import {
  MultisigKeyChain,
  MultisigKeyPair,
  OutputOwners
} from "caminojs/common"

const serialization = Serialization.getInstance()
const config: ExamplesConfig = require("../common/examplesConfig.json")
const avalanche: Avalanche = new Avalanche(
  config.host,
  config.port,
  config.protocol,
  config.networkID
)
let privKey: string = `${PrivateKeyPrefix}${DefaultLocalGenesisPrivateKey}`
let privKey2: string = `${PrivateKeyPrefix}${DefaultLocalGenesisPrivateKey2}`
const msigAlias = "P-kopernikus1t5qgr9hcmf2vxj7k0hz77kawf9yr389cxte5j0"

let pchain: PlatformVMAPI
let pKeychain: KeyChain
let pAddresses: Buffer[]
let pAddressStrings: string[]

const InitAvalanche = async () => {
  await avalanche.fetchNetworkSettings()
  pchain = avalanche.PChain()
  pKeychain = pchain.keyChain()
  pKeychain.importKey(privKey)
  pKeychain.importKey(privKey2)
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
    "P-kopernikus13kyf72ftu4l77kss7xm0kshm0au29s48zjaygq" //TODO: @Vjera add or use KYC verified address
  )
  try {
    const owner = await pchain.getMultisigAlias(msigAlias)
    const unsignedTx = await pchain.buildAddProposalTx(
      txs.utxos,
      [msigAlias, ...owner.addresses], // TODO: @VjeraTurk how to determine the fromAddresses?
      [], // TODO: @VjeraTurk how to determine the changeAddresses?
      serialization.typeToBuffer("Heelloooo world", "utf8"),
      proposal,
      msigAliasBuffer,
      0,
      memo
    )
    // Create the hash from the tx
    const txbuff = unsignedTx.toBuffer()
    const msg: Buffer = Buffer.from(
      createHash("sha256").update(txbuff).digest()
    )

    // create MSKeychein to create proper signidx
    const msKeyChain = new MultisigKeyChain(
      avalanche.getHRP(),
      PChainAlias,
      msg,
      PlatformVMConstants.SECPMULTISIGCREDENTIAL,
      unsignedTx.getTransaction().getOutputOwners(),
      new Map([
        [
          msigAliasBuffer.toString("hex"),
          new OutputOwners(
            owner.addresses.map((a) => bintools.parseAddress(a, "P")),
            new BN(owner.locktime),
            owner.threshold
          )
        ]
      ])
    )

    for (let address of pAddresses) {
      // We need the keychain for signing
      const keyPair = pKeychain.getKey(address)
      // The signature
      const signature = keyPair.sign(msg)
      // add the signature
      msKeyChain.addKey(new MultisigKeyPair(msKeyChain, address, signature))
    }

    msKeyChain.buildSignatureIndices()

    // Send TX
    const tx: Tx = unsignedTx.sign(msKeyChain)
    const txid: string = await pchain.issueTx(tx)
    console.log(`Success! TXID: ${txid}`)
  } catch (e) {
    console.log(e)
  }

  // const unsignedTx: UnsignedTx = await pchain.buildAddProposalTx()
}

main()

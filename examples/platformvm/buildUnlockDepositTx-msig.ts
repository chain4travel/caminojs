import { Avalanche, BinTools, Buffer } from "caminojs/index"
import {
  PlatformVMAPI,
  PlatformVMConstants,
  KeyChain,
  UnlockDepositTx
} from "caminojs/apis/platformvm"
import {
  DefaultLocalGenesisPrivateKey,
  DefaultLocalGenesisPrivateKey2,
  PrivateKeyPrefix,
  PChainAlias
} from "caminojs/utils"
import BN from "bn.js"
import config from "../common/examplesConfig.json"
import createHash from "create-hash"
import {
  MultisigKeyChain,
  MultisigKeyPair,
  OutputOwners
} from "caminojs/common"

const avalanche: Avalanche = new Avalanche(
  config.host,
  config.port,
  config.protocol,
  config.networkID
)
const bintools = BinTools.getInstance()

// Multisig keys:
const multiSigAliasMember1PrivateKey = `${PrivateKeyPrefix}${DefaultLocalGenesisPrivateKey}`
const multiSigAliasMember2PrivateKey = `${PrivateKeyPrefix}${DefaultLocalGenesisPrivateKey2}`
// Multisig Example where creator is an Multisig address with 2 owners (threshold 1 or 2)
const msigAliasAddr = "P-kopernikus1t5qgr9hcmf2vxj7k0hz77kawf9yr389cxte5j0"

let pchain: PlatformVMAPI
let pKeychain: KeyChain
let pAddresses: Buffer[]
let pAddressStrings: string[]
const InitAvalanche = async () => {
  await avalanche.fetchNetworkSettings()
  pchain = avalanche.PChain()
  pKeychain = pchain.keyChain()
  pKeychain.importKey(multiSigAliasMember1PrivateKey)
  pKeychain.importKey(multiSigAliasMember2PrivateKey)

  pAddresses = pchain.keyChain().getAddresses()
  pAddressStrings = pchain.keyChain().getAddressStrings()
}

const main = async (): Promise<any> => {
  await InitAvalanche()

  const msigAliasAddrBuffer = pchain.parseAddress(msigAliasAddr) // deposited and fee utxos owner
  const msigAlias = await pchain.getMultisigAlias(msigAliasAddr)

  const platformvmUTXOResponse = await pchain.getUTXOs([msigAliasAddr])

  const undeposits = [
    {
      amount: 100_000_000_000,
      depositTxID: "2hkXkXYJHurnS2EmqeoicubiSRgqnD5Q8HeiP4wcxrKFC92k5y"
    }
  ]

  try {
    const unsignedTx = await pchain.buildUnlockDepositTx(
      platformvmUTXOResponse.utxos,
      [[msigAliasAddr], pAddressStrings], // fromAddresses
      Buffer.from("unDepositTx with single-sig deposit "), // memo
      undeposits
    )

    // Create signatures as part of the example
    const msg: Buffer = Buffer.from(
      createHash("sha256").update(unsignedTx.toBuffer()).digest()
    )
    let signatures: [string, string][] = []
    for (let address of pAddresses) {
      // We need the keychain for signing
      const keyPair = pKeychain.getKey(address)
      // The signature
      const signature = keyPair.sign(msg)
      // save the signature
      signatures.push([keyPair.getAddressString(), signature.toString("hex")])
    }

    const msKeyChain = new MultisigKeyChain(
      avalanche.getHRP(),
      PChainAlias,
      msg,
      PlatformVMConstants.SECPMULTISIGCREDENTIAL,
      unsignedTx.getTransaction().getOutputOwners(),
      new Map([
        [
          msigAliasAddrBuffer.toString("hex"),
          new OutputOwners(
            msigAlias.addresses.map((a) => bintools.parseAddress(a, "P")),
            new BN(msigAlias.locktime),
            msigAlias.threshold
          )
        ]
      ])
    )

    // load the signatures from the store/map/signavault
    for (let [addressString, hexSignature] of signatures) {
      let address = pchain.parseAddress(addressString)
      let signature = Buffer.from(hexSignature, "hex")
      msKeyChain.addKey(new MultisigKeyPair(msKeyChain, address, signature))
    }

    msKeyChain.buildSignatureIndices()

    const tx = unsignedTx.sign(msKeyChain)
    const hex = tx.toStringHex().slice(2)

    const unlockDepositTx = unsignedTx.getTransaction() as UnlockDepositTx
    const unlockDepositTxTypeName: string = unlockDepositTx.getTypeName()
    const unlockDepositTxTypeID: number = unlockDepositTx.getTypeID()

    console.log(`Tx type: ${unlockDepositTxTypeID} ${unlockDepositTxTypeName}`)
    console.log("Tx bytes:", hex)

    const txID = await pchain.issueTx(tx)
    console.log(`Issued tx: ${txID}`)

    const txStatus = await pchain.awaitTx(txID)
    console.log("Tx status:", txStatus)
  } catch (e) {
    console.log(e)
  }
}

main()

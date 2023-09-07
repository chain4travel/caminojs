import BinTools from "caminojs/utils/bintools"
import { Buffer } from "buffer/"
import createHash from "create-hash"
import { Signature } from "caminojs/common"
import { KeyChain, KeyPair } from "caminojs/apis/touristicvm"

const bintools: BinTools = BinTools.getInstance()

const privateKeyOfIssuer =
  "PrivateKey-vmRQiZeXEXYMyJhEiqdC2z5JhuDbxL8ix9UVvjgMu2Er1NepE"
function main() {
  const issuer = bintools.stringToAddress(
    "T-kopernikus1g65uqn6t77p656w64023nh8nd9updzmxh8ttv3"
  )
  const beneficiary = bintools.stringToAddress(
    "T-kopernikus18jma8ppw3nhx5r4ap8clazz0dps7rv5uuvjh68"
  )
  const amount = 10000

  // 1. build message to sign out of issuer, beneficiary and amount
  const messageToSign =
    bintools.cb58Encode(issuer) + bintools.cb58Encode(beneficiary) + amount

  // 2. hashed message to sign
  const hashedMessage: Buffer = Buffer.from(
    createHash("sha256").update(messageToSign).digest()
  )

  // 3. sign message
  const kc = new KeyChain("kopernikus", "T")
  const keypair: KeyPair = kc.importKey(privateKeyOfIssuer)
  const signval: Buffer = keypair.sign(hashedMessage)
  const sig: Signature = new Signature()
  sig.fromBuffer(signval)
  console.log(`Signature: ${sig.toBuffer().toString("hex")}`)
}

main()

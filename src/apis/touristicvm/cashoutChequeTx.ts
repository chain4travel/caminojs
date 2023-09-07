/**
 * @packageDocumentation
 * @module API-TouristicVM-ImportTx
 */
import { TouristicVmConstants } from "./constants"
import { BaseTx } from "./basetx"
import {
  DefaultNetworkID,
  Serialization,
  SerializedEncoding
} from "caminojs/utils"
import { Credential, SigIdx, Signature } from "caminojs/common"
import { Buffer } from "buffer/"
import BinTools from "caminojs/utils/bintools"
import { KeyChain, KeyPair } from "./keychain"
import { SelectCredentialClass } from "./credentials"
import { TransferableOutput } from "./outputs"
import { TransferableInput } from "./inputs"
import { Auth } from "./auth"
import { SubnetAuth } from "caminojs/apis/platformvm"
import * as bech32 from "bech32"
import createHash from "create-hash"

/**
 * @ignore
 */
const serialization: Serialization = Serialization.getInstance()
const bintools: BinTools = BinTools.getInstance()

/**
 * Class representing an unsigned Import transaction.
 */
export class CashoutChequeTx extends BaseTx {
  protected _typeName = "CashoutChequeTx"
  protected _typeID = TouristicVmConstants.CASHOUTCHEQUETX

  /**
   * Returns the id of the [[CashoutChequeTx]]
   */
  getTxType(): number {
    return this._typeID
  }

  serialize(encoding: SerializedEncoding = "hex"): object {
    let fields: object = super.serialize(encoding)
    return {
      ...fields,
      issuer: serialization.encoder(this.issuer, encoding, "Buffer", "cb58"),
      beneficiary: serialization.encoder(
        this.beneficiary,
        encoding,
        "Buffer",
        "cb58"
      ),
      amount: serialization.encoder(
        this.amount,
        encoding,
        "Buffer",
        "decimalString"
      ),
      issuerAuth: this.issuerAuth.serialize(encoding)
    }
  }
  deserialize(fields: object, encoding: SerializedEncoding = "hex") {
    super.deserialize(fields, encoding)
    this.issuer = serialization.decoder(
      fields["issuer"],
      encoding,
      "cb58",
      "Buffer",
      20
    )
    this.beneficiary = serialization.decoder(
      fields["beneficiary"],
      encoding,
      "cb58",
      "Buffer",
      20
    )
    this.amount = serialization.decoder(
      fields["amount"],
      encoding,
      "decimalString",
      "Buffer"
    )
    this.issuerAuth.deserialize(fields["issuerAuth"], encoding)
  }
  protected issuer: Buffer = Buffer.alloc(20)
  protected beneficiary: Buffer = Buffer.alloc(20)
  protected issuerAuth: Auth = new Auth()
  protected amount: Buffer = Buffer.alloc(8)
  protected sigCount: Buffer = Buffer.alloc(4)
  protected sigIdxs: SigIdx[] = [] // idxs of subnet auth signers

  fromBuffer(bytes: Buffer, offset: number = 0): number {
    offset = super.fromBuffer(bytes, offset)
    this.issuer = bintools.copyFrom(bytes, offset, offset + 20)
    offset += 20
    this.beneficiary = bintools.copyFrom(bytes, offset, offset + 20)
    offset += 20
    this.amount = bintools.copyFrom(bytes, offset, offset + 8)
    offset += 8
    const sa: Auth = new Auth()
    offset += sa.fromBuffer(bintools.copyFrom(bytes, offset))
    this.issuerAuth = sa

    return offset
  }

  /**
   * Returns a {@link https://github.com/feross/buffer|Buffer} representation of the [[CashoutChequeTx]].
   */
  toBuffer(): Buffer {
    const superbuff: Buffer = super.toBuffer()

    let bsize: number =
      superbuff.length + this.issuer.length + this.beneficiary.length + 8

    const barr: Buffer[] = [
      superbuff,
      this.issuer,
      this.beneficiary,
      this.amount
    ]

    bsize += this.issuerAuth.toBuffer().length
    barr.push(this.issuerAuth.toBuffer())

    return Buffer.concat(barr, bsize)
  }

  clone(): this {
    const newCashoutChequeTx: CashoutChequeTx = new CashoutChequeTx()
    newCashoutChequeTx.fromBuffer(this.toBuffer())
    return newCashoutChequeTx as this
  }

  create(...args: any[]): this {
    return new CashoutChequeTx(...args) as this
  }

  /**
   * Creates and adds a [[SigIdx]] to the [[AddCashoutChequeTx]].
   *
   * @param addressIdx The index of the address to reference in the signatures
   * @param address The address of the source of the signature
   */
  addSignatureIdx(addressIdx: number, address: Buffer): void {
    const addressIndex: Buffer = Buffer.alloc(4)
    addressIndex.writeUIntBE(addressIdx, 0, 4)
    this.issuerAuth.addAddressIndex(addressIndex)

    const sigidx: SigIdx = new SigIdx()
    const b: Buffer = Buffer.alloc(4)
    b.writeUInt32BE(addressIdx, 0)
    sigidx.fromBuffer(b)
    sigidx.setSource(address)
    this.sigIdxs.push(sigidx)
    this.sigCount.writeUInt32BE(this.sigIdxs.length, 0)
  }

  /**
   * Returns the array of [[SigIdx]] for this [[TX]]
   */
  getSigIdxs(): SigIdx[] {
    return this.sigIdxs
  }

  getCredentialID(): number {
    return TouristicVmConstants.SECPCREDENTIAL
  }

  getChequeMsgToSign(): any {
    return (
      bintools.cb58Encode(this.issuer) +
      bintools.cb58Encode(this.beneficiary) +
      bintools.fromBufferToBN(this.amount).toNumber()
    )
  }
  /**
   * Takes the bytes of an [[UnsignedTx]] and returns an array of [[Credential]]s
   *
   * @param msg A Buffer for the [[UnsignedTx]]
   * @param kc An [[KeyChain]] used in signing
   *
   * @returns An array of [[Credential]]s
   */
  sign(msg: Buffer, kc: KeyChain): Credential[] {
    const creds: Credential[] = super.sign(msg, kc)
    let cred: Credential = SelectCredentialClass(this.getCredentialID())

    // Add Issuer Signature
    const keypair: KeyPair = kc.getKey(this.issuer)
    const sha256: Buffer = Buffer.from(
      createHash("sha256").update(this.getChequeMsgToSign()).digest()
    )
    const signval: Buffer = keypair.sign(sha256)
    const sig: Signature = new Signature()
    sig.fromBuffer(signval)
    cred.addSignature(sig)
    creds.push(cred)

    return creds
  }

  /**
   * Class representing an unsigned RegisterNode transaction.
   *
   * @param networkID Optional networkID, [[DefaultNetworkID]]
   * @param blockchainID Optional blockchainID, default Buffer.alloc(32, 16)
   * @param outs Optional array of the [[TransferableOutput]]s
   * @param ins Optional array of the [[TransferableInput]]s
   * @param memo Optional {@link https://github.com/feross/buffer|Buffer} for the memo field
   * @param oldNodeID Optional ID of the existing NodeID to replace or remove.
   * @param newNodeID Optional ID of the newNodID to register address.
   * @param address The consortiumMemberAddress, single or multi-sig.
   */
  constructor(
    networkID: number = DefaultNetworkID,
    blockchainID: Buffer = Buffer.alloc(32, 16),
    outs: TransferableOutput[] = undefined,
    ins: TransferableInput[] = undefined,
    memo: Buffer = undefined,
    issuer: Buffer = undefined,
    beneficiary: Buffer = undefined,
    amount: Buffer = undefined
  ) {
    super(networkID, blockchainID, outs, ins, memo)

    if (typeof issuer !== "undefined") this.issuer = issuer

    if (typeof beneficiary !== "undefined") this.beneficiary = beneficiary

    if (typeof amount != "undefined") {
      this.amount = amount
    }
    this.issuerAuth = new Auth()
  }
}

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
      serialID: serialization.encoder(
        this.serialID,
        encoding,
        "Buffer",
        "decimalString"
      )
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
    this.serialID = serialization.decoder(
      fields["serialID"],
      encoding,
      "decimalString",
      "Buffer"
    )
  }
  protected issuer: Buffer = Buffer.alloc(20)
  protected beneficiary: Buffer = Buffer.alloc(20)
  protected amount: Buffer = Buffer.alloc(8)
  protected serialID: Buffer = Buffer.alloc(8)
  protected chequeSignature: Buffer = Buffer.alloc(65)

  fromBuffer(bytes: Buffer, offset: number = 0): number {
    offset = super.fromBuffer(bytes, offset)
    this.issuer = bintools.copyFrom(bytes, offset, offset + 20)
    offset += 20
    this.beneficiary = bintools.copyFrom(bytes, offset, offset + 20)
    offset += 20
    this.amount = bintools.copyFrom(bytes, offset, offset + 8)
    offset += 8
    this.serialID = bintools.copyFrom(bytes, offset, offset + 8)
    offset += 8
    return offset
  }

  /**
   * Returns a {@link https://github.com/feross/buffer|Buffer} representation of the [[CashoutChequeTx]].
   */
  toBuffer(): Buffer {
    const superbuff: Buffer = super.toBuffer()

    let bsize: number =
      superbuff.length +
      this.issuer.length +
      this.beneficiary.length +
      this.amount.length +
      this.serialID.length

    const barr: Buffer[] = [
      superbuff,
      this.issuer,
      this.beneficiary,
      this.amount,
      this.serialID
    ]

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

  getCredentialID(): number {
    return TouristicVmConstants.SECPCREDENTIAL
  }

  sign(msg: Buffer, kc: KeyChain): Credential[] {
    let cred: Credential = SelectCredentialClass(this.getCredentialID())

    // Add Issuer Signature
    const sig: Signature = new Signature()
    sig.fromBuffer(this.chequeSignature)
    cred.addSignature(sig)
    return [cred]
  }

  constructor(
    networkID: number = DefaultNetworkID,
    blockchainID: Buffer = Buffer.alloc(32, 16),
    outs: TransferableOutput[] = undefined,
    ins: TransferableInput[] = undefined,
    memo: Buffer = undefined,
    issuer: Buffer = undefined,
    beneficiary: Buffer = undefined,
    amount: Buffer = undefined,
    serialID: Buffer = undefined,
    chequeSignature: Buffer = undefined
  ) {
    super(networkID, blockchainID, outs, ins, memo)

    if (typeof issuer !== "undefined") this.issuer = issuer

    if (typeof beneficiary !== "undefined") this.beneficiary = beneficiary

    if (typeof amount != "undefined") {
      this.amount = amount
    }
    if (typeof serialID != "undefined") {
      this.serialID = serialID
    }
    if (typeof chequeSignature != "undefined") {
      this.chequeSignature = chequeSignature
    }
  }
}

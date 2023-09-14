/**
 * @packageDocumentation
 * @module API-TouristicVM-ImportTx
 */
import { TouristicVmConstants } from "./constants"
import { BaseTx } from "./basetx"
import {
  DefaultNetworkID,
  Serializable,
  Serialization,
  SerializedEncoding
} from "../../utils"
import { Credential, Signature } from "../../common"
import { Buffer } from "buffer/"
import BinTools from "../../utils/bintools"
import { KeyChain } from "./keychain"
import { SECPCredential, SelectCredentialClass } from "./credentials"
import { TransferableOutput } from "./outputs"
import { TransferableInput } from "./inputs"

/**
 * @ignore
 */
const serialization: Serialization = Serialization.getInstance()
const bintools: BinTools = BinTools.getInstance()

export class Cheque extends Serializable {
  protected issuer: Buffer = Buffer.alloc(20)
  protected beneficiary: Buffer = Buffer.alloc(20)
  protected amount: Buffer = Buffer.alloc(8)
  protected serialID: Buffer = Buffer.alloc(8)
  protected agent: Buffer = Buffer.alloc(20)
  protected auth: Credential = new SECPCredential()

  serialize(encoding: SerializedEncoding = "hex"): object {
    return {
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
      ),
      agent: serialization.encoder(this.agent, encoding, "Buffer", "cb58"),
      auth: this.auth.serialize(encoding)
    }
  }

  deserialize(fields: object, encoding: SerializedEncoding = "hex") {
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
    this.agent = serialization.decoder(
      fields["agent"],
      encoding,
      "cb58",
      "Buffer",
      20
    )
  }

  fromBuffer(bytes: Buffer, offset: number = 0): number {
    this.issuer = bintools.copyFrom(bytes, offset, offset + 20)
    offset += 20
    this.beneficiary = bintools.copyFrom(bytes, offset, offset + 20)
    offset += 20
    this.amount = bintools.copyFrom(bytes, offset, offset + 8)
    offset += 8
    this.serialID = bintools.copyFrom(bytes, offset, offset + 8)
    offset += 8
    this.agent = bintools.copyFrom(bytes, offset, offset + 20)
    offset += 20
    const a: Credential = new SECPCredential()
    offset += a.fromBuffer(bintools.copyFrom(bytes, offset))
    this.auth = a

    return offset
  }

  constructor(
    issuer: Buffer = undefined,
    beneficiary: Buffer = undefined,
    amount: Buffer = undefined,
    serialID: Buffer = undefined,
    agent: string = undefined,
    signature: Buffer = undefined
  ) {
    super()
    if (typeof issuer !== "undefined") {
      this.issuer = issuer
    }
    if (typeof beneficiary !== "undefined") {
      this.beneficiary = beneficiary
    }
    if (typeof amount != "undefined") {
      this.amount = amount
    }
    if (typeof serialID != "undefined") {
      this.serialID = serialID
    }
    if (typeof agent !== "undefined") {
      this.agent = bintools.b58ToBuffer(agent).slice(0, 20) // exclude checksum //TODO nikos refactor
    }
    if (typeof signature != "undefined") {
      this.auth = SelectCredentialClass(TouristicVmConstants.SECPCREDENTIAL)
      const s = new Signature()
      s.fromBuffer(signature)
      this.auth.addSignature(s)
    }
  }

  toBuffer(): Buffer {
    const credID: Buffer = Buffer.alloc(4)
    credID.writeUInt32BE(TouristicVmConstants.SECPCREDENTIAL, 0)

    const authbuff = this.auth.toBuffer()
    let bsize: number =
      this.issuer.length +
      this.beneficiary.length +
      this.amount.length +
      this.serialID.length +
      this.agent.length +
      credID.length +
      authbuff.length

    const barr: Buffer[] = [
      this.issuer,
      this.beneficiary,
      this.amount,
      this.serialID,
      this.agent,
      credID,
      authbuff
    ]
    return Buffer.concat(barr, bsize)
  }
}

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
      cheque: this.cheque.serialize(encoding)
    }
  }

  deserialize(fields: object, encoding: SerializedEncoding = "hex") {
    super.deserialize(fields, encoding)
    this.cheque = fields["cheque"].deserialize(encoding)
  }

  protected cheque: Cheque = new Cheque()

  fromBuffer(bytes: Buffer, offset: number = 0): number {
    offset = super.fromBuffer(bytes, offset)
    offset += this.cheque.fromBuffer(bytes, offset)
    return offset
  }

  /**
   * Returns a {@link https://github.com/feross/buffer|Buffer} representation of the [[CashoutChequeTx]].
   */
  toBuffer(): Buffer {
    const superbuff: Buffer = super.toBuffer()
    const chequebuff: Buffer = this.cheque.toBuffer()
    let bsize: number = superbuff.length + chequebuff.length
    const barr: Buffer[] = [superbuff, chequebuff]
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
    return [] // no signatures for this tx. it's unsigned.
  }

  constructor(
    networkID: number = DefaultNetworkID,
    blockchainID: Buffer = Buffer.alloc(32, 16),
    outs: TransferableOutput[] = undefined,
    ins: TransferableInput[] = undefined,
    memo: Buffer = undefined,
    cheque: Cheque = undefined
  ) {
    super(networkID, blockchainID, outs, ins, memo)

    if (typeof cheque !== "undefined") this.cheque = cheque
  }
}

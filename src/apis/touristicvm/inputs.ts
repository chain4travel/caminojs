/**
 * @packageDocumentation
 * @module API-PlatformVM-Inputs
 */
import { Buffer } from "buffer/"
import BinTools from "../../utils/bintools"
import { TouristicVmConstants } from "./constants"
import {
  BaseInput,
  StandardTransferableInput,
  StandardAmountInput,
  StandardParseableInput
} from "../../common/input"
import { Serialization, SerializedEncoding } from "../../utils/serialization"
import BN from "bn.js"
import { InputIdError } from "../../utils/errors"
import { LockedIn } from "caminojs/apis/platformvm"

/**
 * @ignore
 */
const bintools: BinTools = BinTools.getInstance()
const serialization: Serialization = Serialization.getInstance()

/**
 * Takes a buffer representing the output and returns the proper [[Input]] instance.
 *
 * @param inputid A number representing the inputID parsed prior to the bytes passed in
 *
 * @returns An instance of an [[Input]]-extended class.
 */
export const SelectInputClass = (
  inputid: number,
  ...args: any[]
): BaseInput => {
  if (inputid === TouristicVmConstants.SECPINPUTID) {
    return new SECPTransferInput(...args)
  } else if (inputid === TouristicVmConstants.LOCKEDINID) {
    return new LockedIn(...args)
  }
  /* istanbul ignore next */
  throw new InputIdError("Error - SelectInputClass: unknown inputid")
}

export class ParseableInput extends StandardParseableInput {
  protected _typeName = "ParseableInput"
  protected _typeID = undefined

  //serialize is inherited
  deserialize(fields: object, encoding: SerializedEncoding = "hex") {
    super.deserialize(fields, encoding)
    this.input = SelectInputClass(fields["input"]["_typeID"])
    this.input.deserialize(fields["input"], encoding)
  }

  fromBuffer(bytes: Buffer, offset: number = 0): number {
    const inputid: number = bintools
      .copyFrom(bytes, offset, offset + 4)
      .readUInt32BE(0)
    offset += 4
    this.input = SelectInputClass(inputid)
    return this.input.fromBuffer(bytes, offset)
  }
}

export class TransferableInput extends StandardTransferableInput {
  protected _typeName = "TransferableInput"
  protected _typeID = undefined

  //serialize is inherited

  deserialize(fields: object, encoding: SerializedEncoding = "hex") {
    super.deserialize(fields, encoding)
    this.input = SelectInputClass(fields["input"]["_typeID"])
    this.input.deserialize(fields["input"], encoding)
  }

  /**
   * Takes a {@link https://github.com/feross/buffer|Buffer} containing a [[TransferableInput]], parses it, populates the class, and returns the length of the [[TransferableInput]] in bytes.
   *
   * @param bytes A {@link https://github.com/feross/buffer|Buffer} containing a raw [[TransferableInput]]
   *
   * @returns The length of the raw [[TransferableInput]]
   */
  fromBuffer(bytes: Buffer, offset: number = 0): number {
    this.txid = bintools.copyFrom(bytes, offset, offset + 32)
    offset += 32
    this.outputidx = bintools.copyFrom(bytes, offset, offset + 4)
    offset += 4
    this.assetID = bintools.copyFrom(
      bytes,
      offset,
      offset + TouristicVmConstants.ASSETIDLEN
    )
    offset += 32
    const inputid: number = bintools
      .copyFrom(bytes, offset, offset + 4)
      .readUInt32BE(0)
    offset += 4
    this.input = SelectInputClass(inputid)
    return this.input.fromBuffer(bytes, offset)
  }

  static fromArray(b: Buffer): TransferableInput[] {
    let offset = 6 //version + counter
    let num = b.readUInt32BE(2)
    const result: TransferableInput[] = []
    while (offset < b.length && num-- > 0) {
      const t = new TransferableInput()
      offset = t.fromBuffer(b, offset)
      result.push(t)
    }
    return result
  }
}

export abstract class AmountInput extends StandardAmountInput {
  protected _typeName = "AmountInput"
  protected _typeID = undefined

  //serialize and deserialize both are inherited

  select(id: number, ...args: any[]): BaseInput {
    return SelectInputClass(id, ...args)
  }
}

export class SECPTransferInput extends AmountInput {
  protected _typeName = "SECPTransferInput"
  protected _typeID = TouristicVmConstants.SECPINPUTID

  //serialize and deserialize both are inherited

  /**
   * Returns the inputID for this input
   */
  getInputID(): number {
    return this._typeID
  }

  getCredentialID = (): number => TouristicVmConstants.SECPCREDENTIAL

  create(...args: any[]): this {
    return new SECPTransferInput(...args) as this
  }

  clone(): this {
    const newout: SECPTransferInput = this.create()
    newout.fromBuffer(this.toBuffer())
    return newout as this
  }
}

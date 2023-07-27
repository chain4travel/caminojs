/**
 * @packageDocumentation
 * @module API-PlatformVM-Outputs
 */
import { Buffer } from "buffer/"
import BinTools from "../../utils/bintools"
import { TouristicVmConstants } from "./constants"
import {
  BaseOutput,
  Output,
  StandardAmountOutput,
  StandardTransferableOutput,
  StandardParseableOutput
} from "../../common/output"
import { Serialization, SerializedEncoding } from "../../utils/serialization"
import BN from "bn.js"
import { OutputIdError } from "../../utils/errors"

const bintools: BinTools = BinTools.getInstance()
const serialization: Serialization = Serialization.getInstance()

/**
 * Takes a buffer representing the output and returns the proper Output instance.
 *
 * @param outputid A number representing the inputID parsed prior to the bytes passed in
 *
 * @returns An instance of an [[Output]]-extended class.
 */
export const SelectOutputClass = (
  outputid: number,
  ...args: any[]
): BaseOutput => {
  if (outputid == TouristicVmConstants.SECPXFEROUTPUTID) {
    return new SECPTransferOutput(...args)
  }
  throw new OutputIdError(
    "Error - SelectOutputClass: unknown outputid " + outputid
  )
}

export class TransferableOutput extends StandardTransferableOutput {
  protected _typeName = "TransferableOutput"
  protected _typeID = undefined

  //serialize is inherited

  deserialize(fields: object, encoding: SerializedEncoding = "hex") {
    super.deserialize(fields, encoding)
    this.output = SelectOutputClass(fields["output"]["_typeID"])
    this.output.deserialize(fields["output"], encoding)
  }

  fromBuffer(bytes: Buffer, offset: number = 0): number {
    this.assetID = bintools.copyFrom(
      bytes,
      offset,
      offset + TouristicVmConstants.ASSETIDLEN
    )
    offset += TouristicVmConstants.ASSETIDLEN
    const outputid: number = bintools
      .copyFrom(bytes, offset, offset + 4)
      .readUInt32BE(0)
    offset += 4
    this.output = SelectOutputClass(outputid)
    return this.output.fromBuffer(bytes, offset)
  }

  static fromArray(b: Buffer): TransferableOutput[] {
    let offset = 6 //version + counter
    let num = b.readUInt32BE(2)
    const result: TransferableOutput[] = []
    while (offset < b.length && num-- > 0) {
      const t = new TransferableOutput()
      offset = t.fromBuffer(b, offset)
      result.push(t)
    }
    return result
  }
}

export class ParseableOutput extends StandardParseableOutput {
  protected _typeName = "ParseableOutput"
  protected _typeID = undefined

  //serialize is inherited

  deserialize(fields: object, encoding: SerializedEncoding = "hex") {
    super.deserialize(fields, encoding)
    this.output = SelectOutputClass(fields["output"]["_typeID"])
    this.output.deserialize(fields["output"], encoding)
  }

  fromBuffer(bytes: Buffer, offset: number = 0): number {
    const outputid: number = bintools
      .copyFrom(bytes, offset, offset + 4)
      .readUInt32BE(0)
    offset += 4
    this.output = SelectOutputClass(outputid)
    return this.output.fromBuffer(bytes, offset)
  }
}

export abstract class AmountOutput extends StandardAmountOutput {
  protected _typeName = "AmountOutput"
  protected _typeID = undefined

  //serialize and deserialize both are inherited

  /**
   * @param assetID An assetID which is wrapped around the Buffer of the Output
   */
  makeTransferable(assetID: Buffer): TransferableOutput {
    return new TransferableOutput(assetID, this)
  }
}

/**
 * An [[Output]] class which specifies an Output that carries an ammount for an assetID and uses secp256k1 signature scheme.
 */
export class SECPTransferOutput extends AmountOutput {
  protected _typeName = "SECPTransferOutput"
  protected _typeID = TouristicVmConstants.SECPXFEROUTPUTID

  //serialize and deserialize both are inherited

  /**
   * Returns the outputID for this output
   */
  getOutputID(): number {
    return this._typeID
  }

  create(...args: any[]): this {
    return new SECPTransferOutput(...args) as this
  }

  clone(): this {
    const newout: SECPTransferOutput = this.create()
    newout.fromBuffer(this.toBuffer())
    return newout as this
  }
}

/**
 * An [[Output]] class which only specifies an Output ownership and uses secp256k1 signature scheme.
 */
export class SECPOwnerOutput extends Output {
  protected _typeName = "SECPOwnerOutput"
  protected _typeID = TouristicVmConstants.SECPOWNEROUTPUTID

  //serialize and deserialize both are inherited

  /**
   * Returns the outputID for this output
   */
  getOutputID(): number {
    return this._typeID
  }

  /**
   *
   * @param assetID An assetID which is wrapped around the Buffer of the Output
   */
  makeTransferable(assetID: Buffer): TransferableOutput {
    return new TransferableOutput(assetID, this)
  }

  create(...args: any[]): this {
    return new SECPOwnerOutput(...args) as this
  }

  clone(): this {
    const newout: SECPOwnerOutput = this.create()
    newout.fromBuffer(this.toBuffer())
    return newout as this
  }
}

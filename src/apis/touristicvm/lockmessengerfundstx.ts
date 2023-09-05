/**
 * @packageDocumentation
 * @module API-TouristicVM-ImportTx
 */
import { TouristicVmConstants } from "./constants"
import { BaseTx } from "./basetx"

/**
 * @ignore
 */

/**
 * Class representing an unsigned Import transaction.
 */
export class LockMessengerFundsTx extends BaseTx {
  protected _typeName = "LockMessengerFundsTx"
  protected _typeID = TouristicVmConstants.LOCKMESSENGERFUNDSTX

  /**
   * Returns the id of the [[ImportTx]]
   */
  getTxType(): number {
    return this._typeID
  }

  clone(): this {
    let newbase: LockMessengerFundsTx = new LockMessengerFundsTx()
    newbase.fromBuffer(this.toBuffer())
    return newbase as this
  }

  create(...args: any[]): this {
    return new LockMessengerFundsTx(...args) as this
  }
}

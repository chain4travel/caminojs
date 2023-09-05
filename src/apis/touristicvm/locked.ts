/**
 * @packageDocumentation
 * @module API-PlatformVM-Locked
 */

import { Buffer } from "buffer/"
import BinTools from "../../utils/bintools"
import { Serialization, SerializedEncoding } from "../../utils/serialization"

const bintools: BinTools = BinTools.getInstance()
const serialization: Serialization = Serialization.getInstance()

export class SerializableTxID {
  encode(encoding: SerializedEncoding = "hex"): string {
    return serialization.encoder(this.txid, encoding, "Buffer", "cb58")
  }

  decode(value: string, encoding: SerializedEncoding = "hex") {
    this.txid = serialization.decoder(value, encoding, "cb58", "Buffer", 32)
  }

  protected txid: Buffer = Buffer.alloc(32)

  isEmpty(): boolean {
    return this.txid.equals(Buffer.alloc(32))
  }

  fromBuffer(bytes: Buffer, offset = 0): number {
    this.txid = bintools.copyFrom(bytes, offset, offset + 32)
    return offset + 32
  }

  toBuffer(): Buffer {
    return this.txid
  }
}

export class LockedIDs {
  serialize(encoding: SerializedEncoding = "hex"): object {
    let lockObj: object = {
      lockTxID: this.lockTxID.encode(encoding)
    }
    return lockObj
  }

  deserialize(fields: object, encoding: SerializedEncoding = "hex") {
    this.lockTxID.decode(fields["lockTxID"])
  }

  protected lockTxID: SerializableTxID = new SerializableTxID()

  getLockTxID(): SerializableTxID {
    return this.lockTxID
  }

  fromBuffer(bytes: Buffer, offset = 0): number {
    return this.lockTxID.fromBuffer(bytes, offset)
  }

  toBuffer(): Buffer {
    return Buffer.concat([this.lockTxID.toBuffer()], 32)
  }

  /**
   * Class representing an [[LockedIDs]] for LockedIn and LockedOut types.
   *
   * @param lockTxID txID where this Output is deposited on
   * @param bondTxID txID where this Output is bonded on
   */
  constructor(lockTxID?: Buffer, bondTxID?: Buffer) {
    if (lockTxID) this.lockTxID.fromBuffer(lockTxID)
  }
}

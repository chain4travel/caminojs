import { Buffer } from "buffer/"
import { PlatformVMConstants } from "../constants"
import { EssentialProposal } from "./essentialproposal"
import BinTools from "../../../utils/bintools"
import { Serialization, SerializedEncoding } from "../../../utils/serialization"

const serialization = Serialization.getInstance()
const bintools = BinTools.getInstance()

export class NewProposal extends EssentialProposal {
  private readonly _typeID = PlatformVMConstants.NEWPROPOSAL_TYPE_ID

  protected allowEarlyFinish = Buffer.alloc(1)
  //protected totalVotedThresholdNominator: Buffer = Buffer.alloc(8)
  //protected mostVotedThresholdNominator: Buffer = Buffer.alloc(8)

  serialize(encoding: SerializedEncoding = "hex"): object {
    return {
      start: serialization.encoder(this.start, encoding, "Buffer", "number"),
      end: serialization.encoder(this.end, encoding, "Buffer", "number")
    }
  }

  deserialize(fields: object, encoding: SerializedEncoding = "hex"): this {
    this.start = serialization.decoder(
      fields["start"],
      encoding,
      "number",
      "Buffer"
    )
    this.end = serialization.decoder(
      fields["end"],
      encoding,
      "number",
      "Buffer"
    )
    return this
  }
  fromBuffer(bytes: Buffer, offset: number = 0): number {
    this.allowEarlyFinish = bintools.copyFrom(bytes, offset, offset + 1)
    offset += 1
    /*    this.totalVotedThresholdNominator = bintools.copyFrom(bytes, offset + 8) // Read totalVotedThresholdNominator (8 bytes)
    offset += 8*/
    /*    this.mostVotedThresholdNominator = bytes.slice(offset, offset + 8) // Read mostVotedThresholdNominator (8 bytes)
    offset += 8*/
    this.start = bintools.copyFrom(bytes, offset, offset + 8)
    offset += 8
    this.end = bintools.copyFrom(bytes, offset, offset + 8)
    offset += 8
    offset
    return offset
  }
  toBuffer(): Buffer {
    const barr: Buffer[] = [
      this.allowEarlyFinish,
      //this.totalVotedThresholdNominator,
      this.start,
      this.end
    ]
    super.toBuffer()
    super.getStart()
    super.getEnd()

    const bsize =
      this.allowEarlyFinish.length +
      //this.totalVotedThresholdNominator.length +
      this.start.length +
      this.end.length

    return Buffer.concat(barr, bsize)
  }

  constructor(
    start?: number,
    end?: number,
    allowEarlyFinish?: boolean,
    totalVotedThresholdNominator?: number
  ) {
    const startTime = Buffer.alloc(8)
    startTime.writeUInt32BE(start, 4)
    const endTime = Buffer.alloc(8)
    endTime.writeUInt32BE(end, 4)
    super(startTime, endTime)
    this.allowEarlyFinish = bintools.stringToBuffer(
      allowEarlyFinish ? "1" : "0"
    )
    /*    this.totalVotedThresholdNominator.writeUInt32BE(
      totalVotedThresholdNominator,
      0
    )*/
  }

  getTypeID(): number {
    return this._typeID
  }

  getAllowEarlyFinish(): Buffer {
    return this.allowEarlyFinish
  }
}

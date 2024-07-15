import { Buffer } from "buffer/"
import { PlatformVMConstants } from "../constants"
import { EssentialProposal, VoteOption } from "./essentialproposal"
import {
  Serialization,
  SerializedEncoding,
  SerializedType
} from "../../../utils/serialization"
import BinTools from "../../../utils/bintools"
const utf8: SerializedType = "utf8"

const serialization = Serialization.getInstance()
const bintools: BinTools = BinTools.getInstance()

export class GeneralProposal extends EssentialProposal {
  private readonly _typeID = PlatformVMConstants.GENERALPROPOSAL_TYPE_ID
  private _optionIndex = Buffer.alloc(4)

  //TODO: @VjeraTurk
  private totalVotedThresholdNominator: Buffer
  private mostVotedThresholdNominator: Buffer
  private allowEarlyFinish: boolean

  serialize(encoding: SerializedEncoding = "hex"): object {
    let fields = {
      start: serialization.encoder(this.start, encoding, "Buffer", "number"),
      end: serialization.encoder(this.end, encoding, "Buffer", "number"),
      totalVotedThresholdNominator: serialization.encoder(
        this.totalVotedThresholdNominator,
        encoding,
        "Buffer",
        "number"
      ),
      mostVotedThresholdNominator: serialization.encoder(
        this.mostVotedThresholdNominator,
        encoding,
        "Buffer",
        "number"
      ),
      allowEarlyFinish: serialization.encoder(
        this.allowEarlyFinish,
        encoding,
        "Buffer",
        "number" // 1 and 0?
      ),
      options: this.options.map((option: VoteOption) =>
        option.serialize(encoding)
      )
    }
    return fields
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
    this.totalVotedThresholdNominator = serialization.decoder(
      fields["totalVotedThresholdNominator"],
      encoding,
      "number",
      "Buffer"
    )
    this.mostVotedThresholdNominator = serialization.decoder(
      fields["mostVotedThresholdNominator"],
      encoding,
      "number",
      "Buffer"
    )

    this.allowEarlyFinish = serialization.decoder(
      fields["allowEarlyFinish"],
      encoding,
      "number",
      "Buffer"
    )

    this.numOptions.writeUInt32BE(this.options.length, 0)
    this.options = fields["options"].map((opt) =>
      new VoteOption().deserialize(opt, encoding)
    )
    return this
  }

  getOptionIndex() {
    return this._optionIndex
  }
  fromBuffer(bytes: Buffer, offset: number = 0): number {
    //this.numOptions ?
    //this.options ?

    this.start = bytes.slice(offset, offset + 8) // Read start (8 bytes)
    offset += 8
    this.end = bytes.slice(offset, offset + 8) // Read start (8 bytes)
    offset += 8
    this.totalVotedThresholdNominator = bytes.slice(offset, offset + 8) // Read totalVotedThresholdNominator (8 bytes)
    offset += 8
    this.mostVotedThresholdNominator = bytes.slice(offset, offset + 8) // Read mostVotedThresholdNominator (8 bytes)
    offset += 8

    this.allowEarlyFinish = bytes[offset] === 1 // Read allowEarlyFinish (1 byte)
    offset += 1

    /*
    this.numOptions = bintools.copyFrom(bytes, offset, offset + 4) // this.numOptions.readUInt32BE(0)
    offset += 4
    const optionCount = this.numOptions.readUInt32BE(0)
    this.options = []
    for (let i = 0; i < optionCount; i++) {
      const option = new VoteOption()
      offset = option.fromBuffer(bytes, offset)
      this.options.push(option)
    }
*/

    return offset
  }
  toBuffer(): Buffer {
    const buff = this.getOptionIndex()
    const typeIdBuff = Buffer.alloc(4)
    typeIdBuff.writeUInt32BE(this.getTypeID(), 0)

    let barr = [
      this.start,
      this.end,
      this.totalVotedThresholdNominator,
      this.mostVotedThresholdNominator,
      Buffer.from([this.allowEarlyFinish ? 1 : 0])
    ]

    let bsize =
      this.start.length +
      this.end.length +
      this.totalVotedThresholdNominator.length +
      this.mostVotedThresholdNominator.length +
      1 // TODO: @VjeraTurk figure out the size

    let bsizeOptions: number = this.numOptions.length
    this.options.forEach((opt) => {
      bsize += opt.getSize()
      barr.push(opt.toBuffer())
    })

    return Buffer.concat(
      [buff, typeIdBuff, Buffer.concat(barr, bsize)],
      buff.length + typeIdBuff.length + bsize
    )
  }

  constructor(
    totalVotedThresholdNominator?: number,
    mostVotedThresholdNominator?: number,
    allowEarlyFinish?: boolean, // TODO: @VjeraTurk Early Finish or Early Exit?
    start?: number,
    end?: number
  ) {
    //this.numOptions ?
    //this.options ?

    const startTime = Buffer.alloc(8) // Buffer to hold the start time, 8 bytes
    startTime.writeUInt32BE(start, 4)
    const endTime = Buffer.alloc(8) // Buffer to hold the end time, 8 bytes
    endTime.writeUInt32BE(end, 4)

    super(startTime, endTime)

    this.start = startTime
    this.end = endTime

    this.totalVotedThresholdNominator = Buffer.alloc(8)
    this.totalVotedThresholdNominator.writeUInt32BE(
      totalVotedThresholdNominator,
      0
    )
    this.mostVotedThresholdNominator = Buffer.alloc(8)
    this.mostVotedThresholdNominator.writeUInt32BE(
      mostVotedThresholdNominator,
      0
    )
    this.allowEarlyFinish = allowEarlyFinish
  }

  getTypeID(): number {
    return this._typeID
  }

  addGeneralOption(option: string): number {
    const optionBuf: Buffer = Buffer.alloc(option.length)
    optionBuf.write(option, 0, option.length, utf8)

    const optionsize: Buffer = Buffer.alloc(2)
    optionsize.writeUInt16BE(option.length, 0)

    //const optionBuf: Buffer = bintools.stringToBuffer(option)

    const voteOption = new VoteOption()
    voteOption.fromBuffer(optionBuf)

    return super.addOption(voteOption)
  }

  getAllowEarlyFinish(): boolean {
    return this.allowEarlyFinish
  }
}

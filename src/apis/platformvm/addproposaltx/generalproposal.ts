import { Buffer } from "buffer/"
import { PlatformVMConstants } from "../constants"
import {
  Serializable,
  Serialization,
  SerializedEncoding,
  SerializedType
} from "../../../utils/serialization"
import BinTools from "../../../utils/bintools"
const utf8: SerializedType = "utf8"

const serialization = Serialization.getInstance()
const bintools: BinTools = BinTools.getInstance()

export class GeneralVoteOption extends Serializable {
  protected _typeName = "GeneralVoteOption"
  protected _typeID = undefined // TODO: understand WHY?

  protected option: Buffer = Buffer.alloc(256) // TODO: Keep it at 256 for now, make dynamic later

  serialize(encoding: SerializedEncoding = "hex"): object {
    return {
      option: serialization.encoder(this.option, encoding, "Buffer", "hex")
    }
  }
  deserialize(fields: object, encoding: SerializedEncoding = "hex"): this {
    this.option = serialization.decoder(
      fields["option"],
      encoding, // TODO: where does utf8 come arouf?
      "Buffer", //?
      "Buffer", //?
      256 // TODO: what is this?
    )

    return this
  }

  fromBuffer(bytes: Buffer, offset: number = 0): number {
    this.option = bintools.copyFrom(bytes, offset, offset + 256)
    return offset + 256
  }
  toBuffer(): Buffer {
    return this.option
  }

  getSize(): number {
    return 256
  }

  getOption(): Buffer {
    return this.option
  }
  //TODO: yes/no?
  constructor(option?: Buffer) {
    super()
    if (option) this.option = option
  }
}
export class GeneralProposal {
  private readonly _typeID = PlatformVMConstants.GENERALPROPOSAL_TYPE_ID
  private _optionIndex = Buffer.alloc(4)

  protected numOptions: Buffer = Buffer.alloc(4) //1.
  protected options: GeneralVoteOption[] // TODO: define type //2. - one option 256 char? Always? Or add length of each option and make option 255 long?

  protected start: Buffer = Buffer.alloc(8) //3.
  protected end: Buffer = Buffer.alloc(8) //4.

  protected totalVotedThresholdNominator: Buffer = Buffer.alloc(8) //5.
  protected mostVotedThresholdNominator: Buffer = Buffer.alloc(8) //6.
  protected allowEarlyFinish = Buffer.alloc(1) // 7.

  serialize(encoding: SerializedEncoding = "hex"): object {
    let fields = {
      options: this.options.map((opt) => opt.serialize(encoding)),
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
      )
    }
    return fields
  }

  deserialize(fields: object, encoding: SerializedEncoding = "hex"): this {
    this.numOptions.writeUInt32BE(this.options.length, 0)
    this.options = fields["options"].map((opt) =>
      new GeneralVoteOption().deserialize(opt, encoding)
    )
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

    return this
  }

  fromBuffer(bytes: Buffer, offset: number = 0): number {
    this.numOptions = bintools.copyFrom(bytes, offset, offset + 4) // this.numOptions.readUInt32BE(0)
    offset += 4
    const optionCount = this.numOptions.readUInt32BE(0)
    this.options = []
    for (let i = 0; i < optionCount; i++) {
      const option = new GeneralVoteOption()
      offset = option.fromBuffer(bytes, offset)
      this.options.push(option)
    }

    this.start = bintools.copyFrom(bytes, offset, offset + 8)
    offset += 8
    this.end = bintools.copyFrom(bytes, offset, offset + 8)
    offset += 8
    this.totalVotedThresholdNominator = bintools.copyFrom(
      bytes,
      offset,
      offset + 8
    ) // Read totalVotedThresholdNominator (8 bytes)
    offset += 8
    this.totalVotedThresholdNominator = bintools.copyFrom(
      bytes,
      offset,
      offset + 8
    ) // Read totalVotedThresholdNominator (8 bytes)
    this.mostVotedThresholdNominator = bintools.copyFrom(
      bytes,
      offset,
      offset + 8
    ) // Read mostVotedThresholdNominator (8 bytes)
    offset += 8

    this.allowEarlyFinish = bintools.copyFrom(bytes, offset, offset + 1)
    offset += 1

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

    this.options = []
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
    this.allowEarlyFinish = bintools.stringToBuffer(
      allowEarlyFinish ? "1" : "0"
    )
  }

  getTypeID(): number {
    return this._typeID
  }

  addOption(option: string): number {
    const optionBuf = Buffer.alloc(256)
    optionBuf.write(option, 0, 256)
    const generalVoteOption = new GeneralVoteOption()
    generalVoteOption.fromBuffer(optionBuf)
    this.options.push(generalVoteOption)
    if (this.options) {
      this.numOptions.writeUInt32BE(this.options.length, 0)
    }
    return this.options.length - 1
  }

  getAllowEarlyFinish(): Buffer {
    return this.allowEarlyFinish
  }

  getOptionIndex() {
    return this._optionIndex
  }
}

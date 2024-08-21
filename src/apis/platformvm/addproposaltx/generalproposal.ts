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

  protected option: Buffer = Buffer.alloc(0) // TODO: memo is 0, should this be as well?

  serialize(encoding: SerializedEncoding = "hex"): object {
    super.serialize() //TODO: @VjeraTurk do I need this?
    return {
      option: serialization.encoder(this.option, encoding, "Buffer", "hex")
    }
  }
  deserialize(fields: object, encoding: SerializedEncoding = "hex"): this {
    super.deserialize(fields, encoding) //TODO: @VjeraTurk do I need this?
    this.option = serialization.decoder(
      fields["option"],
      encoding, // TODO: where does utf8 come around?
      "Buffer", //?
      "Buffer", //?
      256 // TODO: what is this?
    )

    return this
  }

  fromBuffer(bytes: Buffer, offset: number = 0): number {
    /* let optionlen: number = bintools
      .copyFrom(bytes, offset, offset + 4)
      .readUInt32BE(0)
    */
    let optionlen = 256
    offset += 4
    this.option = bintools.copyFrom(bytes, offset, offset + optionlen)
    offset += optionlen
    return offset

    //this.option = bintools.copyFrom(bytes, offset, offset + 256)
    //return offset + 256
  }
  toBuffer(): Buffer {
    return this.option
  }

  getSize(): number {
    return this.option.length
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
  //private _optionIndex = Buffer.alloc(4)

  protected numOptions: Buffer = Buffer.alloc(4) //1.
  protected options: GeneralVoteOption[] // TODO: define type //2. - one option 256 char? Always? Or add length of each option and make option 255 long?

  protected start: Buffer = Buffer.alloc(8) //3.
  protected end: Buffer = Buffer.alloc(8) //4.

  protected totalVotedThresholdNominator: Buffer = Buffer.alloc(8) //5.
  protected mostVotedThresholdNominator: Buffer = Buffer.alloc(8) //6.
  protected allowEarlyFinish: boolean // 7.

  addGeneralOption(option: string): number {
    const optionBuf = Buffer.alloc(4 + option.length)
    optionBuf.write(option, 4, option.length)
    const generalVoteOption = new GeneralVoteOption()
    generalVoteOption.fromBuffer(optionBuf)
    this.options.push(generalVoteOption)
    if (this.options) {
      this.numOptions.writeUInt32BE(this.options.length, 0)
    }
    return this.options.length - 1
  }

  serialize(encoding: SerializedEncoding = "hex"): object {
    let fields = {
      start: serialization.encoder(this.start, encoding, "Buffer", "number"),
      end: serialization.encoder(this.end, encoding, "Buffer", "number"),
      options: this.options.map((opt) => opt.serialize(encoding)),
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
      allowEarlyFinish: this.allowEarlyFinish
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
    this.mostVotedThresholdNominator = bintools.copyFrom(
      bytes,
      offset,
      offset + 8
    ) // Read mostVotedThresholdNominator (8 bytes)
    offset += 8

    this.allowEarlyFinish = bintools.copyFrom(bytes, offset, offset + 1)[0] != 0
    offset += 1

    return offset
  }
  toBuffer(): Buffer {
    /*
    const buff = this.getOptionIndex()
    const typeIdBuff = Buffer.alloc(4)
    typeIdBuff.writeUInt32BE(this.getTypeID(), 0)
*/

    let barr = [this.numOptions]
    let bsize = this.numOptions.length

    this.options.forEach((opt) => {
      let optionlen: Buffer = Buffer.alloc(4)
      optionlen.writeUInt32BE(opt.getSize(), 0)
      barr.push(optionlen)
      barr.push(opt.toBuffer())
      bsize += 4
      bsize += opt.getSize()
    })

    barr.push(
      this.start,
      this.end,
      this.totalVotedThresholdNominator,
      this.mostVotedThresholdNominator,
      Buffer.from([this.allowEarlyFinish ? 1 : 0])
    )

    bsize +=
      this.start.length +
      this.end.length +
      this.totalVotedThresholdNominator.length +
      this.mostVotedThresholdNominator.length +
      1

    //let bsizeOptions: number = this.numOptions.length

    return Buffer.concat(barr, bsize)
    /*    return Buffer.concat(
      [buff, typeIdBuff, Buffer.concat(barr, bsize)],
      buff.length + typeIdBuff.length + bsize
    )*/
  }

  constructor(
    start?: number,
    end?: number,
    totalVotedThresholdNominator?: number,
    mostVotedThresholdNominator?: number,
    allowEarlyFinish?: boolean // TODO: @VjeraTurk Early Finish or Early Exit?
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
    this.allowEarlyFinish = allowEarlyFinish
  }

  getTypeID(): number {
    return this._typeID
  }

  getAllowEarlyFinish(): boolean {
    return this.allowEarlyFinish
  }
}

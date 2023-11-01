import { Buffer } from 'buffer/'
import BinTools from '../../../utils/bintools'
import { Serialization, SerializedEncoding } from '../../../utils/serialization'
import { PlatformVMConstants } from "../constants"
import { EssentialProposal, VoteOption } from "./essentialproposal"

const serialization = Serialization.getInstance()
const bintools = BinTools.getInstance()

export class ExcludeMemberProposal extends EssentialProposal {
  private readonly TYPE_ID = PlatformVMConstants.EXCLUDEMEMBERPORPOSAL_TYPE_ID

  serialize(encoding: SerializedEncoding = 'hex'): object {
    const fields = super.serialize(encoding)
    return {
      ...fields,
      memberAddress: serialization.encoder(this.memberAddress, encoding, "Buffer", "cb58"),
    }
  };

  deserialize(fields: object, encoding: SerializedEncoding = "hex"): this {
    super.deserialize(fields, encoding)
    this.memberAddress = serialization.decoder(
      fields["memberAddress"],
      encoding,
      "cb58",
      "Buffer",
      20
    )

    return this
  }

  constructor(start?: number, end?: number, memberAddress: string | Buffer = undefined) {
    const startTime = Buffer.alloc(8)
    startTime.writeUInt32BE(start, 4)
    const endTime = Buffer.alloc(8)
    endTime.writeUInt32BE(end, 4)
    super(startTime, endTime)

    if (typeof memberAddress === "string") {
      this.memberAddress = bintools.stringToAddress(memberAddress)
    } else {
      this.memberAddress = memberAddress
    }

    // // Initialize options
    // const agreeBuf = Buffer.alloc(8)
    // agreeBuf.writeUInt32BE(1, 4)
    // const agreeOption = new VoteOption()
    // agreeOption.fromBuffer(agreeBuf)
    // super.addOption(agreeOption)
    // const disagreeBuf = Buffer.alloc(8)
    // disagreeBuf.writeUInt32BE(0, 4)
    // const disagreeOption = new VoteOption()
    // disagreeOption.fromBuffer(disagreeBuf)
    // super.addOption(disagreeOption)
  }

  protected memberAddress = Buffer.alloc(20)

  getTypeID(): number {
    return this.TYPE_ID
  }

  getMemberAddress(): Buffer {
    return this.memberAddress
  }
}
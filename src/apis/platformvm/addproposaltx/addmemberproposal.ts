import { Buffer } from 'buffer/'
import BinTools from '../../../utils/bintools'
import { Serialization, SerializedEncoding } from '../../../utils/serialization'
import { PlatformVMConstants } from "../constants"
import { EssentialProposal, VoteOption } from "./essentialproposal"

const serialization = Serialization.getInstance()
const bintools = BinTools.getInstance()

export class AddMemberProposal extends EssentialProposal {
  private readonly TYPE_ID = PlatformVMConstants.ADDMEMBERPORPOSAL_TYPE_ID

  serialize(encoding: SerializedEncoding = 'hex'): object {
    const fields = super.serialize(encoding)
    return {
      ...fields,
      applicantAddress: serialization.encoder(this.applicantAddress, encoding, "Buffer", "cb58"),
    }
  };

  deserialize(fields: object, encoding: SerializedEncoding = "hex"): this {
    super.deserialize(fields, encoding)
    this.applicantAddress = serialization.decoder(
      fields["applicantAddress"],
      encoding,
      "cb58",
      "Buffer",
      20
    )

    return this
  }

  constructor(start?: number, end?: number, applicantAddress: string | Buffer = undefined) {
    const startTime = Buffer.alloc(8)
    startTime.writeUInt32BE(start, 4)
    const endTime = Buffer.alloc(8)
    endTime.writeUInt32BE(end, 4)
    super(startTime, endTime)

    if (typeof applicantAddress === "string") {
      this.applicantAddress = bintools.stringToAddress(applicantAddress)
    } else {
      this.applicantAddress = applicantAddress
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

  protected applicantAddress = Buffer.alloc(20)

  getTypeID(): number {
    return this.TYPE_ID
  }

  getApplicantAddress(): Buffer {
    return this.applicantAddress
  }
}
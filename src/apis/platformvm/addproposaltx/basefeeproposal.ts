import { Buffer } from 'buffer/'
import { PlatformVMConstants } from "../constants"
import { EssentialProposal } from "./essentialproposal"

export class BaseFeeProposal extends EssentialProposal {
  private readonly TYPE_ID = PlatformVMConstants.BASEFEEPORPOSAL_TYPE_ID
  constructor(start?: Buffer, end?: Buffer) {
    super(start, end)
  }

  getTypeID(): number {
    return this.TYPE_ID
  }
}
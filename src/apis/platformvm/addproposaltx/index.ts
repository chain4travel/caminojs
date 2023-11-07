/**
 * @packageDocumentation
 * @module API-PlatformVM-AddProposalTx
 */
import { Buffer } from 'buffer/'
import { Serialization, SerializedEncoding } from '../../../utils/serialization';
import { DefaultNetworkID, DefaultTransactionVersionNumber } from '../../../utils/constants';
import BinTools from '../../../utils/bintools';
import { BaseTx } from "../basetx";
import { PlatformVMConstants } from "../constants";
import { SubnetAuth } from '../subnetauth';
import { TransferableOutput } from '../outputs';
import { TransferableInput } from '../inputs';
import { Credential, Signature, UpgradeVersionID } from '../../../common';
import { BaseFeeProposal } from './basefeeproposal';
import { AddMemberProposal } from './addmemberproposal'
import { ExcludeMemberProposal } from './excludememberproposal'
import { KeyChain, KeyPair } from '../keychain';
import { SelectCredentialClass } from '../credentials';
/**
 * @ignore
 */
const bintools: BinTools = BinTools.getInstance()
const serialization: Serialization = Serialization.getInstance()

export { BaseFeeProposal, AddMemberProposal, ExcludeMemberProposal }
export const DEFAULT_CAMINOGO_CODEC_VERSION = 0
export type Proposal = BaseFeeProposal | AddMemberProposal | ExcludeMemberProposal // TODO: extend this alias type for further supported proposal types
export class ProposalWrapper {
  private _typeID: number
  private proposal: Proposal

  constructor(proposal?: Proposal) {
    if (proposal) {
      this.proposal = proposal
      this._typeID = proposal.getTypeID()
    }
  }

  serialize(encoding: SerializedEncoding = "hex"): object {
    return {
      proposal: this.proposal.serialize(encoding)
    }
  }

  deserialize(fields: object, encoding: SerializedEncoding = "hex"): this {
    this.proposal = this.proposal.deserialize(fields, encoding)
    return this
  }

  getProposalType(): number {
    return this._typeID
  }

  getProposal(): Proposal {
    return this.proposal
  }

  fromBuffer(bytes: Buffer, offset: number = 0): number {
    const codecVersion = bintools.copyFrom(bytes, offset, offset + 2).readUInt16BE(0)
    offset += 2
    let proposal = null
    this._typeID = bintools.copyFrom(bytes, offset, offset + 4).readUInt32BE(0)
    offset += 4
    switch (this._typeID) {
      case PlatformVMConstants.BASEFEEPORPOSAL_TYPE_ID:
        proposal = new BaseFeeProposal()
        break;
      case PlatformVMConstants.ADDMEMBERPORPOSAL_TYPE_ID:
        proposal = new AddMemberProposal()
        break;
      case PlatformVMConstants.EXCLUDEMEMBERPORPOSAL_TYPE_ID:
        proposal = new ExcludeMemberProposal()
        break;
      default:
        throw `Unsupported proposal type: ${this._typeID}`
    }
    offset = proposal.fromBuffer(bytes, offset)
    this.proposal = proposal
    return offset
  }

  toBuffer(): Buffer {
    const codecVersion = Buffer.alloc(2)
    codecVersion.writeUInt8(DEFAULT_CAMINOGO_CODEC_VERSION, 0)
    const typeId = Buffer.alloc(4)
    typeId.writeUInt32BE(this._typeID, 0)
    const buff = this.proposal.toBuffer()
    return Buffer.concat([codecVersion, typeId, buff], 2 + typeId.length + buff.length)
  }
}
/**
 * Class representing an unsigned AddProposalTx transaction.
 */
export class AddProposalTx extends BaseTx {
  protected _typeName = "AddProposalTx"
  protected _typeID = PlatformVMConstants.ADDPROPOSALTX

  serialize(encoding: SerializedEncoding = "hex"): object {
    let fields: object = super.serialize(encoding)
    return {
      ...fields,
      proposerAddress: serialization.encoder(this.proposerAddress, encoding, "Buffer", "cb58"),
      proposerAuth: this.proposerAuth.serialize(encoding),
      proposalPayload: this.proposalPayload.serialize(encoding),
    }
  }
  deserialize(fields: object, encoding: SerializedEncoding = "hex") {
    super.deserialize(fields, encoding)
    this.proposerAddress = serialization.decoder(
      fields["proposerAddress"],
      encoding,
      "cb58",
      "Buffer",
      20
    )
    this.proposerAuth.deserialize(fields["proposerAuth"], encoding)
    this.proposalPayload = this.proposalPayload.deserialize(fields, encoding)
  }

  protected upgradeVersionID = new UpgradeVersionID()
  protected proposalPayload: ProposalWrapper
  protected proposerAddress = Buffer.alloc(20)
  protected proposerAuth: SubnetAuth

  /**
   * Returns the id of the [[AddProposalTx]]
   */
  getTxType(): number {
    return this._typeID
  }

  /**
   * Returns the proposal payload
   */
  getProposalPayload(): ProposalWrapper {
    return this.proposalPayload
  }

  /**
   * Returns the proposer address
   */
  getProposerAddress(): Buffer {
    return this.proposerAddress
  }

  /**
   * Returns the proposer auth
   */
  getProposerAuth(): SubnetAuth {
    return this.proposerAuth
  }

  /**
   * Takes a {@link https://github.com/feross/buffer|Buffer} containing an [[AddProposalTx]], parses it, populates the class, and returns the length of the [[AddProposalTx]] in bytes.
   *
   * @param bytes A {@link https://github.com/feross/buffer|Buffer} containing a raw [[AddProposalTx]]
   *
   * @returns The length of the raw [[AddProposalTx]]
   *
   * @remarks assume not-checksummed
   */
  fromBuffer(bytes: Buffer, offset: number = 0): number {
    offset = super.fromBuffer(bytes, offset)
    this.upgradeVersionID = new UpgradeVersionID()
    offset = this.upgradeVersionID.fromBuffer(bytes, offset)
    const payloadSize = bintools.copyFrom(bytes, offset, offset + 4).readUInt32BE(0)
    offset += 4

    const proposalWrapper = new ProposalWrapper()
    offset = proposalWrapper.fromBuffer(bytes, offset)
    this.proposalPayload = proposalWrapper

    this.proposerAddress = bintools.copyFrom(bytes, offset, offset + 20)
    offset += 20
    let sa: SubnetAuth = new SubnetAuth()
    offset += sa.fromBuffer(bintools.copyFrom(bytes, offset))
    this.proposerAuth = sa
    return offset
  }

  /**
   * Returns a {@link https://github.com/feross/buffer|Buffer} representation of the [[AddProposalTx]].
   */
  toBuffer(): Buffer {
    const superbuff: Buffer = super.toBuffer()
    const upgradeBuf = this.upgradeVersionID.toBuffer()

    // TODO: proposalPayload toBuffer
    const payloadBuffer = this.proposalPayload.toBuffer()
    const payloadSize = Buffer.alloc(4)
    payloadSize.writeUInt32BE(payloadBuffer.length, 0)
    let bsize: number = upgradeBuf.length + superbuff.length + payloadSize.length + payloadBuffer.length
    const barr: Buffer[] = [
      upgradeBuf,
      superbuff,
      payloadSize,
      payloadBuffer,
    ]

    bsize += this.proposerAddress.length
    barr.push(this.proposerAddress)

    const authBuffer = this.proposerAuth.toBuffer()
    bsize += authBuffer.length
    barr.push(authBuffer)
    return Buffer.concat(barr, bsize)
  }

  /**
   * Takes the bytes of an [[UnsignedTx]] and returns an array of [[Credential]]s
   *
   * @param msg A Buffer for the [[UnsignedTx]]
   * @param kc A [[KeyChain]] used in signing
   *
   * @returns An array of [[Credential]]s
   */
  sign(msg: Buffer, kc: KeyChain): Credential[] {
    const creds: Credential[] = super.sign(msg, kc)
    // Proposer
    const cred: Credential = SelectCredentialClass(
      PlatformVMConstants.SECPCREDENTIAL
    )
    const keypair: KeyPair = kc.getKey(this.proposerAddress)
    const signval: Buffer = keypair.sign(msg)
    const sig: Signature = new Signature()
    sig.fromBuffer(signval)
    cred.addSignature(sig)
    creds.push(cred)

    return creds
  }

  /**
   * Class representing an unsigned RegisterNode transaction.
   *
   * @param networkID Optional networkID, [[DefaultNetworkID]]
   * @param blockchainID Optional blockchainID, default Buffer.alloc(32, 16)
   * @param outs Optional array of the [[TransferableOutput]]s
   * @param ins Optional array of the [[TransferableInput]]s
   * @param memo Optional {@link https://github.com/feross/buffer|Buffer} for the memo field
   * @param proposal the proposal payload to create.
   * @param proposerAddress the creater(proposer) address.
   * @param proposerAuth auth that allows to create a proposal.
   */
  constructor(
    version: number = DefaultTransactionVersionNumber,
    networkID: number = DefaultNetworkID,
    blockchainID: Buffer = Buffer.alloc(32, 16),
    outs: TransferableOutput[] = undefined,
    ins: TransferableInput[] = undefined,
    memo: Buffer = undefined,
    proposal: Proposal = undefined,
    proposerAddress: string | Buffer = undefined,
    proposerAuth: SubnetAuth = undefined
  ) {
    super(networkID, blockchainID, outs, ins, memo)
    this.upgradeVersionID = new UpgradeVersionID(version)
    if (typeof proposerAddress === "string") {
      this.proposerAddress = bintools.stringToAddress(proposerAddress)
    } else {
      this.proposerAddress = proposerAddress
    }

    this.proposalPayload = new ProposalWrapper(proposal)
    
    if (proposerAuth) {
      this.proposerAuth = proposerAuth
    } else {
      this.proposerAuth = new SubnetAuth()
    }
  }
}
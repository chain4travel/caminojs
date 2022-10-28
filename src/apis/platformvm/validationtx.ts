/**
 * @packageDocumentation
 * @module API-PlatformVM-ValidationTx
 */

import BN from "bn.js"
import BinTools from "../../utils/bintools"
import { BaseTx } from "./basetx"
import { TransferableOutput } from "../platformvm/outputs"
import { TransferableInput } from "../platformvm/inputs"
import { Buffer } from "buffer/"
import { PlatformVMConstants } from "./constants"
import { DefaultNetworkID } from "../../utils/constants"
import { bufferToNodeIDString } from "../../utils/helperfunctions"
import { AmountOutput, ParseableOutput } from "./outputs"
import { Serialization, SerializedEncoding } from "../../utils/serialization"

/**
 * @ignore
 */
const bintools: BinTools = BinTools.getInstance()
const serialization: Serialization = Serialization.getInstance()

/**
 * Abstract class representing an transactions with validation information.
 */
export abstract class ValidatorTx extends BaseTx {
  protected _typeName = "ValidatorTx"
  protected _typeID = undefined

  serialize(encoding: SerializedEncoding = "hex"): object {
    let fields: object = super.serialize(encoding)
    return {
      ...fields,
      nodeID: serialization.encoder(this.nodeID, encoding, "Buffer", "nodeID"),
      startTime: serialization.encoder(
        this.startTime,
        encoding,
        "Buffer",
        "decimalString"
      ),
      endTime: serialization.encoder(
        this.endTime,
        encoding,
        "Buffer",
        "decimalString"
      )
    }
  }
  deserialize(fields: object, encoding: SerializedEncoding = "hex") {
    super.deserialize(fields, encoding)
    this.nodeID = serialization.decoder(
      fields["nodeID"],
      encoding,
      "nodeID",
      "Buffer",
      20
    )
    this.startTime = serialization.decoder(
      fields["startTime"],
      encoding,
      "decimalString",
      "Buffer",
      8
    )
    this.endTime = serialization.decoder(
      fields["endTime"],
      encoding,
      "decimalString",
      "Buffer",
      8
    )
  }

  protected nodeID: Buffer = Buffer.alloc(20)
  protected startTime: Buffer = Buffer.alloc(8)
  protected endTime: Buffer = Buffer.alloc(8)

  /**
   * Returns a {@link https://github.com/feross/buffer|Buffer} for the stake amount.
   */
  getNodeID(): Buffer {
    return this.nodeID
  }

  /**
   * Returns a string for the nodeID amount.
   */
  getNodeIDString(): string {
    return bufferToNodeIDString(this.nodeID)
  }
  /**
   * Returns a {@link https://github.com/indutny/bn.js/|BN} for the stake amount.
   */
  getStartTime() {
    return bintools.fromBufferToBN(this.startTime)
  }

  /**
   * Returns a {@link https://github.com/indutny/bn.js/|BN} for the stake amount.
   */
  getEndTime() {
    return bintools.fromBufferToBN(this.endTime)
  }

  fromBuffer(bytes: Buffer, offset: number = 0): number {
    offset = super.fromBuffer(bytes, offset)
    this.nodeID = bintools.copyFrom(bytes, offset, offset + 20)
    offset += 20
    this.startTime = bintools.copyFrom(bytes, offset, offset + 8)
    offset += 8
    this.endTime = bintools.copyFrom(bytes, offset, offset + 8)
    offset += 8
    return offset
  }

  /**
   * Returns a {@link https://github.com/feross/buffer|Buffer} representation of the [[ValidatorTx]].
   */
  toBuffer(): Buffer {
    const superbuff: Buffer = super.toBuffer()
    const bsize: number =
      superbuff.length +
      this.nodeID.length +
      this.startTime.length +
      this.endTime.length
    return Buffer.concat(
      [superbuff, this.nodeID, this.startTime, this.endTime],
      bsize
    )
  }

  constructor(
    networkID: number,
    blockchainID: Buffer,
    outs: TransferableOutput[],
    ins: TransferableInput[],
    memo?: Buffer,
    nodeID?: Buffer,
    startTime?: BN,
    endTime?: BN
  ) {
    super(networkID, blockchainID, outs, ins, memo)
    this.nodeID = nodeID
    this.startTime = bintools.fromBNToBuffer(startTime, 8)
    this.endTime = bintools.fromBNToBuffer(endTime, 8)
  }
}

export abstract class WeightedValidatorTx extends ValidatorTx {
  protected _typeName = "WeightedValidatorTx"
  protected _typeID = undefined

  serialize(encoding: SerializedEncoding = "hex"): object {
    let fields: object = super.serialize(encoding)
    return {
      ...fields,
      weight: serialization.encoder(
        this.weight,
        encoding,
        "Buffer",
        "decimalString"
      )
    }
  }
  deserialize(fields: object, encoding: SerializedEncoding = "hex") {
    super.deserialize(fields, encoding)
    this.weight = serialization.decoder(
      fields["weight"],
      encoding,
      "decimalString",
      "Buffer",
      8
    )
  }

  protected weight: Buffer = Buffer.alloc(8)

  /**
   * Returns a {@link https://github.com/indutny/bn.js/|BN} for the stake amount.
   */
  getWeight(): BN {
    return bintools.fromBufferToBN(this.weight)
  }

  /**
   * Returns a {@link https://github.com/feross/buffer|Buffer} for the stake amount.
   */
  getWeightBuffer(): Buffer {
    return this.weight
  }

  fromBuffer(bytes: Buffer, offset: number = 0): number {
    offset = super.fromBuffer(bytes, offset)
    this.weight = bintools.copyFrom(bytes, offset, offset + 8)
    offset += 8
    return offset
  }

  /**
   * Returns a {@link https://github.com/feross/buffer|Buffer} representation of the [[AddSubnetValidatorTx]].
   */
  toBuffer(): Buffer {
    const superbuff: Buffer = super.toBuffer()
    return Buffer.concat([superbuff, this.weight])
  }

  /**
   * Class representing an unsigned AddSubnetValidatorTx transaction.
   *
   * @param networkID Optional. Networkid, [[DefaultNetworkID]]
   * @param blockchainID Optional. Blockchainid, default Buffer.alloc(32, 16)
   * @param outs Optional. Array of the [[TransferableOutput]]s
   * @param ins Optional. Array of the [[TransferableInput]]s
   * @param memo Optional. {@link https://github.com/feross/buffer|Buffer} for the memo field
   * @param nodeID Optional. The node ID of the validator being added.
   * @param startTime Optional. The Unix time when the validator starts validating the Primary Network.
   * @param endTime Optional. The Unix time when the validator stops validating the Primary Network (and staked AVAX is returned).
   * @param weight Optional. The amount of nAVAX the validator is staking.
   */
  constructor(
    networkID: number = DefaultNetworkID,
    blockchainID: Buffer = Buffer.alloc(32, 16),
    outs: TransferableOutput[] = undefined,
    ins: TransferableInput[] = undefined,
    memo: Buffer = undefined,
    nodeID: Buffer = undefined,
    startTime: BN = undefined,
    endTime: BN = undefined,
    weight: BN = undefined
  ) {
    super(networkID, blockchainID, outs, ins, memo, nodeID, startTime, endTime)
    if (typeof weight !== undefined) {
      this.weight = bintools.fromBNToBuffer(weight, 8)
    }
  }
}

/**
 * Class representing an unsigned AddDepositTx transaction.
 */
export class AddDepositTx extends WeightedValidatorTx {
  protected _typeName = "AddDepositTx"
  protected _typeID = PlatformVMConstants.Get(PlatformVMConstants.ADDDEPOSITTXS)

  serialize(encoding: SerializedEncoding = "hex"): object {
    let fields: object = super.serialize(encoding)
    return {
      ...fields,
      stakeOuts: this.stakeOuts.map((s) => s.serialize(encoding)),
      rewardOwners: this.rewardOwners.serialize(encoding)
    }
  }
  deserialize(fields: object, encoding: SerializedEncoding = "hex") {
    super.deserialize(fields, encoding)
    this.stakeOuts = fields["stakeOuts"].map((s: object) => {
      let xferout: TransferableOutput = new TransferableOutput()
      xferout.deserialize(s, encoding)
      return xferout
    })
    this.rewardOwners = new ParseableOutput()
    this.rewardOwners.deserialize(fields["rewardOwners"], encoding)
  }

  protected stakeOuts: TransferableOutput[] = []
  protected rewardOwners: ParseableOutput = undefined

  /**
   * Returns the id of the [[AddDepositTx]]
   */
  getTxType(): number {
    return this._typeID
  }

  /**
   * Returns a {@link https://github.com/indutny/bn.js/|BN} for the stake amount.
   */
  getStakeAmount(): BN {
    return this.getWeight()
  }

  /**
   * Returns a {@link https://github.com/feross/buffer|Buffer} for the stake amount.
   */
  getStakeAmountBuffer(): Buffer {
    return this.weight
  }

  /**
   * Returns the array of outputs being staked.
   */
  getStakeOuts(): TransferableOutput[] {
    return this.stakeOuts
  }

  /**
   * Should match stakeAmount. Used in sanity checking.
   */
  getStakeOutsTotal(): BN {
    let val: BN = new BN(0)
    for (let i: number = 0; i < this.stakeOuts.length; i++) {
      val = val.add(
        (this.stakeOuts[`${i}`].getOutput() as AmountOutput).getAmount()
      )
    }
    return val
  }

  /**
   * Returns a {@link https://github.com/feross/buffer|Buffer} for the reward address.
   */
  getRewardOwners(): ParseableOutput {
    return this.rewardOwners
  }

  getTotalOuts(): TransferableOutput[] {
    return [...(this.getOuts() as TransferableOutput[]), ...this.getStakeOuts()]
  }

  fromBuffer(bytes: Buffer, offset: number = 0): number {
    offset = super.fromBuffer(bytes, offset)
    const numstakeouts = bintools.copyFrom(bytes, offset, offset + 4)
    offset += 4
    const outcount: number = numstakeouts.readUInt32BE(0)
    this.stakeOuts = []
    for (let i: number = 0; i < outcount; i++) {
      const xferout: TransferableOutput = new TransferableOutput()
      offset = xferout.fromBuffer(bytes, offset)
      this.stakeOuts.push(xferout)
    }
    this.rewardOwners = new ParseableOutput()
    offset = this.rewardOwners.fromBuffer(bytes, offset)
    return offset
  }

  /**
   * Returns a {@link https://github.com/feross/buffer|Buffer} representation of the [[AddDepositTx]].
   */
  toBuffer(): Buffer {
    const superbuff: Buffer = super.toBuffer()
    let bsize: number = superbuff.length
    const numouts: Buffer = Buffer.alloc(4)
    numouts.writeUInt32BE(this.stakeOuts.length, 0)
    let barr: Buffer[] = [super.toBuffer(), numouts]
    bsize += numouts.length
    this.stakeOuts = this.stakeOuts.sort(TransferableOutput.comparator())
    for (let i: number = 0; i < this.stakeOuts.length; i++) {
      let out: Buffer = this.stakeOuts[`${i}`].toBuffer()
      barr.push(out)
      bsize += out.length
    }
    let ro: Buffer = this.rewardOwners.toBuffer()
    barr.push(ro)
    bsize += ro.length
    return Buffer.concat(barr, bsize)
  }

  clone(): this {
    let newbase: AddDepositTx = new AddDepositTx()
    newbase.fromBuffer(this.toBuffer())
    return newbase as this
  }

  create(...args: any[]): this {
    return new AddDepositTx(...args) as this
  }

  /**
   * Class representing an unsigned AddDepositTx transaction.
   *
   * @param networkID Optional. Networkid, [[DefaultNetworkID]]
   * @param blockchainID Optional. Blockchainid, default Buffer.alloc(32, 16)
   * @param outs Optional. Array of the [[TransferableOutput]]s
   * @param ins Optional. Array of the [[TransferableInput]]s
   * @param memo Optional. {@link https://github.com/feross/buffer|Buffer} for the memo field
   * @param nodeID Optional. The node ID of the validator being added.
   * @param startTime Optional. The Unix time when the validator starts validating the Primary Network.
   * @param endTime Optional. The Unix time when the validator stops validating the Primary Network (and staked AVAX is returned).
   * @param stakeAmount Optional. The amount of nAVAX the validator is staking.
   * @param rewardOwners Optional. The [[ParseableOutput]] containing a [[SECPOwnerOutput]] for the rewards.
   */
  constructor(
    networkID: number = DefaultNetworkID,
    blockchainID: Buffer = Buffer.alloc(32, 16),
    outs: TransferableOutput[] = undefined,
    ins: TransferableInput[] = undefined,
    memo: Buffer = undefined,
    nodeID: Buffer = undefined,
    startTime: BN = undefined,
    endTime: BN = undefined,
    stakeAmount: BN = undefined,
    stakeOuts: TransferableOutput[] = undefined,
    rewardOwners: ParseableOutput = undefined
  ) {
    super(
      networkID,
      blockchainID,
      outs,
      ins,
      memo,
      nodeID,
      startTime,
      endTime,
      stakeAmount
    )
    if (typeof stakeOuts !== undefined) {
      this.stakeOuts = stakeOuts
    }
    this.rewardOwners = rewardOwners
  }
}

export class AddValidatorTx extends WeightedValidatorTx {
  protected _typeName = "AddValidatorTx"
  protected _typeID = PlatformVMConstants.Get(
    PlatformVMConstants.ADDVALIDATORTXS
  )

  serialize(encoding: SerializedEncoding = "hex"): object {
    let fields: object = super.serialize(encoding)
    return {
      ...fields,
      rewardOwners: this.rewardOwners.serialize(encoding)
    }
  }
  deserialize(fields: object, encoding: SerializedEncoding = "hex") {
    super.deserialize(fields, encoding)
    this.rewardOwners = new ParseableOutput()
    this.rewardOwners.deserialize(fields["rewardOwners"], encoding)
  }

  protected rewardOwners: ParseableOutput = undefined

  /**
   * Returns the id of the [[AddValidatorTx]]
   */
  getTxType(): number {
    return this._typeID
  }

  /**
   * Returns a {@link https://github.com/indutny/bn.js/|BN} for the stake amount.
   */
  getStakeAmount(): BN {
    return this.getWeight()
  }

  /**
   * Returns a {@link https://github.com/feross/buffer|Buffer} for the reward address.
   */
  getRewardOwners(): ParseableOutput {
    return this.rewardOwners
  }

  fromBuffer(bytes: Buffer, offset: number = 0): number {
    offset = super.fromBuffer(bytes, offset)
    this.rewardOwners = new ParseableOutput()
    offset = this.rewardOwners.fromBuffer(bytes, offset)
    return offset
  }

  /**
   * Returns a {@link https://github.com/feross/buffer|Buffer} representation of the [[AddDepositTx]].
   */
  toBuffer(): Buffer {
    const superbuff: Buffer = super.toBuffer()
    let bsize: number = superbuff.length
    let ro: Buffer = this.rewardOwners.toBuffer()
    bsize += ro.length
    return Buffer.concat([ro], bsize)
  }

  /**
   * Class representing an unsigned AddValidatorTx transaction.
   *
   * @param networkID Optional. Networkid, [[DefaultNetworkID]]
   * @param blockchainID Optional. Blockchainid, default Buffer.alloc(32, 16)
   * @param outs Optional. Array of the [[TransferableOutput]]s
   * @param ins Optional. Array of the [[TransferableInput]]s
   * @param memo Optional. {@link https://github.com/feross/buffer|Buffer} for the memo field
   * @param nodeID Optional. The node ID of the validator being added.
   * @param startTime Optional. The Unix time when the validator starts validating the Primary Network.
   * @param endTime Optional. The Unix time when the validator stops validating the Primary Network (and staked AVAX is returned).
   * @param stakeAmount Optional. The amount of nAVAX the validator is staking.
   * @param rewardOwners Optional. The [[ParseableOutput]] containing the [[SECPOwnerOutput]] for the rewards.
   */
  constructor(
    networkID: number = DefaultNetworkID,
    blockchainID: Buffer = Buffer.alloc(32, 16),
    outs: TransferableOutput[] = undefined,
    ins: TransferableInput[] = undefined,
    memo: Buffer = undefined,
    nodeID: Buffer = undefined,
    startTime: BN = undefined,
    endTime: BN = undefined,
    stakeAmount: BN = undefined,
    rewardOwners: ParseableOutput = undefined
  ) {
    super(
      networkID,
      blockchainID,
      outs,
      ins,
      memo,
      nodeID,
      startTime,
      endTime,
      stakeAmount
    )
    this.rewardOwners = rewardOwners
  }
}

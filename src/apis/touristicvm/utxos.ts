/**
 * @packageDocumentation
 * @module API-AVM-UTXOs
 */
import { Buffer } from "buffer/"
import BinTools from "../../utils/bintools"
import BN from "bn.js"
import {
  AmountOutput,
  SelectOutputClass,
  TransferableOutput,
  SECPTransferOutput
} from "./outputs"
import { SECPTransferInput, TransferableInput } from "./inputs"
import { Output, OutputOwners } from "../../common/output"
import { UnixNow } from "../../utils/helperfunctions"
import { StandardUTXO, StandardUTXOSet } from "../../common/utxos"
import { BaseTx } from "./basetx"
import {
  StandardAssetAmountDestination,
  AssetAmount
} from "../../common/assetamount"
import { Serialization, SerializedEncoding } from "../../utils/serialization"
import {
  UTXOError,
  AddressError,
  InsufficientFundsError,
  ThresholdError,
  SECPMintOutputError
} from "../../utils/errors"
import { UnsignedTx } from "caminojs/apis/touristicvm/tx"
import { TouristicVmConstants } from "caminojs/apis/touristicvm/constants"

/**
 * @ignore
 */
const bintools: BinTools = BinTools.getInstance()
const serialization: Serialization = Serialization.getInstance()

/**
 * Class for representing a single UTXO.
 */
export class UTXO extends StandardUTXO {
  protected _typeName = "UTXO"
  protected _typeID = undefined

  //serialize is inherited

  deserialize(fields: object, encoding: SerializedEncoding = "hex") {
    super.deserialize(fields, encoding)
    this.output = SelectOutputClass(fields["output"]["_typeID"])
    this.output.deserialize(fields["output"], encoding)
  }

  fromBuffer(bytes: Buffer, offset: number = 0): number {
    this.codecID = bintools.copyFrom(bytes, offset, offset + 2)
    offset += 2
    this.txid = bintools.copyFrom(bytes, offset, offset + 32)
    offset += 32
    this.outputidx = bintools.copyFrom(bytes, offset, offset + 4)
    offset += 4
    this.assetID = bintools.copyFrom(bytes, offset, offset + 32)
    offset += 32
    const outputid: number = bintools
      .copyFrom(bytes, offset, offset + 4)
      .readUInt32BE(0)
    offset += 4
    this.output = SelectOutputClass(outputid)
    return this.output.fromBuffer(bytes, offset)
  }

  /**
   * Takes a base-58 string containing a [[UTXO]], parses it, populates the class, and returns the length of the StandardUTXO in bytes.
   *
   * @param serialized A base-58 string containing a raw [[UTXO]]
   *
   * @returns The length of the raw [[UTXO]]
   *
   * @remarks
   * unlike most fromStrings, it expects the string to be serialized in cb58 format
   */
  fromString(serialized: string): number {
    /* istanbul ignore next */
    return this.fromBuffer(bintools.cb58Decode(serialized))
  }

  /**
   * Returns a base-58 representation of the [[UTXO]].
   *
   * @remarks
   * unlike most toStrings, this returns in cb58 serialization format
   */
  toString(): string {
    /* istanbul ignore next */
    return bintools.cb58Encode(this.toBuffer())
  }

  clone(): this {
    const utxo: UTXO = new UTXO()
    utxo.fromBuffer(this.toBuffer())
    return utxo as this
  }

  create(
    codecID: number = TouristicVmConstants.LATESTCODEC,
    txid: Buffer = undefined,
    outputidx: Buffer | number = undefined,
    assetID: Buffer = undefined,
    output: Output = undefined
  ): this {
    return new UTXO(codecID, txid, outputidx, assetID, output) as this
  }
}

export class AssetAmountDestination extends StandardAssetAmountDestination<
  TransferableOutput,
  TransferableInput
> {}

/**
 * Class representing a set of [[UTXO]]s.
 */
export class UTXOSet extends StandardUTXOSet<UTXO> {
  protected _typeName = "UTXOSet"
  protected _typeID = undefined

  //serialize is inherited

  deserialize(fields: object, encoding: SerializedEncoding = "hex") {
    super.deserialize(fields, encoding)
    let utxos: { [key: string]: UTXO } = {}
    for (let utxoid in fields["utxos"]) {
      let utxoidCleaned: string = serialization.decoder(
        utxoid,
        encoding,
        "base58",
        "base58"
      )
      utxos[`${utxoidCleaned}`] = new UTXO()
      utxos[`${utxoidCleaned}`].deserialize(
        fields["utxos"][`${utxoid}`],
        encoding
      )
    }
    let addressUTXOs: { [key: string]: { [key: string]: BN } } = {}
    for (let address in fields["addressUTXOs"]) {
      let addressCleaned: string = serialization.decoder(
        address,
        encoding,
        "cb58",
        "hex"
      )
      let utxobalance: { [key: string]: BN } = {}
      for (let utxoid in fields["addressUTXOs"][`${address}`]) {
        let utxoidCleaned: string = serialization.decoder(
          utxoid,
          encoding,
          "base58",
          "base58"
        )
        utxobalance[`${utxoidCleaned}`] = serialization.decoder(
          fields["addressUTXOs"][`${address}`][`${utxoid}`],
          encoding,
          "decimalString",
          "BN"
        )
      }
      addressUTXOs[`${addressCleaned}`] = utxobalance
    }
    this.utxos = utxos
    this.addressUTXOs = addressUTXOs
  }

  parseUTXO(utxo: UTXO | string): UTXO {
    const utxovar: UTXO = new UTXO()
    // force a copy
    if (typeof utxo === "string") {
      utxovar.fromBuffer(bintools.cb58Decode(utxo))
    } else if (utxo instanceof UTXO) {
      utxovar.fromBuffer(utxo.toBuffer()) // forces a copy
    } else {
      /* istanbul ignore next */
      throw new UTXOError(
        "Error - UTXO.parseUTXO: utxo parameter is not a UTXO or string"
      )
    }
    return utxovar
  }

  create(): this {
    return new UTXOSet() as this
  }

  clone(): this {
    const newset: UTXOSet = this.create()
    const allUTXOs: UTXO[] = this.getAllUTXOs()
    newset.addArray(allUTXOs)
    return newset as this
  }

  _feeCheck(fee: BN, feeAssetID: Buffer): boolean {
    return (
      typeof fee !== "undefined" &&
      typeof feeAssetID !== "undefined" &&
      fee.gt(new BN(0)) &&
      feeAssetID instanceof Buffer
    )
  }

  getMinimumSpendable = (
    aad: AssetAmountDestination,
    asOf: BN = UnixNow(),
    locktime: BN = new BN(0),
    threshold: number = 1
  ): Error => {
    const utxoArray: UTXO[] = this.getAllUTXOs()
    const outids: object = {}
    for (let i: number = 0; i < utxoArray.length && !aad.canComplete(); i++) {
      const u: UTXO = utxoArray[`${i}`]
      const assetKey: string = u.getAssetID().toString("hex")
      const fromAddresses: Buffer[] = aad.getSenders()
      if (
        u.getOutput() instanceof AmountOutput &&
        aad.assetExists(assetKey) &&
        u.getOutput().meetsThreshold(fromAddresses, asOf)
      ) {
        const am: AssetAmount = aad.getAssetAmount(assetKey)
        if (!am.isFinished()) {
          const uout: AmountOutput = u.getOutput() as AmountOutput
          outids[`${assetKey}`] = uout.getOutputID()
          const amount = uout.getAmount()
          am.spendAmount(amount)
          const txid: Buffer = u.getTxID()
          const outputidx: Buffer = u.getOutputIdx()
          const input: SECPTransferInput = new SECPTransferInput(amount)
          const xferin: TransferableInput = new TransferableInput(
            txid,
            outputidx,
            u.getAssetID(),
            input
          )
          const spenders: Buffer[] = uout.getSpenders(fromAddresses, asOf)
          for (let j: number = 0; j < spenders.length; j++) {
            const idx: number = uout.getAddressIdx(spenders[`${j}`])
            if (idx === -1) {
              /* istanbul ignore next */
              throw new AddressError(
                "Error - UTXOSet.getMinimumSpendable: no such " +
                  `address in output: ${spenders[`${j}`]}`
              )
            }
            xferin.getInput().addSignatureIdx(idx, spenders[`${j}`])
          }
          aad.addInput(xferin)
        } else if (
          aad.assetExists(assetKey) &&
          !(u.getOutput() instanceof AmountOutput)
        ) {
          /**
           * Leaving the below lines, not simply for posterity, but for clarification.
           * AssetIDs may have mixed OutputTypes.
           * Some of those OutputTypes may implement AmountOutput.
           * Others may not.
           * Simply continue in this condition.
           */
          /*return new Error('Error - UTXOSet.getMinimumSpendable: outputID does not '
            + `implement AmountOutput: ${u.getOutput().getOutputID}`)*/
          continue
        }
      }
    }
    if (!aad.canComplete()) {
      return new InsufficientFundsError(
        "Error - UTXOSet.getMinimumSpendable: insufficient " +
          "funds to create the transaction"
      )
    }
    const amounts: AssetAmount[] = aad.getAmounts()
    const zero: BN = new BN(0)
    for (let i: number = 0; i < amounts.length; i++) {
      const assetKey: string = amounts[`${i}`].getAssetIDString()
      const amount: BN = amounts[`${i}`].getAmount()
      if (amount.gt(zero)) {
        const spendout: AmountOutput = SelectOutputClass(
          outids[`${assetKey}`],
          amount,
          aad.getDestinations(),
          locktime,
          threshold
        ) as AmountOutput
        const xferout: TransferableOutput = new TransferableOutput(
          amounts[`${i}`].getAssetID(),
          spendout
        )
        aad.addOutput(xferout)
      }
      const change: BN = amounts[`${i}`].getChange()
      if (change.gt(zero)) {
        const changeout: AmountOutput = SelectOutputClass(
          outids[`${assetKey}`],
          change,
          aad.getChangeAddresses()
        ) as AmountOutput
        const chgxferout: TransferableOutput = new TransferableOutput(
          amounts[`${i}`].getAssetID(),
          changeout
        )
        aad.addChange(chgxferout)
      }
    }
    return undefined
  }

  /**
   * Creates an [[UnsignedTx]] wrapping a [[BaseTx]]. For more granular control, you may create your own
   * [[UnsignedTx]] wrapping a [[BaseTx]] manually (with their corresponding [[TransferableInput]]s and [[TransferableOutput]]s).
   *
   * @param networkID The number representing NetworkID of the node
   * @param blockchainID The {@link https://github.com/feross/buffer|Buffer} representing the BlockchainID for the transaction
   * @param amount The amount of the asset to be spent in its smallest denomination, represented as {@link https://github.com/indutny/bn.js/|BN}.
   * @param assetID {@link https://github.com/feross/buffer|Buffer} of the asset ID for the UTXO
   * @param toAddresses The addresses to send the funds
   * @param fromAddresses The addresses being used to send the funds from the UTXOs {@link https://github.com/feross/buffer|Buffer}
   * @param changeAddresses Optional. The addresses that can spend the change remaining from the spent UTXOs. Default: toAddresses
   * @param fee Optional. The amount of fees to burn in its smallest denomination, represented as {@link https://github.com/indutny/bn.js/|BN}
   * @param feeAssetID Optional. The assetID of the fees being burned. Default: assetID
   * @param memo Optional. Contains arbitrary data, up to 256 bytes
   * @param asOf Optional. The timestamp to verify the transaction against as a {@link https://github.com/indutny/bn.js/|BN}
   * @param locktime Optional. The locktime field created in the resulting outputs
   * @param toThreshold Optional. The number of signatures required to spend the funds in the resultant UTXO
   * @param changethreshold Optional. The number of signatures required to spend the funds in the resultant change UTXO
   *
   * @returns An unsigned transaction created from the passed in parameters.
   *
   */
  buildBaseTx = (
    networkID: number,
    blockchainID: Buffer,
    amount: BN,
    assetID: Buffer,
    toAddresses: Buffer[],
    fromAddresses: Buffer[],
    changeAddresses: Buffer[] = undefined,
    fee: BN = undefined,
    feeAssetID: Buffer = undefined,
    memo: Buffer = undefined,
    asOf: BN = UnixNow(),
    locktime: BN = new BN(0),
    toThreshold: number = 1,
    changeThreshold: number = 1
  ): UnsignedTx => {
    if (toThreshold > toAddresses.length) {
      /* istanbul ignore next */
      throw new ThresholdError(
        "Error - UTXOSet.buildBaseTx: threshold is greater than number of addresses"
      )
    }

    if (typeof changeAddresses === "undefined") {
      changeAddresses = toAddresses
    }

    if (typeof feeAssetID === "undefined") {
      feeAssetID = assetID
    }

    const zero: BN = new BN(0)

    if (amount.eq(zero)) {
      return undefined
    }

    const aad: AssetAmountDestination = new AssetAmountDestination(
      toAddresses,
      toThreshold,
      fromAddresses,
      changeAddresses,
      changeThreshold
    )
    if (assetID.toString("hex") === feeAssetID.toString("hex")) {
      aad.addAssetAmount(assetID, amount, fee)
    } else {
      aad.addAssetAmount(assetID, amount, zero)
      if (this._feeCheck(fee, feeAssetID)) {
        aad.addAssetAmount(feeAssetID, zero, fee)
      }
    }

    let ins: TransferableInput[] = []
    let outs: TransferableOutput[] = []

    const success: Error = this.getMinimumSpendable(aad, asOf, locktime)
    if (typeof success === "undefined") {
      ins = aad.getInputs()
      outs = aad.getAllOutputs()
    } else {
      throw success
    }

    const baseTx: BaseTx = new BaseTx(networkID, blockchainID, outs, ins, memo)
    return new UnsignedTx(baseTx)
  }

  // /**
  //  * Creates an unsigned Secp mint transaction. For more granular control, you may create your own
  //  * [[OperationTx]] manually (with their corresponding [[TransferableInput]]s, [[TransferableOutput]]s, and [[TransferOperation]]s).
  //  *
  //  * @param networkID The number representing NetworkID of the node
  //  * @param blockchainID The {@link https://github.com/feross/buffer|Buffer} representing the BlockchainID for the transaction
  //  * @param mintOwner A [[SECPMintOutput]] which specifies the new set of minters
  //  * @param transferOwner A [[SECPTransferOutput]] which specifies where the minted tokens will go
  //  * @param fromAddresses The addresses being used to send the funds from the UTXOs {@link https://github.com/feross/buffer|Buffer}
  //  * @param changeAddresses The addresses that can spend the change remaining from the spent UTXOs
  //  * @param mintUTXOID The UTXOID for the [[SCPMintOutput]] being spent to produce more tokens
  //  * @param fee Optional. The amount of fees to burn in its smallest denomination, represented as {@link https://github.com/indutny/bn.js/|BN}
  //  * @param feeAssetID Optional. The assetID of the fees being burned.
  //  * @param memo Optional contains arbitrary bytes, up to 256 bytes
  //  * @param asOf Optional. The timestamp to verify the transaction against as a {@link https://github.com/indutny/bn.js/|BN}
  //  * @param changethreshold Optional. The number of signatures required to spend the funds in the resultant change UTXO
  //  *
  //  * @returns An unsigned transaction created from the passed in parameters.
  //  */
  // /**
  //  * Creates an unsigned ImportTx transaction.
  //  *
  //  * @param networkID The number representing NetworkID of the node
  //  * @param blockchainID The {@link https://github.com/feross/buffer|Buffer} representing the BlockchainID for the transaction
  //  * @param toAddresses The addresses to send the funds
  //  * @param fromAddresses The addresses being used to send the funds from the UTXOs {@link https://github.com/feross/buffer|Buffer}
  //  * @param changeAddresses Optional. The addresses that can spend the change remaining from the spent UTXOs.
  //  * @param importIns An array of [[TransferableInput]]s being imported
  //  * @param sourceChain A {@link https://github.com/feross/buffer|Buffer} for the chainid where the imports are coming from.
  //  * @param fee Optional. The amount of fees to burn in its smallest denomination, represented as {@link https://github.com/indutny/bn.js/|BN}. Fee will come from the inputs first, if they can.
  //  * @param feeAssetID Optional. The assetID of the fees being burned.
  //  * @param memo Optional contains arbitrary bytes, up to 256 bytes
  //  * @param asOf Optional. The timestamp to verify the transaction against as a {@link https://github.com/indutny/bn.js/|BN}
  //  * @param locktime Optional. The locktime field created in the resulting outputs
  //  * @param toThreshold Optional. The number of signatures required to spend the funds in the resultant UTXO
  //  * @param changethreshold Optional. The number of signatures required to spend the funds in the resultant change UTXO
  //  *
  //  * @returns An unsigned transaction created from the passed in parameters.
  //  *
  //  */
  // buildImportTx = (
  //   networkID: number,
  //   blockchainID: Buffer,
  //   toAddresses: Buffer[],
  //   fromAddresses: Buffer[],
  //   changeAddresses: Buffer[],
  //   atomics: UTXO[],
  //   sourceChain: Buffer = undefined,
  //   fee: BN = undefined,
  //   feeAssetID: Buffer = undefined,
  //   memo: Buffer = undefined,
  //   asOf: BN = UnixNow(),
  //   locktime: BN = new BN(0),
  //   toThreshold: number = 1,
  //   changeThreshold: number = 1
  // ): UnsignedTx => {
  //   const zero: BN = new BN(0)
  //   let ins: TransferableInput[] = []
  //   let outs: TransferableOutput[] = []
  //   if (typeof fee === "undefined") {
  //     fee = zero.clone()
  //   }
  //
  //   const importIns: TransferableInput[] = []
  //   let feepaid: BN = new BN(0)
  //   let feeAssetStr: string = feeAssetID.toString("hex")
  //   for (let i: number = 0; i < atomics.length; i++) {
  //     const utxo: UTXO = atomics[`${i}`]
  //     const assetID: Buffer = utxo.getAssetID()
  //     const output: AmountOutput = utxo.getOutput() as AmountOutput
  //     let amt: BN = output.getAmount().clone()
  //
  //     let infeeamount = amt.clone()
  //     let assetStr: string = assetID.toString("hex")
  //     if (
  //       typeof feeAssetID !== "undefined" &&
  //       fee.gt(zero) &&
  //       feepaid.lt(fee) &&
  //       assetStr === feeAssetStr
  //     ) {
  //       feepaid = feepaid.add(infeeamount)
  //       if (feepaid.gt(fee)) {
  //         infeeamount = feepaid.sub(fee)
  //         feepaid = fee.clone()
  //       } else {
  //         infeeamount = zero.clone()
  //       }
  //     }
  //
  //     const txid: Buffer = utxo.getTxID()
  //     const outputidx: Buffer = utxo.getOutputIdx()
  //     const input: SECPTransferInput = new SECPTransferInput(amt)
  //     const xferin: TransferableInput = new TransferableInput(
  //       txid,
  //       outputidx,
  //       assetID,
  //       input
  //     )
  //     const from: Buffer[] = output.getAddresses()
  //     const spenders: Buffer[] = output.getSpenders(from, asOf)
  //     for (let j: number = 0; j < spenders.length; j++) {
  //       const idx: number = output.getAddressIdx(spenders[`${j}`])
  //       if (idx === -1) {
  //         /* istanbul ignore next */
  //         throw new AddressError(
  //           "Error - UTXOSet.buildImportTx: no such " +
  //             `address in output: ${spenders[`${j}`]}`
  //         )
  //       }
  //       xferin.getInput().addSignatureIdx(idx, spenders[`${j}`])
  //     }
  //     importIns.push(xferin)
  //
  //     //add extra outputs for each amount (calculated from the imported inputs), minus fees
  //     if (infeeamount.gt(zero)) {
  //       const spendout: AmountOutput = SelectOutputClass(
  //         output.getOutputID(),
  //         infeeamount,
  //         toAddresses,
  //         locktime,
  //         toThreshold
  //       ) as AmountOutput
  //       const xferout: TransferableOutput = new TransferableOutput(
  //         assetID,
  //         spendout
  //       )
  //       outs.push(xferout)
  //     }
  //   }
  //
  //   // get remaining fees from the provided addresses
  //   let feeRemaining: BN = fee.sub(feepaid)
  //   if (feeRemaining.gt(zero) && this._feeCheck(feeRemaining, feeAssetID)) {
  //     const aad: AssetAmountDestination = new AssetAmountDestination(
  //       toAddresses,
  //       toThreshold,
  //       fromAddresses,
  //       changeAddresses,
  //       changeThreshold
  //     )
  //     aad.addAssetAmount(feeAssetID, zero, feeRemaining)
  //     const success: Error = this.getMinimumSpendable(aad, asOf, locktime)
  //     if (typeof success === "undefined") {
  //       ins = aad.getInputs()
  //       outs = aad.getAllOutputs()
  //     } else {
  //       throw success
  //     }
  //   }
  //
  //   const importTx: ImportTx = new ImportTx(
  //     networkID,
  //     blockchainID,
  //     outs,
  //     ins,
  //     memo,
  //     sourceChain,
  //     importIns
  //   )
  //   return new UnsignedTx(importTx)
  // }
}

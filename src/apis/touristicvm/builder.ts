import BN from "bn.js"

import { Buffer } from "buffer/"
import { LockMode } from "./api"
import { AddressError, DefaultNetworkID, ThresholdError } from "../../utils"
import { OutputOwners } from "../../common"
import { FromSigner } from "./interfaces"
import { LockMessengerFundsTx } from "./lockmessengerfundstx"
import { ImportTx } from "./importtx"
import { CashoutChequeTx, Cheque } from "./cashoutChequeTx"
import BinTools from "../../utils/bintools"
import { AssetAmountDestination, UTXO } from "./utxos"
import { UnsignedTx } from "./tx"
import { SECPTransferInput, TransferableInput } from "./inputs"
import { AmountOutput, SelectOutputClass, TransferableOutput } from "./outputs"
import { BaseTx } from "./basetx"
export interface MinimumSpendable {
  getMinimumSpendable(
    aad: AssetAmountDestination,
    asOf: BN,
    locktime: BN,
    lockMode: LockMode,
    agent?: string
  ): Promise<Error>
}
const zero: BN = new BN(0)
const bintools: BinTools = BinTools.getInstance()
export class Builder {
  spender: MinimumSpendable

  constructor(spender: MinimumSpendable) {
    this.spender = spender
  }

  buildBaseTx = async (
    networkID: number,
    blockchainID: Buffer,
    amount: BN,
    amountAssetID: Buffer,
    toAddresses: Buffer[],
    fromSigner: FromSigner,
    changeAddresses: Buffer[] = undefined,
    fee: BN = zero,
    feeAssetID: Buffer = undefined,
    memo: Buffer = undefined,
    asOf: BN = zero,
    lockTime: BN = zero,
    toThreshold: number = 1,
    changeThreshold: number = 1
  ): Promise<UnsignedTx> => {
    if (toThreshold > toAddresses.length) {
      /* istanbul ignore next */
      throw new ThresholdError(
        "Error - UTXOSet.buildBaseTx: threshold is greater than number of addresses"
      )
    }

    if (typeof changeAddresses === "undefined") {
      changeAddresses = []
    }

    if (typeof feeAssetID === "undefined") {
      feeAssetID = amountAssetID
    }

    if (amount.eq(zero)) {
      return undefined
    }

    const aad: AssetAmountDestination = new AssetAmountDestination(
      toAddresses,
      toThreshold,
      fromSigner.from,
      fromSigner.signer,
      changeAddresses,
      changeThreshold
    )
    if (amountAssetID.toString("hex") === feeAssetID.toString("hex")) {
      aad.addAssetAmount(amountAssetID, amount, fee)
    } else {
      aad.addAssetAmount(amountAssetID, amount, zero)
      if (this._feeCheck(fee, feeAssetID)) {
        aad.addAssetAmount(feeAssetID, zero, fee)
      }
    }

    let ins: TransferableInput[] = []
    let outs: TransferableOutput[] = []
    let owners: OutputOwners[] = []

    const minSpendableErr: Error = await this.spender.getMinimumSpendable(
      aad,
      asOf,
      lockTime,
      "Unlocked"
    )
    if (typeof minSpendableErr === "undefined") {
      ins = aad.getInputs()
      outs = aad.getAllOutputs()
      owners = aad.getOutputOwners()
    } else {
      throw minSpendableErr
    }

    const baseTx: BaseTx = new BaseTx(networkID, blockchainID, outs, ins, memo)
    baseTx.setOutputOwners(owners)
    return new UnsignedTx(baseTx)
  }

  buildImportTx = async (
    networkID: number,
    blockchainID: Buffer,
    toAddresses: Buffer[],
    fromSigner: FromSigner,
    changeAddresses: Buffer[],
    atomics: UTXO[],
    sourceChain: Buffer = undefined,
    fee: BN = zero,
    feeAssetID: Buffer = undefined,
    memo: Buffer = undefined,
    asOf: BN = zero,
    locktime: BN = zero,
    toThreshold: number = 1,
    changeThreshold: number = 1
  ): Promise<UnsignedTx> => {
    let ins: TransferableInput[] = []
    let outs: TransferableOutput[] = []
    let owners: OutputOwners[] = []
    const importOwners: OutputOwners[] = []

    if (typeof fee === "undefined") {
      fee = zero.clone()
    }

    const importIns: TransferableInput[] = []
    let feepaid: BN = new BN(0)
    let feeAssetStr: string = feeAssetID.toString("hex")
    for (let i: number = 0; i < atomics.length; i++) {
      const utxo: UTXO = atomics[`${i}`]
      const assetID: Buffer = utxo.getAssetID()
      const output: AmountOutput = utxo.getOutput() as AmountOutput
      let amt: BN = output.getAmount().clone()

      let infeeamount = amt.clone()
      let assetStr: string = assetID.toString("hex")
      if (
        typeof feeAssetID !== "undefined" &&
        fee.gt(zero) &&
        feepaid.lt(fee) &&
        assetStr === feeAssetStr
      ) {
        feepaid = feepaid.add(infeeamount)
        if (feepaid.gte(fee)) {
          infeeamount = feepaid.sub(fee)
          feepaid = fee.clone()
        } else {
          infeeamount = zero.clone()
        }
      }

      const txid: Buffer = utxo.getTxID()
      const outputidx: Buffer = utxo.getOutputIdx()
      const input: SECPTransferInput = new SECPTransferInput(amt)
      const xferin: TransferableInput = new TransferableInput(
        txid,
        outputidx,
        assetID,
        input
      )
      const from: Buffer[] = output.getAddresses()
      const spenders: Buffer[] = output.getSpenders(from)
      for (let j: number = 0; j < spenders.length; j++) {
        const idx: number = output.getAddressIdx(spenders[`${j}`])
        if (idx === -1) {
          /* istanbul ignore next */
          throw new AddressError(
            "Error - UTXOSet.buildImportTx: no such " +
              `address in output: ${spenders[`${j}`]}`
          )
        }
        xferin.getInput().addSignatureIdx(idx, spenders[`${j}`])
      }
      importOwners.push(
        new OutputOwners(
          output.getAddresses(),
          output.getLocktime(),
          output.getThreshold()
        )
      )
      importIns.push(xferin)
      //add extra outputs for each amount (calculated from the imported inputs), minus fees
      if (infeeamount.gt(zero)) {
        const spendout: AmountOutput = SelectOutputClass(
          output.getOutputID(),
          infeeamount,
          toAddresses,
          locktime,
          toThreshold
        ) as AmountOutput
        const xferout: TransferableOutput = new TransferableOutput(
          assetID,
          spendout
        )
        outs.push(xferout)
      }
    }

    // get remaining fees from the provided addresses
    let feeRemaining: BN = fee.sub(feepaid)
    if (feeRemaining.gt(zero) && this._feeCheck(feeRemaining, feeAssetID)) {
      const aad: AssetAmountDestination = new AssetAmountDestination(
        toAddresses,
        toThreshold,
        fromSigner.from,
        fromSigner.signer,
        changeAddresses,
        changeThreshold
      )

      aad.addAssetAmount(feeAssetID, zero, feeRemaining)
      const minSpendableErr: Error = await this.spender.getMinimumSpendable(
        aad,
        asOf,
        locktime,
        "Unlocked"
      )
      if (typeof minSpendableErr === "undefined") {
        ins = aad.getInputs()
        outs = aad.getAllOutputs()
        owners = aad.getOutputOwners()
        owners.push(...importOwners)
      } else {
        throw minSpendableErr
      }
    }

    const baseTx: ImportTx = new ImportTx(
      networkID,
      blockchainID,
      outs,
      ins,
      memo,
      sourceChain,
      importIns
    )

    baseTx.setOutputOwners(owners)
    return new UnsignedTx(baseTx)
  }
  buildLockMessengerFundsTx = async (
    networkID: number = DefaultNetworkID,
    blockchainID: Buffer,
    fromSigner: FromSigner,
    changeAddresses: Buffer[],
    fee: BN = zero,
    feeAssetID: Buffer = undefined,
    memo: Buffer = undefined,
    asOf: BN = zero,
    amountToLock: BN,
    changeThreshold: number = 1
  ): Promise<UnsignedTx> => {
    let ins: TransferableInput[] = []
    let outs: TransferableOutput[] = []
    let owners: OutputOwners[] = []

    if (this._feeCheck(fee, feeAssetID)) {
      const aad: AssetAmountDestination = new AssetAmountDestination(
        [],
        0,
        fromSigner.from,
        fromSigner.signer,
        changeAddresses,
        changeThreshold
      )

      aad.addAssetAmount(feeAssetID, amountToLock, fee)

      const minSpendableErr: Error = await this.spender.getMinimumSpendable(
        aad,
        asOf,
        zero,
        "Lock"
      )
      if (typeof minSpendableErr === "undefined") {
        ins = aad.getInputs()
        outs = aad.getAllOutputs()
        owners = aad.getOutputOwners()
      } else {
        throw minSpendableErr
      }
    }

    const baseTx: LockMessengerFundsTx = new LockMessengerFundsTx(
      networkID,
      blockchainID,
      outs,
      ins,
      memo
    )

    baseTx.setOutputOwners(owners)
    return new UnsignedTx(baseTx)
  }

  buildCashoutChequeTx = async (
    networkID: number = DefaultNetworkID,
    blockchainID: Buffer,
    fromSigner: FromSigner,
    changeAddresses: Buffer[],
    fee: BN = zero,
    feeAssetID: Buffer = undefined,
    memo: Buffer = undefined,
    asOf: BN = zero,
    issuer: Buffer,
    beneficiary: Buffer,
    cumulativeAmountToCashOut: string,
    serialID: string,
    agent: string,
    chequeSignature: string | Buffer,
    changeThreshold: number = 1
  ): Promise<UnsignedTx> => {
    let ins: TransferableInput[] = []
    let outs: TransferableOutput[] = []
    let owners: OutputOwners[] = []

    if (this._feeCheck(fee, feeAssetID)) {
      const aad: AssetAmountDestination = new AssetAmountDestination(
        [beneficiary],
        1,
        fromSigner.from,
        fromSigner.signer,
        changeAddresses,
        changeThreshold
      )

      aad.addAssetAmount(
        feeAssetID,
        new BN(cumulativeAmountToCashOut, 10),
        zero
      ) //TODO nikos: make CashoutChequeTx fee-less

      const minSpendableErr: Error = await this.spender.getMinimumSpendable(
        aad,
        asOf,
        new BN(1), // nikos: unlock locked funds
        "Unlocked",
        agent
      )
      if (typeof minSpendableErr === "undefined") {
        ins = aad.getInputs()
        outs = aad.getAllOutputs()
        owners = aad.getOutputOwners()
      } else {
        throw minSpendableErr
      }
    }

    const cheque: Cheque = new Cheque(
      issuer,
      beneficiary,
      bintools.fromBNToBuffer(new BN(cumulativeAmountToCashOut, 10), 8),
      bintools.fromBNToBuffer(new BN(serialID, 10), 8),
      agent,
      typeof chequeSignature === "string"
        ? Buffer.from(chequeSignature, "hex")
        : chequeSignature
    )

    const baseTx: CashoutChequeTx = new CashoutChequeTx(
      networkID,
      blockchainID,
      outs,
      ins,
      memo,
      cheque
    )
    baseTx.setOutputOwners(owners)
    return new UnsignedTx(baseTx)
  }

  _feeCheck(fee: BN, feeAssetID: Buffer): boolean {
    return (
      typeof fee !== "undefined" &&
      typeof feeAssetID !== "undefined" &&
      fee.gt(new BN(0)) &&
      feeAssetID instanceof Buffer
    )
  }
}

"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UTXOSet = exports.AssetAmountDestination = exports.UTXO = void 0;
/**
 * @packageDocumentation
 * @module API-PlatformVM-UTXOs
 */
const buffer_1 = require("buffer/");
const bintools_1 = __importDefault(require("../../utils/bintools"));
const bn_js_1 = __importDefault(require("bn.js"));
const outputs_1 = require("./outputs");
const inputs_1 = require("./inputs");
const helperfunctions_1 = require("../../utils/helperfunctions");
const utxos_1 = require("../../common/utxos");
const constants_1 = require("./constants");
const assetamount_1 = require("../../common/assetamount");
const serialization_1 = require("../../utils/serialization");
const errors_1 = require("../../utils/errors");
/**
 * @ignore
 */
const bintools = bintools_1.default.getInstance();
const serialization = serialization_1.Serialization.getInstance();
const zeroBN = new bn_js_1.default(0);
/**
 * Class for representing a single UTXO.
 */
class UTXO extends utxos_1.StandardUTXO {
    constructor() {
        super(...arguments);
        this._typeName = "UTXO";
        this._typeID = undefined;
    }
    //serialize is inherited
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        this.output = (0, outputs_1.SelectOutputClass)(fields["output"]["_typeID"]);
        this.output.deserialize(fields["output"], encoding);
    }
    fromBuffer(bytes, offset = 0) {
        this.codecID = bintools.copyFrom(bytes, offset, offset + 2);
        offset += 2;
        this.txid = bintools.copyFrom(bytes, offset, offset + 32);
        offset += 32;
        this.outputidx = bintools.copyFrom(bytes, offset, offset + 4);
        offset += 4;
        this.assetID = bintools.copyFrom(bytes, offset, offset + 32);
        offset += 32;
        const outputid = bintools
            .copyFrom(bytes, offset, offset + 4)
            .readUInt32BE(0);
        offset += 4;
        this.output = (0, outputs_1.SelectOutputClass)(outputid);
        return this.output.fromBuffer(bytes, offset);
    }
    /**
     * Takes a base-58 or hex string containing a [[UTXO]], parses it, populates the class, and returns the length of the StandardUTXO in bytes.
     *
     * @param serialized A base-58 string containing a raw [[UTXO]]
     * @param format The format of the encoded [[UTXO]] (cb58 or hex). Defaults to cb58 per existing codebase
     *
     * @returns The length of the raw [[UTXO]]
     *
     * @remarks
     * Default encoding format is cb58, if providing hex encoded string please specify format as 'hex'
     */
    fromString(serialized, format = "cb58") {
        switch (format) {
            case "cb58": {
                /* istanbul ignore next */
                return this.fromBuffer(bintools.cb58Decode(serialized));
            }
            case "hex": {
                let decoded = serialization.decoder(serialized, "hex", "hex", "cb58");
                this.fromString(decoded);
                return this.toBuffer().length;
            }
            default: {
                throw new errors_1.UnknownFormatError(`Specified format '${format}' is unknown, should be hex or cb58.`);
            }
        }
    }
    /**
     * Returns a base-58 representation of the [[UTXO]].
     *
     * @param format The format of the encoded [[UTXO]] (cb58 or hex). Defaults to cb58 per existing codebase
     *
     * @remarks
     * Default encoding format to cb58, if you want a hex encoded output please specify format as 'hex'
     */
    toString(format = "cb58") {
        switch (format) {
            case "cb58": {
                /* istanbul ignore next */
                return bintools.cb58Encode(this.toBuffer());
            }
            case "hex": {
                return serialization.encoder(bintools.cb58Encode(this.toBuffer()), "hex", "cb58", "hex");
            }
            default: {
                throw new errors_1.UnknownFormatError(`Specified format '${format}' is unknown, should be hex or cb58.`);
            }
        }
    }
    clone() {
        const utxo = new UTXO();
        utxo.fromBuffer(this.toBuffer());
        return utxo;
    }
    create(codecID = constants_1.PlatformVMConstants.LATESTCODEC, txid = undefined, outputidx = undefined, assetID = undefined, output = undefined) {
        return new UTXO(codecID, txid, outputidx, assetID, output);
    }
}
exports.UTXO = UTXO;
class AssetAmountDestination extends assetamount_1.StandardAssetAmountDestination {
    constructor(destinations, destinationsThreshold, senders, signers, changeAddresses, changeAddressesThreshold) {
        super(destinations, destinationsThreshold, senders, changeAddresses, changeAddressesThreshold);
        this.outputOwners = [];
        this.getSigners = () => this.signers;
        this.setOutputOwners = (owners) => (this.outputOwners = owners);
        this.getOutputOwners = () => this.outputOwners;
        this.signers = signers;
    }
}
exports.AssetAmountDestination = AssetAmountDestination;
/**
 * Class representing a set of [[UTXO]]s.
 */
class UTXOSet extends utxos_1.StandardUTXOSet {
    constructor() {
        super(...arguments);
        this._typeName = "UTXOSet";
        this._typeID = undefined;
        this.getConsumableUXTO = (asOf = (0, helperfunctions_1.UnixNow)(), stakeable = false) => {
            return this.getAllUTXOs().filter((utxo) => {
                if (stakeable) {
                    // stakeable transactions can consume any UTXO.
                    return true;
                }
                const output = utxo.getOutput();
                if (!(output instanceof outputs_1.StakeableLockOut)) {
                    // non-stakeable transactions can consume any UTXO that isn't locked.
                    return true;
                }
                const stakeableOutput = output;
                if (stakeableOutput.getStakeableLocktime().lt(asOf)) {
                    // If the stakeable outputs locktime has ended, then this UTXO can still
                    // be consumed by a non-stakeable transaction.
                    return true;
                }
                // This output is locked and can't be consumed by a non-stakeable
                // transaction.
                return false;
            });
        };
        this.getLockedTxIDs = () => {
            const d = new Set(), b = new Set();
            this.getAllUTXOs().forEach((utxo) => {
                const output = utxo.getOutput();
                if (output instanceof outputs_1.LockedOut) {
                    var id = output.getLockedIDs().getDepositTxID();
                    if (!id.isEmpty())
                        d.add(id.encode("cb58"));
                    id = output.getLockedIDs().getBondTxID();
                    if (!id.isEmpty())
                        b.add(id.encode("cb58"));
                }
            });
            return { depositIDs: [...d.keys()], bondIDs: [...b.keys()] };
        };
        this.getMinimumSpendable = (aad, asOf = zeroBN, lockTime = zeroBN, lockMode = "Unlocked") => __awaiter(this, void 0, void 0, function* () {
            if (asOf.isZero())
                asOf = (0, helperfunctions_1.UnixNow)();
            let utxoArray = this.getConsumableUXTO(asOf, lockMode == "Stake");
            let tmpUTXOArray = [];
            if (lockMode == "Stake") {
                // If this is a stakeable transaction then have StakeableLockOut come before SECPTransferOutput
                // so that users first stake locked tokens before staking unlocked tokens
                utxoArray.forEach((utxo) => {
                    // StakeableLockOuts
                    if (utxo.getOutput().getTypeID() === 22) {
                        tmpUTXOArray.push(utxo);
                    }
                });
                // Sort the StakeableLockOuts by StakeableLocktime so that the greatest StakeableLocktime are spent first
                tmpUTXOArray.sort((a, b) => {
                    let stakeableLockOut1 = a.getOutput();
                    let stakeableLockOut2 = b.getOutput();
                    return (stakeableLockOut2.getStakeableLocktime().toNumber() -
                        stakeableLockOut1.getStakeableLocktime().toNumber());
                });
                utxoArray.forEach((utxo) => {
                    // SECPTransferOutputs
                    if (utxo.getOutput().getTypeID() === 7) {
                        tmpUTXOArray.push(utxo);
                    }
                });
                utxoArray = tmpUTXOArray;
            }
            // outs is a map from assetID to a tuple of (lockedStakeable, unlocked)
            // which are arrays of outputs.
            const outs = {};
            // We only need to iterate over UTXOs until we have spent sufficient funds
            // to met the requested amounts.
            utxoArray.forEach((utxo) => {
                const assetID = utxo.getAssetID();
                const assetKey = assetID.toString("hex");
                const fromAddresses = aad.getSenders();
                const output = utxo.getOutput();
                const amountOutput = output instanceof outputs_1.ParseableOutput ? output.getOutput() : output;
                if (!(amountOutput instanceof outputs_1.AmountOutput) ||
                    !aad.assetExists(assetKey) ||
                    !output.meetsThreshold(fromAddresses, asOf)) {
                    // We should only try to spend fungible assets.
                    // We should only spend {{ assetKey }}.
                    // We need to be able to spend the output.
                    return;
                }
                const assetAmount = aad.getAssetAmount(assetKey);
                if (assetAmount.isFinished()) {
                    // We've already spent the needed UTXOs for this assetID.
                    return;
                }
                if (!(assetKey in outs)) {
                    // If this is the first time spending this assetID, we need to
                    // initialize the outs object correctly.
                    outs[`${assetKey}`] = {
                        lockedStakeable: [],
                        unlocked: []
                    };
                }
                // amount is the amount of funds available from this UTXO.
                const amount = amountOutput.getAmount();
                // Set up the SECP input with the same amount as the output.
                let input = new inputs_1.SECPTransferInput(amount);
                let locked = false;
                if (output instanceof outputs_1.StakeableLockOut) {
                    const stakeableOutput = output;
                    const stakeableLocktime = stakeableOutput.getStakeableLocktime();
                    if (stakeableLocktime.gt(asOf)) {
                        // Add a new input and mark it as being locked.
                        input = new inputs_1.StakeableLockIn(amount, stakeableLocktime, new inputs_1.ParseableInput(input));
                        // Mark this UTXO as having been re-locked.
                        locked = true;
                    }
                }
                assetAmount.spendAmount(amount, locked);
                if (locked) {
                    // Track the UTXO as locked.
                    outs[`${assetKey}`].lockedStakeable.push(output);
                }
                else {
                    // Track the UTXO as unlocked.
                    outs[`${assetKey}`].unlocked.push(output);
                }
                // Get the indices of the outputs that should be used to authorize the
                // spending of this input.
                // TODO: getSpenders should return an array of indices rather than an
                // array of addresses.
                const spenders = amountOutput.getSpenders(fromAddresses, asOf);
                spenders.forEach((spender) => {
                    const idx = amountOutput.getAddressIdx(spender);
                    if (idx === -1) {
                        // This should never happen, which is why the error is thrown rather
                        // than being returned. If this were to ever happen this would be an
                        // error in the internal logic rather having called this function with
                        // invalid arguments.
                        /* istanbul ignore next */
                        throw new errors_1.AddressError("Error - UTXOSet.getMinimumSpendable: no such " +
                            `address in output: ${spender}`);
                    }
                    input.addSignatureIdx(idx, spender);
                });
                const txID = utxo.getTxID();
                const outputIdx = utxo.getOutputIdx();
                const transferInput = new inputs_1.TransferableInput(txID, outputIdx, assetID, input);
                aad.addInput(transferInput);
            });
            if (!aad.canComplete()) {
                // After running through all the UTXOs, we still weren't able to get all
                // the necessary funds, so this transaction can't be made.
                return new errors_1.InsufficientFundsError("Error - UTXOSet.getMinimumSpendable: insufficient " +
                    "funds to create the transaction");
            }
            // TODO: We should separate the above functionality into a single function
            // that just selects the UTXOs to consume.
            const zero = new bn_js_1.default(0);
            // assetAmounts is an array of asset descriptions and how much is left to
            // spend for them.
            const assetAmounts = aad.getAmounts();
            assetAmounts.forEach((assetAmount) => {
                // change is the amount that should be returned back to the source of the
                // funds.
                const change = assetAmount.getChange();
                // isStakeableLockChange is if the change is locked or not.
                const isStakeableLockChange = assetAmount.getStakeableLockChange();
                // lockedChange is the amount of locked change that should be returned to
                // the sender
                const lockedChange = isStakeableLockChange ? change : zero.clone();
                const assetID = assetAmount.getAssetID();
                const assetKey = assetAmount.getAssetIDString();
                const lockedOutputs = outs[`${assetKey}`].lockedStakeable;
                lockedOutputs.forEach((lockedOutput, i) => {
                    const stakeableLocktime = lockedOutput.getStakeableLocktime();
                    // We know that parseableOutput contains an AmountOutput because the
                    // first loop filters for fungible assets.
                    const output = lockedOutput.getOutput();
                    let outputAmountRemaining = output.getAmount();
                    // The only output that could generate change is the last output.
                    // Otherwise, any further UTXOs wouldn't have needed to be spent.
                    if (i == lockedOutputs.length - 1 && lockedChange.gt(zero)) {
                        // update outputAmountRemaining to no longer hold the change that we
                        // are returning.
                        outputAmountRemaining = outputAmountRemaining.sub(lockedChange);
                        let newLockedChangeOutput = (0, outputs_1.SelectOutputClass)(lockedOutput.getOutputID(), lockedChange, output.getAddresses(), output.getLocktime(), output.getThreshold(), stakeableLocktime);
                        const transferOutput = new outputs_1.TransferableOutput(assetID, newLockedChangeOutput);
                        aad.addChange(transferOutput);
                    }
                    // We know that outputAmountRemaining > 0. Otherwise, we would never
                    // have consumed this UTXO, as it would be only change.
                    const newLockedOutput = (0, outputs_1.SelectOutputClass)(lockedOutput.getOutputID(), outputAmountRemaining, output.getAddresses(), output.getLocktime(), output.getThreshold(), stakeableLocktime);
                    const transferOutput = new outputs_1.TransferableOutput(assetID, newLockedOutput);
                    aad.addOutput(transferOutput);
                });
                // unlockedChange is the amount of unlocked change that should be returned
                // to the sender
                const unlockedChange = isStakeableLockChange ? zero.clone() : change;
                if (unlockedChange.gt(zero)) {
                    const newChangeOutput = new outputs_1.SECPTransferOutput(unlockedChange, aad.getChangeAddresses(), zero.clone(), // make sure that we don't lock the change output.
                    aad.getChangeAddressesThreshold());
                    const transferOutput = new outputs_1.TransferableOutput(assetID, newChangeOutput);
                    aad.addChange(transferOutput);
                }
                // totalAmountSpent is the total amount of tokens consumed.
                const totalAmountSpent = assetAmount.getSpent();
                // stakeableLockedAmount is the total amount of locked tokens consumed.
                const stakeableLockedAmount = assetAmount.getStakeableLockSpent();
                // totalUnlockedSpent is the total amount of unlocked tokens consumed.
                const totalUnlockedSpent = totalAmountSpent.sub(stakeableLockedAmount);
                // amountBurnt is the amount of unlocked tokens that must be burn.
                const amountBurnt = assetAmount.getBurn();
                // totalUnlockedAvailable is the total amount of unlocked tokens available
                // to be produced.
                const totalUnlockedAvailable = totalUnlockedSpent.sub(amountBurnt);
                // unlockedAmount is the amount of unlocked tokens that should be sent.
                const unlockedAmount = totalUnlockedAvailable.sub(unlockedChange);
                if (unlockedAmount.gt(zero)) {
                    const newOutput = new outputs_1.SECPTransferOutput(unlockedAmount, aad.getDestinations(), lockTime, aad.getDestinationsThreshold());
                    const transferOutput = new outputs_1.TransferableOutput(assetID, newOutput);
                    aad.addOutput(transferOutput);
                }
            });
            return undefined;
        });
    }
    //serialize is inherited
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        let utxos = {};
        for (let utxoid in fields["utxos"]) {
            let utxoidCleaned = serialization.decoder(utxoid, encoding, "base58", "base58");
            utxos[`${utxoidCleaned}`] = new UTXO();
            utxos[`${utxoidCleaned}`].deserialize(fields["utxos"][`${utxoid}`], encoding);
        }
        let addressUTXOs = {};
        for (let address in fields["addressUTXOs"]) {
            let addressCleaned = serialization.decoder(address, encoding, "cb58", "hex");
            let utxobalance = {};
            for (let utxoid in fields["addressUTXOs"][`${address}`]) {
                let utxoidCleaned = serialization.decoder(utxoid, encoding, "base58", "base58");
                utxobalance[`${utxoidCleaned}`] = serialization.decoder(fields["addressUTXOs"][`${address}`][`${utxoid}`], encoding, "decimalString", "BN");
            }
            addressUTXOs[`${addressCleaned}`] = utxobalance;
        }
        this.utxos = utxos;
        this.addressUTXOs = addressUTXOs;
    }
    parseUTXO(utxo) {
        const utxovar = new UTXO();
        // force a copy
        if (typeof utxo === "string") {
            utxovar.fromBuffer(bintools.cb58Decode(utxo));
        }
        else if (utxo instanceof utxos_1.StandardUTXO) {
            utxovar.fromBuffer(utxo.toBuffer()); // forces a copy
        }
        else {
            /* istanbul ignore next */
            throw new errors_1.UTXOError("Error - UTXO.parseUTXO: utxo parameter is not a UTXO or string");
        }
        return utxovar;
    }
    create(...args) {
        return new UTXOSet();
    }
    clone() {
        const newset = this.create();
        const allUTXOs = this.getAllUTXOs();
        newset.addArray(allUTXOs);
        return newset;
    }
    _feeCheck(fee, feeAssetID) {
        return (typeof fee !== "undefined" &&
            typeof feeAssetID !== "undefined" &&
            fee.gt(new bn_js_1.default(0)) &&
            feeAssetID instanceof buffer_1.Buffer);
    }
}
exports.UTXOSet = UTXOSet;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXR4b3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYXBpcy9wbGF0Zm9ybXZtL3V0eG9zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFBOzs7R0FHRztBQUNILG9DQUFnQztBQUNoQyxvRUFBMkM7QUFDM0Msa0RBQXNCO0FBQ3RCLHVDQVFrQjtBQUNsQixxQ0FLaUI7QUFDakIsaUVBQXFEO0FBQ3JELDhDQUFrRTtBQUNsRSwyQ0FBaUQ7QUFDakQsMERBR2lDO0FBR2pDLDZEQUE2RTtBQUM3RSwrQ0FNMkI7QUFHM0I7O0dBRUc7QUFDSCxNQUFNLFFBQVEsR0FBYSxrQkFBUSxDQUFDLFdBQVcsRUFBRSxDQUFBO0FBQ2pELE1BQU0sYUFBYSxHQUFrQiw2QkFBYSxDQUFDLFdBQVcsRUFBRSxDQUFBO0FBRWhFLE1BQU0sTUFBTSxHQUFHLElBQUksZUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBRXhCOztHQUVHO0FBQ0gsTUFBYSxJQUFLLFNBQVEsb0JBQVk7SUFBdEM7O1FBQ1ksY0FBUyxHQUFHLE1BQU0sQ0FBQTtRQUNsQixZQUFPLEdBQUcsU0FBUyxDQUFBO0lBc0cvQixDQUFDO0lBcEdDLHdCQUF3QjtJQUV4QixXQUFXLENBQUMsTUFBYyxFQUFFLFdBQStCLEtBQUs7UUFDOUQsS0FBSyxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUE7UUFDbkMsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFBLDJCQUFpQixFQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFBO1FBQzVELElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQTtJQUNyRCxDQUFDO0lBRUQsVUFBVSxDQUFDLEtBQWEsRUFBRSxTQUFpQixDQUFDO1FBQzFDLElBQUksQ0FBQyxPQUFPLEdBQUcsUUFBUSxD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LENBQUMsZ0JBQWdCO1NBQ3JEO2FBQU07WUFDTCwwQkFBMEI7WUFDMUIsTUFBTSxJQUFJLGtCQUFTLENBQ2pCLGdFQUFnRSxDQUNqRSxDQUFBO1NBQ0Y7UUFDRCxPQUFPLE9BQU8sQ0FBQTtJQUNoQixDQUFDO0lBRUQsTUFBTSxDQUFDLEdBQUcsSUFBVztRQUNuQixPQUFPLElBQUksT0FBTyxFQUFVLENBQUE7SUFDOUIsQ0FBQztJQUVELEtBQUs7UUFDSCxNQUFNLE1BQU0sR0FBWSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUE7UUFDckMsTUFBTSxRQUFRLEdBQVcsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFBO1FBQzNDLE1BQU0sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUE7UUFDekIsT0FBTyxNQUFjLENBQUE7SUFDdkIsQ0FBQztJQUVELFNBQVMsQ0FBQyxHQUFPLEVBQUUsVUFBa0I7UUFDbkMsT0FBTyxDQUNMLE9BQU8sR0FBRyxLQUFLLFdBQVc7WUFDMUIsT0FBTyxVQUFVLEtBQUssV0FBVztZQUNqQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksZUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2pCLFVBQVUsWUFBWSxlQUFNLENBQzdCLENBQUE7SUFDSCxDQUFDO0NBd1RGO0FBN1lELDBCQTZZQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQHBhY2thZ2VEb2N1bWVudGF0aW9uXG4gKiBAbW9kdWxlIEFQSS1QbGF0Zm9ybVZNLVVUWE9zXG4gKi9cbmltcG9ydCB7IEJ1ZmZlciB9IGZyb20gXCJidWZmZXIvXCJcbmltcG9ydCBCaW5Ub29scyBmcm9tIFwiLi4vLi4vdXRpbHMvYmludG9vbHNcIlxuaW1wb3J0IEJOIGZyb20gXCJibi5qc1wiXG5pbXBvcnQge1xuICBBbW91bnRPdXRwdXQsXG4gIFNlbGVjdE91dHB1dENsYXNzLFxuICBUcmFuc2ZlcmFibGVPdXRwdXQsXG4gIFBhcnNlYWJsZU91dHB1dCxcbiAgU3Rha2VhYmxlTG9ja091dCxcbiAgU0VDUFRyYW5zZmVyT3V0cHV0LFxuICBMb2NrZWRPdXRcbn0gZnJvbSBcIi4vb3V0cHV0c1wiXG5pbXBvcnQge1xuICBTRUNQVHJhbnNmZXJJbnB1dCxcbiAgU3Rha2VhYmxlTG9ja0luLFxuICBUcmFuc2ZlcmFibGVJbnB1dCxcbiAgUGFyc2VhYmxlSW5wdXRcbn0gZnJvbSBcIi4vaW5wdXRzXCJcbmltcG9ydCB7IFVuaXhOb3cgfSBmcm9tIFwiLi4vLi4vdXRpbHMvaGVscGVyZnVuY3Rpb25zXCJcbmltcG9ydCB7IFN0YW5kYXJkVVRYTywgU3RhbmRhcmRVVFhPU2V0IH0gZnJvbSBcIi4uLy4uL2NvbW1vbi91dHhvc1wiXG5pbXBvcnQgeyBQbGF0Zm9ybVZNQ29uc3RhbnRzIH0gZnJvbSBcIi4vY29uc3RhbnRzXCJcbmltcG9ydCB7XG4gIFN0YW5kYXJkQXNzZXRBbW91bnREZXN0aW5hdGlvbixcbiAgQXNzZXRBbW91bnRcbn0gZnJvbSBcIi4uLy4uL2NvbW1vbi9hc3NldGFtb3VudFwiXG5pbXBvcnQgeyBCYXNlSW5wdXQgfSBmcm9tIFwiLi4vLi4vY29tbW9uL2lucHV0XCJcbmltcG9ydCB7IEJhc2VPdXRwdXQsIE91dHB1dE93bmVycyB9IGZyb20gXCIuLi8uLi9jb21tb24vb3V0cHV0XCJcbmltcG9ydCB7IFNlcmlhbGl6YXRpb24sIFNlcmlhbGl6ZWRFbmNvZGluZyB9IGZyb20gXCIuLi8uLi91dGlscy9zZXJpYWxpemF0aW9uXCJcbmltcG9ydCB7XG4gIFVUWE9FcnJvcixcbiAgQWRkcmVzc0Vycm9yLFxuICBJbnN1ZmZpY2llbnRGdW5kc0Vycm9yLFxuICBUaW1lRXJyb3IsXG4gIFVua25vd25Gb3JtYXRFcnJvclxufSBmcm9tIFwiLi4vLi4vdXRpbHMvZXJyb3JzXCJcbmltcG9ydCB7IExvY2tNb2RlIH0gZnJvbSBcIi4vYnVpbGRlclwiXG5cbi8qKlxuICogQGlnbm9yZVxuICovXG5jb25zdCBiaW50b29sczogQmluVG9vbHMgPSBCaW5Ub29scy5nZXRJbnN0YW5jZSgpXG5jb25zdCBzZXJpYWxpemF0aW9uOiBTZXJpYWxpemF0aW9uID0gU2VyaWFsaXphdGlvbi5nZXRJbnN0YW5jZSgpXG5cbmNvbnN0IHplcm9CTiA9IG5ldyBCTigwKVxuXG4vKipcbiAqIENsYXNzIGZvciByZXByZXNlbnRpbmcgYSBzaW5nbGUgVVRYTy5cbiAqL1xuZXhwb3J0IGNsYXNzIFVUWE8gZXh0ZW5kcyBTdGFuZGFyZFVUWE8ge1xuICBwcm90ZWN0ZWQgX3R5cGVOYW1lID0gXCJVVFhPXCJcbiAgcHJvdGVjdGVkIF90eXBlSUQgPSB1bmRlZmluZWRcblxuICAvL3NlcmlhbGl6ZSBpcyBpbmhlcml0ZWRcblxuICBkZXNlcmlhbGl6ZShmaWVsZHM6IG9iamVjdCwgZW5jb2Rpbmc6IFNlcmlhbGl6ZWRFbmNvZGluZyA9IFwiaGV4XCIpIHtcbiAgICBzdXBlci5kZXNlcmlhbGl6ZShmaWVsZHMsIGVuY29kaW5nKVxuICAgIHRoaXMub3V0cHV0ID0gU2VsZWN0T3V0cHV0Q2xhc3MoZmllbGRzW1wib3V0cHV0XCJdW1wiX3R5cGVJRFwiXSlcbiAgICB0aGlzLm91dHB1dC5kZXNlcmlhbGl6ZShmaWVsZHNbXCJvdXRwdXRcIl0sIGVuY29kaW5nKVxuICB9XG5cbiAgZnJvbUJ1ZmZlcihieXRlczogQnVmZmVyLCBvZmZzZXQ6IG51bWJlciA9IDApOiBudW1iZXIge1xuICAgIHRoaXMuY29kZWNJRCA9IGJpbnRvb2xzLmNvcHlGcm9tKGJ5dGVzLCBvZmZzZXQsIG9mZnNldCArIDIpXG4gICAgb2Zmc2V0ICs9IDJcbiAgICB0aGlzLnR4aWQgPSBiaW50b29scy5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyAzMilcbiAgICBvZmZzZXQgKz0gMzJcbiAgICB0aGlzLm91dHB1dGlkeCA9IGJpbnRvb2xzLmNvcHlGcm9tKGJ5dGVzLCBvZmZzZXQsIG9mZnNldCArIDQpXG4gICAgb2Zmc2V0ICs9IDRcbiAgICB0aGlzLmFzc2V0SUQgPSBiaW50b29scy5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyAzMilcbiAgICBvZmZzZXQgKz0gMzJcbiAgICBjb25zdCBvdXRwdXRpZDogbnVtYmVyID0gYmludG9vbHNcbiAgICAgIC5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyA0KVxuICAgICAgLnJlYWRVSW50MzJCRSgwKVxuICAgIG9mZnNldCArPSA0XG4gICAgdGhpcy5vdXRwdXQgPSBTZWxlY3RPdXRwdXRDbGFzcyhvdXRwdXRpZClcbiAgICByZXR1cm4gdGhpcy5vdXRwdXQuZnJvbUJ1ZmZlcihieXRlcywgb2Zmc2V0KVxuICB9XG5cbiAgLyoqXG4gICAqIFRha2VzIGEgYmFzZS01OCBvciBoZXggc3RyaW5nIGNvbnRhaW5pbmcgYSBbW1VUWE9dXSwgcGFyc2VzIGl0LCBwb3B1bGF0ZXMgdGhlIGNsYXNzLCBhbmQgcmV0dXJucyB0aGUgbGVuZ3RoIG9mIHRoZSBTdGFuZGFyZFVUWE8gaW4gYnl0ZXMuXG4gICAqXG4gICAqIEBwYXJhbSBzZXJpYWxpemVkIEEgYmFzZS01OCBzdHJpbmcgY29udGFpbmluZyBhIHJhdyBbW1VUWE9dXVxuICAgKiBAcGFyYW0gZm9ybWF0IFRoZSBmb3JtYXQgb2YgdGhlIGVuY29kZWQgW1tVVFhPXV0gKGNiNTggb3IgaGV4KS4gRGVmYXVsdHMgdG8gY2I1OCBwZXIgZXhpc3RpbmcgY29kZWJhc2VcbiAgICpcbiAgICogQHJldHVybnMgVGhlIGxlbmd0aCBvZiB0aGUgcmF3IFtbVVRYT11dXG4gICAqXG4gICAqIEByZW1hcmtzXG4gICAqIERlZmF1bHQgZW5jb2RpbmcgZm9ybWF0IGlzIGNiNTgsIGlmIHByb3ZpZGluZyBoZXggZW5jb2RlZCBzdHJpbmcgcGxlYXNlIHNwZWNpZnkgZm9ybWF0IGFzICdoZXgnXG4gICAqL1xuICBmcm9tU3RyaW5nKHNlcmlhbGl6ZWQ6IHN0cmluZywgZm9ybWF0OiBzdHJpbmcgPSBcImNiNThcIik6IG51bWJlciB7XG4gICAgc3dpdGNoIChmb3JtYXQpIHtcbiAgICAgIGNhc2UgXCJjYjU4XCI6IHtcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgICAgcmV0dXJuIHRoaXMuZnJvbUJ1ZmZlcihiaW50b29scy5jYjU4RGVjb2RlKHNlcmlhbGl6ZWQpKVxuICAgICAgfVxuICAgICAgY2FzZSBcImhleFwiOiB7XG4gICAgICAgIGxldCBkZWNvZGVkID0gc2VyaWFsaXphdGlvbi5kZWNvZGVyKHNlcmlhbGl6ZWQsIFwiaGV4XCIsIFwiaGV4XCIsIFwiY2I1OFwiKVxuICAgICAgICB0aGlzLmZyb21TdHJpbmcoZGVjb2RlZClcbiAgICAgICAgcmV0dXJuIHRoaXMudG9CdWZmZXIoKS5sZW5ndGhcbiAgICAgIH1cbiAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgdGhyb3cgbmV3IFVua25vd25Gb3JtYXRFcnJvcihcbiAgICAgICAgICBgU3BlY2lmaWVkIGZvcm1hdCAnJHtmb3JtYXR9JyBpcyB1bmtub3duLCBzaG91bGQgYmUgaGV4IG9yIGNiNTguYFxuICAgICAgICApXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBiYXNlLTU4IHJlcHJlc2VudGF0aW9uIG9mIHRoZSBbW1VUWE9dXS5cbiAgICpcbiAgICogQHBhcmFtIGZvcm1hdCBUaGUgZm9ybWF0IG9mIHRoZSBlbmNvZGVkIFtbVVRYT11dIChjYjU4IG9yIGhleCkuIERlZmF1bHRzIHRvIGNiNTggcGVyIGV4aXN0aW5nIGNvZGViYXNlXG4gICAqXG4gICAqIEByZW1hcmtzXG4gICAqIERlZmF1bHQgZW5jb2RpbmcgZm9ybWF0IHRvIGNiNTgsIGlmIHlvdSB3YW50IGEgaGV4IGVuY29kZWQgb3V0cHV0IHBsZWFzZSBzcGVjaWZ5IGZvcm1hdCBhcyAnaGV4J1xuICAgKi9cbiAgdG9TdHJpbmcoZm9ybWF0OiBzdHJpbmcgPSBcImNiNThcIik6IHN0cmluZyB7XG4gICAgc3dpdGNoIChmb3JtYXQpIHtcbiAgICAgIGNhc2UgXCJjYjU4XCI6IHtcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgICAgcmV0dXJuIGJpbnRvb2xzLmNiNThFbmNvZGUodGhpcy50b0J1ZmZlcigpKVxuICAgICAgfVxuICAgICAgY2FzZSBcImhleFwiOiB7XG4gICAgICAgIHJldHVybiBzZXJpYWxpemF0aW9uLmVuY29kZXIoXG4gICAgICAgICAgYmludG9vbHMuY2I1OEVuY29kZSh0aGlzLnRvQnVmZmVyKCkpLFxuICAgICAgICAgIFwiaGV4XCIsXG4gICAgICAgICAgXCJjYjU4XCIsXG4gICAgICAgICAgXCJoZXhcIlxuICAgICAgICApXG4gICAgICB9XG4gICAgICBkZWZhdWx0OiB7XG4gICAgICAgIHRocm93IG5ldyBVbmtub3duRm9ybWF0RXJyb3IoXG4gICAgICAgICAgYFNwZWNpZmllZCBmb3JtYXQgJyR7Zm9ybWF0fScgaXMgdW5rbm93biwgc2hvdWxkIGJlIGhleCBvciBjYjU4LmBcbiAgICAgICAgKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGNsb25lKCk6IHRoaXMge1xuICAgIGNvbnN0IHV0eG86IFVUWE8gPSBuZXcgVVRYTygpXG4gICAgdXR4by5mcm9tQnVmZmVyKHRoaXMudG9CdWZmZXIoKSlcbiAgICByZXR1cm4gdXR4byBhcyB0aGlzXG4gIH1cblxuICBjcmVhdGUoXG4gICAgY29kZWNJRDogbnVtYmVyID0gUGxhdGZvcm1WTUNvbnN0YW50cy5MQVRFU1RDT0RFQyxcbiAgICB0eGlkOiBCdWZmZXIgPSB1bmRlZmluZWQsXG4gICAgb3V0cHV0aWR4OiBCdWZmZXIgfCBudW1iZXIgPSB1bmRlZmluZWQsXG4gICAgYXNzZXRJRDogQnVmZmVyID0gdW5kZWZpbmVkLFxuICAgIG91dHB1dDogQmFzZU91dHB1dCA9IHVuZGVmaW5lZFxuICApOiB0aGlzIHtcbiAgICByZXR1cm4gbmV3IFVUWE8oY29kZWNJRCwgdHhpZCwgb3V0cHV0aWR4LCBhc3NldElELCBvdXRwdXQpIGFzIHRoaXNcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgQXNzZXRBbW91bnREZXN0aW5hdGlvbiBleHRlbmRzIFN0YW5kYXJkQXNzZXRBbW91bnREZXN0aW5hdGlvbjxcbiAgVHJhbnNmZXJhYmxlT3V0cHV0LFxuICBUcmFuc2ZlcmFibGVJbnB1dFxuPiB7XG4gIHByb3RlY3RlZCBzaWduZXJzOiBCdWZmZXJbXVxuICBwcm90ZWN0ZWQgb3V0cHV0T3duZXJzOiBPdXRwdXRPd25lcnNbXSA9IFtdXG5cbiAgZ2V0U2lnbmVycyA9ICgpOiBCdWZmZXJbXSA9PiB0aGlzLnNpZ25lcnNcblxuICBzZXRPdXRwdXRPd25lcnMgPSAob3duZXJzOiBPdXRwdXRPd25lcnNbXSkgPT4gKHRoaXMub3V0cHV0T3duZXJzID0gb3duZXJzKVxuICBnZXRPdXRwdXRPd25lcnMgPSAoKTogT3V0cHV0T3duZXJzW10gPT4gdGhpcy5vdXRwdXRPd25lcnNcblxuICBjb25zdHJ1Y3RvcihcbiAgICBkZXN0aW5hdGlvbnM6IEJ1ZmZlcltdLFxuICAgIGRlc3RpbmF0aW9uc1RocmVzaG9sZDogbnVtYmVyLFxuICAgIHNlbmRlcnM6IEJ1ZmZlcltdLFxuICAgIHNpZ25lcnM6IEJ1ZmZlcltdLFxuICAgIGNoYW5nZUFkZHJlc3NlczogQnVmZmVyW10sXG4gICAgY2hhbmdlQWRkcmVzc2VzVGhyZXNob2xkOiBudW1iZXJcbiAgKSB7XG4gICAgc3VwZXIoXG4gICAgICBkZXN0aW5hdGlvbnMsXG4gICAgICBkZXN0aW5hdGlvbnNUaHJlc2hvbGQsXG4gICAgICBzZW5kZXJzLFxuICAgICAgY2hhbmdlQWRkcmVzc2VzLFxuICAgICAgY2hhbmdlQWRkcmVzc2VzVGhyZXNob2xkXG4gICAgKVxuICAgIHRoaXMuc2lnbmVycyA9IHNpZ25lcnNcbiAgfVxufVxuXG4vKipcbiAqIENsYXNzIHJlcHJlc2VudGluZyBhIHNldCBvZiBbW1VUWE9dXXMuXG4gKi9cbmV4cG9ydCBjbGFzcyBVVFhPU2V0IGV4dGVuZHMgU3RhbmRhcmRVVFhPU2V0PFVUWE8+IHtcbiAgcHJvdGVjdGVkIF90eXBlTmFtZSA9IFwiVVRYT1NldFwiXG4gIHByb3RlY3RlZCBfdHlwZUlEID0gdW5kZWZpbmVkXG5cbiAgLy9zZXJpYWxpemUgaXMgaW5oZXJpdGVkXG5cbiAgZGVzZXJpYWxpemUoZmllbGRzOiBvYmplY3QsIGVuY29kaW5nOiBTZXJpYWxpemVkRW5jb2RpbmcgPSBcImhleFwiKSB7XG4gICAgc3VwZXIuZGVzZXJpYWxpemUoZmllbGRzLCBlbmNvZGluZylcbiAgICBsZXQgdXR4b3MgPSB7fVxuICAgIGZvciAobGV0IHV0eG9pZCBpbiBmaWVsZHNbXCJ1dHhvc1wiXSkge1xuICAgICAgbGV0IHV0eG9pZENsZWFuZWQ6IHN0cmluZyA9IHNlcmlhbGl6YXRpb24uZGVjb2RlcihcbiAgICAgICAgdXR4b2lkLFxuICAgICAgICBlbmNvZGluZyxcbiAgICAgICAgXCJiYXNlNThcIixcbiAgICAgICAgXCJiYXNlNThcIlxuICAgICAgKVxuICAgICAgdXR4b3NbYCR7dXR4b2lkQ2xlYW5lZH1gXSA9IG5ldyBVVFhPKClcbiAgICAgIHV0eG9zW2Ake3V0eG9pZENsZWFuZWR9YF0uZGVzZXJpYWxpemUoXG4gICAgICAgIGZpZWxkc1tcInV0eG9zXCJdW2Ake3V0eG9pZH1gXSxcbiAgICAgICAgZW5jb2RpbmdcbiAgICAgIClcbiAgICB9XG4gICAgbGV0IGFkZHJlc3NVVFhPcyA9IHt9XG4gICAgZm9yIChsZXQgYWRkcmVzcyBpbiBmaWVsZHNbXCJhZGRyZXNzVVRYT3NcIl0pIHtcbiAgICAgIGxldCBhZGRyZXNzQ2xlYW5lZDogc3RyaW5nID0gc2VyaWFsaXphdGlvbi5kZWNvZGVyKFxuICAgICAgICBhZGRyZXNzLFxuICAgICAgICBlbmNvZGluZyxcbiAgICAgICAgXCJjYjU4XCIsXG4gICAgICAgIFwiaGV4XCJcbiAgICAgIClcbiAgICAgIGxldCB1dHhvYmFsYW5jZSA9IHt9XG4gICAgICBmb3IgKGxldCB1dHhvaWQgaW4gZmllbGRzW1wiYWRkcmVzc1VUWE9zXCJdW2Ake2FkZHJlc3N9YF0pIHtcbiAgICAgICAgbGV0IHV0eG9pZENsZWFuZWQ6IHN0cmluZyA9IHNlcmlhbGl6YXRpb24uZGVjb2RlcihcbiAgICAgICAgICB1dHhvaWQsXG4gICAgICAgICAgZW5jb2RpbmcsXG4gICAgICAgICAgXCJiYXNlNThcIixcbiAgICAgICAgICBcImJhc2U1OFwiXG4gICAgICAgIClcbiAgICAgICAgdXR4b2JhbGFuY2VbYCR7dXR4b2lkQ2xlYW5lZH1gXSA9IHNlcmlhbGl6YXRpb24uZGVjb2RlcihcbiAgICAgICAgICBmaWVsZHNbXCJhZGRyZXNzVVRYT3NcIl1bYCR7YWRkcmVzc31gXVtgJHt1dHhvaWR9YF0sXG4gICAgICAgICAgZW5jb2RpbmcsXG4gICAgICAgICAgXCJkZWNpbWFsU3RyaW5nXCIsXG4gICAgICAgICAgXCJCTlwiXG4gICAgICAgIClcbiAgICAgIH1cbiAgICAgIGFkZHJlc3NVVFhPc1tgJHthZGRyZXNzQ2xlYW5lZH1gXSA9IHV0eG9iYWxhbmNlXG4gICAgfVxuICAgIHRoaXMudXR4b3MgPSB1dHhvc1xuICAgIHRoaXMuYWRkcmVzc1VUWE9zID0gYWRkcmVzc1VUWE9zXG4gIH1cblxuICBwYXJzZVVUWE8odXR4bzogVVRYTyB8IHN0cmluZyk6IFVUWE8ge1xuICAgIGNvbnN0IHV0eG92YXI6IFVUWE8gPSBuZXcgVVRYTygpXG4gICAgLy8gZm9yY2UgYSBjb3B5XG4gICAgaWYgKHR5cGVvZiB1dHhvID09PSBcInN0cmluZ1wiKSB7XG4gICAgICB1dHhvdmFyLmZyb21CdWZmZXIoYmludG9vbHMuY2I1OERlY29kZSh1dHhvKSlcbiAgICB9IGVsc2UgaWYgKHV0eG8gaW5zdGFuY2VvZiBTdGFuZGFyZFVUWE8pIHtcbiAgICAgIHV0eG92YXIuZnJvbUJ1ZmZlcih1dHhvLnRvQnVmZmVyKCkpIC8vIGZvcmNlcyBhIGNvcHlcbiAgICB9IGVsc2Uge1xuICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgIHRocm93IG5ldyBVVFhPRXJyb3IoXG4gICAgICAgIFwiRXJyb3IgLSBVVFhPLnBhcnNlVVRYTzogdXR4byBwYXJhbWV0ZXIgaXMgbm90IGEgVVRYTyBvciBzdHJpbmdcIlxuICAgICAgKVxuICAgIH1cbiAgICByZXR1cm4gdXR4b3ZhclxuICB9XG5cbiAgY3JlYXRlKC4uLmFyZ3M6IGFueVtdKTogdGhpcyB7XG4gICAgcmV0dXJuIG5ldyBVVFhPU2V0KCkgYXMgdGhpc1xuICB9XG5cbiAgY2xvbmUoKTogdGhpcyB7XG4gICAgY29uc3QgbmV3c2V0OiBVVFhPU2V0ID0gdGhpcy5jcmVhdGUoKVxuICAgIGNvbnN0IGFsbFVUWE9zOiBVVFhPW10gPSB0aGlzLmdldEFsbFVUWE9zKClcbiAgICBuZXdzZXQuYWRkQXJyYXkoYWxsVVRYT3MpXG4gICAgcmV0dXJuIG5ld3NldCBhcyB0aGlzXG4gIH1cblxuICBfZmVlQ2hlY2soZmVlOiBCTiwgZmVlQXNzZXRJRDogQnVmZmVyKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIChcbiAgICAgIHR5cGVvZiBmZWUgIT09IFwidW5kZWZpbmVkXCIgJiZcbiAgICAgIHR5cGVvZiBmZWVBc3NldElEICE9PSBcInVuZGVmaW5lZFwiICYmXG4gICAgICBmZWUuZ3QobmV3IEJOKDApKSAmJlxuICAgICAgZmVlQXNzZXRJRCBpbnN0YW5jZW9mIEJ1ZmZlclxuICAgIClcbiAgfVxuXG4gIGdldENvbnN1bWFibGVVWFRPID0gKFxuICAgIGFzT2Y6IEJOID0gVW5peE5vdygpLFxuICAgIHN0YWtlYWJsZTogYm9vbGVhbiA9IGZhbHNlXG4gICk6IFVUWE9bXSA9PiB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0QWxsVVRYT3MoKS5maWx0ZXIoKHV0eG86IFVUWE8pID0+IHtcbiAgICAgIGlmIChzdGFrZWFibGUpIHtcbiAgICAgICAgLy8gc3Rha2VhYmxlIHRyYW5zYWN0aW9ucyBjYW4gY29uc3VtZSBhbnkgVVRYTy5cbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIH1cbiAgICAgIGNvbnN0IG91dHB1dDogQmFzZU91dHB1dCA9IHV0eG8uZ2V0T3V0cHV0KClcbiAgICAgIGlmICghKG91dHB1dCBpbnN0YW5jZW9mIFN0YWtlYWJsZUxvY2tPdXQpKSB7XG4gICAgICAgIC8vIG5vbi1zdGFrZWFibGUgdHJhbnNhY3Rpb25zIGNhbiBjb25zdW1lIGFueSBVVFhPIHRoYXQgaXNuJ3QgbG9ja2VkLlxuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgfVxuICAgICAgY29uc3Qgc3Rha2VhYmxlT3V0cHV0OiBTdGFrZWFibGVMb2NrT3V0ID0gb3V0cHV0IGFzIFN0YWtlYWJsZUxvY2tPdXRcbiAgICAgIGlmIChzdGFrZWFibGVPdXRwdXQuZ2V0U3Rha2VhYmxlTG9ja3RpbWUoKS5sdChhc09mKSkge1xuICAgICAgICAvLyBJZiB0aGUgc3Rha2VhYmxlIG91dHB1dHMgbG9ja3RpbWUgaGFzIGVuZGVkLCB0aGVuIHRoaXMgVVRYTyBjYW4gc3RpbGxcbiAgICAgICAgLy8gYmUgY29uc3VtZWQgYnkgYSBub24tc3Rha2VhYmxlIHRyYW5zYWN0aW9uLlxuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgfVxuICAgICAgLy8gVGhpcyBvdXRwdXQgaXMgbG9ja2VkIGFuZCBjYW4ndCBiZSBjb25zdW1lZCBieSBhIG5vbi1zdGFrZWFibGVcbiAgICAgIC8vIHRyYW5zYWN0aW9uLlxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfSlcbiAgfVxuXG4gIGdldExvY2tlZFR4SURzID0gKCk6IHsgZGVwb3NpdElEczogc3RyaW5nW107IGJvbmRJRHM6IHN0cmluZ1tdIH0gPT4ge1xuICAgIGNvbnN0IGQgPSBuZXcgU2V0PHN0cmluZz4oKSxcbiAgICAgIGIgPSBuZXcgU2V0PHN0cmluZz4oKVxuICAgIHRoaXMuZ2V0QWxsVVRYT3MoKS5mb3JFYWNoKCh1dHhvOiBVVFhPKSA9PiB7XG4gICAgICBjb25zdCBvdXRwdXQ6IEJhc2VPdXRwdXQgPSB1dHhvLmdldE91dHB1dCgpXG4gICAgICBpZiAob3V0cHV0IGluc3RhbmNlb2YgTG9ja2VkT3V0KSB7XG4gICAgICAgIHZhciBpZCA9IG91dHB1dC5nZXRMb2NrZWRJRHMoKS5nZXREZXBvc2l0VHhJRCgpXG4gICAgICAgIGlmICghaWQuaXNFbXB0eSgpKSBkLmFkZChpZC5lbmNvZGUoXCJjYjU4XCIpKVxuICAgICAgICBpZCA9IG91dHB1dC5nZXRMb2NrZWRJRHMoKS5nZXRCb25kVHhJRCgpXG4gICAgICAgIGlmICghaWQuaXNFbXB0eSgpKSBiLmFkZChpZC5lbmNvZGUoXCJjYjU4XCIpKVxuICAgICAgfVxuICAgIH0pXG4gICAgcmV0dXJuIHsgZGVwb3NpdElEczogWy4uLmQua2V5cygpXSwgYm9uZElEczogWy4uLmIua2V5cygpXSB9XG4gIH1cblxuICBnZXRNaW5pbXVtU3BlbmRhYmxlID0gYXN5bmMgKFxuICAgIGFhZDogQXNzZXRBbW91bnREZXN0aW5hdGlvbixcbiAgICBhc09mOiBCTiA9IHplcm9CTixcbiAgICBsb2NrVGltZTogQk4gPSB6ZXJvQk4sXG4gICAgbG9ja01vZGU6IExvY2tNb2RlID0gXCJVbmxvY2tlZFwiXG4gICk6IFByb21pc2U8RXJyb3I+ID0+IHtcbiAgICBpZiAoYXNPZi5pc1plcm8oKSkgYXNPZiA9IFVuaXhOb3coKVxuXG4gICAgbGV0IHV0eG9BcnJheTogVVRYT1tdID0gdGhpcy5nZXRDb25zdW1hYmxlVVhUTyhhc09mLCBsb2NrTW9kZSA9PSBcIlN0YWtlXCIpXG4gICAgbGV0IHRtcFVUWE9BcnJheTogVVRYT1tdID0gW11cbiAgICBpZiAobG9ja01vZGUgPT0gXCJTdGFrZVwiKSB7XG4gICAgICAvLyBJZiB0aGlzIGlzIGEgc3Rha2VhYmxlIHRyYW5zYWN0aW9uIHRoZW4gaGF2ZSBTdGFrZWFibGVMb2NrT3V0IGNvbWUgYmVmb3JlIFNFQ1BUcmFuc2Zlck91dHB1dFxuICAgICAgLy8gc28gdGhhdCB1c2VycyBmaXJzdCBzdGFrZSBsb2NrZWQgdG9rZW5zIGJlZm9yZSBzdGFraW5nIHVubG9ja2VkIHRva2Vuc1xuICAgICAgdXR4b0FycmF5LmZvckVhY2goKHV0eG86IFVUWE8pID0+IHtcbiAgICAgICAgLy8gU3Rha2VhYmxlTG9ja091dHNcbiAgICAgICAgaWYgKHV0eG8uZ2V0T3V0cHV0KCkuZ2V0VHlwZUlEKCkgPT09IDIyKSB7XG4gICAgICAgICAgdG1wVVRYT0FycmF5LnB1c2godXR4bylcbiAgICAgICAgfVxuICAgICAgfSlcblxuICAgICAgLy8gU29ydCB0aGUgU3Rha2VhYmxlTG9ja091dHMgYnkgU3Rha2VhYmxlTG9ja3RpbWUgc28gdGhhdCB0aGUgZ3JlYXRlc3QgU3Rha2VhYmxlTG9ja3RpbWUgYXJlIHNwZW50IGZpcnN0XG4gICAgICB0bXBVVFhPQXJyYXkuc29ydCgoYTogVVRYTywgYjogVVRYTykgPT4ge1xuICAgICAgICBsZXQgc3Rha2VhYmxlTG9ja091dDEgPSBhLmdldE91dHB1dCgpIGFzIFN0YWtlYWJsZUxvY2tPdXRcbiAgICAgICAgbGV0IHN0YWtlYWJsZUxvY2tPdXQyID0gYi5nZXRPdXRwdXQoKSBhcyBTdGFrZWFibGVMb2NrT3V0XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgc3Rha2VhYmxlTG9ja091dDIuZ2V0U3Rha2VhYmxlTG9ja3RpbWUoKS50b051bWJlcigpIC1cbiAgICAgICAgICBzdGFrZWFibGVMb2NrT3V0MS5nZXRTdGFrZWFibGVMb2NrdGltZSgpLnRvTnVtYmVyKClcbiAgICAgICAgKVxuICAgICAgfSlcblxuICAgICAgdXR4b0FycmF5LmZvckVhY2goKHV0eG86IFVUWE8pID0+IHtcbiAgICAgICAgLy8gU0VDUFRyYW5zZmVyT3V0cHV0c1xuICAgICAgICBpZiAodXR4by5nZXRPdXRwdXQoKS5nZXRUeXBlSUQoKSA9PT0gNykge1xuICAgICAgICAgIHRtcFVUWE9BcnJheS5wdXNoKHV0eG8pXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICB1dHhvQXJyYXkgPSB0bXBVVFhPQXJyYXlcbiAgICB9XG5cbiAgICAvLyBvdXRzIGlzIGEgbWFwIGZyb20gYXNzZXRJRCB0byBhIHR1cGxlIG9mIChsb2NrZWRTdGFrZWFibGUsIHVubG9ja2VkKVxuICAgIC8vIHdoaWNoIGFyZSBhcnJheXMgb2Ygb3V0cHV0cy5cbiAgICBjb25zdCBvdXRzOiBvYmplY3QgPSB7fVxuXG4gICAgLy8gV2Ugb25seSBuZWVkIHRvIGl0ZXJhdGUgb3ZlciBVVFhPcyB1bnRpbCB3ZSBoYXZlIHNwZW50IHN1ZmZpY2llbnQgZnVuZHNcbiAgICAvLyB0byBtZXQgdGhlIHJlcXVlc3RlZCBhbW91bnRzLlxuICAgIHV0eG9BcnJheS5mb3JFYWNoKCh1dHhvOiBVVFhPKSA9PiB7XG4gICAgICBjb25zdCBhc3NldElEOiBCdWZmZXIgPSB1dHhvLmdldEFzc2V0SUQoKVxuICAgICAgY29uc3QgYXNzZXRLZXk6IHN0cmluZyA9IGFzc2V0SUQudG9TdHJpbmcoXCJoZXhcIilcbiAgICAgIGNvbnN0IGZyb21BZGRyZXNzZXM6IEJ1ZmZlcltdID0gYWFkLmdldFNlbmRlcnMoKVxuICAgICAgY29uc3Qgb3V0cHV0OiBCYXNlT3V0cHV0ID0gdXR4by5nZXRPdXRwdXQoKVxuICAgICAgY29uc3QgYW1vdW50T3V0cHV0ID1cbiAgICAgICAgb3V0cHV0IGluc3RhbmNlb2YgUGFyc2VhYmxlT3V0cHV0ID8gb3V0cHV0LmdldE91dHB1dCgpIDogb3V0cHV0XG4gICAgICBpZiAoXG4gICAgICAgICEoYW1vdW50T3V0cHV0IGluc3RhbmNlb2YgQW1vdW50T3V0cHV0KSB8fFxuICAgICAgICAhYWFkLmFzc2V0RXhpc3RzKGFzc2V0S2V5KSB8fFxuICAgICAgICAhb3V0cHV0Lm1lZXRzVGhyZXNob2xkKGZyb21BZGRyZXNzZXMsIGFzT2YpXG4gICAgICApIHtcbiAgICAgICAgLy8gV2Ugc2hvdWxkIG9ubHkgdHJ5IHRvIHNwZW5kIGZ1bmdpYmxlIGFzc2V0cy5cbiAgICAgICAgLy8gV2Ugc2hvdWxkIG9ubHkgc3BlbmQge3sgYXNzZXRLZXkgfX0uXG4gICAgICAgIC8vIFdlIG5lZWQgdG8gYmUgYWJsZSB0byBzcGVuZCB0aGUgb3V0cHV0LlxuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgY29uc3QgYXNzZXRBbW91bnQ6IEFzc2V0QW1vdW50ID0gYWFkLmdldEFzc2V0QW1vdW50KGFzc2V0S2V5KVxuICAgICAgaWYgKGFzc2V0QW1vdW50LmlzRmluaXNoZWQoKSkge1xuICAgICAgICAvLyBXZSd2ZSBhbHJlYWR5IHNwZW50IHRoZSBuZWVkZWQgVVRYT3MgZm9yIHRoaXMgYXNzZXRJRC5cbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIGlmICghKGFzc2V0S2V5IGluIG91dHMpKSB7XG4gICAgICAgIC8vIElmIHRoaXMgaXMgdGhlIGZpcnN0IHRpbWUgc3BlbmRpbmcgdGhpcyBhc3NldElELCB3ZSBuZWVkIHRvXG4gICAgICAgIC8vIGluaXRpYWxpemUgdGhlIG91dHMgb2JqZWN0IGNvcnJlY3RseS5cbiAgICAgICAgb3V0c1tgJHthc3NldEtleX1gXSA9IHtcbiAgICAgICAgICBsb2NrZWRTdGFrZWFibGU6IFtdLFxuICAgICAgICAgIHVubG9ja2VkOiBbXVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIGFtb3VudCBpcyB0aGUgYW1vdW50IG9mIGZ1bmRzIGF2YWlsYWJsZSBmcm9tIHRoaXMgVVRYTy5cbiAgICAgIGNvbnN0IGFtb3VudCA9IGFtb3VudE91dHB1dC5nZXRBbW91bnQoKVxuXG4gICAgICAvLyBTZXQgdXAgdGhlIFNFQ1AgaW5wdXQgd2l0aCB0aGUgc2FtZSBhbW91bnQgYXMgdGhlIG91dHB1dC5cbiAgICAgIGxldCBpbnB1dDogQmFzZUlucHV0ID0gbmV3IFNFQ1BUcmFuc2ZlcklucHV0KGFtb3VudClcblxuICAgICAgbGV0IGxvY2tlZDogYm9vbGVhbiA9IGZhbHNlXG4gICAgICBpZiAob3V0cHV0IGluc3RhbmNlb2YgU3Rha2VhYmxlTG9ja091dCkge1xuICAgICAgICBjb25zdCBzdGFrZWFibGVPdXRwdXQ6IFN0YWtlYWJsZUxvY2tPdXQgPSBvdXRwdXQgYXMgU3Rha2VhYmxlTG9ja091dFxuICAgICAgICBjb25zdCBzdGFrZWFibGVMb2NrdGltZTogQk4gPSBzdGFrZWFibGVPdXRwdXQuZ2V0U3Rha2VhYmxlTG9ja3RpbWUoKVxuXG4gICAgICAgIGlmIChzdGFrZWFibGVMb2NrdGltZS5ndChhc09mKSkge1xuICAgICAgICAgIC8vIEFkZCBhIG5ldyBpbnB1dCBhbmQgbWFyayBpdCBhcyBiZWluZyBsb2NrZWQuXG4gICAgICAgICAgaW5wdXQgPSBuZXcgU3Rha2VhYmxlTG9ja0luKFxuICAgICAgICAgICAgYW1vdW50LFxuICAgICAgICAgICAgc3Rha2VhYmxlTG9ja3RpbWUsXG4gICAgICAgICAgICBuZXcgUGFyc2VhYmxlSW5wdXQoaW5wdXQpXG4gICAgICAgICAgKVxuXG4gICAgICAgICAgLy8gTWFyayB0aGlzIFVUWE8gYXMgaGF2aW5nIGJlZW4gcmUtbG9ja2VkLlxuICAgICAgICAgIGxvY2tlZCA9IHRydWVcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBhc3NldEFtb3VudC5zcGVuZEFtb3VudChhbW91bnQsIGxvY2tlZClcbiAgICAgIGlmIChsb2NrZWQpIHtcbiAgICAgICAgLy8gVHJhY2sgdGhlIFVUWE8gYXMgbG9ja2VkLlxuICAgICAgICBvdXRzW2Ake2Fzc2V0S2V5fWBdLmxvY2tlZFN0YWtlYWJsZS5wdXNoKG91dHB1dClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFRyYWNrIHRoZSBVVFhPIGFzIHVubG9ja2VkLlxuICAgICAgICBvdXRzW2Ake2Fzc2V0S2V5fWBdLnVubG9ja2VkLnB1c2gob3V0cHV0KVxuICAgICAgfVxuXG4gICAgICAvLyBHZXQgdGhlIGluZGljZXMgb2YgdGhlIG91dHB1dHMgdGhhdCBzaG91bGQgYmUgdXNlZCB0byBhdXRob3JpemUgdGhlXG4gICAgICAvLyBzcGVuZGluZyBvZiB0aGlzIGlucHV0LlxuXG4gICAgICAvLyBUT0RPOiBnZXRTcGVuZGVycyBzaG91bGQgcmV0dXJuIGFuIGFycmF5IG9mIGluZGljZXMgcmF0aGVyIHRoYW4gYW5cbiAgICAgIC8vIGFycmF5IG9mIGFkZHJlc3Nlcy5cbiAgICAgIGNvbnN0IHNwZW5kZXJzOiBCdWZmZXJbXSA9IGFtb3VudE91dHB1dC5nZXRTcGVuZGVycyhmcm9tQWRkcmVzc2VzLCBhc09mKVxuICAgICAgc3BlbmRlcnMuZm9yRWFjaCgoc3BlbmRlcjogQnVmZmVyKSA9PiB7XG4gICAgICAgIGNvbnN0IGlkeDogbnVtYmVyID0gYW1vdW50T3V0cHV0LmdldEFkZHJlc3NJZHgoc3BlbmRlcilcbiAgICAgICAgaWYgKGlkeCA9PT0gLTEpIHtcbiAgICAgICAgICAvLyBUaGlzIHNob3VsZCBuZXZlciBoYXBwZW4sIHdoaWNoIGlzIHdoeSB0aGUgZXJyb3IgaXMgdGhyb3duIHJhdGhlclxuICAgICAgICAgIC8vIHRoYW4gYmVpbmcgcmV0dXJuZWQuIElmIHRoaXMgd2VyZSB0byBldmVyIGhhcHBlbiB0aGlzIHdvdWxkIGJlIGFuXG4gICAgICAgICAgLy8gZXJyb3IgaW4gdGhlIGludGVybmFsIGxvZ2ljIHJhdGhlciBoYXZpbmcgY2FsbGVkIHRoaXMgZnVuY3Rpb24gd2l0aFxuICAgICAgICAgIC8vIGludmFsaWQgYXJndW1lbnRzLlxuXG4gICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgICAgICB0aHJvdyBuZXcgQWRkcmVzc0Vycm9yKFxuICAgICAgICAgICAgXCJFcnJvciAtIFVUWE9TZXQuZ2V0TWluaW11bVNwZW5kYWJsZTogbm8gc3VjaCBcIiArXG4gICAgICAgICAgICAgIGBhZGRyZXNzIGluIG91dHB1dDogJHtzcGVuZGVyfWBcbiAgICAgICAgICApXG4gICAgICAgIH1cbiAgICAgICAgaW5wdXQuYWRkU2lnbmF0dXJlSWR4KGlkeCwgc3BlbmRlcilcbiAgICAgIH0pXG5cbiAgICAgIGNvbnN0IHR4SUQ6IEJ1ZmZlciA9IHV0eG8uZ2V0VHhJRCgpXG4gICAgICBjb25zdCBvdXRwdXRJZHg6IEJ1ZmZlciA9IHV0eG8uZ2V0T3V0cHV0SWR4KClcbiAgICAgIGNvbnN0IHRyYW5zZmVySW5wdXQ6IFRyYW5zZmVyYWJsZUlucHV0ID0gbmV3IFRyYW5zZmVyYWJsZUlucHV0KFxuICAgICAgICB0eElELFxuICAgICAgICBvdXRwdXRJZHgsXG4gICAgICAgIGFzc2V0SUQsXG4gICAgICAgIGlucHV0XG4gICAgICApXG4gICAgICBhYWQuYWRkSW5wdXQodHJhbnNmZXJJbnB1dClcbiAgICB9KVxuXG4gICAgaWYgKCFhYWQuY2FuQ29tcGxldGUoKSkge1xuICAgICAgLy8gQWZ0ZXIgcnVubmluZyB0aHJvdWdoIGFsbCB0aGUgVVRYT3MsIHdlIHN0aWxsIHdlcmVuJ3QgYWJsZSB0byBnZXQgYWxsXG4gICAgICAvLyB0aGUgbmVjZXNzYXJ5IGZ1bmRzLCBzbyB0aGlzIHRyYW5zYWN0aW9uIGNhbid0IGJlIG1hZGUuXG4gICAgICByZXR1cm4gbmV3IEluc3VmZmljaWVudEZ1bmRzRXJyb3IoXG4gICAgICAgIFwiRXJyb3IgLSBVVFhPU2V0LmdldE1pbmltdW1TcGVuZGFibGU6IGluc3VmZmljaWVudCBcIiArXG4gICAgICAgICAgXCJmdW5kcyB0byBjcmVhdGUgdGhlIHRyYW5zYWN0aW9uXCJcbiAgICAgIClcbiAgICB9XG5cbiAgICAvLyBUT0RPOiBXZSBzaG91bGQgc2VwYXJhdGUgdGhlIGFib3ZlIGZ1bmN0aW9uYWxpdHkgaW50byBhIHNpbmdsZSBmdW5jdGlvblxuICAgIC8vIHRoYXQganVzdCBzZWxlY3RzIHRoZSBVVFhPcyB0byBjb25zdW1lLlxuXG4gICAgY29uc3QgemVybzogQk4gPSBuZXcgQk4oMClcblxuICAgIC8vIGFzc2V0QW1vdW50cyBpcyBhbiBhcnJheSBvZiBhc3NldCBkZXNjcmlwdGlvbnMgYW5kIGhvdyBtdWNoIGlzIGxlZnQgdG9cbiAgICAvLyBzcGVuZCBmb3IgdGhlbS5cbiAgICBjb25zdCBhc3NldEFtb3VudHM6IEFzc2V0QW1vdW50W10gPSBhYWQuZ2V0QW1vdW50cygpXG4gICAgYXNzZXRBbW91bnRzLmZvckVhY2goKGFzc2V0QW1vdW50OiBBc3NldEFtb3VudCkgPT4ge1xuICAgICAgLy8gY2hhbmdlIGlzIHRoZSBhbW91bnQgdGhhdCBzaG91bGQgYmUgcmV0dXJuZWQgYmFjayB0byB0aGUgc291cmNlIG9mIHRoZVxuICAgICAgLy8gZnVuZHMuXG4gICAgICBjb25zdCBjaGFuZ2U6IEJOID0gYXNzZXRBbW91bnQuZ2V0Q2hhbmdlKClcbiAgICAgIC8vIGlzU3Rha2VhYmxlTG9ja0NoYW5nZSBpcyBpZiB0aGUgY2hhbmdlIGlzIGxvY2tlZCBvciBub3QuXG4gICAgICBjb25zdCBpc1N0YWtlYWJsZUxvY2tDaGFuZ2U6IGJvb2xlYW4gPVxuICAgICAgICBhc3NldEFtb3VudC5nZXRTdGFrZWFibGVMb2NrQ2hhbmdlKClcbiAgICAgIC8vIGxvY2tlZENoYW5nZSBpcyB0aGUgYW1vdW50IG9mIGxvY2tlZCBjaGFuZ2UgdGhhdCBzaG91bGQgYmUgcmV0dXJuZWQgdG9cbiAgICAgIC8vIHRoZSBzZW5kZXJcbiAgICAgIGNvbnN0IGxvY2tlZENoYW5nZTogQk4gPSBpc1N0YWtlYWJsZUxvY2tDaGFuZ2UgPyBjaGFuZ2UgOiB6ZXJvLmNsb25lKClcblxuICAgICAgY29uc3QgYXNzZXRJRDogQnVmZmVyID0gYXNzZXRBbW91bnQuZ2V0QXNzZXRJRCgpXG4gICAgICBjb25zdCBhc3NldEtleTogc3RyaW5nID0gYXNzZXRBbW91bnQuZ2V0QXNzZXRJRFN0cmluZygpXG4gICAgICBjb25zdCBsb2NrZWRPdXRwdXRzOiBTdGFrZWFibGVMb2NrT3V0W10gPVxuICAgICAgICBvdXRzW2Ake2Fzc2V0S2V5fWBdLmxvY2tlZFN0YWtlYWJsZVxuICAgICAgbG9ja2VkT3V0cHV0cy5mb3JFYWNoKChsb2NrZWRPdXRwdXQ6IFN0YWtlYWJsZUxvY2tPdXQsIGk6IG51bWJlcikgPT4ge1xuICAgICAgICBjb25zdCBzdGFrZWFibGVMb2NrdGltZTogQk4gPSBsb2NrZWRPdXRwdXQuZ2V0U3Rha2VhYmxlTG9ja3RpbWUoKVxuXG4gICAgICAgIC8vIFdlIGtub3cgdGhhdCBwYXJzZWFibGVPdXRwdXQgY29udGFpbnMgYW4gQW1vdW50T3V0cHV0IGJlY2F1c2UgdGhlXG4gICAgICAgIC8vIGZpcnN0IGxvb3AgZmlsdGVycyBmb3IgZnVuZ2libGUgYXNzZXRzLlxuICAgICAgICBjb25zdCBvdXRwdXQ6IEFtb3VudE91dHB1dCA9IGxvY2tlZE91dHB1dC5nZXRPdXRwdXQoKSBhcyBBbW91bnRPdXRwdXRcblxuICAgICAgICBsZXQgb3V0cHV0QW1vdW50UmVtYWluaW5nOiBCTiA9IG91dHB1dC5nZXRBbW91bnQoKVxuICAgICAgICAvLyBUaGUgb25seSBvdXRwdXQgdGhhdCBjb3VsZCBnZW5lcmF0ZSBjaGFuZ2UgaXMgdGhlIGxhc3Qgb3V0cHV0LlxuICAgICAgICAvLyBPdGhlcndpc2UsIGFueSBmdXJ0aGVyIFVUWE9zIHdvdWxkbid0IGhhdmUgbmVlZGVkIHRvIGJlIHNwZW50LlxuICAgICAgICBpZiAoaSA9PSBsb2NrZWRPdXRwdXRzLmxlbmd0aCAtIDEgJiYgbG9ja2VkQ2hhbmdlLmd0KHplcm8pKSB7XG4gICAgICAgICAgLy8gdXBkYXRlIG91dHB1dEFtb3VudFJlbWFpbmluZyB0byBubyBsb25nZXIgaG9sZCB0aGUgY2hhbmdlIHRoYXQgd2VcbiAgICAgICAgICAvLyBhcmUgcmV0dXJuaW5nLlxuICAgICAgICAgIG91dHB1dEFtb3VudFJlbWFpbmluZyA9IG91dHB1dEFtb3VudFJlbWFpbmluZy5zdWIobG9ja2VkQ2hhbmdlKVxuICAgICAgICAgIGxldCBuZXdMb2NrZWRDaGFuZ2VPdXRwdXQ6IFN0YWtlYWJsZUxvY2tPdXQgPSBTZWxlY3RPdXRwdXRDbGFzcyhcbiAgICAgICAgICAgIGxvY2tlZE91dHB1dC5nZXRPdXRwdXRJRCgpLFxuICAgICAgICAgICAgbG9ja2VkQ2hhbmdlLFxuICAgICAgICAgICAgb3V0cHV0LmdldEFkZHJlc3NlcygpLFxuICAgICAgICAgICAgb3V0cHV0LmdldExvY2t0aW1lKCksXG4gICAgICAgICAgICBvdXRwdXQuZ2V0VGhyZXNob2xkKCksXG4gICAgICAgICAgICBzdGFrZWFibGVMb2NrdGltZVxuICAgICAgICAgICkgYXMgU3Rha2VhYmxlTG9ja091dFxuICAgICAgICAgIGNvbnN0IHRyYW5zZmVyT3V0cHV0OiBUcmFuc2ZlcmFibGVPdXRwdXQgPSBuZXcgVHJhbnNmZXJhYmxlT3V0cHV0KFxuICAgICAgICAgICAgYXNzZXRJRCxcbiAgICAgICAgICAgIG5ld0xvY2tlZENoYW5nZU91dHB1dFxuICAgICAgICAgIClcbiAgICAgICAgICBhYWQuYWRkQ2hhbmdlKHRyYW5zZmVyT3V0cHV0KVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gV2Uga25vdyB0aGF0IG91dHB1dEFtb3VudFJlbWFpbmluZyA+IDAuIE90aGVyd2lzZSwgd2Ugd291bGQgbmV2ZXJcbiAgICAgICAgLy8gaGF2ZSBjb25zdW1lZCB0aGlzIFVUWE8sIGFzIGl0IHdvdWxkIGJlIG9ubHkgY2hhbmdlLlxuICAgICAgICBjb25zdCBuZXdMb2NrZWRPdXRwdXQ6IFN0YWtlYWJsZUxvY2tPdXQgPSBTZWxlY3RPdXRwdXRDbGFzcyhcbiAgICAgICAgICBsb2NrZWRPdXRwdXQuZ2V0T3V0cHV0SUQoKSxcbiAgICAgICAgICBvdXRwdXRBbW91bnRSZW1haW5pbmcsXG4gICAgICAgICAgb3V0cHV0LmdldEFkZHJlc3NlcygpLFxuICAgICAgICAgIG91dHB1dC5nZXRMb2NrdGltZSgpLFxuICAgICAgICAgIG91dHB1dC5nZXRUaHJlc2hvbGQoKSxcbiAgICAgICAgICBzdGFrZWFibGVMb2NrdGltZVxuICAgICAgICApIGFzIFN0YWtlYWJsZUxvY2tPdXRcbiAgICAgICAgY29uc3QgdHJhbnNmZXJPdXRwdXQ6IFRyYW5zZmVyYWJsZU91dHB1dCA9IG5ldyBUcmFuc2ZlcmFibGVPdXRwdXQoXG4gICAgICAgICAgYXNzZXRJRCxcbiAgICAgICAgICBuZXdMb2NrZWRPdXRwdXRcbiAgICAgICAgKVxuICAgICAgICBhYWQuYWRkT3V0cHV0KHRyYW5zZmVyT3V0cHV0KVxuICAgICAgfSlcblxuICAgICAgLy8gdW5sb2NrZWRDaGFuZ2UgaXMgdGhlIGFtb3VudCBvZiB1bmxvY2tlZCBjaGFuZ2UgdGhhdCBzaG91bGQgYmUgcmV0dXJuZWRcbiAgICAgIC8vIHRvIHRoZSBzZW5kZXJcbiAgICAgIGNvbnN0IHVubG9ja2VkQ2hhbmdlOiBCTiA9IGlzU3Rha2VhYmxlTG9ja0NoYW5nZSA/IHplcm8uY2xvbmUoKSA6IGNoYW5nZVxuICAgICAgaWYgKHVubG9ja2VkQ2hhbmdlLmd0KHplcm8pKSB7XG4gICAgICAgIGNvbnN0IG5ld0NoYW5nZU91dHB1dDogQW1vdW50T3V0cHV0ID0gbmV3IFNFQ1BUcmFuc2Zlck91dHB1dChcbiAgICAgICAgICB1bmxvY2tlZENoYW5nZSxcbiAgICAgICAgICBhYWQuZ2V0Q2hhbmdlQWRkcmVzc2VzKCksXG4gICAgICAgICAgemVyby5jbG9uZSgpLCAvLyBtYWtlIHN1cmUgdGhhdCB3ZSBkb24ndCBsb2NrIHRoZSBjaGFuZ2Ugb3V0cHV0LlxuICAgICAgICAgIGFhZC5nZXRDaGFuZ2VBZGRyZXNzZXNUaHJlc2hvbGQoKVxuICAgICAgICApIGFzIEFtb3VudE91dHB1dFxuICAgICAgICBjb25zdCB0cmFuc2Zlck91dHB1dDogVHJhbnNmZXJhYmxlT3V0cHV0ID0gbmV3IFRyYW5zZmVyYWJsZU91dHB1dChcbiAgICAgICAgICBhc3NldElELFxuICAgICAgICAgIG5ld0NoYW5nZU91dHB1dFxuICAgICAgICApXG4gICAgICAgIGFhZC5hZGRDaGFuZ2UodHJhbnNmZXJPdXRwdXQpXG4gICAgICB9XG5cbiAgICAgIC8vIHRvdGFsQW1vdW50U3BlbnQgaXMgdGhlIHRvdGFsIGFtb3VudCBvZiB0b2tlbnMgY29uc3VtZWQuXG4gICAgICBjb25zdCB0b3RhbEFtb3VudFNwZW50OiBCTiA9IGFzc2V0QW1vdW50LmdldFNwZW50KClcbiAgICAgIC8vIHN0YWtlYWJsZUxvY2tlZEFtb3VudCBpcyB0aGUgdG90YWwgYW1vdW50IG9mIGxvY2tlZCB0b2tlbnMgY29uc3VtZWQuXG4gICAgICBjb25zdCBzdGFrZWFibGVMb2NrZWRBbW91bnQ6IEJOID0gYXNzZXRBbW91bnQuZ2V0U3Rha2VhYmxlTG9ja1NwZW50KClcbiAgICAgIC8vIHRvdGFsVW5sb2NrZWRTcGVudCBpcyB0aGUgdG90YWwgYW1vdW50IG9mIHVubG9ja2VkIHRva2VucyBjb25zdW1lZC5cbiAgICAgIGNvbnN0IHRvdGFsVW5sb2NrZWRTcGVudDogQk4gPSB0b3RhbEFtb3VudFNwZW50LnN1YihzdGFrZWFibGVMb2NrZWRBbW91bnQpXG4gICAgICAvLyBhbW91bnRCdXJudCBpcyB0aGUgYW1vdW50IG9mIHVubG9ja2VkIHRva2VucyB0aGF0IG11c3QgYmUgYnVybi5cbiAgICAgIGNvbnN0IGFtb3VudEJ1cm50OiBCTiA9IGFzc2V0QW1vdW50LmdldEJ1cm4oKVxuICAgICAgLy8gdG90YWxVbmxvY2tlZEF2YWlsYWJsZSBpcyB0aGUgdG90YWwgYW1vdW50IG9mIHVubG9ja2VkIHRva2VucyBhdmFpbGFibGVcbiAgICAgIC8vIHRvIGJlIHByb2R1Y2VkLlxuICAgICAgY29uc3QgdG90YWxVbmxvY2tlZEF2YWlsYWJsZTogQk4gPSB0b3RhbFVubG9ja2VkU3BlbnQuc3ViKGFtb3VudEJ1cm50KVxuICAgICAgLy8gdW5sb2NrZWRBbW91bnQgaXMgdGhlIGFtb3VudCBvZiB1bmxvY2tlZCB0b2tlbnMgdGhhdCBzaG91bGQgYmUgc2VudC5cbiAgICAgIGNvbnN0IHVubG9ja2VkQW1vdW50OiBCTiA9IHRvdGFsVW5sb2NrZWRBdmFpbGFibGUuc3ViKHVubG9ja2VkQ2hhbmdlKVxuICAgICAgaWYgKHVubG9ja2VkQW1vdW50Lmd0KHplcm8pKSB7XG4gICAgICAgIGNvbnN0IG5ld091dHB1dDogQW1vdW50T3V0cHV0ID0gbmV3IFNFQ1BUcmFuc2Zlck91dHB1dChcbiAgICAgICAgICB1bmxvY2tlZEFtb3VudCxcbiAgICAgICAgICBhYWQuZ2V0RGVzdGluYXRpb25zKCksXG4gICAgICAgICAgbG9ja1RpbWUsXG4gICAgICAgICAgYWFkLmdldERlc3RpbmF0aW9uc1RocmVzaG9sZCgpXG4gICAgICAgICkgYXMgQW1vdW50T3V0cHV0XG4gICAgICAgIGNvbnN0IHRyYW5zZmVyT3V0cHV0OiBUcmFuc2ZlcmFibGVPdXRwdXQgPSBuZXcgVHJhbnNmZXJhYmxlT3V0cHV0KFxuICAgICAgICAgIGFzc2V0SUQsXG4gICAgICAgICAgbmV3T3V0cHV0XG4gICAgICAgIClcbiAgICAgICAgYWFkLmFkZE91dHB1dCh0cmFuc2Zlck91dHB1dClcbiAgICAgIH1cbiAgICB9KVxuICAgIHJldHVybiB1bmRlZmluZWRcbiAgfVxufVxuIl19
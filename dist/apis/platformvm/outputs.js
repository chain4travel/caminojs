"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LockedOut = exports.SECPOwnerOutput = exports.StakeableLockOut = exports.SECPTransferOutput = exports.AmountOutput = exports.ParseableOutput = exports.TransferableOutput = exports.SelectOutputClass = void 0;
/**
 * @packageDocumentation
 * @module API-PlatformVM-Outputs
 */
const buffer_1 = require("buffer/");
const bintools_1 = __importDefault(require("../../utils/bintools"));
const constants_1 = require("./constants");
const output_1 = require("../../common/output");
const serialization_1 = require("../../utils/serialization");
const errors_1 = require("../../utils/errors");
const locked_1 = require("./locked");
const bintools = bintools_1.default.getInstance();
const serialization = serialization_1.Serialization.getInstance();
/**
 * Takes a buffer representing the output and returns the proper Output instance.
 *
 * @param outputid A number representing the inputID parsed prior to the bytes passed in
 *
 * @returns An instance of an [[Output]]-extended class.
 */
const SelectOutputClass = (outputid, ...args) => {
    if (outputid == constants_1.PlatformVMConstants.SECPXFEROUTPUTID) {
        return new SECPTransferOutput(...args);
    }
    else if (outputid == constants_1.PlatformVMConstants.SECPOWNEROUTPUTID) {
        return new SECPOwnerOutput(...args);
    }
    else if (outputid == constants_1.PlatformVMConstants.STAKEABLELOCKOUTID) {
        return new StakeableLockOut(...args);
    }
    else if (outputid == constants_1.PlatformVMConstants.LOCKEDOUTID) {
        return new LockedOut(...args);
    }
    throw new errors_1.OutputIdError("Error - SelectOutputClass: unknown outputid " + outputid);
};
exports.SelectOutputClass = SelectOutputClass;
class TransferableOutput extends output_1.StandardTransferableOutput {
    constructor() {
        super(...arguments);
        this._typeName = "TransferableOutput";
        this._typeID = undefined;
    }
    //serialize is inherited
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        this.output = (0, exports.SelectOutputClass)(fields["output"]["_typeID"]);
        this.output.deserialize(fields["output"], encoding);
    }
    fromBuffer(bytes, offset = 0) {
        this.assetID = bintools.copyFrom(bytes, offset, offset + constants_1.PlatformVMConstants.ASSETIDLEN);
        offset += constants_1.PlatformVMConstants.ASSETIDLEN;
        const outputid = bintools
            .copyFrom(bytes, offset, offset + 4)
            .readUInt32BE(0);
        offset += 4;
        this.output = (0, exports.SelectOutputClass)(outputid);
        return this.output.fromBuffer(bytes, offset);
    }
    static fromArray(b) {
        let offset = 6; //version + counter
        let num = b.readUInt32BE(2);
        const result = [];
        while (offset < b.length && num-- > 0) {
            const t = new TransferableOutput();
            offset = t.fromBuffer(b, offset);
            result.push(t);
        }
        return result;
    }
}
exports.TransferableOutput = TransferableOutput;
class ParseableOutput extends output_1.StandardParseableOutput {
    constructor() {
        super(...arguments);
        this._typeName = "ParseableOutput";
        this._typeID = undefined;
    }
    //serialize is inherited
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        this.output = (0, exports.SelectOutputClass)(fields["output"]["_typeID"]);
        this.output.deserialize(fields["output"], encoding);
    }
    fromBuffer(bytes, offset = 0) {
        const outputid = bintools
            .copyFrom(bytes, offset, offset + 4)
            .readUInt32BE(0);
        offset += 4;
        this.output = (0, exports.SelectOutputClass)(outputid);
        return this.output.fromBuffer(bytes, offset);
    }
}
exports.ParseableOutput = ParseableOutput;
class AmountOutput extends output_1.StandardAmountOutput {
    constructor() {
        super(...arguments);
        this._typeName = "AmountOutput";
        this._typeID = undefined;
    }
    //serialize and deserialize both are inherited
    /**
     * @param assetID An assetID which is wrapped around the Buffer of the Output
     */
    makeTransferable(assetID) {
        return new TransferableOutput(assetID, this);
    }
}
exports.AmountOutput = AmountOutput;
/**
 * An [[Output]] class which specifies an Output that carries an ammount for an assetID and uses secp256k1 signature scheme.
 */
class SECPTransferOutput extends AmountOutput {
    constructor() {
        super(...arguments);
        this._typeName = "SECPTransferOutput";
        this._typeID = constants_1.PlatformVMConstants.SECPXFEROUTPUTID;
    }
    //serialize and deserialize both are inherited
    /**
     * Returns the outputID for this output
     */
    getOutputID() {
        return this._typeID;
    }
    create(...args) {
        return new SECPTransferOutput(...args);
    }
    clone() {
        const newout = this.create();
        newout.fromBuffer(this.toBuffer());
        return newout;
    }
}
exports.SECPTransferOutput = SECPTransferOutput;
/**
 * An [[Output]] class which specifies an output that has a locktime which can also enable
 * staking of the value held, preventing transfers but not validation.
 */
class StakeableLockOut extends ParseableOutput {
    //serialize and deserialize both are inherited
    serialize(encoding = "hex") {
        let fields = super.serialize(encoding);
        let outobj = Object.assign(Object.assign({}, fields), { stakeableLocktime: serialization.encoder(this.stakeableLocktime, encoding, "Buffer", "decimalString", 8) });
        return outobj;
    }
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        this.stakeableLocktime = serialization.decoder(fields["stakeableLocktime"], encoding, "decimalString", "Buffer", 8);
    }
    getStakeableLocktime() {
        return bintools.fromBufferToBN(this.stakeableLocktime);
    }
    /**
     * @param assetID An assetID which is wrapped around the Buffer of the Output
     */
    makeTransferable(assetID) {
        return new TransferableOutput(assetID, this);
    }
    /**
     * Popuates the instance from a {@link https://github.com/feross/buffer|Buffer} representing the [[StakeableLockOut]] and returns the size of the output.
     */
    fromBuffer(outbuff, offset = 0) {
        this.stakeableLocktime = bintools.copyFrom(outbuff, offset, offset + 8);
        offset += 8;
        offset = super.fromBuffer(outbuff, offset);
        return offset;
    }
    /**
     * Returns the buffer representing the [[StakeableLockOut]] instance.
     */
    toBuffer() {
        const superBuf = super.toBuffer();
        return buffer_1.Buffer.concat([this.stakeableLocktime, superBuf], superBuf.length + 8);
    }
    /**
     * Returns the outputID for this output
     */
    getOutputID() {
        return this._typeID;
    }
    create(...args) {
        return new StakeableLockOut(...args);
    }
    clone() {
        const newout = this.create();
        newout.fromBuffer(this.toBuffer());
        return newout;
    }
    /**
     * Returns the amount from the underlying output
     */
    getAmount() {
        return this.getOutput().getAmount();
    }
    /**
     * Backwards compatibility
     */
    getTransferableOutput() {
        return this;
    }
    /**
     * A [[Output]] class which specifies a [[ParseableOutput]] that has a locktime which can also
     * enable staking of the value held, preventing transfers but not validation.
     *
     * @param amount A {@link https://github.com/indutny/bn.js/|BN} representing the amount in the output
     * @param addresses An array of {@link https://github.com/feross/buffer|Buffer}s representing addresses
     * @param locktime A {@link https://github.com/indutny/bn.js/|BN} representing the locktime
     * @param threshold A number representing the the threshold number of signers required to sign the transaction
     * @param stakeableLocktime A {@link https://github.com/indutny/bn.js/|BN} representing the stakeable locktime
     * @param output A [[BaseOutput]] which is embedded into this output.
     */
    constructor(amount = undefined, addresses = undefined, locktime = undefined, threshold = undefined, stakeableLocktime = undefined, output = undefined) {
        super(output
            ? output.getOutput()
            : new SECPTransferOutput(amount, addresses, locktime, threshold));
        this._typeName = "StakeableLockOut";
        this._typeID = constants_1.PlatformVMConstants.STAKEABLELOCKOUTID;
        if (typeof stakeableLocktime !== "undefined") {
            this.stakeableLocktime = bintools.fromBNToBuffer(stakeableLocktime, 8);
        }
    }
}
exports.StakeableLockOut = StakeableLockOut;
/**
 * An [[Output]] class which only specifies an Output ownership and uses secp256k1 signature scheme.
 */
class SECPOwnerOutput extends output_1.Output {
    constructor() {
        super(...arguments);
        this._typeName = "SECPOwnerOutput";
        this._typeID = constants_1.PlatformVMConstants.SECPOWNEROUTPUTID;
    }
    //serialize and deserialize both are inherited
    /**
     * Returns the outputID for this output
     */
    getOutputID() {
        return this._typeID;
    }
    /**
     *
     * @param assetID An assetID which is wrapped around the Buffer of the Output
     */
    makeTransferable(assetID) {
        return new TransferableOutput(assetID, this);
    }
    create(...args) {
        return new SECPOwnerOutput(...args);
    }
    clone() {
        const newout = this.create();
        newout.fromBuffer(this.toBuffer());
        return newout;
    }
}
exports.SECPOwnerOutput = SECPOwnerOutput;
/**
 * An [[Output]] class which specifies an output that is controlled by deposit and bond tx.
 */
class LockedOut extends ParseableOutput {
    //serialize and deserialize both are inherited
    serialize(encoding = "hex") {
        let fields = super.serialize(encoding);
        let outobj = Object.assign(Object.assign({}, fields), { ids: this.ids.serialize() });
        return outobj;
    }
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        this.ids.deserialize(fields["ids"], encoding);
    }
    getLockedIDs() {
        return this.ids;
    }
    /**
     * @param assetID An assetID which is wrapped around the Buffer of the Output
     */
    makeTransferable(assetID) {
        return new TransferableOutput(assetID, this);
    }
    create(...args) {
        return new LockedOut(...args);
    }
    clone() {
        const newout = this.create();
        newout.fromBuffer(this.toBuffer());
        return newout;
    }
    /**
     * Popuates the instance from a {@link https://github.com/feross/buffer|Buffer} representing the [[LockedOut]] and returns the size of the output.
     */
    fromBuffer(outbuff, offset = 0) {
        offset = this.ids.fromBuffer(outbuff, offset);
        offset = super.fromBuffer(outbuff, offset);
        return offset;
    }
    /**
     * Returns the buffer representing the [[LockedOut]] instance.
     */
    toBuffer() {
        const idsBuf = this.ids.toBuffer();
        const superBuff = super.toBuffer();
        return buffer_1.Buffer.concat([idsBuf, superBuff], superBuff.length + 64);
    }
    /**
     * Returns the outputID for this output
     */
    getOutputID() {
        return this._typeID;
    }
    /**
     * Returns the amount from the underlying output
     */
    getAmount() {
        return this.getOutput().getAmount();
    }
    /**
     * @param amount A {@link https://github.com/indutny/bn.js/|BN} representing the amount in the output
     * @param addresses An array of {@link https://github.com/feross/buffer|Buffer}s representing addresses
     * @param locktime A {@link https://github.com/indutny/bn.js/|BN} representing the locktime
     * @param threshold A number representing the the threshold number of signers required to sign the transaction
     * @param ids LockIDs set of deposit and bond txIDs
     */
    constructor(amount = undefined, addresses = undefined, locktime = undefined, threshold = undefined, ids = undefined) {
        super(new SECPTransferOutput(amount, addresses, locktime, threshold));
        this._typeName = "LockedOut";
        this._typeID = constants_1.PlatformVMConstants.LOCKEDOUTID;
        this.ids = new locked_1.LockedIDs();
        if (typeof ids !== "undefined")
            this.ids = ids;
    }
}
exports.LockedOut = LockedOut;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3V0cHV0cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hcGlzL3BsYXRmb3Jtdm0vb3V0cHV0cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTs7O0dBR0c7QUFDSCxvQ0FBZ0M7QUFDaEMsb0VBQTJDO0FBQzNDLDJDQUFpRDtBQUNqRCxnREFNNEI7QUFDNUIsNkRBQTZFO0FBRTdFLCtDQUFrRDtBQUNsRCxxQ0FBb0M7QUFFcEMsTUFBTSxRQUFRLEdBQWEsa0JBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtBQUNqRCxNQUFNLGFBQWEsR0FBa0IsNkJBQWEsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtBQUVoRTs7Ozs7O0dBTUc7QUFDSSxNQUFNLGlCQUFpQixHQUFHLENBQy9CLFFBQWdCLEVBQ2hCLEdBQUcsSUFBVyxFQUNGLEVBQUU7SUFDZCxJQUFJLFFBQVEsSUFBSSwrQkFBbUIsQ0FBQyxnQkFBZ0IsRUFBRTtRQUNwRCxPQUFPLElBQUksa0JBQWtCLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQTtLQUN2QztTQUFNLElBQUksUUFBUSxJQUFJLCtCQUFtQixDQUFDLGlCQUFpQixFQUFFO1FBQzVELE9BQU8sSUFBSSxlQUFlLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQTtLQUNwQztTQUFNLElBQUksUUFBUSxJQUFJLCtCQUFtQixDQUFDLGtCQUFrQixFQUFFO1FBQzdELE9BQU8sSUFBSSxnQkFBZ0IsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFBO0tBQ3JDO1NBQU0sSUFBSSxRQUFRLElBQUksK0JBQW1CLENBQUMsV0FBVyxFQUFFO1FBQ3RELE9BQU8sSUFBSSxTQUFTLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQTtLQUM5QjtJQUNELE1BQU0sSUFBSSxzQkFBYSxDQUNyQiw4Q0FBOEMsR0FBRyxRQUFRLENBQzFELENBQUE7QUFDSCxDQUFDLENBQUE7QUFoQlksUUFBQSxpQkFBaUIscUJBZ0I3QjtBQUVELE1BQWEsa0JB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QVcsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFBO1FBQzFDLE9BQU8sZUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sRUFBRSxTQUFTLENBQUMsRUFBRSxTQUFTLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQyxDQUFBO0lBQ2xFLENBQUM7SUFFRDs7T0FFRztJQUNILFdBQVc7UUFDVCxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUE7SUFDckIsQ0FBQztJQUVEOztPQUVHO0lBQ0gsU0FBUztRQUNQLE9BQVEsSUFBSSxDQUFDLFNBQVMsRUFBMkIsQ0FBQyxTQUFTLEVBQUUsQ0FBQTtJQUMvRCxDQUFDO0lBRUQ7Ozs7OztPQU1HO0lBQ0gsWUFDRSxTQUFhLFNBQVMsRUFDdEIsWUFBc0IsU0FBUyxFQUMvQixXQUFlLFNBQVMsRUFDeEIsWUFBb0IsU0FBUyxFQUM3QixNQUFpQixTQUFTO1FBRTFCLEtBQUssQ0FBQyxJQUFJLGtCQUFrQixDQUFDLE1BQU0sRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUE7UUF2RjdELGNBQVMsR0FBRyxXQUFXLENBQUE7UUFDdkIsWUFBTyxHQUFHLCtCQUFtQixDQUFDLFdBQVcsQ0FBQTtRQWlCekMsUUFBRyxHQUFjLElBQUksa0JBQVMsRUFBRSxDQUFBO1FBc0V4QyxJQUFJLE9BQU8sR0FBRyxLQUFLLFdBQVc7WUFBRSxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQTtJQUNoRCxDQUFDO0NBQ0Y7QUEzRkQsOEJBMkZDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAcGFja2FnZURvY3VtZW50YXRpb25cbiAqIEBtb2R1bGUgQVBJLVBsYXRmb3JtVk0tT3V0cHV0c1xuICovXG5pbXBvcnQgeyBCdWZmZXIgfSBmcm9tIFwiYnVmZmVyL1wiXG5pbXBvcnQgQmluVG9vbHMgZnJvbSBcIi4uLy4uL3V0aWxzL2JpbnRvb2xzXCJcbmltcG9ydCB7IFBsYXRmb3JtVk1Db25zdGFudHMgfSBmcm9tIFwiLi9jb25zdGFudHNcIlxuaW1wb3J0IHtcbiAgQmFzZU91dHB1dCxcbiAgT3V0cHV0LFxuICBTdGFuZGFyZEFtb3VudE91dHB1dCxcbiAgU3RhbmRhcmRUcmFuc2ZlcmFibGVPdXRwdXQsXG4gIFN0YW5kYXJkUGFyc2VhYmxlT3V0cHV0XG59IGZyb20gXCIuLi8uLi9jb21tb24vb3V0cHV0XCJcbmltcG9ydCB7IFNlcmlhbGl6YXRpb24sIFNlcmlhbGl6ZWRFbmNvZGluZyB9IGZyb20gXCIuLi8uLi91dGlscy9zZXJpYWxpemF0aW9uXCJcbmltcG9ydCBCTiBmcm9tIFwiYm4uanNcIlxuaW1wb3J0IHsgT3V0cHV0SWRFcnJvciB9IGZyb20gXCIuLi8uLi91dGlscy9lcnJvcnNcIlxuaW1wb3J0IHsgTG9ja2VkSURzIH0gZnJvbSBcIi4vbG9ja2VkXCJcblxuY29uc3QgYmludG9vbHM6IEJpblRvb2xzID0gQmluVG9vbHMuZ2V0SW5zdGFuY2UoKVxuY29uc3Qgc2VyaWFsaXphdGlvbjogU2VyaWFsaXphdGlvbiA9IFNlcmlhbGl6YXRpb24uZ2V0SW5zdGFuY2UoKVxuXG4vKipcbiAqIFRha2VzIGEgYnVmZmVyIHJlcHJlc2VudGluZyB0aGUgb3V0cHV0IGFuZCByZXR1cm5zIHRoZSBwcm9wZXIgT3V0cHV0IGluc3RhbmNlLlxuICpcbiAqIEBwYXJhbSBvdXRwdXRpZCBBIG51bWJlciByZXByZXNlbnRpbmcgdGhlIGlucHV0SUQgcGFyc2VkIHByaW9yIHRvIHRoZSBieXRlcyBwYXNzZWQgaW5cbiAqXG4gKiBAcmV0dXJucyBBbiBpbnN0YW5jZSBvZiBhbiBbW091dHB1dF1dLWV4dGVuZGVkIGNsYXNzLlxuICovXG5leHBvcnQgY29uc3QgU2VsZWN0T3V0cHV0Q2xhc3MgPSAoXG4gIG91dHB1dGlkOiBudW1iZXIsXG4gIC4uLmFyZ3M6IGFueVtdXG4pOiBCYXNlT3V0cHV0ID0+IHtcbiAgaWYgKG91dHB1dGlkID09IFBsYXRmb3JtVk1Db25zdGFudHMuU0VDUFhGRVJPVVRQVVRJRCkge1xuICAgIHJldHVybiBuZXcgU0VDUFRyYW5zZmVyT3V0cHV0KC4uLmFyZ3MpXG4gIH0gZWxzZSBpZiAob3V0cHV0aWQgPT0gUGxhdGZvcm1WTUNvbnN0YW50cy5TRUNQT1dORVJPVVRQVVRJRCkge1xuICAgIHJldHVybiBuZXcgU0VDUE93bmVyT3V0cHV0KC4uLmFyZ3MpXG4gIH0gZWxzZSBpZiAob3V0cHV0aWQgPT0gUGxhdGZvcm1WTUNvbnN0YW50cy5TVEFLRUFCTEVMT0NLT1VUSUQpIHtcbiAgICByZXR1cm4gbmV3IFN0YWtlYWJsZUxvY2tPdXQoLi4uYXJncylcbiAgfSBlbHNlIGlmIChvdXRwdXRpZCA9PSBQbGF0Zm9ybVZNQ29uc3RhbnRzLkxPQ0tFRE9VVElEKSB7XG4gICAgcmV0dXJuIG5ldyBMb2NrZWRPdXQoLi4uYXJncylcbiAgfVxuICB0aHJvdyBuZXcgT3V0cHV0SWRFcnJvcihcbiAgICBcIkVycm9yIC0gU2VsZWN0T3V0cHV0Q2xhc3M6IHVua25vd24gb3V0cHV0aWQgXCIgKyBvdXRwdXRpZFxuICApXG59XG5cbmV4cG9ydCBjbGFzcyBUcmFuc2ZlcmFibGVPdXRwdXQgZXh0ZW5kcyBTdGFuZGFyZFRyYW5zZmVyYWJsZU91dHB1dCB7XG4gIHByb3RlY3RlZCBfdHlwZU5hbWUgPSBcIlRyYW5zZmVyYWJsZU91dHB1dFwiXG4gIHByb3RlY3RlZCBfdHlwZUlEID0gdW5kZWZpbmVkXG5cbiAgLy9zZXJpYWxpemUgaXMgaW5oZXJpdGVkXG5cbiAgZGVzZXJpYWxpemUoZmllbGRzOiBvYmplY3QsIGVuY29kaW5nOiBTZXJpYWxpemVkRW5jb2RpbmcgPSBcImhleFwiKSB7XG4gICAgc3VwZXIuZGVzZXJpYWxpemUoZmllbGRzLCBlbmNvZGluZylcbiAgICB0aGlzLm91dHB1dCA9IFNlbGVjdE91dHB1dENsYXNzKGZpZWxkc1tcIm91dHB1dFwiXVtcIl90eXBlSURcIl0pXG4gICAgdGhpcy5vdXRwdXQuZGVzZXJpYWxpemUoZmllbGRzW1wib3V0cHV0XCJdLCBlbmNvZGluZylcbiAgfVxuXG4gIGZyb21CdWZmZXIoYnl0ZXM6IEJ1ZmZlciwgb2Zmc2V0OiBudW1iZXIgPSAwKTogbnVtYmVyIHtcbiAgICB0aGlzLmFzc2V0SUQgPSBiaW50b29scy5jb3B5RnJvbShcbiAgICAgIGJ5dGVzLFxuICAgICAgb2Zmc2V0LFxuICAgICAgb2Zmc2V0ICsgUGxhdGZvcm1WTUNvbnN0YW50cy5BU1NFVElETEVOXG4gICAgKVxuICAgIG9mZnNldCArPSBQbGF0Zm9ybVZNQ29uc3RhbnRzLkFTU0VUSURMRU5cbiAgICBjb25zdCBvdXRwdXRpZDogbnVtYmVyID0gYmludG9vbHNcbiAgICAgIC5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyA0KVxuICAgICAgLnJlYWRVSW50MzJCRSgwKVxuICAgIG9mZnNldCArPSA0XG4gICAgdGhpcy5vdXRwdXQgPSBTZWxlY3RPdXRwdXRDbGFzcyhvdXRwdXRpZClcbiAgICByZXR1cm4gdGhpcy5vdXRwdXQuZnJvbUJ1ZmZlcihieXRlcywgb2Zmc2V0KVxuICB9XG5cbiAgc3RhdGljIGZyb21BcnJheShiOiBCdWZmZXIpOiBUcmFuc2ZlcmFibGVPdXRwdXRbXSB7XG4gICAgbGV0IG9mZnNldCA9IDYgLy92ZXJzaW9uICsgY291bnRlclxuICAgIGxldCBudW0gPSBiLnJlYWRVSW50MzJCRSgyKVxuICAgIGNvbnN0IHJlc3VsdDogVHJhbnNmZXJhYmxlT3V0cHV0W10gPSBbXVxuICAgIHdoaWxlIChvZmZzZXQgPCBiLmxlbmd0aCAmJiBudW0tLSA+IDApIHtcbiAgICAgIGNvbnN0IHQgPSBuZXcgVHJhbnNmZXJhYmxlT3V0cHV0KClcbiAgICAgIG9mZnNldCA9IHQuZnJvbUJ1ZmZlcihiLCBvZmZzZXQpXG4gICAgICByZXN1bHQucHVzaCh0KVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFBhcnNlYWJsZU91dHB1dCBleHRlbmRzIFN0YW5kYXJkUGFyc2VhYmxlT3V0cHV0IHtcbiAgcHJvdGVjdGVkIF90eXBlTmFtZSA9IFwiUGFyc2VhYmxlT3V0cHV0XCJcbiAgcHJvdGVjdGVkIF90eXBlSUQgPSB1bmRlZmluZWRcblxuICAvL3NlcmlhbGl6ZSBpcyBpbmhlcml0ZWRcblxuICBkZXNlcmlhbGl6ZShmaWVsZHM6IG9iamVjdCwgZW5jb2Rpbmc6IFNlcmlhbGl6ZWRFbmNvZGluZyA9IFwiaGV4XCIpIHtcbiAgICBzdXBlci5kZXNlcmlhbGl6ZShmaWVsZHMsIGVuY29kaW5nKVxuICAgIHRoaXMub3V0cHV0ID0gU2VsZWN0T3V0cHV0Q2xhc3MoZmllbGRzW1wib3V0cHV0XCJdW1wiX3R5cGVJRFwiXSlcbiAgICB0aGlzLm91dHB1dC5kZXNlcmlhbGl6ZShmaWVsZHNbXCJvdXRwdXRcIl0sIGVuY29kaW5nKVxuICB9XG5cbiAgZnJvbUJ1ZmZlcihieXRlczogQnVmZmVyLCBvZmZzZXQ6IG51bWJlciA9IDApOiBudW1iZXIge1xuICAgIGNvbnN0IG91dHB1dGlkOiBudW1iZXIgPSBiaW50b29sc1xuICAgICAgLmNvcHlGcm9tKGJ5dGVzLCBvZmZzZXQsIG9mZnNldCArIDQpXG4gICAgICAucmVhZFVJbnQzMkJFKDApXG4gICAgb2Zmc2V0ICs9IDRcbiAgICB0aGlzLm91dHB1dCA9IFNlbGVjdE91dHB1dENsYXNzKG91dHB1dGlkKVxuICAgIHJldHVybiB0aGlzLm91dHB1dC5mcm9tQnVmZmVyKGJ5dGVzLCBvZmZzZXQpXG4gIH1cbn1cblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEFtb3VudE91dHB1dCBleHRlbmRzIFN0YW5kYXJkQW1vdW50T3V0cHV0IHtcbiAgcHJvdGVjdGVkIF90eXBlTmFtZSA9IFwiQW1vdW50T3V0cHV0XCJcbiAgcHJvdGVjdGVkIF90eXBlSUQgPSB1bmRlZmluZWRcblxuICAvL3NlcmlhbGl6ZSBhbmQgZGVzZXJpYWxpemUgYm90aCBhcmUgaW5oZXJpdGVkXG5cbiAgLyoqXG4gICAqIEBwYXJhbSBhc3NldElEIEFuIGFzc2V0SUQgd2hpY2ggaXMgd3JhcHBlZCBhcm91bmQgdGhlIEJ1ZmZlciBvZiB0aGUgT3V0cHV0XG4gICAqL1xuICBtYWtlVHJhbnNmZXJhYmxlKGFzc2V0SUQ6IEJ1ZmZlcik6IFRyYW5zZmVyYWJsZU91dHB1dCB7XG4gICAgcmV0dXJuIG5ldyBUcmFuc2ZlcmFibGVPdXRwdXQoYXNzZXRJRCwgdGhpcylcbiAgfVxufVxuXG4vKipcbiAqIEFuIFtbT3V0cHV0XV0gY2xhc3Mgd2hpY2ggc3BlY2lmaWVzIGFuIE91dHB1dCB0aGF0IGNhcnJpZXMgYW4gYW1tb3VudCBmb3IgYW4gYXNzZXRJRCBhbmQgdXNlcyBzZWNwMjU2azEgc2lnbmF0dXJlIHNjaGVtZS5cbiAqL1xuZXhwb3J0IGNsYXNzIFNFQ1BUcmFuc2Zlck91dHB1dCBleHRlbmRzIEFtb3VudE91dHB1dCB7XG4gIHByb3RlY3RlZCBfdHlwZU5hbWUgPSBcIlNFQ1BUcmFuc2Zlck91dHB1dFwiXG4gIHByb3RlY3RlZCBfdHlwZUlEID0gUGxhdGZvcm1WTUNvbnN0YW50cy5TRUNQWEZFUk9VVFBVVElEXG5cbiAgLy9zZXJpYWxpemUgYW5kIGRlc2VyaWFsaXplIGJvdGggYXJlIGluaGVyaXRlZFxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBvdXRwdXRJRCBmb3IgdGhpcyBvdXRwdXRcbiAgICovXG4gIGdldE91dHB1dElEKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX3R5cGVJRFxuICB9XG5cbiAgY3JlYXRlKC4uLmFyZ3M6IGFueVtdKTogdGhpcyB7XG4gICAgcmV0dXJuIG5ldyBTRUNQVHJhbnNmZXJPdXRwdXQoLi4uYXJncykgYXMgdGhpc1xuICB9XG5cbiAgY2xvbmUoKTogdGhpcyB7XG4gICAgY29uc3QgbmV3b3V0OiBTRUNQVHJhbnNmZXJPdXRwdXQgPSB0aGlzLmNyZWF0ZSgpXG4gICAgbmV3b3V0LmZyb21CdWZmZXIodGhpcy50b0J1ZmZlcigpKVxuICAgIHJldHVybiBuZXdvdXQgYXMgdGhpc1xuICB9XG59XG5cbi8qKlxuICogQW4gW1tPdXRwdXRdXSBjbGFzcyB3aGljaCBzcGVjaWZpZXMgYW4gb3V0cHV0IHRoYXQgaGFzIGEgbG9ja3RpbWUgd2hpY2ggY2FuIGFsc28gZW5hYmxlXG4gKiBzdGFraW5nIG9mIHRoZSB2YWx1ZSBoZWxkLCBwcmV2ZW50aW5nIHRyYW5zZmVycyBidXQgbm90IHZhbGlkYXRpb24uXG4gKi9cbmV4cG9ydCBjbGFzcyBTdGFrZWFibGVMb2NrT3V0IGV4dGVuZHMgUGFyc2VhYmxlT3V0cHV0IHtcbiAgcHJvdGVjdGVkIF90eXBlTmFtZSA9IFwiU3Rha2VhYmxlTG9ja091dFwiXG4gIHByb3RlY3RlZCBfdHlwZUlEID0gUGxhdGZvcm1WTUNvbnN0YW50cy5TVEFLRUFCTEVMT0NLT1VUSURcblxuICAvL3NlcmlhbGl6ZSBhbmQgZGVzZXJpYWxpemUgYm90aCBhcmUgaW5oZXJpdGVkXG4gIHNlcmlhbGl6ZShlbmNvZGluZzogU2VyaWFsaXplZEVuY29kaW5nID0gXCJoZXhcIik6IG9iamVjdCB7XG4gICAgbGV0IGZpZWxkczogb2JqZWN0ID0gc3VwZXIuc2VyaWFsaXplKGVuY29kaW5nKVxuICAgIGxldCBvdXRvYmo6IG9iamVjdCA9IHtcbiAgICAgIC4uLmZpZWxkcyxcbiAgICAgIHN0YWtlYWJsZUxvY2t0aW1lOiBzZXJpYWxpemF0aW9uLmVuY29kZXIoXG4gICAgICAgIHRoaXMuc3Rha2VhYmxlTG9ja3RpbWUsXG4gICAgICAgIGVuY29kaW5nLFxuICAgICAgICBcIkJ1ZmZlclwiLFxuICAgICAgICBcImRlY2ltYWxTdHJpbmdcIixcbiAgICAgICAgOFxuICAgICAgKVxuICAgIH1cbiAgICByZXR1cm4gb3V0b2JqXG4gIH1cbiAgZGVzZXJpYWxpemUoZmllbGRzOiBvYmplY3QsIGVuY29kaW5nOiBTZXJpYWxpemVkRW5jb2RpbmcgPSBcImhleFwiKSB7XG4gICAgc3VwZXIuZGVzZXJpYWxpemUoZmllbGRzLCBlbmNvZGluZylcbiAgICB0aGlzLnN0YWtlYWJsZUxvY2t0aW1lID0gc2VyaWFsaXphdGlvbi5kZWNvZGVyKFxuICAgICAgZmllbGRzW1wic3Rha2VhYmxlTG9ja3RpbWVcIl0sXG4gICAgICBlbmNvZGluZyxcbiAgICAgIFwiZGVjaW1hbFN0cmluZ1wiLFxuICAgICAgXCJCdWZmZXJcIixcbiAgICAgIDhcbiAgICApXG4gIH1cblxuICBwcm90ZWN0ZWQgc3Rha2VhYmxlTG9ja3RpbWU6IEJ1ZmZlclxuXG4gIGdldFN0YWtlYWJsZUxvY2t0aW1lKCk6IEJOIHtcbiAgICByZXR1cm4gYmludG9vbHMuZnJvbUJ1ZmZlclRvQk4odGhpcy5zdGFrZWFibGVMb2NrdGltZSlcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0gYXNzZXRJRCBBbiBhc3NldElEIHdoaWNoIGlzIHdyYXBwZWQgYXJvdW5kIHRoZSBCdWZmZXIgb2YgdGhlIE91dHB1dFxuICAgKi9cbiAgbWFrZVRyYW5zZmVyYWJsZShhc3NldElEOiBCdWZmZXIpOiBUcmFuc2ZlcmFibGVPdXRwdXQge1xuICAgIHJldHVybiBuZXcgVHJhbnNmZXJhYmxlT3V0cHV0KGFzc2V0SUQsIHRoaXMpXG4gIH1cblxuICAvKipcbiAgICogUG9wdWF0ZXMgdGhlIGluc3RhbmNlIGZyb20gYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSByZXByZXNlbnRpbmcgdGhlIFtbU3Rha2VhYmxlTG9ja091dF1dIGFuZCByZXR1cm5zIHRoZSBzaXplIG9mIHRoZSBvdXRwdXQuXG4gICAqL1xuICBmcm9tQnVmZmVyKG91dGJ1ZmY6IEJ1ZmZlciwgb2Zmc2V0OiBudW1iZXIgPSAwKTogbnVtYmVyIHtcbiAgICB0aGlzLnN0YWtlYWJsZUxvY2t0aW1lID0gYmludG9vbHMuY29weUZyb20ob3V0YnVmZiwgb2Zmc2V0LCBvZmZzZXQgKyA4KVxuICAgIG9mZnNldCArPSA4XG4gICAgb2Zmc2V0ID0gc3VwZXIuZnJvbUJ1ZmZlcihvdXRidWZmLCBvZmZzZXQpXG4gICAgcmV0dXJuIG9mZnNldFxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGJ1ZmZlciByZXByZXNlbnRpbmcgdGhlIFtbU3Rha2VhYmxlTG9ja091dF1dIGluc3RhbmNlLlxuICAgKi9cbiAgdG9CdWZmZXIoKTogQnVmZmVyIHtcbiAgICBjb25zdCBzdXBlckJ1ZiA9IHN1cGVyLnRvQnVmZmVyKClcbiAgICByZXR1cm4gQnVmZmVyLmNvbmNhdChcbiAgICAgIFt0aGlzLnN0YWtlYWJsZUxvY2t0aW1lLCBzdXBlckJ1Zl0sXG4gICAgICBzdXBlckJ1Zi5sZW5ndGggKyA4XG4gICAgKVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIG91dHB1dElEIGZvciB0aGlzIG91dHB1dFxuICAgKi9cbiAgZ2V0T3V0cHV0SUQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fdHlwZUlEXG4gIH1cblxuICBjcmVhdGUoLi4uYXJnczogYW55W10pOiB0aGlzIHtcbiAgICByZXR1cm4gbmV3IFN0YWtlYWJsZUxvY2tPdXQoLi4uYXJncykgYXMgdGhpc1xuICB9XG5cbiAgY2xvbmUoKTogdGhpcyB7XG4gICAgY29uc3QgbmV3b3V0OiBTdGFrZWFibGVMb2NrT3V0ID0gdGhpcy5jcmVhdGUoKVxuICAgIG5ld291dC5mcm9tQnVmZmVyKHRoaXMudG9CdWZmZXIoKSlcbiAgICByZXR1cm4gbmV3b3V0IGFzIHRoaXNcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBhbW91bnQgZnJvbSB0aGUgdW5kZXJseWluZyBvdXRwdXRcbiAgICovXG4gIGdldEFtb3VudCgpOiBCTiB7XG4gICAgcmV0dXJuICh0aGlzLmdldE91dHB1dCgpIGFzIFN0YW5kYXJkQW1vdW50T3V0cHV0KS5nZXRBbW91bnQoKVxuICB9XG5cbiAgLyoqXG4gICAqIEJhY2t3YXJkcyBjb21wYXRpYmlsaXR5XG4gICAqL1xuICBnZXRUcmFuc2ZlcmFibGVPdXRwdXQoKTogUGFyc2VhYmxlT3V0cHV0IHtcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLyoqXG4gICAqIEEgW1tPdXRwdXRdXSBjbGFzcyB3aGljaCBzcGVjaWZpZXMgYSBbW1BhcnNlYWJsZU91dHB1dF1dIHRoYXQgaGFzIGEgbG9ja3RpbWUgd2hpY2ggY2FuIGFsc29cbiAgICogZW5hYmxlIHN0YWtpbmcgb2YgdGhlIHZhbHVlIGhlbGQsIHByZXZlbnRpbmcgdHJhbnNmZXJzIGJ1dCBub3QgdmFsaWRhdGlvbi5cbiAgICpcbiAgICogQHBhcmFtIGFtb3VudCBBIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vaW5kdXRueS9ibi5qcy98Qk59IHJlcHJlc2VudGluZyB0aGUgYW1vdW50IGluIHRoZSBvdXRwdXRcbiAgICogQHBhcmFtIGFkZHJlc3NlcyBBbiBhcnJheSBvZiB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfXMgcmVwcmVzZW50aW5nIGFkZHJlc3Nlc1xuICAgKiBAcGFyYW0gbG9ja3RpbWUgQSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2luZHV0bnkvYm4uanMvfEJOfSByZXByZXNlbnRpbmcgdGhlIGxvY2t0aW1lXG4gICAqIEBwYXJhbSB0aHJlc2hvbGQgQSBudW1iZXIgcmVwcmVzZW50aW5nIHRoZSB0aGUgdGhyZXNob2xkIG51bWJlciBvZiBzaWduZXJzIHJlcXVpcmVkIHRvIHNpZ24gdGhlIHRyYW5zYWN0aW9uXG4gICAqIEBwYXJhbSBzdGFrZWFibGVMb2NrdGltZSBBIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vaW5kdXRueS9ibi5qcy98Qk59IHJlcHJlc2VudGluZyB0aGUgc3Rha2VhYmxlIGxvY2t0aW1lXG4gICAqIEBwYXJhbSBvdXRwdXQgQSBbW0Jhc2VPdXRwdXRdXSB3aGljaCBpcyBlbWJlZGRlZCBpbnRvIHRoaXMgb3V0cHV0LlxuICAgKi9cbiAgY29uc3RydWN0b3IoXG4gICAgYW1vdW50OiBCTiA9IHVuZGVmaW5lZCxcbiAgICBhZGRyZXNzZXM6IEJ1ZmZlcltdID0gdW5kZWZpbmVkLFxuICAgIGxvY2t0aW1lOiBCTiA9IHVuZGVmaW5lZCxcbiAgICB0aHJlc2hvbGQ6IG51bWJlciA9IHVuZGVmaW5lZCxcbiAgICBzdGFrZWFibGVMb2NrdGltZTogQk4gPSB1bmRlZmluZWQsXG4gICAgb3V0cHV0OiBQYXJzZWFibGVPdXRwdXQgPSB1bmRlZmluZWRcbiAgKSB7XG4gICAgc3VwZXIoXG4gICAgICBvdXRwdXRcbiAgICAgICAgPyBvdXRwdXQuZ2V0T3V0cHV0KClcbiAgICAgICAgOiBuZXcgU0VDUFRyYW5zZmVyT3V0cHV0KGFtb3VudCwgYWRkcmVzc2VzLCBsb2NrdGltZSwgdGhyZXNob2xkKVxuICAgIClcbiAgICBpZiAodHlwZW9mIHN0YWtlYWJsZUxvY2t0aW1lICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICB0aGlzLnN0YWtlYWJsZUxvY2t0aW1lID0gYmludG9vbHMuZnJvbUJOVG9CdWZmZXIoc3Rha2VhYmxlTG9ja3RpbWUsIDgpXG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQW4gW1tPdXRwdXRdXSBjbGFzcyB3aGljaCBvbmx5IHNwZWNpZmllcyBhbiBPdXRwdXQgb3duZXJzaGlwIGFuZCB1c2VzIHNlY3AyNTZrMSBzaWduYXR1cmUgc2NoZW1lLlxuICovXG5leHBvcnQgY2xhc3MgU0VDUE93bmVyT3V0cHV0IGV4dGVuZHMgT3V0cHV0IHtcbiAgcHJvdGVjdGVkIF90eXBlTmFtZSA9IFwiU0VDUE93bmVyT3V0cHV0XCJcbiAgcHJvdGVjdGVkIF90eXBlSUQgPSBQbGF0Zm9ybVZNQ29uc3RhbnRzLlNFQ1BPV05FUk9VVFBVVElEXG5cbiAgLy9zZXJpYWxpemUgYW5kIGRlc2VyaWFsaXplIGJvdGggYXJlIGluaGVyaXRlZFxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBvdXRwdXRJRCBmb3IgdGhpcyBvdXRwdXRcbiAgICovXG4gIGdldE91dHB1dElEKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX3R5cGVJRFxuICB9XG5cbiAgLyoqXG4gICAqXG4gICAqIEBwYXJhbSBhc3NldElEIEFuIGFzc2V0SUQgd2hpY2ggaXMgd3JhcHBlZCBhcm91bmQgdGhlIEJ1ZmZlciBvZiB0aGUgT3V0cHV0XG4gICAqL1xuICBtYWtlVHJhbnNmZXJhYmxlKGFzc2V0SUQ6IEJ1ZmZlcik6IFRyYW5zZmVyYWJsZU91dHB1dCB7XG4gICAgcmV0dXJuIG5ldyBUcmFuc2ZlcmFibGVPdXRwdXQoYXNzZXRJRCwgdGhpcylcbiAgfVxuXG4gIGNyZWF0ZSguLi5hcmdzOiBhbnlbXSk6IHRoaXMge1xuICAgIHJldHVybiBuZXcgU0VDUE93bmVyT3V0cHV0KC4uLmFyZ3MpIGFzIHRoaXNcbiAgfVxuXG4gIGNsb25lKCk6IHRoaXMge1xuICAgIGNvbnN0IG5ld291dDogU0VDUE93bmVyT3V0cHV0ID0gdGhpcy5jcmVhdGUoKVxuICAgIG5ld291dC5mcm9tQnVmZmVyKHRoaXMudG9CdWZmZXIoKSlcbiAgICByZXR1cm4gbmV3b3V0IGFzIHRoaXNcbiAgfVxufVxuXG4vKipcbiAqIEFuIFtbT3V0cHV0XV0gY2xhc3Mgd2hpY2ggc3BlY2lmaWVzIGFuIG91dHB1dCB0aGF0IGlzIGNvbnRyb2xsZWQgYnkgZGVwb3NpdCBhbmQgYm9uZCB0eC5cbiAqL1xuZXhwb3J0IGNsYXNzIExvY2tlZE91dCBleHRlbmRzIFBhcnNlYWJsZU91dHB1dCB7XG4gIHByb3RlY3RlZCBfdHlwZU5hbWUgPSBcIkxvY2tlZE91dFwiXG4gIHByb3RlY3RlZCBfdHlwZUlEID0gUGxhdGZvcm1WTUNvbnN0YW50cy5MT0NLRURPVVRJRFxuXG4gIC8vc2VyaWFsaXplIGFuZCBkZXNlcmlhbGl6ZSBib3RoIGFyZSBpbmhlcml0ZWRcbiAgc2VyaWFsaXplKGVuY29kaW5nOiBTZXJpYWxpemVkRW5jb2RpbmcgPSBcImhleFwiKTogb2JqZWN0IHtcbiAgICBsZXQgZmllbGRzOiBvYmplY3QgPSBzdXBlci5zZXJpYWxpemUoZW5jb2RpbmcpXG4gICAgbGV0IG91dG9iajogb2JqZWN0ID0ge1xuICAgICAgLi4uZmllbGRzLFxuICAgICAgaWRzOiB0aGlzLmlkcy5zZXJpYWxpemUoKVxuICAgIH1cbiAgICByZXR1cm4gb3V0b2JqXG4gIH1cblxuICBkZXNlcmlhbGl6ZShmaWVsZHM6IG9iamVjdCwgZW5jb2Rpbmc6IFNlcmlhbGl6ZWRFbmNvZGluZyA9IFwiaGV4XCIpIHtcbiAgICBzdXBlci5kZXNlcmlhbGl6ZShmaWVsZHMsIGVuY29kaW5nKVxuICAgIHRoaXMuaWRzLmRlc2VyaWFsaXplKGZpZWxkc1tcImlkc1wiXSwgZW5jb2RpbmcpXG4gIH1cblxuICBwcm90ZWN0ZWQgaWRzOiBMb2NrZWRJRHMgPSBuZXcgTG9ja2VkSURzKClcblxuICBnZXRMb2NrZWRJRHMoKTogTG9ja2VkSURzIHtcbiAgICByZXR1cm4gdGhpcy5pZHNcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0gYXNzZXRJRCBBbiBhc3NldElEIHdoaWNoIGlzIHdyYXBwZWQgYXJvdW5kIHRoZSBCdWZmZXIgb2YgdGhlIE91dHB1dFxuICAgKi9cbiAgbWFrZVRyYW5zZmVyYWJsZShhc3NldElEOiBCdWZmZXIpOiBUcmFuc2ZlcmFibGVPdXRwdXQge1xuICAgIHJldHVybiBuZXcgVHJhbnNmZXJhYmxlT3V0cHV0KGFzc2V0SUQsIHRoaXMpXG4gIH1cblxuICBjcmVhdGUoLi4uYXJnczogYW55W10pOiB0aGlzIHtcbiAgICByZXR1cm4gbmV3IExvY2tlZE91dCguLi5hcmdzKSBhcyB0aGlzXG4gIH1cblxuICBjbG9uZSgpOiB0aGlzIHtcbiAgICBjb25zdCBuZXdvdXQ6IExvY2tlZE91dCA9IHRoaXMuY3JlYXRlKClcbiAgICBuZXdvdXQuZnJvbUJ1ZmZlcih0aGlzLnRvQnVmZmVyKCkpXG4gICAgcmV0dXJuIG5ld291dCBhcyB0aGlzXG4gIH1cblxuICAvKipcbiAgICogUG9wdWF0ZXMgdGhlIGluc3RhbmNlIGZyb20gYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSByZXByZXNlbnRpbmcgdGhlIFtbTG9ja2VkT3V0XV0gYW5kIHJldHVybnMgdGhlIHNpemUgb2YgdGhlIG91dHB1dC5cbiAgICovXG4gIGZyb21CdWZmZXIob3V0YnVmZjogQnVmZmVyLCBvZmZzZXQ6IG51bWJlciA9IDApOiBudW1iZXIge1xuICAgIG9mZnNldCA9IHRoaXMuaWRzLmZyb21CdWZmZXIob3V0YnVmZiwgb2Zmc2V0KVxuICAgIG9mZnNldCA9IHN1cGVyLmZyb21CdWZmZXIob3V0YnVmZiwgb2Zmc2V0KVxuICAgIHJldHVybiBvZmZzZXRcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBidWZmZXIgcmVwcmVzZW50aW5nIHRoZSBbW0xvY2tlZE91dF1dIGluc3RhbmNlLlxuICAgKi9cbiAgdG9CdWZmZXIoKTogQnVmZmVyIHtcbiAgICBjb25zdCBpZHNCdWY6IEJ1ZmZlciA9IHRoaXMuaWRzLnRvQnVmZmVyKClcbiAgICBjb25zdCBzdXBlckJ1ZmY6IEJ1ZmZlciA9IHN1cGVyLnRvQnVmZmVyKClcbiAgICByZXR1cm4gQnVmZmVyLmNvbmNhdChbaWRzQnVmLCBzdXBlckJ1ZmZdLCBzdXBlckJ1ZmYubGVuZ3RoICsgNjQpXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgb3V0cHV0SUQgZm9yIHRoaXMgb3V0cHV0XG4gICAqL1xuICBnZXRPdXRwdXRJRCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl90eXBlSURcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBhbW91bnQgZnJvbSB0aGUgdW5kZXJseWluZyBvdXRwdXRcbiAgICovXG4gIGdldEFtb3VudCgpOiBCTiB7XG4gICAgcmV0dXJuICh0aGlzLmdldE91dHB1dCgpIGFzIFN0YW5kYXJkQW1vdW50T3V0cHV0KS5nZXRBbW91bnQoKVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSBhbW91bnQgQSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2luZHV0bnkvYm4uanMvfEJOfSByZXByZXNlbnRpbmcgdGhlIGFtb3VudCBpbiB0aGUgb3V0cHV0XG4gICAqIEBwYXJhbSBhZGRyZXNzZXMgQW4gYXJyYXkgb2Yge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn1zIHJlcHJlc2VudGluZyBhZGRyZXNzZXNcbiAgICogQHBhcmFtIGxvY2t0aW1lIEEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9pbmR1dG55L2JuLmpzL3xCTn0gcmVwcmVzZW50aW5nIHRoZSBsb2NrdGltZVxuICAgKiBAcGFyYW0gdGhyZXNob2xkIEEgbnVtYmVyIHJlcHJlc2VudGluZyB0aGUgdGhlIHRocmVzaG9sZCBudW1iZXIgb2Ygc2lnbmVycyByZXF1aXJlZCB0byBzaWduIHRoZSB0cmFuc2FjdGlvblxuICAgKiBAcGFyYW0gaWRzIExvY2tJRHMgc2V0IG9mIGRlcG9zaXQgYW5kIGJvbmQgdHhJRHNcbiAgICovXG4gIGNvbnN0cnVjdG9yKFxuICAgIGFtb3VudDogQk4gPSB1bmRlZmluZWQsXG4gICAgYWRkcmVzc2VzOiBCdWZmZXJbXSA9IHVuZGVmaW5lZCxcbiAgICBsb2NrdGltZTogQk4gPSB1bmRlZmluZWQsXG4gICAgdGhyZXNob2xkOiBudW1iZXIgPSB1bmRlZmluZWQsXG4gICAgaWRzOiBMb2NrZWRJRHMgPSB1bmRlZmluZWRcbiAgKSB7XG4gICAgc3VwZXIobmV3IFNFQ1BUcmFuc2Zlck91dHB1dChhbW91bnQsIGFkZHJlc3NlcywgbG9ja3RpbWUsIHRocmVzaG9sZCkpXG4gICAgaWYgKHR5cGVvZiBpZHMgIT09IFwidW5kZWZpbmVkXCIpIHRoaXMuaWRzID0gaWRzXG4gIH1cbn1cbiJdfQ==
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LockedIn = exports.StakeableLockIn = exports.SECPTransferInput = exports.AmountInput = exports.TransferableInput = exports.ParseableInput = exports.SelectInputClass = void 0;
/**
 * @packageDocumentation
 * @module API-PlatformVM-Inputs
 */
const buffer_1 = require("buffer/");
const bintools_1 = __importDefault(require("../../utils/bintools"));
const constants_1 = require("./constants");
const input_1 = require("../../common/input");
const serialization_1 = require("../../utils/serialization");
const errors_1 = require("../../utils/errors");
const locked_1 = require("./locked");
/**
 * @ignore
 */
const bintools = bintools_1.default.getInstance();
const serialization = serialization_1.Serialization.getInstance();
/**
 * Takes a buffer representing the output and returns the proper [[Input]] instance.
 *
 * @param inputid A number representing the inputID parsed prior to the bytes passed in
 *
 * @returns An instance of an [[Input]]-extended class.
 */
const SelectInputClass = (inputid, ...args) => {
    if (inputid === constants_1.PlatformVMConstants.SECPINPUTID) {
        return new SECPTransferInput(...args);
    }
    else if (inputid === constants_1.PlatformVMConstants.STAKEABLELOCKINID) {
        return new StakeableLockIn(...args);
    }
    else if (inputid === constants_1.PlatformVMConstants.LOCKEDINID) {
        return new LockedIn(...args);
    }
    /* istanbul ignore next */
    throw new errors_1.InputIdError("Error - SelectInputClass: unknown inputid");
};
exports.SelectInputClass = SelectInputClass;
class ParseableInput extends input_1.StandardParseableInput {
    constructor() {
        super(...arguments);
        this._typeName = "ParseableInput";
        this._typeID = undefined;
    }
    //serialize is inherited
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        this.input = (0, exports.SelectInputClass)(fields["input"]["_typeID"]);
        this.input.deserialize(fields["input"], encoding);
    }
    fromBuffer(bytes, offset = 0) {
        const inputid = bintools
            .copyFrom(bytes, offset, offset + 4)
            .readUInt32BE(0);
        offset += 4;
        this.input = (0, exports.SelectInputClass)(inputid);
        return this.input.fromBuffer(bytes, offset);
    }
}
exports.ParseableInput = ParseableInput;
class TransferableInput extends input_1.StandardTransferableInput {
    constructor() {
        super(...arguments);
        this._typeName = "TransferableInput";
        this._typeID = undefined;
    }
    //serialize is inherited
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        this.input = (0, exports.SelectInputClass)(fields["input"]["_typeID"]);
        this.input.deserialize(fields["input"], encoding);
    }
    /**
     * Takes a {@link https://github.com/feross/buffer|Buffer} containing a [[TransferableInput]], parses it, populates the class, and returns the length of the [[TransferableInput]] in bytes.
     *
     * @param bytes A {@link https://github.com/feross/buffer|Buffer} containing a raw [[TransferableInput]]
     *
     * @returns The length of the raw [[TransferableInput]]
     */
    fromBuffer(bytes, offset = 0) {
        this.txid = bintools.copyFrom(bytes, offset, offset + 32);
        offset += 32;
        this.outputidx = bintools.copyFrom(bytes, offset, offset + 4);
        offset += 4;
        this.assetID = bintools.copyFrom(bytes, offset, offset + constants_1.PlatformVMConstants.ASSETIDLEN);
        offset += 32;
        const inputid = bintools
            .copyFrom(bytes, offset, offset + 4)
            .readUInt32BE(0);
        offset += 4;
        this.input = (0, exports.SelectInputClass)(inputid);
        return this.input.fromBuffer(bytes, offset);
    }
    static fromArray(b) {
        let offset = 6; //version + counter
        let num = b.readUInt32BE(2);
        const result = [];
        while (offset < b.length && num-- > 0) {
            const t = new TransferableInput();
            offset = t.fromBuffer(b, offset);
            result.push(t);
        }
        return result;
    }
}
exports.TransferableInput = TransferableInput;
class AmountInput extends input_1.StandardAmountInput {
    constructor() {
        super(...arguments);
        this._typeName = "AmountInput";
        this._typeID = undefined;
    }
    //serialize and deserialize both are inherited
    select(id, ...args) {
        return (0, exports.SelectInputClass)(id, ...args);
    }
}
exports.AmountInput = AmountInput;
class SECPTransferInput extends AmountInput {
    constructor() {
        super(...arguments);
        this._typeName = "SECPTransferInput";
        this._typeID = constants_1.PlatformVMConstants.SECPINPUTID;
        this.getCredentialID = () => constants_1.PlatformVMConstants.SECPCREDENTIAL;
    }
    //serialize and deserialize both are inherited
    /**
     * Returns the inputID for this input
     */
    getInputID() {
        return this._typeID;
    }
    create(...args) {
        return new SECPTransferInput(...args);
    }
    clone() {
        const newout = this.create();
        newout.fromBuffer(this.toBuffer());
        return newout;
    }
}
exports.SECPTransferInput = SECPTransferInput;
/**
 * An [[Input]] class which specifies an input that has a locktime which can also
 * enable staking of the value held, preventing transfers but not validation.
 */
class StakeableLockIn extends ParseableInput {
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
     * Returns the inputID for this input
     */
    getInputID() {
        return this._typeID;
    }
    create(...args) {
        return new StakeableLockIn(...args);
    }
    clone() {
        const newout = this.create();
        newout.fromBuffer(this.toBuffer());
        return newout;
    }
    /**
     * Returns the amount from the underlying input
     */
    getAmount() {
        return this.getInput().getAmount();
    }
    /**
     * Backwards compatibility
     */
    getTransferableInput() {
        return this;
    }
    /**
     * A [[Input]] class which specifies an [[Input]] that has a locktime which can also
     * enable staking of the value held, preventing transfers but not validation.
     *
     * @param amount A {@link https://github.com/indutny/bn.js/|BN} representing the amount in the input
     * @param stakeableLocktime A {@link https://github.com/indutny/bn.js/|BN} representing the stakeable locktime
     * @param transferableInput A [[ParseableInput]] which is embedded into this input.
     */
    constructor(amount = undefined, stakeableLocktime = undefined, transferableInput = undefined) {
        super(typeof transferableInput !== "undefined"
            ? transferableInput.getInput()
            : new SECPTransferInput(amount));
        this._typeName = "StakeableLockIn";
        this._typeID = constants_1.PlatformVMConstants.STAKEABLELOCKOUTID;
        this.getCredentialID = () => constants_1.PlatformVMConstants.SECPCREDENTIAL;
        if (typeof stakeableLocktime !== "undefined") {
            this.stakeableLocktime = bintools.fromBNToBuffer(stakeableLocktime, 8);
        }
    }
}
exports.StakeableLockIn = StakeableLockIn;
/**
 * An [[Input]] class which specifies an input that is controlled by deposit and bond tx.
 */
class LockedIn extends ParseableInput {
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
    create(...args) {
        return new LockedIn(...args);
    }
    clone() {
        const newout = this.create();
        newout.fromBuffer(this.toBuffer());
        return newout;
    }
    /**
     * Popuates the instance from a {@link https://github.com/feross/buffer|Buffer}
     * representing the [[LockedIn]] and returns the size of the input.
     */
    fromBuffer(outbuff, offset = 0) {
        offset = this.ids.fromBuffer(outbuff, offset);
        offset = super.fromBuffer(outbuff, offset);
        return offset;
    }
    /**
     * Returns the buffer representing the [[LockedIn]] instance.
     */
    toBuffer() {
        const idsBuf = this.ids.toBuffer();
        const superBuff = super.toBuffer();
        return buffer_1.Buffer.concat([idsBuf, superBuff], superBuff.length + 64);
    }
    /**
     * Returns the inputID for this input
     */
    getInputID() {
        return this._typeID;
    }
    /**
     * Returns the amount from the underlying input
     */
    getAmount() {
        return this.getInput().getAmount();
    }
    /**
     * An [[Input]] class which specifies an input that is controlled by deposit and bond tx.
     *
     * @param amount A {@link https://github.com/indutny/bn.js/|BN} representing the amount in the input
     */
    constructor(amount = undefined) {
        super(new SECPTransferInput(amount));
        this._typeName = "LockedIn";
        this._typeID = constants_1.PlatformVMConstants.LOCKEDINID;
        this.ids = new locked_1.LockedIDs();
        /**
         * Returns the credentialID for this input
         */
        this.getCredentialID = () => constants_1.PlatformVMConstants.SECPCREDENTIAL;
    }
}
exports.LockedIn = LockedIn;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5wdXRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2FwaXMvcGxhdGZvcm12bS9pbnB1dHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7OztHQUdHO0FBQ0gsb0NBQWdDO0FBQ2hDLG9FQUEyQztBQUMzQywyQ0FBaUQ7QUFDakQsOENBSzJCO0FBQzNCLDZEQUE2RTtBQUU3RSwrQ0FBaUQ7QUFDakQscUNBQW9DO0FBRXBDOztHQUVHO0FBQ0gsTUFBTSxRQUFRLEdBQWEsa0JBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtBQUNqRCxNQUFNLGFBQWEsR0FBa0IsNkJBQWEsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtBQUVoRTs7Ozs7O0dBTUc7QUFDSSxNQUFNLGdCQUFnQixHQUFHLENBQzlCLE9BQWUsRUFDZixHQUFHLElBQVcsRUFDSCxFQUFFO0lBQ2IsSUFBSSxPQUFPLEtBQUssK0JBQW1CLENBQUMsV0FBVyxFQUFFO1FBQy9DLE9BQU8sSUFBSSxpQkFBaUIsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFBO0tBQ3RDO1NBQU0sSUFBSSxPQUFPLEtBQUssK0JBQW1CLENBQUMsaUJBQWlCLEVBQUU7UUFDNUQsT0FBTyxJQUFJLGVBQWUsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFBO0tBQ3BDO1NBQU0sSUFBSSxPQUFPLEtBQUssK0JBQW1CLENBQUMsVUFBVSxFQUFFO1FBQ3JELE9BQU8sSUFBSSxRQUFRLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQTtLQUM3QjtJQUNELDBCQUEwQjtJQUMxQixNQUFNLElBQUkscUJBQVksQ0FBQywyQ0FBMkMsQ0FBQyxDQUFBO0FBQ3JFLENBQUMsQ0FBQTtBQWJZLFFBQUEsZ0JBQWdCLG9CQWE1QjtBQUVELE1BQWEsY0FBZSxTQUFRLDhCQUFzQjtJQUExRDs7UUFDWSxjQUFTLEdBQUcsZ0JBQWdCLENBQUE7UUFDNUIsWUFBTyxHQUFHLFNBQVMsQ0FBQTtJQWlCL0IsQ0FBQztJQWZDLHdC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NEJBaUZDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAcGFja2FnZURvY3VtZW50YXRpb25cbiAqIEBtb2R1bGUgQVBJLVBsYXRmb3JtVk0tSW5wdXRzXG4gKi9cbmltcG9ydCB7IEJ1ZmZlciB9IGZyb20gXCJidWZmZXIvXCJcbmltcG9ydCBCaW5Ub29scyBmcm9tIFwiLi4vLi4vdXRpbHMvYmludG9vbHNcIlxuaW1wb3J0IHsgUGxhdGZvcm1WTUNvbnN0YW50cyB9IGZyb20gXCIuL2NvbnN0YW50c1wiXG5pbXBvcnQge1xuICBCYXNlSW5wdXQsXG4gIFN0YW5kYXJkVHJhbnNmZXJhYmxlSW5wdXQsXG4gIFN0YW5kYXJkQW1vdW50SW5wdXQsXG4gIFN0YW5kYXJkUGFyc2VhYmxlSW5wdXRcbn0gZnJvbSBcIi4uLy4uL2NvbW1vbi9pbnB1dFwiXG5pbXBvcnQgeyBTZXJpYWxpemF0aW9uLCBTZXJpYWxpemVkRW5jb2RpbmcgfSBmcm9tIFwiLi4vLi4vdXRpbHMvc2VyaWFsaXphdGlvblwiXG5pbXBvcnQgQk4gZnJvbSBcImJuLmpzXCJcbmltcG9ydCB7IElucHV0SWRFcnJvciB9IGZyb20gXCIuLi8uLi91dGlscy9lcnJvcnNcIlxuaW1wb3J0IHsgTG9ja2VkSURzIH0gZnJvbSBcIi4vbG9ja2VkXCJcblxuLyoqXG4gKiBAaWdub3JlXG4gKi9cbmNvbnN0IGJpbnRvb2xzOiBCaW5Ub29scyA9IEJpblRvb2xzLmdldEluc3RhbmNlKClcbmNvbnN0IHNlcmlhbGl6YXRpb246IFNlcmlhbGl6YXRpb24gPSBTZXJpYWxpemF0aW9uLmdldEluc3RhbmNlKClcblxuLyoqXG4gKiBUYWtlcyBhIGJ1ZmZlciByZXByZXNlbnRpbmcgdGhlIG91dHB1dCBhbmQgcmV0dXJucyB0aGUgcHJvcGVyIFtbSW5wdXRdXSBpbnN0YW5jZS5cbiAqXG4gKiBAcGFyYW0gaW5wdXRpZCBBIG51bWJlciByZXByZXNlbnRpbmcgdGhlIGlucHV0SUQgcGFyc2VkIHByaW9yIHRvIHRoZSBieXRlcyBwYXNzZWQgaW5cbiAqXG4gKiBAcmV0dXJucyBBbiBpbnN0YW5jZSBvZiBhbiBbW0lucHV0XV0tZXh0ZW5kZWQgY2xhc3MuXG4gKi9cbmV4cG9ydCBjb25zdCBTZWxlY3RJbnB1dENsYXNzID0gKFxuICBpbnB1dGlkOiBudW1iZXIsXG4gIC4uLmFyZ3M6IGFueVtdXG4pOiBCYXNlSW5wdXQgPT4ge1xuICBpZiAoaW5wdXRpZCA9PT0gUGxhdGZvcm1WTUNvbnN0YW50cy5TRUNQSU5QVVRJRCkge1xuICAgIHJldHVybiBuZXcgU0VDUFRyYW5zZmVySW5wdXQoLi4uYXJncylcbiAgfSBlbHNlIGlmIChpbnB1dGlkID09PSBQbGF0Zm9ybVZNQ29uc3RhbnRzLlNUQUtFQUJMRUxPQ0tJTklEKSB7XG4gICAgcmV0dXJuIG5ldyBTdGFrZWFibGVMb2NrSW4oLi4uYXJncylcbiAgfSBlbHNlIGlmIChpbnB1dGlkID09PSBQbGF0Zm9ybVZNQ29uc3RhbnRzLkxPQ0tFRElOSUQpIHtcbiAgICByZXR1cm4gbmV3IExvY2tlZEluKC4uLmFyZ3MpXG4gIH1cbiAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgdGhyb3cgbmV3IElucHV0SWRFcnJvcihcIkVycm9yIC0gU2VsZWN0SW5wdXRDbGFzczogdW5rbm93biBpbnB1dGlkXCIpXG59XG5cbmV4cG9ydCBjbGFzcyBQYXJzZWFibGVJbnB1dCBleHRlbmRzIFN0YW5kYXJkUGFyc2VhYmxlSW5wdXQge1xuICBwcm90ZWN0ZWQgX3R5cGVOYW1lID0gXCJQYXJzZWFibGVJbnB1dFwiXG4gIHByb3RlY3RlZCBfdHlwZUlEID0gdW5kZWZpbmVkXG5cbiAgLy9zZXJpYWxpemUgaXMgaW5oZXJpdGVkXG4gIGRlc2VyaWFsaXplKGZpZWxkczogb2JqZWN0LCBlbmNvZGluZzogU2VyaWFsaXplZEVuY29kaW5nID0gXCJoZXhcIikge1xuICAgIHN1cGVyLmRlc2VyaWFsaXplKGZpZWxkcywgZW5jb2RpbmcpXG4gICAgdGhpcy5pbnB1dCA9IFNlbGVjdElucHV0Q2xhc3MoZmllbGRzW1wiaW5wdXRcIl1bXCJfdHlwZUlEXCJdKVxuICAgIHRoaXMuaW5wdXQuZGVzZXJpYWxpemUoZmllbGRzW1wiaW5wdXRcIl0sIGVuY29kaW5nKVxuICB9XG5cbiAgZnJvbUJ1ZmZlcihieXRlczogQnVmZmVyLCBvZmZzZXQ6IG51bWJlciA9IDApOiBudW1iZXIge1xuICAgIGNvbnN0IGlucHV0aWQ6IG51bWJlciA9IGJpbnRvb2xzXG4gICAgICAuY29weUZyb20oYnl0ZXMsIG9mZnNldCwgb2Zmc2V0ICsgNClcbiAgICAgIC5yZWFkVUludDMyQkUoMClcbiAgICBvZmZzZXQgKz0gNFxuICAgIHRoaXMuaW5wdXQgPSBTZWxlY3RJbnB1dENsYXNzKGlucHV0aWQpXG4gICAgcmV0dXJuIHRoaXMuaW5wdXQuZnJvbUJ1ZmZlcihieXRlcywgb2Zmc2V0KVxuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBUcmFuc2ZlcmFibGVJbnB1dCBleHRlbmRzIFN0YW5kYXJkVHJhbnNmZXJhYmxlSW5wdXQge1xuICBwcm90ZWN0ZWQgX3R5cGVOYW1lID0gXCJUcmFuc2ZlcmFibGVJbnB1dFwiXG4gIHByb3RlY3RlZCBfdHlwZUlEID0gdW5kZWZpbmVkXG5cbiAgLy9zZXJpYWxpemUgaXMgaW5oZXJpdGVkXG5cbiAgZGVzZXJpYWxpemUoZmllbGRzOiBvYmplY3QsIGVuY29kaW5nOiBTZXJpYWxpemVkRW5jb2RpbmcgPSBcImhleFwiKSB7XG4gICAgc3VwZXIuZGVzZXJpYWxpemUoZmllbGRzLCBlbmNvZGluZylcbiAgICB0aGlzLmlucHV0ID0gU2VsZWN0SW5wdXRDbGFzcyhmaWVsZHNbXCJpbnB1dFwiXVtcIl90eXBlSURcIl0pXG4gICAgdGhpcy5pbnB1dC5kZXNlcmlhbGl6ZShmaWVsZHNbXCJpbnB1dFwiXSwgZW5jb2RpbmcpXG4gIH1cblxuICAvKipcbiAgICogVGFrZXMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBjb250YWluaW5nIGEgW1tUcmFuc2ZlcmFibGVJbnB1dF1dLCBwYXJzZXMgaXQsIHBvcHVsYXRlcyB0aGUgY2xhc3MsIGFuZCByZXR1cm5zIHRoZSBsZW5ndGggb2YgdGhlIFtbVHJhbnNmZXJhYmxlSW5wdXRdXSBpbiBieXRlcy5cbiAgICpcbiAgICogQHBhcmFtIGJ5dGVzIEEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gY29udGFpbmluZyBhIHJhdyBbW1RyYW5zZmVyYWJsZUlucHV0XV1cbiAgICpcbiAgICogQHJldHVybnMgVGhlIGxlbmd0aCBvZiB0aGUgcmF3IFtbVHJhbnNmZXJhYmxlSW5wdXRdXVxuICAgKi9cbiAgZnJvbUJ1ZmZlcihieXRlczogQnVmZmVyLCBvZmZzZXQ6IG51bWJlciA9IDApOiBudW1iZXIge1xuICAgIHRoaXMudHhpZCA9IGJpbnRvb2xzLmNvcHlGcm9tKGJ5dGVzLCBvZmZzZXQsIG9mZnNldCArIDMyKVxuICAgIG9mZnNldCArPSAzMlxuICAgIHRoaXMub3V0cHV0aWR4ID0gYmludG9vbHMuY29weUZyb20oYnl0ZXMsIG9mZnNldCwgb2Zmc2V0ICsgNClcbiAgICBvZmZzZXQgKz0gNFxuICAgIHRoaXMuYXNzZXRJRCA9IGJpbnRvb2xzLmNvcHlGcm9tKFxuICAgICAgYnl0ZXMsXG4gICAgICBvZmZzZXQsXG4gICAgICBvZmZzZXQgKyBQbGF0Zm9ybVZNQ29uc3RhbnRzLkFTU0VUSURMRU5cbiAgICApXG4gICAgb2Zmc2V0ICs9IDMyXG4gICAgY29uc3QgaW5wdXRpZDogbnVtYmVyID0gYmludG9vbHNcbiAgICAgIC5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyA0KVxuICAgICAgLnJlYWRVSW50MzJCRSgwKVxuICAgIG9mZnNldCArPSA0XG4gICAgdGhpcy5pbnB1dCA9IFNlbGVjdElucHV0Q2xhc3MoaW5wdXRpZClcbiAgICByZXR1cm4gdGhpcy5pbnB1dC5mcm9tQnVmZmVyKGJ5dGVzLCBvZmZzZXQpXG4gIH1cblxuICBzdGF0aWMgZnJvbUFycmF5KGI6IEJ1ZmZlcik6IFRyYW5zZmVyYWJsZUlucHV0W10ge1xuICAgIGxldCBvZmZzZXQgPSA2IC8vdmVyc2lvbiArIGNvdW50ZXJcbiAgICBsZXQgbnVtID0gYi5yZWFkVUludDMyQkUoMilcbiAgICBjb25zdCByZXN1bHQ6IFRyYW5zZmVyYWJsZUlucHV0W10gPSBbXVxuICAgIHdoaWxlIChvZmZzZXQgPCBiLmxlbmd0aCAmJiBudW0tLSA+IDApIHtcbiAgICAgIGNvbnN0IHQgPSBuZXcgVHJhbnNmZXJhYmxlSW5wdXQoKVxuICAgICAgb2Zmc2V0ID0gdC5mcm9tQnVmZmVyKGIsIG9mZnNldClcbiAgICAgIHJlc3VsdC5wdXNoKHQpXG4gICAgfVxuICAgIHJldHVybiByZXN1bHRcbiAgfVxufVxuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQW1vdW50SW5wdXQgZXh0ZW5kcyBTdGFuZGFyZEFtb3VudElucHV0IHtcbiAgcHJvdGVjdGVkIF90eXBlTmFtZSA9IFwiQW1vdW50SW5wdXRcIlxuICBwcm90ZWN0ZWQgX3R5cGVJRCA9IHVuZGVmaW5lZFxuXG4gIC8vc2VyaWFsaXplIGFuZCBkZXNlcmlhbGl6ZSBib3RoIGFyZSBpbmhlcml0ZWRcblxuICBzZWxlY3QoaWQ6IG51bWJlciwgLi4uYXJnczogYW55W10pOiBCYXNlSW5wdXQge1xuICAgIHJldHVybiBTZWxlY3RJbnB1dENsYXNzKGlkLCAuLi5hcmdzKVxuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBTRUNQVHJhbnNmZXJJbnB1dCBleHRlbmRzIEFtb3VudElucHV0IHtcbiAgcHJvdGVjdGVkIF90eXBlTmFtZSA9IFwiU0VDUFRyYW5zZmVySW5wdXRcIlxuICBwcm90ZWN0ZWQgX3R5cGVJRCA9IFBsYXRmb3JtVk1Db25zdGFudHMuU0VDUElOUFVUSURcblxuICAvL3NlcmlhbGl6ZSBhbmQgZGVzZXJpYWxpemUgYm90aCBhcmUgaW5oZXJpdGVkXG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGlucHV0SUQgZm9yIHRoaXMgaW5wdXRcbiAgICovXG4gIGdldElucHV0SUQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fdHlwZUlEXG4gIH1cblxuICBnZXRDcmVkZW50aWFsSUQgPSAoKTogbnVtYmVyID0+IFBsYXRmb3JtVk1Db25zdGFudHMuU0VDUENSRURFTlRJQUxcblxuICBjcmVhdGUoLi4uYXJnczogYW55W10pOiB0aGlzIHtcbiAgICByZXR1cm4gbmV3IFNFQ1BUcmFuc2ZlcklucHV0KC4uLmFyZ3MpIGFzIHRoaXNcbiAgfVxuXG4gIGNsb25lKCk6IHRoaXMge1xuICAgIGNvbnN0IG5ld291dDogU0VDUFRyYW5zZmVySW5wdXQgPSB0aGlzLmNyZWF0ZSgpXG4gICAgbmV3b3V0LmZyb21CdWZmZXIodGhpcy50b0J1ZmZlcigpKVxuICAgIHJldHVybiBuZXdvdXQgYXMgdGhpc1xuICB9XG59XG5cbi8qKlxuICogQW4gW1tJbnB1dF1dIGNsYXNzIHdoaWNoIHNwZWNpZmllcyBhbiBpbnB1dCB0aGF0IGhhcyBhIGxvY2t0aW1lIHdoaWNoIGNhbiBhbHNvXG4gKiBlbmFibGUgc3Rha2luZyBvZiB0aGUgdmFsdWUgaGVsZCwgcHJldmVudGluZyB0cmFuc2ZlcnMgYnV0IG5vdCB2YWxpZGF0aW9uLlxuICovXG5leHBvcnQgY2xhc3MgU3Rha2VhYmxlTG9ja0luIGV4dGVuZHMgUGFyc2VhYmxlSW5wdXQge1xuICBwcm90ZWN0ZWQgX3R5cGVOYW1lID0gXCJTdGFrZWFibGVMb2NrSW5cIlxuICBwcm90ZWN0ZWQgX3R5cGVJRCA9IFBsYXRmb3JtVk1Db25zdGFudHMuU1RBS0VBQkxFTE9DS09VVElEXG5cbiAgLy9zZXJpYWxpemUgYW5kIGRlc2VyaWFsaXplIGJvdGggYXJlIGluaGVyaXRlZFxuICBzZXJpYWxpemUoZW5jb2Rpbmc6IFNlcmlhbGl6ZWRFbmNvZGluZyA9IFwiaGV4XCIpOiBvYmplY3Qge1xuICAgIGxldCBmaWVsZHM6IG9iamVjdCA9IHN1cGVyLnNlcmlhbGl6ZShlbmNvZGluZylcbiAgICBsZXQgb3V0b2JqOiBvYmplY3QgPSB7XG4gICAgICAuLi5maWVsZHMsXG4gICAgICBzdGFrZWFibGVMb2NrdGltZTogc2VyaWFsaXphdGlvbi5lbmNvZGVyKFxuICAgICAgICB0aGlzLnN0YWtlYWJsZUxvY2t0aW1lLFxuICAgICAgICBlbmNvZGluZyxcbiAgICAgICAgXCJCdWZmZXJcIixcbiAgICAgICAgXCJkZWNpbWFsU3RyaW5nXCIsXG4gICAgICAgIDhcbiAgICAgIClcbiAgICB9XG4gICAgcmV0dXJuIG91dG9ialxuICB9XG4gIGRlc2VyaWFsaXplKGZpZWxkczogb2JqZWN0LCBlbmNvZGluZzogU2VyaWFsaXplZEVuY29kaW5nID0gXCJoZXhcIikge1xuICAgIHN1cGVyLmRlc2VyaWFsaXplKGZpZWxkcywgZW5jb2RpbmcpXG4gICAgdGhpcy5zdGFrZWFibGVMb2NrdGltZSA9IHNlcmlhbGl6YXRpb24uZGVjb2RlcihcbiAgICAgIGZpZWxkc1tcInN0YWtlYWJsZUxvY2t0aW1lXCJdLFxuICAgICAgZW5jb2RpbmcsXG4gICAgICBcImRlY2ltYWxTdHJpbmdcIixcbiAgICAgIFwiQnVmZmVyXCIsXG4gICAgICA4XG4gICAgKVxuICB9XG5cbiAgcHJvdGVjdGVkIHN0YWtlYWJsZUxvY2t0aW1lOiBCdWZmZXJcblxuICBnZXRTdGFrZWFibGVMb2NrdGltZSgpOiBCTiB7XG4gICAgcmV0dXJuIGJpbnRvb2xzLmZyb21CdWZmZXJUb0JOKHRoaXMuc3Rha2VhYmxlTG9ja3RpbWUpXG4gIH1cblxuICAvKipcbiAgICogUG9wdWF0ZXMgdGhlIGluc3RhbmNlIGZyb20gYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSByZXByZXNlbnRpbmcgdGhlIFtbU3Rha2VhYmxlTG9ja091dF1dIGFuZCByZXR1cm5zIHRoZSBzaXplIG9mIHRoZSBvdXRwdXQuXG4gICAqL1xuICBmcm9tQnVmZmVyKG91dGJ1ZmY6IEJ1ZmZlciwgb2Zmc2V0OiBudW1iZXIgPSAwKTogbnVtYmVyIHtcbiAgICB0aGlzLnN0YWtlYWJsZUxvY2t0aW1lID0gYmludG9vbHMuY29weUZyb20ob3V0YnVmZiwgb2Zmc2V0LCBvZmZzZXQgKyA4KVxuICAgIG9mZnNldCArPSA4XG4gICAgb2Zmc2V0ID0gc3VwZXIuZnJvbUJ1ZmZlcihvdXRidWZmLCBvZmZzZXQpXG4gICAgcmV0dXJuIG9mZnNldFxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGJ1ZmZlciByZXByZXNlbnRpbmcgdGhlIFtbU3Rha2VhYmxlTG9ja091dF1dIGluc3RhbmNlLlxuICAgKi9cbiAgdG9CdWZmZXIoKTogQnVmZmVyIHtcbiAgICBjb25zdCBzdXBlckJ1ZiA9IHN1cGVyLnRvQnVmZmVyKClcbiAgICByZXR1cm4gQnVmZmVyLmNvbmNhdChcbiAgICAgIFt0aGlzLnN0YWtlYWJsZUxvY2t0aW1lLCBzdXBlckJ1Zl0sXG4gICAgICBzdXBlckJ1Zi5sZW5ndGggKyA4XG4gICAgKVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGlucHV0SUQgZm9yIHRoaXMgaW5wdXRcbiAgICovXG4gIGdldElucHV0SUQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fdHlwZUlEXG4gIH1cblxuICBnZXRDcmVkZW50aWFsSUQgPSAoKTogbnVtYmVyID0+IFBsYXRmb3JtVk1Db25zdGFudHMuU0VDUENSRURFTlRJQUxcblxuICBjcmVhdGUoLi4uYXJnczogYW55W10pOiB0aGlzIHtcbiAgICByZXR1cm4gbmV3IFN0YWtlYWJsZUxvY2tJbiguLi5hcmdzKSBhcyB0aGlzXG4gIH1cblxuICBjbG9uZSgpOiB0aGlzIHtcbiAgICBjb25zdCBuZXdvdXQ6IFN0YWtlYWJsZUxvY2tJbiA9IHRoaXMuY3JlYXRlKClcbiAgICBuZXdvdXQuZnJvbUJ1ZmZlcih0aGlzLnRvQnVmZmVyKCkpXG4gICAgcmV0dXJuIG5ld291dCBhcyB0aGlzXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgYW1vdW50IGZyb20gdGhlIHVuZGVybHlpbmcgaW5wdXRcbiAgICovXG4gIGdldEFtb3VudCgpOiBCTiB7XG4gICAgcmV0dXJuICh0aGlzLmdldElucHV0KCkgYXMgU3RhbmRhcmRBbW91bnRJbnB1dCkuZ2V0QW1vdW50KClcbiAgfVxuXG4gIC8qKlxuICAgKiBCYWNrd2FyZHMgY29tcGF0aWJpbGl0eVxuICAgKi9cbiAgZ2V0VHJhbnNmZXJhYmxlSW5wdXQoKTogUGFyc2VhYmxlSW5wdXQge1xuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICAvKipcbiAgICogQSBbW0lucHV0XV0gY2xhc3Mgd2hpY2ggc3BlY2lmaWVzIGFuIFtbSW5wdXRdXSB0aGF0IGhhcyBhIGxvY2t0aW1lIHdoaWNoIGNhbiBhbHNvXG4gICAqIGVuYWJsZSBzdGFraW5nIG9mIHRoZSB2YWx1ZSBoZWxkLCBwcmV2ZW50aW5nIHRyYW5zZmVycyBidXQgbm90IHZhbGlkYXRpb24uXG4gICAqXG4gICAqIEBwYXJhbSBhbW91bnQgQSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2luZHV0bnkvYm4uanMvfEJOfSByZXByZXNlbnRpbmcgdGhlIGFtb3VudCBpbiB0aGUgaW5wdXRcbiAgICogQHBhcmFtIHN0YWtlYWJsZUxvY2t0aW1lIEEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9pbmR1dG55L2JuLmpzL3xCTn0gcmVwcmVzZW50aW5nIHRoZSBzdGFrZWFibGUgbG9ja3RpbWVcbiAgICogQHBhcmFtIHRyYW5zZmVyYWJsZUlucHV0IEEgW1tQYXJzZWFibGVJbnB1dF1dIHdoaWNoIGlzIGVtYmVkZGVkIGludG8gdGhpcyBpbnB1dC5cbiAgICovXG4gIGNvbnN0cnVjdG9yKFxuICAgIGFtb3VudDogQk4gPSB1bmRlZmluZWQsXG4gICAgc3Rha2VhYmxlTG9ja3RpbWU6IEJOID0gdW5kZWZpbmVkLFxuICAgIHRyYW5zZmVyYWJsZUlucHV0OiBQYXJzZWFibGVJbnB1dCA9IHVuZGVmaW5lZFxuICApIHtcbiAgICBzdXBlcihcbiAgICAgIHR5cGVvZiB0cmFuc2ZlcmFibGVJbnB1dCAhPT0gXCJ1bmRlZmluZWRcIlxuICAgICAgICA/IHRyYW5zZmVyYWJsZUlucHV0LmdldElucHV0KClcbiAgICAgICAgOiBuZXcgU0VDUFRyYW5zZmVySW5wdXQoYW1vdW50KVxuICAgIClcbiAgICBpZiAodHlwZW9mIHN0YWtlYWJsZUxvY2t0aW1lICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICB0aGlzLnN0YWtlYWJsZUxvY2t0aW1lID0gYmludG9vbHMuZnJvbUJOVG9CdWZmZXIoc3Rha2VhYmxlTG9ja3RpbWUsIDgpXG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQW4gW1tJbnB1dF1dIGNsYXNzIHdoaWNoIHNwZWNpZmllcyBhbiBpbnB1dCB0aGF0IGlzIGNvbnRyb2xsZWQgYnkgZGVwb3NpdCBhbmQgYm9uZCB0eC5cbiAqL1xuZXhwb3J0IGNsYXNzIExvY2tlZEluIGV4dGVuZHMgUGFyc2VhYmxlSW5wdXQge1xuICBwcm90ZWN0ZWQgX3R5cGVOYW1lID0gXCJMb2NrZWRJblwiXG4gIHByb3RlY3RlZCBfdHlwZUlEID0gUGxhdGZvcm1WTUNvbnN0YW50cy5MT0NLRURJTklEXG5cbiAgLy9zZXJpYWxpemUgYW5kIGRlc2VyaWFsaXplIGJvdGggYXJlIGluaGVyaXRlZFxuICBzZXJpYWxpemUoZW5jb2Rpbmc6IFNlcmlhbGl6ZWRFbmNvZGluZyA9IFwiaGV4XCIpOiBvYmplY3Qge1xuICAgIGxldCBmaWVsZHM6IG9iamVjdCA9IHN1cGVyLnNlcmlhbGl6ZShlbmNvZGluZylcbiAgICBsZXQgb3V0b2JqOiBvYmplY3QgPSB7XG4gICAgICAuLi5maWVsZHMsXG4gICAgICBpZHM6IHRoaXMuaWRzLnNlcmlhbGl6ZSgpXG4gICAgfVxuICAgIHJldHVybiBvdXRvYmpcbiAgfVxuXG4gIGRlc2VyaWFsaXplKGZpZWxkczogb2JqZWN0LCBlbmNvZGluZzogU2VyaWFsaXplZEVuY29kaW5nID0gXCJoZXhcIikge1xuICAgIHN1cGVyLmRlc2VyaWFsaXplKGZpZWxkcywgZW5jb2RpbmcpXG4gICAgdGhpcy5pZHMuZGVzZXJpYWxpemUoZmllbGRzW1wiaWRzXCJdLCBlbmNvZGluZylcbiAgfVxuXG4gIHByb3RlY3RlZCBpZHM6IExvY2tlZElEcyA9IG5ldyBMb2NrZWRJRHMoKVxuXG4gIGdldExvY2tlZElEcygpOiBMb2NrZWRJRHMge1xuICAgIHJldHVybiB0aGlzLmlkc1xuICB9XG5cbiAgY3JlYXRlKC4uLmFyZ3M6IGFueVtdKTogdGhpcyB7XG4gICAgcmV0dXJuIG5ldyBMb2NrZWRJbiguLi5hcmdzKSBhcyB0aGlzXG4gIH1cblxuICBjbG9uZSgpOiB0aGlzIHtcbiAgICBjb25zdCBuZXdvdXQ6IExvY2tlZEluID0gdGhpcy5jcmVhdGUoKVxuICAgIG5ld291dC5mcm9tQnVmZmVyKHRoaXMudG9CdWZmZXIoKSlcbiAgICByZXR1cm4gbmV3b3V0IGFzIHRoaXNcbiAgfVxuXG4gIC8qKlxuICAgKiBQb3B1YXRlcyB0aGUgaW5zdGFuY2UgZnJvbSBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9XG4gICAqIHJlcHJlc2VudGluZyB0aGUgW1tMb2NrZWRJbl1dIGFuZCByZXR1cm5zIHRoZSBzaXplIG9mIHRoZSBpbnB1dC5cbiAgICovXG4gIGZyb21CdWZmZXIob3V0YnVmZjogQnVmZmVyLCBvZmZzZXQ6IG51bWJlciA9IDApOiBudW1iZXIge1xuICAgIG9mZnNldCA9IHRoaXMuaWRzLmZyb21CdWZmZXIob3V0YnVmZiwgb2Zmc2V0KVxuICAgIG9mZnNldCA9IHN1cGVyLmZyb21CdWZmZXIob3V0YnVmZiwgb2Zmc2V0KVxuICAgIHJldHVybiBvZmZzZXRcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBidWZmZXIgcmVwcmVzZW50aW5nIHRoZSBbW0xvY2tlZEluXV0gaW5zdGFuY2UuXG4gICAqL1xuICB0b0J1ZmZlcigpOiBCdWZmZXIge1xuICAgIGNvbnN0IGlkc0J1ZjogQnVmZmVyID0gdGhpcy5pZHMudG9CdWZmZXIoKVxuICAgIGNvbnN0IHN1cGVyQnVmZjogQnVmZmVyID0gc3VwZXIudG9CdWZmZXIoKVxuICAgIHJldHVybiBCdWZmZXIuY29uY2F0KFtpZHNCdWYsIHN1cGVyQnVmZl0sIHN1cGVyQnVmZi5sZW5ndGggKyA2NClcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBpbnB1dElEIGZvciB0aGlzIGlucHV0XG4gICAqL1xuICBnZXRJbnB1dElEKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX3R5cGVJRFxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGNyZWRlbnRpYWxJRCBmb3IgdGhpcyBpbnB1dFxuICAgKi9cbiAgZ2V0Q3JlZGVudGlhbElEID0gKCk6IG51bWJlciA9PiBQbGF0Zm9ybVZNQ29uc3RhbnRzLlNFQ1BDUkVERU5USUFMXG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGFtb3VudCBmcm9tIHRoZSB1bmRlcmx5aW5nIGlucHV0XG4gICAqL1xuICBnZXRBbW91bnQoKTogQk4ge1xuICAgIHJldHVybiAodGhpcy5nZXRJbnB1dCgpIGFzIFN0YW5kYXJkQW1vdW50SW5wdXQpLmdldEFtb3VudCgpXG4gIH1cblxuICAvKipcbiAgICogQW4gW1tJbnB1dF1dIGNsYXNzIHdoaWNoIHNwZWNpZmllcyBhbiBpbnB1dCB0aGF0IGlzIGNvbnRyb2xsZWQgYnkgZGVwb3NpdCBhbmQgYm9uZCB0eC5cbiAgICpcbiAgICogQHBhcmFtIGFtb3VudCBBIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vaW5kdXRueS9ibi5qcy98Qk59IHJlcHJlc2VudGluZyB0aGUgYW1vdW50IGluIHRoZSBpbnB1dFxuICAgKi9cbiAgY29uc3RydWN0b3IoYW1vdW50OiBCTiA9IHVuZGVmaW5lZCkge1xuICAgIHN1cGVyKG5ldyBTRUNQVHJhbnNmZXJJbnB1dChhbW91bnQpKVxuICB9XG59XG4iXX0=
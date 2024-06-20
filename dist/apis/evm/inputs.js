"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EVMInput = exports.SECPTransferInput = exports.AmountInput = exports.TransferableInput = exports.SelectInputClass = void 0;
/**
 * @packageDocumentation
 * @module API-EVM-Inputs
 */
const buffer_1 = require("buffer/");
const bintools_1 = __importDefault(require("../../utils/bintools"));
const constants_1 = require("./constants");
const input_1 = require("../../common/input");
const outputs_1 = require("./outputs");
const bn_js_1 = __importDefault(require("bn.js"));
const credentials_1 = require("../../common/credentials");
const errors_1 = require("../../utils/errors");
/**
 * @ignore
 */
const bintools = bintools_1.default.getInstance();
/**
 * Takes a buffer representing the output and returns the proper [[Input]] instance.
 *
 * @param inputID A number representing the inputID parsed prior to the bytes passed in
 *
 * @returns An instance of an [[Input]]-extended class.
 */
const SelectInputClass = (inputID, ...args) => {
    if (inputID === constants_1.EVMConstants.SECPINPUTID) {
        return new SECPTransferInput(...args);
    }
    /* istanbul ignore next */
    throw new errors_1.InputIdError("Error - SelectInputClass: unknown inputID");
};
exports.SelectInputClass = SelectInputClass;
class TransferableInput extends input_1.StandardTransferableInput {
    constructor() {
        super(...arguments);
        this._typeName = "TransferableInput";
        this._typeID = undefined;
        /**
         *
         * Assesses the amount to be paid based on the number of signatures required
         * @returns the amount to be paid
         */
        this.getCost = (c) => {
            const numSigs = this.getInput().getSigIdxs().length;
            return numSigs * c.costPerSignature;
        };
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
        this.assetID = bintools.copyFrom(bytes, offset, offset + constants_1.EVMConstants.ASSETIDLEN);
        offset += 32;
        const inputid = bintools
            .copyFrom(bytes, offset, offset + 4)
            .readUInt32BE(0);
        offset += 4;
        this.input = (0, exports.SelectInputClass)(inputid);
        return this.input.fromBuffer(bytes, offset);
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
        this._typeID = constants_1.EVMConstants.SECPINPUTID;
        this.getCredentialID = () => constants_1.EVMConstants.SECPCREDENTIAL;
    }
    //serialize and deserialize both are inherited
    /**
     * Returns the inputID for this input
     */
    getInputID() {
        return constants_1.EVMConstants.SECPINPUTID;
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
class EVMInput extends outputs_1.EVMOutput {
    /**
     * Returns a {@link https://github.com/feross/buffer|Buffer} representation of the [[EVMOutput]].
     */
    toBuffer() {
        let superbuff = super.toBuffer();
        let bsize = superbuff.length + this.nonce.length;
        let barr = [superbuff, this.nonce];
        return buffer_1.Buffer.concat(barr, bsize);
    }
    /**
     * Decodes the [[EVMInput]] as a {@link https://github.com/feross/buffer|Buffer} and returns the size.
     *
     * @param bytes The bytes as a {@link https://github.com/feross/buffer|Buffer}.
     * @param offset An offset as a number.
     */
    fromBuffer(bytes, offset = 0) {
        offset = super.fromBuffer(bytes, offset);
        this.nonce = bintools.copyFrom(bytes, offset, offset + 8);
        offset += 8;
        return offset;
    }
    /**
     * Returns a base-58 representation of the [[EVMInput]].
     */
    toString() {
        return bintools.bufferToB58(this.toBuffer());
    }
    create(...args) {
        return new EVMInput(...args);
    }
    clone() {
        const newEVMInput = this.create();
        newEVMInput.fromBuffer(this.toBuffer());
        return newEVMInput;
    }
    /**
     * An [[EVMInput]] class which contains address, amount, assetID, nonce.
     *
     * @param address is the EVM address from which to transfer funds.
     * @param amount is the amount of the asset to be transferred (specified in nAVAX for AVAX and the smallest denomination for all other assets).
     * @param assetID The assetID which is being sent as a {@link https://github.com/feross/buffer|Buffer} or as a string.
     * @param nonce A {@link https://github.com/indutny/bn.js/|BN} or a number representing the nonce.
     */
    constructor(address = undefined, amount = undefined, assetID = undefined, nonce = undefined) {
        super(address, amount, assetID);
        this.nonce = buffer_1.Buffer.alloc(8);
        this.nonceValue = new bn_js_1.default(0);
        this.sigCount = buffer_1.Buffer.alloc(4);
        this.sigIdxs = []; // idxs of signers from utxo
        /**
         * Returns the array of [[SigIdx]] for this [[Input]]
         */
        this.getSigIdxs = () => this.sigIdxs;
        /**
         * Creates and adds a [[SigIdx]] to the [[Input]].
         *
         * @param addressIdx The index of the address to reference in the signatures
         * @param address The address of the source of the signature
         */
        this.addSignatureIdx = (addressIdx, address) => {
            const sigidx = new credentials_1.SigIdx();
            const b = buffer_1.Buffer.alloc(4);
            b.writeUInt32BE(addressIdx, 0);
            sigidx.fromBuffer(b);
            sigidx.setSource(address);
            this.sigIdxs.push(sigidx);
            this.sigCount.writeUInt32BE(this.sigIdxs.length, 0);
        };
        /**
         * Returns the nonce as a {@link https://github.com/indutny/bn.js/|BN}.
         */
        this.getNonce = () => this.nonceValue.clone();
        this.getCredentialID = () => constants_1.EVMConstants.SECPCREDENTIAL;
        if (typeof nonce !== "undefined") {
            // convert number nonce to BN
            let n;
            if (typeof nonce === "number") {
                n = new bn_js_1.default(nonce);
            }
            else {
                n = nonce;
            }
            this.nonceValue = n.clone();
            this.nonce = bintools.fromBNToBuffer(n, 8);
        }
    }
}
exports.EVMInput = EVMInput;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5wdXRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2FwaXMvZXZtL2lucHV0cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTs7O0dBR0c7QUFDSCxvQ0FBZ0M7QUFDaEMsb0VBQTJDO0FBQzNDLDJDQUEwQztBQUMxQyw4Q0FJMkI7QUFFM0IsdUNBQXFDO0FBQ3JDLGtEQUFzQjtBQUN0QiwwREFBaUQ7QUFDakQsK0NBQWlEO0FBR2pEOztHQUVHO0FBQ0gsTUFBTSxRQUFRLEdBQWEsa0JBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtBQUVqRDs7Ozs7O0dBTUc7QUFDSSxNQUFNLGdCQUFnQixHQUFHLENBQUMsT0FBZSxFQUFFLEdBQUcsSUFBVyxFQUFTLEVBQUU7SUFDekUsSUFBSSxPQUFPLEtBQUssd0JBQVksQ0FBQyxXQUFXLEVBQUU7UUFDeEMsT0FBTyxJQUFJLGlCQUFpQixDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUE7S0FDdEM7SUFDRCwwQkFBMEI7SUFDMUIsTUFBTSxJQUFJLHFCQUFZLENBQUMsMkNBQTJDLENBQUMsQ0FBQTtBQUNyRSxDQUFDLENBQUE7QUFOWSxRQUFBLGdCQUFnQixvQkFNNUI7QUFFRCxNQUFhLGlCQUFrQixTQUFRLGlDQUF5QjtJQUFoRTs7UUFDWSxjQUFTLEdBQUcsbUJBQW1CLENBQUE7UUFDL0IsWUFBTyxHQUFHLFNBQVMsQ0FBQTtRQVU3Qjs7OztXQUlHO1FBQ0gsWUFBTyxHQUFHLENBQUMsQ0FBSSxFQUFVLEVBQUU7WUFDekIsTUFBTSxPQUFPLEdBQVcsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLFVBQVUsRUFBRSxDQUFDLE1BQU0sQ0FBQTtZQUMzRCxPQUFPLE9BQU8sR0FBRyxDQUFDLENBQUMsZ0JBQWdCLENBQUE7UUFDckMsQ0FBQyxDQUFBO0lBMkJILENBQUM7SUEzQ0Msd0JBQXdCO0lBRXhCLFdBQVcsQ0FBQyxNQUFjLEVBQUUsV0FBK0IsS0FBSztRQUM5RCxLQUFL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QUssQ0FBQyxDQUFBO2FBQ2xCO2lCQUFNO2dCQUNMLENBQUMsR0FBRyxLQUFLLENBQUE7YUFDVjtZQUVELElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFBO1lBQzNCLElBQUksQ0FBQyxLQUFLLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUE7U0FDM0M7SUFDSCxDQUFDO0NBQ0Y7QUF2R0QsNEJBdUdDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAcGFja2FnZURvY3VtZW50YXRpb25cbiAqIEBtb2R1bGUgQVBJLUVWTS1JbnB1dHNcbiAqL1xuaW1wb3J0IHsgQnVmZmVyIH0gZnJvbSBcImJ1ZmZlci9cIlxuaW1wb3J0IEJpblRvb2xzIGZyb20gXCIuLi8uLi91dGlscy9iaW50b29sc1wiXG5pbXBvcnQgeyBFVk1Db25zdGFudHMgfSBmcm9tIFwiLi9jb25zdGFudHNcIlxuaW1wb3J0IHtcbiAgSW5wdXQsXG4gIFN0YW5kYXJkVHJhbnNmZXJhYmxlSW5wdXQsXG4gIFN0YW5kYXJkQW1vdW50SW5wdXRcbn0gZnJvbSBcIi4uLy4uL2NvbW1vbi9pbnB1dFwiXG5pbXBvcnQgeyBTZXJpYWxpemVkRW5jb2RpbmcgfSBmcm9tIFwiLi4vLi4vdXRpbHMvc2VyaWFsaXphdGlvblwiXG5pbXBvcnQgeyBFVk1PdXRwdXQgfSBmcm9tIFwiLi9vdXRwdXRzXCJcbmltcG9ydCBCTiBmcm9tIFwiYm4uanNcIlxuaW1wb3J0IHsgU2lnSWR4IH0gZnJvbSBcIi4uLy4uL2NvbW1vbi9jcmVkZW50aWFsc1wiXG5pbXBvcnQgeyBJbnB1dElkRXJyb3IgfSBmcm9tIFwiLi4vLi4vdXRpbHMvZXJyb3JzXCJcbmltcG9ydCB7IEMgfSBmcm9tIFwiLi4vLi4vdXRpbHMvbmV0d29ya3NcIlxuXG4vKipcbiAqIEBpZ25vcmVcbiAqL1xuY29uc3QgYmludG9vbHM6IEJpblRvb2xzID0gQmluVG9vbHMuZ2V0SW5zdGFuY2UoKVxuXG4vKipcbiAqIFRha2VzIGEgYnVmZmVyIHJlcHJlc2VudGluZyB0aGUgb3V0cHV0IGFuZCByZXR1cm5zIHRoZSBwcm9wZXIgW1tJbnB1dF1dIGluc3RhbmNlLlxuICpcbiAqIEBwYXJhbSBpbnB1dElEIEEgbnVtYmVyIHJlcHJlc2VudGluZyB0aGUgaW5wdXRJRCBwYXJzZWQgcHJpb3IgdG8gdGhlIGJ5dGVzIHBhc3NlZCBpblxuICpcbiAqIEByZXR1cm5zIEFuIGluc3RhbmNlIG9mIGFuIFtbSW5wdXRdXS1leHRlbmRlZCBjbGFzcy5cbiAqL1xuZXhwb3J0IGNvbnN0IFNlbGVjdElucHV0Q2xhc3MgPSAoaW5wdXRJRDogbnVtYmVyLCAuLi5hcmdzOiBhbnlbXSk6IElucHV0ID0+IHtcbiAgaWYgKGlucHV0SUQgPT09IEVWTUNvbnN0YW50cy5TRUNQSU5QVVRJRCkge1xuICAgIHJldHVybiBuZXcgU0VDUFRyYW5zZmVySW5wdXQoLi4uYXJncylcbiAgfVxuICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICB0aHJvdyBuZXcgSW5wdXRJZEVycm9yKFwiRXJyb3IgLSBTZWxlY3RJbnB1dENsYXNzOiB1bmtub3duIGlucHV0SURcIilcbn1cblxuZXhwb3J0IGNsYXNzIFRyYW5zZmVyYWJsZUlucHV0IGV4dGVuZHMgU3RhbmRhcmRUcmFuc2ZlcmFibGVJbnB1dCB7XG4gIHByb3RlY3RlZCBfdHlwZU5hbWUgPSBcIlRyYW5zZmVyYWJsZUlucHV0XCJcbiAgcHJvdGVjdGVkIF90eXBlSUQgPSB1bmRlZmluZWRcblxuICAvL3NlcmlhbGl6ZSBpcyBpbmhlcml0ZWRcblxuICBkZXNlcmlhbGl6ZShmaWVsZHM6IG9iamVjdCwgZW5jb2Rpbmc6IFNlcmlhbGl6ZWRFbmNvZGluZyA9IFwiaGV4XCIpIHtcbiAgICBzdXBlci5kZXNlcmlhbGl6ZShmaWVsZHMsIGVuY29kaW5nKVxuICAgIHRoaXMuaW5wdXQgPSBTZWxlY3RJbnB1dENsYXNzKGZpZWxkc1tcImlucHV0XCJdW1wiX3R5cGVJRFwiXSlcbiAgICB0aGlzLmlucHV0LmRlc2VyaWFsaXplKGZpZWxkc1tcImlucHV0XCJdLCBlbmNvZGluZylcbiAgfVxuXG4gIC8qKlxuICAgKlxuICAgKiBBc3Nlc3NlcyB0aGUgYW1vdW50IHRvIGJlIHBhaWQgYmFzZWQgb24gdGhlIG51bWJlciBvZiBzaWduYXR1cmVzIHJlcXVpcmVkXG4gICAqIEByZXR1cm5zIHRoZSBhbW91bnQgdG8gYmUgcGFpZFxuICAgKi9cbiAgZ2V0Q29zdCA9IChjOiBDKTogbnVtYmVyID0+IHtcbiAgICBjb25zdCBudW1TaWdzOiBudW1iZXIgPSB0aGlzLmdldElucHV0KCkuZ2V0U2lnSWR4cygpLmxlbmd0aFxuICAgIHJldHVybiBudW1TaWdzICogYy5jb3N0UGVyU2lnbmF0dXJlXG4gIH1cblxuICAvKipcbiAgICogVGFrZXMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBjb250YWluaW5nIGEgW1tUcmFuc2ZlcmFibGVJbnB1dF1dLCBwYXJzZXMgaXQsIHBvcHVsYXRlcyB0aGUgY2xhc3MsIGFuZCByZXR1cm5zIHRoZSBsZW5ndGggb2YgdGhlIFtbVHJhbnNmZXJhYmxlSW5wdXRdXSBpbiBieXRlcy5cbiAgICpcbiAgICogQHBhcmFtIGJ5dGVzIEEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gY29udGFpbmluZyBhIHJhdyBbW1RyYW5zZmVyYWJsZUlucHV0XV1cbiAgICpcbiAgICogQHJldHVybnMgVGhlIGxlbmd0aCBvZiB0aGUgcmF3IFtbVHJhbnNmZXJhYmxlSW5wdXRdXVxuICAgKi9cbiAgZnJvbUJ1ZmZlcihieXRlczogQnVmZmVyLCBvZmZzZXQ6IG51bWJlciA9IDApOiBudW1iZXIge1xuICAgIHRoaXMudHhpZCA9IGJpbnRvb2xzLmNvcHlGcm9tKGJ5dGVzLCBvZmZzZXQsIG9mZnNldCArIDMyKVxuICAgIG9mZnNldCArPSAzMlxuICAgIHRoaXMub3V0cHV0aWR4ID0gYmludG9vbHMuY29weUZyb20oYnl0ZXMsIG9mZnNldCwgb2Zmc2V0ICsgNClcbiAgICBvZmZzZXQgKz0gNFxuICAgIHRoaXMuYXNzZXRJRCA9IGJpbnRvb2xzLmNvcHlGcm9tKFxuICAgICAgYnl0ZXMsXG4gICAgICBvZmZzZXQsXG4gICAgICBvZmZzZXQgKyBFVk1Db25zdGFudHMuQVNTRVRJRExFTlxuICAgIClcbiAgICBvZmZzZXQgKz0gMzJcbiAgICBjb25zdCBpbnB1dGlkOiBudW1iZXIgPSBiaW50b29sc1xuICAgICAgLmNvcHlGcm9tKGJ5dGVzLCBvZmZzZXQsIG9mZnNldCArIDQpXG4gICAgICAucmVhZFVJbnQzMkJFKDApXG4gICAgb2Zmc2V0ICs9IDRcbiAgICB0aGlzLmlucHV0ID0gU2VsZWN0SW5wdXRDbGFzcyhpbnB1dGlkKVxuICAgIHJldHVybiB0aGlzLmlucHV0LmZyb21CdWZmZXIoYnl0ZXMsIG9mZnNldClcbiAgfVxufVxuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQW1vdW50SW5wdXQgZXh0ZW5kcyBTdGFuZGFyZEFtb3VudElucHV0IHtcbiAgcHJvdGVjdGVkIF90eXBlTmFtZSA9IFwiQW1vdW50SW5wdXRcIlxuICBwcm90ZWN0ZWQgX3R5cGVJRCA9IHVuZGVmaW5lZFxuXG4gIC8vc2VyaWFsaXplIGFuZCBkZXNlcmlhbGl6ZSBib3RoIGFyZSBpbmhlcml0ZWRcblxuICBzZWxlY3QoaWQ6IG51bWJlciwgLi4uYXJnczogYW55W10pOiBJbnB1dCB7XG4gICAgcmV0dXJuIFNlbGVjdElucHV0Q2xhc3MoaWQsIC4uLmFyZ3MpXG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFNFQ1BUcmFuc2ZlcklucHV0IGV4dGVuZHMgQW1vdW50SW5wdXQge1xuICBwcm90ZWN0ZWQgX3R5cGVOYW1lID0gXCJTRUNQVHJhbnNmZXJJbnB1dFwiXG4gIHByb3RlY3RlZCBfdHlwZUlEID0gRVZNQ29uc3RhbnRzLlNFQ1BJTlBVVElEXG5cbiAgLy9zZXJpYWxpemUgYW5kIGRlc2VyaWFsaXplIGJvdGggYXJlIGluaGVyaXRlZFxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBpbnB1dElEIGZvciB0aGlzIGlucHV0XG4gICAqL1xuICBnZXRJbnB1dElEKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIEVWTUNvbnN0YW50cy5TRUNQSU5QVVRJRFxuICB9XG5cbiAgZ2V0Q3JlZGVudGlhbElEID0gKCk6IG51bWJlciA9PiBFVk1Db25zdGFudHMuU0VDUENSRURFTlRJQUxcblxuICBjcmVhdGUoLi4uYXJnczogYW55W10pOiB0aGlzIHtcbiAgICByZXR1cm4gbmV3IFNFQ1BUcmFuc2ZlcklucHV0KC4uLmFyZ3MpIGFzIHRoaXNcbiAgfVxuXG4gIGNsb25lKCk6IHRoaXMge1xuICAgIGNvbnN0IG5ld291dDogU0VDUFRyYW5zZmVySW5wdXQgPSB0aGlzLmNyZWF0ZSgpXG4gICAgbmV3b3V0LmZyb21CdWZmZXIodGhpcy50b0J1ZmZlcigpKVxuICAgIHJldHVybiBuZXdvdXQgYXMgdGhpc1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBFVk1JbnB1dCBleHRlbmRzIEVWTU91dHB1dCB7XG4gIHByb3RlY3RlZCBub25jZTogQnVmZmVyID0gQnVmZmVyLmFsbG9jKDgpXG4gIHByb3RlY3RlZCBub25jZVZhbHVlOiBCTiA9IG5ldyBCTigwKVxuICBwcm90ZWN0ZWQgc2lnQ291bnQ6IEJ1ZmZlciA9IEJ1ZmZlci5hbGxvYyg0KVxuICBwcm90ZWN0ZWQgc2lnSWR4czogU2lnSWR4W10gPSBbXSAvLyBpZHhzIG9mIHNpZ25lcnMgZnJvbSB1dHhvXG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGFycmF5IG9mIFtbU2lnSWR4XV0gZm9yIHRoaXMgW1tJbnB1dF1dXG4gICAqL1xuICBnZXRTaWdJZHhzID0gKCk6IFNpZ0lkeFtdID0+IHRoaXMuc2lnSWR4c1xuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGFuZCBhZGRzIGEgW1tTaWdJZHhdXSB0byB0aGUgW1tJbnB1dF1dLlxuICAgKlxuICAgKiBAcGFyYW0gYWRkcmVzc0lkeCBUaGUgaW5kZXggb2YgdGhlIGFkZHJlc3MgdG8gcmVmZXJlbmNlIGluIHRoZSBzaWduYXR1cmVzXG4gICAqIEBwYXJhbSBhZGRyZXNzIFRoZSBhZGRyZXNzIG9mIHRoZSBzb3VyY2Ugb2YgdGhlIHNpZ25hdHVyZVxuICAgKi9cbiAgYWRkU2lnbmF0dXJlSWR4ID0gKGFkZHJlc3NJZHg6IG51bWJlciwgYWRkcmVzczogQnVmZmVyKSA9PiB7XG4gICAgY29uc3Qgc2lnaWR4OiBTaWdJZHggPSBuZXcgU2lnSWR4KClcbiAgICBjb25zdCBiOiBCdWZmZXIgPSBCdWZmZXIuYWxsb2MoNClcbiAgICBiLndyaXRlVUludDMyQkUoYWRkcmVzc0lkeCwgMClcbiAgICBzaWdpZHguZnJvbUJ1ZmZlcihiKVxuICAgIHNpZ2lkeC5zZXRTb3VyY2UoYWRkcmVzcylcbiAgICB0aGlzLnNpZ0lkeHMucHVzaChzaWdpZHgpXG4gICAgdGhpcy5zaWdDb3VudC53cml0ZVVJbnQzMkJFKHRoaXMuc2lnSWR4cy5sZW5ndGgsIDApXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgbm9uY2UgYXMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2luZHV0bnkvYm4uanMvfEJOfS5cbiAgICovXG4gIGdldE5vbmNlID0gKCk6IEJOID0+IHRoaXMubm9uY2VWYWx1ZS5jbG9uZSgpXG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSByZXByZXNlbnRhdGlvbiBvZiB0aGUgW1tFVk1PdXRwdXRdXS5cbiAgICovXG4gIHRvQnVmZmVyKCk6IEJ1ZmZlciB7XG4gICAgbGV0IHN1cGVyYnVmZjogQnVmZmVyID0gc3VwZXIudG9CdWZmZXIoKVxuICAgIGxldCBic2l6ZTogbnVtYmVyID0gc3VwZXJidWZmLmxlbmd0aCArIHRoaXMubm9uY2UubGVuZ3RoXG4gICAgbGV0IGJhcnI6IEJ1ZmZlcltdID0gW3N1cGVyYnVmZiwgdGhpcy5ub25jZV1cbiAgICByZXR1cm4gQnVmZmVyLmNvbmNhdChiYXJyLCBic2l6ZSlcbiAgfVxuXG4gIGdldENyZWRlbnRpYWxJRCA9ICgpOiBudW1iZXIgPT4gRVZNQ29uc3RhbnRzLlNFQ1BDUkVERU5USUFMXG5cbiAgLyoqXG4gICAqIERlY29kZXMgdGhlIFtbRVZNSW5wdXRdXSBhcyBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IGFuZCByZXR1cm5zIHRoZSBzaXplLlxuICAgKlxuICAgKiBAcGFyYW0gYnl0ZXMgVGhlIGJ5dGVzIGFzIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0uXG4gICAqIEBwYXJhbSBvZmZzZXQgQW4gb2Zmc2V0IGFzIGEgbnVtYmVyLlxuICAgKi9cbiAgZnJvbUJ1ZmZlcihieXRlczogQnVmZmVyLCBvZmZzZXQ6IG51bWJlciA9IDApOiBudW1iZXIge1xuICAgIG9mZnNldCA9IHN1cGVyLmZyb21CdWZmZXIoYnl0ZXMsIG9mZnNldClcbiAgICB0aGlzLm5vbmNlID0gYmludG9vbHMuY29weUZyb20oYnl0ZXMsIG9mZnNldCwgb2Zmc2V0ICsgOClcbiAgICBvZmZzZXQgKz0gOFxuICAgIHJldHVybiBvZmZzZXRcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgYmFzZS01OCByZXByZXNlbnRhdGlvbiBvZiB0aGUgW1tFVk1JbnB1dF1dLlxuICAgKi9cbiAgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYmludG9vbHMuYnVmZmVyVG9CNTgodGhpcy50b0J1ZmZlcigpKVxuICB9XG5cbiAgY3JlYXRlKC4uLmFyZ3M6IGFueVtdKTogdGhpcyB7XG4gICAgcmV0dXJuIG5ldyBFVk1JbnB1dCguLi5hcmdzKSBhcyB0aGlzXG4gIH1cblxuICBjbG9uZSgpOiB0aGlzIHtcbiAgICBjb25zdCBuZXdFVk1JbnB1dDogRVZNSW5wdXQgPSB0aGlzLmNyZWF0ZSgpXG4gICAgbmV3RVZNSW5wdXQuZnJvbUJ1ZmZlcih0aGlzLnRvQnVmZmVyKCkpXG4gICAgcmV0dXJuIG5ld0VWTUlucHV0IGFzIHRoaXNcbiAgfVxuXG4gIC8qKlxuICAgKiBBbiBbW0VWTUlucHV0XV0gY2xhc3Mgd2hpY2ggY29udGFpbnMgYWRkcmVzcywgYW1vdW50LCBhc3NldElELCBub25jZS5cbiAgICpcbiAgICogQHBhcmFtIGFkZHJlc3MgaXMgdGhlIEVWTSBhZGRyZXNzIGZyb20gd2hpY2ggdG8gdHJhbnNmZXIgZnVuZHMuXG4gICAqIEBwYXJhbSBhbW91bnQgaXMgdGhlIGFtb3VudCBvZiB0aGUgYXNzZXQgdG8gYmUgdHJhbnNmZXJyZWQgKHNwZWNpZmllZCBpbiBuQVZBWCBmb3IgQVZBWCBhbmQgdGhlIHNtYWxsZXN0IGRlbm9taW5hdGlvbiBmb3IgYWxsIG90aGVyIGFzc2V0cykuXG4gICAqIEBwYXJhbSBhc3NldElEIFRoZSBhc3NldElEIHdoaWNoIGlzIGJlaW5nIHNlbnQgYXMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBvciBhcyBhIHN0cmluZy5cbiAgICogQHBhcmFtIG5vbmNlIEEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9pbmR1dG55L2JuLmpzL3xCTn0gb3IgYSBudW1iZXIgcmVwcmVzZW50aW5nIHRoZSBub25jZS5cbiAgICovXG4gIGNvbnN0cnVjdG9yKFxuICAgIGFkZHJlc3M6IEJ1ZmZlciB8IHN0cmluZyA9IHVuZGVmaW5lZCxcbiAgICBhbW91bnQ6IEJOIHwgbnVtYmVyID0gdW5kZWZpbmVkLFxuICAgIGFzc2V0SUQ6IEJ1ZmZlciB8IHN0cmluZyA9IHVuZGVmaW5lZCxcbiAgICBub25jZTogQk4gfCBudW1iZXIgPSB1bmRlZmluZWRcbiAgKSB7XG4gICAgc3VwZXIoYWRkcmVzcywgYW1vdW50LCBhc3NldElEKVxuXG4gICAgaWYgKHR5cGVvZiBub25jZSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgLy8gY29udmVydCBudW1iZXIgbm9uY2UgdG8gQk5cbiAgICAgIGxldCBuOiBCTlxuICAgICAgaWYgKHR5cGVvZiBub25jZSA9PT0gXCJudW1iZXJcIikge1xuICAgICAgICBuID0gbmV3IEJOKG5vbmNlKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbiA9IG5vbmNlXG4gICAgICB9XG5cbiAgICAgIHRoaXMubm9uY2VWYWx1ZSA9IG4uY2xvbmUoKVxuICAgICAgdGhpcy5ub25jZSA9IGJpbnRvb2xzLmZyb21CTlRvQnVmZmVyKG4sIDgpXG4gICAgfVxuICB9XG59XG4iXX0=
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OperationTx = void 0;
/**
 * @packageDocumentation
 * @module API-AVM-OperationTx
 */
const buffer_1 = require("buffer/");
const bintools_1 = __importDefault(require("../../utils/bintools"));
const constants_1 = require("./constants");
const ops_1 = require("./ops");
const credentials_1 = require("./credentials");
const credentials_2 = require("../../common/credentials");
const basetx_1 = require("./basetx");
const constants_2 = require("../../utils/constants");
const errors_1 = require("../../utils/errors");
/**
 * @ignore
 */
const bintools = bintools_1.default.getInstance();
/**
 * Class representing an unsigned Operation transaction.
 */
class OperationTx extends basetx_1.BaseTx {
    serialize(encoding = "hex") {
        const fields = super.serialize(encoding);
        return Object.assign(Object.assign({}, fields), { ops: this.ops.map((o) => o.serialize(encoding)) });
    }
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        this.ops = fields["ops"].map((o) => {
            let op = new ops_1.TransferableOperation();
            op.deserialize(o, encoding);
            return op;
        });
        this.numOps = buffer_1.Buffer.alloc(4);
        this.numOps.writeUInt32BE(this.ops.length, 0);
    }
    setCodecID(codecID) {
        if (codecID !== 0 && codecID !== 1) {
            /* istanbul ignore next */
            throw new errors_1.CodecIdError("Error - OperationTx.setCodecID: invalid codecID. Valid codecIDs are 0 and 1.");
        }
        this._codecID = codecID;
        this._typeID =
            this._codecID === 0
                ? constants_1.AVMConstants.OPERATIONTX
                : constants_1.AVMConstants.OPERATIONTX_CODECONE;
    }
    /**
     * Returns the id of the [[OperationTx]]
     */
    getTxType() {
        return this._typeID;
    }
    /**
     * Takes a {@link https://github.com/feross/buffer|Buffer} containing an [[OperationTx]], parses it, populates the class, and returns the length of the [[OperationTx]] in bytes.
     *
     * @param bytes A {@link https://github.com/feross/buffer|Buffer} containing a raw [[OperationTx]]
     *
     * @returns The length of the raw [[OperationTx]]
     *
     * @remarks assume not-checksummed
     */
    fromBuffer(bytes, offset = 0) {
        offset = super.fromBuffer(bytes, offset);
        this.numOps = bintools.copyFrom(bytes, offset, offset + 4);
        offset += 4;
        const numOps = this.numOps.readUInt32BE(0);
        for (let i = 0; i < numOps; i++) {
            const op = new ops_1.TransferableOperation();
            offset = op.fromBuffer(bytes, offset);
            this.ops.push(op);
        }
        return offset;
    }
    /**
     * Returns a {@link https://github.com/feross/buffer|Buffer} representation of the [[OperationTx]].
     */
    toBuffer() {
        this.numOps.writeUInt32BE(this.ops.length, 0);
        let barr = [super.toBuffer(), this.numOps];
        this.ops = this.ops.sort(ops_1.TransferableOperation.comparator());
        for (let i = 0; i < this.ops.length; i++) {
            barr.push(this.ops[`${i}`].toBuffer());
        }
        return buffer_1.Buffer.concat(barr);
    }
    /**
     * Returns an array of [[TransferableOperation]]s in this transaction.
     */
    getOperations() {
        return this.ops;
    }
    /**
     * Takes the bytes of an [[UnsignedTx]] and returns an array of [[Credential]]s
     *
     * @param msg A Buffer for the [[UnsignedTx]]
     * @param kc An [[KeyChain]] used in signing
     *
     * @returns An array of [[Credential]]s
     */
    sign(msg, kc) {
        const creds = super.sign(msg, kc);
        for (let i = 0; i < this.ops.length; i++) {
            const cred = (0, credentials_1.SelectCredentialClass)(this.ops[`${i}`].getOperation().getCredentialID());
            const sigidxs = this.ops[`${i}`].getOperation().getSigIdxs();
            for (let j = 0; j < sigidxs.length; j++) {
                const keypair = kc.getKey(sigidxs[`${j}`].getSource());
                const signval = keypair.sign(msg);
                const sig = new credentials_2.Signature();
                sig.fromBuffer(signval);
                cred.addSignature(sig);
            }
            creds.push(cred);
        }
        return creds;
    }
    clone() {
        const newbase = new OperationTx();
        newbase.fromBuffer(this.toBuffer());
        return newbase;
    }
    create(...args) {
        return new OperationTx(...args);
    }
    /**
     * Class representing an unsigned Operation transaction.
     *
     * @param networkID Optional networkID, [[DefaultNetworkID]]
     * @param blockchainID Optional blockchainID, default Buffer.alloc(32, 16)
     * @param outs Optional array of the [[TransferableOutput]]s
     * @param ins Optional array of the [[TransferableInput]]s
     * @param memo Optional {@link https://github.com/feross/buffer|Buffer} for the memo field
     * @param ops Array of [[Operation]]s used in the transaction
     */
    constructor(networkID = constants_2.DefaultNetworkID, blockchainID = buffer_1.Buffer.alloc(32, 16), outs = undefined, ins = undefined, memo = undefined, ops = undefined) {
        super(networkID, blockchainID, outs, ins, memo);
        this._typeName = "OperationTx";
        this._codecID = constants_1.AVMConstants.LATESTCODEC;
        this._typeID = this._codecID === 0
            ? constants_1.AVMConstants.OPERATIONTX
            : constants_1.AVMConstants.OPERATIONTX_CODECONE;
        this.numOps = buffer_1.Buffer.alloc(4);
        this.ops = [];
        if (typeof ops !== "undefined" && Array.isArray(ops)) {
            for (let i = 0; i < ops.length; i++) {
                if (!(ops[`${i}`] instanceof ops_1.TransferableOperation)) {
                    throw new errors_1.OperationError(`Error - OperationTx.constructor: invalid op in array parameter ${ops}`);
                }
            }
            this.ops = ops;
        }
    }
}
exports.OperationTx = OperationTx;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3BlcmF0aW9udHguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYXBpcy9hdm0vb3BlcmF0aW9udHgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7OztHQUdHO0FBQ0gsb0NBQWdDO0FBQ2hDLG9FQUEyQztBQUMzQywyQ0FBMEM7QUFHMUMsK0JBQTZDO0FBQzdDLCtDQUFxRDtBQUVyRCwwREFBd0U7QUFDeEUscUNBQWlDO0FBQ2pDLHFEQUF3RDtBQUV4RCwrQ0FBaUU7QUFFakU7O0dBRUc7QUFDSCxNQUFNLFFBQVEsR0FBYSxrQkFBUSxDQUFDLFdBQVcsRUFBRSxDQUFBO0FBRWpEOztHQUVHO0FBQ0gsTUFBYSxXQUFZLFNBQVEsZUFBTTtJQVFyQyxTQUFTLENBQUMsV0FBK0IsS0FBSztRQUM1QyxNQUFNLE1BQU0sR0FBVyxLQUFLLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFBO1FBQ2hELHVDQUNLLE1BQU0sS0FDVCxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUMsSUFDaEQ7SUFDSCxDQUFDO0lBQ0QsV0FBVyxDQUFDLE1BQWMsRUFBRSxXQUErQixLQUFLO1FBQzlELEtBQUssQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFBO1FBQ25DLElBQUksQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQVMsRUFBRSxFQUFFO1lBQ3pDLElBQUksRUFBRSxHQUEwQixJQUFJLDJCQUFxQixFQUFFLENBQUE7WUFDM0QsRUFBRSxDQUFDLFdBQVcsQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUE7WUFDM0IsT0FBTyxFQUFFLENBQUE7UUFDWCxDQUFDLENBQUMsQ0FBQTtRQUNGLElBQUksQ0FBQyxNQUFN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b2N1bWVudGF0aW9uXG4gKiBAbW9kdWxlIEFQSS1BVk0tT3BlcmF0aW9uVHhcbiAqL1xuaW1wb3J0IHsgQnVmZmVyIH0gZnJvbSBcImJ1ZmZlci9cIlxuaW1wb3J0IEJpblRvb2xzIGZyb20gXCIuLi8uLi91dGlscy9iaW50b29sc1wiXG5pbXBvcnQgeyBBVk1Db25zdGFudHMgfSBmcm9tIFwiLi9jb25zdGFudHNcIlxuaW1wb3J0IHsgVHJhbnNmZXJhYmxlT3V0cHV0IH0gZnJvbSBcIi4vb3V0cHV0c1wiXG5pbXBvcnQgeyBUcmFuc2ZlcmFibGVJbnB1dCB9IGZyb20gXCIuL2lucHV0c1wiXG5pbXBvcnQgeyBUcmFuc2ZlcmFibGVPcGVyYXRpb24gfSBmcm9tIFwiLi9vcHNcIlxuaW1wb3J0IHsgU2VsZWN0Q3JlZGVudGlhbENsYXNzIH0gZnJvbSBcIi4vY3JlZGVudGlhbHNcIlxuaW1wb3J0IHsgS2V5Q2hhaW4sIEtleVBhaXIgfSBmcm9tIFwiLi9rZXljaGFpblwiXG5pbXBvcnQgeyBTaWduYXR1cmUsIFNpZ0lkeCwgQ3JlZGVudGlhbCB9IGZyb20gXCIuLi8uLi9jb21tb24vY3JlZGVudGlhbHNcIlxuaW1wb3J0IHsgQmFzZVR4IH0gZnJvbSBcIi4vYmFzZXR4XCJcbmltcG9ydCB7IERlZmF1bHROZXR3b3JrSUQgfSBmcm9tIFwiLi4vLi4vdXRpbHMvY29uc3RhbnRzXCJcbmltcG9ydCB7IFNlcmlhbGl6ZWRFbmNvZGluZyB9IGZyb20gXCIuLi8uLi91dGlscy9zZXJpYWxpemF0aW9uXCJcbmltcG9ydCB7IENvZGVjSWRFcnJvciwgT3BlcmF0aW9uRXJyb3IgfSBmcm9tIFwiLi4vLi4vdXRpbHMvZXJyb3JzXCJcblxuLyoqXG4gKiBAaWdub3JlXG4gKi9cbmNvbnN0IGJpbnRvb2xzOiBCaW5Ub29scyA9IEJpblRvb2xzLmdldEluc3RhbmNlKClcblxuLyoqXG4gKiBDbGFzcyByZXByZXNlbnRpbmcgYW4gdW5zaWduZWQgT3BlcmF0aW9uIHRyYW5zYWN0aW9uLlxuICovXG5leHBvcnQgY2xhc3MgT3BlcmF0aW9uVHggZXh0ZW5kcyBCYXNlVHgge1xuICBwcm90ZWN0ZWQgX3R5cGVOYW1lID0gXCJPcGVyYXRpb25UeFwiXG4gIHByb3RlY3RlZCBfY29kZWNJRCA9IEFWTUNvbnN0YW50cy5MQVRFU1RDT0RFQ1xuICBwcm90ZWN0ZWQgX3R5cGVJRCA9XG4gICAgdGhpcy5fY29kZWNJRCA9PT0gMFxuICAgICAgPyBBVk1Db25zdGFudHMuT1BFUkFUSU9OVFhcbiAgICAgIDogQVZNQ29uc3RhbnRzLk9QRVJBVElPTlRYX0NPREVDT05FXG5cbiAgc2VyaWFsaXplKGVuY29kaW5nOiBTZXJpYWxpemVkRW5jb2RpbmcgPSBcImhleFwiKTogb2JqZWN0IHtcbiAgICBjb25zdCBmaWVsZHM6IG9iamVjdCA9IHN1cGVyLnNlcmlhbGl6ZShlbmNvZGluZylcbiAgICByZXR1cm4ge1xuICAgICAgLi4uZmllbGRzLFxuICAgICAgb3BzOiB0aGlzLm9wcy5tYXAoKG8pID0+IG8uc2VyaWFsaXplKGVuY29kaW5nKSlcbiAgICB9XG4gIH1cbiAgZGVzZXJpYWxpemUoZmllbGRzOiBvYmplY3QsIGVuY29kaW5nOiBTZXJpYWxpemVkRW5jb2RpbmcgPSBcImhleFwiKSB7XG4gICAgc3VwZXIuZGVzZXJpYWxpemUoZmllbGRzLCBlbmNvZGluZylcbiAgICB0aGlzLm9wcyA9IGZpZWxkc1tcIm9wc1wiXS5tYXAoKG86IG9iamVjdCkgPT4ge1xuICAgICAgbGV0IG9wOiBUcmFuc2ZlcmFibGVPcGVyYXRpb24gPSBuZXcgVHJhbnNmZXJhYmxlT3BlcmF0aW9uKClcbiAgICAgIG9wLmRlc2VyaWFsaXplKG8sIGVuY29kaW5nKVxuICAgICAgcmV0dXJuIG9wXG4gICAgfSlcbiAgICB0aGlzLm51bU9wcyA9IEJ1ZmZlci5hbGxvYyg0KVxuICAgIHRoaXMubnVtT3BzLndyaXRlVUludDMyQkUodGhpcy5vcHMubGVuZ3RoLCAwKVxuICB9XG5cbiAgcHJvdGVjdGVkIG51bU9wczogQnVmZmVyID0gQnVmZmVyLmFsbG9jKDQpXG4gIHByb3RlY3RlZCBvcHM6IFRyYW5zZmVyYWJsZU9wZXJhdGlvbltdID0gW11cblxuICBzZXRDb2RlY0lEKGNvZGVjSUQ6IG51bWJlcik6IHZvaWQge1xuICAgIGlmIChjb2RlY0lEICE9PSAwICYmIGNvZGVjSUQgIT09IDEpIHtcbiAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICB0aHJvdyBuZXcgQ29kZWNJZEVycm9yKFxuICAgICAgICBcIkVycm9yIC0gT3BlcmF0aW9uVHguc2V0Q29kZWNJRDogaW52YWxpZCBjb2RlY0lELiBWYWxpZCBjb2RlY0lEcyBhcmUgMCBhbmQgMS5cIlxuICAgICAgKVxuICAgIH1cbiAgICB0aGlzLl9jb2RlY0lEID0gY29kZWNJRFxuICAgIHRoaXMuX3R5cGVJRCA9XG4gICAgICB0aGlzLl9jb2RlY0lEID09PSAwXG4gICAgICAgID8gQVZNQ29uc3RhbnRzLk9QRVJBVElPTlRYXG4gICAgICAgIDogQVZNQ29uc3RhbnRzLk9QRVJBVElPTlRYX0NPREVDT05FXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgaWQgb2YgdGhlIFtbT3BlcmF0aW9uVHhdXVxuICAgKi9cbiAgZ2V0VHhUeXBlKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX3R5cGVJRFxuICB9XG5cbiAgLyoqXG4gICAqIFRha2VzIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gY29udGFpbmluZyBhbiBbW09wZXJhdGlvblR4XV0sIHBhcnNlcyBpdCwgcG9wdWxhdGVzIHRoZSBjbGFzcywgYW5kIHJldHVybnMgdGhlIGxlbmd0aCBvZiB0aGUgW1tPcGVyYXRpb25UeF1dIGluIGJ5dGVzLlxuICAgKlxuICAgKiBAcGFyYW0gYnl0ZXMgQSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBjb250YWluaW5nIGEgcmF3IFtbT3BlcmF0aW9uVHhdXVxuICAgKlxuICAgKiBAcmV0dXJucyBUaGUgbGVuZ3RoIG9mIHRoZSByYXcgW1tPcGVyYXRpb25UeF1dXG4gICAqXG4gICAqIEByZW1hcmtzIGFzc3VtZSBub3QtY2hlY2tzdW1tZWRcbiAgICovXG4gIGZyb21CdWZmZXIoYnl0ZXM6IEJ1ZmZlciwgb2Zmc2V0OiBudW1iZXIgPSAwKTogbnVtYmVyIHtcbiAgICBvZmZzZXQgPSBzdXBlci5mcm9tQnVmZmVyKGJ5dGVzLCBvZmZzZXQpXG4gICAgdGhpcy5udW1PcHMgPSBiaW50b29scy5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyA0KVxuICAgIG9mZnNldCArPSA0XG4gICAgY29uc3QgbnVtT3BzOiBudW1iZXIgPSB0aGlzLm51bU9wcy5yZWFkVUludDMyQkUoMClcbiAgICBmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgbnVtT3BzOyBpKyspIHtcbiAgICAgIGNvbnN0IG9wOiBUcmFuc2ZlcmFibGVPcGVyYXRpb24gPSBuZXcgVHJhbnNmZXJhYmxlT3BlcmF0aW9uKClcbiAgICAgIG9mZnNldCA9IG9wLmZyb21CdWZmZXIoYnl0ZXMsIG9mZnNldClcbiAgICAgIHRoaXMub3BzLnB1c2gob3ApXG4gICAgfVxuICAgIHJldHVybiBvZmZzZXRcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gcmVwcmVzZW50YXRpb24gb2YgdGhlIFtbT3BlcmF0aW9uVHhdXS5cbiAgICovXG4gIHRvQnVmZmVyKCk6IEJ1ZmZlciB7XG4gICAgdGhpcy5udW1PcHMud3JpdGVVSW50MzJCRSh0aGlzLm9wcy5sZW5ndGgsIDApXG4gICAgbGV0IGJhcnI6IEJ1ZmZlcltdID0gW3N1cGVyLnRvQnVmZmVyKCksIHRoaXMubnVtT3BzXVxuICAgIHRoaXMub3BzID0gdGhpcy5vcHMuc29ydChUcmFuc2ZlcmFibGVPcGVyYXRpb24uY29tcGFyYXRvcigpKVxuICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCB0aGlzLm9wcy5sZW5ndGg7IGkrKykge1xuICAgICAgYmFyci5wdXNoKHRoaXMub3BzW2Ake2l9YF0udG9CdWZmZXIoKSlcbiAgICB9XG4gICAgcmV0dXJuIEJ1ZmZlci5jb25jYXQoYmFycilcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFuIGFycmF5IG9mIFtbVHJhbnNmZXJhYmxlT3BlcmF0aW9uXV1zIGluIHRoaXMgdHJhbnNhY3Rpb24uXG4gICAqL1xuICBnZXRPcGVyYXRpb25zKCk6IFRyYW5zZmVyYWJsZU9wZXJhdGlvbltdIHtcbiAgICByZXR1cm4gdGhpcy5vcHNcbiAgfVxuXG4gIC8qKlxuICAgKiBUYWtlcyB0aGUgYnl0ZXMgb2YgYW4gW1tVbnNpZ25lZFR4XV0gYW5kIHJldHVybnMgYW4gYXJyYXkgb2YgW1tDcmVkZW50aWFsXV1zXG4gICAqXG4gICAqIEBwYXJhbSBtc2cgQSBCdWZmZXIgZm9yIHRoZSBbW1Vuc2lnbmVkVHhdXVxuICAgKiBAcGFyYW0ga2MgQW4gW1tLZXlDaGFpbl1dIHVzZWQgaW4gc2lnbmluZ1xuICAgKlxuICAgKiBAcmV0dXJucyBBbiBhcnJheSBvZiBbW0NyZWRlbnRpYWxdXXNcbiAgICovXG4gIHNpZ24obXNnOiBCdWZmZXIsIGtjOiBLZXlDaGFpbik6IENyZWRlbnRpYWxbXSB7XG4gICAgY29uc3QgY3JlZHM6IENyZWRlbnRpYWxbXSA9IHN1cGVyLnNpZ24obXNnLCBrYylcbiAgICBmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgdGhpcy5vcHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGNyZWQ6IENyZWRlbnRpYWwgPSBTZWxlY3RDcmVkZW50aWFsQ2xhc3MoXG4gICAgICAgIHRoaXMub3BzW2Ake2l9YF0uZ2V0T3BlcmF0aW9uKCkuZ2V0Q3JlZGVudGlhbElEKClcbiAgICAgIClcbiAgICAgIGNvbnN0IHNpZ2lkeHM6IFNpZ0lkeFtdID0gdGhpcy5vcHNbYCR7aX1gXS5nZXRPcGVyYXRpb24oKS5nZXRTaWdJZHhzKClcbiAgICAgIGZvciAobGV0IGo6IG51bWJlciA9IDA7IGogPCBzaWdpZHhzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgIGNvbnN0IGtleXBhaXI6IEtleVBhaXIgPSBrYy5nZXRLZXkoc2lnaWR4c1tgJHtqfWBdLmdldFNvdXJjZSgpKVxuICAgICAgICBjb25zdCBzaWdudmFsOiBCdWZmZXIgPSBrZXlwYWlyLnNpZ24obXNnKVxuICAgICAgICBjb25zdCBzaWc6IFNpZ25hdHVyZSA9IG5ldyBTaWduYXR1cmUoKVxuICAgICAgICBzaWcuZnJvbUJ1ZmZlcihzaWdudmFsKVxuICAgICAgICBjcmVkLmFkZFNpZ25hdHVyZShzaWcpXG4gICAgICB9XG4gICAgICBjcmVkcy5wdXNoKGNyZWQpXG4gICAgfVxuICAgIHJldHVybiBjcmVkc1xuICB9XG5cbiAgY2xvbmUoKTogdGhpcyB7XG4gICAgY29uc3QgbmV3YmFzZTogT3BlcmF0aW9uVHggPSBuZXcgT3BlcmF0aW9uVHgoKVxuICAgIG5ld2Jhc2UuZnJvbUJ1ZmZlcih0aGlzLnRvQnVmZmVyKCkpXG4gICAgcmV0dXJuIG5ld2Jhc2UgYXMgdGhpc1xuICB9XG5cbiAgY3JlYXRlKC4uLmFyZ3M6IGFueVtdKTogdGhpcyB7XG4gICAgcmV0dXJuIG5ldyBPcGVyYXRpb25UeCguLi5hcmdzKSBhcyB0aGlzXG4gIH1cblxuICAvKipcbiAgICogQ2xhc3MgcmVwcmVzZW50aW5nIGFuIHVuc2lnbmVkIE9wZXJhdGlvbiB0cmFuc2FjdGlvbi5cbiAgICpcbiAgICogQHBhcmFtIG5ldHdvcmtJRCBPcHRpb25hbCBuZXR3b3JrSUQsIFtbRGVmYXVsdE5ldHdvcmtJRF1dXG4gICAqIEBwYXJhbSBibG9ja2NoYWluSUQgT3B0aW9uYWwgYmxvY2tjaGFpbklELCBkZWZhdWx0IEJ1ZmZlci5hbGxvYygzMiwgMTYpXG4gICAqIEBwYXJhbSBvdXRzIE9wdGlvbmFsIGFycmF5IG9mIHRoZSBbW1RyYW5zZmVyYWJsZU91dHB1dF1dc1xuICAgKiBAcGFyYW0gaW5zIE9wdGlvbmFsIGFycmF5IG9mIHRoZSBbW1RyYW5zZmVyYWJsZUlucHV0XV1zXG4gICAqIEBwYXJhbSBtZW1vIE9wdGlvbmFsIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IGZvciB0aGUgbWVtbyBmaWVsZFxuICAgKiBAcGFyYW0gb3BzIEFycmF5IG9mIFtbT3BlcmF0aW9uXV1zIHVzZWQgaW4gdGhlIHRyYW5zYWN0aW9uXG4gICAqL1xuICBjb25zdHJ1Y3RvcihcbiAgICBuZXR3b3JrSUQ6IG51bWJlciA9IERlZmF1bHROZXR3b3JrSUQsXG4gICAgYmxvY2tjaGFpbklEOiBCdWZmZXIgPSBCdWZmZXIuYWxsb2MoMzIsIDE2KSxcbiAgICBvdXRzOiBUcmFuc2ZlcmFibGVPdXRwdXRbXSA9IHVuZGVmaW5lZCxcbiAgICBpbnM6IFRyYW5zZmVyYWJsZUlucHV0W10gPSB1bmRlZmluZWQsXG4gICAgbWVtbzogQnVmZmVyID0gdW5kZWZpbmVkLFxuICAgIG9wczogVHJhbnNmZXJhYmxlT3BlcmF0aW9uW10gPSB1bmRlZmluZWRcbiAgKSB7XG4gICAgc3VwZXIobmV0d29ya0lELCBibG9ja2NoYWluSUQsIG91dHMsIGlucywgbWVtbylcbiAgICBpZiAodHlwZW9mIG9wcyAhPT0gXCJ1bmRlZmluZWRcIiAmJiBBcnJheS5pc0FycmF5KG9wcykpIHtcbiAgICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCBvcHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKCEob3BzW2Ake2l9YF0gaW5zdGFuY2VvZiBUcmFuc2ZlcmFibGVPcGVyYXRpb24pKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IE9wZXJhdGlvbkVycm9yKFxuICAgICAgICAgICAgYEVycm9yIC0gT3BlcmF0aW9uVHguY29uc3RydWN0b3I6IGludmFsaWQgb3AgaW4gYXJyYXkgcGFyYW1ldGVyICR7b3BzfWBcbiAgICAgICAgICApXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHRoaXMub3BzID0gb3BzXG4gICAgfVxuICB9XG59XG4iXX0=
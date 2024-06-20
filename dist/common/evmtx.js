"use strict";
/**
 * @packageDocumentation
 * @module Common-Transactions
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EVMStandardTx = exports.EVMStandardUnsignedTx = exports.EVMStandardBaseTx = void 0;
const buffer_1 = require("buffer/");
const bintools_1 = __importDefault(require("../utils/bintools"));
const bn_js_1 = __importDefault(require("bn.js"));
const input_1 = require("./input");
const output_1 = require("./output");
const constants_1 = require("../utils/constants");
const serialization_1 = require("../utils/serialization");
/**
 * @ignore
 */
const bintools = bintools_1.default.getInstance();
const serializer = serialization_1.Serialization.getInstance();
/**
 * Class representing a base for all transactions.
 */
class EVMStandardBaseTx extends serialization_1.Serializable {
    serialize(encoding = "hex") {
        let fields = super.serialize(encoding);
        return Object.assign(Object.assign({}, fields), { networkID: serializer.encoder(this.networkID, encoding, "Buffer", "decimalString"), blockchainID: serializer.encoder(this.blockchainID, encoding, "Buffer", "cb58") });
    }
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        this.networkID = serializer.decoder(fields["networkID"], encoding, "decimalString", "Buffer", 4);
        this.blockchainID = serializer.decoder(fields["blockchainID"], encoding, "cb58", "Buffer", 32);
    }
    /**
     * @returns The outputOwners of inputs, one per input
     */
    getOutputOwners() {
        if (this._outputOwners) {
            return [...this._outputOwners];
        }
        return [];
    }
    /**
     * @params The outputOwners of inputs, one per input
     */
    setOutputOwners(owners) {
        this._outputOwners = [...owners];
    }
    /**
     * Returns the NetworkID as a number
     */
    getNetworkID() {
        return this.networkID.readUInt32BE(0);
    }
    /**
     * Returns the Buffer representation of the BlockchainID
     */
    getBlockchainID() {
        return this.blockchainID;
    }
    /**
     * Returns a {@link https://github.com/feross/buffer|Buffer} representation of the [[StandardBaseTx]].
     */
    toBuffer() {
        let bsize = this.networkID.length + this.blockchainID.length;
        const barr = [this.networkID, this.blockchainID];
        const buff = buffer_1.Buffer.concat(barr, bsize);
        return buff;
    }
    /**
     * Returns a base-58 representation of the [[StandardBaseTx]].
     */
    toString() {
        return bintools.bufferToB58(this.toBuffer());
    }
    /**
     * Class representing a StandardBaseTx which is the foundation for all transactions.
     *
     * @param networkID Optional networkID, [[DefaultNetworkID]]
     * @param blockchainID Optional blockchainID, default Buffer.alloc(32, 16)
     * @param outs Optional array of the [[TransferableOutput]]s
     * @param ins Optional array of the [[TransferableInput]]s
     */
    constructor(networkID = constants_1.DefaultNetworkID, blockchainID = buffer_1.Buffer.alloc(32, 16)) {
        super();
        this._typeName = "EVMStandardBaseTx";
        this._typeID = undefined;
        this._outputOwners = undefined;
        this.networkID = buffer_1.Buffer.alloc(4);
        this.blockchainID = buffer_1.Buffer.alloc(32);
        this.networkID.writeUInt32BE(networkID, 0);
        this.blockchainID = blockchainID;
    }
}
exports.EVMStandardBaseTx = EVMStandardBaseTx;
/**
 * Class representing an unsigned transaction.
 */
class EVMStandardUnsignedTx extends serialization_1.Serializable {
    serialize(encoding = "hex") {
        let fields = super.serialize(encoding);
        return Object.assign(Object.assign({}, fields), { codecID: serializer.encoder(this.codecID, encoding, "number", "decimalString", 2), transaction: this.transaction.serialize(encoding) });
    }
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        this.codecID = serializer.decoder(fields["codecID"], encoding, "decimalString", "number");
    }
    /**
     * Returns the CodecID as a number
     */
    getCodecID() {
        return this.codecID;
    }
    /**
     * Returns the {@link https://github.com/feross/buffer|Buffer} representation of the CodecID
     */
    getCodecIDBuffer() {
        let codecBuf = buffer_1.Buffer.alloc(2);
        codecBuf.writeUInt16BE(this.codecID, 0);
        return codecBuf;
    }
    /**
     * Returns the inputTotal as a BN
     */
    getInputTotal(assetID) {
        const ins = [];
        const aIDHex = assetID.toString("hex");
        let total = new bn_js_1.default(0);
        ins.forEach((input) => {
            // only check StandardAmountInputs
            if (input.getInput() instanceof input_1.StandardAmountInput &&
                aIDHex === input.getAssetID().toString("hex")) {
                const i = input.getInput();
                total = total.add(i.getAmount());
            }
        });
        return total;
    }
    /**
     * Returns the outputTotal as a BN
     */
    getOutputTotal(assetID) {
        const outs = [];
        const aIDHex = assetID.toString("hex");
        let total = new bn_js_1.default(0);
        outs.forEach((out) => {
            // only check StandardAmountOutput
            if (out.getOutput() instanceof output_1.StandardAmountOutput &&
                aIDHex === out.getAssetID().toString("hex")) {
                const output = out.getOutput();
                total = total.add(output.getAmount());
            }
        });
        return total;
    }
    /**
     * Returns the number of burned tokens as a BN
     */
    getBurn(assetID) {
        return this.getInputTotal(assetID).sub(this.getOutputTotal(assetID));
    }
    toBuffer() {
        const codecID = this.getCodecIDBuffer();
        const txtype = buffer_1.Buffer.alloc(4);
        txtype.writeUInt32BE(this.transaction.getTxType(), 0);
        const basebuff = this.transaction.toBuffer();
        return buffer_1.Buffer.concat([codecID, txtype, basebuff], codecID.length + txtype.length + basebuff.length);
    }
    constructor(transaction = undefined, codecID = 0) {
        super();
        this._typeName = "StandardUnsignedTx";
        this._typeID = undefined;
        this.codecID = 0;
        this.codecID = codecID;
        this.transaction = transaction;
    }
}
exports.EVMStandardUnsignedTx = EVMStandardUnsignedTx;
/**
 * Class representing a signed transaction.
 */
class EVMStandardTx extends serialization_1.Serializable {
    serialize(encoding = "hex") {
        let fields = super.serialize(encoding);
        return Object.assign(Object.assign({}, fields), { unsignedTx: this.unsignedTx.serialize(encoding), credentials: this.credentials.map((c) => c.serialize(encoding)) });
    }
    /**
     * Returns the [[StandardUnsignedTx]]
     */
    getUnsignedTx() {
        return this.unsignedTx;
    }
    /**
     * Returns a {@link https://github.com/feross/buffer|Buffer} representation of the [[StandardTx]].
     */
    toBuffer() {
        const txbuff = this.unsignedTx.toBuffer();
        let bsize = txbuff.length;
        const credlen = buffer_1.Buffer.alloc(4);
        credlen.writeUInt32BE(this.credentials.length, 0);
        const barr = [txbuff, credlen];
        bsize += credlen.length;
        this.credentials.forEach((credential) => {
            const credid = buffer_1.Buffer.alloc(4);
            credid.writeUInt32BE(credential.getCredentialID(), 0);
            barr.push(credid);
            bsize += credid.length;
            const credbuff = credential.toBuffer();
            bsize += credbuff.length;
            barr.push(credbuff);
        });
        const buff = buffer_1.Buffer.concat(barr, bsize);
        return buff;
    }
    /**
     * Takes a base-58 string containing an [[StandardTx]], parses it, populates the class, and returns the length of the Tx in bytes.
     *
     * @param serialized A base-58 string containing a raw [[StandardTx]]
     *
     * @returns The length of the raw [[StandardTx]]
     *
     * @remarks
     * unlike most fromStrings, it expects the string to be serialized in cb58 format
     */
    fromString(serialized) {
        return this.fromBuffer(bintools.cb58Decode(serialized));
    }
    /**
     * Returns a cb58 representation of the [[StandardTx]].
     *
     * @remarks
     * unlike most toStrings, this returns in cb58 serialization format
     */
    toString() {
        return bintools.cb58Encode(this.toBuffer());
    }
    toStringHex() {
        return `0x${bintools.addChecksum(this.toBuffer()).toString("hex")}`;
    }
    /**
     * Class representing a signed transaction.
     *
     * @param unsignedTx Optional [[StandardUnsignedTx]]
     * @param signatures Optional array of [[Credential]]s
     */
    constructor(unsignedTx = undefined, credentials = undefined) {
        super();
        this._typeName = "StandardTx";
        this._typeID = undefined;
        this.unsignedTx = undefined;
        this.credentials = [];
        if (typeof unsignedTx !== "undefined") {
            this.unsignedTx = unsignedTx;
            if (typeof credentials !== "undefined") {
                this.credentials = credentials;
            }
        }
    }
}
exports.EVMStandardTx = EVMStandardTx;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZtdHguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29tbW9uL2V2bXR4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O0dBR0c7Ozs7OztBQUVILG9DQUFnQztBQUNoQyxpRUFBd0M7QUFFeEMsa0RBQXNCO0FBRXRCLG1DQUF3RTtBQUN4RSxxQ0FJaUI7QUFDakIsa0RBQXFEO0FBQ3JELDBEQUkrQjtBQUUvQjs7R0FFRztBQUNILE1BQU0sUUFBUSxHQUFhLGtCQUFRLENBQUMsV0FBVyxFQUFFLENBQUE7QUFDakQsTUFBTSxVQUFVLEdBQWtCLDZCQUFhLENBQUMsV0FBVyxFQUFFLENBQUE7QUFFN0Q7O0dBRUc7QUFDSCxNQUFzQixpQkFHcEIsU0FBUSw0QkFBWTtJQUtwQixTQUFTLENBQUMsV0FBK0IsS0FBSztRQUM1QyxJQUFJLE1BQU0sR0FBVyxLQUFLLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFBO1FBQzlDLHVDQUNLLE1BQU0sS0FDVCxTQUFTLEVBQUUsVUFBVSxDQUFDLE9BQU8sQ0FDM0IsSUFBSSxDQUFDLFNBQVMsRUFDZCxRQUFRLEVBQ1IsUUFBUSxFQUNSLGVBQWUsQ0FDaEIsRUFDRCxZQUFZLEVBQUUsVUFBVSxDQUFDLE9BQU8sQ0FDOUIsSUFBSSxDQUFDLFlBQVksRUFDakIsUUFBUSxFQUNSLFFBQVEsRUFDUixNQUFNLENBQ1AsSUFDRjtJQUNILENBQUM7SUFFRCxXQUFXLENBQUMsTUFBYyxFQUFFLFdBQStCLEtBQUs7UUFDOUQsS0FBSyxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUE7UUFDbkMsSUFBSSxDQUFDLFNBQVMsR0FBRyxVQUFVLENBQUMsT0FBTyxDQUNqQyxNQUFNLENBQUMsV0FBVyxDQUFDLEVBQ25CLFFBQVEsRUFDUixlQUFlLEVBQ2YsUUFBUSxFQUNSLENBQUMsQ0FDRixDQUFBO1FBQ0QsSUFBSSxDQUFDLFlBQVksR0FBRyxVQUFVLENBQUMsT0FBTyxD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QXJGQyxjQUFTLEdBQUcsWUFBWSxDQUFBO1FBQ3hCLFlBQU8sR0FBRyxTQUFTLENBQUE7UUFXbkIsZUFBVSxHQUFVLFNBQVMsQ0FBQTtRQUM3QixnQkFBVyxHQUFpQixFQUFFLENBQUE7UUF5RXRDLElBQUksT0FBTyxVQUFVLEtBQUssV0FBVyxFQUFFO1lBQ3JDLElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFBO1lBQzVCLElBQUksT0FBTyxXQUFXLEtBQUssV0FBVyxFQUFFO2dCQUN0QyxJQUFJLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQTthQUMvQjtTQUNGO0lBQ0gsQ0FBQztDQUNGO0FBdEdELHNDQXNHQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQHBhY2thZ2VEb2N1bWVudGF0aW9uXG4gKiBAbW9kdWxlIENvbW1vbi1UcmFuc2FjdGlvbnNcbiAqL1xuXG5pbXBvcnQgeyBCdWZmZXIgfSBmcm9tIFwiYnVmZmVyL1wiXG5pbXBvcnQgQmluVG9vbHMgZnJvbSBcIi4uL3V0aWxzL2JpbnRvb2xzXCJcbmltcG9ydCB7IENyZWRlbnRpYWwgfSBmcm9tIFwiLi9jcmVkZW50aWFsc1wiXG5pbXBvcnQgQk4gZnJvbSBcImJuLmpzXCJcbmltcG9ydCB7IFNpZ25lcktleUNoYWluLCBTaWduZXJLZXlQYWlyIH0gZnJvbSBcIi4va2V5Y2hhaW5cIlxuaW1wb3J0IHsgU3RhbmRhcmRBbW91bnRJbnB1dCwgU3RhbmRhcmRUcmFuc2ZlcmFibGVJbnB1dCB9IGZyb20gXCIuL2lucHV0XCJcbmltcG9ydCB7XG4gIE91dHB1dE93bmVycyxcbiAgU3RhbmRhcmRBbW91bnRPdXRwdXQsXG4gIFN0YW5kYXJkVHJhbnNmZXJhYmxlT3V0cHV0XG59IGZyb20gXCIuL291dHB1dFwiXG5pbXBvcnQgeyBEZWZhdWx0TmV0d29ya0lEIH0gZnJvbSBcIi4uL3V0aWxzL2NvbnN0YW50c1wiXG5pbXBvcnQge1xuICBTZXJpYWxpemFibGUsXG4gIFNlcmlhbGl6YXRpb24sXG4gIFNlcmlhbGl6ZWRFbmNvZGluZ1xufSBmcm9tIFwiLi4vdXRpbHMvc2VyaWFsaXphdGlvblwiXG5cbi8qKlxuICogQGlnbm9yZVxuICovXG5jb25zdCBiaW50b29sczogQmluVG9vbHMgPSBCaW5Ub29scy5nZXRJbnN0YW5jZSgpXG5jb25zdCBzZXJpYWxpemVyOiBTZXJpYWxpemF0aW9uID0gU2VyaWFsaXphdGlvbi5nZXRJbnN0YW5jZSgpXG5cbi8qKlxuICogQ2xhc3MgcmVwcmVzZW50aW5nIGEgYmFzZSBmb3IgYWxsIHRyYW5zYWN0aW9ucy5cbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEVWTVN0YW5kYXJkQmFzZVR4PFxuICBLUENsYXNzIGV4dGVuZHMgU2lnbmVyS2V5UGFpcixcbiAgS0NDbGFzcyBleHRlbmRzIFNpZ25lcktleUNoYWluXG4+IGV4dGVuZHMgU2VyaWFsaXphYmxlIHtcbiAgcHJvdGVjdGVkIF90eXBlTmFtZSA9IFwiRVZNU3RhbmRhcmRCYXNlVHhcIlxuICBwcm90ZWN0ZWQgX3R5cGVJRCA9IHVuZGVmaW5lZFxuICBwcm90ZWN0ZWQgX291dHB1dE93bmVyczogT3V0cHV0T3duZXJzW10gPSB1bmRlZmluZWRcblxuICBzZXJpYWxpemUoZW5jb2Rpbmc6IFNlcmlhbGl6ZWRFbmNvZGluZyA9IFwiaGV4XCIpOiBvYmplY3Qge1xuICAgIGxldCBmaWVsZHM6IG9iamVjdCA9IHN1cGVyLnNlcmlhbGl6ZShlbmNvZGluZylcbiAgICByZXR1cm4ge1xuICAgICAgLi4uZmllbGRzLFxuICAgICAgbmV0d29ya0lEOiBzZXJpYWxpemVyLmVuY29kZXIoXG4gICAgICAgIHRoaXMubmV0d29ya0lELFxuICAgICAgICBlbmNvZGluZyxcbiAgICAgICAgXCJCdWZmZXJcIixcbiAgICAgICAgXCJkZWNpbWFsU3RyaW5nXCJcbiAgICAgICksXG4gICAgICBibG9ja2NoYWluSUQ6IHNlcmlhbGl6ZXIuZW5jb2RlcihcbiAgICAgICAgdGhpcy5ibG9ja2NoYWluSUQsXG4gICAgICAgIGVuY29kaW5nLFxuICAgICAgICBcIkJ1ZmZlclwiLFxuICAgICAgICBcImNiNThcIlxuICAgICAgKVxuICAgIH1cbiAgfVxuXG4gIGRlc2VyaWFsaXplKGZpZWxkczogb2JqZWN0LCBlbmNvZGluZzogU2VyaWFsaXplZEVuY29kaW5nID0gXCJoZXhcIikge1xuICAgIHN1cGVyLmRlc2VyaWFsaXplKGZpZWxkcywgZW5jb2RpbmcpXG4gICAgdGhpcy5uZXR3b3JrSUQgPSBzZXJpYWxpemVyLmRlY29kZXIoXG4gICAgICBmaWVsZHNbXCJuZXR3b3JrSURcIl0sXG4gICAgICBlbmNvZGluZyxcbiAgICAgIFwiZGVjaW1hbFN0cmluZ1wiLFxuICAgICAgXCJCdWZmZXJcIixcbiAgICAgIDRcbiAgICApXG4gICAgdGhpcy5ibG9ja2NoYWluSUQgPSBzZXJpYWxpemVyLmRlY29kZXIoXG4gICAgICBmaWVsZHNbXCJibG9ja2NoYWluSURcIl0sXG4gICAgICBlbmNvZGluZyxcbiAgICAgIFwiY2I1OFwiLFxuICAgICAgXCJCdWZmZXJcIixcbiAgICAgIDMyXG4gICAgKVxuICB9XG5cbiAgcHJvdGVjdGVkIG5ldHdvcmtJRDogQnVmZmVyID0gQnVmZmVyLmFsbG9jKDQpXG4gIHByb3RlY3RlZCBibG9ja2NoYWluSUQ6IEJ1ZmZlciA9IEJ1ZmZlci5hbGxvYygzMilcblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgaWQgb2YgdGhlIFtbU3RhbmRhcmRCYXNlVHhdXVxuICAgKi9cbiAgYWJzdHJhY3QgZ2V0VHhUeXBlKCk6IG51bWJlclxuXG4gIC8qKlxuICAgKiBAcmV0dXJucyBUaGUgb3V0cHV0T3duZXJzIG9mIGlucHV0cywgb25lIHBlciBpbnB1dFxuICAgKi9cbiAgZ2V0T3V0cHV0T3duZXJzKCk6IE91dHB1dE93bmVyc1tdIHtcbiAgICBpZiAodGhpcy5fb3V0cHV0T3duZXJzKSB7XG4gICAgICByZXR1cm4gWy4uLnRoaXMuX291dHB1dE93bmVyc11cbiAgICB9XG4gICAgcmV0dXJuIFtdXG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtcyBUaGUgb3V0cHV0T3duZXJzIG9mIGlucHV0cywgb25lIHBlciBpbnB1dFxuICAgKi9cbiAgc2V0T3V0cHV0T3duZXJzKG93bmVyczogT3V0cHV0T3duZXJzW10pIHtcbiAgICB0aGlzLl9vdXRwdXRPd25lcnMgPSBbLi4ub3duZXJzXVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIE5ldHdvcmtJRCBhcyBhIG51bWJlclxuICAgKi9cbiAgZ2V0TmV0d29ya0lEKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMubmV0d29ya0lELnJlYWRVSW50MzJCRSgwKVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIEJ1ZmZlciByZXByZXNlbnRhdGlvbiBvZiB0aGUgQmxvY2tjaGFpbklEXG4gICAqL1xuICBnZXRCbG9ja2NoYWluSUQoKTogQnVmZmVyIHtcbiAgICByZXR1cm4gdGhpcy5ibG9ja2NoYWluSURcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gcmVwcmVzZW50YXRpb24gb2YgdGhlIFtbU3RhbmRhcmRCYXNlVHhdXS5cbiAgICovXG4gIHRvQnVmZmVyKCk6IEJ1ZmZlciB7XG4gICAgbGV0IGJzaXplOiBudW1iZXIgPSB0aGlzLm5ldHdvcmtJRC5sZW5ndGggKyB0aGlzLmJsb2NrY2hhaW5JRC5sZW5ndGhcbiAgICBjb25zdCBiYXJyOiBCdWZmZXJbXSA9IFt0aGlzLm5ldHdvcmtJRCwgdGhpcy5ibG9ja2NoYWluSURdXG4gICAgY29uc3QgYnVmZjogQnVmZmVyID0gQnVmZmVyLmNvbmNhdChiYXJyLCBic2l6ZSlcbiAgICByZXR1cm4gYnVmZlxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBiYXNlLTU4IHJlcHJlc2VudGF0aW9uIG9mIHRoZSBbW1N0YW5kYXJkQmFzZVR4XV0uXG4gICAqL1xuICB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgIHJldHVybiBiaW50b29scy5idWZmZXJUb0I1OCh0aGlzLnRvQnVmZmVyKCkpXG4gIH1cblxuICBhYnN0cmFjdCBjbG9uZSgpOiB0aGlzXG5cbiAgYWJzdHJhY3QgY3JlYXRlKC4uLmFyZ3M6IGFueVtdKTogdGhpc1xuXG4gIGFic3RyYWN0IHNlbGVjdChpZDogbnVtYmVyLCAuLi5hcmdzOiBhbnlbXSk6IHRoaXNcblxuICAvKipcbiAgICogQ2xhc3MgcmVwcmVzZW50aW5nIGEgU3RhbmRhcmRCYXNlVHggd2hpY2ggaXMgdGhlIGZvdW5kYXRpb24gZm9yIGFsbCB0cmFuc2FjdGlvbnMuXG4gICAqXG4gICAqIEBwYXJhbSBuZXR3b3JrSUQgT3B0aW9uYWwgbmV0d29ya0lELCBbW0RlZmF1bHROZXR3b3JrSURdXVxuICAgKiBAcGFyYW0gYmxvY2tjaGFpbklEIE9wdGlvbmFsIGJsb2NrY2hhaW5JRCwgZGVmYXVsdCBCdWZmZXIuYWxsb2MoMzIsIDE2KVxuICAgKiBAcGFyYW0gb3V0cyBPcHRpb25hbCBhcnJheSBvZiB0aGUgW1tUcmFuc2ZlcmFibGVPdXRwdXRdXXNcbiAgICogQHBhcmFtIGlucyBPcHRpb25hbCBhcnJheSBvZiB0aGUgW1tUcmFuc2ZlcmFibGVJbnB1dF1dc1xuICAgKi9cbiAgY29uc3RydWN0b3IoXG4gICAgbmV0d29ya0lEOiBudW1iZXIgPSBEZWZhdWx0TmV0d29ya0lELFxuICAgIGJsb2NrY2hhaW5JRDogQnVmZmVyID0gQnVmZmVyLmFsbG9jKDMyLCAxNilcbiAgKSB7XG4gICAgc3VwZXIoKVxuICAgIHRoaXMubmV0d29ya0lELndyaXRlVUludDMyQkUobmV0d29ya0lELCAwKVxuICAgIHRoaXMuYmxvY2tjaGFpbklEID0gYmxvY2tjaGFpbklEXG4gIH1cbn1cblxuLyoqXG4gKiBDbGFzcyByZXByZXNlbnRpbmcgYW4gdW5zaWduZWQgdHJhbnNhY3Rpb24uXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBFVk1TdGFuZGFyZFVuc2lnbmVkVHg8XG4gIEtQQ2xhc3MgZXh0ZW5kcyBTaWduZXJLZXlQYWlyLFxuICBLQ0NsYXNzIGV4dGVuZHMgU2lnbmVyS2V5Q2hhaW4sXG4gIFNCVHggZXh0ZW5kcyBFVk1TdGFuZGFyZEJhc2VUeDxLUENsYXNzLCBLQ0NsYXNzPlxuPiBleHRlbmRzIFNlcmlhbGl6YWJsZSB7XG4gIHByb3RlY3RlZCBfdHlwZU5hbWUgPSBcIlN0YW5kYXJkVW5zaWduZWRUeFwiXG4gIHByb3RlY3RlZCBfdHlwZUlEID0gdW5kZWZpbmVkXG5cbiAgc2VyaWFsaXplKGVuY29kaW5nOiBTZXJpYWxpemVkRW5jb2RpbmcgPSBcImhleFwiKTogb2JqZWN0IHtcbiAgICBsZXQgZmllbGRzOiBvYmplY3QgPSBzdXBlci5zZXJpYWxpemUoZW5jb2RpbmcpXG4gICAgcmV0dXJuIHtcbiAgICAgIC4uLmZpZWxkcyxcbiAgICAgIGNvZGVjSUQ6IHNlcmlhbGl6ZXIuZW5jb2RlcihcbiAgICAgICAgdGhpcy5jb2RlY0lELFxuICAgICAgICBlbmNvZGluZyxcbiAgICAgICAgXCJudW1iZXJcIixcbiAgICAgICAgXCJkZWNpbWFsU3RyaW5nXCIsXG4gICAgICAgIDJcbiAgICAgICksXG4gICAgICB0cmFuc2FjdGlvbjogdGhpcy50cmFuc2FjdGlvbi5zZXJpYWxpemUoZW5jb2RpbmcpXG4gICAgfVxuICB9XG5cbiAgZGVzZXJpYWxpemUoZmllbGRzOiBvYmplY3QsIGVuY29kaW5nOiBTZXJpYWxpemVkRW5jb2RpbmcgPSBcImhleFwiKSB7XG4gICAgc3VwZXIuZGVzZXJpYWxpemUoZmllbGRzLCBlbmNvZGluZylcbiAgICB0aGlzLmNvZGVjSUQgPSBzZXJpYWxpemVyLmRlY29kZXIoXG4gICAgICBmaWVsZHNbXCJjb2RlY0lEXCJdLFxuICAgICAgZW5jb2RpbmcsXG4gICAgICBcImRlY2ltYWxTdHJpbmdcIixcbiAgICAgIFwibnVtYmVyXCJcbiAgICApXG4gIH1cblxuICBwcm90ZWN0ZWQgY29kZWNJRDogbnVtYmVyID0gMFxuICBwcm90ZWN0ZWQgdHJhbnNhY3Rpb246IFNCVHhcblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgQ29kZWNJRCBhcyBhIG51bWJlclxuICAgKi9cbiAgZ2V0Q29kZWNJRCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmNvZGVjSURcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSByZXByZXNlbnRhdGlvbiBvZiB0aGUgQ29kZWNJRFxuICAgKi9cbiAgZ2V0Q29kZWNJREJ1ZmZlcigpOiBCdWZmZXIge1xuICAgIGxldCBjb2RlY0J1ZjogQnVmZmVyID0gQnVmZmVyLmFsbG9jKDIpXG4gICAgY29kZWNCdWYud3JpdGVVSW50MTZCRSh0aGlzLmNvZGVjSUQsIDApXG4gICAgcmV0dXJuIGNvZGVjQnVmXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgaW5wdXRUb3RhbCBhcyBhIEJOXG4gICAqL1xuICBnZXRJbnB1dFRvdGFsKGFzc2V0SUQ6IEJ1ZmZlcik6IEJOIHtcbiAgICBjb25zdCBpbnM6IFN0YW5kYXJkVHJhbnNmZXJhYmxlSW5wdXRbXSA9IFtdXG4gICAgY29uc3QgYUlESGV4OiBzdHJpbmcgPSBhc3NldElELnRvU3RyaW5nKFwiaGV4XCIpXG4gICAgbGV0IHRvdGFsOiBCTiA9IG5ldyBCTigwKVxuICAgIGlucy5mb3JFYWNoKChpbnB1dDogU3RhbmRhcmRUcmFuc2ZlcmFibGVJbnB1dCkgPT4ge1xuICAgICAgLy8gb25seSBjaGVjayBTdGFuZGFyZEFtb3VudElucHV0c1xuICAgICAgaWYgKFxuICAgICAgICBpbnB1dC5nZXRJbnB1dCgpIGluc3RhbmNlb2YgU3RhbmRhcmRBbW91bnRJbnB1dCAmJlxuICAgICAgICBhSURIZXggPT09IGlucHV0LmdldEFzc2V0SUQoKS50b1N0cmluZyhcImhleFwiKVxuICAgICAgKSB7XG4gICAgICAgIGNvbnN0IGkgPSBpbnB1dC5nZXRJbnB1dCgpIGFzIFN0YW5kYXJkQW1vdW50SW5wdXRcbiAgICAgICAgdG90YWwgPSB0b3RhbC5hZGQoaS5nZXRBbW91bnQoKSlcbiAgICAgIH1cbiAgICB9KVxuICAgIHJldHVybiB0b3RhbFxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIG91dHB1dFRvdGFsIGFzIGEgQk5cbiAgICovXG4gIGdldE91dHB1dFRvdGFsKGFzc2V0SUQ6IEJ1ZmZlcik6IEJOIHtcbiAgICBjb25zdCBvdXRzOiBTdGFuZGFyZFRyYW5zZmVyYWJsZU91dHB1dFtdID0gW11cbiAgICBjb25zdCBhSURIZXg6IHN0cmluZyA9IGFzc2V0SUQudG9TdHJpbmcoXCJoZXhcIilcbiAgICBsZXQgdG90YWw6IEJOID0gbmV3IEJOKDApXG5cbiAgICBvdXRzLmZvckVhY2goKG91dDogU3RhbmRhcmRUcmFuc2ZlcmFibGVPdXRwdXQpID0+IHtcbiAgICAgIC8vIG9ubHkgY2hlY2sgU3RhbmRhcmRBbW91bnRPdXRwdXRcbiAgICAgIGlmIChcbiAgICAgICAgb3V0LmdldE91dHB1dCgpIGluc3RhbmNlb2YgU3RhbmRhcmRBbW91bnRPdXRwdXQgJiZcbiAgICAgICAgYUlESGV4ID09PSBvdXQuZ2V0QXNzZXRJRCgpLnRvU3RyaW5nKFwiaGV4XCIpXG4gICAgICApIHtcbiAgICAgICAgY29uc3Qgb3V0cHV0OiBTdGFuZGFyZEFtb3VudE91dHB1dCA9XG4gICAgICAgICAgb3V0LmdldE91dHB1dCgpIGFzIFN0YW5kYXJkQW1vdW50T3V0cHV0XG4gICAgICAgIHRvdGFsID0gdG90YWwuYWRkKG91dHB1dC5nZXRBbW91bnQoKSlcbiAgICAgIH1cbiAgICB9KVxuICAgIHJldHVybiB0b3RhbFxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIG51bWJlciBvZiBidXJuZWQgdG9rZW5zIGFzIGEgQk5cbiAgICovXG4gIGdldEJ1cm4oYXNzZXRJRDogQnVmZmVyKTogQk4ge1xuICAgIHJldHVybiB0aGlzLmdldElucHV0VG90YWwoYXNzZXRJRCkuc3ViKHRoaXMuZ2V0T3V0cHV0VG90YWwoYXNzZXRJRCkpXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgVHJhbnNhY3Rpb25cbiAgICovXG4gIGFic3RyYWN0IGdldFRyYW5zYWN0aW9uKCk6IFNCVHhcblxuICBhYnN0cmFjdCBmcm9tQnVmZmVyKGJ5dGVzOiBCdWZmZXIsIG9mZnNldD86IG51bWJlcik6IG51bWJlclxuXG4gIHRvQnVmZmVyKCk6IEJ1ZmZlciB7XG4gICAgY29uc3QgY29kZWNJRDogQnVmZmVyID0gdGhpcy5nZXRDb2RlY0lEQnVmZmVyKClcbiAgICBjb25zdCB0eHR5cGU6IEJ1ZmZlciA9IEJ1ZmZlci5hbGxvYyg0KVxuICAgIHR4dHlwZS53cml0ZVVJbnQzMkJFKHRoaXMudHJhbnNhY3Rpb24uZ2V0VHhUeXBlKCksIDApXG4gICAgY29uc3QgYmFzZWJ1ZmY6IEJ1ZmZlciA9IHRoaXMudHJhbnNhY3Rpb24udG9CdWZmZXIoKVxuICAgIHJldHVybiBCdWZmZXIuY29uY2F0KFxuICAgICAgW2NvZGVjSUQsIHR4dHlwZSwgYmFzZWJ1ZmZdLFxuICAgICAgY29kZWNJRC5sZW5ndGggKyB0eHR5cGUubGVuZ3RoICsgYmFzZWJ1ZmYubGVuZ3RoXG4gICAgKVxuICB9XG5cbiAgLyoqXG4gICAqIFNpZ25zIHRoaXMgW1tVbnNpZ25lZFR4XV0gYW5kIHJldHVybnMgc2lnbmVkIFtbU3RhbmRhcmRUeF1dXG4gICAqXG4gICAqIEBwYXJhbSBrYyBBbiBbW0tleUNoYWluXV0gdXNlZCBpbiBzaWduaW5nXG4gICAqXG4gICAqIEByZXR1cm5zIEEgc2lnbmVkIFtbU3RhbmRhcmRUeF1dXG4gICAqL1xuICBhYnN0cmFjdCBzaWduKFxuICAgIGtjOiBLQ0NsYXNzXG4gICk6IEVWTVN0YW5kYXJkVHg8XG4gICAgS1BDbGFzcyxcbiAgICBLQ0NsYXNzLFxuICAgIEVWTVN0YW5kYXJkVW5zaWduZWRUeDxLUENsYXNzLCBLQ0NsYXNzLCBTQlR4PlxuICA+XG5cbiAgY29uc3RydWN0b3IodHJhbnNhY3Rpb246IFNCVHggPSB1bmRlZmluZWQsIGNvZGVjSUQ6IG51bWJlciA9IDApIHtcbiAgICBzdXBlcigpXG4gICAgdGhpcy5jb2RlY0lEID0gY29kZWNJRFxuICAgIHRoaXMudHJhbnNhY3Rpb24gPSB0cmFuc2FjdGlvblxuICB9XG59XG5cbi8qKlxuICogQ2xhc3MgcmVwcmVzZW50aW5nIGEgc2lnbmVkIHRyYW5zYWN0aW9uLlxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgRVZNU3RhbmRhcmRUeDxcbiAgS1BDbGFzcyBleHRlbmRzIFNpZ25lcktleVBhaXIsXG4gIEtDQ2xhc3MgZXh0ZW5kcyBTaWduZXJLZXlDaGFpbixcbiAgU1VCVHggZXh0ZW5kcyBFVk1TdGFuZGFyZFVuc2lnbmVkVHg8XG4gICAgS1BDbGFzcyxcbiAgICBLQ0NsYXNzLFxuICAgIEVWTVN0YW5kYXJkQmFzZVR4PEtQQ2xhc3MsIEtDQ2xhc3M+XG4gID5cbj4gZXh0ZW5kcyBTZXJpYWxpemFibGUge1xuICBwcm90ZWN0ZWQgX3R5cGVOYW1lID0gXCJTdGFuZGFyZFR4XCJcbiAgcHJvdGVjdGVkIF90eXBlSUQgPSB1bmRlZmluZWRcblxuICBzZXJpYWxpemUoZW5jb2Rpbmc6IFNlcmlhbGl6ZWRFbmNvZGluZyA9IFwiaGV4XCIpOiBvYmplY3Qge1xuICAgIGxldCBmaWVsZHM6IG9iamVjdCA9IHN1cGVyLnNlcmlhbGl6ZShlbmNvZGluZylcbiAgICByZXR1cm4ge1xuICAgICAgLi4uZmllbGRzLFxuICAgICAgdW5zaWduZWRUeDogdGhpcy51bnNpZ25lZFR4LnNlcmlhbGl6ZShlbmNvZGluZyksXG4gICAgICBjcmVkZW50aWFsczogdGhpcy5jcmVkZW50aWFscy5tYXAoKGMpID0+IGMuc2VyaWFsaXplKGVuY29kaW5nKSlcbiAgICB9XG4gIH1cblxuICBwcm90ZWN0ZWQgdW5zaWduZWRUeDogU1VCVHggPSB1bmRlZmluZWRcbiAgcHJvdGVjdGVkIGNyZWRlbnRpYWxzOiBDcmVkZW50aWFsW10gPSBbXVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBbW1N0YW5kYXJkVW5zaWduZWRUeF1dXG4gICAqL1xuICBnZXRVbnNpZ25lZFR4KCk6IFNVQlR4IHtcbiAgICByZXR1cm4gdGhpcy51bnNpZ25lZFR4XG4gIH1cblxuICBhYnN0cmFjdCBmcm9tQnVmZmVyKGJ5dGVzOiBCdWZmZXIsIG9mZnNldD86IG51bWJlcik6IG51bWJlclxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gcmVwcmVzZW50YXRpb24gb2YgdGhlIFtbU3RhbmRhcmRUeF1dLlxuICAgKi9cbiAgdG9CdWZmZXIoKTogQnVmZmVyIHtcbiAgICBjb25zdCB0eGJ1ZmY6IEJ1ZmZlciA9IHRoaXMudW5zaWduZWRUeC50b0J1ZmZlcigpXG4gICAgbGV0IGJzaXplOiBudW1iZXIgPSB0eGJ1ZmYubGVuZ3RoXG4gICAgY29uc3QgY3JlZGxlbjogQnVmZmVyID0gQnVmZmVyLmFsbG9jKDQpXG4gICAgY3JlZGxlbi53cml0ZVVJbnQzMkJFKHRoaXMuY3JlZGVudGlhbHMubGVuZ3RoLCAwKVxuICAgIGNvbnN0IGJhcnI6IEJ1ZmZlcltdID0gW3R4YnVmZiwgY3JlZGxlbl1cbiAgICBic2l6ZSArPSBjcmVkbGVuLmxlbmd0aFxuICAgIHRoaXMuY3JlZGVudGlhbHMuZm9yRWFjaCgoY3JlZGVudGlhbDogQ3JlZGVudGlhbCkgPT4ge1xuICAgICAgY29uc3QgY3JlZGlkOiBCdWZmZXIgPSBCdWZmZXIuYWxsb2MoNClcbiAgICAgIGNyZWRpZC53cml0ZVVJbnQzMkJFKGNyZWRlbnRpYWwuZ2V0Q3JlZGVudGlhbElEKCksIDApXG4gICAgICBiYXJyLnB1c2goY3JlZGlkKVxuICAgICAgYnNpemUgKz0gY3JlZGlkLmxlbmd0aFxuICAgICAgY29uc3QgY3JlZGJ1ZmY6IEJ1ZmZlciA9IGNyZWRlbnRpYWwudG9CdWZmZXIoKVxuICAgICAgYnNpemUgKz0gY3JlZGJ1ZmYubGVuZ3RoXG4gICAgICBiYXJyLnB1c2goY3JlZGJ1ZmYpXG4gICAgfSlcbiAgICBjb25zdCBidWZmOiBCdWZmZXIgPSBCdWZmZXIuY29uY2F0KGJhcnIsIGJzaXplKVxuICAgIHJldHVybiBidWZmXG4gIH1cblxuICAvKipcbiAgICogVGFrZXMgYSBiYXNlLTU4IHN0cmluZyBjb250YWluaW5nIGFuIFtbU3RhbmRhcmRUeF1dLCBwYXJzZXMgaXQsIHBvcHVsYXRlcyB0aGUgY2xhc3MsIGFuZCByZXR1cm5zIHRoZSBsZW5ndGggb2YgdGhlIFR4IGluIGJ5dGVzLlxuICAgKlxuICAgKiBAcGFyYW0gc2VyaWFsaXplZCBBIGJhc2UtNTggc3RyaW5nIGNvbnRhaW5pbmcgYSByYXcgW1tTdGFuZGFyZFR4XV1cbiAgICpcbiAgICogQHJldHVybnMgVGhlIGxlbmd0aCBvZiB0aGUgcmF3IFtbU3RhbmRhcmRUeF1dXG4gICAqXG4gICAqIEByZW1hcmtzXG4gICAqIHVubGlrZSBtb3N0IGZyb21TdHJpbmdzLCBpdCBleHBlY3RzIHRoZSBzdHJpbmcgdG8gYmUgc2VyaWFsaXplZCBpbiBjYjU4IGZvcm1hdFxuICAgKi9cbiAgZnJvbVN0cmluZyhzZXJpYWxpemVkOiBzdHJpbmcpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmZyb21CdWZmZXIoYmludG9vbHMuY2I1OERlY29kZShzZXJpYWxpemVkKSlcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgY2I1OCByZXByZXNlbnRhdGlvbiBvZiB0aGUgW1tTdGFuZGFyZFR4XV0uXG4gICAqXG4gICAqIEByZW1hcmtzXG4gICAqIHVubGlrZSBtb3N0IHRvU3RyaW5ncywgdGhpcyByZXR1cm5zIGluIGNiNTggc2VyaWFsaXphdGlvbiBmb3JtYXRcbiAgICovXG4gIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGJpbnRvb2xzLmNiNThFbmNvZGUodGhpcy50b0J1ZmZlcigpKVxuICB9XG5cbiAgdG9TdHJpbmdIZXgoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYDB4JHtiaW50b29scy5hZGRDaGVja3N1bSh0aGlzLnRvQnVmZmVyKCkpLnRvU3RyaW5nKFwiaGV4XCIpfWBcbiAgfVxuXG4gIC8qKlxuICAgKiBDbGFzcyByZXByZXNlbnRpbmcgYSBzaWduZWQgdHJhbnNhY3Rpb24uXG4gICAqXG4gICAqIEBwYXJhbSB1bnNpZ25lZFR4IE9wdGlvbmFsIFtbU3RhbmRhcmRVbnNpZ25lZFR4XV1cbiAgICogQHBhcmFtIHNpZ25hdHVyZXMgT3B0aW9uYWwgYXJyYXkgb2YgW1tDcmVkZW50aWFsXV1zXG4gICAqL1xuICBjb25zdHJ1Y3RvcihcbiAgICB1bnNpZ25lZFR4OiBTVUJUeCA9IHVuZGVmaW5lZCxcbiAgICBjcmVkZW50aWFsczogQ3JlZGVudGlhbFtdID0gdW5kZWZpbmVkXG4gICkge1xuICAgIHN1cGVyKClcbiAgICBpZiAodHlwZW9mIHVuc2lnbmVkVHggIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIHRoaXMudW5zaWduZWRUeCA9IHVuc2lnbmVkVHhcbiAgICAgIGlmICh0eXBlb2YgY3JlZGVudGlhbHMgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgdGhpcy5jcmVkZW50aWFscyA9IGNyZWRlbnRpYWxzXG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iXX0=
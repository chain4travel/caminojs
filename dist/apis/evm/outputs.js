"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EVMOutput = exports.SECPTransferOutput = exports.AmountOutput = exports.TransferableOutput = exports.SelectOutputClass = void 0;
/**
 * @packageDocumentation
 * @module API-EVM-Outputs
 */
const buffer_1 = require("buffer/");
const bn_js_1 = __importDefault(require("bn.js"));
const bintools_1 = __importDefault(require("../../utils/bintools"));
const constants_1 = require("./constants");
const output_1 = require("../../common/output");
const serialization_1 = require("../../utils/serialization");
const errors_1 = require("../../utils/errors");
const bintools = bintools_1.default.getInstance();
const serializer = serialization_1.Serialization.getInstance();
/**
 * Takes a buffer representing the output and returns the proper Output instance.
 *
 * @param outputID A number representing the outputID parsed prior to the bytes passed in
 *
 * @returns An instance of an [[Output]]-extended class.
 */
const SelectOutputClass = (outputID, ...args) => {
    if (outputID == constants_1.EVMConstants.SECPXFEROUTPUTID) {
        return new SECPTransferOutput(...args);
    }
    throw new errors_1.OutputIdError("Error - SelectOutputClass: unknown outputID");
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
        this.assetID = bintools.copyFrom(bytes, offset, offset + constants_1.EVMConstants.ASSETIDLEN);
        offset += constants_1.EVMConstants.ASSETIDLEN;
        const outputid = bintools
            .copyFrom(bytes, offset, offset + 4)
            .readUInt32BE(0);
        offset += 4;
        this.output = (0, exports.SelectOutputClass)(outputid);
        return this.output.fromBuffer(bytes, offset);
    }
}
exports.TransferableOutput = TransferableOutput;
class AmountOutput extends output_1.StandardAmountOutput {
    constructor() {
        super(...arguments);
        this._typeName = "AmountOutput";
        this._typeID = undefined;
    }
    //serialize and deserialize both are inherited
    /**
     *
     * @param assetID An assetID which is wrapped around the Buffer of the Output
     */
    makeTransferable(assetID) {
        return new TransferableOutput(assetID, this);
    }
    select(id, ...args) {
        return (0, exports.SelectOutputClass)(id, ...args);
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
        this._typeID = constants_1.EVMConstants.SECPXFEROUTPUTID;
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
class EVMOutput {
    serialize(encoding = "hex") {
        return {
            address: serializer.encoder(this.address, encoding, "Buffer", "hex"),
            amount: serializer.encoder(this.amount, encoding, "Buffer", "decimalString"),
            assetID: serializer.encoder(this.assetID, encoding, "Buffer", "cb58")
        };
    }
    /**
     * Returns a {@link https://github.com/feross/buffer|Buffer} representation of the [[EVMOutput]].
     */
    toBuffer() {
        const bsize = this.address.length + this.amount.length + this.assetID.length;
        const barr = [this.address, this.amount, this.assetID];
        const buff = buffer_1.Buffer.concat(barr, bsize);
        return buff;
    }
    /**
     * Decodes the [[EVMOutput]] as a {@link https://github.com/feross/buffer|Buffer} and returns the size.
     */
    fromBuffer(bytes, offset = 0) {
        this.address = bintools.copyFrom(bytes, offset, offset + 20);
        offset += 20;
        this.amount = bintools.copyFrom(bytes, offset, offset + 8);
        offset += 8;
        this.assetID = bintools.copyFrom(bytes, offset, offset + 32);
        offset += 32;
        this.amountValue = new bn_js_1.default(this.amount);
        return offset;
    }
    /**
     * Returns a base-58 representation of the [[EVMOutput]].
     */
    toString() {
        return bintools.bufferToB58(this.toBuffer());
    }
    create(...args) {
        return new EVMOutput(...args);
    }
    clone() {
        const newEVMOutput = this.create();
        newEVMOutput.fromBuffer(this.toBuffer());
        return newEVMOutput;
    }
    /**
     * An [[EVMOutput]] class which contains address, amount, and assetID.
     *
     * @param address The address recieving the asset as a {@link https://github.com/feross/buffer|Buffer} or a string.
     * @param amount A {@link https://github.com/indutny/bn.js/|BN} or number representing the amount.
     * @param assetID The assetID which is being sent as a {@link https://github.com/feross/buffer|Buffer} or a string.
     */
    constructor(address = undefined, amount = undefined, assetID = undefined) {
        this.address = buffer_1.Buffer.alloc(20);
        this.amount = buffer_1.Buffer.alloc(8);
        this.amountValue = new bn_js_1.default(0);
        this.assetID = buffer_1.Buffer.alloc(32);
        /**
         * Returns the address of the input as {@link https://github.com/feross/buffer|Buffer}
         */
        this.getAddress = () => this.address;
        /**
         * Returns the address as a bech32 encoded string.
         */
        this.getAddressString = () => this.address.toString("hex");
        /**
         * Returns the amount as a {@link https://github.com/indutny/bn.js/|BN}.
         */
        this.getAmount = () => this.amountValue.clone();
        /**
         * Returns the assetID of the input as {@link https://github.com/feross/buffer|Buffer}
         */
        this.getAssetID = () => this.assetID;
        if (typeof address !== "undefined" &&
            typeof amount !== "undefined" &&
            typeof assetID !== "undefined") {
            if (typeof address === "string") {
                // if present then remove `0x` prefix
                const prefix = address.substring(0, 2);
                if (prefix === "0x") {
                    address = address.split("x")[1];
                }
                address = buffer_1.Buffer.from(address, "hex");
            }
            // convert number amount to BN
            let amnt;
            if (typeof amount === "number") {
                amnt = new bn_js_1.default(amount);
            }
            else {
                amnt = amount;
            }
            // convert string assetID to Buffer
            if (!(assetID instanceof buffer_1.Buffer)) {
                assetID = bintools.cb58Decode(assetID);
            }
            this.address = address;
            this.amountValue = amnt.clone();
            this.amount = bintools.fromBNToBuffer(amnt, 8);
            this.assetID = assetID;
        }
    }
}
exports.EVMOutput = EVMOutput;
/**
 * Returns a function used to sort an array of [[EVMOutput]]s
 */
EVMOutput.comparator = () => (a, b) => {
    // primarily sort by address
    let sorta = a.getAddress();
    let sortb = b.getAddress();
    // secondarily sort by assetID
    if (sorta.equals(sortb)) {
        sorta = a.getAssetID();
        sortb = b.getAssetID();
    }
    return buffer_1.Buffer.compare(sorta, sortb);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3V0cHV0cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hcGlzL2V2bS9vdXRwdXRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBOzs7R0FHRztBQUNILG9DQUFnQztBQUNoQyxrREFBc0I7QUFDdEIsb0VBQTJDO0FBQzNDLDJDQUEwQztBQUMxQyxnREFJNEI7QUFDNUIsNkRBQTZFO0FBRTdFLCtDQUFrRDtBQUVsRCxNQUFNLFFBQVEsR0FBYSxrQkFBUSxDQUFDLFdBQVcsRUFBRSxDQUFBO0FBQ2pELE1BQU0sVUFBVSxHQUFHLDZCQUFhLENBQUMsV0FBVyxFQUFFLENBQUE7QUFFOUM7Ozs7OztHQU1HO0FBQ0ksTUFBTSxpQkFBaUIsR0FBRyxDQUFDLFFBQWdCLEVBQUUsR0FBRyxJQUFXLEVBQVUsRUFBRTtJQUM1RSxJQUFJLFFBQVEsSUFBSSx3QkFBWSxDQUFDLGdCQUFnQixFQUFFO1FBQzdDLE9BQU8sSUFBSSxrQkFBa0IsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFBO0tBQ3ZDO0lBQ0QsTUFBTSxJQUFJLHNCQUFhLENBQUMsNkNBQTZDLENBQUMsQ0FBQTtBQUN4RSxDQUFDLENBQUE7QUFMWSxRQUFBLGlCQUFpQixxQkFLN0I7QUFFRCxNQUFhLGtCQUFtQixTQUFRLG1DQUEwQjtJQUFsRTs7UUFDWSxjQUFTLEdBQUcsb0JBQW9CLENBQUE7UUFDaEMsWUFBTyxHQUFHLFNBQVMsQ0FBQTtJQXdCL0IsQ0FBQztJQXRCQyx3QkFBd0I7SUFFeEIsV0FBVyxDQUFDLE1BQWMsRUFBRSxXQUErQixLQUFLO1FBQzlELEtBQUssQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFBO1FBQ25DLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBQSx5QkFBaUIsRUFBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQTtRQUM1RCxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FB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QUMsVUFBVSxFQUFFLENBQUE7S0FDdkI7SUFDRCxPQUFPLGVBQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBZSxDQUFBO0FBQ25ELENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQHBhY2thZ2VEb2N1bWVudGF0aW9uXG4gKiBAbW9kdWxlIEFQSS1FVk0tT3V0cHV0c1xuICovXG5pbXBvcnQgeyBCdWZmZXIgfSBmcm9tIFwiYnVmZmVyL1wiXG5pbXBvcnQgQk4gZnJvbSBcImJuLmpzXCJcbmltcG9ydCBCaW5Ub29scyBmcm9tIFwiLi4vLi4vdXRpbHMvYmludG9vbHNcIlxuaW1wb3J0IHsgRVZNQ29uc3RhbnRzIH0gZnJvbSBcIi4vY29uc3RhbnRzXCJcbmltcG9ydCB7XG4gIE91dHB1dCxcbiAgU3RhbmRhcmRBbW91bnRPdXRwdXQsXG4gIFN0YW5kYXJkVHJhbnNmZXJhYmxlT3V0cHV0XG59IGZyb20gXCIuLi8uLi9jb21tb24vb3V0cHV0XCJcbmltcG9ydCB7IFNlcmlhbGl6YXRpb24sIFNlcmlhbGl6ZWRFbmNvZGluZyB9IGZyb20gXCIuLi8uLi91dGlscy9zZXJpYWxpemF0aW9uXCJcbmltcG9ydCB7IEVWTUlucHV0IH0gZnJvbSBcIi4vaW5wdXRzXCJcbmltcG9ydCB7IE91dHB1dElkRXJyb3IgfSBmcm9tIFwiLi4vLi4vdXRpbHMvZXJyb3JzXCJcblxuY29uc3QgYmludG9vbHM6IEJpblRvb2xzID0gQmluVG9vbHMuZ2V0SW5zdGFuY2UoKVxuY29uc3Qgc2VyaWFsaXplciA9IFNlcmlhbGl6YXRpb24uZ2V0SW5zdGFuY2UoKVxuXG4vKipcbiAqIFRha2VzIGEgYnVmZmVyIHJlcHJlc2VudGluZyB0aGUgb3V0cHV0IGFuZCByZXR1cm5zIHRoZSBwcm9wZXIgT3V0cHV0IGluc3RhbmNlLlxuICpcbiAqIEBwYXJhbSBvdXRwdXRJRCBBIG51bWJlciByZXByZXNlbnRpbmcgdGhlIG91dHB1dElEIHBhcnNlZCBwcmlvciB0byB0aGUgYnl0ZXMgcGFzc2VkIGluXG4gKlxuICogQHJldHVybnMgQW4gaW5zdGFuY2Ugb2YgYW4gW1tPdXRwdXRdXS1leHRlbmRlZCBjbGFzcy5cbiAqL1xuZXhwb3J0IGNvbnN0IFNlbGVjdE91dHB1dENsYXNzID0gKG91dHB1dElEOiBudW1iZXIsIC4uLmFyZ3M6IGFueVtdKTogT3V0cHV0ID0+IHtcbiAgaWYgKG91dHB1dElEID09IEVWTUNvbnN0YW50cy5TRUNQWEZFUk9VVFBVVElEKSB7XG4gICAgcmV0dXJuIG5ldyBTRUNQVHJhbnNmZXJPdXRwdXQoLi4uYXJncylcbiAgfVxuICB0aHJvdyBuZXcgT3V0cHV0SWRFcnJvcihcIkVycm9yIC0gU2VsZWN0T3V0cHV0Q2xhc3M6IHVua25vd24gb3V0cHV0SURcIilcbn1cblxuZXhwb3J0IGNsYXNzIFRyYW5zZmVyYWJsZU91dHB1dCBleHRlbmRzIFN0YW5kYXJkVHJhbnNmZXJhYmxlT3V0cHV0IHtcbiAgcHJvdGVjdGVkIF90eXBlTmFtZSA9IFwiVHJhbnNmZXJhYmxlT3V0cHV0XCJcbiAgcHJvdGVjdGVkIF90eXBlSUQgPSB1bmRlZmluZWRcblxuICAvL3NlcmlhbGl6ZSBpcyBpbmhlcml0ZWRcblxuICBkZXNlcmlhbGl6ZShmaWVsZHM6IG9iamVjdCwgZW5jb2Rpbmc6IFNlcmlhbGl6ZWRFbmNvZGluZyA9IFwiaGV4XCIpIHtcbiAgICBzdXBlci5kZXNlcmlhbGl6ZShmaWVsZHMsIGVuY29kaW5nKVxuICAgIHRoaXMub3V0cHV0ID0gU2VsZWN0T3V0cHV0Q2xhc3MoZmllbGRzW1wib3V0cHV0XCJdW1wiX3R5cGVJRFwiXSlcbiAgICB0aGlzLm91dHB1dC5kZXNlcmlhbGl6ZShmaWVsZHNbXCJvdXRwdXRcIl0sIGVuY29kaW5nKVxuICB9XG5cbiAgZnJvbUJ1ZmZlcihieXRlczogQnVmZmVyLCBvZmZzZXQ6IG51bWJlciA9IDApOiBudW1iZXIge1xuICAgIHRoaXMuYXNzZXRJRCA9IGJpbnRvb2xzLmNvcHlGcm9tKFxuICAgICAgYnl0ZXMsXG4gICAgICBvZmZzZXQsXG4gICAgICBvZmZzZXQgKyBFVk1Db25zdGFudHMuQVNTRVRJRExFTlxuICAgIClcbiAgICBvZmZzZXQgKz0gRVZNQ29uc3RhbnRzLkFTU0VUSURMRU5cbiAgICBjb25zdCBvdXRwdXRpZDogbnVtYmVyID0gYmludG9vbHNcbiAgICAgIC5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyA0KVxuICAgICAgLnJlYWRVSW50MzJCRSgwKVxuICAgIG9mZnNldCArPSA0XG4gICAgdGhpcy5vdXRwdXQgPSBTZWxlY3RPdXRwdXRDbGFzcyhvdXRwdXRpZClcbiAgICByZXR1cm4gdGhpcy5vdXRwdXQuZnJvbUJ1ZmZlcihieXRlcywgb2Zmc2V0KVxuICB9XG59XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBBbW91bnRPdXRwdXQgZXh0ZW5kcyBTdGFuZGFyZEFtb3VudE91dHB1dCB7XG4gIHByb3RlY3RlZCBfdHlwZU5hbWUgPSBcIkFtb3VudE91dHB1dFwiXG4gIHByb3RlY3RlZCBfdHlwZUlEID0gdW5kZWZpbmVkXG5cbiAgLy9zZXJpYWxpemUgYW5kIGRlc2VyaWFsaXplIGJvdGggYXJlIGluaGVyaXRlZFxuXG4gIC8qKlxuICAgKlxuICAgKiBAcGFyYW0gYXNzZXRJRCBBbiBhc3NldElEIHdoaWNoIGlzIHdyYXBwZWQgYXJvdW5kIHRoZSBCdWZmZXIgb2YgdGhlIE91dHB1dFxuICAgKi9cbiAgbWFrZVRyYW5zZmVyYWJsZShhc3NldElEOiBCdWZmZXIpOiBUcmFuc2ZlcmFibGVPdXRwdXQge1xuICAgIHJldHVybiBuZXcgVHJhbnNmZXJhYmxlT3V0cHV0KGFzc2V0SUQsIHRoaXMpXG4gIH1cblxuICBzZWxlY3QoaWQ6IG51bWJlciwgLi4uYXJnczogYW55W10pOiBPdXRwdXQge1xuICAgIHJldHVybiBTZWxlY3RPdXRwdXRDbGFzcyhpZCwgLi4uYXJncylcbiAgfVxufVxuXG4vKipcbiAqIEFuIFtbT3V0cHV0XV0gY2xhc3Mgd2hpY2ggc3BlY2lmaWVzIGFuIE91dHB1dCB0aGF0IGNhcnJpZXMgYW4gYW1tb3VudCBmb3IgYW4gYXNzZXRJRCBhbmQgdXNlcyBzZWNwMjU2azEgc2lnbmF0dXJlIHNjaGVtZS5cbiAqL1xuZXhwb3J0IGNsYXNzIFNFQ1BUcmFuc2Zlck91dHB1dCBleHRlbmRzIEFtb3VudE91dHB1dCB7XG4gIHByb3RlY3RlZCBfdHlwZU5hbWUgPSBcIlNFQ1BUcmFuc2Zlck91dHB1dFwiXG4gIHByb3RlY3RlZCBfdHlwZUlEID0gRVZNQ29uc3RhbnRzLlNFQ1BYRkVST1VUUFVUSURcblxuICAvL3NlcmlhbGl6ZSBhbmQgZGVzZXJpYWxpemUgYm90aCBhcmUgaW5oZXJpdGVkXG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIG91dHB1dElEIGZvciB0aGlzIG91dHB1dFxuICAgKi9cbiAgZ2V0T3V0cHV0SUQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fdHlwZUlEXG4gIH1cblxuICBjcmVhdGUoLi4uYXJnczogYW55W10pOiB0aGlzIHtcbiAgICByZXR1cm4gbmV3IFNFQ1BUcmFuc2Zlck91dHB1dCguLi5hcmdzKSBhcyB0aGlzXG4gIH1cblxuICBjbG9uZSgpOiB0aGlzIHtcbiAgICBjb25zdCBuZXdvdXQ6IFNFQ1BUcmFuc2Zlck91dHB1dCA9IHRoaXMuY3JlYXRlKClcbiAgICBuZXdvdXQuZnJvbUJ1ZmZlcih0aGlzLnRvQnVmZmVyKCkpXG4gICAgcmV0dXJuIG5ld291dCBhcyB0aGlzXG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEVWTU91dHB1dCB7XG4gIHByb3RlY3RlZCBhZGRyZXNzOiBCdWZmZXIgPSBCdWZmZXIuYWxsb2MoMjApXG4gIHByb3RlY3RlZCBhbW91bnQ6IEJ1ZmZlciA9IEJ1ZmZlci5hbGxvYyg4KVxuICBwcm90ZWN0ZWQgYW1vdW50VmFsdWU6IEJOID0gbmV3IEJOKDApXG4gIHByb3RlY3RlZCBhc3NldElEOiBCdWZmZXIgPSBCdWZmZXIuYWxsb2MoMzIpXG5cbiAgc2VyaWFsaXplKGVuY29kaW5nOiBTZXJpYWxpemVkRW5jb2RpbmcgPSBcImhleFwiKTogb2JqZWN0IHtcbiAgICByZXR1cm4ge1xuICAgICAgYWRkcmVzczogc2VyaWFsaXplci5lbmNvZGVyKHRoaXMuYWRkcmVzcywgZW5jb2RpbmcsIFwiQnVmZmVyXCIsIFwiaGV4XCIpLFxuICAgICAgYW1vdW50OiBzZXJpYWxpemVyLmVuY29kZXIoXG4gICAgICAgIHRoaXMuYW1vdW50LFxuICAgICAgICBlbmNvZGluZyxcbiAgICAgICAgXCJCdWZmZXJcIixcbiAgICAgICAgXCJkZWNpbWFsU3RyaW5nXCJcbiAgICAgICksXG4gICAgICBhc3NldElEOiBzZXJpYWxpemVyLmVuY29kZXIodGhpcy5hc3NldElELCBlbmNvZGluZywgXCJCdWZmZXJcIiwgXCJjYjU4XCIpXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBmdW5jdGlvbiB1c2VkIHRvIHNvcnQgYW4gYXJyYXkgb2YgW1tFVk1PdXRwdXRdXXNcbiAgICovXG4gIHN0YXRpYyBjb21wYXJhdG9yID1cbiAgICAoKTogKChhOiBFVk1PdXRwdXQgfCBFVk1JbnB1dCwgYjogRVZNT3V0cHV0IHwgRVZNSW5wdXQpID0+IDEgfCAtMSB8IDApID0+XG4gICAgKGE6IEVWTU91dHB1dCB8IEVWTUlucHV0LCBiOiBFVk1PdXRwdXQgfCBFVk1JbnB1dCk6IDEgfCAtMSB8IDAgPT4ge1xuICAgICAgLy8gcHJpbWFyaWx5IHNvcnQgYnkgYWRkcmVzc1xuICAgICAgbGV0IHNvcnRhOiBCdWZmZXIgPSBhLmdldEFkZHJlc3MoKVxuICAgICAgbGV0IHNvcnRiOiBCdWZmZXIgPSBiLmdldEFkZHJlc3MoKVxuICAgICAgLy8gc2Vjb25kYXJpbHkgc29ydCBieSBhc3NldElEXG4gICAgICBpZiAoc29ydGEuZXF1YWxzKHNvcnRiKSkge1xuICAgICAgICBzb3J0YSA9IGEuZ2V0QXNzZXRJRCgpXG4gICAgICAgIHNvcnRiID0gYi5nZXRBc3NldElEKClcbiAgICAgIH1cbiAgICAgIHJldHVybiBCdWZmZXIuY29tcGFyZShzb3J0YSwgc29ydGIpIGFzIDEgfCAtMSB8IDBcbiAgICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGFkZHJlc3Mgb2YgdGhlIGlucHV0IGFzIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9XG4gICAqL1xuICBnZXRBZGRyZXNzID0gKCk6IEJ1ZmZlciA9PiB0aGlzLmFkZHJlc3NcblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgYWRkcmVzcyBhcyBhIGJlY2gzMiBlbmNvZGVkIHN0cmluZy5cbiAgICovXG4gIGdldEFkZHJlc3NTdHJpbmcgPSAoKTogc3RyaW5nID0+IHRoaXMuYWRkcmVzcy50b1N0cmluZyhcImhleFwiKVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBhbW91bnQgYXMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2luZHV0bnkvYm4uanMvfEJOfS5cbiAgICovXG4gIGdldEFtb3VudCA9ICgpOiBCTiA9PiB0aGlzLmFtb3VudFZhbHVlLmNsb25lKClcblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgYXNzZXRJRCBvZiB0aGUgaW5wdXQgYXMge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn1cbiAgICovXG4gIGdldEFzc2V0SUQgPSAoKTogQnVmZmVyID0+IHRoaXMuYXNzZXRJRFxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gcmVwcmVzZW50YXRpb24gb2YgdGhlIFtbRVZNT3V0cHV0XV0uXG4gICAqL1xuICB0b0J1ZmZlcigpOiBCdWZmZXIge1xuICAgIGNvbnN0IGJzaXplOiBudW1iZXIgPVxuICAgICAgdGhpcy5hZGRyZXNzLmxlbmd0aCArIHRoaXMuYW1vdW50Lmxlbmd0aCArIHRoaXMuYXNzZXRJRC5sZW5ndGhcbiAgICBjb25zdCBiYXJyOiBCdWZmZXJbXSA9IFt0aGlzLmFkZHJlc3MsIHRoaXMuYW1vdW50LCB0aGlzLmFzc2V0SURdXG4gICAgY29uc3QgYnVmZjogQnVmZmVyID0gQnVmZmVyLmNvbmNhdChiYXJyLCBic2l6ZSlcbiAgICByZXR1cm4gYnVmZlxuICB9XG5cbiAgLyoqXG4gICAqIERlY29kZXMgdGhlIFtbRVZNT3V0cHV0XV0gYXMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBhbmQgcmV0dXJucyB0aGUgc2l6ZS5cbiAgICovXG4gIGZyb21CdWZmZXIoYnl0ZXM6IEJ1ZmZlciwgb2Zmc2V0OiBudW1iZXIgPSAwKTogbnVtYmVyIHtcbiAgICB0aGlzLmFkZHJlc3MgPSBiaW50b29scy5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyAyMClcbiAgICBvZmZzZXQgKz0gMjBcbiAgICB0aGlzLmFtb3VudCA9IGJpbnRvb2xzLmNvcHlGcm9tKGJ5dGVzLCBvZmZzZXQsIG9mZnNldCArIDgpXG4gICAgb2Zmc2V0ICs9IDhcbiAgICB0aGlzLmFzc2V0SUQgPSBiaW50b29scy5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyAzMilcbiAgICBvZmZzZXQgKz0gMzJcbiAgICB0aGlzLmFtb3VudFZhbHVlID0gbmV3IEJOKHRoaXMuYW1vdW50KVxuICAgIHJldHVybiBvZmZzZXRcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgYmFzZS01OCByZXByZXNlbnRhdGlvbiBvZiB0aGUgW1tFVk1PdXRwdXRdXS5cbiAgICovXG4gIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGJpbnRvb2xzLmJ1ZmZlclRvQjU4KHRoaXMudG9CdWZmZXIoKSlcbiAgfVxuXG4gIGNyZWF0ZSguLi5hcmdzOiBhbnlbXSk6IHRoaXMge1xuICAgIHJldHVybiBuZXcgRVZNT3V0cHV0KC4uLmFyZ3MpIGFzIHRoaXNcbiAgfVxuXG4gIGNsb25lKCk6IHRoaXMge1xuICAgIGNvbnN0IG5ld0VWTU91dHB1dDogRVZNT3V0cHV0ID0gdGhpcy5jcmVhdGUoKVxuICAgIG5ld0VWTU91dHB1dC5mcm9tQnVmZmVyKHRoaXMudG9CdWZmZXIoKSlcbiAgICByZXR1cm4gbmV3RVZNT3V0cHV0IGFzIHRoaXNcbiAgfVxuXG4gIC8qKlxuICAgKiBBbiBbW0VWTU91dHB1dF1dIGNsYXNzIHdoaWNoIGNvbnRhaW5zIGFkZHJlc3MsIGFtb3VudCwgYW5kIGFzc2V0SUQuXG4gICAqXG4gICAqIEBwYXJhbSBhZGRyZXNzIFRoZSBhZGRyZXNzIHJlY2lldmluZyB0aGUgYXNzZXQgYXMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBvciBhIHN0cmluZy5cbiAgICogQHBhcmFtIGFtb3VudCBBIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vaW5kdXRueS9ibi5qcy98Qk59IG9yIG51bWJlciByZXByZXNlbnRpbmcgdGhlIGFtb3VudC5cbiAgICogQHBhcmFtIGFzc2V0SUQgVGhlIGFzc2V0SUQgd2hpY2ggaXMgYmVpbmcgc2VudCBhcyBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IG9yIGEgc3RyaW5nLlxuICAgKi9cbiAgY29uc3RydWN0b3IoXG4gICAgYWRkcmVzczogQnVmZmVyIHwgc3RyaW5nID0gdW5kZWZpbmVkLFxuICAgIGFtb3VudDogQk4gfCBudW1iZXIgPSB1bmRlZmluZWQsXG4gICAgYXNzZXRJRDogQnVmZmVyIHwgc3RyaW5nID0gdW5kZWZpbmVkXG4gICkge1xuICAgIGlmIChcbiAgICAgIHR5cGVvZiBhZGRyZXNzICE9PSBcInVuZGVmaW5lZFwiICYmXG4gICAgICB0eXBlb2YgYW1vdW50ICE9PSBcInVuZGVmaW5lZFwiICYmXG4gICAgICB0eXBlb2YgYXNzZXRJRCAhPT0gXCJ1bmRlZmluZWRcIlxuICAgICkge1xuICAgICAgaWYgKHR5cGVvZiBhZGRyZXNzID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgIC8vIGlmIHByZXNlbnQgdGhlbiByZW1vdmUgYDB4YCBwcmVmaXhcbiAgICAgICAgY29uc3QgcHJlZml4OiBzdHJpbmcgPSBhZGRyZXNzLnN1YnN0cmluZygwLCAyKVxuICAgICAgICBpZiAocHJlZml4ID09PSBcIjB4XCIpIHtcbiAgICAgICAgICBhZGRyZXNzID0gYWRkcmVzcy5zcGxpdChcInhcIilbMV1cbiAgICAgICAgfVxuICAgICAgICBhZGRyZXNzID0gQnVmZmVyLmZyb20oYWRkcmVzcywgXCJoZXhcIilcbiAgICAgIH1cblxuICAgICAgLy8gY29udmVydCBudW1iZXIgYW1vdW50IHRvIEJOXG4gICAgICBsZXQgYW1udDogQk5cbiAgICAgIGlmICh0eXBlb2YgYW1vdW50ID09PSBcIm51bWJlclwiKSB7XG4gICAgICAgIGFtbnQgPSBuZXcgQk4oYW1vdW50KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYW1udCA9IGFtb3VudFxuICAgICAgfVxuXG4gICAgICAvLyBjb252ZXJ0IHN0cmluZyBhc3NldElEIHRvIEJ1ZmZlclxuICAgICAgaWYgKCEoYXNzZXRJRCBpbnN0YW5jZW9mIEJ1ZmZlcikpIHtcbiAgICAgICAgYXNzZXRJRCA9IGJpbnRvb2xzLmNiNThEZWNvZGUoYXNzZXRJRClcbiAgICAgIH1cblxuICAgICAgdGhpcy5hZGRyZXNzID0gYWRkcmVzc1xuICAgICAgdGhpcy5hbW91bnRWYWx1ZSA9IGFtbnQuY2xvbmUoKVxuICAgICAgdGhpcy5hbW91bnQgPSBiaW50b29scy5mcm9tQk5Ub0J1ZmZlcihhbW50LCA4KVxuICAgICAgdGhpcy5hc3NldElEID0gYXNzZXRJRFxuICAgIH1cbiAgfVxufVxuIl19
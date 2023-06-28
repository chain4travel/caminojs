"use strict";
/**
 * @packageDocumentation
 * @module Common-Output
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseNFTOutput = exports.StandardAmountOutput = exports.StandardTransferableOutput = exports.StandardParseableOutput = exports.Output = exports.OutputOwners = exports.Address = exports.BaseOutputComparator = void 0;
const buffer_1 = require("buffer/");
const bn_js_1 = __importDefault(require("bn.js"));
const bintools_1 = __importDefault(require("../utils/bintools"));
const nbytes_1 = require("./nbytes");
const helperfunctions_1 = require("../utils/helperfunctions");
const serialization_1 = require("../utils/serialization");
const errors_1 = require("../utils/errors");
/**
 * @ignore
 */
const bintools = bintools_1.default.getInstance();
const serialization = serialization_1.Serialization.getInstance();
const BaseOutputComparator = () => (a, b) => {
    const aoutid = buffer_1.Buffer.alloc(4);
    aoutid.writeUInt32BE(a.getOutputID(), 0);
    const abuff = a.toBuffer();
    const boutid = buffer_1.Buffer.alloc(4);
    boutid.writeUInt32BE(b.getOutputID(), 0);
    const bbuff = b.toBuffer();
    const asort = buffer_1.Buffer.concat([aoutid, abuff], aoutid.length + abuff.length);
    const bsort = buffer_1.Buffer.concat([boutid, bbuff], boutid.length + bbuff.length);
    return buffer_1.Buffer.compare(asort, bsort);
};
exports.BaseOutputComparator = BaseOutputComparator;
/**
 * Class for representing an address used in [[Output]] types
 */
class Address extends nbytes_1.NBytes {
    /**
     * Returns a base-58 representation of the [[Address]].
     */
    toString() {
        return bintools.cb58Encode(this.toBuffer());
    }
    /**
     * Takes a base-58 string containing an [[Address]], parses it, populates the class, and returns the length of the Address in bytes.
     *
     * @param bytes A base-58 string containing a raw [[Address]]
     *
     * @returns The length of the raw [[Address]]
     */
    fromString(addr) {
        const addrbuff = bintools.b58ToBuffer(addr);
        if (addrbuff.length === 24 && bintools.validateChecksum(addrbuff)) {
            const newbuff = bintools.copyFrom(addrbuff, 0, addrbuff.length - 4);
            if (newbuff.length === 20) {
                this.bytes = newbuff;
            }
        }
        else if (addrbuff.length === 24) {
            throw new errors_1.ChecksumError("Error - Address.fromString: invalid checksum on address");
        }
        else if (addrbuff.length === 20) {
            this.bytes = addrbuff;
        }
        else {
            /* istanbul ignore next */
            throw new errors_1.AddressError("Error - Address.fromString: invalid address");
        }
        return this.getSize();
    }
    clone() {
        let newbase = new Address();
        newbase.fromBuffer(this.toBuffer());
        return newbase;
    }
    create() {
        return new Address();
    }
    /**
     * Class for representing an address used in [[Output]] types
     */
    constructor() {
        super();
        this._typeName = "Address";
        this._typeID = undefined;
        //serialize and deserialize both are inherited
        this.bytes = buffer_1.Buffer.alloc(20);
        this.bsize = 20;
    }
}
exports.Address = Address;
/**
 * Returns a function used to sort an array of [[Address]]es
 */
Address.comparator = () => (a, b) => buffer_1.Buffer.compare(a.toBuffer(), b.toBuffer());
/**
 * Defines the most basic values for output ownership. Mostly inherited from, but can be used in population of NFT Owner data.
 */
class OutputOwners extends serialization_1.Serializable {
    serialize(encoding = "hex") {
        let fields = super.serialize(encoding);
        return Object.assign(Object.assign({}, fields), { locktime: serialization.encoder(this.locktime, encoding, "Buffer", "decimalString", 8), threshold: serialization.encoder(this.threshold, encoding, "Buffer", "decimalString", 4), addresses: this.addresses.map((a) => a.serialize(encoding)) });
    }
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        this.locktime = serialization.decoder(fields["locktime"], encoding, "decimalString", "Buffer", 8);
        this.threshold = serialization.decoder(fields["threshold"], encoding, "decimalString", "Buffer", 4);
        this.addresses = fields["addresses"].map((a) => {
            let addr = new Address();
            addr.deserialize(a, encoding);
            return addr;
        });
        this.numaddrs = buffer_1.Buffer.alloc(4);
        this.numaddrs.writeUInt32BE(this.addresses.length, 0);
    }
    /**
     * Returns a base-58 string representing the [[Output]].
     */
    fromBuffer(bytes, offset = 0) {
        this.locktime = bintools.copyFrom(bytes, offset, offset + 8);
        offset += 8;
        this.threshold = bintools.copyFrom(bytes, offset, offset + 4);
        offset += 4;
        this.numaddrs = bintools.copyFrom(bytes, offset, offset + 4);
        offset += 4;
        const numaddrs = this.numaddrs.readUInt32BE(0);
        this.addresses = [];
        for (let i = 0; i < numaddrs; i++) {
            const addr = new Address();
            offset = addr.fromBuffer(bytes, offset);
            this.addresses.push(addr);
        }
        this.addresses.sort(Address.comparator());
        return offset;
    }
    /**
     * Returns the buffer representing the [[Output]] instance.
     */
    toBuffer() {
        this.addresses.sort(Address.comparator());
        this.numaddrs.writeUInt32BE(this.addresses.length, 0);
        let bsize = this.locktime.length + this.threshold.length + this.numaddrs.length;
        const barr = [this.locktime, this.threshold, this.numaddrs];
        for (let i = 0; i < this.addresses.length; i++) {
            const b = this.addresses[`${i}`].toBuffer();
            barr.push(b);
            bsize += b.length;
        }
        return buffer_1.Buffer.concat(barr, bsize);
    }
    /**
     * Returns a base-58 string representing the [[Output]].
     */
    toString() {
        return bintools.bufferToB58(this.toBuffer());
    }
    /**
     * An [[Output]] class which contains addresses, locktimes, and thresholds.
     *
     * @param addresses An array of {@link https://github.com/feross/buffer|Buffer}s representing output owner's addresses
     * @param locktime A {@link https://github.com/indutny/bn.js/|BN} representing the locktime
     * @param threshold A number representing the threshold number of signers required to sign the transaction
     */
    constructor(addresses = undefined, locktime = undefined, threshold = undefined) {
        super();
        this._typeName = "OutputOwners";
        this._typeID = undefined;
        this.locktime = buffer_1.Buffer.alloc(8);
        this.threshold = buffer_1.Buffer.alloc(4);
        this.numaddrs = buffer_1.Buffer.alloc(4);
        this.addresses = [];
        /**
         * Returns the threshold of signers required to spend this output.
         */
        this.getThreshold = () => this.threshold.readUInt32BE(0);
        /**
         * Returns the a {@link https://github.com/indutny/bn.js/|BN} repersenting the UNIX Timestamp when the lock is made available.
         */
        this.getLocktime = () => bintools.fromBufferToBN(this.locktime);
        /**
         * Returns an array of {@link https://github.com/feross/buffer|Buffer}s for the addresses.
         */
        this.getAddresses = () => {
            const result = [];
            for (let i = 0; i < this.addresses.length; i++) {
                result.push(this.addresses[`${i}`].toBuffer());
            }
            return result;
        };
        /**
         * Returns an the length of the Addresses array.
         */
        this.getAddressesLength = () => this.addresses.length;
        /**
         * Returns the index of the address.
         *
         * @param address A {@link https://github.com/feross/buffer|Buffer} of the address to look up to return its index.
         *
         * @returns The index of the address.
         */
        this.getAddressIdx = (address) => {
            for (let i = 0; i < this.addresses.length; i++) {
                if (this.addresses[`${i}`].toBuffer().toString("hex") ===
                    address.toString("hex")) {
                    return i;
                }
            }
            /* istanbul ignore next */
            return -1;
        };
        /**
         * Returns the address from the index provided.
         *
         * @param idx The index of the address.
         *
         * @returns Returns the string representing the address.
         */
        this.getAddress = (idx) => {
            if (idx < this.addresses.length) {
                return this.addresses[`${idx}`].toBuffer();
            }
            throw new errors_1.AddressIndexError("Error - Output.getAddress: idx out of range");
        };
        /**
         * Given an array of address {@link https://github.com/feross/buffer|Buffer}s and an optional timestamp, returns true if the addresses meet the threshold required to spend the output.
         */
        this.meetsThreshold = (addresses, asOf = undefined) => {
            let now;
            if (typeof asOf === "undefined") {
                now = (0, helperfunctions_1.UnixNow)();
            }
            else {
                now = asOf;
            }
            const qualified = this.getSpenders(addresses, now);
            const threshold = this.threshold.readUInt32BE(0);
            if (qualified.length >= threshold) {
                return true;
            }
            return false;
        };
        /**
         * Given an array of addresses and an optional timestamp, select an array of address {@link https://github.com/feross/buffer|Buffer}s of qualified spenders for the output.
         */
        this.getSpenders = (addresses, asOf = undefined) => {
            const qualified = [];
            let now;
            if (typeof asOf === "undefined") {
                now = (0, helperfunctions_1.UnixNow)();
            }
            else {
                now = asOf;
            }
            const locktime = bintools.fromBufferToBN(this.locktime);
            if (now.lte(locktime)) {
                // not unlocked, not spendable
                return qualified;
            }
            const threshold = this.threshold.readUInt32BE(0);
            for (let i = 0; i < this.addresses.length && qualified.length < threshold; i++) {
                for (let j = 0; j < addresses.length && qualified.length < threshold; j++) {
                    if (addresses[`${j}`].toString("hex") ===
                        this.addresses[`${i}`].toBuffer().toString("hex")) {
                        qualified.push(addresses[`${j}`]);
                    }
                }
            }
            return qualified;
        };
        if (typeof addresses !== "undefined" && addresses.length) {
            const addrs = [];
            for (let i = 0; i < addresses.length; i++) {
                addrs[`${i}`] = new Address();
                addrs[`${i}`].fromBuffer(addresses[`${i}`]);
            }
            this.addresses = addrs;
            this.addresses.sort(Address.comparator());
            this.numaddrs.writeUInt32BE(this.addresses.length, 0);
        }
        if (typeof threshold !== undefined) {
            this.threshold.writeUInt32BE(threshold || 1, 0);
        }
        if (typeof locktime !== "undefined") {
            this.locktime = bintools.fromBNToBuffer(locktime, 8);
        }
    }
    static fromArray(b) {
        let offset = 6; //version + counter
        let num = b.readUInt32BE(2);
        const result = [];
        while (offset < b.length && num-- > 0) {
            const t = new OutputOwners();
            offset = t.fromBuffer(b, offset);
            result.push(t);
        }
        return result;
    }
    static toArray(o) {
        const numOutputOwners = buffer_1.Buffer.alloc(6);
        numOutputOwners.writeUInt32BE(o.length, 2);
        let bsize = 6;
        const barr = [numOutputOwners];
        for (const outputOwner of o) {
            const b = outputOwner.toBuffer();
            bsize += b.length;
            barr.push(b);
        }
        return buffer_1.Buffer.concat(barr, bsize);
    }
}
exports.OutputOwners = OutputOwners;
class Output extends OutputOwners {
    constructor() {
        super(...arguments);
        this._typeName = "Output";
        this._typeID = undefined;
    }
}
exports.Output = Output;
class StandardParseableOutput extends serialization_1.Serializable {
    serialize(encoding = "hex") {
        let fields = super.serialize(encoding);
        return Object.assign(Object.assign({}, fields), { output: this.output.serialize(encoding) });
    }
    toBuffer() {
        const outbuff = this.output.toBuffer();
        const outid = buffer_1.Buffer.alloc(4);
        outid.writeUInt32BE(this.output.getOutputID(), 0);
        const barr = [outid, outbuff];
        return buffer_1.Buffer.concat(barr, outid.length + outbuff.length);
    }
    getThreshold() {
        return this.output.getThreshold();
    }
    getLocktime() {
        return this.output.getLocktime();
    }
    getAddresses() {
        return this.output.getAddresses();
    }
    meetsThreshold(addrs, asOf) {
        return this.output.meetsThreshold(addrs, asOf);
    }
    /**
     * Class representing an [[ParseableOutput]] for a transaction.
     *
     * @param output A number representing the InputID of the [[ParseableOutput]]
     */
    constructor(output = undefined) {
        super();
        this._typeName = "StandardParseableOutput";
        this._typeID = undefined;
        this.getOutput = () => this.output;
        this.output = output;
    }
}
exports.StandardParseableOutput = StandardParseableOutput;
/**
 * Returns a function used to sort an array of [[ParseableOutput]]s
 */
StandardParseableOutput.comparator = () => (a, b) => {
    const sorta = a.toBuffer();
    const sortb = b.toBuffer();
    return buffer_1.Buffer.compare(sorta, sortb);
};
class StandardTransferableOutput extends StandardParseableOutput {
    serialize(encoding = "hex") {
        let fields = super.serialize(encoding);
        return Object.assign(Object.assign({}, fields), { assetID: serialization.encoder(this.assetID, encoding, "Buffer", "cb58") });
    }
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        this.assetID = serialization.decoder(fields["assetID"], encoding, "cb58", "Buffer", 32);
    }
    toBuffer() {
        const parseableBuff = super.toBuffer();
        const barr = [this.assetID, parseableBuff];
        return buffer_1.Buffer.concat(barr, this.assetID.length + parseableBuff.length);
    }
    /**
     * Class representing an [[StandardTransferableOutput]] for a transaction.
     *
     * @param assetID A {@link https://github.com/feross/buffer|Buffer} representing the assetID of the [[Output]]
     * @param output A number representing the InputID of the [[StandardTransferableOutput]]
     */
    constructor(assetID = undefined, output = undefined) {
        super(output);
        this._typeName = "StandardTransferableOutput";
        this._typeID = undefined;
        this.assetID = undefined;
        this.getAssetID = () => this.assetID;
        if (typeof assetID !== "undefined") {
            this.assetID = assetID;
        }
    }
}
exports.StandardTransferableOutput = StandardTransferableOutput;
/**
 * An [[Output]] class which specifies a token amount .
 */
class StandardAmountOutput extends Output {
    serialize(encoding = "hex") {
        let fields = super.serialize(encoding);
        return Object.assign(Object.assign({}, fields), { amount: serialization.encoder(this.amount, encoding, "Buffer", "decimalString", 8) });
    }
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        this.amount = serialization.decoder(fields["amount"], encoding, "decimalString", "Buffer", 8);
        this.amountValue = bintools.fromBufferToBN(this.amount);
    }
    /**
     * Returns the amount as a {@link https://github.com/indutny/bn.js/|BN}.
     */
    getAmount() {
        return this.amountValue.clone();
    }
    /**
     * Popuates the instance from a {@link https://github.com/feross/buffer|Buffer} representing the [[StandardAmountOutput]] and returns the size of the output.
     */
    fromBuffer(outbuff, offset = 0) {
        this.amount = bintools.copyFrom(outbuff, offset, offset + 8);
        this.amountValue = bintools.fromBufferToBN(this.amount);
        offset += 8;
        return super.fromBuffer(outbuff, offset);
    }
    /**
     * Returns the buffer representing the [[StandardAmountOutput]] instance.
     */
    toBuffer() {
        const superbuff = super.toBuffer();
        const bsize = this.amount.length + superbuff.length;
        this.numaddrs.writeUInt32BE(this.addresses.length, 0);
        const barr = [this.amount, superbuff];
        return buffer_1.Buffer.concat(barr, bsize);
    }
    /**
     * A [[StandardAmountOutput]] class which issues a payment on an assetID.
     *
     * @param amount A {@link https://github.com/indutny/bn.js/|BN} representing the amount in the output
     * @param addresses An array of {@link https://github.com/feross/buffer|Buffer}s representing addresses
     * @param locktime A {@link https://github.com/indutny/bn.js/|BN} representing the locktime
     * @param threshold A number representing the the threshold number of signers required to sign the transaction
     */
    constructor(amount = undefined, addresses = undefined, locktime = undefined, threshold = undefined) {
        super(addresses, locktime, threshold);
        this._typeName = "StandardAmountOutput";
        this._typeID = undefined;
        this.amount = buffer_1.Buffer.alloc(8);
        this.amountValue = new bn_js_1.default(0);
        if (typeof amount !== "undefined") {
            this.amountValue = amount.clone();
            this.amount = bintools.fromBNToBuffer(amount, 8);
        }
    }
}
exports.StandardAmountOutput = StandardAmountOutput;
/**
 * An [[Output]] class which specifies an NFT.
 */
class BaseNFTOutput extends Output {
    constructor() {
        super(...arguments);
        this._typeName = "BaseNFTOutput";
        this._typeID = undefined;
        this.groupID = buffer_1.Buffer.alloc(4);
        /**
         * Returns the groupID as a number.
         */
        this.getGroupID = () => {
            return this.groupID.readUInt32BE(0);
        };
    }
    serialize(encoding = "hex") {
        let fields = super.serialize(encoding);
        return Object.assign(Object.assign({}, fields), { groupID: serialization.encoder(this.groupID, encoding, "Buffer", "decimalString", 4) });
    }
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        this.groupID = serialization.decoder(fields["groupID"], encoding, "decimalString", "Buffer", 4);
    }
}
exports.BaseNFTOutput = BaseNFTOutput;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3V0cHV0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbW1vbi9vdXRwdXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7R0FHRzs7Ozs7O0FBRUgsb0NBQWdDO0FBQ2hDLGtEQUFzQjtBQUN0QixpRUFBd0M7QUFDeEMscUNBQWlDO0FBQ2pDLDhEQUFrRDtBQUNsRCwwREFJK0I7QUFDL0IsNENBQWdGO0FBRWhGOztHQUVHO0FBQ0gsTUFBTSxRQUFRLEdBQWEsa0JBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtBQUNqRCxNQUFNLGFBQWEsR0FBa0IsNkJBQWEsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtBQW9CekQsTUFBTSxvQkFBb0IsR0FDL0IsR0FBbUQsRUFBRSxDQUNyRCxDQUFDLENBQWEsRUFBRSxDQUFhLEVBQWMsRUFBRTtJQUMzQyxNQUFNLE1BQU0sR0FBVyxlQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQ3RDLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFBO0lBQ3hDLE1BQU0sS0FBSyxHQUFXLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQTtJQUVsQyxNQUFNLE1BQU0sR0FBVyxlQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQ3RDLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFBO0lBQ3hDLE1BQU0sS0FBSyxHQUFXLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQTtJQUVsQyxNQUFNLEtBQUssR0FBVyxlQUFNLENBQUMsTUFBTSxDQUNqQyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsRUFDZixNQUFNLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQzdCLENBQUE7SUFDRCxNQUFNLEtBQUssR0FBVyxlQUFNLENBQUMsTUFBTSxDQUNqQyxDQUFDLE1B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QyxTQUFTLENBQUMsRUFDakIsUUFBUSxFQUNSLGVBQWUsRUFDZixRQUFRLEVBQ1IsQ0FBQyxDQUNGLENBQUE7SUFDSCxDQUFDO0NBVUY7QUFwQ0Qsc0NBb0NDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAcGFja2FnZURvY3VtZW50YXRpb25cbiAqIEBtb2R1bGUgQ29tbW9uLU91dHB1dFxuICovXG5cbmltcG9ydCB7IEJ1ZmZlciB9IGZyb20gXCJidWZmZXIvXCJcbmltcG9ydCBCTiBmcm9tIFwiYm4uanNcIlxuaW1wb3J0IEJpblRvb2xzIGZyb20gXCIuLi91dGlscy9iaW50b29sc1wiXG5pbXBvcnQgeyBOQnl0ZXMgfSBmcm9tIFwiLi9uYnl0ZXNcIlxuaW1wb3J0IHsgVW5peE5vdyB9IGZyb20gXCIuLi91dGlscy9oZWxwZXJmdW5jdGlvbnNcIlxuaW1wb3J0IHtcbiAgU2VyaWFsaXphYmxlLFxuICBTZXJpYWxpemF0aW9uLFxuICBTZXJpYWxpemVkRW5jb2Rpbmdcbn0gZnJvbSBcIi4uL3V0aWxzL3NlcmlhbGl6YXRpb25cIlxuaW1wb3J0IHsgQ2hlY2tzdW1FcnJvciwgQWRkcmVzc0Vycm9yLCBBZGRyZXNzSW5kZXhFcnJvciB9IGZyb20gXCIuLi91dGlscy9lcnJvcnNcIlxuXG4vKipcbiAqIEBpZ25vcmVcbiAqL1xuY29uc3QgYmludG9vbHM6IEJpblRvb2xzID0gQmluVG9vbHMuZ2V0SW5zdGFuY2UoKVxuY29uc3Qgc2VyaWFsaXphdGlvbjogU2VyaWFsaXphdGlvbiA9IFNlcmlhbGl6YXRpb24uZ2V0SW5zdGFuY2UoKVxuXG5leHBvcnQgaW50ZXJmYWNlIEJhc2VPdXRwdXQge1xuICBnZXRUeXBlSUQoKTogbnVtYmVyXG5cbiAgc2VyaWFsaXplKGVuY29kaW5nOiBTZXJpYWxpemVkRW5jb2RpbmcpOiBvYmplY3RcbiAgZGVzZXJpYWxpemUoZmllbGRzOiBvYmplY3QsIGVuY29kaW5nOiBTZXJpYWxpemVkRW5jb2RpbmcpOiB2b2lkXG4gIGZyb21CdWZmZXIoYnl0ZXM6IEJ1ZmZlciwgb2Zmc2V0OiBudW1iZXIpOiBudW1iZXJcbiAgdG9CdWZmZXIoKTogQnVmZmVyXG5cbiAgZ2V0VGhyZXNob2xkKCk6IG51bWJlclxuICBnZXRMb2NrdGltZSgpOiBCTlxuICBnZXRBZGRyZXNzZXMoKTogQnVmZmVyW11cbiAgbWVldHNUaHJlc2hvbGQoYWRkcnM6IEJ1ZmZlcltdLCBhc09mOiBCTik6IGJvb2xlYW5cblxuICBnZXRPdXRwdXRJRCgpOiBudW1iZXJcbiAgY2xvbmUoKTogdGhpc1xuICBjcmVhdGUoLi4uYXJnczogYW55W10pOiB0aGlzXG59XG5cbmV4cG9ydCBjb25zdCBCYXNlT3V0cHV0Q29tcGFyYXRvciA9XG4gICgpOiAoKGE6IEJhc2VPdXRwdXQsIGI6IEJhc2VPdXRwdXQpID0+IDEgfCAtMSB8IDApID0+XG4gIChhOiBCYXNlT3V0cHV0LCBiOiBCYXNlT3V0cHV0KTogMSB8IC0xIHwgMCA9PiB7XG4gICAgY29uc3QgYW91dGlkOiBCdWZmZXIgPSBCdWZmZXIuYWxsb2MoNClcbiAgICBhb3V0aWQud3JpdGVVSW50MzJCRShhLmdldE91dHB1dElEKCksIDApXG4gICAgY29uc3QgYWJ1ZmY6IEJ1ZmZlciA9IGEudG9CdWZmZXIoKVxuXG4gICAgY29uc3QgYm91dGlkOiBCdWZmZXIgPSBCdWZmZXIuYWxsb2MoNClcbiAgICBib3V0aWQud3JpdGVVSW50MzJCRShiLmdldE91dHB1dElEKCksIDApXG4gICAgY29uc3QgYmJ1ZmY6IEJ1ZmZlciA9IGIudG9CdWZmZXIoKVxuXG4gICAgY29uc3QgYXNvcnQ6IEJ1ZmZlciA9IEJ1ZmZlci5jb25jYXQoXG4gICAgICBbYW91dGlkLCBhYnVmZl0sXG4gICAgICBhb3V0aWQubGVuZ3RoICsgYWJ1ZmYubGVuZ3RoXG4gICAgKVxuICAgIGNvbnN0IGJzb3J0OiBCdWZmZXIgPSBCdWZmZXIuY29uY2F0KFxuICAgICAgW2JvdXRpZCwgYmJ1ZmZdLFxuICAgICAgYm91dGlkLmxlbmd0aCArIGJidWZmLmxlbmd0aFxuICAgIClcbiAgICByZXR1cm4gQnVmZmVyLmNvbXBhcmUoYXNvcnQsIGJzb3J0KSBhcyAxIHwgLTEgfCAwXG4gIH1cblxuLyoqXG4gKiBDbGFzcyBmb3IgcmVwcmVzZW50aW5nIGFuIGFkZHJlc3MgdXNlZCBpbiBbW091dHB1dF1dIHR5cGVzXG4gKi9cbmV4cG9ydCBjbGFzcyBBZGRyZXNzIGV4dGVuZHMgTkJ5dGVzIHtcbiAgcHJvdGVjdGVkIF90eXBlTmFtZSA9IFwiQWRkcmVzc1wiXG4gIHByb3RlY3RlZCBfdHlwZUlEID0gdW5kZWZpbmVkXG5cbiAgLy9zZXJpYWxpemUgYW5kIGRlc2VyaWFsaXplIGJvdGggYXJlIGluaGVyaXRlZFxuXG4gIHByb3RlY3RlZCBieXRlcyA9IEJ1ZmZlci5hbGxvYygyMClcbiAgcHJvdGVjdGVkIGJzaXplID0gMjBcblxuICAvKipcbiAgICogUmV0dXJucyBhIGZ1bmN0aW9uIHVzZWQgdG8gc29ydCBhbiBhcnJheSBvZiBbW0FkZHJlc3NdXWVzXG4gICAqL1xuICBzdGF0aWMgY29tcGFyYXRvciA9XG4gICAgKCk6ICgoYTogQWRkcmVzcywgYjogQWRkcmVzcykgPT4gMSB8IC0xIHwgMCkgPT5cbiAgICAoYTogQWRkcmVzcywgYjogQWRkcmVzcyk6IDEgfCAtMSB8IDAgPT5cbiAgICAgIEJ1ZmZlci5jb21wYXJlKGEudG9CdWZmZXIoKSwgYi50b0J1ZmZlcigpKSBhcyAxIHwgLTEgfCAwXG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBiYXNlLTU4IHJlcHJlc2VudGF0aW9uIG9mIHRoZSBbW0FkZHJlc3NdXS5cbiAgICovXG4gIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGJpbnRvb2xzLmNiNThFbmNvZGUodGhpcy50b0J1ZmZlcigpKVxuICB9XG5cbiAgLyoqXG4gICAqIFRha2VzIGEgYmFzZS01OCBzdHJpbmcgY29udGFpbmluZyBhbiBbW0FkZHJlc3NdXSwgcGFyc2VzIGl0LCBwb3B1bGF0ZXMgdGhlIGNsYXNzLCBhbmQgcmV0dXJucyB0aGUgbGVuZ3RoIG9mIHRoZSBBZGRyZXNzIGluIGJ5dGVzLlxuICAgKlxuICAgKiBAcGFyYW0gYnl0ZXMgQSBiYXNlLTU4IHN0cmluZyBjb250YWluaW5nIGEgcmF3IFtbQWRkcmVzc11dXG4gICAqXG4gICAqIEByZXR1cm5zIFRoZSBsZW5ndGggb2YgdGhlIHJhdyBbW0FkZHJlc3NdXVxuICAgKi9cbiAgZnJvbVN0cmluZyhhZGRyOiBzdHJpbmcpOiBudW1iZXIge1xuICAgIGNvbnN0IGFkZHJidWZmOiBCdWZmZXIgPSBiaW50b29scy5iNThUb0J1ZmZlcihhZGRyKVxuICAgIGlmIChhZGRyYnVmZi5sZW5ndGggPT09IDI0ICYmIGJpbnRvb2xzLnZhbGlkYXRlQ2hlY2tzdW0oYWRkcmJ1ZmYpKSB7XG4gICAgICBjb25zdCBuZXdidWZmOiBCdWZmZXIgPSBiaW50b29scy5jb3B5RnJvbShcbiAgICAgICAgYWRkcmJ1ZmYsXG4gICAgICAgIDAsXG4gICAgICAgIGFkZHJidWZmLmxlbmd0aCAtIDRcbiAgICAgIClcbiAgICAgIGlmIChuZXdidWZmLmxlbmd0aCA9PT0gMjApIHtcbiAgICAgICAgdGhpcy5ieXRlcyA9IG5ld2J1ZmZcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGFkZHJidWZmLmxlbmd0aCA9PT0gMjQpIHtcbiAgICAgIHRocm93IG5ldyBDaGVja3N1bUVycm9yKFxuICAgICAgICBcIkVycm9yIC0gQWRkcmVzcy5mcm9tU3RyaW5nOiBpbnZhbGlkIGNoZWNrc3VtIG9uIGFkZHJlc3NcIlxuICAgICAgKVxuICAgIH0gZWxzZSBpZiAoYWRkcmJ1ZmYubGVuZ3RoID09PSAyMCkge1xuICAgICAgdGhpcy5ieXRlcyA9IGFkZHJidWZmXG4gICAgfSBlbHNlIHtcbiAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICB0aHJvdyBuZXcgQWRkcmVzc0Vycm9yKFwiRXJyb3IgLSBBZGRyZXNzLmZyb21TdHJpbmc6IGludmFsaWQgYWRkcmVzc1wiKVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5nZXRTaXplKClcbiAgfVxuXG4gIGNsb25lKCk6IHRoaXMge1xuICAgIGxldCBuZXdiYXNlOiBBZGRyZXNzID0gbmV3IEFkZHJlc3MoKVxuICAgIG5ld2Jhc2UuZnJvbUJ1ZmZlcih0aGlzLnRvQnVmZmVyKCkpXG4gICAgcmV0dXJuIG5ld2Jhc2UgYXMgdGhpc1xuICB9XG5cbiAgY3JlYXRlKCk6IHRoaXMge1xuICAgIHJldHVybiBuZXcgQWRkcmVzcygpIGFzIHRoaXNcbiAgfVxuXG4gIC8qKlxuICAgKiBDbGFzcyBmb3IgcmVwcmVzZW50aW5nIGFuIGFkZHJlc3MgdXNlZCBpbiBbW091dHB1dF1dIHR5cGVzXG4gICAqL1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpXG4gIH1cbn1cblxuLyoqXG4gKiBEZWZpbmVzIHRoZSBtb3N0IGJhc2ljIHZhbHVlcyBmb3Igb3V0cHV0IG93bmVyc2hpcC4gTW9zdGx5IGluaGVyaXRlZCBmcm9tLCBidXQgY2FuIGJlIHVzZWQgaW4gcG9wdWxhdGlvbiBvZiBORlQgT3duZXIgZGF0YS5cbiAqL1xuZXhwb3J0IGNsYXNzIE91dHB1dE93bmVycyBleHRlbmRzIFNlcmlhbGl6YWJsZSB7XG4gIHByb3RlY3RlZCBfdHlwZU5hbWUgPSBcIk91dHB1dE93bmVyc1wiXG4gIHByb3RlY3RlZCBfdHlwZUlEID0gdW5kZWZpbmVkXG5cbiAgc2VyaWFsaXplKGVuY29kaW5nOiBTZXJpYWxpemVkRW5jb2RpbmcgPSBcImhleFwiKTogb2JqZWN0IHtcbiAgICBsZXQgZmllbGRzOiBvYmplY3QgPSBzdXBlci5zZXJpYWxpemUoZW5jb2RpbmcpXG4gICAgcmV0dXJuIHtcbiAgICAgIC4uLmZpZWxkcyxcbiAgICAgIGxvY2t0aW1lOiBzZXJpYWxpemF0aW9uLmVuY29kZXIoXG4gICAgICAgIHRoaXMubG9ja3RpbWUsXG4gICAgICAgIGVuY29kaW5nLFxuICAgICAgICBcIkJ1ZmZlclwiLFxuICAgICAgICBcImRlY2ltYWxTdHJpbmdcIixcbiAgICAgICAgOFxuICAgICAgKSxcbiAgICAgIHRocmVzaG9sZDogc2VyaWFsaXphdGlvbi5lbmNvZGVyKFxuICAgICAgICB0aGlzLnRocmVzaG9sZCxcbiAgICAgICAgZW5jb2RpbmcsXG4gICAgICAgIFwiQnVmZmVyXCIsXG4gICAgICAgIFwiZGVjaW1hbFN0cmluZ1wiLFxuICAgICAgICA0XG4gICAgICApLFxuICAgICAgYWRkcmVzc2VzOiB0aGlzLmFkZHJlc3Nlcy5tYXAoKGE6IEFkZHJlc3MpOiBvYmplY3QgPT5cbiAgICAgICAgYS5zZXJpYWxpemUoZW5jb2RpbmcpXG4gICAgICApXG4gICAgfVxuICB9XG4gIGRlc2VyaWFsaXplKGZpZWxkczogb2JqZWN0LCBlbmNvZGluZzogU2VyaWFsaXplZEVuY29kaW5nID0gXCJoZXhcIikge1xuICAgIHN1cGVyLmRlc2VyaWFsaXplKGZpZWxkcywgZW5jb2RpbmcpXG4gICAgdGhpcy5sb2NrdGltZSA9IHNlcmlhbGl6YXRpb24uZGVjb2RlcihcbiAgICAgIGZpZWxkc1tcImxvY2t0aW1lXCJdLFxuICAgICAgZW5jb2RpbmcsXG4gICAgICBcImRlY2ltYWxTdHJpbmdcIixcbiAgICAgIFwiQnVmZmVyXCIsXG4gICAgICA4XG4gICAgKVxuICAgIHRoaXMudGhyZXNob2xkID0gc2VyaWFsaXphdGlvbi5kZWNvZGVyKFxuICAgICAgZmllbGRzW1widGhyZXNob2xkXCJdLFxuICAgICAgZW5jb2RpbmcsXG4gICAgICBcImRlY2ltYWxTdHJpbmdcIixcbiAgICAgIFwiQnVmZmVyXCIsXG4gICAgICA0XG4gICAgKVxuICAgIHRoaXMuYWRkcmVzc2VzID0gZmllbGRzW1wiYWRkcmVzc2VzXCJdLm1hcCgoYTogb2JqZWN0KSA9PiB7XG4gICAgICBsZXQgYWRkcjogQWRkcmVzcyA9IG5ldyBBZGRyZXNzKClcbiAgICAgIGFkZHIuZGVzZXJpYWxpemUoYSwgZW5jb2RpbmcpXG4gICAgICByZXR1cm4gYWRkclxuICAgIH0pXG4gICAgdGhpcy5udW1hZGRycyA9IEJ1ZmZlci5hbGxvYyg0KVxuICAgIHRoaXMubnVtYWRkcnMud3JpdGVVSW50MzJCRSh0aGlzLmFkZHJlc3Nlcy5sZW5ndGgsIDApXG4gIH1cblxuICBwcm90ZWN0ZWQgbG9ja3RpbWU6IEJ1ZmZlciA9IEJ1ZmZlci5hbGxvYyg4KVxuICBwcm90ZWN0ZWQgdGhyZXNob2xkOiBCdWZmZXIgPSBCdWZmZXIuYWxsb2MoNClcbiAgcHJvdGVjdGVkIG51bWFkZHJzOiBCdWZmZXIgPSBCdWZmZXIuYWxsb2MoNClcbiAgcHJvdGVjdGVkIGFkZHJlc3NlczogQWRkcmVzc1tdID0gW11cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgdGhyZXNob2xkIG9mIHNpZ25lcnMgcmVxdWlyZWQgdG8gc3BlbmQgdGhpcyBvdXRwdXQuXG4gICAqL1xuICBnZXRUaHJlc2hvbGQgPSAoKTogbnVtYmVyID0+IHRoaXMudGhyZXNob2xkLnJlYWRVSW50MzJCRSgwKVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vaW5kdXRueS9ibi5qcy98Qk59IHJlcGVyc2VudGluZyB0aGUgVU5JWCBUaW1lc3RhbXAgd2hlbiB0aGUgbG9jayBpcyBtYWRlIGF2YWlsYWJsZS5cbiAgICovXG4gIGdldExvY2t0aW1lID0gKCk6IEJOID0+IGJpbnRvb2xzLmZyb21CdWZmZXJUb0JOKHRoaXMubG9ja3RpbWUpXG5cbiAgLyoqXG4gICAqIFJldHVybnMgYW4gYXJyYXkgb2Yge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn1zIGZvciB0aGUgYWRkcmVzc2VzLlxuICAgKi9cbiAgZ2V0QWRkcmVzc2VzID0gKCk6IEJ1ZmZlcltdID0+IHtcbiAgICBjb25zdCByZXN1bHQ6IEJ1ZmZlcltdID0gW11cbiAgICBmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgdGhpcy5hZGRyZXNzZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHJlc3VsdC5wdXNoKHRoaXMuYWRkcmVzc2VzW2Ake2l9YF0udG9CdWZmZXIoKSlcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYW4gdGhlIGxlbmd0aCBvZiB0aGUgQWRkcmVzc2VzIGFycmF5LlxuICAgKi9cbiAgZ2V0QWRkcmVzc2VzTGVuZ3RoID0gKCk6IG51bWJlciA9PiB0aGlzLmFkZHJlc3Nlcy5sZW5ndGhcblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgaW5kZXggb2YgdGhlIGFkZHJlc3MuXG4gICAqXG4gICAqIEBwYXJhbSBhZGRyZXNzIEEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gb2YgdGhlIGFkZHJlc3MgdG8gbG9vayB1cCB0byByZXR1cm4gaXRzIGluZGV4LlxuICAgKlxuICAgKiBAcmV0dXJucyBUaGUgaW5kZXggb2YgdGhlIGFkZHJlc3MuXG4gICAqL1xuICBnZXRBZGRyZXNzSWR4ID0gKGFkZHJlc3M6IEJ1ZmZlcik6IG51bWJlciA9PiB7XG4gICAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IHRoaXMuYWRkcmVzc2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoXG4gICAgICAgIHRoaXMuYWRkcmVzc2VzW2Ake2l9YF0udG9CdWZmZXIoKS50b1N0cmluZyhcImhleFwiKSA9PT1cbiAgICAgICAgYWRkcmVzcy50b1N0cmluZyhcImhleFwiKVxuICAgICAgKSB7XG4gICAgICAgIHJldHVybiBpXG4gICAgICB9XG4gICAgfVxuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgcmV0dXJuIC0xXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgYWRkcmVzcyBmcm9tIHRoZSBpbmRleCBwcm92aWRlZC5cbiAgICpcbiAgICogQHBhcmFtIGlkeCBUaGUgaW5kZXggb2YgdGhlIGFkZHJlc3MuXG4gICAqXG4gICAqIEByZXR1cm5zIFJldHVybnMgdGhlIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIGFkZHJlc3MuXG4gICAqL1xuICBnZXRBZGRyZXNzID0gKGlkeDogbnVtYmVyKTogQnVmZmVyID0+IHtcbiAgICBpZiAoaWR4IDwgdGhpcy5hZGRyZXNzZXMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gdGhpcy5hZGRyZXNzZXNbYCR7aWR4fWBdLnRvQnVmZmVyKClcbiAgICB9XG4gICAgdGhyb3cgbmV3IEFkZHJlc3NJbmRleEVycm9yKFwiRXJyb3IgLSBPdXRwdXQuZ2V0QWRkcmVzczogaWR4IG91dCBvZiByYW5nZVwiKVxuICB9XG5cbiAgLyoqXG4gICAqIEdpdmVuIGFuIGFycmF5IG9mIGFkZHJlc3Mge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn1zIGFuZCBhbiBvcHRpb25hbCB0aW1lc3RhbXAsIHJldHVybnMgdHJ1ZSBpZiB0aGUgYWRkcmVzc2VzIG1lZXQgdGhlIHRocmVzaG9sZCByZXF1aXJlZCB0byBzcGVuZCB0aGUgb3V0cHV0LlxuICAgKi9cbiAgbWVldHNUaHJlc2hvbGQgPSAoYWRkcmVzc2VzOiBCdWZmZXJbXSwgYXNPZjogQk4gPSB1bmRlZmluZWQpOiBib29sZWFuID0+IHtcbiAgICBsZXQgbm93OiBCTlxuICAgIGlmICh0eXBlb2YgYXNPZiA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgbm93ID0gVW5peE5vdygpXG4gICAgfSBlbHNlIHtcbiAgICAgIG5vdyA9IGFzT2ZcbiAgICB9XG4gICAgY29uc3QgcXVhbGlmaWVkOiBCdWZmZXJbXSA9IHRoaXMuZ2V0U3BlbmRlcnMoYWRkcmVzc2VzLCBub3cpXG4gICAgY29uc3QgdGhyZXNob2xkOiBudW1iZXIgPSB0aGlzLnRocmVzaG9sZC5yZWFkVUludDMyQkUoMClcbiAgICBpZiAocXVhbGlmaWVkLmxlbmd0aCA+PSB0aHJlc2hvbGQpIHtcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICAvKipcbiAgICogR2l2ZW4gYW4gYXJyYXkgb2YgYWRkcmVzc2VzIGFuZCBhbiBvcHRpb25hbCB0aW1lc3RhbXAsIHNlbGVjdCBhbiBhcnJheSBvZiBhZGRyZXNzIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9cyBvZiBxdWFsaWZpZWQgc3BlbmRlcnMgZm9yIHRoZSBvdXRwdXQuXG4gICAqL1xuICBnZXRTcGVuZGVycyA9IChhZGRyZXNzZXM6IEJ1ZmZlcltdLCBhc09mOiBCTiA9IHVuZGVmaW5lZCk6IEJ1ZmZlcltdID0+IHtcbiAgICBjb25zdCBxdWFsaWZpZWQ6IEJ1ZmZlcltdID0gW11cbiAgICBsZXQgbm93OiBCTlxuICAgIGlmICh0eXBlb2YgYXNPZiA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgbm93ID0gVW5peE5vdygpXG4gICAgfSBlbHNlIHtcbiAgICAgIG5vdyA9IGFzT2ZcbiAgICB9XG4gICAgY29uc3QgbG9ja3RpbWU6IEJOID0gYmludG9vbHMuZnJvbUJ1ZmZlclRvQk4odGhpcy5sb2NrdGltZSlcbiAgICBpZiAobm93Lmx0ZShsb2NrdGltZSkpIHtcbiAgICAgIC8vIG5vdCB1bmxvY2tlZCwgbm90IHNwZW5kYWJsZVxuICAgICAgcmV0dXJuIHF1YWxpZmllZFxuICAgIH1cblxuICAgIGNvbnN0IHRocmVzaG9sZDogbnVtYmVyID0gdGhpcy50aHJlc2hvbGQucmVhZFVJbnQzMkJFKDApXG4gICAgZm9yIChcbiAgICAgIGxldCBpOiBudW1iZXIgPSAwO1xuICAgICAgaSA8IHRoaXMuYWRkcmVzc2VzLmxlbmd0aCAmJiBxdWFsaWZpZWQubGVuZ3RoIDwgdGhyZXNob2xkO1xuICAgICAgaSsrXG4gICAgKSB7XG4gICAgICBmb3IgKFxuICAgICAgICBsZXQgajogbnVtYmVyID0gMDtcbiAgICAgICAgaiA8IGFkZHJlc3Nlcy5sZW5ndGggJiYgcXVhbGlmaWVkLmxlbmd0aCA8IHRocmVzaG9sZDtcbiAgICAgICAgaisrXG4gICAgICApIHtcbiAgICAgICAgaWYgKFxuICAgICAgICAgIGFkZHJlc3Nlc1tgJHtqfWBdLnRvU3RyaW5nKFwiaGV4XCIpID09PVxuICAgICAgICAgIHRoaXMuYWRkcmVzc2VzW2Ake2l9YF0udG9CdWZmZXIoKS50b1N0cmluZyhcImhleFwiKVxuICAgICAgICApIHtcbiAgICAgICAgICBxdWFsaWZpZWQucHVzaChhZGRyZXNzZXNbYCR7an1gXSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBxdWFsaWZpZWRcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgYmFzZS01OCBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSBbW091dHB1dF1dLlxuICAgKi9cbiAgZnJvbUJ1ZmZlcihieXRlczogQnVmZmVyLCBvZmZzZXQ6IG51bWJlciA9IDApOiBudW1iZXIge1xuICAgIHRoaXMubG9ja3RpbWUgPSBiaW50b29scy5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyA4KVxuICAgIG9mZnNldCArPSA4XG4gICAgdGhpcy50aHJlc2hvbGQgPSBiaW50b29scy5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyA0KVxuICAgIG9mZnNldCArPSA0XG4gICAgdGhpcy5udW1hZGRycyA9IGJpbnRvb2xzLmNvcHlGcm9tKGJ5dGVzLCBvZmZzZXQsIG9mZnNldCArIDQpXG4gICAgb2Zmc2V0ICs9IDRcbiAgICBjb25zdCBudW1hZGRyczogbnVtYmVyID0gdGhpcy5udW1hZGRycy5yZWFkVUludDMyQkUoMClcbiAgICB0aGlzLmFkZHJlc3NlcyA9IFtdXG4gICAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IG51bWFkZHJzOyBpKyspIHtcbiAgICAgIGNvbnN0IGFkZHI6IEFkZHJlc3MgPSBuZXcgQWRkcmVzcygpXG4gICAgICBvZmZzZXQgPSBhZGRyLmZyb21CdWZmZXIoYnl0ZXMsIG9mZnNldClcbiAgICAgIHRoaXMuYWRkcmVzc2VzLnB1c2goYWRkcilcbiAgICB9XG4gICAgdGhpcy5hZGRyZXNzZXMuc29ydChBZGRyZXNzLmNvbXBhcmF0b3IoKSlcbiAgICByZXR1cm4gb2Zmc2V0XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgYnVmZmVyIHJlcHJlc2VudGluZyB0aGUgW1tPdXRwdXRdXSBpbnN0YW5jZS5cbiAgICovXG4gIHRvQnVmZmVyKCk6IEJ1ZmZlciB7XG4gICAgdGhpcy5hZGRyZXNzZXMuc29ydChBZGRyZXNzLmNvbXBhcmF0b3IoKSlcbiAgICB0aGlzLm51bWFkZHJzLndyaXRlVUludDMyQkUodGhpcy5hZGRyZXNzZXMubGVuZ3RoLCAwKVxuICAgIGxldCBic2l6ZTogbnVtYmVyID1cbiAgICAgIHRoaXMubG9ja3RpbWUubGVuZ3RoICsgdGhpcy50aHJlc2hvbGQubGVuZ3RoICsgdGhpcy5udW1hZGRycy5sZW5ndGhcbiAgICBjb25zdCBiYXJyOiBCdWZmZXJbXSA9IFt0aGlzLmxvY2t0aW1lLCB0aGlzLnRocmVzaG9sZCwgdGhpcy5udW1hZGRyc11cbiAgICBmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgdGhpcy5hZGRyZXNzZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGI6IEJ1ZmZlciA9IHRoaXMuYWRkcmVzc2VzW2Ake2l9YF0udG9CdWZmZXIoKVxuICAgICAgYmFyci5wdXNoKGIpXG4gICAgICBic2l6ZSArPSBiLmxlbmd0aFxuICAgIH1cbiAgICByZXR1cm4gQnVmZmVyLmNvbmNhdChiYXJyLCBic2l6ZSlcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgYmFzZS01OCBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSBbW091dHB1dF1dLlxuICAgKi9cbiAgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYmludG9vbHMuYnVmZmVyVG9CNTgodGhpcy50b0J1ZmZlcigpKVxuICB9XG5cbiAgLyoqXG4gICAqIEFuIFtbT3V0cHV0XV0gY2xhc3Mgd2hpY2ggY29udGFpbnMgYWRkcmVzc2VzLCBsb2NrdGltZXMsIGFuZCB0aHJlc2hvbGRzLlxuICAgKlxuICAgKiBAcGFyYW0gYWRkcmVzc2VzIEFuIGFycmF5IG9mIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9cyByZXByZXNlbnRpbmcgb3V0cHV0IG93bmVyJ3MgYWRkcmVzc2VzXG4gICAqIEBwYXJhbSBsb2NrdGltZSBBIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vaW5kdXRueS9ibi5qcy98Qk59IHJlcHJlc2VudGluZyB0aGUgbG9ja3RpbWVcbiAgICogQHBhcmFtIHRocmVzaG9sZCBBIG51bWJlciByZXByZXNlbnRpbmcgdGhlIHRocmVzaG9sZCBudW1iZXIgb2Ygc2lnbmVycyByZXF1aXJlZCB0byBzaWduIHRoZSB0cmFuc2FjdGlvblxuICAgKi9cbiAgY29uc3RydWN0b3IoXG4gICAgYWRkcmVzc2VzOiBCdWZmZXJbXSA9IHVuZGVmaW5lZCxcbiAgICBsb2NrdGltZTogQk4gPSB1bmRlZmluZWQsXG4gICAgdGhyZXNob2xkOiBudW1iZXIgPSB1bmRlZmluZWRcbiAgKSB7XG4gICAgc3VwZXIoKVxuICAgIGlmICh0eXBlb2YgYWRkcmVzc2VzICE9PSBcInVuZGVmaW5lZFwiICYmIGFkZHJlc3Nlcy5sZW5ndGgpIHtcbiAgICAgIGNvbnN0IGFkZHJzOiBBZGRyZXNzW10gPSBbXVxuICAgICAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IGFkZHJlc3Nlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBhZGRyc1tgJHtpfWBdID0gbmV3IEFkZHJlc3MoKVxuICAgICAgICBhZGRyc1tgJHtpfWBdLmZyb21CdWZmZXIoYWRkcmVzc2VzW2Ake2l9YF0pXG4gICAgICB9XG4gICAgICB0aGlzLmFkZHJlc3NlcyA9IGFkZHJzXG4gICAgICB0aGlzLmFkZHJlc3Nlcy5zb3J0KEFkZHJlc3MuY29tcGFyYXRvcigpKVxuICAgICAgdGhpcy5udW1hZGRycy53cml0ZVVJbnQzMkJFKHRoaXMuYWRkcmVzc2VzLmxlbmd0aCwgMClcbiAgICB9XG4gICAgaWYgKHR5cGVvZiB0aHJlc2hvbGQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy50aHJlc2hvbGQud3JpdGVVSW50MzJCRSh0aHJlc2hvbGQgfHwgMSwgMClcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBsb2NrdGltZSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgdGhpcy5sb2NrdGltZSA9IGJpbnRvb2xzLmZyb21CTlRvQnVmZmVyKGxvY2t0aW1lLCA4KVxuICAgIH1cbiAgfVxuXG4gIHN0YXRpYyBmcm9tQXJyYXkoYjogQnVmZmVyKTogT3V0cHV0T3duZXJzW10ge1xuICAgIGxldCBvZmZzZXQgPSA2IC8vdmVyc2lvbiArIGNvdW50ZXJcbiAgICBsZXQgbnVtID0gYi5yZWFkVUludDMyQkUoMilcbiAgICBjb25zdCByZXN1bHQ6IE91dHB1dE93bmVyc1tdID0gW11cbiAgICB3aGlsZSAob2Zmc2V0IDwgYi5sZW5ndGggJiYgbnVtLS0gPiAwKSB7XG4gICAgICBjb25zdCB0ID0gbmV3IE91dHB1dE93bmVycygpXG4gICAgICBvZmZzZXQgPSB0LmZyb21CdWZmZXIoYiwgb2Zmc2V0KVxuICAgICAgcmVzdWx0LnB1c2godClcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG5cbiAgc3RhdGljIHRvQXJyYXkobzogT3V0cHV0T3duZXJzW10pOiBCdWZmZXIge1xuICAgIGNvbnN0IG51bU91dHB1dE93bmVycyA9IEJ1ZmZlci5hbGxvYyg2KVxuICAgIG51bU91dHB1dE93bmVycy53cml0ZVVJbnQzMkJFKG8ubGVuZ3RoLCAyKVxuICAgIGxldCBic2l6ZTogbnVtYmVyID0gNlxuICAgIGNvbnN0IGJhcnI6IEJ1ZmZlcltdID0gW251bU91dHB1dE93bmVyc11cbiAgICBmb3IgKGNvbnN0IG91dHB1dE93bmVyIG9mIG8pIHtcbiAgICAgIGNvbnN0IGIgPSBvdXRwdXRPd25lci50b0J1ZmZlcigpXG4gICAgICBic2l6ZSArPSBiLmxlbmd0aFxuICAgICAgYmFyci5wdXNoKGIpXG4gICAgfVxuICAgIHJldHVybiBCdWZmZXIuY29uY2F0KGJhcnIsIGJzaXplKVxuICB9XG59XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBPdXRwdXQgZXh0ZW5kcyBPdXRwdXRPd25lcnMge1xuICBwcm90ZWN0ZWQgX3R5cGVOYW1lID0gXCJPdXRwdXRcIlxuICBwcm90ZWN0ZWQgX3R5cGVJRCA9IHVuZGVmaW5lZFxuXG4gIC8vc2VyaWFsaXplIGFuZCBkZXNlcmlhbGl6ZSBib3RoIGFyZSBpbmhlcml0ZWRcblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgb3V0cHV0SUQgZm9yIHRoZSBvdXRwdXQgd2hpY2ggdGVsbHMgcGFyc2VycyB3aGF0IHR5cGUgaXQgaXNcbiAgICovXG4gIGFic3RyYWN0IGdldE91dHB1dElEKCk6IG51bWJlclxuXG4gIGFic3RyYWN0IGNsb25lKCk6IHRoaXNcblxuICBhYnN0cmFjdCBjcmVhdGUoLi4uYXJnczogYW55W10pOiB0aGlzXG5cbiAgLyoqXG4gICAqXG4gICAqIEBwYXJhbSBhc3NldElEIEFuIGFzc2V0SUQgd2hpY2ggaXMgd3JhcHBlZCBhcm91bmQgdGhlIEJ1ZmZlciBvZiB0aGUgT3V0cHV0XG4gICAqXG4gICAqIE11c3QgYmUgaW1wbGVtZW50ZWQgdG8gdXNlIHRoZSBhcHByb3ByaWF0ZSBUcmFuc2ZlcmFibGVPdXRwdXQgZm9yIHRoZSBWTS5cbiAgICovXG4gIGFic3RyYWN0IG1ha2VUcmFuc2ZlcmFibGUoYXNzZXRJRDogQnVmZmVyKTogU3RhbmRhcmRUcmFuc2ZlcmFibGVPdXRwdXRcbn1cblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFN0YW5kYXJkUGFyc2VhYmxlT3V0cHV0IGV4dGVuZHMgU2VyaWFsaXphYmxlIHtcbiAgcHJvdGVjdGVkIF90eXBlTmFtZSA9IFwiU3RhbmRhcmRQYXJzZWFibGVPdXRwdXRcIlxuICBwcm90ZWN0ZWQgX3R5cGVJRCA9IHVuZGVmaW5lZFxuXG4gIHNlcmlhbGl6ZShlbmNvZGluZzogU2VyaWFsaXplZEVuY29kaW5nID0gXCJoZXhcIik6IG9iamVjdCB7XG4gICAgbGV0IGZpZWxkczogb2JqZWN0ID0gc3VwZXIuc2VyaWFsaXplKGVuY29kaW5nKVxuICAgIHJldHVybiB7XG4gICAgICAuLi5maWVsZHMsXG4gICAgICBvdXRwdXQ6IHRoaXMub3V0cHV0LnNlcmlhbGl6ZShlbmNvZGluZylcbiAgICB9XG4gIH1cblxuICBwcm90ZWN0ZWQgb3V0cHV0OiBCYXNlT3V0cHV0XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBmdW5jdGlvbiB1c2VkIHRvIHNvcnQgYW4gYXJyYXkgb2YgW1tQYXJzZWFibGVPdXRwdXRdXXNcbiAgICovXG4gIHN0YXRpYyBjb21wYXJhdG9yID1cbiAgICAoKTogKChcbiAgICAgIGE6IFN0YW5kYXJkUGFyc2VhYmxlT3V0cHV0LFxuICAgICAgYjogU3RhbmRhcmRQYXJzZWFibGVPdXRwdXRcbiAgICApID0+IDEgfCAtMSB8IDApID0+XG4gICAgKGE6IFN0YW5kYXJkUGFyc2VhYmxlT3V0cHV0LCBiOiBTdGFuZGFyZFBhcnNlYWJsZU91dHB1dCk6IDEgfCAtMSB8IDAgPT4ge1xuICAgICAgY29uc3Qgc29ydGEgPSBhLnRvQnVmZmVyKClcbiAgICAgIGNvbnN0IHNvcnRiID0gYi50b0J1ZmZlcigpXG4gICAgICByZXR1cm4gQnVmZmVyLmNvbXBhcmUoc29ydGEsIHNvcnRiKSBhcyAxIHwgLTEgfCAwXG4gICAgfVxuXG4gIC8vIG11c3QgYmUgaW1wbGVtZW50ZWQgdG8gc2VsZWN0IG91dHB1dCB0eXBlcyBmb3IgdGhlIFZNIGluIHF1ZXN0aW9uXG4gIGFic3RyYWN0IGZyb21CdWZmZXIoYnl0ZXM6IEJ1ZmZlciwgb2Zmc2V0PzogbnVtYmVyKTogbnVtYmVyXG5cbiAgdG9CdWZmZXIoKTogQnVmZmVyIHtcbiAgICBjb25zdCBvdXRidWZmOiBCdWZmZXIgPSB0aGlzLm91dHB1dC50b0J1ZmZlcigpXG4gICAgY29uc3Qgb3V0aWQ6IEJ1ZmZlciA9IEJ1ZmZlci5hbGxvYyg0KVxuICAgIG91dGlkLndyaXRlVUludDMyQkUodGhpcy5vdXRwdXQuZ2V0T3V0cHV0SUQoKSwgMClcbiAgICBjb25zdCBiYXJyOiBCdWZmZXJbXSA9IFtvdXRpZCwgb3V0YnVmZl1cbiAgICByZXR1cm4gQnVmZmVyLmNvbmNhdChiYXJyLCBvdXRpZC5sZW5ndGggKyBvdXRidWZmLmxlbmd0aClcbiAgfVxuXG4gIGdldFRocmVzaG9sZCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLm91dHB1dC5nZXRUaHJlc2hvbGQoKVxuICB9XG4gIGdldExvY2t0aW1lKCk6IEJOIHtcbiAgICByZXR1cm4gdGhpcy5vdXRwdXQuZ2V0TG9ja3RpbWUoKVxuICB9XG4gIGdldEFkZHJlc3NlcygpOiBCdWZmZXJbXSB7XG4gICAgcmV0dXJuIHRoaXMub3V0cHV0LmdldEFkZHJlc3NlcygpXG4gIH1cblxuICBtZWV0c1RocmVzaG9sZChhZGRyczogQnVmZmVyW10sIGFzT2Y6IEJOKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMub3V0cHV0Lm1lZXRzVGhyZXNob2xkKGFkZHJzLCBhc09mKVxuICB9XG5cbiAgZ2V0T3V0cHV0ID0gKCk6IEJhc2VPdXRwdXQgPT4gdGhpcy5vdXRwdXRcblxuICAvKipcbiAgICogQ2xhc3MgcmVwcmVzZW50aW5nIGFuIFtbUGFyc2VhYmxlT3V0cHV0XV0gZm9yIGEgdHJhbnNhY3Rpb24uXG4gICAqXG4gICAqIEBwYXJhbSBvdXRwdXQgQSBudW1iZXIgcmVwcmVzZW50aW5nIHRoZSBJbnB1dElEIG9mIHRoZSBbW1BhcnNlYWJsZU91dHB1dF1dXG4gICAqL1xuICBjb25zdHJ1Y3RvcihvdXRwdXQ6IEJhc2VPdXRwdXQgPSB1bmRlZmluZWQpIHtcbiAgICBzdXBlcigpXG4gICAgdGhpcy5vdXRwdXQgPSBvdXRwdXRcbiAgfVxufVxuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgU3RhbmRhcmRUcmFuc2ZlcmFibGVPdXRwdXQgZXh0ZW5kcyBTdGFuZGFyZFBhcnNlYWJsZU91dHB1dCB7XG4gIHByb3RlY3RlZCBfdHlwZU5hbWUgPSBcIlN0YW5kYXJkVHJhbnNmZXJhYmxlT3V0cHV0XCJcbiAgcHJvdGVjdGVkIF90eXBlSUQgPSB1bmRlZmluZWRcblxuICBzZXJpYWxpemUoZW5jb2Rpbmc6IFNlcmlhbGl6ZWRFbmNvZGluZyA9IFwiaGV4XCIpOiBvYmplY3Qge1xuICAgIGxldCBmaWVsZHM6IG9iamVjdCA9IHN1cGVyLnNlcmlhbGl6ZShlbmNvZGluZylcbiAgICByZXR1cm4ge1xuICAgICAgLi4uZmllbGRzLFxuICAgICAgYXNzZXRJRDogc2VyaWFsaXphdGlvbi5lbmNvZGVyKHRoaXMuYXNzZXRJRCwgZW5jb2RpbmcsIFwiQnVmZmVyXCIsIFwiY2I1OFwiKVxuICAgIH1cbiAgfVxuICBkZXNlcmlhbGl6ZShmaWVsZHM6IG9iamVjdCwgZW5jb2Rpbmc6IFNlcmlhbGl6ZWRFbmNvZGluZyA9IFwiaGV4XCIpIHtcbiAgICBzdXBlci5kZXNlcmlhbGl6ZShmaWVsZHMsIGVuY29kaW5nKVxuICAgIHRoaXMuYXNzZXRJRCA9IHNlcmlhbGl6YXRpb24uZGVjb2RlcihcbiAgICAgIGZpZWxkc1tcImFzc2V0SURcIl0sXG4gICAgICBlbmNvZGluZyxcbiAgICAgIFwiY2I1OFwiLFxuICAgICAgXCJCdWZmZXJcIixcbiAgICAgIDMyXG4gICAgKVxuICB9XG5cbiAgcHJvdGVjdGVkIGFzc2V0SUQ6IEJ1ZmZlciA9IHVuZGVmaW5lZFxuXG4gIGdldEFzc2V0SUQgPSAoKTogQnVmZmVyID0+IHRoaXMuYXNzZXRJRFxuXG4gIC8vIG11c3QgYmUgaW1wbGVtZW50ZWQgdG8gc2VsZWN0IG91dHB1dCB0eXBlcyBmb3IgdGhlIFZNIGluIHF1ZXN0aW9uXG4gIGFic3RyYWN0IGZyb21CdWZmZXIoYnl0ZXM6IEJ1ZmZlciwgb2Zmc2V0PzogbnVtYmVyKTogbnVtYmVyXG5cbiAgdG9CdWZmZXIoKTogQnVmZmVyIHtcbiAgICBjb25zdCBwYXJzZWFibGVCdWZmOiBCdWZmZXIgPSBzdXBlci50b0J1ZmZlcigpXG4gICAgY29uc3QgYmFycjogQnVmZmVyW10gPSBbdGhpcy5hc3NldElELCBwYXJzZWFibGVCdWZmXVxuICAgIHJldHVybiBCdWZmZXIuY29uY2F0KGJhcnIsIHRoaXMuYXNzZXRJRC5sZW5ndGggKyBwYXJzZWFibGVCdWZmLmxlbmd0aClcbiAgfVxuXG4gIC8qKlxuICAgKiBDbGFzcyByZXByZXNlbnRpbmcgYW4gW1tTdGFuZGFyZFRyYW5zZmVyYWJsZU91dHB1dF1dIGZvciBhIHRyYW5zYWN0aW9uLlxuICAgKlxuICAgKiBAcGFyYW0gYXNzZXRJRCBBIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IHJlcHJlc2VudGluZyB0aGUgYXNzZXRJRCBvZiB0aGUgW1tPdXRwdXRdXVxuICAgKiBAcGFyYW0gb3V0cHV0IEEgbnVtYmVyIHJlcHJlc2VudGluZyB0aGUgSW5wdXRJRCBvZiB0aGUgW1tTdGFuZGFyZFRyYW5zZmVyYWJsZU91dHB1dF1dXG4gICAqL1xuICBjb25zdHJ1Y3Rvcihhc3NldElEOiBCdWZmZXIgPSB1bmRlZmluZWQsIG91dHB1dDogQmFzZU91dHB1dCA9IHVuZGVmaW5lZCkge1xuICAgIHN1cGVyKG91dHB1dClcbiAgICBpZiAodHlwZW9mIGFzc2V0SUQgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIHRoaXMuYXNzZXRJRCA9IGFzc2V0SURcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBBbiBbW091dHB1dF1dIGNsYXNzIHdoaWNoIHNwZWNpZmllcyBhIHRva2VuIGFtb3VudCAuXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBTdGFuZGFyZEFtb3VudE91dHB1dCBleHRlbmRzIE91dHB1dCB7XG4gIHByb3RlY3RlZCBfdHlwZU5hbWUgPSBcIlN0YW5kYXJkQW1vdW50T3V0cHV0XCJcbiAgcHJvdGVjdGVkIF90eXBlSUQgPSB1bmRlZmluZWRcblxuICBzZXJpYWxpemUoZW5jb2Rpbmc6IFNlcmlhbGl6ZWRFbmNvZGluZyA9IFwiaGV4XCIpOiBvYmplY3Qge1xuICAgIGxldCBmaWVsZHM6IG9iamVjdCA9IHN1cGVyLnNlcmlhbGl6ZShlbmNvZGluZylcbiAgICByZXR1cm4ge1xuICAgICAgLi4uZmllbGRzLFxuICAgICAgYW1vdW50OiBzZXJpYWxpemF0aW9uLmVuY29kZXIoXG4gICAgICAgIHRoaXMuYW1vdW50LFxuICAgICAgICBlbmNvZGluZyxcbiAgICAgICAgXCJCdWZmZXJcIixcbiAgICAgICAgXCJkZWNpbWFsU3RyaW5nXCIsXG4gICAgICAgIDhcbiAgICAgIClcbiAgICB9XG4gIH1cbiAgZGVzZXJpYWxpemUoZmllbGRzOiBvYmplY3QsIGVuY29kaW5nOiBTZXJpYWxpemVkRW5jb2RpbmcgPSBcImhleFwiKSB7XG4gICAgc3VwZXIuZGVzZXJpYWxpemUoZmllbGRzLCBlbmNvZGluZylcbiAgICB0aGlzLmFtb3VudCA9IHNlcmlhbGl6YXRpb24uZGVjb2RlcihcbiAgICAgIGZpZWxkc1tcImFtb3VudFwiXSxcbiAgICAgIGVuY29kaW5nLFxuICAgICAgXCJkZWNpbWFsU3RyaW5nXCIsXG4gICAgICBcIkJ1ZmZlclwiLFxuICAgICAgOFxuICAgIClcbiAgICB0aGlzLmFtb3VudFZhbHVlID0gYmludG9vbHMuZnJvbUJ1ZmZlclRvQk4odGhpcy5hbW91bnQpXG4gIH1cblxuICBwcm90ZWN0ZWQgYW1vdW50OiBCdWZmZXIgPSBCdWZmZXIuYWxsb2MoOClcbiAgcHJvdGVjdGVkIGFtb3VudFZhbHVlOiBCTiA9IG5ldyBCTigwKVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBhbW91bnQgYXMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2luZHV0bnkvYm4uanMvfEJOfS5cbiAgICovXG4gIGdldEFtb3VudCgpOiBCTiB7XG4gICAgcmV0dXJuIHRoaXMuYW1vdW50VmFsdWUuY2xvbmUoKVxuICB9XG5cbiAgLyoqXG4gICAqIFBvcHVhdGVzIHRoZSBpbnN0YW5jZSBmcm9tIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gcmVwcmVzZW50aW5nIHRoZSBbW1N0YW5kYXJkQW1vdW50T3V0cHV0XV0gYW5kIHJldHVybnMgdGhlIHNpemUgb2YgdGhlIG91dHB1dC5cbiAgICovXG4gIGZyb21CdWZmZXIob3V0YnVmZjogQnVmZmVyLCBvZmZzZXQ6IG51bWJlciA9IDApOiBudW1iZXIge1xuICAgIHRoaXMuYW1vdW50ID0gYmludG9vbHMuY29weUZyb20ob3V0YnVmZiwgb2Zmc2V0LCBvZmZzZXQgKyA4KVxuICAgIHRoaXMuYW1vdW50VmFsdWUgPSBiaW50b29scy5mcm9tQnVmZmVyVG9CTih0aGlzLmFtb3VudClcbiAgICBvZmZzZXQgKz0gOFxuICAgIHJldHVybiBzdXBlci5mcm9tQnVmZmVyKG91dGJ1ZmYsIG9mZnNldClcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBidWZmZXIgcmVwcmVzZW50aW5nIHRoZSBbW1N0YW5kYXJkQW1vdW50T3V0cHV0XV0gaW5zdGFuY2UuXG4gICAqL1xuICB0b0J1ZmZlcigpOiBCdWZmZXIge1xuICAgIGNvbnN0IHN1cGVyYnVmZjogQnVmZmVyID0gc3VwZXIudG9CdWZmZXIoKVxuICAgIGNvbnN0IGJzaXplOiBudW1iZXIgPSB0aGlzLmFtb3VudC5sZW5ndGggKyBzdXBlcmJ1ZmYubGVuZ3RoXG4gICAgdGhpcy5udW1hZGRycy53cml0ZVVJbnQzMkJFKHRoaXMuYWRkcmVzc2VzLmxlbmd0aCwgMClcbiAgICBjb25zdCBiYXJyOiBCdWZmZXJbXSA9IFt0aGlzLmFtb3VudCwgc3VwZXJidWZmXVxuICAgIHJldHVybiBCdWZmZXIuY29uY2F0KGJhcnIsIGJzaXplKVxuICB9XG5cbiAgLyoqXG4gICAqIEEgW1tTdGFuZGFyZEFtb3VudE91dHB1dF1dIGNsYXNzIHdoaWNoIGlzc3VlcyBhIHBheW1lbnQgb24gYW4gYXNzZXRJRC5cbiAgICpcbiAgICogQHBhcmFtIGFtb3VudCBBIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vaW5kdXRueS9ibi5qcy98Qk59IHJlcHJlc2VudGluZyB0aGUgYW1vdW50IGluIHRoZSBvdXRwdXRcbiAgICogQHBhcmFtIGFkZHJlc3NlcyBBbiBhcnJheSBvZiB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfXMgcmVwcmVzZW50aW5nIGFkZHJlc3Nlc1xuICAgKiBAcGFyYW0gbG9ja3RpbWUgQSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2luZHV0bnkvYm4uanMvfEJOfSByZXByZXNlbnRpbmcgdGhlIGxvY2t0aW1lXG4gICAqIEBwYXJhbSB0aHJlc2hvbGQgQSBudW1iZXIgcmVwcmVzZW50aW5nIHRoZSB0aGUgdGhyZXNob2xkIG51bWJlciBvZiBzaWduZXJzIHJlcXVpcmVkIHRvIHNpZ24gdGhlIHRyYW5zYWN0aW9uXG4gICAqL1xuICBjb25zdHJ1Y3RvcihcbiAgICBhbW91bnQ6IEJOID0gdW5kZWZpbmVkLFxuICAgIGFkZHJlc3NlczogQnVmZmVyW10gPSB1bmRlZmluZWQsXG4gICAgbG9ja3RpbWU6IEJOID0gdW5kZWZpbmVkLFxuICAgIHRocmVzaG9sZDogbnVtYmVyID0gdW5kZWZpbmVkXG4gICkge1xuICAgIHN1cGVyKGFkZHJlc3NlcywgbG9ja3RpbWUsIHRocmVzaG9sZClcbiAgICBpZiAodHlwZW9mIGFtb3VudCAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgdGhpcy5hbW91bnRWYWx1ZSA9IGFtb3VudC5jbG9uZSgpXG4gICAgICB0aGlzLmFtb3VudCA9IGJpbnRvb2xzLmZyb21CTlRvQnVmZmVyKGFtb3VudCwgOClcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBBbiBbW091dHB1dF1dIGNsYXNzIHdoaWNoIHNwZWNpZmllcyBhbiBORlQuXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBCYXNlTkZUT3V0cHV0IGV4dGVuZHMgT3V0cHV0IHtcbiAgcHJvdGVjdGVkIF90eXBlTmFtZSA9IFwiQmFzZU5GVE91dHB1dFwiXG4gIHByb3RlY3RlZCBfdHlwZUlEID0gdW5kZWZpbmVkXG5cbiAgc2VyaWFsaXplKGVuY29kaW5nOiBTZXJpYWxpemVkRW5jb2RpbmcgPSBcImhleFwiKTogb2JqZWN0IHtcbiAgICBsZXQgZmllbGRzOiBvYmplY3QgPSBzdXBlci5zZXJpYWxpemUoZW5jb2RpbmcpXG4gICAgcmV0dXJuIHtcbiAgICAgIC4uLmZpZWxkcyxcbiAgICAgIGdyb3VwSUQ6IHNlcmlhbGl6YXRpb24uZW5jb2RlcihcbiAgICAgICAgdGhpcy5ncm91cElELFxuICAgICAgICBlbmNvZGluZyxcbiAgICAgICAgXCJCdWZmZXJcIixcbiAgICAgICAgXCJkZWNpbWFsU3RyaW5nXCIsXG4gICAgICAgIDRcbiAgICAgIClcbiAgICB9XG4gIH1cbiAgZGVzZXJpYWxpemUoZmllbGRzOiBvYmplY3QsIGVuY29kaW5nOiBTZXJpYWxpemVkRW5jb2RpbmcgPSBcImhleFwiKSB7XG4gICAgc3VwZXIuZGVzZXJpYWxpemUoZmllbGRzLCBlbmNvZGluZylcbiAgICB0aGlzLmdyb3VwSUQgPSBzZXJpYWxpemF0aW9uLmRlY29kZXIoXG4gICAgICBmaWVsZHNbXCJncm91cElEXCJdLFxuICAgICAgZW5jb2RpbmcsXG4gICAgICBcImRlY2ltYWxTdHJpbmdcIixcbiAgICAgIFwiQnVmZmVyXCIsXG4gICAgICA0XG4gICAgKVxuICB9XG5cbiAgcHJvdGVjdGVkIGdyb3VwSUQ6IEJ1ZmZlciA9IEJ1ZmZlci5hbGxvYyg0KVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBncm91cElEIGFzIGEgbnVtYmVyLlxuICAgKi9cbiAgZ2V0R3JvdXBJRCA9ICgpOiBudW1iZXIgPT4ge1xuICAgIHJldHVybiB0aGlzLmdyb3VwSUQucmVhZFVJbnQzMkJFKDApXG4gIH1cbn1cbiJdfQ==
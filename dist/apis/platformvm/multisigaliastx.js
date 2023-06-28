"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultisigAliasTx = exports.MultisigAlias = void 0;
/**
 * @packageDocumentation
 * @module API-PlatformVM-MultisigAliasTx
 */
const buffer_1 = require("buffer/");
const bintools_1 = __importDefault(require("../../utils/bintools"));
const constants_1 = require("./constants");
const outputs_1 = require("./outputs");
const common_1 = require("../../common");
const basetx_1 = require("./basetx");
const constants_2 = require("../../utils/constants");
const serialization_1 = require("../../utils/serialization");
const _1 = require(".");
/**
 * @ignore
 */
const bintools = bintools_1.default.getInstance();
const serialization = serialization_1.Serialization.getInstance();
/**
 * Class representing a Multisig Alias object.
 */
class MultisigAlias {
    constructor(id = undefined, memo = undefined, owners = undefined) {
        this.id = buffer_1.Buffer.alloc(20);
        this.memo = buffer_1.Buffer.alloc(256);
        this.owners = undefined;
        if (typeof id !== "undefined")
            this.id = id;
        if (typeof memo !== "undefined") {
            this.memo = memo;
        }
        if (typeof owners !== "undefined")
            this.owners = owners;
    }
    getMemo() {
        return this.memo;
    }
    deserialize(fields, encoding = "hex") {
        this.id = serialization.decoder(fields["id"], encoding, "cb58", "Buffer");
        this.memo = serialization.decoder(fields["memo"], encoding, "utf8", "Buffer");
        this.owners.deserialize(fields["owners"], encoding);
        return this;
    }
    serialize(encoding = "hex") {
        return {
            id: serialization.encoder(this.id, encoding, "Buffer", "cb58"),
            memo: serialization.encoder(this.memo, encoding, "Buffer", "utf8"),
            owners: this.owners.serialize(encoding)
        };
    }
    fromBuffer(bytes, offset = 0) {
        this.id = bintools.copyFrom(bytes, offset, offset + 20);
        offset += 20;
        let memolen = bintools
            .copyFrom(bytes, offset, offset + 4)
            .readUInt32BE(0);
        offset += 4;
        this.memo = bintools.copyFrom(bytes, offset, offset + memolen);
        offset += memolen;
        this.owners = new outputs_1.ParseableOutput();
        offset = this.owners.fromBuffer(bytes, offset);
        return offset;
    }
    toBuffer() {
        let bsize = this.id.length;
        const buffer = [this.id];
        let memolen = buffer_1.Buffer.alloc(4);
        memolen.writeUInt32BE(this.memo.length, 0);
        buffer.push(memolen);
        bsize += 4;
        buffer.push(this.memo);
        bsize += this.memo.length;
        buffer.push(this.owners.toBuffer());
        bsize += this.owners.toBuffer().length;
        return buffer_1.Buffer.concat(buffer, bsize);
    }
}
exports.MultisigAlias = MultisigAlias;
/**
 * Class representing an unsigned MultisigAlias transaction.
 */
class MultisigAliasTx extends basetx_1.BaseTx {
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        this.multisigAlias = new MultisigAlias().deserialize(fields["multisigAlias"], encoding);
    }
    serialize(encoding = "hex") {
        let fields = super.serialize(encoding);
        return Object.assign(Object.assign({}, fields), { multisigAlias: this.multisigAlias.serialize(encoding) });
    }
    /**
     * Returns the id of the [[MultisigAliasTx]]
     */
    getTxType() {
        return constants_1.PlatformVMConstants.MULTISIGALIASTX;
    }
    /**
     * Returns the MultisigAlias definition.
     */
    getMultisigAlias() {
        return this.multisigAlias;
    }
    /**
     * Returns the Auth that allows existing owners to change an alias.
     */
    getAuth() {
        return this.auth;
    }
    /**
     * Takes a {@link https://github.com/feross/buffer|Buffer} containing a raw [[MultisigAliasTx]], parses it, populates the class, and returns the length of the [[MultisigAliasTx]] in bytes.
     *
     * @param bytes A {@link https://github.com/feross/buffer|Buffer} containing a raw [[MultisigAliasTx]]
     * @param offset The offset to start reading the bytes from. Default: 0
     *
     * @returns The length of the raw [[MultisigAliasTx]]
     *
     * @remarks assume not-checksummed
     */
    fromBuffer(bytes, offset = 0) {
        offset = super.fromBuffer(bytes, offset);
        const alias = new MultisigAlias();
        offset += alias.fromBuffer(bintools.copyFrom(bytes, offset));
        this.multisigAlias = alias;
        const sa = new _1.SubnetAuth();
        offset += sa.fromBuffer(bintools.copyFrom(bytes, offset));
        this.auth = sa;
        return offset;
    }
    /**
     * Returns a {@link https://github.com/feross/buffer|Buffer} representation of the [[MultisigAliasTx]].
     */
    toBuffer() {
        const superbuff = super.toBuffer();
        let bsize = superbuff.length;
        const aliasBuffer = this.multisigAlias.toBuffer();
        bsize += aliasBuffer.length;
        const authBuffer = this.auth.toBuffer();
        bsize += authBuffer.length;
        const barr = [superbuff, aliasBuffer, authBuffer];
        return buffer_1.Buffer.concat(barr, bsize);
    }
    clone() {
        const newMultisigAliasTx = new MultisigAliasTx();
        newMultisigAliasTx.fromBuffer(this.toBuffer());
        return newMultisigAliasTx;
    }
    create(...args) {
        return new MultisigAliasTx(...args);
    }
    /**
     * Creates and adds a [[SigIdx]] to the [[MultisigAliasTx]].
     *
     * @param addressIdx The index of the address to reference in the signatures
     * @param address The address of the source of the signature
     */
    addSignatureIdx(addressIdx, address) {
        const addressIndex = buffer_1.Buffer.alloc(4);
        addressIndex.writeUIntBE(addressIdx, 0, 4);
        this.auth.addAddressIndex(addressIndex);
        const sigidx = new common_1.SigIdx();
        const b = buffer_1.Buffer.alloc(4);
        b.writeUInt32BE(addressIdx, 0);
        sigidx.fromBuffer(b);
        sigidx.setSource(address);
        this.sigIdxs.push(sigidx);
        this.sigCount.writeUInt32BE(this.sigIdxs.length, 0);
    }
    /**
     * Returns the array of [[SigIdx]] for this [[TX]]
     */
    getSigIdxs() {
        return this.sigIdxs;
    }
    getCredentialID() {
        return constants_1.PlatformVMConstants.SECPCREDENTIAL;
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
        for (const sigidxs of this.sigIdxs) {
            const cred = (0, _1.SelectCredentialClass)(constants_1.PlatformVMConstants.SECPCREDENTIAL);
            for (let i = 0; i < this.sigIdxs.length; i++) {
                const keypair = kc.getKey(sigidxs[`${i}`].getSource());
                const signval = keypair.sign(msg);
                const sig = new common_1.Signature();
                sig.fromBuffer(signval);
                cred.addSignature(sig);
            }
            creds.push(cred);
        }
        return creds;
    }
    /**
     * Class representing a MultisigAlias transaction.
     *
     * @param networkID Optional networkID, [[DefaultNetworkID]]
     * @param blockchainID Optional blockchainID, default Buffer.alloc(32, 16)
     * @param outs Optional array of the [[TransferableOutput]]s
     * @param ins Optional array of the [[TransferableInput]]s
     * @param memo Optional {@link https://github.com/feross/buffer|Buffer} for the memo field
     * @param multisigAlias Multisig alias definition. MultisigAlias.ID must be empty if it's the new alias.
     * @param auth Auth that allows existing owners to change an alias.
     */
    constructor(networkID = constants_2.DefaultNetworkID, blockchainID = buffer_1.Buffer.alloc(32, 16), outs = undefined, ins = undefined, memo = undefined, multisigAlias = undefined, auth = undefined) {
        super(networkID, blockchainID, outs, ins, memo);
        this._typeName = "MultisigAliasTx";
        this._typeID = constants_1.PlatformVMConstants.MULTISIGALIASTX;
        // Signatures
        this.sigCount = buffer_1.Buffer.alloc(4);
        this.sigIdxs = []; // idxs of subnet auth signers
        if (multisigAlias) {
            this.multisigAlias = multisigAlias;
        }
        else {
            this.multisigAlias = new MultisigAlias();
        }
        if (auth) {
            this.auth = auth;
        }
        else {
            this.auth = new _1.SubnetAuth();
        }
    }
}
exports.MultisigAliasTx = MultisigAliasTx;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXVsdGlzaWdhbGlhc3R4LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2FwaXMvcGxhdGZvcm12bS9tdWx0aXNpZ2FsaWFzdHgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7OztHQUdHO0FBQ0gsb0NBQWdDO0FBQ2hDLG9FQUEyQztBQUMzQywyQ0FBaUQ7QUFDakQsdUNBQStEO0FBRS9ELHlDQUE0RDtBQUM1RCxxQ0FBaUM7QUFDakMscURBQXdEO0FBQ3hELDZEQUE2RTtBQUM3RSx3QkFBcUQ7QUFHckQ7O0dBRUc7QUFDSCxNQUFNLFFBQVEsR0FBYSxrQkFBUSxDQUFDLFdBQVcsRUFBRSxDQUFBO0FBQ2pELE1BQU0sYUFBYSxHQUFrQiw2QkFBYSxDQUFDLFdBQVcsRUFBRSxDQUFBO0FBRWhFOztHQUVHO0FBQ0gsTUFBYSxhQUFhO0lBS3hCLFlBQ0UsS0FBYSxTQUFTLEVBQ3RCLE9BQWUsU0FBUyxFQUN4QixTQUEwQixTQUFTO1FBUDNCLE9BQUUsR0FBRyxlQUFNLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQ3JCLFNBQUksR0FBRyxlQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ3hCLFdBQU0sR0FBb0IsU0FBUyxDQUFBO1FBTzNDLElBQUksT0FBTyxFQUFFLEtBQUssV0FBVztZQUFFLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQzNDLElBQUksT0FBTyxJQUFJLEtBQUssV0FBVyxFQUFFO1lBQy9CLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFBO1NBQ2pCO1FBQ0QsSUFBSSxPQUFPLE1BQU0sS0FBSyxXQUFXO1lBQUUsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUE7SUFDekQsQ0FBQztJQUVELE9BQU87UUFDTCxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUE7SUFDbEIsQ0FBQztJQUVELFdBQVcsQ0FBQyxNQUFjLEVBQUUsV0FBK0IsS0FBSztR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QUVELElBQUksSUFBSSxFQUFFO1lBQ1IsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUE7U0FDakI7YUFBTTtZQUNMLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxhQUFVLEVBQUUsQ0FBQTtTQUM3QjtJQUNILENBQUM7Q0FDRjtBQWpNRCwwQ0FpTUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBwYWNrYWdlRG9jdW1lbnRhdGlvblxuICogQG1vZHVsZSBBUEktUGxhdGZvcm1WTS1NdWx0aXNpZ0FsaWFzVHhcbiAqL1xuaW1wb3J0IHsgQnVmZmVyIH0gZnJvbSBcImJ1ZmZlci9cIlxuaW1wb3J0IEJpblRvb2xzIGZyb20gXCIuLi8uLi91dGlscy9iaW50b29sc1wiXG5pbXBvcnQgeyBQbGF0Zm9ybVZNQ29uc3RhbnRzIH0gZnJvbSBcIi4vY29uc3RhbnRzXCJcbmltcG9ydCB7IFBhcnNlYWJsZU91dHB1dCwgVHJhbnNmZXJhYmxlT3V0cHV0IH0gZnJvbSBcIi4vb3V0cHV0c1wiXG5pbXBvcnQgeyBUcmFuc2ZlcmFibGVJbnB1dCB9IGZyb20gXCIuL2lucHV0c1wiXG5pbXBvcnQgeyBDcmVkZW50aWFsLCBTaWdJZHgsIFNpZ25hdHVyZSB9IGZyb20gXCIuLi8uLi9jb21tb25cIlxuaW1wb3J0IHsgQmFzZVR4IH0gZnJvbSBcIi4vYmFzZXR4XCJcbmltcG9ydCB7IERlZmF1bHROZXR3b3JrSUQgfSBmcm9tIFwiLi4vLi4vdXRpbHMvY29uc3RhbnRzXCJcbmltcG9ydCB7IFNlcmlhbGl6YXRpb24sIFNlcmlhbGl6ZWRFbmNvZGluZyB9IGZyb20gXCIuLi8uLi91dGlscy9zZXJpYWxpemF0aW9uXCJcbmltcG9ydCB7IFNlbGVjdENyZWRlbnRpYWxDbGFzcywgU3VibmV0QXV0aCB9IGZyb20gXCIuXCJcbmltcG9ydCB7IEtleUNoYWluLCBLZXlQYWlyIH0gZnJvbSBcIi4va2V5Y2hhaW5cIlxuXG4vKipcbiAqIEBpZ25vcmVcbiAqL1xuY29uc3QgYmludG9vbHM6IEJpblRvb2xzID0gQmluVG9vbHMuZ2V0SW5zdGFuY2UoKVxuY29uc3Qgc2VyaWFsaXphdGlvbjogU2VyaWFsaXphdGlvbiA9IFNlcmlhbGl6YXRpb24uZ2V0SW5zdGFuY2UoKVxuXG4vKipcbiAqIENsYXNzIHJlcHJlc2VudGluZyBhIE11bHRpc2lnIEFsaWFzIG9iamVjdC5cbiAqL1xuZXhwb3J0IGNsYXNzIE11bHRpc2lnQWxpYXMge1xuICBwcm90ZWN0ZWQgaWQgPSBCdWZmZXIuYWxsb2MoMjApXG4gIHByb3RlY3RlZCBtZW1vID0gQnVmZmVyLmFsbG9jKDI1NilcbiAgcHJvdGVjdGVkIG93bmVyczogUGFyc2VhYmxlT3V0cHV0ID0gdW5kZWZpbmVkXG5cbiAgY29uc3RydWN0b3IoXG4gICAgaWQ6IEJ1ZmZlciA9IHVuZGVmaW5lZCxcbiAgICBtZW1vOiBCdWZmZXIgPSB1bmRlZmluZWQsXG4gICAgb3duZXJzOiBQYXJzZWFibGVPdXRwdXQgPSB1bmRlZmluZWRcbiAgKSB7XG4gICAgaWYgKHR5cGVvZiBpZCAhPT0gXCJ1bmRlZmluZWRcIikgdGhpcy5pZCA9IGlkXG4gICAgaWYgKHR5cGVvZiBtZW1vICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICB0aGlzLm1lbW8gPSBtZW1vXG4gICAgfVxuICAgIGlmICh0eXBlb2Ygb3duZXJzICE9PSBcInVuZGVmaW5lZFwiKSB0aGlzLm93bmVycyA9IG93bmVyc1xuICB9XG5cbiAgZ2V0TWVtbygpOiBCdWZmZXIge1xuICAgIHJldHVybiB0aGlzLm1lbW9cbiAgfVxuXG4gIGRlc2VyaWFsaXplKGZpZWxkczogb2JqZWN0LCBlbmNvZGluZzogU2VyaWFsaXplZEVuY29kaW5nID0gXCJoZXhcIik6IHRoaXMge1xuICAgIHRoaXMuaWQgPSBzZXJpYWxpemF0aW9uLmRlY29kZXIoZmllbGRzW1wiaWRcIl0sIGVuY29kaW5nLCBcImNiNThcIiwgXCJCdWZmZXJcIilcbiAgICB0aGlzLm1lbW8gPSBzZXJpYWxpemF0aW9uLmRlY29kZXIoXG4gICAgICBmaWVsZHNbXCJtZW1vXCJdLFxuICAgICAgZW5jb2RpbmcsXG4gICAgICBcInV0ZjhcIixcbiAgICAgIFwiQnVmZmVyXCJcbiAgICApXG4gICAgdGhpcy5vd25lcnMuZGVzZXJpYWxpemUoZmllbGRzW1wib3duZXJzXCJdLCBlbmNvZGluZylcblxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBzZXJpYWxpemUoZW5jb2Rpbmc6IFNlcmlhbGl6ZWRFbmNvZGluZyA9IFwiaGV4XCIpOiBvYmplY3Qge1xuICAgIHJldHVybiB7XG4gICAgICBpZDogc2VyaWFsaXphdGlvbi5lbmNvZGVyKHRoaXMuaWQsIGVuY29kaW5nLCBcIkJ1ZmZlclwiLCBcImNiNThcIiksXG4gICAgICBtZW1vOiBzZXJpYWxpemF0aW9uLmVuY29kZXIodGhpcy5tZW1vLCBlbmNvZGluZywgXCJCdWZmZXJcIiwgXCJ1dGY4XCIpLFxuICAgICAgb3duZXJzOiB0aGlzLm93bmVycy5zZXJpYWxpemUoZW5jb2RpbmcpXG4gICAgfVxuICB9XG5cbiAgZnJvbUJ1ZmZlcihieXRlczogQnVmZmVyLCBvZmZzZXQ6IG51bWJlciA9IDApOiBudW1iZXIge1xuICAgIHRoaXMuaWQgPSBiaW50b29scy5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyAyMClcbiAgICBvZmZzZXQgKz0gMjBcbiAgICBsZXQgbWVtb2xlbjogbnVtYmVyID0gYmludG9vbHNcbiAgICAgIC5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyA0KVxuICAgICAgLnJlYWRVSW50MzJCRSgwKVxuICAgIG9mZnNldCArPSA0XG4gICAgdGhpcy5tZW1vID0gYmludG9vbHMuY29weUZyb20oYnl0ZXMsIG9mZnNldCwgb2Zmc2V0ICsgbWVtb2xlbilcbiAgICBvZmZzZXQgKz0gbWVtb2xlblxuICAgIHRoaXMub3duZXJzID0gbmV3IFBhcnNlYWJsZU91dHB1dCgpXG4gICAgb2Zmc2V0ID0gdGhpcy5vd25lcnMuZnJvbUJ1ZmZlcihieXRlcywgb2Zmc2V0KVxuXG4gICAgcmV0dXJuIG9mZnNldFxuICB9XG5cbiAgdG9CdWZmZXIoKTogQnVmZmVyIHtcbiAgICBsZXQgYnNpemU6IG51bWJlciA9IHRoaXMuaWQubGVuZ3RoXG4gICAgY29uc3QgYnVmZmVyOiBCdWZmZXJbXSA9IFt0aGlzLmlkXVxuXG4gICAgbGV0IG1lbW9sZW46IEJ1ZmZlciA9IEJ1ZmZlci5hbGxvYyg0KVxuICAgIG1lbW9sZW4ud3JpdGVVSW50MzJCRSh0aGlzLm1lbW8ubGVuZ3RoLCAwKVxuICAgIGJ1ZmZlci5wdXNoKG1lbW9sZW4pXG4gICAgYnNpemUgKz0gNFxuICAgIGJ1ZmZlci5wdXNoKHRoaXMubWVtbylcbiAgICBic2l6ZSArPSB0aGlzLm1lbW8ubGVuZ3RoXG5cbiAgICBidWZmZXIucHVzaCh0aGlzLm93bmVycy50b0J1ZmZlcigpKVxuICAgIGJzaXplICs9IHRoaXMub3duZXJzLnRvQnVmZmVyKCkubGVuZ3RoXG5cbiAgICByZXR1cm4gQnVmZmVyLmNvbmNhdChidWZmZXIsIGJzaXplKVxuICB9XG59XG5cbi8qKlxuICogQ2xhc3MgcmVwcmVzZW50aW5nIGFuIHVuc2lnbmVkIE11bHRpc2lnQWxpYXMgdHJhbnNhY3Rpb24uXG4gKi9cbmV4cG9ydCBjbGFzcyBNdWx0aXNpZ0FsaWFzVHggZXh0ZW5kcyBCYXNlVHgge1xuICBwcm90ZWN0ZWQgX3R5cGVOYW1lID0gXCJNdWx0aXNpZ0FsaWFzVHhcIlxuICBwcm90ZWN0ZWQgX3R5cGVJRCA9IFBsYXRmb3JtVk1Db25zdGFudHMuTVVMVElTSUdBTElBU1RYXG5cbiAgLy8gTXVsdGlzaWcgYWxpYXMgZGVmaW5pdGlvbi4gTXVsdGlzaWdBbGlhcy5JRCBtdXN0IGJlIGVtcHR5IGlmIGl0J3MgdGhlIG5ldyBhbGlhc1xuICBwcm90ZWN0ZWQgbXVsdGlzaWdBbGlhczogTXVsdGlzaWdBbGlhc1xuICAvLyBBdXRoIHRoYXQgYWxsb3dzIGV4aXN0aW5nIG93bmVycyB0byBjaGFuZ2UgYW4gYWxpYXNcbiAgcHJvdGVjdGVkIGF1dGg6IFN1Ym5ldEF1dGhcbiAgLy8gU2lnbmF0dXJlc1xuICBwcm90ZWN0ZWQgc2lnQ291bnQ6IEJ1ZmZlciA9IEJ1ZmZlci5hbGxvYyg0KVxuICBwcm90ZWN0ZWQgc2lnSWR4czogU2lnSWR4W10gPSBbXSAvLyBpZHhzIG9mIHN1Ym5ldCBhdXRoIHNpZ25lcnNcblxuICBkZXNlcmlhbGl6ZShmaWVsZHM6IG9iamVjdCwgZW5jb2Rpbmc6IFNlcmlhbGl6ZWRFbmNvZGluZyA9IFwiaGV4XCIpIHtcbiAgICBzdXBlci5kZXNlcmlhbGl6ZShmaWVsZHMsIGVuY29kaW5nKVxuICAgIHRoaXMubXVsdGlzaWdBbGlhcyA9IG5ldyBNdWx0aXNpZ0FsaWFzKCkuZGVzZXJpYWxpemUoXG4gICAgICBmaWVsZHNbXCJtdWx0aXNpZ0FsaWFzXCJdLFxuICAgICAgZW5jb2RpbmdcbiAgICApXG4gIH1cblxuICBzZXJpYWxpemUoZW5jb2Rpbmc6IFNlcmlhbGl6ZWRFbmNvZGluZyA9IFwiaGV4XCIpOiBvYmplY3Qge1xuICAgIGxldCBmaWVsZHM6IG9iamVjdCA9IHN1cGVyLnNlcmlhbGl6ZShlbmNvZGluZylcbiAgICByZXR1cm4ge1xuICAgICAgLi4uZmllbGRzLFxuICAgICAgbXVsdGlzaWdBbGlhczogdGhpcy5tdWx0aXNpZ0FsaWFzLnNlcmlhbGl6ZShlbmNvZGluZylcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgaWQgb2YgdGhlIFtbTXVsdGlzaWdBbGlhc1R4XV1cbiAgICovXG4gIGdldFR4VHlwZSgpOiBudW1iZXIge1xuICAgIHJldHVybiBQbGF0Zm9ybVZNQ29uc3RhbnRzLk1VTFRJU0lHQUxJQVNUWFxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIE11bHRpc2lnQWxpYXMgZGVmaW5pdGlvbi5cbiAgICovXG4gIGdldE11bHRpc2lnQWxpYXMoKTogTXVsdGlzaWdBbGlhcyB7XG4gICAgcmV0dXJuIHRoaXMubXVsdGlzaWdBbGlhc1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIEF1dGggdGhhdCBhbGxvd3MgZXhpc3Rpbmcgb3duZXJzIHRvIGNoYW5nZSBhbiBhbGlhcy5cbiAgICovXG4gIGdldEF1dGgoKTogU3VibmV0QXV0aCB7XG4gICAgcmV0dXJuIHRoaXMuYXV0aFxuICB9XG5cbiAgLyoqXG4gICAqIFRha2VzIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gY29udGFpbmluZyBhIHJhdyBbW011bHRpc2lnQWxpYXNUeF1dLCBwYXJzZXMgaXQsIHBvcHVsYXRlcyB0aGUgY2xhc3MsIGFuZCByZXR1cm5zIHRoZSBsZW5ndGggb2YgdGhlIFtbTXVsdGlzaWdBbGlhc1R4XV0gaW4gYnl0ZXMuXG4gICAqXG4gICAqIEBwYXJhbSBieXRlcyBBIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IGNvbnRhaW5pbmcgYSByYXcgW1tNdWx0aXNpZ0FsaWFzVHhdXVxuICAgKiBAcGFyYW0gb2Zmc2V0IFRoZSBvZmZzZXQgdG8gc3RhcnQgcmVhZGluZyB0aGUgYnl0ZXMgZnJvbS4gRGVmYXVsdDogMFxuICAgKlxuICAgKiBAcmV0dXJucyBUaGUgbGVuZ3RoIG9mIHRoZSByYXcgW1tNdWx0aXNpZ0FsaWFzVHhdXVxuICAgKlxuICAgKiBAcmVtYXJrcyBhc3N1bWUgbm90LWNoZWNrc3VtbWVkXG4gICAqL1xuICBmcm9tQnVmZmVyKGJ5dGVzOiBCdWZmZXIsIG9mZnNldDogbnVtYmVyID0gMCk6IG51bWJlciB7XG4gICAgb2Zmc2V0ID0gc3VwZXIuZnJvbUJ1ZmZlcihieXRlcywgb2Zmc2V0KVxuXG4gICAgY29uc3QgYWxpYXM6IE11bHRpc2lnQWxpYXMgPSBuZXcgTXVsdGlzaWdBbGlhcygpXG4gICAgb2Zmc2V0ICs9IGFsaWFzLmZyb21CdWZmZXIoYmludG9vbHMuY29weUZyb20oYnl0ZXMsIG9mZnNldCkpXG4gICAgdGhpcy5tdWx0aXNpZ0FsaWFzID0gYWxpYXNcblxuICAgIGNvbnN0IHNhOiBTdWJuZXRBdXRoID0gbmV3IFN1Ym5ldEF1dGgoKVxuICAgIG9mZnNldCArPSBzYS5mcm9tQnVmZmVyKGJpbnRvb2xzLmNvcHlGcm9tKGJ5dGVzLCBvZmZzZXQpKVxuICAgIHRoaXMuYXV0aCA9IHNhXG5cbiAgICByZXR1cm4gb2Zmc2V0XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IHJlcHJlc2VudGF0aW9uIG9mIHRoZSBbW011bHRpc2lnQWxpYXNUeF1dLlxuICAgKi9cbiAgdG9CdWZmZXIoKTogQnVmZmVyIHtcbiAgICBjb25zdCBzdXBlcmJ1ZmY6IEJ1ZmZlciA9IHN1cGVyLnRvQnVmZmVyKClcblxuICAgIGxldCBic2l6ZTogbnVtYmVyID0gc3VwZXJidWZmLmxlbmd0aFxuXG4gICAgY29uc3QgYWxpYXNCdWZmZXI6IEJ1ZmZlciA9IHRoaXMubXVsdGlzaWdBbGlhcy50b0J1ZmZlcigpXG4gICAgYnNpemUgKz0gYWxpYXNCdWZmZXIubGVuZ3RoXG5cbiAgICBjb25zdCBhdXRoQnVmZmVyOiBCdWZmZXIgPSB0aGlzLmF1dGgudG9CdWZmZXIoKVxuICAgIGJzaXplICs9IGF1dGhCdWZmZXIubGVuZ3RoXG5cbiAgICBjb25zdCBiYXJyOiBCdWZmZXJbXSA9IFtzdXBlcmJ1ZmYsIGFsaWFzQnVmZmVyLCBhdXRoQnVmZmVyXVxuXG4gICAgcmV0dXJuIEJ1ZmZlci5jb25jYXQoYmFyciwgYnNpemUpXG4gIH1cblxuICBjbG9uZSgpOiB0aGlzIHtcbiAgICBjb25zdCBuZXdNdWx0aXNpZ0FsaWFzVHg6IE11bHRpc2lnQWxpYXNUeCA9IG5ldyBNdWx0aXNpZ0FsaWFzVHgoKVxuICAgIG5ld011bHRpc2lnQWxpYXNUeC5mcm9tQnVmZmVyKHRoaXMudG9CdWZmZXIoKSlcbiAgICByZXR1cm4gbmV3TXVsdGlzaWdBbGlhc1R4IGFzIHRoaXNcbiAgfVxuXG4gIGNyZWF0ZSguLi5hcmdzOiBhbnlbXSk6IHRoaXMge1xuICAgIHJldHVybiBuZXcgTXVsdGlzaWdBbGlhc1R4KC4uLmFyZ3MpIGFzIHRoaXNcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGFuZCBhZGRzIGEgW1tTaWdJZHhdXSB0byB0aGUgW1tNdWx0aXNpZ0FsaWFzVHhdXS5cbiAgICpcbiAgICogQHBhcmFtIGFkZHJlc3NJZHggVGhlIGluZGV4IG9mIHRoZSBhZGRyZXNzIHRvIHJlZmVyZW5jZSBpbiB0aGUgc2lnbmF0dXJlc1xuICAgKiBAcGFyYW0gYWRkcmVzcyBUaGUgYWRkcmVzcyBvZiB0aGUgc291cmNlIG9mIHRoZSBzaWduYXR1cmVcbiAgICovXG4gIGFkZFNpZ25hdHVyZUlkeChhZGRyZXNzSWR4OiBudW1iZXIsIGFkZHJlc3M6IEJ1ZmZlcik6IHZvaWQge1xuICAgIGNvbnN0IGFkZHJlc3NJbmRleDogQnVmZmVyID0gQnVmZmVyLmFsbG9jKDQpXG4gICAgYWRkcmVzc0luZGV4LndyaXRlVUludEJFKGFkZHJlc3NJZHgsIDAsIDQpXG4gICAgdGhpcy5hdXRoLmFkZEFkZHJlc3NJbmRleChhZGRyZXNzSW5kZXgpXG5cbiAgICBjb25zdCBzaWdpZHg6IFNpZ0lkeCA9IG5ldyBTaWdJZHgoKVxuICAgIGNvbnN0IGI6IEJ1ZmZlciA9IEJ1ZmZlci5hbGxvYyg0KVxuICAgIGIud3JpdGVVSW50MzJCRShhZGRyZXNzSWR4LCAwKVxuICAgIHNpZ2lkeC5mcm9tQnVmZmVyKGIpXG4gICAgc2lnaWR4LnNldFNvdXJjZShhZGRyZXNzKVxuICAgIHRoaXMuc2lnSWR4cy5wdXNoKHNpZ2lkeClcbiAgICB0aGlzLnNpZ0NvdW50LndyaXRlVUludDMyQkUodGhpcy5zaWdJZHhzLmxlbmd0aCwgMClcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBhcnJheSBvZiBbW1NpZ0lkeF1dIGZvciB0aGlzIFtbVFhdXVxuICAgKi9cbiAgZ2V0U2lnSWR4cygpOiBTaWdJZHhbXSB7XG4gICAgcmV0dXJuIHRoaXMuc2lnSWR4c1xuICB9XG5cbiAgZ2V0Q3JlZGVudGlhbElEKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIFBsYXRmb3JtVk1Db25zdGFudHMuU0VDUENSRURFTlRJQUxcbiAgfVxuXG4gIC8qKlxuICAgKiBUYWtlcyB0aGUgYnl0ZXMgb2YgYW4gW1tVbnNpZ25lZFR4XV0gYW5kIHJldHVybnMgYW4gYXJyYXkgb2YgW1tDcmVkZW50aWFsXV1zXG4gICAqXG4gICAqIEBwYXJhbSBtc2cgQSBCdWZmZXIgZm9yIHRoZSBbW1Vuc2lnbmVkVHhdXVxuICAgKiBAcGFyYW0ga2MgQW4gW1tLZXlDaGFpbl1dIHVzZWQgaW4gc2lnbmluZ1xuICAgKlxuICAgKiBAcmV0dXJucyBBbiBhcnJheSBvZiBbW0NyZWRlbnRpYWxdXXNcbiAgICovXG4gIHNpZ24obXNnOiBCdWZmZXIsIGtjOiBLZXlDaGFpbik6IENyZWRlbnRpYWxbXSB7XG4gICAgY29uc3QgY3JlZHM6IENyZWRlbnRpYWxbXSA9IHN1cGVyLnNpZ24obXNnLCBrYylcbiAgICBmb3IgKGNvbnN0IHNpZ2lkeHMgb2YgdGhpcy5zaWdJZHhzKSB7XG4gICAgICBjb25zdCBjcmVkOiBDcmVkZW50aWFsID0gU2VsZWN0Q3JlZGVudGlhbENsYXNzKFxuICAgICAgICBQbGF0Zm9ybVZNQ29uc3RhbnRzLlNFQ1BDUkVERU5USUFMXG4gICAgICApXG4gICAgICBmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgdGhpcy5zaWdJZHhzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGtleXBhaXI6IEtleVBhaXIgPSBrYy5nZXRLZXkoc2lnaWR4c1tgJHtpfWBdLmdldFNvdXJjZSgpKVxuICAgICAgICBjb25zdCBzaWdudmFsOiBCdWZmZXIgPSBrZXlwYWlyLnNpZ24obXNnKVxuICAgICAgICBjb25zdCBzaWc6IFNpZ25hdHVyZSA9IG5ldyBTaWduYXR1cmUoKVxuICAgICAgICBzaWcuZnJvbUJ1ZmZlcihzaWdudmFsKVxuICAgICAgICBjcmVkLmFkZFNpZ25hdHVyZShzaWcpXG4gICAgICB9XG4gICAgICBjcmVkcy5wdXNoKGNyZWQpXG4gICAgfVxuICAgIHJldHVybiBjcmVkc1xuICB9XG5cbiAgLyoqXG4gICAqIENsYXNzIHJlcHJlc2VudGluZyBhIE11bHRpc2lnQWxpYXMgdHJhbnNhY3Rpb24uXG4gICAqXG4gICAqIEBwYXJhbSBuZXR3b3JrSUQgT3B0aW9uYWwgbmV0d29ya0lELCBbW0RlZmF1bHROZXR3b3JrSURdXVxuICAgKiBAcGFyYW0gYmxvY2tjaGFpbklEIE9wdGlvbmFsIGJsb2NrY2hhaW5JRCwgZGVmYXVsdCBCdWZmZXIuYWxsb2MoMzIsIDE2KVxuICAgKiBAcGFyYW0gb3V0cyBPcHRpb25hbCBhcnJheSBvZiB0aGUgW1tUcmFuc2ZlcmFibGVPdXRwdXRdXXNcbiAgICogQHBhcmFtIGlucyBPcHRpb25hbCBhcnJheSBvZiB0aGUgW1tUcmFuc2ZlcmFibGVJbnB1dF1dc1xuICAgKiBAcGFyYW0gbWVtbyBPcHRpb25hbCB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBmb3IgdGhlIG1lbW8gZmllbGRcbiAgICogQHBhcmFtIG11bHRpc2lnQWxpYXMgTXVsdGlzaWcgYWxpYXMgZGVmaW5pdGlvbi4gTXVsdGlzaWdBbGlhcy5JRCBtdXN0IGJlIGVtcHR5IGlmIGl0J3MgdGhlIG5ldyBhbGlhcy5cbiAgICogQHBhcmFtIGF1dGggQXV0aCB0aGF0IGFsbG93cyBleGlzdGluZyBvd25lcnMgdG8gY2hhbmdlIGFuIGFsaWFzLlxuICAgKi9cbiAgY29uc3RydWN0b3IoXG4gICAgbmV0d29ya0lEOiBudW1iZXIgPSBEZWZhdWx0TmV0d29ya0lELFxuICAgIGJsb2NrY2hhaW5JRDogQnVmZmVyID0gQnVmZmVyLmFsbG9jKDMyLCAxNiksXG4gICAgb3V0czogVHJhbnNmZXJhYmxlT3V0cHV0W10gPSB1bmRlZmluZWQsXG4gICAgaW5zOiBUcmFuc2ZlcmFibGVJbnB1dFtdID0gdW5kZWZpbmVkLFxuICAgIG1lbW86IEJ1ZmZlciA9IHVuZGVmaW5lZCxcbiAgICBtdWx0aXNpZ0FsaWFzOiBNdWx0aXNpZ0FsaWFzID0gdW5kZWZpbmVkLFxuICAgIGF1dGg6IFN1Ym5ldEF1dGggPSB1bmRlZmluZWRcbiAgKSB7XG4gICAgc3VwZXIobmV0d29ya0lELCBibG9ja2NoYWluSUQsIG91dHMsIGlucywgbWVtbylcblxuICAgIGlmIChtdWx0aXNpZ0FsaWFzKSB7XG4gICAgICB0aGlzLm11bHRpc2lnQWxpYXMgPSBtdWx0aXNpZ0FsaWFzXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMubXVsdGlzaWdBbGlhcyA9IG5ldyBNdWx0aXNpZ0FsaWFzKClcbiAgICB9XG5cbiAgICBpZiAoYXV0aCkge1xuICAgICAgdGhpcy5hdXRoID0gYXV0aFxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmF1dGggPSBuZXcgU3VibmV0QXV0aCgpXG4gICAgfVxuICB9XG59XG4iXX0=
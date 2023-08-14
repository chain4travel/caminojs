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
    getOwners() {
        return this.owners;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXVsdGlzaWdhbGlhc3R4LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2FwaXMvcGxhdGZvcm12bS9tdWx0aXNpZ2FsaWFzdHgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7OztHQUdHO0FBQ0gsb0NBQWdDO0FBQ2hDLG9FQUEyQztBQUMzQywyQ0FBaUQ7QUFDakQsdUNBQStEO0FBRS9ELHlDQUE0RDtBQUM1RCxxQ0FBaUM7QUFDakMscURBQXdEO0FBQ3hELDZEQUE2RTtBQUM3RSx3QkFBcUQ7QUFHckQ7O0dBRUc7QUFDSCxNQUFNLFFBQVEsR0FBYSxrQkFBUSxDQUFDLFdBQVcsRUFBRSxDQUFBO0FBQ2pELE1BQU0sYUFBYSxHQUFrQiw2QkFBYSxDQUFDLFdBQVcsRUFBRSxDQUFBO0FBRWhFOztHQUVHO0FBQ0gsTUFBYSxhQUFhO0lBS3hCLFlBQ0UsS0FBYSxTQUFTLEVBQ3RCLE9BQWUsU0FBUyxFQUN4QixTQUEwQixTQUFTO1FBUDNCLE9BQUUsR0FBRyxlQUFNLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQ3JCLFNBQUksR0FBRyxlQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ3hCLFdBQU0sR0FBb0IsU0FBUyxDQUFBO1FBTzNDLElBQUksT0FBTyxFQUFFLEtBQUssV0FBVztZQUFFLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQzNDLElBQUksT0FBTyxJQUFJLEtBQUssV0FBVyxFQUFFO1lBQy9CLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFBO1NBQ2pCO1FBQ0QsSUFBSSxPQUFPLE1BQU0sS0FBSyxXQUFXO1lBQUUsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUE7SUFDekQsQ0FBQztJQUVELE9BQU87UUFDTCxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUE7SUFDbEIsQ0FBQztJQUVELFNBQVM7UUFDUCxPQUFPLElBQUksQ0FBQyxNQUFNLENB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QUNMLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxhQUFhLEVBQUUsQ0FBQTtTQUN6QztRQUVELElBQUksSUFBSSxFQUFFO1lBQ1IsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUE7U0FDakI7YUFBTTtZQUNMLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxhQUFVLEVBQUUsQ0FBQTtTQUM3QjtJQUNILENBQUM7Q0FDRjtBQWpNRCwwQ0FpTUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBwYWNrYWdlRG9jdW1lbnRhdGlvblxuICogQG1vZHVsZSBBUEktUGxhdGZvcm1WTS1NdWx0aXNpZ0FsaWFzVHhcbiAqL1xuaW1wb3J0IHsgQnVmZmVyIH0gZnJvbSBcImJ1ZmZlci9cIlxuaW1wb3J0IEJpblRvb2xzIGZyb20gXCIuLi8uLi91dGlscy9iaW50b29sc1wiXG5pbXBvcnQgeyBQbGF0Zm9ybVZNQ29uc3RhbnRzIH0gZnJvbSBcIi4vY29uc3RhbnRzXCJcbmltcG9ydCB7IFBhcnNlYWJsZU91dHB1dCwgVHJhbnNmZXJhYmxlT3V0cHV0IH0gZnJvbSBcIi4vb3V0cHV0c1wiXG5pbXBvcnQgeyBUcmFuc2ZlcmFibGVJbnB1dCB9IGZyb20gXCIuL2lucHV0c1wiXG5pbXBvcnQgeyBDcmVkZW50aWFsLCBTaWdJZHgsIFNpZ25hdHVyZSB9IGZyb20gXCIuLi8uLi9jb21tb25cIlxuaW1wb3J0IHsgQmFzZVR4IH0gZnJvbSBcIi4vYmFzZXR4XCJcbmltcG9ydCB7IERlZmF1bHROZXR3b3JrSUQgfSBmcm9tIFwiLi4vLi4vdXRpbHMvY29uc3RhbnRzXCJcbmltcG9ydCB7IFNlcmlhbGl6YXRpb24sIFNlcmlhbGl6ZWRFbmNvZGluZyB9IGZyb20gXCIuLi8uLi91dGlscy9zZXJpYWxpemF0aW9uXCJcbmltcG9ydCB7IFNlbGVjdENyZWRlbnRpYWxDbGFzcywgU3VibmV0QXV0aCB9IGZyb20gXCIuXCJcbmltcG9ydCB7IEtleUNoYWluLCBLZXlQYWlyIH0gZnJvbSBcIi4va2V5Y2hhaW5cIlxuXG4vKipcbiAqIEBpZ25vcmVcbiAqL1xuY29uc3QgYmludG9vbHM6IEJpblRvb2xzID0gQmluVG9vbHMuZ2V0SW5zdGFuY2UoKVxuY29uc3Qgc2VyaWFsaXphdGlvbjogU2VyaWFsaXphdGlvbiA9IFNlcmlhbGl6YXRpb24uZ2V0SW5zdGFuY2UoKVxuXG4vKipcbiAqIENsYXNzIHJlcHJlc2VudGluZyBhIE11bHRpc2lnIEFsaWFzIG9iamVjdC5cbiAqL1xuZXhwb3J0IGNsYXNzIE11bHRpc2lnQWxpYXMge1xuICBwcm90ZWN0ZWQgaWQgPSBCdWZmZXIuYWxsb2MoMjApXG4gIHByb3RlY3RlZCBtZW1vID0gQnVmZmVyLmFsbG9jKDI1NilcbiAgcHJvdGVjdGVkIG93bmVyczogUGFyc2VhYmxlT3V0cHV0ID0gdW5kZWZpbmVkXG5cbiAgY29uc3RydWN0b3IoXG4gICAgaWQ6IEJ1ZmZlciA9IHVuZGVmaW5lZCxcbiAgICBtZW1vOiBCdWZmZXIgPSB1bmRlZmluZWQsXG4gICAgb3duZXJzOiBQYXJzZWFibGVPdXRwdXQgPSB1bmRlZmluZWRcbiAgKSB7XG4gICAgaWYgKHR5cGVvZiBpZCAhPT0gXCJ1bmRlZmluZWRcIikgdGhpcy5pZCA9IGlkXG4gICAgaWYgKHR5cGVvZiBtZW1vICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICB0aGlzLm1lbW8gPSBtZW1vXG4gICAgfVxuICAgIGlmICh0eXBlb2Ygb3duZXJzICE9PSBcInVuZGVmaW5lZFwiKSB0aGlzLm93bmVycyA9IG93bmVyc1xuICB9XG5cbiAgZ2V0TWVtbygpOiBCdWZmZXIge1xuICAgIHJldHVybiB0aGlzLm1lbW9cbiAgfVxuXG4gIGdldE93bmVycygpOiBQYXJzZWFibGVPdXRwdXQge1xuICAgIHJldHVybiB0aGlzLm93bmVyc1xuICB9XG5cbiAgZGVzZXJpYWxpemUoZmllbGRzOiBvYmplY3QsIGVuY29kaW5nOiBTZXJpYWxpemVkRW5jb2RpbmcgPSBcImhleFwiKTogdGhpcyB7XG4gICAgdGhpcy5pZCA9IHNlcmlhbGl6YXRpb24uZGVjb2RlcihmaWVsZHNbXCJpZFwiXSwgZW5jb2RpbmcsIFwiY2I1OFwiLCBcIkJ1ZmZlclwiKVxuICAgIHRoaXMubWVtbyA9IHNlcmlhbGl6YXRpb24uZGVjb2RlcihcbiAgICAgIGZpZWxkc1tcIm1lbW9cIl0sXG4gICAgICBlbmNvZGluZyxcbiAgICAgIFwidXRmOFwiLFxuICAgICAgXCJCdWZmZXJcIlxuICAgIClcbiAgICB0aGlzLm93bmVycy5kZXNlcmlhbGl6ZShmaWVsZHNbXCJvd25lcnNcIl0sIGVuY29kaW5nKVxuXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIHNlcmlhbGl6ZShlbmNvZGluZzogU2VyaWFsaXplZEVuY29kaW5nID0gXCJoZXhcIik6IG9iamVjdCB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGlkOiBzZXJpYWxpemF0aW9uLmVuY29kZXIodGhpcy5pZCwgZW5jb2RpbmcsIFwiQnVmZmVyXCIsIFwiY2I1OFwiKSxcbiAgICAgIG1lbW86IHNlcmlhbGl6YXRpb24uZW5jb2Rlcih0aGlzLm1lbW8sIGVuY29kaW5nLCBcIkJ1ZmZlclwiLCBcInV0ZjhcIiksXG4gICAgICBvd25lcnM6IHRoaXMub3duZXJzLnNlcmlhbGl6ZShlbmNvZGluZylcbiAgICB9XG4gIH1cblxuICBmcm9tQnVmZmVyKGJ5dGVzOiBCdWZmZXIsIG9mZnNldDogbnVtYmVyID0gMCk6IG51bWJlciB7XG4gICAgdGhpcy5pZCA9IGJpbnRvb2xzLmNvcHlGcm9tKGJ5dGVzLCBvZmZzZXQsIG9mZnNldCArIDIwKVxuICAgIG9mZnNldCArPSAyMFxuICAgIGxldCBtZW1vbGVuOiBudW1iZXIgPSBiaW50b29sc1xuICAgICAgLmNvcHlGcm9tKGJ5dGVzLCBvZmZzZXQsIG9mZnNldCArIDQpXG4gICAgICAucmVhZFVJbnQzMkJFKDApXG4gICAgb2Zmc2V0ICs9IDRcbiAgICB0aGlzLm1lbW8gPSBiaW50b29scy5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyBtZW1vbGVuKVxuICAgIG9mZnNldCArPSBtZW1vbGVuXG4gICAgdGhpcy5vd25lcnMgPSBuZXcgUGFyc2VhYmxlT3V0cHV0KClcbiAgICBvZmZzZXQgPSB0aGlzLm93bmVycy5mcm9tQnVmZmVyKGJ5dGVzLCBvZmZzZXQpXG5cbiAgICByZXR1cm4gb2Zmc2V0XG4gIH1cblxuICB0b0J1ZmZlcigpOiBCdWZmZXIge1xuICAgIGxldCBic2l6ZTogbnVtYmVyID0gdGhpcy5pZC5sZW5ndGhcbiAgICBjb25zdCBidWZmZXI6IEJ1ZmZlcltdID0gW3RoaXMuaWRdXG5cbiAgICBsZXQgbWVtb2xlbjogQnVmZmVyID0gQnVmZmVyLmFsbG9jKDQpXG4gICAgbWVtb2xlbi53cml0ZVVJbnQzMkJFKHRoaXMubWVtby5sZW5ndGgsIDApXG4gICAgYnVmZmVyLnB1c2gobWVtb2xlbilcbiAgICBic2l6ZSArPSA0XG4gICAgYnVmZmVyLnB1c2godGhpcy5tZW1vKVxuICAgIGJzaXplICs9IHRoaXMubWVtby5sZW5ndGhcblxuICAgIGJ1ZmZlci5wdXNoKHRoaXMub3duZXJzLnRvQnVmZmVyKCkpXG4gICAgYnNpemUgKz0gdGhpcy5vd25lcnMudG9CdWZmZXIoKS5sZW5ndGhcblxuICAgIHJldHVybiBCdWZmZXIuY29uY2F0KGJ1ZmZlciwgYnNpemUpXG4gIH1cbn1cblxuLyoqXG4gKiBDbGFzcyByZXByZXNlbnRpbmcgYW4gdW5zaWduZWQgTXVsdGlzaWdBbGlhcyB0cmFuc2FjdGlvbi5cbiAqL1xuZXhwb3J0IGNsYXNzIE11bHRpc2lnQWxpYXNUeCBleHRlbmRzIEJhc2VUeCB7XG4gIHByb3RlY3RlZCBfdHlwZU5hbWUgPSBcIk11bHRpc2lnQWxpYXNUeFwiXG4gIHByb3RlY3RlZCBfdHlwZUlEID0gUGxhdGZvcm1WTUNvbnN0YW50cy5NVUxUSVNJR0FMSUFTVFhcblxuICAvLyBNdWx0aXNpZyBhbGlhcyBkZWZpbml0aW9uLiBNdWx0aXNpZ0FsaWFzLklEIG11c3QgYmUgZW1wdHkgaWYgaXQncyB0aGUgbmV3IGFsaWFzXG4gIHByb3RlY3RlZCBtdWx0aXNpZ0FsaWFzOiBNdWx0aXNpZ0FsaWFzXG4gIC8vIEF1dGggdGhhdCBhbGxvd3MgZXhpc3Rpbmcgb3duZXJzIHRvIGNoYW5nZSBhbiBhbGlhc1xuICBwcm90ZWN0ZWQgYXV0aDogU3VibmV0QXV0aFxuICAvLyBTaWduYXR1cmVzXG4gIHByb3RlY3RlZCBzaWdDb3VudDogQnVmZmVyID0gQnVmZmVyLmFsbG9jKDQpXG4gIHByb3RlY3RlZCBzaWdJZHhzOiBTaWdJZHhbXSA9IFtdIC8vIGlkeHMgb2Ygc3VibmV0IGF1dGggc2lnbmVyc1xuXG4gIGRlc2VyaWFsaXplKGZpZWxkczogb2JqZWN0LCBlbmNvZGluZzogU2VyaWFsaXplZEVuY29kaW5nID0gXCJoZXhcIikge1xuICAgIHN1cGVyLmRlc2VyaWFsaXplKGZpZWxkcywgZW5jb2RpbmcpXG4gICAgdGhpcy5tdWx0aXNpZ0FsaWFzID0gbmV3IE11bHRpc2lnQWxpYXMoKS5kZXNlcmlhbGl6ZShcbiAgICAgIGZpZWxkc1tcIm11bHRpc2lnQWxpYXNcIl0sXG4gICAgICBlbmNvZGluZ1xuICAgIClcbiAgfVxuXG4gIHNlcmlhbGl6ZShlbmNvZGluZzogU2VyaWFsaXplZEVuY29kaW5nID0gXCJoZXhcIik6IG9iamVjdCB7XG4gICAgbGV0IGZpZWxkczogb2JqZWN0ID0gc3VwZXIuc2VyaWFsaXplKGVuY29kaW5nKVxuICAgIHJldHVybiB7XG4gICAgICAuLi5maWVsZHMsXG4gICAgICBtdWx0aXNpZ0FsaWFzOiB0aGlzLm11bHRpc2lnQWxpYXMuc2VyaWFsaXplKGVuY29kaW5nKVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBpZCBvZiB0aGUgW1tNdWx0aXNpZ0FsaWFzVHhdXVxuICAgKi9cbiAgZ2V0VHhUeXBlKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIFBsYXRmb3JtVk1Db25zdGFudHMuTVVMVElTSUdBTElBU1RYXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgTXVsdGlzaWdBbGlhcyBkZWZpbml0aW9uLlxuICAgKi9cbiAgZ2V0TXVsdGlzaWdBbGlhcygpOiBNdWx0aXNpZ0FsaWFzIHtcbiAgICByZXR1cm4gdGhpcy5tdWx0aXNpZ0FsaWFzXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgQXV0aCB0aGF0IGFsbG93cyBleGlzdGluZyBvd25lcnMgdG8gY2hhbmdlIGFuIGFsaWFzLlxuICAgKi9cbiAgZ2V0QXV0aCgpOiBTdWJuZXRBdXRoIHtcbiAgICByZXR1cm4gdGhpcy5hdXRoXG4gIH1cblxuICAvKipcbiAgICogVGFrZXMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBjb250YWluaW5nIGEgcmF3IFtbTXVsdGlzaWdBbGlhc1R4XV0sIHBhcnNlcyBpdCwgcG9wdWxhdGVzIHRoZSBjbGFzcywgYW5kIHJldHVybnMgdGhlIGxlbmd0aCBvZiB0aGUgW1tNdWx0aXNpZ0FsaWFzVHhdXSBpbiBieXRlcy5cbiAgICpcbiAgICogQHBhcmFtIGJ5dGVzIEEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gY29udGFpbmluZyBhIHJhdyBbW011bHRpc2lnQWxpYXNUeF1dXG4gICAqIEBwYXJhbSBvZmZzZXQgVGhlIG9mZnNldCB0byBzdGFydCByZWFkaW5nIHRoZSBieXRlcyBmcm9tLiBEZWZhdWx0OiAwXG4gICAqXG4gICAqIEByZXR1cm5zIFRoZSBsZW5ndGggb2YgdGhlIHJhdyBbW011bHRpc2lnQWxpYXNUeF1dXG4gICAqXG4gICAqIEByZW1hcmtzIGFzc3VtZSBub3QtY2hlY2tzdW1tZWRcbiAgICovXG4gIGZyb21CdWZmZXIoYnl0ZXM6IEJ1ZmZlciwgb2Zmc2V0OiBudW1iZXIgPSAwKTogbnVtYmVyIHtcbiAgICBvZmZzZXQgPSBzdXBlci5mcm9tQnVmZmVyKGJ5dGVzLCBvZmZzZXQpXG5cbiAgICBjb25zdCBhbGlhczogTXVsdGlzaWdBbGlhcyA9IG5ldyBNdWx0aXNpZ0FsaWFzKClcbiAgICBvZmZzZXQgKz0gYWxpYXMuZnJvbUJ1ZmZlcihiaW50b29scy5jb3B5RnJvbShieXRlcywgb2Zmc2V0KSlcbiAgICB0aGlzLm11bHRpc2lnQWxpYXMgPSBhbGlhc1xuXG4gICAgY29uc3Qgc2E6IFN1Ym5ldEF1dGggPSBuZXcgU3VibmV0QXV0aCgpXG4gICAgb2Zmc2V0ICs9IHNhLmZyb21CdWZmZXIoYmludG9vbHMuY29weUZyb20oYnl0ZXMsIG9mZnNldCkpXG4gICAgdGhpcy5hdXRoID0gc2FcblxuICAgIHJldHVybiBvZmZzZXRcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gcmVwcmVzZW50YXRpb24gb2YgdGhlIFtbTXVsdGlzaWdBbGlhc1R4XV0uXG4gICAqL1xuICB0b0J1ZmZlcigpOiBCdWZmZXIge1xuICAgIGNvbnN0IHN1cGVyYnVmZjogQnVmZmVyID0gc3VwZXIudG9CdWZmZXIoKVxuXG4gICAgbGV0IGJzaXplOiBudW1iZXIgPSBzdXBlcmJ1ZmYubGVuZ3RoXG5cbiAgICBjb25zdCBhbGlhc0J1ZmZlcjogQnVmZmVyID0gdGhpcy5tdWx0aXNpZ0FsaWFzLnRvQnVmZmVyKClcbiAgICBic2l6ZSArPSBhbGlhc0J1ZmZlci5sZW5ndGhcblxuICAgIGNvbnN0IGF1dGhCdWZmZXI6IEJ1ZmZlciA9IHRoaXMuYXV0aC50b0J1ZmZlcigpXG4gICAgYnNpemUgKz0gYXV0aEJ1ZmZlci5sZW5ndGhcblxuICAgIGNvbnN0IGJhcnI6IEJ1ZmZlcltdID0gW3N1cGVyYnVmZiwgYWxpYXNCdWZmZXIsIGF1dGhCdWZmZXJdXG5cbiAgICByZXR1cm4gQnVmZmVyLmNvbmNhdChiYXJyLCBic2l6ZSlcbiAgfVxuXG4gIGNsb25lKCk6IHRoaXMge1xuICAgIGNvbnN0IG5ld011bHRpc2lnQWxpYXNUeDogTXVsdGlzaWdBbGlhc1R4ID0gbmV3IE11bHRpc2lnQWxpYXNUeCgpXG4gICAgbmV3TXVsdGlzaWdBbGlhc1R4LmZyb21CdWZmZXIodGhpcy50b0J1ZmZlcigpKVxuICAgIHJldHVybiBuZXdNdWx0aXNpZ0FsaWFzVHggYXMgdGhpc1xuICB9XG5cbiAgY3JlYXRlKC4uLmFyZ3M6IGFueVtdKTogdGhpcyB7XG4gICAgcmV0dXJuIG5ldyBNdWx0aXNpZ0FsaWFzVHgoLi4uYXJncykgYXMgdGhpc1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYW5kIGFkZHMgYSBbW1NpZ0lkeF1dIHRvIHRoZSBbW011bHRpc2lnQWxpYXNUeF1dLlxuICAgKlxuICAgKiBAcGFyYW0gYWRkcmVzc0lkeCBUaGUgaW5kZXggb2YgdGhlIGFkZHJlc3MgdG8gcmVmZXJlbmNlIGluIHRoZSBzaWduYXR1cmVzXG4gICAqIEBwYXJhbSBhZGRyZXNzIFRoZSBhZGRyZXNzIG9mIHRoZSBzb3VyY2Ugb2YgdGhlIHNpZ25hdHVyZVxuICAgKi9cbiAgYWRkU2lnbmF0dXJlSWR4KGFkZHJlc3NJZHg6IG51bWJlciwgYWRkcmVzczogQnVmZmVyKTogdm9pZCB7XG4gICAgY29uc3QgYWRkcmVzc0luZGV4OiBCdWZmZXIgPSBCdWZmZXIuYWxsb2MoNClcbiAgICBhZGRyZXNzSW5kZXgud3JpdGVVSW50QkUoYWRkcmVzc0lkeCwgMCwgNClcbiAgICB0aGlzLmF1dGguYWRkQWRkcmVzc0luZGV4KGFkZHJlc3NJbmRleClcblxuICAgIGNvbnN0IHNpZ2lkeDogU2lnSWR4ID0gbmV3IFNpZ0lkeCgpXG4gICAgY29uc3QgYjogQnVmZmVyID0gQnVmZmVyLmFsbG9jKDQpXG4gICAgYi53cml0ZVVJbnQzMkJFKGFkZHJlc3NJZHgsIDApXG4gICAgc2lnaWR4LmZyb21CdWZmZXIoYilcbiAgICBzaWdpZHguc2V0U291cmNlKGFkZHJlc3MpXG4gICAgdGhpcy5zaWdJZHhzLnB1c2goc2lnaWR4KVxuICAgIHRoaXMuc2lnQ291bnQud3JpdGVVSW50MzJCRSh0aGlzLnNpZ0lkeHMubGVuZ3RoLCAwKVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGFycmF5IG9mIFtbU2lnSWR4XV0gZm9yIHRoaXMgW1tUWF1dXG4gICAqL1xuICBnZXRTaWdJZHhzKCk6IFNpZ0lkeFtdIHtcbiAgICByZXR1cm4gdGhpcy5zaWdJZHhzXG4gIH1cblxuICBnZXRDcmVkZW50aWFsSUQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gUGxhdGZvcm1WTUNvbnN0YW50cy5TRUNQQ1JFREVOVElBTFxuICB9XG5cbiAgLyoqXG4gICAqIFRha2VzIHRoZSBieXRlcyBvZiBhbiBbW1Vuc2lnbmVkVHhdXSBhbmQgcmV0dXJucyBhbiBhcnJheSBvZiBbW0NyZWRlbnRpYWxdXXNcbiAgICpcbiAgICogQHBhcmFtIG1zZyBBIEJ1ZmZlciBmb3IgdGhlIFtbVW5zaWduZWRUeF1dXG4gICAqIEBwYXJhbSBrYyBBbiBbW0tleUNoYWluXV0gdXNlZCBpbiBzaWduaW5nXG4gICAqXG4gICAqIEByZXR1cm5zIEFuIGFycmF5IG9mIFtbQ3JlZGVudGlhbF1dc1xuICAgKi9cbiAgc2lnbihtc2c6IEJ1ZmZlciwga2M6IEtleUNoYWluKTogQ3JlZGVudGlhbFtdIHtcbiAgICBjb25zdCBjcmVkczogQ3JlZGVudGlhbFtdID0gc3VwZXIuc2lnbihtc2csIGtjKVxuICAgIGZvciAoY29uc3Qgc2lnaWR4cyBvZiB0aGlzLnNpZ0lkeHMpIHtcbiAgICAgIGNvbnN0IGNyZWQ6IENyZWRlbnRpYWwgPSBTZWxlY3RDcmVkZW50aWFsQ2xhc3MoXG4gICAgICAgIFBsYXRmb3JtVk1Db25zdGFudHMuU0VDUENSRURFTlRJQUxcbiAgICAgIClcbiAgICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCB0aGlzLnNpZ0lkeHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3Qga2V5cGFpcjogS2V5UGFpciA9IGtjLmdldEtleShzaWdpZHhzW2Ake2l9YF0uZ2V0U291cmNlKCkpXG4gICAgICAgIGNvbnN0IHNpZ252YWw6IEJ1ZmZlciA9IGtleXBhaXIuc2lnbihtc2cpXG4gICAgICAgIGNvbnN0IHNpZzogU2lnbmF0dXJlID0gbmV3IFNpZ25hdHVyZSgpXG4gICAgICAgIHNpZy5mcm9tQnVmZmVyKHNpZ252YWwpXG4gICAgICAgIGNyZWQuYWRkU2lnbmF0dXJlKHNpZylcbiAgICAgIH1cbiAgICAgIGNyZWRzLnB1c2goY3JlZClcbiAgICB9XG4gICAgcmV0dXJuIGNyZWRzXG4gIH1cblxuICAvKipcbiAgICogQ2xhc3MgcmVwcmVzZW50aW5nIGEgTXVsdGlzaWdBbGlhcyB0cmFuc2FjdGlvbi5cbiAgICpcbiAgICogQHBhcmFtIG5ldHdvcmtJRCBPcHRpb25hbCBuZXR3b3JrSUQsIFtbRGVmYXVsdE5ldHdvcmtJRF1dXG4gICAqIEBwYXJhbSBibG9ja2NoYWluSUQgT3B0aW9uYWwgYmxvY2tjaGFpbklELCBkZWZhdWx0IEJ1ZmZlci5hbGxvYygzMiwgMTYpXG4gICAqIEBwYXJhbSBvdXRzIE9wdGlvbmFsIGFycmF5IG9mIHRoZSBbW1RyYW5zZmVyYWJsZU91dHB1dF1dc1xuICAgKiBAcGFyYW0gaW5zIE9wdGlvbmFsIGFycmF5IG9mIHRoZSBbW1RyYW5zZmVyYWJsZUlucHV0XV1zXG4gICAqIEBwYXJhbSBtZW1vIE9wdGlvbmFsIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IGZvciB0aGUgbWVtbyBmaWVsZFxuICAgKiBAcGFyYW0gbXVsdGlzaWdBbGlhcyBNdWx0aXNpZyBhbGlhcyBkZWZpbml0aW9uLiBNdWx0aXNpZ0FsaWFzLklEIG11c3QgYmUgZW1wdHkgaWYgaXQncyB0aGUgbmV3IGFsaWFzLlxuICAgKiBAcGFyYW0gYXV0aCBBdXRoIHRoYXQgYWxsb3dzIGV4aXN0aW5nIG93bmVycyB0byBjaGFuZ2UgYW4gYWxpYXMuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihcbiAgICBuZXR3b3JrSUQ6IG51bWJlciA9IERlZmF1bHROZXR3b3JrSUQsXG4gICAgYmxvY2tjaGFpbklEOiBCdWZmZXIgPSBCdWZmZXIuYWxsb2MoMzIsIDE2KSxcbiAgICBvdXRzOiBUcmFuc2ZlcmFibGVPdXRwdXRbXSA9IHVuZGVmaW5lZCxcbiAgICBpbnM6IFRyYW5zZmVyYWJsZUlucHV0W10gPSB1bmRlZmluZWQsXG4gICAgbWVtbzogQnVmZmVyID0gdW5kZWZpbmVkLFxuICAgIG11bHRpc2lnQWxpYXM6IE11bHRpc2lnQWxpYXMgPSB1bmRlZmluZWQsXG4gICAgYXV0aDogU3VibmV0QXV0aCA9IHVuZGVmaW5lZFxuICApIHtcbiAgICBzdXBlcihuZXR3b3JrSUQsIGJsb2NrY2hhaW5JRCwgb3V0cywgaW5zLCBtZW1vKVxuXG4gICAgaWYgKG11bHRpc2lnQWxpYXMpIHtcbiAgICAgIHRoaXMubXVsdGlzaWdBbGlhcyA9IG11bHRpc2lnQWxpYXNcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5tdWx0aXNpZ0FsaWFzID0gbmV3IE11bHRpc2lnQWxpYXMoKVxuICAgIH1cblxuICAgIGlmIChhdXRoKSB7XG4gICAgICB0aGlzLmF1dGggPSBhdXRoXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuYXV0aCA9IG5ldyBTdWJuZXRBdXRoKClcbiAgICB9XG4gIH1cbn1cbiJdfQ==
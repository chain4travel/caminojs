"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateChainTx = void 0;
/**
 * @packageDocumentation
 * @module API-PlatformVM-CreateChainTx
 */
const buffer_1 = require("buffer/");
const bintools_1 = __importDefault(require("../../utils/bintools"));
const constants_1 = require("./constants");
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
 * Class representing an unsigned CreateChainTx transaction.
 */
class CreateChainTx extends basetx_1.BaseTx {
    serialize(encoding = "hex") {
        let fields = super.serialize(encoding);
        return Object.assign(Object.assign({}, fields), { subnetID: serialization.encoder(this.subnetID, encoding, "Buffer", "cb58") });
    }
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        this.subnetID = serialization.decoder(fields["subnetID"], encoding, "cb58", "Buffer", 32);
        // this.exportOuts = fields["exportOuts"].map((e: object) => {
        //   let eo: TransferableOutput = new TransferableOutput()
        //   eo.deserialize(e, encoding)
        //   return eo
        // })
    }
    /**
     * Returns the id of the [[CreateChainTx]]
     */
    getTxType() {
        return constants_1.PlatformVMConstants.CREATECHAINTX;
    }
    /**
     * Returns the subnetAuth
     */
    getSubnetAuth() {
        return this.subnetAuth;
    }
    /**
     * Returns the subnetID as a string
     */
    getSubnetID() {
        return bintools.cb58Encode(this.subnetID);
    }
    /**
     * Returns a string of the chainName
     */
    getChainName() {
        return this.chainName;
    }
    /**
     * Returns a Buffer of the vmID
     */
    getVMID() {
        return this.vmID;
    }
    /**
     * Returns an array of fxIDs as Buffers
     */
    getFXIDs() {
        return this.fxIDs;
    }
    /**
     * Returns a string of the genesisData
     */
    getGenesisData() {
        return bintools.cb58Encode(this.genesisData);
    }
    /**
     * Takes a {@link https://github.com/feross/buffer|Buffer} containing an [[CreateChainTx]], parses it, populates the class, and returns the length of the [[CreateChainTx]] in bytes.
     *
     * @param bytes A {@link https://github.com/feross/buffer|Buffer} containing a raw [[CreateChainTx]]
     *
     * @returns The length of the raw [[CreateChainTx]]
     *
     * @remarks assume not-checksummed
     */
    fromBuffer(bytes, offset = 0) {
        offset = super.fromBuffer(bytes, offset);
        this.subnetID = bintools.copyFrom(bytes, offset, offset + 32);
        offset += 32;
        const chainNameSize = bintools
            .copyFrom(bytes, offset, offset + 2)
            .readUInt16BE(0);
        offset += 2;
        this.chainName = bintools
            .copyFrom(bytes, offset, offset + chainNameSize)
            .toString("utf8");
        offset += chainNameSize;
        this.vmID = bintools.copyFrom(bytes, offset, offset + 32);
        offset += 32;
        this.numFXIDs = bintools.copyFrom(bytes, offset, offset + 4);
        offset += 4;
        const nfxids = parseInt(this.numFXIDs.toString("hex"), 10);
        for (let i = 0; i < nfxids; i++) {
            this.fxIDs.push(bintools.copyFrom(bytes, offset, offset + 32));
            offset += 32;
        }
        const genesisDataSize = bintools
            .copyFrom(bytes, offset, offset + 4)
            .readUInt32BE(0);
        offset += 4;
        this.genesisData = bintools.copyFrom(bytes, offset, offset + genesisDataSize);
        offset += genesisDataSize;
        const sa = new _1.SubnetAuth();
        offset += sa.fromBuffer(bintools.copyFrom(bytes, offset));
        this.subnetAuth = sa;
        return offset;
    }
    /**
     * Returns a {@link https://github.com/feross/buffer|Buffer} representation of the [[CreateChainTx]].
     */
    toBuffer() {
        const superbuff = super.toBuffer();
        const chainNameBuff = buffer_1.Buffer.alloc(this.chainName.length);
        chainNameBuff.write(this.chainName, 0, this.chainName.length, "utf8");
        const chainNameSize = buffer_1.Buffer.alloc(2);
        chainNameSize.writeUIntBE(this.chainName.length, 0, 2);
        let bsize = superbuff.length +
            this.subnetID.length +
            chainNameSize.length +
            chainNameBuff.length +
            this.vmID.length +
            this.numFXIDs.length;
        const barr = [
            superbuff,
            this.subnetID,
            chainNameSize,
            chainNameBuff,
            this.vmID,
            this.numFXIDs
        ];
        this.fxIDs.forEach((fxID) => {
            bsize += fxID.length;
            barr.push(fxID);
        });
        bsize += 4;
        bsize += this.genesisData.length;
        const gdLength = buffer_1.Buffer.alloc(4);
        gdLength.writeUIntBE(this.genesisData.length, 0, 4);
        barr.push(gdLength);
        barr.push(this.genesisData);
        bsize += this.subnetAuth.toBuffer().length;
        barr.push(this.subnetAuth.toBuffer());
        return buffer_1.Buffer.concat(barr, bsize);
    }
    clone() {
        const newCreateChainTx = new CreateChainTx();
        newCreateChainTx.fromBuffer(this.toBuffer());
        return newCreateChainTx;
    }
    create(...args) {
        return new CreateChainTx(...args);
    }
    /**
     * Creates and adds a [[SigIdx]] to the [[AddSubnetValidatorTx]].
     *
     * @param addressIdx The index of the address to reference in the signatures
     * @param address The address of the source of the signature
     */
    addSignatureIdx(addressIdx, address) {
        const addressIndex = buffer_1.Buffer.alloc(4);
        addressIndex.writeUIntBE(addressIdx, 0, 4);
        this.subnetAuth.addAddressIndex(addressIndex);
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
        const sigidxs = this.getSigIdxs();
        const cred = (0, _1.SelectCredentialClass)(this.getCredentialID());
        for (let i = 0; i < sigidxs.length; i++) {
            const keypair = kc.getKey(sigidxs[`${i}`].getSource());
            const signval = keypair.sign(msg);
            const sig = new common_1.Signature();
            sig.fromBuffer(signval);
            cred.addSignature(sig);
        }
        creds.push(cred);
        return creds;
    }
    /**
     * Class representing an unsigned CreateChain transaction.
     *
     * @param networkID Optional networkID, [[DefaultNetworkID]]
     * @param blockchainID Optional blockchainID, default Buffer.alloc(32, 16)
     * @param outs Optional array of the [[TransferableOutput]]s
     * @param ins Optional array of the [[TransferableInput]]s
     * @param memo Optional {@link https://github.com/feross/buffer|Buffer} for the memo field
     * @param subnetID Optional ID of the Subnet that validates this blockchain.
     * @param chainName Optional A human readable name for the chain; need not be unique
     * @param vmID Optional ID of the VM running on the new chain
     * @param fxIDs Optional IDs of the feature extensions running on the new chain
     * @param genesisData Optional Byte representation of genesis state of the new chain
     */
    constructor(networkID = constants_2.DefaultNetworkID, blockchainID = buffer_1.Buffer.alloc(32, 16), outs = undefined, ins = undefined, memo = undefined, subnetID = undefined, chainName = undefined, vmID = undefined, fxIDs = undefined, genesisData = undefined) {
        super(networkID, blockchainID, outs, ins, memo);
        this._typeName = "CreateChainTx";
        this._typeID = constants_1.PlatformVMConstants.CREATECHAINTX;
        this.subnetID = buffer_1.Buffer.alloc(32);
        this.chainName = "";
        this.vmID = buffer_1.Buffer.alloc(32);
        this.numFXIDs = buffer_1.Buffer.alloc(4);
        this.fxIDs = [];
        this.genesisData = buffer_1.Buffer.alloc(32);
        this.sigCount = buffer_1.Buffer.alloc(4);
        this.sigIdxs = []; // idxs of subnet auth signers
        if (typeof subnetID != "undefined") {
            if (typeof subnetID === "string") {
                this.subnetID = bintools.cb58Decode(subnetID);
            }
            else {
                this.subnetID = subnetID;
            }
        }
        if (typeof chainName != "undefined") {
            this.chainName = chainName;
        }
        if (typeof vmID != "undefined") {
            const buf = buffer_1.Buffer.alloc(32);
            buf.write(vmID, 0, vmID.length);
            this.vmID = buf;
        }
        if (typeof fxIDs != "undefined") {
            this.numFXIDs.writeUInt32BE(fxIDs.length, 0);
            const fxIDBufs = [];
            fxIDs.forEach((fxID) => {
                const buf = buffer_1.Buffer.alloc(32);
                buf.write(fxID, 0, fxID.length, "utf8");
                fxIDBufs.push(buf);
            });
            this.fxIDs = fxIDBufs;
        }
        if (typeof genesisData != "undefined" && typeof genesisData != "string") {
            this.genesisData = genesisData.toBuffer();
        }
        else if (typeof genesisData == "string") {
            this.genesisData = buffer_1.Buffer.from(genesisData);
        }
        const subnetAuth = new _1.SubnetAuth();
        this.subnetAuth = subnetAuth;
    }
}
exports.CreateChainTx = CreateChainTx;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlY2hhaW50eC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hcGlzL3BsYXRmb3Jtdm0vY3JlYXRlY2hhaW50eC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTs7O0dBR0c7QUFDSCxvQ0FBZ0M7QUFDaEMsb0VBQTJDO0FBQzNDLDJDQUFpRDtBQUdqRCx5Q0FBNEQ7QUFDNUQscUNBQWlDO0FBQ2pDLHFEQUF3RDtBQUN4RCw2REFBNkU7QUFFN0Usd0JBQXFEO0FBR3JEOztHQUVHO0FBQ0gsTUFBTSxRQUFRLEdBQWEsa0JBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtBQUNqRCxNQUFNLGFBQWEsR0FBa0IsNkJBQWEsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtBQUVoRTs7R0FFRztBQUNILE1BQWEsYUFBYyxTQUFRLGVBQU07SUFJdkMsU0FBUyxDQUFDLFdBQStCLEtBQUs7UUFDNUMsSUFBSSxNQUFNLEdBQVcsS0FBSyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQTtRQUM5Qyx1Q0FDSyxNQUFNLEtBQ1QsUUFBUSxFQUFFLGFBQWEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLE1BQU0sQ0FBQyxJQUUzRTtJQUNILENBQUM7SUFDRCxXQUFXLENBQUMsTUFBYyxFQUFFLFdBQStCLEtBQUs7UUFDOUQsS0FBSyxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUE7UUFDbkMsSUFBSSxDQUFDLFFBQVEsR0FBRyxhQUFhLENBQUMsT0FBTyxDQUNuQyxNQUFNLENBQUMsVUFBVSxDQUFDLEVBQ2xCLFFBQVEsRUFDUixNQUFNLEVBQ04sUUFBUSxFQUNSLEVBQUUsQ0FDSCxDQUFBO1FBQ0QsOERBQThEO1FBQzlELDBEQUEwRDtRQUMxRCxnQ0FBZ0M7UUFDaEMsY0FBYztRQUNkLEtBQUs7SUFDUCxDQUFDO0lBWUQ7O09BRUc7SUFDSCxTQUFTO1FB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Q3BDLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFBO2dCQUN2QyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1lBQ3BCLENBQUMsQ0FBQyxDQUFBO1lBQ0YsSUFBSSxDQUFDLEtBQUssR0FBRyxRQUFRLENBQUE7U0FDdEI7UUFDRCxJQUFJLE9BQU8sV0FBVyxJQUFJLFdBQVcsSUFBSSxPQUFPLFdBQVcsSUFBSSxRQUFRLEVBQUU7WUFDdkUsSUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUMsUUFBUSxFQUFFLENBQUE7U0FDMUM7YUFBTSxJQUFJLE9BQU8sV0FBVyxJQUFJLFFBQVEsRUFBRTtZQUN6QyxJQUFJLENBQUMsV0FBVyxHQUFHLGVBQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUE7U0FDNUM7UUFFRCxNQUFNLFVBQVUsR0FBZSxJQUFJLGFBQVUsRUFBRSxDQUFBO1FBQy9DLElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFBO0lBQzlCLENBQUM7Q0FDRjtBQTNURCxzQ0EyVEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBwYWNrYWdlRG9jdW1lbnRhdGlvblxuICogQG1vZHVsZSBBUEktUGxhdGZvcm1WTS1DcmVhdGVDaGFpblR4XG4gKi9cbmltcG9ydCB7IEJ1ZmZlciB9IGZyb20gXCJidWZmZXIvXCJcbmltcG9ydCBCaW5Ub29scyBmcm9tIFwiLi4vLi4vdXRpbHMvYmludG9vbHNcIlxuaW1wb3J0IHsgUGxhdGZvcm1WTUNvbnN0YW50cyB9IGZyb20gXCIuL2NvbnN0YW50c1wiXG5pbXBvcnQgeyBUcmFuc2ZlcmFibGVPdXRwdXQgfSBmcm9tIFwiLi9vdXRwdXRzXCJcbmltcG9ydCB7IFRyYW5zZmVyYWJsZUlucHV0IH0gZnJvbSBcIi4vaW5wdXRzXCJcbmltcG9ydCB7IENyZWRlbnRpYWwsIFNpZ0lkeCwgU2lnbmF0dXJlIH0gZnJvbSBcIi4uLy4uL2NvbW1vblwiXG5pbXBvcnQgeyBCYXNlVHggfSBmcm9tIFwiLi9iYXNldHhcIlxuaW1wb3J0IHsgRGVmYXVsdE5ldHdvcmtJRCB9IGZyb20gXCIuLi8uLi91dGlscy9jb25zdGFudHNcIlxuaW1wb3J0IHsgU2VyaWFsaXphdGlvbiwgU2VyaWFsaXplZEVuY29kaW5nIH0gZnJvbSBcIi4uLy4uL3V0aWxzL3NlcmlhbGl6YXRpb25cIlxuaW1wb3J0IHsgR2VuZXNpc0RhdGEgfSBmcm9tIFwiLi4vYXZtXCJcbmltcG9ydCB7IFNlbGVjdENyZWRlbnRpYWxDbGFzcywgU3VibmV0QXV0aCB9IGZyb20gXCIuXCJcbmltcG9ydCB7IEtleUNoYWluLCBLZXlQYWlyIH0gZnJvbSBcIi4va2V5Y2hhaW5cIlxuXG4vKipcbiAqIEBpZ25vcmVcbiAqL1xuY29uc3QgYmludG9vbHM6IEJpblRvb2xzID0gQmluVG9vbHMuZ2V0SW5zdGFuY2UoKVxuY29uc3Qgc2VyaWFsaXphdGlvbjogU2VyaWFsaXphdGlvbiA9IFNlcmlhbGl6YXRpb24uZ2V0SW5zdGFuY2UoKVxuXG4vKipcbiAqIENsYXNzIHJlcHJlc2VudGluZyBhbiB1bnNpZ25lZCBDcmVhdGVDaGFpblR4IHRyYW5zYWN0aW9uLlxuICovXG5leHBvcnQgY2xhc3MgQ3JlYXRlQ2hhaW5UeCBleHRlbmRzIEJhc2VUeCB7XG4gIHByb3RlY3RlZCBfdHlwZU5hbWUgPSBcIkNyZWF0ZUNoYWluVHhcIlxuICBwcm90ZWN0ZWQgX3R5cGVJRCA9IFBsYXRmb3JtVk1Db25zdGFudHMuQ1JFQVRFQ0hBSU5UWFxuXG4gIHNlcmlhbGl6ZShlbmNvZGluZzogU2VyaWFsaXplZEVuY29kaW5nID0gXCJoZXhcIik6IG9iamVjdCB7XG4gICAgbGV0IGZpZWxkczogb2JqZWN0ID0gc3VwZXIuc2VyaWFsaXplKGVuY29kaW5nKVxuICAgIHJldHVybiB7XG4gICAgICAuLi5maWVsZHMsXG4gICAgICBzdWJuZXRJRDogc2VyaWFsaXphdGlvbi5lbmNvZGVyKHRoaXMuc3VibmV0SUQsIGVuY29kaW5nLCBcIkJ1ZmZlclwiLCBcImNiNThcIilcbiAgICAgIC8vIGV4cG9ydE91dHM6IHRoaXMuZXhwb3J0T3V0cy5tYXAoKGUpID0+IGUuc2VyaWFsaXplKGVuY29kaW5nKSlcbiAgICB9XG4gIH1cbiAgZGVzZXJpYWxpemUoZmllbGRzOiBvYmplY3QsIGVuY29kaW5nOiBTZXJpYWxpemVkRW5jb2RpbmcgPSBcImhleFwiKSB7XG4gICAgc3VwZXIuZGVzZXJpYWxpemUoZmllbGRzLCBlbmNvZGluZylcbiAgICB0aGlzLnN1Ym5ldElEID0gc2VyaWFsaXphdGlvbi5kZWNvZGVyKFxuICAgICAgZmllbGRzW1wic3VibmV0SURcIl0sXG4gICAgICBlbmNvZGluZyxcbiAgICAgIFwiY2I1OFwiLFxuICAgICAgXCJCdWZmZXJcIixcbiAgICAgIDMyXG4gICAgKVxuICAgIC8vIHRoaXMuZXhwb3J0T3V0cyA9IGZpZWxkc1tcImV4cG9ydE91dHNcIl0ubWFwKChlOiBvYmplY3QpID0+IHtcbiAgICAvLyAgIGxldCBlbzogVHJhbnNmZXJhYmxlT3V0cHV0ID0gbmV3IFRyYW5zZmVyYWJsZU91dHB1dCgpXG4gICAgLy8gICBlby5kZXNlcmlhbGl6ZShlLCBlbmNvZGluZylcbiAgICAvLyAgIHJldHVybiBlb1xuICAgIC8vIH0pXG4gIH1cblxuICBwcm90ZWN0ZWQgc3VibmV0SUQ6IEJ1ZmZlciA9IEJ1ZmZlci5hbGxvYygzMilcbiAgcHJvdGVjdGVkIGNoYWluTmFtZTogc3RyaW5nID0gXCJcIlxuICBwcm90ZWN0ZWQgdm1JRDogQnVmZmVyID0gQnVmZmVyLmFsbG9jKDMyKVxuICBwcm90ZWN0ZWQgbnVtRlhJRHM6IEJ1ZmZlciA9IEJ1ZmZlci5hbGxvYyg0KVxuICBwcm90ZWN0ZWQgZnhJRHM6IEJ1ZmZlcltdID0gW11cbiAgcHJvdGVjdGVkIGdlbmVzaXNEYXRhOiBCdWZmZXIgPSBCdWZmZXIuYWxsb2MoMzIpXG4gIHByb3RlY3RlZCBzdWJuZXRBdXRoOiBTdWJuZXRBdXRoXG4gIHByb3RlY3RlZCBzaWdDb3VudDogQnVmZmVyID0gQnVmZmVyLmFsbG9jKDQpXG4gIHByb3RlY3RlZCBzaWdJZHhzOiBTaWdJZHhbXSA9IFtdIC8vIGlkeHMgb2Ygc3VibmV0IGF1dGggc2lnbmVyc1xuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBpZCBvZiB0aGUgW1tDcmVhdGVDaGFpblR4XV1cbiAgICovXG4gIGdldFR4VHlwZSgpOiBudW1iZXIge1xuICAgIHJldHVybiBQbGF0Zm9ybVZNQ29uc3RhbnRzLkNSRUFURUNIQUlOVFhcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBzdWJuZXRBdXRoXG4gICAqL1xuICBnZXRTdWJuZXRBdXRoKCk6IFN1Ym5ldEF1dGgge1xuICAgIHJldHVybiB0aGlzLnN1Ym5ldEF1dGhcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBzdWJuZXRJRCBhcyBhIHN0cmluZ1xuICAgKi9cbiAgZ2V0U3VibmV0SUQoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYmludG9vbHMuY2I1OEVuY29kZSh0aGlzLnN1Ym5ldElEKVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBzdHJpbmcgb2YgdGhlIGNoYWluTmFtZVxuICAgKi9cbiAgZ2V0Q2hhaW5OYW1lKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuY2hhaW5OYW1lXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIEJ1ZmZlciBvZiB0aGUgdm1JRFxuICAgKi9cbiAgZ2V0Vk1JRCgpOiBCdWZmZXIge1xuICAgIHJldHVybiB0aGlzLnZtSURcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFuIGFycmF5IG9mIGZ4SURzIGFzIEJ1ZmZlcnNcbiAgICovXG4gIGdldEZYSURzKCk6IEJ1ZmZlcltdIHtcbiAgICByZXR1cm4gdGhpcy5meElEc1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBzdHJpbmcgb2YgdGhlIGdlbmVzaXNEYXRhXG4gICAqL1xuICBnZXRHZW5lc2lzRGF0YSgpOiBzdHJpbmcge1xuICAgIHJldHVybiBiaW50b29scy5jYjU4RW5jb2RlKHRoaXMuZ2VuZXNpc0RhdGEpXG4gIH1cblxuICAvKipcbiAgICogVGFrZXMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBjb250YWluaW5nIGFuIFtbQ3JlYXRlQ2hhaW5UeF1dLCBwYXJzZXMgaXQsIHBvcHVsYXRlcyB0aGUgY2xhc3MsIGFuZCByZXR1cm5zIHRoZSBsZW5ndGggb2YgdGhlIFtbQ3JlYXRlQ2hhaW5UeF1dIGluIGJ5dGVzLlxuICAgKlxuICAgKiBAcGFyYW0gYnl0ZXMgQSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBjb250YWluaW5nIGEgcmF3IFtbQ3JlYXRlQ2hhaW5UeF1dXG4gICAqXG4gICAqIEByZXR1cm5zIFRoZSBsZW5ndGggb2YgdGhlIHJhdyBbW0NyZWF0ZUNoYWluVHhdXVxuICAgKlxuICAgKiBAcmVtYXJrcyBhc3N1bWUgbm90LWNoZWNrc3VtbWVkXG4gICAqL1xuICBmcm9tQnVmZmVyKGJ5dGVzOiBCdWZmZXIsIG9mZnNldDogbnVtYmVyID0gMCk6IG51bWJlciB7XG4gICAgb2Zmc2V0ID0gc3VwZXIuZnJvbUJ1ZmZlcihieXRlcywgb2Zmc2V0KVxuICAgIHRoaXMuc3VibmV0SUQgPSBiaW50b29scy5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyAzMilcbiAgICBvZmZzZXQgKz0gMzJcblxuICAgIGNvbnN0IGNoYWluTmFtZVNpemU6IG51bWJlciA9IGJpbnRvb2xzXG4gICAgICAuY29weUZyb20oYnl0ZXMsIG9mZnNldCwgb2Zmc2V0ICsgMilcbiAgICAgIC5yZWFkVUludDE2QkUoMClcbiAgICBvZmZzZXQgKz0gMlxuXG4gICAgdGhpcy5jaGFpbk5hbWUgPSBiaW50b29sc1xuICAgICAgLmNvcHlGcm9tKGJ5dGVzLCBvZmZzZXQsIG9mZnNldCArIGNoYWluTmFtZVNpemUpXG4gICAgICAudG9TdHJpbmcoXCJ1dGY4XCIpXG4gICAgb2Zmc2V0ICs9IGNoYWluTmFtZVNpemVcblxuICAgIHRoaXMudm1JRCA9IGJpbnRvb2xzLmNvcHlGcm9tKGJ5dGVzLCBvZmZzZXQsIG9mZnNldCArIDMyKVxuICAgIG9mZnNldCArPSAzMlxuXG4gICAgdGhpcy5udW1GWElEcyA9IGJpbnRvb2xzLmNvcHlGcm9tKGJ5dGVzLCBvZmZzZXQsIG9mZnNldCArIDQpXG4gICAgb2Zmc2V0ICs9IDRcblxuICAgIGNvbnN0IG5meGlkczogbnVtYmVyID0gcGFyc2VJbnQodGhpcy5udW1GWElEcy50b1N0cmluZyhcImhleFwiKSwgMTApXG5cbiAgICBmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgbmZ4aWRzOyBpKyspIHtcbiAgICAgIHRoaXMuZnhJRHMucHVzaChiaW50b29scy5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyAzMikpXG4gICAgICBvZmZzZXQgKz0gMzJcbiAgICB9XG5cbiAgICBjb25zdCBnZW5lc2lzRGF0YVNpemU6IG51bWJlciA9IGJpbnRvb2xzXG4gICAgICAuY29weUZyb20oYnl0ZXMsIG9mZnNldCwgb2Zmc2V0ICsgNClcbiAgICAgIC5yZWFkVUludDMyQkUoMClcbiAgICBvZmZzZXQgKz0gNFxuXG4gICAgdGhpcy5nZW5lc2lzRGF0YSA9IGJpbnRvb2xzLmNvcHlGcm9tKFxuICAgICAgYnl0ZXMsXG4gICAgICBvZmZzZXQsXG4gICAgICBvZmZzZXQgKyBnZW5lc2lzRGF0YVNpemVcbiAgICApXG4gICAgb2Zmc2V0ICs9IGdlbmVzaXNEYXRhU2l6ZVxuXG4gICAgY29uc3Qgc2E6IFN1Ym5ldEF1dGggPSBuZXcgU3VibmV0QXV0aCgpXG4gICAgb2Zmc2V0ICs9IHNhLmZyb21CdWZmZXIoYmludG9vbHMuY29weUZyb20oYnl0ZXMsIG9mZnNldCkpXG5cbiAgICB0aGlzLnN1Ym5ldEF1dGggPSBzYVxuXG4gICAgcmV0dXJuIG9mZnNldFxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSByZXByZXNlbnRhdGlvbiBvZiB0aGUgW1tDcmVhdGVDaGFpblR4XV0uXG4gICAqL1xuICB0b0J1ZmZlcigpOiBCdWZmZXIge1xuICAgIGNvbnN0IHN1cGVyYnVmZjogQnVmZmVyID0gc3VwZXIudG9CdWZmZXIoKVxuXG4gICAgY29uc3QgY2hhaW5OYW1lQnVmZjogQnVmZmVyID0gQnVmZmVyLmFsbG9jKHRoaXMuY2hhaW5OYW1lLmxlbmd0aClcbiAgICBjaGFpbk5hbWVCdWZmLndyaXRlKHRoaXMuY2hhaW5OYW1lLCAwLCB0aGlzLmNoYWluTmFtZS5sZW5ndGgsIFwidXRmOFwiKVxuICAgIGNvbnN0IGNoYWluTmFtZVNpemU6IEJ1ZmZlciA9IEJ1ZmZlci5hbGxvYygyKVxuICAgIGNoYWluTmFtZVNpemUud3JpdGVVSW50QkUodGhpcy5jaGFpbk5hbWUubGVuZ3RoLCAwLCAyKVxuXG4gICAgbGV0IGJzaXplOiBudW1iZXIgPVxuICAgICAgc3VwZXJidWZmLmxlbmd0aCArXG4gICAgICB0aGlzLnN1Ym5ldElELmxlbmd0aCArXG4gICAgICBjaGFpbk5hbWVTaXplLmxlbmd0aCArXG4gICAgICBjaGFpbk5hbWVCdWZmLmxlbmd0aCArXG4gICAgICB0aGlzLnZtSUQubGVuZ3RoICtcbiAgICAgIHRoaXMubnVtRlhJRHMubGVuZ3RoXG5cbiAgICBjb25zdCBiYXJyOiBCdWZmZXJbXSA9IFtcbiAgICAgIHN1cGVyYnVmZixcbiAgICAgIHRoaXMuc3VibmV0SUQsXG4gICAgICBjaGFpbk5hbWVTaXplLFxuICAgICAgY2hhaW5OYW1lQnVmZixcbiAgICAgIHRoaXMudm1JRCxcbiAgICAgIHRoaXMubnVtRlhJRHNcbiAgICBdXG5cbiAgICB0aGlzLmZ4SURzLmZvckVhY2goKGZ4SUQ6IEJ1ZmZlcik6IHZvaWQgPT4ge1xuICAgICAgYnNpemUgKz0gZnhJRC5sZW5ndGhcbiAgICAgIGJhcnIucHVzaChmeElEKVxuICAgIH0pXG5cbiAgICBic2l6ZSArPSA0XG4gICAgYnNpemUgKz0gdGhpcy5nZW5lc2lzRGF0YS5sZW5ndGhcbiAgICBjb25zdCBnZExlbmd0aDogQnVmZmVyID0gQnVmZmVyLmFsbG9jKDQpXG4gICAgZ2RMZW5ndGgud3JpdGVVSW50QkUodGhpcy5nZW5lc2lzRGF0YS5sZW5ndGgsIDAsIDQpXG4gICAgYmFyci5wdXNoKGdkTGVuZ3RoKVxuICAgIGJhcnIucHVzaCh0aGlzLmdlbmVzaXNEYXRhKVxuXG4gICAgYnNpemUgKz0gdGhpcy5zdWJuZXRBdXRoLnRvQnVmZmVyKCkubGVuZ3RoXG4gICAgYmFyci5wdXNoKHRoaXMuc3VibmV0QXV0aC50b0J1ZmZlcigpKVxuXG4gICAgcmV0dXJuIEJ1ZmZlci5jb25jYXQoYmFyciwgYnNpemUpXG4gIH1cblxuICBjbG9uZSgpOiB0aGlzIHtcbiAgICBjb25zdCBuZXdDcmVhdGVDaGFpblR4OiBDcmVhdGVDaGFpblR4ID0gbmV3IENyZWF0ZUNoYWluVHgoKVxuICAgIG5ld0NyZWF0ZUNoYWluVHguZnJvbUJ1ZmZlcih0aGlzLnRvQnVmZmVyKCkpXG4gICAgcmV0dXJuIG5ld0NyZWF0ZUNoYWluVHggYXMgdGhpc1xuICB9XG5cbiAgY3JlYXRlKC4uLmFyZ3M6IGFueVtdKTogdGhpcyB7XG4gICAgcmV0dXJuIG5ldyBDcmVhdGVDaGFpblR4KC4uLmFyZ3MpIGFzIHRoaXNcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGFuZCBhZGRzIGEgW1tTaWdJZHhdXSB0byB0aGUgW1tBZGRTdWJuZXRWYWxpZGF0b3JUeF1dLlxuICAgKlxuICAgKiBAcGFyYW0gYWRkcmVzc0lkeCBUaGUgaW5kZXggb2YgdGhlIGFkZHJlc3MgdG8gcmVmZXJlbmNlIGluIHRoZSBzaWduYXR1cmVzXG4gICAqIEBwYXJhbSBhZGRyZXNzIFRoZSBhZGRyZXNzIG9mIHRoZSBzb3VyY2Ugb2YgdGhlIHNpZ25hdHVyZVxuICAgKi9cbiAgYWRkU2lnbmF0dXJlSWR4KGFkZHJlc3NJZHg6IG51bWJlciwgYWRkcmVzczogQnVmZmVyKTogdm9pZCB7XG4gICAgY29uc3QgYWRkcmVzc0luZGV4OiBCdWZmZXIgPSBCdWZmZXIuYWxsb2MoNClcbiAgICBhZGRyZXNzSW5kZXgud3JpdGVVSW50QkUoYWRkcmVzc0lkeCwgMCwgNClcbiAgICB0aGlzLnN1Ym5ldEF1dGguYWRkQWRkcmVzc0luZGV4KGFkZHJlc3NJbmRleClcblxuICAgIGNvbnN0IHNpZ2lkeDogU2lnSWR4ID0gbmV3IFNpZ0lkeCgpXG4gICAgY29uc3QgYjogQnVmZmVyID0gQnVmZmVyLmFsbG9jKDQpXG4gICAgYi53cml0ZVVJbnQzMkJFKGFkZHJlc3NJZHgsIDApXG4gICAgc2lnaWR4LmZyb21CdWZmZXIoYilcbiAgICBzaWdpZHguc2V0U291cmNlKGFkZHJlc3MpXG4gICAgdGhpcy5zaWdJZHhzLnB1c2goc2lnaWR4KVxuICAgIHRoaXMuc2lnQ291bnQud3JpdGVVSW50MzJCRSh0aGlzLnNpZ0lkeHMubGVuZ3RoLCAwKVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGFycmF5IG9mIFtbU2lnSWR4XV0gZm9yIHRoaXMgW1tUWF1dXG4gICAqL1xuICBnZXRTaWdJZHhzKCk6IFNpZ0lkeFtdIHtcbiAgICByZXR1cm4gdGhpcy5zaWdJZHhzXG4gIH1cblxuICBnZXRDcmVkZW50aWFsSUQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gUGxhdGZvcm1WTUNvbnN0YW50cy5TRUNQQ1JFREVOVElBTFxuICB9XG5cbiAgLyoqXG4gICAqIFRha2VzIHRoZSBieXRlcyBvZiBhbiBbW1Vuc2lnbmVkVHhdXSBhbmQgcmV0dXJucyBhbiBhcnJheSBvZiBbW0NyZWRlbnRpYWxdXXNcbiAgICpcbiAgICogQHBhcmFtIG1zZyBBIEJ1ZmZlciBmb3IgdGhlIFtbVW5zaWduZWRUeF1dXG4gICAqIEBwYXJhbSBrYyBBbiBbW0tleUNoYWluXV0gdXNlZCBpbiBzaWduaW5nXG4gICAqXG4gICAqIEByZXR1cm5zIEFuIGFycmF5IG9mIFtbQ3JlZGVudGlhbF1dc1xuICAgKi9cbiAgc2lnbihtc2c6IEJ1ZmZlciwga2M6IEtleUNoYWluKTogQ3JlZGVudGlhbFtdIHtcbiAgICBjb25zdCBjcmVkczogQ3JlZGVudGlhbFtdID0gc3VwZXIuc2lnbihtc2csIGtjKVxuICAgIGNvbnN0IHNpZ2lkeHM6IFNpZ0lkeFtdID0gdGhpcy5nZXRTaWdJZHhzKClcbiAgICBjb25zdCBjcmVkOiBDcmVkZW50aWFsID0gU2VsZWN0Q3JlZGVudGlhbENsYXNzKHRoaXMuZ2V0Q3JlZGVudGlhbElEKCkpXG4gICAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IHNpZ2lkeHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGtleXBhaXI6IEtleVBhaXIgPSBrYy5nZXRLZXkoc2lnaWR4c1tgJHtpfWBdLmdldFNvdXJjZSgpKVxuICAgICAgY29uc3Qgc2lnbnZhbDogQnVmZmVyID0ga2V5cGFpci5zaWduKG1zZylcbiAgICAgIGNvbnN0IHNpZzogU2lnbmF0dXJlID0gbmV3IFNpZ25hdHVyZSgpXG4gICAgICBzaWcuZnJvbUJ1ZmZlcihzaWdudmFsKVxuICAgICAgY3JlZC5hZGRTaWduYXR1cmUoc2lnKVxuICAgIH1cbiAgICBjcmVkcy5wdXNoKGNyZWQpXG4gICAgcmV0dXJuIGNyZWRzXG4gIH1cblxuICAvKipcbiAgICogQ2xhc3MgcmVwcmVzZW50aW5nIGFuIHVuc2lnbmVkIENyZWF0ZUNoYWluIHRyYW5zYWN0aW9uLlxuICAgKlxuICAgKiBAcGFyYW0gbmV0d29ya0lEIE9wdGlvbmFsIG5ldHdvcmtJRCwgW1tEZWZhdWx0TmV0d29ya0lEXV1cbiAgICogQHBhcmFtIGJsb2NrY2hhaW5JRCBPcHRpb25hbCBibG9ja2NoYWluSUQsIGRlZmF1bHQgQnVmZmVyLmFsbG9jKDMyLCAxNilcbiAgICogQHBhcmFtIG91dHMgT3B0aW9uYWwgYXJyYXkgb2YgdGhlIFtbVHJhbnNmZXJhYmxlT3V0cHV0XV1zXG4gICAqIEBwYXJhbSBpbnMgT3B0aW9uYWwgYXJyYXkgb2YgdGhlIFtbVHJhbnNmZXJhYmxlSW5wdXRdXXNcbiAgICogQHBhcmFtIG1lbW8gT3B0aW9uYWwge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gZm9yIHRoZSBtZW1vIGZpZWxkXG4gICAqIEBwYXJhbSBzdWJuZXRJRCBPcHRpb25hbCBJRCBvZiB0aGUgU3VibmV0IHRoYXQgdmFsaWRhdGVzIHRoaXMgYmxvY2tjaGFpbi5cbiAgICogQHBhcmFtIGNoYWluTmFtZSBPcHRpb25hbCBBIGh1bWFuIHJlYWRhYmxlIG5hbWUgZm9yIHRoZSBjaGFpbjsgbmVlZCBub3QgYmUgdW5pcXVlXG4gICAqIEBwYXJhbSB2bUlEIE9wdGlvbmFsIElEIG9mIHRoZSBWTSBydW5uaW5nIG9uIHRoZSBuZXcgY2hhaW5cbiAgICogQHBhcmFtIGZ4SURzIE9wdGlvbmFsIElEcyBvZiB0aGUgZmVhdHVyZSBleHRlbnNpb25zIHJ1bm5pbmcgb24gdGhlIG5ldyBjaGFpblxuICAgKiBAcGFyYW0gZ2VuZXNpc0RhdGEgT3B0aW9uYWwgQnl0ZSByZXByZXNlbnRhdGlvbiBvZiBnZW5lc2lzIHN0YXRlIG9mIHRoZSBuZXcgY2hhaW5cbiAgICovXG4gIGNvbnN0cnVjdG9yKFxuICAgIG5ldHdvcmtJRDogbnVtYmVyID0gRGVmYXVsdE5ldHdvcmtJRCxcbiAgICBibG9ja2NoYWluSUQ6IEJ1ZmZlciA9IEJ1ZmZlci5hbGxvYygzMiwgMTYpLFxuICAgIG91dHM6IFRyYW5zZmVyYWJsZU91dHB1dFtdID0gdW5kZWZpbmVkLFxuICAgIGluczogVHJhbnNmZXJhYmxlSW5wdXRbXSA9IHVuZGVmaW5lZCxcbiAgICBtZW1vOiBCdWZmZXIgPSB1bmRlZmluZWQsXG4gICAgc3VibmV0SUQ6IHN0cmluZyB8IEJ1ZmZlciA9IHVuZGVmaW5lZCxcbiAgICBjaGFpbk5hbWU6IHN0cmluZyA9IHVuZGVmaW5lZCxcbiAgICB2bUlEOiBzdHJpbmcgPSB1bmRlZmluZWQsXG4gICAgZnhJRHM6IHN0cmluZ1tdID0gdW5kZWZpbmVkLFxuICAgIGdlbmVzaXNEYXRhOiBzdHJpbmcgfCBHZW5lc2lzRGF0YSA9IHVuZGVmaW5lZFxuICApIHtcbiAgICBzdXBlcihuZXR3b3JrSUQsIGJsb2NrY2hhaW5JRCwgb3V0cywgaW5zLCBtZW1vKVxuICAgIGlmICh0eXBlb2Ygc3VibmV0SUQgIT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgaWYgKHR5cGVvZiBzdWJuZXRJRCA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICB0aGlzLnN1Ym5ldElEID0gYmludG9vbHMuY2I1OERlY29kZShzdWJuZXRJRClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuc3VibmV0SUQgPSBzdWJuZXRJRFxuICAgICAgfVxuICAgIH1cbiAgICBpZiAodHlwZW9mIGNoYWluTmFtZSAhPSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICB0aGlzLmNoYWluTmFtZSA9IGNoYWluTmFtZVxuICAgIH1cbiAgICBpZiAodHlwZW9mIHZtSUQgIT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgY29uc3QgYnVmOiBCdWZmZXIgPSBCdWZmZXIuYWxsb2MoMzIpXG4gICAgICBidWYud3JpdGUodm1JRCwgMCwgdm1JRC5sZW5ndGgpXG4gICAgICB0aGlzLnZtSUQgPSBidWZcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBmeElEcyAhPSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICB0aGlzLm51bUZYSURzLndyaXRlVUludDMyQkUoZnhJRHMubGVuZ3RoLCAwKVxuICAgICAgY29uc3QgZnhJREJ1ZnM6IEJ1ZmZlcltdID0gW11cbiAgICAgIGZ4SURzLmZvckVhY2goKGZ4SUQ6IHN0cmluZyk6IHZvaWQgPT4ge1xuICAgICAgICBjb25zdCBidWY6IEJ1ZmZlciA9IEJ1ZmZlci5hbGxvYygzMilcbiAgICAgICAgYnVmLndyaXRlKGZ4SUQsIDAsIGZ4SUQubGVuZ3RoLCBcInV0ZjhcIilcbiAgICAgICAgZnhJREJ1ZnMucHVzaChidWYpXG4gICAgICB9KVxuICAgICAgdGhpcy5meElEcyA9IGZ4SURCdWZzXG4gICAgfVxuICAgIGlmICh0eXBlb2YgZ2VuZXNpc0RhdGEgIT0gXCJ1bmRlZmluZWRcIiAmJiB0eXBlb2YgZ2VuZXNpc0RhdGEgIT0gXCJzdHJpbmdcIikge1xuICAgICAgdGhpcy5nZW5lc2lzRGF0YSA9IGdlbmVzaXNEYXRhLnRvQnVmZmVyKClcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBnZW5lc2lzRGF0YSA9PSBcInN0cmluZ1wiKSB7XG4gICAgICB0aGlzLmdlbmVzaXNEYXRhID0gQnVmZmVyLmZyb20oZ2VuZXNpc0RhdGEpXG4gICAgfVxuXG4gICAgY29uc3Qgc3VibmV0QXV0aDogU3VibmV0QXV0aCA9IG5ldyBTdWJuZXRBdXRoKClcbiAgICB0aGlzLnN1Ym5ldEF1dGggPSBzdWJuZXRBdXRoXG4gIH1cbn1cbiJdfQ==
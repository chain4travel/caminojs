"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddProposalTx = exports.ProposalWrapper = exports.DEFAULT_CAMINOGO_CODEC_VERSION = exports.ExcludeMemberProposal = exports.BaseFeeProposal = exports.AdminProposal = exports.AddMemberProposal = void 0;
/**
 * @packageDocumentation
 * @module API-PlatformVM-AddProposalTx
 */
const buffer_1 = require("buffer/");
const common_1 = require("../../../common");
const bintools_1 = __importDefault(require("../../../utils/bintools"));
const constants_1 = require("../../../utils/constants");
const serialization_1 = require("../../../utils/serialization");
const basetx_1 = require("../basetx");
const constants_2 = require("../constants");
const credentials_1 = require("../credentials");
const subnetauth_1 = require("../subnetauth");
const addmemberproposal_1 = require("./addmemberproposal");
Object.defineProperty(exports, "AddMemberProposal", { enumerable: true, get: function () { return addmemberproposal_1.AddMemberProposal; } });
const adminproposal_1 = require("./adminproposal");
Object.defineProperty(exports, "AdminProposal", { enumerable: true, get: function () { return adminproposal_1.AdminProposal; } });
const basefeeproposal_1 = require("./basefeeproposal");
Object.defineProperty(exports, "BaseFeeProposal", { enumerable: true, get: function () { return basefeeproposal_1.BaseFeeProposal; } });
const excludememberproposal_1 = require("./excludememberproposal");
Object.defineProperty(exports, "ExcludeMemberProposal", { enumerable: true, get: function () { return excludememberproposal_1.ExcludeMemberProposal; } });
/**
 * @ignore
 */
const bintools = bintools_1.default.getInstance();
const serialization = serialization_1.Serialization.getInstance();
exports.DEFAULT_CAMINOGO_CODEC_VERSION = 0;
class ProposalWrapper {
    constructor(proposal) {
        if (proposal) {
            this.proposal = proposal;
            this._typeID = proposal.getTypeID();
        }
    }
    serialize(encoding = "hex") {
        return {
            proposal: this.proposal.serialize(encoding)
        };
    }
    deserialize(fields, encoding = "hex") {
        this.proposal = this.proposal.deserialize(fields, encoding);
        return this;
    }
    getProposalType() {
        return this._typeID;
    }
    getProposal() {
        return this.proposal;
    }
    fromBuffer(bytes, offset = 0) {
        const codecVersion = bintools
            .copyFrom(bytes, offset, offset + 2)
            .readUInt16BE(0);
        offset += 2;
        let proposal = null;
        this._typeID = bintools.copyFrom(bytes, offset, offset + 4).readUInt32BE(0);
        offset += 4;
        switch (this._typeID) {
            case constants_2.PlatformVMConstants.BASEFEEPORPOSAL_TYPE_ID:
                proposal = new basefeeproposal_1.BaseFeeProposal();
                break;
            case constants_2.PlatformVMConstants.ADDMEMBERPORPOSAL_TYPE_ID:
                proposal = new addmemberproposal_1.AddMemberProposal();
                break;
            case constants_2.PlatformVMConstants.EXCLUDEMEMBERPORPOSAL_TYPE_ID:
                proposal = new excludememberproposal_1.ExcludeMemberProposal();
                break;
            case constants_2.PlatformVMConstants.ADMINPROPOSAL_TYPE_ID:
                proposal = new adminproposal_1.AdminProposal();
                break;
            default:
                throw `Unsupported proposal type: ${this._typeID}`;
        }
        offset = proposal.fromBuffer(bytes, offset);
        this.proposal = proposal;
        return offset;
    }
    toBuffer() {
        const codecVersion = buffer_1.Buffer.alloc(2);
        codecVersion.writeUInt8(exports.DEFAULT_CAMINOGO_CODEC_VERSION, 0);
        const typeId = buffer_1.Buffer.alloc(4);
        typeId.writeUInt32BE(this._typeID, 0);
        const buff = this.proposal.toBuffer();
        return buffer_1.Buffer.concat([codecVersion, typeId, buff], 2 + typeId.length + buff.length);
    }
}
exports.ProposalWrapper = ProposalWrapper;
/**
 * Class representing an unsigned AddProposalTx transaction.
 */
class AddProposalTx extends basetx_1.BaseTx {
    serialize(encoding = "hex") {
        let fields = super.serialize(encoding);
        return Object.assign(Object.assign({}, fields), { proposerAddress: serialization.encoder(this.proposerAddress, encoding, "Buffer", "cb58"), proposalDescription: serialization.encoder(this.proposalDescription, encoding, "Buffer", "hex"), proposerAuth: this.proposerAuth.serialize(encoding), proposalPayload: this.proposalPayload.serialize(encoding) });
    }
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        this.proposerAddress = serialization.decoder(fields["proposerAddress"], encoding, "cb58", "Buffer", 20);
        this.proposerAuth.deserialize(fields["proposerAuth"], encoding);
        this.proposalPayload.deserialize(fields, encoding);
        this.proposalDescription = serialization.decoder(fields["proposalDescription"], encoding, "hex", "Buffer");
    }
    /**
     * Returns the id of the [[AddProposalTx]]
     */
    getTxType() {
        return this._typeID;
    }
    /**
     * Returns the proposal payload
     */
    getProposalPayload() {
        return this.proposalPayload;
    }
    /**
     * Returns the proposer address
     */
    getProposerAddress() {
        return this.proposerAddress;
    }
    /**
     * Returns the proposer auth
     */
    getProposerAuth() {
        return this.proposerAuth;
    }
    /**
     * Returns the proposal description
     */
    getProposalDescription() {
        return this.proposalDescription;
    }
    /**
     * Takes a {@link https://github.com/feross/buffer|Buffer} containing an [[AddProposalTx]], parses it, populates the class, and returns the length of the [[AddProposalTx]] in bytes.
     *
     * @param bytes A {@link https://github.com/feross/buffer|Buffer} containing a raw [[AddProposalTx]]
     *
     * @returns The length of the raw [[AddProposalTx]]
     *
     * @remarks assume not-checksummed
     */
    fromBuffer(bytes, offset = 0) {
        offset = super.fromBuffer(bytes, offset);
        this.upgradeVersionID = new common_1.UpgradeVersionID();
        offset = this.upgradeVersionID.fromBuffer(bytes, offset);
        const descriptionLength = bintools
            .copyFrom(bytes, offset, offset + 4)
            .readUInt32BE(0);
        offset += 4;
        this.proposalDescription = bintools.copyFrom(bytes, offset, offset + descriptionLength);
        offset += descriptionLength;
        const payloadSize = bintools
            .copyFrom(bytes, offset, offset + 4)
            .readUInt32BE(0);
        offset += 4;
        const proposalWrapper = new ProposalWrapper();
        offset = proposalWrapper.fromBuffer(bytes, offset);
        this.proposalPayload = proposalWrapper;
        this.proposerAddress = bintools.copyFrom(bytes, offset, offset + 20);
        offset += 20;
        let sa = new subnetauth_1.SubnetAuth();
        offset += sa.fromBuffer(bintools.copyFrom(bytes, offset));
        this.proposerAuth = sa;
        return offset;
    }
    /**
     * Returns a {@link https://github.com/feross/buffer|Buffer} representation of the [[AddProposalTx]].
     */
    toBuffer() {
        const superbuff = super.toBuffer();
        const upgradeBuf = this.upgradeVersionID.toBuffer();
        let bsize = upgradeBuf.length + superbuff.length;
        const barr = [upgradeBuf, superbuff];
        // proposal description
        const descriptionSize = buffer_1.Buffer.alloc(4);
        descriptionSize.writeUInt32BE(this.proposalDescription.length, 0);
        barr.push(descriptionSize);
        bsize += descriptionSize.length;
        barr.push(this.proposalDescription);
        bsize += this.proposalDescription.length;
        // payload
        const payloadBuffer = this.proposalPayload.toBuffer();
        const payloadSize = buffer_1.Buffer.alloc(4);
        payloadSize.writeUInt32BE(payloadBuffer.length, 0);
        barr.push(payloadSize);
        bsize += payloadSize.length;
        barr.push(payloadBuffer);
        bsize += payloadBuffer.length;
        // proposer address
        barr.push(this.proposerAddress);
        bsize += 20;
        // proposer auth
        const authBuffer = this.proposerAuth.toBuffer();
        bsize += authBuffer.length;
        barr.push(authBuffer);
        return buffer_1.Buffer.concat(barr, bsize);
    }
    /**
     * Takes the bytes of an [[UnsignedTx]] and returns an array of [[Credential]]s
     *
     * @param msg A Buffer for the [[UnsignedTx]]
     * @param kc A [[KeyChain]] used in signing
     *
     * @returns An array of [[Credential]]s
     */
    sign(msg, kc) {
        const creds = super.sign(msg, kc);
        // Proposer
        const cred = (0, credentials_1.SelectCredentialClass)(constants_2.PlatformVMConstants.SECPCREDENTIAL);
        const keypair = kc.getKey(this.proposerAddress);
        const signval = keypair.sign(msg);
        const sig = new common_1.Signature();
        sig.fromBuffer(signval);
        cred.addSignature(sig);
        creds.push(cred);
        return creds;
    }
    /**
     * Class representing an unsigned RegisterNode transaction.
     *
     * @param networkID Optional networkID, [[DefaultNetworkID]]
     * @param blockchainID Optional blockchainID, default Buffer.alloc(32, 16)
     * @param outs Optional array of the [[TransferableOutput]]s
     * @param ins Optional array of the [[TransferableInput]]s
     * @param memo Optional {@link https://github.com/feross/buffer|Buffer} for the memo field
     * @param proposalDescription Optional contains arbitrary bytes, up to 256 bytes
     * @param proposal the proposal payload to create.
     * @param proposerAddress the creater(proposer) address.
     * @param proposerAuth auth that allows to create a proposal.
     */
    constructor(version = constants_1.DefaultTransactionVersionNumber, networkID = constants_1.DefaultNetworkID, blockchainID = buffer_1.Buffer.alloc(32, 16), outs = undefined, ins = undefined, memo = undefined, proposalDescription = buffer_1.Buffer.alloc(0), proposal = undefined, proposerAddress = undefined, proposerAuth = undefined) {
        super(networkID, blockchainID, outs, ins, memo);
        this._typeName = "AddProposalTx";
        this._typeID = constants_2.PlatformVMConstants.ADDPROPOSALTX;
        this.upgradeVersionID = new common_1.UpgradeVersionID();
        this.proposerAddress = buffer_1.Buffer.alloc(20);
        this.upgradeVersionID = new common_1.UpgradeVersionID(version);
        if (typeof proposerAddress === "string") {
            this.proposerAddress = bintools.stringToAddress(proposerAddress);
        }
        else {
            this.proposerAddress = proposerAddress;
        }
        this.proposalPayload = new ProposalWrapper(proposal);
        this.proposalDescription = proposalDescription;
        if (proposerAuth) {
            this.proposerAuth = proposerAuth;
        }
        else {
            this.proposerAuth = new subnetauth_1.SubnetAuth();
        }
    }
}
exports.AddProposalTx = AddProposalTx;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvYXBpcy9wbGF0Zm9ybXZtL2FkZHByb3Bvc2FsdHgvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7OztHQUdHO0FBQ0gsb0NBQWdDO0FBQ2hDLDRDQUF5RTtBQUN6RSx1RUFBOEM7QUFDOUMsd0RBR2lDO0FBQ2pDLGdFQUFnRjtBQUNoRixzQ0FBa0M7QUFDbEMsNENBQWtEO0FBQ2xELGdEQUFzRDtBQUl0RCw4Q0FBMEM7QUFDMUMsMkRBQXVEO0FBV3JELGtHQVhPLHFDQUFpQixPQVdQO0FBVm5CLG1EQUErQztBQVc3Qyw4RkFYTyw2QkFBYSxPQVdQO0FBVmYsdURBQW1EO0FBV2pELGdHQVhPLGlDQUFlLE9BV1A7QUFWakIsbUVBQStEO0FBVzdELHNHQVhPLDZDQUFxQixPQVdQO0FBVnZCOztHQUVHO0FBQ0gsTUFBTSxRQUFRLEdBQWEsa0JBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtBQUNqRCxNQUFNLGFBQWEsR0FBa0IsNkJBQWEsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtBQVFuRCxRQUFBLDhCQUE4QixHQUFHLENBQUMsQ0FBQTtBQU0vQyxNQUFhLGVBQWU7SUFJMUIsWUFBWSxRQUFtQjtRQUM3QixJQUFJLFFBQVEsRUFBRTtZQUNaLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFBO1lBQ3hCLElBQUksQ0FBQyxPQUFPLEdBQUcsUUFBUSxDQUFDLFNBQVMsRUFBRSxDQUFBO1NBQ3BDO0lBQ0gsQ0FBQztJQUVELFNBQVMsQ0FBQyxXQUErQixLQUFLO1FBQzVDLE9BQU87WUFDTCxRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDO1NBQzVDLENBQUE7SUFDSCxDQUFDO0lBRUQsV0FBVyxDQUFDLE1BQWMsRUFBRSxXQUErQixLQUFLO1FBQzlELElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFFB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bUJBQW1CLENBQUE7UUFDOUMsSUFBSSxZQUFZLEVBQUU7WUFDaEIsSUFBSSxDQUFDLFlBQVksR0FBRyxZQUFZLENBQUE7U0FDakM7YUFBTTtZQUNMLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSx1QkFBVSxFQUFFLENBQUE7U0FDckM7SUFDSCxDQUFDO0NBQ0Y7QUFyT0Qsc0NBcU9DIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAcGFja2FnZURvY3VtZW50YXRpb25cbiAqIEBtb2R1bGUgQVBJLVBsYXRmb3JtVk0tQWRkUHJvcG9zYWxUeFxuICovXG5pbXBvcnQgeyBCdWZmZXIgfSBmcm9tIFwiYnVmZmVyL1wiXG5pbXBvcnQgeyBDcmVkZW50aWFsLCBTaWduYXR1cmUsIFVwZ3JhZGVWZXJzaW9uSUQgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uXCJcbmltcG9ydCBCaW5Ub29scyBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvYmludG9vbHNcIlxuaW1wb3J0IHtcbiAgRGVmYXVsdE5ldHdvcmtJRCxcbiAgRGVmYXVsdFRyYW5zYWN0aW9uVmVyc2lvbk51bWJlclxufSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvY29uc3RhbnRzXCJcbmltcG9ydCB7IFNlcmlhbGl6YXRpb24sIFNlcmlhbGl6ZWRFbmNvZGluZyB9IGZyb20gXCIuLi8uLi8uLi91dGlscy9zZXJpYWxpemF0aW9uXCJcbmltcG9ydCB7IEJhc2VUeCB9IGZyb20gXCIuLi9iYXNldHhcIlxuaW1wb3J0IHsgUGxhdGZvcm1WTUNvbnN0YW50cyB9IGZyb20gXCIuLi9jb25zdGFudHNcIlxuaW1wb3J0IHsgU2VsZWN0Q3JlZGVudGlhbENsYXNzIH0gZnJvbSBcIi4uL2NyZWRlbnRpYWxzXCJcbmltcG9ydCB7IFRyYW5zZmVyYWJsZUlucHV0IH0gZnJvbSBcIi4uL2lucHV0c1wiXG5pbXBvcnQgeyBLZXlDaGFpbiwgS2V5UGFpciB9IGZyb20gXCIuLi9rZXljaGFpblwiXG5pbXBvcnQgeyBUcmFuc2ZlcmFibGVPdXRwdXQgfSBmcm9tIFwiLi4vb3V0cHV0c1wiXG5pbXBvcnQgeyBTdWJuZXRBdXRoIH0gZnJvbSBcIi4uL3N1Ym5ldGF1dGhcIlxuaW1wb3J0IHsgQWRkTWVtYmVyUHJvcG9zYWwgfSBmcm9tIFwiLi9hZGRtZW1iZXJwcm9wb3NhbFwiXG5pbXBvcnQgeyBBZG1pblByb3Bvc2FsIH0gZnJvbSBcIi4vYWRtaW5wcm9wb3NhbFwiXG5pbXBvcnQgeyBCYXNlRmVlUHJvcG9zYWwgfSBmcm9tIFwiLi9iYXNlZmVlcHJvcG9zYWxcIlxuaW1wb3J0IHsgRXhjbHVkZU1lbWJlclByb3Bvc2FsIH0gZnJvbSBcIi4vZXhjbHVkZW1lbWJlcnByb3Bvc2FsXCJcbi8qKlxuICogQGlnbm9yZVxuICovXG5jb25zdCBiaW50b29sczogQmluVG9vbHMgPSBCaW5Ub29scy5nZXRJbnN0YW5jZSgpXG5jb25zdCBzZXJpYWxpemF0aW9uOiBTZXJpYWxpemF0aW9uID0gU2VyaWFsaXphdGlvbi5nZXRJbnN0YW5jZSgpXG5cbmV4cG9ydCB7XG4gIEFkZE1lbWJlclByb3Bvc2FsLFxuICBBZG1pblByb3Bvc2FsLFxuICBCYXNlRmVlUHJvcG9zYWwsXG4gIEV4Y2x1ZGVNZW1iZXJQcm9wb3NhbFxufVxuZXhwb3J0IGNvbnN0IERFRkFVTFRfQ0FNSU5PR09fQ09ERUNfVkVSU0lPTiA9IDBcbmV4cG9ydCB0eXBlIFByb3Bvc2FsID1cbiAgfCBCYXNlRmVlUHJvcG9zYWxcbiAgfCBBZGRNZW1iZXJQcm9wb3NhbFxuICB8IEV4Y2x1ZGVNZW1iZXJQcm9wb3NhbFxuICB8IEFkbWluUHJvcG9zYWwgLy8gVE9ETzogZXh0ZW5kIHRoaXMgYWxpYXMgdHlwZSBmb3IgZnVydGhlciBzdXBwb3J0ZWQgcHJvcG9zYWwgdHlwZXNcbmV4cG9ydCBjbGFzcyBQcm9wb3NhbFdyYXBwZXIge1xuICBwcml2YXRlIF90eXBlSUQ6IG51bWJlclxuICBwcml2YXRlIHByb3Bvc2FsOiBQcm9wb3NhbFxuXG4gIGNvbnN0cnVjdG9yKHByb3Bvc2FsPzogUHJvcG9zYWwpIHtcbiAgICBpZiAocHJvcG9zYWwpIHtcbiAgICAgIHRoaXMucHJvcG9zYWwgPSBwcm9wb3NhbFxuICAgICAgdGhpcy5fdHlwZUlEID0gcHJvcG9zYWwuZ2V0VHlwZUlEKClcbiAgICB9XG4gIH1cblxuICBzZXJpYWxpemUoZW5jb2Rpbmc6IFNlcmlhbGl6ZWRFbmNvZGluZyA9IFwiaGV4XCIpOiBvYmplY3Qge1xuICAgIHJldHVybiB7XG4gICAgICBwcm9wb3NhbDogdGhpcy5wcm9wb3NhbC5zZXJpYWxpemUoZW5jb2RpbmcpXG4gICAgfVxuICB9XG5cbiAgZGVzZXJpYWxpemUoZmllbGRzOiBvYmplY3QsIGVuY29kaW5nOiBTZXJpYWxpemVkRW5jb2RpbmcgPSBcImhleFwiKTogdGhpcyB7XG4gICAgdGhpcy5wcm9wb3NhbCA9IHRoaXMucHJvcG9zYWwuZGVzZXJpYWxpemUoZmllbGRzLCBlbmNvZGluZylcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgZ2V0UHJvcG9zYWxUeXBlKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX3R5cGVJRFxuICB9XG5cbiAgZ2V0UHJvcG9zYWwoKTogUHJvcG9zYWwge1xuICAgIHJldHVybiB0aGlzLnByb3Bvc2FsXG4gIH1cblxuICBmcm9tQnVmZmVyKGJ5dGVzOiBCdWZmZXIsIG9mZnNldDogbnVtYmVyID0gMCk6IG51bWJlciB7XG4gICAgY29uc3QgY29kZWNWZXJzaW9uID0gYmludG9vbHNcbiAgICAgIC5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyAyKVxuICAgICAgLnJlYWRVSW50MTZCRSgwKVxuICAgIG9mZnNldCArPSAyXG4gICAgbGV0IHByb3Bvc2FsID0gbnVsbFxuICAgIHRoaXMuX3R5cGVJRCA9IGJpbnRvb2xzLmNvcHlGcm9tKGJ5dGVzLCBvZmZzZXQsIG9mZnNldCArIDQpLnJlYWRVSW50MzJCRSgwKVxuICAgIG9mZnNldCArPSA0XG4gICAgc3dpdGNoICh0aGlzLl90eXBlSUQpIHtcbiAgICAgIGNhc2UgUGxhdGZvcm1WTUNvbnN0YW50cy5CQVNFRkVFUE9SUE9TQUxfVFlQRV9JRDpcbiAgICAgICAgcHJvcG9zYWwgPSBuZXcgQmFzZUZlZVByb3Bvc2FsKClcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgUGxhdGZvcm1WTUNvbnN0YW50cy5BRERNRU1CRVJQT1JQT1NBTF9UWVBFX0lEOlxuICAgICAgICBwcm9wb3NhbCA9IG5ldyBBZGRNZW1iZXJQcm9wb3NhbCgpXG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlIFBsYXRmb3JtVk1Db25zdGFudHMuRVhDTFVERU1FTUJFUlBPUlBPU0FMX1RZUEVfSUQ6XG4gICAgICAgIHByb3Bvc2FsID0gbmV3IEV4Y2x1ZGVNZW1iZXJQcm9wb3NhbCgpXG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlIFBsYXRmb3JtVk1Db25zdGFudHMuQURNSU5QUk9QT1NBTF9UWVBFX0lEOlxuICAgICAgICBwcm9wb3NhbCA9IG5ldyBBZG1pblByb3Bvc2FsKClcbiAgICAgICAgYnJlYWtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IGBVbnN1cHBvcnRlZCBwcm9wb3NhbCB0eXBlOiAke3RoaXMuX3R5cGVJRH1gXG4gICAgfVxuICAgIG9mZnNldCA9IHByb3Bvc2FsLmZyb21CdWZmZXIoYnl0ZXMsIG9mZnNldClcbiAgICB0aGlzLnByb3Bvc2FsID0gcHJvcG9zYWxcbiAgICByZXR1cm4gb2Zmc2V0XG4gIH1cblxuICB0b0J1ZmZlcigpOiBCdWZmZXIge1xuICAgIGNvbnN0IGNvZGVjVmVyc2lvbiA9IEJ1ZmZlci5hbGxvYygyKVxuICAgIGNvZGVjVmVyc2lvbi53cml0ZVVJbnQ4KERFRkFVTFRfQ0FNSU5PR09fQ09ERUNfVkVSU0lPTiwgMClcbiAgICBjb25zdCB0eXBlSWQgPSBCdWZmZXIuYWxsb2MoNClcbiAgICB0eXBlSWQud3JpdGVVSW50MzJCRSh0aGlzLl90eXBlSUQsIDApXG4gICAgY29uc3QgYnVmZiA9IHRoaXMucHJvcG9zYWwudG9CdWZmZXIoKVxuICAgIHJldHVybiBCdWZmZXIuY29uY2F0KFxuICAgICAgW2NvZGVjVmVyc2lvbiwgdHlwZUlkLCBidWZmXSxcbiAgICAgIDIgKyB0eXBlSWQubGVuZ3RoICsgYnVmZi5sZW5ndGhcbiAgICApXG4gIH1cbn1cbi8qKlxuICogQ2xhc3MgcmVwcmVzZW50aW5nIGFuIHVuc2lnbmVkIEFkZFByb3Bvc2FsVHggdHJhbnNhY3Rpb24uXG4gKi9cbmV4cG9ydCBjbGFzcyBBZGRQcm9wb3NhbFR4IGV4dGVuZHMgQmFzZVR4IHtcbiAgcHJvdGVjdGVkIF90eXBlTmFtZSA9IFwiQWRkUHJvcG9zYWxUeFwiXG4gIHByb3RlY3RlZCBfdHlwZUlEID0gUGxhdGZvcm1WTUNvbnN0YW50cy5BRERQUk9QT1NBTFRYXG5cbiAgc2VyaWFsaXplKGVuY29kaW5nOiBTZXJpYWxpemVkRW5jb2RpbmcgPSBcImhleFwiKTogb2JqZWN0IHtcbiAgICBsZXQgZmllbGRzOiBvYmplY3QgPSBzdXBlci5zZXJpYWxpemUoZW5jb2RpbmcpXG4gICAgcmV0dXJuIHtcbiAgICAgIC4uLmZpZWxkcyxcbiAgICAgIHByb3Bvc2VyQWRkcmVzczogc2VyaWFsaXphdGlvbi5lbmNvZGVyKFxuICAgICAgICB0aGlzLnByb3Bvc2VyQWRkcmVzcyxcbiAgICAgICAgZW5jb2RpbmcsXG4gICAgICAgIFwiQnVmZmVyXCIsXG4gICAgICAgIFwiY2I1OFwiXG4gICAgICApLFxuICAgICAgcHJvcG9zYWxEZXNjcmlwdGlvbjogc2VyaWFsaXphdGlvbi5lbmNvZGVyKFxuICAgICAgICB0aGlzLnByb3Bvc2FsRGVzY3JpcHRpb24sXG4gICAgICAgIGVuY29kaW5nLFxuICAgICAgICBcIkJ1ZmZlclwiLFxuICAgICAgICBcImhleFwiXG4gICAgICApLFxuICAgICAgcHJvcG9zZXJBdXRoOiB0aGlzLnByb3Bvc2VyQXV0aC5zZXJpYWxpemUoZW5jb2RpbmcpLFxuICAgICAgcHJvcG9zYWxQYXlsb2FkOiB0aGlzLnByb3Bvc2FsUGF5bG9hZC5zZXJpYWxpemUoZW5jb2RpbmcpXG4gICAgfVxuICB9XG4gIGRlc2VyaWFsaXplKGZpZWxkczogb2JqZWN0LCBlbmNvZGluZzogU2VyaWFsaXplZEVuY29kaW5nID0gXCJoZXhcIikge1xuICAgIHN1cGVyLmRlc2VyaWFsaXplKGZpZWxkcywgZW5jb2RpbmcpXG4gICAgdGhpcy5wcm9wb3NlckFkZHJlc3MgPSBzZXJpYWxpemF0aW9uLmRlY29kZXIoXG4gICAgICBmaWVsZHNbXCJwcm9wb3NlckFkZHJlc3NcIl0sXG4gICAgICBlbmNvZGluZyxcbiAgICAgIFwiY2I1OFwiLFxuICAgICAgXCJCdWZmZXJcIixcbiAgICAgIDIwXG4gICAgKVxuICAgIHRoaXMucHJvcG9zZXJBdXRoLmRlc2VyaWFsaXplKGZpZWxkc1tcInByb3Bvc2VyQXV0aFwiXSwgZW5jb2RpbmcpXG4gICAgdGhpcy5wcm9wb3NhbFBheWxvYWQuZGVzZXJpYWxpemUoZmllbGRzLCBlbmNvZGluZylcbiAgICB0aGlzLnByb3Bvc2FsRGVzY3JpcHRpb24gPSBzZXJpYWxpemF0aW9uLmRlY29kZXIoXG4gICAgICBmaWVsZHNbXCJwcm9wb3NhbERlc2NyaXB0aW9uXCJdLFxuICAgICAgZW5jb2RpbmcsXG4gICAgICBcImhleFwiLFxuICAgICAgXCJCdWZmZXJcIlxuICAgIClcbiAgfVxuXG4gIHByb3RlY3RlZCB1cGdyYWRlVmVyc2lvbklEID0gbmV3IFVwZ3JhZGVWZXJzaW9uSUQoKVxuICBwcm90ZWN0ZWQgcHJvcG9zYWxQYXlsb2FkOiBQcm9wb3NhbFdyYXBwZXJcbiAgcHJvdGVjdGVkIHByb3Bvc2VyQWRkcmVzcyA9IEJ1ZmZlci5hbGxvYygyMClcbiAgcHJvdGVjdGVkIHByb3Bvc2VyQXV0aDogU3VibmV0QXV0aFxuICBwcm90ZWN0ZWQgcHJvcG9zYWxEZXNjcmlwdGlvbjogQnVmZmVyXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBpZCBvZiB0aGUgW1tBZGRQcm9wb3NhbFR4XV1cbiAgICovXG4gIGdldFR4VHlwZSgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl90eXBlSURcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBwcm9wb3NhbCBwYXlsb2FkXG4gICAqL1xuICBnZXRQcm9wb3NhbFBheWxvYWQoKTogUHJvcG9zYWxXcmFwcGVyIHtcbiAgICByZXR1cm4gdGhpcy5wcm9wb3NhbFBheWxvYWRcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBwcm9wb3NlciBhZGRyZXNzXG4gICAqL1xuICBnZXRQcm9wb3NlckFkZHJlc3MoKTogQnVmZmVyIHtcbiAgICByZXR1cm4gdGhpcy5wcm9wb3NlckFkZHJlc3NcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBwcm9wb3NlciBhdXRoXG4gICAqL1xuICBnZXRQcm9wb3NlckF1dGgoKTogU3VibmV0QXV0aCB7XG4gICAgcmV0dXJuIHRoaXMucHJvcG9zZXJBdXRoXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgcHJvcG9zYWwgZGVzY3JpcHRpb25cbiAgICovXG4gIGdldFByb3Bvc2FsRGVzY3JpcHRpb24oKTogQnVmZmVyIHtcbiAgICByZXR1cm4gdGhpcy5wcm9wb3NhbERlc2NyaXB0aW9uXG4gIH1cblxuICAvKipcbiAgICogVGFrZXMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBjb250YWluaW5nIGFuIFtbQWRkUHJvcG9zYWxUeF1dLCBwYXJzZXMgaXQsIHBvcHVsYXRlcyB0aGUgY2xhc3MsIGFuZCByZXR1cm5zIHRoZSBsZW5ndGggb2YgdGhlIFtbQWRkUHJvcG9zYWxUeF1dIGluIGJ5dGVzLlxuICAgKlxuICAgKiBAcGFyYW0gYnl0ZXMgQSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBjb250YWluaW5nIGEgcmF3IFtbQWRkUHJvcG9zYWxUeF1dXG4gICAqXG4gICAqIEByZXR1cm5zIFRoZSBsZW5ndGggb2YgdGhlIHJhdyBbW0FkZFByb3Bvc2FsVHhdXVxuICAgKlxuICAgKiBAcmVtYXJrcyBhc3N1bWUgbm90LWNoZWNrc3VtbWVkXG4gICAqL1xuICBmcm9tQnVmZmVyKGJ5dGVzOiBCdWZmZXIsIG9mZnNldDogbnVtYmVyID0gMCk6IG51bWJlciB7XG4gICAgb2Zmc2V0ID0gc3VwZXIuZnJvbUJ1ZmZlcihieXRlcywgb2Zmc2V0KVxuICAgIHRoaXMudXBncmFkZVZlcnNpb25JRCA9IG5ldyBVcGdyYWRlVmVyc2lvbklEKClcbiAgICBvZmZzZXQgPSB0aGlzLnVwZ3JhZGVWZXJzaW9uSUQuZnJvbUJ1ZmZlcihieXRlcywgb2Zmc2V0KVxuICAgIGNvbnN0IGRlc2NyaXB0aW9uTGVuZ3RoID0gYmludG9vbHNcbiAgICAgIC5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyA0KVxuICAgICAgLnJlYWRVSW50MzJCRSgwKVxuICAgIG9mZnNldCArPSA0XG4gICAgdGhpcy5wcm9wb3NhbERlc2NyaXB0aW9uID0gYmludG9vbHMuY29weUZyb20oXG4gICAgICBieXRlcyxcbiAgICAgIG9mZnNldCxcbiAgICAgIG9mZnNldCArIGRlc2NyaXB0aW9uTGVuZ3RoXG4gICAgKVxuICAgIG9mZnNldCArPSBkZXNjcmlwdGlvbkxlbmd0aFxuICAgIGNvbnN0IHBheWxvYWRTaXplID0gYmludG9vbHNcbiAgICAgIC5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyA0KVxuICAgICAgLnJlYWRVSW50MzJCRSgwKVxuICAgIG9mZnNldCArPSA0XG5cbiAgICBjb25zdCBwcm9wb3NhbFdyYXBwZXIgPSBuZXcgUHJvcG9zYWxXcmFwcGVyKClcbiAgICBvZmZzZXQgPSBwcm9wb3NhbFdyYXBwZXIuZnJvbUJ1ZmZlcihieXRlcywgb2Zmc2V0KVxuICAgIHRoaXMucHJvcG9zYWxQYXlsb2FkID0gcHJvcG9zYWxXcmFwcGVyXG5cbiAgICB0aGlzLnByb3Bvc2VyQWRkcmVzcyA9IGJpbnRvb2xzLmNvcHlGcm9tKGJ5dGVzLCBvZmZzZXQsIG9mZnNldCArIDIwKVxuICAgIG9mZnNldCArPSAyMFxuICAgIGxldCBzYTogU3VibmV0QXV0aCA9IG5ldyBTdWJuZXRBdXRoKClcbiAgICBvZmZzZXQgKz0gc2EuZnJvbUJ1ZmZlcihiaW50b29scy5jb3B5RnJvbShieXRlcywgb2Zmc2V0KSlcbiAgICB0aGlzLnByb3Bvc2VyQXV0aCA9IHNhXG4gICAgcmV0dXJuIG9mZnNldFxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSByZXByZXNlbnRhdGlvbiBvZiB0aGUgW1tBZGRQcm9wb3NhbFR4XV0uXG4gICAqL1xuICB0b0J1ZmZlcigpOiBCdWZmZXIge1xuICAgIGNvbnN0IHN1cGVyYnVmZjogQnVmZmVyID0gc3VwZXIudG9CdWZmZXIoKVxuICAgIGNvbnN0IHVwZ3JhZGVCdWYgPSB0aGlzLnVwZ3JhZGVWZXJzaW9uSUQudG9CdWZmZXIoKVxuXG4gICAgbGV0IGJzaXplOiBudW1iZXIgPSB1cGdyYWRlQnVmLmxlbmd0aCArIHN1cGVyYnVmZi5sZW5ndGhcbiAgICBjb25zdCBiYXJyOiBCdWZmZXJbXSA9IFt1cGdyYWRlQnVmLCBzdXBlcmJ1ZmZdXG5cbiAgICAvLyBwcm9wb3NhbCBkZXNjcmlwdGlvblxuICAgIGNvbnN0IGRlc2NyaXB0aW9uU2l6ZTogQnVmZmVyID0gQnVmZmVyLmFsbG9jKDQpXG4gICAgZGVzY3JpcHRpb25TaXplLndyaXRlVUludDMyQkUodGhpcy5wcm9wb3NhbERlc2NyaXB0aW9uLmxlbmd0aCwgMClcbiAgICBiYXJyLnB1c2goZGVzY3JpcHRpb25TaXplKVxuICAgIGJzaXplICs9IGRlc2NyaXB0aW9uU2l6ZS5sZW5ndGhcblxuICAgIGJhcnIucHVzaCh0aGlzLnByb3Bvc2FsRGVzY3JpcHRpb24pXG4gICAgYnNpemUgKz0gdGhpcy5wcm9wb3NhbERlc2NyaXB0aW9uLmxlbmd0aFxuXG4gICAgLy8gcGF5bG9hZFxuICAgIGNvbnN0IHBheWxvYWRCdWZmZXIgPSB0aGlzLnByb3Bvc2FsUGF5bG9hZC50b0J1ZmZlcigpXG4gICAgY29uc3QgcGF5bG9hZFNpemUgPSBCdWZmZXIuYWxsb2MoNClcbiAgICBwYXlsb2FkU2l6ZS53cml0ZVVJbnQzMkJFKHBheWxvYWRCdWZmZXIubGVuZ3RoLCAwKVxuICAgIGJhcnIucHVzaChwYXlsb2FkU2l6ZSlcbiAgICBic2l6ZSArPSBwYXlsb2FkU2l6ZS5sZW5ndGhcblxuICAgIGJhcnIucHVzaChwYXlsb2FkQnVmZmVyKVxuICAgIGJzaXplICs9IHBheWxvYWRCdWZmZXIubGVuZ3RoXG5cbiAgICAvLyBwcm9wb3NlciBhZGRyZXNzXG4gICAgYmFyci5wdXNoKHRoaXMucHJvcG9zZXJBZGRyZXNzKVxuICAgIGJzaXplICs9IDIwXG5cbiAgICAvLyBwcm9wb3NlciBhdXRoXG4gICAgY29uc3QgYXV0aEJ1ZmZlciA9IHRoaXMucHJvcG9zZXJBdXRoLnRvQnVmZmVyKClcbiAgICBic2l6ZSArPSBhdXRoQnVmZmVyLmxlbmd0aFxuICAgIGJhcnIucHVzaChhdXRoQnVmZmVyKVxuXG4gICAgcmV0dXJuIEJ1ZmZlci5jb25jYXQoYmFyciwgYnNpemUpXG4gIH1cblxuICAvKipcbiAgICogVGFrZXMgdGhlIGJ5dGVzIG9mIGFuIFtbVW5zaWduZWRUeF1dIGFuZCByZXR1cm5zIGFuIGFycmF5IG9mIFtbQ3JlZGVudGlhbF1dc1xuICAgKlxuICAgKiBAcGFyYW0gbXNnIEEgQnVmZmVyIGZvciB0aGUgW1tVbnNpZ25lZFR4XV1cbiAgICogQHBhcmFtIGtjIEEgW1tLZXlDaGFpbl1dIHVzZWQgaW4gc2lnbmluZ1xuICAgKlxuICAgKiBAcmV0dXJucyBBbiBhcnJheSBvZiBbW0NyZWRlbnRpYWxdXXNcbiAgICovXG4gIHNpZ24obXNnOiBCdWZmZXIsIGtjOiBLZXlDaGFpbik6IENyZWRlbnRpYWxbXSB7XG4gICAgY29uc3QgY3JlZHM6IENyZWRlbnRpYWxbXSA9IHN1cGVyLnNpZ24obXNnLCBrYylcbiAgICAvLyBQcm9wb3NlclxuICAgIGNvbnN0IGNyZWQ6IENyZWRlbnRpYWwgPSBTZWxlY3RDcmVkZW50aWFsQ2xhc3MoXG4gICAgICBQbGF0Zm9ybVZNQ29uc3RhbnRzLlNFQ1BDUkVERU5USUFMXG4gICAgKVxuICAgIGNvbnN0IGtleXBhaXI6IEtleVBhaXIgPSBrYy5nZXRLZXkodGhpcy5wcm9wb3NlckFkZHJlc3MpXG4gICAgY29uc3Qgc2lnbnZhbDogQnVmZmVyID0ga2V5cGFpci5zaWduKG1zZylcbiAgICBjb25zdCBzaWc6IFNpZ25hdHVyZSA9IG5ldyBTaWduYXR1cmUoKVxuICAgIHNpZy5mcm9tQnVmZmVyKHNpZ252YWwpXG4gICAgY3JlZC5hZGRTaWduYXR1cmUoc2lnKVxuICAgIGNyZWRzLnB1c2goY3JlZClcblxuICAgIHJldHVybiBjcmVkc1xuICB9XG5cbiAgLyoqXG4gICAqIENsYXNzIHJlcHJlc2VudGluZyBhbiB1bnNpZ25lZCBSZWdpc3Rlck5vZGUgdHJhbnNhY3Rpb24uXG4gICAqXG4gICAqIEBwYXJhbSBuZXR3b3JrSUQgT3B0aW9uYWwgbmV0d29ya0lELCBbW0RlZmF1bHROZXR3b3JrSURdXVxuICAgKiBAcGFyYW0gYmxvY2tjaGFpbklEIE9wdGlvbmFsIGJsb2NrY2hhaW5JRCwgZGVmYXVsdCBCdWZmZXIuYWxsb2MoMzIsIDE2KVxuICAgKiBAcGFyYW0gb3V0cyBPcHRpb25hbCBhcnJheSBvZiB0aGUgW1tUcmFuc2ZlcmFibGVPdXRwdXRdXXNcbiAgICogQHBhcmFtIGlucyBPcHRpb25hbCBhcnJheSBvZiB0aGUgW1tUcmFuc2ZlcmFibGVJbnB1dF1dc1xuICAgKiBAcGFyYW0gbWVtbyBPcHRpb25hbCB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBmb3IgdGhlIG1lbW8gZmllbGRcbiAgICogQHBhcmFtIHByb3Bvc2FsRGVzY3JpcHRpb24gT3B0aW9uYWwgY29udGFpbnMgYXJiaXRyYXJ5IGJ5dGVzLCB1cCB0byAyNTYgYnl0ZXNcbiAgICogQHBhcmFtIHByb3Bvc2FsIHRoZSBwcm9wb3NhbCBwYXlsb2FkIHRvIGNyZWF0ZS5cbiAgICogQHBhcmFtIHByb3Bvc2VyQWRkcmVzcyB0aGUgY3JlYXRlcihwcm9wb3NlcikgYWRkcmVzcy5cbiAgICogQHBhcmFtIHByb3Bvc2VyQXV0aCBhdXRoIHRoYXQgYWxsb3dzIHRvIGNyZWF0ZSBhIHByb3Bvc2FsLlxuICAgKi9cbiAgY29uc3RydWN0b3IoXG4gICAgdmVyc2lvbjogbnVtYmVyID0gRGVmYXVsdFRyYW5zYWN0aW9uVmVyc2lvbk51bWJlcixcbiAgICBuZXR3b3JrSUQ6IG51bWJlciA9IERlZmF1bHROZXR3b3JrSUQsXG4gICAgYmxvY2tjaGFpbklEOiBCdWZmZXIgPSBCdWZmZXIuYWxsb2MoMzIsIDE2KSxcbiAgICBvdXRzOiBUcmFuc2ZlcmFibGVPdXRwdXRbXSA9IHVuZGVmaW5lZCxcbiAgICBpbnM6IFRyYW5zZmVyYWJsZUlucHV0W10gPSB1bmRlZmluZWQsXG4gICAgbWVtbzogQnVmZmVyID0gdW5kZWZpbmVkLFxuICAgIHByb3Bvc2FsRGVzY3JpcHRpb246IEJ1ZmZlciA9IEJ1ZmZlci5hbGxvYygwKSxcbiAgICBwcm9wb3NhbDogUHJvcG9zYWwgPSB1bmRlZmluZWQsXG4gICAgcHJvcG9zZXJBZGRyZXNzOiBzdHJpbmcgfCBCdWZmZXIgPSB1bmRlZmluZWQsXG4gICAgcHJvcG9zZXJBdXRoOiBTdWJuZXRBdXRoID0gdW5kZWZpbmVkXG4gICkge1xuICAgIHN1cGVyKG5ldHdvcmtJRCwgYmxvY2tjaGFpbklELCBvdXRzLCBpbnMsIG1lbW8pXG4gICAgdGhpcy51cGdyYWRlVmVyc2lvbklEID0gbmV3IFVwZ3JhZGVWZXJzaW9uSUQodmVyc2lvbilcbiAgICBpZiAodHlwZW9mIHByb3Bvc2VyQWRkcmVzcyA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgdGhpcy5wcm9wb3NlckFkZHJlc3MgPSBiaW50b29scy5zdHJpbmdUb0FkZHJlc3MocHJvcG9zZXJBZGRyZXNzKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnByb3Bvc2VyQWRkcmVzcyA9IHByb3Bvc2VyQWRkcmVzc1xuICAgIH1cblxuICAgIHRoaXMucHJvcG9zYWxQYXlsb2FkID0gbmV3IFByb3Bvc2FsV3JhcHBlcihwcm9wb3NhbClcbiAgICB0aGlzLnByb3Bvc2FsRGVzY3JpcHRpb24gPSBwcm9wb3NhbERlc2NyaXB0aW9uXG4gICAgaWYgKHByb3Bvc2VyQXV0aCkge1xuICAgICAgdGhpcy5wcm9wb3NlckF1dGggPSBwcm9wb3NlckF1dGhcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5wcm9wb3NlckF1dGggPSBuZXcgU3VibmV0QXV0aCgpXG4gICAgfVxuICB9XG59XG4iXX0=
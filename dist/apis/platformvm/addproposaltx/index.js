"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddProposalTx = exports.ProposalWrapper = exports.DEFAULT_CAMINOGO_CODEC_VERSION = exports.GeneralProposal = exports.ExcludeMemberProposal = exports.BaseFeeProposal = exports.AdminProposal = exports.AddMemberProposal = void 0;
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
const generalproposal_1 = require("./generalproposal");
Object.defineProperty(exports, "GeneralProposal", { enumerable: true, get: function () { return generalproposal_1.GeneralProposal; } });
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
            case constants_2.PlatformVMConstants.GENERALPROPOSAL_TYPE_ID:
                proposal = new generalproposal_1.GeneralProposal();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvYXBpcy9wbGF0Zm9ybXZtL2FkZHByb3Bvc2FsdHgvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7OztHQUdHO0FBQ0gsb0NBQWdDO0FBQ2hDLDRDQUF5RTtBQUN6RSx1RUFBOEM7QUFDOUMsd0RBR2lDO0FBQ2pDLGdFQUFnRjtBQUNoRixzQ0FBa0M7QUFDbEMsNENBQWtEO0FBQ2xELGdEQUFzRDtBQUl0RCw4Q0FBMEM7QUFDMUMsMkRBQXVEO0FBWXJELGtHQVpPLHFDQUFpQixPQVlQO0FBWG5CLG1EQUErQztBQVk3Qyw4RkFaTyw2QkFBYSxPQVlQO0FBWGYsdURBQW1EO0FBWWpELGdHQVpPLGlDQUFlLE9BWVA7QUFYakIsbUVBQStEO0FBWTdELHNHQVpPLDZDQUFxQixPQVlQO0FBWHZCLHVEQUFtRDtBQVlqRCxnR0FaTyxpQ0FBZSxPQVlQO0FBWGpCOztHQUVHO0FBQ0gsTUFBTSxRQUFRLEdBQWEsa0JBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtBQUNqRCxNQUFNLGFBQWEsR0FBa0IsNkJBQWEsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtBQVNuRCxRQUFBLDhCQUE4QixHQUFHLENBQUMsQ0FBQTtBQU8vQyxNQUFhLGVBQWU7SUFJMUIsWUFBWSxRQUFtQjtRQUM3QixJQUFJLFFBQVEsRUFBRTtZQUNaLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFBO1lBQ3hCLElBQUksQ0FBQyxPQUFPLEdBQUcsUUFBUSxDQUFDLFNBQVMsRUFBRSxDQUFBO1NBQ3BDO0lBQ0gsQ0FBQztJQUVELFNBQVMsQ0FBQyxXQUErQixLQUFLO1FBQzVDLE9BQU87WUFDTCxRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDO1NBQzVDLENBQUE7SUFDSCxDQUFDO0lBRUQsV0FBVyxDQUFDLE1BQWMsRUFBRSxXQUErQixLQUFLO1FB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LENBQUMsZUFBZSxHQUFHLGVBQWUsQ0FBQTtTQUN2QztRQUVELElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxlQUFlLENBQUMsUUFBUSxDQUFDLENBQUE7UUFDcEQsSUFBSSxDQUFDLG1CQUFtQixHQUFHLG1CQUFtQixDQUFBO1FBQzlDLElBQUksWUFBWSxFQUFFO1lBQ2hCLElBQUksQ0FBQyxZQUFZLEdBQUcsWUFBWSxDQUFBO1NBQ2pDO2FBQU07WUFDTCxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksdUJBQVUsRUFBRSxDQUFBO1NBQ3JDO0lBQ0gsQ0FBQztDQUNGO0FBck9ELHNDQXFPQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQHBhY2thZ2VEb2N1bWVudGF0aW9uXG4gKiBAbW9kdWxlIEFQSS1QbGF0Zm9ybVZNLUFkZFByb3Bvc2FsVHhcbiAqL1xuaW1wb3J0IHsgQnVmZmVyIH0gZnJvbSBcImJ1ZmZlci9cIlxuaW1wb3J0IHsgQ3JlZGVudGlhbCwgU2lnbmF0dXJlLCBVcGdyYWRlVmVyc2lvbklEIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vblwiXG5pbXBvcnQgQmluVG9vbHMgZnJvbSBcIi4uLy4uLy4uL3V0aWxzL2JpbnRvb2xzXCJcbmltcG9ydCB7XG4gIERlZmF1bHROZXR3b3JrSUQsXG4gIERlZmF1bHRUcmFuc2FjdGlvblZlcnNpb25OdW1iZXJcbn0gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL2NvbnN0YW50c1wiXG5pbXBvcnQgeyBTZXJpYWxpemF0aW9uLCBTZXJpYWxpemVkRW5jb2RpbmcgfSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvc2VyaWFsaXphdGlvblwiXG5pbXBvcnQgeyBCYXNlVHggfSBmcm9tIFwiLi4vYmFzZXR4XCJcbmltcG9ydCB7IFBsYXRmb3JtVk1Db25zdGFudHMgfSBmcm9tIFwiLi4vY29uc3RhbnRzXCJcbmltcG9ydCB7IFNlbGVjdENyZWRlbnRpYWxDbGFzcyB9IGZyb20gXCIuLi9jcmVkZW50aWFsc1wiXG5pbXBvcnQgeyBUcmFuc2ZlcmFibGVJbnB1dCB9IGZyb20gXCIuLi9pbnB1dHNcIlxuaW1wb3J0IHsgS2V5Q2hhaW4sIEtleVBhaXIgfSBmcm9tIFwiLi4va2V5Y2hhaW5cIlxuaW1wb3J0IHsgVHJhbnNmZXJhYmxlT3V0cHV0IH0gZnJvbSBcIi4uL291dHB1dHNcIlxuaW1wb3J0IHsgU3VibmV0QXV0aCB9IGZyb20gXCIuLi9zdWJuZXRhdXRoXCJcbmltcG9ydCB7IEFkZE1lbWJlclByb3Bvc2FsIH0gZnJvbSBcIi4vYWRkbWVtYmVycHJvcG9zYWxcIlxuaW1wb3J0IHsgQWRtaW5Qcm9wb3NhbCB9IGZyb20gXCIuL2FkbWlucHJvcG9zYWxcIlxuaW1wb3J0IHsgQmFzZUZlZVByb3Bvc2FsIH0gZnJvbSBcIi4vYmFzZWZlZXByb3Bvc2FsXCJcbmltcG9ydCB7IEV4Y2x1ZGVNZW1iZXJQcm9wb3NhbCB9IGZyb20gXCIuL2V4Y2x1ZGVtZW1iZXJwcm9wb3NhbFwiXG5pbXBvcnQgeyBHZW5lcmFsUHJvcG9zYWwgfSBmcm9tIFwiLi9nZW5lcmFscHJvcG9zYWxcIlxuLyoqXG4gKiBAaWdub3JlXG4gKi9cbmNvbnN0IGJpbnRvb2xzOiBCaW5Ub29scyA9IEJpblRvb2xzLmdldEluc3RhbmNlKClcbmNvbnN0IHNlcmlhbGl6YXRpb246IFNlcmlhbGl6YXRpb24gPSBTZXJpYWxpemF0aW9uLmdldEluc3RhbmNlKClcblxuZXhwb3J0IHtcbiAgQWRkTWVtYmVyUHJvcG9zYWwsXG4gIEFkbWluUHJvcG9zYWwsXG4gIEJhc2VGZWVQcm9wb3NhbCxcbiAgRXhjbHVkZU1lbWJlclByb3Bvc2FsLFxuICBHZW5lcmFsUHJvcG9zYWxcbn1cbmV4cG9ydCBjb25zdCBERUZBVUxUX0NBTUlOT0dPX0NPREVDX1ZFUlNJT04gPSAwXG5leHBvcnQgdHlwZSBQcm9wb3NhbCA9XG4gIHwgQmFzZUZlZVByb3Bvc2FsXG4gIHwgQWRkTWVtYmVyUHJvcG9zYWxcbiAgfCBFeGNsdWRlTWVtYmVyUHJvcG9zYWxcbiAgfCBBZG1pblByb3Bvc2FsIC8vIFRPRE86IGV4dGVuZCB0aGlzIGFsaWFzIHR5cGUgZm9yIGZ1cnRoZXIgc3VwcG9ydGVkIHByb3Bvc2FsIHR5cGVzXG4gIHwgR2VuZXJhbFByb3Bvc2FsXG5leHBvcnQgY2xhc3MgUHJvcG9zYWxXcmFwcGVyIHtcbiAgcHJpdmF0ZSBfdHlwZUlEOiBudW1iZXJcbiAgcHJpdmF0ZSBwcm9wb3NhbDogUHJvcG9zYWxcblxuICBjb25zdHJ1Y3Rvcihwcm9wb3NhbD86IFByb3Bvc2FsKSB7XG4gICAgaWYgKHByb3Bvc2FsKSB7XG4gICAgICB0aGlzLnByb3Bvc2FsID0gcHJvcG9zYWxcbiAgICAgIHRoaXMuX3R5cGVJRCA9IHByb3Bvc2FsLmdldFR5cGVJRCgpXG4gICAgfVxuICB9XG5cbiAgc2VyaWFsaXplKGVuY29kaW5nOiBTZXJpYWxpemVkRW5jb2RpbmcgPSBcImhleFwiKTogb2JqZWN0IHtcbiAgICByZXR1cm4ge1xuICAgICAgcHJvcG9zYWw6IHRoaXMucHJvcG9zYWwuc2VyaWFsaXplKGVuY29kaW5nKVxuICAgIH1cbiAgfVxuXG4gIGRlc2VyaWFsaXplKGZpZWxkczogb2JqZWN0LCBlbmNvZGluZzogU2VyaWFsaXplZEVuY29kaW5nID0gXCJoZXhcIik6IHRoaXMge1xuICAgIHRoaXMucHJvcG9zYWwgPSB0aGlzLnByb3Bvc2FsLmRlc2VyaWFsaXplKGZpZWxkcywgZW5jb2RpbmcpXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIGdldFByb3Bvc2FsVHlwZSgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl90eXBlSURcbiAgfVxuXG4gIGdldFByb3Bvc2FsKCk6IFByb3Bvc2FsIHtcbiAgICByZXR1cm4gdGhpcy5wcm9wb3NhbFxuICB9XG5cbiAgZnJvbUJ1ZmZlcihieXRlczogQnVmZmVyLCBvZmZzZXQ6IG51bWJlciA9IDApOiBudW1iZXIge1xuICAgIGNvbnN0IGNvZGVjVmVyc2lvbiA9IGJpbnRvb2xzXG4gICAgICAuY29weUZyb20oYnl0ZXMsIG9mZnNldCwgb2Zmc2V0ICsgMilcbiAgICAgIC5yZWFkVUludDE2QkUoMClcbiAgICBvZmZzZXQgKz0gMlxuICAgIGxldCBwcm9wb3NhbCA9IG51bGxcbiAgICB0aGlzLl90eXBlSUQgPSBiaW50b29scy5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyA0KS5yZWFkVUludDMyQkUoMClcbiAgICBvZmZzZXQgKz0gNFxuICAgIHN3aXRjaCAodGhpcy5fdHlwZUlEKSB7XG4gICAgICBjYXNlIFBsYXRmb3JtVk1Db25zdGFudHMuQkFTRUZFRVBPUlBPU0FMX1RZUEVfSUQ6XG4gICAgICAgIHByb3Bvc2FsID0gbmV3IEJhc2VGZWVQcm9wb3NhbCgpXG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlIFBsYXRmb3JtVk1Db25zdGFudHMuQURETUVNQkVSUE9SUE9TQUxfVFlQRV9JRDpcbiAgICAgICAgcHJvcG9zYWwgPSBuZXcgQWRkTWVtYmVyUHJvcG9zYWwoKVxuICAgICAgICBicmVha1xuICAgICAgY2FzZSBQbGF0Zm9ybVZNQ29uc3RhbnRzLkVYQ0xVREVNRU1CRVJQT1JQT1NBTF9UWVBFX0lEOlxuICAgICAgICBwcm9wb3NhbCA9IG5ldyBFeGNsdWRlTWVtYmVyUHJvcG9zYWwoKVxuICAgICAgICBicmVha1xuICAgICAgY2FzZSBQbGF0Zm9ybVZNQ29uc3RhbnRzLkFETUlOUFJPUE9TQUxfVFlQRV9JRDpcbiAgICAgICAgcHJvcG9zYWwgPSBuZXcgQWRtaW5Qcm9wb3NhbCgpXG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlIFBsYXRmb3JtVk1Db25zdGFudHMuR0VORVJBTFBST1BPU0FMX1RZUEVfSUQ6XG4gICAgICAgIHByb3Bvc2FsID0gbmV3IEdlbmVyYWxQcm9wb3NhbCgpXG4gICAgICAgIGJyZWFrXG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBgVW5zdXBwb3J0ZWQgcHJvcG9zYWwgdHlwZTogJHt0aGlzLl90eXBlSUR9YFxuICAgIH1cbiAgICBvZmZzZXQgPSBwcm9wb3NhbC5mcm9tQnVmZmVyKGJ5dGVzLCBvZmZzZXQpXG4gICAgdGhpcy5wcm9wb3NhbCA9IHByb3Bvc2FsXG4gICAgcmV0dXJuIG9mZnNldFxuICB9XG5cbiAgdG9CdWZmZXIoKTogQnVmZmVyIHtcbiAgICBjb25zdCBjb2RlY1ZlcnNpb24gPSBCdWZmZXIuYWxsb2MoMilcbiAgICBjb2RlY1ZlcnNpb24ud3JpdGVVSW50OChERUZBVUxUX0NBTUlOT0dPX0NPREVDX1ZFUlNJT04sIDApXG4gICAgY29uc3QgdHlwZUlkID0gQnVmZmVyLmFsbG9jKDQpXG4gICAgdHlwZUlkLndyaXRlVUludDMyQkUodGhpcy5fdHlwZUlELCAwKVxuICAgIGNvbnN0IGJ1ZmYgPSB0aGlzLnByb3Bvc2FsLnRvQnVmZmVyKClcbiAgICByZXR1cm4gQnVmZmVyLmNvbmNhdChcbiAgICAgIFtjb2RlY1ZlcnNpb24sIHR5cGVJZCwgYnVmZl0sXG4gICAgICAyICsgdHlwZUlkLmxlbmd0aCArIGJ1ZmYubGVuZ3RoXG4gICAgKVxuICB9XG59XG4vKipcbiAqIENsYXNzIHJlcHJlc2VudGluZyBhbiB1bnNpZ25lZCBBZGRQcm9wb3NhbFR4IHRyYW5zYWN0aW9uLlxuICovXG5leHBvcnQgY2xhc3MgQWRkUHJvcG9zYWxUeCBleHRlbmRzIEJhc2VUeCB7XG4gIHByb3RlY3RlZCBfdHlwZU5hbWUgPSBcIkFkZFByb3Bvc2FsVHhcIlxuICBwcm90ZWN0ZWQgX3R5cGVJRCA9IFBsYXRmb3JtVk1Db25zdGFudHMuQUREUFJPUE9TQUxUWFxuXG4gIHNlcmlhbGl6ZShlbmNvZGluZzogU2VyaWFsaXplZEVuY29kaW5nID0gXCJoZXhcIik6IG9iamVjdCB7XG4gICAgbGV0IGZpZWxkczogb2JqZWN0ID0gc3VwZXIuc2VyaWFsaXplKGVuY29kaW5nKVxuICAgIHJldHVybiB7XG4gICAgICAuLi5maWVsZHMsXG4gICAgICBwcm9wb3NlckFkZHJlc3M6IHNlcmlhbGl6YXRpb24uZW5jb2RlcihcbiAgICAgICAgdGhpcy5wcm9wb3NlckFkZHJlc3MsXG4gICAgICAgIGVuY29kaW5nLFxuICAgICAgICBcIkJ1ZmZlclwiLFxuICAgICAgICBcImNiNThcIlxuICAgICAgKSxcbiAgICAgIHByb3Bvc2FsRGVzY3JpcHRpb246IHNlcmlhbGl6YXRpb24uZW5jb2RlcihcbiAgICAgICAgdGhpcy5wcm9wb3NhbERlc2NyaXB0aW9uLFxuICAgICAgICBlbmNvZGluZyxcbiAgICAgICAgXCJCdWZmZXJcIixcbiAgICAgICAgXCJoZXhcIlxuICAgICAgKSxcbiAgICAgIHByb3Bvc2VyQXV0aDogdGhpcy5wcm9wb3NlckF1dGguc2VyaWFsaXplKGVuY29kaW5nKSxcbiAgICAgIHByb3Bvc2FsUGF5bG9hZDogdGhpcy5wcm9wb3NhbFBheWxvYWQuc2VyaWFsaXplKGVuY29kaW5nKVxuICAgIH1cbiAgfVxuICBkZXNlcmlhbGl6ZShmaWVsZHM6IG9iamVjdCwgZW5jb2Rpbmc6IFNlcmlhbGl6ZWRFbmNvZGluZyA9IFwiaGV4XCIpIHtcbiAgICBzdXBlci5kZXNlcmlhbGl6ZShmaWVsZHMsIGVuY29kaW5nKVxuICAgIHRoaXMucHJvcG9zZXJBZGRyZXNzID0gc2VyaWFsaXphdGlvbi5kZWNvZGVyKFxuICAgICAgZmllbGRzW1wicHJvcG9zZXJBZGRyZXNzXCJdLFxuICAgICAgZW5jb2RpbmcsXG4gICAgICBcImNiNThcIixcbiAgICAgIFwiQnVmZmVyXCIsXG4gICAgICAyMFxuICAgIClcbiAgICB0aGlzLnByb3Bvc2VyQXV0aC5kZXNlcmlhbGl6ZShmaWVsZHNbXCJwcm9wb3NlckF1dGhcIl0sIGVuY29kaW5nKVxuICAgIHRoaXMucHJvcG9zYWxQYXlsb2FkLmRlc2VyaWFsaXplKGZpZWxkcywgZW5jb2RpbmcpXG4gICAgdGhpcy5wcm9wb3NhbERlc2NyaXB0aW9uID0gc2VyaWFsaXphdGlvbi5kZWNvZGVyKFxuICAgICAgZmllbGRzW1wicHJvcG9zYWxEZXNjcmlwdGlvblwiXSxcbiAgICAgIGVuY29kaW5nLFxuICAgICAgXCJoZXhcIixcbiAgICAgIFwiQnVmZmVyXCJcbiAgICApXG4gIH1cblxuICBwcm90ZWN0ZWQgdXBncmFkZVZlcnNpb25JRCA9IG5ldyBVcGdyYWRlVmVyc2lvbklEKClcbiAgcHJvdGVjdGVkIHByb3Bvc2FsUGF5bG9hZDogUHJvcG9zYWxXcmFwcGVyXG4gIHByb3RlY3RlZCBwcm9wb3NlckFkZHJlc3MgPSBCdWZmZXIuYWxsb2MoMjApXG4gIHByb3RlY3RlZCBwcm9wb3NlckF1dGg6IFN1Ym5ldEF1dGhcbiAgcHJvdGVjdGVkIHByb3Bvc2FsRGVzY3JpcHRpb246IEJ1ZmZlclxuICAvKipcbiAgICogUmV0dXJucyB0aGUgaWQgb2YgdGhlIFtbQWRkUHJvcG9zYWxUeF1dXG4gICAqL1xuICBnZXRUeFR5cGUoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fdHlwZUlEXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgcHJvcG9zYWwgcGF5bG9hZFxuICAgKi9cbiAgZ2V0UHJvcG9zYWxQYXlsb2FkKCk6IFByb3Bvc2FsV3JhcHBlciB7XG4gICAgcmV0dXJuIHRoaXMucHJvcG9zYWxQYXlsb2FkXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgcHJvcG9zZXIgYWRkcmVzc1xuICAgKi9cbiAgZ2V0UHJvcG9zZXJBZGRyZXNzKCk6IEJ1ZmZlciB7XG4gICAgcmV0dXJuIHRoaXMucHJvcG9zZXJBZGRyZXNzXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgcHJvcG9zZXIgYXV0aFxuICAgKi9cbiAgZ2V0UHJvcG9zZXJBdXRoKCk6IFN1Ym5ldEF1dGgge1xuICAgIHJldHVybiB0aGlzLnByb3Bvc2VyQXV0aFxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHByb3Bvc2FsIGRlc2NyaXB0aW9uXG4gICAqL1xuICBnZXRQcm9wb3NhbERlc2NyaXB0aW9uKCk6IEJ1ZmZlciB7XG4gICAgcmV0dXJuIHRoaXMucHJvcG9zYWxEZXNjcmlwdGlvblxuICB9XG5cbiAgLyoqXG4gICAqIFRha2VzIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gY29udGFpbmluZyBhbiBbW0FkZFByb3Bvc2FsVHhdXSwgcGFyc2VzIGl0LCBwb3B1bGF0ZXMgdGhlIGNsYXNzLCBhbmQgcmV0dXJucyB0aGUgbGVuZ3RoIG9mIHRoZSBbW0FkZFByb3Bvc2FsVHhdXSBpbiBieXRlcy5cbiAgICpcbiAgICogQHBhcmFtIGJ5dGVzIEEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gY29udGFpbmluZyBhIHJhdyBbW0FkZFByb3Bvc2FsVHhdXVxuICAgKlxuICAgKiBAcmV0dXJucyBUaGUgbGVuZ3RoIG9mIHRoZSByYXcgW1tBZGRQcm9wb3NhbFR4XV1cbiAgICpcbiAgICogQHJlbWFya3MgYXNzdW1lIG5vdC1jaGVja3N1bW1lZFxuICAgKi9cbiAgZnJvbUJ1ZmZlcihieXRlczogQnVmZmVyLCBvZmZzZXQ6IG51bWJlciA9IDApOiBudW1iZXIge1xuICAgIG9mZnNldCA9IHN1cGVyLmZyb21CdWZmZXIoYnl0ZXMsIG9mZnNldClcbiAgICB0aGlzLnVwZ3JhZGVWZXJzaW9uSUQgPSBuZXcgVXBncmFkZVZlcnNpb25JRCgpXG4gICAgb2Zmc2V0ID0gdGhpcy51cGdyYWRlVmVyc2lvbklELmZyb21CdWZmZXIoYnl0ZXMsIG9mZnNldClcbiAgICBjb25zdCBkZXNjcmlwdGlvbkxlbmd0aCA9IGJpbnRvb2xzXG4gICAgICAuY29weUZyb20oYnl0ZXMsIG9mZnNldCwgb2Zmc2V0ICsgNClcbiAgICAgIC5yZWFkVUludDMyQkUoMClcbiAgICBvZmZzZXQgKz0gNFxuICAgIHRoaXMucHJvcG9zYWxEZXNjcmlwdGlvbiA9IGJpbnRvb2xzLmNvcHlGcm9tKFxuICAgICAgYnl0ZXMsXG4gICAgICBvZmZzZXQsXG4gICAgICBvZmZzZXQgKyBkZXNjcmlwdGlvbkxlbmd0aFxuICAgIClcbiAgICBvZmZzZXQgKz0gZGVzY3JpcHRpb25MZW5ndGhcbiAgICBjb25zdCBwYXlsb2FkU2l6ZSA9IGJpbnRvb2xzXG4gICAgICAuY29weUZyb20oYnl0ZXMsIG9mZnNldCwgb2Zmc2V0ICsgNClcbiAgICAgIC5yZWFkVUludDMyQkUoMClcbiAgICBvZmZzZXQgKz0gNFxuXG4gICAgY29uc3QgcHJvcG9zYWxXcmFwcGVyID0gbmV3IFByb3Bvc2FsV3JhcHBlcigpXG4gICAgb2Zmc2V0ID0gcHJvcG9zYWxXcmFwcGVyLmZyb21CdWZmZXIoYnl0ZXMsIG9mZnNldClcbiAgICB0aGlzLnByb3Bvc2FsUGF5bG9hZCA9IHByb3Bvc2FsV3JhcHBlclxuXG4gICAgdGhpcy5wcm9wb3NlckFkZHJlc3MgPSBiaW50b29scy5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyAyMClcbiAgICBvZmZzZXQgKz0gMjBcbiAgICBsZXQgc2E6IFN1Ym5ldEF1dGggPSBuZXcgU3VibmV0QXV0aCgpXG4gICAgb2Zmc2V0ICs9IHNhLmZyb21CdWZmZXIoYmludG9vbHMuY29weUZyb20oYnl0ZXMsIG9mZnNldCkpXG4gICAgdGhpcy5wcm9wb3NlckF1dGggPSBzYVxuICAgIHJldHVybiBvZmZzZXRcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gcmVwcmVzZW50YXRpb24gb2YgdGhlIFtbQWRkUHJvcG9zYWxUeF1dLlxuICAgKi9cbiAgdG9CdWZmZXIoKTogQnVmZmVyIHtcbiAgICBjb25zdCBzdXBlcmJ1ZmY6IEJ1ZmZlciA9IHN1cGVyLnRvQnVmZmVyKClcbiAgICBjb25zdCB1cGdyYWRlQnVmID0gdGhpcy51cGdyYWRlVmVyc2lvbklELnRvQnVmZmVyKClcblxuICAgIGxldCBic2l6ZTogbnVtYmVyID0gdXBncmFkZUJ1Zi5sZW5ndGggKyBzdXBlcmJ1ZmYubGVuZ3RoXG4gICAgY29uc3QgYmFycjogQnVmZmVyW10gPSBbdXBncmFkZUJ1Ziwgc3VwZXJidWZmXVxuXG4gICAgLy8gcHJvcG9zYWwgZGVzY3JpcHRpb25cbiAgICBjb25zdCBkZXNjcmlwdGlvblNpemU6IEJ1ZmZlciA9IEJ1ZmZlci5hbGxvYyg0KVxuICAgIGRlc2NyaXB0aW9uU2l6ZS53cml0ZVVJbnQzMkJFKHRoaXMucHJvcG9zYWxEZXNjcmlwdGlvbi5sZW5ndGgsIDApXG4gICAgYmFyci5wdXNoKGRlc2NyaXB0aW9uU2l6ZSlcbiAgICBic2l6ZSArPSBkZXNjcmlwdGlvblNpemUubGVuZ3RoXG5cbiAgICBiYXJyLnB1c2godGhpcy5wcm9wb3NhbERlc2NyaXB0aW9uKVxuICAgIGJzaXplICs9IHRoaXMucHJvcG9zYWxEZXNjcmlwdGlvbi5sZW5ndGhcblxuICAgIC8vIHBheWxvYWRcbiAgICBjb25zdCBwYXlsb2FkQnVmZmVyID0gdGhpcy5wcm9wb3NhbFBheWxvYWQudG9CdWZmZXIoKVxuICAgIGNvbnN0IHBheWxvYWRTaXplID0gQnVmZmVyLmFsbG9jKDQpXG4gICAgcGF5bG9hZFNpemUud3JpdGVVSW50MzJCRShwYXlsb2FkQnVmZmVyLmxlbmd0aCwgMClcbiAgICBiYXJyLnB1c2gocGF5bG9hZFNpemUpXG4gICAgYnNpemUgKz0gcGF5bG9hZFNpemUubGVuZ3RoXG5cbiAgICBiYXJyLnB1c2gocGF5bG9hZEJ1ZmZlcilcbiAgICBic2l6ZSArPSBwYXlsb2FkQnVmZmVyLmxlbmd0aFxuXG4gICAgLy8gcHJvcG9zZXIgYWRkcmVzc1xuICAgIGJhcnIucHVzaCh0aGlzLnByb3Bvc2VyQWRkcmVzcylcbiAgICBic2l6ZSArPSAyMFxuXG4gICAgLy8gcHJvcG9zZXIgYXV0aFxuICAgIGNvbnN0IGF1dGhCdWZmZXIgPSB0aGlzLnByb3Bvc2VyQXV0aC50b0J1ZmZlcigpXG4gICAgYnNpemUgKz0gYXV0aEJ1ZmZlci5sZW5ndGhcbiAgICBiYXJyLnB1c2goYXV0aEJ1ZmZlcilcblxuICAgIHJldHVybiBCdWZmZXIuY29uY2F0KGJhcnIsIGJzaXplKVxuICB9XG5cbiAgLyoqXG4gICAqIFRha2VzIHRoZSBieXRlcyBvZiBhbiBbW1Vuc2lnbmVkVHhdXSBhbmQgcmV0dXJucyBhbiBhcnJheSBvZiBbW0NyZWRlbnRpYWxdXXNcbiAgICpcbiAgICogQHBhcmFtIG1zZyBBIEJ1ZmZlciBmb3IgdGhlIFtbVW5zaWduZWRUeF1dXG4gICAqIEBwYXJhbSBrYyBBIFtbS2V5Q2hhaW5dXSB1c2VkIGluIHNpZ25pbmdcbiAgICpcbiAgICogQHJldHVybnMgQW4gYXJyYXkgb2YgW1tDcmVkZW50aWFsXV1zXG4gICAqL1xuICBzaWduKG1zZzogQnVmZmVyLCBrYzogS2V5Q2hhaW4pOiBDcmVkZW50aWFsW10ge1xuICAgIGNvbnN0IGNyZWRzOiBDcmVkZW50aWFsW10gPSBzdXBlci5zaWduKG1zZywga2MpXG4gICAgLy8gUHJvcG9zZXJcbiAgICBjb25zdCBjcmVkOiBDcmVkZW50aWFsID0gU2VsZWN0Q3JlZGVudGlhbENsYXNzKFxuICAgICAgUGxhdGZvcm1WTUNvbnN0YW50cy5TRUNQQ1JFREVOVElBTFxuICAgIClcbiAgICBjb25zdCBrZXlwYWlyOiBLZXlQYWlyID0ga2MuZ2V0S2V5KHRoaXMucHJvcG9zZXJBZGRyZXNzKVxuICAgIGNvbnN0IHNpZ252YWw6IEJ1ZmZlciA9IGtleXBhaXIuc2lnbihtc2cpXG4gICAgY29uc3Qgc2lnOiBTaWduYXR1cmUgPSBuZXcgU2lnbmF0dXJlKClcbiAgICBzaWcuZnJvbUJ1ZmZlcihzaWdudmFsKVxuICAgIGNyZWQuYWRkU2lnbmF0dXJlKHNpZylcbiAgICBjcmVkcy5wdXNoKGNyZWQpXG5cbiAgICByZXR1cm4gY3JlZHNcbiAgfVxuXG4gIC8qKlxuICAgKiBDbGFzcyByZXByZXNlbnRpbmcgYW4gdW5zaWduZWQgUmVnaXN0ZXJOb2RlIHRyYW5zYWN0aW9uLlxuICAgKlxuICAgKiBAcGFyYW0gbmV0d29ya0lEIE9wdGlvbmFsIG5ldHdvcmtJRCwgW1tEZWZhdWx0TmV0d29ya0lEXV1cbiAgICogQHBhcmFtIGJsb2NrY2hhaW5JRCBPcHRpb25hbCBibG9ja2NoYWluSUQsIGRlZmF1bHQgQnVmZmVyLmFsbG9jKDMyLCAxNilcbiAgICogQHBhcmFtIG91dHMgT3B0aW9uYWwgYXJyYXkgb2YgdGhlIFtbVHJhbnNmZXJhYmxlT3V0cHV0XV1zXG4gICAqIEBwYXJhbSBpbnMgT3B0aW9uYWwgYXJyYXkgb2YgdGhlIFtbVHJhbnNmZXJhYmxlSW5wdXRdXXNcbiAgICogQHBhcmFtIG1lbW8gT3B0aW9uYWwge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gZm9yIHRoZSBtZW1vIGZpZWxkXG4gICAqIEBwYXJhbSBwcm9wb3NhbERlc2NyaXB0aW9uIE9wdGlvbmFsIGNvbnRhaW5zIGFyYml0cmFyeSBieXRlcywgdXAgdG8gMjU2IGJ5dGVzXG4gICAqIEBwYXJhbSBwcm9wb3NhbCB0aGUgcHJvcG9zYWwgcGF5bG9hZCB0byBjcmVhdGUuXG4gICAqIEBwYXJhbSBwcm9wb3NlckFkZHJlc3MgdGhlIGNyZWF0ZXIocHJvcG9zZXIpIGFkZHJlc3MuXG4gICAqIEBwYXJhbSBwcm9wb3NlckF1dGggYXV0aCB0aGF0IGFsbG93cyB0byBjcmVhdGUgYSBwcm9wb3NhbC5cbiAgICovXG4gIGNvbnN0cnVjdG9yKFxuICAgIHZlcnNpb246IG51bWJlciA9IERlZmF1bHRUcmFuc2FjdGlvblZlcnNpb25OdW1iZXIsXG4gICAgbmV0d29ya0lEOiBudW1iZXIgPSBEZWZhdWx0TmV0d29ya0lELFxuICAgIGJsb2NrY2hhaW5JRDogQnVmZmVyID0gQnVmZmVyLmFsbG9jKDMyLCAxNiksXG4gICAgb3V0czogVHJhbnNmZXJhYmxlT3V0cHV0W10gPSB1bmRlZmluZWQsXG4gICAgaW5zOiBUcmFuc2ZlcmFibGVJbnB1dFtdID0gdW5kZWZpbmVkLFxuICAgIG1lbW86IEJ1ZmZlciA9IHVuZGVmaW5lZCxcbiAgICBwcm9wb3NhbERlc2NyaXB0aW9uOiBCdWZmZXIgPSBCdWZmZXIuYWxsb2MoMCksXG4gICAgcHJvcG9zYWw6IFByb3Bvc2FsID0gdW5kZWZpbmVkLFxuICAgIHByb3Bvc2VyQWRkcmVzczogc3RyaW5nIHwgQnVmZmVyID0gdW5kZWZpbmVkLFxuICAgIHByb3Bvc2VyQXV0aDogU3VibmV0QXV0aCA9IHVuZGVmaW5lZFxuICApIHtcbiAgICBzdXBlcihuZXR3b3JrSUQsIGJsb2NrY2hhaW5JRCwgb3V0cywgaW5zLCBtZW1vKVxuICAgIHRoaXMudXBncmFkZVZlcnNpb25JRCA9IG5ldyBVcGdyYWRlVmVyc2lvbklEKHZlcnNpb24pXG4gICAgaWYgKHR5cGVvZiBwcm9wb3NlckFkZHJlc3MgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgIHRoaXMucHJvcG9zZXJBZGRyZXNzID0gYmludG9vbHMuc3RyaW5nVG9BZGRyZXNzKHByb3Bvc2VyQWRkcmVzcylcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5wcm9wb3NlckFkZHJlc3MgPSBwcm9wb3NlckFkZHJlc3NcbiAgICB9XG5cbiAgICB0aGlzLnByb3Bvc2FsUGF5bG9hZCA9IG5ldyBQcm9wb3NhbFdyYXBwZXIocHJvcG9zYWwpXG4gICAgdGhpcy5wcm9wb3NhbERlc2NyaXB0aW9uID0gcHJvcG9zYWxEZXNjcmlwdGlvblxuICAgIGlmIChwcm9wb3NlckF1dGgpIHtcbiAgICAgIHRoaXMucHJvcG9zZXJBdXRoID0gcHJvcG9zZXJBdXRoXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucHJvcG9zZXJBdXRoID0gbmV3IFN1Ym5ldEF1dGgoKVxuICAgIH1cbiAgfVxufVxuIl19
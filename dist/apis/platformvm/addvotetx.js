"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddVoteTx = exports.VoteWrapper = exports.SimpleVote = void 0;
/**
 * @packageDocumentation
 * @module API-PlatformVM-AddVoteTx
 */
const buffer_1 = require("buffer/");
const common_1 = require("../../common");
const bintools_1 = __importDefault(require("../../utils/bintools"));
const constants_1 = require("../../utils/constants");
const serialization_1 = require("../../utils/serialization");
const addproposaltx_1 = require("./addproposaltx");
const basetx_1 = require("./basetx");
const constants_2 = require("./constants");
const credentials_1 = require("./credentials");
const subnetauth_1 = require("./subnetauth");
/**
 * @ignore
 */
const bintools = bintools_1.default.getInstance();
const serialization = serialization_1.Serialization.getInstance();
class SimpleVote {
    constructor(optionIndex) {
        this._typeID = constants_2.PlatformVMConstants.SIMPLEVOTE_TYPE_ID;
        this.optionIndex = buffer_1.Buffer.alloc(4);
        this.optionIndex = optionIndex;
    }
    serialize(encoding = "hex") {
        return {
            optionIndex: serialization.encoder(this.optionIndex, encoding, "Buffer", "number")
        };
    }
    deserialize(fields, encoding = "hex") {
        this.optionIndex = serialization.decoder(fields["optionIndex"], encoding, "number", "Buffer");
        return this;
    }
    getTypeId() {
        return this._typeID;
    }
    getOptionIndex() {
        return this.optionIndex;
    }
}
exports.SimpleVote = SimpleVote;
class VoteWrapper {
    constructor() { }
    serialize(encoding = "hex") {
        return {
            vote: this.vote.serialize(encoding)
        };
    }
    deserialize(fields, encoding = "hex") {
        this.vote = this.vote.deserialize(fields, encoding);
        return this;
    }
    getVote() {
        return this.vote;
    }
    addVote(optionIndex) {
        const optionIndexBuff = buffer_1.Buffer.alloc(4);
        optionIndexBuff.writeUInt32BE(optionIndex, 0);
        this.vote = new SimpleVote(optionIndexBuff);
    }
    fromBuffer(bytes, offset = 0) {
        // Read the number of length of the following bytes
        bintools.copyFrom(bytes, offset, offset + 4).readUInt32BE(0);
        offset += 4;
        // Read the codec version number
        bintools.copyFrom(bytes, offset, offset + 2).readUInt16BE(0);
        offset += 2;
        const voteTypeId = bintools
            .copyFrom(bytes, offset, offset + 4)
            .readUInt32BE(0);
        offset += 4;
        switch (voteTypeId) {
            case constants_2.PlatformVMConstants.SIMPLEVOTE_TYPE_ID:
                this.vote = new SimpleVote(bintools.copyFrom(bytes, offset, offset + 4));
                offset += 4;
                break;
            default:
                throw `Unsupported vote type: ${voteTypeId}`;
        }
        return offset;
    }
    toBuffer() {
        const codecVersion = buffer_1.Buffer.alloc(2);
        codecVersion.writeUInt8(addproposaltx_1.DEFAULT_CAMINOGO_CODEC_VERSION, 0);
        const typeId = buffer_1.Buffer.alloc(4);
        typeId.writeUInt32BE(this.vote.getTypeId(), 0);
        const buff = this.vote.getOptionIndex();
        const totalByteLength = 2 + typeId.length + buff.length;
        const numLength = buffer_1.Buffer.alloc(4);
        numLength.writeUInt32BE(totalByteLength, 0);
        return buffer_1.Buffer.concat([numLength, codecVersion, typeId, buff], numLength.length + totalByteLength);
    }
}
exports.VoteWrapper = VoteWrapper;
/**
 * Class representing an unsigned AddVoteTx transaction.
 */
class AddVoteTx extends basetx_1.BaseTx {
    serialize(encoding = "hex") {
        let fields = super.serialize(encoding);
        return Object.assign(Object.assign({}, fields), { voterAddress: serialization.encoder(this.voterAddress, encoding, "Buffer", "cb58"), voterAuth: this.voterAuth.serialize(encoding), votePayload: this.votePayload.serialize(encoding) });
    }
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        this.voterAddress = serialization.decoder(fields["voterAddress"], encoding, "cb58", "Buffer", 20);
        this.voterAuth.deserialize(fields["voterAuth"], encoding);
        this.votePayload = this.votePayload.deserialize(fields, encoding);
    }
    /**
     * Returns the id of the [[AddVoteTx]]
     */
    getTxType() {
        return this._typeID;
    }
    /**
     * Returns the proposal ID
     */
    getProposalID() {
        return this.proposalID;
    }
    /**
     * Returns the vote payload
     */
    getVotePayload() {
        return this.votePayload;
    }
    /**
     * Returns the voter address
     */
    getVoterAddress() {
        return this.voterAddress;
    }
    /**
     * Returns the voter auth
     */
    getVoterAuth() {
        return this.voterAuth;
    }
    /**
     * Takes a {@link https://github.com/feross/buffer|Buffer} containing an [[AddVoteTx]], parses it, populates the class, and returns the length of the [[AddVoteTx]] in bytes.
     *
     * @param bytes A {@link https://github.com/feross/buffer|Buffer} containing a raw [[AddVoteTx]]
     *
     * @returns The length of the raw [[AddVoteTx]]
     *
     * @remarks assume not-checksummed
     */
    fromBuffer(bytes, offset = 0) {
        offset = super.fromBuffer(bytes, offset);
        this.upgradeVersionID = new common_1.UpgradeVersionID();
        offset = this.upgradeVersionID.fromBuffer(bytes, offset);
        this.proposalID = bintools.copyFrom(bytes, offset, offset + 32);
        offset += 32;
        const voteWrapper = new VoteWrapper();
        offset = voteWrapper.fromBuffer(bytes, offset);
        this.votePayload = voteWrapper;
        this.voterAddress = bintools.copyFrom(bytes, offset, offset + 20);
        offset += 20;
        let sa = new subnetauth_1.SubnetAuth();
        offset += sa.fromBuffer(bintools.copyFrom(bytes, offset));
        this.voterAuth = sa;
        return offset;
    }
    /**
     * Returns a {@link https://github.com/feross/buffer|Buffer} representation of the [[AddVoteTx]].
     */
    toBuffer() {
        let upgradeBuf = this.upgradeVersionID.toBuffer();
        const superbuff = super.toBuffer();
        const payloadBuffer = this.votePayload.toBuffer();
        let bsize = upgradeBuf.length +
            superbuff.length +
            this.proposalID.length +
            payloadBuffer.length;
        const barr = [
            upgradeBuf,
            superbuff,
            this.proposalID,
            payloadBuffer
        ];
        bsize += this.voterAddress.length;
        barr.push(this.voterAddress);
        const authBuffer = this.voterAuth.toBuffer();
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
        // Voter
        const cred = (0, credentials_1.SelectCredentialClass)(constants_2.PlatformVMConstants.SECPCREDENTIAL);
        const keypair = kc.getKey(this.voterAddress);
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
     * @param voteOptionIndex the index of vote option.
     * @param voterAddress the creater(proposer) address.
     * @param voterAuth auth that allows to create a proposal.
     */
    constructor(version = constants_1.DefaultTransactionVersionNumber, networkID = constants_1.DefaultNetworkID, blockchainID = buffer_1.Buffer.alloc(32, 16), outs = undefined, ins = undefined, memo = undefined, proposalID = undefined, voteOptionIndex = undefined, voterAddress = undefined, voterAuth = undefined) {
        super(networkID, blockchainID, outs, ins, memo);
        this._typeName = "AddVoteTx";
        this._typeID = constants_2.PlatformVMConstants.ADDVOTETX;
        this.upgradeVersionID = new common_1.UpgradeVersionID();
        this.proposalID = buffer_1.Buffer.alloc(32);
        this.voterAddress = buffer_1.Buffer.alloc(20);
        this.upgradeVersionID = new common_1.UpgradeVersionID(version);
        if (typeof voterAddress === "string") {
            this.voterAddress = bintools.stringToAddress(voterAddress);
        }
        else {
            this.voterAddress = voterAddress;
        }
        this.proposalID = proposalID;
        this.votePayload = new VoteWrapper();
        this.votePayload.addVote(voteOptionIndex);
        if (voterAuth) {
            this.voterAuth = voterAuth;
        }
        else {
            this.voterAuth = new subnetauth_1.SubnetAuth();
        }
    }
}
exports.AddVoteTx = AddVoteTx;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRkdm90ZXR4LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2FwaXMvcGxhdGZvcm12bS9hZGR2b3RldHgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7OztHQUdHO0FBQ0gsb0NBQWdDO0FBQ2hDLHlDQUFzRTtBQUN0RSxvRUFBMkM7QUFDM0MscURBRzhCO0FBQzlCLDZEQUE2RTtBQUM3RSxtREFBZ0U7QUFDaEUscUNBQWlDO0FBQ2pDLDJDQUFpRDtBQUNqRCwrQ0FBcUQ7QUFJckQsNkNBQXlDO0FBQ3pDOztHQUVHO0FBQ0gsTUFBTSxRQUFRLEdBQWEsa0JBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtBQUNqRCxNQUFNLGFBQWEsR0FBa0IsNkJBQWEsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtBQUVoRSxNQUFhLFVBQVU7SUFJckIsWUFBWSxXQUFtQjtRQUh2QixZQUFPLEdBQVcsK0JBQW1CLENBQUMsa0JBQWtCLENBQUE7UUFDeEQsZ0JBQVcsR0FBRyxlQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBR25DLElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFBO0lBQ2hDLENBQUM7SUFFRCxTQUFTLENBQUMsV0FBK0IsS0FBSztRQUM1QyxPQUFPO1lBQ0wsV0FBVyxFQUFFLGFBQWEsQ0FBQyxPQUFPLENBQ2hDLElBQUksQ0FBQyxXQUFXLEVBQ2hCLFFBQVEsRUFDUixRQUFRLEVBQ1IsUUFBUSxDQUNUO1NBQ0YsQ0FBQTtJQUNILENBQUM7SUFFRCxXQUFXLENBQUMsTUFBYyxFQUFFLFdBQStCLEtBQUs7UUFDOUQsSUFBSSxDQUFDLFdBQVcsR0FBRyxhQUFhLENBQUMsT0FBTyxDQUN0QyxNQUFNLENBQUMsYUFBYSxDQUFDLEVBQ3JCLFFBQVEsRUFDUixRQUFRLEVBQ1IsUUFBUSxDQUNULENBQUE7UUFDRCxPQUFPLElBQUksQ0FBQTtJQUNiLENBQUM7SUFFRCxTQUFTO1FBQ1AsT0FBTyxJQUFJLENB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QUE7UUFDekMsZUFBVSxHQUFHLGVBQU0sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUE7UUFFN0IsaUJBQVksR0FBRyxlQUFNLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBMkt2QyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSx5QkFBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FBQTtRQUNyRCxJQUFJLE9BQU8sWUFBWSxLQUFLLFFBQVEsRUFBRTtZQUNwQyxJQUFJLENBQUMsWUFBWSxHQUFHLFFBQVEsQ0FBQyxlQUFlLENBQUMsWUFBWSxDQUFDLENBQUE7U0FDM0Q7YUFBTTtZQUNMLElBQUksQ0FBQyxZQUFZLEdBQUcsWUFBWSxDQUFBO1NBQ2pDO1FBRUQsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUE7UUFDNUIsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLFdBQVcsRUFBRSxDQUFBO1FBQ3BDLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFBO1FBRXpDLElBQUksU0FBUyxFQUFFO1lBQ2IsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUE7U0FDM0I7YUFBTTtZQUNMLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSx1QkFBVSxFQUFFLENBQUE7U0FDbEM7SUFDSCxDQUFDO0NBQ0Y7QUFsTUQsOEJBa01DIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAcGFja2FnZURvY3VtZW50YXRpb25cbiAqIEBtb2R1bGUgQVBJLVBsYXRmb3JtVk0tQWRkVm90ZVR4XG4gKi9cbmltcG9ydCB7IEJ1ZmZlciB9IGZyb20gXCJidWZmZXIvXCJcbmltcG9ydCB7IENyZWRlbnRpYWwsIFNpZ25hdHVyZSwgVXBncmFkZVZlcnNpb25JRCB9IGZyb20gXCIuLi8uLi9jb21tb25cIlxuaW1wb3J0IEJpblRvb2xzIGZyb20gXCIuLi8uLi91dGlscy9iaW50b29sc1wiXG5pbXBvcnQge1xuICBEZWZhdWx0TmV0d29ya0lELFxuICBEZWZhdWx0VHJhbnNhY3Rpb25WZXJzaW9uTnVtYmVyXG59IGZyb20gXCIuLi8uLi91dGlscy9jb25zdGFudHNcIlxuaW1wb3J0IHsgU2VyaWFsaXphdGlvbiwgU2VyaWFsaXplZEVuY29kaW5nIH0gZnJvbSBcIi4uLy4uL3V0aWxzL3NlcmlhbGl6YXRpb25cIlxuaW1wb3J0IHsgREVGQVVMVF9DQU1JTk9HT19DT0RFQ19WRVJTSU9OIH0gZnJvbSBcIi4vYWRkcHJvcG9zYWx0eFwiXG5pbXBvcnQgeyBCYXNlVHggfSBmcm9tIFwiLi9iYXNldHhcIlxuaW1wb3J0IHsgUGxhdGZvcm1WTUNvbnN0YW50cyB9IGZyb20gXCIuL2NvbnN0YW50c1wiXG5pbXBvcnQgeyBTZWxlY3RDcmVkZW50aWFsQ2xhc3MgfSBmcm9tIFwiLi9jcmVkZW50aWFsc1wiXG5pbXBvcnQgeyBUcmFuc2ZlcmFibGVJbnB1dCB9IGZyb20gXCIuL2lucHV0c1wiXG5pbXBvcnQgeyBLZXlDaGFpbiwgS2V5UGFpciB9IGZyb20gXCIuL2tleWNoYWluXCJcbmltcG9ydCB7IFRyYW5zZmVyYWJsZU91dHB1dCB9IGZyb20gXCIuL291dHB1dHNcIlxuaW1wb3J0IHsgU3VibmV0QXV0aCB9IGZyb20gXCIuL3N1Ym5ldGF1dGhcIlxuLyoqXG4gKiBAaWdub3JlXG4gKi9cbmNvbnN0IGJpbnRvb2xzOiBCaW5Ub29scyA9IEJpblRvb2xzLmdldEluc3RhbmNlKClcbmNvbnN0IHNlcmlhbGl6YXRpb246IFNlcmlhbGl6YXRpb24gPSBTZXJpYWxpemF0aW9uLmdldEluc3RhbmNlKClcblxuZXhwb3J0IGNsYXNzIFNpbXBsZVZvdGUge1xuICBwcml2YXRlIF90eXBlSUQ6IG51bWJlciA9IFBsYXRmb3JtVk1Db25zdGFudHMuU0lNUExFVk9URV9UWVBFX0lEXG4gIHByaXZhdGUgb3B0aW9uSW5kZXggPSBCdWZmZXIuYWxsb2MoNClcblxuICBjb25zdHJ1Y3RvcihvcHRpb25JbmRleDogQnVmZmVyKSB7XG4gICAgdGhpcy5vcHRpb25JbmRleCA9IG9wdGlvbkluZGV4XG4gIH1cblxuICBzZXJpYWxpemUoZW5jb2Rpbmc6IFNlcmlhbGl6ZWRFbmNvZGluZyA9IFwiaGV4XCIpOiBvYmplY3Qge1xuICAgIHJldHVybiB7XG4gICAgICBvcHRpb25JbmRleDogc2VyaWFsaXphdGlvbi5lbmNvZGVyKFxuICAgICAgICB0aGlzLm9wdGlvbkluZGV4LFxuICAgICAgICBlbmNvZGluZyxcbiAgICAgICAgXCJCdWZmZXJcIixcbiAgICAgICAgXCJudW1iZXJcIlxuICAgICAgKVxuICAgIH1cbiAgfVxuXG4gIGRlc2VyaWFsaXplKGZpZWxkczogb2JqZWN0LCBlbmNvZGluZzogU2VyaWFsaXplZEVuY29kaW5nID0gXCJoZXhcIik6IHRoaXMge1xuICAgIHRoaXMub3B0aW9uSW5kZXggPSBzZXJpYWxpemF0aW9uLmRlY29kZXIoXG4gICAgICBmaWVsZHNbXCJvcHRpb25JbmRleFwiXSxcbiAgICAgIGVuY29kaW5nLFxuICAgICAgXCJudW1iZXJcIixcbiAgICAgIFwiQnVmZmVyXCJcbiAgICApXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIGdldFR5cGVJZCgpIHtcbiAgICByZXR1cm4gdGhpcy5fdHlwZUlEXG4gIH1cblxuICBnZXRPcHRpb25JbmRleCgpIHtcbiAgICByZXR1cm4gdGhpcy5vcHRpb25JbmRleFxuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBWb3RlV3JhcHBlciB7XG4gIHByaXZhdGUgdm90ZTogU2ltcGxlVm90ZVxuXG4gIGNvbnN0cnVjdG9yKCkge31cblxuICBzZXJpYWxpemUoZW5jb2Rpbmc6IFNlcmlhbGl6ZWRFbmNvZGluZyA9IFwiaGV4XCIpOiBvYmplY3Qge1xuICAgIHJldHVybiB7XG4gICAgICB2b3RlOiB0aGlzLnZvdGUuc2VyaWFsaXplKGVuY29kaW5nKVxuICAgIH1cbiAgfVxuXG4gIGRlc2VyaWFsaXplKGZpZWxkczogb2JqZWN0LCBlbmNvZGluZzogU2VyaWFsaXplZEVuY29kaW5nID0gXCJoZXhcIik6IHRoaXMge1xuICAgIHRoaXMudm90ZSA9IHRoaXMudm90ZS5kZXNlcmlhbGl6ZShmaWVsZHMsIGVuY29kaW5nKVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBnZXRWb3RlKCk6IFNpbXBsZVZvdGUge1xuICAgIHJldHVybiB0aGlzLnZvdGVcbiAgfVxuXG4gIGFkZFZvdGUob3B0aW9uSW5kZXg6IG51bWJlcikge1xuICAgIGNvbnN0IG9wdGlvbkluZGV4QnVmZiA9IEJ1ZmZlci5hbGxvYyg0KVxuICAgIG9wdGlvbkluZGV4QnVmZi53cml0ZVVJbnQzMkJFKG9wdGlvbkluZGV4LCAwKVxuICAgIHRoaXMudm90ZSA9IG5ldyBTaW1wbGVWb3RlKG9wdGlvbkluZGV4QnVmZilcbiAgfVxuXG4gIGZyb21CdWZmZXIoYnl0ZXM6IEJ1ZmZlciwgb2Zmc2V0OiBudW1iZXIgPSAwKTogbnVtYmVyIHtcbiAgICAvLyBSZWFkIHRoZSBudW1iZXIgb2YgbGVuZ3RoIG9mIHRoZSBmb2xsb3dpbmcgYnl0ZXNcbiAgICBiaW50b29scy5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyA0KS5yZWFkVUludDMyQkUoMClcbiAgICBvZmZzZXQgKz0gNFxuICAgIC8vIFJlYWQgdGhlIGNvZGVjIHZlcnNpb24gbnVtYmVyXG4gICAgYmludG9vbHMuY29weUZyb20oYnl0ZXMsIG9mZnNldCwgb2Zmc2V0ICsgMikucmVhZFVJbnQxNkJFKDApXG4gICAgb2Zmc2V0ICs9IDJcbiAgICBjb25zdCB2b3RlVHlwZUlkID0gYmludG9vbHNcbiAgICAgIC5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyA0KVxuICAgICAgLnJlYWRVSW50MzJCRSgwKVxuICAgIG9mZnNldCArPSA0XG4gICAgc3dpdGNoICh2b3RlVHlwZUlkKSB7XG4gICAgICBjYXNlIFBsYXRmb3JtVk1Db25zdGFudHMuU0lNUExFVk9URV9UWVBFX0lEOlxuICAgICAgICB0aGlzLnZvdGUgPSBuZXcgU2ltcGxlVm90ZShiaW50b29scy5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyA0KSlcbiAgICAgICAgb2Zmc2V0ICs9IDRcbiAgICAgICAgYnJlYWtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IGBVbnN1cHBvcnRlZCB2b3RlIHR5cGU6ICR7dm90ZVR5cGVJZH1gXG4gICAgfVxuICAgIHJldHVybiBvZmZzZXRcbiAgfVxuXG4gIHRvQnVmZmVyKCk6IEJ1ZmZlciB7XG4gICAgY29uc3QgY29kZWNWZXJzaW9uID0gQnVmZmVyLmFsbG9jKDIpXG4gICAgY29kZWNWZXJzaW9uLndyaXRlVUludDgoREVGQVVMVF9DQU1JTk9HT19DT0RFQ19WRVJTSU9OLCAwKVxuICAgIGNvbnN0IHR5cGVJZCA9IEJ1ZmZlci5hbGxvYyg0KVxuICAgIHR5cGVJZC53cml0ZVVJbnQzMkJFKHRoaXMudm90ZS5nZXRUeXBlSWQoKSwgMClcbiAgICBjb25zdCBidWZmID0gdGhpcy52b3RlLmdldE9wdGlvbkluZGV4KClcbiAgICBjb25zdCB0b3RhbEJ5dGVMZW5ndGggPSAyICsgdHlwZUlkLmxlbmd0aCArIGJ1ZmYubGVuZ3RoXG4gICAgY29uc3QgbnVtTGVuZ3RoID0gQnVmZmVyLmFsbG9jKDQpXG4gICAgbnVtTGVuZ3RoLndyaXRlVUludDMyQkUodG90YWxCeXRlTGVuZ3RoLCAwKVxuICAgIHJldHVybiBCdWZmZXIuY29uY2F0KFxuICAgICAgW251bUxlbmd0aCwgY29kZWNWZXJzaW9uLCB0eXBlSWQsIGJ1ZmZdLFxuICAgICAgbnVtTGVuZ3RoLmxlbmd0aCArIHRvdGFsQnl0ZUxlbmd0aFxuICAgIClcbiAgfVxufVxuLyoqXG4gKiBDbGFzcyByZXByZXNlbnRpbmcgYW4gdW5zaWduZWQgQWRkVm90ZVR4IHRyYW5zYWN0aW9uLlxuICovXG5leHBvcnQgY2xhc3MgQWRkVm90ZVR4IGV4dGVuZHMgQmFzZVR4IHtcbiAgcHJvdGVjdGVkIF90eXBlTmFtZSA9IFwiQWRkVm90ZVR4XCJcbiAgcHJvdGVjdGVkIF90eXBlSUQgPSBQbGF0Zm9ybVZNQ29uc3RhbnRzLkFERFZPVEVUWFxuICBwcm90ZWN0ZWQgdXBncmFkZVZlcnNpb25JRCA9IG5ldyBVcGdyYWRlVmVyc2lvbklEKClcbiAgcHJvdGVjdGVkIHByb3Bvc2FsSUQgPSBCdWZmZXIuYWxsb2MoMzIpXG4gIHByb3RlY3RlZCB2b3RlUGF5bG9hZDogVm90ZVdyYXBwZXJcbiAgcHJvdGVjdGVkIHZvdGVyQWRkcmVzcyA9IEJ1ZmZlci5hbGxvYygyMClcbiAgcHJvdGVjdGVkIHZvdGVyQXV0aDogU3VibmV0QXV0aFxuXG4gIHNlcmlhbGl6ZShlbmNvZGluZzogU2VyaWFsaXplZEVuY29kaW5nID0gXCJoZXhcIik6IG9iamVjdCB7XG4gICAgbGV0IGZpZWxkczogb2JqZWN0ID0gc3VwZXIuc2VyaWFsaXplKGVuY29kaW5nKVxuICAgIHJldHVybiB7XG4gICAgICAuLi5maWVsZHMsXG4gICAgICB2b3RlckFkZHJlc3M6IHNlcmlhbGl6YXRpb24uZW5jb2RlcihcbiAgICAgICAgdGhpcy52b3RlckFkZHJlc3MsXG4gICAgICAgIGVuY29kaW5nLFxuICAgICAgICBcIkJ1ZmZlclwiLFxuICAgICAgICBcImNiNThcIlxuICAgICAgKSxcbiAgICAgIHZvdGVyQXV0aDogdGhpcy52b3RlckF1dGguc2VyaWFsaXplKGVuY29kaW5nKSxcbiAgICAgIHZvdGVQYXlsb2FkOiB0aGlzLnZvdGVQYXlsb2FkLnNlcmlhbGl6ZShlbmNvZGluZylcbiAgICB9XG4gIH1cbiAgZGVzZXJpYWxpemUoZmllbGRzOiBvYmplY3QsIGVuY29kaW5nOiBTZXJpYWxpemVkRW5jb2RpbmcgPSBcImhleFwiKSB7XG4gICAgc3VwZXIuZGVzZXJpYWxpemUoZmllbGRzLCBlbmNvZGluZylcbiAgICB0aGlzLnZvdGVyQWRkcmVzcyA9IHNlcmlhbGl6YXRpb24uZGVjb2RlcihcbiAgICAgIGZpZWxkc1tcInZvdGVyQWRkcmVzc1wiXSxcbiAgICAgIGVuY29kaW5nLFxuICAgICAgXCJjYjU4XCIsXG4gICAgICBcIkJ1ZmZlclwiLFxuICAgICAgMjBcbiAgICApXG4gICAgdGhpcy52b3RlckF1dGguZGVzZXJpYWxpemUoZmllbGRzW1widm90ZXJBdXRoXCJdLCBlbmNvZGluZylcbiAgICB0aGlzLnZvdGVQYXlsb2FkID0gdGhpcy52b3RlUGF5bG9hZC5kZXNlcmlhbGl6ZShmaWVsZHMsIGVuY29kaW5nKVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGlkIG9mIHRoZSBbW0FkZFZvdGVUeF1dXG4gICAqL1xuICBnZXRUeFR5cGUoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fdHlwZUlEXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgcHJvcG9zYWwgSURcbiAgICovXG4gIGdldFByb3Bvc2FsSUQoKTogQnVmZmVyIHtcbiAgICByZXR1cm4gdGhpcy5wcm9wb3NhbElEXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgdm90ZSBwYXlsb2FkXG4gICAqL1xuICBnZXRWb3RlUGF5bG9hZCgpOiBWb3RlV3JhcHBlciB7XG4gICAgcmV0dXJuIHRoaXMudm90ZVBheWxvYWRcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSB2b3RlciBhZGRyZXNzXG4gICAqL1xuICBnZXRWb3RlckFkZHJlc3MoKTogQnVmZmVyIHtcbiAgICByZXR1cm4gdGhpcy52b3RlckFkZHJlc3NcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSB2b3RlciBhdXRoXG4gICAqL1xuICBnZXRWb3RlckF1dGgoKTogU3VibmV0QXV0aCB7XG4gICAgcmV0dXJuIHRoaXMudm90ZXJBdXRoXG4gIH1cblxuICAvKipcbiAgICogVGFrZXMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBjb250YWluaW5nIGFuIFtbQWRkVm90ZVR4XV0sIHBhcnNlcyBpdCwgcG9wdWxhdGVzIHRoZSBjbGFzcywgYW5kIHJldHVybnMgdGhlIGxlbmd0aCBvZiB0aGUgW1tBZGRWb3RlVHhdXSBpbiBieXRlcy5cbiAgICpcbiAgICogQHBhcmFtIGJ5dGVzIEEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gY29udGFpbmluZyBhIHJhdyBbW0FkZFZvdGVUeF1dXG4gICAqXG4gICAqIEByZXR1cm5zIFRoZSBsZW5ndGggb2YgdGhlIHJhdyBbW0FkZFZvdGVUeF1dXG4gICAqXG4gICAqIEByZW1hcmtzIGFzc3VtZSBub3QtY2hlY2tzdW1tZWRcbiAgICovXG4gIGZyb21CdWZmZXIoYnl0ZXM6IEJ1ZmZlciwgb2Zmc2V0OiBudW1iZXIgPSAwKTogbnVtYmVyIHtcbiAgICBvZmZzZXQgPSBzdXBlci5mcm9tQnVmZmVyKGJ5dGVzLCBvZmZzZXQpXG4gICAgdGhpcy51cGdyYWRlVmVyc2lvbklEID0gbmV3IFVwZ3JhZGVWZXJzaW9uSUQoKVxuICAgIG9mZnNldCA9IHRoaXMudXBncmFkZVZlcnNpb25JRC5mcm9tQnVmZmVyKGJ5dGVzLCBvZmZzZXQpXG5cbiAgICB0aGlzLnByb3Bvc2FsSUQgPSBiaW50b29scy5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyAzMilcbiAgICBvZmZzZXQgKz0gMzJcbiAgICBjb25zdCB2b3RlV3JhcHBlciA9IG5ldyBWb3RlV3JhcHBlcigpXG4gICAgb2Zmc2V0ID0gdm90ZVdyYXBwZXIuZnJvbUJ1ZmZlcihieXRlcywgb2Zmc2V0KVxuICAgIHRoaXMudm90ZVBheWxvYWQgPSB2b3RlV3JhcHBlclxuXG4gICAgdGhpcy52b3RlckFkZHJlc3MgPSBiaW50b29scy5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyAyMClcbiAgICBvZmZzZXQgKz0gMjBcbiAgICBsZXQgc2E6IFN1Ym5ldEF1dGggPSBuZXcgU3VibmV0QXV0aCgpXG4gICAgb2Zmc2V0ICs9IHNhLmZyb21CdWZmZXIoYmludG9vbHMuY29weUZyb20oYnl0ZXMsIG9mZnNldCkpXG4gICAgdGhpcy52b3RlckF1dGggPSBzYVxuICAgIHJldHVybiBvZmZzZXRcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gcmVwcmVzZW50YXRpb24gb2YgdGhlIFtbQWRkVm90ZVR4XV0uXG4gICAqL1xuICB0b0J1ZmZlcigpOiBCdWZmZXIge1xuICAgIGxldCB1cGdyYWRlQnVmID0gdGhpcy51cGdyYWRlVmVyc2lvbklELnRvQnVmZmVyKClcbiAgICBjb25zdCBzdXBlcmJ1ZmY6IEJ1ZmZlciA9IHN1cGVyLnRvQnVmZmVyKClcblxuICAgIGNvbnN0IHBheWxvYWRCdWZmZXIgPSB0aGlzLnZvdGVQYXlsb2FkLnRvQnVmZmVyKClcbiAgICBsZXQgYnNpemU6IG51bWJlciA9XG4gICAgICB1cGdyYWRlQnVmLmxlbmd0aCArXG4gICAgICBzdXBlcmJ1ZmYubGVuZ3RoICtcbiAgICAgIHRoaXMucHJvcG9zYWxJRC5sZW5ndGggK1xuICAgICAgcGF5bG9hZEJ1ZmZlci5sZW5ndGhcbiAgICBjb25zdCBiYXJyOiBCdWZmZXJbXSA9IFtcbiAgICAgIHVwZ3JhZGVCdWYsXG4gICAgICBzdXBlcmJ1ZmYsXG4gICAgICB0aGlzLnByb3Bvc2FsSUQsXG4gICAgICBwYXlsb2FkQnVmZmVyXG4gICAgXVxuXG4gICAgYnNpemUgKz0gdGhpcy52b3RlckFkZHJlc3MubGVuZ3RoXG4gICAgYmFyci5wdXNoKHRoaXMudm90ZXJBZGRyZXNzKVxuXG4gICAgY29uc3QgYXV0aEJ1ZmZlciA9IHRoaXMudm90ZXJBdXRoLnRvQnVmZmVyKClcbiAgICBic2l6ZSArPSBhdXRoQnVmZmVyLmxlbmd0aFxuICAgIGJhcnIucHVzaChhdXRoQnVmZmVyKVxuICAgIHJldHVybiBCdWZmZXIuY29uY2F0KGJhcnIsIGJzaXplKVxuICB9XG5cbiAgLyoqXG4gICAqIFRha2VzIHRoZSBieXRlcyBvZiBhbiBbW1Vuc2lnbmVkVHhdXSBhbmQgcmV0dXJucyBhbiBhcnJheSBvZiBbW0NyZWRlbnRpYWxdXXNcbiAgICpcbiAgICogQHBhcmFtIG1zZyBBIEJ1ZmZlciBmb3IgdGhlIFtbVW5zaWduZWRUeF1dXG4gICAqIEBwYXJhbSBrYyBBIFtbS2V5Q2hhaW5dXSB1c2VkIGluIHNpZ25pbmdcbiAgICpcbiAgICogQHJldHVybnMgQW4gYXJyYXkgb2YgW1tDcmVkZW50aWFsXV1zXG4gICAqL1xuICBzaWduKG1zZzogQnVmZmVyLCBrYzogS2V5Q2hhaW4pOiBDcmVkZW50aWFsW10ge1xuICAgIGNvbnN0IGNyZWRzOiBDcmVkZW50aWFsW10gPSBzdXBlci5zaWduKG1zZywga2MpXG4gICAgLy8gVm90ZXJcbiAgICBjb25zdCBjcmVkOiBDcmVkZW50aWFsID0gU2VsZWN0Q3JlZGVudGlhbENsYXNzKFxuICAgICAgUGxhdGZvcm1WTUNvbnN0YW50cy5TRUNQQ1JFREVOVElBTFxuICAgIClcbiAgICBjb25zdCBrZXlwYWlyOiBLZXlQYWlyID0ga2MuZ2V0S2V5KHRoaXMudm90ZXJBZGRyZXNzKVxuICAgIGNvbnN0IHNpZ252YWw6IEJ1ZmZlciA9IGtleXBhaXIuc2lnbihtc2cpXG4gICAgY29uc3Qgc2lnOiBTaWduYXR1cmUgPSBuZXcgU2lnbmF0dXJlKClcbiAgICBzaWcuZnJvbUJ1ZmZlcihzaWdudmFsKVxuICAgIGNyZWQuYWRkU2lnbmF0dXJlKHNpZylcbiAgICBjcmVkcy5wdXNoKGNyZWQpXG5cbiAgICByZXR1cm4gY3JlZHNcbiAgfVxuXG4gIC8qKlxuICAgKiBDbGFzcyByZXByZXNlbnRpbmcgYW4gdW5zaWduZWQgUmVnaXN0ZXJOb2RlIHRyYW5zYWN0aW9uLlxuICAgKlxuICAgKiBAcGFyYW0gbmV0d29ya0lEIE9wdGlvbmFsIG5ldHdvcmtJRCwgW1tEZWZhdWx0TmV0d29ya0lEXV1cbiAgICogQHBhcmFtIGJsb2NrY2hhaW5JRCBPcHRpb25hbCBibG9ja2NoYWluSUQsIGRlZmF1bHQgQnVmZmVyLmFsbG9jKDMyLCAxNilcbiAgICogQHBhcmFtIG91dHMgT3B0aW9uYWwgYXJyYXkgb2YgdGhlIFtbVHJhbnNmZXJhYmxlT3V0cHV0XV1zXG4gICAqIEBwYXJhbSBpbnMgT3B0aW9uYWwgYXJyYXkgb2YgdGhlIFtbVHJhbnNmZXJhYmxlSW5wdXRdXXNcbiAgICogQHBhcmFtIG1lbW8gT3B0aW9uYWwge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gZm9yIHRoZSBtZW1vIGZpZWxkXG4gICAqIEBwYXJhbSB2b3RlT3B0aW9uSW5kZXggdGhlIGluZGV4IG9mIHZvdGUgb3B0aW9uLlxuICAgKiBAcGFyYW0gdm90ZXJBZGRyZXNzIHRoZSBjcmVhdGVyKHByb3Bvc2VyKSBhZGRyZXNzLlxuICAgKiBAcGFyYW0gdm90ZXJBdXRoIGF1dGggdGhhdCBhbGxvd3MgdG8gY3JlYXRlIGEgcHJvcG9zYWwuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihcbiAgICB2ZXJzaW9uOiBudW1iZXIgPSBEZWZhdWx0VHJhbnNhY3Rpb25WZXJzaW9uTnVtYmVyLFxuICAgIG5ldHdvcmtJRDogbnVtYmVyID0gRGVmYXVsdE5ldHdvcmtJRCxcbiAgICBibG9ja2NoYWluSUQ6IEJ1ZmZlciA9IEJ1ZmZlci5hbGxvYygzMiwgMTYpLFxuICAgIG91dHM6IFRyYW5zZmVyYWJsZU91dHB1dFtdID0gdW5kZWZpbmVkLFxuICAgIGluczogVHJhbnNmZXJhYmxlSW5wdXRbXSA9IHVuZGVmaW5lZCxcbiAgICBtZW1vOiBCdWZmZXIgPSB1bmRlZmluZWQsXG4gICAgcHJvcG9zYWxJRDogQnVmZmVyID0gdW5kZWZpbmVkLFxuICAgIHZvdGVPcHRpb25JbmRleDogbnVtYmVyID0gdW5kZWZpbmVkLFxuICAgIHZvdGVyQWRkcmVzczogc3RyaW5nIHwgQnVmZmVyID0gdW5kZWZpbmVkLFxuICAgIHZvdGVyQXV0aDogU3VibmV0QXV0aCA9IHVuZGVmaW5lZFxuICApIHtcbiAgICBzdXBlcihuZXR3b3JrSUQsIGJsb2NrY2hhaW5JRCwgb3V0cywgaW5zLCBtZW1vKVxuICAgIHRoaXMudXBncmFkZVZlcnNpb25JRCA9IG5ldyBVcGdyYWRlVmVyc2lvbklEKHZlcnNpb24pXG4gICAgaWYgKHR5cGVvZiB2b3RlckFkZHJlc3MgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgIHRoaXMudm90ZXJBZGRyZXNzID0gYmludG9vbHMuc3RyaW5nVG9BZGRyZXNzKHZvdGVyQWRkcmVzcylcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy52b3RlckFkZHJlc3MgPSB2b3RlckFkZHJlc3NcbiAgICB9XG5cbiAgICB0aGlzLnByb3Bvc2FsSUQgPSBwcm9wb3NhbElEXG4gICAgdGhpcy52b3RlUGF5bG9hZCA9IG5ldyBWb3RlV3JhcHBlcigpXG4gICAgdGhpcy52b3RlUGF5bG9hZC5hZGRWb3RlKHZvdGVPcHRpb25JbmRleClcblxuICAgIGlmICh2b3RlckF1dGgpIHtcbiAgICAgIHRoaXMudm90ZXJBdXRoID0gdm90ZXJBdXRoXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMudm90ZXJBdXRoID0gbmV3IFN1Ym5ldEF1dGgoKVxuICAgIH1cbiAgfVxufVxuIl19
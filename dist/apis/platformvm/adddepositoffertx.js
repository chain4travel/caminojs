"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddDepositOfferTx = exports.Offer = exports.OfferFlag = void 0;
/**
 * @packageDocumentation
 * @module API-PlatformVM-DepositTx
 */
const buffer_1 = require("buffer/");
const bintools_1 = __importDefault(require("../../utils/bintools"));
const constants_1 = require("./constants");
const basetx_1 = require("./basetx");
const constants_2 = require("../../utils/constants");
const serialization_1 = require("../../utils/serialization");
const bn_js_1 = __importDefault(require("bn.js"));
const subnetauth_1 = require("../../apis/platformvm/subnetauth");
const common_1 = require("../../common");
const credentials_1 = require("../../apis/platformvm/credentials");
/**
 * @ignore
 */
const bintools = bintools_1.default.getInstance();
const serialization = serialization_1.Serialization.getInstance();
var OfferFlag;
(function (OfferFlag) {
    OfferFlag["NONE"] = "0";
    OfferFlag["LOCKED"] = "1";
})(OfferFlag = exports.OfferFlag || (exports.OfferFlag = {}));
class Offer {
    constructor(upgradeVersion = undefined, interestRateNominator = undefined, start = undefined, end = undefined, minAmount = undefined, totalMaxAmount = undefined, depositedAmount = undefined, minDuration = undefined, maxDuration = undefined, unlockPeriodDuration = undefined, noRewardsPeriodDuration = undefined, memo = undefined, flag = undefined, totalMaxRewardAmount = undefined, rewardedAmount = undefined, ownerAddress = undefined) {
        this.interestRateNominator = buffer_1.Buffer.alloc(8);
        this.start = buffer_1.Buffer.alloc(8);
        this.end = buffer_1.Buffer.alloc(8);
        this.minAmount = buffer_1.Buffer.alloc(8);
        this.totalMaxAmount = buffer_1.Buffer.alloc(8);
        this.depositedAmount = buffer_1.Buffer.alloc(8);
        this.minDuration = buffer_1.Buffer.alloc(4);
        this.maxDuration = buffer_1.Buffer.alloc(4);
        this.unlockPeriodDuration = buffer_1.Buffer.alloc(4);
        this.noRewardsPeriodDuration = buffer_1.Buffer.alloc(4);
        this.memo = buffer_1.Buffer.alloc(0);
        this.flags = buffer_1.Buffer.alloc(8);
        this.totalMaxRewardAmount = buffer_1.Buffer.alloc(8);
        this.rewardedAmount = buffer_1.Buffer.alloc(8);
        this.ownerAddress = buffer_1.Buffer.alloc(20);
        this.upgradeVersionID = new common_1.UpgradeVersionID(upgradeVersion !== null && upgradeVersion !== void 0 ? upgradeVersion : 0);
        this.interestRateNominator = bintools.fromBNToBuffer(new bn_js_1.default(interestRateNominator), 8);
        if (typeof start !== "undefined") {
            this.start = bintools.fromBNToBuffer(new bn_js_1.default(start), 8);
        }
        if (typeof end !== "undefined") {
            this.end = bintools.fromBNToBuffer(new bn_js_1.default(end), 8);
        }
        if (typeof minAmount !== "undefined") {
            this.minAmount = bintools.fromBNToBuffer(new bn_js_1.default(minAmount), 8);
        }
        if (typeof totalMaxAmount !== "undefined") {
            this.totalMaxAmount = bintools.fromBNToBuffer(new bn_js_1.default(totalMaxAmount), 8);
        }
        if (typeof depositedAmount !== "undefined") {
            this.depositedAmount = bintools.fromBNToBuffer(new bn_js_1.default(depositedAmount), 8);
        }
        if (typeof minDuration !== "undefined") {
            this.minDuration.writeUInt32BE(minDuration, 0);
        }
        if (typeof maxDuration !== "undefined") {
            this.maxDuration.writeUInt32BE(maxDuration, 0);
        }
        if (typeof unlockPeriodDuration !== "undefined") {
            this.unlockPeriodDuration.writeUInt32BE(unlockPeriodDuration, 0);
        }
        if (typeof noRewardsPeriodDuration !== "undefined") {
            this.noRewardsPeriodDuration.writeUInt32BE(noRewardsPeriodDuration, 0);
        }
        if (typeof memo !== "undefined") {
            this.memo = memo;
        }
        if (typeof flag != "undefined") {
            if (flag instanceof bn_js_1.default) {
                this.flags = bintools.fromBNToBuffer(flag, 8);
            }
            else {
                this.flags = bintools.fromBNToBuffer(new bn_js_1.default(flag), 8);
            }
        }
        if (this.upgradeVersionID.version() > 0) {
            if (typeof totalMaxRewardAmount !== "undefined") {
                this.totalMaxRewardAmount = bintools.fromBNToBuffer(new bn_js_1.default(totalMaxRewardAmount), 8);
            }
            if (typeof rewardedAmount !== "undefined") {
                this.rewardedAmount = bintools.fromBNToBuffer(new bn_js_1.default(rewardedAmount), 8);
            }
            if (typeof ownerAddress != "undefined") {
                this.ownerAddress = ownerAddress;
            }
        }
    }
    getMemo() {
        return this.memo;
    }
    deserialize(fields, encoding = "hex") {
        const upgradeVersion = serialization.decoder(fields["upgradeVersion"], encoding, "decimalString", "Buffer");
        this.upgradeVersionID = new common_1.UpgradeVersionID(upgradeVersion);
        this.interestRateNominator = serialization.decoder(fields["interestRateNominator"], encoding, "decimalString", "Buffer");
        this.start = serialization.decoder(fields["start"], encoding, "decimalString", "Buffer");
        this.end = serialization.decoder(fields["end"], encoding, "decimalString", "Buffer");
        this.minAmount = serialization.decoder(fields["minAmount"], encoding, "decimalString", "Buffer");
        this.totalMaxAmount = serialization.decoder(fields["totalMaxAmount"], encoding, "decimalString", "Buffer");
        this.depositedAmount = serialization.decoder(fields["depositedAmount"], encoding, "decimalString", "Buffer");
        this.minDuration = serialization.decoder(fields["minDuration"], encoding, "decimalString", "Buffer");
        this.maxDuration = serialization.decoder(fields["maxDuration"], encoding, "decimalString", "Buffer");
        this.unlockPeriodDuration = serialization.decoder(fields["unlockPeriodDuration"], encoding, "decimalString", "Buffer");
        this.noRewardsPeriodDuration = serialization.decoder(fields["noRewardsPeriodDuration"], encoding, "decimalString", "Buffer");
        this.memo = serialization.decoder(fields["memo"], encoding, "utf8", "Buffer");
        this.flags = serialization.decoder(fields["flags"], encoding, "decimalString", "Buffer");
        if (this.upgradeVersionID.version() > 0) {
            this.totalMaxRewardAmount = serialization.decoder(fields["totalMaxRewardAmount"], encoding, "decimalString", "Buffer");
            this.rewardedAmount = serialization.decoder(fields["rewardedAmount"], encoding, "decimalString", "Buffer");
            this.ownerAddress = serialization.decoder(fields["ownerAddress"], encoding, "cb58", "Buffer");
        }
        return this;
    }
    serialize(encoding = "hex") {
        let fields = {
            upgradeVersion: serialization.encoder(this.upgradeVersionID.version(), encoding, "Buffer", "decimalString"),
            interestRateNominator: serialization.encoder(this.interestRateNominator, encoding, "Buffer", "decimalString"),
            start: serialization.encoder(this.start, encoding, "Buffer", "decimalString"),
            end: serialization.encoder(this.end, encoding, "Buffer", "decimalString"),
            minAmount: serialization.encoder(this.minAmount, encoding, "Buffer", "decimalString"),
            totalMaxAmount: serialization.encoder(this.totalMaxAmount, encoding, "Buffer", "decimalString"),
            depositedAmount: serialization.encoder(this.depositedAmount, encoding, "Buffer", "decimalString"),
            minDuration: serialization.encoder(this.minDuration, encoding, "Buffer", "decimalString"),
            maxDuration: serialization.encoder(this.maxDuration, encoding, "Buffer", "decimalString"),
            unlockPeriodDuration: serialization.encoder(this.unlockPeriodDuration, encoding, "Buffer", "decimalString"),
            noRewardsPeriodDuration: serialization.encoder(this.noRewardsPeriodDuration, encoding, "Buffer", "decimalString"),
            memo: serialization.encoder(this.memo, encoding, "Buffer", "utf8"),
            flags: serialization.encoder(this.flags, encoding, "Buffer", "decimalString")
        };
        if (this.upgradeVersionID.version() > 0) {
            return Object.assign(Object.assign({}, fields), { totalMaxRewardAmount: serialization.encoder(this.totalMaxRewardAmount, encoding, "Buffer", "decimalString"), rewardedAmount: serialization.encoder(this.rewardedAmount, encoding, "Buffer", "decimalString"), ownerAddress: serialization.encoder(this.ownerAddress, encoding, "Buffer", "cb58") });
        }
        return fields;
    }
    fromBuffer(bytes, offset = 0) {
        offset = this.upgradeVersionID.fromBuffer(bytes, offset);
        this.interestRateNominator = bintools.copyFrom(bytes, offset, offset + 8);
        offset += 8;
        this.start = bintools.copyFrom(bytes, offset, offset + 8);
        offset += 8;
        this.end = bintools.copyFrom(bytes, offset, offset + 8);
        offset += 8;
        this.minAmount = bintools.copyFrom(bytes, offset, offset + 8);
        offset += 8;
        this.totalMaxAmount = bintools.copyFrom(bytes, offset, offset + 8);
        offset += 8;
        this.depositedAmount = bintools.copyFrom(bytes, offset, offset + 8);
        offset += 8;
        this.minDuration = bintools.copyFrom(bytes, offset, offset + 4);
        offset += 4;
        this.maxDuration = bintools.copyFrom(bytes, offset, offset + 4);
        offset += 4;
        this.unlockPeriodDuration = bintools.copyFrom(bytes, offset, offset + 4);
        offset += 4;
        this.noRewardsPeriodDuration = bintools.copyFrom(bytes, offset, offset + 4);
        offset += 4;
        const memoLen = bintools
            .copyFrom(bytes, offset, offset + 4)
            .readUInt32BE(0);
        offset += 4;
        this.memo = bintools.copyFrom(bytes, offset, offset + memoLen);
        offset += memoLen;
        this.flags = bintools.copyFrom(bytes, offset, offset + 8);
        offset += 8;
        if (this.upgradeVersionID.version() > 0) {
            this.totalMaxRewardAmount = bintools.copyFrom(bytes, offset, offset + 8);
            offset += 8;
            this.rewardedAmount = bintools.copyFrom(bytes, offset, offset + 8);
            offset += 8;
            this.ownerAddress = bintools.copyFrom(bytes, offset, offset + 20);
            offset += 20;
        }
        return offset;
    }
    toBuffer() {
        let memoLength = buffer_1.Buffer.alloc(4);
        memoLength.writeUInt32BE(this.memo.length, 0);
        let upgradeBuffer = this.upgradeVersionID.toBuffer();
        let bsize = upgradeBuffer.length +
            this.interestRateNominator.length +
            this.start.length +
            this.end.length +
            this.minAmount.length +
            this.totalMaxAmount.length +
            this.depositedAmount.length +
            this.minDuration.length +
            this.maxDuration.length +
            this.unlockPeriodDuration.length +
            this.noRewardsPeriodDuration.length +
            memoLength.length +
            this.memo.length +
            this.flags.length;
        const buffer = [
            upgradeBuffer,
            this.interestRateNominator,
            this.start,
            this.end,
            this.minAmount,
            this.totalMaxAmount,
            this.depositedAmount,
            this.minDuration,
            this.maxDuration,
            this.unlockPeriodDuration,
            this.noRewardsPeriodDuration,
            memoLength,
            this.memo,
            this.flags
        ];
        if (this.upgradeVersionID.version() > 0) {
            bsize +=
                this.totalMaxRewardAmount.length +
                    this.rewardedAmount.length +
                    this.ownerAddress.length;
            buffer.push(this.totalMaxRewardAmount, this.rewardedAmount, this.ownerAddress);
        }
        return buffer_1.Buffer.concat(buffer, bsize);
    }
}
exports.Offer = Offer;
/**
 * Class representing an unsigned AddDepositOfferTx transaction.
 */
class AddDepositOfferTx extends basetx_1.BaseTx {
    serialize(encoding = "hex") {
        let fields = super.serialize(encoding);
        return Object.assign(Object.assign({}, fields), { depositOffer: this.depositOffer.serialize(encoding), depositOfferCreatorAddress: serialization.encoder(this.depositOfferCreatorAddress, encoding, "Buffer", "cb58"), depositOfferCreatorAuth: this.depositOfferCreatorAuth.serialize(encoding) });
    }
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        this.depositOffer = new Offer().deserialize(fields["depositOffer"], encoding);
        this.depositOfferCreatorAddress = serialization.decoder(fields["depositOfferCreatorAddress"], encoding, "cb58", "Buffer");
        this.depositOfferCreatorAuth.deserialize(fields["depositOfferCreatorAuth"], encoding);
    }
    /**
     * Creates and adds a [[SigIdx]] to the [[AddDepositOfferTx]].
     *
     * @param addressIdx The index of the address to reference in the signatures
     * @param address The address of the source of the signature
     */
    addSignatureIdx(addressIdx, address) {
        const addressIndex = buffer_1.Buffer.alloc(4);
        addressIndex.writeUIntBE(addressIdx, 0, 4);
        this.depositOfferCreatorAuth.addAddressIndex(addressIndex);
        const sigidx = new common_1.SigIdx();
        const b = buffer_1.Buffer.alloc(4);
        b.writeUInt32BE(addressIdx, 0);
        sigidx.fromBuffer(b);
        sigidx.setSource(address);
        this.sigIdxs.push(sigidx);
        this.sigCount.writeUInt32BE(this.sigIdxs.length, 0);
    }
    /**
     * Returns the id of the [[RegisterNodeTx]]
     */
    getTxType() {
        return this._typeID;
    }
    getDepositOffer() {
        return this.depositOffer;
    }
    getDepositOfferCreatorAddress() {
        return this.depositOfferCreatorAddress;
    }
    getDepositOfferCreatorAuth() {
        return this.depositOfferCreatorAuth;
    }
    getSigIdxs() {
        return this.sigIdxs;
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
        const cred = (0, credentials_1.SelectCredentialClass)(constants_1.PlatformVMConstants.SECPCREDENTIAL);
        for (const sigidx of this.sigIdxs) {
            const keypair = kc.getKey(sigidx.getSource());
            const signval = keypair.sign(msg);
            const sig = new common_1.Signature();
            sig.fromBuffer(signval);
            cred.addSignature(sig);
        }
        creds.push(cred);
        return creds;
    }
    /**
     * Takes a {@link https://github.com/feross/buffer|Buffer} containing a [[AddDepositOfferTx]], parses it, populates the class, and returns the length of the [[AddDepositOfferTx]] in bytes.
     *
     * @param bytes A {@link https://github.com/feross/buffer|Buffer} containing a raw [[AddDepositOfferTx]]
     *
     * @returns The length of the raw [[AddDepositOfferTx]]
     *
     * @remarks assume not-checksummed
     */
    fromBuffer(bytes, offset = 0) {
        offset = super.fromBuffer(bytes, offset);
        const depositOffer = new Offer();
        offset = depositOffer.fromBuffer(bytes, offset);
        this.depositOffer = depositOffer;
        this.depositOfferCreatorAddress = bintools.copyFrom(bytes, offset, offset + 20);
        offset += 20;
        const sa = new subnetauth_1.SubnetAuth();
        offset += sa.fromBuffer(bintools.copyFrom(bytes, offset));
        this.depositOfferCreatorAuth = sa;
        return offset;
    }
    /**
     * Returns a {@link https://github.com/feross/buffer|Buffer} representation of the [[AddDepositOfferTx]].
     */
    toBuffer() {
        const superbuff = super.toBuffer();
        let bsize = superbuff.length;
        const depositOfferBuffer = this.depositOffer.toBuffer();
        bsize += depositOfferBuffer.length;
        const authBuffer = this.depositOfferCreatorAuth.toBuffer();
        bsize += authBuffer.length;
        const barr = [
            superbuff,
            depositOfferBuffer,
            this.depositOfferCreatorAddress,
            authBuffer
        ];
        return buffer_1.Buffer.concat(barr, bsize + 20);
    }
    clone() {
        const newAddDepositOfferTx = new AddDepositOfferTx();
        newAddDepositOfferTx.fromBuffer(this.toBuffer());
        return newAddDepositOfferTx;
    }
    create(...args) {
        return new AddDepositOfferTx(...args);
    }
    /**
     * Class representing an unsigned AddDepositOfferTx transaction.
     *
     * @param networkID Optional networkID, [[DefaultNetworkID]]
     * @param blockchainID Optional blockchainID, default Buffer.alloc(32, 16)
     * @param outs Optional array of the [[TransferableOutput]]s
     * @param ins Optional array of the [[TransferableInput]]s
     * @param memo Optional {@link https://github.com/feross/buffer|Buffer} for the memo field
     * @param depositOffer Offer to be used for this deposit
     * @param depositOfferCreatorAddress Address of the node that created the offer
     */
    constructor(networkID = constants_2.DefaultNetworkID, blockchainID = buffer_1.Buffer.alloc(32, 16), outs = undefined, ins = undefined, memo = undefined, depositOffer = undefined, depositOfferCreatorAddress = undefined) {
        super(networkID, blockchainID, outs, ins, memo);
        this._typeName = "AddDepositOfferTx";
        this._typeID = constants_1.PlatformVMConstants.ADDDEPOSITOFFERTX;
        // The address of the account that creates the deposit offer
        this.depositOfferCreatorAddress = buffer_1.Buffer.alloc(20);
        this.sigCount = buffer_1.Buffer.alloc(4);
        this.sigIdxs = []; // idxs of signers
        if (typeof depositOffer !== "undefined") {
            this.depositOffer = depositOffer;
        }
        else {
            this.depositOffer = new Offer();
        }
        if (typeof depositOfferCreatorAddress != "undefined") {
            this.depositOfferCreatorAddress = depositOfferCreatorAddress;
        }
        this.depositOfferCreatorAuth = new subnetauth_1.SubnetAuth();
    }
}
exports.AddDepositOfferTx = AddDepositOfferTx;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRkZGVwb3NpdG9mZmVydHguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYXBpcy9wbGF0Zm9ybXZtL2FkZGRlcG9zaXRvZmZlcnR4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBOzs7R0FHRztBQUNILG9DQUFnQztBQUNoQyxvRUFBMkM7QUFDM0MsMkNBQWlEO0FBR2pELHFDQUFpQztBQUNqQyxxREFBd0Q7QUFDeEQsNkRBQTZFO0FBQzdFLGtEQUFzQjtBQUN0QixpRUFBNkQ7QUFDN0QseUNBQThFO0FBRTlFLG1FQUF5RTtBQUV6RTs7R0FFRztBQUNILE1BQU0sUUFBUSxHQUFhLGtCQUFRLENBQUMsV0FBVyxFQUFFLENBQUE7QUFDakQsTUFBTSxhQUFhLEdBQWtCLDZCQUFhLENBQUMsV0FBVyxFQUFFLENBQUE7QUFFaEUsSUFBWSxTQUdYO0FBSEQsV0FBWSxTQUFTO0lBQ25CLHVCQUFVLENBQUE7SUFDVix5QkFBWSxDQUFBO0FBQ2QsQ0FBQyxFQUhXLFNBQVMsR0FBVCxpQkFBUyxLQUFULGlCQUFTLFFBR3BCO0FBRUQsTUFBYSxLQUFLO0lBa0JoQixZQUNFLGlCQUF5QixTQUFTLEVBQ2xDLHdCQUE0QixTQUFTLEVBQ3JDLFFBQVksU0FBUyxFQUNyQixNQUFVLFNBQVMsRUFDbkIsWUFBZ0IsU0FBUyxFQUN6QixpQkFBcUIsU0FBUyxFQUM5QixrQkFBc0IsU0FBUyxFQUMvQixjQUFzQixTQUFTLEVBQy9CLGNBQXNCLFNBQVMsRUFDL0IsdUJBQStCLFNBQVMsRUFDeEMsMEJBQWtDLFNBQVMsRUFDM0MsT0FBZSxTQUFTLEVBQ3hCLE9BQXVCLFNBQVMsRUFDaEMsdUJBQTJCLFNBQVMsRUFDcEMsaUJBQXFCLFNBQVMsRUFDOUIsZUFBdUIsU0FBUztRQWhDeEIsMEJBQXFCLEdBQUcsZUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUN2QyxVQUFLLEdBQUcsZUFBTSxDQUFDLEtBQUssQ0FBQyxD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S0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2xDLFlBQU8sR0FBYSxFQUFFLENBQUEsQ0FBQyxrQkFBa0I7UUF1SmpELElBQUksT0FBTyxZQUFZLEtBQUssV0FBVyxFQUFFO1lBQ3ZDLElBQUksQ0FBQyxZQUFZLEdBQUcsWUFBWSxDQUFBO1NBQ2pDO2FBQU07WUFDTCxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksS0FBSyxFQUFFLENBQUE7U0FDaEM7UUFFRCxJQUFJLE9BQU8sMEJBQTBCLElBQUksV0FBVyxFQUFFO1lBQ3BELElBQUksQ0FBQywwQkFBMEIsR0FBRywwQkFBMEIsQ0FBQTtTQUM3RDtRQUNELElBQUksQ0FBQyx1QkFBdUIsR0FBRyxJQUFJLHVCQUFVLEVBQUUsQ0FBQTtJQUNqRCxDQUFDO0NBQ0Y7QUE3TUQsOENBNk1DIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAcGFja2FnZURvY3VtZW50YXRpb25cbiAqIEBtb2R1bGUgQVBJLVBsYXRmb3JtVk0tRGVwb3NpdFR4XG4gKi9cbmltcG9ydCB7IEJ1ZmZlciB9IGZyb20gXCJidWZmZXIvXCJcbmltcG9ydCBCaW5Ub29scyBmcm9tIFwiLi4vLi4vdXRpbHMvYmludG9vbHNcIlxuaW1wb3J0IHsgUGxhdGZvcm1WTUNvbnN0YW50cyB9IGZyb20gXCIuL2NvbnN0YW50c1wiXG5pbXBvcnQgeyBUcmFuc2ZlcmFibGVPdXRwdXQgfSBmcm9tIFwiLi9vdXRwdXRzXCJcbmltcG9ydCB7IFRyYW5zZmVyYWJsZUlucHV0IH0gZnJvbSBcIi4vaW5wdXRzXCJcbmltcG9ydCB7IEJhc2VUeCB9IGZyb20gXCIuL2Jhc2V0eFwiXG5pbXBvcnQgeyBEZWZhdWx0TmV0d29ya0lEIH0gZnJvbSBcIi4uLy4uL3V0aWxzL2NvbnN0YW50c1wiXG5pbXBvcnQgeyBTZXJpYWxpemF0aW9uLCBTZXJpYWxpemVkRW5jb2RpbmcgfSBmcm9tIFwiLi4vLi4vdXRpbHMvc2VyaWFsaXphdGlvblwiXG5pbXBvcnQgQk4gZnJvbSBcImJuLmpzXCJcbmltcG9ydCB7IFN1Ym5ldEF1dGggfSBmcm9tIFwiLi4vLi4vYXBpcy9wbGF0Zm9ybXZtL3N1Ym5ldGF1dGhcIlxuaW1wb3J0IHsgQ3JlZGVudGlhbCwgU2lnSWR4LCBTaWduYXR1cmUsIFVwZ3JhZGVWZXJzaW9uSUQgfSBmcm9tIFwiLi4vLi4vY29tbW9uXCJcbmltcG9ydCB7IEtleUNoYWluLCBLZXlQYWlyIH0gZnJvbSBcIi4uLy4uL2FwaXMvcGxhdGZvcm12bS9rZXljaGFpblwiXG5pbXBvcnQgeyBTZWxlY3RDcmVkZW50aWFsQ2xhc3MgfSBmcm9tIFwiLi4vLi4vYXBpcy9wbGF0Zm9ybXZtL2NyZWRlbnRpYWxzXCJcblxuLyoqXG4gKiBAaWdub3JlXG4gKi9cbmNvbnN0IGJpbnRvb2xzOiBCaW5Ub29scyA9IEJpblRvb2xzLmdldEluc3RhbmNlKClcbmNvbnN0IHNlcmlhbGl6YXRpb246IFNlcmlhbGl6YXRpb24gPSBTZXJpYWxpemF0aW9uLmdldEluc3RhbmNlKClcblxuZXhwb3J0IGVudW0gT2ZmZXJGbGFnIHtcbiAgTk9ORSA9IFwiMFwiLFxuICBMT0NLRUQgPSBcIjFcIlxufVxuXG5leHBvcnQgY2xhc3MgT2ZmZXIge1xuICBwcm90ZWN0ZWQgdXBncmFkZVZlcnNpb25JRDogVXBncmFkZVZlcnNpb25JRFxuICBwcm90ZWN0ZWQgaW50ZXJlc3RSYXRlTm9taW5hdG9yID0gQnVmZmVyLmFsbG9jKDgpXG4gIHByb3RlY3RlZCBzdGFydCA9IEJ1ZmZlci5hbGxvYyg4KVxuICBwcm90ZWN0ZWQgZW5kID0gQnVmZmVyLmFsbG9jKDgpXG4gIHByb3RlY3RlZCBtaW5BbW91bnQgPSBCdWZmZXIuYWxsb2MoOClcbiAgcHJvdGVjdGVkIHRvdGFsTWF4QW1vdW50ID0gQnVmZmVyLmFsbG9jKDgpXG4gIHByb3RlY3RlZCBkZXBvc2l0ZWRBbW91bnQgPSBCdWZmZXIuYWxsb2MoOClcbiAgcHJvdGVjdGVkIG1pbkR1cmF0aW9uID0gQnVmZmVyLmFsbG9jKDQpXG4gIHByb3RlY3RlZCBtYXhEdXJhdGlvbiA9IEJ1ZmZlci5hbGxvYyg0KVxuICBwcm90ZWN0ZWQgdW5sb2NrUGVyaW9kRHVyYXRpb24gPSBCdWZmZXIuYWxsb2MoNClcbiAgcHJvdGVjdGVkIG5vUmV3YXJkc1BlcmlvZER1cmF0aW9uID0gQnVmZmVyLmFsbG9jKDQpXG4gIHByb3RlY3RlZCBtZW1vID0gQnVmZmVyLmFsbG9jKDApXG4gIHByb3RlY3RlZCBmbGFncyA9IEJ1ZmZlci5hbGxvYyg4KVxuICBwcm90ZWN0ZWQgdG90YWxNYXhSZXdhcmRBbW91bnQgPSBCdWZmZXIuYWxsb2MoOClcbiAgcHJvdGVjdGVkIHJld2FyZGVkQW1vdW50ID0gQnVmZmVyLmFsbG9jKDgpXG4gIHByb3RlY3RlZCBvd25lckFkZHJlc3MgPSBCdWZmZXIuYWxsb2MoMjApXG5cbiAgY29uc3RydWN0b3IoXG4gICAgdXBncmFkZVZlcnNpb246IG51bWJlciA9IHVuZGVmaW5lZCxcbiAgICBpbnRlcmVzdFJhdGVOb21pbmF0b3I6IEJOID0gdW5kZWZpbmVkLFxuICAgIHN0YXJ0OiBCTiA9IHVuZGVmaW5lZCxcbiAgICBlbmQ6IEJOID0gdW5kZWZpbmVkLFxuICAgIG1pbkFtb3VudDogQk4gPSB1bmRlZmluZWQsXG4gICAgdG90YWxNYXhBbW91bnQ6IEJOID0gdW5kZWZpbmVkLFxuICAgIGRlcG9zaXRlZEFtb3VudDogQk4gPSB1bmRlZmluZWQsXG4gICAgbWluRHVyYXRpb246IG51bWJlciA9IHVuZGVmaW5lZCxcbiAgICBtYXhEdXJhdGlvbjogbnVtYmVyID0gdW5kZWZpbmVkLFxuICAgIHVubG9ja1BlcmlvZER1cmF0aW9uOiBudW1iZXIgPSB1bmRlZmluZWQsXG4gICAgbm9SZXdhcmRzUGVyaW9kRHVyYXRpb246IG51bWJlciA9IHVuZGVmaW5lZCxcbiAgICBtZW1vOiBCdWZmZXIgPSB1bmRlZmluZWQsXG4gICAgZmxhZzogT2ZmZXJGbGFnIHwgQk4gPSB1bmRlZmluZWQsXG4gICAgdG90YWxNYXhSZXdhcmRBbW91bnQ6IEJOID0gdW5kZWZpbmVkLFxuICAgIHJld2FyZGVkQW1vdW50OiBCTiA9IHVuZGVmaW5lZCxcbiAgICBvd25lckFkZHJlc3M6IEJ1ZmZlciA9IHVuZGVmaW5lZFxuICApIHtcbiAgICB0aGlzLnVwZ3JhZGVWZXJzaW9uSUQgPSBuZXcgVXBncmFkZVZlcnNpb25JRCh1cGdyYWRlVmVyc2lvbiA/PyAwKVxuICAgIHRoaXMuaW50ZXJlc3RSYXRlTm9taW5hdG9yID0gYmludG9vbHMuZnJvbUJOVG9CdWZmZXIoXG4gICAgICBuZXcgQk4oaW50ZXJlc3RSYXRlTm9taW5hdG9yKSxcbiAgICAgIDhcbiAgICApXG4gICAgaWYgKHR5cGVvZiBzdGFydCAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgdGhpcy5zdGFydCA9IGJpbnRvb2xzLmZyb21CTlRvQnVmZmVyKG5ldyBCTihzdGFydCksIDgpXG4gICAgfVxuICAgIGlmICh0eXBlb2YgZW5kICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICB0aGlzLmVuZCA9IGJpbnRvb2xzLmZyb21CTlRvQnVmZmVyKG5ldyBCTihlbmQpLCA4KVxuICAgIH1cbiAgICBpZiAodHlwZW9mIG1pbkFtb3VudCAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgdGhpcy5taW5BbW91bnQgPSBiaW50b29scy5mcm9tQk5Ub0J1ZmZlcihuZXcgQk4obWluQW1vdW50KSwgOClcbiAgICB9XG4gICAgaWYgKHR5cGVvZiB0b3RhbE1heEFtb3VudCAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgdGhpcy50b3RhbE1heEFtb3VudCA9IGJpbnRvb2xzLmZyb21CTlRvQnVmZmVyKG5ldyBCTih0b3RhbE1heEFtb3VudCksIDgpXG4gICAgfVxuICAgIGlmICh0eXBlb2YgZGVwb3NpdGVkQW1vdW50ICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICB0aGlzLmRlcG9zaXRlZEFtb3VudCA9IGJpbnRvb2xzLmZyb21CTlRvQnVmZmVyKG5ldyBCTihkZXBvc2l0ZWRBbW91bnQpLCA4KVxuICAgIH1cbiAgICBpZiAodHlwZW9mIG1pbkR1cmF0aW9uICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICB0aGlzLm1pbkR1cmF0aW9uLndyaXRlVUludDMyQkUobWluRHVyYXRpb24sIDApXG4gICAgfVxuICAgIGlmICh0eXBlb2YgbWF4RHVyYXRpb24gIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIHRoaXMubWF4RHVyYXRpb24ud3JpdGVVSW50MzJCRShtYXhEdXJhdGlvbiwgMClcbiAgICB9XG4gICAgaWYgKHR5cGVvZiB1bmxvY2tQZXJpb2REdXJhdGlvbiAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgdGhpcy51bmxvY2tQZXJpb2REdXJhdGlvbi53cml0ZVVJbnQzMkJFKHVubG9ja1BlcmlvZER1cmF0aW9uLCAwKVxuICAgIH1cbiAgICBpZiAodHlwZW9mIG5vUmV3YXJkc1BlcmlvZER1cmF0aW9uICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICB0aGlzLm5vUmV3YXJkc1BlcmlvZER1cmF0aW9uLndyaXRlVUludDMyQkUobm9SZXdhcmRzUGVyaW9kRHVyYXRpb24sIDApXG4gICAgfVxuICAgIGlmICh0eXBlb2YgbWVtbyAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgdGhpcy5tZW1vID0gbWVtb1xuICAgIH1cbiAgICBpZiAodHlwZW9mIGZsYWcgIT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgaWYgKGZsYWcgaW5zdGFuY2VvZiBCTikge1xuICAgICAgICB0aGlzLmZsYWdzID0gYmludG9vbHMuZnJvbUJOVG9CdWZmZXIoZmxhZywgOClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuZmxhZ3MgPSBiaW50b29scy5mcm9tQk5Ub0J1ZmZlcihuZXcgQk4oZmxhZyksIDgpXG4gICAgICB9XG4gICAgfVxuICAgIGlmICh0aGlzLnVwZ3JhZGVWZXJzaW9uSUQudmVyc2lvbigpID4gMCkge1xuICAgICAgaWYgKHR5cGVvZiB0b3RhbE1heFJld2FyZEFtb3VudCAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICB0aGlzLnRvdGFsTWF4UmV3YXJkQW1vdW50ID0gYmludG9vbHMuZnJvbUJOVG9CdWZmZXIoXG4gICAgICAgICAgbmV3IEJOKHRvdGFsTWF4UmV3YXJkQW1vdW50KSxcbiAgICAgICAgICA4XG4gICAgICAgIClcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2YgcmV3YXJkZWRBbW91bnQgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgdGhpcy5yZXdhcmRlZEFtb3VudCA9IGJpbnRvb2xzLmZyb21CTlRvQnVmZmVyKG5ldyBCTihyZXdhcmRlZEFtb3VudCksIDgpXG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIG93bmVyQWRkcmVzcyAhPSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIHRoaXMub3duZXJBZGRyZXNzID0gb3duZXJBZGRyZXNzXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZ2V0TWVtbygpOiBCdWZmZXIge1xuICAgIHJldHVybiB0aGlzLm1lbW9cbiAgfVxuXG4gIGRlc2VyaWFsaXplKGZpZWxkczogb2JqZWN0LCBlbmNvZGluZzogU2VyaWFsaXplZEVuY29kaW5nID0gXCJoZXhcIik6IHRoaXMge1xuICAgIGNvbnN0IHVwZ3JhZGVWZXJzaW9uID0gc2VyaWFsaXphdGlvbi5kZWNvZGVyKFxuICAgICAgZmllbGRzW1widXBncmFkZVZlcnNpb25cIl0sXG4gICAgICBlbmNvZGluZyxcbiAgICAgIFwiZGVjaW1hbFN0cmluZ1wiLFxuICAgICAgXCJCdWZmZXJcIlxuICAgIClcbiAgICB0aGlzLnVwZ3JhZGVWZXJzaW9uSUQgPSBuZXcgVXBncmFkZVZlcnNpb25JRCh1cGdyYWRlVmVyc2lvbilcblxuICAgIHRoaXMuaW50ZXJlc3RSYXRlTm9taW5hdG9yID0gc2VyaWFsaXphdGlvbi5kZWNvZGVyKFxuICAgICAgZmllbGRzW1wiaW50ZXJlc3RSYXRlTm9taW5hdG9yXCJdLFxuICAgICAgZW5jb2RpbmcsXG4gICAgICBcImRlY2ltYWxTdHJpbmdcIixcbiAgICAgIFwiQnVmZmVyXCJcbiAgICApXG4gICAgdGhpcy5zdGFydCA9IHNlcmlhbGl6YXRpb24uZGVjb2RlcihcbiAgICAgIGZpZWxkc1tcInN0YXJ0XCJdLFxuICAgICAgZW5jb2RpbmcsXG4gICAgICBcImRlY2ltYWxTdHJpbmdcIixcbiAgICAgIFwiQnVmZmVyXCJcbiAgICApXG4gICAgdGhpcy5lbmQgPSBzZXJpYWxpemF0aW9uLmRlY29kZXIoXG4gICAgICBmaWVsZHNbXCJlbmRcIl0sXG4gICAgICBlbmNvZGluZyxcbiAgICAgIFwiZGVjaW1hbFN0cmluZ1wiLFxuICAgICAgXCJCdWZmZXJcIlxuICAgIClcbiAgICB0aGlzLm1pbkFtb3VudCA9IHNlcmlhbGl6YXRpb24uZGVjb2RlcihcbiAgICAgIGZpZWxkc1tcIm1pbkFtb3VudFwiXSxcbiAgICAgIGVuY29kaW5nLFxuICAgICAgXCJkZWNpbWFsU3RyaW5nXCIsXG4gICAgICBcIkJ1ZmZlclwiXG4gICAgKVxuICAgIHRoaXMudG90YWxNYXhBbW91bnQgPSBzZXJpYWxpemF0aW9uLmRlY29kZXIoXG4gICAgICBmaWVsZHNbXCJ0b3RhbE1heEFtb3VudFwiXSxcbiAgICAgIGVuY29kaW5nLFxuICAgICAgXCJkZWNpbWFsU3RyaW5nXCIsXG4gICAgICBcIkJ1ZmZlclwiXG4gICAgKVxuICAgIHRoaXMuZGVwb3NpdGVkQW1vdW50ID0gc2VyaWFsaXphdGlvbi5kZWNvZGVyKFxuICAgICAgZmllbGRzW1wiZGVwb3NpdGVkQW1vdW50XCJdLFxuICAgICAgZW5jb2RpbmcsXG4gICAgICBcImRlY2ltYWxTdHJpbmdcIixcbiAgICAgIFwiQnVmZmVyXCJcbiAgICApXG4gICAgdGhpcy5taW5EdXJhdGlvbiA9IHNlcmlhbGl6YXRpb24uZGVjb2RlcihcbiAgICAgIGZpZWxkc1tcIm1pbkR1cmF0aW9uXCJdLFxuICAgICAgZW5jb2RpbmcsXG4gICAgICBcImRlY2ltYWxTdHJpbmdcIixcbiAgICAgIFwiQnVmZmVyXCJcbiAgICApXG4gICAgdGhpcy5tYXhEdXJhdGlvbiA9IHNlcmlhbGl6YXRpb24uZGVjb2RlcihcbiAgICAgIGZpZWxkc1tcIm1heER1cmF0aW9uXCJdLFxuICAgICAgZW5jb2RpbmcsXG4gICAgICBcImRlY2ltYWxTdHJpbmdcIixcbiAgICAgIFwiQnVmZmVyXCJcbiAgICApXG4gICAgdGhpcy51bmxvY2tQZXJpb2REdXJhdGlvbiA9IHNlcmlhbGl6YXRpb24uZGVjb2RlcihcbiAgICAgIGZpZWxkc1tcInVubG9ja1BlcmlvZER1cmF0aW9uXCJdLFxuICAgICAgZW5jb2RpbmcsXG4gICAgICBcImRlY2ltYWxTdHJpbmdcIixcbiAgICAgIFwiQnVmZmVyXCJcbiAgICApXG4gICAgdGhpcy5ub1Jld2FyZHNQZXJpb2REdXJhdGlvbiA9IHNlcmlhbGl6YXRpb24uZGVjb2RlcihcbiAgICAgIGZpZWxkc1tcIm5vUmV3YXJkc1BlcmlvZER1cmF0aW9uXCJdLFxuICAgICAgZW5jb2RpbmcsXG4gICAgICBcImRlY2ltYWxTdHJpbmdcIixcbiAgICAgIFwiQnVmZmVyXCJcbiAgICApXG4gICAgdGhpcy5tZW1vID0gc2VyaWFsaXphdGlvbi5kZWNvZGVyKFxuICAgICAgZmllbGRzW1wibWVtb1wiXSxcbiAgICAgIGVuY29kaW5nLFxuICAgICAgXCJ1dGY4XCIsXG4gICAgICBcIkJ1ZmZlclwiXG4gICAgKVxuICAgIHRoaXMuZmxhZ3MgPSBzZXJpYWxpemF0aW9uLmRlY29kZXIoXG4gICAgICBmaWVsZHNbXCJmbGFnc1wiXSxcbiAgICAgIGVuY29kaW5nLFxuICAgICAgXCJkZWNpbWFsU3RyaW5nXCIsXG4gICAgICBcIkJ1ZmZlclwiXG4gICAgKVxuICAgIGlmICh0aGlzLnVwZ3JhZGVWZXJzaW9uSUQudmVyc2lvbigpID4gMCkge1xuICAgICAgdGhpcy50b3RhbE1heFJld2FyZEFtb3VudCA9IHNlcmlhbGl6YXRpb24uZGVjb2RlcihcbiAgICAgICAgZmllbGRzW1widG90YWxNYXhSZXdhcmRBbW91bnRcIl0sXG4gICAgICAgIGVuY29kaW5nLFxuICAgICAgICBcImRlY2ltYWxTdHJpbmdcIixcbiAgICAgICAgXCJCdWZmZXJcIlxuICAgICAgKVxuICAgICAgdGhpcy5yZXdhcmRlZEFtb3VudCA9IHNlcmlhbGl6YXRpb24uZGVjb2RlcihcbiAgICAgICAgZmllbGRzW1wicmV3YXJkZWRBbW91bnRcIl0sXG4gICAgICAgIGVuY29kaW5nLFxuICAgICAgICBcImRlY2ltYWxTdHJpbmdcIixcbiAgICAgICAgXCJCdWZmZXJcIlxuICAgICAgKVxuXG4gICAgICB0aGlzLm93bmVyQWRkcmVzcyA9IHNlcmlhbGl6YXRpb24uZGVjb2RlcihcbiAgICAgICAgZmllbGRzW1wib3duZXJBZGRyZXNzXCJdLFxuICAgICAgICBlbmNvZGluZyxcbiAgICAgICAgXCJjYjU4XCIsXG4gICAgICAgIFwiQnVmZmVyXCJcbiAgICAgIClcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgc2VyaWFsaXplKGVuY29kaW5nOiBTZXJpYWxpemVkRW5jb2RpbmcgPSBcImhleFwiKTogb2JqZWN0IHtcbiAgICBsZXQgZmllbGRzID0ge1xuICAgICAgdXBncmFkZVZlcnNpb246IHNlcmlhbGl6YXRpb24uZW5jb2RlcihcbiAgICAgICAgdGhpcy51cGdyYWRlVmVyc2lvbklELnZlcnNpb24oKSxcbiAgICAgICAgZW5jb2RpbmcsXG4gICAgICAgIFwiQnVmZmVyXCIsXG4gICAgICAgIFwiZGVjaW1hbFN0cmluZ1wiXG4gICAgICApLFxuXG4gICAgICBpbnRlcmVzdFJhdGVOb21pbmF0b3I6IHNlcmlhbGl6YXRpb24uZW5jb2RlcihcbiAgICAgICAgdGhpcy5pbnRlcmVzdFJhdGVOb21pbmF0b3IsXG4gICAgICAgIGVuY29kaW5nLFxuICAgICAgICBcIkJ1ZmZlclwiLFxuICAgICAgICBcImRlY2ltYWxTdHJpbmdcIlxuICAgICAgKSxcblxuICAgICAgc3RhcnQ6IHNlcmlhbGl6YXRpb24uZW5jb2RlcihcbiAgICAgICAgdGhpcy5zdGFydCxcbiAgICAgICAgZW5jb2RpbmcsXG4gICAgICAgIFwiQnVmZmVyXCIsXG4gICAgICAgIFwiZGVjaW1hbFN0cmluZ1wiXG4gICAgICApLFxuICAgICAgZW5kOiBzZXJpYWxpemF0aW9uLmVuY29kZXIodGhpcy5lbmQsIGVuY29kaW5nLCBcIkJ1ZmZlclwiLCBcImRlY2ltYWxTdHJpbmdcIiksXG4gICAgICBtaW5BbW91bnQ6IHNlcmlhbGl6YXRpb24uZW5jb2RlcihcbiAgICAgICAgdGhpcy5taW5BbW91bnQsXG4gICAgICAgIGVuY29kaW5nLFxuICAgICAgICBcIkJ1ZmZlclwiLFxuICAgICAgICBcImRlY2ltYWxTdHJpbmdcIlxuICAgICAgKSxcbiAgICAgIHRvdGFsTWF4QW1vdW50OiBzZXJpYWxpemF0aW9uLmVuY29kZXIoXG4gICAgICAgIHRoaXMudG90YWxNYXhBbW91bnQsXG4gICAgICAgIGVuY29kaW5nLFxuICAgICAgICBcIkJ1ZmZlclwiLFxuICAgICAgICBcImRlY2ltYWxTdHJpbmdcIlxuICAgICAgKSxcbiAgICAgIGRlcG9zaXRlZEFtb3VudDogc2VyaWFsaXphdGlvbi5lbmNvZGVyKFxuICAgICAgICB0aGlzLmRlcG9zaXRlZEFtb3VudCxcbiAgICAgICAgZW5jb2RpbmcsXG4gICAgICAgIFwiQnVmZmVyXCIsXG4gICAgICAgIFwiZGVjaW1hbFN0cmluZ1wiXG4gICAgICApLFxuICAgICAgbWluRHVyYXRpb246IHNlcmlhbGl6YXRpb24uZW5jb2RlcihcbiAgICAgICAgdGhpcy5taW5EdXJhdGlvbixcbiAgICAgICAgZW5jb2RpbmcsXG4gICAgICAgIFwiQnVmZmVyXCIsXG4gICAgICAgIFwiZGVjaW1hbFN0cmluZ1wiXG4gICAgICApLFxuICAgICAgbWF4RHVyYXRpb246IHNlcmlhbGl6YXRpb24uZW5jb2RlcihcbiAgICAgICAgdGhpcy5tYXhEdXJhdGlvbixcbiAgICAgICAgZW5jb2RpbmcsXG4gICAgICAgIFwiQnVmZmVyXCIsXG4gICAgICAgIFwiZGVjaW1hbFN0cmluZ1wiXG4gICAgICApLFxuICAgICAgdW5sb2NrUGVyaW9kRHVyYXRpb246IHNlcmlhbGl6YXRpb24uZW5jb2RlcihcbiAgICAgICAgdGhpcy51bmxvY2tQZXJpb2REdXJhdGlvbixcbiAgICAgICAgZW5jb2RpbmcsXG4gICAgICAgIFwiQnVmZmVyXCIsXG4gICAgICAgIFwiZGVjaW1hbFN0cmluZ1wiXG4gICAgICApLFxuICAgICAgbm9SZXdhcmRzUGVyaW9kRHVyYXRpb246IHNlcmlhbGl6YXRpb24uZW5jb2RlcihcbiAgICAgICAgdGhpcy5ub1Jld2FyZHNQZXJpb2REdXJhdGlvbixcbiAgICAgICAgZW5jb2RpbmcsXG4gICAgICAgIFwiQnVmZmVyXCIsXG4gICAgICAgIFwiZGVjaW1hbFN0cmluZ1wiXG4gICAgICApLFxuICAgICAgbWVtbzogc2VyaWFsaXphdGlvbi5lbmNvZGVyKHRoaXMubWVtbywgZW5jb2RpbmcsIFwiQnVmZmVyXCIsIFwidXRmOFwiKSxcbiAgICAgIGZsYWdzOiBzZXJpYWxpemF0aW9uLmVuY29kZXIoXG4gICAgICAgIHRoaXMuZmxhZ3MsXG4gICAgICAgIGVuY29kaW5nLFxuICAgICAgICBcIkJ1ZmZlclwiLFxuICAgICAgICBcImRlY2ltYWxTdHJpbmdcIlxuICAgICAgKVxuICAgIH1cblxuICAgIGlmICh0aGlzLnVwZ3JhZGVWZXJzaW9uSUQudmVyc2lvbigpID4gMCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLi4uZmllbGRzLFxuICAgICAgICB0b3RhbE1heFJld2FyZEFtb3VudDogc2VyaWFsaXphdGlvbi5lbmNvZGVyKFxuICAgICAgICAgIHRoaXMudG90YWxNYXhSZXdhcmRBbW91bnQsXG4gICAgICAgICAgZW5jb2RpbmcsXG4gICAgICAgICAgXCJCdWZmZXJcIixcbiAgICAgICAgICBcImRlY2ltYWxTdHJpbmdcIlxuICAgICAgICApLFxuICAgICAgICByZXdhcmRlZEFtb3VudDogc2VyaWFsaXphdGlvbi5lbmNvZGVyKFxuICAgICAgICAgIHRoaXMucmV3YXJkZWRBbW91bnQsXG4gICAgICAgICAgZW5jb2RpbmcsXG4gICAgICAgICAgXCJCdWZmZXJcIixcbiAgICAgICAgICBcImRlY2ltYWxTdHJpbmdcIlxuICAgICAgICApLFxuICAgICAgICBvd25lckFkZHJlc3M6IHNlcmlhbGl6YXRpb24uZW5jb2RlcihcbiAgICAgICAgICB0aGlzLm93bmVyQWRkcmVzcyxcbiAgICAgICAgICBlbmNvZGluZyxcbiAgICAgICAgICBcIkJ1ZmZlclwiLFxuICAgICAgICAgIFwiY2I1OFwiXG4gICAgICAgIClcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZpZWxkc1xuICB9XG5cbiAgZnJvbUJ1ZmZlcihieXRlczogQnVmZmVyLCBvZmZzZXQ6IG51bWJlciA9IDApOiBudW1iZXIge1xuICAgIG9mZnNldCA9IHRoaXMudXBncmFkZVZlcnNpb25JRC5mcm9tQnVmZmVyKGJ5dGVzLCBvZmZzZXQpXG4gICAgdGhpcy5pbnRlcmVzdFJhdGVOb21pbmF0b3IgPSBiaW50b29scy5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyA4KVxuICAgIG9mZnNldCArPSA4XG4gICAgdGhpcy5zdGFydCA9IGJpbnRvb2xzLmNvcHlGcm9tKGJ5dGVzLCBvZmZzZXQsIG9mZnNldCArIDgpXG4gICAgb2Zmc2V0ICs9IDhcblxuICAgIHRoaXMuZW5kID0gYmludG9vbHMuY29weUZyb20oYnl0ZXMsIG9mZnNldCwgb2Zmc2V0ICsgOClcbiAgICBvZmZzZXQgKz0gOFxuICAgIHRoaXMubWluQW1vdW50ID0gYmludG9vbHMuY29weUZyb20oYnl0ZXMsIG9mZnNldCwgb2Zmc2V0ICsgOClcbiAgICBvZmZzZXQgKz0gOFxuICAgIHRoaXMudG90YWxNYXhBbW91bnQgPSBiaW50b29scy5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyA4KVxuICAgIG9mZnNldCArPSA4XG4gICAgdGhpcy5kZXBvc2l0ZWRBbW91bnQgPSBiaW50b29scy5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyA4KVxuICAgIG9mZnNldCArPSA4XG4gICAgdGhpcy5taW5EdXJhdGlvbiA9IGJpbnRvb2xzLmNvcHlGcm9tKGJ5dGVzLCBvZmZzZXQsIG9mZnNldCArIDQpXG4gICAgb2Zmc2V0ICs9IDRcbiAgICB0aGlzLm1heER1cmF0aW9uID0gYmludG9vbHMuY29weUZyb20oYnl0ZXMsIG9mZnNldCwgb2Zmc2V0ICsgNClcbiAgICBvZmZzZXQgKz0gNFxuICAgIHRoaXMudW5sb2NrUGVyaW9kRHVyYXRpb24gPSBiaW50b29scy5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyA0KVxuICAgIG9mZnNldCArPSA0XG4gICAgdGhpcy5ub1Jld2FyZHNQZXJpb2REdXJhdGlvbiA9IGJpbnRvb2xzLmNvcHlGcm9tKGJ5dGVzLCBvZmZzZXQsIG9mZnNldCArIDQpXG4gICAgb2Zmc2V0ICs9IDRcbiAgICBjb25zdCBtZW1vTGVuOiBudW1iZXIgPSBiaW50b29sc1xuICAgICAgLmNvcHlGcm9tKGJ5dGVzLCBvZmZzZXQsIG9mZnNldCArIDQpXG4gICAgICAucmVhZFVJbnQzMkJFKDApXG4gICAgb2Zmc2V0ICs9IDRcbiAgICB0aGlzLm1lbW8gPSBiaW50b29scy5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyBtZW1vTGVuKVxuXG4gICAgb2Zmc2V0ICs9IG1lbW9MZW5cbiAgICB0aGlzLmZsYWdzID0gYmludG9vbHMuY29weUZyb20oYnl0ZXMsIG9mZnNldCwgb2Zmc2V0ICsgOClcbiAgICBvZmZzZXQgKz0gOFxuICAgIGlmICh0aGlzLnVwZ3JhZGVWZXJzaW9uSUQudmVyc2lvbigpID4gMCkge1xuICAgICAgdGhpcy50b3RhbE1heFJld2FyZEFtb3VudCA9IGJpbnRvb2xzLmNvcHlGcm9tKGJ5dGVzLCBvZmZzZXQsIG9mZnNldCArIDgpXG4gICAgICBvZmZzZXQgKz0gOFxuICAgICAgdGhpcy5yZXdhcmRlZEFtb3VudCA9IGJpbnRvb2xzLmNvcHlGcm9tKGJ5dGVzLCBvZmZzZXQsIG9mZnNldCArIDgpXG4gICAgICBvZmZzZXQgKz0gOFxuICAgICAgdGhpcy5vd25lckFkZHJlc3MgPSBiaW50b29scy5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyAyMClcbiAgICAgIG9mZnNldCArPSAyMFxuICAgIH1cblxuICAgIHJldHVybiBvZmZzZXRcbiAgfVxuXG4gIHRvQnVmZmVyKCk6IEJ1ZmZlciB7XG4gICAgbGV0IG1lbW9MZW5ndGg6IEJ1ZmZlciA9IEJ1ZmZlci5hbGxvYyg0KVxuICAgIG1lbW9MZW5ndGgud3JpdGVVSW50MzJCRSh0aGlzLm1lbW8ubGVuZ3RoLCAwKVxuICAgIGxldCB1cGdyYWRlQnVmZmVyID0gdGhpcy51cGdyYWRlVmVyc2lvbklELnRvQnVmZmVyKClcbiAgICBsZXQgYnNpemU6IG51bWJlciA9XG4gICAgICB1cGdyYWRlQnVmZmVyLmxlbmd0aCArXG4gICAgICB0aGlzLmludGVyZXN0UmF0ZU5vbWluYXRvci5sZW5ndGggK1xuICAgICAgdGhpcy5zdGFydC5sZW5ndGggK1xuICAgICAgdGhpcy5lbmQubGVuZ3RoICtcbiAgICAgIHRoaXMubWluQW1vdW50Lmxlbmd0aCArXG4gICAgICB0aGlzLnRvdGFsTWF4QW1vdW50Lmxlbmd0aCArXG4gICAgICB0aGlzLmRlcG9zaXRlZEFtb3VudC5sZW5ndGggK1xuICAgICAgdGhpcy5taW5EdXJhdGlvbi5sZW5ndGggK1xuICAgICAgdGhpcy5tYXhEdXJhdGlvbi5sZW5ndGggK1xuICAgICAgdGhpcy51bmxvY2tQZXJpb2REdXJhdGlvbi5sZW5ndGggK1xuICAgICAgdGhpcy5ub1Jld2FyZHNQZXJpb2REdXJhdGlvbi5sZW5ndGggK1xuICAgICAgbWVtb0xlbmd0aC5sZW5ndGggK1xuICAgICAgdGhpcy5tZW1vLmxlbmd0aCArXG4gICAgICB0aGlzLmZsYWdzLmxlbmd0aFxuXG4gICAgY29uc3QgYnVmZmVyOiBCdWZmZXJbXSA9IFtcbiAgICAgIHVwZ3JhZGVCdWZmZXIsXG4gICAgICB0aGlzLmludGVyZXN0UmF0ZU5vbWluYXRvcixcbiAgICAgIHRoaXMuc3RhcnQsXG4gICAgICB0aGlzLmVuZCxcbiAgICAgIHRoaXMubWluQW1vdW50LFxuICAgICAgdGhpcy50b3RhbE1heEFtb3VudCxcbiAgICAgIHRoaXMuZGVwb3NpdGVkQW1vdW50LFxuICAgICAgdGhpcy5taW5EdXJhdGlvbixcbiAgICAgIHRoaXMubWF4RHVyYXRpb24sXG4gICAgICB0aGlzLnVubG9ja1BlcmlvZER1cmF0aW9uLFxuICAgICAgdGhpcy5ub1Jld2FyZHNQZXJpb2REdXJhdGlvbixcbiAgICAgIG1lbW9MZW5ndGgsXG4gICAgICB0aGlzLm1lbW8sXG4gICAgICB0aGlzLmZsYWdzXG4gICAgXVxuXG4gICAgaWYgKHRoaXMudXBncmFkZVZlcnNpb25JRC52ZXJzaW9uKCkgPiAwKSB7XG4gICAgICBic2l6ZSArPVxuICAgICAgICB0aGlzLnRvdGFsTWF4UmV3YXJkQW1vdW50Lmxlbmd0aCArXG4gICAgICAgIHRoaXMucmV3YXJkZWRBbW91bnQubGVuZ3RoICtcbiAgICAgICAgdGhpcy5vd25lckFkZHJlc3MubGVuZ3RoXG4gICAgICBidWZmZXIucHVzaChcbiAgICAgICAgdGhpcy50b3RhbE1heFJld2FyZEFtb3VudCxcbiAgICAgICAgdGhpcy5yZXdhcmRlZEFtb3VudCxcbiAgICAgICAgdGhpcy5vd25lckFkZHJlc3NcbiAgICAgIClcbiAgICB9XG4gICAgcmV0dXJuIEJ1ZmZlci5jb25jYXQoYnVmZmVyLCBic2l6ZSlcbiAgfVxufVxuXG4vKipcbiAqIENsYXNzIHJlcHJlc2VudGluZyBhbiB1bnNpZ25lZCBBZGREZXBvc2l0T2ZmZXJUeCB0cmFuc2FjdGlvbi5cbiAqL1xuZXhwb3J0IGNsYXNzIEFkZERlcG9zaXRPZmZlclR4IGV4dGVuZHMgQmFzZVR4IHtcbiAgcHJvdGVjdGVkIF90eXBlTmFtZSA9IFwiQWRkRGVwb3NpdE9mZmVyVHhcIlxuICBwcm90ZWN0ZWQgX3R5cGVJRCA9IFBsYXRmb3JtVk1Db25zdGFudHMuQUREREVQT1NJVE9GRkVSVFhcblxuICBzZXJpYWxpemUoZW5jb2Rpbmc6IFNlcmlhbGl6ZWRFbmNvZGluZyA9IFwiaGV4XCIpOiBvYmplY3Qge1xuICAgIGxldCBmaWVsZHM6IG9iamVjdCA9IHN1cGVyLnNlcmlhbGl6ZShlbmNvZGluZylcbiAgICByZXR1cm4ge1xuICAgICAgLi4uZmllbGRzLFxuICAgICAgZGVwb3NpdE9mZmVyOiB0aGlzLmRlcG9zaXRPZmZlci5zZXJpYWxpemUoZW5jb2RpbmcpLFxuICAgICAgZGVwb3NpdE9mZmVyQ3JlYXRvckFkZHJlc3M6IHNlcmlhbGl6YXRpb24uZW5jb2RlcihcbiAgICAgICAgdGhpcy5kZXBvc2l0T2ZmZXJDcmVhdG9yQWRkcmVzcyxcbiAgICAgICAgZW5jb2RpbmcsXG4gICAgICAgIFwiQnVmZmVyXCIsXG4gICAgICAgIFwiY2I1OFwiXG4gICAgICApLFxuICAgICAgZGVwb3NpdE9mZmVyQ3JlYXRvckF1dGg6IHRoaXMuZGVwb3NpdE9mZmVyQ3JlYXRvckF1dGguc2VyaWFsaXplKGVuY29kaW5nKVxuICAgIH1cbiAgfVxuICBkZXNlcmlhbGl6ZShmaWVsZHM6IG9iamVjdCwgZW5jb2Rpbmc6IFNlcmlhbGl6ZWRFbmNvZGluZyA9IFwiaGV4XCIpIHtcbiAgICBzdXBlci5kZXNlcmlhbGl6ZShmaWVsZHMsIGVuY29kaW5nKVxuICAgIHRoaXMuZGVwb3NpdE9mZmVyID0gbmV3IE9mZmVyKCkuZGVzZXJpYWxpemUoXG4gICAgICBmaWVsZHNbXCJkZXBvc2l0T2ZmZXJcIl0sXG4gICAgICBlbmNvZGluZ1xuICAgIClcbiAgICB0aGlzLmRlcG9zaXRPZmZlckNyZWF0b3JBZGRyZXNzID0gc2VyaWFsaXphdGlvbi5kZWNvZGVyKFxuICAgICAgZmllbGRzW1wiZGVwb3NpdE9mZmVyQ3JlYXRvckFkZHJlc3NcIl0sXG4gICAgICBlbmNvZGluZyxcbiAgICAgIFwiY2I1OFwiLFxuICAgICAgXCJCdWZmZXJcIlxuICAgIClcbiAgICB0aGlzLmRlcG9zaXRPZmZlckNyZWF0b3JBdXRoLmRlc2VyaWFsaXplKFxuICAgICAgZmllbGRzW1wiZGVwb3NpdE9mZmVyQ3JlYXRvckF1dGhcIl0sXG4gICAgICBlbmNvZGluZ1xuICAgIClcbiAgfVxuXG4gIC8vIFRoZSBkZXBvc2l0IG9mZmVyIHRvIGFkZFxuICBwcm90ZWN0ZWQgZGVwb3NpdE9mZmVyOiBPZmZlclxuICAvLyBUaGUgYWRkcmVzcyBvZiB0aGUgYWNjb3VudCB0aGF0IGNyZWF0ZXMgdGhlIGRlcG9zaXQgb2ZmZXJcbiAgcHJvdGVjdGVkIGRlcG9zaXRPZmZlckNyZWF0b3JBZGRyZXNzOiBCdWZmZXIgPSBCdWZmZXIuYWxsb2MoMjApXG4gIC8vIFRoZSBhdXRoIG9mIHRoZSBkZXBvc2l0IG9mZmVyIGNyZWF0b3IgYWRkcmVzc1xuICBwcm90ZWN0ZWQgZGVwb3NpdE9mZmVyQ3JlYXRvckF1dGg6IFN1Ym5ldEF1dGhcbiAgcHJvdGVjdGVkIHNpZ0NvdW50OiBCdWZmZXIgPSBCdWZmZXIuYWxsb2MoNClcbiAgcHJvdGVjdGVkIHNpZ0lkeHM6IFNpZ0lkeFtdID0gW10gLy8gaWR4cyBvZiBzaWduZXJzXG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYW5kIGFkZHMgYSBbW1NpZ0lkeF1dIHRvIHRoZSBbW0FkZERlcG9zaXRPZmZlclR4XV0uXG4gICAqXG4gICAqIEBwYXJhbSBhZGRyZXNzSWR4IFRoZSBpbmRleCBvZiB0aGUgYWRkcmVzcyB0byByZWZlcmVuY2UgaW4gdGhlIHNpZ25hdHVyZXNcbiAgICogQHBhcmFtIGFkZHJlc3MgVGhlIGFkZHJlc3Mgb2YgdGhlIHNvdXJjZSBvZiB0aGUgc2lnbmF0dXJlXG4gICAqL1xuICBhZGRTaWduYXR1cmVJZHgoYWRkcmVzc0lkeDogbnVtYmVyLCBhZGRyZXNzOiBCdWZmZXIpOiB2b2lkIHtcbiAgICBjb25zdCBhZGRyZXNzSW5kZXg6IEJ1ZmZlciA9IEJ1ZmZlci5hbGxvYyg0KVxuICAgIGFkZHJlc3NJbmRleC53cml0ZVVJbnRCRShhZGRyZXNzSWR4LCAwLCA0KVxuICAgIHRoaXMuZGVwb3NpdE9mZmVyQ3JlYXRvckF1dGguYWRkQWRkcmVzc0luZGV4KGFkZHJlc3NJbmRleClcblxuICAgIGNvbnN0IHNpZ2lkeDogU2lnSWR4ID0gbmV3IFNpZ0lkeCgpXG4gICAgY29uc3QgYjogQnVmZmVyID0gQnVmZmVyLmFsbG9jKDQpXG4gICAgYi53cml0ZVVJbnQzMkJFKGFkZHJlc3NJZHgsIDApXG4gICAgc2lnaWR4LmZyb21CdWZmZXIoYilcbiAgICBzaWdpZHguc2V0U291cmNlKGFkZHJlc3MpXG4gICAgdGhpcy5zaWdJZHhzLnB1c2goc2lnaWR4KVxuICAgIHRoaXMuc2lnQ291bnQud3JpdGVVSW50MzJCRSh0aGlzLnNpZ0lkeHMubGVuZ3RoLCAwKVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGlkIG9mIHRoZSBbW1JlZ2lzdGVyTm9kZVR4XV1cbiAgICovXG4gIGdldFR4VHlwZSgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl90eXBlSURcbiAgfVxuXG4gIGdldERlcG9zaXRPZmZlcigpOiBPZmZlciB7XG4gICAgcmV0dXJuIHRoaXMuZGVwb3NpdE9mZmVyXG4gIH1cbiAgZ2V0RGVwb3NpdE9mZmVyQ3JlYXRvckFkZHJlc3MoKTogQnVmZmVyIHtcbiAgICByZXR1cm4gdGhpcy5kZXBvc2l0T2ZmZXJDcmVhdG9yQWRkcmVzc1xuICB9XG4gIGdldERlcG9zaXRPZmZlckNyZWF0b3JBdXRoKCk6IFN1Ym5ldEF1dGgge1xuICAgIHJldHVybiB0aGlzLmRlcG9zaXRPZmZlckNyZWF0b3JBdXRoXG4gIH1cbiAgZ2V0U2lnSWR4cygpOiBTaWdJZHhbXSB7XG4gICAgcmV0dXJuIHRoaXMuc2lnSWR4c1xuICB9XG5cbiAgLyoqXG4gICAqIFRha2VzIHRoZSBieXRlcyBvZiBhbiBbW1Vuc2lnbmVkVHhdXSBhbmQgcmV0dXJucyBhbiBhcnJheSBvZiBbW0NyZWRlbnRpYWxdXXNcbiAgICpcbiAgICogQHBhcmFtIG1zZyBBIEJ1ZmZlciBmb3IgdGhlIFtbVW5zaWduZWRUeF1dXG4gICAqIEBwYXJhbSBrYyBBbiBbW0tleUNoYWluXV0gdXNlZCBpbiBzaWduaW5nXG4gICAqXG4gICAqIEByZXR1cm5zIEFuIGFycmF5IG9mIFtbQ3JlZGVudGlhbF1dc1xuICAgKi9cbiAgc2lnbihtc2c6IEJ1ZmZlciwga2M6IEtleUNoYWluKTogQ3JlZGVudGlhbFtdIHtcbiAgICBjb25zdCBjcmVkczogQ3JlZGVudGlhbFtdID0gc3VwZXIuc2lnbihtc2csIGtjKVxuICAgIGNvbnN0IGNyZWQ6IENyZWRlbnRpYWwgPSBTZWxlY3RDcmVkZW50aWFsQ2xhc3MoXG4gICAgICBQbGF0Zm9ybVZNQ29uc3RhbnRzLlNFQ1BDUkVERU5USUFMXG4gICAgKVxuICAgIGZvciAoY29uc3Qgc2lnaWR4IG9mIHRoaXMuc2lnSWR4cykge1xuICAgICAgY29uc3Qga2V5cGFpcjogS2V5UGFpciA9IGtjLmdldEtleShzaWdpZHguZ2V0U291cmNlKCkpXG4gICAgICBjb25zdCBzaWdudmFsOiBCdWZmZXIgPSBrZXlwYWlyLnNpZ24obXNnKVxuICAgICAgY29uc3Qgc2lnOiBTaWduYXR1cmUgPSBuZXcgU2lnbmF0dXJlKClcbiAgICAgIHNpZy5mcm9tQnVmZmVyKHNpZ252YWwpXG4gICAgICBjcmVkLmFkZFNpZ25hdHVyZShzaWcpXG4gICAgfVxuICAgIGNyZWRzLnB1c2goY3JlZClcbiAgICByZXR1cm4gY3JlZHNcbiAgfVxuXG4gIC8qKlxuICAgKiBUYWtlcyBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IGNvbnRhaW5pbmcgYSBbW0FkZERlcG9zaXRPZmZlclR4XV0sIHBhcnNlcyBpdCwgcG9wdWxhdGVzIHRoZSBjbGFzcywgYW5kIHJldHVybnMgdGhlIGxlbmd0aCBvZiB0aGUgW1tBZGREZXBvc2l0T2ZmZXJUeF1dIGluIGJ5dGVzLlxuICAgKlxuICAgKiBAcGFyYW0gYnl0ZXMgQSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBjb250YWluaW5nIGEgcmF3IFtbQWRkRGVwb3NpdE9mZmVyVHhdXVxuICAgKlxuICAgKiBAcmV0dXJucyBUaGUgbGVuZ3RoIG9mIHRoZSByYXcgW1tBZGREZXBvc2l0T2ZmZXJUeF1dXG4gICAqXG4gICAqIEByZW1hcmtzIGFzc3VtZSBub3QtY2hlY2tzdW1tZWRcbiAgICovXG4gIGZyb21CdWZmZXIoYnl0ZXM6IEJ1ZmZlciwgb2Zmc2V0OiBudW1iZXIgPSAwKTogbnVtYmVyIHtcbiAgICBvZmZzZXQgPSBzdXBlci5mcm9tQnVmZmVyKGJ5dGVzLCBvZmZzZXQpXG5cbiAgICBjb25zdCBkZXBvc2l0T2ZmZXI6IE9mZmVyID0gbmV3IE9mZmVyKClcbiAgICBvZmZzZXQgPSBkZXBvc2l0T2ZmZXIuZnJvbUJ1ZmZlcihieXRlcywgb2Zmc2V0KVxuICAgIHRoaXMuZGVwb3NpdE9mZmVyID0gZGVwb3NpdE9mZmVyXG5cbiAgICB0aGlzLmRlcG9zaXRPZmZlckNyZWF0b3JBZGRyZXNzID0gYmludG9vbHMuY29weUZyb20oXG4gICAgICBieXRlcyxcbiAgICAgIG9mZnNldCxcbiAgICAgIG9mZnNldCArIDIwXG4gICAgKVxuICAgIG9mZnNldCArPSAyMFxuXG4gICAgY29uc3Qgc2E6IFN1Ym5ldEF1dGggPSBuZXcgU3VibmV0QXV0aCgpXG4gICAgb2Zmc2V0ICs9IHNhLmZyb21CdWZmZXIoYmludG9vbHMuY29weUZyb20oYnl0ZXMsIG9mZnNldCkpXG4gICAgdGhpcy5kZXBvc2l0T2ZmZXJDcmVhdG9yQXV0aCA9IHNhXG5cbiAgICByZXR1cm4gb2Zmc2V0XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IHJlcHJlc2VudGF0aW9uIG9mIHRoZSBbW0FkZERlcG9zaXRPZmZlclR4XV0uXG4gICAqL1xuICB0b0J1ZmZlcigpOiBCdWZmZXIge1xuICAgIGNvbnN0IHN1cGVyYnVmZjogQnVmZmVyID0gc3VwZXIudG9CdWZmZXIoKVxuXG4gICAgbGV0IGJzaXplOiBudW1iZXIgPSBzdXBlcmJ1ZmYubGVuZ3RoXG5cbiAgICBjb25zdCBkZXBvc2l0T2ZmZXJCdWZmZXI6IEJ1ZmZlciA9IHRoaXMuZGVwb3NpdE9mZmVyLnRvQnVmZmVyKClcbiAgICBic2l6ZSArPSBkZXBvc2l0T2ZmZXJCdWZmZXIubGVuZ3RoXG5cbiAgICBjb25zdCBhdXRoQnVmZmVyOiBCdWZmZXIgPSB0aGlzLmRlcG9zaXRPZmZlckNyZWF0b3JBdXRoLnRvQnVmZmVyKClcbiAgICBic2l6ZSArPSBhdXRoQnVmZmVyLmxlbmd0aFxuXG4gICAgY29uc3QgYmFycjogQnVmZmVyW10gPSBbXG4gICAgICBzdXBlcmJ1ZmYsXG4gICAgICBkZXBvc2l0T2ZmZXJCdWZmZXIsXG4gICAgICB0aGlzLmRlcG9zaXRPZmZlckNyZWF0b3JBZGRyZXNzLFxuICAgICAgYXV0aEJ1ZmZlclxuICAgIF1cblxuICAgIHJldHVybiBCdWZmZXIuY29uY2F0KGJhcnIsIGJzaXplICsgMjApXG4gIH1cblxuICBjbG9uZSgpOiB0aGlzIHtcbiAgICBjb25zdCBuZXdBZGREZXBvc2l0T2ZmZXJUeDogQWRkRGVwb3NpdE9mZmVyVHggPSBuZXcgQWRkRGVwb3NpdE9mZmVyVHgoKVxuICAgIG5ld0FkZERlcG9zaXRPZmZlclR4LmZyb21CdWZmZXIodGhpcy50b0J1ZmZlcigpKVxuICAgIHJldHVybiBuZXdBZGREZXBvc2l0T2ZmZXJUeCBhcyB0aGlzXG4gIH1cblxuICBjcmVhdGUoLi4uYXJnczogYW55W10pOiB0aGlzIHtcbiAgICByZXR1cm4gbmV3IEFkZERlcG9zaXRPZmZlclR4KC4uLmFyZ3MpIGFzIHRoaXNcbiAgfVxuXG4gIC8qKlxuICAgKiBDbGFzcyByZXByZXNlbnRpbmcgYW4gdW5zaWduZWQgQWRkRGVwb3NpdE9mZmVyVHggdHJhbnNhY3Rpb24uXG4gICAqXG4gICAqIEBwYXJhbSBuZXR3b3JrSUQgT3B0aW9uYWwgbmV0d29ya0lELCBbW0RlZmF1bHROZXR3b3JrSURdXVxuICAgKiBAcGFyYW0gYmxvY2tjaGFpbklEIE9wdGlvbmFsIGJsb2NrY2hhaW5JRCwgZGVmYXVsdCBCdWZmZXIuYWxsb2MoMzIsIDE2KVxuICAgKiBAcGFyYW0gb3V0cyBPcHRpb25hbCBhcnJheSBvZiB0aGUgW1tUcmFuc2ZlcmFibGVPdXRwdXRdXXNcbiAgICogQHBhcmFtIGlucyBPcHRpb25hbCBhcnJheSBvZiB0aGUgW1tUcmFuc2ZlcmFibGVJbnB1dF1dc1xuICAgKiBAcGFyYW0gbWVtbyBPcHRpb25hbCB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBmb3IgdGhlIG1lbW8gZmllbGRcbiAgICogQHBhcmFtIGRlcG9zaXRPZmZlciBPZmZlciB0byBiZSB1c2VkIGZvciB0aGlzIGRlcG9zaXRcbiAgICogQHBhcmFtIGRlcG9zaXRPZmZlckNyZWF0b3JBZGRyZXNzIEFkZHJlc3Mgb2YgdGhlIG5vZGUgdGhhdCBjcmVhdGVkIHRoZSBvZmZlclxuICAgKi9cbiAgY29uc3RydWN0b3IoXG4gICAgbmV0d29ya0lEOiBudW1iZXIgPSBEZWZhdWx0TmV0d29ya0lELFxuICAgIGJsb2NrY2hhaW5JRDogQnVmZmVyID0gQnVmZmVyLmFsbG9jKDMyLCAxNiksXG4gICAgb3V0czogVHJhbnNmZXJhYmxlT3V0cHV0W10gPSB1bmRlZmluZWQsXG4gICAgaW5zOiBUcmFuc2ZlcmFibGVJbnB1dFtdID0gdW5kZWZpbmVkLFxuICAgIG1lbW86IEJ1ZmZlciA9IHVuZGVmaW5lZCxcbiAgICBkZXBvc2l0T2ZmZXI6IE9mZmVyID0gdW5kZWZpbmVkLFxuICAgIGRlcG9zaXRPZmZlckNyZWF0b3JBZGRyZXNzOiBCdWZmZXIgPSB1bmRlZmluZWRcbiAgKSB7XG4gICAgc3VwZXIobmV0d29ya0lELCBibG9ja2NoYWluSUQsIG91dHMsIGlucywgbWVtbylcbiAgICBpZiAodHlwZW9mIGRlcG9zaXRPZmZlciAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgdGhpcy5kZXBvc2l0T2ZmZXIgPSBkZXBvc2l0T2ZmZXJcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5kZXBvc2l0T2ZmZXIgPSBuZXcgT2ZmZXIoKVxuICAgIH1cblxuICAgIGlmICh0eXBlb2YgZGVwb3NpdE9mZmVyQ3JlYXRvckFkZHJlc3MgIT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgdGhpcy5kZXBvc2l0T2ZmZXJDcmVhdG9yQWRkcmVzcyA9IGRlcG9zaXRPZmZlckNyZWF0b3JBZGRyZXNzXG4gICAgfVxuICAgIHRoaXMuZGVwb3NpdE9mZmVyQ3JlYXRvckF1dGggPSBuZXcgU3VibmV0QXV0aCgpXG4gIH1cbn1cbiJdfQ==
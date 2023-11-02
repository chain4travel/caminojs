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
    getUpgradeVersionID() {
        return this.upgradeVersionID;
    }
    getInterestRateNominator() {
        return this.interestRateNominator;
    }
    getStart() {
        return this.start;
    }
    getEnd() {
        return this.end;
    }
    getMinAmount() {
        return this.minAmount;
    }
    getTotalMaxAmount() {
        return this.totalMaxAmount;
    }
    getDepositedAmount() {
        return this.depositedAmount;
    }
    getMinDuration() {
        return this.minDuration;
    }
    getMaxDuration() {
        return this.maxDuration;
    }
    getUnlockPeriodDuration() {
        return this.unlockPeriodDuration;
    }
    getNoRewardsPeriodDuration() {
        return this.noRewardsPeriodDuration;
    }
    getMemo() {
        return this.memo;
    }
    getFlags() {
        return this.flags;
    }
    getTotalMaxRewardAmount() {
        return this.totalMaxRewardAmount;
    }
    getRewardedAmount() {
        return this.rewardedAmount;
    }
    getOwnerAddress() {
        return this.ownerAddress;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRkZGVwb3NpdG9mZmVydHguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYXBpcy9wbGF0Zm9ybXZtL2FkZGRlcG9zaXRvZmZlcnR4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBOzs7R0FHRztBQUNILG9DQUFnQztBQUNoQyxvRUFBMkM7QUFDM0MsMkNBQWlEO0FBR2pELHFDQUFpQztBQUNqQyxxREFBd0Q7QUFDeEQsNkRBQTZFO0FBQzdFLGtEQUFzQjtBQUN0QixpRUFBNkQ7QUFDN0QseUNBQThFO0FBRTlFLG1FQUF5RTtBQUV6RTs7R0FFRztBQUNILE1BQU0sUUFBUSxHQUFhLGtCQUFRLENBQUMsV0FBVyxFQUFFLENBQUE7QUFDakQsTUFBTSxhQUFhLEdBQWtCLDZCQUFhLENBQUMsV0FBVyxFQUFFLENBQUE7QUFFaEUsSUFBWSxTQUdYO0FBSEQsV0FBWSxTQUFTO0lBQ25CLHVCQUFVLENBQUE7SUFDVix5QkFBWSxDQUFBO0FBQ2QsQ0FBQyxFQUhXLFNBQVMsR0FBVCxpQkFBUyxLQUFULGlCQUFTLFFBR3BCO0FBRUQsTUFBYSxLQUFLO0lBa0JoQixZQUNFLGlCQUF5QixTQUFTLEVBQ2xDLHdCQUE0QixTQUFTLEVBQ3JDLFFBQVksU0FBUyxFQUNyQixNQUFVLFNBQVMsRUFDbkIsWUFBZ0IsU0FBUyxFQUN6QixpQkFBcUIsU0FBUyxFQUM5QixrQkFBc0IsU0FBUyxFQUMvQixjQUFzQixTQUFTLEVBQy9CLGNBQXNCLFNBQVMsRUFDL0IsdUJBQStCLFNBQVMsRUFDeEMsMEJBQWtDLFNBQVMsRUFDM0MsT0FBZSxTQUFTLEVBQ3hCLE9BQXVCLFNBQVMsRUFDaEMsdUJBQTJCLFNBQVMsRUFDcEMsaUJBQXFCLFNBQVMsRUFDOUIsZUFBdUIsU0FBUztRQWhDeEIsMEJBQXFCLEdBQUcsZUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUN2QyxVQUFLLEdBQUcsZUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUN2QixRQUFHLEdBQUcsZUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNyQixjQUFTLEdBQUcsZUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUMzQixtQkFBYyxHQUFHLGVBQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDaEMsb0JBQWUsR0FBRyxlQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2pDLGdCQUFXLEdBQUcsZUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUM3QixnQkFBVyxHQUFHLGVBQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDN0IseUJBQW9CLEdBQUcsZUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUN0Qyw0QkFBdUIsR0FBRyxlQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3pDLFNBQUksR0FBRyxlQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3RCLFVBQUssR0FBRyxlQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3ZCLHlCQUFvQixHQUFHLGVBQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDdEMsbUJBQWMsR0FBRyxlQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2hDLGlCQUFZLEdBQUcsZUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQW9CdkMsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUkseUJBQWdCLENBQUMsY0FBYyxhQUFkLGNBQWMsY0FBZCxjQUFjLEdBQUksQ0FBQyxDQUFDLENBQUE7UUFDakUsSUFBSSxDQUFDLHFCQUFxQixHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQ2xELElBQUksZUFBRSxDQUFDLHFCQUFxQixDQUFDLEVBQzdCLENBQUMsQ0FDRixDQUFBO1FBQ0QsSUFBSSxPQUFPLEtBQUssS0FBSyxXQUFXLEVBQUU7WUFDaEMsSUFBSSxDQUFDLEtBQUssR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLElBQUksZUFBRSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFBO1NBQ3ZEO1FBQ0QsSUFBSSxPQUFPLEdBQUcsS0FBSyxXQUFXLEVBQUU7WUFDOUIsSUFBSSxDQUFDLEdBQUcsR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLElBQUksZUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFBO1NBQ25EO1FBQ0QsSUFBSSxPQUFPLFNBQVMsS0FBSyxXQUFXLEVBQUU7WUFDcEMsSUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLElBQUksZUFBRSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFBO1NBQy9EO1FBQ0QsSUFBSSxPQUFPLGNBQWMsS0FBSyxXQUFXLEVBQUU7WUFDekMsSUFBSSxDQUFDLGNBQWMsR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLElBQUksZUFBRSxDQUFDLGNBQWMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFBO1NBQ3pFO1FBQ0QsSUFBSSxPQUFPLGVBQWUsS0FBSyxXQUFXLEVBQUU7WUFDMUMsSUFBSSxDQUFDLGVBQWUsR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLElBQUksZUFBRSxDQUFDLGVBQWUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFBO1NBQzNFO1FBQ0QsSUFBSSxPQUFPLFdBQVcsS0FBSyxXQUFXLEVBQUU7WUFDdEMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFBO1NBQy9DO1FBQ0QsSUFBSSxPQUFPLFdBQVcsS0FBSyxXQUFXLEVBQUU7WUFDdEMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFBO1NBQy9DO1FBQ0QsSUFBSSxPQUFPLG9CQUFvQixLQUFLLFdBQVcsRUFBRTtZQUMvQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsYUFBYSxDQUFDLG9CQUFvQixFQUFFLENBQUMsQ0FBQyxDQUFBO1NBQ2pFO1FBQ0QsSUFBSSxPQUFPLHVCQUF1QixLQUFLLFdBQVcsRUFBRTtZQUNsRCxJQUFJLENBQUMsdUJBQXVCLENBQUMsYUFBYSxDQUFDLHVCQUF1QixFQUFFLENBQUMsQ0FBQyxDQUFBO1NBQ3ZFO1FBQ0QsSUFBSSxPQUFPLElBQUksS0FBSyxXQUFXLEVBQUU7WUFDL0IsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUE7U0FDakI7UUFDRCxJQUFJLE9BQU8sSUFBSSxJQUFJLFdBQVcsRUFBRTtZQUM5QixJQUFJLElBQUksWUFBWSxlQUFFLEVBQUU7Z0JBQ3RCLElBQUksQ0FBQyxLQUFLLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUE7YUFDOUM7aUJBQU07Z0JBQ0wsSUFBSSxDQUFDLEtBQUssR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLElBQUksZUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFBO2FBQ3REO1NBQ0Y7UUFDRCxJQUFJLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLEVBQUU7WUFDdkMsSUFBSSxPQUFPLG9CQUFvQixLQUFLLFdBQVcsRUFBRTtnQkFDL0MsSUFBSSxDQUFDLG9CQUFvQixHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQ2pELElBQUksZUFBRSxDQUFDLG9CQUFvQixDQUFDLEVBQzVCLENBQUMsQ0FDRixDQUFBO2FBQ0Y7WUFDRCxJQUFJLE9BQU8sY0FBYyxLQUFLLFdBQVcsRUFBRTtnQkFDekMsSUFBSSxDQUFDLGNBQWMsR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLElBQUksZUFBRSxDQUFDLGNBQWMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFBO2FBQ3pFO1lBQ0QsSUFBSSxPQUFPLFlBQVksSUFBSSxXQUFXLEVBQUU7Z0JBQ3RDLElBQUksQ0FBQyxZQUFZLEdBQUcsWUFBWSxDQUFBO2FBQ2pDO1NBQ0Y7SUFDSCxDQUFDO0lBRUQsV0FBVyxDQUFDLE1BQWMsRUFBRSxXQUErQixLQUFLO1FBQzlELE1BQU0sY0FBYyxHQUFHLGFBQWEsQ0FBQyxPQUFPLENBQzFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxFQUN4QixRQUFRLEVBQ1IsZUFBZSxFQUNmLFFBQVEsQ0FDVCxDQUFBO1FBQ0QsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUkseUJBQWdCLENBQUMsY0FBYyxDQUFDLENBQUE7UUFFNUQsSUFBSSxDQUFDLHFCQUFxQixHQUFHLGFBQWEsQ0FBQyxPQUFPLENBQ2hELE1BQU0sQ0FBQyx1QkFBdUIsQ0FBQyxFQUMvQixRQUFRLEVBQ1IsZUFBZSxFQUNmLFFBQVEsQ0FDVCxDQUFBO1FBQ0QsSUFBSSxDQUFDLEtBQUssR0FBRyxhQUFhLENBQUMsT0FBTyxDQUNoQyxNQUFNLENBQUMsT0FBTyxDQUFDLEVBQ2YsUUFBUSxFQUNSLGVBQWUsRUFDZixRQUFRLENBQ1QsQ0FBQTtRQUNELElBQUksQ0FBQyxHQUFHLEdBQUcsYUFBYSxDQUFDLE9BQU8sQ0FDOUIsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUNiLFFBQVEsRUFDUixlQUFlLEVBQ2YsUUFBUSxDQUNULENBQUE7UUFDRCxJQUFJLENBQUMsU0FBUyxHQUFHLGFBQWEsQ0FBQyxPQUFPLENBQ3BDLE1BQU0sQ0FBQyxXQUFXLENBQUMsRUFDbkIsUUFBUSxFQUNSLGVBQWUsRUFDZixRQUFRLENBQ1QsQ0FBQTtRQUNELElBQUksQ0FBQyxjQUFjLEdBQUcsYUFBYSxDQUFDLE9BQU8sQ0FDekMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLEVBQ3hCLFFBQVEsRUFDUixlQUFlLEVBQ2YsUUFBUSxDQUNULENBQUE7UUFDRCxJQUFJLENBQUMsZUFBZSxHQUFHLGFBQWEsQ0FBQyxPQUFPLENBQzFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxFQUN6QixRQUFRLEVBQ1IsZUFBZSxFQUNmLFFBQVEsQ0FDVCxDQUFBO1FBQ0QsSUFBSSxDQUFDLFdBQVcsR0FBRyxhQUFhLENBQUMsT0FBTyxDQUN0QyxNQUFNLENBQUMsYUFBYSxDQUFDLEVBQ3JCLFFBQVEsRUFDUixlQUFlLEVBQ2YsUUFBUSxDQUNULENBQUE7UUFDRCxJQUFJLENBQUMsV0FBVyxHQUFHLGFBQWEsQ0FBQyxPQUFPLENBQ3RDLE1BQU0sQ0FBQyxhQUFhLENBQUMsRUFDckIsUUFBUSxFQUNSLGVBQWUsRUFDZixRQUFRLENBQ1QsQ0FBQTtRQUNELElBQUksQ0FBQyxvQkFBb0IsR0FBRyxhQUFhLENBQUMsT0FBTyxDQUMvQyxNQUFNLENBQUMsc0JBQXNCLENBQUMsRUFDOUIsUUFBUSxFQUNSLGVBQWUsRUFDZixRQUFRLENBQ1QsQ0FBQTtRQUNELElBQUksQ0FBQyx1QkFBdUIsR0FBRyxhQUFhLENBQUMsT0FBTyxDQUNsRCxNQUFNLENBQUMseUJBQXlCLENBQUMsRUFDakMsUUFBUSxFQUNSLGVBQWUsRUFDZixRQUFRLENBQ1QsQ0FBQTtRQUNELElBQUksQ0FBQyxJQUFJLEdBQUcsYUFBYSxDQUFDLE9BQU8sQ0FDL0IsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUNkLFFBQVEsRUFDUixNQUFNLEVBQ04sUUFBUSxDQUNULENBQUE7UUFDRCxJQUFJLENBQUMsS0FBSyxHQUFHLGFBQWEsQ0FBQyxPQUFPLENBQ2hDLE1BQU0sQ0FBQyxPQUFPLENBQUMsRUFDZixRQUFRLEVBQ1IsZUFBZSxFQUNmLFFBQVEsQ0FDVCxDQUFBO1FBQ0QsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxFQUFFO1lBQ3ZDLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxhQUFhLENBQUMsT0FBTyxDQUMvQyxNQUFNLENBQUMsc0JBQXNCLENBQUMsRUFDOUIsUUFBUSxFQUNSLGVBQWUsRUFDZixRQUFRLENBQ1QsQ0FBQTtZQUNELElBQUksQ0FBQyxjQUFjLEdBQUcsYUFBYSxDQUFDLE9BQU8sQ0FDekMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLEVBQ3hCLFFBQVEsRUFDUixlQUFlLEVBQ2YsUUFBUSxDQUNULENBQUE7WUFFRCxJQUFJLENBQUMsWUFBWSxHQUFHLGFBQWEsQ0FBQyxPQUFPLENBQ3ZDLE1BQU0sQ0FBQyxjQUFjLENBQUMsRUFDdEIsUUFBUSxFQUNSLE1BQU0sRUFDTixRQUFRLENBQ1QsQ0FBQTtTQUNGO1FBRUQsT0FBTyxJQUFJLENBQUE7SUFDYixDQUFDO0lBRUQsU0FBUyxDQUFDLFdBQStCLEtBQUs7UUFDNUMsSUFBSSxNQUFNLEdBQUc7WUFDWCxjQUFjLEVBQUUsYUFBYSxDQUFDLE9BQU8sQ0FDbkMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxFQUMvQixRQUFRLEVBQ1IsUUFBUSxFQUNSLGVBQWUsQ0FDaEI7WUFFRCxxQkFBcUIsRUFBRSxhQUFhLENBQUMsT0FBTyxDQUMxQyxJQUFJLENBQUMscUJBQXFCLEVBQzFCLFFBQVEsRUFDUixRQUFRLEVBQ1IsZUFBZSxDQUNoQjtZQUVELEtBQUssRUFBRSxhQUFhLENBQUMsT0FBTyxDQUMxQixJQUFJLENBQUMsS0FBSyxFQUNWLFFBQVEsRUFDUixRQUFRLEVBQ1IsZUFBZSxDQUNoQjtZQUNELEdBQUcsRUFBRSxhQUFhLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxlQUFlLENBQUM7WUFDekUsU0FBUyxFQUFFLGFBQWEsQ0FBQyxPQUFPLENBQzlCLElBQUksQ0FBQyxTQUFTLEVBQ2QsUUFBUSxFQUNSLFFBQVEsRUFDUixlQUFlLENBQ2hCO1lBQ0QsY0FBYyxFQUFFLGFBQWEsQ0FBQyxPQUFPLENBQ25DLElBQUksQ0FBQyxjQUFjLEVBQ25CLFFBQVEsRUFDUixRQUFRLEVBQ1IsZUFBZSxDQUNoQjtZQUNELGVBQWUsRUFBRSxhQUFhLENBQUMsT0FBTyxDQUNwQyxJQUFJLENBQUMsZUFBZSxFQUNwQixRQUFRLEVBQ1IsUUFBUSxFQUNSLGVBQWUsQ0FDaEI7WUFDRCxXQUFXLEVBQUUsYUFBYSxDQUFDLE9BQU8sQ0FDaEMsSUFBSSxDQUFDLFdBQVcsRUFDaEIsUUFBUSxFQUNSLFFBQVEsRUFDUixlQUFlLENBQ2hCO1lBQ0QsV0FBVyxFQUFFLGFBQWEsQ0FBQyxPQUFPLENBQ2hDLElBQUksQ0FBQyxXQUFXLEVBQ2hCLFFBQVEsRUFDUixRQUFRLEVBQ1IsZUFBZSxDQUNoQjtZQUNELG9CQUFvQixFQUFFLGFBQWEsQ0FBQyxPQUFPLENBQ3pDLElBQUksQ0FBQyxvQkFBb0IsRUFDekIsUUFBUSxFQUNSLFFBQVEsRUFDUixlQUFlLENBQ2hCO1lBQ0QsdUJBQXVCLEVBQUUsYUFBYSxDQUFDLE9BQU8sQ0FDNUMsSUFBSSxDQUFDLHVCQUF1QixFQUM1QixRQUFRLEVBQ1IsUUFBUSxFQUNSLGVBQWUsQ0FDaEI7WUFDRCxJQUFJLEVBQUUsYUFBYSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsTUFBTSxDQUFDO1lBQ2xFLEtBQUssRUFBRSxhQUFhLENBQUMsT0FBTyxDQUMxQixJQUFJLENBQUMsS0FBSyxFQUNWLFFBQVEsRUFDUixRQUFRLEVBQ1IsZUFBZSxDQUNoQjtTQUNGLENBQUE7UUFFRCxJQUFJLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLEVBQUU7WUFDdkMsdUNBQ0ssTUFBTSxLQUNULG9CQUFvQixFQUFFLGFBQWEsQ0FBQyxPQUFPLENBQ3pDLElBQUksQ0FBQyxvQkFBb0IsRUFDekIsUUFBUSxFQUNSLFFBQVEsRUFDUixlQUFlLENBQ2hCLEVBQ0QsY0FBYyxFQUFFLGFBQWEsQ0FBQyxPQUFPLENBQ25DLElBQUksQ0FBQyxjQUFjLEVBQ25CLFFBQVEsRUFDUixRQUFRLEVBQ1IsZUFBZSxDQUNoQixFQUNELFlBQVksRUFBRSxhQUFhLENBQUMsT0FBTyxDQUNqQyxJQUFJLENBQUMsWUFBWSxFQUNqQixRQUFRLEVBQ1IsUUFBUSxFQUNSLE1BQU0sQ0FDUCxJQUNGO1NBQ0Y7UUFDRCxPQUFPLE1BQU0sQ0FBQTtJQUNmLENBQUM7SUFFRCxVQUFVLENBQUMsS0FBYSxFQUFFLFNBQWlCLENBQUM7UUFDMUMsTUFBTSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFBO1FBQ3hELElBQUksQ0FBQyxxQkFBcUIsR0FBRyxRQUFRLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFBO1FBQ3pFLE1BQU0sSUFBSSxDQUFDLENBQUE7UUFDWCxJQUFJLENBQUMsS0FBSyxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUE7UUFDekQsTUFBTSxJQUFJLENBQUMsQ0FBQTtRQUVYLElBQUksQ0FBQyxHQUFHLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQTtRQUN2RCxNQUFNLElBQUksQ0FBQyxDQUFBO1FBQ1gsSUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFBO1FBQzdELE1BQU0sSUFBSSxDQUFDLENBQUE7UUFDWCxJQUFJLENBQUMsY0FBYyxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUE7UUFDbEUsTUFBTSxJQUFJLENBQUMsQ0FBQTtRQUNYLElBQUksQ0FBQyxlQUFlLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQTtRQUNuRSxNQUFNLElBQUksQ0FBQyxDQUFBO1FBQ1gsSUFBSSxDQUFDLFdBQVcsR0FBRyxRQUFRLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFBO1FBQy9ELE1BQU0sSUFBSSxDQUFDLENBQUE7UUFDWCxJQUFJLENBQUMsV0FBVyxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUE7UUFDL0QsTUFBTSxJQUFJLENBQUMsQ0FBQTtRQUNYLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxRQUFRLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFBO1FBQ3hFLE1BQU0sSUFBSSxDQUFDLENBQUE7UUFDWCxJQUFJLENBQUMsdUJBQXVCLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQTtRQUMzRSxNQUFNLElBQUksQ0FBQyxDQUFBO1FBQ1gsTUFBTSxPQUFPLEdBQVcsUUFBUTthQUM3QixRQUFRLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLEdBQUcsQ0FBQyxDQUFDO2FBQ25DLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNsQixNQUFNLElBQUksQ0FBQyxDQUFBO1FBQ1gsSUFBSSxDQUFDLElBQUksR0FBRyxRQUFRLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxHQUFHLE9BQU8sQ0FBQyxDQUFBO1FBRTlELE1BQU0sSUFBSSxPQUFPLENBQUE7UUFDakIsSUFBSSxDQUFDLEtBQUssR0FBRyxRQUFRLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFBO1FBQ3pELE1BQU0sSUFBSSxDQUFDLENBQUE7UUFDWCxJQUFJLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLEVBQUU7WUFDdkMsSUFBSSxDQUFDLG9CQUFvQixHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUE7WUFDeEUsTUFBTSxJQUFJLENBQUMsQ0FBQTtZQUNYLElBQUksQ0FBQyxjQUFjLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQTtZQUNsRSxNQUFNLElBQUksQ0FBQyxDQUFBO1lBQ1gsSUFBSSxDQUFDLFlBQVksR0FBRyxRQUFRLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxHQUFHLEVBQUUsQ0FBQyxDQUFBO1lBQ2pFLE1BQU0sSUFBSSxFQUFFLENBQUE7U0FDYjtRQUVELE9BQU8sTUFBTSxDQUFBO0lBQ2YsQ0FBQztJQUVELFFBQVE7UUFDTixJQUFJLFVBQVUsR0FBVyxlQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3hDLFVBQVUsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUE7UUFDN0MsSUFBSSxhQUFhLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxDQUFBO1FBQ3BELElBQUksS0FBSyxHQUNQLGFBQWEsQ0FBQyxNQUFNO1lBQ3BCLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxNQUFNO1lBQ2pDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTTtZQUNqQixJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU07WUFDZixJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU07WUFDckIsSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNO1lBQzFCLElBQUksQ0FBQyxlQUFlLENBQUMsTUFBTTtZQUMzQixJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU07WUFDdkIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNO1lBQ3ZCLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNO1lBQ2hDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxNQUFNO1lBQ25DLFVBQVUsQ0FBQyxNQUFNO1lBQ2pCLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTTtZQUNoQixJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQTtRQUVuQixNQUFNLE1BQU0sR0FBYTtZQUN2QixhQUFhO1lBQ2IsSUFBSSxDQUFDLHFCQUFxQjtZQUMxQixJQUFJLENBQUMsS0FBSztZQUNWLElBQUksQ0FBQyxHQUFHO1lBQ1IsSUFBSSxDQUFDLFNBQVM7WUFDZCxJQUFJLENBQUMsY0FBYztZQUNuQixJQUFJLENBQUMsZUFBZTtZQUNwQixJQUFJLENBQUMsV0FBVztZQUNoQixJQUFJLENBQUMsV0FBVztZQUNoQixJQUFJLENBQUMsb0JBQW9CO1lBQ3pCLElBQUksQ0FBQyx1QkFBdUI7WUFDNUIsVUFBVTtZQUNWLElBQUksQ0FBQyxJQUFJO1lBQ1QsSUFBSSxDQUFDLEtBQUs7U0FDWCxDQUFBO1FBRUQsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxFQUFFO1lBQ3ZDLEtBQUs7Z0JBQ0gsSUFBSSxDQUFDLG9CQUFvQixDQUFDLE1BQU07b0JBQ2hDLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTTtvQkFDMUIsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUE7WUFDMUIsTUFBTSxDQUFDLElBQUksQ0FDVCxJQUFJLENBQUMsb0JBQW9CLEVBQ3pCLElBQUksQ0FBQyxjQUFjLEVBQ25CLElBQUksQ0FBQyxZQUFZLENBQ2xCLENBQUE7U0FDRjtRQUNELE9BQU8sZUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUE7SUFDckMsQ0FBQztJQUVELG1CQUFtQjtRQUNqQixPQUFPLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQTtJQUM5QixDQUFDO0lBQ0Qsd0JBQXdCO1FBQ3RCLE9BQU8sSUFBSSxDQUFDLHFCQUFxQixDQUFBO0lBQ25DLENBQUM7SUFDRCxRQUFRO1FBQ04sT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFBO0lBQ25CLENBQUM7SUFDRCxNQUFNO1FBQ0osT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFBO0lBQ2pCLENBQUM7SUFDRCxZQUFZO1FBQ1YsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFBO0lBQ3ZCLENBQUM7SUFDRCxpQkFBaUI7UUFDZixPQUFPLElBQUksQ0FBQyxjQUFjLENBQUE7SUFDNUIsQ0FBQztJQUNELGtCQUFrQjtRQUNoQixPQUFPLElBQUksQ0FBQyxlQUFlLENBQUE7SUFDN0IsQ0FBQztJQUNELGNBQWM7UUFDWixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUE7SUFDekIsQ0FBQztJQUNELGNBQWM7UUFDWixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUE7SUFDekIsQ0FBQztJQUNELHVCQUF1QjtRQUNyQixPQUFPLElBQUksQ0FBQyxvQkFBb0IsQ0FBQTtJQUNsQyxDQUFDO0lBQ0QsMEJBQTBCO1FBQ3hCLE9BQU8sSUFBSSxDQUFDLHVCQUF1QixDQUFBO0lBQ3JDLENBQUM7SUFDRCxPQUFPO1FBQ0wsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFBO0lBQ2xCLENBQUM7SUFDRCxRQUFRO1FBQ04sT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFBO0lBQ25CLENBQUM7SUFDRCx1QkFBdUI7UUFDckIsT0FBTyxJQUFJLENBQUMsb0JBQW9CLENBQUE7SUFDbEMsQ0FBQztJQUNELGlCQUFpQjtRQUNmLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQTtJQUM1QixDQUFDO0lBQ0QsZUFBZTtRQUNiLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQTtJQUMxQixDQUFDO0NBQ0Y7QUEzYkQsc0JBMmJDO0FBRUQ7O0dBRUc7QUFDSCxNQUFhLGlCQUFrQixTQUFRLGVBQU07SUFJM0MsU0FBUyxDQUFDLFdBQStCLEtBQUs7UUFDNUMsSUFBSSxNQUFNLEdBQVcsS0FBSyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQTtRQUM5Qyx1Q0FDSyxNQUFNLEtBQ1QsWUFBWSxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxFQUNuRCwwQkFBMEIsRUFBRSxhQUFhLENBQUMsT0FBTyxDQUMvQyxJQUFJLENBQUMsMEJBQTBCLEVBQy9CLFFBQVEsRUFDUixRQUFRLEVBQ1IsTUFBTSxDQUNQLEVBQ0QsdUJBQXVCLEVBQUUsSUFBSSxDQUFDLHVCQUF1QixDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsSUFDMUU7SUFDSCxDQUFDO0lBQ0QsV0FBVyxDQUFDLE1BQWMsRUFBRSxXQUErQixLQUFLO1FBQzlELEtBQUssQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFBO1FBQ25DLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxLQUFLLEVBQUUsQ0FBQyxXQUFXLENBQ3pDLE1BQU0sQ0FBQyxjQUFjLENBQUMsRUFDdEIsUUFBUSxDQUNULENBQUE7UUFDRCxJQUFJLENBQUMsMEJBQTBCLEdBQUcsYUFBYSxDQUFDLE9BQU8sQ0FDckQsTUFBTSxDQUFDLDRCQUE0QixDQUFDLEVBQ3BDLFFBQVEsRUFDUixNQUFNLEVBQ04sUUFBUSxDQUNULENBQUE7UUFDRCxJQUFJLENBQUMsdUJBQXVCLENBQUMsV0FBVyxDQUN0QyxNQUFNLENBQUMseUJBQXlCLENBQUMsRUFDakMsUUFBUSxDQUNULENBQUE7SUFDSCxDQUFDO0lBV0Q7Ozs7O09BS0c7SUFDSCxlQUFlLENBQUMsVUFBa0IsRUFBRSxPQUFlO1FBQ2pELE1BQU0sWUFBWSxHQUFXLGVBQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDNUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFBO1FBQzFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxlQUFlLENBQUMsWUFBWSxDQUFDLENBQUE7UUFFMUQsTUFBTSxNQUFNLEdBQVcsSUFBSSxlQUFNLEVBQUUsQ0FBQTtRQUNuQyxNQUFNLENBQUMsR0FBVyxlQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2pDLENBQUMsQ0FBQyxhQUFhLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFBO1FBQzlCLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEIsTUFBTSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQTtRQUN6QixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQTtRQUN6QixJQUFJLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQTtJQUNyRCxDQUFDO0lBRUQ7O09BRUc7SUFDSCxTQUFTO1FBQ1AsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFBO0lBQ3JCLENBQUM7SUFFRCxlQUFlO1FBQ2IsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFBO0lBQzFCLENBQUM7SUFDRCw2QkFBNkI7UUFDM0IsT0FBTyxJQUFJLENBQUMsMEJBQTBCLENBQUE7SUFDeEMsQ0FBQztJQUNELDBCQUEwQjtRQUN4QixPQUFPLElBQUksQ0FBQyx1QkFBdUIsQ0FBQTtJQUNyQyxDQUFDO0lBQ0QsVUFBVTtRQUNSLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQTtJQUNyQixDQUFDO0lBRUQ7Ozs7Ozs7T0FPRztJQUNILElBQUksQ0FBQyxHQUFXLEVBQUUsRUFBWTtRQUM1QixNQUFNLEtBQUssR0FBaUIsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUE7UUFDL0MsTUFBTSxJQUFJLEdBQWUsSUFBQSxtQ0FBcUIsRUFDNUMsK0JBQW1CLENBQUMsY0FBYyxDQUNuQyxDQUFBO1FBQ0QsS0FBSyxNQUFNLE1BQU0sSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO1lBQ2pDLE1BQU0sT0FBTyxHQUFZLEVBQUUsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUE7WUFDdEQsTUFBTSxPQUFPLEdBQVcsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQTtZQUN6QyxNQUFNLEdBQUcsR0FBYyxJQUFJLGtCQUFTLEVBQUUsQ0FBQTtZQUN0QyxHQUFHLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFBO1lBQ3ZCLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUE7U0FDdkI7UUFDRCxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO1FBQ2hCLE9BQU8sS0FBSyxDQUFBO0lBQ2QsQ0FBQztJQUVEOzs7Ozs7OztPQVFHO0lBQ0gsVUFBVSxDQUFDLEtBQWEsRUFBRSxTQUFpQixDQUFDO1FBQzFDLE1BQU0sR0FBRyxLQUFLLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQTtRQUV4QyxNQUFNLFlBQVksR0FBVSxJQUFJLEtBQUssRUFBRSxDQUFBO1FBQ3ZDLE1BQU0sR0FBRyxZQUFZLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQTtRQUMvQyxJQUFJLENBQUMsWUFBWSxHQUFHLFlBQVksQ0FBQTtRQUVoQyxJQUFJLENBQUMsMEJBQTBCLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FDakQsS0FBSyxFQUNMLE1BQU0sRUFDTixNQUFNLEdBQUcsRUFBRSxDQUNaLENBQUE7UUFDRCxNQUFNLElBQUksRUFBRSxDQUFBO1FBRVosTUFBTSxFQUFFLEdBQWUsSUFBSSx1QkFBVSxFQUFFLENBQUE7UUFDdkMsTUFBTSxJQUFJLEVBQUUsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQTtRQUN6RCxJQUFJLENBQUMsdUJBQXVCLEdBQUcsRUFBRSxDQUFBO1FBRWpDLE9BQU8sTUFBTSxDQUFBO0lBQ2YsQ0FBQztJQUVEOztPQUVHO0lBQ0gsUUFBUTtRQUNOLE1BQU0sU0FBUyxHQUFXLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQTtRQUUxQyxJQUFJLEtBQUssR0FBVyxTQUFTLENBQUMsTUFBTSxDQUFBO1FBRXBDLE1BQU0sa0JBQWtCLEdBQVcsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsQ0FBQTtRQUMvRCxLQUFLLElBQUksa0JBQWtCLENBQUMsTUFBTSxDQUFBO1FBRWxDLE1BQU0sVUFBVSxHQUFXLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxRQUFRLEVBQUUsQ0FBQTtRQUNsRSxLQUFLLElBQUksVUFBVSxDQUFDLE1BQU0sQ0FBQTtRQUUxQixNQUFNLElBQUksR0FBYTtZQUNyQixTQUFTO1lBQ1Qsa0JBQWtCO1lBQ2xCLElBQUksQ0FBQywwQkFBMEI7WUFDL0IsVUFBVTtTQUNYLENBQUE7UUFFRCxPQUFPLGVBQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLEtBQUssR0FBRyxFQUFFLENBQUMsQ0FBQTtJQUN4QyxDQUFDO0lBRUQsS0FBSztRQUNILE1BQU0sb0JBQW9CLEdBQXNCLElBQUksaUJBQWlCLEVBQUUsQ0FBQTtRQUN2RSxvQkFBb0IsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUE7UUFDaEQsT0FBTyxvQkFBNEIsQ0FBQTtJQUNyQyxDQUFDO0lBRUQsTUFBTSxDQUFDLEdBQUcsSUFBVztRQUNuQixPQUFPLElBQUksaUJBQWlCLENBQUMsR0FBRyxJQUFJLENBQVMsQ0FBQTtJQUMvQyxDQUFDO0lBRUQ7Ozs7Ozs7Ozs7T0FVRztJQUNILFlBQ0UsWUFBb0IsNEJBQWdCLEVBQ3BDLGVBQXVCLGVBQU0sQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUMzQyxPQUE2QixTQUFTLEVBQ3RDLE1BQTJCLFNBQVMsRUFDcEMsT0FBZSxTQUFTLEVBQ3hCLGVBQXNCLFNBQVMsRUFDL0IsNkJBQXFDLFNBQVM7UUFFOUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQTtRQWhNdkMsY0FBUyxHQUFHLG1CQUFtQixDQUFBO1FBQy9CLFlBQU8sR0FBRywrQkFBbUIsQ0FBQyxpQkFBaUIsQ0FBQTtRQW9DekQsNERBQTREO1FBQ2xELCtCQUEwQixHQUFXLGVBQU0sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUE7UUFHckQsYUFBUSxHQUFXLGVBQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDbEMsWUFBTyxHQUFhLEVBQUUsQ0FBQSxDQUFDLGtCQUFrQjtRQXVKakQsSUFBSSxPQUFPLFlBQVksS0FBSyxXQUFXLEVBQUU7WUFDdkMsSUFBSSxDQUFDLFlBQVksR0FBRyxZQUFZLENBQUE7U0FDakM7YUFBTTtZQUNMLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxLQUFLLEVBQUUsQ0FBQTtTQUNoQztRQUVELElBQUksT0FBTywwQkFBMEIsSUFBSSxXQUFXLEVBQUU7WUFDcEQsSUFBSSxDQUFDLDBCQUEwQixHQUFHLDBCQUEwQixDQUFBO1NBQzdEO1FBQ0QsSUFBSSxDQUFDLHVCQUF1QixHQUFHLElBQUksdUJBQVUsRUFBRSxDQUFBO0lBQ2pELENBQUM7Q0FDRjtBQTdNRCw4Q0E2TUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBwYWNrYWdlRG9jdW1lbnRhdGlvblxuICogQG1vZHVsZSBBUEktUGxhdGZvcm1WTS1EZXBvc2l0VHhcbiAqL1xuaW1wb3J0IHsgQnVmZmVyIH0gZnJvbSBcImJ1ZmZlci9cIlxuaW1wb3J0IEJpblRvb2xzIGZyb20gXCIuLi8uLi91dGlscy9iaW50b29sc1wiXG5pbXBvcnQgeyBQbGF0Zm9ybVZNQ29uc3RhbnRzIH0gZnJvbSBcIi4vY29uc3RhbnRzXCJcbmltcG9ydCB7IFRyYW5zZmVyYWJsZU91dHB1dCB9IGZyb20gXCIuL291dHB1dHNcIlxuaW1wb3J0IHsgVHJhbnNmZXJhYmxlSW5wdXQgfSBmcm9tIFwiLi9pbnB1dHNcIlxuaW1wb3J0IHsgQmFzZVR4IH0gZnJvbSBcIi4vYmFzZXR4XCJcbmltcG9ydCB7IERlZmF1bHROZXR3b3JrSUQgfSBmcm9tIFwiLi4vLi4vdXRpbHMvY29uc3RhbnRzXCJcbmltcG9ydCB7IFNlcmlhbGl6YXRpb24sIFNlcmlhbGl6ZWRFbmNvZGluZyB9IGZyb20gXCIuLi8uLi91dGlscy9zZXJpYWxpemF0aW9uXCJcbmltcG9ydCBCTiBmcm9tIFwiYm4uanNcIlxuaW1wb3J0IHsgU3VibmV0QXV0aCB9IGZyb20gXCIuLi8uLi9hcGlzL3BsYXRmb3Jtdm0vc3VibmV0YXV0aFwiXG5pbXBvcnQgeyBDcmVkZW50aWFsLCBTaWdJZHgsIFNpZ25hdHVyZSwgVXBncmFkZVZlcnNpb25JRCB9IGZyb20gXCIuLi8uLi9jb21tb25cIlxuaW1wb3J0IHsgS2V5Q2hhaW4sIEtleVBhaXIgfSBmcm9tIFwiLi4vLi4vYXBpcy9wbGF0Zm9ybXZtL2tleWNoYWluXCJcbmltcG9ydCB7IFNlbGVjdENyZWRlbnRpYWxDbGFzcyB9IGZyb20gXCIuLi8uLi9hcGlzL3BsYXRmb3Jtdm0vY3JlZGVudGlhbHNcIlxuXG4vKipcbiAqIEBpZ25vcmVcbiAqL1xuY29uc3QgYmludG9vbHM6IEJpblRvb2xzID0gQmluVG9vbHMuZ2V0SW5zdGFuY2UoKVxuY29uc3Qgc2VyaWFsaXphdGlvbjogU2VyaWFsaXphdGlvbiA9IFNlcmlhbGl6YXRpb24uZ2V0SW5zdGFuY2UoKVxuXG5leHBvcnQgZW51bSBPZmZlckZsYWcge1xuICBOT05FID0gXCIwXCIsXG4gIExPQ0tFRCA9IFwiMVwiXG59XG5cbmV4cG9ydCBjbGFzcyBPZmZlciB7XG4gIHByb3RlY3RlZCB1cGdyYWRlVmVyc2lvbklEOiBVcGdyYWRlVmVyc2lvbklEXG4gIHByb3RlY3RlZCBpbnRlcmVzdFJhdGVOb21pbmF0b3IgPSBCdWZmZXIuYWxsb2MoOClcbiAgcHJvdGVjdGVkIHN0YXJ0ID0gQnVmZmVyLmFsbG9jKDgpXG4gIHByb3RlY3RlZCBlbmQgPSBCdWZmZXIuYWxsb2MoOClcbiAgcHJvdGVjdGVkIG1pbkFtb3VudCA9IEJ1ZmZlci5hbGxvYyg4KVxuICBwcm90ZWN0ZWQgdG90YWxNYXhBbW91bnQgPSBCdWZmZXIuYWxsb2MoOClcbiAgcHJvdGVjdGVkIGRlcG9zaXRlZEFtb3VudCA9IEJ1ZmZlci5hbGxvYyg4KVxuICBwcm90ZWN0ZWQgbWluRHVyYXRpb24gPSBCdWZmZXIuYWxsb2MoNClcbiAgcHJvdGVjdGVkIG1heER1cmF0aW9uID0gQnVmZmVyLmFsbG9jKDQpXG4gIHByb3RlY3RlZCB1bmxvY2tQZXJpb2REdXJhdGlvbiA9IEJ1ZmZlci5hbGxvYyg0KVxuICBwcm90ZWN0ZWQgbm9SZXdhcmRzUGVyaW9kRHVyYXRpb24gPSBCdWZmZXIuYWxsb2MoNClcbiAgcHJvdGVjdGVkIG1lbW8gPSBCdWZmZXIuYWxsb2MoMClcbiAgcHJvdGVjdGVkIGZsYWdzID0gQnVmZmVyLmFsbG9jKDgpXG4gIHByb3RlY3RlZCB0b3RhbE1heFJld2FyZEFtb3VudCA9IEJ1ZmZlci5hbGxvYyg4KVxuICBwcm90ZWN0ZWQgcmV3YXJkZWRBbW91bnQgPSBCdWZmZXIuYWxsb2MoOClcbiAgcHJvdGVjdGVkIG93bmVyQWRkcmVzcyA9IEJ1ZmZlci5hbGxvYygyMClcblxuICBjb25zdHJ1Y3RvcihcbiAgICB1cGdyYWRlVmVyc2lvbjogbnVtYmVyID0gdW5kZWZpbmVkLFxuICAgIGludGVyZXN0UmF0ZU5vbWluYXRvcjogQk4gPSB1bmRlZmluZWQsXG4gICAgc3RhcnQ6IEJOID0gdW5kZWZpbmVkLFxuICAgIGVuZDogQk4gPSB1bmRlZmluZWQsXG4gICAgbWluQW1vdW50OiBCTiA9IHVuZGVmaW5lZCxcbiAgICB0b3RhbE1heEFtb3VudDogQk4gPSB1bmRlZmluZWQsXG4gICAgZGVwb3NpdGVkQW1vdW50OiBCTiA9IHVuZGVmaW5lZCxcbiAgICBtaW5EdXJhdGlvbjogbnVtYmVyID0gdW5kZWZpbmVkLFxuICAgIG1heER1cmF0aW9uOiBudW1iZXIgPSB1bmRlZmluZWQsXG4gICAgdW5sb2NrUGVyaW9kRHVyYXRpb246IG51bWJlciA9IHVuZGVmaW5lZCxcbiAgICBub1Jld2FyZHNQZXJpb2REdXJhdGlvbjogbnVtYmVyID0gdW5kZWZpbmVkLFxuICAgIG1lbW86IEJ1ZmZlciA9IHVuZGVmaW5lZCxcbiAgICBmbGFnOiBPZmZlckZsYWcgfCBCTiA9IHVuZGVmaW5lZCxcbiAgICB0b3RhbE1heFJld2FyZEFtb3VudDogQk4gPSB1bmRlZmluZWQsXG4gICAgcmV3YXJkZWRBbW91bnQ6IEJOID0gdW5kZWZpbmVkLFxuICAgIG93bmVyQWRkcmVzczogQnVmZmVyID0gdW5kZWZpbmVkXG4gICkge1xuICAgIHRoaXMudXBncmFkZVZlcnNpb25JRCA9IG5ldyBVcGdyYWRlVmVyc2lvbklEKHVwZ3JhZGVWZXJzaW9uID8/IDApXG4gICAgdGhpcy5pbnRlcmVzdFJhdGVOb21pbmF0b3IgPSBiaW50b29scy5mcm9tQk5Ub0J1ZmZlcihcbiAgICAgIG5ldyBCTihpbnRlcmVzdFJhdGVOb21pbmF0b3IpLFxuICAgICAgOFxuICAgIClcbiAgICBpZiAodHlwZW9mIHN0YXJ0ICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICB0aGlzLnN0YXJ0ID0gYmludG9vbHMuZnJvbUJOVG9CdWZmZXIobmV3IEJOKHN0YXJ0KSwgOClcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBlbmQgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIHRoaXMuZW5kID0gYmludG9vbHMuZnJvbUJOVG9CdWZmZXIobmV3IEJOKGVuZCksIDgpXG4gICAgfVxuICAgIGlmICh0eXBlb2YgbWluQW1vdW50ICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICB0aGlzLm1pbkFtb3VudCA9IGJpbnRvb2xzLmZyb21CTlRvQnVmZmVyKG5ldyBCTihtaW5BbW91bnQpLCA4KVxuICAgIH1cbiAgICBpZiAodHlwZW9mIHRvdGFsTWF4QW1vdW50ICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICB0aGlzLnRvdGFsTWF4QW1vdW50ID0gYmludG9vbHMuZnJvbUJOVG9CdWZmZXIobmV3IEJOKHRvdGFsTWF4QW1vdW50KSwgOClcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBkZXBvc2l0ZWRBbW91bnQgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIHRoaXMuZGVwb3NpdGVkQW1vdW50ID0gYmludG9vbHMuZnJvbUJOVG9CdWZmZXIobmV3IEJOKGRlcG9zaXRlZEFtb3VudCksIDgpXG4gICAgfVxuICAgIGlmICh0eXBlb2YgbWluRHVyYXRpb24gIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIHRoaXMubWluRHVyYXRpb24ud3JpdGVVSW50MzJCRShtaW5EdXJhdGlvbiwgMClcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBtYXhEdXJhdGlvbiAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgdGhpcy5tYXhEdXJhdGlvbi53cml0ZVVJbnQzMkJFKG1heER1cmF0aW9uLCAwKVxuICAgIH1cbiAgICBpZiAodHlwZW9mIHVubG9ja1BlcmlvZER1cmF0aW9uICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICB0aGlzLnVubG9ja1BlcmlvZER1cmF0aW9uLndyaXRlVUludDMyQkUodW5sb2NrUGVyaW9kRHVyYXRpb24sIDApXG4gICAgfVxuICAgIGlmICh0eXBlb2Ygbm9SZXdhcmRzUGVyaW9kRHVyYXRpb24gIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIHRoaXMubm9SZXdhcmRzUGVyaW9kRHVyYXRpb24ud3JpdGVVSW50MzJCRShub1Jld2FyZHNQZXJpb2REdXJhdGlvbiwgMClcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBtZW1vICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICB0aGlzLm1lbW8gPSBtZW1vXG4gICAgfVxuICAgIGlmICh0eXBlb2YgZmxhZyAhPSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICBpZiAoZmxhZyBpbnN0YW5jZW9mIEJOKSB7XG4gICAgICAgIHRoaXMuZmxhZ3MgPSBiaW50b29scy5mcm9tQk5Ub0J1ZmZlcihmbGFnLCA4KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5mbGFncyA9IGJpbnRvb2xzLmZyb21CTlRvQnVmZmVyKG5ldyBCTihmbGFnKSwgOClcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHRoaXMudXBncmFkZVZlcnNpb25JRC52ZXJzaW9uKCkgPiAwKSB7XG4gICAgICBpZiAodHlwZW9mIHRvdGFsTWF4UmV3YXJkQW1vdW50ICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIHRoaXMudG90YWxNYXhSZXdhcmRBbW91bnQgPSBiaW50b29scy5mcm9tQk5Ub0J1ZmZlcihcbiAgICAgICAgICBuZXcgQk4odG90YWxNYXhSZXdhcmRBbW91bnQpLFxuICAgICAgICAgIDhcbiAgICAgICAgKVxuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiByZXdhcmRlZEFtb3VudCAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICB0aGlzLnJld2FyZGVkQW1vdW50ID0gYmludG9vbHMuZnJvbUJOVG9CdWZmZXIobmV3IEJOKHJld2FyZGVkQW1vdW50KSwgOClcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2Ygb3duZXJBZGRyZXNzICE9IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgdGhpcy5vd25lckFkZHJlc3MgPSBvd25lckFkZHJlc3NcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBkZXNlcmlhbGl6ZShmaWVsZHM6IG9iamVjdCwgZW5jb2Rpbmc6IFNlcmlhbGl6ZWRFbmNvZGluZyA9IFwiaGV4XCIpOiB0aGlzIHtcbiAgICBjb25zdCB1cGdyYWRlVmVyc2lvbiA9IHNlcmlhbGl6YXRpb24uZGVjb2RlcihcbiAgICAgIGZpZWxkc1tcInVwZ3JhZGVWZXJzaW9uXCJdLFxuICAgICAgZW5jb2RpbmcsXG4gICAgICBcImRlY2ltYWxTdHJpbmdcIixcbiAgICAgIFwiQnVmZmVyXCJcbiAgICApXG4gICAgdGhpcy51cGdyYWRlVmVyc2lvbklEID0gbmV3IFVwZ3JhZGVWZXJzaW9uSUQodXBncmFkZVZlcnNpb24pXG5cbiAgICB0aGlzLmludGVyZXN0UmF0ZU5vbWluYXRvciA9IHNlcmlhbGl6YXRpb24uZGVjb2RlcihcbiAgICAgIGZpZWxkc1tcImludGVyZXN0UmF0ZU5vbWluYXRvclwiXSxcbiAgICAgIGVuY29kaW5nLFxuICAgICAgXCJkZWNpbWFsU3RyaW5nXCIsXG4gICAgICBcIkJ1ZmZlclwiXG4gICAgKVxuICAgIHRoaXMuc3RhcnQgPSBzZXJpYWxpemF0aW9uLmRlY29kZXIoXG4gICAgICBmaWVsZHNbXCJzdGFydFwiXSxcbiAgICAgIGVuY29kaW5nLFxuICAgICAgXCJkZWNpbWFsU3RyaW5nXCIsXG4gICAgICBcIkJ1ZmZlclwiXG4gICAgKVxuICAgIHRoaXMuZW5kID0gc2VyaWFsaXphdGlvbi5kZWNvZGVyKFxuICAgICAgZmllbGRzW1wiZW5kXCJdLFxuICAgICAgZW5jb2RpbmcsXG4gICAgICBcImRlY2ltYWxTdHJpbmdcIixcbiAgICAgIFwiQnVmZmVyXCJcbiAgICApXG4gICAgdGhpcy5taW5BbW91bnQgPSBzZXJpYWxpemF0aW9uLmRlY29kZXIoXG4gICAgICBmaWVsZHNbXCJtaW5BbW91bnRcIl0sXG4gICAgICBlbmNvZGluZyxcbiAgICAgIFwiZGVjaW1hbFN0cmluZ1wiLFxuICAgICAgXCJCdWZmZXJcIlxuICAgIClcbiAgICB0aGlzLnRvdGFsTWF4QW1vdW50ID0gc2VyaWFsaXphdGlvbi5kZWNvZGVyKFxuICAgICAgZmllbGRzW1widG90YWxNYXhBbW91bnRcIl0sXG4gICAgICBlbmNvZGluZyxcbiAgICAgIFwiZGVjaW1hbFN0cmluZ1wiLFxuICAgICAgXCJCdWZmZXJcIlxuICAgIClcbiAgICB0aGlzLmRlcG9zaXRlZEFtb3VudCA9IHNlcmlhbGl6YXRpb24uZGVjb2RlcihcbiAgICAgIGZpZWxkc1tcImRlcG9zaXRlZEFtb3VudFwiXSxcbiAgICAgIGVuY29kaW5nLFxuICAgICAgXCJkZWNpbWFsU3RyaW5nXCIsXG4gICAgICBcIkJ1ZmZlclwiXG4gICAgKVxuICAgIHRoaXMubWluRHVyYXRpb24gPSBzZXJpYWxpemF0aW9uLmRlY29kZXIoXG4gICAgICBmaWVsZHNbXCJtaW5EdXJhdGlvblwiXSxcbiAgICAgIGVuY29kaW5nLFxuICAgICAgXCJkZWNpbWFsU3RyaW5nXCIsXG4gICAgICBcIkJ1ZmZlclwiXG4gICAgKVxuICAgIHRoaXMubWF4RHVyYXRpb24gPSBzZXJpYWxpemF0aW9uLmRlY29kZXIoXG4gICAgICBmaWVsZHNbXCJtYXhEdXJhdGlvblwiXSxcbiAgICAgIGVuY29kaW5nLFxuICAgICAgXCJkZWNpbWFsU3RyaW5nXCIsXG4gICAgICBcIkJ1ZmZlclwiXG4gICAgKVxuICAgIHRoaXMudW5sb2NrUGVyaW9kRHVyYXRpb24gPSBzZXJpYWxpemF0aW9uLmRlY29kZXIoXG4gICAgICBmaWVsZHNbXCJ1bmxvY2tQZXJpb2REdXJhdGlvblwiXSxcbiAgICAgIGVuY29kaW5nLFxuICAgICAgXCJkZWNpbWFsU3RyaW5nXCIsXG4gICAgICBcIkJ1ZmZlclwiXG4gICAgKVxuICAgIHRoaXMubm9SZXdhcmRzUGVyaW9kRHVyYXRpb24gPSBzZXJpYWxpemF0aW9uLmRlY29kZXIoXG4gICAgICBmaWVsZHNbXCJub1Jld2FyZHNQZXJpb2REdXJhdGlvblwiXSxcbiAgICAgIGVuY29kaW5nLFxuICAgICAgXCJkZWNpbWFsU3RyaW5nXCIsXG4gICAgICBcIkJ1ZmZlclwiXG4gICAgKVxuICAgIHRoaXMubWVtbyA9IHNlcmlhbGl6YXRpb24uZGVjb2RlcihcbiAgICAgIGZpZWxkc1tcIm1lbW9cIl0sXG4gICAgICBlbmNvZGluZyxcbiAgICAgIFwidXRmOFwiLFxuICAgICAgXCJCdWZmZXJcIlxuICAgIClcbiAgICB0aGlzLmZsYWdzID0gc2VyaWFsaXphdGlvbi5kZWNvZGVyKFxuICAgICAgZmllbGRzW1wiZmxhZ3NcIl0sXG4gICAgICBlbmNvZGluZyxcbiAgICAgIFwiZGVjaW1hbFN0cmluZ1wiLFxuICAgICAgXCJCdWZmZXJcIlxuICAgIClcbiAgICBpZiAodGhpcy51cGdyYWRlVmVyc2lvbklELnZlcnNpb24oKSA+IDApIHtcbiAgICAgIHRoaXMudG90YWxNYXhSZXdhcmRBbW91bnQgPSBzZXJpYWxpemF0aW9uLmRlY29kZXIoXG4gICAgICAgIGZpZWxkc1tcInRvdGFsTWF4UmV3YXJkQW1vdW50XCJdLFxuICAgICAgICBlbmNvZGluZyxcbiAgICAgICAgXCJkZWNpbWFsU3RyaW5nXCIsXG4gICAgICAgIFwiQnVmZmVyXCJcbiAgICAgIClcbiAgICAgIHRoaXMucmV3YXJkZWRBbW91bnQgPSBzZXJpYWxpemF0aW9uLmRlY29kZXIoXG4gICAgICAgIGZpZWxkc1tcInJld2FyZGVkQW1vdW50XCJdLFxuICAgICAgICBlbmNvZGluZyxcbiAgICAgICAgXCJkZWNpbWFsU3RyaW5nXCIsXG4gICAgICAgIFwiQnVmZmVyXCJcbiAgICAgIClcblxuICAgICAgdGhpcy5vd25lckFkZHJlc3MgPSBzZXJpYWxpemF0aW9uLmRlY29kZXIoXG4gICAgICAgIGZpZWxkc1tcIm93bmVyQWRkcmVzc1wiXSxcbiAgICAgICAgZW5jb2RpbmcsXG4gICAgICAgIFwiY2I1OFwiLFxuICAgICAgICBcIkJ1ZmZlclwiXG4gICAgICApXG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIHNlcmlhbGl6ZShlbmNvZGluZzogU2VyaWFsaXplZEVuY29kaW5nID0gXCJoZXhcIik6IG9iamVjdCB7XG4gICAgbGV0IGZpZWxkcyA9IHtcbiAgICAgIHVwZ3JhZGVWZXJzaW9uOiBzZXJpYWxpemF0aW9uLmVuY29kZXIoXG4gICAgICAgIHRoaXMudXBncmFkZVZlcnNpb25JRC52ZXJzaW9uKCksXG4gICAgICAgIGVuY29kaW5nLFxuICAgICAgICBcIkJ1ZmZlclwiLFxuICAgICAgICBcImRlY2ltYWxTdHJpbmdcIlxuICAgICAgKSxcblxuICAgICAgaW50ZXJlc3RSYXRlTm9taW5hdG9yOiBzZXJpYWxpemF0aW9uLmVuY29kZXIoXG4gICAgICAgIHRoaXMuaW50ZXJlc3RSYXRlTm9taW5hdG9yLFxuICAgICAgICBlbmNvZGluZyxcbiAgICAgICAgXCJCdWZmZXJcIixcbiAgICAgICAgXCJkZWNpbWFsU3RyaW5nXCJcbiAgICAgICksXG5cbiAgICAgIHN0YXJ0OiBzZXJpYWxpemF0aW9uLmVuY29kZXIoXG4gICAgICAgIHRoaXMuc3RhcnQsXG4gICAgICAgIGVuY29kaW5nLFxuICAgICAgICBcIkJ1ZmZlclwiLFxuICAgICAgICBcImRlY2ltYWxTdHJpbmdcIlxuICAgICAgKSxcbiAgICAgIGVuZDogc2VyaWFsaXphdGlvbi5lbmNvZGVyKHRoaXMuZW5kLCBlbmNvZGluZywgXCJCdWZmZXJcIiwgXCJkZWNpbWFsU3RyaW5nXCIpLFxuICAgICAgbWluQW1vdW50OiBzZXJpYWxpemF0aW9uLmVuY29kZXIoXG4gICAgICAgIHRoaXMubWluQW1vdW50LFxuICAgICAgICBlbmNvZGluZyxcbiAgICAgICAgXCJCdWZmZXJcIixcbiAgICAgICAgXCJkZWNpbWFsU3RyaW5nXCJcbiAgICAgICksXG4gICAgICB0b3RhbE1heEFtb3VudDogc2VyaWFsaXphdGlvbi5lbmNvZGVyKFxuICAgICAgICB0aGlzLnRvdGFsTWF4QW1vdW50LFxuICAgICAgICBlbmNvZGluZyxcbiAgICAgICAgXCJCdWZmZXJcIixcbiAgICAgICAgXCJkZWNpbWFsU3RyaW5nXCJcbiAgICAgICksXG4gICAgICBkZXBvc2l0ZWRBbW91bnQ6IHNlcmlhbGl6YXRpb24uZW5jb2RlcihcbiAgICAgICAgdGhpcy5kZXBvc2l0ZWRBbW91bnQsXG4gICAgICAgIGVuY29kaW5nLFxuICAgICAgICBcIkJ1ZmZlclwiLFxuICAgICAgICBcImRlY2ltYWxTdHJpbmdcIlxuICAgICAgKSxcbiAgICAgIG1pbkR1cmF0aW9uOiBzZXJpYWxpemF0aW9uLmVuY29kZXIoXG4gICAgICAgIHRoaXMubWluRHVyYXRpb24sXG4gICAgICAgIGVuY29kaW5nLFxuICAgICAgICBcIkJ1ZmZlclwiLFxuICAgICAgICBcImRlY2ltYWxTdHJpbmdcIlxuICAgICAgKSxcbiAgICAgIG1heER1cmF0aW9uOiBzZXJpYWxpemF0aW9uLmVuY29kZXIoXG4gICAgICAgIHRoaXMubWF4RHVyYXRpb24sXG4gICAgICAgIGVuY29kaW5nLFxuICAgICAgICBcIkJ1ZmZlclwiLFxuICAgICAgICBcImRlY2ltYWxTdHJpbmdcIlxuICAgICAgKSxcbiAgICAgIHVubG9ja1BlcmlvZER1cmF0aW9uOiBzZXJpYWxpemF0aW9uLmVuY29kZXIoXG4gICAgICAgIHRoaXMudW5sb2NrUGVyaW9kRHVyYXRpb24sXG4gICAgICAgIGVuY29kaW5nLFxuICAgICAgICBcIkJ1ZmZlclwiLFxuICAgICAgICBcImRlY2ltYWxTdHJpbmdcIlxuICAgICAgKSxcbiAgICAgIG5vUmV3YXJkc1BlcmlvZER1cmF0aW9uOiBzZXJpYWxpemF0aW9uLmVuY29kZXIoXG4gICAgICAgIHRoaXMubm9SZXdhcmRzUGVyaW9kRHVyYXRpb24sXG4gICAgICAgIGVuY29kaW5nLFxuICAgICAgICBcIkJ1ZmZlclwiLFxuICAgICAgICBcImRlY2ltYWxTdHJpbmdcIlxuICAgICAgKSxcbiAgICAgIG1lbW86IHNlcmlhbGl6YXRpb24uZW5jb2Rlcih0aGlzLm1lbW8sIGVuY29kaW5nLCBcIkJ1ZmZlclwiLCBcInV0ZjhcIiksXG4gICAgICBmbGFnczogc2VyaWFsaXphdGlvbi5lbmNvZGVyKFxuICAgICAgICB0aGlzLmZsYWdzLFxuICAgICAgICBlbmNvZGluZyxcbiAgICAgICAgXCJCdWZmZXJcIixcbiAgICAgICAgXCJkZWNpbWFsU3RyaW5nXCJcbiAgICAgIClcbiAgICB9XG5cbiAgICBpZiAodGhpcy51cGdyYWRlVmVyc2lvbklELnZlcnNpb24oKSA+IDApIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIC4uLmZpZWxkcyxcbiAgICAgICAgdG90YWxNYXhSZXdhcmRBbW91bnQ6IHNlcmlhbGl6YXRpb24uZW5jb2RlcihcbiAgICAgICAgICB0aGlzLnRvdGFsTWF4UmV3YXJkQW1vdW50LFxuICAgICAgICAgIGVuY29kaW5nLFxuICAgICAgICAgIFwiQnVmZmVyXCIsXG4gICAgICAgICAgXCJkZWNpbWFsU3RyaW5nXCJcbiAgICAgICAgKSxcbiAgICAgICAgcmV3YXJkZWRBbW91bnQ6IHNlcmlhbGl6YXRpb24uZW5jb2RlcihcbiAgICAgICAgICB0aGlzLnJld2FyZGVkQW1vdW50LFxuICAgICAgICAgIGVuY29kaW5nLFxuICAgICAgICAgIFwiQnVmZmVyXCIsXG4gICAgICAgICAgXCJkZWNpbWFsU3RyaW5nXCJcbiAgICAgICAgKSxcbiAgICAgICAgb3duZXJBZGRyZXNzOiBzZXJpYWxpemF0aW9uLmVuY29kZXIoXG4gICAgICAgICAgdGhpcy5vd25lckFkZHJlc3MsXG4gICAgICAgICAgZW5jb2RpbmcsXG4gICAgICAgICAgXCJCdWZmZXJcIixcbiAgICAgICAgICBcImNiNThcIlxuICAgICAgICApXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmaWVsZHNcbiAgfVxuXG4gIGZyb21CdWZmZXIoYnl0ZXM6IEJ1ZmZlciwgb2Zmc2V0OiBudW1iZXIgPSAwKTogbnVtYmVyIHtcbiAgICBvZmZzZXQgPSB0aGlzLnVwZ3JhZGVWZXJzaW9uSUQuZnJvbUJ1ZmZlcihieXRlcywgb2Zmc2V0KVxuICAgIHRoaXMuaW50ZXJlc3RSYXRlTm9taW5hdG9yID0gYmludG9vbHMuY29weUZyb20oYnl0ZXMsIG9mZnNldCwgb2Zmc2V0ICsgOClcbiAgICBvZmZzZXQgKz0gOFxuICAgIHRoaXMuc3RhcnQgPSBiaW50b29scy5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyA4KVxuICAgIG9mZnNldCArPSA4XG5cbiAgICB0aGlzLmVuZCA9IGJpbnRvb2xzLmNvcHlGcm9tKGJ5dGVzLCBvZmZzZXQsIG9mZnNldCArIDgpXG4gICAgb2Zmc2V0ICs9IDhcbiAgICB0aGlzLm1pbkFtb3VudCA9IGJpbnRvb2xzLmNvcHlGcm9tKGJ5dGVzLCBvZmZzZXQsIG9mZnNldCArIDgpXG4gICAgb2Zmc2V0ICs9IDhcbiAgICB0aGlzLnRvdGFsTWF4QW1vdW50ID0gYmludG9vbHMuY29weUZyb20oYnl0ZXMsIG9mZnNldCwgb2Zmc2V0ICsgOClcbiAgICBvZmZzZXQgKz0gOFxuICAgIHRoaXMuZGVwb3NpdGVkQW1vdW50ID0gYmludG9vbHMuY29weUZyb20oYnl0ZXMsIG9mZnNldCwgb2Zmc2V0ICsgOClcbiAgICBvZmZzZXQgKz0gOFxuICAgIHRoaXMubWluRHVyYXRpb24gPSBiaW50b29scy5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyA0KVxuICAgIG9mZnNldCArPSA0XG4gICAgdGhpcy5tYXhEdXJhdGlvbiA9IGJpbnRvb2xzLmNvcHlGcm9tKGJ5dGVzLCBvZmZzZXQsIG9mZnNldCArIDQpXG4gICAgb2Zmc2V0ICs9IDRcbiAgICB0aGlzLnVubG9ja1BlcmlvZER1cmF0aW9uID0gYmludG9vbHMuY29weUZyb20oYnl0ZXMsIG9mZnNldCwgb2Zmc2V0ICsgNClcbiAgICBvZmZzZXQgKz0gNFxuICAgIHRoaXMubm9SZXdhcmRzUGVyaW9kRHVyYXRpb24gPSBiaW50b29scy5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyA0KVxuICAgIG9mZnNldCArPSA0XG4gICAgY29uc3QgbWVtb0xlbjogbnVtYmVyID0gYmludG9vbHNcbiAgICAgIC5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyA0KVxuICAgICAgLnJlYWRVSW50MzJCRSgwKVxuICAgIG9mZnNldCArPSA0XG4gICAgdGhpcy5tZW1vID0gYmludG9vbHMuY29weUZyb20oYnl0ZXMsIG9mZnNldCwgb2Zmc2V0ICsgbWVtb0xlbilcblxuICAgIG9mZnNldCArPSBtZW1vTGVuXG4gICAgdGhpcy5mbGFncyA9IGJpbnRvb2xzLmNvcHlGcm9tKGJ5dGVzLCBvZmZzZXQsIG9mZnNldCArIDgpXG4gICAgb2Zmc2V0ICs9IDhcbiAgICBpZiAodGhpcy51cGdyYWRlVmVyc2lvbklELnZlcnNpb24oKSA+IDApIHtcbiAgICAgIHRoaXMudG90YWxNYXhSZXdhcmRBbW91bnQgPSBiaW50b29scy5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyA4KVxuICAgICAgb2Zmc2V0ICs9IDhcbiAgICAgIHRoaXMucmV3YXJkZWRBbW91bnQgPSBiaW50b29scy5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyA4KVxuICAgICAgb2Zmc2V0ICs9IDhcbiAgICAgIHRoaXMub3duZXJBZGRyZXNzID0gYmludG9vbHMuY29weUZyb20oYnl0ZXMsIG9mZnNldCwgb2Zmc2V0ICsgMjApXG4gICAgICBvZmZzZXQgKz0gMjBcbiAgICB9XG5cbiAgICByZXR1cm4gb2Zmc2V0XG4gIH1cblxuICB0b0J1ZmZlcigpOiBCdWZmZXIge1xuICAgIGxldCBtZW1vTGVuZ3RoOiBCdWZmZXIgPSBCdWZmZXIuYWxsb2MoNClcbiAgICBtZW1vTGVuZ3RoLndyaXRlVUludDMyQkUodGhpcy5tZW1vLmxlbmd0aCwgMClcbiAgICBsZXQgdXBncmFkZUJ1ZmZlciA9IHRoaXMudXBncmFkZVZlcnNpb25JRC50b0J1ZmZlcigpXG4gICAgbGV0IGJzaXplOiBudW1iZXIgPVxuICAgICAgdXBncmFkZUJ1ZmZlci5sZW5ndGggK1xuICAgICAgdGhpcy5pbnRlcmVzdFJhdGVOb21pbmF0b3IubGVuZ3RoICtcbiAgICAgIHRoaXMuc3RhcnQubGVuZ3RoICtcbiAgICAgIHRoaXMuZW5kLmxlbmd0aCArXG4gICAgICB0aGlzLm1pbkFtb3VudC5sZW5ndGggK1xuICAgICAgdGhpcy50b3RhbE1heEFtb3VudC5sZW5ndGggK1xuICAgICAgdGhpcy5kZXBvc2l0ZWRBbW91bnQubGVuZ3RoICtcbiAgICAgIHRoaXMubWluRHVyYXRpb24ubGVuZ3RoICtcbiAgICAgIHRoaXMubWF4RHVyYXRpb24ubGVuZ3RoICtcbiAgICAgIHRoaXMudW5sb2NrUGVyaW9kRHVyYXRpb24ubGVuZ3RoICtcbiAgICAgIHRoaXMubm9SZXdhcmRzUGVyaW9kRHVyYXRpb24ubGVuZ3RoICtcbiAgICAgIG1lbW9MZW5ndGgubGVuZ3RoICtcbiAgICAgIHRoaXMubWVtby5sZW5ndGggK1xuICAgICAgdGhpcy5mbGFncy5sZW5ndGhcblxuICAgIGNvbnN0IGJ1ZmZlcjogQnVmZmVyW10gPSBbXG4gICAgICB1cGdyYWRlQnVmZmVyLFxuICAgICAgdGhpcy5pbnRlcmVzdFJhdGVOb21pbmF0b3IsXG4gICAgICB0aGlzLnN0YXJ0LFxuICAgICAgdGhpcy5lbmQsXG4gICAgICB0aGlzLm1pbkFtb3VudCxcbiAgICAgIHRoaXMudG90YWxNYXhBbW91bnQsXG4gICAgICB0aGlzLmRlcG9zaXRlZEFtb3VudCxcbiAgICAgIHRoaXMubWluRHVyYXRpb24sXG4gICAgICB0aGlzLm1heER1cmF0aW9uLFxuICAgICAgdGhpcy51bmxvY2tQZXJpb2REdXJhdGlvbixcbiAgICAgIHRoaXMubm9SZXdhcmRzUGVyaW9kRHVyYXRpb24sXG4gICAgICBtZW1vTGVuZ3RoLFxuICAgICAgdGhpcy5tZW1vLFxuICAgICAgdGhpcy5mbGFnc1xuICAgIF1cblxuICAgIGlmICh0aGlzLnVwZ3JhZGVWZXJzaW9uSUQudmVyc2lvbigpID4gMCkge1xuICAgICAgYnNpemUgKz1cbiAgICAgICAgdGhpcy50b3RhbE1heFJld2FyZEFtb3VudC5sZW5ndGggK1xuICAgICAgICB0aGlzLnJld2FyZGVkQW1vdW50Lmxlbmd0aCArXG4gICAgICAgIHRoaXMub3duZXJBZGRyZXNzLmxlbmd0aFxuICAgICAgYnVmZmVyLnB1c2goXG4gICAgICAgIHRoaXMudG90YWxNYXhSZXdhcmRBbW91bnQsXG4gICAgICAgIHRoaXMucmV3YXJkZWRBbW91bnQsXG4gICAgICAgIHRoaXMub3duZXJBZGRyZXNzXG4gICAgICApXG4gICAgfVxuICAgIHJldHVybiBCdWZmZXIuY29uY2F0KGJ1ZmZlciwgYnNpemUpXG4gIH1cblxuICBnZXRVcGdyYWRlVmVyc2lvbklEKCk6IFVwZ3JhZGVWZXJzaW9uSUQge1xuICAgIHJldHVybiB0aGlzLnVwZ3JhZGVWZXJzaW9uSURcbiAgfVxuICBnZXRJbnRlcmVzdFJhdGVOb21pbmF0b3IoKTogQnVmZmVyIHtcbiAgICByZXR1cm4gdGhpcy5pbnRlcmVzdFJhdGVOb21pbmF0b3JcbiAgfVxuICBnZXRTdGFydCgpOiBCdWZmZXIge1xuICAgIHJldHVybiB0aGlzLnN0YXJ0XG4gIH1cbiAgZ2V0RW5kKCk6IEJ1ZmZlciB7XG4gICAgcmV0dXJuIHRoaXMuZW5kXG4gIH1cbiAgZ2V0TWluQW1vdW50KCk6IEJ1ZmZlciB7XG4gICAgcmV0dXJuIHRoaXMubWluQW1vdW50XG4gIH1cbiAgZ2V0VG90YWxNYXhBbW91bnQoKTogQnVmZmVyIHtcbiAgICByZXR1cm4gdGhpcy50b3RhbE1heEFtb3VudFxuICB9XG4gIGdldERlcG9zaXRlZEFtb3VudCgpOiBCdWZmZXIge1xuICAgIHJldHVybiB0aGlzLmRlcG9zaXRlZEFtb3VudFxuICB9XG4gIGdldE1pbkR1cmF0aW9uKCk6IEJ1ZmZlciB7XG4gICAgcmV0dXJuIHRoaXMubWluRHVyYXRpb25cbiAgfVxuICBnZXRNYXhEdXJhdGlvbigpOiBCdWZmZXIge1xuICAgIHJldHVybiB0aGlzLm1heER1cmF0aW9uXG4gIH1cbiAgZ2V0VW5sb2NrUGVyaW9kRHVyYXRpb24oKTogQnVmZmVyIHtcbiAgICByZXR1cm4gdGhpcy51bmxvY2tQZXJpb2REdXJhdGlvblxuICB9XG4gIGdldE5vUmV3YXJkc1BlcmlvZER1cmF0aW9uKCk6IEJ1ZmZlciB7XG4gICAgcmV0dXJuIHRoaXMubm9SZXdhcmRzUGVyaW9kRHVyYXRpb25cbiAgfVxuICBnZXRNZW1vKCk6IEJ1ZmZlciB7XG4gICAgcmV0dXJuIHRoaXMubWVtb1xuICB9XG4gIGdldEZsYWdzKCk6IEJ1ZmZlciB7XG4gICAgcmV0dXJuIHRoaXMuZmxhZ3NcbiAgfVxuICBnZXRUb3RhbE1heFJld2FyZEFtb3VudCgpOiBCdWZmZXIge1xuICAgIHJldHVybiB0aGlzLnRvdGFsTWF4UmV3YXJkQW1vdW50XG4gIH1cbiAgZ2V0UmV3YXJkZWRBbW91bnQoKTogQnVmZmVyIHtcbiAgICByZXR1cm4gdGhpcy5yZXdhcmRlZEFtb3VudFxuICB9XG4gIGdldE93bmVyQWRkcmVzcygpOiBCdWZmZXIge1xuICAgIHJldHVybiB0aGlzLm93bmVyQWRkcmVzc1xuICB9XG59XG5cbi8qKlxuICogQ2xhc3MgcmVwcmVzZW50aW5nIGFuIHVuc2lnbmVkIEFkZERlcG9zaXRPZmZlclR4IHRyYW5zYWN0aW9uLlxuICovXG5leHBvcnQgY2xhc3MgQWRkRGVwb3NpdE9mZmVyVHggZXh0ZW5kcyBCYXNlVHgge1xuICBwcm90ZWN0ZWQgX3R5cGVOYW1lID0gXCJBZGREZXBvc2l0T2ZmZXJUeFwiXG4gIHByb3RlY3RlZCBfdHlwZUlEID0gUGxhdGZvcm1WTUNvbnN0YW50cy5BRERERVBPU0lUT0ZGRVJUWFxuXG4gIHNlcmlhbGl6ZShlbmNvZGluZzogU2VyaWFsaXplZEVuY29kaW5nID0gXCJoZXhcIik6IG9iamVjdCB7XG4gICAgbGV0IGZpZWxkczogb2JqZWN0ID0gc3VwZXIuc2VyaWFsaXplKGVuY29kaW5nKVxuICAgIHJldHVybiB7XG4gICAgICAuLi5maWVsZHMsXG4gICAgICBkZXBvc2l0T2ZmZXI6IHRoaXMuZGVwb3NpdE9mZmVyLnNlcmlhbGl6ZShlbmNvZGluZyksXG4gICAgICBkZXBvc2l0T2ZmZXJDcmVhdG9yQWRkcmVzczogc2VyaWFsaXphdGlvbi5lbmNvZGVyKFxuICAgICAgICB0aGlzLmRlcG9zaXRPZmZlckNyZWF0b3JBZGRyZXNzLFxuICAgICAgICBlbmNvZGluZyxcbiAgICAgICAgXCJCdWZmZXJcIixcbiAgICAgICAgXCJjYjU4XCJcbiAgICAgICksXG4gICAgICBkZXBvc2l0T2ZmZXJDcmVhdG9yQXV0aDogdGhpcy5kZXBvc2l0T2ZmZXJDcmVhdG9yQXV0aC5zZXJpYWxpemUoZW5jb2RpbmcpXG4gICAgfVxuICB9XG4gIGRlc2VyaWFsaXplKGZpZWxkczogb2JqZWN0LCBlbmNvZGluZzogU2VyaWFsaXplZEVuY29kaW5nID0gXCJoZXhcIikge1xuICAgIHN1cGVyLmRlc2VyaWFsaXplKGZpZWxkcywgZW5jb2RpbmcpXG4gICAgdGhpcy5kZXBvc2l0T2ZmZXIgPSBuZXcgT2ZmZXIoKS5kZXNlcmlhbGl6ZShcbiAgICAgIGZpZWxkc1tcImRlcG9zaXRPZmZlclwiXSxcbiAgICAgIGVuY29kaW5nXG4gICAgKVxuICAgIHRoaXMuZGVwb3NpdE9mZmVyQ3JlYXRvckFkZHJlc3MgPSBzZXJpYWxpemF0aW9uLmRlY29kZXIoXG4gICAgICBmaWVsZHNbXCJkZXBvc2l0T2ZmZXJDcmVhdG9yQWRkcmVzc1wiXSxcbiAgICAgIGVuY29kaW5nLFxuICAgICAgXCJjYjU4XCIsXG4gICAgICBcIkJ1ZmZlclwiXG4gICAgKVxuICAgIHRoaXMuZGVwb3NpdE9mZmVyQ3JlYXRvckF1dGguZGVzZXJpYWxpemUoXG4gICAgICBmaWVsZHNbXCJkZXBvc2l0T2ZmZXJDcmVhdG9yQXV0aFwiXSxcbiAgICAgIGVuY29kaW5nXG4gICAgKVxuICB9XG5cbiAgLy8gVGhlIGRlcG9zaXQgb2ZmZXIgdG8gYWRkXG4gIHByb3RlY3RlZCBkZXBvc2l0T2ZmZXI6IE9mZmVyXG4gIC8vIFRoZSBhZGRyZXNzIG9mIHRoZSBhY2NvdW50IHRoYXQgY3JlYXRlcyB0aGUgZGVwb3NpdCBvZmZlclxuICBwcm90ZWN0ZWQgZGVwb3NpdE9mZmVyQ3JlYXRvckFkZHJlc3M6IEJ1ZmZlciA9IEJ1ZmZlci5hbGxvYygyMClcbiAgLy8gVGhlIGF1dGggb2YgdGhlIGRlcG9zaXQgb2ZmZXIgY3JlYXRvciBhZGRyZXNzXG4gIHByb3RlY3RlZCBkZXBvc2l0T2ZmZXJDcmVhdG9yQXV0aDogU3VibmV0QXV0aFxuICBwcm90ZWN0ZWQgc2lnQ291bnQ6IEJ1ZmZlciA9IEJ1ZmZlci5hbGxvYyg0KVxuICBwcm90ZWN0ZWQgc2lnSWR4czogU2lnSWR4W10gPSBbXSAvLyBpZHhzIG9mIHNpZ25lcnNcblxuICAvKipcbiAgICogQ3JlYXRlcyBhbmQgYWRkcyBhIFtbU2lnSWR4XV0gdG8gdGhlIFtbQWRkRGVwb3NpdE9mZmVyVHhdXS5cbiAgICpcbiAgICogQHBhcmFtIGFkZHJlc3NJZHggVGhlIGluZGV4IG9mIHRoZSBhZGRyZXNzIHRvIHJlZmVyZW5jZSBpbiB0aGUgc2lnbmF0dXJlc1xuICAgKiBAcGFyYW0gYWRkcmVzcyBUaGUgYWRkcmVzcyBvZiB0aGUgc291cmNlIG9mIHRoZSBzaWduYXR1cmVcbiAgICovXG4gIGFkZFNpZ25hdHVyZUlkeChhZGRyZXNzSWR4OiBudW1iZXIsIGFkZHJlc3M6IEJ1ZmZlcik6IHZvaWQge1xuICAgIGNvbnN0IGFkZHJlc3NJbmRleDogQnVmZmVyID0gQnVmZmVyLmFsbG9jKDQpXG4gICAgYWRkcmVzc0luZGV4LndyaXRlVUludEJFKGFkZHJlc3NJZHgsIDAsIDQpXG4gICAgdGhpcy5kZXBvc2l0T2ZmZXJDcmVhdG9yQXV0aC5hZGRBZGRyZXNzSW5kZXgoYWRkcmVzc0luZGV4KVxuXG4gICAgY29uc3Qgc2lnaWR4OiBTaWdJZHggPSBuZXcgU2lnSWR4KClcbiAgICBjb25zdCBiOiBCdWZmZXIgPSBCdWZmZXIuYWxsb2MoNClcbiAgICBiLndyaXRlVUludDMyQkUoYWRkcmVzc0lkeCwgMClcbiAgICBzaWdpZHguZnJvbUJ1ZmZlcihiKVxuICAgIHNpZ2lkeC5zZXRTb3VyY2UoYWRkcmVzcylcbiAgICB0aGlzLnNpZ0lkeHMucHVzaChzaWdpZHgpXG4gICAgdGhpcy5zaWdDb3VudC53cml0ZVVJbnQzMkJFKHRoaXMuc2lnSWR4cy5sZW5ndGgsIDApXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgaWQgb2YgdGhlIFtbUmVnaXN0ZXJOb2RlVHhdXVxuICAgKi9cbiAgZ2V0VHhUeXBlKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX3R5cGVJRFxuICB9XG5cbiAgZ2V0RGVwb3NpdE9mZmVyKCk6IE9mZmVyIHtcbiAgICByZXR1cm4gdGhpcy5kZXBvc2l0T2ZmZXJcbiAgfVxuICBnZXREZXBvc2l0T2ZmZXJDcmVhdG9yQWRkcmVzcygpOiBCdWZmZXIge1xuICAgIHJldHVybiB0aGlzLmRlcG9zaXRPZmZlckNyZWF0b3JBZGRyZXNzXG4gIH1cbiAgZ2V0RGVwb3NpdE9mZmVyQ3JlYXRvckF1dGgoKTogU3VibmV0QXV0aCB7XG4gICAgcmV0dXJuIHRoaXMuZGVwb3NpdE9mZmVyQ3JlYXRvckF1dGhcbiAgfVxuICBnZXRTaWdJZHhzKCk6IFNpZ0lkeFtdIHtcbiAgICByZXR1cm4gdGhpcy5zaWdJZHhzXG4gIH1cblxuICAvKipcbiAgICogVGFrZXMgdGhlIGJ5dGVzIG9mIGFuIFtbVW5zaWduZWRUeF1dIGFuZCByZXR1cm5zIGFuIGFycmF5IG9mIFtbQ3JlZGVudGlhbF1dc1xuICAgKlxuICAgKiBAcGFyYW0gbXNnIEEgQnVmZmVyIGZvciB0aGUgW1tVbnNpZ25lZFR4XV1cbiAgICogQHBhcmFtIGtjIEFuIFtbS2V5Q2hhaW5dXSB1c2VkIGluIHNpZ25pbmdcbiAgICpcbiAgICogQHJldHVybnMgQW4gYXJyYXkgb2YgW1tDcmVkZW50aWFsXV1zXG4gICAqL1xuICBzaWduKG1zZzogQnVmZmVyLCBrYzogS2V5Q2hhaW4pOiBDcmVkZW50aWFsW10ge1xuICAgIGNvbnN0IGNyZWRzOiBDcmVkZW50aWFsW10gPSBzdXBlci5zaWduKG1zZywga2MpXG4gICAgY29uc3QgY3JlZDogQ3JlZGVudGlhbCA9IFNlbGVjdENyZWRlbnRpYWxDbGFzcyhcbiAgICAgIFBsYXRmb3JtVk1Db25zdGFudHMuU0VDUENSRURFTlRJQUxcbiAgICApXG4gICAgZm9yIChjb25zdCBzaWdpZHggb2YgdGhpcy5zaWdJZHhzKSB7XG4gICAgICBjb25zdCBrZXlwYWlyOiBLZXlQYWlyID0ga2MuZ2V0S2V5KHNpZ2lkeC5nZXRTb3VyY2UoKSlcbiAgICAgIGNvbnN0IHNpZ252YWw6IEJ1ZmZlciA9IGtleXBhaXIuc2lnbihtc2cpXG4gICAgICBjb25zdCBzaWc6IFNpZ25hdHVyZSA9IG5ldyBTaWduYXR1cmUoKVxuICAgICAgc2lnLmZyb21CdWZmZXIoc2lnbnZhbClcbiAgICAgIGNyZWQuYWRkU2lnbmF0dXJlKHNpZylcbiAgICB9XG4gICAgY3JlZHMucHVzaChjcmVkKVxuICAgIHJldHVybiBjcmVkc1xuICB9XG5cbiAgLyoqXG4gICAqIFRha2VzIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gY29udGFpbmluZyBhIFtbQWRkRGVwb3NpdE9mZmVyVHhdXSwgcGFyc2VzIGl0LCBwb3B1bGF0ZXMgdGhlIGNsYXNzLCBhbmQgcmV0dXJucyB0aGUgbGVuZ3RoIG9mIHRoZSBbW0FkZERlcG9zaXRPZmZlclR4XV0gaW4gYnl0ZXMuXG4gICAqXG4gICAqIEBwYXJhbSBieXRlcyBBIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IGNvbnRhaW5pbmcgYSByYXcgW1tBZGREZXBvc2l0T2ZmZXJUeF1dXG4gICAqXG4gICAqIEByZXR1cm5zIFRoZSBsZW5ndGggb2YgdGhlIHJhdyBbW0FkZERlcG9zaXRPZmZlclR4XV1cbiAgICpcbiAgICogQHJlbWFya3MgYXNzdW1lIG5vdC1jaGVja3N1bW1lZFxuICAgKi9cbiAgZnJvbUJ1ZmZlcihieXRlczogQnVmZmVyLCBvZmZzZXQ6IG51bWJlciA9IDApOiBudW1iZXIge1xuICAgIG9mZnNldCA9IHN1cGVyLmZyb21CdWZmZXIoYnl0ZXMsIG9mZnNldClcblxuICAgIGNvbnN0IGRlcG9zaXRPZmZlcjogT2ZmZXIgPSBuZXcgT2ZmZXIoKVxuICAgIG9mZnNldCA9IGRlcG9zaXRPZmZlci5mcm9tQnVmZmVyKGJ5dGVzLCBvZmZzZXQpXG4gICAgdGhpcy5kZXBvc2l0T2ZmZXIgPSBkZXBvc2l0T2ZmZXJcblxuICAgIHRoaXMuZGVwb3NpdE9mZmVyQ3JlYXRvckFkZHJlc3MgPSBiaW50b29scy5jb3B5RnJvbShcbiAgICAgIGJ5dGVzLFxuICAgICAgb2Zmc2V0LFxuICAgICAgb2Zmc2V0ICsgMjBcbiAgICApXG4gICAgb2Zmc2V0ICs9IDIwXG5cbiAgICBjb25zdCBzYTogU3VibmV0QXV0aCA9IG5ldyBTdWJuZXRBdXRoKClcbiAgICBvZmZzZXQgKz0gc2EuZnJvbUJ1ZmZlcihiaW50b29scy5jb3B5RnJvbShieXRlcywgb2Zmc2V0KSlcbiAgICB0aGlzLmRlcG9zaXRPZmZlckNyZWF0b3JBdXRoID0gc2FcblxuICAgIHJldHVybiBvZmZzZXRcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gcmVwcmVzZW50YXRpb24gb2YgdGhlIFtbQWRkRGVwb3NpdE9mZmVyVHhdXS5cbiAgICovXG4gIHRvQnVmZmVyKCk6IEJ1ZmZlciB7XG4gICAgY29uc3Qgc3VwZXJidWZmOiBCdWZmZXIgPSBzdXBlci50b0J1ZmZlcigpXG5cbiAgICBsZXQgYnNpemU6IG51bWJlciA9IHN1cGVyYnVmZi5sZW5ndGhcblxuICAgIGNvbnN0IGRlcG9zaXRPZmZlckJ1ZmZlcjogQnVmZmVyID0gdGhpcy5kZXBvc2l0T2ZmZXIudG9CdWZmZXIoKVxuICAgIGJzaXplICs9IGRlcG9zaXRPZmZlckJ1ZmZlci5sZW5ndGhcblxuICAgIGNvbnN0IGF1dGhCdWZmZXI6IEJ1ZmZlciA9IHRoaXMuZGVwb3NpdE9mZmVyQ3JlYXRvckF1dGgudG9CdWZmZXIoKVxuICAgIGJzaXplICs9IGF1dGhCdWZmZXIubGVuZ3RoXG5cbiAgICBjb25zdCBiYXJyOiBCdWZmZXJbXSA9IFtcbiAgICAgIHN1cGVyYnVmZixcbiAgICAgIGRlcG9zaXRPZmZlckJ1ZmZlcixcbiAgICAgIHRoaXMuZGVwb3NpdE9mZmVyQ3JlYXRvckFkZHJlc3MsXG4gICAgICBhdXRoQnVmZmVyXG4gICAgXVxuXG4gICAgcmV0dXJuIEJ1ZmZlci5jb25jYXQoYmFyciwgYnNpemUgKyAyMClcbiAgfVxuXG4gIGNsb25lKCk6IHRoaXMge1xuICAgIGNvbnN0IG5ld0FkZERlcG9zaXRPZmZlclR4OiBBZGREZXBvc2l0T2ZmZXJUeCA9IG5ldyBBZGREZXBvc2l0T2ZmZXJUeCgpXG4gICAgbmV3QWRkRGVwb3NpdE9mZmVyVHguZnJvbUJ1ZmZlcih0aGlzLnRvQnVmZmVyKCkpXG4gICAgcmV0dXJuIG5ld0FkZERlcG9zaXRPZmZlclR4IGFzIHRoaXNcbiAgfVxuXG4gIGNyZWF0ZSguLi5hcmdzOiBhbnlbXSk6IHRoaXMge1xuICAgIHJldHVybiBuZXcgQWRkRGVwb3NpdE9mZmVyVHgoLi4uYXJncykgYXMgdGhpc1xuICB9XG5cbiAgLyoqXG4gICAqIENsYXNzIHJlcHJlc2VudGluZyBhbiB1bnNpZ25lZCBBZGREZXBvc2l0T2ZmZXJUeCB0cmFuc2FjdGlvbi5cbiAgICpcbiAgICogQHBhcmFtIG5ldHdvcmtJRCBPcHRpb25hbCBuZXR3b3JrSUQsIFtbRGVmYXVsdE5ldHdvcmtJRF1dXG4gICAqIEBwYXJhbSBibG9ja2NoYWluSUQgT3B0aW9uYWwgYmxvY2tjaGFpbklELCBkZWZhdWx0IEJ1ZmZlci5hbGxvYygzMiwgMTYpXG4gICAqIEBwYXJhbSBvdXRzIE9wdGlvbmFsIGFycmF5IG9mIHRoZSBbW1RyYW5zZmVyYWJsZU91dHB1dF1dc1xuICAgKiBAcGFyYW0gaW5zIE9wdGlvbmFsIGFycmF5IG9mIHRoZSBbW1RyYW5zZmVyYWJsZUlucHV0XV1zXG4gICAqIEBwYXJhbSBtZW1vIE9wdGlvbmFsIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IGZvciB0aGUgbWVtbyBmaWVsZFxuICAgKiBAcGFyYW0gZGVwb3NpdE9mZmVyIE9mZmVyIHRvIGJlIHVzZWQgZm9yIHRoaXMgZGVwb3NpdFxuICAgKiBAcGFyYW0gZGVwb3NpdE9mZmVyQ3JlYXRvckFkZHJlc3MgQWRkcmVzcyBvZiB0aGUgbm9kZSB0aGF0IGNyZWF0ZWQgdGhlIG9mZmVyXG4gICAqL1xuICBjb25zdHJ1Y3RvcihcbiAgICBuZXR3b3JrSUQ6IG51bWJlciA9IERlZmF1bHROZXR3b3JrSUQsXG4gICAgYmxvY2tjaGFpbklEOiBCdWZmZXIgPSBCdWZmZXIuYWxsb2MoMzIsIDE2KSxcbiAgICBvdXRzOiBUcmFuc2ZlcmFibGVPdXRwdXRbXSA9IHVuZGVmaW5lZCxcbiAgICBpbnM6IFRyYW5zZmVyYWJsZUlucHV0W10gPSB1bmRlZmluZWQsXG4gICAgbWVtbzogQnVmZmVyID0gdW5kZWZpbmVkLFxuICAgIGRlcG9zaXRPZmZlcjogT2ZmZXIgPSB1bmRlZmluZWQsXG4gICAgZGVwb3NpdE9mZmVyQ3JlYXRvckFkZHJlc3M6IEJ1ZmZlciA9IHVuZGVmaW5lZFxuICApIHtcbiAgICBzdXBlcihuZXR3b3JrSUQsIGJsb2NrY2hhaW5JRCwgb3V0cywgaW5zLCBtZW1vKVxuICAgIGlmICh0eXBlb2YgZGVwb3NpdE9mZmVyICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICB0aGlzLmRlcG9zaXRPZmZlciA9IGRlcG9zaXRPZmZlclxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmRlcG9zaXRPZmZlciA9IG5ldyBPZmZlcigpXG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBkZXBvc2l0T2ZmZXJDcmVhdG9yQWRkcmVzcyAhPSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICB0aGlzLmRlcG9zaXRPZmZlckNyZWF0b3JBZGRyZXNzID0gZGVwb3NpdE9mZmVyQ3JlYXRvckFkZHJlc3NcbiAgICB9XG4gICAgdGhpcy5kZXBvc2l0T2ZmZXJDcmVhdG9yQXV0aCA9IG5ldyBTdWJuZXRBdXRoKClcbiAgfVxufVxuIl19
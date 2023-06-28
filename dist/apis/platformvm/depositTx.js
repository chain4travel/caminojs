"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepositTx = void 0;
/**
 * @packageDocumentation
 * @module API-PlatformVM-DepositTx
 */
const buffer_1 = require("buffer/");
const bintools_1 = __importDefault(require("../../utils/bintools"));
const constants_1 = require("./constants");
const outputs_1 = require("./outputs");
const basetx_1 = require("./basetx");
const constants_2 = require("../../utils/constants");
const serialization_1 = require("../../utils/serialization");
const subnetauth_1 = require("../../apis/platformvm/subnetauth");
const common_1 = require("../../common");
const credentials_1 = require("../../apis/platformvm/credentials");
/**
 * @ignore
 */
const bintools = bintools_1.default.getInstance();
const serialization = serialization_1.Serialization.getInstance();
/**
 * Class representing an unsigned DepositTx transaction.
 */
class DepositTx extends basetx_1.BaseTx {
    serialize(encoding = "hex") {
        let fields = super.serialize(encoding);
        let fieldsV1 = {};
        if (this.upgradeVersionID.version() > 0) {
            fieldsV1 = {
                depositCreator: serialization.encoder(this.depositCreator, encoding, "Buffer", "cb58"),
                depositCreatorAuth: this.depositCreatorAuth.serialize(encoding),
                ownerAuth: this.ownerAuth.serialize(encoding)
            };
        }
        return Object.assign(Object.assign(Object.assign({}, fields), { depositOfferID: serialization.encoder(this.depositOfferID, encoding, "Buffer", "cb58"), depositDuration: serialization.encoder(this.depositDuration, encoding, "Buffer", "decimalString"), rewardsOwner: this.rewardsOwner.serialize(encoding) }), fieldsV1);
    }
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        this.depositOfferID = serialization.decoder(fields["depositOfferID"], encoding, "cb58", "Buffer", 32);
        this.depositDuration = serialization.decoder(fields["depositDuration"], encoding, "decimalString", "Buffer", 4);
        this.rewardsOwner.deserialize(fields["rewardsOwner"], encoding);
        if (this.upgradeVersionID.version() > 0) {
            this.depositCreator = serialization.decoder(fields["depositCreator"], encoding, "cb58", "Buffer");
            this.depositCreatorAuth.deserialize(fields["depositCreatorAuth"], encoding);
            this.ownerAuth.deserialize(fields["ownerAuth"], encoding);
        }
    }
    /**
     * Returns the id of the [[RegisterNodeTx]]
     */
    getTxType() {
        return this._typeID;
    }
    /**
     * Returns the depositOfferID
     */
    getDepositOfferID() {
        return this.depositOfferID;
    }
    /**
     * Returns the depositOfferID
     */
    getDepositDuration() {
        return this.depositDuration;
    }
    /**
     * Returns the depositOfferID
     */
    getRewardsOwner() {
        return this.rewardsOwner;
    }
    addDepositCreatorAuth(auth) {
        auth.forEach((p) => this.addSignatureIdx(0, this.depositCreatorAuth, p[0], p[1]));
    }
    addOwnerAuth(auth, sigs) {
        auth.forEach((p) => this.addSignatureIdx(1, this.ownerAuth, p[0], undefined));
        this.ownerSignatures = sigs;
    }
    getOwnerSignatures() {
        return this.sigIdxs[1].map((v, i) => [
            v.getSource(),
            this.ownerSignatures[i]
        ]);
    }
    /**
     * Takes a {@link https://github.com/feross/buffer|Buffer} containing a [[DepositTx]], parses it, populates the class, and returns the length of the [[DepositTx]] in bytes.
     *
     * @param bytes A {@link https://github.com/feross/buffer|Buffer} containing a raw [[DepositTx]]
     *
     * @returns The length of the raw [[DepositTx]]
     *
     * @remarks assume not-checksummed
     */
    fromBuffer(bytes, offset = 0) {
        this.upgradeVersionID = new common_1.UpgradeVersionID();
        offset = this.upgradeVersionID.fromBuffer(bytes, offset);
        offset = super.fromBuffer(bytes, offset);
        this.depositOfferID = bintools.copyFrom(bytes, offset, offset + 32);
        offset += 32;
        this.depositDuration = bintools.copyFrom(bytes, offset, offset + 4);
        offset += 4;
        this.rewardsOwner = new outputs_1.ParseableOutput();
        offset = this.rewardsOwner.fromBuffer(bytes, offset);
        if (this.upgradeVersionID.version() > 0) {
            this.depositCreator = bintools.copyFrom(bytes, offset, offset + 20);
            offset += 20;
            let sa = new subnetauth_1.SubnetAuth();
            offset += sa.fromBuffer(bintools.copyFrom(bytes, offset));
            this.depositCreatorAuth = sa;
            sa = new subnetauth_1.SubnetAuth();
            offset += sa.fromBuffer(bintools.copyFrom(bytes, offset));
            this.ownerAuth = sa;
        }
        return offset;
    }
    /**
     * Returns a {@link https://github.com/feross/buffer|Buffer} representation of the [[DepositTx]].
     */
    toBuffer() {
        const upgradeBuf = this.upgradeVersionID.toBuffer();
        const superbuff = super.toBuffer();
        let bsize = upgradeBuf.length +
            superbuff.length +
            this.depositOfferID.length +
            this.depositDuration.length;
        const barr = [
            upgradeBuf,
            superbuff,
            this.depositOfferID,
            this.depositDuration
        ];
        barr.push(this.rewardsOwner.toBuffer());
        bsize += this.rewardsOwner.toBuffer().length;
        if (this.upgradeVersionID.version() > 0) {
            barr.push(this.depositCreator);
            bsize += this.depositCreator.length;
            let authBuffer = this.depositCreatorAuth.toBuffer();
            barr.push(authBuffer);
            bsize += authBuffer.length;
            authBuffer = this.ownerAuth.toBuffer();
            barr.push(authBuffer);
            bsize += authBuffer.length;
        }
        return buffer_1.Buffer.concat(barr, bsize);
    }
    clone() {
        const newDepositTx = new DepositTx();
        newDepositTx.fromBuffer(this.toBuffer());
        return newDepositTx;
    }
    create(...args) {
        return new DepositTx(...args);
    }
    /**
     * Creates and adds a [[SigIdx]] to the [[DepositTx]].
     *
     * @param addressIdx The index of the address to reference in the signatures
     * @param address The address of the source of the signature
     */
    addSignatureIdx(credPos, auth, addressIdx, address) {
        const sigidx = new common_1.SigIdx();
        const b = buffer_1.Buffer.alloc(4);
        b.writeUInt32BE(addressIdx, 0);
        auth.addAddressIndex(b);
        sigidx.fromBuffer(b);
        sigidx.setSource(address);
        this.sigIdxs[credPos].push(sigidx);
        this.sigCount[credPos].writeUInt32BE(this.sigIdxs[credPos].length, 0);
    }
    sign(msg, kc) {
        const creds = super.sign(msg, kc);
        if (this.upgradeVersionID.version() > 0) {
            let cred = (0, credentials_1.SelectCredentialClass)(constants_1.PlatformVMConstants.SECPCREDENTIAL);
            for (const sigidx of this.sigIdxs[0]) {
                const keypair = kc.getKey(sigidx.getSource());
                const signval = keypair.sign(msg);
                const sig = new common_1.Signature();
                sig.fromBuffer(signval);
                cred.addSignature(sig);
            }
            creds.push(cred);
            cred = (0, credentials_1.SelectCredentialClass)(constants_1.PlatformVMConstants.SECPCREDENTIAL);
            for (const ownerSig of this.ownerSignatures) {
                const sig = new common_1.Signature();
                sig.fromBuffer(ownerSig);
                cred.addSignature(sig);
            }
            creds.push(cred);
        }
        return creds;
    }
    /**
     * Class representing an unsigned RegisterNode transaction.
     *
     * @param version Optional. Transaction version number
     * @param networkID Optional networkID, [[DefaultNetworkID]]
     * @param blockchainID Optional blockchainID, default Buffer.alloc(32, 16)
     * @param outs Optional array of the [[TransferableOutput]]s
     * @param ins Optional array of the [[TransferableInput]]s
     * @param memo Optional {@link https://github.com/feross/buffer|Buffer} for the memo field
     * @param depositOfferID Optional ID of the deposit offer.
     * @param duration Optional Duration of depositing.
     * @param rewardsOwner Optional the owner of the rewards
     * @param depositCreator Address that is authorized to create deposit with given offer.
     */
    constructor(version = constants_2.DefaultTransactionVersionNumber, networkID = constants_2.DefaultNetworkID, blockchainID = buffer_1.Buffer.alloc(32, 16), outs = undefined, ins = undefined, memo = undefined, depositOfferID = undefined, depositDuration = undefined, rewardsOwner = undefined, depositCreator = undefined) {
        super(networkID, blockchainID, outs, ins, memo);
        this._typeName = "DepositTx";
        this._typeID = constants_1.PlatformVMConstants.DEPOSITTX;
        // ID of active offer that will be used for this deposit
        this.depositOfferID = buffer_1.Buffer.alloc(32);
        // duration of deposit (in 4 byte format)
        this.depositDuration = buffer_1.Buffer.alloc(4);
        // Where to send staking rewards when done validating
        this.rewardsOwner = new outputs_1.ParseableOutput();
        this.depositCreator = buffer_1.Buffer.alloc(20);
        this.depositCreatorAuth = new subnetauth_1.SubnetAuth();
        this.ownerSignatures = [];
        this.ownerAuth = new subnetauth_1.SubnetAuth();
        this.sigCount = [buffer_1.Buffer.alloc(4), buffer_1.Buffer.alloc(4)];
        this.sigIdxs = [[], []]; // idxs of signers
        this.upgradeVersionID = new common_1.UpgradeVersionID(version);
        if (typeof depositOfferID != "undefined") {
            this.depositOfferID = depositOfferID;
        }
        if (typeof depositDuration != "undefined") {
            this.depositDuration = buffer_1.Buffer.alloc(4);
            this.depositDuration.writeUInt32BE(depositDuration, 0);
        }
        if (typeof rewardsOwner != "undefined") {
            this.rewardsOwner = rewardsOwner;
        }
        if (typeof depositCreator != "undefined") {
            this.depositCreator = depositCreator;
        }
    }
}
exports.DepositTx = DepositTx;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVwb3NpdFR4LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2FwaXMvcGxhdGZvcm12bS9kZXBvc2l0VHgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7OztHQUdHO0FBQ0gsb0NBQWdDO0FBQ2hDLG9FQUEyQztBQUMzQywyQ0FBaUQ7QUFDakQsdUNBQStEO0FBRS9ELHFDQUFpQztBQUNqQyxxREFHOEI7QUFDOUIsNkRBQTZFO0FBQzdFLGlFQUE2RDtBQUU3RCx5Q0FBOEU7QUFDOUUsbUVBQXlFO0FBRXpFOztHQUVHO0FBQ0gsTUFBTSxRQUFRLEdBQWEsa0JBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtBQUNqRCxNQUFNLGFBQWEsR0FBa0IsNkJBQWEsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtBQUVoRTs7R0FFRztBQUNILE1BQWEsU0FBVSxTQUFRLGVBQU07SUFJbkMsU0FBUyxDQUFDLFdBQStCLEtBQUs7UUFDNUMsSUFBSSxNQUFNLEdBQVcsS0FBSyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQTtRQUU5QyxJQUFJLFFBQVEsR0FBVyxFQUFFLENBQUE7UUFDekIsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxFQUFFO1lBQ3ZDLFFBQVEsR0FBRztnQkFDVCxjQUFjLEVBQUUsYUFBYSxDQUFDLE9BQU8sQ0FDbkMsSUFBSSxDQUFDLGNBQWMsRUFDbkIsUUFBUSxFQUNSLFFBQVEsRUFDUixNQUFNLENBQ1A7Z0JBQ0Qsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUM7Z0JBQy9ELFNBQVMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUM7YUFDOUMsQ0FBQTtTQUNGO1FBRUQscURBQ0ssTUFBTSxLQUNULGNBQWMsRUFBRSxhQUFhLENBQUMsT0FBTyxDQUNuQyxJQUFJLENBQUMsY0FBYyxFQUNu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RSxlQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDdkQsWUFBTyxHQUFlLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFBLENBQUMsa0JBQWtCO1FBa056RCxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSx5QkFBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FBQTtRQUNyRCxJQUFJLE9BQU8sY0FBYyxJQUFJLFdBQVcsRUFBRTtZQUN4QyxJQUFJLENBQUMsY0FBYyxHQUFHLGNBQWMsQ0FBQTtTQUNyQztRQUNELElBQUksT0FBTyxlQUFlLElBQUksV0FBVyxFQUFFO1lBQ3pDLElBQUksQ0FBQyxlQUFlLEdBQUcsZUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUN0QyxJQUFJLENBQUMsZUFBZSxDQUFDLGFBQWEsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxDQUFDLENBQUE7U0FDdkQ7UUFDRCxJQUFJLE9BQU8sWUFBWSxJQUFJLFdBQVcsRUFBRTtZQUN0QyxJQUFJLENBQUMsWUFBWSxHQUFHLFlBQVksQ0FBQTtTQUNqQztRQUNELElBQUksT0FBTyxjQUFjLElBQUksV0FBVyxFQUFFO1lBQ3hDLElBQUksQ0FBQyxjQUFjLEdBQUcsY0FBYyxDQUFBO1NBQ3JDO0lBQ0gsQ0FBQztDQUNGO0FBclRELDhCQXFUQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQHBhY2thZ2VEb2N1bWVudGF0aW9uXG4gKiBAbW9kdWxlIEFQSS1QbGF0Zm9ybVZNLURlcG9zaXRUeFxuICovXG5pbXBvcnQgeyBCdWZmZXIgfSBmcm9tIFwiYnVmZmVyL1wiXG5pbXBvcnQgQmluVG9vbHMgZnJvbSBcIi4uLy4uL3V0aWxzL2JpbnRvb2xzXCJcbmltcG9ydCB7IFBsYXRmb3JtVk1Db25zdGFudHMgfSBmcm9tIFwiLi9jb25zdGFudHNcIlxuaW1wb3J0IHsgUGFyc2VhYmxlT3V0cHV0LCBUcmFuc2ZlcmFibGVPdXRwdXQgfSBmcm9tIFwiLi9vdXRwdXRzXCJcbmltcG9ydCB7IFRyYW5zZmVyYWJsZUlucHV0IH0gZnJvbSBcIi4vaW5wdXRzXCJcbmltcG9ydCB7IEJhc2VUeCB9IGZyb20gXCIuL2Jhc2V0eFwiXG5pbXBvcnQge1xuICBEZWZhdWx0TmV0d29ya0lELFxuICBEZWZhdWx0VHJhbnNhY3Rpb25WZXJzaW9uTnVtYmVyXG59IGZyb20gXCIuLi8uLi91dGlscy9jb25zdGFudHNcIlxuaW1wb3J0IHsgU2VyaWFsaXphdGlvbiwgU2VyaWFsaXplZEVuY29kaW5nIH0gZnJvbSBcIi4uLy4uL3V0aWxzL3NlcmlhbGl6YXRpb25cIlxuaW1wb3J0IHsgU3VibmV0QXV0aCB9IGZyb20gXCIuLi8uLi9hcGlzL3BsYXRmb3Jtdm0vc3VibmV0YXV0aFwiXG5pbXBvcnQgeyBLZXlDaGFpbiwgS2V5UGFpciB9IGZyb20gXCIuLi8uLi9hcGlzL3BsYXRmb3Jtdm0va2V5Y2hhaW5cIlxuaW1wb3J0IHsgQ3JlZGVudGlhbCwgU2lnSWR4LCBTaWduYXR1cmUsIFVwZ3JhZGVWZXJzaW9uSUQgfSBmcm9tIFwiLi4vLi4vY29tbW9uXCJcbmltcG9ydCB7IFNlbGVjdENyZWRlbnRpYWxDbGFzcyB9IGZyb20gXCIuLi8uLi9hcGlzL3BsYXRmb3Jtdm0vY3JlZGVudGlhbHNcIlxuXG4vKipcbiAqIEBpZ25vcmVcbiAqL1xuY29uc3QgYmludG9vbHM6IEJpblRvb2xzID0gQmluVG9vbHMuZ2V0SW5zdGFuY2UoKVxuY29uc3Qgc2VyaWFsaXphdGlvbjogU2VyaWFsaXphdGlvbiA9IFNlcmlhbGl6YXRpb24uZ2V0SW5zdGFuY2UoKVxuXG4vKipcbiAqIENsYXNzIHJlcHJlc2VudGluZyBhbiB1bnNpZ25lZCBEZXBvc2l0VHggdHJhbnNhY3Rpb24uXG4gKi9cbmV4cG9ydCBjbGFzcyBEZXBvc2l0VHggZXh0ZW5kcyBCYXNlVHgge1xuICBwcm90ZWN0ZWQgX3R5cGVOYW1lID0gXCJEZXBvc2l0VHhcIlxuICBwcm90ZWN0ZWQgX3R5cGVJRCA9IFBsYXRmb3JtVk1Db25zdGFudHMuREVQT1NJVFRYXG5cbiAgc2VyaWFsaXplKGVuY29kaW5nOiBTZXJpYWxpemVkRW5jb2RpbmcgPSBcImhleFwiKTogb2JqZWN0IHtcbiAgICBsZXQgZmllbGRzOiBvYmplY3QgPSBzdXBlci5zZXJpYWxpemUoZW5jb2RpbmcpXG5cbiAgICBsZXQgZmllbGRzVjE6IG9iamVjdCA9IHt9XG4gICAgaWYgKHRoaXMudXBncmFkZVZlcnNpb25JRC52ZXJzaW9uKCkgPiAwKSB7XG4gICAgICBmaWVsZHNWMSA9IHtcbiAgICAgICAgZGVwb3NpdENyZWF0b3I6IHNlcmlhbGl6YXRpb24uZW5jb2RlcihcbiAgICAgICAgICB0aGlzLmRlcG9zaXRDcmVhdG9yLFxuICAgICAgICAgIGVuY29kaW5nLFxuICAgICAgICAgIFwiQnVmZmVyXCIsXG4gICAgICAgICAgXCJjYjU4XCJcbiAgICAgICAgKSxcbiAgICAgICAgZGVwb3NpdENyZWF0b3JBdXRoOiB0aGlzLmRlcG9zaXRDcmVhdG9yQXV0aC5zZXJpYWxpemUoZW5jb2RpbmcpLFxuICAgICAgICBvd25lckF1dGg6IHRoaXMub3duZXJBdXRoLnNlcmlhbGl6ZShlbmNvZGluZylcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgLi4uZmllbGRzLFxuICAgICAgZGVwb3NpdE9mZmVySUQ6IHNlcmlhbGl6YXRpb24uZW5jb2RlcihcbiAgICAgICAgdGhpcy5kZXBvc2l0T2ZmZXJJRCxcbiAgICAgICAgZW5jb2RpbmcsXG4gICAgICAgIFwiQnVmZmVyXCIsXG4gICAgICAgIFwiY2I1OFwiXG4gICAgICApLFxuICAgICAgZGVwb3NpdER1cmF0aW9uOiBzZXJpYWxpemF0aW9uLmVuY29kZXIoXG4gICAgICAgIHRoaXMuZGVwb3NpdER1cmF0aW9uLFxuICAgICAgICBlbmNvZGluZyxcbiAgICAgICAgXCJCdWZmZXJcIixcbiAgICAgICAgXCJkZWNpbWFsU3RyaW5nXCJcbiAgICAgICksXG4gICAgICByZXdhcmRzT3duZXI6IHRoaXMucmV3YXJkc093bmVyLnNlcmlhbGl6ZShlbmNvZGluZyksXG4gICAgICAuLi5maWVsZHNWMVxuICAgIH1cbiAgfVxuICBkZXNlcmlhbGl6ZShmaWVsZHM6IG9iamVjdCwgZW5jb2Rpbmc6IFNlcmlhbGl6ZWRFbmNvZGluZyA9IFwiaGV4XCIpIHtcbiAgICBzdXBlci5kZXNlcmlhbGl6ZShmaWVsZHMsIGVuY29kaW5nKVxuICAgIHRoaXMuZGVwb3NpdE9mZmVySUQgPSBzZXJpYWxpemF0aW9uLmRlY29kZXIoXG4gICAgICBmaWVsZHNbXCJkZXBvc2l0T2ZmZXJJRFwiXSxcbiAgICAgIGVuY29kaW5nLFxuICAgICAgXCJjYjU4XCIsXG4gICAgICBcIkJ1ZmZlclwiLFxuICAgICAgMzJcbiAgICApXG4gICAgdGhpcy5kZXBvc2l0RHVyYXRpb24gPSBzZXJpYWxpemF0aW9uLmRlY29kZXIoXG4gICAgICBmaWVsZHNbXCJkZXBvc2l0RHVyYXRpb25cIl0sXG4gICAgICBlbmNvZGluZyxcbiAgICAgIFwiZGVjaW1hbFN0cmluZ1wiLFxuICAgICAgXCJCdWZmZXJcIixcbiAgICAgIDRcbiAgICApXG4gICAgdGhpcy5yZXdhcmRzT3duZXIuZGVzZXJpYWxpemUoZmllbGRzW1wicmV3YXJkc093bmVyXCJdLCBlbmNvZGluZylcblxuICAgIGlmICh0aGlzLnVwZ3JhZGVWZXJzaW9uSUQudmVyc2lvbigpID4gMCkge1xuICAgICAgdGhpcy5kZXBvc2l0Q3JlYXRvciA9IHNlcmlhbGl6YXRpb24uZGVjb2RlcihcbiAgICAgICAgZmllbGRzW1wiZGVwb3NpdENyZWF0b3JcIl0sXG4gICAgICAgIGVuY29kaW5nLFxuICAgICAgICBcImNiNThcIixcbiAgICAgICAgXCJCdWZmZXJcIlxuICAgICAgKVxuICAgICAgdGhpcy5kZXBvc2l0Q3JlYXRvckF1dGguZGVzZXJpYWxpemUoXG4gICAgICAgIGZpZWxkc1tcImRlcG9zaXRDcmVhdG9yQXV0aFwiXSxcbiAgICAgICAgZW5jb2RpbmdcbiAgICAgIClcbiAgICAgIHRoaXMub3duZXJBdXRoLmRlc2VyaWFsaXplKGZpZWxkc1tcIm93bmVyQXV0aFwiXSwgZW5jb2RpbmcpXG4gICAgfVxuICB9XG4gIC8vIFVwZ3JhZGVWZXJzaW9uSUQgKHNpbmNlIFNQMSlcbiAgcHJvdGVjdGVkIHVwZ3JhZGVWZXJzaW9uSUQ6IFVwZ3JhZGVWZXJzaW9uSURcbiAgLy8gSUQgb2YgYWN0aXZlIG9mZmVyIHRoYXQgd2lsbCBiZSB1c2VkIGZvciB0aGlzIGRlcG9zaXRcbiAgcHJvdGVjdGVkIGRlcG9zaXRPZmZlcklEOiBCdWZmZXIgPSBCdWZmZXIuYWxsb2MoMzIpXG4gIC8vIGR1cmF0aW9uIG9mIGRlcG9zaXQgKGluIDQgYnl0ZSBmb3JtYXQpXG4gIHByb3RlY3RlZCBkZXBvc2l0RHVyYXRpb246IEJ1ZmZlciA9IEJ1ZmZlci5hbGxvYyg0KVxuICAvLyBXaGVyZSB0byBzZW5kIHN0YWtpbmcgcmV3YXJkcyB3aGVuIGRvbmUgdmFsaWRhdGluZ1xuICBwcm90ZWN0ZWQgcmV3YXJkc093bmVyOiBQYXJzZWFibGVPdXRwdXQgPSBuZXcgUGFyc2VhYmxlT3V0cHV0KClcbiAgcHJvdGVjdGVkIGRlcG9zaXRDcmVhdG9yOiBCdWZmZXIgPSBCdWZmZXIuYWxsb2MoMjApXG4gIHByb3RlY3RlZCBkZXBvc2l0Q3JlYXRvckF1dGg6IFN1Ym5ldEF1dGggPSBuZXcgU3VibmV0QXV0aCgpXG4gIHByb3RlY3RlZCBvd25lclNpZ25hdHVyZXM6IEJ1ZmZlcltdID0gW11cbiAgcHJvdGVjdGVkIG93bmVyQXV0aDogU3VibmV0QXV0aCA9IG5ldyBTdWJuZXRBdXRoKClcbiAgcHJvdGVjdGVkIHNpZ0NvdW50OiBCdWZmZXJbXSA9IFtCdWZmZXIuYWxsb2MoNCksIEJ1ZmZlci5hbGxvYyg0KV1cbiAgcHJvdGVjdGVkIHNpZ0lkeHM6IFNpZ0lkeFtdW10gPSBbW10sIFtdXSAvLyBpZHhzIG9mIHNpZ25lcnNcblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgaWQgb2YgdGhlIFtbUmVnaXN0ZXJOb2RlVHhdXVxuICAgKi9cbiAgZ2V0VHhUeXBlKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX3R5cGVJRFxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGRlcG9zaXRPZmZlcklEXG4gICAqL1xuICBnZXREZXBvc2l0T2ZmZXJJRCgpOiBCdWZmZXIge1xuICAgIHJldHVybiB0aGlzLmRlcG9zaXRPZmZlcklEXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgZGVwb3NpdE9mZmVySURcbiAgICovXG4gIGdldERlcG9zaXREdXJhdGlvbigpOiBCdWZmZXIge1xuICAgIHJldHVybiB0aGlzLmRlcG9zaXREdXJhdGlvblxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGRlcG9zaXRPZmZlcklEXG4gICAqL1xuICBnZXRSZXdhcmRzT3duZXIoKTogUGFyc2VhYmxlT3V0cHV0IHtcbiAgICByZXR1cm4gdGhpcy5yZXdhcmRzT3duZXJcbiAgfVxuXG4gIGFkZERlcG9zaXRDcmVhdG9yQXV0aChhdXRoOiBbbnVtYmVyLCBCdWZmZXJdW10pOiB2b2lkIHtcbiAgICBhdXRoLmZvckVhY2goKHApID0+XG4gICAgICB0aGlzLmFkZFNpZ25hdHVyZUlkeCgwLCB0aGlzLmRlcG9zaXRDcmVhdG9yQXV0aCwgcFswXSwgcFsxXSlcbiAgICApXG4gIH1cblxuICBhZGRPd25lckF1dGgoYXV0aDogW251bWJlciwgQnVmZmVyXVtdLCBzaWdzOiBCdWZmZXJbXSk6IHZvaWQge1xuICAgIGF1dGguZm9yRWFjaCgocCkgPT5cbiAgICAgIHRoaXMuYWRkU2lnbmF0dXJlSWR4KDEsIHRoaXMub3duZXJBdXRoLCBwWzBdLCB1bmRlZmluZWQpXG4gICAgKVxuICAgIHRoaXMub3duZXJTaWduYXR1cmVzID0gc2lnc1xuICB9XG5cbiAgZ2V0T3duZXJTaWduYXR1cmVzKCk6IFtCdWZmZXIsIEJ1ZmZlcl1bXSB7XG4gICAgcmV0dXJuIHRoaXMuc2lnSWR4c1sxXS5tYXAoKHYsIGkpID0+IFtcbiAgICAgIHYuZ2V0U291cmNlKCksXG4gICAgICB0aGlzLm93bmVyU2lnbmF0dXJlc1tpXVxuICAgIF0pXG4gIH1cblxuICAvKipcbiAgICogVGFrZXMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBjb250YWluaW5nIGEgW1tEZXBvc2l0VHhdXSwgcGFyc2VzIGl0LCBwb3B1bGF0ZXMgdGhlIGNsYXNzLCBhbmQgcmV0dXJucyB0aGUgbGVuZ3RoIG9mIHRoZSBbW0RlcG9zaXRUeF1dIGluIGJ5dGVzLlxuICAgKlxuICAgKiBAcGFyYW0gYnl0ZXMgQSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBjb250YWluaW5nIGEgcmF3IFtbRGVwb3NpdFR4XV1cbiAgICpcbiAgICogQHJldHVybnMgVGhlIGxlbmd0aCBvZiB0aGUgcmF3IFtbRGVwb3NpdFR4XV1cbiAgICpcbiAgICogQHJlbWFya3MgYXNzdW1lIG5vdC1jaGVja3N1bW1lZFxuICAgKi9cbiAgZnJvbUJ1ZmZlcihieXRlczogQnVmZmVyLCBvZmZzZXQ6IG51bWJlciA9IDApOiBudW1iZXIge1xuICAgIHRoaXMudXBncmFkZVZlcnNpb25JRCA9IG5ldyBVcGdyYWRlVmVyc2lvbklEKClcbiAgICBvZmZzZXQgPSB0aGlzLnVwZ3JhZGVWZXJzaW9uSUQuZnJvbUJ1ZmZlcihieXRlcywgb2Zmc2V0KVxuICAgIG9mZnNldCA9IHN1cGVyLmZyb21CdWZmZXIoYnl0ZXMsIG9mZnNldClcbiAgICB0aGlzLmRlcG9zaXRPZmZlcklEID0gYmludG9vbHMuY29weUZyb20oYnl0ZXMsIG9mZnNldCwgb2Zmc2V0ICsgMzIpXG4gICAgb2Zmc2V0ICs9IDMyXG4gICAgdGhpcy5kZXBvc2l0RHVyYXRpb24gPSBiaW50b29scy5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyA0KVxuICAgIG9mZnNldCArPSA0XG4gICAgdGhpcy5yZXdhcmRzT3duZXIgPSBuZXcgUGFyc2VhYmxlT3V0cHV0KClcbiAgICBvZmZzZXQgPSB0aGlzLnJld2FyZHNPd25lci5mcm9tQnVmZmVyKGJ5dGVzLCBvZmZzZXQpXG5cbiAgICBpZiAodGhpcy51cGdyYWRlVmVyc2lvbklELnZlcnNpb24oKSA+IDApIHtcbiAgICAgIHRoaXMuZGVwb3NpdENyZWF0b3IgPSBiaW50b29scy5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyAyMClcbiAgICAgIG9mZnNldCArPSAyMFxuXG4gICAgICBsZXQgc2EgPSBuZXcgU3VibmV0QXV0aCgpXG4gICAgICBvZmZzZXQgKz0gc2EuZnJvbUJ1ZmZlcihiaW50b29scy5jb3B5RnJvbShieXRlcywgb2Zmc2V0KSlcbiAgICAgIHRoaXMuZGVwb3NpdENyZWF0b3JBdXRoID0gc2FcblxuICAgICAgc2EgPSBuZXcgU3VibmV0QXV0aCgpXG4gICAgICBvZmZzZXQgKz0gc2EuZnJvbUJ1ZmZlcihiaW50b29scy5jb3B5RnJvbShieXRlcywgb2Zmc2V0KSlcbiAgICAgIHRoaXMub3duZXJBdXRoID0gc2FcbiAgICB9XG4gICAgcmV0dXJuIG9mZnNldFxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSByZXByZXNlbnRhdGlvbiBvZiB0aGUgW1tEZXBvc2l0VHhdXS5cbiAgICovXG4gIHRvQnVmZmVyKCk6IEJ1ZmZlciB7XG4gICAgY29uc3QgdXBncmFkZUJ1ZiA9IHRoaXMudXBncmFkZVZlcnNpb25JRC50b0J1ZmZlcigpXG4gICAgY29uc3Qgc3VwZXJidWZmOiBCdWZmZXIgPSBzdXBlci50b0J1ZmZlcigpXG5cbiAgICBsZXQgYnNpemU6IG51bWJlciA9XG4gICAgICB1cGdyYWRlQnVmLmxlbmd0aCArXG4gICAgICBzdXBlcmJ1ZmYubGVuZ3RoICtcbiAgICAgIHRoaXMuZGVwb3NpdE9mZmVySUQubGVuZ3RoICtcbiAgICAgIHRoaXMuZGVwb3NpdER1cmF0aW9uLmxlbmd0aFxuICAgIGNvbnN0IGJhcnI6IEJ1ZmZlcltdID0gW1xuICAgICAgdXBncmFkZUJ1ZixcbiAgICAgIHN1cGVyYnVmZixcbiAgICAgIHRoaXMuZGVwb3NpdE9mZmVySUQsXG4gICAgICB0aGlzLmRlcG9zaXREdXJhdGlvblxuICAgIF1cblxuICAgIGJhcnIucHVzaCh0aGlzLnJld2FyZHNPd25lci50b0J1ZmZlcigpKVxuICAgIGJzaXplICs9IHRoaXMucmV3YXJkc093bmVyLnRvQnVmZmVyKCkubGVuZ3RoXG5cbiAgICBpZiAodGhpcy51cGdyYWRlVmVyc2lvbklELnZlcnNpb24oKSA+IDApIHtcbiAgICAgIGJhcnIucHVzaCh0aGlzLmRlcG9zaXRDcmVhdG9yKVxuICAgICAgYnNpemUgKz0gdGhpcy5kZXBvc2l0Q3JlYXRvci5sZW5ndGhcblxuICAgICAgbGV0IGF1dGhCdWZmZXI6IEJ1ZmZlciA9IHRoaXMuZGVwb3NpdENyZWF0b3JBdXRoLnRvQnVmZmVyKClcbiAgICAgIGJhcnIucHVzaChhdXRoQnVmZmVyKVxuICAgICAgYnNpemUgKz0gYXV0aEJ1ZmZlci5sZW5ndGhcblxuICAgICAgYXV0aEJ1ZmZlciA9IHRoaXMub3duZXJBdXRoLnRvQnVmZmVyKClcbiAgICAgIGJhcnIucHVzaChhdXRoQnVmZmVyKVxuICAgICAgYnNpemUgKz0gYXV0aEJ1ZmZlci5sZW5ndGhcbiAgICB9XG4gICAgcmV0dXJuIEJ1ZmZlci5jb25jYXQoYmFyciwgYnNpemUpXG4gIH1cblxuICBjbG9uZSgpOiB0aGlzIHtcbiAgICBjb25zdCBuZXdEZXBvc2l0VHg6IERlcG9zaXRUeCA9IG5ldyBEZXBvc2l0VHgoKVxuICAgIG5ld0RlcG9zaXRUeC5mcm9tQnVmZmVyKHRoaXMudG9CdWZmZXIoKSlcbiAgICByZXR1cm4gbmV3RGVwb3NpdFR4IGFzIHRoaXNcbiAgfVxuXG4gIGNyZWF0ZSguLi5hcmdzOiBhbnlbXSk6IHRoaXMge1xuICAgIHJldHVybiBuZXcgRGVwb3NpdFR4KC4uLmFyZ3MpIGFzIHRoaXNcbiAgfVxuICAvKipcbiAgICogQ3JlYXRlcyBhbmQgYWRkcyBhIFtbU2lnSWR4XV0gdG8gdGhlIFtbRGVwb3NpdFR4XV0uXG4gICAqXG4gICAqIEBwYXJhbSBhZGRyZXNzSWR4IFRoZSBpbmRleCBvZiB0aGUgYWRkcmVzcyB0byByZWZlcmVuY2UgaW4gdGhlIHNpZ25hdHVyZXNcbiAgICogQHBhcmFtIGFkZHJlc3MgVGhlIGFkZHJlc3Mgb2YgdGhlIHNvdXJjZSBvZiB0aGUgc2lnbmF0dXJlXG4gICAqL1xuICBhZGRTaWduYXR1cmVJZHgoXG4gICAgY3JlZFBvczogbnVtYmVyLFxuICAgIGF1dGg6IFN1Ym5ldEF1dGgsXG4gICAgYWRkcmVzc0lkeDogbnVtYmVyLFxuICAgIGFkZHJlc3M6IEJ1ZmZlclxuICApOiB2b2lkIHtcbiAgICBjb25zdCBzaWdpZHg6IFNpZ0lkeCA9IG5ldyBTaWdJZHgoKVxuICAgIGNvbnN0IGI6IEJ1ZmZlciA9IEJ1ZmZlci5hbGxvYyg0KVxuICAgIGIud3JpdGVVSW50MzJCRShhZGRyZXNzSWR4LCAwKVxuXG4gICAgYXV0aC5hZGRBZGRyZXNzSW5kZXgoYilcblxuICAgIHNpZ2lkeC5mcm9tQnVmZmVyKGIpXG4gICAgc2lnaWR4LnNldFNvdXJjZShhZGRyZXNzKVxuICAgIHRoaXMuc2lnSWR4c1tjcmVkUG9zXS5wdXNoKHNpZ2lkeClcbiAgICB0aGlzLnNpZ0NvdW50W2NyZWRQb3NdLndyaXRlVUludDMyQkUodGhpcy5zaWdJZHhzW2NyZWRQb3NdLmxlbmd0aCwgMClcbiAgfVxuXG4gIHNpZ24obXNnOiBCdWZmZXIsIGtjOiBLZXlDaGFpbik6IENyZWRlbnRpYWxbXSB7XG4gICAgY29uc3QgY3JlZHM6IENyZWRlbnRpYWxbXSA9IHN1cGVyLnNpZ24obXNnLCBrYylcbiAgICBpZiAodGhpcy51cGdyYWRlVmVyc2lvbklELnZlcnNpb24oKSA+IDApIHtcbiAgICAgIGxldCBjcmVkOiBDcmVkZW50aWFsID0gU2VsZWN0Q3JlZGVudGlhbENsYXNzKFxuICAgICAgICBQbGF0Zm9ybVZNQ29uc3RhbnRzLlNFQ1BDUkVERU5USUFMXG4gICAgICApXG5cbiAgICAgIGZvciAoY29uc3Qgc2lnaWR4IG9mIHRoaXMuc2lnSWR4c1swXSkge1xuICAgICAgICBjb25zdCBrZXlwYWlyOiBLZXlQYWlyID0ga2MuZ2V0S2V5KHNpZ2lkeC5nZXRTb3VyY2UoKSlcbiAgICAgICAgY29uc3Qgc2lnbnZhbDogQnVmZmVyID0ga2V5cGFpci5zaWduKG1zZylcbiAgICAgICAgY29uc3Qgc2lnOiBTaWduYXR1cmUgPSBuZXcgU2lnbmF0dXJlKClcbiAgICAgICAgc2lnLmZyb21CdWZmZXIoc2lnbnZhbClcbiAgICAgICAgY3JlZC5hZGRTaWduYXR1cmUoc2lnKVxuICAgICAgfVxuICAgICAgY3JlZHMucHVzaChjcmVkKVxuXG4gICAgICBjcmVkID0gU2VsZWN0Q3JlZGVudGlhbENsYXNzKFBsYXRmb3JtVk1Db25zdGFudHMuU0VDUENSRURFTlRJQUwpXG4gICAgICBmb3IgKGNvbnN0IG93bmVyU2lnIG9mIHRoaXMub3duZXJTaWduYXR1cmVzKSB7XG4gICAgICAgIGNvbnN0IHNpZzogU2lnbmF0dXJlID0gbmV3IFNpZ25hdHVyZSgpXG4gICAgICAgIHNpZy5mcm9tQnVmZmVyKG93bmVyU2lnKVxuICAgICAgICBjcmVkLmFkZFNpZ25hdHVyZShzaWcpXG4gICAgICB9XG4gICAgICBjcmVkcy5wdXNoKGNyZWQpXG4gICAgfVxuXG4gICAgcmV0dXJuIGNyZWRzXG4gIH1cblxuICAvKipcbiAgICogQ2xhc3MgcmVwcmVzZW50aW5nIGFuIHVuc2lnbmVkIFJlZ2lzdGVyTm9kZSB0cmFuc2FjdGlvbi5cbiAgICpcbiAgICogQHBhcmFtIHZlcnNpb24gT3B0aW9uYWwuIFRyYW5zYWN0aW9uIHZlcnNpb24gbnVtYmVyXG4gICAqIEBwYXJhbSBuZXR3b3JrSUQgT3B0aW9uYWwgbmV0d29ya0lELCBbW0RlZmF1bHROZXR3b3JrSURdXVxuICAgKiBAcGFyYW0gYmxvY2tjaGFpbklEIE9wdGlvbmFsIGJsb2NrY2hhaW5JRCwgZGVmYXVsdCBCdWZmZXIuYWxsb2MoMzIsIDE2KVxuICAgKiBAcGFyYW0gb3V0cyBPcHRpb25hbCBhcnJheSBvZiB0aGUgW1tUcmFuc2ZlcmFibGVPdXRwdXRdXXNcbiAgICogQHBhcmFtIGlucyBPcHRpb25hbCBhcnJheSBvZiB0aGUgW1tUcmFuc2ZlcmFibGVJbnB1dF1dc1xuICAgKiBAcGFyYW0gbWVtbyBPcHRpb25hbCB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBmb3IgdGhlIG1lbW8gZmllbGRcbiAgICogQHBhcmFtIGRlcG9zaXRPZmZlcklEIE9wdGlvbmFsIElEIG9mIHRoZSBkZXBvc2l0IG9mZmVyLlxuICAgKiBAcGFyYW0gZHVyYXRpb24gT3B0aW9uYWwgRHVyYXRpb24gb2YgZGVwb3NpdGluZy5cbiAgICogQHBhcmFtIHJld2FyZHNPd25lciBPcHRpb25hbCB0aGUgb3duZXIgb2YgdGhlIHJld2FyZHNcbiAgICogQHBhcmFtIGRlcG9zaXRDcmVhdG9yIEFkZHJlc3MgdGhhdCBpcyBhdXRob3JpemVkIHRvIGNyZWF0ZSBkZXBvc2l0IHdpdGggZ2l2ZW4gb2ZmZXIuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihcbiAgICB2ZXJzaW9uOiBudW1iZXIgPSBEZWZhdWx0VHJhbnNhY3Rpb25WZXJzaW9uTnVtYmVyLFxuICAgIG5ldHdvcmtJRDogbnVtYmVyID0gRGVmYXVsdE5ldHdvcmtJRCxcbiAgICBibG9ja2NoYWluSUQ6IEJ1ZmZlciA9IEJ1ZmZlci5hbGxvYygzMiwgMTYpLFxuICAgIG91dHM6IFRyYW5zZmVyYWJsZU91dHB1dFtdID0gdW5kZWZpbmVkLFxuICAgIGluczogVHJhbnNmZXJhYmxlSW5wdXRbXSA9IHVuZGVmaW5lZCxcbiAgICBtZW1vOiBCdWZmZXIgPSB1bmRlZmluZWQsXG4gICAgZGVwb3NpdE9mZmVySUQ6IEJ1ZmZlciA9IHVuZGVmaW5lZCxcbiAgICBkZXBvc2l0RHVyYXRpb246IG51bWJlciA9IHVuZGVmaW5lZCxcbiAgICByZXdhcmRzT3duZXI6IFBhcnNlYWJsZU91dHB1dCA9IHVuZGVmaW5lZCxcbiAgICBkZXBvc2l0Q3JlYXRvcjogQnVmZmVyID0gdW5kZWZpbmVkXG4gICkge1xuICAgIHN1cGVyKG5ldHdvcmtJRCwgYmxvY2tjaGFpbklELCBvdXRzLCBpbnMsIG1lbW8pXG4gICAgdGhpcy51cGdyYWRlVmVyc2lvbklEID0gbmV3IFVwZ3JhZGVWZXJzaW9uSUQodmVyc2lvbilcbiAgICBpZiAodHlwZW9mIGRlcG9zaXRPZmZlcklEICE9IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIHRoaXMuZGVwb3NpdE9mZmVySUQgPSBkZXBvc2l0T2ZmZXJJRFxuICAgIH1cbiAgICBpZiAodHlwZW9mIGRlcG9zaXREdXJhdGlvbiAhPSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICB0aGlzLmRlcG9zaXREdXJhdGlvbiA9IEJ1ZmZlci5hbGxvYyg0KVxuICAgICAgdGhpcy5kZXBvc2l0RHVyYXRpb24ud3JpdGVVSW50MzJCRShkZXBvc2l0RHVyYXRpb24sIDApXG4gICAgfVxuICAgIGlmICh0eXBlb2YgcmV3YXJkc093bmVyICE9IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIHRoaXMucmV3YXJkc093bmVyID0gcmV3YXJkc093bmVyXG4gICAgfVxuICAgIGlmICh0eXBlb2YgZGVwb3NpdENyZWF0b3IgIT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgdGhpcy5kZXBvc2l0Q3JlYXRvciA9IGRlcG9zaXRDcmVhdG9yXG4gICAgfVxuICB9XG59XG4iXX0=
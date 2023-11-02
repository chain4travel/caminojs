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
        auth.forEach((p) => {
            const pseudoAddr = buffer_1.Buffer.alloc(20);
            pseudoAddr.writeUIntBE(auth.indexOf(p) + 1, 16, 4);
            this.addSignatureIdx(1, this.ownerAuth, p[0], pseudoAddr);
        });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVwb3NpdFR4LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2FwaXMvcGxhdGZvcm12bS9kZXBvc2l0VHgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7OztHQUdHO0FBQ0gsb0NBQWdDO0FBQ2hDLG9FQUEyQztBQUMzQywyQ0FBaUQ7QUFDakQsdUNBQStEO0FBRS9ELHFDQUFpQztBQUNqQyxxREFHOEI7QUFDOUIsNkRBQTZFO0FBQzdFLGlFQUE2RDtBQUU3RCx5Q0FBOEU7QUFDOUUsbUVBQXlFO0FBRXpFOztHQUVHO0FBQ0gsTUFBTSxRQUFRLEdBQWEsa0JBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtBQUNqRCxNQUFNLGFBQWEsR0FBa0IsNkJBQWEsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtBQUVoRTs7R0FFRztBQUNILE1BQWEsU0FBVSxTQUFRLGVBQU07SUFJbkMsU0FBUyxDQUFDLFdBQStCLEtBQUs7UUFDNUMsSUFBSSxNQUFNLEdBQVcsS0FBSyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQTtRQUU5QyxJQUFJLFFBQVEsR0FBVyxFQUFFLENBQUE7UUFDekIsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxFQUFFO1lBQ3ZDLFFBQVEsR0FBRztnQkFDVCxjQUFjLEVBQUUsYUFBYSxDQUFDLE9BQU8sQ0FDbkMsSUFBSSxDQUFDLGNBQWMsRUFDbkIsUUFBUSxFQUNSLFFBQVEsRUFDUixNQUFNLENBQ1A7Z0JBQ0Qsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUM7Z0JBQy9ELFNBQVMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUM7YUFDOUMsQ0FBQTtTQUNGO1FBRUQscURBQ0ssTUFBTSxLQUNULGNBQWMsRUFBRSxhQUFhLENBQUMsT0FBTyxDQUNuQyxJQUFJLENBQUMsY0FBYyxFQUNuQixRQUFRLEVBQ1IsUUFBUSxFQUNSLE1BQU0sQ0FDUCxFQUNELGVBQWUsRUFBRSxhQUFhLENBQUMsT0FBTyxDQUNwQyxJQUFJLENBQUMsZUFBZSxFQUNwQixRQUFRLEVBQ1IsUUFBUSxFQUNSLGVBQWUsQ0FDaEIsRUFDRCxZQUFZLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLEtBQ2hELFFBQVEsRUFDWjtJQUNILENBQUM7SUFDRCxXQUFXLENBQUMsTUFBYyxFQUFFLFdBQStCLEtBQUs7UUFDOUQsS0FBSyxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUE7UUFDbkMsSUFBSSxDQUFDLGNBQWMsR0FBRyxhQUFhLENBQUMsT0FBTyxDQUN6QyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsRUFDeEIsUUFBUSxFQUNSLE1BQU0sRUFDTixRQUFRLEVBQ1IsRUFBRSxDQUNILENBQUE7UUFDRCxJQUFJLENBQUMsZUFBZSxHQUFHLGFBQWEsQ0FBQyxPQUFPLENBQzFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxFQUN6QixRQUFRLEVBQ1IsZUFBZSxFQUNmLFFBQVEsRUFDUixDQUFDLENBQ0YsQ0FBQTtRQUNELElBQUksQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQTtRQUUvRCxJQUFJLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLEVBQUU7WUFDdkMsSUFBSSxDQUFDLGNBQWMsR0FBRyxhQUFhLENBQUMsT0FBTyxDQUN6QyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsRUFDeEIsUUFBUSxFQUNSLE1BQU0sRUFDTixRQUFRLENBQ1QsQ0FBQTtZQUNELElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxXQUFXLENBQ2pDLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxFQUM1QixRQUFRLENBQ1QsQ0FBQTtZQUNELElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQTtTQUMxRDtJQUNILENBQUM7SUFnQkQ7O09BRUc7SUFDSCxTQUFTO1FBQ1AsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFBO0lBQ3JCLENBQUM7SUFFRDs7T0FFRztJQUNILGlCQUFpQjtRQUNmLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQTtJQUM1QixDQUFDO0lBRUQ7O09BRUc7SUFDSCxrQkFBa0I7UUFDaEIsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFBO0lBQzdCLENBQUM7SUFFRDs7T0FFRztJQUNILGVBQWU7UUFDYixPQUFPLElBQUksQ0FBQyxZQUFZLENBQUE7SUFDMUIsQ0FBQztJQUVELHFCQUFxQixDQUFDLElBQXdCO1FBQzVDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUNqQixJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUM3RCxDQUFBO0lBQ0gsQ0FBQztJQUVELFlBQVksQ0FBQyxJQUF3QixFQUFFLElBQWM7UUFDbkQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFO1lBQ2pCLE1BQU0sVUFBVSxHQUFHLGVBQU0sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUE7WUFDbkMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUE7WUFDbEQsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsVUFBVSxDQUFDLENBQUE7UUFDM0QsQ0FBQyxDQUFDLENBQUE7UUFDRixJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQTtJQUM3QixDQUFDO0lBRUQsa0JBQWtCO1FBQ2hCLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUNuQyxDQUFDLENBQUMsU0FBUyxFQUFFO1lBQ2IsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7U0FDeEIsQ0FBQyxDQUFBO0lBQ0osQ0FBQztJQUVEOzs7Ozs7OztPQVFHO0lBQ0gsVUFBVSxDQUFDLEtBQWEsRUFBRSxTQUFpQixDQUFDO1FBQzFDLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLHlCQUFnQixFQUFFLENBQUE7UUFDOUMsTUFBTSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFBO1FBQ3hELE1BQU0sR0FBRyxLQUFLLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQTtRQUN4QyxJQUFJLENBQUMsY0FBYyxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLEdBQUcsRUFBRSxDQUFDLENBQUE7UUFDbkUsTUFBTSxJQUFJLEVBQUUsQ0FBQTtRQUNaLElBQUksQ0FBQyxlQUFlLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQTtRQUNuRSxNQUFNLElBQUksQ0FBQyxDQUFBO1FBQ1gsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLHlCQUFlLEVBQUUsQ0FBQTtRQUN6QyxNQUFNLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFBO1FBRXBELElBQUksSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsRUFBRTtZQUN2QyxJQUFJLENBQUMsY0FBYyxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLEdBQUcsRUFBRSxDQUFDLENBQUE7WUFDbkUsTUFBTSxJQUFJLEVBQUUsQ0FBQTtZQUVaLElBQUksRUFBRSxHQUFHLElBQUksdUJBQVUsRUFBRSxDQUFBO1lBQ3pCLE1BQU0sSUFBSSxFQUFFLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUE7WUFDekQsSUFBSSxDQUFDLGtCQUFrQixHQUFHLEVBQUUsQ0FBQTtZQUU1QixFQUFFLEdBQUcsSUFBSSx1QkFBVSxFQUFFLENBQUE7WUFDckIsTUFBTSxJQUFJLEVBQUUsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQTtZQUN6RCxJQUFJLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQTtTQUNwQjtRQUNELE9BQU8sTUFBTSxDQUFBO0lBQ2YsQ0FBQztJQUVEOztPQUVHO0lBQ0gsUUFBUTtRQUNOLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsQ0FBQTtRQUNuRCxNQUFNLFNBQVMsR0FBVyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUE7UUFFMUMsSUFBSSxLQUFLLEdBQ1AsVUFBVSxDQUFDLE1BQU07WUFDakIsU0FBUyxDQUFDLE1BQU07WUFDaEIsSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNO1lBQzFCLElBQUksQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFBO1FBQzdCLE1BQU0sSUFBSSxHQUFhO1lBQ3JCLFVBQVU7WUFDVixTQUFTO1lBQ1QsSUFBSSxDQUFDLGNBQWM7WUFDbkIsSUFBSSxDQUFDLGVBQWU7U0FDckIsQ0FBQTtRQUVELElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFBO1FBQ3ZDLEtBQUssSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxDQUFDLE1BQU0sQ0FBQTtRQUU1QyxJQUFJLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLEVBQUU7WUFDdkMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUE7WUFDOUIsS0FBSyxJQUFJLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFBO1lBRW5DLElBQUksVUFBVSxHQUFXLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLEVBQUUsQ0FBQTtZQUMzRCxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFBO1lBQ3JCLEtBQUssSUFBSSxVQUFVLENBQUMsTUFBTSxDQUFBO1lBRTFCLFVBQVUsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxDQUFBO1lBQ3RDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUE7WUFDckIsS0FBSyxJQUFJLFVBQVUsQ0FBQyxNQUFNLENBQUE7U0FDM0I7UUFDRCxPQUFPLGVBQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFBO0lBQ25DLENBQUM7SUFFRCxLQUFLO1FBQ0gsTUFBTSxZQUFZLEdBQWMsSUFBSSxTQUFTLEVBQUUsQ0FBQTtRQUMvQyxZQUFZLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFBO1FBQ3hDLE9BQU8sWUFBb0IsQ0FBQTtJQUM3QixDQUFDO0lBRUQsTUFBTSxDQUFDLEdBQUcsSUFBVztRQUNuQixPQUFPLElBQUksU0FBUyxDQUFDLEdBQUcsSUFBSSxDQUFTLENBQUE7SUFDdkMsQ0FBQztJQUNEOzs7OztPQUtHO0lBQ0gsZUFBZSxDQUNiLE9BQWUsRUFDZixJQUFnQixFQUNoQixVQUFrQixFQUNsQixPQUFlO1FBRWYsTUFBTSxNQUFNLEdBQVcsSUFBSSxlQUFNLEVBQUUsQ0FBQTtRQUNuQyxNQUFNLENBQUMsR0FBVyxlQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2pDLENBQUMsQ0FBQyxhQUFhLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFBO1FBRTlCLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFFdkIsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQixNQUFNLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFBO1FBQ3pCLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFBO1FBQ2xDLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFBO0lBQ3ZFLENBQUM7SUFFRCxJQUFJLENBQUMsR0FBVyxFQUFFLEVBQVk7UUFDNUIsTUFBTSxLQUFLLEdBQWlCLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFBO1FBQy9DLElBQUksSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsRUFBRTtZQUN2QyxJQUFJLElBQUksR0FBZSxJQUFBLG1DQUFxQixFQUMxQywrQkFBbUIsQ0FBQyxjQUFjLENBQ25DLENBQUE7WUFFRCxLQUFLLE1BQU0sTUFBTSxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQ3BDLE1BQU0sT0FBTyxHQUFZLEVBQUUsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUE7Z0JBQ3RELE1BQU0sT0FBTyxHQUFXLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUE7Z0JBQ3pDLE1BQU0sR0FBRyxHQUFjLElBQUksa0JBQVMsRUFBRSxDQUFBO2dCQUN0QyxHQUFHLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFBO2dCQUN2QixJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFBO2FBQ3ZCO1lBQ0QsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtZQUVoQixJQUFJLEdBQUcsSUFBQSxtQ0FBcUIsRUFBQywrQkFBbUIsQ0FBQyxjQUFjLENBQUMsQ0FBQTtZQUNoRSxLQUFLLE1BQU0sUUFBUSxJQUFJLElBQUksQ0FBQyxlQUFlLEVBQUU7Z0JBQzNDLE1BQU0sR0FBRyxHQUFjLElBQUksa0JBQVMsRUFBRSxDQUFBO2dCQUN0QyxHQUFHLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFBO2dCQUN4QixJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFBO2FBQ3ZCO1lBQ0QsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtTQUNqQjtRQUVELE9BQU8sS0FBSyxDQUFBO0lBQ2QsQ0FBQztJQUVEOzs7Ozs7Ozs7Ozs7O09BYUc7SUFDSCxZQUNFLFVBQWtCLDJDQUErQixFQUNqRCxZQUFvQiw0QkFBZ0IsRUFDcEMsZUFBdUIsZUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQzNDLE9BQTZCLFNBQVMsRUFDdEMsTUFBMkIsU0FBUyxFQUNwQyxPQUFlLFNBQVMsRUFDeEIsaUJBQXlCLFNBQVMsRUFDbEMsa0JBQTBCLFNBQVMsRUFDbkMsZUFBZ0MsU0FBUyxFQUN6QyxpQkFBeUIsU0FBUztRQUVsQyxLQUFLLENBQUMsU0FBUyxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFBO1FBdFN2QyxjQUFTLEdBQUcsV0FBVyxDQUFBO1FBQ3ZCLFlBQU8sR0FBRywrQkFBbUIsQ0FBQyxTQUFTLENBQUE7UUF1RWpELHdEQUF3RDtRQUM5QyxtQkFBYyxHQUFXLGVBQU0sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDbkQseUNBQXlDO1FBQy9CLG9CQUFlLEdBQVcsZUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNuRCxxREFBcUQ7UUFDM0MsaUJBQVksR0FBb0IsSUFBSSx5QkFBZSxFQUFFLENBQUE7UUFDckQsbUJBQWMsR0FBVyxlQUFNLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQ3pDLHVCQUFrQixHQUFlLElBQUksdUJBQVUsRUFBRSxDQUFBO1FBQ2pELG9CQUFlLEdBQWEsRUFBRSxDQUFBO1FBQzlCLGNBQVMsR0FBZSxJQUFJLHVCQUFVLEVBQUUsQ0FBQTtRQUN4QyxhQUFRLEdBQWEsQ0FBQyxlQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLGVBQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUN2RCxZQUFPLEdBQWUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUEsQ0FBQyxrQkFBa0I7UUFvTnpELElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLHlCQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUFBO1FBQ3JELElBQUksT0FBTyxjQUFjLElBQUksV0FBVyxFQUFFO1lBQ3hDLElBQUksQ0FBQyxjQUFjLEdBQUcsY0FBYyxDQUFBO1NBQ3JDO1FBQ0QsSUFBSSxPQUFPLGVBQWUsSUFBSSxXQUFXLEVBQUU7WUFDekMsSUFBSSxDQUFDLGVBQWUsR0FBRyxlQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ3RDLElBQUksQ0FBQyxlQUFlLENBQUMsYUFBYSxDQUFDLGVBQWUsRUFBRSxDQUFDLENBQUMsQ0FBQTtTQUN2RDtRQUNELElBQUksT0FBTyxZQUFZLElBQUksV0FBVyxFQUFFO1lBQ3RDLElBQUksQ0FBQyxZQUFZLEdBQUcsWUFBWSxDQUFBO1NBQ2pDO1FBQ0QsSUFBSSxPQUFPLGNBQWMsSUFBSSxXQUFXLEVBQUU7WUFDeEMsSUFBSSxDQUFDLGNBQWMsR0FBRyxjQUFjLENBQUE7U0FDckM7SUFDSCxDQUFDO0NBQ0Y7QUF2VEQsOEJBdVRDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAcGFja2FnZURvY3VtZW50YXRpb25cbiAqIEBtb2R1bGUgQVBJLVBsYXRmb3JtVk0tRGVwb3NpdFR4XG4gKi9cbmltcG9ydCB7IEJ1ZmZlciB9IGZyb20gXCJidWZmZXIvXCJcbmltcG9ydCBCaW5Ub29scyBmcm9tIFwiLi4vLi4vdXRpbHMvYmludG9vbHNcIlxuaW1wb3J0IHsgUGxhdGZvcm1WTUNvbnN0YW50cyB9IGZyb20gXCIuL2NvbnN0YW50c1wiXG5pbXBvcnQgeyBQYXJzZWFibGVPdXRwdXQsIFRyYW5zZmVyYWJsZU91dHB1dCB9IGZyb20gXCIuL291dHB1dHNcIlxuaW1wb3J0IHsgVHJhbnNmZXJhYmxlSW5wdXQgfSBmcm9tIFwiLi9pbnB1dHNcIlxuaW1wb3J0IHsgQmFzZVR4IH0gZnJvbSBcIi4vYmFzZXR4XCJcbmltcG9ydCB7XG4gIERlZmF1bHROZXR3b3JrSUQsXG4gIERlZmF1bHRUcmFuc2FjdGlvblZlcnNpb25OdW1iZXJcbn0gZnJvbSBcIi4uLy4uL3V0aWxzL2NvbnN0YW50c1wiXG5pbXBvcnQgeyBTZXJpYWxpemF0aW9uLCBTZXJpYWxpemVkRW5jb2RpbmcgfSBmcm9tIFwiLi4vLi4vdXRpbHMvc2VyaWFsaXphdGlvblwiXG5pbXBvcnQgeyBTdWJuZXRBdXRoIH0gZnJvbSBcIi4uLy4uL2FwaXMvcGxhdGZvcm12bS9zdWJuZXRhdXRoXCJcbmltcG9ydCB7IEtleUNoYWluLCBLZXlQYWlyIH0gZnJvbSBcIi4uLy4uL2FwaXMvcGxhdGZvcm12bS9rZXljaGFpblwiXG5pbXBvcnQgeyBDcmVkZW50aWFsLCBTaWdJZHgsIFNpZ25hdHVyZSwgVXBncmFkZVZlcnNpb25JRCB9IGZyb20gXCIuLi8uLi9jb21tb25cIlxuaW1wb3J0IHsgU2VsZWN0Q3JlZGVudGlhbENsYXNzIH0gZnJvbSBcIi4uLy4uL2FwaXMvcGxhdGZvcm12bS9jcmVkZW50aWFsc1wiXG5cbi8qKlxuICogQGlnbm9yZVxuICovXG5jb25zdCBiaW50b29sczogQmluVG9vbHMgPSBCaW5Ub29scy5nZXRJbnN0YW5jZSgpXG5jb25zdCBzZXJpYWxpemF0aW9uOiBTZXJpYWxpemF0aW9uID0gU2VyaWFsaXphdGlvbi5nZXRJbnN0YW5jZSgpXG5cbi8qKlxuICogQ2xhc3MgcmVwcmVzZW50aW5nIGFuIHVuc2lnbmVkIERlcG9zaXRUeCB0cmFuc2FjdGlvbi5cbiAqL1xuZXhwb3J0IGNsYXNzIERlcG9zaXRUeCBleHRlbmRzIEJhc2VUeCB7XG4gIHByb3RlY3RlZCBfdHlwZU5hbWUgPSBcIkRlcG9zaXRUeFwiXG4gIHByb3RlY3RlZCBfdHlwZUlEID0gUGxhdGZvcm1WTUNvbnN0YW50cy5ERVBPU0lUVFhcblxuICBzZXJpYWxpemUoZW5jb2Rpbmc6IFNlcmlhbGl6ZWRFbmNvZGluZyA9IFwiaGV4XCIpOiBvYmplY3Qge1xuICAgIGxldCBmaWVsZHM6IG9iamVjdCA9IHN1cGVyLnNlcmlhbGl6ZShlbmNvZGluZylcblxuICAgIGxldCBmaWVsZHNWMTogb2JqZWN0ID0ge31cbiAgICBpZiAodGhpcy51cGdyYWRlVmVyc2lvbklELnZlcnNpb24oKSA+IDApIHtcbiAgICAgIGZpZWxkc1YxID0ge1xuICAgICAgICBkZXBvc2l0Q3JlYXRvcjogc2VyaWFsaXphdGlvbi5lbmNvZGVyKFxuICAgICAgICAgIHRoaXMuZGVwb3NpdENyZWF0b3IsXG4gICAgICAgICAgZW5jb2RpbmcsXG4gICAgICAgICAgXCJCdWZmZXJcIixcbiAgICAgICAgICBcImNiNThcIlxuICAgICAgICApLFxuICAgICAgICBkZXBvc2l0Q3JlYXRvckF1dGg6IHRoaXMuZGVwb3NpdENyZWF0b3JBdXRoLnNlcmlhbGl6ZShlbmNvZGluZyksXG4gICAgICAgIG93bmVyQXV0aDogdGhpcy5vd25lckF1dGguc2VyaWFsaXplKGVuY29kaW5nKVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAuLi5maWVsZHMsXG4gICAgICBkZXBvc2l0T2ZmZXJJRDogc2VyaWFsaXphdGlvbi5lbmNvZGVyKFxuICAgICAgICB0aGlzLmRlcG9zaXRPZmZlcklELFxuICAgICAgICBlbmNvZGluZyxcbiAgICAgICAgXCJCdWZmZXJcIixcbiAgICAgICAgXCJjYjU4XCJcbiAgICAgICksXG4gICAgICBkZXBvc2l0RHVyYXRpb246IHNlcmlhbGl6YXRpb24uZW5jb2RlcihcbiAgICAgICAgdGhpcy5kZXBvc2l0RHVyYXRpb24sXG4gICAgICAgIGVuY29kaW5nLFxuICAgICAgICBcIkJ1ZmZlclwiLFxuICAgICAgICBcImRlY2ltYWxTdHJpbmdcIlxuICAgICAgKSxcbiAgICAgIHJld2FyZHNPd25lcjogdGhpcy5yZXdhcmRzT3duZXIuc2VyaWFsaXplKGVuY29kaW5nKSxcbiAgICAgIC4uLmZpZWxkc1YxXG4gICAgfVxuICB9XG4gIGRlc2VyaWFsaXplKGZpZWxkczogb2JqZWN0LCBlbmNvZGluZzogU2VyaWFsaXplZEVuY29kaW5nID0gXCJoZXhcIikge1xuICAgIHN1cGVyLmRlc2VyaWFsaXplKGZpZWxkcywgZW5jb2RpbmcpXG4gICAgdGhpcy5kZXBvc2l0T2ZmZXJJRCA9IHNlcmlhbGl6YXRpb24uZGVjb2RlcihcbiAgICAgIGZpZWxkc1tcImRlcG9zaXRPZmZlcklEXCJdLFxuICAgICAgZW5jb2RpbmcsXG4gICAgICBcImNiNThcIixcbiAgICAgIFwiQnVmZmVyXCIsXG4gICAgICAzMlxuICAgIClcbiAgICB0aGlzLmRlcG9zaXREdXJhdGlvbiA9IHNlcmlhbGl6YXRpb24uZGVjb2RlcihcbiAgICAgIGZpZWxkc1tcImRlcG9zaXREdXJhdGlvblwiXSxcbiAgICAgIGVuY29kaW5nLFxuICAgICAgXCJkZWNpbWFsU3RyaW5nXCIsXG4gICAgICBcIkJ1ZmZlclwiLFxuICAgICAgNFxuICAgIClcbiAgICB0aGlzLnJld2FyZHNPd25lci5kZXNlcmlhbGl6ZShmaWVsZHNbXCJyZXdhcmRzT3duZXJcIl0sIGVuY29kaW5nKVxuXG4gICAgaWYgKHRoaXMudXBncmFkZVZlcnNpb25JRC52ZXJzaW9uKCkgPiAwKSB7XG4gICAgICB0aGlzLmRlcG9zaXRDcmVhdG9yID0gc2VyaWFsaXphdGlvbi5kZWNvZGVyKFxuICAgICAgICBmaWVsZHNbXCJkZXBvc2l0Q3JlYXRvclwiXSxcbiAgICAgICAgZW5jb2RpbmcsXG4gICAgICAgIFwiY2I1OFwiLFxuICAgICAgICBcIkJ1ZmZlclwiXG4gICAgICApXG4gICAgICB0aGlzLmRlcG9zaXRDcmVhdG9yQXV0aC5kZXNlcmlhbGl6ZShcbiAgICAgICAgZmllbGRzW1wiZGVwb3NpdENyZWF0b3JBdXRoXCJdLFxuICAgICAgICBlbmNvZGluZ1xuICAgICAgKVxuICAgICAgdGhpcy5vd25lckF1dGguZGVzZXJpYWxpemUoZmllbGRzW1wib3duZXJBdXRoXCJdLCBlbmNvZGluZylcbiAgICB9XG4gIH1cbiAgLy8gVXBncmFkZVZlcnNpb25JRCAoc2luY2UgU1AxKVxuICBwcm90ZWN0ZWQgdXBncmFkZVZlcnNpb25JRDogVXBncmFkZVZlcnNpb25JRFxuICAvLyBJRCBvZiBhY3RpdmUgb2ZmZXIgdGhhdCB3aWxsIGJlIHVzZWQgZm9yIHRoaXMgZGVwb3NpdFxuICBwcm90ZWN0ZWQgZGVwb3NpdE9mZmVySUQ6IEJ1ZmZlciA9IEJ1ZmZlci5hbGxvYygzMilcbiAgLy8gZHVyYXRpb24gb2YgZGVwb3NpdCAoaW4gNCBieXRlIGZvcm1hdClcbiAgcHJvdGVjdGVkIGRlcG9zaXREdXJhdGlvbjogQnVmZmVyID0gQnVmZmVyLmFsbG9jKDQpXG4gIC8vIFdoZXJlIHRvIHNlbmQgc3Rha2luZyByZXdhcmRzIHdoZW4gZG9uZSB2YWxpZGF0aW5nXG4gIHByb3RlY3RlZCByZXdhcmRzT3duZXI6IFBhcnNlYWJsZU91dHB1dCA9IG5ldyBQYXJzZWFibGVPdXRwdXQoKVxuICBwcm90ZWN0ZWQgZGVwb3NpdENyZWF0b3I6IEJ1ZmZlciA9IEJ1ZmZlci5hbGxvYygyMClcbiAgcHJvdGVjdGVkIGRlcG9zaXRDcmVhdG9yQXV0aDogU3VibmV0QXV0aCA9IG5ldyBTdWJuZXRBdXRoKClcbiAgcHJvdGVjdGVkIG93bmVyU2lnbmF0dXJlczogQnVmZmVyW10gPSBbXVxuICBwcm90ZWN0ZWQgb3duZXJBdXRoOiBTdWJuZXRBdXRoID0gbmV3IFN1Ym5ldEF1dGgoKVxuICBwcm90ZWN0ZWQgc2lnQ291bnQ6IEJ1ZmZlcltdID0gW0J1ZmZlci5hbGxvYyg0KSwgQnVmZmVyLmFsbG9jKDQpXVxuICBwcm90ZWN0ZWQgc2lnSWR4czogU2lnSWR4W11bXSA9IFtbXSwgW11dIC8vIGlkeHMgb2Ygc2lnbmVyc1xuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBpZCBvZiB0aGUgW1tSZWdpc3Rlck5vZGVUeF1dXG4gICAqL1xuICBnZXRUeFR5cGUoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fdHlwZUlEXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgZGVwb3NpdE9mZmVySURcbiAgICovXG4gIGdldERlcG9zaXRPZmZlcklEKCk6IEJ1ZmZlciB7XG4gICAgcmV0dXJuIHRoaXMuZGVwb3NpdE9mZmVySURcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBkZXBvc2l0T2ZmZXJJRFxuICAgKi9cbiAgZ2V0RGVwb3NpdER1cmF0aW9uKCk6IEJ1ZmZlciB7XG4gICAgcmV0dXJuIHRoaXMuZGVwb3NpdER1cmF0aW9uXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgZGVwb3NpdE9mZmVySURcbiAgICovXG4gIGdldFJld2FyZHNPd25lcigpOiBQYXJzZWFibGVPdXRwdXQge1xuICAgIHJldHVybiB0aGlzLnJld2FyZHNPd25lclxuICB9XG5cbiAgYWRkRGVwb3NpdENyZWF0b3JBdXRoKGF1dGg6IFtudW1iZXIsIEJ1ZmZlcl1bXSk6IHZvaWQge1xuICAgIGF1dGguZm9yRWFjaCgocCkgPT5cbiAgICAgIHRoaXMuYWRkU2lnbmF0dXJlSWR4KDAsIHRoaXMuZGVwb3NpdENyZWF0b3JBdXRoLCBwWzBdLCBwWzFdKVxuICAgIClcbiAgfVxuXG4gIGFkZE93bmVyQXV0aChhdXRoOiBbbnVtYmVyLCBCdWZmZXJdW10sIHNpZ3M6IEJ1ZmZlcltdKTogdm9pZCB7XG4gICAgYXV0aC5mb3JFYWNoKChwKSA9PiB7XG4gICAgICBjb25zdCBwc2V1ZG9BZGRyID0gQnVmZmVyLmFsbG9jKDIwKVxuICAgICAgcHNldWRvQWRkci53cml0ZVVJbnRCRShhdXRoLmluZGV4T2YocCkgKyAxLCAxNiwgNClcbiAgICAgIHRoaXMuYWRkU2lnbmF0dXJlSWR4KDEsIHRoaXMub3duZXJBdXRoLCBwWzBdLCBwc2V1ZG9BZGRyKVxuICAgIH0pXG4gICAgdGhpcy5vd25lclNpZ25hdHVyZXMgPSBzaWdzXG4gIH1cblxuICBnZXRPd25lclNpZ25hdHVyZXMoKTogW0J1ZmZlciwgQnVmZmVyXVtdIHtcbiAgICByZXR1cm4gdGhpcy5zaWdJZHhzWzFdLm1hcCgodiwgaSkgPT4gW1xuICAgICAgdi5nZXRTb3VyY2UoKSxcbiAgICAgIHRoaXMub3duZXJTaWduYXR1cmVzW2ldXG4gICAgXSlcbiAgfVxuXG4gIC8qKlxuICAgKiBUYWtlcyBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IGNvbnRhaW5pbmcgYSBbW0RlcG9zaXRUeF1dLCBwYXJzZXMgaXQsIHBvcHVsYXRlcyB0aGUgY2xhc3MsIGFuZCByZXR1cm5zIHRoZSBsZW5ndGggb2YgdGhlIFtbRGVwb3NpdFR4XV0gaW4gYnl0ZXMuXG4gICAqXG4gICAqIEBwYXJhbSBieXRlcyBBIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IGNvbnRhaW5pbmcgYSByYXcgW1tEZXBvc2l0VHhdXVxuICAgKlxuICAgKiBAcmV0dXJucyBUaGUgbGVuZ3RoIG9mIHRoZSByYXcgW1tEZXBvc2l0VHhdXVxuICAgKlxuICAgKiBAcmVtYXJrcyBhc3N1bWUgbm90LWNoZWNrc3VtbWVkXG4gICAqL1xuICBmcm9tQnVmZmVyKGJ5dGVzOiBCdWZmZXIsIG9mZnNldDogbnVtYmVyID0gMCk6IG51bWJlciB7XG4gICAgdGhpcy51cGdyYWRlVmVyc2lvbklEID0gbmV3IFVwZ3JhZGVWZXJzaW9uSUQoKVxuICAgIG9mZnNldCA9IHRoaXMudXBncmFkZVZlcnNpb25JRC5mcm9tQnVmZmVyKGJ5dGVzLCBvZmZzZXQpXG4gICAgb2Zmc2V0ID0gc3VwZXIuZnJvbUJ1ZmZlcihieXRlcywgb2Zmc2V0KVxuICAgIHRoaXMuZGVwb3NpdE9mZmVySUQgPSBiaW50b29scy5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyAzMilcbiAgICBvZmZzZXQgKz0gMzJcbiAgICB0aGlzLmRlcG9zaXREdXJhdGlvbiA9IGJpbnRvb2xzLmNvcHlGcm9tKGJ5dGVzLCBvZmZzZXQsIG9mZnNldCArIDQpXG4gICAgb2Zmc2V0ICs9IDRcbiAgICB0aGlzLnJld2FyZHNPd25lciA9IG5ldyBQYXJzZWFibGVPdXRwdXQoKVxuICAgIG9mZnNldCA9IHRoaXMucmV3YXJkc093bmVyLmZyb21CdWZmZXIoYnl0ZXMsIG9mZnNldClcblxuICAgIGlmICh0aGlzLnVwZ3JhZGVWZXJzaW9uSUQudmVyc2lvbigpID4gMCkge1xuICAgICAgdGhpcy5kZXBvc2l0Q3JlYXRvciA9IGJpbnRvb2xzLmNvcHlGcm9tKGJ5dGVzLCBvZmZzZXQsIG9mZnNldCArIDIwKVxuICAgICAgb2Zmc2V0ICs9IDIwXG5cbiAgICAgIGxldCBzYSA9IG5ldyBTdWJuZXRBdXRoKClcbiAgICAgIG9mZnNldCArPSBzYS5mcm9tQnVmZmVyKGJpbnRvb2xzLmNvcHlGcm9tKGJ5dGVzLCBvZmZzZXQpKVxuICAgICAgdGhpcy5kZXBvc2l0Q3JlYXRvckF1dGggPSBzYVxuXG4gICAgICBzYSA9IG5ldyBTdWJuZXRBdXRoKClcbiAgICAgIG9mZnNldCArPSBzYS5mcm9tQnVmZmVyKGJpbnRvb2xzLmNvcHlGcm9tKGJ5dGVzLCBvZmZzZXQpKVxuICAgICAgdGhpcy5vd25lckF1dGggPSBzYVxuICAgIH1cbiAgICByZXR1cm4gb2Zmc2V0XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IHJlcHJlc2VudGF0aW9uIG9mIHRoZSBbW0RlcG9zaXRUeF1dLlxuICAgKi9cbiAgdG9CdWZmZXIoKTogQnVmZmVyIHtcbiAgICBjb25zdCB1cGdyYWRlQnVmID0gdGhpcy51cGdyYWRlVmVyc2lvbklELnRvQnVmZmVyKClcbiAgICBjb25zdCBzdXBlcmJ1ZmY6IEJ1ZmZlciA9IHN1cGVyLnRvQnVmZmVyKClcblxuICAgIGxldCBic2l6ZTogbnVtYmVyID1cbiAgICAgIHVwZ3JhZGVCdWYubGVuZ3RoICtcbiAgICAgIHN1cGVyYnVmZi5sZW5ndGggK1xuICAgICAgdGhpcy5kZXBvc2l0T2ZmZXJJRC5sZW5ndGggK1xuICAgICAgdGhpcy5kZXBvc2l0RHVyYXRpb24ubGVuZ3RoXG4gICAgY29uc3QgYmFycjogQnVmZmVyW10gPSBbXG4gICAgICB1cGdyYWRlQnVmLFxuICAgICAgc3VwZXJidWZmLFxuICAgICAgdGhpcy5kZXBvc2l0T2ZmZXJJRCxcbiAgICAgIHRoaXMuZGVwb3NpdER1cmF0aW9uXG4gICAgXVxuXG4gICAgYmFyci5wdXNoKHRoaXMucmV3YXJkc093bmVyLnRvQnVmZmVyKCkpXG4gICAgYnNpemUgKz0gdGhpcy5yZXdhcmRzT3duZXIudG9CdWZmZXIoKS5sZW5ndGhcblxuICAgIGlmICh0aGlzLnVwZ3JhZGVWZXJzaW9uSUQudmVyc2lvbigpID4gMCkge1xuICAgICAgYmFyci5wdXNoKHRoaXMuZGVwb3NpdENyZWF0b3IpXG4gICAgICBic2l6ZSArPSB0aGlzLmRlcG9zaXRDcmVhdG9yLmxlbmd0aFxuXG4gICAgICBsZXQgYXV0aEJ1ZmZlcjogQnVmZmVyID0gdGhpcy5kZXBvc2l0Q3JlYXRvckF1dGgudG9CdWZmZXIoKVxuICAgICAgYmFyci5wdXNoKGF1dGhCdWZmZXIpXG4gICAgICBic2l6ZSArPSBhdXRoQnVmZmVyLmxlbmd0aFxuXG4gICAgICBhdXRoQnVmZmVyID0gdGhpcy5vd25lckF1dGgudG9CdWZmZXIoKVxuICAgICAgYmFyci5wdXNoKGF1dGhCdWZmZXIpXG4gICAgICBic2l6ZSArPSBhdXRoQnVmZmVyLmxlbmd0aFxuICAgIH1cbiAgICByZXR1cm4gQnVmZmVyLmNvbmNhdChiYXJyLCBic2l6ZSlcbiAgfVxuXG4gIGNsb25lKCk6IHRoaXMge1xuICAgIGNvbnN0IG5ld0RlcG9zaXRUeDogRGVwb3NpdFR4ID0gbmV3IERlcG9zaXRUeCgpXG4gICAgbmV3RGVwb3NpdFR4LmZyb21CdWZmZXIodGhpcy50b0J1ZmZlcigpKVxuICAgIHJldHVybiBuZXdEZXBvc2l0VHggYXMgdGhpc1xuICB9XG5cbiAgY3JlYXRlKC4uLmFyZ3M6IGFueVtdKTogdGhpcyB7XG4gICAgcmV0dXJuIG5ldyBEZXBvc2l0VHgoLi4uYXJncykgYXMgdGhpc1xuICB9XG4gIC8qKlxuICAgKiBDcmVhdGVzIGFuZCBhZGRzIGEgW1tTaWdJZHhdXSB0byB0aGUgW1tEZXBvc2l0VHhdXS5cbiAgICpcbiAgICogQHBhcmFtIGFkZHJlc3NJZHggVGhlIGluZGV4IG9mIHRoZSBhZGRyZXNzIHRvIHJlZmVyZW5jZSBpbiB0aGUgc2lnbmF0dXJlc1xuICAgKiBAcGFyYW0gYWRkcmVzcyBUaGUgYWRkcmVzcyBvZiB0aGUgc291cmNlIG9mIHRoZSBzaWduYXR1cmVcbiAgICovXG4gIGFkZFNpZ25hdHVyZUlkeChcbiAgICBjcmVkUG9zOiBudW1iZXIsXG4gICAgYXV0aDogU3VibmV0QXV0aCxcbiAgICBhZGRyZXNzSWR4OiBudW1iZXIsXG4gICAgYWRkcmVzczogQnVmZmVyXG4gICk6IHZvaWQge1xuICAgIGNvbnN0IHNpZ2lkeDogU2lnSWR4ID0gbmV3IFNpZ0lkeCgpXG4gICAgY29uc3QgYjogQnVmZmVyID0gQnVmZmVyLmFsbG9jKDQpXG4gICAgYi53cml0ZVVJbnQzMkJFKGFkZHJlc3NJZHgsIDApXG5cbiAgICBhdXRoLmFkZEFkZHJlc3NJbmRleChiKVxuXG4gICAgc2lnaWR4LmZyb21CdWZmZXIoYilcbiAgICBzaWdpZHguc2V0U291cmNlKGFkZHJlc3MpXG4gICAgdGhpcy5zaWdJZHhzW2NyZWRQb3NdLnB1c2goc2lnaWR4KVxuICAgIHRoaXMuc2lnQ291bnRbY3JlZFBvc10ud3JpdGVVSW50MzJCRSh0aGlzLnNpZ0lkeHNbY3JlZFBvc10ubGVuZ3RoLCAwKVxuICB9XG5cbiAgc2lnbihtc2c6IEJ1ZmZlciwga2M6IEtleUNoYWluKTogQ3JlZGVudGlhbFtdIHtcbiAgICBjb25zdCBjcmVkczogQ3JlZGVudGlhbFtdID0gc3VwZXIuc2lnbihtc2csIGtjKVxuICAgIGlmICh0aGlzLnVwZ3JhZGVWZXJzaW9uSUQudmVyc2lvbigpID4gMCkge1xuICAgICAgbGV0IGNyZWQ6IENyZWRlbnRpYWwgPSBTZWxlY3RDcmVkZW50aWFsQ2xhc3MoXG4gICAgICAgIFBsYXRmb3JtVk1Db25zdGFudHMuU0VDUENSRURFTlRJQUxcbiAgICAgIClcblxuICAgICAgZm9yIChjb25zdCBzaWdpZHggb2YgdGhpcy5zaWdJZHhzWzBdKSB7XG4gICAgICAgIGNvbnN0IGtleXBhaXI6IEtleVBhaXIgPSBrYy5nZXRLZXkoc2lnaWR4LmdldFNvdXJjZSgpKVxuICAgICAgICBjb25zdCBzaWdudmFsOiBCdWZmZXIgPSBrZXlwYWlyLnNpZ24obXNnKVxuICAgICAgICBjb25zdCBzaWc6IFNpZ25hdHVyZSA9IG5ldyBTaWduYXR1cmUoKVxuICAgICAgICBzaWcuZnJvbUJ1ZmZlcihzaWdudmFsKVxuICAgICAgICBjcmVkLmFkZFNpZ25hdHVyZShzaWcpXG4gICAgICB9XG4gICAgICBjcmVkcy5wdXNoKGNyZWQpXG5cbiAgICAgIGNyZWQgPSBTZWxlY3RDcmVkZW50aWFsQ2xhc3MoUGxhdGZvcm1WTUNvbnN0YW50cy5TRUNQQ1JFREVOVElBTClcbiAgICAgIGZvciAoY29uc3Qgb3duZXJTaWcgb2YgdGhpcy5vd25lclNpZ25hdHVyZXMpIHtcbiAgICAgICAgY29uc3Qgc2lnOiBTaWduYXR1cmUgPSBuZXcgU2lnbmF0dXJlKClcbiAgICAgICAgc2lnLmZyb21CdWZmZXIob3duZXJTaWcpXG4gICAgICAgIGNyZWQuYWRkU2lnbmF0dXJlKHNpZylcbiAgICAgIH1cbiAgICAgIGNyZWRzLnB1c2goY3JlZClcbiAgICB9XG5cbiAgICByZXR1cm4gY3JlZHNcbiAgfVxuXG4gIC8qKlxuICAgKiBDbGFzcyByZXByZXNlbnRpbmcgYW4gdW5zaWduZWQgUmVnaXN0ZXJOb2RlIHRyYW5zYWN0aW9uLlxuICAgKlxuICAgKiBAcGFyYW0gdmVyc2lvbiBPcHRpb25hbC4gVHJhbnNhY3Rpb24gdmVyc2lvbiBudW1iZXJcbiAgICogQHBhcmFtIG5ldHdvcmtJRCBPcHRpb25hbCBuZXR3b3JrSUQsIFtbRGVmYXVsdE5ldHdvcmtJRF1dXG4gICAqIEBwYXJhbSBibG9ja2NoYWluSUQgT3B0aW9uYWwgYmxvY2tjaGFpbklELCBkZWZhdWx0IEJ1ZmZlci5hbGxvYygzMiwgMTYpXG4gICAqIEBwYXJhbSBvdXRzIE9wdGlvbmFsIGFycmF5IG9mIHRoZSBbW1RyYW5zZmVyYWJsZU91dHB1dF1dc1xuICAgKiBAcGFyYW0gaW5zIE9wdGlvbmFsIGFycmF5IG9mIHRoZSBbW1RyYW5zZmVyYWJsZUlucHV0XV1zXG4gICAqIEBwYXJhbSBtZW1vIE9wdGlvbmFsIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IGZvciB0aGUgbWVtbyBmaWVsZFxuICAgKiBAcGFyYW0gZGVwb3NpdE9mZmVySUQgT3B0aW9uYWwgSUQgb2YgdGhlIGRlcG9zaXQgb2ZmZXIuXG4gICAqIEBwYXJhbSBkdXJhdGlvbiBPcHRpb25hbCBEdXJhdGlvbiBvZiBkZXBvc2l0aW5nLlxuICAgKiBAcGFyYW0gcmV3YXJkc093bmVyIE9wdGlvbmFsIHRoZSBvd25lciBvZiB0aGUgcmV3YXJkc1xuICAgKiBAcGFyYW0gZGVwb3NpdENyZWF0b3IgQWRkcmVzcyB0aGF0IGlzIGF1dGhvcml6ZWQgdG8gY3JlYXRlIGRlcG9zaXQgd2l0aCBnaXZlbiBvZmZlci5cbiAgICovXG4gIGNvbnN0cnVjdG9yKFxuICAgIHZlcnNpb246IG51bWJlciA9IERlZmF1bHRUcmFuc2FjdGlvblZlcnNpb25OdW1iZXIsXG4gICAgbmV0d29ya0lEOiBudW1iZXIgPSBEZWZhdWx0TmV0d29ya0lELFxuICAgIGJsb2NrY2hhaW5JRDogQnVmZmVyID0gQnVmZmVyLmFsbG9jKDMyLCAxNiksXG4gICAgb3V0czogVHJhbnNmZXJhYmxlT3V0cHV0W10gPSB1bmRlZmluZWQsXG4gICAgaW5zOiBUcmFuc2ZlcmFibGVJbnB1dFtdID0gdW5kZWZpbmVkLFxuICAgIG1lbW86IEJ1ZmZlciA9IHVuZGVmaW5lZCxcbiAgICBkZXBvc2l0T2ZmZXJJRDogQnVmZmVyID0gdW5kZWZpbmVkLFxuICAgIGRlcG9zaXREdXJhdGlvbjogbnVtYmVyID0gdW5kZWZpbmVkLFxuICAgIHJld2FyZHNPd25lcjogUGFyc2VhYmxlT3V0cHV0ID0gdW5kZWZpbmVkLFxuICAgIGRlcG9zaXRDcmVhdG9yOiBCdWZmZXIgPSB1bmRlZmluZWRcbiAgKSB7XG4gICAgc3VwZXIobmV0d29ya0lELCBibG9ja2NoYWluSUQsIG91dHMsIGlucywgbWVtbylcbiAgICB0aGlzLnVwZ3JhZGVWZXJzaW9uSUQgPSBuZXcgVXBncmFkZVZlcnNpb25JRCh2ZXJzaW9uKVxuICAgIGlmICh0eXBlb2YgZGVwb3NpdE9mZmVySUQgIT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgdGhpcy5kZXBvc2l0T2ZmZXJJRCA9IGRlcG9zaXRPZmZlcklEXG4gICAgfVxuICAgIGlmICh0eXBlb2YgZGVwb3NpdER1cmF0aW9uICE9IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIHRoaXMuZGVwb3NpdER1cmF0aW9uID0gQnVmZmVyLmFsbG9jKDQpXG4gICAgICB0aGlzLmRlcG9zaXREdXJhdGlvbi53cml0ZVVJbnQzMkJFKGRlcG9zaXREdXJhdGlvbiwgMClcbiAgICB9XG4gICAgaWYgKHR5cGVvZiByZXdhcmRzT3duZXIgIT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgdGhpcy5yZXdhcmRzT3duZXIgPSByZXdhcmRzT3duZXJcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBkZXBvc2l0Q3JlYXRvciAhPSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICB0aGlzLmRlcG9zaXRDcmVhdG9yID0gZGVwb3NpdENyZWF0b3JcbiAgICB9XG4gIH1cbn1cbiJdfQ==
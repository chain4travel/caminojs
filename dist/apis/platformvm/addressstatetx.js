"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddressStateTx = exports.AddressState = void 0;
/**
 * @packageDocumentation
 * @module API-PlatformVM-AddressStateTx
 */
const buffer_1 = require("buffer/");
const bintools_1 = __importDefault(require("../../utils/bintools"));
const constants_1 = require("./constants");
const basetx_1 = require("./basetx");
const constants_2 = require("../../utils/constants");
const serialization_1 = require("../../utils/serialization");
const common_1 = require("../../common");
const subnetauth_1 = require("../../apis/platformvm/subnetauth");
const credentials_1 = require("./credentials");
/**
 * @ignore
 */
const bintools = bintools_1.default.getInstance();
const serialization = serialization_1.Serialization.getInstance();
var AddressState;
(function (AddressState) {
    AddressState[AddressState["ROLE_ADMIN"] = 0] = "ROLE_ADMIN";
    AddressState[AddressState["ROLE_KYC"] = 1] = "ROLE_KYC";
    AddressState[AddressState["ROLE_OFFERS_ADMIN"] = 2] = "ROLE_OFFERS_ADMIN";
    AddressState[AddressState["KYC_VERIFIED"] = 32] = "KYC_VERIFIED";
    AddressState[AddressState["KYC_EXPIRED"] = 33] = "KYC_EXPIRED";
    AddressState[AddressState["CONSORTIUM"] = 38] = "CONSORTIUM";
    AddressState[AddressState["NODE_DEFERRED"] = 39] = "NODE_DEFERRED";
    AddressState[AddressState["OFFERS_CREATOR"] = 50] = "OFFERS_CREATOR";
})(AddressState = exports.AddressState || (exports.AddressState = {}));
/**
 * Class representing an unsigned AdressStateTx transaction.
 */
class AddressStateTx extends basetx_1.BaseTx {
    serialize(encoding = "hex") {
        let fields = super.serialize(encoding);
        let fieldsV1 = {};
        if (this.upgradeVersionID.version() > 0) {
            fieldsV1 = {
                executor: serialization.encoder(this.executor, encoding, "Buffer", "cb58"),
                executorAuth: this.executorAuth.serialize(encoding)
            };
        }
        return Object.assign(Object.assign(Object.assign({}, fields), { address: serialization.encoder(this.address, encoding, "Buffer", "cb58"), state: this.state, remove: this.remove }), fieldsV1);
    }
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        this.address = serialization.decoder(fields["address"], encoding, "cb58", "Buffer", 20);
        this.state = fields["state"];
        this.remove = fields["remove"];
        if (this.upgradeVersionID.version() > 0) {
            this.executor = serialization.decoder(fields["executor"], encoding, "cb58", "Buffer");
            this.executorAuth.deserialize(fields["executorAuth"], encoding);
        }
    }
    /**
     * Returns the id of the [[AddressStateTx]]
     */
    getTxType() {
        return this._typeID;
    }
    /**
     * Returns the address
     */
    getAddress() {
        return this.address;
    }
    /**
     * Returns the state
     */
    getState() {
        return this.state;
    }
    /**
     * Returns the remove flag
     */
    getRemove() {
        return this.remove;
    }
    getExecutor() {
        return this.executor;
    }
    getExecutorAuth() {
        return this.executorAuth;
    }
    addSignatureIdx(addressIdx, address) {
        const addressIndex = buffer_1.Buffer.alloc(4);
        addressIndex.writeUInt32BE(addressIdx, 0);
        this.executorAuth.addAddressIndex(addressIndex);
        const sigidx = new common_1.SigIdx();
        sigidx.fromBuffer(addressIndex);
        sigidx.setSource(address);
        this.sigIdxs.push(sigidx);
    }
    sign(msg, kc) {
        const creds = super.sign(msg, kc);
        if (this.upgradeVersionID.version() > 0) {
            const cred = (0, credentials_1.SelectCredentialClass)(constants_1.PlatformVMConstants.SECPCREDENTIAL);
            for (const sigidx of this.sigIdxs) {
                const keypair = kc.getKey(sigidx.getSource());
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
     * Takes a {@link https://github.com/feross/buffer|Buffer} containing an [[AddressStateTx]], parses it, populates the class, and returns the length of the [[AddressStateTx]] in bytes.
     *
     * @param bytes A {@link https://github.com/feross/buffer|Buffer} containing a raw [[AddressStateTx]]
     *
     * @returns The length of the raw [[AddressStateTx]]
     *
     * @remarks assume not-checksummed
     */
    fromBuffer(bytes, offset = 0) {
        this.upgradeVersionID = new common_1.UpgradeVersionID();
        offset = this.upgradeVersionID.fromBuffer(bytes, offset);
        offset = super.fromBuffer(bytes, offset);
        this.address = bintools.copyFrom(bytes, offset, offset + 20);
        offset += 20;
        this.state = bintools.copyFrom(bytes, offset, offset + 1)[0];
        offset += 1;
        this.remove = bintools.copyFrom(bytes, offset, offset + 1)[0] != 0;
        offset += 1;
        if (this.upgradeVersionID.version() > 0) {
            this.executor = bintools.copyFrom(bytes, offset, offset + 20);
            offset += 20;
            let sa = new subnetauth_1.SubnetAuth();
            offset += sa.fromBuffer(bintools.copyFrom(bytes, offset));
            this.executorAuth = sa;
        }
        return offset;
    }
    /**
     * Returns a {@link https://github.com/feross/buffer|Buffer} representation of the [[AddressStateTx]].
     */
    toBuffer() {
        const upgradeBuf = this.upgradeVersionID.toBuffer();
        const superbuff = super.toBuffer();
        let bsize = upgradeBuf.length + superbuff.length + this.address.length + 2;
        const barr = [
            upgradeBuf,
            superbuff,
            this.address,
            buffer_1.Buffer.from([this.state]),
            buffer_1.Buffer.from([this.remove ? 1 : 0])
        ];
        if (this.upgradeVersionID.version() > 0) {
            const authBuffer = this.executorAuth.toBuffer();
            bsize += this.executor.length + authBuffer.length;
            barr.push(this.executor, authBuffer);
        }
        return buffer_1.Buffer.concat(barr, bsize);
    }
    clone() {
        const newAddressStateTx = new AddressStateTx();
        newAddressStateTx.fromBuffer(this.toBuffer());
        return newAddressStateTx;
    }
    create(...args) {
        return new AddressStateTx(...args);
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
     * @param address Optional address to alter state.
     * @param state Optional state to alter.
     * @param remove Optional if true remove the flag, otherwise set
     */
    constructor(version = constants_2.DefaultTransactionVersionNumber, networkID = constants_2.DefaultNetworkID, blockchainID = buffer_1.Buffer.alloc(32, 16), outs = undefined, ins = undefined, memo = undefined, address = undefined, state = undefined, remove = undefined, executor = undefined) {
        super(networkID, blockchainID, outs, ins, memo);
        this._typeName = "AddressStateTx";
        this._typeID = constants_1.PlatformVMConstants.ADDRESSSTATETX;
        // UpgradeVersionID (since SP1)
        this.upgradeVersionID = new common_1.UpgradeVersionID();
        // The address to add / remove state
        this.address = buffer_1.Buffer.alloc(20);
        // The state to set / unset
        this.state = 0;
        this.executor = buffer_1.Buffer.alloc(20);
        this.executorAuth = new subnetauth_1.SubnetAuth();
        this.sigIdxs = []; // idxs of signers
        this.upgradeVersionID = new common_1.UpgradeVersionID(version);
        if (typeof address != "undefined") {
            if (typeof address === "string") {
                this.address = bintools.stringToAddress(address);
            }
            else {
                this.address = address;
            }
        }
        if (typeof state != "undefined") {
            this.state = state;
        }
        if (typeof remove != "undefined") {
            this.remove = remove;
        }
        if (typeof executor != "undefined") {
            this.executor = executor;
        }
    }
}
exports.AddressStateTx = AddressStateTx;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRkcmVzc3N0YXRldHguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYXBpcy9wbGF0Zm9ybXZtL2FkZHJlc3NzdGF0ZXR4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBOzs7R0FHRztBQUNILG9DQUFnQztBQUNoQyxvRUFBMkM7QUFDM0MsMkNBQWlEO0FBR2pELHFDQUFpQztBQUNqQyxxREFHOEI7QUFDOUIsNkRBQTZFO0FBQzdFLHlDQUE4RTtBQUM5RSxpRUFBNkQ7QUFFN0QsK0NBQXFEO0FBRXJEOztHQUVHO0FBQ0gsTUFBTSxRQUFRLEdBQWEsa0JBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtBQUNqRCxNQUFNLGFBQWEsR0FBa0IsNkJBQWEsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtBQUVoRSxJQUFZLFlBU1g7QUFURCxXQUFZLFlBQVk7SUFDdEIsMkRBQWMsQ0FBQTtJQUNkLHVEQUFZLENBQUE7SUFDWix5RUFBcUIsQ0FBQTtJQUNyQixnRUFBaUIsQ0FBQTtJQUNqQiw4REFBZ0IsQ0FBQTtJQUNoQiw0REFBZSxDQUFBO0lBQ2Ysa0VBQWtCLENBQUE7SUFDbEIsb0VBQW1CLENBQUE7QUFDckIsQ0FBQyxFQVRXLFlBQVksR0FBWixvQkFBWSxLQUFaLG9CQUFZLFFBU3ZCO0FBRUQ7O0dBRUc7QUFDSCxNQUFhLGNBQWUsU0FBUSxlQUFNO0lBSXhDLFNBQVMsQ0FBQyxXQUErQixLQUFLO1FBQzVDLElBQUksTUFBTSxHQUFXLEtBQUssQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUE7UUFDOUMsSUFBSSxRQUFRLEdBQVcsRUFBRSxDQUFBO1FBQ3pCLElBQUksSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsRUFBRTtZQUN2QyxRQUFRLEdBQUc7Z0JBQ1QsUUFBUSxFQUFFLGFBQWEsQ0FBQyxPQUFPLENBQzdCLElBQUksQ0FBQyxRQUFRLEVBQ2IsUUFBUSxFQUNSLFFBQVEsRUFDUixN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QUFtQixDQUFDLGNBQWMsQ0FBQTtRQStDdEQsK0JBQStCO1FBQ3JCLHFCQUFnQixHQUFHLElBQUkseUJBQWdCLEVBQUUsQ0FBQTtRQUNuRCxvQ0FBb0M7UUFDMUIsWUFBTyxHQUFHLGVBQU0sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDcEMsMkJBQTJCO1FBQ2pCLFVBQUssR0FBRyxDQUFDLENBQUE7UUFHVCxhQUFRLEdBQUcsZUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUMzQixpQkFBWSxHQUFlLElBQUksdUJBQVUsRUFBRSxDQUFBO1FBQzNDLFlBQU8sR0FBYSxFQUFFLENBQUEsQ0FBQyxrQkFBa0I7UUE0SmpELElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLHlCQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUFBO1FBQ3JELElBQUksT0FBTyxPQUFPLElBQUksV0FBVyxFQUFFO1lBQ2pDLElBQUksT0FBTyxPQUFPLEtBQUssUUFBUSxFQUFFO2dCQUMvQixJQUFJLENBQUMsT0FBTyxHQUFHLFFBQVEsQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLENBQUE7YUFDakQ7aUJBQU07Z0JBQ0wsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUE7YUFDdkI7U0FDRjtRQUNELElBQUksT0FBTyxLQUFLLElBQUksV0FBVyxFQUFFO1lBQy9CLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFBO1NBQ25CO1FBQ0QsSUFBSSxPQUFPLE1BQU0sSUFBSSxXQUFXLEVBQUU7WUFDaEMsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUE7U0FDckI7UUFDRCxJQUFJLE9BQU8sUUFBUSxJQUFJLFdBQVcsRUFBRTtZQUNsQyxJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQTtTQUN6QjtJQUNILENBQUM7Q0FDRjtBQXpPRCx3Q0F5T0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBwYWNrYWdlRG9jdW1lbnRhdGlvblxuICogQG1vZHVsZSBBUEktUGxhdGZvcm1WTS1BZGRyZXNzU3RhdGVUeFxuICovXG5pbXBvcnQgeyBCdWZmZXIgfSBmcm9tIFwiYnVmZmVyL1wiXG5pbXBvcnQgQmluVG9vbHMgZnJvbSBcIi4uLy4uL3V0aWxzL2JpbnRvb2xzXCJcbmltcG9ydCB7IFBsYXRmb3JtVk1Db25zdGFudHMgfSBmcm9tIFwiLi9jb25zdGFudHNcIlxuaW1wb3J0IHsgVHJhbnNmZXJhYmxlT3V0cHV0IH0gZnJvbSBcIi4vb3V0cHV0c1wiXG5pbXBvcnQgeyBUcmFuc2ZlcmFibGVJbnB1dCB9IGZyb20gXCIuL2lucHV0c1wiXG5pbXBvcnQgeyBCYXNlVHggfSBmcm9tIFwiLi9iYXNldHhcIlxuaW1wb3J0IHtcbiAgRGVmYXVsdE5ldHdvcmtJRCxcbiAgRGVmYXVsdFRyYW5zYWN0aW9uVmVyc2lvbk51bWJlclxufSBmcm9tIFwiLi4vLi4vdXRpbHMvY29uc3RhbnRzXCJcbmltcG9ydCB7IFNlcmlhbGl6YXRpb24sIFNlcmlhbGl6ZWRFbmNvZGluZyB9IGZyb20gXCIuLi8uLi91dGlscy9zZXJpYWxpemF0aW9uXCJcbmltcG9ydCB7IENyZWRlbnRpYWwsIFNpZ0lkeCwgU2lnbmF0dXJlLCBVcGdyYWRlVmVyc2lvbklEIH0gZnJvbSBcIi4uLy4uL2NvbW1vblwiXG5pbXBvcnQgeyBTdWJuZXRBdXRoIH0gZnJvbSBcIi4uLy4uL2FwaXMvcGxhdGZvcm12bS9zdWJuZXRhdXRoXCJcbmltcG9ydCB7IEtleUNoYWluLCBLZXlQYWlyIH0gZnJvbSBcIi4va2V5Y2hhaW5cIlxuaW1wb3J0IHsgU2VsZWN0Q3JlZGVudGlhbENsYXNzIH0gZnJvbSBcIi4vY3JlZGVudGlhbHNcIlxuXG4vKipcbiAqIEBpZ25vcmVcbiAqL1xuY29uc3QgYmludG9vbHM6IEJpblRvb2xzID0gQmluVG9vbHMuZ2V0SW5zdGFuY2UoKVxuY29uc3Qgc2VyaWFsaXphdGlvbjogU2VyaWFsaXphdGlvbiA9IFNlcmlhbGl6YXRpb24uZ2V0SW5zdGFuY2UoKVxuXG5leHBvcnQgZW51bSBBZGRyZXNzU3RhdGUge1xuICBST0xFX0FETUlOID0gMCxcbiAgUk9MRV9LWUMgPSAxLFxuICBST0xFX09GRkVSU19BRE1JTiA9IDIsXG4gIEtZQ19WRVJJRklFRCA9IDMyLFxuICBLWUNfRVhQSVJFRCA9IDMzLFxuICBDT05TT1JUSVVNID0gMzgsXG4gIE5PREVfREVGRVJSRUQgPSAzOSxcbiAgT0ZGRVJTX0NSRUFUT1IgPSA1MFxufVxuXG4vKipcbiAqIENsYXNzIHJlcHJlc2VudGluZyBhbiB1bnNpZ25lZCBBZHJlc3NTdGF0ZVR4IHRyYW5zYWN0aW9uLlxuICovXG5leHBvcnQgY2xhc3MgQWRkcmVzc1N0YXRlVHggZXh0ZW5kcyBCYXNlVHgge1xuICBwcm90ZWN0ZWQgX3R5cGVOYW1lID0gXCJBZGRyZXNzU3RhdGVUeFwiXG4gIHByb3RlY3RlZCBfdHlwZUlEID0gUGxhdGZvcm1WTUNvbnN0YW50cy5BRERSRVNTU1RBVEVUWFxuXG4gIHNlcmlhbGl6ZShlbmNvZGluZzogU2VyaWFsaXplZEVuY29kaW5nID0gXCJoZXhcIik6IG9iamVjdCB7XG4gICAgbGV0IGZpZWxkczogb2JqZWN0ID0gc3VwZXIuc2VyaWFsaXplKGVuY29kaW5nKVxuICAgIGxldCBmaWVsZHNWMTogb2JqZWN0ID0ge31cbiAgICBpZiAodGhpcy51cGdyYWRlVmVyc2lvbklELnZlcnNpb24oKSA+IDApIHtcbiAgICAgIGZpZWxkc1YxID0ge1xuICAgICAgICBleGVjdXRvcjogc2VyaWFsaXphdGlvbi5lbmNvZGVyKFxuICAgICAgICAgIHRoaXMuZXhlY3V0b3IsXG4gICAgICAgICAgZW5jb2RpbmcsXG4gICAgICAgICAgXCJCdWZmZXJcIixcbiAgICAgICAgICBcImNiNThcIlxuICAgICAgICApLFxuICAgICAgICBleGVjdXRvckF1dGg6IHRoaXMuZXhlY3V0b3JBdXRoLnNlcmlhbGl6ZShlbmNvZGluZylcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgIC4uLmZpZWxkcyxcbiAgICAgIGFkZHJlc3M6IHNlcmlhbGl6YXRpb24uZW5jb2Rlcih0aGlzLmFkZHJlc3MsIGVuY29kaW5nLCBcIkJ1ZmZlclwiLCBcImNiNThcIiksXG4gICAgICBzdGF0ZTogdGhpcy5zdGF0ZSxcbiAgICAgIHJlbW92ZTogdGhpcy5yZW1vdmUsXG4gICAgICAuLi5maWVsZHNWMVxuICAgIH1cbiAgfVxuICBkZXNlcmlhbGl6ZShmaWVsZHM6IG9iamVjdCwgZW5jb2Rpbmc6IFNlcmlhbGl6ZWRFbmNvZGluZyA9IFwiaGV4XCIpIHtcbiAgICBzdXBlci5kZXNlcmlhbGl6ZShmaWVsZHMsIGVuY29kaW5nKVxuICAgIHRoaXMuYWRkcmVzcyA9IHNlcmlhbGl6YXRpb24uZGVjb2RlcihcbiAgICAgIGZpZWxkc1tcImFkZHJlc3NcIl0sXG4gICAgICBlbmNvZGluZyxcbiAgICAgIFwiY2I1OFwiLFxuICAgICAgXCJCdWZmZXJcIixcbiAgICAgIDIwXG4gICAgKVxuICAgIHRoaXMuc3RhdGUgPSBmaWVsZHNbXCJzdGF0ZVwiXVxuICAgIHRoaXMucmVtb3ZlID0gZmllbGRzW1wicmVtb3ZlXCJdXG5cbiAgICBpZiAodGhpcy51cGdyYWRlVmVyc2lvbklELnZlcnNpb24oKSA+IDApIHtcbiAgICAgIHRoaXMuZXhlY3V0b3IgPSBzZXJpYWxpemF0aW9uLmRlY29kZXIoXG4gICAgICAgIGZpZWxkc1tcImV4ZWN1dG9yXCJdLFxuICAgICAgICBlbmNvZGluZyxcbiAgICAgICAgXCJjYjU4XCIsXG4gICAgICAgIFwiQnVmZmVyXCJcbiAgICAgIClcbiAgICAgIHRoaXMuZXhlY3V0b3JBdXRoLmRlc2VyaWFsaXplKGZpZWxkc1tcImV4ZWN1dG9yQXV0aFwiXSwgZW5jb2RpbmcpXG4gICAgfVxuICB9XG5cbiAgLy8gVXBncmFkZVZlcnNpb25JRCAoc2luY2UgU1AxKVxuICBwcm90ZWN0ZWQgdXBncmFkZVZlcnNpb25JRCA9IG5ldyBVcGdyYWRlVmVyc2lvbklEKClcbiAgLy8gVGhlIGFkZHJlc3MgdG8gYWRkIC8gcmVtb3ZlIHN0YXRlXG4gIHByb3RlY3RlZCBhZGRyZXNzID0gQnVmZmVyLmFsbG9jKDIwKVxuICAvLyBUaGUgc3RhdGUgdG8gc2V0IC8gdW5zZXRcbiAgcHJvdGVjdGVkIHN0YXRlID0gMFxuICAvLyBSZW1vdmUgb3IgYWRkIHRoZSBmbGFnID9cbiAgcHJvdGVjdGVkIHJlbW92ZTogYm9vbGVhblxuICBwcm90ZWN0ZWQgZXhlY3V0b3IgPSBCdWZmZXIuYWxsb2MoMjApXG4gIHByb3RlY3RlZCBleGVjdXRvckF1dGg6IFN1Ym5ldEF1dGggPSBuZXcgU3VibmV0QXV0aCgpXG4gIHByb3RlY3RlZCBzaWdJZHhzOiBTaWdJZHhbXSA9IFtdIC8vIGlkeHMgb2Ygc2lnbmVyc1xuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBpZCBvZiB0aGUgW1tBZGRyZXNzU3RhdGVUeF1dXG4gICAqL1xuICBnZXRUeFR5cGUoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fdHlwZUlEXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgYWRkcmVzc1xuICAgKi9cbiAgZ2V0QWRkcmVzcygpOiBCdWZmZXIge1xuICAgIHJldHVybiB0aGlzLmFkZHJlc3NcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBzdGF0ZVxuICAgKi9cbiAgZ2V0U3RhdGUoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5zdGF0ZVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHJlbW92ZSBmbGFnXG4gICAqL1xuICBnZXRSZW1vdmUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMucmVtb3ZlXG4gIH1cblxuICBnZXRFeGVjdXRvcigpOiBCdWZmZXIge1xuICAgIHJldHVybiB0aGlzLmV4ZWN1dG9yXG4gIH1cbiAgZ2V0RXhlY3V0b3JBdXRoKCk6IFN1Ym5ldEF1dGgge1xuICAgIHJldHVybiB0aGlzLmV4ZWN1dG9yQXV0aFxuICB9XG5cbiAgYWRkU2lnbmF0dXJlSWR4KGFkZHJlc3NJZHg6IG51bWJlciwgYWRkcmVzczogQnVmZmVyKTogdm9pZCB7XG4gICAgY29uc3QgYWRkcmVzc0luZGV4OiBCdWZmZXIgPSBCdWZmZXIuYWxsb2MoNClcbiAgICBhZGRyZXNzSW5kZXgud3JpdGVVSW50MzJCRShhZGRyZXNzSWR4LCAwKVxuICAgIHRoaXMuZXhlY3V0b3JBdXRoLmFkZEFkZHJlc3NJbmRleChhZGRyZXNzSW5kZXgpXG5cbiAgICBjb25zdCBzaWdpZHg6IFNpZ0lkeCA9IG5ldyBTaWdJZHgoKVxuICAgIHNpZ2lkeC5mcm9tQnVmZmVyKGFkZHJlc3NJbmRleClcbiAgICBzaWdpZHguc2V0U291cmNlKGFkZHJlc3MpXG4gICAgdGhpcy5zaWdJZHhzLnB1c2goc2lnaWR4KVxuICB9XG5cbiAgc2lnbihtc2c6IEJ1ZmZlciwga2M6IEtleUNoYWluKTogQ3JlZGVudGlhbFtdIHtcbiAgICBjb25zdCBjcmVkczogQ3JlZGVudGlhbFtdID0gc3VwZXIuc2lnbihtc2csIGtjKVxuXG4gICAgaWYgKHRoaXMudXBncmFkZVZlcnNpb25JRC52ZXJzaW9uKCkgPiAwKSB7XG4gICAgICBjb25zdCBjcmVkOiBDcmVkZW50aWFsID0gU2VsZWN0Q3JlZGVudGlhbENsYXNzKFxuICAgICAgICBQbGF0Zm9ybVZNQ29uc3RhbnRzLlNFQ1BDUkVERU5USUFMXG4gICAgICApXG4gICAgICBmb3IgKGNvbnN0IHNpZ2lkeCBvZiB0aGlzLnNpZ0lkeHMpIHtcbiAgICAgICAgY29uc3Qga2V5cGFpcjogS2V5UGFpciA9IGtjLmdldEtleShzaWdpZHguZ2V0U291cmNlKCkpXG4gICAgICAgIGNvbnN0IHNpZ252YWw6IEJ1ZmZlciA9IGtleXBhaXIuc2lnbihtc2cpXG4gICAgICAgIGNvbnN0IHNpZzogU2lnbmF0dXJlID0gbmV3IFNpZ25hdHVyZSgpXG4gICAgICAgIHNpZy5mcm9tQnVmZmVyKHNpZ252YWwpXG4gICAgICAgIGNyZWQuYWRkU2lnbmF0dXJlKHNpZylcbiAgICAgIH1cbiAgICAgIGNyZWRzLnB1c2goY3JlZClcbiAgICB9XG4gICAgcmV0dXJuIGNyZWRzXG4gIH1cblxuICAvKipcbiAgICogVGFrZXMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBjb250YWluaW5nIGFuIFtbQWRkcmVzc1N0YXRlVHhdXSwgcGFyc2VzIGl0LCBwb3B1bGF0ZXMgdGhlIGNsYXNzLCBhbmQgcmV0dXJucyB0aGUgbGVuZ3RoIG9mIHRoZSBbW0FkZHJlc3NTdGF0ZVR4XV0gaW4gYnl0ZXMuXG4gICAqXG4gICAqIEBwYXJhbSBieXRlcyBBIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IGNvbnRhaW5pbmcgYSByYXcgW1tBZGRyZXNzU3RhdGVUeF1dXG4gICAqXG4gICAqIEByZXR1cm5zIFRoZSBsZW5ndGggb2YgdGhlIHJhdyBbW0FkZHJlc3NTdGF0ZVR4XV1cbiAgICpcbiAgICogQHJlbWFya3MgYXNzdW1lIG5vdC1jaGVja3N1bW1lZFxuICAgKi9cbiAgZnJvbUJ1ZmZlcihieXRlczogQnVmZmVyLCBvZmZzZXQ6IG51bWJlciA9IDApOiBudW1iZXIge1xuICAgIHRoaXMudXBncmFkZVZlcnNpb25JRCA9IG5ldyBVcGdyYWRlVmVyc2lvbklEKClcbiAgICBvZmZzZXQgPSB0aGlzLnVwZ3JhZGVWZXJzaW9uSUQuZnJvbUJ1ZmZlcihieXRlcywgb2Zmc2V0KVxuICAgIG9mZnNldCA9IHN1cGVyLmZyb21CdWZmZXIoYnl0ZXMsIG9mZnNldClcbiAgICB0aGlzLmFkZHJlc3MgPSBiaW50b29scy5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyAyMClcbiAgICBvZmZzZXQgKz0gMjBcbiAgICB0aGlzLnN0YXRlID0gYmludG9vbHMuY29weUZyb20oYnl0ZXMsIG9mZnNldCwgb2Zmc2V0ICsgMSlbMF1cbiAgICBvZmZzZXQgKz0gMVxuICAgIHRoaXMucmVtb3ZlID0gYmludG9vbHMuY29weUZyb20oYnl0ZXMsIG9mZnNldCwgb2Zmc2V0ICsgMSlbMF0gIT0gMFxuICAgIG9mZnNldCArPSAxXG4gICAgaWYgKHRoaXMudXBncmFkZVZlcnNpb25JRC52ZXJzaW9uKCkgPiAwKSB7XG4gICAgICB0aGlzLmV4ZWN1dG9yID0gYmludG9vbHMuY29weUZyb20oYnl0ZXMsIG9mZnNldCwgb2Zmc2V0ICsgMjApXG4gICAgICBvZmZzZXQgKz0gMjBcbiAgICAgIGxldCBzYTogU3VibmV0QXV0aCA9IG5ldyBTdWJuZXRBdXRoKClcbiAgICAgIG9mZnNldCArPSBzYS5mcm9tQnVmZmVyKGJpbnRvb2xzLmNvcHlGcm9tKGJ5dGVzLCBvZmZzZXQpKVxuICAgICAgdGhpcy5leGVjdXRvckF1dGggPSBzYVxuICAgIH1cbiAgICByZXR1cm4gb2Zmc2V0XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IHJlcHJlc2VudGF0aW9uIG9mIHRoZSBbW0FkZHJlc3NTdGF0ZVR4XV0uXG4gICAqL1xuICB0b0J1ZmZlcigpOiBCdWZmZXIge1xuICAgIGNvbnN0IHVwZ3JhZGVCdWYgPSB0aGlzLnVwZ3JhZGVWZXJzaW9uSUQudG9CdWZmZXIoKVxuICAgIGNvbnN0IHN1cGVyYnVmZjogQnVmZmVyID0gc3VwZXIudG9CdWZmZXIoKVxuXG4gICAgbGV0IGJzaXplOiBudW1iZXIgPVxuICAgICAgdXBncmFkZUJ1Zi5sZW5ndGggKyBzdXBlcmJ1ZmYubGVuZ3RoICsgdGhpcy5hZGRyZXNzLmxlbmd0aCArIDJcbiAgICBjb25zdCBiYXJyOiBCdWZmZXJbXSA9IFtcbiAgICAgIHVwZ3JhZGVCdWYsXG4gICAgICBzdXBlcmJ1ZmYsXG4gICAgICB0aGlzLmFkZHJlc3MsXG4gICAgICBCdWZmZXIuZnJvbShbdGhpcy5zdGF0ZV0pLFxuICAgICAgQnVmZmVyLmZyb20oW3RoaXMucmVtb3ZlID8gMSA6IDBdKVxuICAgIF1cbiAgICBpZiAodGhpcy51cGdyYWRlVmVyc2lvbklELnZlcnNpb24oKSA+IDApIHtcbiAgICAgIGNvbnN0IGF1dGhCdWZmZXIgPSB0aGlzLmV4ZWN1dG9yQXV0aC50b0J1ZmZlcigpXG4gICAgICBic2l6ZSArPSB0aGlzLmV4ZWN1dG9yLmxlbmd0aCArIGF1dGhCdWZmZXIubGVuZ3RoXG4gICAgICBiYXJyLnB1c2godGhpcy5leGVjdXRvciwgYXV0aEJ1ZmZlcilcbiAgICB9XG4gICAgcmV0dXJuIEJ1ZmZlci5jb25jYXQoYmFyciwgYnNpemUpXG4gIH1cblxuICBjbG9uZSgpOiB0aGlzIHtcbiAgICBjb25zdCBuZXdBZGRyZXNzU3RhdGVUeDogQWRkcmVzc1N0YXRlVHggPSBuZXcgQWRkcmVzc1N0YXRlVHgoKVxuICAgIG5ld0FkZHJlc3NTdGF0ZVR4LmZyb21CdWZmZXIodGhpcy50b0J1ZmZlcigpKVxuICAgIHJldHVybiBuZXdBZGRyZXNzU3RhdGVUeCBhcyB0aGlzXG4gIH1cblxuICBjcmVhdGUoLi4uYXJnczogYW55W10pOiB0aGlzIHtcbiAgICByZXR1cm4gbmV3IEFkZHJlc3NTdGF0ZVR4KC4uLmFyZ3MpIGFzIHRoaXNcbiAgfVxuXG4gIC8qKlxuICAgKiBDbGFzcyByZXByZXNlbnRpbmcgYW4gdW5zaWduZWQgUmVnaXN0ZXJOb2RlIHRyYW5zYWN0aW9uLlxuICAgKlxuICAgKiBAcGFyYW0gdmVyc2lvbiBPcHRpb25hbC4gVHJhbnNhY3Rpb24gdmVyc2lvbiBudW1iZXJcbiAgICogQHBhcmFtIG5ldHdvcmtJRCBPcHRpb25hbCBuZXR3b3JrSUQsIFtbRGVmYXVsdE5ldHdvcmtJRF1dXG4gICAqIEBwYXJhbSBibG9ja2NoYWluSUQgT3B0aW9uYWwgYmxvY2tjaGFpbklELCBkZWZhdWx0IEJ1ZmZlci5hbGxvYygzMiwgMTYpXG4gICAqIEBwYXJhbSBvdXRzIE9wdGlvbmFsIGFycmF5IG9mIHRoZSBbW1RyYW5zZmVyYWJsZU91dHB1dF1dc1xuICAgKiBAcGFyYW0gaW5zIE9wdGlvbmFsIGFycmF5IG9mIHRoZSBbW1RyYW5zZmVyYWJsZUlucHV0XV1zXG4gICAqIEBwYXJhbSBtZW1vIE9wdGlvbmFsIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IGZvciB0aGUgbWVtbyBmaWVsZFxuICAgKiBAcGFyYW0gYWRkcmVzcyBPcHRpb25hbCBhZGRyZXNzIHRvIGFsdGVyIHN0YXRlLlxuICAgKiBAcGFyYW0gc3RhdGUgT3B0aW9uYWwgc3RhdGUgdG8gYWx0ZXIuXG4gICAqIEBwYXJhbSByZW1vdmUgT3B0aW9uYWwgaWYgdHJ1ZSByZW1vdmUgdGhlIGZsYWcsIG90aGVyd2lzZSBzZXRcbiAgICovXG4gIGNvbnN0cnVjdG9yKFxuICAgIHZlcnNpb246IG51bWJlciA9IERlZmF1bHRUcmFuc2FjdGlvblZlcnNpb25OdW1iZXIsXG4gICAgbmV0d29ya0lEOiBudW1iZXIgPSBEZWZhdWx0TmV0d29ya0lELFxuICAgIGJsb2NrY2hhaW5JRDogQnVmZmVyID0gQnVmZmVyLmFsbG9jKDMyLCAxNiksXG4gICAgb3V0czogVHJhbnNmZXJhYmxlT3V0cHV0W10gPSB1bmRlZmluZWQsXG4gICAgaW5zOiBUcmFuc2ZlcmFibGVJbnB1dFtdID0gdW5kZWZpbmVkLFxuICAgIG1lbW86IEJ1ZmZlciA9IHVuZGVmaW5lZCxcbiAgICBhZGRyZXNzOiBCdWZmZXIgPSB1bmRlZmluZWQsXG4gICAgc3RhdGU6IG51bWJlciA9IHVuZGVmaW5lZCxcbiAgICByZW1vdmU6IGJvb2xlYW4gPSB1bmRlZmluZWQsXG4gICAgZXhlY3V0b3I6IEJ1ZmZlciA9IHVuZGVmaW5lZFxuICApIHtcbiAgICBzdXBlcihuZXR3b3JrSUQsIGJsb2NrY2hhaW5JRCwgb3V0cywgaW5zLCBtZW1vKVxuICAgIHRoaXMudXBncmFkZVZlcnNpb25JRCA9IG5ldyBVcGdyYWRlVmVyc2lvbklEKHZlcnNpb24pXG4gICAgaWYgKHR5cGVvZiBhZGRyZXNzICE9IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIGlmICh0eXBlb2YgYWRkcmVzcyA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICB0aGlzLmFkZHJlc3MgPSBiaW50b29scy5zdHJpbmdUb0FkZHJlc3MoYWRkcmVzcylcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuYWRkcmVzcyA9IGFkZHJlc3NcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHR5cGVvZiBzdGF0ZSAhPSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICB0aGlzLnN0YXRlID0gc3RhdGVcbiAgICB9XG4gICAgaWYgKHR5cGVvZiByZW1vdmUgIT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgdGhpcy5yZW1vdmUgPSByZW1vdmVcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBleGVjdXRvciAhPSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICB0aGlzLmV4ZWN1dG9yID0gZXhlY3V0b3JcbiAgICB9XG4gIH1cbn1cbiJdfQ==
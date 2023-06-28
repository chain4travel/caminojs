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
    constructor(version = constants_2.DefaultTransactionVersionNumber, networkID = constants_2.DefaultNetworkID, blockchainID = buffer_1.Buffer.alloc(32, 16), outs = undefined, ins = undefined, memo = undefined, address = undefined, state = undefined, remove = undefined, executor = undefined, executorAuth = undefined) {
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
            if (typeof executor === "string") {
                this.executor = bintools.stringToAddress(executor);
            }
            else {
                this.executor = executor;
            }
        }
        if (typeof executorAuth !== "undefined") {
            this.executorAuth = executorAuth;
        }
        else {
            this.executorAuth = new subnetauth_1.SubnetAuth();
        }
    }
}
exports.AddressStateTx = AddressStateTx;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRkcmVzc3N0YXRldHguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYXBpcy9wbGF0Zm9ybXZtL2FkZHJlc3NzdGF0ZXR4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBOzs7R0FHRztBQUNILG9DQUFnQztBQUNoQyxvRUFBMkM7QUFDM0MsMkNBQWlEO0FBR2pELHFDQUFpQztBQUNqQyxxREFHOEI7QUFDOUIsNkRBQTZFO0FBQzdFLHlDQUErQztBQUMvQyxpRUFBNkQ7QUFFN0Q7O0dBRUc7QUFDSCxNQUFNLFFBQVEsR0FBYSxrQkFBUSxDQUFDLFdBQVcsRUFBRSxDQUFBO0FBQ2pELE1BQU0sYUFBYSxHQUFrQiw2QkFBYSxDQUFDLFdBQVcsRUFBRSxDQUFBO0FBRWhFLElBQVksWUFTWDtBQVRELFdBQVksWUFBWTtJQUN0QiwyREFBYyxDQUFBO0lBQ2QsdURBQVksQ0FBQTtJQUNaLHlFQUFxQixDQUFBO0lBQ3JCLGdFQUFpQixDQUFBO0lBQ2pCLDhEQUFnQixDQUFBO0lBQ2hCLDREQUFlLENBQUE7SUFDZixrRUFBa0IsQ0FBQTtJQUNsQixvRUFBbUIsQ0FBQTtBQUNyQixDQUFDLEVBVFcsWUFBWSxHQUFaLG9CQUFZLEtBQVosb0JBQVksUUFTdkI7QUFFRDs7R0FFRztBQUNILE1BQWEsY0FBZSxTQUFRLGVBQU07SUFJeEMsU0FBUyxDQUFDLFdBQStCLEtBQUs7UUFDNUMsSUFBSSxNQUFNLEdBQVcsS0FBSyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQTtRQUM5QyxJQUFJLFFBQVEsR0FBVyxFQUFFLENBQUE7UUFDekIsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxFQUFFO1lBQ3ZDLFFBQVEsR0FBRztnQkFDVCxRQUFRLEVBQUUsYUFBYSxDQUFDLE9BQU8sQ0FDN0IsSUFBSSxDQUFDLFFBQVEsRUFDYixRQUFRLEVBQ1IsUUFBUSxFQUNSLE1BQU0sQ0FDUDtnQkFD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O0FBcE5ELHdDQW9OQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQHBhY2thZ2VEb2N1bWVudGF0aW9uXG4gKiBAbW9kdWxlIEFQSS1QbGF0Zm9ybVZNLUFkZHJlc3NTdGF0ZVR4XG4gKi9cbmltcG9ydCB7IEJ1ZmZlciB9IGZyb20gXCJidWZmZXIvXCJcbmltcG9ydCBCaW5Ub29scyBmcm9tIFwiLi4vLi4vdXRpbHMvYmludG9vbHNcIlxuaW1wb3J0IHsgUGxhdGZvcm1WTUNvbnN0YW50cyB9IGZyb20gXCIuL2NvbnN0YW50c1wiXG5pbXBvcnQgeyBUcmFuc2ZlcmFibGVPdXRwdXQgfSBmcm9tIFwiLi9vdXRwdXRzXCJcbmltcG9ydCB7IFRyYW5zZmVyYWJsZUlucHV0IH0gZnJvbSBcIi4vaW5wdXRzXCJcbmltcG9ydCB7IEJhc2VUeCB9IGZyb20gXCIuL2Jhc2V0eFwiXG5pbXBvcnQge1xuICBEZWZhdWx0TmV0d29ya0lELFxuICBEZWZhdWx0VHJhbnNhY3Rpb25WZXJzaW9uTnVtYmVyXG59IGZyb20gXCIuLi8uLi91dGlscy9jb25zdGFudHNcIlxuaW1wb3J0IHsgU2VyaWFsaXphdGlvbiwgU2VyaWFsaXplZEVuY29kaW5nIH0gZnJvbSBcIi4uLy4uL3V0aWxzL3NlcmlhbGl6YXRpb25cIlxuaW1wb3J0IHsgVXBncmFkZVZlcnNpb25JRCB9IGZyb20gXCIuLi8uLi9jb21tb25cIlxuaW1wb3J0IHsgU3VibmV0QXV0aCB9IGZyb20gXCIuLi8uLi9hcGlzL3BsYXRmb3Jtdm0vc3VibmV0YXV0aFwiXG5cbi8qKlxuICogQGlnbm9yZVxuICovXG5jb25zdCBiaW50b29sczogQmluVG9vbHMgPSBCaW5Ub29scy5nZXRJbnN0YW5jZSgpXG5jb25zdCBzZXJpYWxpemF0aW9uOiBTZXJpYWxpemF0aW9uID0gU2VyaWFsaXphdGlvbi5nZXRJbnN0YW5jZSgpXG5cbmV4cG9ydCBlbnVtIEFkZHJlc3NTdGF0ZSB7XG4gIFJPTEVfQURNSU4gPSAwLFxuICBST0xFX0tZQyA9IDEsXG4gIFJPTEVfT0ZGRVJTX0FETUlOID0gMixcbiAgS1lDX1ZFUklGSUVEID0gMzIsXG4gIEtZQ19FWFBJUkVEID0gMzMsXG4gIENPTlNPUlRJVU0gPSAzOCxcbiAgTk9ERV9ERUZFUlJFRCA9IDM5LFxuICBPRkZFUlNfQ1JFQVRPUiA9IDUwXG59XG5cbi8qKlxuICogQ2xhc3MgcmVwcmVzZW50aW5nIGFuIHVuc2lnbmVkIEFkcmVzc1N0YXRlVHggdHJhbnNhY3Rpb24uXG4gKi9cbmV4cG9ydCBjbGFzcyBBZGRyZXNzU3RhdGVUeCBleHRlbmRzIEJhc2VUeCB7XG4gIHByb3RlY3RlZCBfdHlwZU5hbWUgPSBcIkFkZHJlc3NTdGF0ZVR4XCJcbiAgcHJvdGVjdGVkIF90eXBlSUQgPSBQbGF0Zm9ybVZNQ29uc3RhbnRzLkFERFJFU1NTVEFURVRYXG5cbiAgc2VyaWFsaXplKGVuY29kaW5nOiBTZXJpYWxpemVkRW5jb2RpbmcgPSBcImhleFwiKTogb2JqZWN0IHtcbiAgICBsZXQgZmllbGRzOiBvYmplY3QgPSBzdXBlci5zZXJpYWxpemUoZW5jb2RpbmcpXG4gICAgbGV0IGZpZWxkc1YxOiBvYmplY3QgPSB7fVxuICAgIGlmICh0aGlzLnVwZ3JhZGVWZXJzaW9uSUQudmVyc2lvbigpID4gMCkge1xuICAgICAgZmllbGRzVjEgPSB7XG4gICAgICAgIGV4ZWN1dG9yOiBzZXJpYWxpemF0aW9uLmVuY29kZXIoXG4gICAgICAgICAgdGhpcy5leGVjdXRvcixcbiAgICAgICAgICBlbmNvZGluZyxcbiAgICAgICAgICBcIkJ1ZmZlclwiLFxuICAgICAgICAgIFwiY2I1OFwiXG4gICAgICAgICksXG4gICAgICAgIGV4ZWN1dG9yQXV0aDogdGhpcy5leGVjdXRvckF1dGguc2VyaWFsaXplKGVuY29kaW5nKVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgLi4uZmllbGRzLFxuICAgICAgYWRkcmVzczogc2VyaWFsaXphdGlvbi5lbmNvZGVyKHRoaXMuYWRkcmVzcywgZW5jb2RpbmcsIFwiQnVmZmVyXCIsIFwiY2I1OFwiKSxcbiAgICAgIHN0YXRlOiB0aGlzLnN0YXRlLFxuICAgICAgcmVtb3ZlOiB0aGlzLnJlbW92ZSxcbiAgICAgIC4uLmZpZWxkc1YxXG4gICAgfVxuICB9XG4gIGRlc2VyaWFsaXplKGZpZWxkczogb2JqZWN0LCBlbmNvZGluZzogU2VyaWFsaXplZEVuY29kaW5nID0gXCJoZXhcIikge1xuICAgIHN1cGVyLmRlc2VyaWFsaXplKGZpZWxkcywgZW5jb2RpbmcpXG4gICAgdGhpcy5hZGRyZXNzID0gc2VyaWFsaXphdGlvbi5kZWNvZGVyKFxuICAgICAgZmllbGRzW1wiYWRkcmVzc1wiXSxcbiAgICAgIGVuY29kaW5nLFxuICAgICAgXCJjYjU4XCIsXG4gICAgICBcIkJ1ZmZlclwiLFxuICAgICAgMjBcbiAgICApXG4gICAgdGhpcy5zdGF0ZSA9IGZpZWxkc1tcInN0YXRlXCJdXG4gICAgdGhpcy5yZW1vdmUgPSBmaWVsZHNbXCJyZW1vdmVcIl1cblxuICAgIGlmICh0aGlzLnVwZ3JhZGVWZXJzaW9uSUQudmVyc2lvbigpID4gMCkge1xuICAgICAgdGhpcy5leGVjdXRvciA9IHNlcmlhbGl6YXRpb24uZGVjb2RlcihcbiAgICAgICAgZmllbGRzW1wiZXhlY3V0b3JcIl0sXG4gICAgICAgIGVuY29kaW5nLFxuICAgICAgICBcImNiNThcIixcbiAgICAgICAgXCJCdWZmZXJcIlxuICAgICAgKVxuICAgICAgdGhpcy5leGVjdXRvckF1dGguZGVzZXJpYWxpemUoZmllbGRzW1wiZXhlY3V0b3JBdXRoXCJdLCBlbmNvZGluZylcbiAgICB9XG4gIH1cblxuICAvLyBVcGdyYWRlVmVyc2lvbklEIChzaW5jZSBTUDEpXG4gIHByb3RlY3RlZCB1cGdyYWRlVmVyc2lvbklEID0gbmV3IFVwZ3JhZGVWZXJzaW9uSUQoKVxuICAvLyBUaGUgYWRkcmVzcyB0byBhZGQgLyByZW1vdmUgc3RhdGVcbiAgcHJvdGVjdGVkIGFkZHJlc3MgPSBCdWZmZXIuYWxsb2MoMjApXG4gIC8vIFRoZSBzdGF0ZSB0byBzZXQgLyB1bnNldFxuICBwcm90ZWN0ZWQgc3RhdGUgPSAwXG4gIC8vIFJlbW92ZSBvciBhZGQgdGhlIGZsYWcgP1xuICBwcm90ZWN0ZWQgcmVtb3ZlOiBib29sZWFuXG4gIHByb3RlY3RlZCBleGVjdXRvciA9IEJ1ZmZlci5hbGxvYygyMClcbiAgcHJvdGVjdGVkIGV4ZWN1dG9yQXV0aDogU3VibmV0QXV0aFxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBpZCBvZiB0aGUgW1tBZGRyZXNzU3RhdGVUeF1dXG4gICAqL1xuICBnZXRUeFR5cGUoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fdHlwZUlEXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgYWRkcmVzc1xuICAgKi9cbiAgZ2V0QWRkcmVzcygpOiBCdWZmZXIge1xuICAgIHJldHVybiB0aGlzLmFkZHJlc3NcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBzdGF0ZVxuICAgKi9cbiAgZ2V0U3RhdGUoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5zdGF0ZVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHJlbW92ZSBmbGFnXG4gICAqL1xuICBnZXRSZW1vdmUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMucmVtb3ZlXG4gIH1cblxuICBnZXRFeGVjdXRvcigpOiBCdWZmZXIge1xuICAgIHJldHVybiB0aGlzLmV4ZWN1dG9yXG4gIH1cbiAgZ2V0RXhlY3V0b3JBdXRoKCk6IFN1Ym5ldEF1dGgge1xuICAgIHJldHVybiB0aGlzLmV4ZWN1dG9yQXV0aFxuICB9XG5cbiAgLyoqXG4gICAqIFRha2VzIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gY29udGFpbmluZyBhbiBbW0FkZHJlc3NTdGF0ZVR4XV0sIHBhcnNlcyBpdCwgcG9wdWxhdGVzIHRoZSBjbGFzcywgYW5kIHJldHVybnMgdGhlIGxlbmd0aCBvZiB0aGUgW1tBZGRyZXNzU3RhdGVUeF1dIGluIGJ5dGVzLlxuICAgKlxuICAgKiBAcGFyYW0gYnl0ZXMgQSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBjb250YWluaW5nIGEgcmF3IFtbQWRkcmVzc1N0YXRlVHhdXVxuICAgKlxuICAgKiBAcmV0dXJucyBUaGUgbGVuZ3RoIG9mIHRoZSByYXcgW1tBZGRyZXNzU3RhdGVUeF1dXG4gICAqXG4gICAqIEByZW1hcmtzIGFzc3VtZSBub3QtY2hlY2tzdW1tZWRcbiAgICovXG4gIGZyb21CdWZmZXIoYnl0ZXM6IEJ1ZmZlciwgb2Zmc2V0OiBudW1iZXIgPSAwKTogbnVtYmVyIHtcbiAgICB0aGlzLnVwZ3JhZGVWZXJzaW9uSUQgPSBuZXcgVXBncmFkZVZlcnNpb25JRCgpXG4gICAgb2Zmc2V0ID0gdGhpcy51cGdyYWRlVmVyc2lvbklELmZyb21CdWZmZXIoYnl0ZXMsIG9mZnNldClcbiAgICBvZmZzZXQgPSBzdXBlci5mcm9tQnVmZmVyKGJ5dGVzLCBvZmZzZXQpXG4gICAgdGhpcy5hZGRyZXNzID0gYmludG9vbHMuY29weUZyb20oYnl0ZXMsIG9mZnNldCwgb2Zmc2V0ICsgMjApXG4gICAgb2Zmc2V0ICs9IDIwXG4gICAgdGhpcy5zdGF0ZSA9IGJpbnRvb2xzLmNvcHlGcm9tKGJ5dGVzLCBvZmZzZXQsIG9mZnNldCArIDEpWzBdXG4gICAgb2Zmc2V0ICs9IDFcbiAgICB0aGlzLnJlbW92ZSA9IGJpbnRvb2xzLmNvcHlGcm9tKGJ5dGVzLCBvZmZzZXQsIG9mZnNldCArIDEpWzBdICE9IDBcbiAgICBvZmZzZXQgKz0gMVxuICAgIGlmICh0aGlzLnVwZ3JhZGVWZXJzaW9uSUQudmVyc2lvbigpID4gMCkge1xuICAgICAgdGhpcy5leGVjdXRvciA9IGJpbnRvb2xzLmNvcHlGcm9tKGJ5dGVzLCBvZmZzZXQsIG9mZnNldCArIDIwKVxuICAgICAgb2Zmc2V0ICs9IDIwXG4gICAgICBsZXQgc2E6IFN1Ym5ldEF1dGggPSBuZXcgU3VibmV0QXV0aCgpXG4gICAgICBvZmZzZXQgKz0gc2EuZnJvbUJ1ZmZlcihiaW50b29scy5jb3B5RnJvbShieXRlcywgb2Zmc2V0KSlcbiAgICAgIHRoaXMuZXhlY3V0b3JBdXRoID0gc2FcbiAgICB9XG4gICAgcmV0dXJuIG9mZnNldFxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSByZXByZXNlbnRhdGlvbiBvZiB0aGUgW1tBZGRyZXNzU3RhdGVUeF1dLlxuICAgKi9cbiAgdG9CdWZmZXIoKTogQnVmZmVyIHtcbiAgICBjb25zdCB1cGdyYWRlQnVmID0gdGhpcy51cGdyYWRlVmVyc2lvbklELnRvQnVmZmVyKClcbiAgICBjb25zdCBzdXBlcmJ1ZmY6IEJ1ZmZlciA9IHN1cGVyLnRvQnVmZmVyKClcblxuICAgIGxldCBic2l6ZTogbnVtYmVyID1cbiAgICAgIHVwZ3JhZGVCdWYubGVuZ3RoICsgc3VwZXJidWZmLmxlbmd0aCArIHRoaXMuYWRkcmVzcy5sZW5ndGggKyAyXG4gICAgY29uc3QgYmFycjogQnVmZmVyW10gPSBbXG4gICAgICB1cGdyYWRlQnVmLFxuICAgICAgc3VwZXJidWZmLFxuICAgICAgdGhpcy5hZGRyZXNzLFxuICAgICAgQnVmZmVyLmZyb20oW3RoaXMuc3RhdGVdKSxcbiAgICAgIEJ1ZmZlci5mcm9tKFt0aGlzLnJlbW92ZSA/IDEgOiAwXSlcbiAgICBdXG4gICAgaWYgKHRoaXMudXBncmFkZVZlcnNpb25JRC52ZXJzaW9uKCkgPiAwKSB7XG4gICAgICBjb25zdCBhdXRoQnVmZmVyID0gdGhpcy5leGVjdXRvckF1dGgudG9CdWZmZXIoKVxuICAgICAgYnNpemUgKz0gdGhpcy5leGVjdXRvci5sZW5ndGggKyBhdXRoQnVmZmVyLmxlbmd0aFxuICAgICAgYmFyci5wdXNoKHRoaXMuZXhlY3V0b3IsIGF1dGhCdWZmZXIpXG4gICAgfVxuICAgIHJldHVybiBCdWZmZXIuY29uY2F0KGJhcnIsIGJzaXplKVxuICB9XG5cbiAgY2xvbmUoKTogdGhpcyB7XG4gICAgY29uc3QgbmV3QWRkcmVzc1N0YXRlVHg6IEFkZHJlc3NTdGF0ZVR4ID0gbmV3IEFkZHJlc3NTdGF0ZVR4KClcbiAgICBuZXdBZGRyZXNzU3RhdGVUeC5mcm9tQnVmZmVyKHRoaXMudG9CdWZmZXIoKSlcbiAgICByZXR1cm4gbmV3QWRkcmVzc1N0YXRlVHggYXMgdGhpc1xuICB9XG5cbiAgY3JlYXRlKC4uLmFyZ3M6IGFueVtdKTogdGhpcyB7XG4gICAgcmV0dXJuIG5ldyBBZGRyZXNzU3RhdGVUeCguLi5hcmdzKSBhcyB0aGlzXG4gIH1cblxuICAvKipcbiAgICogQ2xhc3MgcmVwcmVzZW50aW5nIGFuIHVuc2lnbmVkIFJlZ2lzdGVyTm9kZSB0cmFuc2FjdGlvbi5cbiAgICpcbiAgICogQHBhcmFtIHZlcnNpb24gT3B0aW9uYWwuIFRyYW5zYWN0aW9uIHZlcnNpb24gbnVtYmVyXG4gICAqIEBwYXJhbSBuZXR3b3JrSUQgT3B0aW9uYWwgbmV0d29ya0lELCBbW0RlZmF1bHROZXR3b3JrSURdXVxuICAgKiBAcGFyYW0gYmxvY2tjaGFpbklEIE9wdGlvbmFsIGJsb2NrY2hhaW5JRCwgZGVmYXVsdCBCdWZmZXIuYWxsb2MoMzIsIDE2KVxuICAgKiBAcGFyYW0gb3V0cyBPcHRpb25hbCBhcnJheSBvZiB0aGUgW1tUcmFuc2ZlcmFibGVPdXRwdXRdXXNcbiAgICogQHBhcmFtIGlucyBPcHRpb25hbCBhcnJheSBvZiB0aGUgW1tUcmFuc2ZlcmFibGVJbnB1dF1dc1xuICAgKiBAcGFyYW0gbWVtbyBPcHRpb25hbCB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBmb3IgdGhlIG1lbW8gZmllbGRcbiAgICogQHBhcmFtIGFkZHJlc3MgT3B0aW9uYWwgYWRkcmVzcyB0byBhbHRlciBzdGF0ZS5cbiAgICogQHBhcmFtIHN0YXRlIE9wdGlvbmFsIHN0YXRlIHRvIGFsdGVyLlxuICAgKiBAcGFyYW0gcmVtb3ZlIE9wdGlvbmFsIGlmIHRydWUgcmVtb3ZlIHRoZSBmbGFnLCBvdGhlcndpc2Ugc2V0XG4gICAqL1xuICBjb25zdHJ1Y3RvcihcbiAgICB2ZXJzaW9uOiBudW1iZXIgPSBEZWZhdWx0VHJhbnNhY3Rpb25WZXJzaW9uTnVtYmVyLFxuICAgIG5ldHdvcmtJRDogbnVtYmVyID0gRGVmYXVsdE5ldHdvcmtJRCxcbiAgICBibG9ja2NoYWluSUQ6IEJ1ZmZlciA9IEJ1ZmZlci5hbGxvYygzMiwgMTYpLFxuICAgIG91dHM6IFRyYW5zZmVyYWJsZU91dHB1dFtdID0gdW5kZWZpbmVkLFxuICAgIGluczogVHJhbnNmZXJhYmxlSW5wdXRbXSA9IHVuZGVmaW5lZCxcbiAgICBtZW1vOiBCdWZmZXIgPSB1bmRlZmluZWQsXG4gICAgYWRkcmVzczogc3RyaW5nIHwgQnVmZmVyID0gdW5kZWZpbmVkLFxuICAgIHN0YXRlOiBudW1iZXIgPSB1bmRlZmluZWQsXG4gICAgcmVtb3ZlOiBib29sZWFuID0gdW5kZWZpbmVkLFxuICAgIGV4ZWN1dG9yOiBzdHJpbmcgfCBCdWZmZXIgPSB1bmRlZmluZWQsXG4gICAgZXhlY3V0b3JBdXRoOiBTdWJuZXRBdXRoID0gdW5kZWZpbmVkXG4gICkge1xuICAgIHN1cGVyKG5ldHdvcmtJRCwgYmxvY2tjaGFpbklELCBvdXRzLCBpbnMsIG1lbW8pXG4gICAgdGhpcy51cGdyYWRlVmVyc2lvbklEID0gbmV3IFVwZ3JhZGVWZXJzaW9uSUQodmVyc2lvbilcbiAgICBpZiAodHlwZW9mIGFkZHJlc3MgIT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgaWYgKHR5cGVvZiBhZGRyZXNzID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgIHRoaXMuYWRkcmVzcyA9IGJpbnRvb2xzLnN0cmluZ1RvQWRkcmVzcyhhZGRyZXNzKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5hZGRyZXNzID0gYWRkcmVzc1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAodHlwZW9mIHN0YXRlICE9IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIHRoaXMuc3RhdGUgPSBzdGF0ZVxuICAgIH1cbiAgICBpZiAodHlwZW9mIHJlbW92ZSAhPSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICB0aGlzLnJlbW92ZSA9IHJlbW92ZVxuICAgIH1cbiAgICBpZiAodHlwZW9mIGV4ZWN1dG9yICE9IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIGlmICh0eXBlb2YgZXhlY3V0b3IgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgdGhpcy5leGVjdXRvciA9IGJpbnRvb2xzLnN0cmluZ1RvQWRkcmVzcyhleGVjdXRvcilcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuZXhlY3V0b3IgPSBleGVjdXRvclxuICAgICAgfVxuICAgIH1cbiAgICBpZiAodHlwZW9mIGV4ZWN1dG9yQXV0aCAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgdGhpcy5leGVjdXRvckF1dGggPSBleGVjdXRvckF1dGhcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5leGVjdXRvckF1dGggPSBuZXcgU3VibmV0QXV0aCgpXG4gICAgfVxuICB9XG59XG4iXX0=
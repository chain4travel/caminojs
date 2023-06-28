"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tx = exports.UnsignedTx = exports.SelectTxClass = void 0;
/**
 * @packageDocumentation
 * @module API-PlatformVM-Transactions
 */
const buffer_1 = require("buffer/");
const bintools_1 = __importDefault(require("../../utils/bintools"));
const constants_1 = require("./constants");
const credentials_1 = require("./credentials");
const common_1 = require("../../common");
const create_hash_1 = __importDefault(require("create-hash"));
const basetx_1 = require("./basetx");
const importtx_1 = require("./importtx");
const exporttx_1 = require("./exporttx");
const validationtx_1 = require("./validationtx");
const createsubnettx_1 = require("./createsubnettx");
const errors_1 = require("../../utils/errors");
const addsubnetvalidatortx_1 = require("./addsubnetvalidatortx");
const registernodetx_1 = require("./registernodetx");
const depositTx_1 = require("./depositTx");
const addressstatetx_1 = require("./addressstatetx");
const claimtx_1 = require("./claimtx");
const multisigaliastx_1 = require("./multisigaliastx");
/**
 * @ignore
 */
const bintools = bintools_1.default.getInstance();
/**
 * Takes a buffer representing the output and returns the proper [[BaseTx]] instance.
 *
 * @param txtype The id of the transaction type
 *
 * @returns An instance of an [[BaseTx]]-extended class.
 */
const SelectTxClass = (txtype, ...args) => {
    if (txtype === constants_1.PlatformVMConstants.BASETX) {
        return new basetx_1.BaseTx(...args);
    }
    else if (txtype === constants_1.PlatformVMConstants.IMPORTTX) {
        return new importtx_1.ImportTx(...args);
    }
    else if (txtype === constants_1.PlatformVMConstants.EXPORTTX) {
        return new exporttx_1.ExportTx(...args);
    }
    else if (txtype === constants_1.PlatformVMConstants.ADDDELEGATORTX) {
        return new validationtx_1.AddDelegatorTx(...args);
    }
    else if (txtype === constants_1.PlatformVMConstants.ADDVALIDATORTX) {
        return new validationtx_1.AddValidatorTx(...args);
    }
    else if (txtype === constants_1.PlatformVMConstants.CAMINOADDVALIDATORTX) {
        return new validationtx_1.CaminoAddValidatorTx(...args);
    }
    else if (txtype === constants_1.PlatformVMConstants.CREATESUBNETTX) {
        return new createsubnettx_1.CreateSubnetTx(...args);
    }
    else if (txtype === constants_1.PlatformVMConstants.ADDSUBNETVALIDATORTX) {
        return new addsubnetvalidatortx_1.AddSubnetValidatorTx(...args);
    }
    else if (txtype === constants_1.PlatformVMConstants.REGISTERNODETX) {
        return new registernodetx_1.RegisterNodeTx(...args);
    }
    else if (txtype === constants_1.PlatformVMConstants.DEPOSITTX) {
        return new depositTx_1.DepositTx(...args);
    }
    else if (txtype === constants_1.PlatformVMConstants.ADDRESSSTATETX) {
        return new addressstatetx_1.AddressStateTx(...args);
    }
    else if (txtype === constants_1.PlatformVMConstants.CLAIMTX) {
        return new claimtx_1.ClaimTx(...args);
    }
    else if (txtype === constants_1.PlatformVMConstants.MULTISIGALIASTX) {
        return new multisigaliastx_1.MultisigAliasTx(...args);
    }
    /* istanbul ignore next */
    throw new errors_1.TransactionError("Error - SelectTxClass: unknown txtype");
};
exports.SelectTxClass = SelectTxClass;
class UnsignedTx extends common_1.StandardUnsignedTx {
    constructor() {
        super(...arguments);
        this._typeName = "UnsignedTx";
        this._typeID = undefined;
    }
    //serialize is inherited
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        this.transaction = (0, exports.SelectTxClass)(fields["transaction"]["_typeID"]);
        this.transaction.deserialize(fields["transaction"], encoding);
    }
    getTransaction() {
        return this.transaction;
    }
    fromBuffer(bytes, offset = 0) {
        this.codecID = bintools.copyFrom(bytes, offset, offset + 2).readUInt16BE(0);
        offset += 2;
        const txtype = bintools
            .copyFrom(bytes, offset, offset + 4)
            .readUInt32BE(0);
        offset += 4;
        this.transaction = (0, exports.SelectTxClass)(txtype);
        return this.transaction.fromBuffer(bytes, offset);
    }
    /**
     * Signs this [[UnsignedTx]] and returns signed [[StandardTx]]
     *
     * @param kc An [[KeyChain]] used in signing
     *
     * @returns A signed [[StandardTx]]
     */
    sign(kc) {
        const txbuff = this.toBuffer();
        const msg = buffer_1.Buffer.from((0, create_hash_1.default)("sha256").update(txbuff).digest());
        const creds = kc instanceof common_1.MultisigKeyChain
            ? kc.getCredentials()
            : this.transaction.sign(msg, kc);
        return new Tx(this, creds);
    }
}
exports.UnsignedTx = UnsignedTx;
class Tx extends common_1.StandardTx {
    constructor() {
        super(...arguments);
        this._typeName = "Tx";
        this._typeID = undefined;
    }
    //serialize is inherited
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        this.unsignedTx = new UnsignedTx();
        this.unsignedTx.deserialize(fields["unsignedTx"], encoding);
        this.credentials = [];
        for (let i = 0; i < fields["credentials"].length; i++) {
            const cred = (0, credentials_1.SelectCredentialClass)(fields["credentials"][`${i}`]["_typeID"]);
            cred.deserialize(fields["credentials"][`${i}`], encoding);
            this.credentials.push(cred);
        }
    }
    /**
     * Takes a {@link https://github.com/feross/buffer|Buffer} containing an [[Tx]], parses it, populates the class, and returns the length of the Tx in bytes.
     *
     * @param bytes A {@link https://github.com/feross/buffer|Buffer} containing a raw [[Tx]]
     * @param offset A number representing the starting point of the bytes to begin parsing
     *
     * @returns The length of the raw [[Tx]]
     */
    fromBuffer(bytes, offset = 0) {
        this.unsignedTx = new UnsignedTx();
        offset = this.unsignedTx.fromBuffer(bytes, offset);
        const numcreds = bintools
            .copyFrom(bytes, offset, offset + 4)
            .readUInt32BE(0);
        offset += 4;
        this.credentials = [];
        for (let i = 0; i < numcreds; i++) {
            const credid = bintools
                .copyFrom(bytes, offset, offset + 4)
                .readUInt32BE(0);
            offset += 4;
            const cred = (0, credentials_1.SelectCredentialClass)(credid);
            offset = cred.fromBuffer(bytes, offset);
            this.credentials.push(cred);
        }
        return offset;
    }
}
exports.Tx = Tx;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYXBpcy9wbGF0Zm9ybXZtL3R4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBOzs7R0FHRztBQUNILG9DQUFnQztBQUNoQyxvRUFBMkM7QUFDM0MsMkNBQWlEO0FBQ2pELCtDQUFxRDtBQUNyRCx5Q0FNcUI7QUFFckIsOERBQW9DO0FBQ3BDLHFDQUFpQztBQUNqQyx5Q0FBcUM7QUFDckMseUNBQXFDO0FBRXJDLGlEQUl1QjtBQUN2QixxREFBaUQ7QUFDakQsK0NBQXFEO0FBQ3JELGlFQUE2RDtBQUM3RCxxREFBaUQ7QUFDakQsMkNBQXVDO0FBQ3ZDLHFEQUFpRDtBQUNqRCx1Q0FBbUM7QUFDbkMsdURBQW1EO0FBRW5EOztHQUVHO0FBQ0gsTUFBTSxRQUFRLEdBQWEsa0JBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtBQUVqRDs7Ozs7O0dBTUc7QUFDSSxNQUFNLGFBQWEsR0FBRyxDQUFDLE1BQWMsRUFBRSxHQUFHLElBQVcsRUFBVSxFQUFFO0lBQ3RFLElBQUksTUFBTSxLQUFLLCtCQUFtQixDQUFDLE1BQU0sRUFBRTtRQUN6QyxPQUFPLElBQUksZUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUE7S0FDM0I7U0FBTSxJQUFJLE1BQU0sS0FBSywrQkFBbUIsQ0FBQyxRQUFRLEVBQUU7UUFDbEQsT0FBTyxJQUFJLG1CQUFRLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQTtLQUM3QjtTQUFNLElBQUksTUFBTSxLQUFLLCtCQUFtQixDQUFDLFFBQVEsRUFBRTtRQUNsRCxPQUFPLElBQUksbUJBQVEsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFBO0tBQzdCO1NBQU0sSUFBSSxNQUFNLEtBQUssK0JBQW1CLENBQUMsY0FBYyxFQUFFO1FBQ3hELE9BQU8sSUFBSSw2QkFBYyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUE7S0FDbkM7U0FBTSxJQUFJLE1BQU0sS0FBSywrQkFB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QUUsTUFBTSxDQUFDLENBQUE7WUFDdkMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7U0FDNUI7UUFDRCxPQUFPLE1BQU0sQ0FBQTtJQUNmLENBQUM7Q0FDRjtBQS9DRCxnQkErQ0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBwYWNrYWdlRG9jdW1lbnRhdGlvblxuICogQG1vZHVsZSBBUEktUGxhdGZvcm1WTS1UcmFuc2FjdGlvbnNcbiAqL1xuaW1wb3J0IHsgQnVmZmVyIH0gZnJvbSBcImJ1ZmZlci9cIlxuaW1wb3J0IEJpblRvb2xzIGZyb20gXCIuLi8uLi91dGlscy9iaW50b29sc1wiXG5pbXBvcnQgeyBQbGF0Zm9ybVZNQ29uc3RhbnRzIH0gZnJvbSBcIi4vY29uc3RhbnRzXCJcbmltcG9ydCB7IFNlbGVjdENyZWRlbnRpYWxDbGFzcyB9IGZyb20gXCIuL2NyZWRlbnRpYWxzXCJcbmltcG9ydCB7XG4gIE11bHRpc2lnS2V5Q2hhaW4sXG4gIFNpZ25lcktleUNoYWluLFxuICBTaWduZXJLZXlQYWlyLFxuICBTdGFuZGFyZFR4LFxuICBTdGFuZGFyZFVuc2lnbmVkVHhcbn0gZnJvbSBcIi4uLy4uL2NvbW1vblwiXG5pbXBvcnQgeyBDcmVkZW50aWFsIH0gZnJvbSBcIi4uLy4uL2NvbW1vbi9jcmVkZW50aWFsc1wiXG5pbXBvcnQgY3JlYXRlSGFzaCBmcm9tIFwiY3JlYXRlLWhhc2hcIlxuaW1wb3J0IHsgQmFzZVR4IH0gZnJvbSBcIi4vYmFzZXR4XCJcbmltcG9ydCB7IEltcG9ydFR4IH0gZnJvbSBcIi4vaW1wb3J0dHhcIlxuaW1wb3J0IHsgRXhwb3J0VHggfSBmcm9tIFwiLi9leHBvcnR0eFwiXG5pbXBvcnQgeyBTZXJpYWxpemVkRW5jb2RpbmcgfSBmcm9tIFwiLi4vLi4vdXRpbHMvc2VyaWFsaXphdGlvblwiXG5pbXBvcnQge1xuICBBZGREZWxlZ2F0b3JUeCxcbiAgQWRkVmFsaWRhdG9yVHgsXG4gIENhbWlub0FkZFZhbGlkYXRvclR4XG59IGZyb20gXCIuL3ZhbGlkYXRpb250eFwiXG5pbXBvcnQgeyBDcmVhdGVTdWJuZXRUeCB9IGZyb20gXCIuL2NyZWF0ZXN1Ym5ldHR4XCJcbmltcG9ydCB7IFRyYW5zYWN0aW9uRXJyb3IgfSBmcm9tIFwiLi4vLi4vdXRpbHMvZXJyb3JzXCJcbmltcG9ydCB7IEFkZFN1Ym5ldFZhbGlkYXRvclR4IH0gZnJvbSBcIi4vYWRkc3VibmV0dmFsaWRhdG9ydHhcIlxuaW1wb3J0IHsgUmVnaXN0ZXJOb2RlVHggfSBmcm9tIFwiLi9yZWdpc3Rlcm5vZGV0eFwiXG5pbXBvcnQgeyBEZXBvc2l0VHggfSBmcm9tIFwiLi9kZXBvc2l0VHhcIlxuaW1wb3J0IHsgQWRkcmVzc1N0YXRlVHggfSBmcm9tIFwiLi9hZGRyZXNzc3RhdGV0eFwiXG5pbXBvcnQgeyBDbGFpbVR4IH0gZnJvbSBcIi4vY2xhaW10eFwiXG5pbXBvcnQgeyBNdWx0aXNpZ0FsaWFzVHggfSBmcm9tIFwiLi9tdWx0aXNpZ2FsaWFzdHhcIlxuXG4vKipcbiAqIEBpZ25vcmVcbiAqL1xuY29uc3QgYmludG9vbHM6IEJpblRvb2xzID0gQmluVG9vbHMuZ2V0SW5zdGFuY2UoKVxuXG4vKipcbiAqIFRha2VzIGEgYnVmZmVyIHJlcHJlc2VudGluZyB0aGUgb3V0cHV0IGFuZCByZXR1cm5zIHRoZSBwcm9wZXIgW1tCYXNlVHhdXSBpbnN0YW5jZS5cbiAqXG4gKiBAcGFyYW0gdHh0eXBlIFRoZSBpZCBvZiB0aGUgdHJhbnNhY3Rpb24gdHlwZVxuICpcbiAqIEByZXR1cm5zIEFuIGluc3RhbmNlIG9mIGFuIFtbQmFzZVR4XV0tZXh0ZW5kZWQgY2xhc3MuXG4gKi9cbmV4cG9ydCBjb25zdCBTZWxlY3RUeENsYXNzID0gKHR4dHlwZTogbnVtYmVyLCAuLi5hcmdzOiBhbnlbXSk6IEJhc2VUeCA9PiB7XG4gIGlmICh0eHR5cGUgPT09IFBsYXRmb3JtVk1Db25zdGFudHMuQkFTRVRYKSB7XG4gICAgcmV0dXJuIG5ldyBCYXNlVHgoLi4uYXJncylcbiAgfSBlbHNlIGlmICh0eHR5cGUgPT09IFBsYXRmb3JtVk1Db25zdGFudHMuSU1QT1JUVFgpIHtcbiAgICByZXR1cm4gbmV3IEltcG9ydFR4KC4uLmFyZ3MpXG4gIH0gZWxzZSBpZiAodHh0eXBlID09PSBQbGF0Zm9ybVZNQ29uc3RhbnRzLkVYUE9SVFRYKSB7XG4gICAgcmV0dXJuIG5ldyBFeHBvcnRUeCguLi5hcmdzKVxuICB9IGVsc2UgaWYgKHR4dHlwZSA9PT0gUGxhdGZvcm1WTUNvbnN0YW50cy5BRERERUxFR0FUT1JUWCkge1xuICAgIHJldHVybiBuZXcgQWRkRGVsZWdhdG9yVHgoLi4uYXJncylcbiAgfSBlbHNlIGlmICh0eHR5cGUgPT09IFBsYXRmb3JtVk1Db25zdGFudHMuQUREVkFMSURBVE9SVFgpIHtcbiAgICByZXR1cm4gbmV3IEFkZFZhbGlkYXRvclR4KC4uLmFyZ3MpXG4gIH0gZWxzZSBpZiAodHh0eXBlID09PSBQbGF0Zm9ybVZNQ29uc3RhbnRzLkNBTUlOT0FERFZBTElEQVRPUlRYKSB7XG4gICAgcmV0dXJuIG5ldyBDYW1pbm9BZGRWYWxpZGF0b3JUeCguLi5hcmdzKVxuICB9IGVsc2UgaWYgKHR4dHlwZSA9PT0gUGxhdGZvcm1WTUNvbnN0YW50cy5DUkVBVEVTVUJORVRUWCkge1xuICAgIHJldHVybiBuZXcgQ3JlYXRlU3VibmV0VHgoLi4uYXJncylcbiAgfSBlbHNlIGlmICh0eHR5cGUgPT09IFBsYXRmb3JtVk1Db25zdGFudHMuQUREU1VCTkVUVkFMSURBVE9SVFgpIHtcbiAgICByZXR1cm4gbmV3IEFkZFN1Ym5ldFZhbGlkYXRvclR4KC4uLmFyZ3MpXG4gIH0gZWxzZSBpZiAodHh0eXBlID09PSBQbGF0Zm9ybVZNQ29uc3RhbnRzLlJFR0lTVEVSTk9ERVRYKSB7XG4gICAgcmV0dXJuIG5ldyBSZWdpc3Rlck5vZGVUeCguLi5hcmdzKVxuICB9IGVsc2UgaWYgKHR4dHlwZSA9PT0gUGxhdGZvcm1WTUNvbnN0YW50cy5ERVBPU0lUVFgpIHtcbiAgICByZXR1cm4gbmV3IERlcG9zaXRUeCguLi5hcmdzKVxuICB9IGVsc2UgaWYgKHR4dHlwZSA9PT0gUGxhdGZvcm1WTUNvbnN0YW50cy5BRERSRVNTU1RBVEVUWCkge1xuICAgIHJldHVybiBuZXcgQWRkcmVzc1N0YXRlVHgoLi4uYXJncylcbiAgfSBlbHNlIGlmICh0eHR5cGUgPT09IFBsYXRmb3JtVk1Db25zdGFudHMuQ0xBSU1UWCkge1xuICAgIHJldHVybiBuZXcgQ2xhaW1UeCguLi5hcmdzKVxuICB9IGVsc2UgaWYgKHR4dHlwZSA9PT0gUGxhdGZvcm1WTUNvbnN0YW50cy5NVUxUSVNJR0FMSUFTVFgpIHtcbiAgICByZXR1cm4gbmV3IE11bHRpc2lnQWxpYXNUeCguLi5hcmdzKVxuICB9XG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gIHRocm93IG5ldyBUcmFuc2FjdGlvbkVycm9yKFwiRXJyb3IgLSBTZWxlY3RUeENsYXNzOiB1bmtub3duIHR4dHlwZVwiKVxufVxuXG5leHBvcnQgY2xhc3MgVW5zaWduZWRUeCBleHRlbmRzIFN0YW5kYXJkVW5zaWduZWRUeDxcbiAgU2lnbmVyS2V5UGFpcixcbiAgU2lnbmVyS2V5Q2hhaW4sXG4gIEJhc2VUeFxuPiB7XG4gIHByb3RlY3RlZCBfdHlwZU5hbWUgPSBcIlVuc2lnbmVkVHhcIlxuICBwcm90ZWN0ZWQgX3R5cGVJRCA9IHVuZGVmaW5lZFxuXG4gIC8vc2VyaWFsaXplIGlzIGluaGVyaXRlZFxuXG4gIGRlc2VyaWFsaXplKGZpZWxkczogb2JqZWN0LCBlbmNvZGluZzogU2VyaWFsaXplZEVuY29kaW5nID0gXCJoZXhcIikge1xuICAgIHN1cGVyLmRlc2VyaWFsaXplKGZpZWxkcywgZW5jb2RpbmcpXG4gICAgdGhpcy50cmFuc2FjdGlvbiA9IFNlbGVjdFR4Q2xhc3MoZmllbGRzW1widHJhbnNhY3Rpb25cIl1bXCJfdHlwZUlEXCJdKVxuICAgIHRoaXMudHJhbnNhY3Rpb24uZGVzZXJpYWxpemUoZmllbGRzW1widHJhbnNhY3Rpb25cIl0sIGVuY29kaW5nKVxuICB9XG5cbiAgZ2V0VHJhbnNhY3Rpb24oKTogQmFzZVR4IHtcbiAgICByZXR1cm4gdGhpcy50cmFuc2FjdGlvbiBhcyBCYXNlVHhcbiAgfVxuXG4gIGZyb21CdWZmZXIoYnl0ZXM6IEJ1ZmZlciwgb2Zmc2V0OiBudW1iZXIgPSAwKTogbnVtYmVyIHtcbiAgICB0aGlzLmNvZGVjSUQgPSBiaW50b29scy5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyAyKS5yZWFkVUludDE2QkUoMClcbiAgICBvZmZzZXQgKz0gMlxuICAgIGNvbnN0IHR4dHlwZTogbnVtYmVyID0gYmludG9vbHNcbiAgICAgIC5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyA0KVxuICAgICAgLnJlYWRVSW50MzJCRSgwKVxuICAgIG9mZnNldCArPSA0XG4gICAgdGhpcy50cmFuc2FjdGlvbiA9IFNlbGVjdFR4Q2xhc3ModHh0eXBlKVxuICAgIHJldHVybiB0aGlzLnRyYW5zYWN0aW9uLmZyb21CdWZmZXIoYnl0ZXMsIG9mZnNldClcbiAgfVxuXG4gIC8qKlxuICAgKiBTaWducyB0aGlzIFtbVW5zaWduZWRUeF1dIGFuZCByZXR1cm5zIHNpZ25lZCBbW1N0YW5kYXJkVHhdXVxuICAgKlxuICAgKiBAcGFyYW0ga2MgQW4gW1tLZXlDaGFpbl1dIHVzZWQgaW4gc2lnbmluZ1xuICAgKlxuICAgKiBAcmV0dXJucyBBIHNpZ25lZCBbW1N0YW5kYXJkVHhdXVxuICAgKi9cbiAgc2lnbihrYzogU2lnbmVyS2V5Q2hhaW4pOiBUeCB7XG4gICAgY29uc3QgdHhidWZmID0gdGhpcy50b0J1ZmZlcigpXG4gICAgY29uc3QgbXNnOiBCdWZmZXIgPSBCdWZmZXIuZnJvbShcbiAgICAgIGNyZWF0ZUhhc2goXCJzaGEyNTZcIikudXBkYXRlKHR4YnVmZikuZGlnZXN0KClcbiAgICApXG5cbiAgICBjb25zdCBjcmVkczogQ3JlZGVudGlhbFtdID1cbiAgICAgIGtjIGluc3RhbmNlb2YgTXVsdGlzaWdLZXlDaGFpblxuICAgICAgICA/IGtjLmdldENyZWRlbnRpYWxzKClcbiAgICAgICAgOiB0aGlzLnRyYW5zYWN0aW9uLnNpZ24obXNnLCBrYylcbiAgICByZXR1cm4gbmV3IFR4KHRoaXMsIGNyZWRzKVxuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBUeCBleHRlbmRzIFN0YW5kYXJkVHg8U2lnbmVyS2V5UGFpciwgU2lnbmVyS2V5Q2hhaW4sIFVuc2lnbmVkVHg+IHtcbiAgcHJvdGVjdGVkIF90eXBlTmFtZSA9IFwiVHhcIlxuICBwcm90ZWN0ZWQgX3R5cGVJRCA9IHVuZGVmaW5lZFxuXG4gIC8vc2VyaWFsaXplIGlzIGluaGVyaXRlZFxuXG4gIGRlc2VyaWFsaXplKGZpZWxkczogb2JqZWN0LCBlbmNvZGluZzogU2VyaWFsaXplZEVuY29kaW5nID0gXCJoZXhcIikge1xuICAgIHN1cGVyLmRlc2VyaWFsaXplKGZpZWxkcywgZW5jb2RpbmcpXG4gICAgdGhpcy51bnNpZ25lZFR4ID0gbmV3IFVuc2lnbmVkVHgoKVxuICAgIHRoaXMudW5zaWduZWRUeC5kZXNlcmlhbGl6ZShmaWVsZHNbXCJ1bnNpZ25lZFR4XCJdLCBlbmNvZGluZylcbiAgICB0aGlzLmNyZWRlbnRpYWxzID0gW11cbiAgICBmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgZmllbGRzW1wiY3JlZGVudGlhbHNcIl0ubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGNyZWQ6IENyZWRlbnRpYWwgPSBTZWxlY3RDcmVkZW50aWFsQ2xhc3MoXG4gICAgICAgIGZpZWxkc1tcImNyZWRlbnRpYWxzXCJdW2Ake2l9YF1bXCJfdHlwZUlEXCJdXG4gICAgICApXG4gICAgICBjcmVkLmRlc2VyaWFsaXplKGZpZWxkc1tcImNyZWRlbnRpYWxzXCJdW2Ake2l9YF0sIGVuY29kaW5nKVxuICAgICAgdGhpcy5jcmVkZW50aWFscy5wdXNoKGNyZWQpXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFRha2VzIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gY29udGFpbmluZyBhbiBbW1R4XV0sIHBhcnNlcyBpdCwgcG9wdWxhdGVzIHRoZSBjbGFzcywgYW5kIHJldHVybnMgdGhlIGxlbmd0aCBvZiB0aGUgVHggaW4gYnl0ZXMuXG4gICAqXG4gICAqIEBwYXJhbSBieXRlcyBBIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IGNvbnRhaW5pbmcgYSByYXcgW1tUeF1dXG4gICAqIEBwYXJhbSBvZmZzZXQgQSBudW1iZXIgcmVwcmVzZW50aW5nIHRoZSBzdGFydGluZyBwb2ludCBvZiB0aGUgYnl0ZXMgdG8gYmVnaW4gcGFyc2luZ1xuICAgKlxuICAgKiBAcmV0dXJucyBUaGUgbGVuZ3RoIG9mIHRoZSByYXcgW1tUeF1dXG4gICAqL1xuICBmcm9tQnVmZmVyKGJ5dGVzOiBCdWZmZXIsIG9mZnNldDogbnVtYmVyID0gMCk6IG51bWJlciB7XG4gICAgdGhpcy51bnNpZ25lZFR4ID0gbmV3IFVuc2lnbmVkVHgoKVxuICAgIG9mZnNldCA9IHRoaXMudW5zaWduZWRUeC5mcm9tQnVmZmVyKGJ5dGVzLCBvZmZzZXQpXG4gICAgY29uc3QgbnVtY3JlZHM6IG51bWJlciA9IGJpbnRvb2xzXG4gICAgICAuY29weUZyb20oYnl0ZXMsIG9mZnNldCwgb2Zmc2V0ICsgNClcbiAgICAgIC5yZWFkVUludDMyQkUoMClcbiAgICBvZmZzZXQgKz0gNFxuICAgIHRoaXMuY3JlZGVudGlhbHMgPSBbXVxuICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCBudW1jcmVkczsgaSsrKSB7XG4gICAgICBjb25zdCBjcmVkaWQ6IG51bWJlciA9IGJpbnRvb2xzXG4gICAgICAgIC5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyA0KVxuICAgICAgICAucmVhZFVJbnQzMkJFKDApXG4gICAgICBvZmZzZXQgKz0gNFxuICAgICAgY29uc3QgY3JlZDogQ3JlZGVudGlhbCA9IFNlbGVjdENyZWRlbnRpYWxDbGFzcyhjcmVkaWQpXG4gICAgICBvZmZzZXQgPSBjcmVkLmZyb21CdWZmZXIoYnl0ZXMsIG9mZnNldClcbiAgICAgIHRoaXMuY3JlZGVudGlhbHMucHVzaChjcmVkKVxuICAgIH1cbiAgICByZXR1cm4gb2Zmc2V0XG4gIH1cbn1cbiJdfQ==
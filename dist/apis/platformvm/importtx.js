"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportTx = void 0;
/**
 * @packageDocumentation
 * @module API-PlatformVM-ImportTx
 */
const buffer_1 = require("buffer/");
const bintools_1 = __importDefault(require("../../utils/bintools"));
const constants_1 = require("./constants");
const inputs_1 = require("./inputs");
const credentials_1 = require("./credentials");
const common_1 = require("../../common");
const basetx_1 = require("./basetx");
const constants_2 = require("../../utils/constants");
const serialization_1 = require("../../utils/serialization");
const errors_1 = require("../../utils/errors");
/**
 * @ignore
 */
const bintools = bintools_1.default.getInstance();
const serialization = serialization_1.Serialization.getInstance();
/**
 * Class representing an unsigned Import transaction.
 */
class ImportTx extends basetx_1.BaseTx {
    serialize(encoding = "hex") {
        let fields = super.serialize(encoding);
        return Object.assign(Object.assign({}, fields), { sourceChain: serialization.encoder(this.sourceChain, encoding, "Buffer", "cb58"), importIns: this.importIns.map((i) => i.serialize(encoding)) });
    }
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        this.sourceChain = serialization.decoder(fields["sourceChain"], encoding, "cb58", "Buffer", 32);
        this.importIns = fields["importIns"].map((i) => {
            let ii = new inputs_1.TransferableInput();
            ii.deserialize(i, encoding);
            return ii;
        });
        this.numIns = buffer_1.Buffer.alloc(4);
        this.numIns.writeUInt32BE(this.importIns.length, 0);
    }
    /**
     * Returns the id of the [[ImportTx]]
     */
    getTxType() {
        return this._typeID;
    }
    /**
     * Takes a {@link https://github.com/feross/buffer|Buffer} containing an [[ImportTx]], parses it, populates the class, and returns the length of the [[ImportTx]] in bytes.
     *
     * @param bytes A {@link https://github.com/feross/buffer|Buffer} containing a raw [[ImportTx]]
     *
     * @returns The length of the raw [[ImportTx]]
     *
     * @remarks assume not-checksummed
     */
    fromBuffer(bytes, offset = 0) {
        offset = super.fromBuffer(bytes, offset);
        this.sourceChain = bintools.copyFrom(bytes, offset, offset + 32);
        offset += 32;
        this.numIns = bintools.copyFrom(bytes, offset, offset + 4);
        offset += 4;
        const numIns = this.numIns.readUInt32BE(0);
        for (let i = 0; i < numIns; i++) {
            const anIn = new inputs_1.TransferableInput();
            offset = anIn.fromBuffer(bytes, offset);
            this.importIns.push(anIn);
        }
        return offset;
    }
    /**
     * Returns a {@link https://github.com/feross/buffer|Buffer} representation of the [[ImportTx]].
     */
    toBuffer() {
        if (typeof this.sourceChain === "undefined") {
            throw new errors_1.ChainIdError("ImportTx.toBuffer -- this.sourceChain is undefined");
        }
        this.numIns.writeUInt32BE(this.importIns.length, 0);
        let barr = [super.toBuffer(), this.sourceChain, this.numIns];
        this.importIns = this.importIns.sort(inputs_1.TransferableInput.comparator());
        for (let i = 0; i < this.importIns.length; i++) {
            barr.push(this.importIns[`${i}`].toBuffer());
        }
        return buffer_1.Buffer.concat(barr);
    }
    /**
     * Returns an array of [[TransferableInput]]s in this transaction.
     */
    getImportInputs() {
        return this.importIns;
    }
    /**
     * Returns a {@link https://github.com/feross/buffer|Buffer} for the source chainid.
     */
    getSourceChain() {
        return this.sourceChain;
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
        for (let i = 0; i < this.importIns.length; i++) {
            const cred = (0, credentials_1.SelectCredentialClass)(this.importIns[`${i}`].getInput().getCredentialID());
            const sigidxs = this.importIns[`${i}`].getInput().getSigIdxs();
            for (let j = 0; j < sigidxs.length; j++) {
                const keypair = kc.getKey(sigidxs[`${j}`].getSource());
                const signval = keypair.sign(msg);
                const sig = new common_1.Signature();
                sig.fromBuffer(signval);
                cred.addSignature(sig);
            }
            creds.push(cred);
        }
        return creds;
    }
    clone() {
        let newbase = new ImportTx();
        newbase.fromBuffer(this.toBuffer());
        return newbase;
    }
    create(...args) {
        return new ImportTx(...args);
    }
    /**
     * Class representing an unsigned Import transaction.
     *
     * @param networkID Optional networkID, [[DefaultNetworkID]]
     * @param blockchainID Optional blockchainID, default Buffer.alloc(32, 16)
     * @param outs Optional array of the [[TransferableOutput]]s
     * @param ins Optional array of the [[TransferableInput]]s
     * @param memo Optional {@link https://github.com/feross/buffer|Buffer} for the memo field
     * @param sourceChain Optiona chainid for the source inputs to import. Default platform chainid.
     * @param importIns Array of [[TransferableInput]]s used in the transaction
     */
    constructor(networkID = constants_2.DefaultNetworkID, blockchainID = buffer_1.Buffer.alloc(32, 16), outs = undefined, ins = undefined, memo = undefined, sourceChain = undefined, importIns = undefined) {
        super(networkID, blockchainID, outs, ins, memo);
        this._typeName = "ImportTx";
        this._typeID = constants_1.PlatformVMConstants.IMPORTTX;
        this.sourceChain = buffer_1.Buffer.alloc(32);
        this.numIns = buffer_1.Buffer.alloc(4);
        this.importIns = [];
        this.sourceChain = sourceChain; // do no correct, if it's wrong it'll bomb on toBuffer
        if (typeof importIns !== "undefined" && Array.isArray(importIns)) {
            for (let i = 0; i < importIns.length; i++) {
                if (!(importIns[`${i}`] instanceof inputs_1.TransferableInput)) {
                    throw new errors_1.TransferableInputError("Error - ImportTx.constructor: invalid TransferableInput in array parameter 'importIns'");
                }
            }
            this.importIns = importIns;
        }
    }
}
exports.ImportTx = ImportTx;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1wb3J0dHguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYXBpcy9wbGF0Zm9ybXZtL2ltcG9ydHR4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBOzs7R0FHRztBQUNILG9DQUFnQztBQUNoQyxvRUFBMkM7QUFDM0MsMkNBQWlEO0FBRWpELHFDQUE0QztBQUU1QywrQ0FBcUQ7QUFDckQseUNBQTREO0FBQzVELHFDQUFpQztBQUNqQyxxREFBd0Q7QUFDeEQsNkRBQTZFO0FBQzdFLCtDQUF5RTtBQUV6RTs7R0FFRztBQUNILE1BQU0sUUFBUSxHQUFhLGtCQUFRLENBQUMsV0FBVyxFQUFFLENBQUE7QUFDakQsTUFBTSxhQUFhLEdBQWtCLDZCQUFhLENBQUMsV0FBVyxFQUFFLENBQUE7QUFFaEU7O0dBRUc7QUFDSCxNQUFhLFFBQVMsU0FBUSxlQUFNO0lBSWxDLFNBQVMsQ0FBQyxXQUErQixLQUFLO1FBQzVDLElBQUksTUFBTSxHQUFXLEtBQUssQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUE7UUFDOUMsdUNBQ0ssTUFBTSxLQUNULFdBQVcsRUFBRSxhQUFhLENBQUMsT0FBTyxDQUNoQyxJQUFJLENBQUMsV0FBVyxFQUNoQixRQUFRLEVBQ1IsUUFBUSxFQUNSLE1BQU0sQ0FDUCxFQUNELFNBQVMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUM1RDtJQUNILENBQUM7SUFDRCxXQUFXLENBQUMsTUFBYyxFQUFFLFdBQStCLEtBQUs7UUFDOUQsS0FBSyxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUE7UUFDbkMsSUFBSSxDQUFDLFdBQVcsR0FBRyxhQUFhLENBQUMsT0FBTyxDQUN0QyxNQUFNLENBQUMsYUFBYSxDQUFDLEVBQ3JCLFFBQVEsRUFDUixNQUFN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QUFDLEVBQUUsRUFBRTtnQkFDakQsSUFBSSxDQUFDLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsWUFBWSwwQkFBaUIsQ0FBQyxFQUFFO29CQUNyRCxNQUFNLElBQUksK0JBQXNCLENBQzlCLHdGQUF3RixDQUN6RixDQUFBO2lCQUNGO2FBQ0Y7WUFDRCxJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQTtTQUMzQjtJQUNILENBQUM7Q0FDRjtBQTNLRCw0QkEyS0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBwYWNrYWdlRG9jdW1lbnRhdGlvblxuICogQG1vZHVsZSBBUEktUGxhdGZvcm1WTS1JbXBvcnRUeFxuICovXG5pbXBvcnQgeyBCdWZmZXIgfSBmcm9tIFwiYnVmZmVyL1wiXG5pbXBvcnQgQmluVG9vbHMgZnJvbSBcIi4uLy4uL3V0aWxzL2JpbnRvb2xzXCJcbmltcG9ydCB7IFBsYXRmb3JtVk1Db25zdGFudHMgfSBmcm9tIFwiLi9jb25zdGFudHNcIlxuaW1wb3J0IHsgVHJhbnNmZXJhYmxlT3V0cHV0IH0gZnJvbSBcIi4vb3V0cHV0c1wiXG5pbXBvcnQgeyBUcmFuc2ZlcmFibGVJbnB1dCB9IGZyb20gXCIuL2lucHV0c1wiXG5pbXBvcnQgeyBLZXlDaGFpbiwgS2V5UGFpciB9IGZyb20gXCIuL2tleWNoYWluXCJcbmltcG9ydCB7IFNlbGVjdENyZWRlbnRpYWxDbGFzcyB9IGZyb20gXCIuL2NyZWRlbnRpYWxzXCJcbmltcG9ydCB7IFNpZ25hdHVyZSwgU2lnSWR4LCBDcmVkZW50aWFsIH0gZnJvbSBcIi4uLy4uL2NvbW1vblwiXG5pbXBvcnQgeyBCYXNlVHggfSBmcm9tIFwiLi9iYXNldHhcIlxuaW1wb3J0IHsgRGVmYXVsdE5ldHdvcmtJRCB9IGZyb20gXCIuLi8uLi91dGlscy9jb25zdGFudHNcIlxuaW1wb3J0IHsgU2VyaWFsaXphdGlvbiwgU2VyaWFsaXplZEVuY29kaW5nIH0gZnJvbSBcIi4uLy4uL3V0aWxzL3NlcmlhbGl6YXRpb25cIlxuaW1wb3J0IHsgQ2hhaW5JZEVycm9yLCBUcmFuc2ZlcmFibGVJbnB1dEVycm9yIH0gZnJvbSBcIi4uLy4uL3V0aWxzL2Vycm9yc1wiXG5cbi8qKlxuICogQGlnbm9yZVxuICovXG5jb25zdCBiaW50b29sczogQmluVG9vbHMgPSBCaW5Ub29scy5nZXRJbnN0YW5jZSgpXG5jb25zdCBzZXJpYWxpemF0aW9uOiBTZXJpYWxpemF0aW9uID0gU2VyaWFsaXphdGlvbi5nZXRJbnN0YW5jZSgpXG5cbi8qKlxuICogQ2xhc3MgcmVwcmVzZW50aW5nIGFuIHVuc2lnbmVkIEltcG9ydCB0cmFuc2FjdGlvbi5cbiAqL1xuZXhwb3J0IGNsYXNzIEltcG9ydFR4IGV4dGVuZHMgQmFzZVR4IHtcbiAgcHJvdGVjdGVkIF90eXBlTmFtZSA9IFwiSW1wb3J0VHhcIlxuICBwcm90ZWN0ZWQgX3R5cGVJRCA9IFBsYXRmb3JtVk1Db25zdGFudHMuSU1QT1JUVFhcblxuICBzZXJpYWxpemUoZW5jb2Rpbmc6IFNlcmlhbGl6ZWRFbmNvZGluZyA9IFwiaGV4XCIpOiBvYmplY3Qge1xuICAgIGxldCBmaWVsZHM6IG9iamVjdCA9IHN1cGVyLnNlcmlhbGl6ZShlbmNvZGluZylcbiAgICByZXR1cm4ge1xuICAgICAgLi4uZmllbGRzLFxuICAgICAgc291cmNlQ2hhaW46IHNlcmlhbGl6YXRpb24uZW5jb2RlcihcbiAgICAgICAgdGhpcy5zb3VyY2VDaGFpbixcbiAgICAgICAgZW5jb2RpbmcsXG4gICAgICAgIFwiQnVmZmVyXCIsXG4gICAgICAgIFwiY2I1OFwiXG4gICAgICApLFxuICAgICAgaW1wb3J0SW5zOiB0aGlzLmltcG9ydElucy5tYXAoKGkpID0+IGkuc2VyaWFsaXplKGVuY29kaW5nKSlcbiAgICB9XG4gIH1cbiAgZGVzZXJpYWxpemUoZmllbGRzOiBvYmplY3QsIGVuY29kaW5nOiBTZXJpYWxpemVkRW5jb2RpbmcgPSBcImhleFwiKSB7XG4gICAgc3VwZXIuZGVzZXJpYWxpemUoZmllbGRzLCBlbmNvZGluZylcbiAgICB0aGlzLnNvdXJjZUNoYWluID0gc2VyaWFsaXphdGlvbi5kZWNvZGVyKFxuICAgICAgZmllbGRzW1wic291cmNlQ2hhaW5cIl0sXG4gICAgICBlbmNvZGluZyxcbiAgICAgIFwiY2I1OFwiLFxuICAgICAgXCJCdWZmZXJcIixcbiAgICAgIDMyXG4gICAgKVxuICAgIHRoaXMuaW1wb3J0SW5zID0gZmllbGRzW1wiaW1wb3J0SW5zXCJdLm1hcCgoaTogb2JqZWN0KSA9PiB7XG4gICAgICBsZXQgaWk6IFRyYW5zZmVyYWJsZUlucHV0ID0gbmV3IFRyYW5zZmVyYWJsZUlucHV0KClcbiAgICAgIGlpLmRlc2VyaWFsaXplKGksIGVuY29kaW5nKVxuICAgICAgcmV0dXJuIGlpXG4gICAgfSlcbiAgICB0aGlzLm51bUlucyA9IEJ1ZmZlci5hbGxvYyg0KVxuICAgIHRoaXMubnVtSW5zLndyaXRlVUludDMyQkUodGhpcy5pbXBvcnRJbnMubGVuZ3RoLCAwKVxuICB9XG5cbiAgcHJvdGVjdGVkIHNvdXJjZUNoYWluOiBCdWZmZXIgPSBCdWZmZXIuYWxsb2MoMzIpXG4gIHByb3RlY3RlZCBudW1JbnM6IEJ1ZmZlciA9IEJ1ZmZlci5hbGxvYyg0KVxuICBwcm90ZWN0ZWQgaW1wb3J0SW5zOiBUcmFuc2ZlcmFibGVJbnB1dFtdID0gW11cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgaWQgb2YgdGhlIFtbSW1wb3J0VHhdXVxuICAgKi9cbiAgZ2V0VHhUeXBlKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX3R5cGVJRFxuICB9XG5cbiAgLyoqXG4gICAqIFRha2VzIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gY29udGFpbmluZyBhbiBbW0ltcG9ydFR4XV0sIHBhcnNlcyBpdCwgcG9wdWxhdGVzIHRoZSBjbGFzcywgYW5kIHJldHVybnMgdGhlIGxlbmd0aCBvZiB0aGUgW1tJbXBvcnRUeF1dIGluIGJ5dGVzLlxuICAgKlxuICAgKiBAcGFyYW0gYnl0ZXMgQSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBjb250YWluaW5nIGEgcmF3IFtbSW1wb3J0VHhdXVxuICAgKlxuICAgKiBAcmV0dXJucyBUaGUgbGVuZ3RoIG9mIHRoZSByYXcgW1tJbXBvcnRUeF1dXG4gICAqXG4gICAqIEByZW1hcmtzIGFzc3VtZSBub3QtY2hlY2tzdW1tZWRcbiAgICovXG4gIGZyb21CdWZmZXIoYnl0ZXM6IEJ1ZmZlciwgb2Zmc2V0OiBudW1iZXIgPSAwKTogbnVtYmVyIHtcbiAgICBvZmZzZXQgPSBzdXBlci5mcm9tQnVmZmVyKGJ5dGVzLCBvZmZzZXQpXG4gICAgdGhpcy5zb3VyY2VDaGFpbiA9IGJpbnRvb2xzLmNvcHlGcm9tKGJ5dGVzLCBvZmZzZXQsIG9mZnNldCArIDMyKVxuICAgIG9mZnNldCArPSAzMlxuICAgIHRoaXMubnVtSW5zID0gYmludG9vbHMuY29weUZyb20oYnl0ZXMsIG9mZnNldCwgb2Zmc2V0ICsgNClcbiAgICBvZmZzZXQgKz0gNFxuICAgIGNvbnN0IG51bUluczogbnVtYmVyID0gdGhpcy5udW1JbnMucmVhZFVJbnQzMkJFKDApXG4gICAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IG51bUluczsgaSsrKSB7XG4gICAgICBjb25zdCBhbkluOiBUcmFuc2ZlcmFibGVJbnB1dCA9IG5ldyBUcmFuc2ZlcmFibGVJbnB1dCgpXG4gICAgICBvZmZzZXQgPSBhbkluLmZyb21CdWZmZXIoYnl0ZXMsIG9mZnNldClcbiAgICAgIHRoaXMuaW1wb3J0SW5zLnB1c2goYW5JbilcbiAgICB9XG4gICAgcmV0dXJuIG9mZnNldFxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSByZXByZXNlbnRhdGlvbiBvZiB0aGUgW1tJbXBvcnRUeF1dLlxuICAgKi9cbiAgdG9CdWZmZXIoKTogQnVmZmVyIHtcbiAgICBpZiAodHlwZW9mIHRoaXMuc291cmNlQ2hhaW4gPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIHRocm93IG5ldyBDaGFpbklkRXJyb3IoXG4gICAgICAgIFwiSW1wb3J0VHgudG9CdWZmZXIgLS0gdGhpcy5zb3VyY2VDaGFpbiBpcyB1bmRlZmluZWRcIlxuICAgICAgKVxuICAgIH1cbiAgICB0aGlzLm51bUlucy53cml0ZVVJbnQzMkJFKHRoaXMuaW1wb3J0SW5zLmxlbmd0aCwgMClcbiAgICBsZXQgYmFycjogQnVmZmVyW10gPSBbc3VwZXIudG9CdWZmZXIoKSwgdGhpcy5zb3VyY2VDaGFpbiwgdGhpcy5udW1JbnNdXG4gICAgdGhpcy5pbXBvcnRJbnMgPSB0aGlzLmltcG9ydElucy5zb3J0KFRyYW5zZmVyYWJsZUlucHV0LmNvbXBhcmF0b3IoKSlcbiAgICBmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgdGhpcy5pbXBvcnRJbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGJhcnIucHVzaCh0aGlzLmltcG9ydEluc1tgJHtpfWBdLnRvQnVmZmVyKCkpXG4gICAgfVxuICAgIHJldHVybiBCdWZmZXIuY29uY2F0KGJhcnIpXG4gIH1cbiAgLyoqXG4gICAqIFJldHVybnMgYW4gYXJyYXkgb2YgW1tUcmFuc2ZlcmFibGVJbnB1dF1dcyBpbiB0aGlzIHRyYW5zYWN0aW9uLlxuICAgKi9cbiAgZ2V0SW1wb3J0SW5wdXRzKCk6IFRyYW5zZmVyYWJsZUlucHV0W10ge1xuICAgIHJldHVybiB0aGlzLmltcG9ydEluc1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBmb3IgdGhlIHNvdXJjZSBjaGFpbmlkLlxuICAgKi9cbiAgZ2V0U291cmNlQ2hhaW4oKTogQnVmZmVyIHtcbiAgICByZXR1cm4gdGhpcy5zb3VyY2VDaGFpblxuICB9XG5cbiAgLyoqXG4gICAqIFRha2VzIHRoZSBieXRlcyBvZiBhbiBbW1Vuc2lnbmVkVHhdXSBhbmQgcmV0dXJucyBhbiBhcnJheSBvZiBbW0NyZWRlbnRpYWxdXXNcbiAgICpcbiAgICogQHBhcmFtIG1zZyBBIEJ1ZmZlciBmb3IgdGhlIFtbVW5zaWduZWRUeF1dXG4gICAqIEBwYXJhbSBrYyBBbiBbW0tleUNoYWluXV0gdXNlZCBpbiBzaWduaW5nXG4gICAqXG4gICAqIEByZXR1cm5zIEFuIGFycmF5IG9mIFtbQ3JlZGVudGlhbF1dc1xuICAgKi9cbiAgc2lnbihtc2c6IEJ1ZmZlciwga2M6IEtleUNoYWluKTogQ3JlZGVudGlhbFtdIHtcbiAgICBjb25zdCBjcmVkczogQ3JlZGVudGlhbFtdID0gc3VwZXIuc2lnbihtc2csIGtjKVxuICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCB0aGlzLmltcG9ydElucy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgY3JlZDogQ3JlZGVudGlhbCA9IFNlbGVjdENyZWRlbnRpYWxDbGFzcyhcbiAgICAgICAgdGhpcy5pbXBvcnRJbnNbYCR7aX1gXS5nZXRJbnB1dCgpLmdldENyZWRlbnRpYWxJRCgpXG4gICAgICApXG4gICAgICBjb25zdCBzaWdpZHhzOiBTaWdJZHhbXSA9IHRoaXMuaW1wb3J0SW5zW2Ake2l9YF0uZ2V0SW5wdXQoKS5nZXRTaWdJZHhzKClcbiAgICAgIGZvciAobGV0IGo6IG51bWJlciA9IDA7IGogPCBzaWdpZHhzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgIGNvbnN0IGtleXBhaXI6IEtleVBhaXIgPSBrYy5nZXRLZXkoc2lnaWR4c1tgJHtqfWBdLmdldFNvdXJjZSgpKVxuICAgICAgICBjb25zdCBzaWdudmFsOiBCdWZmZXIgPSBrZXlwYWlyLnNpZ24obXNnKVxuICAgICAgICBjb25zdCBzaWc6IFNpZ25hdHVyZSA9IG5ldyBTaWduYXR1cmUoKVxuICAgICAgICBzaWcuZnJvbUJ1ZmZlcihzaWdudmFsKVxuICAgICAgICBjcmVkLmFkZFNpZ25hdHVyZShzaWcpXG4gICAgICB9XG4gICAgICBjcmVkcy5wdXNoKGNyZWQpXG4gICAgfVxuICAgIHJldHVybiBjcmVkc1xuICB9XG5cbiAgY2xvbmUoKTogdGhpcyB7XG4gICAgbGV0IG5ld2Jhc2U6IEltcG9ydFR4ID0gbmV3IEltcG9ydFR4KClcbiAgICBuZXdiYXNlLmZyb21CdWZmZXIodGhpcy50b0J1ZmZlcigpKVxuICAgIHJldHVybiBuZXdiYXNlIGFzIHRoaXNcbiAgfVxuXG4gIGNyZWF0ZSguLi5hcmdzOiBhbnlbXSk6IHRoaXMge1xuICAgIHJldHVybiBuZXcgSW1wb3J0VHgoLi4uYXJncykgYXMgdGhpc1xuICB9XG5cbiAgLyoqXG4gICAqIENsYXNzIHJlcHJlc2VudGluZyBhbiB1bnNpZ25lZCBJbXBvcnQgdHJhbnNhY3Rpb24uXG4gICAqXG4gICAqIEBwYXJhbSBuZXR3b3JrSUQgT3B0aW9uYWwgbmV0d29ya0lELCBbW0RlZmF1bHROZXR3b3JrSURdXVxuICAgKiBAcGFyYW0gYmxvY2tjaGFpbklEIE9wdGlvbmFsIGJsb2NrY2hhaW5JRCwgZGVmYXVsdCBCdWZmZXIuYWxsb2MoMzIsIDE2KVxuICAgKiBAcGFyYW0gb3V0cyBPcHRpb25hbCBhcnJheSBvZiB0aGUgW1tUcmFuc2ZlcmFibGVPdXRwdXRdXXNcbiAgICogQHBhcmFtIGlucyBPcHRpb25hbCBhcnJheSBvZiB0aGUgW1tUcmFuc2ZlcmFibGVJbnB1dF1dc1xuICAgKiBAcGFyYW0gbWVtbyBPcHRpb25hbCB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBmb3IgdGhlIG1lbW8gZmllbGRcbiAgICogQHBhcmFtIHNvdXJjZUNoYWluIE9wdGlvbmEgY2hhaW5pZCBmb3IgdGhlIHNvdXJjZSBpbnB1dHMgdG8gaW1wb3J0LiBEZWZhdWx0IHBsYXRmb3JtIGNoYWluaWQuXG4gICAqIEBwYXJhbSBpbXBvcnRJbnMgQXJyYXkgb2YgW1tUcmFuc2ZlcmFibGVJbnB1dF1dcyB1c2VkIGluIHRoZSB0cmFuc2FjdGlvblxuICAgKi9cbiAgY29uc3RydWN0b3IoXG4gICAgbmV0d29ya0lEOiBudW1iZXIgPSBEZWZhdWx0TmV0d29ya0lELFxuICAgIGJsb2NrY2hhaW5JRDogQnVmZmVyID0gQnVmZmVyLmFsbG9jKDMyLCAxNiksXG4gICAgb3V0czogVHJhbnNmZXJhYmxlT3V0cHV0W10gPSB1bmRlZmluZWQsXG4gICAgaW5zOiBUcmFuc2ZlcmFibGVJbnB1dFtdID0gdW5kZWZpbmVkLFxuICAgIG1lbW86IEJ1ZmZlciA9IHVuZGVmaW5lZCxcbiAgICBzb3VyY2VDaGFpbjogQnVmZmVyID0gdW5kZWZpbmVkLFxuICAgIGltcG9ydEluczogVHJhbnNmZXJhYmxlSW5wdXRbXSA9IHVuZGVmaW5lZFxuICApIHtcbiAgICBzdXBlcihuZXR3b3JrSUQsIGJsb2NrY2hhaW5JRCwgb3V0cywgaW5zLCBtZW1vKVxuICAgIHRoaXMuc291cmNlQ2hhaW4gPSBzb3VyY2VDaGFpbiAvLyBkbyBubyBjb3JyZWN0LCBpZiBpdCdzIHdyb25nIGl0J2xsIGJvbWIgb24gdG9CdWZmZXJcbiAgICBpZiAodHlwZW9mIGltcG9ydElucyAhPT0gXCJ1bmRlZmluZWRcIiAmJiBBcnJheS5pc0FycmF5KGltcG9ydElucykpIHtcbiAgICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCBpbXBvcnRJbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKCEoaW1wb3J0SW5zW2Ake2l9YF0gaW5zdGFuY2VvZiBUcmFuc2ZlcmFibGVJbnB1dCkpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgVHJhbnNmZXJhYmxlSW5wdXRFcnJvcihcbiAgICAgICAgICAgIFwiRXJyb3IgLSBJbXBvcnRUeC5jb25zdHJ1Y3RvcjogaW52YWxpZCBUcmFuc2ZlcmFibGVJbnB1dCBpbiBhcnJheSBwYXJhbWV0ZXIgJ2ltcG9ydElucydcIlxuICAgICAgICAgIClcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdGhpcy5pbXBvcnRJbnMgPSBpbXBvcnRJbnNcbiAgICB9XG4gIH1cbn1cbiJdfQ==
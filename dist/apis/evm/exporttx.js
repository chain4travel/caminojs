"use strict";
/**
 * @packageDocumentation
 * @module API-EVM-ExportTx
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportTx = void 0;
const buffer_1 = require("buffer/");
const bintools_1 = __importDefault(require("../../utils/bintools"));
const constants_1 = require("./constants");
const basetx_1 = require("./basetx");
const credentials_1 = require("./credentials");
const credentials_2 = require("../../common/credentials");
const inputs_1 = require("./inputs");
const serialization_1 = require("../../utils/serialization");
const outputs_1 = require("./outputs");
const errors_1 = require("../../utils/errors");
/**
 * @ignore
 */
const bintools = bintools_1.default.getInstance();
const serializer = serialization_1.Serialization.getInstance();
class ExportTx extends basetx_1.EVMBaseTx {
    /**
     * Class representing a ExportTx.
     *
     * @param networkID Optional networkID
     * @param blockchainID Optional blockchainID, default Buffer.alloc(32, 16)
     * @param destinationChain Optional destinationChain, default Buffer.alloc(32, 16)
     * @param inputs Optional array of the [[EVMInputs]]s
     * @param exportedOutputs Optional array of the [[EVMOutputs]]s
     */
    constructor(networkID = undefined, blockchainID = buffer_1.Buffer.alloc(32, 16), destinationChain = buffer_1.Buffer.alloc(32, 16), inputs = undefined, exportedOutputs = undefined) {
        super(networkID, blockchainID);
        this._typeName = "ExportTx";
        this._typeID = constants_1.EVMConstants.EXPORTTX;
        this.destinationChain = buffer_1.Buffer.alloc(32);
        this.numInputs = buffer_1.Buffer.alloc(4);
        this.inputs = [];
        this.numExportedOutputs = buffer_1.Buffer.alloc(4);
        this.exportedOutputs = [];
        this.destinationChain = destinationChain;
        if (typeof inputs !== "undefined" && Array.isArray(inputs)) {
            inputs.forEach((input) => {
                if (!(input instanceof inputs_1.EVMInput)) {
                    throw new errors_1.EVMInputError("Error - ExportTx.constructor: invalid EVMInput in array parameter 'inputs'");
                }
            });
            if (inputs.length > 1) {
                inputs = inputs.sort(inputs_1.EVMInput.comparator());
            }
            this.inputs = inputs;
        }
        if (typeof exportedOutputs !== "undefined" &&
            Array.isArray(exportedOutputs)) {
            exportedOutputs.forEach((exportedOutput) => {
                if (!(exportedOutput instanceof outputs_1.TransferableOutput)) {
                    throw new errors_1.TransferableOutputError("Error - ExportTx.constructor: TransferableOutput EVMInput in array parameter 'exportedOutputs'");
                }
            });
            this.exportedOutputs = exportedOutputs;
        }
    }
    serialize(encoding = "hex") {
        let fields = super.serialize(encoding);
        return Object.assign(Object.assign({}, fields), { destinationChain: serializer.encoder(this.destinationChain, encoding, "Buffer", "cb58"), exportedOutputs: this.exportedOutputs.map((i) => i.serialize(encoding)) });
    }
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        this.destinationChain = serializer.decoder(fields["destinationChain"], encoding, "cb58", "Buffer", 32);
        this.exportedOutputs = fields["exportedOutputs"].map((i) => {
            let eo = new outputs_1.TransferableOutput();
            eo.deserialize(i, encoding);
            return eo;
        });
        this.numExportedOutputs = buffer_1.Buffer.alloc(4);
        this.numExportedOutputs.writeUInt32BE(this.exportedOutputs.length, 0);
    }
    /**
     * Returns the destinationChain as a {@link https://github.com/feross/buffer|Buffer}
     */
    getDestinationChain() {
        return this.destinationChain;
    }
    /**
     * Returns the inputs as an array of [[EVMInputs]]
     */
    getInputs() {
        return this.inputs;
    }
    /**
     * Returns the outs as an array of [[EVMOutputs]]
     */
    getExportedOutputs() {
        return this.exportedOutputs;
    }
    /**
     * Returns a {@link https://github.com/feross/buffer|Buffer} representation of the [[ExportTx]].
     */
    toBuffer() {
        if (typeof this.destinationChain === "undefined") {
            throw new errors_1.ChainIdError("ExportTx.toBuffer -- this.destinationChain is undefined");
        }
        this.numInputs.writeUInt32BE(this.inputs.length, 0);
        this.numExportedOutputs.writeUInt32BE(this.exportedOutputs.length, 0);
        let barr = [
            super.toBuffer(),
            this.destinationChain,
            this.numInputs
        ];
        let bsize = super.toBuffer().length +
            this.destinationChain.length +
            this.numInputs.length;
        this.inputs.forEach((importIn) => {
            bsize += importIn.toBuffer().length;
            barr.push(importIn.toBuffer());
        });
        bsize += this.numExportedOutputs.length;
        barr.push(this.numExportedOutputs);
        this.exportedOutputs.forEach((out) => {
            bsize += out.toBuffer().length;
            barr.push(out.toBuffer());
        });
        return buffer_1.Buffer.concat(barr, bsize);
    }
    /**
     * Decodes the [[ExportTx]] as a {@link https://github.com/feross/buffer|Buffer} and returns the size.
     */
    fromBuffer(bytes, offset = 0) {
        offset = super.fromBuffer(bytes, offset);
        this.destinationChain = bintools.copyFrom(bytes, offset, offset + 32);
        offset += 32;
        this.numInputs = bintools.copyFrom(bytes, offset, offset + 4);
        offset += 4;
        const numInputs = this.numInputs.readUInt32BE(0);
        for (let i = 0; i < numInputs; i++) {
            const anIn = new inputs_1.EVMInput();
            offset = anIn.fromBuffer(bytes, offset);
            this.inputs.push(anIn);
        }
        this.numExportedOutputs = bintools.copyFrom(bytes, offset, offset + 4);
        offset += 4;
        const numExportedOutputs = this.numExportedOutputs.readUInt32BE(0);
        for (let i = 0; i < numExportedOutputs; i++) {
            const anOut = new outputs_1.TransferableOutput();
            offset = anOut.fromBuffer(bytes, offset);
            this.exportedOutputs.push(anOut);
        }
        return offset;
    }
    /**
     * Returns a base-58 representation of the [[ExportTx]].
     */
    toString() {
        return bintools.bufferToB58(this.toBuffer());
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
        this.inputs.forEach((input) => {
            const cred = (0, credentials_1.SelectCredentialClass)(input.getCredentialID());
            const sigidxs = input.getSigIdxs();
            sigidxs.forEach((sigidx) => {
                const keypair = kc.getKey(sigidx.getSource());
                const signval = keypair.sign(msg);
                const sig = new credentials_2.Signature();
                sig.fromBuffer(signval);
                cred.addSignature(sig);
            });
            creds.push(cred);
        });
        return creds;
    }
}
exports.ExportTx = ExportTx;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhwb3J0dHguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvYXBpcy9ldm0vZXhwb3J0dHgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7R0FHRzs7Ozs7O0FBRUgsb0NBQWdDO0FBQ2hDLG9FQUEyQztBQUMzQywyQ0FBMEM7QUFDMUMscUNBQW9DO0FBQ3BDLCtDQUFxRDtBQUNyRCwwREFBd0U7QUFFeEUscUNBQW1DO0FBQ25DLDZEQUE2RTtBQUM3RSx1Q0FBOEM7QUFDOUMsK0NBSTJCO0FBRTNCOztHQUVHO0FBQ0gsTUFBTSxRQUFRLEdBQWEsa0JBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtBQUNqRCxNQUFNLFVBQVUsR0FBa0IsNkJBQWEsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtBQUU3RCxNQUFhLFFBQVMsU0FBUSxrQkFBUztJQXlKckM7Ozs7Ozs7O09BUUc7SUFDSCxZQUNFLFlBQW9CLFNBQVMsRUFDN0IsZUFBdUIsZUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQzNDLG1CQUEyQixlQUFNLENBQUMsS0FBSyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFDL0MsU0FBcUIsU0FBUyxFQUM5QixrQkFBd0MsU0FBUztRQUVqRCxLQUFLLENBQUMsU0FBUyxFQUFFLFlBQVksQ0FBQyxDQUFBO1FBeEt0QixjQUFTLEdBQUcsVUFBVSxDQUFBO1FBQ3RCLFlBQU8sR0FBRyx3QkFBWSxDQUFDLFFBQVEsQ0FBQTtRQWlDL0IscUJBQWdCLEdBQVcsZUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUMzQyxjQUFTLEdBQVcsZUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNuQyxXQUFNLEdBQWUsRUFBRSxDQUFBO1FBQ3ZCLHVCQUFrQixHQUFXLGVBQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDNUMsb0JBQWUsR0FBeUIsRUFBRSxDQUFB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Q3pDLE1BQU0sR0FBRyxHQUFjLElBQUksdUJBQVMsRUFBRSxDQUFBO2dCQUN0QyxHQUFHLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFBO2dCQUN2QixJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1lBQ3hCLENBQUMsQ0FBQyxDQUFBO1lBQ0YsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUNsQixDQUFDLENBQUMsQ0FBQTtRQUNGLE9BQU8sS0FBSyxDQUFBO0lBQ2QsQ0FBQztDQStDRjtBQXRNRCw0QkFzTUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBwYWNrYWdlRG9jdW1lbnRhdGlvblxuICogQG1vZHVsZSBBUEktRVZNLUV4cG9ydFR4XG4gKi9cblxuaW1wb3J0IHsgQnVmZmVyIH0gZnJvbSBcImJ1ZmZlci9cIlxuaW1wb3J0IEJpblRvb2xzIGZyb20gXCIuLi8uLi91dGlscy9iaW50b29sc1wiXG5pbXBvcnQgeyBFVk1Db25zdGFudHMgfSBmcm9tIFwiLi9jb25zdGFudHNcIlxuaW1wb3J0IHsgRVZNQmFzZVR4IH0gZnJvbSBcIi4vYmFzZXR4XCJcbmltcG9ydCB7IFNlbGVjdENyZWRlbnRpYWxDbGFzcyB9IGZyb20gXCIuL2NyZWRlbnRpYWxzXCJcbmltcG9ydCB7IENyZWRlbnRpYWwsIFNpZ25hdHVyZSwgU2lnSWR4IH0gZnJvbSBcIi4uLy4uL2NvbW1vbi9jcmVkZW50aWFsc1wiXG5pbXBvcnQgeyBTaWduZXJLZXlDaGFpbiwgU2lnbmVyS2V5UGFpciB9IGZyb20gXCIuLi8uLi9jb21tb24va2V5Y2hhaW5cIlxuaW1wb3J0IHsgRVZNSW5wdXQgfSBmcm9tIFwiLi9pbnB1dHNcIlxuaW1wb3J0IHsgU2VyaWFsaXphdGlvbiwgU2VyaWFsaXplZEVuY29kaW5nIH0gZnJvbSBcIi4uLy4uL3V0aWxzL3NlcmlhbGl6YXRpb25cIlxuaW1wb3J0IHsgVHJhbnNmZXJhYmxlT3V0cHV0IH0gZnJvbSBcIi4vb3V0cHV0c1wiXG5pbXBvcnQge1xuICBDaGFpbklkRXJyb3IsXG4gIEVWTUlucHV0RXJyb3IsXG4gIFRyYW5zZmVyYWJsZU91dHB1dEVycm9yXG59IGZyb20gXCIuLi8uLi91dGlscy9lcnJvcnNcIlxuXG4vKipcbiAqIEBpZ25vcmVcbiAqL1xuY29uc3QgYmludG9vbHM6IEJpblRvb2xzID0gQmluVG9vbHMuZ2V0SW5zdGFuY2UoKVxuY29uc3Qgc2VyaWFsaXplcjogU2VyaWFsaXphdGlvbiA9IFNlcmlhbGl6YXRpb24uZ2V0SW5zdGFuY2UoKVxuXG5leHBvcnQgY2xhc3MgRXhwb3J0VHggZXh0ZW5kcyBFVk1CYXNlVHgge1xuICBwcm90ZWN0ZWQgX3R5cGVOYW1lID0gXCJFeHBvcnRUeFwiXG4gIHByb3RlY3RlZCBfdHlwZUlEID0gRVZNQ29uc3RhbnRzLkVYUE9SVFRYXG5cbiAgc2VyaWFsaXplKGVuY29kaW5nOiBTZXJpYWxpemVkRW5jb2RpbmcgPSBcImhleFwiKTogb2JqZWN0IHtcbiAgICBsZXQgZmllbGRzOiBvYmplY3QgPSBzdXBlci5zZXJpYWxpemUoZW5jb2RpbmcpXG4gICAgcmV0dXJuIHtcbiAgICAgIC4uLmZpZWxkcyxcbiAgICAgIGRlc3RpbmF0aW9uQ2hhaW46IHNlcmlhbGl6ZXIuZW5jb2RlcihcbiAgICAgICAgdGhpcy5kZXN0aW5hdGlvbkNoYWluLFxuICAgICAgICBlbmNvZGluZyxcbiAgICAgICAgXCJCdWZmZXJcIixcbiAgICAgICAgXCJjYjU4XCJcbiAgICAgICksXG4gICAgICBleHBvcnRlZE91dHB1dHM6IHRoaXMuZXhwb3J0ZWRPdXRwdXRzLm1hcCgoaSkgPT4gaS5zZXJpYWxpemUoZW5jb2RpbmcpKVxuICAgIH1cbiAgfVxuICBkZXNlcmlhbGl6ZShmaWVsZHM6IG9iamVjdCwgZW5jb2Rpbmc6IFNlcmlhbGl6ZWRFbmNvZGluZyA9IFwiaGV4XCIpIHtcbiAgICBzdXBlci5kZXNlcmlhbGl6ZShmaWVsZHMsIGVuY29kaW5nKVxuICAgIHRoaXMuZGVzdGluYXRpb25DaGFpbiA9IHNlcmlhbGl6ZXIuZGVjb2RlcihcbiAgICAgIGZpZWxkc1tcImRlc3RpbmF0aW9uQ2hhaW5cIl0sXG4gICAgICBlbmNvZGluZyxcbiAgICAgIFwiY2I1OFwiLFxuICAgICAgXCJCdWZmZXJcIixcbiAgICAgIDMyXG4gICAgKVxuICAgIHRoaXMuZXhwb3J0ZWRPdXRwdXRzID0gZmllbGRzW1wiZXhwb3J0ZWRPdXRwdXRzXCJdLm1hcCgoaTogb2JqZWN0KSA9PiB7XG4gICAgICBsZXQgZW86IFRyYW5zZmVyYWJsZU91dHB1dCA9IG5ldyBUcmFuc2ZlcmFibGVPdXRwdXQoKVxuICAgICAgZW8uZGVzZXJpYWxpemUoaSwgZW5jb2RpbmcpXG4gICAgICByZXR1cm4gZW9cbiAgICB9KVxuICAgIHRoaXMubnVtRXhwb3J0ZWRPdXRwdXRzID0gQnVmZmVyLmFsbG9jKDQpXG4gICAgdGhpcy5udW1FeHBvcnRlZE91dHB1dHMud3JpdGVVSW50MzJCRSh0aGlzLmV4cG9ydGVkT3V0cHV0cy5sZW5ndGgsIDApXG4gIH1cblxuICBwcm90ZWN0ZWQgZGVzdGluYXRpb25DaGFpbjogQnVmZmVyID0gQnVmZmVyLmFsbG9jKDMyKVxuICBwcm90ZWN0ZWQgbnVtSW5wdXRzOiBCdWZmZXIgPSBCdWZmZXIuYWxsb2MoNClcbiAgcHJvdGVjdGVkIGlucHV0czogRVZNSW5wdXRbXSA9IFtdXG4gIHByb3RlY3RlZCBudW1FeHBvcnRlZE91dHB1dHM6IEJ1ZmZlciA9IEJ1ZmZlci5hbGxvYyg0KVxuICBwcm90ZWN0ZWQgZXhwb3J0ZWRPdXRwdXRzOiBUcmFuc2ZlcmFibGVPdXRwdXRbXSA9IFtdXG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGRlc3RpbmF0aW9uQ2hhaW4gYXMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfVxuICAgKi9cbiAgZ2V0RGVzdGluYXRpb25DaGFpbigpOiBCdWZmZXIge1xuICAgIHJldHVybiB0aGlzLmRlc3RpbmF0aW9uQ2hhaW5cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBpbnB1dHMgYXMgYW4gYXJyYXkgb2YgW1tFVk1JbnB1dHNdXVxuICAgKi9cbiAgZ2V0SW5wdXRzKCk6IEVWTUlucHV0W10ge1xuICAgIHJldHVybiB0aGlzLmlucHV0c1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIG91dHMgYXMgYW4gYXJyYXkgb2YgW1tFVk1PdXRwdXRzXV1cbiAgICovXG4gIGdldEV4cG9ydGVkT3V0cHV0cygpOiBUcmFuc2ZlcmFibGVPdXRwdXRbXSB7XG4gICAgcmV0dXJuIHRoaXMuZXhwb3J0ZWRPdXRwdXRzXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IHJlcHJlc2VudGF0aW9uIG9mIHRoZSBbW0V4cG9ydFR4XV0uXG4gICAqL1xuICB0b0J1ZmZlcigpOiBCdWZmZXIge1xuICAgIGlmICh0eXBlb2YgdGhpcy5kZXN0aW5hdGlvbkNoYWluID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICB0aHJvdyBuZXcgQ2hhaW5JZEVycm9yKFxuICAgICAgICBcIkV4cG9ydFR4LnRvQnVmZmVyIC0tIHRoaXMuZGVzdGluYXRpb25DaGFpbiBpcyB1bmRlZmluZWRcIlxuICAgICAgKVxuICAgIH1cbiAgICB0aGlzLm51bUlucHV0cy53cml0ZVVJbnQzMkJFKHRoaXMuaW5wdXRzLmxlbmd0aCwgMClcbiAgICB0aGlzLm51bUV4cG9ydGVkT3V0cHV0cy53cml0ZVVJbnQzMkJFKHRoaXMuZXhwb3J0ZWRPdXRwdXRzLmxlbmd0aCwgMClcbiAgICBsZXQgYmFycjogQnVmZmVyW10gPSBbXG4gICAgICBzdXBlci50b0J1ZmZlcigpLFxuICAgICAgdGhpcy5kZXN0aW5hdGlvbkNoYWluLFxuICAgICAgdGhpcy5udW1JbnB1dHNcbiAgICBdXG4gICAgbGV0IGJzaXplOiBudW1iZXIgPVxuICAgICAgc3VwZXIudG9CdWZmZXIoKS5sZW5ndGggK1xuICAgICAgdGhpcy5kZXN0aW5hdGlvbkNoYWluLmxlbmd0aCArXG4gICAgICB0aGlzLm51bUlucHV0cy5sZW5ndGhcbiAgICB0aGlzLmlucHV0cy5mb3JFYWNoKChpbXBvcnRJbjogRVZNSW5wdXQpID0+IHtcbiAgICAgIGJzaXplICs9IGltcG9ydEluLnRvQnVmZmVyKCkubGVuZ3RoXG4gICAgICBiYXJyLnB1c2goaW1wb3J0SW4udG9CdWZmZXIoKSlcbiAgICB9KVxuICAgIGJzaXplICs9IHRoaXMubnVtRXhwb3J0ZWRPdXRwdXRzLmxlbmd0aFxuICAgIGJhcnIucHVzaCh0aGlzLm51bUV4cG9ydGVkT3V0cHV0cylcbiAgICB0aGlzLmV4cG9ydGVkT3V0cHV0cy5mb3JFYWNoKChvdXQ6IFRyYW5zZmVyYWJsZU91dHB1dCkgPT4ge1xuICAgICAgYnNpemUgKz0gb3V0LnRvQnVmZmVyKCkubGVuZ3RoXG4gICAgICBiYXJyLnB1c2gob3V0LnRvQnVmZmVyKCkpXG4gICAgfSlcbiAgICByZXR1cm4gQnVmZmVyLmNvbmNhdChiYXJyLCBic2l6ZSlcbiAgfVxuXG4gIC8qKlxuICAgKiBEZWNvZGVzIHRoZSBbW0V4cG9ydFR4XV0gYXMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBhbmQgcmV0dXJucyB0aGUgc2l6ZS5cbiAgICovXG4gIGZyb21CdWZmZXIoYnl0ZXM6IEJ1ZmZlciwgb2Zmc2V0OiBudW1iZXIgPSAwKTogbnVtYmVyIHtcbiAgICBvZmZzZXQgPSBzdXBlci5mcm9tQnVmZmVyKGJ5dGVzLCBvZmZzZXQpXG4gICAgdGhpcy5kZXN0aW5hdGlvbkNoYWluID0gYmludG9vbHMuY29weUZyb20oYnl0ZXMsIG9mZnNldCwgb2Zmc2V0ICsgMzIpXG4gICAgb2Zmc2V0ICs9IDMyXG4gICAgdGhpcy5udW1JbnB1dHMgPSBiaW50b29scy5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyA0KVxuICAgIG9mZnNldCArPSA0XG4gICAgY29uc3QgbnVtSW5wdXRzOiBudW1iZXIgPSB0aGlzLm51bUlucHV0cy5yZWFkVUludDMyQkUoMClcbiAgICBmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgbnVtSW5wdXRzOyBpKyspIHtcbiAgICAgIGNvbnN0IGFuSW46IEVWTUlucHV0ID0gbmV3IEVWTUlucHV0KClcbiAgICAgIG9mZnNldCA9IGFuSW4uZnJvbUJ1ZmZlcihieXRlcywgb2Zmc2V0KVxuICAgICAgdGhpcy5pbnB1dHMucHVzaChhbkluKVxuICAgIH1cbiAgICB0aGlzLm51bUV4cG9ydGVkT3V0cHV0cyA9IGJpbnRvb2xzLmNvcHlGcm9tKGJ5dGVzLCBvZmZzZXQsIG9mZnNldCArIDQpXG4gICAgb2Zmc2V0ICs9IDRcbiAgICBjb25zdCBudW1FeHBvcnRlZE91dHB1dHM6IG51bWJlciA9IHRoaXMubnVtRXhwb3J0ZWRPdXRwdXRzLnJlYWRVSW50MzJCRSgwKVxuICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCBudW1FeHBvcnRlZE91dHB1dHM7IGkrKykge1xuICAgICAgY29uc3QgYW5PdXQ6IFRyYW5zZmVyYWJsZU91dHB1dCA9IG5ldyBUcmFuc2ZlcmFibGVPdXRwdXQoKVxuICAgICAgb2Zmc2V0ID0gYW5PdXQuZnJvbUJ1ZmZlcihieXRlcywgb2Zmc2V0KVxuICAgICAgdGhpcy5leHBvcnRlZE91dHB1dHMucHVzaChhbk91dClcbiAgICB9XG4gICAgcmV0dXJuIG9mZnNldFxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBiYXNlLTU4IHJlcHJlc2VudGF0aW9uIG9mIHRoZSBbW0V4cG9ydFR4XV0uXG4gICAqL1xuICB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgIHJldHVybiBiaW50b29scy5idWZmZXJUb0I1OCh0aGlzLnRvQnVmZmVyKCkpXG4gIH1cblxuICAvKipcbiAgICogVGFrZXMgdGhlIGJ5dGVzIG9mIGFuIFtbVW5zaWduZWRUeF1dIGFuZCByZXR1cm5zIGFuIGFycmF5IG9mIFtbQ3JlZGVudGlhbF1dc1xuICAgKlxuICAgKiBAcGFyYW0gbXNnIEEgQnVmZmVyIGZvciB0aGUgW1tVbnNpZ25lZFR4XV1cbiAgICogQHBhcmFtIGtjIEFuIFtbS2V5Q2hhaW5dXSB1c2VkIGluIHNpZ25pbmdcbiAgICpcbiAgICogQHJldHVybnMgQW4gYXJyYXkgb2YgW1tDcmVkZW50aWFsXV1zXG4gICAqL1xuICBzaWduKG1zZzogQnVmZmVyLCBrYzogU2lnbmVyS2V5Q2hhaW4pOiBDcmVkZW50aWFsW10ge1xuICAgIGNvbnN0IGNyZWRzOiBDcmVkZW50aWFsW10gPSBzdXBlci5zaWduKG1zZywga2MpXG4gICAgdGhpcy5pbnB1dHMuZm9yRWFjaCgoaW5wdXQ6IEVWTUlucHV0KSA9PiB7XG4gICAgICBjb25zdCBjcmVkOiBDcmVkZW50aWFsID0gU2VsZWN0Q3JlZGVudGlhbENsYXNzKGlucHV0LmdldENyZWRlbnRpYWxJRCgpKVxuICAgICAgY29uc3Qgc2lnaWR4czogU2lnSWR4W10gPSBpbnB1dC5nZXRTaWdJZHhzKClcbiAgICAgIHNpZ2lkeHMuZm9yRWFjaCgoc2lnaWR4OiBTaWdJZHgpID0+IHtcbiAgICAgICAgY29uc3Qga2V5cGFpcjogU2lnbmVyS2V5UGFpciA9IGtjLmdldEtleShzaWdpZHguZ2V0U291cmNlKCkpXG4gICAgICAgIGNvbnN0IHNpZ252YWw6IEJ1ZmZlciA9IGtleXBhaXIuc2lnbihtc2cpXG4gICAgICAgIGNvbnN0IHNpZzogU2lnbmF0dXJlID0gbmV3IFNpZ25hdHVyZSgpXG4gICAgICAgIHNpZy5mcm9tQnVmZmVyKHNpZ252YWwpXG4gICAgICAgIGNyZWQuYWRkU2lnbmF0dXJlKHNpZylcbiAgICAgIH0pXG4gICAgICBjcmVkcy5wdXNoKGNyZWQpXG4gICAgfSlcbiAgICByZXR1cm4gY3JlZHNcbiAgfVxuXG4gIC8qKlxuICAgKiBDbGFzcyByZXByZXNlbnRpbmcgYSBFeHBvcnRUeC5cbiAgICpcbiAgICogQHBhcmFtIG5ldHdvcmtJRCBPcHRpb25hbCBuZXR3b3JrSURcbiAgICogQHBhcmFtIGJsb2NrY2hhaW5JRCBPcHRpb25hbCBibG9ja2NoYWluSUQsIGRlZmF1bHQgQnVmZmVyLmFsbG9jKDMyLCAxNilcbiAgICogQHBhcmFtIGRlc3RpbmF0aW9uQ2hhaW4gT3B0aW9uYWwgZGVzdGluYXRpb25DaGFpbiwgZGVmYXVsdCBCdWZmZXIuYWxsb2MoMzIsIDE2KVxuICAgKiBAcGFyYW0gaW5wdXRzIE9wdGlvbmFsIGFycmF5IG9mIHRoZSBbW0VWTUlucHV0c11dc1xuICAgKiBAcGFyYW0gZXhwb3J0ZWRPdXRwdXRzIE9wdGlvbmFsIGFycmF5IG9mIHRoZSBbW0VWTU91dHB1dHNdXXNcbiAgICovXG4gIGNvbnN0cnVjdG9yKFxuICAgIG5ldHdvcmtJRDogbnVtYmVyID0gdW5kZWZpbmVkLFxuICAgIGJsb2NrY2hhaW5JRDogQnVmZmVyID0gQnVmZmVyLmFsbG9jKDMyLCAxNiksXG4gICAgZGVzdGluYXRpb25DaGFpbjogQnVmZmVyID0gQnVmZmVyLmFsbG9jKDMyLCAxNiksXG4gICAgaW5wdXRzOiBFVk1JbnB1dFtdID0gdW5kZWZpbmVkLFxuICAgIGV4cG9ydGVkT3V0cHV0czogVHJhbnNmZXJhYmxlT3V0cHV0W10gPSB1bmRlZmluZWRcbiAgKSB7XG4gICAgc3VwZXIobmV0d29ya0lELCBibG9ja2NoYWluSUQpXG4gICAgdGhpcy5kZXN0aW5hdGlvbkNoYWluID0gZGVzdGluYXRpb25DaGFpblxuICAgIGlmICh0eXBlb2YgaW5wdXRzICE9PSBcInVuZGVmaW5lZFwiICYmIEFycmF5LmlzQXJyYXkoaW5wdXRzKSkge1xuICAgICAgaW5wdXRzLmZvckVhY2goKGlucHV0OiBFVk1JbnB1dCkgPT4ge1xuICAgICAgICBpZiAoIShpbnB1dCBpbnN0YW5jZW9mIEVWTUlucHV0KSkge1xuICAgICAgICAgIHRocm93IG5ldyBFVk1JbnB1dEVycm9yKFxuICAgICAgICAgICAgXCJFcnJvciAtIEV4cG9ydFR4LmNvbnN0cnVjdG9yOiBpbnZhbGlkIEVWTUlucHV0IGluIGFycmF5IHBhcmFtZXRlciAnaW5wdXRzJ1wiXG4gICAgICAgICAgKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgaWYgKGlucHV0cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGlucHV0cyA9IGlucHV0cy5zb3J0KEVWTUlucHV0LmNvbXBhcmF0b3IoKSlcbiAgICAgIH1cbiAgICAgIHRoaXMuaW5wdXRzID0gaW5wdXRzXG4gICAgfVxuICAgIGlmIChcbiAgICAgIHR5cGVvZiBleHBvcnRlZE91dHB1dHMgIT09IFwidW5kZWZpbmVkXCIgJiZcbiAgICAgIEFycmF5LmlzQXJyYXkoZXhwb3J0ZWRPdXRwdXRzKVxuICAgICkge1xuICAgICAgZXhwb3J0ZWRPdXRwdXRzLmZvckVhY2goKGV4cG9ydGVkT3V0cHV0OiBUcmFuc2ZlcmFibGVPdXRwdXQpID0+IHtcbiAgICAgICAgaWYgKCEoZXhwb3J0ZWRPdXRwdXQgaW5zdGFuY2VvZiBUcmFuc2ZlcmFibGVPdXRwdXQpKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFRyYW5zZmVyYWJsZU91dHB1dEVycm9yKFxuICAgICAgICAgICAgXCJFcnJvciAtIEV4cG9ydFR4LmNvbnN0cnVjdG9yOiBUcmFuc2ZlcmFibGVPdXRwdXQgRVZNSW5wdXQgaW4gYXJyYXkgcGFyYW1ldGVyICdleHBvcnRlZE91dHB1dHMnXCJcbiAgICAgICAgICApXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICB0aGlzLmV4cG9ydGVkT3V0cHV0cyA9IGV4cG9ydGVkT3V0cHV0c1xuICAgIH1cbiAgfVxufVxuIl19
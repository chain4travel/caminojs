"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Vertex = void 0;
/**
 * @packageDocumentation
 * @module API-AVM-Vertex
 */
const buffer_1 = require("buffer/");
const bintools_1 = __importDefault(require("../../utils/bintools"));
const constants_1 = require("./constants");
const tx_1 = require("./tx");
const utils_1 = require("../../utils");
const bn_js_1 = __importDefault(require("bn.js"));
/**
 * @ignore
 */
const bintools = bintools_1.default.getInstance();
/**
 * Class representing a Vertex
 */
class Vertex extends utils_1.Serializable {
    /**
     * Class representing a Vertex which is a container for AVM Transactions.
     *
     * @param networkID Optional, [[DefaultNetworkID]]
     * @param blockchainID Optional, default "2oYMBNV4eNHyqk2fjjV5nVQLDbtmNJzq5s3qs3Lo6ftnC6FByM"
     * @param height Optional, default new BN(0)
     * @param epoch Optional, default new BN(0)
     * @param parentIDs Optional, default []
     * @param txs Optional, default []
     * @param restrictions Optional, default []
     */
    constructor(networkID = utils_1.DefaultNetworkID, blockchainID = "2oYMBNV4eNHyqk2fjjV5nVQLDbtmNJzq5s3qs3Lo6ftnC6FByM", height = new bn_js_1.default(0), epoch = 0, parentIDs = [], txs = [], restrictions = []) {
        super();
        this._typeName = "Vertex";
        this._codecID = constants_1.AVMConstants.LATESTCODEC;
        this.networkID = networkID;
        this.blockchainID = bintools.cb58Decode(blockchainID);
        this.height = height;
        this.epoch = epoch;
        this.parentIDs = parentIDs;
        this.numParentIDs = parentIDs.length;
        this.txs = txs;
        this.numTxs = txs.length;
        this.restrictions = restrictions;
        this.numRestrictions = restrictions.length;
    }
    /**
     * Returns the NetworkID as a number
     */
    getNetworkID() {
        return this.networkID;
    }
    /**
     * Returns the BlockchainID as a CB58 string
     */
    getBlockchainID() {
        return bintools.cb58Encode(this.blockchainID);
    }
    /**
     * Returns the Height as a {@link https://github.com/indutny/bn.js/|BN}.
     */
    getHeight() {
        return this.height;
    }
    /**
     * Returns the Epoch as a number.
     */
    getEpoch() {
        return this.epoch;
    }
    /**
     * @returns An array of Buffers
     */
    getParentIDs() {
        return this.parentIDs;
    }
    /**
     * Returns array of UnsignedTxs.
     */
    getTxs() {
        return this.txs;
    }
    /**
     * @returns An array of Buffers
     */
    getRestrictions() {
        return this.restrictions;
    }
    /**
     * Set the codecID
     *
     * @param codecID The codecID to set
     */
    setCodecID(codecID) {
        if (codecID !== 0 && codecID !== 1) {
            /* istanbul ignore next */
            throw new utils_1.CodecIdError("Error - Vertex.setCodecID: invalid codecID. Valid codecIDs are 0 and 1.");
        }
        this._codecID = codecID;
        this._typeID =
            this._codecID === 0 ? constants_1.AVMConstants.VERTEX : constants_1.AVMConstants.VERTEX_CODECONE;
    }
    /**
     * Takes a {@link https://github.com/feross/buffer|Buffer} containing an [[Vertex]], parses it, populates the class, and returns the length of the Vertex in bytes.
     *
     * @param bytes A {@link https://github.com/feross/buffer|Buffer} containing a raw [[Vertex]]
     *
     * @returns The length of the raw [[Vertex]]
     *
     * @remarks assume not-checksummed
     */
    fromBuffer(bytes, offset = 0) {
        offset += 2;
        this.blockchainID = bintools.copyFrom(bytes, offset, offset + 32);
        offset += 32;
        const h = bintools.copyFrom(bytes, offset, offset + 8);
        this.height = bintools.fromBufferToBN(h);
        offset += 8;
        const e = bintools.copyFrom(bytes, offset, offset + 4);
        this.epoch = e.readInt32BE(0);
        offset += 4;
        const nPIDs = bintools.copyFrom(bytes, offset, offset + 4);
        this.numParentIDs = nPIDs.readInt32BE(0);
        offset += 4;
        for (let i = 0; i < this.numParentIDs; i++) {
            const parentID = bintools.copyFrom(bytes, offset, offset + 32);
            offset += 32;
            this.parentIDs.push(parentID);
        }
        const nTxs = bintools.copyFrom(bytes, offset, offset + 4);
        this.numTxs = nTxs.readInt32BE(0);
        // account for tx-size bytes
        offset += 8;
        for (let i = 0; i < this.numTxs; i++) {
            const tx = new tx_1.Tx();
            offset += tx.fromBuffer(bintools.copyFrom(bytes, offset));
            this.txs.push(tx);
        }
        if (bytes.byteLength > offset && bytes.byteLength - offset > 4) {
            const nRs = bintools.copyFrom(bytes, offset, offset + 4);
            this.numRestrictions = nRs.readInt32BE(0);
            offset += 4;
            for (let i = 0; i < this.numRestrictions; i++) {
                const tx = bintools.copyFrom(bytes, offset, offset + 32);
                offset += 32;
                this.restrictions.push(tx);
            }
        }
        return offset;
    }
    /**
     * Returns a {@link https://github.com/feross/buffer|Buffer} representation of the [[Vertex]].
     */
    toBuffer() {
        const codec = this.getCodecID();
        const codecBuf = buffer_1.Buffer.alloc(2);
        codecBuf.writeUInt16BE(codec, 0);
        const epochBuf = buffer_1.Buffer.alloc(4);
        epochBuf.writeInt32BE(this.epoch, 0);
        const numParentIDsBuf = buffer_1.Buffer.alloc(4);
        numParentIDsBuf.writeInt32BE(this.numParentIDs, 0);
        let barr = [
            codecBuf,
            this.blockchainID,
            bintools.fromBNToBuffer(this.height, 8),
            epochBuf,
            numParentIDsBuf
        ];
        this.parentIDs.forEach((parentID) => {
            barr.push(parentID);
        });
        const txs = this.getTxs();
        const numTxs = buffer_1.Buffer.alloc(4);
        numTxs.writeUInt32BE(txs.length, 0);
        barr.push(numTxs);
        let size = 0;
        const txSize = buffer_1.Buffer.alloc(4);
        txs.forEach((tx) => {
            const b = tx.toBuffer();
            size += b.byteLength;
        });
        txSize.writeUInt32BE(size, 0);
        barr.push(txSize);
        txs.forEach((tx) => {
            const b = tx.toBuffer();
            barr.push(b);
        });
        return buffer_1.Buffer.concat(barr);
    }
    clone() {
        let vertex = new Vertex();
        vertex.fromBuffer(this.toBuffer());
        return vertex;
    }
}
exports.Vertex = Vertex;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmVydGV4LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2FwaXMvYXZtL3ZlcnRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTs7O0dBR0c7QUFDSCxvQ0FBZ0M7QUFDaEMsb0VBQTJDO0FBQzNDLDJDQUEwQztBQUMxQyw2QkFBeUI7QUFDekIsdUNBQTBFO0FBQzFFLGtEQUFzQjtBQUV0Qjs7R0FFRztBQUNILE1BQU0sUUFBUSxHQUFhLGtCQUFRLENBQUMsV0FBVyxFQUFFLENBQUE7QUFFakQ7O0dBRUc7QUFDSCxNQUFhLE1BQU8sU0FBUSxvQkFBWTtJQTZMdEM7Ozs7Ozs7Ozs7T0FVRztJQUNILFlBQ0UsWUFBb0Isd0JBQWdCLEVBQ3BDLGVBQXVCLG9EQUFvRCxFQUMzRSxTQUFhLElBQUksZUFBRSxDQUFDLENBQUMsQ0FBQyxFQUN0QixRQUFnQixDQUFDLEVBQ2pCLFlBQXNCLEVBQUUsRUFDeEIsTUFBWSxFQUFFLEVBQ2QsZUFBeUIsRUFBRTtRQUUzQixLQUFLLEVBQUUsQ0FBQTtRQWhOQyxjQUFTLEdBQUcsUUFBUSxDQUFBO1FBQ3BCLGFBQVEsR0FBRyx3QkFBWSxDQUFDLFdBQVcsQ0FBQTtRQWdOM0MsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUE7UUFDMUIsSUFBSSxDQUFDLFlBQVksR0FBRyxRQUFRLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxDQUFBO1FBQ3JELElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFBO1FBQ3BCLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFBO1FBQ2xCLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFBO1FBQzFCLElBQUksQ0FBQyxZQUFZLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQTtRQUNwQyxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUNkLElBQUksQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQTtRQUN4QixJ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RyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQTtRQUNuQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFBO1FBRWpCLElBQUksSUFBSSxHQUFXLENBQUMsQ0FBQTtRQUNwQixNQUFNLE1BQU0sR0FBVyxlQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3RDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFNLEVBQVEsRUFBRTtZQUMzQixNQUFNLENBQUMsR0FBVyxFQUFFLENBQUMsUUFBUSxFQUFFLENBQUE7WUFDL0IsSUFBSSxJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUE7UUFDdEIsQ0FBQyxDQUFDLENBQUE7UUFDRixNQUFNLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQTtRQUM3QixJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFBO1FBRWpCLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFNLEVBQVEsRUFBRTtZQUMzQixNQUFNLENBQUMsR0FBVyxFQUFFLENBQUMsUUFBUSxFQUFFLENBQUE7WUFDL0IsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNkLENBQUMsQ0FBQyxDQUFBO1FBRUYsT0FBTyxlQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQzVCLENBQUM7SUFFRCxLQUFLO1FBQ0gsSUFBSSxNQUFNLEdBQVcsSUFBSSxNQUFNLEVBQUUsQ0FBQTtRQUNqQyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFBO1FBQ2xDLE9BQU8sTUFBYyxDQUFBO0lBQ3ZCLENBQUM7Q0FpQ0Y7QUE3TkQsd0JBNk5DIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAcGFja2FnZURvY3VtZW50YXRpb25cbiAqIEBtb2R1bGUgQVBJLUFWTS1WZXJ0ZXhcbiAqL1xuaW1wb3J0IHsgQnVmZmVyIH0gZnJvbSBcImJ1ZmZlci9cIlxuaW1wb3J0IEJpblRvb2xzIGZyb20gXCIuLi8uLi91dGlscy9iaW50b29sc1wiXG5pbXBvcnQgeyBBVk1Db25zdGFudHMgfSBmcm9tIFwiLi9jb25zdGFudHNcIlxuaW1wb3J0IHsgVHggfSBmcm9tIFwiLi90eFwiXG5pbXBvcnQgeyBTZXJpYWxpemFibGUsIENvZGVjSWRFcnJvciwgRGVmYXVsdE5ldHdvcmtJRCB9IGZyb20gXCIuLi8uLi91dGlsc1wiXG5pbXBvcnQgQk4gZnJvbSBcImJuLmpzXCJcblxuLyoqXG4gKiBAaWdub3JlXG4gKi9cbmNvbnN0IGJpbnRvb2xzOiBCaW5Ub29scyA9IEJpblRvb2xzLmdldEluc3RhbmNlKClcblxuLyoqXG4gKiBDbGFzcyByZXByZXNlbnRpbmcgYSBWZXJ0ZXhcbiAqL1xuZXhwb3J0IGNsYXNzIFZlcnRleCBleHRlbmRzIFNlcmlhbGl6YWJsZSB7XG4gIHByb3RlY3RlZCBfdHlwZU5hbWUgPSBcIlZlcnRleFwiXG4gIHByb3RlY3RlZCBfY29kZWNJRCA9IEFWTUNvbnN0YW50cy5MQVRFU1RDT0RFQ1xuICAvLyBzZXJpYWxpemUgaXMgaW5oZXJpdGVkXG4gIC8vIGRlc2VyaWFsaXplIGlzIGluaGVyaXRlZFxuICBwcm90ZWN0ZWQgbmV0d29ya0lEOiBudW1iZXJcbiAgcHJvdGVjdGVkIGJsb2NrY2hhaW5JRDogQnVmZmVyXG4gIHByb3RlY3RlZCBoZWlnaHQ6IEJOXG4gIHByb3RlY3RlZCBlcG9jaDogbnVtYmVyXG4gIHByb3RlY3RlZCBwYXJlbnRJRHM6IEJ1ZmZlcltdXG4gIHByb3RlY3RlZCBudW1QYXJlbnRJRHM6IG51bWJlclxuICBwcm90ZWN0ZWQgdHhzOiBUeFtdXG4gIHByb3RlY3RlZCBudW1UeHM6IG51bWJlclxuICBwcm90ZWN0ZWQgcmVzdHJpY3Rpb25zOiBCdWZmZXJbXVxuICBwcm90ZWN0ZWQgbnVtUmVzdHJpY3Rpb25zOiBudW1iZXJcblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgTmV0d29ya0lEIGFzIGEgbnVtYmVyXG4gICAqL1xuICBnZXROZXR3b3JrSUQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5uZXR3b3JrSURcbiAgfVxuICAvKipcbiAgICogUmV0dXJucyB0aGUgQmxvY2tjaGFpbklEIGFzIGEgQ0I1OCBzdHJpbmdcbiAgICovXG4gIGdldEJsb2NrY2hhaW5JRCgpOiBzdHJpbmcge1xuICAgIHJldHVybiBiaW50b29scy5jYjU4RW5jb2RlKHRoaXMuYmxvY2tjaGFpbklEKVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIEhlaWdodCBhcyBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vaW5kdXRueS9ibi5qcy98Qk59LlxuICAgKi9cbiAgZ2V0SGVpZ2h0KCk6IEJOIHtcbiAgICByZXR1cm4gdGhpcy5oZWlnaHRcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBFcG9jaCBhcyBhIG51bWJlci5cbiAgICovXG4gIGdldEVwb2NoKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuZXBvY2hcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJucyBBbiBhcnJheSBvZiBCdWZmZXJzXG4gICAqL1xuICBnZXRQYXJlbnRJRHMoKTogQnVmZmVyW10ge1xuICAgIHJldHVybiB0aGlzLnBhcmVudElEc1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYXJyYXkgb2YgVW5zaWduZWRUeHMuXG4gICAqL1xuICBnZXRUeHMoKTogVHhbXSB7XG4gICAgcmV0dXJuIHRoaXMudHhzXG4gIH1cblxuICAvKipcbiAgICogQHJldHVybnMgQW4gYXJyYXkgb2YgQnVmZmVyc1xuICAgKi9cbiAgZ2V0UmVzdHJpY3Rpb25zKCk6IEJ1ZmZlcltdIHtcbiAgICByZXR1cm4gdGhpcy5yZXN0cmljdGlvbnNcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgdGhlIGNvZGVjSURcbiAgICpcbiAgICogQHBhcmFtIGNvZGVjSUQgVGhlIGNvZGVjSUQgdG8gc2V0XG4gICAqL1xuICBzZXRDb2RlY0lEKGNvZGVjSUQ6IG51bWJlcik6IHZvaWQge1xuICAgIGlmIChjb2RlY0lEICE9PSAwICYmIGNvZGVjSUQgIT09IDEpIHtcbiAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICB0aHJvdyBuZXcgQ29kZWNJZEVycm9yKFxuICAgICAgICBcIkVycm9yIC0gVmVydGV4LnNldENvZGVjSUQ6IGludmFsaWQgY29kZWNJRC4gVmFsaWQgY29kZWNJRHMgYXJlIDAgYW5kIDEuXCJcbiAgICAgIClcbiAgICB9XG4gICAgdGhpcy5fY29kZWNJRCA9IGNvZGVjSURcbiAgICB0aGlzLl90eXBlSUQgPVxuICAgICAgdGhpcy5fY29kZWNJRCA9PT0gMCA/IEFWTUNvbnN0YW50cy5WRVJURVggOiBBVk1Db25zdGFudHMuVkVSVEVYX0NPREVDT05FXG4gIH1cblxuICAvKipcbiAgICogVGFrZXMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBjb250YWluaW5nIGFuIFtbVmVydGV4XV0sIHBhcnNlcyBpdCwgcG9wdWxhdGVzIHRoZSBjbGFzcywgYW5kIHJldHVybnMgdGhlIGxlbmd0aCBvZiB0aGUgVmVydGV4IGluIGJ5dGVzLlxuICAgKlxuICAgKiBAcGFyYW0gYnl0ZXMgQSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBjb250YWluaW5nIGEgcmF3IFtbVmVydGV4XV1cbiAgICpcbiAgICogQHJldHVybnMgVGhlIGxlbmd0aCBvZiB0aGUgcmF3IFtbVmVydGV4XV1cbiAgICpcbiAgICogQHJlbWFya3MgYXNzdW1lIG5vdC1jaGVja3N1bW1lZFxuICAgKi9cbiAgZnJvbUJ1ZmZlcihieXRlczogQnVmZmVyLCBvZmZzZXQ6IG51bWJlciA9IDApOiBudW1iZXIge1xuICAgIG9mZnNldCArPSAyXG4gICAgdGhpcy5ibG9ja2NoYWluSUQgPSBiaW50b29scy5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyAzMilcbiAgICBvZmZzZXQgKz0gMzJcblxuICAgIGNvbnN0IGg6IEJ1ZmZlciA9IGJpbnRvb2xzLmNvcHlGcm9tKGJ5dGVzLCBvZmZzZXQsIG9mZnNldCArIDgpXG4gICAgdGhpcy5oZWlnaHQgPSBiaW50b29scy5mcm9tQnVmZmVyVG9CTihoKVxuICAgIG9mZnNldCArPSA4XG5cbiAgICBjb25zdCBlOiBCdWZmZXIgPSBiaW50b29scy5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyA0KVxuICAgIHRoaXMuZXBvY2ggPSBlLnJlYWRJbnQzMkJFKDApXG4gICAgb2Zmc2V0ICs9IDRcblxuICAgIGNvbnN0IG5QSURzOiBCdWZmZXIgPSBiaW50b29scy5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyA0KVxuICAgIHRoaXMubnVtUGFyZW50SURzID0gblBJRHMucmVhZEludDMyQkUoMClcbiAgICBvZmZzZXQgKz0gNFxuXG4gICAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IHRoaXMubnVtUGFyZW50SURzOyBpKyspIHtcbiAgICAgIGNvbnN0IHBhcmVudElEOiBCdWZmZXIgPSBiaW50b29scy5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyAzMilcbiAgICAgIG9mZnNldCArPSAzMlxuICAgICAgdGhpcy5wYXJlbnRJRHMucHVzaChwYXJlbnRJRClcbiAgICB9XG5cbiAgICBjb25zdCBuVHhzOiBCdWZmZXIgPSBiaW50b29scy5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyA0KVxuICAgIHRoaXMubnVtVHhzID0gblR4cy5yZWFkSW50MzJCRSgwKVxuICAgIC8vIGFjY291bnQgZm9yIHR4LXNpemUgYnl0ZXNcbiAgICBvZmZzZXQgKz0gOFxuXG4gICAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IHRoaXMubnVtVHhzOyBpKyspIHtcbiAgICAgIGNvbnN0IHR4OiBUeCA9IG5ldyBUeCgpXG4gICAgICBvZmZzZXQgKz0gdHguZnJvbUJ1ZmZlcihiaW50b29scy5jb3B5RnJvbShieXRlcywgb2Zmc2V0KSlcbiAgICAgIHRoaXMudHhzLnB1c2godHgpXG4gICAgfVxuXG4gICAgaWYgKGJ5dGVzLmJ5dGVMZW5ndGggPiBvZmZzZXQgJiYgYnl0ZXMuYnl0ZUxlbmd0aCAtIG9mZnNldCA+IDQpIHtcbiAgICAgIGNvbnN0IG5SczogQnVmZmVyID0gYmludG9vbHMuY29weUZyb20oYnl0ZXMsIG9mZnNldCwgb2Zmc2V0ICsgNClcbiAgICAgIHRoaXMubnVtUmVzdHJpY3Rpb25zID0gblJzLnJlYWRJbnQzMkJFKDApXG4gICAgICBvZmZzZXQgKz0gNFxuICAgICAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IHRoaXMubnVtUmVzdHJpY3Rpb25zOyBpKyspIHtcbiAgICAgICAgY29uc3QgdHg6IEJ1ZmZlciA9IGJpbnRvb2xzLmNvcHlGcm9tKGJ5dGVzLCBvZmZzZXQsIG9mZnNldCArIDMyKVxuICAgICAgICBvZmZzZXQgKz0gMzJcbiAgICAgICAgdGhpcy5yZXN0cmljdGlvbnMucHVzaCh0eClcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gb2Zmc2V0XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IHJlcHJlc2VudGF0aW9uIG9mIHRoZSBbW1ZlcnRleF1dLlxuICAgKi9cbiAgdG9CdWZmZXIoKTogQnVmZmVyIHtcbiAgICBjb25zdCBjb2RlYzogbnVtYmVyID0gdGhpcy5nZXRDb2RlY0lEKClcbiAgICBjb25zdCBjb2RlY0J1ZjogQnVmZmVyID0gQnVmZmVyLmFsbG9jKDIpXG4gICAgY29kZWNCdWYud3JpdGVVSW50MTZCRShjb2RlYywgMClcblxuICAgIGNvbnN0IGVwb2NoQnVmOiBCdWZmZXIgPSBCdWZmZXIuYWxsb2MoNClcbiAgICBlcG9jaEJ1Zi53cml0ZUludDMyQkUodGhpcy5lcG9jaCwgMClcblxuICAgIGNvbnN0IG51bVBhcmVudElEc0J1ZjogQnVmZmVyID0gQnVmZmVyLmFsbG9jKDQpXG4gICAgbnVtUGFyZW50SURzQnVmLndyaXRlSW50MzJCRSh0aGlzLm51bVBhcmVudElEcywgMClcbiAgICBsZXQgYmFycjogQnVmZmVyW10gPSBbXG4gICAgICBjb2RlY0J1ZixcbiAgICAgIHRoaXMuYmxvY2tjaGFpbklELFxuICAgICAgYmludG9vbHMuZnJvbUJOVG9CdWZmZXIodGhpcy5oZWlnaHQsIDgpLFxuICAgICAgZXBvY2hCdWYsXG4gICAgICBudW1QYXJlbnRJRHNCdWZcbiAgICBdXG4gICAgdGhpcy5wYXJlbnRJRHMuZm9yRWFjaCgocGFyZW50SUQ6IEJ1ZmZlcik6IHZvaWQgPT4ge1xuICAgICAgYmFyci5wdXNoKHBhcmVudElEKVxuICAgIH0pXG5cbiAgICBjb25zdCB0eHM6IFR4W10gPSB0aGlzLmdldFR4cygpXG4gICAgY29uc3QgbnVtVHhzOiBCdWZmZXIgPSBCdWZmZXIuYWxsb2MoNClcbiAgICBudW1UeHMud3JpdGVVSW50MzJCRSh0eHMubGVuZ3RoLCAwKVxuICAgIGJhcnIucHVzaChudW1UeHMpXG5cbiAgICBsZXQgc2l6ZTogbnVtYmVyID0gMFxuICAgIGNvbnN0IHR4U2l6ZTogQnVmZmVyID0gQnVmZmVyLmFsbG9jKDQpXG4gICAgdHhzLmZvckVhY2goKHR4OiBUeCk6IHZvaWQgPT4ge1xuICAgICAgY29uc3QgYjogQnVmZmVyID0gdHgudG9CdWZmZXIoKVxuICAgICAgc2l6ZSArPSBiLmJ5dGVMZW5ndGhcbiAgICB9KVxuICAgIHR4U2l6ZS53cml0ZVVJbnQzMkJFKHNpemUsIDApXG4gICAgYmFyci5wdXNoKHR4U2l6ZSlcblxuICAgIHR4cy5mb3JFYWNoKCh0eDogVHgpOiB2b2lkID0+IHtcbiAgICAgIGNvbnN0IGI6IEJ1ZmZlciA9IHR4LnRvQnVmZmVyKClcbiAgICAgIGJhcnIucHVzaChiKVxuICAgIH0pXG5cbiAgICByZXR1cm4gQnVmZmVyLmNvbmNhdChiYXJyKVxuICB9XG5cbiAgY2xvbmUoKTogdGhpcyB7XG4gICAgbGV0IHZlcnRleDogVmVydGV4ID0gbmV3IFZlcnRleCgpXG4gICAgdmVydGV4LmZyb21CdWZmZXIodGhpcy50b0J1ZmZlcigpKVxuICAgIHJldHVybiB2ZXJ0ZXggYXMgdGhpc1xuICB9XG4gIC8qKlxuICAgKiBDbGFzcyByZXByZXNlbnRpbmcgYSBWZXJ0ZXggd2hpY2ggaXMgYSBjb250YWluZXIgZm9yIEFWTSBUcmFuc2FjdGlvbnMuXG4gICAqXG4gICAqIEBwYXJhbSBuZXR3b3JrSUQgT3B0aW9uYWwsIFtbRGVmYXVsdE5ldHdvcmtJRF1dXG4gICAqIEBwYXJhbSBibG9ja2NoYWluSUQgT3B0aW9uYWwsIGRlZmF1bHQgXCIyb1lNQk5WNGVOSHlxazJmampWNW5WUUxEYnRtTkp6cTVzM3FzM0xvNmZ0bkM2RkJ5TVwiXG4gICAqIEBwYXJhbSBoZWlnaHQgT3B0aW9uYWwsIGRlZmF1bHQgbmV3IEJOKDApXG4gICAqIEBwYXJhbSBlcG9jaCBPcHRpb25hbCwgZGVmYXVsdCBuZXcgQk4oMClcbiAgICogQHBhcmFtIHBhcmVudElEcyBPcHRpb25hbCwgZGVmYXVsdCBbXVxuICAgKiBAcGFyYW0gdHhzIE9wdGlvbmFsLCBkZWZhdWx0IFtdXG4gICAqIEBwYXJhbSByZXN0cmljdGlvbnMgT3B0aW9uYWwsIGRlZmF1bHQgW11cbiAgICovXG4gIGNvbnN0cnVjdG9yKFxuICAgIG5ldHdvcmtJRDogbnVtYmVyID0gRGVmYXVsdE5ldHdvcmtJRCxcbiAgICBibG9ja2NoYWluSUQ6IHN0cmluZyA9IFwiMm9ZTUJOVjRlTkh5cWsyZmpqVjVuVlFMRGJ0bU5KenE1czNxczNMbzZmdG5DNkZCeU1cIixcbiAgICBoZWlnaHQ6IEJOID0gbmV3IEJOKDApLFxuICAgIGVwb2NoOiBudW1iZXIgPSAwLFxuICAgIHBhcmVudElEczogQnVmZmVyW10gPSBbXSxcbiAgICB0eHM6IFR4W10gPSBbXSxcbiAgICByZXN0cmljdGlvbnM6IEJ1ZmZlcltdID0gW11cbiAgKSB7XG4gICAgc3VwZXIoKVxuICAgIHRoaXMubmV0d29ya0lEID0gbmV0d29ya0lEXG4gICAgdGhpcy5ibG9ja2NoYWluSUQgPSBiaW50b29scy5jYjU4RGVjb2RlKGJsb2NrY2hhaW5JRClcbiAgICB0aGlzLmhlaWdodCA9IGhlaWdodFxuICAgIHRoaXMuZXBvY2ggPSBlcG9jaFxuICAgIHRoaXMucGFyZW50SURzID0gcGFyZW50SURzXG4gICAgdGhpcy5udW1QYXJlbnRJRHMgPSBwYXJlbnRJRHMubGVuZ3RoXG4gICAgdGhpcy50eHMgPSB0eHNcbiAgICB0aGlzLm51bVR4cyA9IHR4cy5sZW5ndGhcbiAgICB0aGlzLnJlc3RyaWN0aW9ucyA9IHJlc3RyaWN0aW9uc1xuICAgIHRoaXMubnVtUmVzdHJpY3Rpb25zID0gcmVzdHJpY3Rpb25zLmxlbmd0aFxuICB9XG59XG4iXX0=
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenesisData = void 0;
/**
 * @packageDocumentation
 * @module API-AVM-GenesisData
 */
const buffer_1 = require("buffer/");
const bintools_1 = __importDefault(require("../../utils/bintools"));
const serialization_1 = require("../../utils/serialization");
const constants_1 = require("./constants");
const _1 = require(".");
const utils_1 = require("../../utils");
/**
 * @ignore
 */
const serialization = serialization_1.Serialization.getInstance();
const bintools = bintools_1.default.getInstance();
const decimalString = "decimalString";
const buffer = "Buffer";
class GenesisData extends serialization_1.Serializable {
    // TODO - setCodecID?
    serialize(encoding = "hex") {
        let fields = super.serialize(encoding);
        return Object.assign(Object.assign({}, fields), { genesisAssets: this.genesisAssets.map((genesisAsset) => genesisAsset.serialize(encoding)), networkID: serialization.encoder(this.networkID, encoding, buffer, decimalString) });
    }
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        this.genesisAssets = fields["genesisAssets"].map((genesisAsset) => {
            let g = new _1.GenesisAsset();
            g.deserialize(genesisAsset, encoding);
            return g;
        });
        this.networkID = serialization.decoder(fields["networkID"], encoding, decimalString, buffer, 4);
    }
    /**
     * Takes a {@link https://github.com/feross/buffer|Buffer} containing an [[GenesisAsset]], parses it, populates the class, and returns the length of the [[GenesisAsset]] in bytes.
     *
     * @param bytes A {@link https://github.com/feross/buffer|Buffer} containing a raw [[GenesisAsset]]
     *
     * @returns The length of the raw [[GenesisAsset]]
     *
     * @remarks assume not-checksummed
     */
    fromBuffer(bytes, offset = 0) {
        this._codecID = bintools.copyFrom(bytes, offset, offset + 2).readUInt16BE(0);
        offset += 2;
        const numGenesisAssets = bintools.copyFrom(bytes, offset, offset + 4);
        offset += 4;
        const assetCount = numGenesisAssets.readUInt32BE(0);
        this.genesisAssets = [];
        for (let i = 0; i < assetCount; i++) {
            const genesisAsset = new _1.GenesisAsset();
            offset = genesisAsset.fromBuffer(bytes, offset);
            this.genesisAssets.push(genesisAsset);
            if (i === 0) {
                this.networkID.writeUInt32BE(genesisAsset.getNetworkID(), 0);
            }
        }
        return offset;
    }
    /**
     * Returns a {@link https://github.com/feross/buffer|Buffer} representation of the [[GenesisData]].
     */
    toBuffer() {
        // codec id
        const codecbuffSize = buffer_1.Buffer.alloc(2);
        codecbuffSize.writeUInt16BE(this._codecID, 0);
        // num assets
        const numAssetsbuffSize = buffer_1.Buffer.alloc(4);
        numAssetsbuffSize.writeUInt32BE(this.genesisAssets.length, 0);
        let bsize = codecbuffSize.length + numAssetsbuffSize.length;
        let barr = [codecbuffSize, numAssetsbuffSize];
        this.genesisAssets.forEach((genesisAsset) => {
            const b = genesisAsset.toBuffer(this.getNetworkID());
            bsize += b.length;
            barr.push(b);
        });
        return buffer_1.Buffer.concat(barr, bsize);
    }
    /**
     * Class representing AVM GenesisData
     *
     * @param genesisAssets Optional GenesisAsset[]
     * @param networkID Optional DefaultNetworkID
     */
    constructor(genesisAssets = [], networkID = utils_1.DefaultNetworkID) {
        super();
        this._typeName = "GenesisData";
        this._codecID = constants_1.AVMConstants.LATESTCODEC;
        this.networkID = buffer_1.Buffer.alloc(4);
        /**
         * Returns the GenesisAssets[]
         */
        this.getGenesisAssets = () => this.genesisAssets;
        /**
         * Returns the NetworkID as a number
         */
        this.getNetworkID = () => this.networkID.readUInt32BE(0);
        this.genesisAssets = genesisAssets;
        this.networkID.writeUInt32BE(networkID, 0);
    }
}
exports.GenesisData = GenesisData;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXNpc2RhdGEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYXBpcy9hdm0vZ2VuZXNpc2RhdGEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7OztHQUdHO0FBQ0gsb0NBQWdDO0FBQ2hDLG9FQUEyQztBQUMzQyw2REFJa0M7QUFDbEMsMkNBQTBDO0FBQzFDLHdCQUFnQztBQUNoQyx1Q0FBOEQ7QUFFOUQ7O0dBRUc7QUFDSCxNQUFNLGFBQWEsR0FBa0IsNkJBQWEsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtBQUNoRSxNQUFNLFFBQVEsR0FBYSxrQkFBUSxDQUFDLFdBQVcsRUFBRSxDQUFBO0FBQ2pELE1BQU0sYUFBYSxHQUFtQixlQUFlLENBQUE7QUFDckQsTUFBTSxNQUFNLEdBQW1CLFFBQVEsQ0FBQTtBQUV2QyxNQUFhLFdBQVksU0FBUSw0QkFBWTtJQUkzQyxxQkFBcUI7SUFDckIsU0FBUyxDQUFDLFdBQStCLEtBQUs7UUFDNUMsSUFBSSxNQUFNLEdBQVcsS0FBSyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQTtRQUM5Qyx1Q0FDSyxNQUFNLEtBQ1QsYUFBYSxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUMsWUFBMEIsRUFBRSxFQUFFLENBQ25FLFlBQVksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQ2pDLEVBQ0QsU0FBUyxFQUFFLGFBQWEsQ0FBQyxPQUFPLENBQzlCLElBQUksQ0FBQyxTQUFTLEVBQ2QsUUFBUSxFQUNSLE1BQU0sRUFDTixhQUFhLENBQ2QsSUFDRjtJQUNILENBQUM7SUFFRCxXQUFXLENBQUMsTUFBYyxFQUFFLFdBQStCLEtBQUs7UUFDOUQsS0FBSyxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUE7UUFDbkMsSUFBSSxDQUFDLGFBQWEsR0FBRyxNQUFNLENBQUMsZUFBZSxDQUFDLENBQUMsR0FBRyxDQUM5QyxDQUFDLFlBQTBC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cEMsS0FBSyxFQUFFLENBQUE7UUEvR0MsY0FBUyxHQUFHLGFBQWEsQ0FBQTtRQUN6QixhQUFRLEdBQUcsd0JBQVksQ0FBQyxXQUFXLENBQUE7UUFzQ25DLGNBQVMsR0FBVyxlQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBRTdDOztXQUVHO1FBQ0gscUJBQWdCLEdBQUcsR0FBbUIsRUFBRSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUE7UUFFM0Q7O1dBRUc7UUFDSCxpQkFBWSxHQUFHLEdBQVcsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBK0R6RCxJQUFJLENBQUMsYUFBYSxHQUFHLGFBQWEsQ0FBQTtRQUNsQyxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUE7SUFDNUMsQ0FBQztDQUNGO0FBcEhELGtDQW9IQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQHBhY2thZ2VEb2N1bWVudGF0aW9uXG4gKiBAbW9kdWxlIEFQSS1BVk0tR2VuZXNpc0RhdGFcbiAqL1xuaW1wb3J0IHsgQnVmZmVyIH0gZnJvbSBcImJ1ZmZlci9cIlxuaW1wb3J0IEJpblRvb2xzIGZyb20gXCIuLi8uLi91dGlscy9iaW50b29sc1wiXG5pbXBvcnQge1xuICBTZXJpYWxpemFibGUsXG4gIFNlcmlhbGl6YXRpb24sXG4gIFNlcmlhbGl6ZWRFbmNvZGluZ1xufSBmcm9tIFwiLi4vLi4vdXRpbHMvc2VyaWFsaXphdGlvblwiXG5pbXBvcnQgeyBBVk1Db25zdGFudHMgfSBmcm9tIFwiLi9jb25zdGFudHNcIlxuaW1wb3J0IHsgR2VuZXNpc0Fzc2V0IH0gZnJvbSBcIi5cIlxuaW1wb3J0IHsgRGVmYXVsdE5ldHdvcmtJRCwgU2VyaWFsaXplZFR5cGUgfSBmcm9tIFwiLi4vLi4vdXRpbHNcIlxuXG4vKipcbiAqIEBpZ25vcmVcbiAqL1xuY29uc3Qgc2VyaWFsaXphdGlvbjogU2VyaWFsaXphdGlvbiA9IFNlcmlhbGl6YXRpb24uZ2V0SW5zdGFuY2UoKVxuY29uc3QgYmludG9vbHM6IEJpblRvb2xzID0gQmluVG9vbHMuZ2V0SW5zdGFuY2UoKVxuY29uc3QgZGVjaW1hbFN0cmluZzogU2VyaWFsaXplZFR5cGUgPSBcImRlY2ltYWxTdHJpbmdcIlxuY29uc3QgYnVmZmVyOiBTZXJpYWxpemVkVHlwZSA9IFwiQnVmZmVyXCJcblxuZXhwb3J0IGNsYXNzIEdlbmVzaXNEYXRhIGV4dGVuZHMgU2VyaWFsaXphYmxlIHtcbiAgcHJvdGVjdGVkIF90eXBlTmFtZSA9IFwiR2VuZXNpc0RhdGFcIlxuICBwcm90ZWN0ZWQgX2NvZGVjSUQgPSBBVk1Db25zdGFudHMuTEFURVNUQ09ERUNcblxuICAvLyBUT0RPIC0gc2V0Q29kZWNJRD9cbiAgc2VyaWFsaXplKGVuY29kaW5nOiBTZXJpYWxpemVkRW5jb2RpbmcgPSBcImhleFwiKTogb2JqZWN0IHtcbiAgICBsZXQgZmllbGRzOiBvYmplY3QgPSBzdXBlci5zZXJpYWxpemUoZW5jb2RpbmcpXG4gICAgcmV0dXJuIHtcbiAgICAgIC4uLmZpZWxkcyxcbiAgICAgIGdlbmVzaXNBc3NldHM6IHRoaXMuZ2VuZXNpc0Fzc2V0cy5tYXAoKGdlbmVzaXNBc3NldDogR2VuZXNpc0Fzc2V0KSA9PlxuICAgICAgICBnZW5lc2lzQXNzZXQuc2VyaWFsaXplKGVuY29kaW5nKVxuICAgICAgKSxcbiAgICAgIG5ldHdvcmtJRDogc2VyaWFsaXphdGlvbi5lbmNvZGVyKFxuICAgICAgICB0aGlzLm5ldHdvcmtJRCxcbiAgICAgICAgZW5jb2RpbmcsXG4gICAgICAgIGJ1ZmZlcixcbiAgICAgICAgZGVjaW1hbFN0cmluZ1xuICAgICAgKVxuICAgIH1cbiAgfVxuXG4gIGRlc2VyaWFsaXplKGZpZWxkczogb2JqZWN0LCBlbmNvZGluZzogU2VyaWFsaXplZEVuY29kaW5nID0gXCJoZXhcIikge1xuICAgIHN1cGVyLmRlc2VyaWFsaXplKGZpZWxkcywgZW5jb2RpbmcpXG4gICAgdGhpcy5nZW5lc2lzQXNzZXRzID0gZmllbGRzW1wiZ2VuZXNpc0Fzc2V0c1wiXS5tYXAoXG4gICAgICAoZ2VuZXNpc0Fzc2V0OiBHZW5lc2lzQXNzZXQpOiBHZW5lc2lzQXNzZXQgPT4ge1xuICAgICAgICBsZXQgZzogR2VuZXNpc0Fzc2V0ID0gbmV3IEdlbmVzaXNBc3NldCgpXG4gICAgICAgIGcuZGVzZXJpYWxpemUoZ2VuZXNpc0Fzc2V0LCBlbmNvZGluZylcbiAgICAgICAgcmV0dXJuIGdcbiAgICAgIH1cbiAgICApXG4gICAgdGhpcy5uZXR3b3JrSUQgPSBzZXJpYWxpemF0aW9uLmRlY29kZXIoXG4gICAgICBmaWVsZHNbXCJuZXR3b3JrSURcIl0sXG4gICAgICBlbmNvZGluZyxcbiAgICAgIGRlY2ltYWxTdHJpbmcsXG4gICAgICBidWZmZXIsXG4gICAgICA0XG4gICAgKVxuICB9XG5cbiAgcHJvdGVjdGVkIGdlbmVzaXNBc3NldHM6IEdlbmVzaXNBc3NldFtdXG4gIHByb3RlY3RlZCBuZXR3b3JrSUQ6IEJ1ZmZlciA9IEJ1ZmZlci5hbGxvYyg0KVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBHZW5lc2lzQXNzZXRzW11cbiAgICovXG4gIGdldEdlbmVzaXNBc3NldHMgPSAoKTogR2VuZXNpc0Fzc2V0W10gPT4gdGhpcy5nZW5lc2lzQXNzZXRzXG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIE5ldHdvcmtJRCBhcyBhIG51bWJlclxuICAgKi9cbiAgZ2V0TmV0d29ya0lEID0gKCk6IG51bWJlciA9PiB0aGlzLm5ldHdvcmtJRC5yZWFkVUludDMyQkUoMClcblxuICAvKipcbiAgICogVGFrZXMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBjb250YWluaW5nIGFuIFtbR2VuZXNpc0Fzc2V0XV0sIHBhcnNlcyBpdCwgcG9wdWxhdGVzIHRoZSBjbGFzcywgYW5kIHJldHVybnMgdGhlIGxlbmd0aCBvZiB0aGUgW1tHZW5lc2lzQXNzZXRdXSBpbiBieXRlcy5cbiAgICpcbiAgICogQHBhcmFtIGJ5dGVzIEEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gY29udGFpbmluZyBhIHJhdyBbW0dlbmVzaXNBc3NldF1dXG4gICAqXG4gICAqIEByZXR1cm5zIFRoZSBsZW5ndGggb2YgdGhlIHJhdyBbW0dlbmVzaXNBc3NldF1dXG4gICAqXG4gICAqIEByZW1hcmtzIGFzc3VtZSBub3QtY2hlY2tzdW1tZWRcbiAgICovXG4gIGZyb21CdWZmZXIoYnl0ZXM6IEJ1ZmZlciwgb2Zmc2V0OiBudW1iZXIgPSAwKTogbnVtYmVyIHtcbiAgICB0aGlzLl9jb2RlY0lEID0gYmludG9vbHMuY29weUZyb20oYnl0ZXMsIG9mZnNldCwgb2Zmc2V0ICsgMikucmVhZFVJbnQxNkJFKDApXG4gICAgb2Zmc2V0ICs9IDJcbiAgICBjb25zdCBudW1HZW5lc2lzQXNzZXRzID0gYmludG9vbHMuY29weUZyb20oYnl0ZXMsIG9mZnNldCwgb2Zmc2V0ICsgNClcbiAgICBvZmZzZXQgKz0gNFxuICAgIGNvbnN0IGFzc2V0Q291bnQ6IG51bWJlciA9IG51bUdlbmVzaXNBc3NldHMucmVhZFVJbnQzMkJFKDApXG4gICAgdGhpcy5nZW5lc2lzQXNzZXRzID0gW11cbiAgICBmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgYXNzZXRDb3VudDsgaSsrKSB7XG4gICAgICBjb25zdCBnZW5lc2lzQXNzZXQ6IEdlbmVzaXNBc3NldCA9IG5ldyBHZW5lc2lzQXNzZXQoKVxuICAgICAgb2Zmc2V0ID0gZ2VuZXNpc0Fzc2V0LmZyb21CdWZmZXIoYnl0ZXMsIG9mZnNldClcbiAgICAgIHRoaXMuZ2VuZXNpc0Fzc2V0cy5wdXNoKGdlbmVzaXNBc3NldClcbiAgICAgIGlmIChpID09PSAwKSB7XG4gICAgICAgIHRoaXMubmV0d29ya0lELndyaXRlVUludDMyQkUoZ2VuZXNpc0Fzc2V0LmdldE5ldHdvcmtJRCgpLCAwKVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gb2Zmc2V0XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IHJlcHJlc2VudGF0aW9uIG9mIHRoZSBbW0dlbmVzaXNEYXRhXV0uXG4gICAqL1xuICB0b0J1ZmZlcigpOiBCdWZmZXIge1xuICAgIC8vIGNvZGVjIGlkXG4gICAgY29uc3QgY29kZWNidWZmU2l6ZTogQnVmZmVyID0gQnVmZmVyLmFsbG9jKDIpXG4gICAgY29kZWNidWZmU2l6ZS53cml0ZVVJbnQxNkJFKHRoaXMuX2NvZGVjSUQsIDApXG5cbiAgICAvLyBudW0gYXNzZXRzXG4gICAgY29uc3QgbnVtQXNzZXRzYnVmZlNpemU6IEJ1ZmZlciA9IEJ1ZmZlci5hbGxvYyg0KVxuICAgIG51bUFzc2V0c2J1ZmZTaXplLndyaXRlVUludDMyQkUodGhpcy5nZW5lc2lzQXNzZXRzLmxlbmd0aCwgMClcblxuICAgIGxldCBic2l6ZTogbnVtYmVyID0gY29kZWNidWZmU2l6ZS5sZW5ndGggKyBudW1Bc3NldHNidWZmU2l6ZS5sZW5ndGhcbiAgICBsZXQgYmFycjogQnVmZmVyW10gPSBbY29kZWNidWZmU2l6ZSwgbnVtQXNzZXRzYnVmZlNpemVdXG5cbiAgICB0aGlzLmdlbmVzaXNBc3NldHMuZm9yRWFjaCgoZ2VuZXNpc0Fzc2V0OiBHZW5lc2lzQXNzZXQpOiB2b2lkID0+IHtcbiAgICAgIGNvbnN0IGI6IEJ1ZmZlciA9IGdlbmVzaXNBc3NldC50b0J1ZmZlcih0aGlzLmdldE5ldHdvcmtJRCgpKVxuICAgICAgYnNpemUgKz0gYi5sZW5ndGhcbiAgICAgIGJhcnIucHVzaChiKVxuICAgIH0pXG4gICAgcmV0dXJuIEJ1ZmZlci5jb25jYXQoYmFyciwgYnNpemUpXG4gIH1cblxuICAvKipcbiAgICogQ2xhc3MgcmVwcmVzZW50aW5nIEFWTSBHZW5lc2lzRGF0YVxuICAgKlxuICAgKiBAcGFyYW0gZ2VuZXNpc0Fzc2V0cyBPcHRpb25hbCBHZW5lc2lzQXNzZXRbXVxuICAgKiBAcGFyYW0gbmV0d29ya0lEIE9wdGlvbmFsIERlZmF1bHROZXR3b3JrSURcbiAgICovXG4gIGNvbnN0cnVjdG9yKFxuICAgIGdlbmVzaXNBc3NldHM6IEdlbmVzaXNBc3NldFtdID0gW10sXG4gICAgbmV0d29ya0lEOiBudW1iZXIgPSBEZWZhdWx0TmV0d29ya0lEXG4gICkge1xuICAgIHN1cGVyKClcbiAgICB0aGlzLmdlbmVzaXNBc3NldHMgPSBnZW5lc2lzQXNzZXRzXG4gICAgdGhpcy5uZXR3b3JrSUQud3JpdGVVSW50MzJCRShuZXR3b3JrSUQsIDApXG4gIH1cbn1cbiJdfQ==
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminProposal = void 0;
const buffer_1 = require("buffer/");
const bintools_1 = __importDefault(require("../../../utils/bintools"));
const serialization_1 = require("../../../utils/serialization");
const constants_1 = require("../constants");
const essentialproposal_1 = require("./essentialproposal");
const addmemberproposal_1 = require("./addmemberproposal");
const excludememberproposal_1 = require("./excludememberproposal");
const serialization = serialization_1.Serialization.getInstance();
const bintools = bintools_1.default.getInstance();
class AdminProposal extends essentialproposal_1.EssentialProposal {
    constructor(optionIndex, proposal) {
        super();
        this._typeID = constants_1.PlatformVMConstants.ADMINPROPOSAL_TYPE_ID;
        this._optionIndex = buffer_1.Buffer.alloc(4);
        this._optionIndex = optionIndex;
        this._proposal = proposal;
    }
    serialize(encoding = "hex") {
        return {
            proposal: this._proposal.serialize(encoding),
            optionIndex: serialization.encoder(this._optionIndex, encoding, "Buffer", "number")
        };
    }
    deserialize(fields, encoding = "hex") {
        this._proposal = this._proposal.deserialize(fields, encoding);
        this._optionIndex = serialization.decoder(fields["optionIndex"], encoding, "number", "Buffer");
        return this;
    }
    getTypeID() {
        return this._typeID;
    }
    getOptionIndex() {
        return this._optionIndex;
    }
    getProposal() {
        return this._proposal;
    }
    fromBuffer(bytes, offset = 0) {
        // try to parse addmember proposal
        this._optionIndex = bintools.copyFrom(bytes, offset, offset + 4);
        offset += 4;
        const proposalTypeID = bintools
            .copyFrom(bytes, offset, offset + 4)
            .readUInt32BE(0);
        offset += 4;
        switch (proposalTypeID) {
            case constants_1.PlatformVMConstants.ADDMEMBERPORPOSAL_TYPE_ID:
                this._proposal = new addmemberproposal_1.AddMemberProposal();
                break;
            case constants_1.PlatformVMConstants.EXCLUDEMEMBERPORPOSAL_TYPE_ID:
                this._proposal = new excludememberproposal_1.ExcludeMemberProposal();
                break;
            default:
                throw `Unsupported proposal type: ${proposalTypeID}`;
        }
        offset = this._proposal.fromBuffer(bytes, offset);
        return offset;
    }
    /**
     * Returns a {@link https://github.com/feross/buffer|Buffer} representation of the [[BaseProposal]].
     */
    toBuffer() {
        const buff = this.getOptionIndex();
        const typeIdBuff = buffer_1.Buffer.alloc(4);
        typeIdBuff.writeUInt32BE(this._proposal.getTypeID(), 0);
        const proposalBuff = this._proposal.toBuffer();
        return buffer_1.Buffer.concat([buff, typeIdBuff, proposalBuff], buff.length + typeIdBuff.length + proposalBuff.length);
    }
}
exports.AdminProposal = AdminProposal;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRtaW5wcm9wb3NhbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9hcGlzL3BsYXRmb3Jtdm0vYWRkcHJvcG9zYWx0eC9hZG1pbnByb3Bvc2FsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLG9DQUFnQztBQUNoQyx1RUFBOEM7QUFDOUMsZ0VBQWdGO0FBQ2hGLDRDQUFrRDtBQUNsRCwyREFBdUQ7QUFDdkQsMkRBQXVEO0FBQ3ZELG1FQUErRDtBQUUvRCxNQUFNLGFBQWEsR0FBRyw2QkFBYSxDQUFDLFdBQVcsRUFBRSxDQUFBO0FBQ2pELE1BQU0sUUFBUSxHQUFHLGtCQUFRLENBQUMsV0FBVyxFQUFFLENBQUE7QUFHdkMsTUFBYSxhQUFjLFNBQVEscUNBQWlCO0lBS2xELFlBQVksV0FBb0IsRUFBRSxRQUEwQjtRQUMxRCxLQUFLLEVBQUUsQ0FBQTtRQUxRLFlBQU8sR0FBRywrQkFBbUIsQ0FBQyxxQkFBcUIsQ0FBQTtRQUM1RCxpQkFBWSxHQUFHLGVBQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFLcEMsSUFBSSxDQUFDLFlBQVksR0FBRyxXQUFXLENBQUE7UUFDL0IsSUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUE7SUFDM0IsQ0FBQztJQUVELFNBQVMsQ0FBQyxXQUErQixLQUFLO1FBQzVDLE9BQU87WUFDTCxRQUFRLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDO1lBQzVDLFdBQVcsRUFBRSxhQUFhLENBQUMsT0FBTyxDQUNoQyxJQUFJLENBQUMsWUFBWSxFQUNqQixRQUFRLEVBQ1IsUUFBUSxFQUNSLFFBQVEsQ0FDVDtTQUNGLENBQUE7SUFDSCxDQUFDO0lBRUQsV0FBVyxDQUFDLE1BQWMsRUFBRSxXQUErQixLQUFLO1FBQzlELElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFBO1FBQzdELElBQUksQ0FBQyxZQUFZLEdBQUcsYUFBYSxDQUFDLE9BQU8sQ0FDdkMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxFQUNyQixRQUFRLEVBQ1IsUUFBUSxFQUNSLFFBQVEsQ0FDVCxDQUFBO1FBQ0QsT0FBTyxJQUFJLENBQUE7SUFDYixDQUFDO0lBRUQsU0FBUztRQUNQLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQTtJQUNyQixDQUFDO0lBRUQsY0FBYztRQUNaLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQTtJQUMxQixDQUFDO0lBRUQsV0FBVztRQUNULE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQTtJQUN2QixDQUFDO0lBRUQsVUFBVSxDQUFDLEtBQWEsRUFBRSxTQUFpQixDQUFDO1FBQzFDLGtDQUFrQztRQUNsQyxJQUFJLENBQUMsWUFBWSxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUE7UUFDaEUsTUFBTSxJQUFJLENBQUMsQ0FBQTtRQUNYLE1BQU0sY0FBYyxHQUFHLFFBQVE7YUFDNUIsUUFBUSxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxHQUFHLENBQUMsQ0FBQzthQUNuQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDbEIsTUFBTSxJQUFJLENBQUMsQ0FBQTtRQUNYLFFBQVEsY0FBYyxFQUFFO1lBQ3RCLEtBQUssK0JBQW1CLENBQUMseUJBQXlCO2dCQUNoRCxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUkscUNBQWlCLEVBQUUsQ0FBQTtnQkFDeEMsTUFBSztZQUNQLEtBQUssK0JBQW1CLENBQUMsNkJBQTZCO2dCQUNwRCxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksNkNBQXFCLEVBQUUsQ0FBQTtnQkFDNUMsTUFBSztZQUNQO2dCQUNFLE1BQU0sOEJBQThCLGNBQWMsRUFBRSxDQUFBO1NBQ3ZEO1FBQ0QsTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQTtRQUNqRCxPQUFPLE1BQU0sQ0FBQTtJQUNmLENBQUM7SUFFRDs7T0FFRztJQUNILFFBQVE7UUFDTixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUE7UUFDbEMsTUFBTSxVQUFVLEdBQUcsZUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNsQyxVQUFVLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUE7UUFDdkQsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQTtRQUM5QyxPQUFPLGVBQU0sQ0FBQyxNQUFNLENBQ2xCLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxZQUFZLENBQUMsRUFDaEMsSUFBSSxDQUFDLE1BQU0sR0FBRyxVQUFVLENBQUMsTUFBTSxHQUFHLFlBQVksQ0FBQyxNQUFNLENBQ3RELENBQUE7SUFDSCxDQUFDO0NBQ0Y7QUFqRkQsc0NBaUZDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQnVmZmVyIH0gZnJvbSBcImJ1ZmZlci9cIlxuaW1wb3J0IEJpblRvb2xzIGZyb20gXCIuLi8uLi8uLi91dGlscy9iaW50b29sc1wiXG5pbXBvcnQgeyBTZXJpYWxpemF0aW9uLCBTZXJpYWxpemVkRW5jb2RpbmcgfSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvc2VyaWFsaXphdGlvblwiXG5pbXBvcnQgeyBQbGF0Zm9ybVZNQ29uc3RhbnRzIH0gZnJvbSBcIi4uL2NvbnN0YW50c1wiXG5pbXBvcnQgeyBFc3NlbnRpYWxQcm9wb3NhbCB9IGZyb20gXCIuL2Vzc2VudGlhbHByb3Bvc2FsXCJcbmltcG9ydCB7IEFkZE1lbWJlclByb3Bvc2FsIH0gZnJvbSBcIi4vYWRkbWVtYmVycHJvcG9zYWxcIlxuaW1wb3J0IHsgRXhjbHVkZU1lbWJlclByb3Bvc2FsIH0gZnJvbSBcIi4vZXhjbHVkZW1lbWJlcnByb3Bvc2FsXCJcblxuY29uc3Qgc2VyaWFsaXphdGlvbiA9IFNlcmlhbGl6YXRpb24uZ2V0SW5zdGFuY2UoKVxuY29uc3QgYmludG9vbHMgPSBCaW5Ub29scy5nZXRJbnN0YW5jZSgpXG5cbnR5cGUgQWxsb3dlZFByb3Bvc2FsID0gQWRkTWVtYmVyUHJvcG9zYWwgfCBFeGNsdWRlTWVtYmVyUHJvcG9zYWxcbmV4cG9ydCBjbGFzcyBBZG1pblByb3Bvc2FsIGV4dGVuZHMgRXNzZW50aWFsUHJvcG9zYWwge1xuICBwcml2YXRlIHJlYWRvbmx5IF90eXBlSUQgPSBQbGF0Zm9ybVZNQ29uc3RhbnRzLkFETUlOUFJPUE9TQUxfVFlQRV9JRFxuICBwcml2YXRlIF9vcHRpb25JbmRleCA9IEJ1ZmZlci5hbGxvYyg0KVxuICBwcml2YXRlIF9wcm9wb3NhbDogQWxsb3dlZFByb3Bvc2FsXG5cbiAgY29uc3RydWN0b3Iob3B0aW9uSW5kZXg/OiBCdWZmZXIsIHByb3Bvc2FsPzogQWxsb3dlZFByb3Bvc2FsKSB7XG4gICAgc3VwZXIoKVxuICAgIHRoaXMuX29wdGlvbkluZGV4ID0gb3B0aW9uSW5kZXhcbiAgICB0aGlzLl9wcm9wb3NhbCA9IHByb3Bvc2FsXG4gIH1cblxuICBzZXJpYWxpemUoZW5jb2Rpbmc6IFNlcmlhbGl6ZWRFbmNvZGluZyA9IFwiaGV4XCIpOiBvYmplY3Qge1xuICAgIHJldHVybiB7XG4gICAgICBwcm9wb3NhbDogdGhpcy5fcHJvcG9zYWwuc2VyaWFsaXplKGVuY29kaW5nKSxcbiAgICAgIG9wdGlvbkluZGV4OiBzZXJpYWxpemF0aW9uLmVuY29kZXIoXG4gICAgICAgIHRoaXMuX29wdGlvbkluZGV4LFxuICAgICAgICBlbmNvZGluZyxcbiAgICAgICAgXCJCdWZmZXJcIixcbiAgICAgICAgXCJudW1iZXJcIlxuICAgICAgKVxuICAgIH1cbiAgfVxuXG4gIGRlc2VyaWFsaXplKGZpZWxkczogb2JqZWN0LCBlbmNvZGluZzogU2VyaWFsaXplZEVuY29kaW5nID0gXCJoZXhcIik6IHRoaXMge1xuICAgIHRoaXMuX3Byb3Bvc2FsID0gdGhpcy5fcHJvcG9zYWwuZGVzZXJpYWxpemUoZmllbGRzLCBlbmNvZGluZylcbiAgICB0aGlzLl9vcHRpb25JbmRleCA9IHNlcmlhbGl6YXRpb24uZGVjb2RlcihcbiAgICAgIGZpZWxkc1tcIm9wdGlvbkluZGV4XCJdLFxuICAgICAgZW5jb2RpbmcsXG4gICAgICBcIm51bWJlclwiLFxuICAgICAgXCJCdWZmZXJcIlxuICAgIClcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgZ2V0VHlwZUlEKCkge1xuICAgIHJldHVybiB0aGlzLl90eXBlSURcbiAgfVxuXG4gIGdldE9wdGlvbkluZGV4KCkge1xuICAgIHJldHVybiB0aGlzLl9vcHRpb25JbmRleFxuICB9XG5cbiAgZ2V0UHJvcG9zYWwoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3Byb3Bvc2FsXG4gIH1cblxuICBmcm9tQnVmZmVyKGJ5dGVzOiBCdWZmZXIsIG9mZnNldDogbnVtYmVyID0gMCk6IG51bWJlciB7XG4gICAgLy8gdHJ5IHRvIHBhcnNlIGFkZG1lbWJlciBwcm9wb3NhbFxuICAgIHRoaXMuX29wdGlvbkluZGV4ID0gYmludG9vbHMuY29weUZyb20oYnl0ZXMsIG9mZnNldCwgb2Zmc2V0ICsgNClcbiAgICBvZmZzZXQgKz0gNFxuICAgIGNvbnN0IHByb3Bvc2FsVHlwZUlEID0gYmludG9vbHNcbiAgICAgIC5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyA0KVxuICAgICAgLnJlYWRVSW50MzJCRSgwKVxuICAgIG9mZnNldCArPSA0XG4gICAgc3dpdGNoIChwcm9wb3NhbFR5cGVJRCkge1xuICAgICAgY2FzZSBQbGF0Zm9ybVZNQ29uc3RhbnRzLkFERE1FTUJFUlBPUlBPU0FMX1RZUEVfSUQ6XG4gICAgICAgIHRoaXMuX3Byb3Bvc2FsID0gbmV3IEFkZE1lbWJlclByb3Bvc2FsKClcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgUGxhdGZvcm1WTUNvbnN0YW50cy5FWENMVURFTUVNQkVSUE9SUE9TQUxfVFlQRV9JRDpcbiAgICAgICAgdGhpcy5fcHJvcG9zYWwgPSBuZXcgRXhjbHVkZU1lbWJlclByb3Bvc2FsKClcbiAgICAgICAgYnJlYWtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IGBVbnN1cHBvcnRlZCBwcm9wb3NhbCB0eXBlOiAke3Byb3Bvc2FsVHlwZUlEfWBcbiAgICB9XG4gICAgb2Zmc2V0ID0gdGhpcy5fcHJvcG9zYWwuZnJvbUJ1ZmZlcihieXRlcywgb2Zmc2V0KVxuICAgIHJldHVybiBvZmZzZXRcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gcmVwcmVzZW50YXRpb24gb2YgdGhlIFtbQmFzZVByb3Bvc2FsXV0uXG4gICAqL1xuICB0b0J1ZmZlcigpOiBCdWZmZXIge1xuICAgIGNvbnN0IGJ1ZmYgPSB0aGlzLmdldE9wdGlvbkluZGV4KClcbiAgICBjb25zdCB0eXBlSWRCdWZmID0gQnVmZmVyLmFsbG9jKDQpXG4gICAgdHlwZUlkQnVmZi53cml0ZVVJbnQzMkJFKHRoaXMuX3Byb3Bvc2FsLmdldFR5cGVJRCgpLCAwKVxuICAgIGNvbnN0IHByb3Bvc2FsQnVmZiA9IHRoaXMuX3Byb3Bvc2FsLnRvQnVmZmVyKClcbiAgICByZXR1cm4gQnVmZmVyLmNvbmNhdChcbiAgICAgIFtidWZmLCB0eXBlSWRCdWZmLCBwcm9wb3NhbEJ1ZmZdLFxuICAgICAgYnVmZi5sZW5ndGggKyB0eXBlSWRCdWZmLmxlbmd0aCArIHByb3Bvc2FsQnVmZi5sZW5ndGhcbiAgICApXG4gIH1cbn1cbiJdfQ==
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExcludeMemberProposal = void 0;
const buffer_1 = require("buffer/");
const bintools_1 = __importDefault(require("../../../utils/bintools"));
const serialization_1 = require("../../../utils/serialization");
const constants_1 = require("../constants");
const essentialproposal_1 = require("./essentialproposal");
const serialization = serialization_1.Serialization.getInstance();
const bintools = bintools_1.default.getInstance();
class ExcludeMemberProposal extends essentialproposal_1.EssentialProposal {
    serialize(encoding = "hex") {
        return {
            start: serialization.encoder(this.start, encoding, "Buffer", "number"),
            end: serialization.encoder(this.end, encoding, "Buffer", "number"),
            memberAddress: serialization.encoder(this.memberAddress, encoding, "Buffer", "cb58")
        };
    }
    deserialize(fields, encoding = "hex") {
        this.start = serialization.decoder(fields["start"], encoding, "number", "Buffer");
        this.end = serialization.decoder(fields["end"], encoding, "number", "Buffer");
        this.memberAddress = serialization.decoder(fields["memberAddress"], encoding, "cb58", "Buffer", 20);
        return this;
    }
    fromBuffer(bytes, offset = 0) {
        this.memberAddress = bintools.copyFrom(bytes, offset, offset + 20);
        offset += 20;
        this.start = bintools.copyFrom(bytes, offset, offset + 8);
        offset += 8;
        this.end = bintools.copyFrom(bytes, offset, offset + 8);
        offset += 8;
        return offset;
    }
    /**
     * Returns a {@link https://github.com/feross/buffer|Buffer} representation of the [[BaseProposal]].
     */
    toBuffer() {
        const barr = [this.memberAddress, this.start, this.end];
        const bsize = this.memberAddress.length + this.start.length + this.end.length;
        return buffer_1.Buffer.concat(barr, bsize);
    }
    constructor(start, end, memberAddress) {
        const startTime = buffer_1.Buffer.alloc(8);
        startTime.writeUInt32BE(start, 4);
        const endTime = buffer_1.Buffer.alloc(8);
        endTime.writeUInt32BE(end, 4);
        super(startTime, endTime);
        this._typeID = constants_1.PlatformVMConstants.EXCLUDEMEMBERPORPOSAL_TYPE_ID;
        this.memberAddress = buffer_1.Buffer.alloc(20);
        if (typeof memberAddress === "string") {
            this.memberAddress = bintools.stringToAddress(memberAddress);
        }
        else {
            this.memberAddress = memberAddress;
        }
    }
    getTypeID() {
        return this._typeID;
    }
    getMemberAddress() {
        return this.memberAddress;
    }
}
exports.ExcludeMemberProposal = ExcludeMemberProposal;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhjbHVkZW1lbWJlcnByb3Bvc2FsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2FwaXMvcGxhdGZvcm12bS9hZGRwcm9wb3NhbHR4L2V4Y2x1ZGVtZW1iZXJwcm9wb3NhbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxvQ0FBZ0M7QUFDaEMsdUVBQThDO0FBQzlDLGdFQUFnRjtBQUNoRiw0Q0FBa0Q7QUFDbEQsMkRBQXVEO0FBRXZELE1BQU0sYUFBYSxHQUFHLDZCQUFhLENBQUMsV0FBVyxFQUFFLENBQUE7QUFDakQsTUFBTSxRQUFRLEdBQUcsa0JBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtBQUV2QyxNQUFhLHFCQUFzQixTQUFRLHFDQUFpQjtJQUcxRCxTQUFTLENBQUMsV0FBK0IsS0FBSztRQUM1QyxPQUFPO1lBQ0wsS0FBSyxFQUFFLGFBQWEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLFFBQVEsQ0FBQztZQUN0RSxHQUFHLEVBQUUsYUFBYSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsUUFBUSxDQUFDO1lBQ2xFLGFBQWEsRUFBRSxhQUFhLENBQUMsT0FBTyxDQUNsQyxJQUFJLENBQUMsYUFBYSxFQUNsQixRQUFRLEVBQ1IsUUFBUSxFQUNSLE1BQU0sQ0FDUDtTQUNGLENBQUE7SUFDSCxDQUFDO0lBRUQsV0FBVyxDQUFDLE1BQWMsRUFBRSxXQUErQixLQUFLO1FBQzlELElBQUksQ0FBQyxLQUFLLEdBQUcsYUFBYSxDQUFDLE9BQU8sQ0FDaEMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxFQUNmLFFBQVEsRUFDUixRQUFRLEVBQ1IsUUFBUSxDQUNULENBQUE7UUFDRCxJQUFJLENBQUMsR0FBRyxHQUFHLGFBQWEsQ0FBQyxPQUFPLENBQzlCLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFDYixRQUFRLEVBQ1IsUUFBUSxFQUNSLFFBQVEsQ0FDVCxDQUFBO1FBQ0QsSUFBSSxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUMsT0FBTyxDQUN4QyxNQUFNLENBQUMsZUFBZSxDQUFDLEVBQ3ZCLFFBQVEsRUFDUixNQUFNLEVBQ04sUUFBUSxFQUNSLEVBQUUsQ0FDSCxDQUFBO1FBRUQsT0FBTyxJQUFJLENBQUE7SUFDYixDQUFDO0lBRUQsVUFBVSxDQUFDLEtBQWEsRUFBRSxTQUFpQixDQUFDO1FBQzFDLElBQUksQ0FBQyxhQUFhLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sR0FBRyxFQUFFLENBQUMsQ0FBQTtRQUNsRSxNQUFNLElBQUksRUFBRSxDQUFBO1FBQ1osSUFBSSxDQUFDLEtBQUssR0FBRyxRQUFRLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFBO1FBQ3pELE1BQU0sSUFBSSxDQUFDLENBQUE7UUFDWCxJQUFJLENBQUMsR0FBRyxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUE7UUFDdkQsTUFBTSxJQUFJLENBQUMsQ0FBQTtRQUNYLE9BQU8sTUFBTSxDQUFBO0lBQ2YsQ0FBQztJQUVEOztPQUVHO0lBQ0gsUUFBUTtRQUNOLE1BQU0sSUFBSSxHQUFhLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNqRSxNQUFNLEtBQUssR0FDVCxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQTtRQUNqRSxPQUFPLGVBQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFBO0lBQ25DLENBQUM7SUFFRCxZQUFZLEtBQWMsRUFBRSxHQUFZLEVBQUUsYUFBK0I7UUFDdkUsTUFBTSxTQUFTLEdBQUcsZUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNqQyxTQUFTLENBQUMsYUFBYSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQTtRQUNqQyxNQUFNLE9BQU8sR0FBRyxlQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQy9CLE9BQU8sQ0FBQyxhQUFhLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFBO1FBQzdCLEtBQUssQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUE7UUFoRVYsWUFBTyxHQUFHLCtCQUFtQixDQUFDLDZCQUE2QixDQUFBO1FBeUVsRSxrQkFBYSxHQUFHLGVBQU0sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUE7UUFQeEMsSUFBSSxPQUFPLGFBQWEsS0FBSyxRQUFRLEVBQUU7WUFDckMsSUFBSSxDQUFDLGFBQWEsR0FBRyxRQUFRLENBQUMsZUFBZSxDQUFDLGFBQWEsQ0FBQyxDQUFBO1NBQzdEO2FBQU07WUFDTCxJQUFJLENBQUMsYUFBYSxHQUFHLGFBQWEsQ0FBQTtTQUNuQztJQUNILENBQUM7SUFJRCxTQUFTO1FBQ1AsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFBO0lBQ3JCLENBQUM7SUFFRCxnQkFBZ0I7UUFDZCxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUE7SUFDM0IsQ0FBQztDQUNGO0FBbkZELHNEQW1GQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEJ1ZmZlciB9IGZyb20gXCJidWZmZXIvXCJcbmltcG9ydCBCaW5Ub29scyBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvYmludG9vbHNcIlxuaW1wb3J0IHsgU2VyaWFsaXphdGlvbiwgU2VyaWFsaXplZEVuY29kaW5nIH0gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL3NlcmlhbGl6YXRpb25cIlxuaW1wb3J0IHsgUGxhdGZvcm1WTUNvbnN0YW50cyB9IGZyb20gXCIuLi9jb25zdGFudHNcIlxuaW1wb3J0IHsgRXNzZW50aWFsUHJvcG9zYWwgfSBmcm9tIFwiLi9lc3NlbnRpYWxwcm9wb3NhbFwiXG5cbmNvbnN0IHNlcmlhbGl6YXRpb24gPSBTZXJpYWxpemF0aW9uLmdldEluc3RhbmNlKClcbmNvbnN0IGJpbnRvb2xzID0gQmluVG9vbHMuZ2V0SW5zdGFuY2UoKVxuXG5leHBvcnQgY2xhc3MgRXhjbHVkZU1lbWJlclByb3Bvc2FsIGV4dGVuZHMgRXNzZW50aWFsUHJvcG9zYWwge1xuICBwcml2YXRlIHJlYWRvbmx5IF90eXBlSUQgPSBQbGF0Zm9ybVZNQ29uc3RhbnRzLkVYQ0xVREVNRU1CRVJQT1JQT1NBTF9UWVBFX0lEXG5cbiAgc2VyaWFsaXplKGVuY29kaW5nOiBTZXJpYWxpemVkRW5jb2RpbmcgPSBcImhleFwiKTogb2JqZWN0IHtcbiAgICByZXR1cm4ge1xuICAgICAgc3RhcnQ6IHNlcmlhbGl6YXRpb24uZW5jb2Rlcih0aGlzLnN0YXJ0LCBlbmNvZGluZywgXCJCdWZmZXJcIiwgXCJudW1iZXJcIiksXG4gICAgICBlbmQ6IHNlcmlhbGl6YXRpb24uZW5jb2Rlcih0aGlzLmVuZCwgZW5jb2RpbmcsIFwiQnVmZmVyXCIsIFwibnVtYmVyXCIpLFxuICAgICAgbWVtYmVyQWRkcmVzczogc2VyaWFsaXphdGlvbi5lbmNvZGVyKFxuICAgICAgICB0aGlzLm1lbWJlckFkZHJlc3MsXG4gICAgICAgIGVuY29kaW5nLFxuICAgICAgICBcIkJ1ZmZlclwiLFxuICAgICAgICBcImNiNThcIlxuICAgICAgKVxuICAgIH1cbiAgfVxuXG4gIGRlc2VyaWFsaXplKGZpZWxkczogb2JqZWN0LCBlbmNvZGluZzogU2VyaWFsaXplZEVuY29kaW5nID0gXCJoZXhcIik6IHRoaXMge1xuICAgIHRoaXMuc3RhcnQgPSBzZXJpYWxpemF0aW9uLmRlY29kZXIoXG4gICAgICBmaWVsZHNbXCJzdGFydFwiXSxcbiAgICAgIGVuY29kaW5nLFxuICAgICAgXCJudW1iZXJcIixcbiAgICAgIFwiQnVmZmVyXCJcbiAgICApXG4gICAgdGhpcy5lbmQgPSBzZXJpYWxpemF0aW9uLmRlY29kZXIoXG4gICAgICBmaWVsZHNbXCJlbmRcIl0sXG4gICAgICBlbmNvZGluZyxcbiAgICAgIFwibnVtYmVyXCIsXG4gICAgICBcIkJ1ZmZlclwiXG4gICAgKVxuICAgIHRoaXMubWVtYmVyQWRkcmVzcyA9IHNlcmlhbGl6YXRpb24uZGVjb2RlcihcbiAgICAgIGZpZWxkc1tcIm1lbWJlckFkZHJlc3NcIl0sXG4gICAgICBlbmNvZGluZyxcbiAgICAgIFwiY2I1OFwiLFxuICAgICAgXCJCdWZmZXJcIixcbiAgICAgIDIwXG4gICAgKVxuXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIGZyb21CdWZmZXIoYnl0ZXM6IEJ1ZmZlciwgb2Zmc2V0OiBudW1iZXIgPSAwKTogbnVtYmVyIHtcbiAgICB0aGlzLm1lbWJlckFkZHJlc3MgPSBiaW50b29scy5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyAyMClcbiAgICBvZmZzZXQgKz0gMjBcbiAgICB0aGlzLnN0YXJ0ID0gYmludG9vbHMuY29weUZyb20oYnl0ZXMsIG9mZnNldCwgb2Zmc2V0ICsgOClcbiAgICBvZmZzZXQgKz0gOFxuICAgIHRoaXMuZW5kID0gYmludG9vbHMuY29weUZyb20oYnl0ZXMsIG9mZnNldCwgb2Zmc2V0ICsgOClcbiAgICBvZmZzZXQgKz0gOFxuICAgIHJldHVybiBvZmZzZXRcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gcmVwcmVzZW50YXRpb24gb2YgdGhlIFtbQmFzZVByb3Bvc2FsXV0uXG4gICAqL1xuICB0b0J1ZmZlcigpOiBCdWZmZXIge1xuICAgIGNvbnN0IGJhcnI6IEJ1ZmZlcltdID0gW3RoaXMubWVtYmVyQWRkcmVzcywgdGhpcy5zdGFydCwgdGhpcy5lbmRdXG4gICAgY29uc3QgYnNpemUgPVxuICAgICAgdGhpcy5tZW1iZXJBZGRyZXNzLmxlbmd0aCArIHRoaXMuc3RhcnQubGVuZ3RoICsgdGhpcy5lbmQubGVuZ3RoXG4gICAgcmV0dXJuIEJ1ZmZlci5jb25jYXQoYmFyciwgYnNpemUpXG4gIH1cblxuICBjb25zdHJ1Y3RvcihzdGFydD86IG51bWJlciwgZW5kPzogbnVtYmVyLCBtZW1iZXJBZGRyZXNzPzogc3RyaW5nIHwgQnVmZmVyKSB7XG4gICAgY29uc3Qgc3RhcnRUaW1lID0gQnVmZmVyLmFsbG9jKDgpXG4gICAgc3RhcnRUaW1lLndyaXRlVUludDMyQkUoc3RhcnQsIDQpXG4gICAgY29uc3QgZW5kVGltZSA9IEJ1ZmZlci5hbGxvYyg4KVxuICAgIGVuZFRpbWUud3JpdGVVSW50MzJCRShlbmQsIDQpXG4gICAgc3VwZXIoc3RhcnRUaW1lLCBlbmRUaW1lKVxuXG4gICAgaWYgKHR5cGVvZiBtZW1iZXJBZGRyZXNzID09PSBcInN0cmluZ1wiKSB7XG4gICAgICB0aGlzLm1lbWJlckFkZHJlc3MgPSBiaW50b29scy5zdHJpbmdUb0FkZHJlc3MobWVtYmVyQWRkcmVzcylcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5tZW1iZXJBZGRyZXNzID0gbWVtYmVyQWRkcmVzc1xuICAgIH1cbiAgfVxuXG4gIHByb3RlY3RlZCBtZW1iZXJBZGRyZXNzID0gQnVmZmVyLmFsbG9jKDIwKVxuXG4gIGdldFR5cGVJRCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl90eXBlSURcbiAgfVxuXG4gIGdldE1lbWJlckFkZHJlc3MoKTogQnVmZmVyIHtcbiAgICByZXR1cm4gdGhpcy5tZW1iZXJBZGRyZXNzXG4gIH1cbn1cbiJdfQ==
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddMemberProposal = void 0;
const buffer_1 = require("buffer/");
const bintools_1 = __importDefault(require("../../../utils/bintools"));
const serialization_1 = require("../../../utils/serialization");
const constants_1 = require("../constants");
const essentialproposal_1 = require("./essentialproposal");
const serialization = serialization_1.Serialization.getInstance();
const bintools = bintools_1.default.getInstance();
class AddMemberProposal extends essentialproposal_1.EssentialProposal {
    serialize(encoding = "hex") {
        return {
            start: serialization.encoder(this.start, encoding, "Buffer", "number"),
            end: serialization.encoder(this.end, encoding, "Buffer", "number"),
            applicantAddress: serialization.encoder(this.applicantAddress, encoding, "Buffer", "cb58")
        };
    }
    deserialize(fields, encoding = "hex") {
        this.start = serialization.decoder(fields["start"], encoding, "number", "Buffer");
        this.end = serialization.decoder(fields["end"], encoding, "number", "Buffer");
        this.applicantAddress = serialization.decoder(fields["applicantAddress"], encoding, "cb58", "Buffer", 20);
        return this;
    }
    fromBuffer(bytes, offset = 0) {
        this.applicantAddress = bintools.copyFrom(bytes, offset, offset + 20);
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
        const barr = [this.applicantAddress, this.start, this.end];
        const bsize = this.applicantAddress.length + this.start.length + this.end.length;
        return buffer_1.Buffer.concat(barr, bsize);
    }
    constructor(start, end, applicantAddress) {
        const startTime = buffer_1.Buffer.alloc(8);
        startTime.writeUInt32BE(start, 4);
        const endTime = buffer_1.Buffer.alloc(8);
        endTime.writeUInt32BE(end, 4);
        super(startTime, endTime);
        this._typeID = constants_1.PlatformVMConstants.ADDMEMBERPORPOSAL_TYPE_ID;
        this.applicantAddress = buffer_1.Buffer.alloc(20);
        if (typeof applicantAddress === "string") {
            this.applicantAddress = bintools.stringToAddress(applicantAddress);
        }
        else {
            this.applicantAddress = applicantAddress;
        }
    }
    getTypeID() {
        return this._typeID;
    }
    getApplicantAddress() {
        return this.applicantAddress;
    }
}
exports.AddMemberProposal = AddMemberProposal;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRkbWVtYmVycHJvcG9zYWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvYXBpcy9wbGF0Zm9ybXZtL2FkZHByb3Bvc2FsdHgvYWRkbWVtYmVycHJvcG9zYWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsb0NBQWdDO0FBQ2hDLHVFQUE4QztBQUM5QyxnRUFBZ0Y7QUFDaEYsNENBQWtEO0FBQ2xELDJEQUF1RDtBQUV2RCxNQUFNLGFBQWEsR0FBRyw2QkFBYSxDQUFDLFdBQVcsRUFBRSxDQUFBO0FBQ2pELE1BQU0sUUFBUSxHQUFHLGtCQUFRLENBQUMsV0FBVyxFQUFFLENBQUE7QUFFdkMsTUFBYSxpQkFBa0IsU0FBUSxxQ0FBaUI7SUFHdEQsU0FBUyxDQUFDLFdBQStCLEtBQUs7UUFDNUMsT0FBTztZQUNMLEtBQUssRUFBRSxhQUFhLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxRQUFRLENBQUM7WUFDdEUsR0FBRyxFQUFFLGFBQWEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLFFBQVEsQ0FBQztZQUNsRSxnQkFBZ0IsRUFBRSxhQUFhLENBQUMsT0FBTyxDQUNyQyxJQUFJLENBQUMsZ0JBQWdCLEVBQ3JCLFFBQVEsRUFDUixRQUFRLEVBQ1IsTUFBTSxDQUNQO1NBQ0YsQ0FBQTtJQUNILENBQUM7SUFFRCxXQUFXLENBQUMsTUFBYyxFQUFFLFdBQStCLEtBQUs7UUFDOUQsSUFBSSxDQUFDLEtBQUssR0FBRyxhQUFhLENBQUMsT0FBTyxDQUNoQyxNQUFNLENBQUMsT0FBTyxDQUFDLEVBQ2YsUUFBUSxFQUNSLFFBQVEsRUFDUixRQUFRLENBQ1QsQ0FBQTtRQUNELElBQUksQ0FBQyxHQUFHLEdBQUcsYUFBYSxDQUFDLE9BQU8sQ0FDOUIsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUNiLFFBQVEsRUFDUixRQUFRLEVBQ1IsUUFBUSxDQUNULENBQUE7UUFDRCxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsYUFBYSxDQUFDLE9BQU8sQ0FDM0MsTUFBTSxDQUFDLGtCQUFrQixDQUFDLEVBQzFCLFFBQVEsRUFDUixNQUFNLEVBQ04sUUFBUSxFQUNSLEVBQUUsQ0FDSCxDQUFBO1FBRUQsT0FBTyxJQUFJLENBQUE7SUFDYixDQUFDO0lBRUQsVUFBVSxDQUFDLEtBQWEsRUFBRSxTQUFpQixDQUFDO1FBQzFDLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxRQUFRLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxHQUFHLEVBQUUsQ0FBQyxDQUFBO1FBQ3JFLE1BQU0sSUFBSSxFQUFFLENBQUE7UUFDWixJQUFJLENBQUMsS0FBSyxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUE7UUFDekQsTUFBTSxJQUFJLENBQUMsQ0FBQTtRQUNYLElBQUksQ0FBQyxHQUFHLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQTtRQUN2RCxNQUFNLElBQUksQ0FBQyxDQUFBO1FBQ1gsT0FBTyxNQUFNLENBQUE7SUFDZixDQUFDO0lBRUQ7O09BRUc7SUFDSCxRQUFRO1FBQ04sTUFBTSxJQUFJLEdBQWEsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDcEUsTUFBTSxLQUFLLEdBQ1QsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQTtRQUNwRSxPQUFPLGVBQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFBO0lBQ25DLENBQUM7SUFFRCxZQUNFLEtBQWMsRUFDZCxHQUFZLEVBQ1osZ0JBQWtDO1FBRWxDLE1BQU0sU0FBUyxHQUFHLGVBQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDakMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUE7UUFDakMsTUFBTSxPQUFPLEdBQUcsZUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUMvQixPQUFPLENBQUMsYUFBYSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQTtRQUM3QixLQUFLLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFBO1FBcEVWLFlBQU8sR0FBRywrQkFBbUIsQ0FBQyx5QkFBeUIsQ0FBQTtRQTZFOUQscUJBQWdCLEdBQUcsZUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQVAzQyxJQUFJLE9BQU8sZ0JBQWdCLEtBQUssUUFBUSxFQUFFO1lBQ3hDLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxRQUFRLENBQUMsZUFBZSxDQUFDLGdCQUFnQixDQUFDLENBQUE7U0FDbkU7YUFBTTtZQUNMLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxnQkFBZ0IsQ0FBQTtTQUN6QztJQUNILENBQUM7SUFJRCxTQUFTO1FBQ1AsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFBO0lBQ3JCLENBQUM7SUFFRCxtQkFBbUI7UUFDakIsT0FBTyxJQUFJLENBQUMsZ0JBQWdCLENBQUE7SUFDOUIsQ0FBQztDQUNGO0FBdkZELDhDQXVGQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEJ1ZmZlciB9IGZyb20gXCJidWZmZXIvXCJcbmltcG9ydCBCaW5Ub29scyBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvYmludG9vbHNcIlxuaW1wb3J0IHsgU2VyaWFsaXphdGlvbiwgU2VyaWFsaXplZEVuY29kaW5nIH0gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL3NlcmlhbGl6YXRpb25cIlxuaW1wb3J0IHsgUGxhdGZvcm1WTUNvbnN0YW50cyB9IGZyb20gXCIuLi9jb25zdGFudHNcIlxuaW1wb3J0IHsgRXNzZW50aWFsUHJvcG9zYWwgfSBmcm9tIFwiLi9lc3NlbnRpYWxwcm9wb3NhbFwiXG5cbmNvbnN0IHNlcmlhbGl6YXRpb24gPSBTZXJpYWxpemF0aW9uLmdldEluc3RhbmNlKClcbmNvbnN0IGJpbnRvb2xzID0gQmluVG9vbHMuZ2V0SW5zdGFuY2UoKVxuXG5leHBvcnQgY2xhc3MgQWRkTWVtYmVyUHJvcG9zYWwgZXh0ZW5kcyBFc3NlbnRpYWxQcm9wb3NhbCB7XG4gIHByaXZhdGUgcmVhZG9ubHkgX3R5cGVJRCA9IFBsYXRmb3JtVk1Db25zdGFudHMuQURETUVNQkVSUE9SUE9TQUxfVFlQRV9JRFxuXG4gIHNlcmlhbGl6ZShlbmNvZGluZzogU2VyaWFsaXplZEVuY29kaW5nID0gXCJoZXhcIik6IG9iamVjdCB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHN0YXJ0OiBzZXJpYWxpemF0aW9uLmVuY29kZXIodGhpcy5zdGFydCwgZW5jb2RpbmcsIFwiQnVmZmVyXCIsIFwibnVtYmVyXCIpLFxuICAgICAgZW5kOiBzZXJpYWxpemF0aW9uLmVuY29kZXIodGhpcy5lbmQsIGVuY29kaW5nLCBcIkJ1ZmZlclwiLCBcIm51bWJlclwiKSxcbiAgICAgIGFwcGxpY2FudEFkZHJlc3M6IHNlcmlhbGl6YXRpb24uZW5jb2RlcihcbiAgICAgICAgdGhpcy5hcHBsaWNhbnRBZGRyZXNzLFxuICAgICAgICBlbmNvZGluZyxcbiAgICAgICAgXCJCdWZmZXJcIixcbiAgICAgICAgXCJjYjU4XCJcbiAgICAgIClcbiAgICB9XG4gIH1cblxuICBkZXNlcmlhbGl6ZShmaWVsZHM6IG9iamVjdCwgZW5jb2Rpbmc6IFNlcmlhbGl6ZWRFbmNvZGluZyA9IFwiaGV4XCIpOiB0aGlzIHtcbiAgICB0aGlzLnN0YXJ0ID0gc2VyaWFsaXphdGlvbi5kZWNvZGVyKFxuICAgICAgZmllbGRzW1wic3RhcnRcIl0sXG4gICAgICBlbmNvZGluZyxcbiAgICAgIFwibnVtYmVyXCIsXG4gICAgICBcIkJ1ZmZlclwiXG4gICAgKVxuICAgIHRoaXMuZW5kID0gc2VyaWFsaXphdGlvbi5kZWNvZGVyKFxuICAgICAgZmllbGRzW1wiZW5kXCJdLFxuICAgICAgZW5jb2RpbmcsXG4gICAgICBcIm51bWJlclwiLFxuICAgICAgXCJCdWZmZXJcIlxuICAgIClcbiAgICB0aGlzLmFwcGxpY2FudEFkZHJlc3MgPSBzZXJpYWxpemF0aW9uLmRlY29kZXIoXG4gICAgICBmaWVsZHNbXCJhcHBsaWNhbnRBZGRyZXNzXCJdLFxuICAgICAgZW5jb2RpbmcsXG4gICAgICBcImNiNThcIixcbiAgICAgIFwiQnVmZmVyXCIsXG4gICAgICAyMFxuICAgIClcblxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBmcm9tQnVmZmVyKGJ5dGVzOiBCdWZmZXIsIG9mZnNldDogbnVtYmVyID0gMCk6IG51bWJlciB7XG4gICAgdGhpcy5hcHBsaWNhbnRBZGRyZXNzID0gYmludG9vbHMuY29weUZyb20oYnl0ZXMsIG9mZnNldCwgb2Zmc2V0ICsgMjApXG4gICAgb2Zmc2V0ICs9IDIwXG4gICAgdGhpcy5zdGFydCA9IGJpbnRvb2xzLmNvcHlGcm9tKGJ5dGVzLCBvZmZzZXQsIG9mZnNldCArIDgpXG4gICAgb2Zmc2V0ICs9IDhcbiAgICB0aGlzLmVuZCA9IGJpbnRvb2xzLmNvcHlGcm9tKGJ5dGVzLCBvZmZzZXQsIG9mZnNldCArIDgpXG4gICAgb2Zmc2V0ICs9IDhcbiAgICByZXR1cm4gb2Zmc2V0XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IHJlcHJlc2VudGF0aW9uIG9mIHRoZSBbW0Jhc2VQcm9wb3NhbF1dLlxuICAgKi9cbiAgdG9CdWZmZXIoKTogQnVmZmVyIHtcbiAgICBjb25zdCBiYXJyOiBCdWZmZXJbXSA9IFt0aGlzLmFwcGxpY2FudEFkZHJlc3MsIHRoaXMuc3RhcnQsIHRoaXMuZW5kXVxuICAgIGNvbnN0IGJzaXplID1cbiAgICAgIHRoaXMuYXBwbGljYW50QWRkcmVzcy5sZW5ndGggKyB0aGlzLnN0YXJ0Lmxlbmd0aCArIHRoaXMuZW5kLmxlbmd0aFxuICAgIHJldHVybiBCdWZmZXIuY29uY2F0KGJhcnIsIGJzaXplKVxuICB9XG5cbiAgY29uc3RydWN0b3IoXG4gICAgc3RhcnQ/OiBudW1iZXIsXG4gICAgZW5kPzogbnVtYmVyLFxuICAgIGFwcGxpY2FudEFkZHJlc3M/OiBzdHJpbmcgfCBCdWZmZXJcbiAgKSB7XG4gICAgY29uc3Qgc3RhcnRUaW1lID0gQnVmZmVyLmFsbG9jKDgpXG4gICAgc3RhcnRUaW1lLndyaXRlVUludDMyQkUoc3RhcnQsIDQpXG4gICAgY29uc3QgZW5kVGltZSA9IEJ1ZmZlci5hbGxvYyg4KVxuICAgIGVuZFRpbWUud3JpdGVVSW50MzJCRShlbmQsIDQpXG4gICAgc3VwZXIoc3RhcnRUaW1lLCBlbmRUaW1lKVxuXG4gICAgaWYgKHR5cGVvZiBhcHBsaWNhbnRBZGRyZXNzID09PSBcInN0cmluZ1wiKSB7XG4gICAgICB0aGlzLmFwcGxpY2FudEFkZHJlc3MgPSBiaW50b29scy5zdHJpbmdUb0FkZHJlc3MoYXBwbGljYW50QWRkcmVzcylcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5hcHBsaWNhbnRBZGRyZXNzID0gYXBwbGljYW50QWRkcmVzc1xuICAgIH1cbiAgfVxuXG4gIHByb3RlY3RlZCBhcHBsaWNhbnRBZGRyZXNzID0gQnVmZmVyLmFsbG9jKDIwKVxuXG4gIGdldFR5cGVJRCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl90eXBlSURcbiAgfVxuXG4gIGdldEFwcGxpY2FudEFkZHJlc3MoKTogQnVmZmVyIHtcbiAgICByZXR1cm4gdGhpcy5hcHBsaWNhbnRBZGRyZXNzXG4gIH1cbn1cbiJdfQ==
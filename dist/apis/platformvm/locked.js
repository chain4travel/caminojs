"use strict";
/**
 * @packageDocumentation
 * @module API-PlatformVM-Locked
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LockedIDs = exports.SerializableTxID = void 0;
const buffer_1 = require("buffer/");
const bintools_1 = __importDefault(require("../../utils/bintools"));
const serialization_1 = require("../../utils/serialization");
const bintools = bintools_1.default.getInstance();
const serialization = serialization_1.Serialization.getInstance();
class SerializableTxID {
    constructor() {
        this.txid = buffer_1.Buffer.alloc(32);
    }
    encode(encoding = "hex") {
        return serialization.encoder(this.txid, encoding, "Buffer", "cb58");
    }
    decode(value, encoding = "hex") {
        this.txid = serialization.decoder(value, encoding, "cb58", "Buffer", 32);
    }
    isEmpty() {
        return this.txid.equals(buffer_1.Buffer.alloc(32));
    }
    fromBuffer(bytes, offset = 0) {
        this.txid = bintools.copyFrom(bytes, offset, offset + 32);
        return offset + 32;
    }
    toBuffer() {
        return this.txid;
    }
}
exports.SerializableTxID = SerializableTxID;
class LockedIDs {
    serialize(encoding = "hex") {
        let lockObj = {
            depositTxID: this.depositTxID.encode(encoding),
            bondTxID: this.bondTxID.encode(encoding)
        };
        return lockObj;
    }
    deserialize(fields, encoding = "hex") {
        this.depositTxID.decode(fields["depositTxID"]);
        this.bondTxID.decode(fields["bondTxID"]);
    }
    getDepositTxID() {
        return this.depositTxID;
    }
    getBondTxID() {
        return this.bondTxID;
    }
    fromBuffer(bytes, offset = 0) {
        offset = this.depositTxID.fromBuffer(bytes, offset);
        offset = this.bondTxID.fromBuffer(bytes, offset);
        return offset;
    }
    toBuffer() {
        return buffer_1.Buffer.concat([this.depositTxID.toBuffer(), this.bondTxID.toBuffer()], 64);
    }
    /**
     * Class representing an [[LockedIDs]] for LockedIn and LockedOut types.
     *
     * @param depositTxID txID where this Output is deposited on
     * @param bondTxID txID where this Output is bonded on
     */
    constructor(depositTxID, bondTxID) {
        this.depositTxID = new SerializableTxID();
        this.bondTxID = new SerializableTxID();
        if (depositTxID)
            this.depositTxID.fromBuffer(depositTxID);
        if (bondTxID)
            this.bondTxID.fromBuffer(bondTxID);
    }
}
exports.LockedIDs = LockedIDs;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9ja2VkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2FwaXMvcGxhdGZvcm12bS9sb2NrZWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7R0FHRzs7Ozs7O0FBRUgsb0NBQWdDO0FBQ2hDLG9FQUEyQztBQUMzQyw2REFBNkU7QUFFN0UsTUFBTSxRQUFRLEdBQWEsa0JBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtBQUNqRCxNQUFNLGFBQWEsR0FBa0IsNkJBQWEsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtBQUVoRSxNQUFhLGdCQUFnQjtJQUE3QjtRQVNZLFNBQUksR0FBVyxlQUFNLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFBO0lBYzNDLENBQUM7SUF0QkMsTUFBTSxDQUFDLFdBQStCLEtBQUs7UUFDekMsT0FBTyxhQUFhLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQTtJQUNyRSxDQUFDO0lBRUQsTUFBTSxDQUFDLEtBQWEsRUFBRSxXQUErQixLQUFLO1FBQ3hELElBQUksQ0FBQyxJQUFJLEdBQUcsYUFBYSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsRUFBRSxDQUFDLENBQUE7SUFDMUUsQ0FBQztJQUlELE9BQU87UUFDTCxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLGVBQU0sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQTtJQUMzQyxDQUFDO0lBRUQsVUFBVSxDQUFDLEtBQWEsRUFBRSxNQUFNLEdBQUcsQ0FBQztRQUNsQyxJQUFJLENBQUMsSUFBSSxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLEdBQUcsRUFBRSxDQUFDLENBQUE7UUFDekQsT0FBTyxNQUFNLEdBQUcsRUFBRSxDQUFBO0lBQ3BCLENBQUM7SUFFRCxRQUFRO1FBQ04sT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFBO0lBQ2xCLENBQUM7Q0FDRjtBQXZCRCw0Q0F1QkM7QUFFRCxNQUFhLFNBQVM7SUFDcEIsU0FBUyxDQUFDLFdBQStCLEtBQUs7UUFDNUMsSUFBSSxPQUFPLEdBQVc7WUFDcEIsV0FBVyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQztZQUM5QyxRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDO1NBQ3pDLENBQUE7UUFDRCxPQUFPLE9BQU8sQ0FBQTtJQUNoQixDQUFDO0lBRUQsV0FBVyxDQUFDLE1BQWMsRUFBRSxXQUErQixLQUFLO1FBQzlELElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFBO1FBQzlDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFBO0lBQzFDLENBQUM7SUFLRCxjQUFjO1FBQ1osT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFBO0lBQ3pCLENBQUM7SUFDRCxXQUFXO1FBQ1QsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFBO0lBQ3RCLENBQUM7SUFFRCxVQUFVLENBQUMsS0FBYSxFQUFFLE1BQU0sR0FBRyxDQUFDO1FBQ2xDLE1BQU0sR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUE7UUFDbkQsTUFBTSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQTtRQUNoRCxPQUFPLE1BQU0sQ0FBQTtJQUNmLENBQUM7SUFFRCxRQUFRO1FBQ04sT0FBTyxlQUFNLENBQUMsTUFBTSxDQUNsQixDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxFQUN2RCxFQUFFLENBQ0gsQ0FBQTtJQUNILENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILFlBQVksV0FBb0IsRUFBRSxRQUFpQjtRQTdCekMsZ0JBQVcsR0FBcUIsSUFBSSxnQkFBZ0IsRUFBRSxDQUFBO1FBQ3RELGFBQVEsR0FBcUIsSUFBSSxnQkFBZ0IsRUFBRSxDQUFBO1FBNkIzRCxJQUFJLFdBQVc7WUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQTtRQUN6RCxJQUFJLFFBQVE7WUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQTtJQUNsRCxDQUFDO0NBQ0Y7QUEvQ0QsOEJBK0NDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAcGFja2FnZURvY3VtZW50YXRpb25cbiAqIEBtb2R1bGUgQVBJLVBsYXRmb3JtVk0tTG9ja2VkXG4gKi9cblxuaW1wb3J0IHsgQnVmZmVyIH0gZnJvbSBcImJ1ZmZlci9cIlxuaW1wb3J0IEJpblRvb2xzIGZyb20gXCIuLi8uLi91dGlscy9iaW50b29sc1wiXG5pbXBvcnQgeyBTZXJpYWxpemF0aW9uLCBTZXJpYWxpemVkRW5jb2RpbmcgfSBmcm9tIFwiLi4vLi4vdXRpbHMvc2VyaWFsaXphdGlvblwiXG5cbmNvbnN0IGJpbnRvb2xzOiBCaW5Ub29scyA9IEJpblRvb2xzLmdldEluc3RhbmNlKClcbmNvbnN0IHNlcmlhbGl6YXRpb246IFNlcmlhbGl6YXRpb24gPSBTZXJpYWxpemF0aW9uLmdldEluc3RhbmNlKClcblxuZXhwb3J0IGNsYXNzIFNlcmlhbGl6YWJsZVR4SUQge1xuICBlbmNvZGUoZW5jb2Rpbmc6IFNlcmlhbGl6ZWRFbmNvZGluZyA9IFwiaGV4XCIpOiBzdHJpbmcge1xuICAgIHJldHVybiBzZXJpYWxpemF0aW9uLmVuY29kZXIodGhpcy50eGlkLCBlbmNvZGluZywgXCJCdWZmZXJcIiwgXCJjYjU4XCIpXG4gIH1cblxuICBkZWNvZGUodmFsdWU6IHN0cmluZywgZW5jb2Rpbmc6IFNlcmlhbGl6ZWRFbmNvZGluZyA9IFwiaGV4XCIpIHtcbiAgICB0aGlzLnR4aWQgPSBzZXJpYWxpemF0aW9uLmRlY29kZXIodmFsdWUsIGVuY29kaW5nLCBcImNiNThcIiwgXCJCdWZmZXJcIiwgMzIpXG4gIH1cblxuICBwcm90ZWN0ZWQgdHhpZDogQnVmZmVyID0gQnVmZmVyLmFsbG9jKDMyKVxuXG4gIGlzRW1wdHkoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMudHhpZC5lcXVhbHMoQnVmZmVyLmFsbG9jKDMyKSlcbiAgfVxuXG4gIGZyb21CdWZmZXIoYnl0ZXM6IEJ1ZmZlciwgb2Zmc2V0ID0gMCk6IG51bWJlciB7XG4gICAgdGhpcy50eGlkID0gYmludG9vbHMuY29weUZyb20oYnl0ZXMsIG9mZnNldCwgb2Zmc2V0ICsgMzIpXG4gICAgcmV0dXJuIG9mZnNldCArIDMyXG4gIH1cblxuICB0b0J1ZmZlcigpOiBCdWZmZXIge1xuICAgIHJldHVybiB0aGlzLnR4aWRcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgTG9ja2VkSURzIHtcbiAgc2VyaWFsaXplKGVuY29kaW5nOiBTZXJpYWxpemVkRW5jb2RpbmcgPSBcImhleFwiKTogb2JqZWN0IHtcbiAgICBsZXQgbG9ja09iajogb2JqZWN0ID0ge1xuICAgICAgZGVwb3NpdFR4SUQ6IHRoaXMuZGVwb3NpdFR4SUQuZW5jb2RlKGVuY29kaW5nKSxcbiAgICAgIGJvbmRUeElEOiB0aGlzLmJvbmRUeElELmVuY29kZShlbmNvZGluZylcbiAgICB9XG4gICAgcmV0dXJuIGxvY2tPYmpcbiAgfVxuXG4gIGRlc2VyaWFsaXplKGZpZWxkczogb2JqZWN0LCBlbmNvZGluZzogU2VyaWFsaXplZEVuY29kaW5nID0gXCJoZXhcIikge1xuICAgIHRoaXMuZGVwb3NpdFR4SUQuZGVjb2RlKGZpZWxkc1tcImRlcG9zaXRUeElEXCJdKVxuICAgIHRoaXMuYm9uZFR4SUQuZGVjb2RlKGZpZWxkc1tcImJvbmRUeElEXCJdKVxuICB9XG5cbiAgcHJvdGVjdGVkIGRlcG9zaXRUeElEOiBTZXJpYWxpemFibGVUeElEID0gbmV3IFNlcmlhbGl6YWJsZVR4SUQoKVxuICBwcm90ZWN0ZWQgYm9uZFR4SUQ6IFNlcmlhbGl6YWJsZVR4SUQgPSBuZXcgU2VyaWFsaXphYmxlVHhJRCgpXG5cbiAgZ2V0RGVwb3NpdFR4SUQoKTogU2VyaWFsaXphYmxlVHhJRCB7XG4gICAgcmV0dXJuIHRoaXMuZGVwb3NpdFR4SURcbiAgfVxuICBnZXRCb25kVHhJRCgpOiBTZXJpYWxpemFibGVUeElEIHtcbiAgICByZXR1cm4gdGhpcy5ib25kVHhJRFxuICB9XG5cbiAgZnJvbUJ1ZmZlcihieXRlczogQnVmZmVyLCBvZmZzZXQgPSAwKTogbnVtYmVyIHtcbiAgICBvZmZzZXQgPSB0aGlzLmRlcG9zaXRUeElELmZyb21CdWZmZXIoYnl0ZXMsIG9mZnNldClcbiAgICBvZmZzZXQgPSB0aGlzLmJvbmRUeElELmZyb21CdWZmZXIoYnl0ZXMsIG9mZnNldClcbiAgICByZXR1cm4gb2Zmc2V0XG4gIH1cblxuICB0b0J1ZmZlcigpOiBCdWZmZXIge1xuICAgIHJldHVybiBCdWZmZXIuY29uY2F0KFxuICAgICAgW3RoaXMuZGVwb3NpdFR4SUQudG9CdWZmZXIoKSwgdGhpcy5ib25kVHhJRC50b0J1ZmZlcigpXSxcbiAgICAgIDY0XG4gICAgKVxuICB9XG5cbiAgLyoqXG4gICAqIENsYXNzIHJlcHJlc2VudGluZyBhbiBbW0xvY2tlZElEc11dIGZvciBMb2NrZWRJbiBhbmQgTG9ja2VkT3V0IHR5cGVzLlxuICAgKlxuICAgKiBAcGFyYW0gZGVwb3NpdFR4SUQgdHhJRCB3aGVyZSB0aGlzIE91dHB1dCBpcyBkZXBvc2l0ZWQgb25cbiAgICogQHBhcmFtIGJvbmRUeElEIHR4SUQgd2hlcmUgdGhpcyBPdXRwdXQgaXMgYm9uZGVkIG9uXG4gICAqL1xuICBjb25zdHJ1Y3RvcihkZXBvc2l0VHhJRD86IEJ1ZmZlciwgYm9uZFR4SUQ/OiBCdWZmZXIpIHtcbiAgICBpZiAoZGVwb3NpdFR4SUQpIHRoaXMuZGVwb3NpdFR4SUQuZnJvbUJ1ZmZlcihkZXBvc2l0VHhJRClcbiAgICBpZiAoYm9uZFR4SUQpIHRoaXMuYm9uZFR4SUQuZnJvbUJ1ZmZlcihib25kVHhJRClcbiAgfVxufVxuIl19
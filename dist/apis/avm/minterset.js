"use strict";
/**
 * @packageDocumentation
 * @module API-AVM-MinterSet
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MinterSet = void 0;
const buffer_1 = require("buffer/");
const bintools_1 = __importDefault(require("../../utils/bintools"));
const serialization_1 = require("../../utils/serialization");
/**
 * @ignore
 */
const bintools = bintools_1.default.getInstance();
const serialization = serialization_1.Serialization.getInstance();
const decimalString = "decimalString";
const cb58 = "cb58";
const num = "number";
const buffer = "Buffer";
/**
 * Class for representing a threshold and set of minting addresses in Avalanche.
 *
 * @typeparam MinterSet including a threshold and array of addresses
 */
class MinterSet extends serialization_1.Serializable {
    serialize(encoding = "hex") {
        const fields = super.serialize(encoding);
        return Object.assign(Object.assign({}, fields), { threshold: serialization.encoder(this.threshold, encoding, num, decimalString, 4), minters: this.minters.map((m) => serialization.encoder(m, encoding, buffer, cb58, 20)) });
    }
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        this.threshold = serialization.decoder(fields["threshold"], encoding, decimalString, num, 4);
        this.minters = fields["minters"].map((m) => serialization.decoder(m, encoding, cb58, buffer, 20));
    }
    /**
     *
     * @param threshold The number of signatures required to mint more of an asset by signing a minting transaction
     * @param minters Array of addresss which are authorized to sign a minting transaction
     */
    constructor(threshold = 1, minters = []) {
        super();
        this._typeName = "MinterSet";
        this._typeID = undefined;
        this.minters = [];
        /**
         * Returns the threshold.
         */
        this.getThreshold = () => {
            return this.threshold;
        };
        /**
         * Returns the minters.
         */
        this.getMinters = () => {
            return this.minters;
        };
        this._cleanAddresses = (addresses) => {
            let addrs = [];
            for (let i = 0; i < addresses.length; i++) {
                if (typeof addresses[`${i}`] === "string") {
                    addrs.push(bintools.stringToAddress(addresses[`${i}`]));
                }
                else if (addresses[`${i}`] instanceof buffer_1.Buffer) {
                    addrs.push(addresses[`${i}`]);
                }
            }
            return addrs;
        };
        this.threshold = threshold;
        this.minters = this._cleanAddresses(minters);
    }
}
exports.MinterSet = MinterSet;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWludGVyc2V0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2FwaXMvYXZtL21pbnRlcnNldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztHQUdHOzs7Ozs7QUFFSCxvQ0FBZ0M7QUFDaEMsb0VBQTJDO0FBQzNDLDZEQUtrQztBQUVsQzs7R0FFRztBQUNILE1BQU0sUUFBUSxHQUFhLGtCQUFRLENBQUMsV0FBVyxFQUFFLENBQUE7QUFDakQsTUFBTSxhQUFhLEdBQWtCLDZCQUFhLENBQUMsV0FBVyxFQUFFLENBQUE7QUFDaEUsTUFBTSxhQUFhLEdBQW1CLGVBQWUsQ0FBQTtBQUNyRCxNQUFNLElBQUksR0FBbUIsTUFBTSxDQUFBO0FBQ25DLE1BQU0sR0FBRyxHQUFtQixRQUFRLENBQUE7QUFDcEMsTUFBTSxNQUFNLEdBQW1CLFFBQVEsQ0FBQTtBQUV2Qzs7OztHQUlHO0FBQ0gsTUFBYSxTQUFVLFNBQVEsNEJBQVk7SUFJekMsU0FBUyxDQUFDLFdBQStCLEtBQUs7UUFDNUMsTUFBTSxNQUFNLEdBQVcsS0FBSyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQTtRQUNoRCx1Q0FDSyxNQUFNLEtBQ1QsU0FBUyxFQUFFLGFBQWEsQ0FBQyxPQUFPLENBQzlCLElBQUksQ0FBQyxTQUFTLEVBQ2QsUUFBUSxFQUNSLEdBQUcsRUFDSCxhQUFhLEVBQ2IsQ0FBQyxDQUNGLEVBQ0QsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FDOUIsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQ3JELElBQ0Y7SUFDSCxDQUFDO0lBQ0QsV0FBVyxDQUFDLE1BQWMsRUFBRSxXQUErQixLQUFLO1FBQzlELEtBQUssQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFBO1FBQ25DLElBQUksQ0FBQyxTQUFTLEdBQUcsYUFBYSxDQUFDLE9BQU8sQ0FDcEMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxFQUNuQixRQUFRLEVBQ1IsYUFBYSxFQUNiLEdBQUcsRUFDSCxDQUFDLENBQ0YsQ0FBQTtRQUNELElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQVMsRUFBRSxFQUFFLENBQ2pELGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLEVBQUUsQ0FBQyxDQUNyRCxDQUFBO0lBQ0gsQ0FBQztJQStCRDs7OztPQUlHO0lBQ0gsWUFBWSxZQUFvQixDQUFDLEVBQUUsVUFBK0IsRUFBRTtRQUNsRSxLQUFLLEVBQUUsQ0FBQTtRQXBFQyxjQUFTLEdBQUcsV0FBVyxDQUFBO1FBQ3ZCLFlBQU8sR0FBRyxTQUFTLENBQUE7UUFpQ25CLFlBQU8sR0FBYSxFQUFFLENBQUE7UUFFaEM7O1dBRUc7UUFDSCxpQkFBWSxHQUFHLEdBQVcsRUFBRTtZQUMxQixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUE7UUFDdkIsQ0FBQyxDQUFBO1FBRUQ7O1dBRUc7UUFDSCxlQUFVLEdBQUcsR0FBYSxFQUFFO1lBQzFCLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQTtRQUNyQixDQUFDLENBQUE7UUFFUyxvQkFBZSxHQUFHLENBQUMsU0FBOEIsRUFBWSxFQUFFO1lBQ3ZFLElBQUksS0FBSyxHQUFhLEVBQUUsQ0FBQTtZQUN4QixLQUFLLElBQUksQ0FBQyxHQUFXLENBQUMsRUFBRSxDQUFDLEdBQUcsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDakQsSUFBSSxPQUFPLFNBQVMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEtBQUssUUFBUSxFQUFFO29CQUN6QyxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQVcsQ0FBQyxDQUFDLENBQUE7aUJBQ2xFO3FCQUFNLElBQUksU0FBUyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsWUFBWSxlQUFNLEVBQUU7b0JBQzlDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQVcsQ0FBQyxDQUFBO2lCQUN4QzthQUNGO1lBQ0QsT0FBTyxLQUFLLENBQUE7UUFDZCxDQUFDLENBQUE7UUFTQyxJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQTtRQUMxQixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLENBQUE7SUFDOUMsQ0FBQztDQUNGO0FBekVELDhCQXlFQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQHBhY2thZ2VEb2N1bWVudGF0aW9uXG4gKiBAbW9kdWxlIEFQSS1BVk0tTWludGVyU2V0XG4gKi9cblxuaW1wb3J0IHsgQnVmZmVyIH0gZnJvbSBcImJ1ZmZlci9cIlxuaW1wb3J0IEJpblRvb2xzIGZyb20gXCIuLi8uLi91dGlscy9iaW50b29sc1wiXG5pbXBvcnQge1xuICBTZXJpYWxpemFibGUsXG4gIFNlcmlhbGl6YXRpb24sXG4gIFNlcmlhbGl6ZWRFbmNvZGluZyxcbiAgU2VyaWFsaXplZFR5cGVcbn0gZnJvbSBcIi4uLy4uL3V0aWxzL3NlcmlhbGl6YXRpb25cIlxuXG4vKipcbiAqIEBpZ25vcmVcbiAqL1xuY29uc3QgYmludG9vbHM6IEJpblRvb2xzID0gQmluVG9vbHMuZ2V0SW5zdGFuY2UoKVxuY29uc3Qgc2VyaWFsaXphdGlvbjogU2VyaWFsaXphdGlvbiA9IFNlcmlhbGl6YXRpb24uZ2V0SW5zdGFuY2UoKVxuY29uc3QgZGVjaW1hbFN0cmluZzogU2VyaWFsaXplZFR5cGUgPSBcImRlY2ltYWxTdHJpbmdcIlxuY29uc3QgY2I1ODogU2VyaWFsaXplZFR5cGUgPSBcImNiNThcIlxuY29uc3QgbnVtOiBTZXJpYWxpemVkVHlwZSA9IFwibnVtYmVyXCJcbmNvbnN0IGJ1ZmZlcjogU2VyaWFsaXplZFR5cGUgPSBcIkJ1ZmZlclwiXG5cbi8qKlxuICogQ2xhc3MgZm9yIHJlcHJlc2VudGluZyBhIHRocmVzaG9sZCBhbmQgc2V0IG9mIG1pbnRpbmcgYWRkcmVzc2VzIGluIEF2YWxhbmNoZS5cbiAqXG4gKiBAdHlwZXBhcmFtIE1pbnRlclNldCBpbmNsdWRpbmcgYSB0aHJlc2hvbGQgYW5kIGFycmF5IG9mIGFkZHJlc3Nlc1xuICovXG5leHBvcnQgY2xhc3MgTWludGVyU2V0IGV4dGVuZHMgU2VyaWFsaXphYmxlIHtcbiAgcHJvdGVjdGVkIF90eXBlTmFtZSA9IFwiTWludGVyU2V0XCJcbiAgcHJvdGVjdGVkIF90eXBlSUQgPSB1bmRlZmluZWRcblxuICBzZXJpYWxpemUoZW5jb2Rpbmc6IFNlcmlhbGl6ZWRFbmNvZGluZyA9IFwiaGV4XCIpOiBvYmplY3Qge1xuICAgIGNvbnN0IGZpZWxkczogb2JqZWN0ID0gc3VwZXIuc2VyaWFsaXplKGVuY29kaW5nKVxuICAgIHJldHVybiB7XG4gICAgICAuLi5maWVsZHMsXG4gICAgICB0aHJlc2hvbGQ6IHNlcmlhbGl6YXRpb24uZW5jb2RlcihcbiAgICAgICAgdGhpcy50aHJlc2hvbGQsXG4gICAgICAgIGVuY29kaW5nLFxuICAgICAgICBudW0sXG4gICAgICAgIGRlY2ltYWxTdHJpbmcsXG4gICAgICAgIDRcbiAgICAgICksXG4gICAgICBtaW50ZXJzOiB0aGlzLm1pbnRlcnMubWFwKChtKSA9PlxuICAgICAgICBzZXJpYWxpemF0aW9uLmVuY29kZXIobSwgZW5jb2RpbmcsIGJ1ZmZlciwgY2I1OCwgMjApXG4gICAgICApXG4gICAgfVxuICB9XG4gIGRlc2VyaWFsaXplKGZpZWxkczogb2JqZWN0LCBlbmNvZGluZzogU2VyaWFsaXplZEVuY29kaW5nID0gXCJoZXhcIikge1xuICAgIHN1cGVyLmRlc2VyaWFsaXplKGZpZWxkcywgZW5jb2RpbmcpXG4gICAgdGhpcy50aHJlc2hvbGQgPSBzZXJpYWxpemF0aW9uLmRlY29kZXIoXG4gICAgICBmaWVsZHNbXCJ0aHJlc2hvbGRcIl0sXG4gICAgICBlbmNvZGluZyxcbiAgICAgIGRlY2ltYWxTdHJpbmcsXG4gICAgICBudW0sXG4gICAgICA0XG4gICAgKVxuICAgIHRoaXMubWludGVycyA9IGZpZWxkc1tcIm1pbnRlcnNcIl0ubWFwKChtOiBzdHJpbmcpID0+XG4gICAgICBzZXJpYWxpemF0aW9uLmRlY29kZXIobSwgZW5jb2RpbmcsIGNiNTgsIGJ1ZmZlciwgMjApXG4gICAgKVxuICB9XG5cbiAgcHJvdGVjdGVkIHRocmVzaG9sZDogbnVtYmVyXG4gIHByb3RlY3RlZCBtaW50ZXJzOiBCdWZmZXJbXSA9IFtdXG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHRocmVzaG9sZC5cbiAgICovXG4gIGdldFRocmVzaG9sZCA9ICgpOiBudW1iZXIgPT4ge1xuICAgIHJldHVybiB0aGlzLnRocmVzaG9sZFxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIG1pbnRlcnMuXG4gICAqL1xuICBnZXRNaW50ZXJzID0gKCk6IEJ1ZmZlcltdID0+IHtcbiAgICByZXR1cm4gdGhpcy5taW50ZXJzXG4gIH1cblxuICBwcm90ZWN0ZWQgX2NsZWFuQWRkcmVzc2VzID0gKGFkZHJlc3Nlczogc3RyaW5nW10gfCBCdWZmZXJbXSk6IEJ1ZmZlcltdID0+IHtcbiAgICBsZXQgYWRkcnM6IEJ1ZmZlcltdID0gW11cbiAgICBmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgYWRkcmVzc2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAodHlwZW9mIGFkZHJlc3Nlc1tgJHtpfWBdID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgIGFkZHJzLnB1c2goYmludG9vbHMuc3RyaW5nVG9BZGRyZXNzKGFkZHJlc3Nlc1tgJHtpfWBdIGFzIHN0cmluZykpXG4gICAgICB9IGVsc2UgaWYgKGFkZHJlc3Nlc1tgJHtpfWBdIGluc3RhbmNlb2YgQnVmZmVyKSB7XG4gICAgICAgIGFkZHJzLnB1c2goYWRkcmVzc2VzW2Ake2l9YF0gYXMgQnVmZmVyKVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gYWRkcnNcbiAgfVxuXG4gIC8qKlxuICAgKlxuICAgKiBAcGFyYW0gdGhyZXNob2xkIFRoZSBudW1iZXIgb2Ygc2lnbmF0dXJlcyByZXF1aXJlZCB0byBtaW50IG1vcmUgb2YgYW4gYXNzZXQgYnkgc2lnbmluZyBhIG1pbnRpbmcgdHJhbnNhY3Rpb25cbiAgICogQHBhcmFtIG1pbnRlcnMgQXJyYXkgb2YgYWRkcmVzc3Mgd2hpY2ggYXJlIGF1dGhvcml6ZWQgdG8gc2lnbiBhIG1pbnRpbmcgdHJhbnNhY3Rpb25cbiAgICovXG4gIGNvbnN0cnVjdG9yKHRocmVzaG9sZDogbnVtYmVyID0gMSwgbWludGVyczogc3RyaW5nW10gfCBCdWZmZXJbXSA9IFtdKSB7XG4gICAgc3VwZXIoKVxuICAgIHRoaXMudGhyZXNob2xkID0gdGhyZXNob2xkXG4gICAgdGhpcy5taW50ZXJzID0gdGhpcy5fY2xlYW5BZGRyZXNzZXMobWludGVycylcbiAgfVxufVxuIl19
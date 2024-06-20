"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubnetAuth = void 0;
/**
 * @packageDocumentation
 * @module API-PlatformVM-SubnetAuth
 */
const buffer_1 = require("buffer/");
const bintools_1 = __importDefault(require("../../utils/bintools"));
const utils_1 = require("../../utils");
const _1 = require(".");
/**
 * @ignore
 */
const bintools = bintools_1.default.getInstance();
class SubnetAuth extends utils_1.Serializable {
    constructor() {
        super(...arguments);
        this._typeName = "SubnetAuth";
        this._typeID = _1.PlatformVMConstants.SUBNETAUTH;
        this.addressIndices = [];
        this.numAddressIndices = buffer_1.Buffer.alloc(4);
    }
    serialize(encoding = "hex") {
        let fields = super.serialize(encoding);
        return Object.assign({}, fields);
    }
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
    }
    /**
     * Add an address index for Subnet Auth signing
     *
     * @param index the Buffer of the address index to add
     */
    addAddressIndex(index) {
        this.addressIndices.push(index);
        this.numAddressIndices.writeUIntBE(this.addressIndices.length, 0, 4);
    }
    /**
     * Returns the number of address indices as a number
     */
    getNumAddressIndices() {
        return this.numAddressIndices.readUIntBE(0, 4);
    }
    /**
     * Returns an array of AddressIndices as Buffers
     */
    getAddressIndices() {
        return this.addressIndices;
    }
    /**
     * Set an array of AddressIndices as Buffers
     */
    setAddressIndices(addressIndices) {
        this.addressIndices = addressIndices;
        this.numAddressIndices.writeUIntBE(this.addressIndices.length, 0, 4);
    }
    fromBuffer(bytes, offset = 0) {
        // increase offset for type id
        offset += 4;
        this.numAddressIndices = bintools.copyFrom(bytes, offset, offset + 4);
        offset += 4;
        this.addressIndices = [];
        for (let i = 0; i < this.getNumAddressIndices(); i++) {
            this.addressIndices.push(bintools.copyFrom(bytes, offset, offset + 4));
            offset += 4;
        }
        return offset;
    }
    /**
     * Returns a {@link https://github.com/feross/buffer|Buffer} representation of the [[SubnetAuth]].
     */
    toBuffer() {
        const typeIDBuf = buffer_1.Buffer.alloc(4);
        typeIDBuf.writeUIntBE(this._typeID, 0, 4);
        const numAddressIndices = buffer_1.Buffer.alloc(4);
        numAddressIndices.writeIntBE(this.addressIndices.length, 0, 4);
        const barr = [typeIDBuf, numAddressIndices];
        let bsize = typeIDBuf.length + numAddressIndices.length;
        this.addressIndices.forEach((addressIndex) => {
            bsize += 4;
            barr.push(addressIndex);
        });
        return buffer_1.Buffer.concat(barr, bsize);
    }
}
exports.SubnetAuth = SubnetAuth;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3VibmV0YXV0aC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hcGlzL3BsYXRmb3Jtdm0vc3VibmV0YXV0aC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTs7O0dBR0c7QUFDSCxvQ0FBZ0M7QUFDaEMsb0VBQTJDO0FBQzNDLHVDQUE4RDtBQUM5RCx3QkFBdUM7QUFFdkM7O0dBRUc7QUFDSCxNQUFNLFFBQVEsR0FBYSxrQkFBUSxDQUFDLFdBQVcsRUFBRSxDQUFBO0FBRWpELE1BQWEsVUFBVyxTQUFRLG9CQUFZO0lBQTVDOztRQUNZLGNBQVMsR0FBRyxZQUFZLENBQUE7UUFDeEIsWUFBTyxHQUFHLHNCQUFtQixDQUFDLFVBQVUsQ0FBQTtRQTRDeEMsbUJBQWMsR0FBYSxFQUFFLENBQUE7UUFDN0Isc0JBQWlCLEdBQVcsZUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQStCdkQsQ0FBQztJQTFFQyxTQUFTLENBQUMsV0FBK0IsS0FBSztRQUM1QyxJQUFJLE1BQU0sR0FBVyxLQUFLLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFBO1FBQzlDLHlCQUNLLE1BQU0sRUFDVjtJQUNILENBQUM7SUFDRCxXQUFXLENBQUMsTUFBYyxFQUFFLFdBQStCLEtBQUs7UUFDOUQsS0FBSyxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUE7SUFDckMsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxlQUFlLENBQUMsS0FBYTtRQUMzQixJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQTtRQUMvQixJQUFJLENBQUMsaUJBQWlCLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQTtJQUN0RSxDQUFDO0lBRUQ7O09BRUc7SUFDSCxvQkFBb0I7UUFDbEIsT0FBTyxJQUFJLENBQUMsaUJBQWlCLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQTtJQUNoRCxDQUFDO0lBRUQ7O09BRUc7SUFDSCxpQkFBaUI7UUFDZixPQUFPLElBQUksQ0FBQyxjQUFjLENBQUE7SUFDNUIsQ0FBQztJQUVEOztPQUVHO0lBQ0gsaUJBQWlCLENBQUMsY0FBd0I7UUFDeEMsSUFBSSxDQUFDLGNBQWMsR0FBRyxjQUFjLENBQUE7UUFDcEMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUE7SUFDdEUsQ0FBQztJQUtELFVBQVUsQ0FBQyxLQUFhLEVBQUUsU0FBaUIsQ0FBQztRQUMxQyw4QkFBOEI7UUFDOUIsTUFBTSxJQUFJLENBQUMsQ0FBQTtRQUNYLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxRQUFRLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFBO1FBQ3JFLE1BQU0sSUFBSSxDQUFDLENBQUE7UUFDWCxJQUFJLENBQUMsY0FBYyxHQUFHLEVBQUUsQ0FBQTtRQUN4QixLQUFLLElBQUksQ0FBQyxHQUFXLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDNUQsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ3RFLE1BQU0sSUFBSSxDQUFDLENBQUE7U0FDWjtRQUNELE9BQU8sTUFBTSxDQUFBO0lBQ2YsQ0FBQztJQUVEOztPQUVHO0lBQ0gsUUFBUTtRQUNOLE1BQU0sU0FBUyxHQUFXLGVBQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDekMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQTtRQUN6QyxNQUFNLGlCQUFpQixHQUFXLGVBQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDakQsaUJBQWlCLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQTtRQUM5RCxNQUFNLElBQUksR0FBYSxDQUFDLFNBQVMsRUFBRSxpQkFBaUIsQ0FBQyxDQUFBO1FBQ3JELElBQUksS0FBSyxHQUFXLFNBQVMsQ0FBQyxNQUFNLEdBQUcsaUJBQWlCLENBQUMsTUFBTSxDQUFBO1FBQy9ELElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUMsWUFBb0IsRUFBUSxFQUFFO1lBQ3pELEtBQUssSUFBSSxDQUFDLENBQUE7WUFDVixJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFBO1FBQ3pCLENBQUMsQ0FBQyxDQUFBO1FBQ0YsT0FBTyxlQUFNLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQTtJQUNuQyxDQUFDO0NBQ0Y7QUE5RUQsZ0NBOEVDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAcGFja2FnZURvY3VtZW50YXRpb25cbiAqIEBtb2R1bGUgQVBJLVBsYXRmb3JtVk0tU3VibmV0QXV0aFxuICovXG5pbXBvcnQgeyBCdWZmZXIgfSBmcm9tIFwiYnVmZmVyL1wiXG5pbXBvcnQgQmluVG9vbHMgZnJvbSBcIi4uLy4uL3V0aWxzL2JpbnRvb2xzXCJcbmltcG9ydCB7IFNlcmlhbGl6YWJsZSwgU2VyaWFsaXplZEVuY29kaW5nIH0gZnJvbSBcIi4uLy4uL3V0aWxzXCJcbmltcG9ydCB7IFBsYXRmb3JtVk1Db25zdGFudHMgfSBmcm9tIFwiLlwiXG5cbi8qKlxuICogQGlnbm9yZVxuICovXG5jb25zdCBiaW50b29sczogQmluVG9vbHMgPSBCaW5Ub29scy5nZXRJbnN0YW5jZSgpXG5cbmV4cG9ydCBjbGFzcyBTdWJuZXRBdXRoIGV4dGVuZHMgU2VyaWFsaXphYmxlIHtcbiAgcHJvdGVjdGVkIF90eXBlTmFtZSA9IFwiU3VibmV0QXV0aFwiXG4gIHByb3RlY3RlZCBfdHlwZUlEID0gUGxhdGZvcm1WTUNvbnN0YW50cy5TVUJORVRBVVRIXG5cbiAgc2VyaWFsaXplKGVuY29kaW5nOiBTZXJpYWxpemVkRW5jb2RpbmcgPSBcImhleFwiKTogb2JqZWN0IHtcbiAgICBsZXQgZmllbGRzOiBvYmplY3QgPSBzdXBlci5zZXJpYWxpemUoZW5jb2RpbmcpXG4gICAgcmV0dXJuIHtcbiAgICAgIC4uLmZpZWxkc1xuICAgIH1cbiAgfVxuICBkZXNlcmlhbGl6ZShmaWVsZHM6IG9iamVjdCwgZW5jb2Rpbmc6IFNlcmlhbGl6ZWRFbmNvZGluZyA9IFwiaGV4XCIpIHtcbiAgICBzdXBlci5kZXNlcmlhbGl6ZShmaWVsZHMsIGVuY29kaW5nKVxuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBhbiBhZGRyZXNzIGluZGV4IGZvciBTdWJuZXQgQXV0aCBzaWduaW5nXG4gICAqXG4gICAqIEBwYXJhbSBpbmRleCB0aGUgQnVmZmVyIG9mIHRoZSBhZGRyZXNzIGluZGV4IHRvIGFkZFxuICAgKi9cbiAgYWRkQWRkcmVzc0luZGV4KGluZGV4OiBCdWZmZXIpOiB2b2lkIHtcbiAgICB0aGlzLmFkZHJlc3NJbmRpY2VzLnB1c2goaW5kZXgpXG4gICAgdGhpcy5udW1BZGRyZXNzSW5kaWNlcy53cml0ZVVJbnRCRSh0aGlzLmFkZHJlc3NJbmRpY2VzLmxlbmd0aCwgMCwgNClcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBudW1iZXIgb2YgYWRkcmVzcyBpbmRpY2VzIGFzIGEgbnVtYmVyXG4gICAqL1xuICBnZXROdW1BZGRyZXNzSW5kaWNlcygpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLm51bUFkZHJlc3NJbmRpY2VzLnJlYWRVSW50QkUoMCwgNClcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFuIGFycmF5IG9mIEFkZHJlc3NJbmRpY2VzIGFzIEJ1ZmZlcnNcbiAgICovXG4gIGdldEFkZHJlc3NJbmRpY2VzKCk6IEJ1ZmZlcltdIHtcbiAgICByZXR1cm4gdGhpcy5hZGRyZXNzSW5kaWNlc1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCBhbiBhcnJheSBvZiBBZGRyZXNzSW5kaWNlcyBhcyBCdWZmZXJzXG4gICAqL1xuICBzZXRBZGRyZXNzSW5kaWNlcyhhZGRyZXNzSW5kaWNlczogQnVmZmVyW10pIHtcbiAgICB0aGlzLmFkZHJlc3NJbmRpY2VzID0gYWRkcmVzc0luZGljZXNcbiAgICB0aGlzLm51bUFkZHJlc3NJbmRpY2VzLndyaXRlVUludEJFKHRoaXMuYWRkcmVzc0luZGljZXMubGVuZ3RoLCAwLCA0KVxuICB9XG5cbiAgcHJvdGVjdGVkIGFkZHJlc3NJbmRpY2VzOiBCdWZmZXJbXSA9IFtdXG4gIHByb3RlY3RlZCBudW1BZGRyZXNzSW5kaWNlczogQnVmZmVyID0gQnVmZmVyLmFsbG9jKDQpXG5cbiAgZnJvbUJ1ZmZlcihieXRlczogQnVmZmVyLCBvZmZzZXQ6IG51bWJlciA9IDApOiBudW1iZXIge1xuICAgIC8vIGluY3JlYXNlIG9mZnNldCBmb3IgdHlwZSBpZFxuICAgIG9mZnNldCArPSA0XG4gICAgdGhpcy5udW1BZGRyZXNzSW5kaWNlcyA9IGJpbnRvb2xzLmNvcHlGcm9tKGJ5dGVzLCBvZmZzZXQsIG9mZnNldCArIDQpXG4gICAgb2Zmc2V0ICs9IDRcbiAgICB0aGlzLmFkZHJlc3NJbmRpY2VzID0gW11cbiAgICBmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgdGhpcy5nZXROdW1BZGRyZXNzSW5kaWNlcygpOyBpKyspIHtcbiAgICAgIHRoaXMuYWRkcmVzc0luZGljZXMucHVzaChiaW50b29scy5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyA0KSlcbiAgICAgIG9mZnNldCArPSA0XG4gICAgfVxuICAgIHJldHVybiBvZmZzZXRcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gcmVwcmVzZW50YXRpb24gb2YgdGhlIFtbU3VibmV0QXV0aF1dLlxuICAgKi9cbiAgdG9CdWZmZXIoKTogQnVmZmVyIHtcbiAgICBjb25zdCB0eXBlSURCdWY6IEJ1ZmZlciA9IEJ1ZmZlci5hbGxvYyg0KVxuICAgIHR5cGVJREJ1Zi53cml0ZVVJbnRCRSh0aGlzLl90eXBlSUQsIDAsIDQpXG4gICAgY29uc3QgbnVtQWRkcmVzc0luZGljZXM6IEJ1ZmZlciA9IEJ1ZmZlci5hbGxvYyg0KVxuICAgIG51bUFkZHJlc3NJbmRpY2VzLndyaXRlSW50QkUodGhpcy5hZGRyZXNzSW5kaWNlcy5sZW5ndGgsIDAsIDQpXG4gICAgY29uc3QgYmFycjogQnVmZmVyW10gPSBbdHlwZUlEQnVmLCBudW1BZGRyZXNzSW5kaWNlc11cbiAgICBsZXQgYnNpemU6IG51bWJlciA9IHR5cGVJREJ1Zi5sZW5ndGggKyBudW1BZGRyZXNzSW5kaWNlcy5sZW5ndGhcbiAgICB0aGlzLmFkZHJlc3NJbmRpY2VzLmZvckVhY2goKGFkZHJlc3NJbmRleDogQnVmZmVyKTogdm9pZCA9PiB7XG4gICAgICBic2l6ZSArPSA0XG4gICAgICBiYXJyLnB1c2goYWRkcmVzc0luZGV4KVxuICAgIH0pXG4gICAgcmV0dXJuIEJ1ZmZlci5jb25jYXQoYmFyciwgYnNpemUpXG4gIH1cbn1cbiJdfQ==
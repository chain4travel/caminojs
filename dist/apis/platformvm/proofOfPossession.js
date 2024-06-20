"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProofOfPossession = void 0;
/**
 * @packageDocumentation
 * @module API-PlatformVM-ProofOfPossession
 */
const buffer_1 = require("buffer/");
const bintools_1 = __importDefault(require("../../utils/bintools"));
/**
 * @ignore
 */
const bintools = bintools_1.default.getInstance();
// A BLS public key and a proof of possession of the key.
class ProofOfPossession {
    /**
     * Returns the {@link https://github.com/feross/buffer|Buffer} representation of the publicKey
     */
    getPublicKey() {
        return this.publicKey;
    }
    /**
     * Returns the {@link https://github.com/feross/buffer|Buffer} representation of the signature
     */
    getSignature() {
        return this.signature;
    }
    /**
     * Takes a {@link https://github.com/feross/buffer|Buffer} containing an [[ProofOfPossession]], parses it, populates the class, and returns the length of the [[ProofOfPossession]] in bytes.
     *
     * @param bytes A {@link https://github.com/feross/buffer|Buffer} containing a raw [[ProofOfPossession]]
     *
     * @returns The length of the raw [[ProofOfPossession]]
     *
     * @remarks assume not-checksummed
     */
    fromBuffer(bytes, offset = 0) {
        this.publicKey = bintools.copyFrom(bytes, offset, offset + 48);
        offset += 48;
        this.signature = bintools.copyFrom(bytes, offset, offset + 96);
        offset += 96;
        return offset;
    }
    /**
     * Returns a {@link https://github.com/feross/buffer|Buffer} representation of the [[ProofOfPossession]]
     */
    toBuffer() {
        let bsize = this.publicKey.length + this.signature.length;
        const barr = [this.publicKey, this.signature];
        return buffer_1.Buffer.concat(barr, bsize);
    }
    /**
     * Class representing a Proof of Possession
     *
     * @param publicKey {@link https://github.com/feross/buffer|Buffer} for the public key
     * @param signature {@link https://github.com/feross/buffer|Buffer} for the signature
     */
    constructor(publicKey = undefined, signature = undefined) {
        this._typeName = "ProofOfPossession";
        this._typeID = undefined;
        this.publicKey = buffer_1.Buffer.alloc(48);
        this.signature = buffer_1.Buffer.alloc(96);
        this.publicKey = publicKey;
        this.signature = signature;
    }
}
exports.ProofOfPossession = ProofOfPossession;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvb2ZPZlBvc3Nlc3Npb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYXBpcy9wbGF0Zm9ybXZtL3Byb29mT2ZQb3NzZXNzaW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBOzs7R0FHRztBQUNILG9DQUFnQztBQUNoQyxvRUFBMkM7QUFFM0M7O0dBRUc7QUFDSCxNQUFNLFFBQVEsR0FBYSxrQkFBUSxDQUFDLFdBQVcsRUFBRSxDQUFBO0FBRWpELHlEQUF5RDtBQUN6RCxNQUFhLGlCQUFpQjtJQU01Qjs7T0FFRztJQUNILFlBQVk7UUFDVixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUE7SUFDdkIsQ0FBQztJQUVEOztPQUVHO0lBQ0gsWUFBWTtRQUNWLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQTtJQUN2QixDQUFDO0lBRUQ7Ozs7Ozs7O09BUUc7SUFDSCxVQUFVLENBQUMsS0FBYSxFQUFFLFNBQWlCLENBQUM7UUFDMUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxHQUFHLEVBQUUsQ0FBQyxDQUFBO1FBQzlELE1BQU0sSUFBSSxFQUFFLENBQUE7UUFFWixJQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLEdBQUcsRUFBRSxDQUFDLENBQUE7UUFDOUQsTUFBTSxJQUFJLEVBQUUsQ0FBQTtRQUVaLE9BQU8sTUFBTSxDQUFBO0lBQ2YsQ0FBQztJQUVEOztPQUVHO0lBQ0gsUUFBUTtRQUNOLElBQUksS0FBSyxHQUFXLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFBO1FBRWpFLE1BQU0sSUFBSSxHQUFhLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUE7UUFFdkQsT0FBTyxlQUFNLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQTtJQUNuQyxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSCxZQUFZLFlBQW9CLFNBQVMsRUFBRSxZQUFvQixTQUFTO1FBdkQ5RCxjQUFTLEdBQUcsbUJBQW1CLENBQUE7UUFDL0IsWUFBTyxHQUFHLFNBQVMsQ0FBQTtRQUNuQixjQUFTLEdBQVcsZUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUNwQyxjQUFTLEdBQVcsZUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQXFENUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUE7UUFDMUIsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUE7SUFDNUIsQ0FBQztDQUNGO0FBNURELDhDQTREQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQHBhY2thZ2VEb2N1bWVudGF0aW9uXG4gKiBAbW9kdWxlIEFQSS1QbGF0Zm9ybVZNLVByb29mT2ZQb3NzZXNzaW9uXG4gKi9cbmltcG9ydCB7IEJ1ZmZlciB9IGZyb20gXCJidWZmZXIvXCJcbmltcG9ydCBCaW5Ub29scyBmcm9tIFwiLi4vLi4vdXRpbHMvYmludG9vbHNcIlxuXG4vKipcbiAqIEBpZ25vcmVcbiAqL1xuY29uc3QgYmludG9vbHM6IEJpblRvb2xzID0gQmluVG9vbHMuZ2V0SW5zdGFuY2UoKVxuXG4vLyBBIEJMUyBwdWJsaWMga2V5IGFuZCBhIHByb29mIG9mIHBvc3Nlc3Npb24gb2YgdGhlIGtleS5cbmV4cG9ydCBjbGFzcyBQcm9vZk9mUG9zc2Vzc2lvbiB7XG4gIHByb3RlY3RlZCBfdHlwZU5hbWUgPSBcIlByb29mT2ZQb3NzZXNzaW9uXCJcbiAgcHJvdGVjdGVkIF90eXBlSUQgPSB1bmRlZmluZWRcbiAgcHJvdGVjdGVkIHB1YmxpY0tleTogQnVmZmVyID0gQnVmZmVyLmFsbG9jKDQ4KVxuICBwcm90ZWN0ZWQgc2lnbmF0dXJlOiBCdWZmZXIgPSBCdWZmZXIuYWxsb2MoOTYpXG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IHJlcHJlc2VudGF0aW9uIG9mIHRoZSBwdWJsaWNLZXlcbiAgICovXG4gIGdldFB1YmxpY0tleSgpOiBCdWZmZXIge1xuICAgIHJldHVybiB0aGlzLnB1YmxpY0tleVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IHJlcHJlc2VudGF0aW9uIG9mIHRoZSBzaWduYXR1cmVcbiAgICovXG4gIGdldFNpZ25hdHVyZSgpOiBCdWZmZXIge1xuICAgIHJldHVybiB0aGlzLnNpZ25hdHVyZVxuICB9XG5cbiAgLyoqXG4gICAqIFRha2VzIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gY29udGFpbmluZyBhbiBbW1Byb29mT2ZQb3NzZXNzaW9uXV0sIHBhcnNlcyBpdCwgcG9wdWxhdGVzIHRoZSBjbGFzcywgYW5kIHJldHVybnMgdGhlIGxlbmd0aCBvZiB0aGUgW1tQcm9vZk9mUG9zc2Vzc2lvbl1dIGluIGJ5dGVzLlxuICAgKlxuICAgKiBAcGFyYW0gYnl0ZXMgQSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBjb250YWluaW5nIGEgcmF3IFtbUHJvb2ZPZlBvc3Nlc3Npb25dXVxuICAgKlxuICAgKiBAcmV0dXJucyBUaGUgbGVuZ3RoIG9mIHRoZSByYXcgW1tQcm9vZk9mUG9zc2Vzc2lvbl1dXG4gICAqXG4gICAqIEByZW1hcmtzIGFzc3VtZSBub3QtY2hlY2tzdW1tZWRcbiAgICovXG4gIGZyb21CdWZmZXIoYnl0ZXM6IEJ1ZmZlciwgb2Zmc2V0OiBudW1iZXIgPSAwKTogbnVtYmVyIHtcbiAgICB0aGlzLnB1YmxpY0tleSA9IGJpbnRvb2xzLmNvcHlGcm9tKGJ5dGVzLCBvZmZzZXQsIG9mZnNldCArIDQ4KVxuICAgIG9mZnNldCArPSA0OFxuXG4gICAgdGhpcy5zaWduYXR1cmUgPSBiaW50b29scy5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyA5NilcbiAgICBvZmZzZXQgKz0gOTZcblxuICAgIHJldHVybiBvZmZzZXRcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gcmVwcmVzZW50YXRpb24gb2YgdGhlIFtbUHJvb2ZPZlBvc3Nlc3Npb25dXVxuICAgKi9cbiAgdG9CdWZmZXIoKTogQnVmZmVyIHtcbiAgICBsZXQgYnNpemU6IG51bWJlciA9IHRoaXMucHVibGljS2V5Lmxlbmd0aCArIHRoaXMuc2lnbmF0dXJlLmxlbmd0aFxuXG4gICAgY29uc3QgYmFycjogQnVmZmVyW10gPSBbdGhpcy5wdWJsaWNLZXksIHRoaXMuc2lnbmF0dXJlXVxuXG4gICAgcmV0dXJuIEJ1ZmZlci5jb25jYXQoYmFyciwgYnNpemUpXG4gIH1cblxuICAvKipcbiAgICogQ2xhc3MgcmVwcmVzZW50aW5nIGEgUHJvb2Ygb2YgUG9zc2Vzc2lvblxuICAgKlxuICAgKiBAcGFyYW0gcHVibGljS2V5IHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IGZvciB0aGUgcHVibGljIGtleVxuICAgKiBAcGFyYW0gc2lnbmF0dXJlIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IGZvciB0aGUgc2lnbmF0dXJlXG4gICAqL1xuICBjb25zdHJ1Y3RvcihwdWJsaWNLZXk6IEJ1ZmZlciA9IHVuZGVmaW5lZCwgc2lnbmF0dXJlOiBCdWZmZXIgPSB1bmRlZmluZWQpIHtcbiAgICB0aGlzLnB1YmxpY0tleSA9IHB1YmxpY0tleVxuICAgIHRoaXMuc2lnbmF0dXJlID0gc2lnbmF0dXJlXG4gIH1cbn1cbiJdfQ==
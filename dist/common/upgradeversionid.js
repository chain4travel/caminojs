"use strict";
/**
 * @packageDocumentation
 * @module Common-UpgradeVersionID
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpgradeVersionID = void 0;
const buffer_1 = require("buffer/");
const bn_js_1 = __importDefault(require("bn.js"));
const bintools_1 = __importDefault(require("../utils/bintools"));
const utils_1 = require("./utils");
/**
 * @ignore
 */
const bintools = bintools_1.default.getInstance();
const UpgradeVersionPrefix = new bn_js_1.default([
    0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x00, 0x00
]);
const VersionMask = new bn_js_1.default([0xff, 0xff]);
const UpgradeVersionLen = 8;
/**
 * Class for representing a UpgradeVersionID
 */
class UpgradeVersionID {
    version() {
        return this.upgradeVersionID.and(VersionMask).toNumber();
    }
    clone() {
        return new UpgradeVersionID(this.version());
    }
    create() {
        return new UpgradeVersionID();
    }
    fromBuffer(bytes, offset = 0) {
        const b = bintools.copyFrom(bytes, offset, offset + UpgradeVersionLen);
        const v = bintools.fromBufferToBN(b);
        if (v.and(UpgradeVersionPrefix).eq(UpgradeVersionPrefix)) {
            this.upgradeVersionID = v;
            return offset + UpgradeVersionLen;
        }
        return offset;
    }
    toBuffer() {
        if (this.version() > 0) {
            return bintools.fromBNToBuffer(this.upgradeVersionID, UpgradeVersionLen);
        }
        return buffer_1.Buffer.alloc(0);
    }
    constructor(version = 0) {
        this.upgradeVersionID = utils_1.ZeroBN;
        if (version > 0) {
            this.upgradeVersionID = UpgradeVersionPrefix.or(new bn_js_1.default(version));
        }
    }
}
exports.UpgradeVersionID = UpgradeVersionID;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBncmFkZXZlcnNpb25pZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21tb24vdXBncmFkZXZlcnNpb25pZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztHQUdHOzs7Ozs7QUFFSCxvQ0FBZ0M7QUFDaEMsa0RBQXNCO0FBRXRCLGlFQUF3QztBQUN4QyxtQ0FBZ0M7QUFFaEM7O0dBRUc7QUFDSCxNQUFNLFFBQVEsR0FBYSxrQkFBUSxDQUFDLFdBQVcsRUFBRSxDQUFBO0FBQ2pELE1BQU0sb0JBQW9CLEdBQUcsSUFBSSxlQUFFLENBQUM7SUFDbEMsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUk7Q0FDL0MsQ0FBQyxDQUFBO0FBQ0YsTUFBTSxXQUFXLEdBQUcsSUFBSSxlQUFFLENBQUMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQTtBQUN4QyxNQUFNLGlCQUFpQixHQUFHLENBQUMsQ0FBQTtBQUUzQjs7R0FFRztBQUNILE1BQWEsZ0JBQWdCO0lBRzNCLE9BQU87UUFDTCxPQUFPLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUE7SUFDMUQsQ0FBQztJQUVELEtBQUs7UUFDSCxPQUFPLElBQUksZ0JBQWdCLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFTLENBQUE7SUFDckQsQ0FBQztJQUVELE1BQU07UUFDSixPQUFPLElBQUksZ0JBQWdCLEVBQVUsQ0FBQTtJQUN2QyxDQUFDO0lBRUQsVUFBVSxDQUFDLEtBQWEsRUFBRSxTQUFpQixDQUFDO1FBQzFDLE1BQU0sQ0FBQyxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLEdBQUcsaUJBQWlCLENBQUMsQ0FBQTtRQUN0RSxNQUFNLENBQUMsR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxvQkFBb0IsQ0FBQyxFQUFFO1lBQ3hELElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxDQUFDLENBQUE7WUFDekIsT0FBTyxNQUFNLEdBQUcsaUJBQWlCLENBQUE7U0FDbEM7UUFDRCxPQUFPLE1BQU0sQ0FBQTtJQUNmLENBQUM7SUFFRCxRQUFRO1FBQ04sSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxFQUFFO1lBQ3RCLE9BQU8sUUFBUSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsaUJBQWlCLENBQUMsQ0FBQTtTQUN6RTtRQUNELE9BQU8sZUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUN4QixDQUFDO0lBRUQsWUFBWSxVQUFrQixDQUFDO1FBL0JyQixxQkFBZ0IsR0FBRyxjQUFNLENBQUE7UUFnQ2pDLElBQUksT0FBTyxHQUFHLENBQUMsRUFBRTtZQUNmLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxvQkFBb0IsQ0FBQyxFQUFFLENBQUMsSUFBSSxlQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQTtTQUNqRTtJQUNILENBQUM7Q0FDRjtBQXJDRCw0Q0FxQ0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBwYWNrYWdlRG9jdW1lbnRhdGlvblxuICogQG1vZHVsZSBDb21tb24tVXBncmFkZVZlcnNpb25JRFxuICovXG5cbmltcG9ydCB7IEJ1ZmZlciB9IGZyb20gXCJidWZmZXIvXCJcbmltcG9ydCBCTiBmcm9tIFwiYm4uanNcIlxuXG5pbXBvcnQgQmluVG9vbHMgZnJvbSBcIi4uL3V0aWxzL2JpbnRvb2xzXCJcbmltcG9ydCB7IFplcm9CTiB9IGZyb20gXCIuL3V0aWxzXCJcblxuLyoqXG4gKiBAaWdub3JlXG4gKi9cbmNvbnN0IGJpbnRvb2xzOiBCaW5Ub29scyA9IEJpblRvb2xzLmdldEluc3RhbmNlKClcbmNvbnN0IFVwZ3JhZGVWZXJzaW9uUHJlZml4ID0gbmV3IEJOKFtcbiAgMHhmZiwgMHhmZiwgMHhmZiwgMHhmZiwgMHhmZiwgMHhmZiwgMHgwMCwgMHgwMFxuXSlcbmNvbnN0IFZlcnNpb25NYXNrID0gbmV3IEJOKFsweGZmLCAweGZmXSlcbmNvbnN0IFVwZ3JhZGVWZXJzaW9uTGVuID0gOFxuXG4vKipcbiAqIENsYXNzIGZvciByZXByZXNlbnRpbmcgYSBVcGdyYWRlVmVyc2lvbklEXG4gKi9cbmV4cG9ydCBjbGFzcyBVcGdyYWRlVmVyc2lvbklEIHtcbiAgcHJvdGVjdGVkIHVwZ3JhZGVWZXJzaW9uSUQgPSBaZXJvQk5cblxuICB2ZXJzaW9uKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMudXBncmFkZVZlcnNpb25JRC5hbmQoVmVyc2lvbk1hc2spLnRvTnVtYmVyKClcbiAgfVxuXG4gIGNsb25lKCk6IHRoaXMge1xuICAgIHJldHVybiBuZXcgVXBncmFkZVZlcnNpb25JRCh0aGlzLnZlcnNpb24oKSkgYXMgdGhpc1xuICB9XG5cbiAgY3JlYXRlKCk6IHRoaXMge1xuICAgIHJldHVybiBuZXcgVXBncmFkZVZlcnNpb25JRCgpIGFzIHRoaXNcbiAgfVxuXG4gIGZyb21CdWZmZXIoYnl0ZXM6IEJ1ZmZlciwgb2Zmc2V0OiBudW1iZXIgPSAwKTogbnVtYmVyIHtcbiAgICBjb25zdCBiID0gYmludG9vbHMuY29weUZyb20oYnl0ZXMsIG9mZnNldCwgb2Zmc2V0ICsgVXBncmFkZVZlcnNpb25MZW4pXG4gICAgY29uc3QgdiA9IGJpbnRvb2xzLmZyb21CdWZmZXJUb0JOKGIpXG4gICAgaWYgKHYuYW5kKFVwZ3JhZGVWZXJzaW9uUHJlZml4KS5lcShVcGdyYWRlVmVyc2lvblByZWZpeCkpIHtcbiAgICAgIHRoaXMudXBncmFkZVZlcnNpb25JRCA9IHZcbiAgICAgIHJldHVybiBvZmZzZXQgKyBVcGdyYWRlVmVyc2lvbkxlblxuICAgIH1cbiAgICByZXR1cm4gb2Zmc2V0XG4gIH1cblxuICB0b0J1ZmZlcigpOiBCdWZmZXIge1xuICAgIGlmICh0aGlzLnZlcnNpb24oKSA+IDApIHtcbiAgICAgIHJldHVybiBiaW50b29scy5mcm9tQk5Ub0J1ZmZlcih0aGlzLnVwZ3JhZGVWZXJzaW9uSUQsIFVwZ3JhZGVWZXJzaW9uTGVuKVxuICAgIH1cbiAgICByZXR1cm4gQnVmZmVyLmFsbG9jKDApXG4gIH1cblxuICBjb25zdHJ1Y3Rvcih2ZXJzaW9uOiBudW1iZXIgPSAwKSB7XG4gICAgaWYgKHZlcnNpb24gPiAwKSB7XG4gICAgICB0aGlzLnVwZ3JhZGVWZXJzaW9uSUQgPSBVcGdyYWRlVmVyc2lvblByZWZpeC5vcihuZXcgQk4odmVyc2lvbikpXG4gICAgfVxuICB9XG59XG4iXX0=
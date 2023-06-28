"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnlockDepositTx = void 0;
/**
 * @packageDocumentation
 * @module API-PlatformVM-UnlockDepositTx
 */
const constants_1 = require("./constants");
const basetx_1 = require("./basetx");
/**
 * Class representing an unsigned UnlockDepositTx transaction.
 */
class UnlockDepositTx extends basetx_1.BaseTx {
    constructor() {
        super(...arguments);
        this._typeName = "UnlockDepositTx";
        this._typeID = constants_1.PlatformVMConstants.UNLOCKDEPOSITTX;
    }
    /**
     * Returns the id of the [[UnlockDepositTx]]
     */
    getTxType() {
        return this._typeID;
    }
    clone() {
        const newUnlockDepositTx = new UnlockDepositTx();
        newUnlockDepositTx.fromBuffer(this.toBuffer());
        return newUnlockDepositTx;
    }
    create(...args) {
        return new UnlockDepositTx(...args);
    }
}
exports.UnlockDepositTx = UnlockDepositTx;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidW5sb2NrZGVwb3NpdHR4LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2FwaXMvcGxhdGZvcm12bS91bmxvY2tkZXBvc2l0dHgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUE7OztHQUdHO0FBQ0gsMkNBQWlEO0FBQ2pELHFDQUFpQztBQUVqQzs7R0FFRztBQUNILE1BQWEsZUFBZ0IsU0FBUSxlQUFNO0lBQTNDOztRQUNZLGNBQVMsR0FBRyxpQkFBaUIsQ0FBQTtRQUM3QixZQUFPLEdBQUcsK0JBQW1CLENBQUMsZUFBZSxDQUFBO0lBa0J6RCxDQUFDO0lBaEJDOztPQUVHO0lBQ0gsU0FBUztRQUNQLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQTtJQUNyQixDQUFDO0lBRUQsS0FBSztRQUNILE1BQU0sa0JBQWtCLEdBQW9CLElBQUksZUFBZSxFQUFFLENBQUE7UUFDakUsa0JBQWtCLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFBO1FBQzlDLE9BQU8sa0JBQTBCLENBQUE7SUFDbkMsQ0FBQztJQUVELE1BQU0sQ0FBQyxHQUFHLElBQVc7UUFDbkIsT0FBTyxJQUFJLGVBQWUsQ0FBQyxHQUFHLElBQUksQ0FBUyxDQUFBO0lBQzdDLENBQUM7Q0FDRjtBQXBCRCwwQ0FvQkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBwYWNrYWdlRG9jdW1lbnRhdGlvblxuICogQG1vZHVsZSBBUEktUGxhdGZvcm1WTS1VbmxvY2tEZXBvc2l0VHhcbiAqL1xuaW1wb3J0IHsgUGxhdGZvcm1WTUNvbnN0YW50cyB9IGZyb20gXCIuL2NvbnN0YW50c1wiXG5pbXBvcnQgeyBCYXNlVHggfSBmcm9tIFwiLi9iYXNldHhcIlxuXG4vKipcbiAqIENsYXNzIHJlcHJlc2VudGluZyBhbiB1bnNpZ25lZCBVbmxvY2tEZXBvc2l0VHggdHJhbnNhY3Rpb24uXG4gKi9cbmV4cG9ydCBjbGFzcyBVbmxvY2tEZXBvc2l0VHggZXh0ZW5kcyBCYXNlVHgge1xuICBwcm90ZWN0ZWQgX3R5cGVOYW1lID0gXCJVbmxvY2tEZXBvc2l0VHhcIlxuICBwcm90ZWN0ZWQgX3R5cGVJRCA9IFBsYXRmb3JtVk1Db25zdGFudHMuVU5MT0NLREVQT1NJVFRYXG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGlkIG9mIHRoZSBbW1VubG9ja0RlcG9zaXRUeF1dXG4gICAqL1xuICBnZXRUeFR5cGUoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fdHlwZUlEXG4gIH1cblxuICBjbG9uZSgpOiB0aGlzIHtcbiAgICBjb25zdCBuZXdVbmxvY2tEZXBvc2l0VHg6IFVubG9ja0RlcG9zaXRUeCA9IG5ldyBVbmxvY2tEZXBvc2l0VHgoKVxuICAgIG5ld1VubG9ja0RlcG9zaXRUeC5mcm9tQnVmZmVyKHRoaXMudG9CdWZmZXIoKSlcbiAgICByZXR1cm4gbmV3VW5sb2NrRGVwb3NpdFR4IGFzIHRoaXNcbiAgfVxuXG4gIGNyZWF0ZSguLi5hcmdzOiBhbnlbXSk6IHRoaXMge1xuICAgIHJldHVybiBuZXcgVW5sb2NrRGVwb3NpdFR4KC4uLmFyZ3MpIGFzIHRoaXNcbiAgfVxufVxuIl19
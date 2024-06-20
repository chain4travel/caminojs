"use strict";
/**
 * @packageDocumentation
 * @module Common-KeyChain
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.StandardKeyChain = exports.SignerKeyChain = exports.StandardKeyPair = exports.SignerKeyPair = void 0;
const buffer_1 = require("buffer/");
/**
 * Class for representing an interface for signing in Avalanche.
 */
class SignerKeyPair {
}
exports.SignerKeyPair = SignerKeyPair;
/**
 * Class for representing a private and public keypair in Avalanche.
 * All APIs that need key pairs should extend on this class.
 */
class StandardKeyPair extends SignerKeyPair {
    /**
     * Returns a reference to the private key.
     *
     * @returns A {@link https://github.com/feross/buffer|Buffer} containing the private key
     */
    getPrivateKey() {
        return this.privk;
    }
    /**
     * Returns a reference to the public key.
     *
     * @returns A {@link https://github.com/feross/buffer|Buffer} containing the public key
     */
    getPublicKey() {
        return this.pubk;
    }
}
exports.StandardKeyPair = StandardKeyPair;
class SignerKeyChain {
}
exports.SignerKeyChain = SignerKeyChain;
/**
 * Class for representing a key chain in Avalanche.
 * All endpoints that need key chains should extend on this class.
 *
 * @typeparam KPClass extending [[StandardKeyPair]] which is used as the key in [[StandardKeyChain]]
 */
class StandardKeyChain {
    constructor() {
        this.keys = {};
        /**
         * Gets an array of addresses stored in the [[StandardKeyChain]].
         *
         * @returns An array of {@link https://github.com/feross/buffer|Buffer}  representations
         * of the addresses
         */
        this.getAddresses = () => Object.values(this.keys).map((kp) => kp.getAddress());
        /**
         * Gets an array of addresses stored in the [[StandardKeyChain]].
         *
         * @returns An array of string representations of the addresses
         */
        this.getAddressStrings = () => Object.values(this.keys).map((kp) => kp.getAddressString());
        /**
         * Removes the key pair from the list of they keys managed in the [[StandardKeyChain]].
         *
         * @param key A {@link https://github.com/feross/buffer|Buffer} for the address or
         * KPClass to remove
         *
         * @returns The boolean true if a key was removed.
         */
        this.removeKey = (key) => {
            let kaddr;
            if (key instanceof buffer_1.Buffer) {
                kaddr = key.toString("hex");
            }
            else {
                kaddr = key.getAddress().toString("hex");
            }
            if (kaddr in this.keys) {
                delete this.keys[`${kaddr}`];
                return true;
            }
            return false;
        };
        /**
         * Checks if there is a key associated with the provided address.
         *
         * @param address The address to check for existence in the keys database
         *
         * @returns True on success, false if not found
         */
        this.hasKey = (address) => address.toString("hex") in this.keys;
        /**
         * Returns the [[StandardKeyPair]] listed under the provided address
         *
         * @param address The {@link https://github.com/feross/buffer|Buffer} of the address to
         * retrieve from the keys database
         *
         * @returns A reference to the [[StandardKeyPair]] in the keys database
         */
        this.getKey = (address) => this.keys[address.toString("hex")];
        /**
         * Returns the [[StandardKeyPair]]'s listed under the provided address
         *
         * @param address The {@link https://github.com/feross/buffer|Buffer} of the address to
         * retrieve from the keys database
         *
         * @returns A reference to the [[StandardKeyPair]]'s in the keys database
         */
        this.getKeys = (address) => [this.keys[address.toString("hex")]];
    }
    /**
     * Adds the key pair to the list of the keys managed in the [[StandardKeyChain]].
     *
     * @param newKey A key pair of the appropriate class to be added to the [[StandardKeyChain]]
     */
    addKey(newKey) {
        this.keys[newKey.getAddress().toString("hex")] = newKey;
    }
}
exports.StandardKeyChain = StandardKeyChain;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5Y2hhaW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29tbW9uL2tleWNoYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O0dBR0c7OztBQUVILG9DQUFnQztBQUVoQzs7R0FFRztBQUNILE1BQXNCLGFBQWE7Q0FZbEM7QUFaRCxzQ0FZQztBQUVEOzs7R0FHRztBQUNILE1BQXNCLGVBQWdCLFNBQVEsYUFBYTtJQTJDekQ7Ozs7T0FJRztJQUNILGFBQWE7UUFDWCxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUE7SUFDbkIsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxZQUFZO1FBQ1YsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFBO0lBQ2xCLENBQUM7Q0FpQ0Y7QUE1RkQsMENBNEZDO0FBRUQsTUFBc0IsY0FBYztDQVVuQztBQVZELHdDQVVDO0FBRUQ7Ozs7O0dBS0c7QUFDSCxNQUFzQixnQkFBZ0I7SUFBdEM7UUFDWSxTQUFJLEdBQW1DLEVBQUUsQ0FBQTtRQWtCbkQ7Ozs7O1dBS0c7UUFDSCxpQkFBWSxHQUFHLEdBQWEsRUFBRSxDQUM1QixNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFBO1FBRXZEOzs7O1dBSUc7UUFDSCxzQkFBaUIsR0FBRyxHQUFhLEVBQUUsQ0FDakMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFBO1FBVzdEOzs7Ozs7O1dBT0c7UUFDSCxjQUFTLEdBQUcsQ0FBQyxHQUFxQixFQUFFLEVBQUU7WUFDcEMsSUFBSSxLQUFhLENBQUE7WUFDakIsSUFBSSxHQUFHLFlBQVksZUFBTSxFQUFFO2dCQUN6QixLQUFLLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQTthQUM1QjtpQkFBTTtnQkFDTCxLQUFLLEdBQUcsR0FBRyxDQUFDLFVBQVUsRUFBRSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQTthQUN6QztZQUNELElBQUksS0FBSyxJQUFJLElBQUksQ0FBQyxJQUFJLEVBQUU7Z0JBQ3RCLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEtBQUssRUFBRSxDQUFDLENBQUE7Z0JBQzVCLE9BQU8sSUFBSSxDQUFBO2FBQ1o7WUFDRCxPQUFPLEtBQUssQ0FBQTtRQUNkLENBQUMsQ0FBQTtRQUVEOzs7Ozs7V0FNRztRQUNILFdBQU0sR0FBRyxDQUFDLE9BQWUsRUFBVyxFQUFFLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFBO1FBRTNFOzs7Ozs7O1dBT0c7UUFDSCxXQUFNLEdBQUcsQ0FBQyxPQUFlLEVBQVcsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFBO1FBRXpFOzs7Ozs7O1dBT0c7UUFDSCxZQUFPLEdBQUcsQ0FBQyxPQUFlLEVBQWEsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQU9oRixDQUFDO0lBakVDOzs7O09BSUc7SUFDSCxNQUFNLENBQUMsTUFBZTtRQUNwQixJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUE7SUFDekQsQ0FBQztDQTBERjtBQXJHRCw0Q0FxR0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBwYWNrYWdlRG9jdW1lbnRhdGlvblxuICogQG1vZHVsZSBDb21tb24tS2V5Q2hhaW5cbiAqL1xuXG5pbXBvcnQgeyBCdWZmZXIgfSBmcm9tIFwiYnVmZmVyL1wiXG5cbi8qKlxuICogQ2xhc3MgZm9yIHJlcHJlc2VudGluZyBhbiBpbnRlcmZhY2UgZm9yIHNpZ25pbmcgaW4gQXZhbGFuY2hlLlxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgU2lnbmVyS2V5UGFpciB7XG4gIHByb3RlY3RlZCBwdWJrOiBCdWZmZXJcbiAgcHJvdGVjdGVkIHByaXZrOiBCdWZmZXJcblxuICAvKipcbiAgICogVGFrZXMgYSBtZXNzYWdlLCBzaWducyBpdCwgYW5kIHJldHVybnMgdGhlIHNpZ25hdHVyZS5cbiAgICpcbiAgICogQHBhcmFtIG1zZyBUaGUgbWVzc2FnZSB0byBzaWduXG4gICAqXG4gICAqIEByZXR1cm5zIEEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gY29udGFpbmluZyB0aGUgc2lnbmF0dXJlXG4gICAqL1xuICBhYnN0cmFjdCBzaWduKG1zZzogQnVmZmVyKTogQnVmZmVyXG59XG5cbi8qKlxuICogQ2xhc3MgZm9yIHJlcHJlc2VudGluZyBhIHByaXZhdGUgYW5kIHB1YmxpYyBrZXlwYWlyIGluIEF2YWxhbmNoZS5cbiAqIEFsbCBBUElzIHRoYXQgbmVlZCBrZXkgcGFpcnMgc2hvdWxkIGV4dGVuZCBvbiB0aGlzIGNsYXNzLlxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgU3RhbmRhcmRLZXlQYWlyIGV4dGVuZHMgU2lnbmVyS2V5UGFpciB7XG4gIHByb3RlY3RlZCBwdWJrOiBCdWZmZXJcbiAgcHJvdGVjdGVkIHByaXZrOiBCdWZmZXJcblxuICAvKipcbiAgICogR2VuZXJhdGVzIGEgbmV3IGtleXBhaXIuXG4gICAqXG4gICAqIEBwYXJhbSBlbnRyb3B5IE9wdGlvbmFsIHBhcmFtZXRlciB0aGF0IG1heSBiZSBuZWNlc3NhcnkgdG8gcHJvZHVjZSBzZWN1cmUga2V5c1xuICAgKi9cbiAgYWJzdHJhY3QgZ2VuZXJhdGVLZXkoZW50cm9weT86IEJ1ZmZlcik6IHZvaWRcblxuICAvKipcbiAgICogSW1wb3J0cyBhIHByaXZhdGUga2V5IGFuZCBnZW5lcmF0ZXMgdGhlIGFwcHJvcHJpYXRlIHB1YmxpYyBrZXkuXG4gICAqXG4gICAqIEBwYXJhbSBwcml2ayBBIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IHJlcHJlc2VudGluZyB0aGUgcHJpdmF0ZSBrZXlcbiAgICpcbiAgICogQHJldHVybnMgdHJ1ZSBvbiBzdWNjZXNzLCBmYWxzZSBvbiBmYWlsdXJlXG4gICAqL1xuICBhYnN0cmFjdCBpbXBvcnRLZXkocHJpdms6IEJ1ZmZlcik6IGJvb2xlYW5cblxuICAvKipcbiAgICogUmVjb3ZlcnMgdGhlIHB1YmxpYyBrZXkgb2YgYSBtZXNzYWdlIHNpZ25lciBmcm9tIGEgbWVzc2FnZSBhbmQgaXRzIGFzc29jaWF0ZWQgc2lnbmF0dXJlLlxuICAgKlxuICAgKiBAcGFyYW0gbXNnIFRoZSBtZXNzYWdlIHRoYXQncyBzaWduZWRcbiAgICogQHBhcmFtIHNpZyBUaGUgc2lnbmF0dXJlIHRoYXQncyBzaWduZWQgb24gdGhlIG1lc3NhZ2VcbiAgICpcbiAgICogQHJldHVybnMgQSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBjb250YWluaW5nIHRoZSBwdWJsaWNcbiAgICoga2V5IG9mIHRoZSBzaWduZXJcbiAgICovXG4gIGFic3RyYWN0IHJlY292ZXIobXNnOiBCdWZmZXIsIHNpZzogQnVmZmVyKTogQnVmZmVyXG5cbiAgLyoqXG4gICAqIFZlcmlmaWVzIHRoYXQgdGhlIHByaXZhdGUga2V5IGFzc29jaWF0ZWQgd2l0aCB0aGUgcHJvdmlkZWQgcHVibGljIGtleSBwcm9kdWNlcyB0aGVcbiAgICogc2lnbmF0dXJlIGFzc29jaWF0ZWQgd2l0aCB0aGUgZ2l2ZW4gbWVzc2FnZS5cbiAgICpcbiAgICogQHBhcmFtIG1zZyBUaGUgbWVzc2FnZSBhc3NvY2lhdGVkIHdpdGggdGhlIHNpZ25hdHVyZVxuICAgKiBAcGFyYW0gc2lnIFRoZSBzaWduYXR1cmUgb2YgdGhlIHNpZ25lZCBtZXNzYWdlXG4gICAqIEBwYXJhbSBwdWJrIFRoZSBwdWJsaWMga2V5IGFzc29jaWF0ZWQgd2l0aCB0aGUgbWVzc2FnZSBzaWduYXR1cmVcbiAgICpcbiAgICogQHJldHVybnMgVHJ1ZSBvbiBzdWNjZXNzLCBmYWxzZSBvbiBmYWlsdXJlXG4gICAqL1xuICBhYnN0cmFjdCB2ZXJpZnkobXNnOiBCdWZmZXIsIHNpZzogQnVmZmVyLCBwdWJrOiBCdWZmZXIpOiBib29sZWFuXG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSByZWZlcmVuY2UgdG8gdGhlIHByaXZhdGUga2V5LlxuICAgKlxuICAgKiBAcmV0dXJucyBBIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IGNvbnRhaW5pbmcgdGhlIHByaXZhdGUga2V5XG4gICAqL1xuICBnZXRQcml2YXRlS2V5KCk6IEJ1ZmZlciB7XG4gICAgcmV0dXJuIHRoaXMucHJpdmtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgcmVmZXJlbmNlIHRvIHRoZSBwdWJsaWMga2V5LlxuICAgKlxuICAgKiBAcmV0dXJucyBBIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IGNvbnRhaW5pbmcgdGhlIHB1YmxpYyBrZXlcbiAgICovXG4gIGdldFB1YmxpY0tleSgpOiBCdWZmZXIge1xuICAgIHJldHVybiB0aGlzLnB1YmtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBwcml2YXRlIGtleS5cbiAgICpcbiAgICogQHJldHVybnMgQSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIHB1YmxpYyBrZXlcbiAgICovXG4gIGFic3RyYWN0IGdldFByaXZhdGVLZXlTdHJpbmcoKTogc3RyaW5nXG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHB1YmxpYyBrZXkuXG4gICAqXG4gICAqIEByZXR1cm5zIEEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBwdWJsaWMga2V5XG4gICAqL1xuICBhYnN0cmFjdCBnZXRQdWJsaWNLZXlTdHJpbmcoKTogc3RyaW5nXG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGFkZHJlc3MuXG4gICAqXG4gICAqIEByZXR1cm5zIEEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBhZGRyZXNzXG4gICAqL1xuICBhYnN0cmFjdCBnZXRBZGRyZXNzKCk6IEJ1ZmZlclxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBhZGRyZXNzJ3Mgc3RyaW5nIHJlcHJlc2VudGF0aW9uLlxuICAgKlxuICAgKiBAcmV0dXJucyBBIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgYWRkcmVzc1xuICAgKi9cbiAgYWJzdHJhY3QgZ2V0QWRkcmVzc1N0cmluZygpOiBzdHJpbmdcblxuICBhYnN0cmFjdCBjcmVhdGUoLi4uYXJnczogYW55W10pOiB0aGlzXG5cbiAgYWJzdHJhY3QgY2xvbmUoKTogdGhpc1xufVxuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgU2lnbmVyS2V5Q2hhaW4ge1xuICAvKipcbiAgICogUmV0dXJucyB0aGUgW1tTaWduZXJLZXlQYWlyXV0gbGlzdGVkIHVuZGVyIHRoZSBwcm92aWRlZCBhZGRyZXNzXG4gICAqXG4gICAqIEBwYXJhbSBhZGRyZXNzIFRoZSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBvZiB0aGUgYWRkcmVzcyB0b1xuICAgKiByZXRyaWV2ZSBmcm9tIHRoZSBrZXlzIGRhdGFiYXNlXG4gICAqXG4gICAqIEByZXR1cm5zIEEgcmVmZXJlbmNlIHRvIHRoZSBbW1NpZ25lcktleVBhaXJdXSBpbiB0aGUga2V5cyBkYXRhYmFzZVxuICAgKi9cbiAgYWJzdHJhY3QgZ2V0S2V5KGFkZHJlc3M6IEJ1ZmZlcik6IFNpZ25lcktleVBhaXJcbn1cblxuLyoqXG4gKiBDbGFzcyBmb3IgcmVwcmVzZW50aW5nIGEga2V5IGNoYWluIGluIEF2YWxhbmNoZS5cbiAqIEFsbCBlbmRwb2ludHMgdGhhdCBuZWVkIGtleSBjaGFpbnMgc2hvdWxkIGV4dGVuZCBvbiB0aGlzIGNsYXNzLlxuICpcbiAqIEB0eXBlcGFyYW0gS1BDbGFzcyBleHRlbmRpbmcgW1tTdGFuZGFyZEtleVBhaXJdXSB3aGljaCBpcyB1c2VkIGFzIHRoZSBrZXkgaW4gW1tTdGFuZGFyZEtleUNoYWluXV1cbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFN0YW5kYXJkS2V5Q2hhaW48S1BDbGFzcyBleHRlbmRzIFN0YW5kYXJkS2V5UGFpcj4ge1xuICBwcm90ZWN0ZWQga2V5czogeyBbYWRkcmVzczogc3RyaW5nXTogS1BDbGFzcyB9ID0ge31cblxuICAvKipcbiAgICogTWFrZXMgYSBuZXcgW1tTdGFuZGFyZEtleVBhaXJdXSwgcmV0dXJucyB0aGUgYWRkcmVzcy5cbiAgICpcbiAgICogQHJldHVybnMgQWRkcmVzcyBvZiB0aGUgbmV3IFtbU3RhbmRhcmRLZXlQYWlyXV1cbiAgICovXG4gIG1ha2VLZXk6ICgpID0+IEtQQ2xhc3NcblxuICAvKipcbiAgICogR2l2ZW4gYSBwcml2YXRlIGtleSwgbWFrZXMgYSBuZXcgW1tTdGFuZGFyZEtleVBhaXJdXSwgcmV0dXJucyB0aGUgYWRkcmVzcy5cbiAgICpcbiAgICogQHBhcmFtIHByaXZrIEEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gcmVwcmVzZW50aW5nIHRoZSBwcml2YXRlIGtleVxuICAgKlxuICAgKiBAcmV0dXJucyBBIG5ldyBbW1N0YW5kYXJkS2V5UGFpcl1dXG4gICAqL1xuICBpbXBvcnRLZXk6IChwcml2azogQnVmZmVyKSA9PiBLUENsYXNzXG5cbiAgLyoqXG4gICAqIEdldHMgYW4gYXJyYXkgb2YgYWRkcmVzc2VzIHN0b3JlZCBpbiB0aGUgW1tTdGFuZGFyZEtleUNoYWluXV0uXG4gICAqXG4gICAqIEByZXR1cm5zIEFuIGFycmF5IG9mIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9ICByZXByZXNlbnRhdGlvbnNcbiAgICogb2YgdGhlIGFkZHJlc3Nlc1xuICAgKi9cbiAgZ2V0QWRkcmVzc2VzID0gKCk6IEJ1ZmZlcltdID0+XG4gICAgT2JqZWN0LnZhbHVlcyh0aGlzLmtleXMpLm1hcCgoa3ApID0+IGtwLmdldEFkZHJlc3MoKSlcblxuICAvKipcbiAgICogR2V0cyBhbiBhcnJheSBvZiBhZGRyZXNzZXMgc3RvcmVkIGluIHRoZSBbW1N0YW5kYXJkS2V5Q2hhaW5dXS5cbiAgICpcbiAgICogQHJldHVybnMgQW4gYXJyYXkgb2Ygc3RyaW5nIHJlcHJlc2VudGF0aW9ucyBvZiB0aGUgYWRkcmVzc2VzXG4gICAqL1xuICBnZXRBZGRyZXNzU3RyaW5ncyA9ICgpOiBzdHJpbmdbXSA9PlxuICAgIE9iamVjdC52YWx1ZXModGhpcy5rZXlzKS5tYXAoKGtwKSA9PiBrcC5nZXRBZGRyZXNzU3RyaW5nKCkpXG5cbiAgLyoqXG4gICAqIEFkZHMgdGhlIGtleSBwYWlyIHRvIHRoZSBsaXN0IG9mIHRoZSBrZXlzIG1hbmFnZWQgaW4gdGhlIFtbU3RhbmRhcmRLZXlDaGFpbl1dLlxuICAgKlxuICAgKiBAcGFyYW0gbmV3S2V5IEEga2V5IHBhaXIgb2YgdGhlIGFwcHJvcHJpYXRlIGNsYXNzIHRvIGJlIGFkZGVkIHRvIHRoZSBbW1N0YW5kYXJkS2V5Q2hhaW5dXVxuICAgKi9cbiAgYWRkS2V5KG5ld0tleTogS1BDbGFzcykge1xuICAgIHRoaXMua2V5c1tuZXdLZXkuZ2V0QWRkcmVzcygpLnRvU3RyaW5nKFwiaGV4XCIpXSA9IG5ld0tleVxuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgdGhlIGtleSBwYWlyIGZyb20gdGhlIGxpc3Qgb2YgdGhleSBrZXlzIG1hbmFnZWQgaW4gdGhlIFtbU3RhbmRhcmRLZXlDaGFpbl1dLlxuICAgKlxuICAgKiBAcGFyYW0ga2V5IEEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gZm9yIHRoZSBhZGRyZXNzIG9yXG4gICAqIEtQQ2xhc3MgdG8gcmVtb3ZlXG4gICAqXG4gICAqIEByZXR1cm5zIFRoZSBib29sZWFuIHRydWUgaWYgYSBrZXkgd2FzIHJlbW92ZWQuXG4gICAqL1xuICByZW1vdmVLZXkgPSAoa2V5OiBLUENsYXNzIHwgQnVmZmVyKSA9PiB7XG4gICAgbGV0IGthZGRyOiBzdHJpbmdcbiAgICBpZiAoa2V5IGluc3RhbmNlb2YgQnVmZmVyKSB7XG4gICAgICBrYWRkciA9IGtleS50b1N0cmluZyhcImhleFwiKVxuICAgIH0gZWxzZSB7XG4gICAgICBrYWRkciA9IGtleS5nZXRBZGRyZXNzKCkudG9TdHJpbmcoXCJoZXhcIilcbiAgICB9XG4gICAgaWYgKGthZGRyIGluIHRoaXMua2V5cykge1xuICAgICAgZGVsZXRlIHRoaXMua2V5c1tgJHtrYWRkcn1gXVxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIGlmIHRoZXJlIGlzIGEga2V5IGFzc29jaWF0ZWQgd2l0aCB0aGUgcHJvdmlkZWQgYWRkcmVzcy5cbiAgICpcbiAgICogQHBhcmFtIGFkZHJlc3MgVGhlIGFkZHJlc3MgdG8gY2hlY2sgZm9yIGV4aXN0ZW5jZSBpbiB0aGUga2V5cyBkYXRhYmFzZVxuICAgKlxuICAgKiBAcmV0dXJucyBUcnVlIG9uIHN1Y2Nlc3MsIGZhbHNlIGlmIG5vdCBmb3VuZFxuICAgKi9cbiAgaGFzS2V5ID0gKGFkZHJlc3M6IEJ1ZmZlcik6IGJvb2xlYW4gPT4gYWRkcmVzcy50b1N0cmluZyhcImhleFwiKSBpbiB0aGlzLmtleXNcblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgW1tTdGFuZGFyZEtleVBhaXJdXSBsaXN0ZWQgdW5kZXIgdGhlIHByb3ZpZGVkIGFkZHJlc3NcbiAgICpcbiAgICogQHBhcmFtIGFkZHJlc3MgVGhlIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IG9mIHRoZSBhZGRyZXNzIHRvXG4gICAqIHJldHJpZXZlIGZyb20gdGhlIGtleXMgZGF0YWJhc2VcbiAgICpcbiAgICogQHJldHVybnMgQSByZWZlcmVuY2UgdG8gdGhlIFtbU3RhbmRhcmRLZXlQYWlyXV0gaW4gdGhlIGtleXMgZGF0YWJhc2VcbiAgICovXG4gIGdldEtleSA9IChhZGRyZXNzOiBCdWZmZXIpOiBLUENsYXNzID0+IHRoaXMua2V5c1thZGRyZXNzLnRvU3RyaW5nKFwiaGV4XCIpXVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBbW1N0YW5kYXJkS2V5UGFpcl1dJ3MgbGlzdGVkIHVuZGVyIHRoZSBwcm92aWRlZCBhZGRyZXNzXG4gICAqXG4gICAqIEBwYXJhbSBhZGRyZXNzIFRoZSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBvZiB0aGUgYWRkcmVzcyB0b1xuICAgKiByZXRyaWV2ZSBmcm9tIHRoZSBrZXlzIGRhdGFiYXNlXG4gICAqXG4gICAqIEByZXR1cm5zIEEgcmVmZXJlbmNlIHRvIHRoZSBbW1N0YW5kYXJkS2V5UGFpcl1dJ3MgaW4gdGhlIGtleXMgZGF0YWJhc2VcbiAgICovXG4gIGdldEtleXMgPSAoYWRkcmVzczogQnVmZmVyKTogS1BDbGFzc1tdID0+IFt0aGlzLmtleXNbYWRkcmVzcy50b1N0cmluZyhcImhleFwiKV1dXG5cbiAgYWJzdHJhY3QgY3JlYXRlKC4uLmFyZ3M6IGFueVtdKTogdGhpc1xuXG4gIGFic3RyYWN0IGNsb25lKCk6IHRoaXNcblxuICBhYnN0cmFjdCB1bmlvbihrYzogdGhpcyk6IHRoaXNcbn1cbiJdfQ==
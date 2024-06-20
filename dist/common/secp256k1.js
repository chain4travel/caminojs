"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SECP256k1KeyChain = exports.SECP256k1KeyPair = void 0;
/**
 * @packageDocumentation
 * @module Common-SECP256k1KeyChain
 */
const buffer_1 = require("buffer/");
const elliptic = __importStar(require("elliptic"));
const create_hash_1 = __importDefault(require("create-hash"));
const bintools_1 = __importDefault(require("../utils/bintools"));
const keychain_1 = require("./keychain");
const errors_1 = require("../utils/errors");
const utils_1 = require("../utils");
/**
 * @ignore
 */
const EC = elliptic.ec;
/**
 * @ignore
 */
const ec = new EC("secp256k1");
/**
 * @ignore
 */
const ecparams = ec.curve;
/**
 * @ignore
 */
const BN = ecparams.n.constructor;
/**
 * @ignore
 */
const bintools = bintools_1.default.getInstance();
const serialization = utils_1.Serialization.getInstance();
/**
 * Class for representing a private and public keypair on the Platform Chain.
 */
class SECP256k1KeyPair extends keychain_1.StandardKeyPair {
    /**
     * @ignore
     */
    _sigFromSigBuffer(sig) {
        const r = new BN(bintools.copyFrom(sig, 0, 32));
        const s = new BN(bintools.copyFrom(sig, 32, 64));
        const recoveryParam = bintools
            .copyFrom(sig, 64, 65)
            .readUIntBE(0, 1);
        const sigOpt = {
            r: r,
            s: s,
            recoveryParam: recoveryParam
        };
        return sigOpt;
    }
    /**
     * Generates a new keypair.
     */
    generateKey() {
        this.keypair = ec.genKeyPair();
        // doing hex translation to get Buffer class
        this.privk = buffer_1.Buffer.from(this.keypair.getPrivate("hex").padStart(64, "0"), "hex");
        this.pubk = buffer_1.Buffer.from(this.keypair.getPublic(true, "hex").padStart(66, "0"), "hex");
    }
    /**
     * Imports a private key and generates the appropriate public key.
     *
     * @param privk A {@link https://github.com/feross/buffer|Buffer} representing the private key
     *
     * @returns true on success, false on failure
     */
    importKey(privk) {
        this.keypair = ec.keyFromPrivate(privk.toString("hex"), "hex");
        // doing hex translation to get Buffer class
        try {
            this.privk = buffer_1.Buffer.from(this.keypair.getPrivate("hex").padStart(64, "0"), "hex");
            this.pubk = buffer_1.Buffer.from(this.keypair.getPublic(true, "hex").padStart(66, "0"), "hex");
            return true; // silly I know, but the interface requires so it returns true on success, so if Buffer fails validation...
        }
        catch (error) {
            return false;
        }
    }
    /**
     * Returns the address as a {@link https://github.com/feross/buffer|Buffer}.
     *
     * @returns A {@link https://github.com/feross/buffer|Buffer} representation of the address
     */
    getAddress() {
        return SECP256k1KeyPair.addressFromPublicKey(this.pubk);
    }
    /**
     * Returns the address's string representation.
     *
     * @returns A string representation of the address
     */
    getAddressString() {
        const addr = SECP256k1KeyPair.addressFromPublicKey(this.pubk);
        const type = "bech32";
        return serialization.bufferToType(addr, type, this.hrp, this.chainID);
    }
    /**
     * Returns an address given a public key.
     *
     * @param pubk A {@link https://github.com/feross/buffer|Buffer} representing the public key
     *
     * @returns A {@link https://github.com/feross/buffer|Buffer} for the address of the public key.
     */
    static addressFromPublicKey(pubk) {
        if (pubk.length === 65) {
            /* istanbul ignore next */
            pubk = buffer_1.Buffer.from(ec.keyFromPublic(pubk).getPublic(true, "hex").padStart(66, "0"), "hex"); // make compact, stick back into buffer
        }
        if (pubk.length === 33) {
            const sha256 = buffer_1.Buffer.from((0, create_hash_1.default)("sha256").update(pubk).digest());
            const ripesha = buffer_1.Buffer.from((0, create_hash_1.default)("ripemd160").update(sha256).digest());
            return ripesha;
        }
        /* istanbul ignore next */
        throw new errors_1.PublicKeyError("Unable to make address.");
    }
    /**
     * Returns a string representation of the private key.
     *
     * @returns A cb58 serialized string representation of the private key
     */
    getPrivateKeyString() {
        return `PrivateKey-${bintools.cb58Encode(this.privk)}`;
    }
    /**
     * Returns the public key.
     *
     * @returns A cb58 serialized string representation of the public key
     */
    getPublicKeyString() {
        return bintools.cb58Encode(this.pubk);
    }
    /**
     * Takes a message, signs it, and returns the signature.
     *
     * @param msg The message to sign, be sure to hash first if expected
     *
     * @returns A {@link https://github.com/feross/buffer|Buffer} containing the signature
     */
    sign(msg) {
        const sigObj = this.keypair.sign(msg, undefined, {
            canonical: true
        });
        const recovery = buffer_1.Buffer.alloc(1);
        recovery.writeUInt8(sigObj.recoveryParam, 0);
        const r = buffer_1.Buffer.from(sigObj.r.toArray("be", 32)); //we have to skip native Buffer class, so this is the way
        const s = buffer_1.Buffer.from(sigObj.s.toArray("be", 32)); //we have to skip native Buffer class, so this is the way
        const result = buffer_1.Buffer.concat([r, s, recovery], 65);
        return result;
    }
    /**
     * Verifies that the private key associated with the provided public key produces the signature associated with the given message.
     *
     * @param msg The message associated with the signature
     * @param sig The signature of the signed message
     *
     * @returns True on success, false on failure
     */
    verify(msg, sig) {
        const sigObj = this._sigFromSigBuffer(sig);
        return ec.verify(msg, sigObj, this.keypair);
    }
    /**
     * Recovers the public key of a message signer from a message and its associated signature.
     *
     * @param msg The message that's signed
     * @param sig The signature that's signed on the message
     *
     * @returns A {@link https://github.com/feross/buffer|Buffer} containing the public key of the signer
     */
    recover(msg, sig) {
        const sigObj = this._sigFromSigBuffer(sig);
        const pubk = ec.recoverPubKey(msg, sigObj, sigObj.recoveryParam);
        return buffer_1.Buffer.from(pubk.encodeCompressed());
    }
    /**
     * Returns the chainID associated with this key.
     *
     * @returns The [[KeyPair]]'s chainID
     */
    getChainID() {
        return this.chainID;
    }
    /**
     * Sets the the chainID associated with this key.
     *
     * @param chainID String for the chainID
     */
    setChainID(chainID) {
        this.chainID = chainID;
    }
    /**
     * Returns the Human-Readable-Part of the network associated with this key.
     *
     * @returns The [[KeyPair]]'s Human-Readable-Part of the network's Bech32 addressing scheme
     */
    getHRP() {
        return this.hrp;
    }
    /**
     * Sets the the Human-Readable-Part of the network associated with this key.
     *
     * @param hrp String for the Human-Readable-Part of Bech32 addresses
     */
    setHRP(hrp) {
        this.hrp = hrp;
    }
    constructor(hrp, chainID) {
        super();
        this.chainID = "";
        this.hrp = "";
        this.chainID = chainID;
        this.hrp = hrp;
        this.generateKey();
    }
}
exports.SECP256k1KeyPair = SECP256k1KeyPair;
/**
 * Class for representing a key chain in Avalanche.
 *
 * @typeparam SECP256k1KeyPair Class extending [[StandardKeyPair]] which is used as the key in [[SECP256k1KeyChain]]
 */
class SECP256k1KeyChain extends keychain_1.StandardKeyChain {
    addKey(newKey) {
        super.addKey(newKey);
    }
}
exports.SECP256k1KeyChain = SECP256k1KeyChain;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VjcDI1NmsxLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbW1vbi9zZWNwMjU2azEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7O0dBR0c7QUFDSCxvQ0FBZ0M7QUFDaEMsbURBQW9DO0FBQ3BDLDhEQUFvQztBQUNwQyxpRUFBd0M7QUFDeEMseUNBQThEO0FBQzlELDRDQUFnRDtBQUVoRCxvQ0FBd0Q7QUFFeEQ7O0dBRUc7QUFDSCxNQUFNLEVBQUUsR0FBdUIsUUFBUSxDQUFDLEVBQUUsQ0FBQTtBQUUxQzs7R0FFRztBQUNILE1BQU0sRUFBRSxHQUFnQixJQUFJLEVBQUUsQ0FBQyxXQUFXLENBQUMsQ0FBQTtBQUUzQzs7R0FFRztBQUNILE1BQU0sUUFBUSxHQUFRLEVBQUUsQ0FBQyxLQUFLLENBQUE7QUFFOUI7O0dBRUc7QUFDSCxNQUFNLEVBQUUsR0FBUSxRQUFRLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQTtBQUV0Qzs7R0FFRztBQUNILE1BQU0sUUFBUSxHQUFhLGtCQUFRLENBQUMsV0FBVyxFQUFFLENBQUE7QUFDakQsTUFBTSxhQUFhLEdBQWtCLHFCQUFhLENBQUMsV0FBVyxFQUFFLENBQUE7QUFFaEU7O0dBRUc7QUFDSCxNQUFzQixnQkFBaUIsU0FBUSwwQkFBZTtJQUs1RDs7T0FFRztJQUNPLGlCQUFpQixDQUFDLEdBQVc7UUFDckMsTUFBTSxDQUFDLEdBQVksSUFBSSxFQUFFLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUE7UUFDeEQsTUFBTSxDQUFDLEdBQVksSUFBSSxFQUFFLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUE7UUFDekQsTUFBTSxhQUFhLEdBQVcsUUFBUTthQUNuQyxRQUFRLENBQUMsR0FBRyxF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SUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUE7SUFDaEIsQ0FBQztJQUVELFlBQVksR0FBVyxFQUFFLE9BQWU7UUFDdEMsS0FBSyxFQUFFLENBQUE7UUFuTkMsWUFBTyxHQUFXLEVBQUUsQ0FBQTtRQUNwQixRQUFHLEdBQVcsRUFBRSxDQUFBO1FBbU54QixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQTtRQUN0QixJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUNkLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQTtJQUNwQixDQUFDO0NBQ0Y7QUExTkQsNENBME5DO0FBRUQ7Ozs7R0FJRztBQUNILE1BQXNCLGlCQUVwQixTQUFRLDJCQUE2QjtJQVFyQyxNQUFNLENBQUMsTUFBbUI7UUFDeEIsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQTtJQUN0QixDQUFDO0NBVUY7QUF0QkQsOENBc0JDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAcGFja2FnZURvY3VtZW50YXRpb25cbiAqIEBtb2R1bGUgQ29tbW9uLVNFQ1AyNTZrMUtleUNoYWluXG4gKi9cbmltcG9ydCB7IEJ1ZmZlciB9IGZyb20gXCJidWZmZXIvXCJcbmltcG9ydCAqIGFzIGVsbGlwdGljIGZyb20gXCJlbGxpcHRpY1wiXG5pbXBvcnQgY3JlYXRlSGFzaCBmcm9tIFwiY3JlYXRlLWhhc2hcIlxuaW1wb3J0IEJpblRvb2xzIGZyb20gXCIuLi91dGlscy9iaW50b29sc1wiXG5pbXBvcnQgeyBTdGFuZGFyZEtleVBhaXIsIFN0YW5kYXJkS2V5Q2hhaW4gfSBmcm9tIFwiLi9rZXljaGFpblwiXG5pbXBvcnQgeyBQdWJsaWNLZXlFcnJvciB9IGZyb20gXCIuLi91dGlscy9lcnJvcnNcIlxuaW1wb3J0IHsgQk5JbnB1dCB9IGZyb20gXCJlbGxpcHRpY1wiXG5pbXBvcnQgeyBTZXJpYWxpemF0aW9uLCBTZXJpYWxpemVkVHlwZSB9IGZyb20gXCIuLi91dGlsc1wiXG5cbi8qKlxuICogQGlnbm9yZVxuICovXG5jb25zdCBFQzogdHlwZW9mIGVsbGlwdGljLmVjID0gZWxsaXB0aWMuZWNcblxuLyoqXG4gKiBAaWdub3JlXG4gKi9cbmNvbnN0IGVjOiBlbGxpcHRpYy5lYyA9IG5ldyBFQyhcInNlY3AyNTZrMVwiKVxuXG4vKipcbiAqIEBpZ25vcmVcbiAqL1xuY29uc3QgZWNwYXJhbXM6IGFueSA9IGVjLmN1cnZlXG5cbi8qKlxuICogQGlnbm9yZVxuICovXG5jb25zdCBCTjogYW55ID0gZWNwYXJhbXMubi5jb25zdHJ1Y3RvclxuXG4vKipcbiAqIEBpZ25vcmVcbiAqL1xuY29uc3QgYmludG9vbHM6IEJpblRvb2xzID0gQmluVG9vbHMuZ2V0SW5zdGFuY2UoKVxuY29uc3Qgc2VyaWFsaXphdGlvbjogU2VyaWFsaXphdGlvbiA9IFNlcmlhbGl6YXRpb24uZ2V0SW5zdGFuY2UoKVxuXG4vKipcbiAqIENsYXNzIGZvciByZXByZXNlbnRpbmcgYSBwcml2YXRlIGFuZCBwdWJsaWMga2V5cGFpciBvbiB0aGUgUGxhdGZvcm0gQ2hhaW4uXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBTRUNQMjU2azFLZXlQYWlyIGV4dGVuZHMgU3RhbmRhcmRLZXlQYWlyIHtcbiAgcHJvdGVjdGVkIGtleXBhaXI6IGVsbGlwdGljLmVjLktleVBhaXJcbiAgcHJvdGVjdGVkIGNoYWluSUQ6IHN0cmluZyA9IFwiXCJcbiAgcHJvdGVjdGVkIGhycDogc3RyaW5nID0gXCJcIlxuXG4gIC8qKlxuICAgKiBAaWdub3JlXG4gICAqL1xuICBwcm90ZWN0ZWQgX3NpZ0Zyb21TaWdCdWZmZXIoc2lnOiBCdWZmZXIpOiBlbGxpcHRpYy5lYy5TaWduYXR1cmVPcHRpb25zIHtcbiAgICBjb25zdCByOiBCTklucHV0ID0gbmV3IEJOKGJpbnRvb2xzLmNvcHlGcm9tKHNpZywgMCwgMzIpKVxuICAgIGNvbnN0IHM6IEJOSW5wdXQgPSBuZXcgQk4oYmludG9vbHMuY29weUZyb20oc2lnLCAzMiwgNjQpKVxuICAgIGNvbnN0IHJlY292ZXJ5UGFyYW06IG51bWJlciA9IGJpbnRvb2xzXG4gICAgICAuY29weUZyb20oc2lnLCA2NCwgNjUpXG4gICAgICAucmVhZFVJbnRCRSgwLCAxKVxuICAgIGNvbnN0IHNpZ09wdCA9IHtcbiAgICAgIHI6IHIsXG4gICAgICBzOiBzLFxuICAgICAgcmVjb3ZlcnlQYXJhbTogcmVjb3ZlcnlQYXJhbVxuICAgIH1cbiAgICByZXR1cm4gc2lnT3B0XG4gIH1cblxuICAvKipcbiAgICogR2VuZXJhdGVzIGEgbmV3IGtleXBhaXIuXG4gICAqL1xuICBnZW5lcmF0ZUtleSgpIHtcbiAgICB0aGlzLmtleXBhaXIgPSBlYy5nZW5LZXlQYWlyKClcblxuICAgIC8vIGRvaW5nIGhleCB0cmFuc2xhdGlvbiB0byBnZXQgQnVmZmVyIGNsYXNzXG4gICAgdGhpcy5wcml2ayA9IEJ1ZmZlci5mcm9tKFxuICAgICAgdGhpcy5rZXlwYWlyLmdldFByaXZhdGUoXCJoZXhcIikucGFkU3RhcnQoNjQsIFwiMFwiKSxcbiAgICAgIFwiaGV4XCJcbiAgICApXG4gICAgdGhpcy5wdWJrID0gQnVmZmVyLmZyb20oXG4gICAgICB0aGlzLmtleXBhaXIuZ2V0UHVibGljKHRydWUsIFwiaGV4XCIpLnBhZFN0YXJ0KDY2LCBcIjBcIiksXG4gICAgICBcImhleFwiXG4gICAgKVxuICB9XG5cbiAgLyoqXG4gICAqIEltcG9ydHMgYSBwcml2YXRlIGtleSBhbmQgZ2VuZXJhdGVzIHRoZSBhcHByb3ByaWF0ZSBwdWJsaWMga2V5LlxuICAgKlxuICAgKiBAcGFyYW0gcHJpdmsgQSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSByZXByZXNlbnRpbmcgdGhlIHByaXZhdGUga2V5XG4gICAqXG4gICAqIEByZXR1cm5zIHRydWUgb24gc3VjY2VzcywgZmFsc2Ugb24gZmFpbHVyZVxuICAgKi9cbiAgaW1wb3J0S2V5KHByaXZrOiBCdWZmZXIpOiBib29sZWFuIHtcbiAgICB0aGlzLmtleXBhaXIgPSBlYy5rZXlGcm9tUHJpdmF0ZShwcml2ay50b1N0cmluZyhcImhleFwiKSwgXCJoZXhcIilcbiAgICAvLyBkb2luZyBoZXggdHJhbnNsYXRpb24gdG8gZ2V0IEJ1ZmZlciBjbGFzc1xuICAgIHRyeSB7XG4gICAgICB0aGlzLnByaXZrID0gQnVmZmVyLmZyb20oXG4gICAgICAgIHRoaXMua2V5cGFpci5nZXRQcml2YXRlKFwiaGV4XCIpLnBhZFN0YXJ0KDY0LCBcIjBcIiksXG4gICAgICAgIFwiaGV4XCJcbiAgICAgIClcbiAgICAgIHRoaXMucHViayA9IEJ1ZmZlci5mcm9tKFxuICAgICAgICB0aGlzLmtleXBhaXIuZ2V0UHVibGljKHRydWUsIFwiaGV4XCIpLnBhZFN0YXJ0KDY2LCBcIjBcIiksXG4gICAgICAgIFwiaGV4XCJcbiAgICAgIClcbiAgICAgIHJldHVybiB0cnVlIC8vIHNpbGx5IEkga25vdywgYnV0IHRoZSBpbnRlcmZhY2UgcmVxdWlyZXMgc28gaXQgcmV0dXJucyB0cnVlIG9uIHN1Y2Nlc3MsIHNvIGlmIEJ1ZmZlciBmYWlscyB2YWxpZGF0aW9uLi4uXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBhZGRyZXNzIGFzIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0uXG4gICAqXG4gICAqIEByZXR1cm5zIEEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gcmVwcmVzZW50YXRpb24gb2YgdGhlIGFkZHJlc3NcbiAgICovXG4gIGdldEFkZHJlc3MoKTogQnVmZmVyIHtcbiAgICByZXR1cm4gU0VDUDI1NmsxS2V5UGFpci5hZGRyZXNzRnJvbVB1YmxpY0tleSh0aGlzLnB1YmspXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgYWRkcmVzcydzIHN0cmluZyByZXByZXNlbnRhdGlvbi5cbiAgICpcbiAgICogQHJldHVybnMgQSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIGFkZHJlc3NcbiAgICovXG4gIGdldEFkZHJlc3NTdHJpbmcoKTogc3RyaW5nIHtcbiAgICBjb25zdCBhZGRyOiBCdWZmZXIgPSBTRUNQMjU2azFLZXlQYWlyLmFkZHJlc3NGcm9tUHVibGljS2V5KHRoaXMucHViaylcbiAgICBjb25zdCB0eXBlOiBTZXJpYWxpemVkVHlwZSA9IFwiYmVjaDMyXCJcbiAgICByZXR1cm4gc2VyaWFsaXphdGlvbi5idWZmZXJUb1R5cGUoYWRkciwgdHlwZSwgdGhpcy5ocnAsIHRoaXMuY2hhaW5JRClcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFuIGFkZHJlc3MgZ2l2ZW4gYSBwdWJsaWMga2V5LlxuICAgKlxuICAgKiBAcGFyYW0gcHViayBBIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IHJlcHJlc2VudGluZyB0aGUgcHVibGljIGtleVxuICAgKlxuICAgKiBAcmV0dXJucyBBIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IGZvciB0aGUgYWRkcmVzcyBvZiB0aGUgcHVibGljIGtleS5cbiAgICovXG4gIHN0YXRpYyBhZGRyZXNzRnJvbVB1YmxpY0tleShwdWJrOiBCdWZmZXIpOiBCdWZmZXIge1xuICAgIGlmIChwdWJrLmxlbmd0aCA9PT0gNjUpIHtcbiAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICBwdWJrID0gQnVmZmVyLmZyb20oXG4gICAgICAgIGVjLmtleUZyb21QdWJsaWMocHViaykuZ2V0UHVibGljKHRydWUsIFwiaGV4XCIpLnBhZFN0YXJ0KDY2LCBcIjBcIiksXG4gICAgICAgIFwiaGV4XCJcbiAgICAgICkgLy8gbWFrZSBjb21wYWN0LCBzdGljayBiYWNrIGludG8gYnVmZmVyXG4gICAgfVxuICAgIGlmIChwdWJrLmxlbmd0aCA9PT0gMzMpIHtcbiAgICAgIGNvbnN0IHNoYTI1NjogQnVmZmVyID0gQnVmZmVyLmZyb20oXG4gICAgICAgIGNyZWF0ZUhhc2goXCJzaGEyNTZcIikudXBkYXRlKHB1YmspLmRpZ2VzdCgpXG4gICAgICApXG4gICAgICBjb25zdCByaXBlc2hhOiBCdWZmZXIgPSBCdWZmZXIuZnJvbShcbiAgICAgICAgY3JlYXRlSGFzaChcInJpcGVtZDE2MFwiKS51cGRhdGUoc2hhMjU2KS5kaWdlc3QoKVxuICAgICAgKVxuICAgICAgcmV0dXJuIHJpcGVzaGFcbiAgICB9XG4gICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICB0aHJvdyBuZXcgUHVibGljS2V5RXJyb3IoXCJVbmFibGUgdG8gbWFrZSBhZGRyZXNzLlwiKVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIHByaXZhdGUga2V5LlxuICAgKlxuICAgKiBAcmV0dXJucyBBIGNiNTggc2VyaWFsaXplZCBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIHByaXZhdGUga2V5XG4gICAqL1xuICBnZXRQcml2YXRlS2V5U3RyaW5nKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGBQcml2YXRlS2V5LSR7YmludG9vbHMuY2I1OEVuY29kZSh0aGlzLnByaXZrKX1gXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgcHVibGljIGtleS5cbiAgICpcbiAgICogQHJldHVybnMgQSBjYjU4IHNlcmlhbGl6ZWQgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBwdWJsaWMga2V5XG4gICAqL1xuICBnZXRQdWJsaWNLZXlTdHJpbmcoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYmludG9vbHMuY2I1OEVuY29kZSh0aGlzLnB1YmspXG4gIH1cblxuICAvKipcbiAgICogVGFrZXMgYSBtZXNzYWdlLCBzaWducyBpdCwgYW5kIHJldHVybnMgdGhlIHNpZ25hdHVyZS5cbiAgICpcbiAgICogQHBhcmFtIG1zZyBUaGUgbWVzc2FnZSB0byBzaWduLCBiZSBzdXJlIHRvIGhhc2ggZmlyc3QgaWYgZXhwZWN0ZWRcbiAgICpcbiAgICogQHJldHVybnMgQSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBjb250YWluaW5nIHRoZSBzaWduYXR1cmVcbiAgICovXG4gIHNpZ24obXNnOiBCdWZmZXIpOiBCdWZmZXIge1xuICAgIGNvbnN0IHNpZ09iajogZWxsaXB0aWMuZWMuU2lnbmF0dXJlID0gdGhpcy5rZXlwYWlyLnNpZ24obXNnLCB1bmRlZmluZWQsIHtcbiAgICAgIGNhbm9uaWNhbDogdHJ1ZVxuICAgIH0pXG4gICAgY29uc3QgcmVjb3Zlcnk6IEJ1ZmZlciA9IEJ1ZmZlci5hbGxvYygxKVxuICAgIHJlY292ZXJ5LndyaXRlVUludDgoc2lnT2JqLnJlY292ZXJ5UGFyYW0sIDApXG4gICAgY29uc3QgcjogQnVmZmVyID0gQnVmZmVyLmZyb20oc2lnT2JqLnIudG9BcnJheShcImJlXCIsIDMyKSkgLy93ZSBoYXZlIHRvIHNraXAgbmF0aXZlIEJ1ZmZlciBjbGFzcywgc28gdGhpcyBpcyB0aGUgd2F5XG4gICAgY29uc3QgczogQnVmZmVyID0gQnVmZmVyLmZyb20oc2lnT2JqLnMudG9BcnJheShcImJlXCIsIDMyKSkgLy93ZSBoYXZlIHRvIHNraXAgbmF0aXZlIEJ1ZmZlciBjbGFzcywgc28gdGhpcyBpcyB0aGUgd2F5XG4gICAgY29uc3QgcmVzdWx0OiBCdWZmZXIgPSBCdWZmZXIuY29uY2F0KFtyLCBzLCByZWNvdmVyeV0sIDY1KVxuICAgIHJldHVybiByZXN1bHRcbiAgfVxuXG4gIC8qKlxuICAgKiBWZXJpZmllcyB0aGF0IHRoZSBwcml2YXRlIGtleSBhc3NvY2lhdGVkIHdpdGggdGhlIHByb3ZpZGVkIHB1YmxpYyBrZXkgcHJvZHVjZXMgdGhlIHNpZ25hdHVyZSBhc3NvY2lhdGVkIHdpdGggdGhlIGdpdmVuIG1lc3NhZ2UuXG4gICAqXG4gICAqIEBwYXJhbSBtc2cgVGhlIG1lc3NhZ2UgYXNzb2NpYXRlZCB3aXRoIHRoZSBzaWduYXR1cmVcbiAgICogQHBhcmFtIHNpZyBUaGUgc2lnbmF0dXJlIG9mIHRoZSBzaWduZWQgbWVzc2FnZVxuICAgKlxuICAgKiBAcmV0dXJucyBUcnVlIG9uIHN1Y2Nlc3MsIGZhbHNlIG9uIGZhaWx1cmVcbiAgICovXG4gIHZlcmlmeShtc2c6IEJ1ZmZlciwgc2lnOiBCdWZmZXIpOiBib29sZWFuIHtcbiAgICBjb25zdCBzaWdPYmo6IGVsbGlwdGljLmVjLlNpZ25hdHVyZU9wdGlvbnMgPSB0aGlzLl9zaWdGcm9tU2lnQnVmZmVyKHNpZylcbiAgICByZXR1cm4gZWMudmVyaWZ5KG1zZywgc2lnT2JqLCB0aGlzLmtleXBhaXIpXG4gIH1cblxuICAvKipcbiAgICogUmVjb3ZlcnMgdGhlIHB1YmxpYyBrZXkgb2YgYSBtZXNzYWdlIHNpZ25lciBmcm9tIGEgbWVzc2FnZSBhbmQgaXRzIGFzc29jaWF0ZWQgc2lnbmF0dXJlLlxuICAgKlxuICAgKiBAcGFyYW0gbXNnIFRoZSBtZXNzYWdlIHRoYXQncyBzaWduZWRcbiAgICogQHBhcmFtIHNpZyBUaGUgc2lnbmF0dXJlIHRoYXQncyBzaWduZWQgb24gdGhlIG1lc3NhZ2VcbiAgICpcbiAgICogQHJldHVybnMgQSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBjb250YWluaW5nIHRoZSBwdWJsaWMga2V5IG9mIHRoZSBzaWduZXJcbiAgICovXG4gIHJlY292ZXIobXNnOiBCdWZmZXIsIHNpZzogQnVmZmVyKTogQnVmZmVyIHtcbiAgICBjb25zdCBzaWdPYmo6IGVsbGlwdGljLmVjLlNpZ25hdHVyZU9wdGlvbnMgPSB0aGlzLl9zaWdGcm9tU2lnQnVmZmVyKHNpZylcbiAgICBjb25zdCBwdWJrID0gZWMucmVjb3ZlclB1YktleShtc2csIHNpZ09iaiwgc2lnT2JqLnJlY292ZXJ5UGFyYW0pXG4gICAgcmV0dXJuIEJ1ZmZlci5mcm9tKHB1YmsuZW5jb2RlQ29tcHJlc3NlZCgpKVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGNoYWluSUQgYXNzb2NpYXRlZCB3aXRoIHRoaXMga2V5LlxuICAgKlxuICAgKiBAcmV0dXJucyBUaGUgW1tLZXlQYWlyXV0ncyBjaGFpbklEXG4gICAqL1xuICBnZXRDaGFpbklEKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuY2hhaW5JRFxuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIHRoZSBjaGFpbklEIGFzc29jaWF0ZWQgd2l0aCB0aGlzIGtleS5cbiAgICpcbiAgICogQHBhcmFtIGNoYWluSUQgU3RyaW5nIGZvciB0aGUgY2hhaW5JRFxuICAgKi9cbiAgc2V0Q2hhaW5JRChjaGFpbklEOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLmNoYWluSUQgPSBjaGFpbklEXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgSHVtYW4tUmVhZGFibGUtUGFydCBvZiB0aGUgbmV0d29yayBhc3NvY2lhdGVkIHdpdGggdGhpcyBrZXkuXG4gICAqXG4gICAqIEByZXR1cm5zIFRoZSBbW0tleVBhaXJdXSdzIEh1bWFuLVJlYWRhYmxlLVBhcnQgb2YgdGhlIG5ldHdvcmsncyBCZWNoMzIgYWRkcmVzc2luZyBzY2hlbWVcbiAgICovXG4gIGdldEhSUCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLmhycFxuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIHRoZSBIdW1hbi1SZWFkYWJsZS1QYXJ0IG9mIHRoZSBuZXR3b3JrIGFzc29jaWF0ZWQgd2l0aCB0aGlzIGtleS5cbiAgICpcbiAgICogQHBhcmFtIGhycCBTdHJpbmcgZm9yIHRoZSBIdW1hbi1SZWFkYWJsZS1QYXJ0IG9mIEJlY2gzMiBhZGRyZXNzZXNcbiAgICovXG4gIHNldEhSUChocnA6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuaHJwID0gaHJwXG4gIH1cblxuICBjb25zdHJ1Y3RvcihocnA6IHN0cmluZywgY2hhaW5JRDogc3RyaW5nKSB7XG4gICAgc3VwZXIoKVxuICAgIHRoaXMuY2hhaW5JRCA9IGNoYWluSURcbiAgICB0aGlzLmhycCA9IGhycFxuICAgIHRoaXMuZ2VuZXJhdGVLZXkoKVxuICB9XG59XG5cbi8qKlxuICogQ2xhc3MgZm9yIHJlcHJlc2VudGluZyBhIGtleSBjaGFpbiBpbiBBdmFsYW5jaGUuXG4gKlxuICogQHR5cGVwYXJhbSBTRUNQMjU2azFLZXlQYWlyIENsYXNzIGV4dGVuZGluZyBbW1N0YW5kYXJkS2V5UGFpcl1dIHdoaWNoIGlzIHVzZWQgYXMgdGhlIGtleSBpbiBbW1NFQ1AyNTZrMUtleUNoYWluXV1cbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFNFQ1AyNTZrMUtleUNoYWluPFxuICBTRUNQS1BDbGFzcyBleHRlbmRzIFNFQ1AyNTZrMUtleVBhaXJcbj4gZXh0ZW5kcyBTdGFuZGFyZEtleUNoYWluPFNFQ1BLUENsYXNzPiB7XG4gIC8qKlxuICAgKiBNYWtlcyBhIG5ldyBrZXkgcGFpciwgcmV0dXJucyB0aGUgYWRkcmVzcy5cbiAgICpcbiAgICogQHJldHVybnMgQWRkcmVzcyBvZiB0aGUgbmV3IGtleSBwYWlyXG4gICAqL1xuICBtYWtlS2V5OiAoKSA9PiBTRUNQS1BDbGFzc1xuXG4gIGFkZEtleShuZXdLZXk6IFNFQ1BLUENsYXNzKTogdm9pZCB7XG4gICAgc3VwZXIuYWRkS2V5KG5ld0tleSlcbiAgfVxuXG4gIC8qKlxuICAgKiBHaXZlbiBhIHByaXZhdGUga2V5LCBtYWtlcyBhIG5ldyBrZXkgcGFpciwgcmV0dXJucyB0aGUgYWRkcmVzcy5cbiAgICpcbiAgICogQHBhcmFtIHByaXZrIEEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gb3IgY2I1OCBzZXJpYWxpemVkIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIHByaXZhdGUga2V5XG4gICAqXG4gICAqIEByZXR1cm5zIEFkZHJlc3Mgb2YgdGhlIG5ldyBrZXkgcGFpclxuICAgKi9cbiAgaW1wb3J0S2V5OiAocHJpdms6IEJ1ZmZlciB8IHN0cmluZykgPT4gU0VDUEtQQ2xhc3Ncbn1cbiJdfQ==
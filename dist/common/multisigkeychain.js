"use strict";
/**
 * @packageDocumentation
 * @module Common-MultisigKeyChain
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultisigKeyChain = exports.MultisigKeyPair = exports.SignatureError = void 0;
const buffer_1 = require("buffer/");
const _1 = require(".");
const utils_1 = require("../utils");
const bintools_1 = __importDefault(require("../utils/bintools"));
const keychain_1 = require("./keychain");
const secp256k1_1 = require("./secp256k1");
class SignatureError extends Error {
}
exports.SignatureError = SignatureError;
const NotImplemented = new Error("not implemented in MultiSig KeyPair");
const TooManySignatures = new SignatureError("too many signatures");
const serialization = utils_1.Serialization.getInstance();
const bintools = bintools_1.default.getInstance();
const MaxSignatures = 256;
/**
 * Class for representing a generic multi signature key.
 */
class MultisigKeyPair extends keychain_1.StandardKeyPair {
    generateKey() {
        throw NotImplemented;
    }
    importKey(_) {
        return false;
    }
    sign(_) {
        return this.privk;
    }
    recover(msg, sig) {
        throw NotImplemented;
    }
    verify(msg, sig) {
        throw NotImplemented;
    }
    getAddress() {
        return this.pubk;
    }
    getAddressString() {
        const addr = secp256k1_1.SECP256k1KeyPair.addressFromPublicKey(this.pubk);
        const type = "bech32";
        return serialization.bufferToType(addr, type, this.keyChain.getHRP(), this.keyChain.getChainID());
    }
    create(...args) {
        if (args.length == 3) {
            return new MultisigKeyPair(args[0], args[1], args[2]);
        }
        return new MultisigKeyPair(this.keyChain, this.pubk, this.privk);
    }
    clone() {
        return new MultisigKeyPair(this.keyChain, this.pubk, this.privk);
    }
    getPrivateKeyString() {
        return bintools.cb58Encode(this.privk);
    }
    getPublicKeyString() {
        return bintools.cb58Encode(this.pubk);
    }
    constructor(keyChain, address, signature) {
        super();
        this.keyChain = keyChain;
        this.pubk = buffer_1.Buffer.from(address);
        this.privk = buffer_1.Buffer.from(signature);
    }
}
exports.MultisigKeyPair = MultisigKeyPair;
/**
 * Class for representing a multisig keyChain in Camino.
 *
 * @typeparam MultisigKeyChain Class extending [[StandardKeyChain]]
 */
class MultisigKeyChain extends keychain_1.StandardKeyChain {
    getHRP() {
        return this.hrp;
    }
    getChainID() {
        return this.chainID;
    }
    create(...args) {
        if (args.length == 4) {
            return new MultisigKeyChain(args[0], args[1], args[2], args[4]);
        }
        return new MultisigKeyChain(this.hrp, this.chainID, this.signedBytes, this.credTypeID);
    }
    clone() {
        const newkc = new MultisigKeyChain(this.hrp, this.chainID, this.signedBytes, this.credTypeID);
        for (let k in this.keys) {
            newkc.addKey(this.keys[`${k}`].clone());
        }
        newkc.txOwners = new Array(this.txOwners.length);
        this.txOwners.forEach((txo, index) => newkc.txOwners[index].fromBuffer(txo.toBuffer()));
        return newkc;
    }
    union(kc) {
        if (kc.chainID !== this.chainID ||
            kc.hrp != this.hrp ||
            kc.signedBytes.compare(this.signedBytes) != 0) {
            throw new Error("keychains do not match");
        }
        const newkc = kc.clone();
        Object.assign(newkc.keys, kc.keys);
        return newkc;
    }
    // Visit every txOutputOwner and try to verify with keys.
    // Traverse into msig aliases. Throw if one cannot be fulfilled
    buildSignatureIndices() {
        this.sigIdxs = [];
        for (const o of this.txOwners)
            this._traverseOwner(o);
    }
    getCredentials() {
        const result = [];
        for (const sigSet of this.sigIdxs) {
            const cred = new _1.SECPMultisigCredential(this.credTypeID);
            for (const sigIdx of sigSet) {
                cred.addSSignatureIndex(sigIdx);
                const sig = new _1.Signature();
                sig.fromBuffer(this.getKey(sigIdx.getSource()).getPrivateKey());
                cred.addSignature(sig);
            }
            result.push(cred);
        }
        return result;
    }
    _traverseOwner(owner) {
        var addrVisited = 0;
        var addrVerified = 0;
        const cycleCheck = new Set();
        const stack = [
            {
                index: 0,
                verified: 0,
                addrVerifiedTotal: 0,
                parentVerified: false,
                owners: owner
            }
        ];
        const sigIdxs = [];
        const helper = buffer_1.Buffer.alloc(4);
        Stack: while (stack.length > 0) {
            // get head
            var currentStack = stack[stack.length - 1];
            while (currentStack.index < currentStack.owners.getAddressesLength()) {
                // get the next address to check
                const addr = currentStack.owners.getAddress(currentStack.index);
                const addrStr = addr.toString("hex");
                currentStack.index++;
                // Is it a multi-sig address ?
                const alias = this.msigAliases.get(addrStr);
                if (alias !== undefined) {
                    if (stack.length > MaxSignatures) {
                        throw TooManySignatures;
                    }
                    if (cycleCheck.has(addrStr)) {
                        throw new Error("Cyclic multisig alias");
                    }
                    cycleCheck.add(addrStr);
                    stack.push({
                        index: 0,
                        verified: 0,
                        addrVerifiedTotal: addrVerified,
                        parentVerified: currentStack.parentVerified ||
                            currentStack.verified >= currentStack.owners.getThreshold(),
                        owners: alias
                    });
                    continue Stack;
                }
                else {
                    if (!currentStack.parentVerified &&
                        currentStack.verified < currentStack.owners.getThreshold()) {
                        if (this.hasKey(addr)) {
                            if (addrVisited > MaxSignatures) {
                                throw TooManySignatures;
                            }
                            const sigIdx = new _1.SigIdx();
                            sigIdx.setSource(addr);
                            helper.writeUIntBE(addrVisited, 0, 4);
                            sigIdx.fromBuffer(helper);
                            sigIdxs.push(sigIdx);
                            currentStack.verified++;
                            addrVerified++;
                        }
                    }
                    addrVisited++;
                }
            }
            // remove head
            stack.pop();
            // verify current level
            if (currentStack.verified < currentStack.owners.getThreshold()) {
                if (stack.length == 0) {
                    throw new SignatureError("Not enough signatures");
                }
                // We recover to previous state
                addrVerified = currentStack.addrVerifiedTotal;
                sigIdxs.splice(addrVerified);
            }
            else if (stack.length > 0) {
                currentStack = stack[stack.length - 1];
                if (currentStack.verified < currentStack.owners.getThreshold()) {
                    // apply child verification
                    currentStack.verified++;
                }
            }
        }
        this.sigIdxs.push(sigIdxs);
    }
    constructor(hrp, chainID, signedBytes, credTypeID, txOwners, msigAliases) {
        super();
        this.hrp = hrp;
        this.chainID = chainID;
        this.signedBytes = buffer_1.Buffer.from(signedBytes);
        (this.credTypeID = credTypeID), (this.txOwners = txOwners !== null && txOwners !== void 0 ? txOwners : []);
        this.msigAliases = msigAliases !== null && msigAliases !== void 0 ? msigAliases : new Map();
    }
}
exports.MultisigKeyChain = MultisigKeyChain;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXVsdGlzaWdrZXljaGFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21tb24vbXVsdGlzaWdrZXljaGFpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztHQUdHOzs7Ozs7QUFFSCxvQ0FBZ0M7QUFDaEMsd0JBTVU7QUFFVixvQ0FBd0Q7QUFDeEQsaUVBQXdDO0FBQ3hDLHlDQUE4RDtBQUM5RCwyQ0FBOEM7QUFFOUMsTUFBYSxjQUFlLFNBQVEsS0FBSztDQUFHO0FBQTVDLHdDQUE0QztBQUM1QyxNQUFNLGNBQWMsR0FBRyxJQUFJLEtBQUssQ0FBQyxxQ0FBcUMsQ0FBQyxDQUFBO0FBQ3ZFLE1BQU0saUJBQWlCLEdBQUcsSUFBSSxjQUFjLENBQUMscUJBQXFCLENBQUMsQ0FBQTtBQUVuRSxNQUFNLGFBQWEsR0FBa0IscUJBQWEsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtBQUNoRSxNQUFNLFFBQVEsR0FBYSxrQkFBUSxDQUFDLFdBQVcsRUFBRSxDQUFBO0FBQ2pELE1BQU0sYUFBYSxHQUFHLEdBQUcsQ0FBQTtBQUV6Qjs7R0FFRztBQUNILE1BQWEsZUFBZ0IsU0FBUSwwQkFBZTtJQUlsRCxXQUFXO1FBQ1QsTUFBTSxjQUFjLENBQUE7SUFDdEIsQ0FBQztJQUVELFNBQVMsQ0FBQyxDQUFTO1FBQ2pCLE9BQU8sS0FBSyxDQUFBO0lBQ2QsQ0FBQztJQUVELElBQUksQ0FBQyxDQUFTO1FBQ1osT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFBO0lBQ25CLENBQUM7SUFFRCxPQUFPLENBQUMsR0FBVyxFQUFFLEdBQVc7UUFDOUIsTUFBTSxjQUFjLENBQUE7SUFDdEIsQ0FBQztJQUVELE1BQU0sQ0FBQyxHQUFXLEVBQUUsR0FBVztRQUM3QixNQUFNLGNBQWMsQ0FBQTtJQUN0QixDQUFDO0lBRUQsVUFBVTtRQUNSLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQTtJQUNsQixDQUFDO0lBRUQsZ0JBQWdCO1FBQ2QsTUFBTSxJQUFJLEdB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LFlBQVksQ0FBQyxRQUFRLEVBQUUsQ0FBQTtpQkFDeEI7YUFDRjtTQUNGO1FBRUQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUE7SUFDNUIsQ0FBQztJQUVELFlBQ0UsR0FBVyxFQUNYLE9BQWUsRUFDZixXQUFtQixFQUNuQixVQUFrQixFQUNsQixRQUF5QixFQUN6QixXQUF1QztRQUV2QyxLQUFLLEVBQUUsQ0FBQTtRQUNQLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQ2QsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUE7UUFDdEIsSUFBSSxDQUFDLFdBQVcsR0FBRyxlQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUMxQztRQUFBLENBQUMsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxhQUFSLFFBQVEsY0FBUixRQUFRLEdBQUksRUFBRSxDQUFDLENBQUE7UUFDakUsSUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLGFBQVgsV0FBVyxjQUFYLFdBQVcsR0FBSSxJQUFJLEdBQUcsRUFBd0IsQ0FBQTtJQUNuRSxDQUFDO0NBQ0Y7QUE1TUQsNENBNE1DIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAcGFja2FnZURvY3VtZW50YXRpb25cbiAqIEBtb2R1bGUgQ29tbW9uLU11bHRpc2lnS2V5Q2hhaW5cbiAqL1xuXG5pbXBvcnQgeyBCdWZmZXIgfSBmcm9tIFwiYnVmZmVyL1wiXG5pbXBvcnQge1xuICBDcmVkZW50aWFsLFxuICBPdXRwdXRPd25lcnMsXG4gIFNFQ1BNdWx0aXNpZ0NyZWRlbnRpYWwsXG4gIFNpZ0lkeCxcbiAgU2lnbmF0dXJlXG59IGZyb20gXCIuXCJcblxuaW1wb3J0IHsgU2VyaWFsaXphdGlvbiwgU2VyaWFsaXplZFR5cGUgfSBmcm9tIFwiLi4vdXRpbHNcIlxuaW1wb3J0IEJpblRvb2xzIGZyb20gXCIuLi91dGlscy9iaW50b29sc1wiXG5pbXBvcnQgeyBTdGFuZGFyZEtleUNoYWluLCBTdGFuZGFyZEtleVBhaXIgfSBmcm9tIFwiLi9rZXljaGFpblwiXG5pbXBvcnQgeyBTRUNQMjU2azFLZXlQYWlyIH0gZnJvbSBcIi4vc2VjcDI1NmsxXCJcblxuZXhwb3J0IGNsYXNzIFNpZ25hdHVyZUVycm9yIGV4dGVuZHMgRXJyb3Ige31cbmNvbnN0IE5vdEltcGxlbWVudGVkID0gbmV3IEVycm9yKFwibm90IGltcGxlbWVudGVkIGluIE11bHRpU2lnIEtleVBhaXJcIilcbmNvbnN0IFRvb01hbnlTaWduYXR1cmVzID0gbmV3IFNpZ25hdHVyZUVycm9yKFwidG9vIG1hbnkgc2lnbmF0dXJlc1wiKVxuXG5jb25zdCBzZXJpYWxpemF0aW9uOiBTZXJpYWxpemF0aW9uID0gU2VyaWFsaXphdGlvbi5nZXRJbnN0YW5jZSgpXG5jb25zdCBiaW50b29sczogQmluVG9vbHMgPSBCaW5Ub29scy5nZXRJbnN0YW5jZSgpXG5jb25zdCBNYXhTaWduYXR1cmVzID0gMjU2XG5cbi8qKlxuICogQ2xhc3MgZm9yIHJlcHJlc2VudGluZyBhIGdlbmVyaWMgbXVsdGkgc2lnbmF0dXJlIGtleS5cbiAqL1xuZXhwb3J0IGNsYXNzIE11bHRpc2lnS2V5UGFpciBleHRlbmRzIFN0YW5kYXJkS2V5UGFpciB7XG4gIC8vIFRoZSBrZXljaGFpbiByZXF1aXJlZCBmb3IgYWRkcmVzcyBnZW5lcmF0aW9uXG4gIHByb3RlY3RlZCBrZXlDaGFpbjogTXVsdGlzaWdLZXlDaGFpblxuXG4gIGdlbmVyYXRlS2V5KCkge1xuICAgIHRocm93IE5vdEltcGxlbWVudGVkXG4gIH1cblxuICBpbXBvcnRLZXkoXzogQnVmZmVyKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICBzaWduKF86IEJ1ZmZlcik6IEJ1ZmZlciB7XG4gICAgcmV0dXJuIHRoaXMucHJpdmtcbiAgfVxuXG4gIHJlY292ZXIobXNnOiBCdWZmZXIsIHNpZzogQnVmZmVyKTogQnVmZmVyIHtcbiAgICB0aHJvdyBOb3RJbXBsZW1lbnRlZFxuICB9XG5cbiAgdmVyaWZ5KG1zZzogQnVmZmVyLCBzaWc6IEJ1ZmZlcik6IGJvb2xlYW4ge1xuICAgIHRocm93IE5vdEltcGxlbWVudGVkXG4gIH1cblxuICBnZXRBZGRyZXNzKCk6IEJ1ZmZlciB7XG4gICAgcmV0dXJuIHRoaXMucHVia1xuICB9XG5cbiAgZ2V0QWRkcmVzc1N0cmluZygpOiBzdHJpbmcge1xuICAgIGNvbnN0IGFkZHI6IEJ1ZmZlciA9IFNFQ1AyNTZrMUtleVBhaXIuYWRkcmVzc0Zyb21QdWJsaWNLZXkodGhpcy5wdWJrKVxuICAgIGNvbnN0IHR5cGU6IFNlcmlhbGl6ZWRUeXBlID0gXCJiZWNoMzJcIlxuICAgIHJldHVybiBzZXJpYWxpemF0aW9uLmJ1ZmZlclRvVHlwZShcbiAgICAgIGFkZHIsXG4gICAgICB0eXBlLFxuICAgICAgdGhpcy5rZXlDaGFpbi5nZXRIUlAoKSxcbiAgICAgIHRoaXMua2V5Q2hhaW4uZ2V0Q2hhaW5JRCgpXG4gICAgKVxuICB9XG5cbiAgY3JlYXRlKC4uLmFyZ3M6IGFueVtdKTogdGhpcyB7XG4gICAgaWYgKGFyZ3MubGVuZ3RoID09IDMpIHtcbiAgICAgIHJldHVybiBuZXcgTXVsdGlzaWdLZXlQYWlyKGFyZ3NbMF0sIGFyZ3NbMV0sIGFyZ3NbMl0pIGFzIHRoaXNcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBNdWx0aXNpZ0tleVBhaXIodGhpcy5rZXlDaGFpbiwgdGhpcy5wdWJrLCB0aGlzLnByaXZrKSBhcyB0aGlzXG4gIH1cblxuICBjbG9uZSgpOiB0aGlzIHtcbiAgICByZXR1cm4gbmV3IE11bHRpc2lnS2V5UGFpcih0aGlzLmtleUNoYWluLCB0aGlzLnB1YmssIHRoaXMucHJpdmspIGFzIHRoaXNcbiAgfVxuXG4gIGdldFByaXZhdGVLZXlTdHJpbmcoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYmludG9vbHMuY2I1OEVuY29kZSh0aGlzLnByaXZrKVxuICB9XG5cbiAgZ2V0UHVibGljS2V5U3RyaW5nKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGJpbnRvb2xzLmNiNThFbmNvZGUodGhpcy5wdWJrKVxuICB9XG5cbiAgY29uc3RydWN0b3Ioa2V5Q2hhaW46IE11bHRpc2lnS2V5Q2hhaW4sIGFkZHJlc3M6IEJ1ZmZlciwgc2lnbmF0dXJlOiBCdWZmZXIpIHtcbiAgICBzdXBlcigpXG4gICAgdGhpcy5rZXlDaGFpbiA9IGtleUNoYWluXG4gICAgdGhpcy5wdWJrID0gQnVmZmVyLmZyb20oYWRkcmVzcylcbiAgICB0aGlzLnByaXZrID0gQnVmZmVyLmZyb20oc2lnbmF0dXJlKVxuICB9XG59XG5cbi8qKlxuICogQ2xhc3MgZm9yIHJlcHJlc2VudGluZyBhIG11bHRpc2lnIGtleUNoYWluIGluIENhbWluby5cbiAqXG4gKiBAdHlwZXBhcmFtIE11bHRpc2lnS2V5Q2hhaW4gQ2xhc3MgZXh0ZW5kaW5nIFtbU3RhbmRhcmRLZXlDaGFpbl1dXG4gKi9cbmV4cG9ydCBjbGFzcyBNdWx0aXNpZ0tleUNoYWluIGV4dGVuZHMgU3RhbmRhcmRLZXlDaGFpbjxNdWx0aXNpZ0tleVBhaXI+IHtcbiAgLy8gVGhlIEhSUCByZXF1aXJlZCBmb3IgYWRkcmVzcyBnZW5lcmF0aW9uXG4gIHByb3RlY3RlZCBocnA6IHN0cmluZ1xuICAvLyBUaGUgY2hhaW4gSUQgcmVxdWlyZWQgZm9yIGFkZHJlc3MgZ2VuZXJhdGlvblxuICBwcm90ZWN0ZWQgY2hhaW5JRDogc3RyaW5nXG4gIC8vIFRoZSBieXRlcyB3aGljaCBhcmUgc2lnbmVkIGJ5IHRoaXMgdHhJRFxuICBwcm90ZWN0ZWQgc2lnbmVkQnl0ZXM6IEJ1ZmZlclxuICAvLyB0aGUgT3V0cHV0T3duZXJzIG9mIGFsbCBpbnB1dHMgYW5kIEF1dGhzIGluc2lkZSB0aGUgbWVzc2FnZVxuICBwcm90ZWN0ZWQgdHhPd25lcnM6IE91dHB1dE93bmVyc1tdXG4gIC8vIHRoZSBtdWx0aXNpZyBhbGlhc2VzIHdoaWNoIHRha2UgcGFydCBpbiBldmFsdWF0aW9uXG4gIHByb3RlY3RlZCBtc2lnQWxpYXNlczogTWFwPHN0cmluZywgT3V0cHV0T3duZXJzPlxuICAvLyBDcmVkZW50aWFscyBmb3IgYWxsIHRoZSB0eE93bmVyc1xuICBwcm90ZWN0ZWQgc2lnSWR4czogU2lnSWR4W11bXVxuICAvLyBUaGUgQ3JlZGVudGlhbElEIHVzZWQgZm9yIFNFQ1BNdWx0aXNpZ0NyZWRlbnRpYWxcbiAgcHJvdGVjdGVkIGNyZWRUeXBlSUQ6IG51bWJlclxuXG4gIGdldEhSUCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLmhycFxuICB9XG5cbiAgZ2V0Q2hhaW5JRCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLmNoYWluSURcbiAgfVxuXG4gIGNyZWF0ZSguLi5hcmdzOiBhbnlbXSk6IHRoaXMge1xuICAgIGlmIChhcmdzLmxlbmd0aCA9PSA0KSB7XG4gICAgICByZXR1cm4gbmV3IE11bHRpc2lnS2V5Q2hhaW4oYXJnc1swXSwgYXJnc1sxXSwgYXJnc1syXSwgYXJnc1s0XSkgYXMgdGhpc1xuICAgIH1cbiAgICByZXR1cm4gbmV3IE11bHRpc2lnS2V5Q2hhaW4oXG4gICAgICB0aGlzLmhycCxcbiAgICAgIHRoaXMuY2hhaW5JRCxcbiAgICAgIHRoaXMuc2lnbmVkQnl0ZXMsXG4gICAgICB0aGlzLmNyZWRUeXBlSURcbiAgICApIGFzIHRoaXNcbiAgfVxuXG4gIGNsb25lKCk6IHRoaXMge1xuICAgIGNvbnN0IG5ld2tjID0gbmV3IE11bHRpc2lnS2V5Q2hhaW4oXG4gICAgICB0aGlzLmhycCxcbiAgICAgIHRoaXMuY2hhaW5JRCxcbiAgICAgIHRoaXMuc2lnbmVkQnl0ZXMsXG4gICAgICB0aGlzLmNyZWRUeXBlSURcbiAgICApIGFzIHRoaXNcbiAgICBmb3IgKGxldCBrIGluIHRoaXMua2V5cykge1xuICAgICAgbmV3a2MuYWRkS2V5KHRoaXMua2V5c1tgJHtrfWBdLmNsb25lKCkpXG4gICAgfVxuICAgIG5ld2tjLnR4T3duZXJzID0gbmV3IEFycmF5KHRoaXMudHhPd25lcnMubGVuZ3RoKVxuICAgIHRoaXMudHhPd25lcnMuZm9yRWFjaCgodHhvLCBpbmRleCkgPT5cbiAgICAgIG5ld2tjLnR4T3duZXJzW2luZGV4XS5mcm9tQnVmZmVyKHR4by50b0J1ZmZlcigpKVxuICAgIClcbiAgICByZXR1cm4gbmV3a2NcbiAgfVxuXG4gIHVuaW9uKGtjOiB0aGlzKTogdGhpcyB7XG4gICAgaWYgKFxuICAgICAga2MuY2hhaW5JRCAhPT0gdGhpcy5jaGFpbklEIHx8XG4gICAgICBrYy5ocnAgIT0gdGhpcy5ocnAgfHxcbiAgICAgIGtjLnNpZ25lZEJ5dGVzLmNvbXBhcmUodGhpcy5zaWduZWRCeXRlcykgIT0gMFxuICAgICkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwia2V5Y2hhaW5zIGRvIG5vdCBtYXRjaFwiKVxuICAgIH1cbiAgICBjb25zdCBuZXdrYyA9IGtjLmNsb25lKClcbiAgICBPYmplY3QuYXNzaWduKG5ld2tjLmtleXMsIGtjLmtleXMpXG5cbiAgICByZXR1cm4gbmV3a2NcbiAgfVxuXG4gIC8vIFZpc2l0IGV2ZXJ5IHR4T3V0cHV0T3duZXIgYW5kIHRyeSB0byB2ZXJpZnkgd2l0aCBrZXlzLlxuICAvLyBUcmF2ZXJzZSBpbnRvIG1zaWcgYWxpYXNlcy4gVGhyb3cgaWYgb25lIGNhbm5vdCBiZSBmdWxmaWxsZWRcbiAgYnVpbGRTaWduYXR1cmVJbmRpY2VzKCkge1xuICAgIHRoaXMuc2lnSWR4cyA9IFtdXG4gICAgZm9yIChjb25zdCBvIG9mIHRoaXMudHhPd25lcnMpIHRoaXMuX3RyYXZlcnNlT3duZXIobylcbiAgfVxuXG4gIGdldENyZWRlbnRpYWxzKCk6IENyZWRlbnRpYWxbXSB7XG4gICAgY29uc3QgcmVzdWx0OiBTRUNQTXVsdGlzaWdDcmVkZW50aWFsW10gPSBbXVxuICAgIGZvciAoY29uc3Qgc2lnU2V0IG9mIHRoaXMuc2lnSWR4cykge1xuICAgICAgY29uc3QgY3JlZCA9IG5ldyBTRUNQTXVsdGlzaWdDcmVkZW50aWFsKHRoaXMuY3JlZFR5cGVJRClcbiAgICAgIGZvciAoY29uc3Qgc2lnSWR4IG9mIHNpZ1NldCkge1xuICAgICAgICBjcmVkLmFkZFNTaWduYXR1cmVJbmRleChzaWdJZHgpXG4gICAgICAgIGNvbnN0IHNpZyA9IG5ldyBTaWduYXR1cmUoKVxuICAgICAgICBzaWcuZnJvbUJ1ZmZlcih0aGlzLmdldEtleShzaWdJZHguZ2V0U291cmNlKCkpLmdldFByaXZhdGVLZXkoKSlcbiAgICAgICAgY3JlZC5hZGRTaWduYXR1cmUoc2lnKVxuICAgICAgfVxuICAgICAgcmVzdWx0LnB1c2goY3JlZClcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG5cbiAgcHJvdGVjdGVkIF90cmF2ZXJzZU93bmVyKG93bmVyOiBPdXRwdXRPd25lcnMpOiB2b2lkIHtcbiAgICB2YXIgYWRkclZpc2l0ZWQgPSAwXG4gICAgdmFyIGFkZHJWZXJpZmllZCA9IDBcblxuICAgIHR5cGUgc3RhY2tJdGVtID0ge1xuICAgICAgaW5kZXg6IG51bWJlclxuICAgICAgdmVyaWZpZWQ6IG51bWJlclxuICAgICAgYWRkclZlcmlmaWVkVG90YWw6IG51bWJlclxuICAgICAgcGFyZW50VmVyaWZpZWQ6IGJvb2xlYW5cbiAgICAgIG93bmVyczogT3V0cHV0T3duZXJzXG4gICAgfVxuXG4gICAgY29uc3QgY3ljbGVDaGVjayA9IG5ldyBTZXQ8c3RyaW5nPigpXG4gICAgY29uc3Qgc3RhY2s6IHN0YWNrSXRlbVtdID0gW1xuICAgICAge1xuICAgICAgICBpbmRleDogMCxcbiAgICAgICAgdmVyaWZpZWQ6IDAsXG4gICAgICAgIGFkZHJWZXJpZmllZFRvdGFsOiAwLFxuICAgICAgICBwYXJlbnRWZXJpZmllZDogZmFsc2UsXG4gICAgICAgIG93bmVyczogb3duZXJcbiAgICAgIH1cbiAgICBdXG5cbiAgICBjb25zdCBzaWdJZHhzOiBTaWdJZHhbXSA9IFtdXG4gICAgY29uc3QgaGVscGVyID0gQnVmZmVyLmFsbG9jKDQpXG5cbiAgICBTdGFjazogd2hpbGUgKHN0YWNrLmxlbmd0aCA+IDApIHtcbiAgICAgIC8vIGdldCBoZWFkXG4gICAgICB2YXIgY3VycmVudFN0YWNrID0gc3RhY2tbc3RhY2subGVuZ3RoIC0gMV1cbiAgICAgIHdoaWxlIChjdXJyZW50U3RhY2suaW5kZXggPCBjdXJyZW50U3RhY2sub3duZXJzLmdldEFkZHJlc3Nlc0xlbmd0aCgpKSB7XG4gICAgICAgIC8vIGdldCB0aGUgbmV4dCBhZGRyZXNzIHRvIGNoZWNrXG4gICAgICAgIGNvbnN0IGFkZHIgPSBjdXJyZW50U3RhY2sub3duZXJzLmdldEFkZHJlc3MoY3VycmVudFN0YWNrLmluZGV4KVxuICAgICAgICBjb25zdCBhZGRyU3RyID0gYWRkci50b1N0cmluZyhcImhleFwiKVxuICAgICAgICBjdXJyZW50U3RhY2suaW5kZXgrK1xuICAgICAgICAvLyBJcyBpdCBhIG11bHRpLXNpZyBhZGRyZXNzID9cbiAgICAgICAgY29uc3QgYWxpYXMgPSB0aGlzLm1zaWdBbGlhc2VzLmdldChhZGRyU3RyKVxuICAgICAgICBpZiAoYWxpYXMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIGlmIChzdGFjay5sZW5ndGggPiBNYXhTaWduYXR1cmVzKSB7XG4gICAgICAgICAgICB0aHJvdyBUb29NYW55U2lnbmF0dXJlc1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoY3ljbGVDaGVjay5oYXMoYWRkclN0cikpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkN5Y2xpYyBtdWx0aXNpZyBhbGlhc1wiKVxuICAgICAgICAgIH1cbiAgICAgICAgICBjeWNsZUNoZWNrLmFkZChhZGRyU3RyKVxuICAgICAgICAgIHN0YWNrLnB1c2goe1xuICAgICAgICAgICAgaW5kZXg6IDAsXG4gICAgICAgICAgICB2ZXJpZmllZDogMCxcbiAgICAgICAgICAgIGFkZHJWZXJpZmllZFRvdGFsOiBhZGRyVmVyaWZpZWQsXG4gICAgICAgICAgICBwYXJlbnRWZXJpZmllZDpcbiAgICAgICAgICAgICAgY3VycmVudFN0YWNrLnBhcmVudFZlcmlmaWVkIHx8XG4gICAgICAgICAgICAgIGN1cnJlbnRTdGFjay52ZXJpZmllZCA+PSBjdXJyZW50U3RhY2sub3duZXJzLmdldFRocmVzaG9sZCgpLFxuICAgICAgICAgICAgb3duZXJzOiBhbGlhc1xuICAgICAgICAgIH0pXG4gICAgICAgICAgY29udGludWUgU3RhY2tcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAhY3VycmVudFN0YWNrLnBhcmVudFZlcmlmaWVkICYmXG4gICAgICAgICAgICBjdXJyZW50U3RhY2sudmVyaWZpZWQgPCBjdXJyZW50U3RhY2sub3duZXJzLmdldFRocmVzaG9sZCgpXG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5oYXNLZXkoYWRkcikpIHtcbiAgICAgICAgICAgICAgaWYgKGFkZHJWaXNpdGVkID4gTWF4U2lnbmF0dXJlcykge1xuICAgICAgICAgICAgICAgIHRocm93IFRvb01hbnlTaWduYXR1cmVzXG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBjb25zdCBzaWdJZHggPSBuZXcgU2lnSWR4KClcbiAgICAgICAgICAgICAgc2lnSWR4LnNldFNvdXJjZShhZGRyKVxuICAgICAgICAgICAgICBoZWxwZXIud3JpdGVVSW50QkUoYWRkclZpc2l0ZWQsIDAsIDQpXG4gICAgICAgICAgICAgIHNpZ0lkeC5mcm9tQnVmZmVyKGhlbHBlcilcbiAgICAgICAgICAgICAgc2lnSWR4cy5wdXNoKHNpZ0lkeClcblxuICAgICAgICAgICAgICBjdXJyZW50U3RhY2sudmVyaWZpZWQrK1xuICAgICAgICAgICAgICBhZGRyVmVyaWZpZWQrK1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBhZGRyVmlzaXRlZCsrXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gcmVtb3ZlIGhlYWRcbiAgICAgIHN0YWNrLnBvcCgpXG4gICAgICAvLyB2ZXJpZnkgY3VycmVudCBsZXZlbFxuICAgICAgaWYgKGN1cnJlbnRTdGFjay52ZXJpZmllZCA8IGN1cnJlbnRTdGFjay5vd25lcnMuZ2V0VGhyZXNob2xkKCkpIHtcbiAgICAgICAgaWYgKHN0YWNrLmxlbmd0aCA9PSAwKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFNpZ25hdHVyZUVycm9yKFwiTm90IGVub3VnaCBzaWduYXR1cmVzXCIpXG4gICAgICAgIH1cbiAgICAgICAgLy8gV2UgcmVjb3ZlciB0byBwcmV2aW91cyBzdGF0ZVxuICAgICAgICBhZGRyVmVyaWZpZWQgPSBjdXJyZW50U3RhY2suYWRkclZlcmlmaWVkVG90YWxcbiAgICAgICAgc2lnSWR4cy5zcGxpY2UoYWRkclZlcmlmaWVkKVxuICAgICAgfSBlbHNlIGlmIChzdGFjay5sZW5ndGggPiAwKSB7XG4gICAgICAgIGN1cnJlbnRTdGFjayA9IHN0YWNrW3N0YWNrLmxlbmd0aCAtIDFdXG4gICAgICAgIGlmIChjdXJyZW50U3RhY2sudmVyaWZpZWQgPCBjdXJyZW50U3RhY2sub3duZXJzLmdldFRocmVzaG9sZCgpKSB7XG4gICAgICAgICAgLy8gYXBwbHkgY2hpbGQgdmVyaWZpY2F0aW9uXG4gICAgICAgICAgY3VycmVudFN0YWNrLnZlcmlmaWVkKytcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuc2lnSWR4cy5wdXNoKHNpZ0lkeHMpXG4gIH1cblxuICBjb25zdHJ1Y3RvcihcbiAgICBocnA6IHN0cmluZyxcbiAgICBjaGFpbklEOiBzdHJpbmcsXG4gICAgc2lnbmVkQnl0ZXM6IEJ1ZmZlcixcbiAgICBjcmVkVHlwZUlEOiBudW1iZXIsXG4gICAgdHhPd25lcnM/OiBPdXRwdXRPd25lcnNbXSxcbiAgICBtc2lnQWxpYXNlcz86IE1hcDxzdHJpbmcsIE91dHB1dE93bmVycz5cbiAgKSB7XG4gICAgc3VwZXIoKVxuICAgIHRoaXMuaHJwID0gaHJwXG4gICAgdGhpcy5jaGFpbklEID0gY2hhaW5JRFxuICAgIHRoaXMuc2lnbmVkQnl0ZXMgPSBCdWZmZXIuZnJvbShzaWduZWRCeXRlcylcbiAgICA7KHRoaXMuY3JlZFR5cGVJRCA9IGNyZWRUeXBlSUQpLCAodGhpcy50eE93bmVycyA9IHR4T3duZXJzID8/IFtdKVxuICAgIHRoaXMubXNpZ0FsaWFzZXMgPSBtc2lnQWxpYXNlcyA/PyBuZXcgTWFwPHN0cmluZywgT3V0cHV0T3duZXJzPigpXG4gIH1cbn1cbiJdfQ==
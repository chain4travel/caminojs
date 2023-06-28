"use strict";
/**
 * @packageDocumentation
 * @module Utils-Mnemonic
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const buffer_1 = require("buffer/");
const errors_1 = require("./errors");
const bip39_1 = require("bip39");
const randombytes_1 = __importDefault(require("randombytes"));
/**
 * BIP39 Mnemonic code for generating deterministic keys.
 *
 */
class Mnemonic {
    constructor() {
        this.wordlists = bip39_1.wordlists;
    }
    /**
     * Retrieves the Mnemonic singleton.
     */
    static getInstance() {
        if (!Mnemonic.instance) {
            Mnemonic.instance = new Mnemonic();
        }
        return Mnemonic.instance;
    }
    /**
     * Return wordlists
     *
     * @param language a string specifying the language
     *
     * @returns A [[Wordlist]] object or array of strings
     */
    getWordlists(language) {
        if (language !== undefined) {
            return this.wordlists[`${language}`];
        }
        else {
            return this.wordlists[`${(0, bip39_1.getDefaultWordlist)()}`];
        }
    }
    /**
     * Synchronously takes mnemonic and password and returns {@link https://github.com/feross/buffer|Buffer}
     *
     * @param mnemonic the mnemonic as a string
     * @param password the password as a string
     *
     * @returns A {@link https://github.com/feross/buffer|Buffer}
     */
    mnemonicToSeedSync(mnemonic, password = "") {
        const seed = (0, bip39_1.mnemonicToSeedSync)(mnemonic, password);
        return buffer_1.Buffer.from(seed);
    }
    /**
     * Asynchronously takes mnemonic and password and returns Promise {@link https://github.com/feross/buffer|Buffer}
     *
     * @param mnemonic the mnemonic as a string
     * @param password the password as a string
     *
     * @returns A {@link https://github.com/feross/buffer|Buffer}
     */
    mnemonicToSeed(mnemonic, password = "") {
        return __awaiter(this, void 0, void 0, function* () {
            const seed = yield (0, bip39_1.mnemonicToSeed)(mnemonic, password);
            return buffer_1.Buffer.from(seed);
        });
    }
    /**
     * Takes mnemonic and wordlist and returns buffer
     *
     * @param mnemonic the mnemonic as a string
     * @param wordlist Optional the wordlist as an array of strings
     *
     * @returns A string
     */
    mnemonicToEntropy(mnemonic, wordlist) {
        return (0, bip39_1.mnemonicToEntropy)(mnemonic, wordlist);
    }
    /**
     * Takes mnemonic and wordlist and returns buffer
     *
     * @param entropy the entropy as a {@link https://github.com/feross/buffer|Buffer} or as a string
     * @param wordlist Optional, the wordlist as an array of strings
     *
     * @returns A string
     */
    entropyToMnemonic(entropy, wordlist) {
        const param = typeof entropy === "string" ? entropy : globalThis.Buffer.from(entropy);
        return (0, bip39_1.entropyToMnemonic)(param, wordlist);
    }
    /**
     * Validates a mnemonic
     11*
     * @param mnemonic the mnemonic as a string
     * @param wordlist Optional the wordlist as an array of strings
     *
     * @returns A string
     */
    validateMnemonic(mnemonic, wordlist) {
        return (0, bip39_1.validateMnemonic)(mnemonic, wordlist);
    }
    /**
     * Sets the default word list
     *
     * @param language the language as a string
     *
     */
    setDefaultWordlist(language) {
        (0, bip39_1.setDefaultWordlist)(language);
    }
    /**
     * Returns the language of the default word list
     *
     * @returns A string
     */
    getDefaultWordlist() {
        return (0, bip39_1.getDefaultWordlist)();
    }
    /**
     * Generate a random mnemonic (uses crypto.randomBytes under the hood), defaults to 256-bits of entropy
     *
     * @param strength Optional the strength as a number
     * @param rng Optional the random number generator. Defaults to crypto.randomBytes
     * @param wordlist Optional
     *
     */
    generateMnemonic(strength, rng, wordlist) {
        strength = strength || 256;
        if (strength % 32 !== 0) {
            throw new errors_1.InvalidEntropy("Error - Invalid entropy");
        }
        var rnGT = rng
            ? (size) => {
                return globalThis.Buffer.from(rng(size));
            }
            : undefined;
        rnGT = rnGT || randombytes_1.default;
        return (0, bip39_1.generateMnemonic)(strength, rnGT, wordlist);
    }
}
exports.default = Mnemonic;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW5lbW9uaWMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdXRpbHMvbW5lbW9uaWMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7R0FHRzs7Ozs7Ozs7Ozs7Ozs7QUFFSCxvQ0FBZ0M7QUFDaEMscUNBQXlDO0FBQ3pDLGlDQVVjO0FBQ2QsOERBQXFDO0FBRXJDOzs7R0FHRztBQUNILE1BQXFCLFFBQVE7SUFFM0I7UUFDVSxjQUFTLEdBQUcsaUJBQWUsQ0FBQTtJQURkLENBQUM7SUFHeEI7O09BRUc7SUFDSCxNQUFNLENBQUMsV0FBVztRQUNoQixJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRTtZQUN0QixRQUFRLENBQUMsUUFBUSxHQUFHLElBQUksUUFBUSxFQUFFLENBQUE7U0FDbkM7UUFDRCxPQUFPLFFBQVEsQ0FBQyxRQUFRLENBQUE7SUFDMUIsQ0FBQztJQUVEOzs7Ozs7T0FNRztJQUNILFlBQVksQ0FBQyxRQUFpQjtRQUM1QixJQUFJLFFBQVEsS0FBSyxTQUFTLEVBQUU7WUFDMUIsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsUUFBUSxFQUFFLENBQUMsQ0FBQTtTQUNyQzthQUFNO1lBQ0wsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsSUFBQSwwQkFBa0IsR0FBRSxFQUFFLENBQUMsQ0FBQTtTQUNqRDtJQUNILENBQUM7SUFFRDs7Ozs7OztPQU9HO0lBQ0gsa0JBQWtCLENBQUMsUUFBZ0IsRUFBRSxXQUFtQixFQUFFO1FBQ3hELE1BQU0sSUFBSSxHQUFHLElBQUEsMEJBQWtCLEVBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFBO1FBQ25ELE9BQU8sZUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUMxQixDQUFDO0lBRUQ7Ozs7Ozs7T0FPRztJQUNHLGNBQWMsQ0FDbEIsUUFBZ0IsRUFDaEIsV0FBbUIsRUFBRTs7WUFFckIsTUFBTSxJQUFJLEdBQUcsTUFBTSxJQUFBLHNCQUFjLEVBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFBO1lBQ3JELE9BQU8sZUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUMxQixDQUFDO0tBQUE7SUFFRDs7Ozs7OztPQU9HO0lBQ0gsaUJBQWlCLENBQUMsUUFBZ0IsRUFBRSxRQUFtQjtRQUNyRCxPQUFPLElBQUEseUJBQWlCLEVBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFBO0lBQzlDLENBQUM7SUFFRDs7Ozs7OztPQU9HO0lBQ0gsaUJBQWlCLENBQUMsT0FBd0IsRUFBRSxRQUFtQjtRQUM3RCxNQUFNLEtBQUssR0FDVCxPQUFPLE9BQU8sS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUE7UUFDekUsT0FBTyxJQUFBLHlCQUFpQixFQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsQ0FBQTtJQUMzQyxDQUFDO0lBRUQ7Ozs7Ozs7T0FPRztJQUNILGdCQUFnQixDQUFDLFFBQWdCLEVBQUUsUUFBbUI7UUFDcEQsT0FBTyxJQUFBLHdCQUFnQixFQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQTtJQUM3QyxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSCxrQkFBa0IsQ0FBQyxRQUFnQjtRQUNqQyxJQUFBLDBCQUFrQixFQUFDLFFBQVEsQ0FBQyxDQUFBO0lBQzlCLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsa0JBQWtCO1FBQ2hCLE9BQU8sSUFBQSwwQkFBa0IsR0FBRSxDQUFBO0lBQzdCLENBQUM7SUFFRDs7Ozs7OztPQU9HO0lBQ0gsZ0JBQWdCLENBQ2QsUUFBaUIsRUFDakIsR0FBOEIsRUFDOUIsUUFBbUI7UUFFbkIsUUFBUSxHQUFHLFFBQVEsSUFBSSxHQUFHLENBQUE7UUFDMUIsSUFBSSxRQUFRLEdBQUcsRUFBRSxLQUFLLENBQUMsRUFBRTtZQUN2QixNQUFNLElBQUksdUJBQWMsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFBO1NBQ3BEO1FBQ0QsSUFBSSxJQUFJLEdBQUcsR0FBRztZQUNaLENBQUMsQ0FBQyxDQUFDLElBQVksRUFBRSxFQUFFO2dCQUNmLE9BQU8sVUFBVSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUE7WUFDMUMsQ0FBQztZQUNILENBQUMsQ0FBQyxTQUFTLENBQUE7UUFDYixJQUFJLEdBQUcsSUFBSSxJQUFJLHFCQUFXLENBQUE7UUFDMUIsT0FBTyxJQUFBLHdCQUFnQixFQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUE7SUFDbkQsQ0FBQztDQUNGO0FBN0lELDJCQTZJQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQHBhY2thZ2VEb2N1bWVudGF0aW9uXG4gKiBAbW9kdWxlIFV0aWxzLU1uZW1vbmljXG4gKi9cblxuaW1wb3J0IHsgQnVmZmVyIH0gZnJvbSBcImJ1ZmZlci9cIlxuaW1wb3J0IHsgSW52YWxpZEVudHJvcHkgfSBmcm9tIFwiLi9lcnJvcnNcIlxuaW1wb3J0IHtcbiAgZW50cm9weVRvTW5lbW9uaWMsXG4gIGdldERlZmF1bHRXb3JkbGlzdCxcbiAgZ2VuZXJhdGVNbmVtb25pYyxcbiAgbW5lbW9uaWNUb0VudHJvcHksXG4gIG1uZW1vbmljVG9TZWVkLFxuICBtbmVtb25pY1RvU2VlZFN5bmMsXG4gIHNldERlZmF1bHRXb3JkbGlzdCxcbiAgdmFsaWRhdGVNbmVtb25pYyxcbiAgd29yZGxpc3RzIGFzIGJpcDM5X3dvcmRsaXN0c1xufSBmcm9tIFwiYmlwMzlcIlxuaW1wb3J0IHJhbmRvbUJ5dGVzIGZyb20gXCJyYW5kb21ieXRlc1wiXG5cbi8qKlxuICogQklQMzkgTW5lbW9uaWMgY29kZSBmb3IgZ2VuZXJhdGluZyBkZXRlcm1pbmlzdGljIGtleXMuXG4gKlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNbmVtb25pYyB7XG4gIHByaXZhdGUgc3RhdGljIGluc3RhbmNlOiBNbmVtb25pY1xuICBwcml2YXRlIGNvbnN0cnVjdG9yKCkge31cbiAgcHJvdGVjdGVkIHdvcmRsaXN0cyA9IGJpcDM5X3dvcmRsaXN0c1xuXG4gIC8qKlxuICAgKiBSZXRyaWV2ZXMgdGhlIE1uZW1vbmljIHNpbmdsZXRvbi5cbiAgICovXG4gIHN0YXRpYyBnZXRJbnN0YW5jZSgpOiBNbmVtb25pYyB7XG4gICAgaWYgKCFNbmVtb25pYy5pbnN0YW5jZSkge1xuICAgICAgTW5lbW9uaWMuaW5zdGFuY2UgPSBuZXcgTW5lbW9uaWMoKVxuICAgIH1cbiAgICByZXR1cm4gTW5lbW9uaWMuaW5zdGFuY2VcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm4gd29yZGxpc3RzXG4gICAqXG4gICAqIEBwYXJhbSBsYW5ndWFnZSBhIHN0cmluZyBzcGVjaWZ5aW5nIHRoZSBsYW5ndWFnZVxuICAgKlxuICAgKiBAcmV0dXJucyBBIFtbV29yZGxpc3RdXSBvYmplY3Qgb3IgYXJyYXkgb2Ygc3RyaW5nc1xuICAgKi9cbiAgZ2V0V29yZGxpc3RzKGxhbmd1YWdlPzogc3RyaW5nKTogc3RyaW5nW10ge1xuICAgIGlmIChsYW5ndWFnZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gdGhpcy53b3JkbGlzdHNbYCR7bGFuZ3VhZ2V9YF1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMud29yZGxpc3RzW2Ake2dldERlZmF1bHRXb3JkbGlzdCgpfWBdXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFN5bmNocm9ub3VzbHkgdGFrZXMgbW5lbW9uaWMgYW5kIHBhc3N3b3JkIGFuZCByZXR1cm5zIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9XG4gICAqXG4gICAqIEBwYXJhbSBtbmVtb25pYyB0aGUgbW5lbW9uaWMgYXMgYSBzdHJpbmdcbiAgICogQHBhcmFtIHBhc3N3b3JkIHRoZSBwYXNzd29yZCBhcyBhIHN0cmluZ1xuICAgKlxuICAgKiBAcmV0dXJucyBBIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9XG4gICAqL1xuICBtbmVtb25pY1RvU2VlZFN5bmMobW5lbW9uaWM6IHN0cmluZywgcGFzc3dvcmQ6IHN0cmluZyA9IFwiXCIpOiBCdWZmZXIge1xuICAgIGNvbnN0IHNlZWQgPSBtbmVtb25pY1RvU2VlZFN5bmMobW5lbW9uaWMsIHBhc3N3b3JkKVxuICAgIHJldHVybiBCdWZmZXIuZnJvbShzZWVkKVxuICB9XG5cbiAgLyoqXG4gICAqIEFzeW5jaHJvbm91c2x5IHRha2VzIG1uZW1vbmljIGFuZCBwYXNzd29yZCBhbmQgcmV0dXJucyBQcm9taXNlIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9XG4gICAqXG4gICAqIEBwYXJhbSBtbmVtb25pYyB0aGUgbW5lbW9uaWMgYXMgYSBzdHJpbmdcbiAgICogQHBhcmFtIHBhc3N3b3JkIHRoZSBwYXNzd29yZCBhcyBhIHN0cmluZ1xuICAgKlxuICAgKiBAcmV0dXJucyBBIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9XG4gICAqL1xuICBhc3luYyBtbmVtb25pY1RvU2VlZChcbiAgICBtbmVtb25pYzogc3RyaW5nLFxuICAgIHBhc3N3b3JkOiBzdHJpbmcgPSBcIlwiXG4gICk6IFByb21pc2U8QnVmZmVyPiB7XG4gICAgY29uc3Qgc2VlZCA9IGF3YWl0IG1uZW1vbmljVG9TZWVkKG1uZW1vbmljLCBwYXNzd29yZClcbiAgICByZXR1cm4gQnVmZmVyLmZyb20oc2VlZClcbiAgfVxuXG4gIC8qKlxuICAgKiBUYWtlcyBtbmVtb25pYyBhbmQgd29yZGxpc3QgYW5kIHJldHVybnMgYnVmZmVyXG4gICAqXG4gICAqIEBwYXJhbSBtbmVtb25pYyB0aGUgbW5lbW9uaWMgYXMgYSBzdHJpbmdcbiAgICogQHBhcmFtIHdvcmRsaXN0IE9wdGlvbmFsIHRoZSB3b3JkbGlzdCBhcyBhbiBhcnJheSBvZiBzdHJpbmdzXG4gICAqXG4gICAqIEByZXR1cm5zIEEgc3RyaW5nXG4gICAqL1xuICBtbmVtb25pY1RvRW50cm9weShtbmVtb25pYzogc3RyaW5nLCB3b3JkbGlzdD86IHN0cmluZ1tdKTogc3RyaW5nIHtcbiAgICByZXR1cm4gbW5lbW9uaWNUb0VudHJvcHkobW5lbW9uaWMsIHdvcmRsaXN0KVxuICB9XG5cbiAgLyoqXG4gICAqIFRha2VzIG1uZW1vbmljIGFuZCB3b3JkbGlzdCBhbmQgcmV0dXJucyBidWZmZXJcbiAgICpcbiAgICogQHBhcmFtIGVudHJvcHkgdGhlIGVudHJvcHkgYXMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBvciBhcyBhIHN0cmluZ1xuICAgKiBAcGFyYW0gd29yZGxpc3QgT3B0aW9uYWwsIHRoZSB3b3JkbGlzdCBhcyBhbiBhcnJheSBvZiBzdHJpbmdzXG4gICAqXG4gICAqIEByZXR1cm5zIEEgc3RyaW5nXG4gICAqL1xuICBlbnRyb3B5VG9NbmVtb25pYyhlbnRyb3B5OiBCdWZmZXIgfCBzdHJpbmcsIHdvcmRsaXN0Pzogc3RyaW5nW10pOiBzdHJpbmcge1xuICAgIGNvbnN0IHBhcmFtOiBnbG9iYWxUaGlzLkJ1ZmZlciB8IHN0cmluZyA9XG4gICAgICB0eXBlb2YgZW50cm9weSA9PT0gXCJzdHJpbmdcIiA/IGVudHJvcHkgOiBnbG9iYWxUaGlzLkJ1ZmZlci5mcm9tKGVudHJvcHkpXG4gICAgcmV0dXJuIGVudHJvcHlUb01uZW1vbmljKHBhcmFtLCB3b3JkbGlzdClcbiAgfVxuXG4gIC8qKlxuICAgKiBWYWxpZGF0ZXMgYSBtbmVtb25pY1xuICAgMTEqXG4gICAqIEBwYXJhbSBtbmVtb25pYyB0aGUgbW5lbW9uaWMgYXMgYSBzdHJpbmdcbiAgICogQHBhcmFtIHdvcmRsaXN0IE9wdGlvbmFsIHRoZSB3b3JkbGlzdCBhcyBhbiBhcnJheSBvZiBzdHJpbmdzXG4gICAqXG4gICAqIEByZXR1cm5zIEEgc3RyaW5nXG4gICAqL1xuICB2YWxpZGF0ZU1uZW1vbmljKG1uZW1vbmljOiBzdHJpbmcsIHdvcmRsaXN0Pzogc3RyaW5nW10pOiBib29sZWFuIHtcbiAgICByZXR1cm4gdmFsaWRhdGVNbmVtb25pYyhtbmVtb25pYywgd29yZGxpc3QpXG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgZGVmYXVsdCB3b3JkIGxpc3RcbiAgICpcbiAgICogQHBhcmFtIGxhbmd1YWdlIHRoZSBsYW5ndWFnZSBhcyBhIHN0cmluZ1xuICAgKlxuICAgKi9cbiAgc2V0RGVmYXVsdFdvcmRsaXN0KGxhbmd1YWdlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBzZXREZWZhdWx0V29yZGxpc3QobGFuZ3VhZ2UpXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgbGFuZ3VhZ2Ugb2YgdGhlIGRlZmF1bHQgd29yZCBsaXN0XG4gICAqXG4gICAqIEByZXR1cm5zIEEgc3RyaW5nXG4gICAqL1xuICBnZXREZWZhdWx0V29yZGxpc3QoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gZ2V0RGVmYXVsdFdvcmRsaXN0KClcbiAgfVxuXG4gIC8qKlxuICAgKiBHZW5lcmF0ZSBhIHJhbmRvbSBtbmVtb25pYyAodXNlcyBjcnlwdG8ucmFuZG9tQnl0ZXMgdW5kZXIgdGhlIGhvb2QpLCBkZWZhdWx0cyB0byAyNTYtYml0cyBvZiBlbnRyb3B5XG4gICAqXG4gICAqIEBwYXJhbSBzdHJlbmd0aCBPcHRpb25hbCB0aGUgc3RyZW5ndGggYXMgYSBudW1iZXJcbiAgICogQHBhcmFtIHJuZyBPcHRpb25hbCB0aGUgcmFuZG9tIG51bWJlciBnZW5lcmF0b3IuIERlZmF1bHRzIHRvIGNyeXB0by5yYW5kb21CeXRlc1xuICAgKiBAcGFyYW0gd29yZGxpc3QgT3B0aW9uYWxcbiAgICpcbiAgICovXG4gIGdlbmVyYXRlTW5lbW9uaWMoXG4gICAgc3RyZW5ndGg/OiBudW1iZXIsXG4gICAgcm5nPzogKHNpemU6IG51bWJlcikgPT4gQnVmZmVyLFxuICAgIHdvcmRsaXN0Pzogc3RyaW5nW11cbiAgKTogc3RyaW5nIHtcbiAgICBzdHJlbmd0aCA9IHN0cmVuZ3RoIHx8IDI1NlxuICAgIGlmIChzdHJlbmd0aCAlIDMyICE9PSAwKSB7XG4gICAgICB0aHJvdyBuZXcgSW52YWxpZEVudHJvcHkoXCJFcnJvciAtIEludmFsaWQgZW50cm9weVwiKVxuICAgIH1cbiAgICB2YXIgcm5HVCA9IHJuZ1xuICAgICAgPyAoc2l6ZTogbnVtYmVyKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIGdsb2JhbFRoaXMuQnVmZmVyLmZyb20ocm5nKHNpemUpKVxuICAgICAgICB9XG4gICAgICA6IHVuZGVmaW5lZFxuICAgIHJuR1QgPSBybkdUIHx8IHJhbmRvbUJ5dGVzXG4gICAgcmV0dXJuIGdlbmVyYXRlTW5lbW9uaWMoc3RyZW5ndGgsIHJuR1QsIHdvcmRsaXN0KVxuICB9XG59XG4iXX0=
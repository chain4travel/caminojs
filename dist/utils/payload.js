"use strict";
/**
 * @packageDocumentation
 * @module Utils-Payload
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAGNETPayload = exports.ONIONPayload = exports.IPFSPayload = exports.URLPayload = exports.EMAILPayload = exports.YAMLPayload = exports.JSONPayload = exports.CSVPayload = exports.SVGPayload = exports.ICOPayload = exports.BMPPayload = exports.PNGPayload = exports.JPEGPayload = exports.SECPENCPayload = exports.SECPSIGPayload = exports.NODEIDPayload = exports.CHAINIDPayload = exports.SUBNETIDPayload = exports.NFTIDPayload = exports.UTXOIDPayload = exports.ASSETIDPayload = exports.TXIDPayload = exports.cb58EncodedPayload = exports.CCHAINADDRPayload = exports.PCHAINADDRPayload = exports.XCHAINADDRPayload = exports.ChainAddressPayload = exports.BIGNUMPayload = exports.B64STRPayload = exports.B58STRPayload = exports.HEXSTRPayload = exports.UTF8Payload = exports.BINPayload = exports.PayloadBase = exports.PayloadTypes = void 0;
const buffer_1 = require("buffer/");
const bintools_1 = __importDefault(require("./bintools"));
const bn_js_1 = __importDefault(require("bn.js"));
const errors_1 = require("../utils/errors");
const serialization_1 = require("../utils/serialization");
/**
 * @ignore
 */
const bintools = bintools_1.default.getInstance();
const serialization = serialization_1.Serialization.getInstance();
/**
 * Class for determining payload types and managing the lookup table.
 */
class PayloadTypes {
    /**
     * Given an encoded payload buffer returns the payload content (minus typeID).
     */
    getContent(payload) {
        const pl = bintools.copyFrom(payload, 5);
        return pl;
    }
    /**
     * Given an encoded payload buffer returns the payload (with typeID).
     */
    getPayload(payload) {
        const pl = bintools.copyFrom(payload, 4);
        return pl;
    }
    /**
     * Given a payload buffer returns the proper TypeID.
     */
    getTypeID(payload) {
        const offset = 4;
        const typeID = bintools
            .copyFrom(payload, offset, offset + 1)
            .readUInt8(0);
        return typeID;
    }
    /**
     * Given a type string returns the proper TypeID.
     */
    lookupID(typestr) {
        return this.types.indexOf(typestr);
    }
    /**
     * Given a TypeID returns a string describing the payload type.
     */
    lookupType(value) {
        return this.types[`${value}`];
    }
    /**
     * Given a TypeID returns the proper [[PayloadBase]].
     */
    select(typeID, ...args) {
        switch (typeID) {
            case 0:
                return new BINPayload(...args);
            case 1:
                return new UTF8Payload(...args);
            case 2:
                return new HEXSTRPayload(...args);
            case 3:
                return new B58STRPayload(...args);
            case 4:
                return new B64STRPayload(...args);
            case 5:
                return new BIGNUMPayload(...args);
            case 6:
                return new XCHAINADDRPayload(...args);
            case 7:
                return new PCHAINADDRPayload(...args);
            case 8:
                return new CCHAINADDRPayload(...args);
            case 9:
                return new TXIDPayload(...args);
            case 10:
                return new ASSETIDPayload(...args);
            case 11:
                return new UTXOIDPayload(...args);
            case 12:
                return new NFTIDPayload(...args);
            case 13:
                return new SUBNETIDPayload(...args);
            case 14:
                return new CHAINIDPayload(...args);
            case 15:
                return new NODEIDPayload(...args);
            case 16:
                return new SECPSIGPayload(...args);
            case 17:
                return new SECPENCPayload(...args);
            case 18:
                return new JPEGPayload(...args);
            case 19:
                return new PNGPayload(...args);
            case 20:
                return new BMPPayload(...args);
            case 21:
                return new ICOPayload(...args);
            case 22:
                return new SVGPayload(...args);
            case 23:
                return new CSVPayload(...args);
            case 24:
                return new JSONPayload(...args);
            case 25:
                return new YAMLPayload(...args);
            case 26:
                return new EMAILPayload(...args);
            case 27:
                return new URLPayload(...args);
            case 28:
                return new IPFSPayload(...args);
            case 29:
                return new ONIONPayload(...args);
            case 30:
                return new MAGNETPayload(...args);
        }
        throw new errors_1.TypeIdError(`Error - PayloadTypes.select: unknown typeid ${typeID}`);
    }
    /**
     * Given a [[PayloadBase]] which may not be cast properly, returns a properly cast [[PayloadBase]].
     */
    recast(unknowPayload) {
        return this.select(unknowPayload.typeID(), unknowPayload.returnType());
    }
    /**
     * Returns the [[PayloadTypes]] singleton.
     */
    static getInstance() {
        if (!PayloadTypes.instance) {
            PayloadTypes.instance = new PayloadTypes();
        }
        return PayloadTypes.instance;
    }
    constructor() {
        this.types = [];
        this.types = [
            "BIN",
            "UTF8",
            "HEXSTR",
            "B58STR",
            "B64STR",
            "BIGNUM",
            "XCHAINADDR",
            "PCHAINADDR",
            "CCHAINADDR",
            "TXID",
            "ASSETID",
            "UTXOID",
            "NFTID",
            "SUBNETID",
            "CHAINID",
            "NODEID",
            "SECPSIG",
            "SECPENC",
            "JPEG",
            "PNG",
            "BMP",
            "ICO",
            "SVG",
            "CSV",
            "JSON",
            "YAML",
            "EMAIL",
            "URL",
            "IPFS",
            "ONION",
            "MAGNET"
        ];
    }
}
exports.PayloadTypes = PayloadTypes;
/**
 * Base class for payloads.
 */
class PayloadBase {
    /**
     * Returns the TypeID for the payload.
     */
    typeID() {
        return this.typeid;
    }
    /**
     * Returns the string name for the payload's type.
     */
    typeName() {
        return PayloadTypes.getInstance().lookupType(this.typeid);
    }
    /**
     * Returns the payload content (minus typeID).
     */
    getContent() {
        const pl = bintools.copyFrom(this.payload);
        return pl;
    }
    /**
     * Returns the payload (with typeID).
     */
    getPayload() {
        const typeID = buffer_1.Buffer.alloc(1);
        typeID.writeUInt8(this.typeid, 0);
        const pl = buffer_1.Buffer.concat([typeID, bintools.copyFrom(this.payload)]);
        return pl;
    }
    /**
     * Decodes the payload as a {@link https://github.com/feross/buffer|Buffer} including 4 bytes for the length and TypeID.
     */
    fromBuffer(bytes, offset = 0) {
        const size = bintools
            .copyFrom(bytes, offset, offset + 4)
            .readUInt32BE(0);
        offset += 4;
        this.typeid = bintools.copyFrom(bytes, offset, offset + 1).readUInt8(0);
        offset += 1;
        this.payload = bintools.copyFrom(bytes, offset, offset + size - 1);
        offset += size - 1;
        return offset;
    }
    /**
     * Encodes the payload as a {@link https://github.com/feross/buffer|Buffer} including 4 bytes for the length and TypeID.
     */
    toBuffer() {
        const sizebuff = buffer_1.Buffer.alloc(4);
        sizebuff.writeUInt32BE(this.payload.length + 1, 0);
        const typebuff = buffer_1.Buffer.alloc(1);
        typebuff.writeUInt8(this.typeid, 0);
        return buffer_1.Buffer.concat([sizebuff, typebuff, this.payload]);
    }
    constructor() {
        this.payload = buffer_1.Buffer.alloc(0);
        this.typeid = undefined;
    }
}
exports.PayloadBase = PayloadBase;
/**
 * Class for payloads representing simple binary blobs.
 */
class BINPayload extends PayloadBase {
    /**
     * Returns a {@link https://github.com/feross/buffer|Buffer} for the payload.
     */
    returnType() {
        return this.payload;
    }
    /**
     * @param payload Buffer only
     */
    constructor(payload = undefined) {
        super();
        this.typeid = 0;
        if (payload instanceof buffer_1.Buffer) {
            this.payload = payload;
        }
        else if (typeof payload === "string") {
            this.payload = bintools.b58ToBuffer(payload);
        }
    }
}
exports.BINPayload = BINPayload;
/**
 * Class for payloads representing UTF8 encoding.
 */
class UTF8Payload extends PayloadBase {
    /**
     * Returns a string for the payload.
     */
    returnType() {
        return this.payload.toString("utf8");
    }
    /**
     * @param payload Buffer utf8 string
     */
    constructor(payload = undefined) {
        super();
        this.typeid = 1;
        if (payload instanceof buffer_1.Buffer) {
            this.payload = payload;
        }
        else if (typeof payload === "string") {
            this.payload = buffer_1.Buffer.from(payload, "utf8");
        }
    }
}
exports.UTF8Payload = UTF8Payload;
/**
 * Class for payloads representing Hexadecimal encoding.
 */
class HEXSTRPayload extends PayloadBase {
    /**
     * Returns a hex string for the payload.
     */
    returnType() {
        return this.payload.toString("hex");
    }
    /**
     * @param payload Buffer or hex string
     */
    constructor(payload = undefined) {
        super();
        this.typeid = 2;
        if (payload instanceof buffer_1.Buffer) {
            this.payload = payload;
        }
        else if (typeof payload === "string") {
            if (payload.startsWith("0x") || !payload.match(/^[0-9A-Fa-f]+$/)) {
                throw new errors_1.HexError("HEXSTRPayload.constructor -- hex string may not start with 0x and must be in /^[0-9A-Fa-f]+$/: " +
                    payload);
            }
            this.payload = buffer_1.Buffer.from(payload, "hex");
        }
    }
}
exports.HEXSTRPayload = HEXSTRPayload;
/**
 * Class for payloads representing Base58 encoding.
 */
class B58STRPayload extends PayloadBase {
    /**
     * Returns a base58 string for the payload.
     */
    returnType() {
        return bintools.bufferToB58(this.payload);
    }
    /**
     * @param payload Buffer or cb58 encoded string
     */
    constructor(payload = undefined) {
        super();
        this.typeid = 3;
        if (payload instanceof buffer_1.Buffer) {
            this.payload = payload;
        }
        else if (typeof payload === "string") {
            this.payload = bintools.b58ToBuffer(payload);
        }
    }
}
exports.B58STRPayload = B58STRPayload;
/**
 * Class for payloads representing Base64 encoding.
 */
class B64STRPayload extends PayloadBase {
    /**
     * Returns a base64 string for the payload.
     */
    returnType() {
        return this.payload.toString("base64");
    }
    /**
     * @param payload Buffer of base64 string
     */
    constructor(payload = undefined) {
        super();
        this.typeid = 4;
        if (payload instanceof buffer_1.Buffer) {
            this.payload = payload;
        }
        else if (typeof payload === "string") {
            this.payload = buffer_1.Buffer.from(payload, "base64");
        }
    }
}
exports.B64STRPayload = B64STRPayload;
/**
 * Class for payloads representing Big Numbers.
 *
 * @param payload Accepts a Buffer, BN, or base64 string
 */
class BIGNUMPayload extends PayloadBase {
    /**
     * Returns a {@link https://github.com/indutny/bn.js/|BN} for the payload.
     */
    returnType() {
        return bintools.fromBufferToBN(this.payload);
    }
    /**
     * @param payload Buffer, BN, or base64 string
     */
    constructor(payload = undefined) {
        super();
        this.typeid = 5;
        if (payload instanceof buffer_1.Buffer) {
            this.payload = payload;
        }
        else if (payload instanceof bn_js_1.default) {
            this.payload = bintools.fromBNToBuffer(payload);
        }
        else if (typeof payload === "string") {
            this.payload = buffer_1.Buffer.from(payload, "hex");
        }
    }
}
exports.BIGNUMPayload = BIGNUMPayload;
/**
 * Class for payloads representing chain addresses.
 *
 */
class ChainAddressPayload extends PayloadBase {
    /**
     * Returns the chainid.
     */
    returnChainID() {
        return this.chainid;
    }
    /**
     * Returns an address string for the payload.
     */
    returnType(hrp) {
        const type = "bech32";
        return serialization.bufferToType(this.payload, type, hrp, this.chainid);
    }
    /**
     * @param payload Buffer or address string
     */
    constructor(payload = undefined, hrp) {
        super();
        this.typeid = 6;
        this.chainid = "";
        if (payload instanceof buffer_1.Buffer) {
            this.payload = payload;
        }
        else if (typeof payload === "string") {
            if (hrp != undefined) {
                this.payload = bintools.stringToAddress(payload, hrp);
            }
            else {
                this.payload = bintools.stringToAddress(payload);
            }
        }
    }
}
exports.ChainAddressPayload = ChainAddressPayload;
/**
 * Class for payloads representing X-Chin addresses.
 */
class XCHAINADDRPayload extends ChainAddressPayload {
    constructor() {
        super(...arguments);
        this.typeid = 6;
        this.chainid = "X";
    }
}
exports.XCHAINADDRPayload = XCHAINADDRPayload;
/**
 * Class for payloads representing P-Chain addresses.
 */
class PCHAINADDRPayload extends ChainAddressPayload {
    constructor() {
        super(...arguments);
        this.typeid = 7;
        this.chainid = "P";
    }
}
exports.PCHAINADDRPayload = PCHAINADDRPayload;
/**
 * Class for payloads representing C-Chain addresses.
 */
class CCHAINADDRPayload extends ChainAddressPayload {
    constructor() {
        super(...arguments);
        this.typeid = 8;
        this.chainid = "C";
    }
}
exports.CCHAINADDRPayload = CCHAINADDRPayload;
/**
 * Class for payloads representing data serialized by bintools.cb58Encode().
 */
class cb58EncodedPayload extends PayloadBase {
    /**
     * Returns a bintools.cb58Encoded string for the payload.
     */
    returnType() {
        return bintools.cb58Encode(this.payload);
    }
    /**
     * @param payload Buffer or cb58 encoded string
     */
    constructor(payload = undefined) {
        super();
        if (payload instanceof buffer_1.Buffer) {
            this.payload = payload;
        }
        else if (typeof payload === "string") {
            this.payload = bintools.cb58Decode(payload);
        }
    }
}
exports.cb58EncodedPayload = cb58EncodedPayload;
/**
 * Class for payloads representing TxIDs.
 */
class TXIDPayload extends cb58EncodedPayload {
    constructor() {
        super(...arguments);
        this.typeid = 9;
    }
}
exports.TXIDPayload = TXIDPayload;
/**
 * Class for payloads representing AssetIDs.
 */
class ASSETIDPayload extends cb58EncodedPayload {
    constructor() {
        super(...arguments);
        this.typeid = 10;
    }
}
exports.ASSETIDPayload = ASSETIDPayload;
/**
 * Class for payloads representing NODEIDs.
 */
class UTXOIDPayload extends cb58EncodedPayload {
    constructor() {
        super(...arguments);
        this.typeid = 11;
    }
}
exports.UTXOIDPayload = UTXOIDPayload;
/**
 * Class for payloads representing NFTIDs (UTXOIDs in an NFT context).
 */
class NFTIDPayload extends UTXOIDPayload {
    constructor() {
        super(...arguments);
        this.typeid = 12;
    }
}
exports.NFTIDPayload = NFTIDPayload;
/**
 * Class for payloads representing SubnetIDs.
 */
class SUBNETIDPayload extends cb58EncodedPayload {
    constructor() {
        super(...arguments);
        this.typeid = 13;
    }
}
exports.SUBNETIDPayload = SUBNETIDPayload;
/**
 * Class for payloads representing ChainIDs.
 */
class CHAINIDPayload extends cb58EncodedPayload {
    constructor() {
        super(...arguments);
        this.typeid = 14;
    }
}
exports.CHAINIDPayload = CHAINIDPayload;
/**
 * Class for payloads representing NodeIDs.
 */
class NODEIDPayload extends cb58EncodedPayload {
    constructor() {
        super(...arguments);
        this.typeid = 15;
    }
}
exports.NODEIDPayload = NODEIDPayload;
/**
 * Class for payloads representing secp256k1 signatures.
 * convention: secp256k1 signature (130 bytes)
 */
class SECPSIGPayload extends B58STRPayload {
    constructor() {
        super(...arguments);
        this.typeid = 16;
    }
}
exports.SECPSIGPayload = SECPSIGPayload;
/**
 * Class for payloads representing secp256k1 encrypted messages.
 * convention: public key (65 bytes) + secp256k1 encrypted message for that public key
 */
class SECPENCPayload extends B58STRPayload {
    constructor() {
        super(...arguments);
        this.typeid = 17;
    }
}
exports.SECPENCPayload = SECPENCPayload;
/**
 * Class for payloads representing JPEG images.
 */
class JPEGPayload extends BINPayload {
    constructor() {
        super(...arguments);
        this.typeid = 18;
    }
}
exports.JPEGPayload = JPEGPayload;
class PNGPayload extends BINPayload {
    constructor() {
        super(...arguments);
        this.typeid = 19;
    }
}
exports.PNGPayload = PNGPayload;
/**
 * Class for payloads representing BMP images.
 */
class BMPPayload extends BINPayload {
    constructor() {
        super(...arguments);
        this.typeid = 20;
    }
}
exports.BMPPayload = BMPPayload;
/**
 * Class for payloads representing ICO images.
 */
class ICOPayload extends BINPayload {
    constructor() {
        super(...arguments);
        this.typeid = 21;
    }
}
exports.ICOPayload = ICOPayload;
/**
 * Class for payloads representing SVG images.
 */
class SVGPayload extends UTF8Payload {
    constructor() {
        super(...arguments);
        this.typeid = 22;
    }
}
exports.SVGPayload = SVGPayload;
/**
 * Class for payloads representing CSV files.
 */
class CSVPayload extends UTF8Payload {
    constructor() {
        super(...arguments);
        this.typeid = 23;
    }
}
exports.CSVPayload = CSVPayload;
/**
 * Class for payloads representing JSON strings.
 */
class JSONPayload extends PayloadBase {
    /**
     * Returns a JSON-decoded object for the payload.
     */
    returnType() {
        return JSON.parse(this.payload.toString("utf8"));
    }
    constructor(payload = undefined) {
        super();
        this.typeid = 24;
        if (payload instanceof buffer_1.Buffer) {
            this.payload = payload;
        }
        else if (typeof payload === "string") {
            this.payload = buffer_1.Buffer.from(payload, "utf8");
        }
        else if (payload) {
            let jsonstr = JSON.stringify(payload);
            this.payload = buffer_1.Buffer.from(jsonstr, "utf8");
        }
    }
}
exports.JSONPayload = JSONPayload;
/**
 * Class for payloads representing YAML definitions.
 */
class YAMLPayload extends UTF8Payload {
    constructor() {
        super(...arguments);
        this.typeid = 25;
    }
}
exports.YAMLPayload = YAMLPayload;
/**
 * Class for payloads representing email addresses.
 */
class EMAILPayload extends UTF8Payload {
    constructor() {
        super(...arguments);
        this.typeid = 26;
    }
}
exports.EMAILPayload = EMAILPayload;
/**
 * Class for payloads representing URL strings.
 */
class URLPayload extends UTF8Payload {
    constructor() {
        super(...arguments);
        this.typeid = 27;
    }
}
exports.URLPayload = URLPayload;
/**
 * Class for payloads representing IPFS addresses.
 */
class IPFSPayload extends B58STRPayload {
    constructor() {
        super(...arguments);
        this.typeid = 28;
    }
}
exports.IPFSPayload = IPFSPayload;
/**
 * Class for payloads representing onion URLs.
 */
class ONIONPayload extends UTF8Payload {
    constructor() {
        super(...arguments);
        this.typeid = 29;
    }
}
exports.ONIONPayload = ONIONPayload;
/**
 * Class for payloads representing torrent magnet links.
 */
class MAGNETPayload extends UTF8Payload {
    constructor() {
        super(...arguments);
        this.typeid = 30;
    }
}
exports.MAGNETPayload = MAGNETPayload;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGF5bG9hZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9wYXlsb2FkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O0dBR0c7Ozs7OztBQUVILG9DQUFnQztBQUNoQywwREFBaUM7QUFDakMsa0RBQXNCO0FBQ3RCLDRDQUF1RDtBQUN2RCwwREFBc0U7QUFFdEU7O0dBRUc7QUFDSCxNQUFNLFFBQVEsR0FBYSxrQkFBUSxDQUFDLFdBQVcsRUFBRSxDQUFBO0FBQ2pELE1BQU0sYUFBYSxHQUFrQiw2QkFBYSxDQUFDLFdBQVcsRUFBRSxDQUFBO0FBRWhFOztHQUVHO0FBQ0gsTUFBYSxZQUFZO0lBSXZCOztPQUVHO0lBQ0gsVUFBVSxDQUFDLE9BQWU7UUFDeEIsTUFBTSxFQUFFLEdBQVcsUUFBUSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUE7UUFDaEQsT0FBTyxFQUFFLENBQUE7SUFDWCxDQUFDO0lBRUQ7O09BRUc7SUFDSCxVQUFVLENBQUMsT0FBZTtRQUN4QixNQUFNLEVBQUUsR0FBVyxRQUFRLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQTtRQUNoRCxPQUFPLEVBQUUsQ0FBQTtJQUNYLENBQUM7SUFFRDs7T0FFRztJQUNILFNBQVMsQ0FBQyxPQUFlO1FBQ3ZCLE1BQU0sTUFBTSxHQUFXLENBQUMsQ0FBQTtRQUN4QixNQUFNLE1BQU0sR0FBVyxRQUFRO2FBQzVCLFFBQVEsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sR0FBRyxDQUFDLENBQUM7YUFDckMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2YsT0FBTyxNQUFNLENBQUE7SUFDZixDQUFDO0lBRUQ7O09BRUc7SUFDSCxRQUFRLENBQUMsT0FBZTtRQUN0QixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFBO0lBQ3BDLENBQUM7SUFFRDs7T0FFRztJ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QUEzQzs7UUFDWSxXQUFNLEdBQUcsRUFBRSxDQUFBO0lBQ3ZCLENBQUM7Q0FBQTtBQUZELGdDQUVDO0FBRUQ7O0dBRUc7QUFDSCxNQUFhLFdBQVksU0FBUSxhQUFhO0lBQTlDOztRQUNZLFdBQU0sR0FBRyxFQUFFLENBQUE7SUFDdkIsQ0FBQztDQUFBO0FBRkQsa0NBRUM7QUFFRDs7R0FFRztBQUNILE1BQWEsWUFBYSxTQUFRLFdBQVc7SUFBN0M7O1FBQ1ksV0FBTSxHQUFHLEVBQUUsQ0FBQTtJQUN2QixDQUFDO0NBQUE7QUFGRCxvQ0FFQztBQUVEOztHQUVHO0FBQ0gsTUFBYSxhQUFjLFNBQVEsV0FBVztJQUE5Qzs7UUFDWSxXQUFNLEdBQUcsRUFBRSxDQUFBO0lBQ3ZCLENBQUM7Q0FBQTtBQUZELHNDQUVDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAcGFja2FnZURvY3VtZW50YXRpb25cbiAqIEBtb2R1bGUgVXRpbHMtUGF5bG9hZFxuICovXG5cbmltcG9ydCB7IEJ1ZmZlciB9IGZyb20gXCJidWZmZXIvXCJcbmltcG9ydCBCaW5Ub29scyBmcm9tIFwiLi9iaW50b29sc1wiXG5pbXBvcnQgQk4gZnJvbSBcImJuLmpzXCJcbmltcG9ydCB7IFR5cGVJZEVycm9yLCBIZXhFcnJvciB9IGZyb20gXCIuLi91dGlscy9lcnJvcnNcIlxuaW1wb3J0IHsgU2VyaWFsaXphdGlvbiwgU2VyaWFsaXplZFR5cGUgfSBmcm9tIFwiLi4vdXRpbHMvc2VyaWFsaXphdGlvblwiXG5cbi8qKlxuICogQGlnbm9yZVxuICovXG5jb25zdCBiaW50b29sczogQmluVG9vbHMgPSBCaW5Ub29scy5nZXRJbnN0YW5jZSgpXG5jb25zdCBzZXJpYWxpemF0aW9uOiBTZXJpYWxpemF0aW9uID0gU2VyaWFsaXphdGlvbi5nZXRJbnN0YW5jZSgpXG5cbi8qKlxuICogQ2xhc3MgZm9yIGRldGVybWluaW5nIHBheWxvYWQgdHlwZXMgYW5kIG1hbmFnaW5nIHRoZSBsb29rdXAgdGFibGUuXG4gKi9cbmV4cG9ydCBjbGFzcyBQYXlsb2FkVHlwZXMge1xuICBwcml2YXRlIHN0YXRpYyBpbnN0YW5jZTogUGF5bG9hZFR5cGVzXG4gIHByb3RlY3RlZCB0eXBlczogc3RyaW5nW10gPSBbXVxuXG4gIC8qKlxuICAgKiBHaXZlbiBhbiBlbmNvZGVkIHBheWxvYWQgYnVmZmVyIHJldHVybnMgdGhlIHBheWxvYWQgY29udGVudCAobWludXMgdHlwZUlEKS5cbiAgICovXG4gIGdldENvbnRlbnQocGF5bG9hZDogQnVmZmVyKTogQnVmZmVyIHtcbiAgICBjb25zdCBwbDogQnVmZmVyID0gYmludG9vbHMuY29weUZyb20ocGF5bG9hZCwgNSlcbiAgICByZXR1cm4gcGxcbiAgfVxuXG4gIC8qKlxuICAgKiBHaXZlbiBhbiBlbmNvZGVkIHBheWxvYWQgYnVmZmVyIHJldHVybnMgdGhlIHBheWxvYWQgKHdpdGggdHlwZUlEKS5cbiAgICovXG4gIGdldFBheWxvYWQocGF5bG9hZDogQnVmZmVyKTogQnVmZmVyIHtcbiAgICBjb25zdCBwbDogQnVmZmVyID0gYmludG9vbHMuY29weUZyb20ocGF5bG9hZCwgNClcbiAgICByZXR1cm4gcGxcbiAgfVxuXG4gIC8qKlxuICAgKiBHaXZlbiBhIHBheWxvYWQgYnVmZmVyIHJldHVybnMgdGhlIHByb3BlciBUeXBlSUQuXG4gICAqL1xuICBnZXRUeXBlSUQocGF5bG9hZDogQnVmZmVyKTogbnVtYmVyIHtcbiAgICBjb25zdCBvZmZzZXQ6IG51bWJlciA9IDRcbiAgICBjb25zdCB0eXBlSUQ6IG51bWJlciA9IGJpbnRvb2xzXG4gICAgICAuY29weUZyb20ocGF5bG9hZCwgb2Zmc2V0LCBvZmZzZXQgKyAxKVxuICAgICAgLnJlYWRVSW50OCgwKVxuICAgIHJldHVybiB0eXBlSURcbiAgfVxuXG4gIC8qKlxuICAgKiBHaXZlbiBhIHR5cGUgc3RyaW5nIHJldHVybnMgdGhlIHByb3BlciBUeXBlSUQuXG4gICAqL1xuICBsb29rdXBJRCh0eXBlc3RyOiBzdHJpbmcpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLnR5cGVzLmluZGV4T2YodHlwZXN0cilcbiAgfVxuXG4gIC8qKlxuICAgKiBHaXZlbiBhIFR5cGVJRCByZXR1cm5zIGEgc3RyaW5nIGRlc2NyaWJpbmcgdGhlIHBheWxvYWQgdHlwZS5cbiAgICovXG4gIGxvb2t1cFR5cGUodmFsdWU6IG51bWJlcik6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMudHlwZXNbYCR7dmFsdWV9YF1cbiAgfVxuXG4gIC8qKlxuICAgKiBHaXZlbiBhIFR5cGVJRCByZXR1cm5zIHRoZSBwcm9wZXIgW1tQYXlsb2FkQmFzZV1dLlxuICAgKi9cbiAgc2VsZWN0KHR5cGVJRDogbnVtYmVyLCAuLi5hcmdzOiBhbnlbXSk6IFBheWxvYWRCYXNlIHtcbiAgICBzd2l0Y2ggKHR5cGVJRCkge1xuICAgICAgY2FzZSAwOlxuICAgICAgICByZXR1cm4gbmV3IEJJTlBheWxvYWQoLi4uYXJncylcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgcmV0dXJuIG5ldyBVVEY4UGF5bG9hZCguLi5hcmdzKVxuICAgICAgY2FzZSAyOlxuICAgICAgICByZXR1cm4gbmV3IEhFWFNUUlBheWxvYWQoLi4uYXJncylcbiAgICAgIGNhc2UgMzpcbiAgICAgICAgcmV0dXJuIG5ldyBCNThTVFJQYXlsb2FkKC4uLmFyZ3MpXG4gICAgICBjYXNlIDQ6XG4gICAgICAgIHJldHVybiBuZXcgQjY0U1RSUGF5bG9hZCguLi5hcmdzKVxuICAgICAgY2FzZSA1OlxuICAgICAgICByZXR1cm4gbmV3IEJJR05VTVBheWxvYWQoLi4uYXJncylcbiAgICAgIGNhc2UgNjpcbiAgICAgICAgcmV0dXJuIG5ldyBYQ0hBSU5BRERSUGF5bG9hZCguLi5hcmdzKVxuICAgICAgY2FzZSA3OlxuICAgICAgICByZXR1cm4gbmV3IFBDSEFJTkFERFJQYXlsb2FkKC4uLmFyZ3MpXG4gICAgICBjYXNlIDg6XG4gICAgICAgIHJldHVybiBuZXcgQ0NIQUlOQUREUlBheWxvYWQoLi4uYXJncylcbiAgICAgIGNhc2UgOTpcbiAgICAgICAgcmV0dXJuIG5ldyBUWElEUGF5bG9hZCguLi5hcmdzKVxuICAgICAgY2FzZSAxMDpcbiAgICAgICAgcmV0dXJuIG5ldyBBU1NFVElEUGF5bG9hZCguLi5hcmdzKVxuICAgICAgY2FzZSAxMTpcbiAgICAgICAgcmV0dXJuIG5ldyBVVFhPSURQYXlsb2FkKC4uLmFyZ3MpXG4gICAgICBjYXNlIDEyOlxuICAgICAgICByZXR1cm4gbmV3IE5GVElEUGF5bG9hZCguLi5hcmdzKVxuICAgICAgY2FzZSAxMzpcbiAgICAgICAgcmV0dXJuIG5ldyBTVUJORVRJRFBheWxvYWQoLi4uYXJncylcbiAgICAgIGNhc2UgMTQ6XG4gICAgICAgIHJldHVybiBuZXcgQ0hBSU5JRFBheWxvYWQoLi4uYXJncylcbiAgICAgIGNhc2UgMTU6XG4gICAgICAgIHJldHVybiBuZXcgTk9ERUlEUGF5bG9hZCguLi5hcmdzKVxuICAgICAgY2FzZSAxNjpcbiAgICAgICAgcmV0dXJuIG5ldyBTRUNQU0lHUGF5bG9hZCguLi5hcmdzKVxuICAgICAgY2FzZSAxNzpcbiAgICAgICAgcmV0dXJuIG5ldyBTRUNQRU5DUGF5bG9hZCguLi5hcmdzKVxuICAgICAgY2FzZSAxODpcbiAgICAgICAgcmV0dXJuIG5ldyBKUEVHUGF5bG9hZCguLi5hcmdzKVxuICAgICAgY2FzZSAxOTpcbiAgICAgICAgcmV0dXJuIG5ldyBQTkdQYXlsb2FkKC4uLmFyZ3MpXG4gICAgICBjYXNlIDIwOlxuICAgICAgICByZXR1cm4gbmV3IEJNUFBheWxvYWQoLi4uYXJncylcbiAgICAgIGNhc2UgMjE6XG4gICAgICAgIHJldHVybiBuZXcgSUNPUGF5bG9hZCguLi5hcmdzKVxuICAgICAgY2FzZSAyMjpcbiAgICAgICAgcmV0dXJuIG5ldyBTVkdQYXlsb2FkKC4uLmFyZ3MpXG4gICAgICBjYXNlIDIzOlxuICAgICAgICByZXR1cm4gbmV3IENTVlBheWxvYWQoLi4uYXJncylcbiAgICAgIGNhc2UgMjQ6XG4gICAgICAgIHJldHVybiBuZXcgSlNPTlBheWxvYWQoLi4uYXJncylcbiAgICAgIGNhc2UgMjU6XG4gICAgICAgIHJldHVybiBuZXcgWUFNTFBheWxvYWQoLi4uYXJncylcbiAgICAgIGNhc2UgMjY6XG4gICAgICAgIHJldHVybiBuZXcgRU1BSUxQYXlsb2FkKC4uLmFyZ3MpXG4gICAgICBjYXNlIDI3OlxuICAgICAgICByZXR1cm4gbmV3IFVSTFBheWxvYWQoLi4uYXJncylcbiAgICAgIGNhc2UgMjg6XG4gICAgICAgIHJldHVybiBuZXcgSVBGU1BheWxvYWQoLi4uYXJncylcbiAgICAgIGNhc2UgMjk6XG4gICAgICAgIHJldHVybiBuZXcgT05JT05QYXlsb2FkKC4uLmFyZ3MpXG4gICAgICBjYXNlIDMwOlxuICAgICAgICByZXR1cm4gbmV3IE1BR05FVFBheWxvYWQoLi4uYXJncylcbiAgICB9XG4gICAgdGhyb3cgbmV3IFR5cGVJZEVycm9yKFxuICAgICAgYEVycm9yIC0gUGF5bG9hZFR5cGVzLnNlbGVjdDogdW5rbm93biB0eXBlaWQgJHt0eXBlSUR9YFxuICAgIClcbiAgfVxuXG4gIC8qKlxuICAgKiBHaXZlbiBhIFtbUGF5bG9hZEJhc2VdXSB3aGljaCBtYXkgbm90IGJlIGNhc3QgcHJvcGVybHksIHJldHVybnMgYSBwcm9wZXJseSBjYXN0IFtbUGF5bG9hZEJhc2VdXS5cbiAgICovXG4gIHJlY2FzdCh1bmtub3dQYXlsb2FkOiBQYXlsb2FkQmFzZSk6IFBheWxvYWRCYXNlIHtcbiAgICByZXR1cm4gdGhpcy5zZWxlY3QodW5rbm93UGF5bG9hZC50eXBlSUQoKSwgdW5rbm93UGF5bG9hZC5yZXR1cm5UeXBlKCkpXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgW1tQYXlsb2FkVHlwZXNdXSBzaW5nbGV0b24uXG4gICAqL1xuICBzdGF0aWMgZ2V0SW5zdGFuY2UoKTogUGF5bG9hZFR5cGVzIHtcbiAgICBpZiAoIVBheWxvYWRUeXBlcy5pbnN0YW5jZSkge1xuICAgICAgUGF5bG9hZFR5cGVzLmluc3RhbmNlID0gbmV3IFBheWxvYWRUeXBlcygpXG4gICAgfVxuXG4gICAgcmV0dXJuIFBheWxvYWRUeXBlcy5pbnN0YW5jZVxuICB9XG5cbiAgcHJpdmF0ZSBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLnR5cGVzID0gW1xuICAgICAgXCJCSU5cIixcbiAgICAgIFwiVVRGOFwiLFxuICAgICAgXCJIRVhTVFJcIixcbiAgICAgIFwiQjU4U1RSXCIsXG4gICAgICBcIkI2NFNUUlwiLFxuICAgICAgXCJCSUdOVU1cIixcbiAgICAgIFwiWENIQUlOQUREUlwiLFxuICAgICAgXCJQQ0hBSU5BRERSXCIsXG4gICAgICBcIkNDSEFJTkFERFJcIixcbiAgICAgIFwiVFhJRFwiLFxuICAgICAgXCJBU1NFVElEXCIsXG4gICAgICBcIlVUWE9JRFwiLFxuICAgICAgXCJORlRJRFwiLFxuICAgICAgXCJTVUJORVRJRFwiLFxuICAgICAgXCJDSEFJTklEXCIsXG4gICAgICBcIk5PREVJRFwiLFxuICAgICAgXCJTRUNQU0lHXCIsXG4gICAgICBcIlNFQ1BFTkNcIixcbiAgICAgIFwiSlBFR1wiLFxuICAgICAgXCJQTkdcIixcbiAgICAgIFwiQk1QXCIsXG4gICAgICBcIklDT1wiLFxuICAgICAgXCJTVkdcIixcbiAgICAgIFwiQ1NWXCIsXG4gICAgICBcIkpTT05cIixcbiAgICAgIFwiWUFNTFwiLFxuICAgICAgXCJFTUFJTFwiLFxuICAgICAgXCJVUkxcIixcbiAgICAgIFwiSVBGU1wiLFxuICAgICAgXCJPTklPTlwiLFxuICAgICAgXCJNQUdORVRcIlxuICAgIF1cbiAgfVxufVxuXG4vKipcbiAqIEJhc2UgY2xhc3MgZm9yIHBheWxvYWRzLlxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgUGF5bG9hZEJhc2Uge1xuICBwcm90ZWN0ZWQgcGF5bG9hZDogQnVmZmVyID0gQnVmZmVyLmFsbG9jKDApXG4gIHByb3RlY3RlZCB0eXBlaWQ6IG51bWJlciA9IHVuZGVmaW5lZFxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBUeXBlSUQgZm9yIHRoZSBwYXlsb2FkLlxuICAgKi9cbiAgdHlwZUlEKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMudHlwZWlkXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgc3RyaW5nIG5hbWUgZm9yIHRoZSBwYXlsb2FkJ3MgdHlwZS5cbiAgICovXG4gIHR5cGVOYW1lKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIFBheWxvYWRUeXBlcy5nZXRJbnN0YW5jZSgpLmxvb2t1cFR5cGUodGhpcy50eXBlaWQpXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgcGF5bG9hZCBjb250ZW50IChtaW51cyB0eXBlSUQpLlxuICAgKi9cbiAgZ2V0Q29udGVudCgpOiBCdWZmZXIge1xuICAgIGNvbnN0IHBsOiBCdWZmZXIgPSBiaW50b29scy5jb3B5RnJvbSh0aGlzLnBheWxvYWQpXG4gICAgcmV0dXJuIHBsXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgcGF5bG9hZCAod2l0aCB0eXBlSUQpLlxuICAgKi9cbiAgZ2V0UGF5bG9hZCgpOiBCdWZmZXIge1xuICAgIGNvbnN0IHR5cGVJRDogQnVmZmVyID0gQnVmZmVyLmFsbG9jKDEpXG4gICAgdHlwZUlELndyaXRlVUludDgodGhpcy50eXBlaWQsIDApXG4gICAgY29uc3QgcGw6IEJ1ZmZlciA9IEJ1ZmZlci5jb25jYXQoW3R5cGVJRCwgYmludG9vbHMuY29weUZyb20odGhpcy5wYXlsb2FkKV0pXG4gICAgcmV0dXJuIHBsXG4gIH1cblxuICAvKipcbiAgICogRGVjb2RlcyB0aGUgcGF5bG9hZCBhcyBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IGluY2x1ZGluZyA0IGJ5dGVzIGZvciB0aGUgbGVuZ3RoIGFuZCBUeXBlSUQuXG4gICAqL1xuICBmcm9tQnVmZmVyKGJ5dGVzOiBCdWZmZXIsIG9mZnNldDogbnVtYmVyID0gMCk6IG51bWJlciB7XG4gICAgY29uc3Qgc2l6ZTogbnVtYmVyID0gYmludG9vbHNcbiAgICAgIC5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyA0KVxuICAgICAgLnJlYWRVSW50MzJCRSgwKVxuICAgIG9mZnNldCArPSA0XG4gICAgdGhpcy50eXBlaWQgPSBiaW50b29scy5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyAxKS5yZWFkVUludDgoMClcbiAgICBvZmZzZXQgKz0gMVxuICAgIHRoaXMucGF5bG9hZCA9IGJpbnRvb2xzLmNvcHlGcm9tKGJ5dGVzLCBvZmZzZXQsIG9mZnNldCArIHNpemUgLSAxKVxuICAgIG9mZnNldCArPSBzaXplIC0gMVxuICAgIHJldHVybiBvZmZzZXRcbiAgfVxuXG4gIC8qKlxuICAgKiBFbmNvZGVzIHRoZSBwYXlsb2FkIGFzIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gaW5jbHVkaW5nIDQgYnl0ZXMgZm9yIHRoZSBsZW5ndGggYW5kIFR5cGVJRC5cbiAgICovXG4gIHRvQnVmZmVyKCk6IEJ1ZmZlciB7XG4gICAgY29uc3Qgc2l6ZWJ1ZmY6IEJ1ZmZlciA9IEJ1ZmZlci5hbGxvYyg0KVxuICAgIHNpemVidWZmLndyaXRlVUludDMyQkUodGhpcy5wYXlsb2FkLmxlbmd0aCArIDEsIDApXG4gICAgY29uc3QgdHlwZWJ1ZmY6IEJ1ZmZlciA9IEJ1ZmZlci5hbGxvYygxKVxuICAgIHR5cGVidWZmLndyaXRlVUludDgodGhpcy50eXBlaWQsIDApXG4gICAgcmV0dXJuIEJ1ZmZlci5jb25jYXQoW3NpemVidWZmLCB0eXBlYnVmZiwgdGhpcy5wYXlsb2FkXSlcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBleHBlY3RlZCB0eXBlIGZvciB0aGUgcGF5bG9hZC5cbiAgICovXG4gIGFic3RyYWN0IHJldHVyblR5cGUoLi4uYXJnczogYW55KTogYW55XG5cbiAgY29uc3RydWN0b3IoKSB7fVxufVxuXG4vKipcbiAqIENsYXNzIGZvciBwYXlsb2FkcyByZXByZXNlbnRpbmcgc2ltcGxlIGJpbmFyeSBibG9icy5cbiAqL1xuZXhwb3J0IGNsYXNzIEJJTlBheWxvYWQgZXh0ZW5kcyBQYXlsb2FkQmFzZSB7XG4gIHByb3RlY3RlZCB0eXBlaWQgPSAwXG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBmb3IgdGhlIHBheWxvYWQuXG4gICAqL1xuICByZXR1cm5UeXBlKCk6IEJ1ZmZlciB7XG4gICAgcmV0dXJuIHRoaXMucGF5bG9hZFxuICB9XG4gIC8qKlxuICAgKiBAcGFyYW0gcGF5bG9hZCBCdWZmZXIgb25seVxuICAgKi9cbiAgY29uc3RydWN0b3IocGF5bG9hZDogYW55ID0gdW5kZWZpbmVkKSB7XG4gICAgc3VwZXIoKVxuICAgIGlmIChwYXlsb2FkIGluc3RhbmNlb2YgQnVmZmVyKSB7XG4gICAgICB0aGlzLnBheWxvYWQgPSBwYXlsb2FkXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgcGF5bG9hZCA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgdGhpcy5wYXlsb2FkID0gYmludG9vbHMuYjU4VG9CdWZmZXIocGF5bG9hZClcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBDbGFzcyBmb3IgcGF5bG9hZHMgcmVwcmVzZW50aW5nIFVURjggZW5jb2RpbmcuXG4gKi9cbmV4cG9ydCBjbGFzcyBVVEY4UGF5bG9hZCBleHRlbmRzIFBheWxvYWRCYXNlIHtcbiAgcHJvdGVjdGVkIHR5cGVpZCA9IDFcblxuICAvKipcbiAgICogUmV0dXJucyBhIHN0cmluZyBmb3IgdGhlIHBheWxvYWQuXG4gICAqL1xuICByZXR1cm5UeXBlKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMucGF5bG9hZC50b1N0cmluZyhcInV0ZjhcIilcbiAgfVxuICAvKipcbiAgICogQHBhcmFtIHBheWxvYWQgQnVmZmVyIHV0Zjggc3RyaW5nXG4gICAqL1xuICBjb25zdHJ1Y3RvcihwYXlsb2FkOiBhbnkgPSB1bmRlZmluZWQpIHtcbiAgICBzdXBlcigpXG4gICAgaWYgKHBheWxvYWQgaW5zdGFuY2VvZiBCdWZmZXIpIHtcbiAgICAgIHRoaXMucGF5bG9hZCA9IHBheWxvYWRcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBwYXlsb2FkID09PSBcInN0cmluZ1wiKSB7XG4gICAgICB0aGlzLnBheWxvYWQgPSBCdWZmZXIuZnJvbShwYXlsb2FkLCBcInV0ZjhcIilcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBDbGFzcyBmb3IgcGF5bG9hZHMgcmVwcmVzZW50aW5nIEhleGFkZWNpbWFsIGVuY29kaW5nLlxuICovXG5leHBvcnQgY2xhc3MgSEVYU1RSUGF5bG9hZCBleHRlbmRzIFBheWxvYWRCYXNlIHtcbiAgcHJvdGVjdGVkIHR5cGVpZCA9IDJcblxuICAvKipcbiAgICogUmV0dXJucyBhIGhleCBzdHJpbmcgZm9yIHRoZSBwYXlsb2FkLlxuICAgKi9cbiAgcmV0dXJuVHlwZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLnBheWxvYWQudG9TdHJpbmcoXCJoZXhcIilcbiAgfVxuICAvKipcbiAgICogQHBhcmFtIHBheWxvYWQgQnVmZmVyIG9yIGhleCBzdHJpbmdcbiAgICovXG4gIGNvbnN0cnVjdG9yKHBheWxvYWQ6IGFueSA9IHVuZGVmaW5lZCkge1xuICAgIHN1cGVyKClcbiAgICBpZiAocGF5bG9hZCBpbnN0YW5jZW9mIEJ1ZmZlcikge1xuICAgICAgdGhpcy5wYXlsb2FkID0gcGF5bG9hZFxuICAgIH0gZWxzZSBpZiAodHlwZW9mIHBheWxvYWQgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgIGlmIChwYXlsb2FkLnN0YXJ0c1dpdGgoXCIweFwiKSB8fCAhcGF5bG9hZC5tYXRjaCgvXlswLTlBLUZhLWZdKyQvKSkge1xuICAgICAgICB0aHJvdyBuZXcgSGV4RXJyb3IoXG4gICAgICAgICAgXCJIRVhTVFJQYXlsb2FkLmNvbnN0cnVjdG9yIC0tIGhleCBzdHJpbmcgbWF5IG5vdCBzdGFydCB3aXRoIDB4IGFuZCBtdXN0IGJlIGluIC9eWzAtOUEtRmEtZl0rJC86IFwiICtcbiAgICAgICAgICAgIHBheWxvYWRcbiAgICAgICAgKVxuICAgICAgfVxuICAgICAgdGhpcy5wYXlsb2FkID0gQnVmZmVyLmZyb20ocGF5bG9hZCwgXCJoZXhcIilcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBDbGFzcyBmb3IgcGF5bG9hZHMgcmVwcmVzZW50aW5nIEJhc2U1OCBlbmNvZGluZy5cbiAqL1xuZXhwb3J0IGNsYXNzIEI1OFNUUlBheWxvYWQgZXh0ZW5kcyBQYXlsb2FkQmFzZSB7XG4gIHByb3RlY3RlZCB0eXBlaWQgPSAzXG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBiYXNlNTggc3RyaW5nIGZvciB0aGUgcGF5bG9hZC5cbiAgICovXG4gIHJldHVyblR5cGUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYmludG9vbHMuYnVmZmVyVG9CNTgodGhpcy5wYXlsb2FkKVxuICB9XG4gIC8qKlxuICAgKiBAcGFyYW0gcGF5bG9hZCBCdWZmZXIgb3IgY2I1OCBlbmNvZGVkIHN0cmluZ1xuICAgKi9cbiAgY29uc3RydWN0b3IocGF5bG9hZDogYW55ID0gdW5kZWZpbmVkKSB7XG4gICAgc3VwZXIoKVxuICAgIGlmIChwYXlsb2FkIGluc3RhbmNlb2YgQnVmZmVyKSB7XG4gICAgICB0aGlzLnBheWxvYWQgPSBwYXlsb2FkXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgcGF5bG9hZCA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgdGhpcy5wYXlsb2FkID0gYmludG9vbHMuYjU4VG9CdWZmZXIocGF5bG9hZClcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBDbGFzcyBmb3IgcGF5bG9hZHMgcmVwcmVzZW50aW5nIEJhc2U2NCBlbmNvZGluZy5cbiAqL1xuZXhwb3J0IGNsYXNzIEI2NFNUUlBheWxvYWQgZXh0ZW5kcyBQYXlsb2FkQmFzZSB7XG4gIHByb3RlY3RlZCB0eXBlaWQgPSA0XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBiYXNlNjQgc3RyaW5nIGZvciB0aGUgcGF5bG9hZC5cbiAgICovXG4gIHJldHVyblR5cGUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5wYXlsb2FkLnRvU3RyaW5nKFwiYmFzZTY0XCIpXG4gIH1cbiAgLyoqXG4gICAqIEBwYXJhbSBwYXlsb2FkIEJ1ZmZlciBvZiBiYXNlNjQgc3RyaW5nXG4gICAqL1xuICBjb25zdHJ1Y3RvcihwYXlsb2FkOiBhbnkgPSB1bmRlZmluZWQpIHtcbiAgICBzdXBlcigpXG4gICAgaWYgKHBheWxvYWQgaW5zdGFuY2VvZiBCdWZmZXIpIHtcbiAgICAgIHRoaXMucGF5bG9hZCA9IHBheWxvYWRcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBwYXlsb2FkID09PSBcInN0cmluZ1wiKSB7XG4gICAgICB0aGlzLnBheWxvYWQgPSBCdWZmZXIuZnJvbShwYXlsb2FkLCBcImJhc2U2NFwiKVxuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIENsYXNzIGZvciBwYXlsb2FkcyByZXByZXNlbnRpbmcgQmlnIE51bWJlcnMuXG4gKlxuICogQHBhcmFtIHBheWxvYWQgQWNjZXB0cyBhIEJ1ZmZlciwgQk4sIG9yIGJhc2U2NCBzdHJpbmdcbiAqL1xuZXhwb3J0IGNsYXNzIEJJR05VTVBheWxvYWQgZXh0ZW5kcyBQYXlsb2FkQmFzZSB7XG4gIHByb3RlY3RlZCB0eXBlaWQgPSA1XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2luZHV0bnkvYm4uanMvfEJOfSBmb3IgdGhlIHBheWxvYWQuXG4gICAqL1xuICByZXR1cm5UeXBlKCk6IEJOIHtcbiAgICByZXR1cm4gYmludG9vbHMuZnJvbUJ1ZmZlclRvQk4odGhpcy5wYXlsb2FkKVxuICB9XG4gIC8qKlxuICAgKiBAcGFyYW0gcGF5bG9hZCBCdWZmZXIsIEJOLCBvciBiYXNlNjQgc3RyaW5nXG4gICAqL1xuICBjb25zdHJ1Y3RvcihwYXlsb2FkOiBhbnkgPSB1bmRlZmluZWQpIHtcbiAgICBzdXBlcigpXG4gICAgaWYgKHBheWxvYWQgaW5zdGFuY2VvZiBCdWZmZXIpIHtcbiAgICAgIHRoaXMucGF5bG9hZCA9IHBheWxvYWRcbiAgICB9IGVsc2UgaWYgKHBheWxvYWQgaW5zdGFuY2VvZiBCTikge1xuICAgICAgdGhpcy5wYXlsb2FkID0gYmludG9vbHMuZnJvbUJOVG9CdWZmZXIocGF5bG9hZClcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBwYXlsb2FkID09PSBcInN0cmluZ1wiKSB7XG4gICAgICB0aGlzLnBheWxvYWQgPSBCdWZmZXIuZnJvbShwYXlsb2FkLCBcImhleFwiKVxuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIENsYXNzIGZvciBwYXlsb2FkcyByZXByZXNlbnRpbmcgY2hhaW4gYWRkcmVzc2VzLlxuICpcbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIENoYWluQWRkcmVzc1BheWxvYWQgZXh0ZW5kcyBQYXlsb2FkQmFzZSB7XG4gIHByb3RlY3RlZCB0eXBlaWQgPSA2XG4gIHByb3RlY3RlZCBjaGFpbmlkOiBzdHJpbmcgPSBcIlwiXG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGNoYWluaWQuXG4gICAqL1xuICByZXR1cm5DaGFpbklEKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuY2hhaW5pZFxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYW4gYWRkcmVzcyBzdHJpbmcgZm9yIHRoZSBwYXlsb2FkLlxuICAgKi9cbiAgcmV0dXJuVHlwZShocnA6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgY29uc3QgdHlwZTogU2VyaWFsaXplZFR5cGUgPSBcImJlY2gzMlwiXG4gICAgcmV0dXJuIHNlcmlhbGl6YXRpb24uYnVmZmVyVG9UeXBlKHRoaXMucGF5bG9hZCwgdHlwZSwgaHJwLCB0aGlzLmNoYWluaWQpXG4gIH1cbiAgLyoqXG4gICAqIEBwYXJhbSBwYXlsb2FkIEJ1ZmZlciBvciBhZGRyZXNzIHN0cmluZ1xuICAgKi9cbiAgY29uc3RydWN0b3IocGF5bG9hZDogYW55ID0gdW5kZWZpbmVkLCBocnA/OiBzdHJpbmcpIHtcbiAgICBzdXBlcigpXG4gICAgaWYgKHBheWxvYWQgaW5zdGFuY2VvZiBCdWZmZXIpIHtcbiAgICAgIHRoaXMucGF5bG9hZCA9IHBheWxvYWRcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBwYXlsb2FkID09PSBcInN0cmluZ1wiKSB7XG4gICAgICBpZiAoaHJwICE9IHVuZGVmaW5lZCkge1xuICAgICAgICB0aGlzLnBheWxvYWQgPSBiaW50b29scy5zdHJpbmdUb0FkZHJlc3MocGF5bG9hZCwgaHJwKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5wYXlsb2FkID0gYmludG9vbHMuc3RyaW5nVG9BZGRyZXNzKHBheWxvYWQpXG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQ2xhc3MgZm9yIHBheWxvYWRzIHJlcHJlc2VudGluZyBYLUNoaW4gYWRkcmVzc2VzLlxuICovXG5leHBvcnQgY2xhc3MgWENIQUlOQUREUlBheWxvYWQgZXh0ZW5kcyBDaGFpbkFkZHJlc3NQYXlsb2FkIHtcbiAgcHJvdGVjdGVkIHR5cGVpZCA9IDZcbiAgcHJvdGVjdGVkIGNoYWluaWQgPSBcIlhcIlxufVxuXG4vKipcbiAqIENsYXNzIGZvciBwYXlsb2FkcyByZXByZXNlbnRpbmcgUC1DaGFpbiBhZGRyZXNzZXMuXG4gKi9cbmV4cG9ydCBjbGFzcyBQQ0hBSU5BRERSUGF5bG9hZCBleHRlbmRzIENoYWluQWRkcmVzc1BheWxvYWQge1xuICBwcm90ZWN0ZWQgdHlwZWlkID0gN1xuICBwcm90ZWN0ZWQgY2hhaW5pZCA9IFwiUFwiXG59XG5cbi8qKlxuICogQ2xhc3MgZm9yIHBheWxvYWRzIHJlcHJlc2VudGluZyBDLUNoYWluIGFkZHJlc3Nlcy5cbiAqL1xuZXhwb3J0IGNsYXNzIENDSEFJTkFERFJQYXlsb2FkIGV4dGVuZHMgQ2hhaW5BZGRyZXNzUGF5bG9hZCB7XG4gIHByb3RlY3RlZCB0eXBlaWQgPSA4XG4gIHByb3RlY3RlZCBjaGFpbmlkID0gXCJDXCJcbn1cblxuLyoqXG4gKiBDbGFzcyBmb3IgcGF5bG9hZHMgcmVwcmVzZW50aW5nIGRhdGEgc2VyaWFsaXplZCBieSBiaW50b29scy5jYjU4RW5jb2RlKCkuXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBjYjU4RW5jb2RlZFBheWxvYWQgZXh0ZW5kcyBQYXlsb2FkQmFzZSB7XG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgYmludG9vbHMuY2I1OEVuY29kZWQgc3RyaW5nIGZvciB0aGUgcGF5bG9hZC5cbiAgICovXG4gIHJldHVyblR5cGUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYmludG9vbHMuY2I1OEVuY29kZSh0aGlzLnBheWxvYWQpXG4gIH1cbiAgLyoqXG4gICAqIEBwYXJhbSBwYXlsb2FkIEJ1ZmZlciBvciBjYjU4IGVuY29kZWQgc3RyaW5nXG4gICAqL1xuICBjb25zdHJ1Y3RvcihwYXlsb2FkOiBhbnkgPSB1bmRlZmluZWQpIHtcbiAgICBzdXBlcigpXG4gICAgaWYgKHBheWxvYWQgaW5zdGFuY2VvZiBCdWZmZXIpIHtcbiAgICAgIHRoaXMucGF5bG9hZCA9IHBheWxvYWRcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBwYXlsb2FkID09PSBcInN0cmluZ1wiKSB7XG4gICAgICB0aGlzLnBheWxvYWQgPSBiaW50b29scy5jYjU4RGVjb2RlKHBheWxvYWQpXG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQ2xhc3MgZm9yIHBheWxvYWRzIHJlcHJlc2VudGluZyBUeElEcy5cbiAqL1xuZXhwb3J0IGNsYXNzIFRYSURQYXlsb2FkIGV4dGVuZHMgY2I1OEVuY29kZWRQYXlsb2FkIHtcbiAgcHJvdGVjdGVkIHR5cGVpZCA9IDlcbn1cblxuLyoqXG4gKiBDbGFzcyBmb3IgcGF5bG9hZHMgcmVwcmVzZW50aW5nIEFzc2V0SURzLlxuICovXG5leHBvcnQgY2xhc3MgQVNTRVRJRFBheWxvYWQgZXh0ZW5kcyBjYjU4RW5jb2RlZFBheWxvYWQge1xuICBwcm90ZWN0ZWQgdHlwZWlkID0gMTBcbn1cblxuLyoqXG4gKiBDbGFzcyBmb3IgcGF5bG9hZHMgcmVwcmVzZW50aW5nIE5PREVJRHMuXG4gKi9cbmV4cG9ydCBjbGFzcyBVVFhPSURQYXlsb2FkIGV4dGVuZHMgY2I1OEVuY29kZWRQYXlsb2FkIHtcbiAgcHJvdGVjdGVkIHR5cGVpZCA9IDExXG59XG5cbi8qKlxuICogQ2xhc3MgZm9yIHBheWxvYWRzIHJlcHJlc2VudGluZyBORlRJRHMgKFVUWE9JRHMgaW4gYW4gTkZUIGNvbnRleHQpLlxuICovXG5leHBvcnQgY2xhc3MgTkZUSURQYXlsb2FkIGV4dGVuZHMgVVRYT0lEUGF5bG9hZCB7XG4gIHByb3RlY3RlZCB0eXBlaWQgPSAxMlxufVxuXG4vKipcbiAqIENsYXNzIGZvciBwYXlsb2FkcyByZXByZXNlbnRpbmcgU3VibmV0SURzLlxuICovXG5leHBvcnQgY2xhc3MgU1VCTkVUSURQYXlsb2FkIGV4dGVuZHMgY2I1OEVuY29kZWRQYXlsb2FkIHtcbiAgcHJvdGVjdGVkIHR5cGVpZCA9IDEzXG59XG5cbi8qKlxuICogQ2xhc3MgZm9yIHBheWxvYWRzIHJlcHJlc2VudGluZyBDaGFpbklEcy5cbiAqL1xuZXhwb3J0IGNsYXNzIENIQUlOSURQYXlsb2FkIGV4dGVuZHMgY2I1OEVuY29kZWRQYXlsb2FkIHtcbiAgcHJvdGVjdGVkIHR5cGVpZCA9IDE0XG59XG5cbi8qKlxuICogQ2xhc3MgZm9yIHBheWxvYWRzIHJlcHJlc2VudGluZyBOb2RlSURzLlxuICovXG5leHBvcnQgY2xhc3MgTk9ERUlEUGF5bG9hZCBleHRlbmRzIGNiNThFbmNvZGVkUGF5bG9hZCB7XG4gIHByb3RlY3RlZCB0eXBlaWQgPSAxNVxufVxuXG4vKipcbiAqIENsYXNzIGZvciBwYXlsb2FkcyByZXByZXNlbnRpbmcgc2VjcDI1NmsxIHNpZ25hdHVyZXMuXG4gKiBjb252ZW50aW9uOiBzZWNwMjU2azEgc2lnbmF0dXJlICgxMzAgYnl0ZXMpXG4gKi9cbmV4cG9ydCBjbGFzcyBTRUNQU0lHUGF5bG9hZCBleHRlbmRzIEI1OFNUUlBheWxvYWQge1xuICBwcm90ZWN0ZWQgdHlwZWlkID0gMTZcbn1cblxuLyoqXG4gKiBDbGFzcyBmb3IgcGF5bG9hZHMgcmVwcmVzZW50aW5nIHNlY3AyNTZrMSBlbmNyeXB0ZWQgbWVzc2FnZXMuXG4gKiBjb252ZW50aW9uOiBwdWJsaWMga2V5ICg2NSBieXRlcykgKyBzZWNwMjU2azEgZW5jcnlwdGVkIG1lc3NhZ2UgZm9yIHRoYXQgcHVibGljIGtleVxuICovXG5leHBvcnQgY2xhc3MgU0VDUEVOQ1BheWxvYWQgZXh0ZW5kcyBCNThTVFJQYXlsb2FkIHtcbiAgcHJvdGVjdGVkIHR5cGVpZCA9IDE3XG59XG5cbi8qKlxuICogQ2xhc3MgZm9yIHBheWxvYWRzIHJlcHJlc2VudGluZyBKUEVHIGltYWdlcy5cbiAqL1xuZXhwb3J0IGNsYXNzIEpQRUdQYXlsb2FkIGV4dGVuZHMgQklOUGF5bG9hZCB7XG4gIHByb3RlY3RlZCB0eXBlaWQgPSAxOFxufVxuXG5leHBvcnQgY2xhc3MgUE5HUGF5bG9hZCBleHRlbmRzIEJJTlBheWxvYWQge1xuICBwcm90ZWN0ZWQgdHlwZWlkID0gMTlcbn1cblxuLyoqXG4gKiBDbGFzcyBmb3IgcGF5bG9hZHMgcmVwcmVzZW50aW5nIEJNUCBpbWFnZXMuXG4gKi9cbmV4cG9ydCBjbGFzcyBCTVBQYXlsb2FkIGV4dGVuZHMgQklOUGF5bG9hZCB7XG4gIHByb3RlY3RlZCB0eXBlaWQgPSAyMFxufVxuXG4vKipcbiAqIENsYXNzIGZvciBwYXlsb2FkcyByZXByZXNlbnRpbmcgSUNPIGltYWdlcy5cbiAqL1xuZXhwb3J0IGNsYXNzIElDT1BheWxvYWQgZXh0ZW5kcyBCSU5QYXlsb2FkIHtcbiAgcHJvdGVjdGVkIHR5cGVpZCA9IDIxXG59XG5cbi8qKlxuICogQ2xhc3MgZm9yIHBheWxvYWRzIHJlcHJlc2VudGluZyBTVkcgaW1hZ2VzLlxuICovXG5leHBvcnQgY2xhc3MgU1ZHUGF5bG9hZCBleHRlbmRzIFVURjhQYXlsb2FkIHtcbiAgcHJvdGVjdGVkIHR5cGVpZCA9IDIyXG59XG5cbi8qKlxuICogQ2xhc3MgZm9yIHBheWxvYWRzIHJlcHJlc2VudGluZyBDU1YgZmlsZXMuXG4gKi9cbmV4cG9ydCBjbGFzcyBDU1ZQYXlsb2FkIGV4dGVuZHMgVVRGOFBheWxvYWQge1xuICBwcm90ZWN0ZWQgdHlwZWlkID0gMjNcbn1cblxuLyoqXG4gKiBDbGFzcyBmb3IgcGF5bG9hZHMgcmVwcmVzZW50aW5nIEpTT04gc3RyaW5ncy5cbiAqL1xuZXhwb3J0IGNsYXNzIEpTT05QYXlsb2FkIGV4dGVuZHMgUGF5bG9hZEJhc2Uge1xuICBwcm90ZWN0ZWQgdHlwZWlkID0gMjRcblxuICAvKipcbiAgICogUmV0dXJucyBhIEpTT04tZGVjb2RlZCBvYmplY3QgZm9yIHRoZSBwYXlsb2FkLlxuICAgKi9cbiAgcmV0dXJuVHlwZSgpOiBhbnkge1xuICAgIHJldHVybiBKU09OLnBhcnNlKHRoaXMucGF5bG9hZC50b1N0cmluZyhcInV0ZjhcIikpXG4gIH1cblxuICBjb25zdHJ1Y3RvcihwYXlsb2FkOiBhbnkgPSB1bmRlZmluZWQpIHtcbiAgICBzdXBlcigpXG4gICAgaWYgKHBheWxvYWQgaW5zdGFuY2VvZiBCdWZmZXIpIHtcbiAgICAgIHRoaXMucGF5bG9hZCA9IHBheWxvYWRcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBwYXlsb2FkID09PSBcInN0cmluZ1wiKSB7XG4gICAgICB0aGlzLnBheWxvYWQgPSBCdWZmZXIuZnJvbShwYXlsb2FkLCBcInV0ZjhcIilcbiAgICB9IGVsc2UgaWYgKHBheWxvYWQpIHtcbiAgICAgIGxldCBqc29uc3RyOiBzdHJpbmcgPSBKU09OLnN0cmluZ2lmeShwYXlsb2FkKVxuICAgICAgdGhpcy5wYXlsb2FkID0gQnVmZmVyLmZyb20oanNvbnN0ciwgXCJ1dGY4XCIpXG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQ2xhc3MgZm9yIHBheWxvYWRzIHJlcHJlc2VudGluZyBZQU1MIGRlZmluaXRpb25zLlxuICovXG5leHBvcnQgY2xhc3MgWUFNTFBheWxvYWQgZXh0ZW5kcyBVVEY4UGF5bG9hZCB7XG4gIHByb3RlY3RlZCB0eXBlaWQgPSAyNVxufVxuXG4vKipcbiAqIENsYXNzIGZvciBwYXlsb2FkcyByZXByZXNlbnRpbmcgZW1haWwgYWRkcmVzc2VzLlxuICovXG5leHBvcnQgY2xhc3MgRU1BSUxQYXlsb2FkIGV4dGVuZHMgVVRGOFBheWxvYWQge1xuICBwcm90ZWN0ZWQgdHlwZWlkID0gMjZcbn1cblxuLyoqXG4gKiBDbGFzcyBmb3IgcGF5bG9hZHMgcmVwcmVzZW50aW5nIFVSTCBzdHJpbmdzLlxuICovXG5leHBvcnQgY2xhc3MgVVJMUGF5bG9hZCBleHRlbmRzIFVURjhQYXlsb2FkIHtcbiAgcHJvdGVjdGVkIHR5cGVpZCA9IDI3XG59XG5cbi8qKlxuICogQ2xhc3MgZm9yIHBheWxvYWRzIHJlcHJlc2VudGluZyBJUEZTIGFkZHJlc3Nlcy5cbiAqL1xuZXhwb3J0IGNsYXNzIElQRlNQYXlsb2FkIGV4dGVuZHMgQjU4U1RSUGF5bG9hZCB7XG4gIHByb3RlY3RlZCB0eXBlaWQgPSAyOFxufVxuXG4vKipcbiAqIENsYXNzIGZvciBwYXlsb2FkcyByZXByZXNlbnRpbmcgb25pb24gVVJMcy5cbiAqL1xuZXhwb3J0IGNsYXNzIE9OSU9OUGF5bG9hZCBleHRlbmRzIFVURjhQYXlsb2FkIHtcbiAgcHJvdGVjdGVkIHR5cGVpZCA9IDI5XG59XG5cbi8qKlxuICogQ2xhc3MgZm9yIHBheWxvYWRzIHJlcHJlc2VudGluZyB0b3JyZW50IG1hZ25ldCBsaW5rcy5cbiAqL1xuZXhwb3J0IGNsYXNzIE1BR05FVFBheWxvYWQgZXh0ZW5kcyBVVEY4UGF5bG9hZCB7XG4gIHByb3RlY3RlZCB0eXBlaWQgPSAzMFxufVxuIl19
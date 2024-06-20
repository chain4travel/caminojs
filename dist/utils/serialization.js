"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Serialization = exports.Serializable = exports.SERIALIZATIONVERSION = void 0;
/**
 * @packageDocumentation
 * @module Utils-Serialization
 */
const bintools_1 = __importDefault(require("../utils/bintools"));
const bn_js_1 = __importDefault(require("bn.js"));
const buffer_1 = require("buffer/");
const xss_1 = __importDefault(require("xss"));
const helperfunctions_1 = require("./helperfunctions");
const errors_1 = require("../utils/errors");
exports.SERIALIZATIONVERSION = 0;
class Serializable {
    constructor() {
        this._typeName = undefined;
        this._typeID = undefined;
        this._codecID = undefined;
    }
    /**
     * Used in serialization. TypeName is a string name for the type of object being output.
     */
    getTypeName() {
        return this._typeName;
    }
    /**
     * Used in serialization. Optional. TypeID is a number for the typeID of object being output.
     */
    getTypeID() {
        return this._typeID;
    }
    /**
     * Used in serialization. Optional. TypeID is a number for the typeID of object being output.
     */
    getCodecID() {
        return this._codecID;
    }
    /**
     * Sanitize to prevent cross scripting attacks.
     */
    sanitizeObject(obj) {
        for (const k in obj) {
            if (typeof obj[`${k}`] === "object" && obj[`${k}`] !== null) {
                this.sanitizeObject(obj[`${k}`]);
            }
            else if (typeof obj[`${k}`] === "string") {
                obj[`${k}`] = (0, xss_1.default)(obj[`${k}`]);
            }
        }
        return obj;
    }
    //sometimes the parent class manages the fields
    //these are so you can say super.serialize(encoding)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    serialize(encoding) {
        return {
            _typeName: (0, xss_1.default)(this._typeName),
            _typeID: typeof this._typeID === "undefined" ? null : this._typeID,
            _codecID: typeof this._codecID === "undefined" ? null : this._codecID
        };
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    deserialize(fields, encoding) {
        fields = this.sanitizeObject(fields);
        if (typeof fields["_typeName"] !== "string") {
            throw new errors_1.TypeNameError("Error - Serializable.deserialize: _typeName must be a string, found: " +
                typeof fields["_typeName"]);
        }
        if (fields["_typeName"] !== this._typeName) {
            throw new errors_1.TypeNameError("Error - Serializable.deserialize: _typeName mismatch -- expected: " +
                this._typeName +
                " -- received: " +
                fields["_typeName"]);
        }
        if (typeof fields["_typeID"] !== "undefined" &&
            fields["_typeID"] !== null) {
            if (typeof fields["_typeID"] !== "number") {
                throw new errors_1.TypeIdError("Error - Serializable.deserialize: _typeID must be a number, found: " +
                    typeof fields["_typeID"]);
            }
            if (fields["_typeID"] !== this._typeID) {
                throw new errors_1.TypeIdError("Error - Serializable.deserialize: _typeID mismatch -- expected: " +
                    this._typeID +
                    " -- received: " +
                    fields["_typeID"]);
            }
        }
        if (typeof fields["_codecID"] !== "undefined" &&
            fields["_codecID"] !== null) {
            if (typeof fields["_codecID"] !== "number") {
                throw new errors_1.CodecIdError("Error - Serializable.deserialize: _codecID must be a number, found: " +
                    typeof fields["_codecID"]);
            }
            if (fields["_codecID"] !== this._codecID) {
                throw new errors_1.CodecIdError("Error - Serializable.deserialize: _codecID mismatch -- expected: " +
                    this._codecID +
                    " -- received: " +
                    fields["_codecID"]);
            }
        }
    }
}
exports.Serializable = Serializable;
class Serialization {
    constructor() {
        this.bintools = bintools_1.default.getInstance();
    }
    /**
     * Retrieves the Serialization singleton.
     */
    static getInstance() {
        if (!Serialization.instance) {
            Serialization.instance = new Serialization();
        }
        return Serialization.instance;
    }
    /**
     * Convert {@link https://github.com/feross/buffer|Buffer} to [[SerializedType]]
     *
     * @param vb {@link https://github.com/feross/buffer|Buffer}
     * @param type [[SerializedType]]
     * @param ...args remaining arguments
     * @returns type of [[SerializedType]]
     */
    bufferToType(vb, type, ...args) {
        if (type === "BN") {
            return new bn_js_1.default(vb.toString("hex"), "hex");
        }
        else if (type === "Buffer") {
            if (args.length == 1 && typeof args[0] === "number") {
                vb = buffer_1.Buffer.from(vb.toString("hex").padStart(args[0] * 2, "0"), "hex");
            }
            return vb;
        }
        else if (type === "bech32") {
            return this.bintools.addressToString(args[0], args[1], vb);
        }
        else if (type === "nodeID") {
            return (0, helperfunctions_1.bufferToNodeIDString)(vb);
        }
        else if (type === "privateKey") {
            return (0, helperfunctions_1.bufferToPrivateKeyString)(vb);
        }
        else if (type === "cb58") {
            return this.bintools.cb58Encode(vb);
        }
        else if (type === "base58") {
            return this.bintools.bufferToB58(vb);
        }
        else if (type === "base64") {
            return vb.toString("base64");
        }
        else if (type === "hex") {
            return vb.toString("hex");
        }
        else if (type === "decimalString") {
            return new bn_js_1.default(vb.toString("hex"), "hex").toString(10);
        }
        else if (type === "number") {
            return new bn_js_1.default(vb.toString("hex"), "hex").toNumber();
        }
        else if (type === "utf8") {
            return vb.toString("utf8");
        }
        return undefined;
    }
    /**
     * Convert [[SerializedType]] to {@link https://github.com/feross/buffer|Buffer}
     *
     * @param v type of [[SerializedType]]
     * @param type [[SerializedType]]
     * @param ...args remaining arguments
     * @returns {@link https://github.com/feross/buffer|Buffer}
     */
    typeToBuffer(v, type, ...args) {
        if (type === "BN") {
            let str = v.toString("hex");
            if (args.length == 1 && typeof args[0] === "number") {
                return buffer_1.Buffer.from(str.padStart(args[0] * 2, "0"), "hex");
            }
            return buffer_1.Buffer.from(str, "hex");
        }
        else if (type === "Buffer") {
            return v;
        }
        else if (type === "bech32") {
            return this.bintools.stringToAddress(v, ...args);
        }
        else if (type === "nodeID") {
            return (0, helperfunctions_1.NodeIDStringToBuffer)(v);
        }
        else if (type === "privateKey") {
            return (0, helperfunctions_1.privateKeyStringToBuffer)(v);
        }
        else if (type === "cb58") {
            return this.bintools.cb58Decode(v);
        }
        else if (type === "base58") {
            return this.bintools.b58ToBuffer(v);
        }
        else if (type === "base64") {
            return buffer_1.Buffer.from(v, "base64");
        }
        else if (type === "hex") {
            if (v.startsWith("0x")) {
                v = v.slice(2);
            }
            return buffer_1.Buffer.from(v, "hex");
        }
        else if (type === "decimalString") {
            let str = new bn_js_1.default(v, 10).toString("hex");
            if (args.length == 1 && typeof args[0] === "number") {
                return buffer_1.Buffer.from(str.padStart(args[0] * 2, "0"), "hex");
            }
            return buffer_1.Buffer.from(str, "hex");
        }
        else if (type === "number") {
            let str = new bn_js_1.default(v, 10).toString("hex");
            if (args.length == 1 && typeof args[0] === "number") {
                return buffer_1.Buffer.from(str.padStart(args[0] * 2, "0"), "hex");
            }
            return buffer_1.Buffer.from(str, "hex");
        }
        else if (type === "utf8") {
            if (args.length == 1 && typeof args[0] === "number") {
                let b = buffer_1.Buffer.alloc(args[0]);
                b.write(v);
                return b;
            }
            return buffer_1.Buffer.from(v, "utf8");
        }
        return undefined;
    }
    /**
     * Convert value to type of [[SerializedType]] or [[SerializedEncoding]]
     *
     * @param value
     * @param encoding [[SerializedEncoding]]
     * @param intype [[SerializedType]]
     * @param outtype [[SerializedType]]
     * @param ...args remaining arguments
     * @returns type of [[SerializedType]] or [[SerializedEncoding]]
     */
    encoder(value, encoding, intype, outtype, ...args) {
        if (typeof value === "undefined") {
            throw new errors_1.UnknownTypeError("Error - Serializable.encoder: value passed is undefined");
        }
        if (encoding !== "display") {
            outtype = encoding;
        }
        const vb = this.typeToBuffer(value, intype, ...args);
        return this.bufferToType(vb, outtype, ...args);
    }
    /**
     * Convert value to type of [[SerializedType]] or [[SerializedEncoding]]
     *
     * @param value
     * @param encoding [[SerializedEncoding]]
     * @param intype [[SerializedType]]
     * @param outtype [[SerializedType]]
     * @param ...args remaining arguments
     * @returns type of [[SerializedType]] or [[SerializedEncoding]]
     */
    decoder(value, encoding, intype, outtype, ...args) {
        if (typeof value === "undefined") {
            throw new errors_1.UnknownTypeError("Error - Serializable.decoder: value passed is undefined");
        }
        if (encoding !== "display") {
            intype = encoding;
        }
        const vb = this.typeToBuffer(value, intype, ...args);
        return this.bufferToType(vb, outtype, ...args);
    }
    serialize(serialize, vm, encoding = "display", notes = undefined) {
        if (typeof notes === "undefined") {
            notes = serialize.getTypeName();
        }
        return {
            vm,
            encoding,
            version: exports.SERIALIZATIONVERSION,
            notes,
            fields: serialize.serialize(encoding)
        };
    }
    deserialize(input, output) {
        output.deserialize(input.fields, input.encoding);
    }
}
exports.Serialization = Serialization;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VyaWFsaXphdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9zZXJpYWxpemF0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBOzs7R0FHRztBQUNILGlFQUF3QztBQUN4QyxrREFBc0I7QUFDdEIsb0NBQWdDO0FBQ2hDLDhDQUFxQjtBQUNyQix1REFLMEI7QUFDMUIsNENBS3dCO0FBR1gsUUFBQSxvQkFBb0IsR0FBVyxDQUFDLENBQUE7QUF5QjdDLE1BQXNCLFlBQVk7SUFBbEM7UUFDWSxjQUFTLEdBQVcsU0FBUyxDQUFBO1FBQzdCLFlBQU8sR0FBVyxTQUFTLENBQUE7UUFDM0IsYUFBUSxHQUFXLFNBQVMsQ0FBQTtJQXVHeEMsQ0FBQztJQXJHQzs7T0FFRztJQUNILFdBQVc7UUFDVCxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUE7SUFDdkIsQ0FBQztJQUVEOztPQUVHO0lBQ0gsU0FBUztRQUNQLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQTtJQUNyQixDQUFDO0lBRUQ7O09BRUc7SUFDSCxVQUFVO1FBQ1IsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFBO0lBQ3RCLENBQUM7SUFFRDs7T0FFRztJQUNILGNBQWMsQ0FBQyxHQUFXO1FBQ3hCLEtBQUssTUFBTSxDQUFDLElBQUksR0FBRyxFQUFFO1lBQ25CLElBQUksT0FBTyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxLQUFLLFFBQVEsSUFBSSxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxLQUFLLElBQUksRUFBRTtnQkFDM0QsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUE7YUFDakM7aUJBQU0sSUFBSSxPQUFPLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEtBQUssUUFBUSxFQUFFO2dCQUMxQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFH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LE1BQU0sR0FBRyxRQUFRLENBQUE7U0FDbEI7UUFDRCxNQUFNLEVBQUUsR0FBVyxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQTtRQUM1RCxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsRUFBRSxFQUFFLE9BQU8sRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFBO0lBQ2hELENBQUM7SUFFRCxTQUFTLENBQ1AsU0FBdUIsRUFDdkIsRUFBVSxFQUNWLFdBQStCLFNBQVMsRUFDeEMsUUFBZ0IsU0FBUztRQUV6QixJQUFJLE9BQU8sS0FBSyxLQUFLLFdBQVcsRUFBRTtZQUNoQyxLQUFLLEdBQUcsU0FBUyxDQUFDLFdBQVcsRUFBRSxDQUFBO1NBQ2hDO1FBQ0QsT0FBTztZQUNMLEVBQUU7WUFDRixRQUFRO1lBQ1IsT0FBTyxFQUFFLDRCQUFvQjtZQUM3QixLQUFLO1lBQ0wsTUFBTSxFQUFFLFNBQVMsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDO1NBQ3RDLENBQUE7SUFDSCxDQUFDO0lBRUQsV0FBVyxDQUFDLEtBQWlCLEVBQUUsTUFBb0I7UUFDakQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQTtJQUNsRCxDQUFDO0NBQ0Y7QUFsTUQsc0NBa01DIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAcGFja2FnZURvY3VtZW50YXRpb25cbiAqIEBtb2R1bGUgVXRpbHMtU2VyaWFsaXphdGlvblxuICovXG5pbXBvcnQgQmluVG9vbHMgZnJvbSBcIi4uL3V0aWxzL2JpbnRvb2xzXCJcbmltcG9ydCBCTiBmcm9tIFwiYm4uanNcIlxuaW1wb3J0IHsgQnVmZmVyIH0gZnJvbSBcImJ1ZmZlci9cIlxuaW1wb3J0IHhzcyBmcm9tIFwieHNzXCJcbmltcG9ydCB7XG4gIE5vZGVJRFN0cmluZ1RvQnVmZmVyLFxuICBwcml2YXRlS2V5U3RyaW5nVG9CdWZmZXIsXG4gIGJ1ZmZlclRvTm9kZUlEU3RyaW5nLFxuICBidWZmZXJUb1ByaXZhdGVLZXlTdHJpbmdcbn0gZnJvbSBcIi4vaGVscGVyZnVuY3Rpb25zXCJcbmltcG9ydCB7XG4gIENvZGVjSWRFcnJvcixcbiAgVHlwZUlkRXJyb3IsXG4gIFR5cGVOYW1lRXJyb3IsXG4gIFVua25vd25UeXBlRXJyb3Jcbn0gZnJvbSBcIi4uL3V0aWxzL2Vycm9yc1wiXG5pbXBvcnQgeyBTZXJpYWxpemVkIH0gZnJvbSBcIi4uL2NvbW1vblwiXG5cbmV4cG9ydCBjb25zdCBTRVJJQUxJWkFUSU9OVkVSU0lPTjogbnVtYmVyID0gMFxuZXhwb3J0IHR5cGUgU2VyaWFsaXplZFR5cGUgPVxuICB8IFwiaGV4XCJcbiAgfCBcIkJOXCJcbiAgfCBcIkJ1ZmZlclwiXG4gIHwgXCJiZWNoMzJcIlxuICB8IFwibm9kZUlEXCJcbiAgfCBcInByaXZhdGVLZXlcIlxuICB8IFwiY2I1OFwiXG4gIHwgXCJiYXNlNThcIlxuICB8IFwiYmFzZTY0XCJcbiAgfCBcImRlY2ltYWxTdHJpbmdcIlxuICB8IFwibnVtYmVyXCJcbiAgfCBcInV0ZjhcIlxuXG5leHBvcnQgdHlwZSBTZXJpYWxpemVkRW5jb2RpbmcgPVxuICB8IFwiaGV4XCJcbiAgfCBcImNiNThcIlxuICB8IFwiYmFzZTU4XCJcbiAgfCBcImJhc2U2NFwiXG4gIHwgXCJkZWNpbWFsU3RyaW5nXCJcbiAgfCBcIm51bWJlclwiXG4gIHwgXCJ1dGY4XCJcbiAgfCBcImRpc3BsYXlcIlxuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgU2VyaWFsaXphYmxlIHtcbiAgcHJvdGVjdGVkIF90eXBlTmFtZTogc3RyaW5nID0gdW5kZWZpbmVkXG4gIHByb3RlY3RlZCBfdHlwZUlEOiBudW1iZXIgPSB1bmRlZmluZWRcbiAgcHJvdGVjdGVkIF9jb2RlY0lEOiBudW1iZXIgPSB1bmRlZmluZWRcblxuICAvKipcbiAgICogVXNlZCBpbiBzZXJpYWxpemF0aW9uLiBUeXBlTmFtZSBpcyBhIHN0cmluZyBuYW1lIGZvciB0aGUgdHlwZSBvZiBvYmplY3QgYmVpbmcgb3V0cHV0LlxuICAgKi9cbiAgZ2V0VHlwZU5hbWUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fdHlwZU5hbWVcbiAgfVxuXG4gIC8qKlxuICAgKiBVc2VkIGluIHNlcmlhbGl6YXRpb24uIE9wdGlvbmFsLiBUeXBlSUQgaXMgYSBudW1iZXIgZm9yIHRoZSB0eXBlSUQgb2Ygb2JqZWN0IGJlaW5nIG91dHB1dC5cbiAgICovXG4gIGdldFR5cGVJRCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl90eXBlSURcbiAgfVxuXG4gIC8qKlxuICAgKiBVc2VkIGluIHNlcmlhbGl6YXRpb24uIE9wdGlvbmFsLiBUeXBlSUQgaXMgYSBudW1iZXIgZm9yIHRoZSB0eXBlSUQgb2Ygb2JqZWN0IGJlaW5nIG91dHB1dC5cbiAgICovXG4gIGdldENvZGVjSUQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fY29kZWNJRFxuICB9XG5cbiAgLyoqXG4gICAqIFNhbml0aXplIHRvIHByZXZlbnQgY3Jvc3Mgc2NyaXB0aW5nIGF0dGFja3MuXG4gICAqL1xuICBzYW5pdGl6ZU9iamVjdChvYmo6IG9iamVjdCk6IG9iamVjdCB7XG4gICAgZm9yIChjb25zdCBrIGluIG9iaikge1xuICAgICAgaWYgKHR5cGVvZiBvYmpbYCR7a31gXSA9PT0gXCJvYmplY3RcIiAmJiBvYmpbYCR7a31gXSAhPT0gbnVsbCkge1xuICAgICAgICB0aGlzLnNhbml0aXplT2JqZWN0KG9ialtgJHtrfWBdKVxuICAgICAgfSBlbHNlIGlmICh0eXBlb2Ygb2JqW2Ake2t9YF0gPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgb2JqW2Ake2t9YF0gPSB4c3Mob2JqW2Ake2t9YF0pXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvYmpcbiAgfVxuXG4gIC8vc29tZXRpbWVzIHRoZSBwYXJlbnQgY2xhc3MgbWFuYWdlcyB0aGUgZmllbGRzXG4gIC8vdGhlc2UgYXJlIHNvIHlvdSBjYW4gc2F5IHN1cGVyLnNlcmlhbGl6ZShlbmNvZGluZylcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnVzZWQtdmFyc1xuICBzZXJpYWxpemUoZW5jb2Rpbmc/OiBTZXJpYWxpemVkRW5jb2RpbmcpOiBvYmplY3Qge1xuICAgIHJldHVybiB7XG4gICAgICBfdHlwZU5hbWU6IHhzcyh0aGlzLl90eXBlTmFtZSksXG4gICAgICBfdHlwZUlEOiB0eXBlb2YgdGhpcy5fdHlwZUlEID09PSBcInVuZGVmaW5lZFwiID8gbnVsbCA6IHRoaXMuX3R5cGVJRCxcbiAgICAgIF9jb2RlY0lEOiB0eXBlb2YgdGhpcy5fY29kZWNJRCA9PT0gXCJ1bmRlZmluZWRcIiA/IG51bGwgOiB0aGlzLl9jb2RlY0lEXG4gICAgfVxuICB9XG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnNcbiAgZGVzZXJpYWxpemUoZmllbGRzOiBvYmplY3QsIGVuY29kaW5nPzogU2VyaWFsaXplZEVuY29kaW5nKTogdm9pZCB7XG4gICAgZmllbGRzID0gdGhpcy5zYW5pdGl6ZU9iamVjdChmaWVsZHMpXG4gICAgaWYgKHR5cGVvZiBmaWVsZHNbXCJfdHlwZU5hbWVcIl0gIT09IFwic3RyaW5nXCIpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlTmFtZUVycm9yKFxuICAgICAgICBcIkVycm9yIC0gU2VyaWFsaXphYmxlLmRlc2VyaWFsaXplOiBfdHlwZU5hbWUgbXVzdCBiZSBhIHN0cmluZywgZm91bmQ6IFwiICtcbiAgICAgICAgICB0eXBlb2YgZmllbGRzW1wiX3R5cGVOYW1lXCJdXG4gICAgICApXG4gICAgfVxuICAgIGlmIChmaWVsZHNbXCJfdHlwZU5hbWVcIl0gIT09IHRoaXMuX3R5cGVOYW1lKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZU5hbWVFcnJvcihcbiAgICAgICAgXCJFcnJvciAtIFNlcmlhbGl6YWJsZS5kZXNlcmlhbGl6ZTogX3R5cGVOYW1lIG1pc21hdGNoIC0tIGV4cGVjdGVkOiBcIiArXG4gICAgICAgICAgdGhpcy5fdHlwZU5hbWUgK1xuICAgICAgICAgIFwiIC0tIHJlY2VpdmVkOiBcIiArXG4gICAgICAgICAgZmllbGRzW1wiX3R5cGVOYW1lXCJdXG4gICAgICApXG4gICAgfVxuICAgIGlmIChcbiAgICAgIHR5cGVvZiBmaWVsZHNbXCJfdHlwZUlEXCJdICE9PSBcInVuZGVmaW5lZFwiICYmXG4gICAgICBmaWVsZHNbXCJfdHlwZUlEXCJdICE9PSBudWxsXG4gICAgKSB7XG4gICAgICBpZiAodHlwZW9mIGZpZWxkc1tcIl90eXBlSURcIl0gIT09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVJZEVycm9yKFxuICAgICAgICAgIFwiRXJyb3IgLSBTZXJpYWxpemFibGUuZGVzZXJpYWxpemU6IF90eXBlSUQgbXVzdCBiZSBhIG51bWJlciwgZm91bmQ6IFwiICtcbiAgICAgICAgICAgIHR5cGVvZiBmaWVsZHNbXCJfdHlwZUlEXCJdXG4gICAgICAgIClcbiAgICAgIH1cbiAgICAgIGlmIChmaWVsZHNbXCJfdHlwZUlEXCJdICE9PSB0aGlzLl90eXBlSUQpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVJZEVycm9yKFxuICAgICAgICAgIFwiRXJyb3IgLSBTZXJpYWxpemFibGUuZGVzZXJpYWxpemU6IF90eXBlSUQgbWlzbWF0Y2ggLS0gZXhwZWN0ZWQ6IFwiICtcbiAgICAgICAgICAgIHRoaXMuX3R5cGVJRCArXG4gICAgICAgICAgICBcIiAtLSByZWNlaXZlZDogXCIgK1xuICAgICAgICAgICAgZmllbGRzW1wiX3R5cGVJRFwiXVxuICAgICAgICApXG4gICAgICB9XG4gICAgfVxuICAgIGlmIChcbiAgICAgIHR5cGVvZiBmaWVsZHNbXCJfY29kZWNJRFwiXSAhPT0gXCJ1bmRlZmluZWRcIiAmJlxuICAgICAgZmllbGRzW1wiX2NvZGVjSURcIl0gIT09IG51bGxcbiAgICApIHtcbiAgICAgIGlmICh0eXBlb2YgZmllbGRzW1wiX2NvZGVjSURcIl0gIT09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgdGhyb3cgbmV3IENvZGVjSWRFcnJvcihcbiAgICAgICAgICBcIkVycm9yIC0gU2VyaWFsaXphYmxlLmRlc2VyaWFsaXplOiBfY29kZWNJRCBtdXN0IGJlIGEgbnVtYmVyLCBmb3VuZDogXCIgK1xuICAgICAgICAgICAgdHlwZW9mIGZpZWxkc1tcIl9jb2RlY0lEXCJdXG4gICAgICAgIClcbiAgICAgIH1cbiAgICAgIGlmIChmaWVsZHNbXCJfY29kZWNJRFwiXSAhPT0gdGhpcy5fY29kZWNJRCkge1xuICAgICAgICB0aHJvdyBuZXcgQ29kZWNJZEVycm9yKFxuICAgICAgICAgIFwiRXJyb3IgLSBTZXJpYWxpemFibGUuZGVzZXJpYWxpemU6IF9jb2RlY0lEIG1pc21hdGNoIC0tIGV4cGVjdGVkOiBcIiArXG4gICAgICAgICAgICB0aGlzLl9jb2RlY0lEICtcbiAgICAgICAgICAgIFwiIC0tIHJlY2VpdmVkOiBcIiArXG4gICAgICAgICAgICBmaWVsZHNbXCJfY29kZWNJRFwiXVxuICAgICAgICApXG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBTZXJpYWxpemF0aW9uIHtcbiAgcHJpdmF0ZSBzdGF0aWMgaW5zdGFuY2U6IFNlcmlhbGl6YXRpb25cblxuICBwcml2YXRlIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuYmludG9vbHMgPSBCaW5Ub29scy5nZXRJbnN0YW5jZSgpXG4gIH1cbiAgcHJpdmF0ZSBiaW50b29sczogQmluVG9vbHNcblxuICAvKipcbiAgICogUmV0cmlldmVzIHRoZSBTZXJpYWxpemF0aW9uIHNpbmdsZXRvbi5cbiAgICovXG4gIHN0YXRpYyBnZXRJbnN0YW5jZSgpOiBTZXJpYWxpemF0aW9uIHtcbiAgICBpZiAoIVNlcmlhbGl6YXRpb24uaW5zdGFuY2UpIHtcbiAgICAgIFNlcmlhbGl6YXRpb24uaW5zdGFuY2UgPSBuZXcgU2VyaWFsaXphdGlvbigpXG4gICAgfVxuICAgIHJldHVybiBTZXJpYWxpemF0aW9uLmluc3RhbmNlXG4gIH1cblxuICAvKipcbiAgICogQ29udmVydCB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSB0byBbW1NlcmlhbGl6ZWRUeXBlXV1cbiAgICpcbiAgICogQHBhcmFtIHZiIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9XG4gICAqIEBwYXJhbSB0eXBlIFtbU2VyaWFsaXplZFR5cGVdXVxuICAgKiBAcGFyYW0gLi4uYXJncyByZW1haW5pbmcgYXJndW1lbnRzXG4gICAqIEByZXR1cm5zIHR5cGUgb2YgW1tTZXJpYWxpemVkVHlwZV1dXG4gICAqL1xuICBidWZmZXJUb1R5cGUodmI6IEJ1ZmZlciwgdHlwZTogU2VyaWFsaXplZFR5cGUsIC4uLmFyZ3M6IGFueVtdKTogYW55IHtcbiAgICBpZiAodHlwZSA9PT0gXCJCTlwiKSB7XG4gICAgICByZXR1cm4gbmV3IEJOKHZiLnRvU3RyaW5nKFwiaGV4XCIpLCBcImhleFwiKVxuICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gXCJCdWZmZXJcIikge1xuICAgICAgaWYgKGFyZ3MubGVuZ3RoID09IDEgJiYgdHlwZW9mIGFyZ3NbMF0gPT09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgdmIgPSBCdWZmZXIuZnJvbSh2Yi50b1N0cmluZyhcImhleFwiKS5wYWRTdGFydChhcmdzWzBdICogMiwgXCIwXCIpLCBcImhleFwiKVxuICAgICAgfVxuICAgICAgcmV0dXJuIHZiXG4gICAgfSBlbHNlIGlmICh0eXBlID09PSBcImJlY2gzMlwiKSB7XG4gICAgICByZXR1cm4gdGhpcy5iaW50b29scy5hZGRyZXNzVG9TdHJpbmcoYXJnc1swXSwgYXJnc1sxXSwgdmIpXG4gICAgfSBlbHNlIGlmICh0eXBlID09PSBcIm5vZGVJRFwiKSB7XG4gICAgICByZXR1cm4gYnVmZmVyVG9Ob2RlSURTdHJpbmcodmIpXG4gICAgfSBlbHNlIGlmICh0eXBlID09PSBcInByaXZhdGVLZXlcIikge1xuICAgICAgcmV0dXJuIGJ1ZmZlclRvUHJpdmF0ZUtleVN0cmluZyh2YilcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT09IFwiY2I1OFwiKSB7XG4gICAgICByZXR1cm4gdGhpcy5iaW50b29scy5jYjU4RW5jb2RlKHZiKVxuICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gXCJiYXNlNThcIikge1xuICAgICAgcmV0dXJuIHRoaXMuYmludG9vbHMuYnVmZmVyVG9CNTgodmIpXG4gICAgfSBlbHNlIGlmICh0eXBlID09PSBcImJhc2U2NFwiKSB7XG4gICAgICByZXR1cm4gdmIudG9TdHJpbmcoXCJiYXNlNjRcIilcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT09IFwiaGV4XCIpIHtcbiAgICAgIHJldHVybiB2Yi50b1N0cmluZyhcImhleFwiKVxuICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gXCJkZWNpbWFsU3RyaW5nXCIpIHtcbiAgICAgIHJldHVybiBuZXcgQk4odmIudG9TdHJpbmcoXCJoZXhcIiksIFwiaGV4XCIpLnRvU3RyaW5nKDEwKVxuICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gXCJudW1iZXJcIikge1xuICAgICAgcmV0dXJuIG5ldyBCTih2Yi50b1N0cmluZyhcImhleFwiKSwgXCJoZXhcIikudG9OdW1iZXIoKVxuICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gXCJ1dGY4XCIpIHtcbiAgICAgIHJldHVybiB2Yi50b1N0cmluZyhcInV0ZjhcIilcbiAgICB9XG4gICAgcmV0dXJuIHVuZGVmaW5lZFxuICB9XG5cbiAgLyoqXG4gICAqIENvbnZlcnQgW1tTZXJpYWxpemVkVHlwZV1dIHRvIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9XG4gICAqXG4gICAqIEBwYXJhbSB2IHR5cGUgb2YgW1tTZXJpYWxpemVkVHlwZV1dXG4gICAqIEBwYXJhbSB0eXBlIFtbU2VyaWFsaXplZFR5cGVdXVxuICAgKiBAcGFyYW0gLi4uYXJncyByZW1haW5pbmcgYXJndW1lbnRzXG4gICAqIEByZXR1cm5zIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9XG4gICAqL1xuICB0eXBlVG9CdWZmZXIodjogYW55LCB0eXBlOiBTZXJpYWxpemVkVHlwZSwgLi4uYXJnczogYW55W10pOiBCdWZmZXIge1xuICAgIGlmICh0eXBlID09PSBcIkJOXCIpIHtcbiAgICAgIGxldCBzdHI6IHN0cmluZyA9ICh2IGFzIEJOKS50b1N0cmluZyhcImhleFwiKVxuICAgICAgaWYgKGFyZ3MubGVuZ3RoID09IDEgJiYgdHlwZW9mIGFyZ3NbMF0gPT09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgcmV0dXJuIEJ1ZmZlci5mcm9tKHN0ci5wYWRTdGFydChhcmdzWzBdICogMiwgXCIwXCIpLCBcImhleFwiKVxuICAgICAgfVxuICAgICAgcmV0dXJuIEJ1ZmZlci5mcm9tKHN0ciwgXCJoZXhcIilcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT09IFwiQnVmZmVyXCIpIHtcbiAgICAgIHJldHVybiB2XG4gICAgfSBlbHNlIGlmICh0eXBlID09PSBcImJlY2gzMlwiKSB7XG4gICAgICByZXR1cm4gdGhpcy5iaW50b29scy5zdHJpbmdUb0FkZHJlc3ModiwgLi4uYXJncylcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT09IFwibm9kZUlEXCIpIHtcbiAgICAgIHJldHVybiBOb2RlSURTdHJpbmdUb0J1ZmZlcih2KVxuICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gXCJwcml2YXRlS2V5XCIpIHtcbiAgICAgIHJldHVybiBwcml2YXRlS2V5U3RyaW5nVG9CdWZmZXIodilcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT09IFwiY2I1OFwiKSB7XG4gICAgICByZXR1cm4gdGhpcy5iaW50b29scy5jYjU4RGVjb2RlKHYpXG4gICAgfSBlbHNlIGlmICh0eXBlID09PSBcImJhc2U1OFwiKSB7XG4gICAgICByZXR1cm4gdGhpcy5iaW50b29scy5iNThUb0J1ZmZlcih2KVxuICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gXCJiYXNlNjRcIikge1xuICAgICAgcmV0dXJuIEJ1ZmZlci5mcm9tKHYgYXMgc3RyaW5nLCBcImJhc2U2NFwiKVxuICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gXCJoZXhcIikge1xuICAgICAgaWYgKCh2IGFzIHN0cmluZykuc3RhcnRzV2l0aChcIjB4XCIpKSB7XG4gICAgICAgIHYgPSAodiBhcyBzdHJpbmcpLnNsaWNlKDIpXG4gICAgICB9XG4gICAgICByZXR1cm4gQnVmZmVyLmZyb20odiBhcyBzdHJpbmcsIFwiaGV4XCIpXG4gICAgfSBlbHNlIGlmICh0eXBlID09PSBcImRlY2ltYWxTdHJpbmdcIikge1xuICAgICAgbGV0IHN0cjogc3RyaW5nID0gbmV3IEJOKHYgYXMgc3RyaW5nLCAxMCkudG9TdHJpbmcoXCJoZXhcIilcbiAgICAgIGlmIChhcmdzLmxlbmd0aCA9PSAxICYmIHR5cGVvZiBhcmdzWzBdID09PSBcIm51bWJlclwiKSB7XG4gICAgICAgIHJldHVybiBCdWZmZXIuZnJvbShzdHIucGFkU3RhcnQoYXJnc1swXSAqIDIsIFwiMFwiKSwgXCJoZXhcIilcbiAgICAgIH1cbiAgICAgIHJldHVybiBCdWZmZXIuZnJvbShzdHIsIFwiaGV4XCIpXG4gICAgfSBlbHNlIGlmICh0eXBlID09PSBcIm51bWJlclwiKSB7XG4gICAgICBsZXQgc3RyOiBzdHJpbmcgPSBuZXcgQk4odiwgMTApLnRvU3RyaW5nKFwiaGV4XCIpXG4gICAgICBpZiAoYXJncy5sZW5ndGggPT0gMSAmJiB0eXBlb2YgYXJnc1swXSA9PT0gXCJudW1iZXJcIikge1xuICAgICAgICByZXR1cm4gQnVmZmVyLmZyb20oc3RyLnBhZFN0YXJ0KGFyZ3NbMF0gKiAyLCBcIjBcIiksIFwiaGV4XCIpXG4gICAgICB9XG4gICAgICByZXR1cm4gQnVmZmVyLmZyb20oc3RyLCBcImhleFwiKVxuICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gXCJ1dGY4XCIpIHtcbiAgICAgIGlmIChhcmdzLmxlbmd0aCA9PSAxICYmIHR5cGVvZiBhcmdzWzBdID09PSBcIm51bWJlclwiKSB7XG4gICAgICAgIGxldCBiOiBCdWZmZXIgPSBCdWZmZXIuYWxsb2MoYXJnc1swXSlcbiAgICAgICAgYi53cml0ZSh2KVxuICAgICAgICByZXR1cm4gYlxuICAgICAgfVxuICAgICAgcmV0dXJuIEJ1ZmZlci5mcm9tKHYsIFwidXRmOFwiKVxuICAgIH1cbiAgICByZXR1cm4gdW5kZWZpbmVkXG4gIH1cblxuICAvKipcbiAgICogQ29udmVydCB2YWx1ZSB0byB0eXBlIG9mIFtbU2VyaWFsaXplZFR5cGVdXSBvciBbW1NlcmlhbGl6ZWRFbmNvZGluZ11dXG4gICAqXG4gICAqIEBwYXJhbSB2YWx1ZVxuICAgKiBAcGFyYW0gZW5jb2RpbmcgW1tTZXJpYWxpemVkRW5jb2RpbmddXVxuICAgKiBAcGFyYW0gaW50eXBlIFtbU2VyaWFsaXplZFR5cGVdXVxuICAgKiBAcGFyYW0gb3V0dHlwZSBbW1NlcmlhbGl6ZWRUeXBlXV1cbiAgICogQHBhcmFtIC4uLmFyZ3MgcmVtYWluaW5nIGFyZ3VtZW50c1xuICAgKiBAcmV0dXJucyB0eXBlIG9mIFtbU2VyaWFsaXplZFR5cGVdXSBvciBbW1NlcmlhbGl6ZWRFbmNvZGluZ11dXG4gICAqL1xuICBlbmNvZGVyKFxuICAgIHZhbHVlOiBhbnksXG4gICAgZW5jb2Rpbmc6IFNlcmlhbGl6ZWRFbmNvZGluZyxcbiAgICBpbnR5cGU6IFNlcmlhbGl6ZWRUeXBlLFxuICAgIG91dHR5cGU6IFNlcmlhbGl6ZWRUeXBlLFxuICAgIC4uLmFyZ3M6IGFueVtdXG4gICk6IGFueSB7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgdGhyb3cgbmV3IFVua25vd25UeXBlRXJyb3IoXG4gICAgICAgIFwiRXJyb3IgLSBTZXJpYWxpemFibGUuZW5jb2RlcjogdmFsdWUgcGFzc2VkIGlzIHVuZGVmaW5lZFwiXG4gICAgICApXG4gICAgfVxuICAgIGlmIChlbmNvZGluZyAhPT0gXCJkaXNwbGF5XCIpIHtcbiAgICAgIG91dHR5cGUgPSBlbmNvZGluZ1xuICAgIH1cbiAgICBjb25zdCB2YjogQnVmZmVyID0gdGhpcy50eXBlVG9CdWZmZXIodmFsdWUsIGludHlwZSwgLi4uYXJncylcbiAgICByZXR1cm4gdGhpcy5idWZmZXJUb1R5cGUodmIsIG91dHR5cGUsIC4uLmFyZ3MpXG4gIH1cblxuICAvKipcbiAgICogQ29udmVydCB2YWx1ZSB0byB0eXBlIG9mIFtbU2VyaWFsaXplZFR5cGVdXSBvciBbW1NlcmlhbGl6ZWRFbmNvZGluZ11dXG4gICAqXG4gICAqIEBwYXJhbSB2YWx1ZVxuICAgKiBAcGFyYW0gZW5jb2RpbmcgW1tTZXJpYWxpemVkRW5jb2RpbmddXVxuICAgKiBAcGFyYW0gaW50eXBlIFtbU2VyaWFsaXplZFR5cGVdXVxuICAgKiBAcGFyYW0gb3V0dHlwZSBbW1NlcmlhbGl6ZWRUeXBlXV1cbiAgICogQHBhcmFtIC4uLmFyZ3MgcmVtYWluaW5nIGFyZ3VtZW50c1xuICAgKiBAcmV0dXJucyB0eXBlIG9mIFtbU2VyaWFsaXplZFR5cGVdXSBvciBbW1NlcmlhbGl6ZWRFbmNvZGluZ11dXG4gICAqL1xuICBkZWNvZGVyKFxuICAgIHZhbHVlOiBzdHJpbmcsXG4gICAgZW5jb2Rpbmc6IFNlcmlhbGl6ZWRFbmNvZGluZyxcbiAgICBpbnR5cGU6IFNlcmlhbGl6ZWRUeXBlLFxuICAgIG91dHR5cGU6IFNlcmlhbGl6ZWRUeXBlLFxuICAgIC4uLmFyZ3M6IGFueVtdXG4gICk6IGFueSB7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgdGhyb3cgbmV3IFVua25vd25UeXBlRXJyb3IoXG4gICAgICAgIFwiRXJyb3IgLSBTZXJpYWxpemFibGUuZGVjb2RlcjogdmFsdWUgcGFzc2VkIGlzIHVuZGVmaW5lZFwiXG4gICAgICApXG4gICAgfVxuICAgIGlmIChlbmNvZGluZyAhPT0gXCJkaXNwbGF5XCIpIHtcbiAgICAgIGludHlwZSA9IGVuY29kaW5nXG4gICAgfVxuICAgIGNvbnN0IHZiOiBCdWZmZXIgPSB0aGlzLnR5cGVUb0J1ZmZlcih2YWx1ZSwgaW50eXBlLCAuLi5hcmdzKVxuICAgIHJldHVybiB0aGlzLmJ1ZmZlclRvVHlwZSh2Yiwgb3V0dHlwZSwgLi4uYXJncylcbiAgfVxuXG4gIHNlcmlhbGl6ZShcbiAgICBzZXJpYWxpemU6IFNlcmlhbGl6YWJsZSxcbiAgICB2bTogc3RyaW5nLFxuICAgIGVuY29kaW5nOiBTZXJpYWxpemVkRW5jb2RpbmcgPSBcImRpc3BsYXlcIixcbiAgICBub3Rlczogc3RyaW5nID0gdW5kZWZpbmVkXG4gICk6IFNlcmlhbGl6ZWQge1xuICAgIGlmICh0eXBlb2Ygbm90ZXMgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIG5vdGVzID0gc2VyaWFsaXplLmdldFR5cGVOYW1lKClcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgIHZtLFxuICAgICAgZW5jb2RpbmcsXG4gICAgICB2ZXJzaW9uOiBTRVJJQUxJWkFUSU9OVkVSU0lPTixcbiAgICAgIG5vdGVzLFxuICAgICAgZmllbGRzOiBzZXJpYWxpemUuc2VyaWFsaXplKGVuY29kaW5nKVxuICAgIH1cbiAgfVxuXG4gIGRlc2VyaWFsaXplKGlucHV0OiBTZXJpYWxpemVkLCBvdXRwdXQ6IFNlcmlhbGl6YWJsZSkge1xuICAgIG91dHB1dC5kZXNlcmlhbGl6ZShpbnB1dC5maWVsZHMsIGlucHV0LmVuY29kaW5nKVxuICB9XG59XG4iXX0=
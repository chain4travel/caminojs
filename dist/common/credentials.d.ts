/**
 * @packageDocumentation
 * @module Common-Signature
 */
import { NBytes } from "./nbytes";
import { Buffer } from "buffer/";
import { Serializable, SerializedEncoding } from "../utils/serialization";
/**
 * Type representing a [[Signature]] index used in [[Input]]
 */
export declare class SigIdx extends NBytes {
    protected _typeName: string;
    protected _typeID: any;
    serialize(encoding?: SerializedEncoding): object;
    deserialize(fields: object, encoding?: SerializedEncoding): void;
    protected source: Buffer;
    protected bytes: Buffer;
    protected bsize: number;
    /**
     * Sets the source address for the signature
     */
    setSource: (address: Buffer) => void;
    /**
     * Retrieves the source address for the signature
     */
    getSource: () => Buffer;
    /**
     * Retrieves the index buffer for the signature
     */
    getBytes: () => Buffer;
    clone(): this;
    create(): this;
    /**
     * Type representing a [[Signature]] index used in [[Input]]
     */
    constructor(addressIdx?: number, address?: Buffer);
}
/**
 * Signature for a [[Tx]]
 */
export declare class Signature extends NBytes {
    protected _typeName: string;
    protected _typeID: any;
    protected bytes: Buffer;
    protected bsize: number;
    clone(): this;
    create(): this;
    /**
     * Signature for a [[Tx]]
     */
    constructor();
}
export declare abstract class Credential extends Serializable {
    protected _typeName: string;
    protected _typeID: any;
    serialize(encoding?: SerializedEncoding): object;
    deserialize(fields: object, encoding?: SerializedEncoding): void;
    protected sigArray: Signature[];
    getCredentialID(): number;
    /**
     * Set the codecID
     *
     * @param codecID The codecID to set
     */
    setCodecID(codecID: number): void;
    /**
     * Adds a signature to the credentials and returns the index off the added signature.
     */
    addSignature: (sig: Signature) => number;
    fromBuffer(bytes: Buffer, offset?: number): number;
    toBuffer(): Buffer;
    abstract clone(): this;
    abstract create(...args: any[]): this;
    abstract select(id: number, ...args: any[]): Credential;
    constructor(sigarray?: Signature[]);
}
export declare class SECPMultisigCredential extends Credential {
    protected _typeName: string;
    protected _typeID: any;
    protected sigIdxs: SigIdx[];
    /**
     * Adds a SignatureIndex to the credentials.
     */
    addSSignatureIndex: (sigIdx: SigIdx) => void;
    clone(): this;
    create(...args: any[]): this;
    select(id: number, ...args: any[]): Credential;
    fromBuffer(bytes: Buffer, offset?: number): number;
    toBuffer(): Buffer;
    constructor(typeID: number, sigIdxs?: SigIdx[], sigarray?: Signature[]);
}
//# sourceMappingURL=credentials.d.ts.map
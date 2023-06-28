/**
 * @packageDocumentation
 * @module API-PlatformVM-ProofOfPossession
 */
import { Buffer } from "buffer/";
export declare class ProofOfPossession {
    protected _typeName: string;
    protected _typeID: any;
    protected publicKey: Buffer;
    protected signature: Buffer;
    /**
     * Returns the {@link https://github.com/feross/buffer|Buffer} representation of the publicKey
     */
    getPublicKey(): Buffer;
    /**
     * Returns the {@link https://github.com/feross/buffer|Buffer} representation of the signature
     */
    getSignature(): Buffer;
    /**
     * Takes a {@link https://github.com/feross/buffer|Buffer} containing an [[ProofOfPossession]], parses it, populates the class, and returns the length of the [[ProofOfPossession]] in bytes.
     *
     * @param bytes A {@link https://github.com/feross/buffer|Buffer} containing a raw [[ProofOfPossession]]
     *
     * @returns The length of the raw [[ProofOfPossession]]
     *
     * @remarks assume not-checksummed
     */
    fromBuffer(bytes: Buffer, offset?: number): number;
    /**
     * Returns a {@link https://github.com/feross/buffer|Buffer} representation of the [[ProofOfPossession]]
     */
    toBuffer(): Buffer;
    /**
     * Class representing a Proof of Possession
     *
     * @param publicKey {@link https://github.com/feross/buffer|Buffer} for the public key
     * @param signature {@link https://github.com/feross/buffer|Buffer} for the signature
     */
    constructor(publicKey?: Buffer, signature?: Buffer);
}
//# sourceMappingURL=proofOfPossession.d.ts.map
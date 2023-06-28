/**
 * @packageDocumentation
 * @module API-PlatformVM-MultisigAliasTx
 */
import { Buffer } from "buffer/";
import { ParseableOutput, TransferableOutput } from "./outputs";
import { TransferableInput } from "./inputs";
import { Credential, SigIdx } from "../../common";
import { BaseTx } from "./basetx";
import { SerializedEncoding } from "../../utils/serialization";
import { SubnetAuth } from ".";
import { KeyChain } from "./keychain";
/**
 * Class representing a Multisig Alias object.
 */
export declare class MultisigAlias {
    protected id: Buffer;
    protected memo: Buffer;
    protected owners: ParseableOutput;
    constructor(id?: Buffer, memo?: Buffer, owners?: ParseableOutput);
    getMemo(): Buffer;
    deserialize(fields: object, encoding?: SerializedEncoding): this;
    serialize(encoding?: SerializedEncoding): object;
    fromBuffer(bytes: Buffer, offset?: number): number;
    toBuffer(): Buffer;
}
/**
 * Class representing an unsigned MultisigAlias transaction.
 */
export declare class MultisigAliasTx extends BaseTx {
    protected _typeName: string;
    protected _typeID: number;
    protected multisigAlias: MultisigAlias;
    protected auth: SubnetAuth;
    protected sigCount: Buffer;
    protected sigIdxs: SigIdx[];
    deserialize(fields: object, encoding?: SerializedEncoding): void;
    serialize(encoding?: SerializedEncoding): object;
    /**
     * Returns the id of the [[MultisigAliasTx]]
     */
    getTxType(): number;
    /**
     * Returns the MultisigAlias definition.
     */
    getMultisigAlias(): MultisigAlias;
    /**
     * Returns the Auth that allows existing owners to change an alias.
     */
    getAuth(): SubnetAuth;
    /**
     * Takes a {@link https://github.com/feross/buffer|Buffer} containing a raw [[MultisigAliasTx]], parses it, populates the class, and returns the length of the [[MultisigAliasTx]] in bytes.
     *
     * @param bytes A {@link https://github.com/feross/buffer|Buffer} containing a raw [[MultisigAliasTx]]
     * @param offset The offset to start reading the bytes from. Default: 0
     *
     * @returns The length of the raw [[MultisigAliasTx]]
     *
     * @remarks assume not-checksummed
     */
    fromBuffer(bytes: Buffer, offset?: number): number;
    /**
     * Returns a {@link https://github.com/feross/buffer|Buffer} representation of the [[MultisigAliasTx]].
     */
    toBuffer(): Buffer;
    clone(): this;
    create(...args: any[]): this;
    /**
     * Creates and adds a [[SigIdx]] to the [[MultisigAliasTx]].
     *
     * @param addressIdx The index of the address to reference in the signatures
     * @param address The address of the source of the signature
     */
    addSignatureIdx(addressIdx: number, address: Buffer): void;
    /**
     * Returns the array of [[SigIdx]] for this [[TX]]
     */
    getSigIdxs(): SigIdx[];
    getCredentialID(): number;
    /**
     * Takes the bytes of an [[UnsignedTx]] and returns an array of [[Credential]]s
     *
     * @param msg A Buffer for the [[UnsignedTx]]
     * @param kc An [[KeyChain]] used in signing
     *
     * @returns An array of [[Credential]]s
     */
    sign(msg: Buffer, kc: KeyChain): Credential[];
    /**
     * Class representing a MultisigAlias transaction.
     *
     * @param networkID Optional networkID, [[DefaultNetworkID]]
     * @param blockchainID Optional blockchainID, default Buffer.alloc(32, 16)
     * @param outs Optional array of the [[TransferableOutput]]s
     * @param ins Optional array of the [[TransferableInput]]s
     * @param memo Optional {@link https://github.com/feross/buffer|Buffer} for the memo field
     * @param multisigAlias Multisig alias definition. MultisigAlias.ID must be empty if it's the new alias.
     * @param auth Auth that allows existing owners to change an alias.
     */
    constructor(networkID?: number, blockchainID?: Buffer, outs?: TransferableOutput[], ins?: TransferableInput[], memo?: Buffer, multisigAlias?: MultisigAlias, auth?: SubnetAuth);
}
//# sourceMappingURL=multisigaliastx.d.ts.map
/**
 * @packageDocumentation
 * @module Common-MultisigKeyChain
 */
import { Buffer } from "buffer/";
import { Credential, OutputOwners, SigIdx } from ".";
import { StandardKeyChain, StandardKeyPair } from "./keychain";
export declare class SignatureError extends Error {
}
/**
 * Class for representing a generic multi signature key.
 */
export declare class MultisigKeyPair extends StandardKeyPair {
    protected keyChain: MultisigKeyChain;
    generateKey(): void;
    importKey(_: Buffer): boolean;
    sign(_: Buffer): Buffer;
    recover(msg: Buffer, sig: Buffer): Buffer;
    verify(msg: Buffer, sig: Buffer): boolean;
    getAddress(): Buffer;
    getAddressString(): string;
    create(...args: any[]): this;
    clone(): this;
    getPrivateKeyString(): string;
    getPublicKeyString(): string;
    constructor(keyChain: MultisigKeyChain, address: Buffer, signature: Buffer);
}
/**
 * Class for representing a multisig keyChain in Camino.
 *
 * @typeparam MultisigKeyChain Class extending [[StandardKeyChain]]
 */
export declare class MultisigKeyChain extends StandardKeyChain<MultisigKeyPair> {
    protected hrp: string;
    protected chainID: string;
    protected signedBytes: Buffer;
    protected txOwners: OutputOwners[];
    protected msigAliases: Map<string, OutputOwners>;
    protected sigIdxs: SigIdx[][];
    protected credTypeID: number;
    getHRP(): string;
    getChainID(): string;
    create(...args: any[]): this;
    clone(): this;
    union(kc: this): this;
    buildSignatureIndices(): void;
    getCredentials(): Credential[];
    protected _traverseOwner(owner: OutputOwners): void;
    constructor(hrp: string, chainID: string, signedBytes: Buffer, credTypeID: number, txOwners?: OutputOwners[], msigAliases?: Map<string, OutputOwners>);
}
//# sourceMappingURL=multisigkeychain.d.ts.map
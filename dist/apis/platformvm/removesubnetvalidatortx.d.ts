/**
 * @packageDocumentation
 * @module API-PlatformVM-RemoveSubnetValidatorTx
 */
import { Buffer } from "buffer/";
import { TransferableOutput } from "./outputs";
import { TransferableInput } from "./inputs";
import { Credential, SigIdx } from "../../common/credentials";
import { BaseTx } from "./basetx";
import { SubnetAuth } from ".";
import { KeyChain } from "./keychain";
/**
 * Class representing an unsigned RemoveSubnetValidatorTx transaction.
 */
export declare class RemoveSubnetValidatorTx extends BaseTx {
    protected _typeName: string;
    protected _typeID: number;
    protected nodeID: Buffer;
    protected subnetID: Buffer;
    protected subnetAuth: SubnetAuth;
    protected sigCount: Buffer;
    protected sigIdxs: SigIdx[];
    /**
     * Returns the id of the [[RemoveSubnetValidatorTx]]
     */
    getTxType(): number;
    /**
     * Returns a {@link https://github.com/feross/buffer|Buffer} for the nodeID.
     */
    getNodeID(): Buffer;
    /**
     * Returns a string for the nodeID.
     */
    getNodeIDString(): string;
    /**
     * Returns the subnetID as a string
     */
    getSubnetID(): string;
    /**
     * Returns the subnetAuth
     */
    getSubnetAuth(): SubnetAuth;
    /**
     * Takes a {@link https://github.com/feross/buffer|Buffer} containing an [[RemoveSubnetValidatorTx]], parses it, populates the class, and returns the length of the [[RemoveSubnetValidatorTx]] in bytes.
     *
     * @param bytes A {@link https://github.com/feross/buffer|Buffer} containing a raw [[RemoveSubnetValidatorTx]]
     *
     * @returns The length of the raw [[RemoveSubnetValidatorTx]]
     *
     * @remarks assume not-checksummed
     */
    fromBuffer(bytes: Buffer, offset?: number): number;
    /**
     * Returns a {@link https://github.com/feross/buffer|Buffer} representation of the [[RemoveSubnetValidatorTx]].
     */
    toBuffer(): Buffer;
    clone(): this;
    create(...args: any[]): this;
    /**
     * Creates and adds a [[SigIdx]] to the [[RemoveSubnetValidatorTx]].
     *
     * @param addressIdx The index of the address to reference in the signatures
     * @param address The address of the source of the signature
     */
    addSignatureIdx(addressIdx: number, address: Buffer): void;
    /**
     * Returns the array of [[SigIdx]] for this [[Input]]
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
     * Class representing an unsigned RemoveSubnetValidatorTx transaction.
     *
     * @param networkID Optional networkID, [[DefaultNetworkID]]
     * @param blockchainID Optional blockchainID, default Buffer.alloc(32, 16)
     * @param outs Optional array of the [[TransferableOutput]]s
     * @param ins Optional array of the [[TransferableInput]]s
     * @param memo Optional {@link https://github.com/feross/buffer|Buffer} for the memo field
     * @param nodeID Optional. The node ID of the validator being added.
     * @param subnetID Optional. ID of the subnet this validator is validating
     */
    constructor(networkID?: number, blockchainID?: Buffer, outs?: TransferableOutput[], ins?: TransferableInput[], memo?: Buffer, nodeID?: Buffer, subnetID?: string | Buffer);
}
//# sourceMappingURL=removesubnetvalidatortx.d.ts.map
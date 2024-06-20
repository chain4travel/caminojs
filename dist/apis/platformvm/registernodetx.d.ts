/**
 * @packageDocumentation
 * @module API-PlatformVM-RegisterNodeTx
 */
import { Buffer } from "buffer/";
import { TransferableOutput } from "./outputs";
import { TransferableInput } from "./inputs";
import { Credential, SigIdx } from "../../common";
import { BaseTx } from "./basetx";
import { SerializedEncoding } from "../../utils/serialization";
import { SubnetAuth } from ".";
import { KeyChain } from "./keychain";
/**
 * Class representing an unsigned DepositTx transaction.
 */
export declare class RegisterNodeTx extends BaseTx {
    protected _typeName: string;
    protected _typeID: number;
    serialize(encoding?: SerializedEncoding): object;
    deserialize(fields: object, encoding?: SerializedEncoding): void;
    protected oldNodeID: Buffer;
    protected newNodeID: Buffer;
    protected consortiumMemberAuth: SubnetAuth;
    protected consortiumMemberAddress: Buffer;
    protected sigCount: Buffer;
    protected sigIdxs: SigIdx[];
    /**
     * Returns the id of the [[RegisterNodeTx]]
     */
    getTxType(): number;
    getOldNodeID(): Buffer;
    getNewNodeID(): Buffer;
    getConsortiumMemberAddress(): Buffer;
    /**
     * Returns the subnetAuth
     */
    getConsortiumMemberAuth(): SubnetAuth;
    /**
     * Takes a {@link https://github.com/feross/buffer|Buffer} containing a [[RegisterNodeTx]], parses it, populates the class, and returns the length of the [[RegisterNodeTx]] in bytes.
     *
     * @param bytes A {@link https://github.com/feross/buffer|Buffer} containing a raw [[RegisterNodeTx]]
     *
     * @returns The length of the raw [[RegisterNodeTx]]
     *
     * @remarks assume not-checksummed
     */
    fromBuffer(bytes: Buffer, offset?: number): number;
    /**
     * Returns a {@link https://github.com/feross/buffer|Buffer} representation of the [[RegisterNodeTx]].
     */
    toBuffer(): Buffer;
    clone(): this;
    create(...args: any[]): this;
    /**
     * Creates and adds a [[SigIdx]] to the [[AddRegisterNodeTx]].
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
     * Class representing an unsigned RegisterNode transaction.
     *
     * @param networkID Optional networkID, [[DefaultNetworkID]]
     * @param blockchainID Optional blockchainID, default Buffer.alloc(32, 16)
     * @param outs Optional array of the [[TransferableOutput]]s
     * @param ins Optional array of the [[TransferableInput]]s
     * @param memo Optional {@link https://github.com/feross/buffer|Buffer} for the memo field
     * @param oldNodeID Optional ID of the existing NodeID to replace or remove.
     * @param newNodeID Optional ID of the newNodID to register address.
     * @param address The consortiumMemberAddress, single or multi-sig.
     */
    constructor(networkID?: number, blockchainID?: Buffer, outs?: TransferableOutput[], ins?: TransferableInput[], memo?: Buffer, oldNodeID?: Buffer, newNodeID?: Buffer, address?: Buffer);
}
//# sourceMappingURL=registernodetx.d.ts.map
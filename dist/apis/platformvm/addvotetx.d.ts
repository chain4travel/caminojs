/**
 * @packageDocumentation
 * @module API-PlatformVM-AddVoteTx
 */
import { Buffer } from "buffer/";
import { Credential, UpgradeVersionID } from "../../common";
import { SerializedEncoding } from "../../utils/serialization";
import { BaseTx } from "./basetx";
import { TransferableInput } from "./inputs";
import { KeyChain } from "./keychain";
import { TransferableOutput } from "./outputs";
import { SubnetAuth } from "./subnetauth";
export declare class SimpleVote {
    private _typeID;
    private optionIndex;
    constructor(optionIndex: Buffer);
    serialize(encoding?: SerializedEncoding): object;
    deserialize(fields: object, encoding?: SerializedEncoding): this;
    getTypeId(): number;
    getOptionIndex(): Buffer;
}
export declare class VoteWrapper {
    private vote;
    constructor();
    serialize(encoding?: SerializedEncoding): object;
    deserialize(fields: object, encoding?: SerializedEncoding): this;
    getVote(): SimpleVote;
    addVote(optionIndex: number): void;
    fromBuffer(bytes: Buffer, offset?: number): number;
    toBuffer(): Buffer;
}
/**
 * Class representing an unsigned AddVoteTx transaction.
 */
export declare class AddVoteTx extends BaseTx {
    protected _typeName: string;
    protected _typeID: number;
    protected upgradeVersionID: UpgradeVersionID;
    protected proposalID: Buffer;
    protected votePayload: VoteWrapper;
    protected voterAddress: Buffer;
    protected voterAuth: SubnetAuth;
    serialize(encoding?: SerializedEncoding): object;
    deserialize(fields: object, encoding?: SerializedEncoding): void;
    /**
     * Returns the id of the [[AddVoteTx]]
     */
    getTxType(): number;
    /**
     * Returns the proposal ID
     */
    getProposalID(): Buffer;
    /**
     * Returns the vote payload
     */
    getVotePayload(): VoteWrapper;
    /**
     * Returns the voter address
     */
    getVoterAddress(): Buffer;
    /**
     * Returns the voter auth
     */
    getVoterAuth(): SubnetAuth;
    /**
     * Takes a {@link https://github.com/feross/buffer|Buffer} containing an [[AddVoteTx]], parses it, populates the class, and returns the length of the [[AddVoteTx]] in bytes.
     *
     * @param bytes A {@link https://github.com/feross/buffer|Buffer} containing a raw [[AddVoteTx]]
     *
     * @returns The length of the raw [[AddVoteTx]]
     *
     * @remarks assume not-checksummed
     */
    fromBuffer(bytes: Buffer, offset?: number): number;
    /**
     * Returns a {@link https://github.com/feross/buffer|Buffer} representation of the [[AddVoteTx]].
     */
    toBuffer(): Buffer;
    /**
     * Takes the bytes of an [[UnsignedTx]] and returns an array of [[Credential]]s
     *
     * @param msg A Buffer for the [[UnsignedTx]]
     * @param kc A [[KeyChain]] used in signing
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
     * @param voteOptionIndex the index of vote option.
     * @param voterAddress the creater(proposer) address.
     * @param voterAuth auth that allows to create a proposal.
     */
    constructor(version?: number, networkID?: number, blockchainID?: Buffer, outs?: TransferableOutput[], ins?: TransferableInput[], memo?: Buffer, proposalID?: Buffer, voteOptionIndex?: number, voterAddress?: string | Buffer, voterAuth?: SubnetAuth);
}
//# sourceMappingURL=addvotetx.d.ts.map
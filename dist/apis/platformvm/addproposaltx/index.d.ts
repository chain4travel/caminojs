/**
 * @packageDocumentation
 * @module API-PlatformVM-AddProposalTx
 */
import { Buffer } from "buffer/";
import { Credential, UpgradeVersionID } from "../../../common";
import { SerializedEncoding } from "../../../utils/serialization";
import { BaseTx } from "../basetx";
import { TransferableInput } from "../inputs";
import { KeyChain } from "../keychain";
import { TransferableOutput } from "../outputs";
import { SubnetAuth } from "../subnetauth";
import { AddMemberProposal } from "./addmemberproposal";
import { AdminProposal } from "./adminproposal";
import { BaseFeeProposal } from "./basefeeproposal";
import { ExcludeMemberProposal } from "./excludememberproposal";
import { GeneralProposal } from "./generalproposal";
export { AddMemberProposal, AdminProposal, BaseFeeProposal, ExcludeMemberProposal, GeneralProposal };
export declare const DEFAULT_CAMINOGO_CODEC_VERSION = 0;
export type Proposal = BaseFeeProposal | AddMemberProposal | ExcludeMemberProposal | AdminProposal | GeneralProposal;
export declare class ProposalWrapper {
    private _typeID;
    private proposal;
    constructor(proposal?: Proposal);
    serialize(encoding?: SerializedEncoding): object;
    deserialize(fields: object, encoding?: SerializedEncoding): this;
    getProposalType(): number;
    getProposal(): Proposal;
    fromBuffer(bytes: Buffer, offset?: number): number;
    toBuffer(): Buffer;
}
/**
 * Class representing an unsigned AddProposalTx transaction.
 */
export declare class AddProposalTx extends BaseTx {
    protected _typeName: string;
    protected _typeID: number;
    serialize(encoding?: SerializedEncoding): object;
    deserialize(fields: object, encoding?: SerializedEncoding): void;
    protected upgradeVersionID: UpgradeVersionID;
    protected proposalPayload: ProposalWrapper;
    protected proposerAddress: Buffer;
    protected proposerAuth: SubnetAuth;
    protected proposalDescription: Buffer;
    /**
     * Returns the id of the [[AddProposalTx]]
     */
    getTxType(): number;
    /**
     * Returns the proposal payload
     */
    getProposalPayload(): ProposalWrapper;
    /**
     * Returns the proposer address
     */
    getProposerAddress(): Buffer;
    /**
     * Returns the proposer auth
     */
    getProposerAuth(): SubnetAuth;
    /**
     * Returns the proposal description
     */
    getProposalDescription(): Buffer;
    /**
     * Takes a {@link https://github.com/feross/buffer|Buffer} containing an [[AddProposalTx]], parses it, populates the class, and returns the length of the [[AddProposalTx]] in bytes.
     *
     * @param bytes A {@link https://github.com/feross/buffer|Buffer} containing a raw [[AddProposalTx]]
     *
     * @returns The length of the raw [[AddProposalTx]]
     *
     * @remarks assume not-checksummed
     */
    fromBuffer(bytes: Buffer, offset?: number): number;
    /**
     * Returns a {@link https://github.com/feross/buffer|Buffer} representation of the [[AddProposalTx]].
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
     * @param proposalDescription Optional contains arbitrary bytes, up to 256 bytes
     * @param proposal the proposal payload to create.
     * @param proposerAddress the creater(proposer) address.
     * @param proposerAuth auth that allows to create a proposal.
     */
    constructor(version?: number, networkID?: number, blockchainID?: Buffer, outs?: TransferableOutput[], ins?: TransferableInput[], memo?: Buffer, proposalDescription?: Buffer, proposal?: Proposal, proposerAddress?: string | Buffer, proposerAuth?: SubnetAuth);
}
//# sourceMappingURL=index.d.ts.map
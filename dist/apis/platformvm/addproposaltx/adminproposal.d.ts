import { Buffer } from "buffer/";
import { SerializedEncoding } from "../../../utils/serialization";
import { EssentialProposal } from "./essentialproposal";
import { AddMemberProposal } from "./addmemberproposal";
import { ExcludeMemberProposal } from "./excludememberproposal";
type AllowedProposal = AddMemberProposal | ExcludeMemberProposal;
export declare class AdminProposal extends EssentialProposal {
    private readonly _typeID;
    private _optionIndex;
    private _proposal;
    constructor(optionIndex?: Buffer, proposal?: AllowedProposal);
    serialize(encoding?: SerializedEncoding): object;
    deserialize(fields: object, encoding?: SerializedEncoding): this;
    getTypeID(): number;
    getOptionIndex(): Buffer;
    getProposal(): AllowedProposal;
    fromBuffer(bytes: Buffer, offset?: number): number;
    /**
     * Returns a {@link https://github.com/feross/buffer|Buffer} representation of the [[BaseProposal]].
     */
    toBuffer(): Buffer;
}
export {};
//# sourceMappingURL=adminproposal.d.ts.map
import { Buffer } from "buffer/";
import { SerializedEncoding } from "../../../utils/serialization";
import { EssentialProposal } from "./essentialproposal";
export declare class AddMemberProposal extends EssentialProposal {
    private readonly _typeID;
    serialize(encoding?: SerializedEncoding): object;
    deserialize(fields: object, encoding?: SerializedEncoding): this;
    fromBuffer(bytes: Buffer, offset?: number): number;
    /**
     * Returns a {@link https://github.com/feross/buffer|Buffer} representation of the [[BaseProposal]].
     */
    toBuffer(): Buffer;
    constructor(start?: number, end?: number, applicantAddress?: string | Buffer);
    protected applicantAddress: Buffer;
    getTypeID(): number;
    getApplicantAddress(): Buffer;
}
//# sourceMappingURL=addmemberproposal.d.ts.map
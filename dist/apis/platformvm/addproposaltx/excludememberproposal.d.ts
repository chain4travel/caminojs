import { Buffer } from "buffer/";
import { SerializedEncoding } from "../../../utils/serialization";
import { EssentialProposal } from "./essentialproposal";
export declare class ExcludeMemberProposal extends EssentialProposal {
    private readonly _typeID;
    serialize(encoding?: SerializedEncoding): object;
    deserialize(fields: object, encoding?: SerializedEncoding): this;
    fromBuffer(bytes: Buffer, offset?: number): number;
    /**
     * Returns a {@link https://github.com/feross/buffer|Buffer} representation of the [[BaseProposal]].
     */
    toBuffer(): Buffer;
    constructor(start?: number, end?: number, memberAddress?: string | Buffer);
    protected memberAddress: Buffer;
    getTypeID(): number;
    getMemberAddress(): Buffer;
}
//# sourceMappingURL=excludememberproposal.d.ts.map
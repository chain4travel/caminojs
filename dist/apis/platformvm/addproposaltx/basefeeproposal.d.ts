import { EssentialProposal } from "./essentialproposal";
export declare class BaseFeeProposal extends EssentialProposal {
    private readonly _typeID;
    constructor(start?: number, end?: number);
    getTypeID(): number;
    addBaseFeeOption(option: number): number;
}
//# sourceMappingURL=basefeeproposal.d.ts.map
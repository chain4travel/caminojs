import { BaseTx } from "./basetx";
/**
 * Class representing an unsigned UnlockDepositTx transaction.
 */
export declare class UnlockDepositTx extends BaseTx {
    protected _typeName: string;
    protected _typeID: number;
    /**
     * Returns the id of the [[UnlockDepositTx]]
     */
    getTxType(): number;
    clone(): this;
    create(...args: any[]): this;
}
//# sourceMappingURL=unlockdeposittx.d.ts.map
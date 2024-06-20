"use strict";
/**
 * @packageDocumentation
 * @module Common-AssetAmount
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StandardAssetAmountDestination = exports.AssetAmount = void 0;
const buffer_1 = require("buffer/");
const bn_js_1 = __importDefault(require("bn.js"));
const errors_1 = require("../utils/errors");
/**
 * Class for managing asset amounts in the UTXOSet fee calcuation
 */
class AssetAmount {
    constructor(assetID, amount, burn) {
        // assetID that is amount is managing.
        this.assetID = buffer_1.Buffer.alloc(32);
        // amount of this asset that should be sent.
        this.amount = new bn_js_1.default(0);
        // burn is the amount of this asset that should be burned.
        this.burn = new bn_js_1.default(0);
        // spent is the total amount of this asset that has been consumed.
        this.spent = new bn_js_1.default(0);
        // stakeableLockSpent is the amount of this asset that has been consumed that
        // was locked.
        this.stakeableLockSpent = new bn_js_1.default(0);
        // change is the excess amount of this asset that was consumed over the amount
        // requested to be consumed(amount + burn).
        this.change = new bn_js_1.default(0);
        // stakeableLockChange is a flag to mark if the input that generated the
        // change was locked.
        this.stakeableLockChange = false;
        // finished is a convenience flag to track "spent >= amount + burn"
        this.finished = false;
        this.getAssetID = () => {
            return this.assetID;
        };
        this.getAssetIDString = () => {
            return this.assetID.toString("hex");
        };
        this.getAmount = () => {
            return this.amount;
        };
        this.getSpent = () => {
            return this.spent;
        };
        this.getBurn = () => {
            return this.burn;
        };
        this.getChange = () => {
            return this.change;
        };
        this.getStakeableLockSpent = () => {
            return this.stakeableLockSpent;
        };
        this.getStakeableLockChange = () => {
            return this.stakeableLockChange;
        };
        this.isFinished = () => {
            return this.finished;
        };
        // spendAmount should only be called if this asset is still awaiting more
        // funds to consume.
        this.spendAmount = (amt, stakeableLocked = false) => {
            if (this.finished) {
                /* istanbul ignore next */
                throw new errors_1.InsufficientFundsError("Error - AssetAmount.spendAmount: attempted to spend " + "excess funds");
            }
            this.spent = this.spent.add(amt);
            if (stakeableLocked) {
                this.stakeableLockSpent = this.stakeableLockSpent.add(amt);
            }
            const total = this.amount.add(this.burn);
            if (this.spent.gte(total)) {
                this.change = this.spent.sub(total);
                if (stakeableLocked) {
                    this.stakeableLockChange = true;
                }
                this.finished = true;
            }
            return this.finished;
        };
        this.assetID = assetID;
        this.amount = typeof amount === "undefined" ? new bn_js_1.default(0) : amount;
        this.burn = typeof burn === "undefined" ? new bn_js_1.default(0) : burn;
        this.spent = new bn_js_1.default(0);
        this.stakeableLockSpent = new bn_js_1.default(0);
        this.stakeableLockChange = false;
    }
}
exports.AssetAmount = AssetAmount;
class StandardAssetAmountDestination {
    constructor(destinations, destinationsThreshold, senders, changeAddresses, changeAddressesThreshold) {
        this.amounts = [];
        this.destinations = [];
        this.destinationsThreshold = 0;
        this.senders = [];
        this.changeAddresses = [];
        this.changeAddressesThreshold = 0;
        this.amountkey = {};
        this.inputs = [];
        this.outputs = [];
        this.change = [];
        // TODO: should this function allow for repeated calls with the same
        //       assetID?
        this.addAssetAmount = (assetID, amount, burn) => {
            let aa = new AssetAmount(assetID, amount, burn);
            this.amounts.push(aa);
            this.amountkey[aa.getAssetIDString()] = aa;
        };
        this.addInput = (input) => {
            this.inputs.push(input);
        };
        this.addOutput = (output) => {
            this.outputs.push(output);
        };
        this.addChange = (output) => {
            this.change.push(output);
        };
        this.getAmounts = () => {
            return this.amounts;
        };
        this.getDestinations = () => {
            return this.destinations;
        };
        this.getDestinationsThreshold = () => {
            return this.destinationsThreshold;
        };
        this.getSenders = () => {
            return this.senders;
        };
        this.getChangeAddresses = () => {
            return this.changeAddresses;
        };
        this.getChangeAddressesThreshold = () => {
            return this.changeAddressesThreshold;
        };
        this.getAssetAmount = (assetHexStr) => {
            return this.amountkey[`${assetHexStr}`];
        };
        this.assetExists = (assetHexStr) => {
            return assetHexStr in this.amountkey;
        };
        this.getInputs = () => {
            return this.inputs;
        };
        this.getOutputs = () => {
            return this.outputs;
        };
        this.getChangeOutputs = () => {
            return this.change;
        };
        this.getAllOutputs = () => {
            return this.outputs.concat(this.change);
        };
        this.canComplete = () => {
            for (let i = 0; i < this.amounts.length; i++) {
                if (!this.amounts[`${i}`].isFinished()) {
                    return false;
                }
            }
            return true;
        };
        this.destinations = destinations;
        this.destinationsThreshold = destinationsThreshold;
        this.changeAddresses = changeAddresses;
        this.changeAddressesThreshold = changeAddressesThreshold;
        this.senders = senders;
    }
}
exports.StandardAssetAmountDestination = StandardAssetAmountDestination;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXNzZXRhbW91bnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29tbW9uL2Fzc2V0YW1vdW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O0dBR0c7Ozs7OztBQUVILG9DQUFnQztBQUNoQyxrREFBc0I7QUFHdEIsNENBQXdEO0FBRXhEOztHQUVHO0FBQ0gsTUFBYSxXQUFXO0lBcUZ0QixZQUFZLE9BQWUsRUFBRSxNQUFVLEVBQUUsSUFBUTtRQXBGakQsc0NBQXNDO1FBQzVCLFlBQU8sR0FBVyxlQUFNLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQzVDLDRDQUE0QztRQUNsQyxXQUFNLEdBQU8sSUFBSSxlQUFFLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDaEMsMERBQTBEO1FBQ2hELFNBQUksR0FBTyxJQUFJLGVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUU5QixrRUFBa0U7UUFDeEQsVUFBSyxHQUFPLElBQUksZUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQy9CLDZFQUE2RTtRQUM3RSxjQUFjO1FBQ0osdUJBQWtCLEdBQU8sSUFBSSxlQUFFLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFFNUMsOEVBQThFO1FBQzlFLDJDQUEyQztRQUNqQyxXQUFNLEdBQU8sSUFBSSxlQUFFLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDaEMsd0VBQXdFO1FBQ3hFLHFCQUFxQjtRQUNYLHdCQUFtQixHQUFZLEtBQUssQ0FBQTtRQUU5QyxtRUFBbUU7UUFDekQsYUFBUSxHQUFZLEtBQUssQ0FBQTtRQUVuQyxlQUFVLEdBQUcsR0FBVyxFQUFFO1lBQ3hCLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQTtRQUNyQixDQUFDLENBQUE7UUFFRCxxQkFBZ0IsR0FBRyxHQUFXLEVBQUU7WUFDOUIsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQTtRQUNyQyxDQUFDLENBQUE7UUFFRCxjQUFT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QUFZLEVBQUU7WUFDMUIsS0FBSyxJQUFJLENBQUMsR0FBVyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUNwRCxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsVUFBVSxFQUFFLEVBQUU7b0JBQ3RDLE9BQU8sS0FBSyxDQUFBO2lCQUNiO2FBQ0Y7WUFDRCxPQUFPLElBQUksQ0FBQTtRQUNiLENBQUMsQ0FBQTtRQVNDLElBQUksQ0FBQyxZQUFZLEdBQUcsWUFBWSxDQUFBO1FBQ2hDLElBQUksQ0FBQyxxQkFBcUIsR0FBRyxxQkFBcUIsQ0FBQTtRQUNsRCxJQUFJLENBQUMsZUFBZSxHQUFHLGVBQWUsQ0FBQTtRQUN0QyxJQUFJLENBQUMsd0JBQXdCLEdBQUcsd0JBQXdCLENBQUE7UUFDeEQsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUE7SUFDeEIsQ0FBQztDQUNGO0FBekdELHdFQXlHQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQHBhY2thZ2VEb2N1bWVudGF0aW9uXG4gKiBAbW9kdWxlIENvbW1vbi1Bc3NldEFtb3VudFxuICovXG5cbmltcG9ydCB7IEJ1ZmZlciB9IGZyb20gXCJidWZmZXIvXCJcbmltcG9ydCBCTiBmcm9tIFwiYm4uanNcIlxuaW1wb3J0IHsgU3RhbmRhcmRUcmFuc2ZlcmFibGVPdXRwdXQgfSBmcm9tIFwiLi9vdXRwdXRcIlxuaW1wb3J0IHsgU3RhbmRhcmRUcmFuc2ZlcmFibGVJbnB1dCB9IGZyb20gXCIuL2lucHV0XCJcbmltcG9ydCB7IEluc3VmZmljaWVudEZ1bmRzRXJyb3IgfSBmcm9tIFwiLi4vdXRpbHMvZXJyb3JzXCJcblxuLyoqXG4gKiBDbGFzcyBmb3IgbWFuYWdpbmcgYXNzZXQgYW1vdW50cyBpbiB0aGUgVVRYT1NldCBmZWUgY2FsY3VhdGlvblxuICovXG5leHBvcnQgY2xhc3MgQXNzZXRBbW91bnQge1xuICAvLyBhc3NldElEIHRoYXQgaXMgYW1vdW50IGlzIG1hbmFnaW5nLlxuICBwcm90ZWN0ZWQgYXNzZXRJRDogQnVmZmVyID0gQnVmZmVyLmFsbG9jKDMyKVxuICAvLyBhbW91bnQgb2YgdGhpcyBhc3NldCB0aGF0IHNob3VsZCBiZSBzZW50LlxuICBwcm90ZWN0ZWQgYW1vdW50OiBCTiA9IG5ldyBCTigwKVxuICAvLyBidXJuIGlzIHRoZSBhbW91bnQgb2YgdGhpcyBhc3NldCB0aGF0IHNob3VsZCBiZSBidXJuZWQuXG4gIHByb3RlY3RlZCBidXJuOiBCTiA9IG5ldyBCTigwKVxuXG4gIC8vIHNwZW50IGlzIHRoZSB0b3RhbCBhbW91bnQgb2YgdGhpcyBhc3NldCB0aGF0IGhhcyBiZWVuIGNvbnN1bWVkLlxuICBwcm90ZWN0ZWQgc3BlbnQ6IEJOID0gbmV3IEJOKDApXG4gIC8vIHN0YWtlYWJsZUxvY2tTcGVudCBpcyB0aGUgYW1vdW50IG9mIHRoaXMgYXNzZXQgdGhhdCBoYXMgYmVlbiBjb25zdW1lZCB0aGF0XG4gIC8vIHdhcyBsb2NrZWQuXG4gIHByb3RlY3RlZCBzdGFrZWFibGVMb2NrU3BlbnQ6IEJOID0gbmV3IEJOKDApXG5cbiAgLy8gY2hhbmdlIGlzIHRoZSBleGNlc3MgYW1vdW50IG9mIHRoaXMgYXNzZXQgdGhhdCB3YXMgY29uc3VtZWQgb3ZlciB0aGUgYW1vdW50XG4gIC8vIHJlcXVlc3RlZCB0byBiZSBjb25zdW1lZChhbW91bnQgKyBidXJuKS5cbiAgcHJvdGVjdGVkIGNoYW5nZTogQk4gPSBuZXcgQk4oMClcbiAgLy8gc3Rha2VhYmxlTG9ja0NoYW5nZSBpcyBhIGZsYWcgdG8gbWFyayBpZiB0aGUgaW5wdXQgdGhhdCBnZW5lcmF0ZWQgdGhlXG4gIC8vIGNoYW5nZSB3YXMgbG9ja2VkLlxuICBwcm90ZWN0ZWQgc3Rha2VhYmxlTG9ja0NoYW5nZTogYm9vbGVhbiA9IGZhbHNlXG5cbiAgLy8gZmluaXNoZWQgaXMgYSBjb252ZW5pZW5jZSBmbGFnIHRvIHRyYWNrIFwic3BlbnQgPj0gYW1vdW50ICsgYnVyblwiXG4gIHByb3RlY3RlZCBmaW5pc2hlZDogYm9vbGVhbiA9IGZhbHNlXG5cbiAgZ2V0QXNzZXRJRCA9ICgpOiBCdWZmZXIgPT4ge1xuICAgIHJldHVybiB0aGlzLmFzc2V0SURcbiAgfVxuXG4gIGdldEFzc2V0SURTdHJpbmcgPSAoKTogc3RyaW5nID0+IHtcbiAgICByZXR1cm4gdGhpcy5hc3NldElELnRvU3RyaW5nKFwiaGV4XCIpXG4gIH1cblxuICBnZXRBbW91bnQgPSAoKTogQk4gPT4ge1xuICAgIHJldHVybiB0aGlzLmFtb3VudFxuICB9XG5cbiAgZ2V0U3BlbnQgPSAoKTogQk4gPT4ge1xuICAgIHJldHVybiB0aGlzLnNwZW50XG4gIH1cblxuICBnZXRCdXJuID0gKCk6IEJOID0+IHtcbiAgICByZXR1cm4gdGhpcy5idXJuXG4gIH1cblxuICBnZXRDaGFuZ2UgPSAoKTogQk4gPT4ge1xuICAgIHJldHVybiB0aGlzLmNoYW5nZVxuICB9XG5cbiAgZ2V0U3Rha2VhYmxlTG9ja1NwZW50ID0gKCk6IEJOID0+IHtcbiAgICByZXR1cm4gdGhpcy5zdGFrZWFibGVMb2NrU3BlbnRcbiAgfVxuXG4gIGdldFN0YWtlYWJsZUxvY2tDaGFuZ2UgPSAoKTogYm9vbGVhbiA9PiB7XG4gICAgcmV0dXJuIHRoaXMuc3Rha2VhYmxlTG9ja0NoYW5nZVxuICB9XG5cbiAgaXNGaW5pc2hlZCA9ICgpOiBib29sZWFuID0+IHtcbiAgICByZXR1cm4gdGhpcy5maW5pc2hlZFxuICB9XG5cbiAgLy8gc3BlbmRBbW91bnQgc2hvdWxkIG9ubHkgYmUgY2FsbGVkIGlmIHRoaXMgYXNzZXQgaXMgc3RpbGwgYXdhaXRpbmcgbW9yZVxuICAvLyBmdW5kcyB0byBjb25zdW1lLlxuICBzcGVuZEFtb3VudCA9IChhbXQ6IEJOLCBzdGFrZWFibGVMb2NrZWQ6IGJvb2xlYW4gPSBmYWxzZSk6IGJvb2xlYW4gPT4ge1xuICAgIGlmICh0aGlzLmZpbmlzaGVkKSB7XG4gICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgdGhyb3cgbmV3IEluc3VmZmljaWVudEZ1bmRzRXJyb3IoXG4gICAgICAgIFwiRXJyb3IgLSBBc3NldEFtb3VudC5zcGVuZEFtb3VudDogYXR0ZW1wdGVkIHRvIHNwZW5kIFwiICsgXCJleGNlc3MgZnVuZHNcIlxuICAgICAgKVxuICAgIH1cbiAgICB0aGlzLnNwZW50ID0gdGhpcy5zcGVudC5hZGQoYW10KVxuICAgIGlmIChzdGFrZWFibGVMb2NrZWQpIHtcbiAgICAgIHRoaXMuc3Rha2VhYmxlTG9ja1NwZW50ID0gdGhpcy5zdGFrZWFibGVMb2NrU3BlbnQuYWRkKGFtdClcbiAgICB9XG5cbiAgICBjb25zdCB0b3RhbDogQk4gPSB0aGlzLmFtb3VudC5hZGQodGhpcy5idXJuKVxuICAgIGlmICh0aGlzLnNwZW50Lmd0ZSh0b3RhbCkpIHtcbiAgICAgIHRoaXMuY2hhbmdlID0gdGhpcy5zcGVudC5zdWIodG90YWwpXG4gICAgICBpZiAoc3Rha2VhYmxlTG9ja2VkKSB7XG4gICAgICAgIHRoaXMuc3Rha2VhYmxlTG9ja0NoYW5nZSA9IHRydWVcbiAgICAgIH1cbiAgICAgIHRoaXMuZmluaXNoZWQgPSB0cnVlXG4gICAgfVxuICAgIHJldHVybiB0aGlzLmZpbmlzaGVkXG4gIH1cblxuICBjb25zdHJ1Y3Rvcihhc3NldElEOiBCdWZmZXIsIGFtb3VudDogQk4sIGJ1cm46IEJOKSB7XG4gICAgdGhpcy5hc3NldElEID0gYXNzZXRJRFxuICAgIHRoaXMuYW1vdW50ID0gdHlwZW9mIGFtb3VudCA9PT0gXCJ1bmRlZmluZWRcIiA/IG5ldyBCTigwKSA6IGFtb3VudFxuICAgIHRoaXMuYnVybiA9IHR5cGVvZiBidXJuID09PSBcInVuZGVmaW5lZFwiID8gbmV3IEJOKDApIDogYnVyblxuICAgIHRoaXMuc3BlbnQgPSBuZXcgQk4oMClcbiAgICB0aGlzLnN0YWtlYWJsZUxvY2tTcGVudCA9IG5ldyBCTigwKVxuICAgIHRoaXMuc3Rha2VhYmxlTG9ja0NoYW5nZSA9IGZhbHNlXG4gIH1cbn1cblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFN0YW5kYXJkQXNzZXRBbW91bnREZXN0aW5hdGlvbjxcbiAgVE8gZXh0ZW5kcyBTdGFuZGFyZFRyYW5zZmVyYWJsZU91dHB1dCxcbiAgVEkgZXh0ZW5kcyBTdGFuZGFyZFRyYW5zZmVyYWJsZUlucHV0XG4+IHtcbiAgcHJvdGVjdGVkIGFtb3VudHM6IEFzc2V0QW1vdW50W10gPSBbXVxuICBwcm90ZWN0ZWQgZGVzdGluYXRpb25zOiBCdWZmZXJbXSA9IFtdXG4gIHByb3RlY3RlZCBkZXN0aW5hdGlvbnNUaHJlc2hvbGQ6IG51bWJlciA9IDBcbiAgcHJvdGVjdGVkIHNlbmRlcnM6IEJ1ZmZlcltdID0gW11cbiAgcHJvdGVjdGVkIGNoYW5nZUFkZHJlc3NlczogQnVmZmVyW10gPSBbXVxuICBwcm90ZWN0ZWQgY2hhbmdlQWRkcmVzc2VzVGhyZXNob2xkOiBudW1iZXIgPSAwXG4gIHByb3RlY3RlZCBhbW91bnRrZXk6IG9iamVjdCA9IHt9XG4gIHByb3RlY3RlZCBpbnB1dHM6IFRJW10gPSBbXVxuICBwcm90ZWN0ZWQgb3V0cHV0czogVE9bXSA9IFtdXG4gIHByb3RlY3RlZCBjaGFuZ2U6IFRPW10gPSBbXVxuXG4gIC8vIFRPRE86IHNob3VsZCB0aGlzIGZ1bmN0aW9uIGFsbG93IGZvciByZXBlYXRlZCBjYWxscyB3aXRoIHRoZSBzYW1lXG4gIC8vICAgICAgIGFzc2V0SUQ/XG4gIGFkZEFzc2V0QW1vdW50ID0gKGFzc2V0SUQ6IEJ1ZmZlciwgYW1vdW50OiBCTiwgYnVybjogQk4pID0+IHtcbiAgICBsZXQgYWE6IEFzc2V0QW1vdW50ID0gbmV3IEFzc2V0QW1vdW50KGFzc2V0SUQsIGFtb3VudCwgYnVybilcbiAgICB0aGlzLmFtb3VudHMucHVzaChhYSlcbiAgICB0aGlzLmFtb3VudGtleVthYS5nZXRBc3NldElEU3RyaW5nKCldID0gYWFcbiAgfVxuXG4gIGFkZElucHV0ID0gKGlucHV0OiBUSSkgPT4ge1xuICAgIHRoaXMuaW5wdXRzLnB1c2goaW5wdXQpXG4gIH1cblxuICBhZGRPdXRwdXQgPSAob3V0cHV0OiBUTykgPT4ge1xuICAgIHRoaXMub3V0cHV0cy5wdXNoKG91dHB1dClcbiAgfVxuXG4gIGFkZENoYW5nZSA9IChvdXRwdXQ6IFRPKSA9PiB7XG4gICAgdGhpcy5jaGFuZ2UucHVzaChvdXRwdXQpXG4gIH1cblxuICBnZXRBbW91bnRzID0gKCk6IEFzc2V0QW1vdW50W10gPT4ge1xuICAgIHJldHVybiB0aGlzLmFtb3VudHNcbiAgfVxuXG4gIGdldERlc3RpbmF0aW9ucyA9ICgpOiBCdWZmZXJbXSA9PiB7XG4gICAgcmV0dXJuIHRoaXMuZGVzdGluYXRpb25zXG4gIH1cblxuICBnZXREZXN0aW5hdGlvbnNUaHJlc2hvbGQgPSAoKTogbnVtYmVyID0+IHtcbiAgICByZXR1cm4gdGhpcy5kZXN0aW5hdGlvbnNUaHJlc2hvbGRcbiAgfVxuXG4gIGdldFNlbmRlcnMgPSAoKTogQnVmZmVyW10gPT4ge1xuICAgIHJldHVybiB0aGlzLnNlbmRlcnNcbiAgfVxuXG4gIGdldENoYW5nZUFkZHJlc3NlcyA9ICgpOiBCdWZmZXJbXSA9PiB7XG4gICAgcmV0dXJuIHRoaXMuY2hhbmdlQWRkcmVzc2VzXG4gIH1cblxuICBnZXRDaGFuZ2VBZGRyZXNzZXNUaHJlc2hvbGQgPSAoKTogbnVtYmVyID0+IHtcbiAgICByZXR1cm4gdGhpcy5jaGFuZ2VBZGRyZXNzZXNUaHJlc2hvbGRcbiAgfVxuXG4gIGdldEFzc2V0QW1vdW50ID0gKGFzc2V0SGV4U3RyOiBzdHJpbmcpOiBBc3NldEFtb3VudCA9PiB7XG4gICAgcmV0dXJuIHRoaXMuYW1vdW50a2V5W2Ake2Fzc2V0SGV4U3RyfWBdXG4gIH1cblxuICBhc3NldEV4aXN0cyA9IChhc3NldEhleFN0cjogc3RyaW5nKTogYm9vbGVhbiA9PiB7XG4gICAgcmV0dXJuIGFzc2V0SGV4U3RyIGluIHRoaXMuYW1vdW50a2V5XG4gIH1cblxuICBnZXRJbnB1dHMgPSAoKTogVElbXSA9PiB7XG4gICAgcmV0dXJuIHRoaXMuaW5wdXRzXG4gIH1cblxuICBnZXRPdXRwdXRzID0gKCk6IFRPW10gPT4ge1xuICAgIHJldHVybiB0aGlzLm91dHB1dHNcbiAgfVxuXG4gIGdldENoYW5nZU91dHB1dHMgPSAoKTogVE9bXSA9PiB7XG4gICAgcmV0dXJuIHRoaXMuY2hhbmdlXG4gIH1cblxuICBnZXRBbGxPdXRwdXRzID0gKCk6IFRPW10gPT4ge1xuICAgIHJldHVybiB0aGlzLm91dHB1dHMuY29uY2F0KHRoaXMuY2hhbmdlKVxuICB9XG5cbiAgY2FuQ29tcGxldGUgPSAoKTogYm9vbGVhbiA9PiB7XG4gICAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IHRoaXMuYW1vdW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKCF0aGlzLmFtb3VudHNbYCR7aX1gXS5pc0ZpbmlzaGVkKCkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0cnVlXG4gIH1cblxuICBjb25zdHJ1Y3RvcihcbiAgICBkZXN0aW5hdGlvbnM6IEJ1ZmZlcltdLFxuICAgIGRlc3RpbmF0aW9uc1RocmVzaG9sZDogbnVtYmVyLFxuICAgIHNlbmRlcnM6IEJ1ZmZlcltdLFxuICAgIGNoYW5nZUFkZHJlc3NlczogQnVmZmVyW10sXG4gICAgY2hhbmdlQWRkcmVzc2VzVGhyZXNob2xkOiBudW1iZXJcbiAgKSB7XG4gICAgdGhpcy5kZXN0aW5hdGlvbnMgPSBkZXN0aW5hdGlvbnNcbiAgICB0aGlzLmRlc3RpbmF0aW9uc1RocmVzaG9sZCA9IGRlc3RpbmF0aW9uc1RocmVzaG9sZFxuICAgIHRoaXMuY2hhbmdlQWRkcmVzc2VzID0gY2hhbmdlQWRkcmVzc2VzXG4gICAgdGhpcy5jaGFuZ2VBZGRyZXNzZXNUaHJlc2hvbGQgPSBjaGFuZ2VBZGRyZXNzZXNUaHJlc2hvbGRcbiAgICB0aGlzLnNlbmRlcnMgPSBzZW5kZXJzXG4gIH1cbn1cbiJdfQ==
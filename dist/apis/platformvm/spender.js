"use strict";
/**
 * @packageDocumentation
 * @module API-PlatformVM-Spender
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Spender = void 0;
const errors_1 = require("../../utils/errors");
class Spender {
    constructor(platformAPI) {
        this.getMinimumSpendable = (aad, asOf, lockTime, lockMode) => __awaiter(this, void 0, void 0, function* () {
            if (aad.getAmounts().length !== 1) {
                return new errors_1.FeeAssetError("spender -- multiple assets not yet supported");
            }
            const addr = aad
                .getSenders()
                .map((a) => this.platformAPI.addressFromBuffer(a));
            const signer = aad
                .getSigners()
                .map((a) => this.platformAPI.addressFromBuffer(a));
            const to = aad
                .getDestinations()
                .map((a) => this.platformAPI.addressFromBuffer(a));
            const change = aad
                .getChangeAddresses()
                .map((a) => this.platformAPI.addressFromBuffer(a));
            const aa = aad.getAmounts()[0];
            const result = yield this.platformAPI.spend(addr, signer, to, aad.getDestinationsThreshold(), lockTime, change, aad.getChangeAddressesThreshold(), lockMode, aa.getAmount(), aa.getBurn(), asOf);
            result.ins.forEach((inp) => {
                aad.addInput(inp);
            });
            result.out.forEach((out) => {
                aad.addOutput(out);
            });
            aad.setOutputOwners(result.owners);
            return;
        });
        this.platformAPI = platformAPI;
    }
}
exports.Spender = Spender;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3BlbmRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hcGlzL3BsYXRmb3Jtdm0vc3BlbmRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztHQUdHOzs7Ozs7Ozs7Ozs7QUFLSCwrQ0FBa0Q7QUFJbEQsTUFBYSxPQUFPO0lBR2xCLFlBQVksV0FBMEI7UUFJdEMsd0JBQW1CLEdBQUcsQ0FDcEIsR0FBMkIsRUFDM0IsSUFBUSxFQUNSLFFBQVksRUFDWixRQUFrQixFQUNGLEVBQUU7WUFDbEIsSUFBSSxHQUFHLENBQUMsVUFBVSxFQUFFLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFDakMsT0FBTyxJQUFJLHNCQUFhLENBQUMsOENBQThDLENBQUMsQ0FBQTthQUN6RTtZQUVELE1BQU0sSUFBSSxHQUFHLEdBQUc7aUJBQ2IsVUFBVSxFQUFFO2lCQUNaLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBRXBELE1BQU0sTUFBTSxHQUFHLEdBQUc7aUJBQ2YsVUFBVSxFQUFFO2lCQUNaLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBRXBELE1BQU0sRUFBRSxHQUFHLEdBQUc7aUJBQ1gsZUFBZSxFQUFFO2lCQUNqQixHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUVwRCxNQUFNLE1BQU0sR0FBRyxHQUFHO2lCQUNmLGtCQUFrQixFQUFFO2lCQUNwQixHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUVwRCxNQUFNLEVBQUUsR0FBRyxHQUFHLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFFOUIsTUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FDekMsSUFBSSxFQUNKLE1BQU0sRUFDTixFQUFFLEVBQ0YsR0FBRyxDQUFDLHdCQUF3QixFQUFFLEVBQzlCLFFBQVEsRUFDUixNQUFNLEVBQ04sR0FBRyxDQUFDLDJCQUEyQixFQUFFLEVBQ2pDLFFBQVEsRUFDUixFQUFFLENBQUMsU0FBUyxFQUFFLEVBQ2QsRUFBRSxDQUFDLE9BQU8sRUFBRSxFQUNaLElBQUksQ0FDTCxDQUFBO1lBRUQsTUFBTSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRTtnQkFDekIsR0FBRyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQTtZQUNuQixDQUFDLENBQUMsQ0FBQTtZQUNGLE1BQU0sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUU7Z0JBQ3pCLEdBQUcsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUE7WUFDcEIsQ0FBQyxDQUFDLENBQUE7WUFDRixHQUFHLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQTtZQUNsQyxPQUFNO1FBQ1IsQ0FBQyxDQUFBLENBQUE7UUFyREMsSUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUE7SUFDaEMsQ0FBQztDQXFERjtBQTFERCwwQkEwREMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBwYWNrYWdlRG9jdW1lbnRhdGlvblxuICogQG1vZHVsZSBBUEktUGxhdGZvcm1WTS1TcGVuZGVyXG4gKi9cblxuaW1wb3J0IEJOIGZyb20gXCJibi5qc1wiXG5cbmltcG9ydCB7IEFzc2V0QW1vdW50RGVzdGluYXRpb24sIFBsYXRmb3JtVk1BUEkgfSBmcm9tIFwiLlwiXG5pbXBvcnQgeyBGZWVBc3NldEVycm9yIH0gZnJvbSBcIi4uLy4uL3V0aWxzL2Vycm9yc1wiXG5cbmltcG9ydCB7IExvY2tNb2RlIH0gZnJvbSBcIi4vYnVpbGRlclwiXG5cbmV4cG9ydCBjbGFzcyBTcGVuZGVyIHtcbiAgcGxhdGZvcm1BUEk6IFBsYXRmb3JtVk1BUElcblxuICBjb25zdHJ1Y3RvcihwbGF0Zm9ybUFQSTogUGxhdGZvcm1WTUFQSSkge1xuICAgIHRoaXMucGxhdGZvcm1BUEkgPSBwbGF0Zm9ybUFQSVxuICB9XG5cbiAgZ2V0TWluaW11bVNwZW5kYWJsZSA9IGFzeW5jIChcbiAgICBhYWQ6IEFzc2V0QW1vdW50RGVzdGluYXRpb24sXG4gICAgYXNPZjogQk4sXG4gICAgbG9ja1RpbWU6IEJOLFxuICAgIGxvY2tNb2RlOiBMb2NrTW9kZVxuICApOiBQcm9taXNlPEVycm9yPiA9PiB7XG4gICAgaWYgKGFhZC5nZXRBbW91bnRzKCkubGVuZ3RoICE9PSAxKSB7XG4gICAgICByZXR1cm4gbmV3IEZlZUFzc2V0RXJyb3IoXCJzcGVuZGVyIC0tIG11bHRpcGxlIGFzc2V0cyBub3QgeWV0IHN1cHBvcnRlZFwiKVxuICAgIH1cblxuICAgIGNvbnN0IGFkZHIgPSBhYWRcbiAgICAgIC5nZXRTZW5kZXJzKClcbiAgICAgIC5tYXAoKGEpID0+IHRoaXMucGxhdGZvcm1BUEkuYWRkcmVzc0Zyb21CdWZmZXIoYSkpXG5cbiAgICBjb25zdCBzaWduZXIgPSBhYWRcbiAgICAgIC5nZXRTaWduZXJzKClcbiAgICAgIC5tYXAoKGEpID0+IHRoaXMucGxhdGZvcm1BUEkuYWRkcmVzc0Zyb21CdWZmZXIoYSkpXG5cbiAgICBjb25zdCB0byA9IGFhZFxuICAgICAgLmdldERlc3RpbmF0aW9ucygpXG4gICAgICAubWFwKChhKSA9PiB0aGlzLnBsYXRmb3JtQVBJLmFkZHJlc3NGcm9tQnVmZmVyKGEpKVxuXG4gICAgY29uc3QgY2hhbmdlID0gYWFkXG4gICAgICAuZ2V0Q2hhbmdlQWRkcmVzc2VzKClcbiAgICAgIC5tYXAoKGEpID0+IHRoaXMucGxhdGZvcm1BUEkuYWRkcmVzc0Zyb21CdWZmZXIoYSkpXG5cbiAgICBjb25zdCBhYSA9IGFhZC5nZXRBbW91bnRzKClbMF1cblxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMucGxhdGZvcm1BUEkuc3BlbmQoXG4gICAgICBhZGRyLFxuICAgICAgc2lnbmVyLFxuICAgICAgdG8sXG4gICAgICBhYWQuZ2V0RGVzdGluYXRpb25zVGhyZXNob2xkKCksXG4gICAgICBsb2NrVGltZSxcbiAgICAgIGNoYW5nZSxcbiAgICAgIGFhZC5nZXRDaGFuZ2VBZGRyZXNzZXNUaHJlc2hvbGQoKSxcbiAgICAgIGxvY2tNb2RlLFxuICAgICAgYWEuZ2V0QW1vdW50KCksXG4gICAgICBhYS5nZXRCdXJuKCksXG4gICAgICBhc09mXG4gICAgKVxuXG4gICAgcmVzdWx0Lmlucy5mb3JFYWNoKChpbnApID0+IHtcbiAgICAgIGFhZC5hZGRJbnB1dChpbnApXG4gICAgfSlcbiAgICByZXN1bHQub3V0LmZvckVhY2goKG91dCkgPT4ge1xuICAgICAgYWFkLmFkZE91dHB1dChvdXQpXG4gICAgfSlcbiAgICBhYWQuc2V0T3V0cHV0T3duZXJzKHJlc3VsdC5vd25lcnMpXG4gICAgcmV0dXJuXG4gIH1cbn1cbiJdfQ==
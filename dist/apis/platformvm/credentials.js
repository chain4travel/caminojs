"use strict";
/**
 * @packageDocumentation
 * @module API-PlatformVM-Credentials
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SECPCredential = exports.SelectCredentialClass = void 0;
const constants_1 = require("./constants");
const common_1 = require("../../common");
const errors_1 = require("../../utils/errors");
/**
 * Takes a buffer representing the credential and returns the proper [[Credential]] instance.
 *
 * @param credid A number representing the credential ID parsed prior to the bytes passed in
 *
 * @returns An instance of an [[Credential]]-extended class.
 */
const SelectCredentialClass = (credid, ...args) => {
    switch (credid) {
        case constants_1.PlatformVMConstants.SECPCREDENTIAL:
            return new SECPCredential(...args);
        case constants_1.PlatformVMConstants.SECPMULTISIGCREDENTIAL:
            return new common_1.SECPMultisigCredential(credid);
        default:
            /* istanbul ignore next */
            throw new errors_1.CredIdError("Error - SelectCredentialClass: unknown credid");
    }
};
exports.SelectCredentialClass = SelectCredentialClass;
class SECPCredential extends common_1.Credential {
    constructor() {
        super(...arguments);
        this._typeName = "SECPCredential";
        this._typeID = constants_1.PlatformVMConstants.SECPCREDENTIAL;
    }
    //serialize and deserialize both are inherited
    clone() {
        let newbase = new SECPCredential();
        newbase.fromBuffer(this.toBuffer());
        return newbase;
    }
    create(...args) {
        return new SECPCredential(...args);
    }
    select(id, ...args) {
        let newbasetx = (0, exports.SelectCredentialClass)(id, ...args);
        return newbasetx;
    }
}
exports.SECPCredential = SECPCredential;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlZGVudGlhbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYXBpcy9wbGF0Zm9ybXZtL2NyZWRlbnRpYWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O0dBR0c7OztBQUVILDJDQUFpRDtBQUNqRCx5Q0FBaUU7QUFDakUsK0NBQWdEO0FBRWhEOzs7Ozs7R0FNRztBQUNJLE1BQU0scUJBQXFCLEdBQUcsQ0FDbkMsTUFBYyxFQUNkLEdBQUcsSUFBVyxFQUNGLEVBQUU7SUFDZCxRQUFRLE1BQU0sRUFBRTtRQUNkLEtBQUssK0JBQW1CLENBQUMsY0FBYztZQUNyQyxPQUFPLElBQUksY0FBYyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUE7UUFDcEMsS0FBSywrQkFBbUIsQ0FBQyxzQkFBc0I7WUFDN0MsT0FBTyxJQUFJLCtCQUFzQixDQUFDLE1BQU0sQ0FBQyxDQUFBO1FBQzNDO1lBQ0UsMEJBQTBCO1lBQzFCLE1BQU0sSUFBSSxvQkFBVyxDQUFDLCtDQUErQyxDQUFDLENBQUE7S0FDekU7QUFDSCxDQUFDLENBQUE7QUFiWSxRQUFBLHFCQUFxQix5QkFhakM7QUFFRCxNQUFhLGNBQWUsU0FBUSxtQkFBVTtJQUE5Qzs7UUFDWSxjQUFTLEdBQUcsZ0JBQWdCLENBQUE7UUFDNUIsWUFBTyxHQUFHLCtCQUFtQixDQUFDLGNBQWMsQ0FBQTtJQWtCeEQsQ0FBQztJQWhCQyw4Q0FBOEM7SUFFOUMsS0FBSztRQUNILElBQUksT0FBTyxHQUFtQixJQUFJLGNBQWMsRUFBRSxDQUFBO1FBQ2xELE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUE7UUFDbkMsT0FBTyxPQUFlLENBQUE7SUFDeEIsQ0FBQztJQUVELE1BQU0sQ0FBQyxHQUFHLElBQVc7UUFDbkIsT0FBTyxJQUFJLGNBQWMsQ0FBQyxHQUFHLElBQUksQ0FBUyxDQUFBO0lBQzVDLENBQUM7SUFFRCxNQUFNLENBQUMsRUFBVSxFQUFFLEdBQUcsSUFBVztRQUMvQixJQUFJLFNBQVMsR0FBZSxJQUFBLDZCQUFxQixFQUFDLEVBQUUsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFBO1FBQzlELE9BQU8sU0FBUyxDQUFBO0lBQ2xCLENBQUM7Q0FDRjtBQXBCRCx3Q0FvQkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBwYWNrYWdlRG9jdW1lbnRhdGlvblxuICogQG1vZHVsZSBBUEktUGxhdGZvcm1WTS1DcmVkZW50aWFsc1xuICovXG5cbmltcG9ydCB7IFBsYXRmb3JtVk1Db25zdGFudHMgfSBmcm9tIFwiLi9jb25zdGFudHNcIlxuaW1wb3J0IHsgQ3JlZGVudGlhbCwgU0VDUE11bHRpc2lnQ3JlZGVudGlhbCB9IGZyb20gXCIuLi8uLi9jb21tb25cIlxuaW1wb3J0IHsgQ3JlZElkRXJyb3IgfSBmcm9tIFwiLi4vLi4vdXRpbHMvZXJyb3JzXCJcblxuLyoqXG4gKiBUYWtlcyBhIGJ1ZmZlciByZXByZXNlbnRpbmcgdGhlIGNyZWRlbnRpYWwgYW5kIHJldHVybnMgdGhlIHByb3BlciBbW0NyZWRlbnRpYWxdXSBpbnN0YW5jZS5cbiAqXG4gKiBAcGFyYW0gY3JlZGlkIEEgbnVtYmVyIHJlcHJlc2VudGluZyB0aGUgY3JlZGVudGlhbCBJRCBwYXJzZWQgcHJpb3IgdG8gdGhlIGJ5dGVzIHBhc3NlZCBpblxuICpcbiAqIEByZXR1cm5zIEFuIGluc3RhbmNlIG9mIGFuIFtbQ3JlZGVudGlhbF1dLWV4dGVuZGVkIGNsYXNzLlxuICovXG5leHBvcnQgY29uc3QgU2VsZWN0Q3JlZGVudGlhbENsYXNzID0gKFxuICBjcmVkaWQ6IG51bWJlcixcbiAgLi4uYXJnczogYW55W11cbik6IENyZWRlbnRpYWwgPT4ge1xuICBzd2l0Y2ggKGNyZWRpZCkge1xuICAgIGNhc2UgUGxhdGZvcm1WTUNvbnN0YW50cy5TRUNQQ1JFREVOVElBTDpcbiAgICAgIHJldHVybiBuZXcgU0VDUENyZWRlbnRpYWwoLi4uYXJncylcbiAgICBjYXNlIFBsYXRmb3JtVk1Db25zdGFudHMuU0VDUE1VTFRJU0lHQ1JFREVOVElBTDpcbiAgICAgIHJldHVybiBuZXcgU0VDUE11bHRpc2lnQ3JlZGVudGlhbChjcmVkaWQpXG4gICAgZGVmYXVsdDpcbiAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICB0aHJvdyBuZXcgQ3JlZElkRXJyb3IoXCJFcnJvciAtIFNlbGVjdENyZWRlbnRpYWxDbGFzczogdW5rbm93biBjcmVkaWRcIilcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgU0VDUENyZWRlbnRpYWwgZXh0ZW5kcyBDcmVkZW50aWFsIHtcbiAgcHJvdGVjdGVkIF90eXBlTmFtZSA9IFwiU0VDUENyZWRlbnRpYWxcIlxuICBwcm90ZWN0ZWQgX3R5cGVJRCA9IFBsYXRmb3JtVk1Db25zdGFudHMuU0VDUENSRURFTlRJQUxcblxuICAvL3NlcmlhbGl6ZSBhbmQgZGVzZXJpYWxpemUgYm90aCBhcmUgaW5oZXJpdGVkXG5cbiAgY2xvbmUoKTogdGhpcyB7XG4gICAgbGV0IG5ld2Jhc2U6IFNFQ1BDcmVkZW50aWFsID0gbmV3IFNFQ1BDcmVkZW50aWFsKClcbiAgICBuZXdiYXNlLmZyb21CdWZmZXIodGhpcy50b0J1ZmZlcigpKVxuICAgIHJldHVybiBuZXdiYXNlIGFzIHRoaXNcbiAgfVxuXG4gIGNyZWF0ZSguLi5hcmdzOiBhbnlbXSk6IHRoaXMge1xuICAgIHJldHVybiBuZXcgU0VDUENyZWRlbnRpYWwoLi4uYXJncykgYXMgdGhpc1xuICB9XG5cbiAgc2VsZWN0KGlkOiBudW1iZXIsIC4uLmFyZ3M6IGFueVtdKTogQ3JlZGVudGlhbCB7XG4gICAgbGV0IG5ld2Jhc2V0eDogQ3JlZGVudGlhbCA9IFNlbGVjdENyZWRlbnRpYWxDbGFzcyhpZCwgLi4uYXJncylcbiAgICByZXR1cm4gbmV3YmFzZXR4XG4gIH1cbn1cbiJdfQ==
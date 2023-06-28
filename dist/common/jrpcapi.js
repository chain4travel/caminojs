"use strict";
/**
 * @packageDocumentation
 * @module Common-JRPCAPI
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
exports.JRPCAPI = void 0;
const utils_1 = require("../utils");
const apibase_1 = require("./apibase");
class JRPCAPI extends apibase_1.APIBase {
    /**
     *
     * @param core Reference to the Avalanche instance using this endpoint
     * @param baseURL Path of the APIs baseURL - ex: "/ext/bc/avm"
     * @param jrpcVersion The jrpc version to use, default "2.0".
     */
    constructor(core, baseURL, jrpcVersion = "2.0") {
        super(core, baseURL);
        this.jrpcVersion = "2.0";
        this.rpcID = 1;
        this.callMethod = (method, params, baseURL, headers) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const ep = baseURL || this.baseURL;
            const rpc = {};
            rpc.id = this.rpcID;
            rpc.method = method;
            // Set parameters if exists
            if (params) {
                rpc.params = params;
            }
            else if (this.jrpcVersion === "1.0") {
                rpc.params = [];
            }
            if (this.jrpcVersion !== "1.0") {
                rpc.jsonrpc = this.jrpcVersion;
            }
            let headrs = { "Content-Type": "application/json;charset=UTF-8" };
            if (headers) {
                headrs = Object.assign(Object.assign({}, headrs), headers);
            }
            baseURL = this.core.getURL();
            const axConf = {
                baseURL: baseURL,
                responseType: "json",
                // use the fetch adapter if fetch is available e.g. non Node<17 env
                adapter: typeof fetch !== "undefined" ? utils_1.fetchAdapter : undefined
            };
            var resp;
            try {
                resp = yield this.core.post(ep, {}, JSON.stringify(rpc), headrs, axConf);
            }
            catch (e) {
                throw (_a = e.message) !== null && _a !== void 0 ? _a : e.toJSON();
            }
            if (resp.status >= 200 && resp.status < 300) {
                this.rpcID += 1;
                if (typeof resp.data === "string") {
                    resp.data = JSON.parse(resp.data);
                }
                if (typeof resp.data === "object" &&
                    (resp.data === null || "error" in resp.data)) {
                    throw new Error(resp.data.error.message);
                }
            }
            return resp;
        });
        /**
         * Returns the rpcid, a strictly-increasing number, starting from 1, indicating the next
         * request ID that will be sent.
         */
        this.getRPCID = () => this.rpcID;
        this.jrpcVersion = jrpcVersion;
        this.rpcID = 1;
    }
}
exports.JRPCAPI = JRPCAPI;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianJwY2FwaS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21tb24vanJwY2FwaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztHQUdHOzs7Ozs7Ozs7Ozs7QUFHSCxvQ0FBdUM7QUFFdkMsdUNBQXdEO0FBRXhELE1BQWEsT0FBUSxTQUFRLGlCQUFPO0lBb0VsQzs7Ozs7T0FLRztJQUNILFlBQ0UsSUFBbUIsRUFDbkIsT0FBZSxFQUNmLGNBQXNCLEtBQUs7UUFFM0IsS0FBSyxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQTtRQTlFWixnQkFBVyxHQUFXLEtBQUssQ0FBQTtRQUMzQixVQUFLLEdBQUcsQ0FBQyxDQUFBO1FBRW5CLGVBQVUsR0FBRyxDQUNYLE1BQWMsRUFDZCxNQUEwQixFQUMxQixPQUFnQixFQUNoQixPQUFnQixFQUNjLEVBQUU7O1lBQ2hDLE1BQU0sRUFBRSxHQUFXLE9BQU8sSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFBO1lBQzFDLE1BQU0sR0FBRyxHQUFRLEVBQUUsQ0FBQTtZQUNuQixHQUFHLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUE7WUFDbkIsR0FBRyxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUE7WUFFbkIsMkJBQTJCO1lBQzNCLElBQUksTUFBTSxFQUFFO2dCQUNWLEdBQUcsQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFBO2FBQ3BCO2lCQUFNLElBQUksSUFBSSxDQUFDLFdBQVcsS0FBSyxLQUFLLEVBQUU7Z0JBQ3JDLEdBQUcsQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFBO2FBQ2hCO1lBRUQsSUFBSSxJQUFJLENBQUMsV0FBVyxLQUFLLEtBQUssRUFBRTtnQkFDOUIsR0FBRyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFBO2FBQy9CO1lBRUQsSUFBSSxNQUFNLEdBQVcsRUFBRSxjQUFjLEVBQUUsZ0NBQWdDLEVBQUUsQ0FBQTtZQUN6RSxJQUFJLE9BQU8sRUFBRTtnQkFDWCxNQUFNLG1DQUFRLE1BQU0sR0FBSyxPQUFPLENBQUUsQ0FBQTthQUNuQztZQUVELE9BQU8sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFBO1lBRTVCLE1BQU0sTUFBTSxHQUF1QjtnQkFDakMsT0FBTyxFQUFFLE9BQU87Z0JBQ2hCLFlBQVksRUFBRSxNQUFNO2dCQUNwQixtRUFBbUU7Z0JBQ25FLE9BQU8sRUFBRSxPQUFPLEtBQUssS0FBSyxXQUFXLENBQUMsQ0FBQyxDQUFDLG9CQUFZLENBQUMsQ0FBQyxDQUFDLFNBQVM7YUFDakUsQ0FBQTtZQUVELElBQUksSUFBeUIsQ0FBQTtZQUM3QixJQUFJO2dCQUNGLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUE7YUFDekU7WUFBQyxPQUFPLENBQU0sRUFBRTtnQkFDZixNQUFNLE1BQUEsQ0FBQyxDQUFDLE9BQU8sbUNBQUssQ0FBZ0IsQ0FBQyxNQUFNLEVBQUUsQ0FBQTthQUM5QztZQUVELElBQUksSUFBSSxDQUFDLE1BQU0sSUFBSSxHQUFHLElBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxHQUFHLEVBQUU7Z0JBQzNDLElBQUksQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFBO2dCQUNmLElBQUksT0FBTyxJQUFJLENBQUMsSUFBSSxLQUFLLFFBQVEsRUFBRTtvQkFDakMsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtpQkFDbEM7Z0JBQ0QsSUFDRSxPQUFPLElBQUksQ0FBQyxJQUFJLEtBQUssUUFBUTtvQkFDN0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLElBQUksSUFBSSxPQUFPLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxFQUM1QztvQkFDQSxNQUFNLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFBO2lCQUN6QzthQUNGO1lBQ0QsT0FBTyxJQUFJLENBQUE7UUFDYixDQUFDLENBQUEsQ0FBQTtRQUVEOzs7V0FHRztRQUNILGFBQVEsR0FBRyxHQUFXLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFBO1FBY2pDLElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFBO1FBQzlCLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFBO0lBQ2hCLENBQUM7Q0FDRjtBQW5GRCwwQkFtRkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBwYWNrYWdlRG9jdW1lbnRhdGlvblxuICogQG1vZHVsZSBDb21tb24tSlJQQ0FQSVxuICovXG5cbmltcG9ydCB7IEF4aW9zRXJyb3IsIEF4aW9zUmVxdWVzdENvbmZpZyB9IGZyb20gXCJheGlvc1wiXG5pbXBvcnQgeyBmZXRjaEFkYXB0ZXIgfSBmcm9tIFwiLi4vdXRpbHNcIlxuaW1wb3J0IEF2YWxhbmNoZUNvcmUgZnJvbSBcIi4uL2NhbWlub1wiXG5pbXBvcnQgeyBBUElCYXNlLCBSZXF1ZXN0UmVzcG9uc2VEYXRhIH0gZnJvbSBcIi4vYXBpYmFzZVwiXG5cbmV4cG9ydCBjbGFzcyBKUlBDQVBJIGV4dGVuZHMgQVBJQmFzZSB7XG4gIHByb3RlY3RlZCBqcnBjVmVyc2lvbjogc3RyaW5nID0gXCIyLjBcIlxuICBwcm90ZWN0ZWQgcnBjSUQgPSAxXG5cbiAgY2FsbE1ldGhvZCA9IGFzeW5jIChcbiAgICBtZXRob2Q6IHN0cmluZyxcbiAgICBwYXJhbXM/OiBvYmplY3RbXSB8IG9iamVjdCxcbiAgICBiYXNlVVJMPzogc3RyaW5nLFxuICAgIGhlYWRlcnM/OiBvYmplY3RcbiAgKTogUHJvbWlzZTxSZXF1ZXN0UmVzcG9uc2VEYXRhPiA9PiB7XG4gICAgY29uc3QgZXA6IHN0cmluZyA9IGJhc2VVUkwgfHwgdGhpcy5iYXNlVVJMXG4gICAgY29uc3QgcnBjOiBhbnkgPSB7fVxuICAgIHJwYy5pZCA9IHRoaXMucnBjSURcbiAgICBycGMubWV0aG9kID0gbWV0aG9kXG5cbiAgICAvLyBTZXQgcGFyYW1ldGVycyBpZiBleGlzdHNcbiAgICBpZiAocGFyYW1zKSB7XG4gICAgICBycGMucGFyYW1zID0gcGFyYW1zXG4gICAgfSBlbHNlIGlmICh0aGlzLmpycGNWZXJzaW9uID09PSBcIjEuMFwiKSB7XG4gICAgICBycGMucGFyYW1zID0gW11cbiAgICB9XG5cbiAgICBpZiAodGhpcy5qcnBjVmVyc2lvbiAhPT0gXCIxLjBcIikge1xuICAgICAgcnBjLmpzb25ycGMgPSB0aGlzLmpycGNWZXJzaW9uXG4gICAgfVxuXG4gICAgbGV0IGhlYWRyczogb2JqZWN0ID0geyBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb247Y2hhcnNldD1VVEYtOFwiIH1cbiAgICBpZiAoaGVhZGVycykge1xuICAgICAgaGVhZHJzID0geyAuLi5oZWFkcnMsIC4uLmhlYWRlcnMgfVxuICAgIH1cblxuICAgIGJhc2VVUkwgPSB0aGlzLmNvcmUuZ2V0VVJMKClcblxuICAgIGNvbnN0IGF4Q29uZjogQXhpb3NSZXF1ZXN0Q29uZmlnID0ge1xuICAgICAgYmFzZVVSTDogYmFzZVVSTCxcbiAgICAgIHJlc3BvbnNlVHlwZTogXCJqc29uXCIsXG4gICAgICAvLyB1c2UgdGhlIGZldGNoIGFkYXB0ZXIgaWYgZmV0Y2ggaXMgYXZhaWxhYmxlIGUuZy4gbm9uIE5vZGU8MTcgZW52XG4gICAgICBhZGFwdGVyOiB0eXBlb2YgZmV0Y2ggIT09IFwidW5kZWZpbmVkXCIgPyBmZXRjaEFkYXB0ZXIgOiB1bmRlZmluZWRcbiAgICB9XG5cbiAgICB2YXIgcmVzcDogUmVxdWVzdFJlc3BvbnNlRGF0YVxuICAgIHRyeSB7XG4gICAgICByZXNwID0gYXdhaXQgdGhpcy5jb3JlLnBvc3QoZXAsIHt9LCBKU09OLnN0cmluZ2lmeShycGMpLCBoZWFkcnMsIGF4Q29uZilcbiAgICB9IGNhdGNoIChlOiBhbnkpIHtcbiAgICAgIHRocm93IGUubWVzc2FnZSA/PyAoZSBhcyBBeGlvc0Vycm9yKS50b0pTT04oKVxuICAgIH1cblxuICAgIGlmIChyZXNwLnN0YXR1cyA+PSAyMDAgJiYgcmVzcC5zdGF0dXMgPCAzMDApIHtcbiAgICAgIHRoaXMucnBjSUQgKz0gMVxuICAgICAgaWYgKHR5cGVvZiByZXNwLmRhdGEgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgcmVzcC5kYXRhID0gSlNPTi5wYXJzZShyZXNwLmRhdGEpXG4gICAgICB9XG4gICAgICBpZiAoXG4gICAgICAgIHR5cGVvZiByZXNwLmRhdGEgPT09IFwib2JqZWN0XCIgJiZcbiAgICAgICAgKHJlc3AuZGF0YSA9PT0gbnVsbCB8fCBcImVycm9yXCIgaW4gcmVzcC5kYXRhKVxuICAgICAgKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihyZXNwLmRhdGEuZXJyb3IubWVzc2FnZSlcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3BcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBycGNpZCwgYSBzdHJpY3RseS1pbmNyZWFzaW5nIG51bWJlciwgc3RhcnRpbmcgZnJvbSAxLCBpbmRpY2F0aW5nIHRoZSBuZXh0XG4gICAqIHJlcXVlc3QgSUQgdGhhdCB3aWxsIGJlIHNlbnQuXG4gICAqL1xuICBnZXRSUENJRCA9ICgpOiBudW1iZXIgPT4gdGhpcy5ycGNJRFxuXG4gIC8qKlxuICAgKlxuICAgKiBAcGFyYW0gY29yZSBSZWZlcmVuY2UgdG8gdGhlIEF2YWxhbmNoZSBpbnN0YW5jZSB1c2luZyB0aGlzIGVuZHBvaW50XG4gICAqIEBwYXJhbSBiYXNlVVJMIFBhdGggb2YgdGhlIEFQSXMgYmFzZVVSTCAtIGV4OiBcIi9leHQvYmMvYXZtXCJcbiAgICogQHBhcmFtIGpycGNWZXJzaW9uIFRoZSBqcnBjIHZlcnNpb24gdG8gdXNlLCBkZWZhdWx0IFwiMi4wXCIuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihcbiAgICBjb3JlOiBBdmFsYW5jaGVDb3JlLFxuICAgIGJhc2VVUkw6IHN0cmluZyxcbiAgICBqcnBjVmVyc2lvbjogc3RyaW5nID0gXCIyLjBcIlxuICApIHtcbiAgICBzdXBlcihjb3JlLCBiYXNlVVJMKVxuICAgIHRoaXMuanJwY1ZlcnNpb24gPSBqcnBjVmVyc2lvblxuICAgIHRoaXMucnBjSUQgPSAxXG4gIH1cbn1cbiJdfQ==
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @packageDocumentation
 * @module AvalancheCore
 */
const axios_1 = __importDefault(require("axios"));
const apibase_1 = require("./common/apibase");
const errors_1 = require("./utils/errors");
const networks_1 = __importDefault(require("./utils/networks"));
const fetchadapter_1 = require("./utils/fetchadapter");
/**
 * AvalancheCore is middleware for interacting with Avalanche node RPC APIs.
 *
 * Example usage:
 * ```js
 * let avalanche = new AvalancheCore("127.0.0.1", 9650, "https")
 * ```
 *
 *
 */
class AvalancheCore {
    /**
     * Creates a new Avalanche instance. Sets the address and port of the main Avalanche Client.
     *
     * @param host The hostname to resolve to reach the Avalanche Client APIs
     * @param port The port to resolve to reach the Avalanche Client APIs
     * @param protocol The protocol string to use before a "://" in a request, ex: "http", "https", "git", "ws", etc ...
     * @param networkID The networkID of the network URL belongs to
     */
    constructor(host, port, protocol, networkID) {
        this.networkID = 0;
        this.auth = undefined;
        this.headers = {};
        this.requestConfig = {};
        this.apis = {};
        this.network = undefined;
        /**
         * Sets the address and port of the main Avalanche Client.
         *
         * @param host The hostname to resolve to reach the Avalanche Client RPC APIs.
         * @param port The port to resolve to reach the Avalanche Client RPC APIs.
         * @param protocol The protocol string to use before a "://" in a request,
         * ex: "http", "https", etc. Defaults to http
         * @param baseEndpoint the base endpoint to reach the Avalanche Client RPC APIs,
         * ex: "/rpc". Defaults to "/"
         * The following special characters are removed from host and protocol
         * &#,@+()$~%'":*?{} also less than and greater than signs
         */
        this.setNetwork = (host, port, protocol, networkID, baseEndpoint = "") => {
            host = host.replace(/[&#,@+()$~%'":*?<>{}]/g, "");
            protocol = protocol.replace(/[&#,@+()$~%'":*?<>{}]/g, "");
            const protocols = ["http", "https"];
            if (!protocols.includes(protocol)) {
                /* istanbul ignore next */
                throw new errors_1.ProtocolError("Error - AvalancheCore.setAddress: Invalid protocol");
            }
            // Reset network specific
            if (this.networkID !== networkID || !networks_1.default.isPredefined(networkID)) {
                this.network = undefined;
            }
            this.host = host;
            this.port = port;
            this.protocol = protocol;
            this.baseEndpoint = baseEndpoint;
            let url = `${protocol}://${host}`;
            if (port !== undefined && typeof port === "number" && port >= 0) {
                url = `${url}:${port}`;
            }
            if (baseEndpoint != undefined &&
                typeof baseEndpoint == "string" &&
                baseEndpoint.length > 0) {
                if (baseEndpoint[0] != "/") {
                    baseEndpoint = `/${baseEndpoint}`;
                }
                url = `${url}${baseEndpoint}`;
            }
            this.url = url;
            this.networkID = networkID;
        };
        /**
         * Returns the network configuration.
         */
        this.getNetwork = () => this.network;
        /**
         * Returns the network chains.
         */
        this.getChains = () => this.network
            ? [
                { alias: this.network.C.alias, id: this.network.C.blockchainID },
                { alias: this.network.P.alias, id: this.network.P.blockchainID },
                { alias: this.network.X.alias, id: this.network.X.blockchainID }
            ]
            : [];
        /**
         * Returns the protocol such as "http", "https", "git", "ws", etc.
         */
        this.getProtocol = () => this.protocol;
        /**
         * Returns the host for the Avalanche node.
         */
        this.getHost = () => this.host;
        /**
         * Returns the IP for the Avalanche node.
         */
        this.getIP = () => this.host;
        /**
         * Returns the port for the Avalanche node.
         */
        this.getPort = () => this.port;
        /**
         * Returns the base endpoint for the Avalanche node.
         */
        this.getBaseEndpoint = () => this.baseEndpoint;
        /**
         * Returns the URL of the Avalanche node (ip + port)
         */
        this.getURL = () => this.url;
        /**
         * Returns the custom headers
         */
        this.getHeaders = () => this.headers;
        /**
         * Returns the custom request config
         */
        this.getRequestConfig = () => this.requestConfig;
        /**
         * Returns the networkID
         */
        this.getNetworkID = () => this.networkID;
        /**
         * Returns the Human-Readable-Part of the network associated with this key.
         *
         * @returns The [[KeyPair]]'s Human-Readable-Part of the network's Bech32 addressing scheme
         */
        this.getHRP = () => this.network.hrp;
        /**
         * Adds a new custom header to be included with all requests.
         *
         * @param key Header name
         * @param value Header value
         */
        this.setHeader = (key, value) => {
            this.headers[`${key}`] = value;
        };
        /**
         * Removes a previously added custom header.
         *
         * @param key Header name
         */
        this.removeHeader = (key) => {
            delete this.headers[`${key}`];
        };
        /**
         * Removes all headers.
         */
        this.removeAllHeaders = () => {
            for (const prop in this.headers) {
                if (Object.prototype.hasOwnProperty.call(this.headers, prop)) {
                    delete this.headers[`${prop}`];
                }
            }
        };
        /**
         * Adds a new custom config value to be included with all requests.
         *
         * @param key Config name
         * @param value Config value
         */
        this.setRequestConfig = (key, value) => {
            this.requestConfig[`${key}`] = value;
        };
        /**
         * Removes a previously added request config.
         *
         * @param key Header name
         */
        this.removeRequestConfig = (key) => {
            delete this.requestConfig[`${key}`];
        };
        /**
         * Removes all request configs.
         */
        this.removeAllRequestConfigs = () => {
            for (const prop in this.requestConfig) {
                if (Object.prototype.hasOwnProperty.call(this.requestConfig, prop)) {
                    delete this.requestConfig[`${prop}`];
                }
            }
        };
        /**
         * Sets the temporary auth token used for communicating with the node.
         *
         * @param auth A temporary token provided by the node enabling access to the endpoints on the node.
         */
        this.setAuthToken = (auth) => {
            this.auth = auth;
        };
        this._setHeaders = (headers) => {
            if (typeof this.headers === "object") {
                for (const [key, value] of Object.entries(this.headers)) {
                    headers[`${key}`] = value;
                }
            }
            if (typeof this.auth === "string") {
                headers.Authorization = `Bearer ${this.auth}`;
            }
            return headers;
        };
        /**
         * Returns the primary asset alias.
         */
        this.getPrimaryAssetAlias = () => {
            return this.network.X.avaxAssetAlias;
        };
        /**
         * Adds an API to the middleware. The API resolves to a registered blockchain's RPC.
         *
         * In TypeScript:
         * ```js
         * avalanche.addAPI<MyVMClass>("mychain", MyVMClass, "/ext/bc/mychain")
         * ```
         *
         * In Javascript:
         * ```js
         * avalanche.addAPI("mychain", MyVMClass, "/ext/bc/mychain")
         * ```
         *
         * @typeparam GA Class of the API being added
         * @param apiName A label for referencing the API in the future
         * @param ConstructorFN A reference to the class which instantiates the API
         * @param baseurl Path to resolve to reach the API
         *
         */
        this.addAPI = (apiName, ConstructorFN, baseurl = undefined, ...args) => {
            if (typeof baseurl === "undefined") {
                this.apis[`${apiName}`] = new ConstructorFN(this, undefined, ...args);
            }
            else {
                this.apis[`${apiName}`] = new ConstructorFN(this, baseurl, ...args);
            }
        };
        /**
         * Retrieves a reference to an API by its apiName label.
         *
         * @param apiName Name of the API to return
         */
        this.api = (apiName) => this.apis[`${apiName}`];
        /**
         * @ignore
         */
        this._request = (xhrmethod, baseurl, getdata, postdata, headers = {}, axiosConfig = undefined) => __awaiter(this, void 0, void 0, function* () {
            let config;
            if (axiosConfig) {
                config = Object.assign(Object.assign({}, axiosConfig), this.requestConfig);
            }
            else {
                config = Object.assign({ baseURL: this.url, responseType: "text" }, this.requestConfig);
            }
            config.url = baseurl;
            config.method = xhrmethod;
            config.headers = headers;
            config.data = postdata;
            config.params = getdata;
            // use the fetch adapter if fetch is available e.g. non Node<17 env
            if (typeof fetch !== "undefined") {
                config.adapter = fetchadapter_1.fetchAdapter;
            }
            const resp = yield axios_1.default.request(config);
            // purging all that is axios
            const xhrdata = new apibase_1.RequestResponseData(resp.data, resp.headers, resp.status, resp.statusText, resp.request);
            return xhrdata;
        });
        /**
         * Makes a GET call to an API.
         *
         * @param baseurl Path to the api
         * @param getdata Object containing the key value pairs sent in GET
         * @param headers An array HTTP Request Headers
         * @param axiosConfig Configuration for the axios javascript library that will be the
         * foundation for the rest of the parameters
         *
         * @returns A promise for [[RequestResponseData]]
         */
        this.get = (baseurl, getdata, headers = {}, axiosConfig = undefined) => this._request("GET", baseurl, getdata, {}, this._setHeaders(headers), axiosConfig);
        /**
         * Makes a DELETE call to an API.
         *
         * @param baseurl Path to the API
         * @param getdata Object containing the key value pairs sent in DELETE
         * @param headers An array HTTP Request Headers
         * @param axiosConfig Configuration for the axios javascript library that will be the
         * foundation for the rest of the parameters
         *
         * @returns A promise for [[RequestResponseData]]
         */
        this.delete = (baseurl, getdata, headers = {}, axiosConfig = undefined) => this._request("DELETE", baseurl, getdata, {}, this._setHeaders(headers), axiosConfig);
        /**
         * Makes a POST call to an API.
         *
         * @param baseurl Path to the API
         * @param getdata Object containing the key value pairs sent in POST
         * @param postdata Object containing the key value pairs sent in POST
         * @param headers An array HTTP Request Headers
         * @param axiosConfig Configuration for the axios javascript library that will be the
         * foundation for the rest of the parameters
         *
         * @returns A promise for [[RequestResponseData]]
         */
        this.post = (baseurl, getdata, postdata, headers = {}, axiosConfig = undefined) => this._request("POST", baseurl, getdata, postdata, this._setHeaders(headers), axiosConfig);
        /**
         * Makes a PUT call to an API.
         *
         * @param baseurl Path to the baseurl
         * @param getdata Object containing the key value pairs sent in PUT
         * @param postdata Object containing the key value pairs sent in PUT
         * @param headers An array HTTP Request Headers
         * @param axiosConfig Configuration for the axios javascript library that will be the
         * foundation for the rest of the parameters
         *
         * @returns A promise for [[RequestResponseData]]
         */
        this.put = (baseurl, getdata, postdata, headers = {}, axiosConfig = undefined) => this._request("PUT", baseurl, getdata, postdata, this._setHeaders(headers), axiosConfig);
        /**
         * Makes a PATCH call to an API.
         *
         * @param baseurl Path to the baseurl
         * @param getdata Object containing the key value pairs sent in PATCH
         * @param postdata Object containing the key value pairs sent in PATCH
         * @param parameters Object containing the parameters of the API call
         * @param headers An array HTTP Request Headers
         * @param axiosConfig Configuration for the axios javascript library that will be the
         * foundation for the rest of the parameters
         *
         * @returns A promise for [[RequestResponseData]]
         */
        this.patch = (baseurl, getdata, postdata, headers = {}, axiosConfig = undefined) => this._request("PATCH", baseurl, getdata, postdata, this._setHeaders(headers), axiosConfig);
        this.setNetwork(host, port, protocol, networkID);
    }
}
exports.default = AvalancheCore;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FtaW5vLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NhbWluby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUFBOzs7R0FHRztBQUNILGtEQUtjO0FBRWQsOENBQStEO0FBQy9ELDJDQUE4QztBQUM5QyxnRUFBMkQ7QUFDM0QsdURBQW1EO0FBRW5EOzs7Ozs7Ozs7R0FTRztBQUNILE1BQXFCLGFBQWE7SUFzY2hDOzs7Ozs7O09BT0c7SUFDSCxZQUFZLElBQVksRUFBRSxJQUFZLEVBQUUsUUFBZ0IsRUFBRSxTQUFpQjtRQTdjakUsY0FBUyxHQUFXLENBQUMsQ0FBQTtRQU9yQixTQUFJLEdBQVcsU0FBUyxDQUFBO1FBQ3hCLFlBQU8sR0FBNEIsRUFBRSxDQUFBO1FBQ3JDLGtCQUFhLEdBQXVCLEVBQUUsQ0FBQTtRQUN0QyxTQUFJLEdBQTZCLEVBQUUsQ0FBQTtRQUNuQyxZQUFPLEdBQVksU0FBUyxDQUFBO1FBRXRDOzs7Ozs7Ozs7OztXQVdHO1FBQ0gsZUFBVSxHQUFHLENBQ1gsSUFBWSxFQUNaLElBQVksRUFDWixRQUFnQixFQUNoQixTQUFpQixFQUNqQixlQUF1QixFQUFFLEVBQ25CLEVBQUU7WUFDUixJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyx3QkFBd0IsRUFBRSxFQUFFLENBQUMsQ0FBQTtZQUNqRCxRQUFRLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQyx3QkFBd0IsRUFBRSxFQUFFLENBQUMsQ0FBQTtZQUN6RCxNQUFNLFNBQVMsR0FBYSxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQTtZQUM3QyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsRUFBRTtnQkFDakMsMEJBQTBCO2dCQUMxQixNQUFNLElBQUksc0JBQWEsQ0FDckIsb0RBQW9ELENBQ3JELENBQUE7YUFDRjtZQUVELHlCQUF5QjtZQUN6QixJQUFJLElBQUksQ0FBQyxTQUFTLEtBQUssU0FBUyxJ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QU8sRUFDUCxPQUFPLEVBQ1AsUUFBUSxFQUNSLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLEVBQ3pCLFdBQVcsQ0FDWixDQUFBO1FBRUg7Ozs7Ozs7Ozs7O1dBV0c7UUFDSCxRQUFHLEdBQUcsQ0FDSixPQUFlLEVBQ2YsT0FBZSxFQUNmLFFBQXlELEVBQ3pELFVBQWtCLEVBQUUsRUFDcEIsY0FBa0MsU0FBUyxFQUNiLEVBQUUsQ0FDaEMsSUFBSSxDQUFDLFFBQVEsQ0FDWCxLQUFLLEVBQ0wsT0FBTyxFQUNQLE9BQU8sRUFDUCxRQUFRLEVBQ1IsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsRUFDekIsV0FBVyxDQUNaLENBQUE7UUFFSDs7Ozs7Ozs7Ozs7O1dBWUc7UUFDSCxVQUFLLEdBQUcsQ0FDTixPQUFlLEVBQ2YsT0FBZSxFQUNmLFFBQXlELEVBQ3pELFVBQWtCLEVBQUUsRUFDcEIsY0FBa0MsU0FBUyxFQUNiLEVBQUUsQ0FDaEMsSUFBSSxDQUFDLFFBQVEsQ0FDWCxPQUFPLEVBQ1AsT0FBTyxFQUNQLE9BQU8sRUFDUCxRQUFRLEVBQ1IsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsRUFDekIsV0FBVyxDQUNaLENBQUE7UUFXRCxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLFNBQVMsQ0FBQyxDQUFBO0lBQ2xELENBQUM7Q0FDRjtBQWpkRCxnQ0FpZEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBwYWNrYWdlRG9jdW1lbnRhdGlvblxuICogQG1vZHVsZSBBdmFsYW5jaGVDb3JlXG4gKi9cbmltcG9ydCBheGlvcywge1xuICBBeGlvc1JlcXVlc3RDb25maWcsXG4gIEF4aW9zUmVxdWVzdEhlYWRlcnMsXG4gIEF4aW9zUmVzcG9uc2UsXG4gIE1ldGhvZFxufSBmcm9tIFwiYXhpb3NcIlxuXG5pbXBvcnQgeyBBUElCYXNlLCBSZXF1ZXN0UmVzcG9uc2VEYXRhIH0gZnJvbSBcIi4vY29tbW9uL2FwaWJhc2VcIlxuaW1wb3J0IHsgUHJvdG9jb2xFcnJvciB9IGZyb20gXCIuL3V0aWxzL2Vycm9yc1wiXG5pbXBvcnQgbmV0d29ya3MsIHsgQ2hhaW4sIE5ldHdvcmsgfSBmcm9tIFwiLi91dGlscy9uZXR3b3Jrc1wiXG5pbXBvcnQgeyBmZXRjaEFkYXB0ZXIgfSBmcm9tIFwiLi91dGlscy9mZXRjaGFkYXB0ZXJcIlxuXG4vKipcbiAqIEF2YWxhbmNoZUNvcmUgaXMgbWlkZGxld2FyZSBmb3IgaW50ZXJhY3Rpbmcgd2l0aCBBdmFsYW5jaGUgbm9kZSBSUEMgQVBJcy5cbiAqXG4gKiBFeGFtcGxlIHVzYWdlOlxuICogYGBganNcbiAqIGxldCBhdmFsYW5jaGUgPSBuZXcgQXZhbGFuY2hlQ29yZShcIjEyNy4wLjAuMVwiLCA5NjUwLCBcImh0dHBzXCIpXG4gKiBgYGBcbiAqXG4gKlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBdmFsYW5jaGVDb3JlIHtcbiAgcHJvdGVjdGVkIG5ldHdvcmtJRDogbnVtYmVyID0gMFxuICBwcm90ZWN0ZWQgcHJvdG9jb2w6IHN0cmluZ1xuICBwcm90ZWN0ZWQgaXA6IHN0cmluZ1xuICBwcm90ZWN0ZWQgaG9zdDogc3RyaW5nXG4gIHByb3RlY3RlZCBwb3J0OiBudW1iZXJcbiAgcHJvdGVjdGVkIGJhc2VFbmRwb2ludDogc3RyaW5nXG4gIHByb3RlY3RlZCB1cmw6IHN0cmluZ1xuICBwcm90ZWN0ZWQgYXV0aDogc3RyaW5nID0gdW5kZWZpbmVkXG4gIHByb3RlY3RlZCBoZWFkZXJzOiB7IFtrOiBzdHJpbmddOiBzdHJpbmcgfSA9IHt9XG4gIHByb3RlY3RlZCByZXF1ZXN0Q29uZmlnOiBBeGlvc1JlcXVlc3RDb25maWcgPSB7fVxuICBwcm90ZWN0ZWQgYXBpczogeyBbazogc3RyaW5nXTogQVBJQmFzZSB9ID0ge31cbiAgcHJvdGVjdGVkIG5ldHdvcms6IE5ldHdvcmsgPSB1bmRlZmluZWRcblxuICAvKipcbiAgICogU2V0cyB0aGUgYWRkcmVzcyBhbmQgcG9ydCBvZiB0aGUgbWFpbiBBdmFsYW5jaGUgQ2xpZW50LlxuICAgKlxuICAgKiBAcGFyYW0gaG9zdCBUaGUgaG9zdG5hbWUgdG8gcmVzb2x2ZSB0byByZWFjaCB0aGUgQXZhbGFuY2hlIENsaWVudCBSUEMgQVBJcy5cbiAgICogQHBhcmFtIHBvcnQgVGhlIHBvcnQgdG8gcmVzb2x2ZSB0byByZWFjaCB0aGUgQXZhbGFuY2hlIENsaWVudCBSUEMgQVBJcy5cbiAgICogQHBhcmFtIHByb3RvY29sIFRoZSBwcm90b2NvbCBzdHJpbmcgdG8gdXNlIGJlZm9yZSBhIFwiOi8vXCIgaW4gYSByZXF1ZXN0LFxuICAgKiBleDogXCJodHRwXCIsIFwiaHR0cHNcIiwgZXRjLiBEZWZhdWx0cyB0byBodHRwXG4gICAqIEBwYXJhbSBiYXNlRW5kcG9pbnQgdGhlIGJhc2UgZW5kcG9pbnQgdG8gcmVhY2ggdGhlIEF2YWxhbmNoZSBDbGllbnQgUlBDIEFQSXMsXG4gICAqIGV4OiBcIi9ycGNcIi4gRGVmYXVsdHMgdG8gXCIvXCJcbiAgICogVGhlIGZvbGxvd2luZyBzcGVjaWFsIGNoYXJhY3RlcnMgYXJlIHJlbW92ZWQgZnJvbSBob3N0IGFuZCBwcm90b2NvbFxuICAgKiAmIyxAKygpJH4lJ1wiOio/e30gYWxzbyBsZXNzIHRoYW4gYW5kIGdyZWF0ZXIgdGhhbiBzaWduc1xuICAgKi9cbiAgc2V0TmV0d29yayA9IChcbiAgICBob3N0OiBzdHJpbmcsXG4gICAgcG9ydDogbnVtYmVyLFxuICAgIHByb3RvY29sOiBzdHJpbmcsXG4gICAgbmV0d29ya0lEOiBudW1iZXIsXG4gICAgYmFzZUVuZHBvaW50OiBzdHJpbmcgPSBcIlwiXG4gICk6IHZvaWQgPT4ge1xuICAgIGhvc3QgPSBob3N0LnJlcGxhY2UoL1smIyxAKygpJH4lJ1wiOio/PD57fV0vZywgXCJcIilcbiAgICBwcm90b2NvbCA9IHByb3RvY29sLnJlcGxhY2UoL1smIyxAKygpJH4lJ1wiOio/PD57fV0vZywgXCJcIilcbiAgICBjb25zdCBwcm90b2NvbHM6IHN0cmluZ1tdID0gW1wiaHR0cFwiLCBcImh0dHBzXCJdXG4gICAgaWYgKCFwcm90b2NvbHMuaW5jbHVkZXMocHJvdG9jb2wpKSB7XG4gICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgdGhyb3cgbmV3IFByb3RvY29sRXJyb3IoXG4gICAgICAgIFwiRXJyb3IgLSBBdmFsYW5jaGVDb3JlLnNldEFkZHJlc3M6IEludmFsaWQgcHJvdG9jb2xcIlxuICAgICAgKVxuICAgIH1cblxuICAgIC8vIFJlc2V0IG5ldHdvcmsgc3BlY2lmaWNcbiAgICBpZiAodGhpcy5uZXR3b3JrSUQgIT09IG5ldHdvcmtJRCB8fCAhbmV0d29ya3MuaXNQcmVkZWZpbmVkKG5ldHdvcmtJRCkpIHtcbiAgICAgIHRoaXMubmV0d29yayA9IHVuZGVmaW5lZFxuICAgIH1cblxuICAgIHRoaXMuaG9zdCA9IGhvc3RcbiAgICB0aGlzLnBvcnQgPSBwb3J0XG4gICAgdGhpcy5wcm90b2NvbCA9IHByb3RvY29sXG4gICAgdGhpcy5iYXNlRW5kcG9pbnQgPSBiYXNlRW5kcG9pbnRcbiAgICBsZXQgdXJsOiBzdHJpbmcgPSBgJHtwcm90b2NvbH06Ly8ke2hvc3R9YFxuICAgIGlmIChwb3J0ICE9PSB1bmRlZmluZWQgJiYgdHlwZW9mIHBvcnQgPT09IFwibnVtYmVyXCIgJiYgcG9ydCA+PSAwKSB7XG4gICAgICB1cmwgPSBgJHt1cmx9OiR7cG9ydH1gXG4gICAgfVxuICAgIGlmIChcbiAgICAgIGJhc2VFbmRwb2ludCAhPSB1bmRlZmluZWQgJiZcbiAgICAgIHR5cGVvZiBiYXNlRW5kcG9pbnQgPT0gXCJzdHJpbmdcIiAmJlxuICAgICAgYmFzZUVuZHBvaW50Lmxlbmd0aCA+IDBcbiAgICApIHtcbiAgICAgIGlmIChiYXNlRW5kcG9pbnRbMF0gIT0gXCIvXCIpIHtcbiAgICAgICAgYmFzZUVuZHBvaW50ID0gYC8ke2Jhc2VFbmRwb2ludH1gXG4gICAgICB9XG4gICAgICB1cmwgPSBgJHt1cmx9JHtiYXNlRW5kcG9pbnR9YFxuICAgIH1cbiAgICB0aGlzLnVybCA9IHVybFxuICAgIHRoaXMubmV0d29ya0lEID0gbmV0d29ya0lEXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgbmV0d29yayBjb25maWd1cmF0aW9uLlxuICAgKi9cbiAgZ2V0TmV0d29yayA9ICgpOiBOZXR3b3JrID0+IHRoaXMubmV0d29ya1xuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBuZXR3b3JrIGNoYWlucy5cbiAgICovXG4gIGdldENoYWlucyA9ICgpOiBDaGFpbltdID0+XG4gICAgdGhpcy5uZXR3b3JrXG4gICAgICA/IFtcbiAgICAgICAgICB7IGFsaWFzOiB0aGlzLm5ldHdvcmsuQy5hbGlhcywgaWQ6IHRoaXMubmV0d29yay5DLmJsb2NrY2hhaW5JRCB9LFxuICAgICAgICAgIHsgYWxpYXM6IHRoaXMubmV0d29yay5QLmFsaWFzLCBpZDogdGhpcy5uZXR3b3JrLlAuYmxvY2tjaGFpbklEIH0sXG4gICAgICAgICAgeyBhbGlhczogdGhpcy5uZXR3b3JrLlguYWxpYXMsIGlkOiB0aGlzLm5ldHdvcmsuWC5ibG9ja2NoYWluSUQgfVxuICAgICAgICBdXG4gICAgICA6IFtdXG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHByb3RvY29sIHN1Y2ggYXMgXCJodHRwXCIsIFwiaHR0cHNcIiwgXCJnaXRcIiwgXCJ3c1wiLCBldGMuXG4gICAqL1xuICBnZXRQcm90b2NvbCA9ICgpOiBzdHJpbmcgPT4gdGhpcy5wcm90b2NvbFxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBob3N0IGZvciB0aGUgQXZhbGFuY2hlIG5vZGUuXG4gICAqL1xuICBnZXRIb3N0ID0gKCk6IHN0cmluZyA9PiB0aGlzLmhvc3RcblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgSVAgZm9yIHRoZSBBdmFsYW5jaGUgbm9kZS5cbiAgICovXG4gIGdldElQID0gKCk6IHN0cmluZyA9PiB0aGlzLmhvc3RcblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgcG9ydCBmb3IgdGhlIEF2YWxhbmNoZSBub2RlLlxuICAgKi9cbiAgZ2V0UG9ydCA9ICgpOiBudW1iZXIgPT4gdGhpcy5wb3J0XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGJhc2UgZW5kcG9pbnQgZm9yIHRoZSBBdmFsYW5jaGUgbm9kZS5cbiAgICovXG4gIGdldEJhc2VFbmRwb2ludCA9ICgpOiBzdHJpbmcgPT4gdGhpcy5iYXNlRW5kcG9pbnRcblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgVVJMIG9mIHRoZSBBdmFsYW5jaGUgbm9kZSAoaXAgKyBwb3J0KVxuICAgKi9cbiAgZ2V0VVJMID0gKCk6IHN0cmluZyA9PiB0aGlzLnVybFxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBjdXN0b20gaGVhZGVyc1xuICAgKi9cbiAgZ2V0SGVhZGVycyA9ICgpOiBvYmplY3QgPT4gdGhpcy5oZWFkZXJzXG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGN1c3RvbSByZXF1ZXN0IGNvbmZpZ1xuICAgKi9cbiAgZ2V0UmVxdWVzdENvbmZpZyA9ICgpOiBBeGlvc1JlcXVlc3RDb25maWcgPT4gdGhpcy5yZXF1ZXN0Q29uZmlnXG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIG5ldHdvcmtJRFxuICAgKi9cbiAgZ2V0TmV0d29ya0lEID0gKCk6IG51bWJlciA9PiB0aGlzLm5ldHdvcmtJRFxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBIdW1hbi1SZWFkYWJsZS1QYXJ0IG9mIHRoZSBuZXR3b3JrIGFzc29jaWF0ZWQgd2l0aCB0aGlzIGtleS5cbiAgICpcbiAgICogQHJldHVybnMgVGhlIFtbS2V5UGFpcl1dJ3MgSHVtYW4tUmVhZGFibGUtUGFydCBvZiB0aGUgbmV0d29yaydzIEJlY2gzMiBhZGRyZXNzaW5nIHNjaGVtZVxuICAgKi9cbiAgZ2V0SFJQID0gKCk6IHN0cmluZyA9PiB0aGlzLm5ldHdvcmsuaHJwXG5cbiAgLyoqXG4gICAqIEFkZHMgYSBuZXcgY3VzdG9tIGhlYWRlciB0byBiZSBpbmNsdWRlZCB3aXRoIGFsbCByZXF1ZXN0cy5cbiAgICpcbiAgICogQHBhcmFtIGtleSBIZWFkZXIgbmFtZVxuICAgKiBAcGFyYW0gdmFsdWUgSGVhZGVyIHZhbHVlXG4gICAqL1xuICBzZXRIZWFkZXIgPSAoa2V5OiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpOiB2b2lkID0+IHtcbiAgICB0aGlzLmhlYWRlcnNbYCR7a2V5fWBdID0gdmFsdWVcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIGEgcHJldmlvdXNseSBhZGRlZCBjdXN0b20gaGVhZGVyLlxuICAgKlxuICAgKiBAcGFyYW0ga2V5IEhlYWRlciBuYW1lXG4gICAqL1xuICByZW1vdmVIZWFkZXIgPSAoa2V5OiBzdHJpbmcpOiB2b2lkID0+IHtcbiAgICBkZWxldGUgdGhpcy5oZWFkZXJzW2Ake2tleX1gXVxuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgYWxsIGhlYWRlcnMuXG4gICAqL1xuICByZW1vdmVBbGxIZWFkZXJzID0gKCk6IHZvaWQgPT4ge1xuICAgIGZvciAoY29uc3QgcHJvcCBpbiB0aGlzLmhlYWRlcnMpIHtcbiAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodGhpcy5oZWFkZXJzLCBwcm9wKSkge1xuICAgICAgICBkZWxldGUgdGhpcy5oZWFkZXJzW2Ake3Byb3B9YF1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBhIG5ldyBjdXN0b20gY29uZmlnIHZhbHVlIHRvIGJlIGluY2x1ZGVkIHdpdGggYWxsIHJlcXVlc3RzLlxuICAgKlxuICAgKiBAcGFyYW0ga2V5IENvbmZpZyBuYW1lXG4gICAqIEBwYXJhbSB2YWx1ZSBDb25maWcgdmFsdWVcbiAgICovXG4gIHNldFJlcXVlc3RDb25maWcgPSAoa2V5OiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcgfCBib29sZWFuKTogdm9pZCA9PiB7XG4gICAgdGhpcy5yZXF1ZXN0Q29uZmlnW2Ake2tleX1gXSA9IHZhbHVlXG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlcyBhIHByZXZpb3VzbHkgYWRkZWQgcmVxdWVzdCBjb25maWcuXG4gICAqXG4gICAqIEBwYXJhbSBrZXkgSGVhZGVyIG5hbWVcbiAgICovXG4gIHJlbW92ZVJlcXVlc3RDb25maWcgPSAoa2V5OiBzdHJpbmcpOiB2b2lkID0+IHtcbiAgICBkZWxldGUgdGhpcy5yZXF1ZXN0Q29uZmlnW2Ake2tleX1gXVxuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgYWxsIHJlcXVlc3QgY29uZmlncy5cbiAgICovXG4gIHJlbW92ZUFsbFJlcXVlc3RDb25maWdzID0gKCk6IHZvaWQgPT4ge1xuICAgIGZvciAoY29uc3QgcHJvcCBpbiB0aGlzLnJlcXVlc3RDb25maWcpIHtcbiAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodGhpcy5yZXF1ZXN0Q29uZmlnLCBwcm9wKSkge1xuICAgICAgICBkZWxldGUgdGhpcy5yZXF1ZXN0Q29uZmlnW2Ake3Byb3B9YF1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgdGVtcG9yYXJ5IGF1dGggdG9rZW4gdXNlZCBmb3IgY29tbXVuaWNhdGluZyB3aXRoIHRoZSBub2RlLlxuICAgKlxuICAgKiBAcGFyYW0gYXV0aCBBIHRlbXBvcmFyeSB0b2tlbiBwcm92aWRlZCBieSB0aGUgbm9kZSBlbmFibGluZyBhY2Nlc3MgdG8gdGhlIGVuZHBvaW50cyBvbiB0aGUgbm9kZS5cbiAgICovXG4gIHNldEF1dGhUb2tlbiA9IChhdXRoOiBzdHJpbmcpOiB2b2lkID0+IHtcbiAgICB0aGlzLmF1dGggPSBhdXRoXG4gIH1cblxuICBwcm90ZWN0ZWQgX3NldEhlYWRlcnMgPSAoaGVhZGVyczogYW55KTogQXhpb3NSZXF1ZXN0SGVhZGVycyA9PiB7XG4gICAgaWYgKHR5cGVvZiB0aGlzLmhlYWRlcnMgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKHRoaXMuaGVhZGVycykpIHtcbiAgICAgICAgaGVhZGVyc1tgJHtrZXl9YF0gPSB2YWx1ZVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0eXBlb2YgdGhpcy5hdXRoID09PSBcInN0cmluZ1wiKSB7XG4gICAgICBoZWFkZXJzLkF1dGhvcml6YXRpb24gPSBgQmVhcmVyICR7dGhpcy5hdXRofWBcbiAgICB9XG4gICAgcmV0dXJuIGhlYWRlcnNcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBwcmltYXJ5IGFzc2V0IGFsaWFzLlxuICAgKi9cbiAgZ2V0UHJpbWFyeUFzc2V0QWxpYXMgPSAoKTogc3RyaW5nID0+IHtcbiAgICByZXR1cm4gdGhpcy5uZXR3b3JrLlguYXZheEFzc2V0QWxpYXNcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGFuIEFQSSB0byB0aGUgbWlkZGxld2FyZS4gVGhlIEFQSSByZXNvbHZlcyB0byBhIHJlZ2lzdGVyZWQgYmxvY2tjaGFpbidzIFJQQy5cbiAgICpcbiAgICogSW4gVHlwZVNjcmlwdDpcbiAgICogYGBganNcbiAgICogYXZhbGFuY2hlLmFkZEFQSTxNeVZNQ2xhc3M+KFwibXljaGFpblwiLCBNeVZNQ2xhc3MsIFwiL2V4dC9iYy9teWNoYWluXCIpXG4gICAqIGBgYFxuICAgKlxuICAgKiBJbiBKYXZhc2NyaXB0OlxuICAgKiBgYGBqc1xuICAgKiBhdmFsYW5jaGUuYWRkQVBJKFwibXljaGFpblwiLCBNeVZNQ2xhc3MsIFwiL2V4dC9iYy9teWNoYWluXCIpXG4gICAqIGBgYFxuICAgKlxuICAgKiBAdHlwZXBhcmFtIEdBIENsYXNzIG9mIHRoZSBBUEkgYmVpbmcgYWRkZWRcbiAgICogQHBhcmFtIGFwaU5hbWUgQSBsYWJlbCBmb3IgcmVmZXJlbmNpbmcgdGhlIEFQSSBpbiB0aGUgZnV0dXJlXG4gICAqIEBwYXJhbSBDb25zdHJ1Y3RvckZOIEEgcmVmZXJlbmNlIHRvIHRoZSBjbGFzcyB3aGljaCBpbnN0YW50aWF0ZXMgdGhlIEFQSVxuICAgKiBAcGFyYW0gYmFzZXVybCBQYXRoIHRvIHJlc29sdmUgdG8gcmVhY2ggdGhlIEFQSVxuICAgKlxuICAgKi9cbiAgYWRkQVBJID0gPEdBIGV4dGVuZHMgQVBJQmFzZT4oXG4gICAgYXBpTmFtZTogc3RyaW5nLFxuICAgIENvbnN0cnVjdG9yRk46IG5ldyAoXG4gICAgICBhdmF4OiBBdmFsYW5jaGVDb3JlLFxuICAgICAgYmFzZXVybD86IHN0cmluZyxcbiAgICAgIC4uLmFyZ3M6IGFueVtdXG4gICAgKSA9PiBHQSxcbiAgICBiYXNldXJsOiBzdHJpbmcgPSB1bmRlZmluZWQsXG4gICAgLi4uYXJnczogYW55W11cbiAgKSA9PiB7XG4gICAgaWYgKHR5cGVvZiBiYXNldXJsID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICB0aGlzLmFwaXNbYCR7YXBpTmFtZX1gXSA9IG5ldyBDb25zdHJ1Y3RvckZOKHRoaXMsIHVuZGVmaW5lZCwgLi4uYXJncylcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5hcGlzW2Ake2FwaU5hbWV9YF0gPSBuZXcgQ29uc3RydWN0b3JGTih0aGlzLCBiYXNldXJsLCAuLi5hcmdzKVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXRyaWV2ZXMgYSByZWZlcmVuY2UgdG8gYW4gQVBJIGJ5IGl0cyBhcGlOYW1lIGxhYmVsLlxuICAgKlxuICAgKiBAcGFyYW0gYXBpTmFtZSBOYW1lIG9mIHRoZSBBUEkgdG8gcmV0dXJuXG4gICAqL1xuICBhcGkgPSA8R0EgZXh0ZW5kcyBBUElCYXNlPihhcGlOYW1lOiBzdHJpbmcpOiBHQSA9PlxuICAgIHRoaXMuYXBpc1tgJHthcGlOYW1lfWBdIGFzIEdBXG5cbiAgLyoqXG4gICAqIEBpZ25vcmVcbiAgICovXG4gIHByb3RlY3RlZCBfcmVxdWVzdCA9IGFzeW5jIChcbiAgICB4aHJtZXRob2Q6IE1ldGhvZCxcbiAgICBiYXNldXJsOiBzdHJpbmcsXG4gICAgZ2V0ZGF0YTogb2JqZWN0LFxuICAgIHBvc3RkYXRhOiBzdHJpbmcgfCBvYmplY3QgfCBBcnJheUJ1ZmZlciB8IEFycmF5QnVmZmVyVmlldyxcbiAgICBoZWFkZXJzOiBBeGlvc1JlcXVlc3RIZWFkZXJzID0ge30sXG4gICAgYXhpb3NDb25maWc6IEF4aW9zUmVxdWVzdENvbmZpZyA9IHVuZGVmaW5lZFxuICApOiBQcm9taXNlPFJlcXVlc3RSZXNwb25zZURhdGE+ID0+IHtcbiAgICBsZXQgY29uZmlnOiBBeGlvc1JlcXVlc3RDb25maWdcbiAgICBpZiAoYXhpb3NDb25maWcpIHtcbiAgICAgIGNvbmZpZyA9IHtcbiAgICAgICAgLi4uYXhpb3NDb25maWcsXG4gICAgICAgIC4uLnRoaXMucmVxdWVzdENvbmZpZ1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25maWcgPSB7XG4gICAgICAgIGJhc2VVUkw6IHRoaXMudXJsLFxuICAgICAgICByZXNwb25zZVR5cGU6IFwidGV4dFwiLFxuICAgICAgICAuLi50aGlzLnJlcXVlc3RDb25maWdcbiAgICAgIH1cbiAgICB9XG4gICAgY29uZmlnLnVybCA9IGJhc2V1cmxcbiAgICBjb25maWcubWV0aG9kID0geGhybWV0aG9kXG4gICAgY29uZmlnLmhlYWRlcnMgPSBoZWFkZXJzXG4gICAgY29uZmlnLmRhdGEgPSBwb3N0ZGF0YVxuICAgIGNvbmZpZy5wYXJhbXMgPSBnZXRkYXRhXG4gICAgLy8gdXNlIHRoZSBmZXRjaCBhZGFwdGVyIGlmIGZldGNoIGlzIGF2YWlsYWJsZSBlLmcuIG5vbiBOb2RlPDE3IGVudlxuICAgIGlmICh0eXBlb2YgZmV0Y2ggIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIGNvbmZpZy5hZGFwdGVyID0gZmV0Y2hBZGFwdGVyXG4gICAgfVxuICAgIGNvbnN0IHJlc3A6IEF4aW9zUmVzcG9uc2U8YW55PiA9IGF3YWl0IGF4aW9zLnJlcXVlc3QoY29uZmlnKVxuICAgIC8vIHB1cmdpbmcgYWxsIHRoYXQgaXMgYXhpb3NcbiAgICBjb25zdCB4aHJkYXRhOiBSZXF1ZXN0UmVzcG9uc2VEYXRhID0gbmV3IFJlcXVlc3RSZXNwb25zZURhdGEoXG4gICAgICByZXNwLmRhdGEsXG4gICAgICByZXNwLmhlYWRlcnMsXG4gICAgICByZXNwLnN0YXR1cyxcbiAgICAgIHJlc3Auc3RhdHVzVGV4dCxcbiAgICAgIHJlc3AucmVxdWVzdFxuICAgIClcbiAgICByZXR1cm4geGhyZGF0YVxuICB9XG5cbiAgLyoqXG4gICAqIE1ha2VzIGEgR0VUIGNhbGwgdG8gYW4gQVBJLlxuICAgKlxuICAgKiBAcGFyYW0gYmFzZXVybCBQYXRoIHRvIHRoZSBhcGlcbiAgICogQHBhcmFtIGdldGRhdGEgT2JqZWN0IGNvbnRhaW5pbmcgdGhlIGtleSB2YWx1ZSBwYWlycyBzZW50IGluIEdFVFxuICAgKiBAcGFyYW0gaGVhZGVycyBBbiBhcnJheSBIVFRQIFJlcXVlc3QgSGVhZGVyc1xuICAgKiBAcGFyYW0gYXhpb3NDb25maWcgQ29uZmlndXJhdGlvbiBmb3IgdGhlIGF4aW9zIGphdmFzY3JpcHQgbGlicmFyeSB0aGF0IHdpbGwgYmUgdGhlXG4gICAqIGZvdW5kYXRpb24gZm9yIHRoZSByZXN0IG9mIHRoZSBwYXJhbWV0ZXJzXG4gICAqXG4gICAqIEByZXR1cm5zIEEgcHJvbWlzZSBmb3IgW1tSZXF1ZXN0UmVzcG9uc2VEYXRhXV1cbiAgICovXG4gIGdldCA9IChcbiAgICBiYXNldXJsOiBzdHJpbmcsXG4gICAgZ2V0ZGF0YTogb2JqZWN0LFxuICAgIGhlYWRlcnM6IG9iamVjdCA9IHt9LFxuICAgIGF4aW9zQ29uZmlnOiBBeGlvc1JlcXVlc3RDb25maWcgPSB1bmRlZmluZWRcbiAgKTogUHJvbWlzZTxSZXF1ZXN0UmVzcG9uc2VEYXRhPiA9PlxuICAgIHRoaXMuX3JlcXVlc3QoXG4gICAgICBcIkdFVFwiLFxuICAgICAgYmFzZXVybCxcbiAgICAgIGdldGRhdGEsXG4gICAgICB7fSxcbiAgICAgIHRoaXMuX3NldEhlYWRlcnMoaGVhZGVycyksXG4gICAgICBheGlvc0NvbmZpZ1xuICAgIClcblxuICAvKipcbiAgICogTWFrZXMgYSBERUxFVEUgY2FsbCB0byBhbiBBUEkuXG4gICAqXG4gICAqIEBwYXJhbSBiYXNldXJsIFBhdGggdG8gdGhlIEFQSVxuICAgKiBAcGFyYW0gZ2V0ZGF0YSBPYmplY3QgY29udGFpbmluZyB0aGUga2V5IHZhbHVlIHBhaXJzIHNlbnQgaW4gREVMRVRFXG4gICAqIEBwYXJhbSBoZWFkZXJzIEFuIGFycmF5IEhUVFAgUmVxdWVzdCBIZWFkZXJzXG4gICAqIEBwYXJhbSBheGlvc0NvbmZpZyBDb25maWd1cmF0aW9uIGZvciB0aGUgYXhpb3MgamF2YXNjcmlwdCBsaWJyYXJ5IHRoYXQgd2lsbCBiZSB0aGVcbiAgICogZm91bmRhdGlvbiBmb3IgdGhlIHJlc3Qgb2YgdGhlIHBhcmFtZXRlcnNcbiAgICpcbiAgICogQHJldHVybnMgQSBwcm9taXNlIGZvciBbW1JlcXVlc3RSZXNwb25zZURhdGFdXVxuICAgKi9cbiAgZGVsZXRlID0gKFxuICAgIGJhc2V1cmw6IHN0cmluZyxcbiAgICBnZXRkYXRhOiBvYmplY3QsXG4gICAgaGVhZGVyczogb2JqZWN0ID0ge30sXG4gICAgYXhpb3NDb25maWc6IEF4aW9zUmVxdWVzdENvbmZpZyA9IHVuZGVmaW5lZFxuICApOiBQcm9taXNlPFJlcXVlc3RSZXNwb25zZURhdGE+ID0+XG4gICAgdGhpcy5fcmVxdWVzdChcbiAgICAgIFwiREVMRVRFXCIsXG4gICAgICBiYXNldXJsLFxuICAgICAgZ2V0ZGF0YSxcbiAgICAgIHt9LFxuICAgICAgdGhpcy5fc2V0SGVhZGVycyhoZWFkZXJzKSxcbiAgICAgIGF4aW9zQ29uZmlnXG4gICAgKVxuXG4gIC8qKlxuICAgKiBNYWtlcyBhIFBPU1QgY2FsbCB0byBhbiBBUEkuXG4gICAqXG4gICAqIEBwYXJhbSBiYXNldXJsIFBhdGggdG8gdGhlIEFQSVxuICAgKiBAcGFyYW0gZ2V0ZGF0YSBPYmplY3QgY29udGFpbmluZyB0aGUga2V5IHZhbHVlIHBhaXJzIHNlbnQgaW4gUE9TVFxuICAgKiBAcGFyYW0gcG9zdGRhdGEgT2JqZWN0IGNvbnRhaW5pbmcgdGhlIGtleSB2YWx1ZSBwYWlycyBzZW50IGluIFBPU1RcbiAgICogQHBhcmFtIGhlYWRlcnMgQW4gYXJyYXkgSFRUUCBSZXF1ZXN0IEhlYWRlcnNcbiAgICogQHBhcmFtIGF4aW9zQ29uZmlnIENvbmZpZ3VyYXRpb24gZm9yIHRoZSBheGlvcyBqYXZhc2NyaXB0IGxpYnJhcnkgdGhhdCB3aWxsIGJlIHRoZVxuICAgKiBmb3VuZGF0aW9uIGZvciB0aGUgcmVzdCBvZiB0aGUgcGFyYW1ldGVyc1xuICAgKlxuICAgKiBAcmV0dXJucyBBIHByb21pc2UgZm9yIFtbUmVxdWVzdFJlc3BvbnNlRGF0YV1dXG4gICAqL1xuICBwb3N0ID0gKFxuICAgIGJhc2V1cmw6IHN0cmluZyxcbiAgICBnZXRkYXRhOiBvYmplY3QsXG4gICAgcG9zdGRhdGE6IHN0cmluZyB8IG9iamVjdCB8IEFycmF5QnVmZmVyIHwgQXJyYXlCdWZmZXJWaWV3LFxuICAgIGhlYWRlcnM6IG9iamVjdCA9IHt9LFxuICAgIGF4aW9zQ29uZmlnOiBBeGlvc1JlcXVlc3RDb25maWcgPSB1bmRlZmluZWRcbiAgKTogUHJvbWlzZTxSZXF1ZXN0UmVzcG9uc2VEYXRhPiA9PlxuICAgIHRoaXMuX3JlcXVlc3QoXG4gICAgICBcIlBPU1RcIixcbiAgICAgIGJhc2V1cmwsXG4gICAgICBnZXRkYXRhLFxuICAgICAgcG9zdGRhdGEsXG4gICAgICB0aGlzLl9zZXRIZWFkZXJzKGhlYWRlcnMpLFxuICAgICAgYXhpb3NDb25maWdcbiAgICApXG5cbiAgLyoqXG4gICAqIE1ha2VzIGEgUFVUIGNhbGwgdG8gYW4gQVBJLlxuICAgKlxuICAgKiBAcGFyYW0gYmFzZXVybCBQYXRoIHRvIHRoZSBiYXNldXJsXG4gICAqIEBwYXJhbSBnZXRkYXRhIE9iamVjdCBjb250YWluaW5nIHRoZSBrZXkgdmFsdWUgcGFpcnMgc2VudCBpbiBQVVRcbiAgICogQHBhcmFtIHBvc3RkYXRhIE9iamVjdCBjb250YWluaW5nIHRoZSBrZXkgdmFsdWUgcGFpcnMgc2VudCBpbiBQVVRcbiAgICogQHBhcmFtIGhlYWRlcnMgQW4gYXJyYXkgSFRUUCBSZXF1ZXN0IEhlYWRlcnNcbiAgICogQHBhcmFtIGF4aW9zQ29uZmlnIENvbmZpZ3VyYXRpb24gZm9yIHRoZSBheGlvcyBqYXZhc2NyaXB0IGxpYnJhcnkgdGhhdCB3aWxsIGJlIHRoZVxuICAgKiBmb3VuZGF0aW9uIGZvciB0aGUgcmVzdCBvZiB0aGUgcGFyYW1ldGVyc1xuICAgKlxuICAgKiBAcmV0dXJucyBBIHByb21pc2UgZm9yIFtbUmVxdWVzdFJlc3BvbnNlRGF0YV1dXG4gICAqL1xuICBwdXQgPSAoXG4gICAgYmFzZXVybDogc3RyaW5nLFxuICAgIGdldGRhdGE6IG9iamVjdCxcbiAgICBwb3N0ZGF0YTogc3RyaW5nIHwgb2JqZWN0IHwgQXJyYXlCdWZmZXIgfCBBcnJheUJ1ZmZlclZpZXcsXG4gICAgaGVhZGVyczogb2JqZWN0ID0ge30sXG4gICAgYXhpb3NDb25maWc6IEF4aW9zUmVxdWVzdENvbmZpZyA9IHVuZGVmaW5lZFxuICApOiBQcm9taXNlPFJlcXVlc3RSZXNwb25zZURhdGE+ID0+XG4gICAgdGhpcy5fcmVxdWVzdChcbiAgICAgIFwiUFVUXCIsXG4gICAgICBiYXNldXJsLFxuICAgICAgZ2V0ZGF0YSxcbiAgICAgIHBvc3RkYXRhLFxuICAgICAgdGhpcy5fc2V0SGVhZGVycyhoZWFkZXJzKSxcbiAgICAgIGF4aW9zQ29uZmlnXG4gICAgKVxuXG4gIC8qKlxuICAgKiBNYWtlcyBhIFBBVENIIGNhbGwgdG8gYW4gQVBJLlxuICAgKlxuICAgKiBAcGFyYW0gYmFzZXVybCBQYXRoIHRvIHRoZSBiYXNldXJsXG4gICAqIEBwYXJhbSBnZXRkYXRhIE9iamVjdCBjb250YWluaW5nIHRoZSBrZXkgdmFsdWUgcGFpcnMgc2VudCBpbiBQQVRDSFxuICAgKiBAcGFyYW0gcG9zdGRhdGEgT2JqZWN0IGNvbnRhaW5pbmcgdGhlIGtleSB2YWx1ZSBwYWlycyBzZW50IGluIFBBVENIXG4gICAqIEBwYXJhbSBwYXJhbWV0ZXJzIE9iamVjdCBjb250YWluaW5nIHRoZSBwYXJhbWV0ZXJzIG9mIHRoZSBBUEkgY2FsbFxuICAgKiBAcGFyYW0gaGVhZGVycyBBbiBhcnJheSBIVFRQIFJlcXVlc3QgSGVhZGVyc1xuICAgKiBAcGFyYW0gYXhpb3NDb25maWcgQ29uZmlndXJhdGlvbiBmb3IgdGhlIGF4aW9zIGphdmFzY3JpcHQgbGlicmFyeSB0aGF0IHdpbGwgYmUgdGhlXG4gICAqIGZvdW5kYXRpb24gZm9yIHRoZSByZXN0IG9mIHRoZSBwYXJhbWV0ZXJzXG4gICAqXG4gICAqIEByZXR1cm5zIEEgcHJvbWlzZSBmb3IgW1tSZXF1ZXN0UmVzcG9uc2VEYXRhXV1cbiAgICovXG4gIHBhdGNoID0gKFxuICAgIGJhc2V1cmw6IHN0cmluZyxcbiAgICBnZXRkYXRhOiBvYmplY3QsXG4gICAgcG9zdGRhdGE6IHN0cmluZyB8IG9iamVjdCB8IEFycmF5QnVmZmVyIHwgQXJyYXlCdWZmZXJWaWV3LFxuICAgIGhlYWRlcnM6IG9iamVjdCA9IHt9LFxuICAgIGF4aW9zQ29uZmlnOiBBeGlvc1JlcXVlc3RDb25maWcgPSB1bmRlZmluZWRcbiAgKTogUHJvbWlzZTxSZXF1ZXN0UmVzcG9uc2VEYXRhPiA9PlxuICAgIHRoaXMuX3JlcXVlc3QoXG4gICAgICBcIlBBVENIXCIsXG4gICAgICBiYXNldXJsLFxuICAgICAgZ2V0ZGF0YSxcbiAgICAgIHBvc3RkYXRhLFxuICAgICAgdGhpcy5fc2V0SGVhZGVycyhoZWFkZXJzKSxcbiAgICAgIGF4aW9zQ29uZmlnXG4gICAgKVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IEF2YWxhbmNoZSBpbnN0YW5jZS4gU2V0cyB0aGUgYWRkcmVzcyBhbmQgcG9ydCBvZiB0aGUgbWFpbiBBdmFsYW5jaGUgQ2xpZW50LlxuICAgKlxuICAgKiBAcGFyYW0gaG9zdCBUaGUgaG9zdG5hbWUgdG8gcmVzb2x2ZSB0byByZWFjaCB0aGUgQXZhbGFuY2hlIENsaWVudCBBUElzXG4gICAqIEBwYXJhbSBwb3J0IFRoZSBwb3J0IHRvIHJlc29sdmUgdG8gcmVhY2ggdGhlIEF2YWxhbmNoZSBDbGllbnQgQVBJc1xuICAgKiBAcGFyYW0gcHJvdG9jb2wgVGhlIHByb3RvY29sIHN0cmluZyB0byB1c2UgYmVmb3JlIGEgXCI6Ly9cIiBpbiBhIHJlcXVlc3QsIGV4OiBcImh0dHBcIiwgXCJodHRwc1wiLCBcImdpdFwiLCBcIndzXCIsIGV0YyAuLi5cbiAgICogQHBhcmFtIG5ldHdvcmtJRCBUaGUgbmV0d29ya0lEIG9mIHRoZSBuZXR3b3JrIFVSTCBiZWxvbmdzIHRvXG4gICAqL1xuICBjb25zdHJ1Y3Rvcihob3N0OiBzdHJpbmcsIHBvcnQ6IG51bWJlciwgcHJvdG9jb2w6IHN0cmluZywgbmV0d29ya0lEOiBudW1iZXIpIHtcbiAgICB0aGlzLnNldE5ldHdvcmsoaG9zdCwgcG9ydCwgcHJvdG9jb2wsIG5ldHdvcmtJRClcbiAgfVxufVxuIl19
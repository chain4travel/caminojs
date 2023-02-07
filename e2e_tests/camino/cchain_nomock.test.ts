import { getAvalanche, createTests, Matcher } from "../e2etestlib"
import { KeystoreAPI } from "src/apis/keystore/api"
import BN from "bn.js"
import Avalanche from "src"
import { EVMAPI } from "src/apis/evm"
import {ExamplesConfig} from "../../examples/common/examplesConfig";

const avalanche = getAvalanche()
let keystore: KeystoreAPI
let tx = { value: "" }
let cChain: any

const config: ExamplesConfig = require("../camino/common/caminoConfig.json")
const path: string = "/ext/bc/C/rpc"
const Web3 = require('web3')
const web3 = new Web3(
    `${config.protocol}://${config.host}:${config.port}${path}`
)

beforeAll(async () => {
    await avalanche.fetchNetworkSettings()
    keystore = new KeystoreAPI(avalanche)
})
describe("CChain", (): void => {
    const user: string = "avalancheJsCChainUser"
    const passwd: string = "avalancheJsP@ssw4rd"
    const badUser: string = "asdfasdfsa"
    const badPass: string = "pass"
    const memo: string = "hello world"
    const cchain: EVMAPI = avalanche.CChain()
    const whaleAddr: string = "0x8db97C7cEcE249c2b98bDC0226Cc4C2A57BF52FC"
    const adminAddress: string =
        "X-kopernikus1g65uqn6t77p656w64023nh8nd9updzmxh8ttv3"
    const key: string =
        "PrivateKey-vmRQiZeXEXYMyJhEiqdC2z5JhuDbxL8ix9UVvjgMu2Er1NepE"

    const fs = require("fs");
    const path = require("path");

    const filePath = path.join(__dirname, "CaminoAdmin.abi");
    let ABI = [];

    fs.readFile(filePath, "utf8", (err, data) => {
        if (err) throw err;
        ABI = JSON.parse(data);
    });

    // const web3 = new Web3(Web3.givenProvider || 'http://localhost:8545');

    const contractAddr = "0x010000000000000000000000000000000000000a"
    // const contractAddress = '0x123456789abcdef' // The address of your deployed smart contract
    const contract = new web3.eth.Contract(ABI, contractAddr) // ABI is the compiled smart contract ABI

    // testName, promise, preprocess, matcher, expected
    const tests_spec: any = [
        [
            "callSmartContractFunction",
            () => contract.methods.role.grantRole().call(),
            (x) => x,
            Matcher.toEqual,
            () => "expected result"
        ]
        // [
        //     "createUser",
        //     () => keystore.createUser(user, passwd),
        //     (x) => x,
        //     Matcher.toEqual,
        //     () => {
        //         return {}
        //     }
        // ],
        // [
        //     "importKey",
        //     () => cchain.importKey(user, passwd, key),
        //     (x) => x,
        //     Matcher.toBe,
        //     () => whaleAddr
        // ],
        // [
        //     "deleteUser",
        //     () => keystore.deleteUser(user, passwd),
        //     (x) => x,
        //     Matcher.toEqual,
        //     () => {
        //         return {}
        //     }
        // ],
    ]

    createTests(tests_spec)
})
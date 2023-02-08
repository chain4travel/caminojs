import { getAvalanche, createTests, Matcher } from "../e2etestlib"
import { KeystoreAPI } from "src/apis/keystore/api"
import { EVMAPI } from "src/apis/evm"
import { ExamplesConfig } from "../../examples/common/examplesConfig"

const avalanche = getAvalanche()
let keystore: KeystoreAPI
let tx = { value: "" }
let cChain: any

let ABI = []
let web3: any
let contract: any

beforeAll(async () => {
  await avalanche.fetchNetworkSettings()
  keystore = new KeystoreAPI(avalanche)
  const Web3 = require("web3")
  web3 = new Web3("http://localhost:9650/ext/bc/C/rpc")
  const fs = require("fs")
  const path = require("path")

  const filePath = path.join(__dirname, "CaminoAdmin.abi")

  ABI = JSON.parse(fs.readFileSync(filePath, "utf8"))
  const contractAddr = "0x010000000000000000000000000000000000000b"
  contract = new web3.eth.Contract(ABI, contractAddr) // ABI is the compiled smart contract ABI
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

  const tests_spec: any = [
    [
      "callSmartContractFunction",
      () => contract.methods.getBaseFee().call(),
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

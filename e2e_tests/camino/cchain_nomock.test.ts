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

  const filePath = path.join(__dirname, "abi/CaminoAdmin.abi")

  // ABI = JSON.parse(fs.readFileSync(filePath, "utf8"))
  ABI = [{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"addr","type":"address"},{"indexed":false,"internalType":"uint256","name":"role","type":"uint256"}],"name":"DropRole","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"newGasFee","type":"uint256"}],"name":"GasFeeSet","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"account","type":"address"},{"indexed":false,"internalType":"uint256","name":"oldState","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"newState","type":"uint256"}],"name":"KycStateChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"addr","type":"address"},{"indexed":false,"internalType":"uint256","name":"role","type":"uint256"}],"name":"SetRole","type":"event"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"bool","name":"remove","type":"bool"},{"internalType":"uint256","name":"state","type":"uint256"}],"name":"applyKycState","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"getBaseFee","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"bytes4","name":"signature","type":"bytes4"}],"name":"getBlacklistState","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"getKycState","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"addr","type":"address"}],"name":"getRoles","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"addr","type":"address"},{"internalType":"uint256","name":"role","type":"uint256"}],"name":"grantRole","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"addr","type":"address"},{"internalType":"uint256","name":"role","type":"uint256"}],"name":"hasRole","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"addr","type":"address"},{"internalType":"uint256","name":"role","type":"uint256"}],"name":"revokeRole","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"newFee","type":"uint256"}],"name":"setBaseFee","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"bytes4","name":"signature","type":"bytes4"},{"internalType":"uint256","name":"state","type":"uint256"}],"name":"setBlacklistState","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newImplementation","type":"address"}],"name":"upgrade","outputs":[],"stateMutability":"nonpayable","type":"function"}]
  const contractAddr = "0x010000000000000000000000000000000000000a"
  contract = new web3.eth.Contract(ABI, contractAddr) // ABI is the compiled smart contract ABI
})

describe("CChain", (): void => {
  const adminAddress: string =
    "0x1f0e5c64afdf53175f78846f7125776e76fa8f34" // must start with 0x
  const kycAddr: string =
      "0x3335a59d12522e20E045Bf5A7f46805CdD5d8445"
  const gasFeeAddr: string =
      "0xf30A41d8997983bfcda937dE072E3c3F73cf765f"
  const blacklistAddr: string =
      "0xb5c92c8CA0f24556484f9Cbd3010016abB519F47"
  const key: string =
    "PrivateKey-vmRQiZeXEXYMyJhEiqdC2z5JhuDbxL8ix9UVvjgMu2Er1NepE"

  // testName, promise, preprocess, matcher, expected
  const tests_spec: any = [
    [
      "callSmartContractFunction",
      () => contract.methods.getBaseFee().call(),
      (x) => x,
      Matcher.toEqual,
      () => "0"
    ],
    [
      "getRoles adminAddress",
      () => contract.methods.getRoles(adminAddress).call(),
      (x) => x,
      Matcher.toEqual,
      () => "0"
    ],
    [
      "getRoles kycAddr",
      () => contract.methods.getRoles(kycAddr).call(),
      (x) => x,
      Matcher.toEqual,
      () => "0"
    ],
    [
      "hasRole",
      () => contract.methods.hasRole(adminAddress, 1).call(),
      (x) => x,
      Matcher.toEqual,
      () => false
    ],
    [
      "test call",
      () => contract.methods.grantRole(kycAddr, 2).send({ from: adminAddress}),
      (x) => x,
      Matcher.toEqual,
      () => "0"
    ]
  ]

  createTests(tests_spec)
})

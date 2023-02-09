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
  const contractAddr = "0x010000000000000000000000000000000000000b"
  contract = new web3.eth.Contract(ABI, contractAddr) // ABI is the compiled smart contract ABI
})

describe("CChain", (): void => {
  const adminAddress: string =
    "0x0000000000000000000000000000000000000000" // must start with 0x
  const key: string =
    "PrivateKey-vmRQiZeXEXYMyJhEiqdC2z5JhuDbxL8ix9UVvjgMu2Er1NepE"


  // contract.methods.grantRole(adminAddress, 1).call()

  const tests_spec: any = [
    [
      "callSmartContractFunction",
      () => contract.methods.getBaseFee().call(),
      (x) => x,
      Matcher.toEqual,
      () => "0"
    ],
    [
      "test call",
      () => contract.methods.getRoles(adminAddress).call(),
      (x) => x,
      Matcher.toEqual,
      () => "expected result"
    ]
  ]

  createTests(tests_spec)
})

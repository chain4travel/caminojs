import { getAvalanche, createTests, Matcher } from "../e2etestlib"
import { KeystoreAPI } from "src/apis/keystore/api"

const avalanche = getAvalanche()
let keystore: KeystoreAPI

let ABI = []
let web3: any
let contract: any

beforeAll(async () => {
  await avalanche.fetchNetworkSettings()
  keystore = new KeystoreAPI(avalanche)
  const Web3 = require("web3")
  web3 = new Web3("http://127.0.0.1:9650/ext/bc/C/rpc")
  const fs = require("fs")
  const path = require("path")

  ABI = [{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"addr","type":"address"},{"indexed":false,"internalType":"uint256","name":"role","type":"uint256"}],"name":"DropRole","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"newGasFee","type":"uint256"}],"name":"GasFeeSet","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"account","type":"address"},{"indexed":false,"internalType":"uint256","name":"oldState","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"newState","type":"uint256"}],"name":"KycStateChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"addr","type":"address"},{"indexed":false,"internalType":"uint256","name":"role","type":"uint256"}],"name":"SetRole","type":"event"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"bool","name":"remove","type":"bool"},{"internalType":"uint256","name":"state","type":"uint256"}],"name":"applyKycState","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"getBaseFee","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"bytes4","name":"signature","type":"bytes4"}],"name":"getBlacklistState","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"getKycState","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"addr","type":"address"}],"name":"getRoles","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"addr","type":"address"},{"internalType":"uint256","name":"role","type":"uint256"}],"name":"grantRole","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"addr","type":"address"},{"internalType":"uint256","name":"role","type":"uint256"}],"name":"hasRole","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"addr","type":"address"},{"internalType":"uint256","name":"role","type":"uint256"}],"name":"revokeRole","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"newFee","type":"uint256"}],"name":"setBaseFee","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"bytes4","name":"signature","type":"bytes4"},{"internalType":"uint256","name":"state","type":"uint256"}],"name":"setBlacklistState","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newImplementation","type":"address"}],"name":"upgrade","outputs":[],"stateMutability":"nonpayable","type":"function"}]

  const contractAddr = "0x010000000000000000000000000000000000000a"
  contract = new web3.eth.Contract(ABI, contractAddr) // ABI is the compiled smart contract ABI

  const account = web3.eth.accounts.privateKeyToAccount("56289e99c94b6912bfc12adc093c9b51124f0dc54ac7a766b2bc5ccf558d8027")
  web3.eth.accounts.wallet.add(account)
})

describe("Admin-Role-Testing", (): void => {
  const adminAddr: string =
    "0x8db97c7cece249c2b98bdc0226cc4c2a57bf52fc" // must start with 0x
  const kycAddr: string =
      "0x1f0e5c64afdf53175f78846f7125776e76fa8f34" // must start with 0x
  const gasFeeAddr: string =
      "0x305cea207112c0561033133f816d7a2233699f06"
  const blacklistAddr: string =
      "0x7f28dcdfc67af590918c271226034058fd15e868"

  const tests_spec: any = [
      // Initial Role Check
    [
      "adminAddress role check",
      () => contract.methods.hasRole(adminAddr, 1).call(),
      (x) => x,
      Matcher.toEqual,
      () => true
    ],
    [
      "gasFeeAddr role check",
      () => contract.methods.hasRole(gasFeeAddr, 2).call(),
      (x) => x,
      Matcher.toEqual,
      () => false
    ],
    [
      "kycAddr role check",
      () => contract.methods.hasRole(kycAddr, 4).call(),
      (x) => x,
      Matcher.toEqual,
      () => false
    ],
    [
      "blacklistAddr role check",
      () => contract.methods.hasRole(blacklistAddr, 8).call(),
      (x) => x,
      Matcher.toEqual,
      () => false
    ],
      // Role Addition
    [
      "grant gas fee role to kycAddr",
      () => contract.methods.grantRole(gasFeeAddr, 2).send({ from: adminAddr, gas: 1000000 }), // "from" is the address where the tx comes from and "gas" is the gas limit
      (x) => x.events.SetRole.returnValues.role,
      Matcher.toBe,
      () => "2"
    ],
    [
      "grant kyc role to kycAddr",
      () => contract.methods.grantRole(kycAddr, 4).send({ from: adminAddr, gas: 1000000 }),
      (x) => x.events.SetRole.returnValues.role,
      Matcher.toBe,
      () => "4"
    ],
    [
      "grant blacklist role to kycAddr",
      () => contract.methods.grantRole(blacklistAddr, 8).send({ from: adminAddr, gas: 1000000 }),
      (x) => x.events.SetRole.returnValues.role,
      Matcher.toBe,
      () => "8"
    ],
    // Role Validation
    [
      "adminAddress role validation",
      () => contract.methods.getRoles(adminAddr).call(),
      (x) => x,
      Matcher.toBe,
      () => "1"
    ],
    [
      "gasFeeAddr role validation",
      () => contract.methods.getRoles(gasFeeAddr).call(),
      (x) => x,
      Matcher.toBe,
      () => "2"
    ],
    [
      "kycAddr role validation",
      () => contract.methods.getRoles(kycAddr).call(),
      (x) => x,
      Matcher.toBe,
      () => "4"
    ],
    [
      "blacklistAddr role validation",
      () => contract.methods.getRoles(blacklistAddr).call(),
      (x) => x,
      Matcher.toBe,
      () => "8"
    ],
    // Role Removal
    [
      "revoke gas fee role",
      () => contract.methods.revokeRole(gasFeeAddr, 2).send({ from: adminAddr, gas: 1000000 }),
      (x) => x.events.DropRole.returnValues.role,
      Matcher.toBe,
      () => "2"
    ],
    [
      "gasFeeAddr role validation",
      () => contract.methods.getRoles(gasFeeAddr).call(),
      (x) => x,
      Matcher.toBe,
      () => "0"
    ],
    // Invalid Calls
    [
      "gas fee address tries to give role to itself",
      () => contract.methods.grantRole(gasFeeAddr, 1).send({ from: gasFeeAddr, gas: 1000000 }),
      (x) => x,
      Matcher.toThrow,
      () => "unknown account"
    ],
    [
      "gas fee address tries to give role to kycAddr",
      () => contract.methods.grantRole(gasFeeAddr, 2).send({ from: kycAddr, gas: 1000000 }),
      (x) => x,
      Matcher.toThrow,
      () => "unknown account"
    ],
  ]

  createTests(tests_spec)
})

import { createTests, getAvalanche, Matcher } from "../e2etestlib"
import { KeystoreAPI } from "src/apis/keystore/api"
import BN from "bn.js"
import { Tx, UnsignedTx, UTXOSet } from "../../src/apis/platformvm"
import { UnixNow } from "../../src/utils"
import { Buffer } from "buffer/"

const adminAddress = "X-kopernikus1g65uqn6t77p656w64023nh8nd9updzmxh8ttv3"
const adminNodePrivateKey =
  "PrivateKey-vmRQiZeXEXYMyJhEiqdC2z5JhuDbxL8ix9UVvjgMu2Er1NepE"
const adminNodeId = "NodeID-AK7sPBsZM9rQwse23aLhEEBPHZD5gkLrL"
const node2PrivateKey =
  "PrivateKey-2ZW6HUePBW2dP7dBGa5stjXe1uvK9LwEgrjebDwXEyL5bDMWWS"
const addrBPrivateKey =
  "PrivateKey-ewoqjP7PxY4yr3iLTpLisriqt94hdyDFNgchSxGGztUrTXtNN"
const node2Id = "NodeID-D1LbWvUf9iaeEyUbTYYtYq4b7GaYR5tnJ"
const addrBAddress = "X-kopernikus18jma8ppw3nhx5r4ap8clazz0dps7rv5uuvjh68"
const user: string = "avalancheJspChainUser"
const passwd: string = "avalancheJsP@ssw4rd"
const user2: string = "avalancheJspChainUser2"
const passwd2: string = "avalancheJsP@ssw4rd2"
let avalanche = getAvalanche()

let keystore: KeystoreAPI
let tx = { value: "" }
let xChain: any
let pChain: any
let createdSubnetID = { value: "" }
let pAddresses: any
let pAddressStrings: string[]
let pAddressB: string
let xAddressB: string
let pKeychain: any
let startTime = UnixNow().add(new BN(60 * 1))
const endTime: BN = startTime.add(new BN(26300000))
const delegationFee: number = 10
const threshold: number = 1
const locktime: BN = new BN(0)
const memo: Buffer = Buffer.from(
  "PlatformVM utility method buildAddValidatorTx to add a validator to the primary subnet"
)
beforeAll(async () => {
  await avalanche.fetchNetworkSettings()
  keystore = new KeystoreAPI(avalanche)
  xChain = avalanche.XChain()
  pChain = avalanche.PChain()
  pKeychain = pChain.keyChain()
  pKeychain.importKey(adminNodePrivateKey)
  pKeychain.importKey(addrBPrivateKey)
  pKeychain.importKey(node2PrivateKey)
  pAddresses = pKeychain.getAddresses()
  pAddressStrings = pKeychain.getAddressStrings()
  pAddressB = pAddressStrings[1]
  xAddressB = "X" + pAddressB.substring(1)
})

describe("Camino-PChain-Add-Validator", (): void => {
  const tests_spec: any = [
    [
      "assert pending validators=0",
      () => pChain.getPendingValidators(),
      (x) => x.validators.length,
      Matcher.toBe,
      () => 0
    ],
    [
      "addValidator - with admin PK",
      () =>
        (async function () {
          const stakeAmount: any = await pChain.getMinStake()
          const platformVMUTXOResponse: any = await pChain.getUTXOs(
            pAddressStrings
          )
          const utxoSet: UTXOSet = platformVMUTXOResponse.utxos

          const unsignedTx: UnsignedTx = await pChain.buildAddValidatorTx(
            utxoSet,
            pAddressStrings,
            pAddressStrings,
            pAddressStrings,
            adminNodeId,
            startTime,
            endTime,
            stakeAmount.minValidatorStake,
            pAddressStrings,
            delegationFee,
            locktime,
            threshold,
            memo
          )

          const tx: Tx = unsignedTx.sign(pKeychain)
          return pChain.issueTx(tx)
        })(),
      (x) => {
        return x
      },
      Matcher.toThrow,
      () => "couldn't issue tx: node is already a validator"
    ],
    [
      "addValidator - with node not a consortium member",
      () =>
        (async function () {
          const stakeAmount: any = await pChain.getMinStake()
          const platformVMUTXOResponse: any = await pChain.getUTXOs(
            pAddressStrings
          )
          const utxoSet: UTXOSet = platformVMUTXOResponse.utxos

          const unsignedTx: UnsignedTx = await pChain.buildAddValidatorTx(
            utxoSet,
            pAddressStrings,
            pAddressStrings,
            pAddressStrings,
            node2Id,
            startTime,
            endTime,
            stakeAmount.minValidatorStake,
            pAddressStrings,
            delegationFee,
            locktime,
            threshold,
            memo
          )

          const tx: Tx = unsignedTx.sign(pKeychain)
          return pChain.issueTx(tx)
        })(),
      (x) => {
        return x
      },
      Matcher.toThrow,
      () => "couldn't issue tx: address isn't consortium member: not found"
    ],

    [
      "createUser",
      () => keystore.createUser(user, passwd),
      (x) => x,
      Matcher.toEqual,
      () => {
        return {}
      }
    ],
    [
      "createUser2",
      () => keystore.createUser(user2, passwd2),
      (x) => x,
      Matcher.toEqual,
      () => {
        return {}
      }
    ],
    [
      "importKey",
      () => pChain.importKey(user2, passwd2, addrBPrivateKey),
      (x) => x,
      Matcher.toBe,
      () => "P" + addrBAddress.substring(1)
    ],
    // [
    //     "importKey",
    //     () => pChain.importKey(user2, passwd2, node2PrivateKey),
    //     (x) => x,
    //     Matcher.toBe,
    //     () => pAddressStrings[2]
    // ],
    [
      "importKey",
      () => pChain.importKey(user, passwd, adminNodePrivateKey),
      (x) => x,
      Matcher.toBe,
      () => "P" + adminAddress.substring(1)
    ],
    [
      "x-importKey admin",
      () => xChain.importKey(user, passwd, adminNodePrivateKey),
      (x) => x,
      Matcher.toBe,
      () => adminAddress
    ],
    [
      "x-importKey node2",
      () => xChain.importKey(user2, passwd2, node2PrivateKey),
      (x) => x,
      Matcher.toBe,
      () => "X" + pAddressStrings[2].substring(1)
    ],
    [
      "fundAddrB",
      () =>
        xChain.send(
          user,
          passwd,
          "CAM",
          400000000000000,
          xAddressB,
          [pAddresses[0]],
          "X" + pAddressStrings[0].substring(1),
          memo
        ),
      (x) => x,
      Matcher.Get,
      () => tx
    ],
    [
      "getTx",
      () => xChain.getTx(tx.value["txID"]),
      (x) => x,
      Matcher.toMatch,
      () => /\w+/
    ],
    [
      "verify fundAddrB tx as been accepted ",
      () => xChain.getTxStatus(tx.value["txID"]),
      (x) => x,
      Matcher.toBe,
      () => "Accepted",
      3000
    ],
    [
      "export X->P for addrB",
      () =>
        xChain.export(user, passwd, pAddressB, new BN(400000000000000), "CAM"),
      (x) => x,
      Matcher.Get,
      () => tx
    ],
    [
      "getXBalance",
      () => xChain.getBalance(xAddressB, "CAM"),
      (x) => x.balance,
      Matcher.toBe,
      () => "400000000000000"
    ],
    [
      "importCAM X->P for addrB",
      () => pChain.importAVAX(user2, passwd2, pAddressB, "X"),
      (x) => x,
      Matcher.Get,
      () => tx,
      3000
    ],
    [
      "register node2",
      () =>
        (async function () {
          const consortiumMemberAuthCredentials: [number, Buffer][] = [
            [0, pAddresses[1]]
          ]
          const unsignedTx: UnsignedTx = await pChain.buildRegisterNodeTx(
            undefined,
            [pAddressB],
            [pAddressB],
            undefined,
            node2Id,
            pAddressB,
            consortiumMemberAuthCredentials,
            memo
          )

          const tx: Tx = unsignedTx.sign(pKeychain)
          return pChain.issueTx(tx)
        })(),
      (x) => {
        return x
      },
      Matcher.Get,
      () => tx,
      3000
    ],
    [
      "addValidator - return with node2 as a new consortium member",
      () =>
        (async function () {
          const stakeAmount: any = await pChain.getMinStake()
          const unsignedTx: UnsignedTx = await pChain.buildAddValidatorTx(
            undefined,
            [pAddressB],
            [pAddressB],
            [pAddressB],
            node2Id,
            startTime,
            endTime,
            stakeAmount.minValidatorStake,
            [pAddressB],
            delegationFee,
            locktime,
            threshold,
            memo
          )

          const tx: Tx = unsignedTx.sign(pKeychain)
          return pChain.issueTx(tx)
        })(),
      (x) => {
        return x
      },
      Matcher.Get,
      () => tx
    ],
    [
      "verify addValidator tx has been committed",
      () => pChain.getTxStatus(tx.value),
      (x) => x.status,
      Matcher.toBe,
      () => "Committed",
      3000
    ],
    [
      "assert pending validators=1",
      () => pChain.getPendingValidators(),
      (x) => x.validators.length,
      Matcher.toBe,
      () => 1
    ],
    [
      "createSubnet",
      () => pChain.createSubnet(user2, passwd2, [pAddressStrings[1]], 1),
      (x) => {
        return x
      },
      Matcher.Get,
      () => createdSubnetID
    ],
    [
      "addSubnetValidator addrb",
      () =>
        (async function () {
          const stakeAmount: any = await pChain.getMinStake()
          const subnetAuthCredentials: [number, Buffer][] = [[0, pAddresses[1]]]
          const nodeCredentials: [number, Buffer] = [2, pAddresses[2]]
          const unsignedTx: UnsignedTx = await pChain.buildAddSubnetValidatorTx(
            undefined,
            [pAddressStrings[1]],
            [pAddressStrings[1]],
            node2Id,
            startTime,
            endTime,
            stakeAmount.minValidatorStake,
            createdSubnetID.value,
            memo,
            new BN(0),
            subnetAuthCredentials,
            nodeCredentials
          )

          const tx: Tx = unsignedTx.sign(pKeychain)
          return pChain.issueTx(tx)
        })(),
      (x) => {
        return x
      },
      Matcher.Get,
      () => tx,
      3000
    ],
    [
      "assert pending validators of subnet = 1",
      () => pChain.getPendingValidators(createdSubnetID.value),
      (x) => x.validators.length,
      Matcher.toBe,
      () => 1,
      3000
    ]
  ]

  createTests(tests_spec)
})

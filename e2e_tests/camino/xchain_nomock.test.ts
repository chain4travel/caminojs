import { getAvalanche, createTests, Matcher } from "../e2etestlib"
import { KeystoreAPI } from "src/apis/keystore/api"
import BN from "bn.js"
import BinTools from "../../src/utils/bintools";
import {AVMAPI} from "../../src/apis/avm";

const avalanche = getAvalanche()
let keystore: KeystoreAPI
let tx = { value: "" }
let xChain: AVMAPI

const bintools: BinTools = BinTools.getInstance()


beforeAll(async () => {
  await avalanche.fetchNetworkSettings()
  keystore = new KeystoreAPI(avalanche)
  xChain = avalanche.XChain()
})
describe("Camino-XChain", (): void => {
  let asset = { value: "" }
  let addrB = { value: "" }
  let addrC = { value: "" }

  const user: string = "avalancheJsXChainUser"
  const passwd: string = "avalancheJsP1ssw4rd"
  const badUser: string = "asdfasdfsa"
  const badPass: string = "pass"
  const adminAddress: string =
    "X-kopernikus1g65uqn6t77p656w64023nh8nd9updzmxh8ttv3"
  const key: string =
    "PrivateKey-vmRQiZeXEXYMyJhEiqdC2z5JhuDbxL8ix9UVvjgMu2Er1NepE"
  // new user that has no mint authority
  const userUnauthorizedMint: string = "avalancheJsXChainUser2" // used to test minting with unauthorized minter
  const passwdUnauthorizedMint: string = "avalancheJsP1ssw4rd" // used to test minting with unauthorized minter
  const addrD = { value: "" } // used to test minting with unauthorized minter
  const addressUnauthorized: string = "X-kopernikus18jma8ppw3nhx5r4ap8clazz0dps7rv5uuvjh68"
  const keyUnauthorizedMint: string = "PrivateKey-ewoqjP7PxY4yr3iLTpLisriqt94hdyDFNgchSxGGztUrTXtNN"

  const tests_spec: any = [
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
      "createUser for Unauthorized Minting",
      () => keystore.createUser(userUnauthorizedMint, passwdUnauthorizedMint),
      (x) => x,
      Matcher.toEqual,
      () => {
        return {}
      }
    ],
    [
      "createaddrB",
      () => xChain.createAddress(user, passwd),
      (x) => x,
      Matcher.Get,
      () => addrB
    ],
    [
      "createaddrC",
      () => xChain.createAddress(user, passwd),
      (x) => x,
      Matcher.Get,
      () => addrC
    ],
    [
      "incorrectUser",
      () =>
        xChain.send(
          badUser,
          passwd,
          "CAM",
          10,
          addrB.value,
          [addrC.value],
          addrB.value,
          "incorrectUser"
        ),
      (x) => x,
      Matcher.toThrow,
      () =>
        `problem retrieving user "${badUser}": incorrect password: user "${badUser}"`
    ],
    [
      "incorrectPass",
      () =>
        xChain.send(
          user,
          badPass,
          "CAM",
          10,
          addrB.value,
          [addrC.value],
          addrB.value,
          "incorrectPass"
        ),
      (x) => x,
      Matcher.toThrow,
      () =>
        `problem retrieving user "${user}": incorrect password: user "${user}"`
    ],
    [
      "importKey",
      () => xChain.importKey(user, passwd, key),
      (x) => x,
      Matcher.toBe,
      () => adminAddress
    ],
    [
        "importKey for unauthorized mint",
      () => xChain.importKey(userUnauthorizedMint, passwdUnauthorizedMint, keyUnauthorizedMint),
      (x) => x,
      Matcher.toBe,
      () => addressUnauthorized
    ],
    [
      "send",
      () =>
        xChain.send(
          user,
          passwd,
          "CAM",
          10,
          addrB.value,
          [adminAddress],
          adminAddress,
          "send"
        ),
      (x) => x.txID,
      Matcher.Get,
      () => tx
    ],
    [
        // https://docs.camino.network/developer/apis/camino-node-apis/x-chain/#avmgettxstatus
      "Verify tx has been committed",
      () => {
        console.log(`checking tx status of ${tx.value}`)
        return xChain.getTxStatus(tx.value)
      },
      (x) => x,
      Matcher.toBe,
      () => "Accepted",
      3000
    ],
    [
      "sendMultiple",
      () =>
        xChain.sendMultiple(
          user,
          passwd,
          [
            { assetID: "CAM", amount: 10, to: addrB.value },
            { assetID: "CAM", amount: 20, to: addrC.value }
          ],
          [adminAddress],
          adminAddress,
          "sendMultiple"
        ),
      (x) => x.txID,
      Matcher.Get,
      () => tx
    ],
    [
      "Verify tx has been committed",
      () => {
        console.log(`checking tx status of ${tx.value}`)
        return xChain.getTxStatus(tx.value)
      },
      (x) => x,
      Matcher.toBe,
      () => "Accepted",
      3000
    ],
    [
      "listAddrs",
      () => xChain.listAddresses(user, passwd),
      (x) => x.sort(),
      Matcher.toEqual,
      () => [adminAddress, addrB.value, addrC.value].sort()
    ],
    [
      "exportKey",
      () => xChain.exportKey(user, passwd, addrB.value),
      (x) => x,
      Matcher.toMatch,
      () => /PrivateKey-\w*/
    ],
    [
      "export",
      () =>
        xChain.export(
          user,
          passwd,
          "C" + addrB.value.substring(1),
          new BN(10),
          "CAM"
        ),
      (x) => x,
      Matcher.Get,
      () => tx
    ],
    [
      "Verify tx has been committed",
      () => {
        console.log(`checking tx status of ${tx.value}`)
        return xChain.getTxStatus(tx.value)
      },
      (x) => x,
      Matcher.toBe,
      () => "Accepted",
      3000
    ],
    [
      "import",
      () => xChain.import(user, passwd, addrB.value, "P"),
      (x) => x,
      Matcher.toThrow,
      () => "problem issuing transaction: no import inputs"
    ],
    [
      "createFixed",
      () =>
        xChain.createFixedCapAsset(user, passwd, "Camino", "CAM", 0, [
          { address: adminAddress, amount: "10000" }
        ]),
      (x) => x,
      Matcher.Get,
      () => asset
    ],
    [
      "Verify tx has been committed",
      () => {
        console.log(`checking tx status of ${tx.value}`)
        return xChain.getTxStatus(tx.value)
      },
      (x) => x,
      Matcher.toBe,
      () => "Accepted",
      3000
    ],
    [
      "createVar",
      () =>
        xChain.createVariableCapAsset(user, passwd, "Camino", "CAM", 0, [
          { minters: [adminAddress], threshold: 1 }
        ]),
      (x) => x,
      Matcher.Get,
      () => asset
    ],
    [
      "mint (authorized minter)",
      () =>
        xChain.mint(user, passwd, 1500, asset.value, addrB.value, [
          adminAddress
        ]),
      (x) => x,
      Matcher.Get,
      () => tx
    ],
    [
      "mint (unauthorized minter)",
       () =>
           xChain.mint(userUnauthorizedMint, passwdUnauthorizedMint, 1500, asset.value, addrB.value, [
            addressUnauthorized
          ]),
      (x) => x,
      Matcher.toThrow,
      () => "provided addresses don't have the authority to mint the provided asset"
    ]
  ]

  createTests(tests_spec)
})

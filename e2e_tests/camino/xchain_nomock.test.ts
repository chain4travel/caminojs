import { getAvalanche, createTests, Matcher } from "../e2etestlib"
import { KeystoreAPI } from "src/apis/keystore/api"
import BN from "bn.js"

describe("Camino-XChain", (): void => {
  let tx = { value: "" }
  let asset = { value: "" }
  let addrB = { value: "" }
  let addrC = { value: "" }

  const avalanche = getAvalanche()
  const xchain = avalanche.XChain()
  const keystore = new KeystoreAPI(avalanche)

  const user: string = "avalancheJsXChainUser"
  const passwd: string = "avalancheJsP1ssw4rd"
  const badUser: string = "asdfasdfsa"
  const badPass: string = "pass"
  const memo: string = "hello world"
  const adminAddress: string = "X-kopernikus1g65uqn6t77p656w64023nh8nd9updzmxh8ttv3"
  const key: string =
    "PrivateKey-vmRQiZeXEXYMyJhEiqdC2z5JhuDbxL8ix9UVvjgMu2Er1NepE"

  // test_name        response_promise                            resp_fn          matcher           expected_value/obtained_value
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
      "createaddrB",
      () => xchain.createAddress(user, passwd),
      (x) => x,
      Matcher.Get,
      () => addrB
    ],
    [
      "createaddrC",
      () => xchain.createAddress(user, passwd),
      (x) => x,
      Matcher.Get,
      () => addrC
    ],
    [
      "incorrectUser",
      () =>
        xchain.send(
          badUser,
          passwd,
          "CAM",
          10,
          addrB.value,
          [addrC.value],
          addrB.value,
          memo
        ),
      (x) => x,
      Matcher.toThrow,
      () =>
        `problem retrieving user "${badUser}": incorrect password for user "${badUser}"`
    ],
    [
      "incorrectPass",
      () =>
        xchain.send(
          user,
          badPass,
          "CAM",
          10,
          addrB.value,
          [addrC.value],
          addrB.value,
          memo
        ),
      (x) => x,
      Matcher.toThrow,
      () =>
        `problem retrieving user "${user}": incorrect password for user "${user}"`
    ],
    [
      "importKey",
      () => xchain.importKey(user, passwd, key),
      (x) => x,
      Matcher.toBe,
      () => adminAddress
    ],
    [
      "send",
      () =>
        xchain.send(
          user,
          passwd,
          "CAM",
          10,
          addrB.value,
          [adminAddress],
          adminAddress,
          memo
        ),
      (x) => x.txID,
      Matcher.Get,
      () => tx
    ],
    [
      "sendMultiple",
      () =>
        xchain.sendMultiple(
          user,
          passwd,
          [
            { assetID: "CAM", amount: 10, to: addrB.value },
            { assetID: "CAM", amount: 20, to: addrC.value }
          ],
          [adminAddress],
          adminAddress,
          memo
        ),
      (x) => x.txID,
      Matcher.Get,
      () => tx
    ],
    [
      "listAddrs",
      () => xchain.listAddresses(user, passwd),
      (x) => x.sort(),
      Matcher.toEqual,
      () => [adminAddress,addrB.value, addrC.value].sort()
    ],
    [
      "exportKey",
      () => xchain.exportKey(user, passwd, addrB.value),
      (x) => x,
      Matcher.toMatch,
      () => /PrivateKey-\w*/
    ],
    [
      "export",
      () =>
        xchain.export(
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
      "import",
      () => xchain.import(user, passwd, addrB.value, "P"),
      (x) => x,
      Matcher.toThrow,
      () => "problem issuing transaction: no import inputs"
    ],
    [
      "createFixed",
      () =>
        xchain.createFixedCapAsset(user, passwd, "Camino", "CAM", 0, [
          { address: adminAddress, amount: "10000" }
        ]),
      (x) => x,
      Matcher.Get,
      () => asset
    ],
    [
      "createVar",
      () =>
        xchain.createVariableCapAsset(user, passwd, "Camino", "CAM", 0, [
          { minters: [adminAddress], threshold: 1 }
        ]),
      (x) => x,
      Matcher.Get,
      () => asset
    ],
    [
      "mint",
      () =>
        xchain.mint(user, passwd, 1500, asset.value, addrB.value, [adminAddress]),
      (x) => x,
      Matcher.toThrow,
      () =>
        "provided addresses don't have the authority to mint the provided asset"
    ],
    [
      "getTx",
      () => xchain.getTx(tx.value),
      (x) => x,
      Matcher.toMatch,
      () => /\w+/
    ],
    [
      "getTxStatus",
      () => xchain.getTxStatus(tx.value),
      (x) => x,
      Matcher.toBe,
      () => "Processing"
    ],
    [
      "getAssetDesc",
      () => xchain.getAssetDescription(asset.value),
      (x) => [x.name, x.symbol],
      Matcher.toEqual,
      () => ["Camino", "CAM"]
    ]
  ]


  createTests(tests_spec)
})

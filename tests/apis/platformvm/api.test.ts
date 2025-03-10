import mockAxios from "jest-mock-axios"
import { Avalanche } from "src"
import { PlatformVMAPI } from "src/apis/platformvm/api"
import { Buffer } from "buffer/"
import BN from "bn.js"
import BinTools from "src/utils/bintools"
import * as bech32 from "bech32"
import {
  DefaultLocalGenesisPrivateKey,
  DefaultLocalGenesisPrivateKey2,
  DefaultPlatformChainID,
  PrivateKeyPrefix,
  TestXBlockchainID
} from "src/utils/constants"
import { UTXOSet } from "src/apis/platformvm/utxos"
import { PersistanceOptions } from "src/utils/persistenceoptions"
import { KeyChain } from "src/apis/platformvm/keychain"
import {
  SECPTransferOutput,
  TransferableOutput,
  AmountOutput,
  ParseableOutput,
  StakeableLockOut,
  SECPOwnerOutput
} from "src/apis/platformvm/outputs"
import {
  TransferableInput,
  SECPTransferInput,
  AmountInput,
  StakeableLockIn
} from "src/apis/platformvm/inputs"
import { UTXO } from "src/apis/platformvm/utxos"
import createHash from "create-hash"
import { UnsignedTx, Tx } from "src/apis/platformvm/tx"
import { UnixNow } from "src/utils/helperfunctions"
import { UTF8Payload } from "src/utils/payload"
import { NodeIDStringToBuffer } from "src/utils/helperfunctions"
import { ONEAVAX } from "src/utils/constants"
import {
  Serializable,
  Serialization,
  SerializedEncoding,
  SerializedType
} from "src/utils/serialization"
import { AddValidatorTx } from "src/apis/platformvm/validationtx"
import {
  Blockchain,
  GetMinStakeResponse,
  GetRewardUTXOsResponse,
  Subnet,
  GetTxStatusResponse,
  GetValidatorsAtResponse,
  GetBalanceResponse,
  GetUTXOsResponse,
  DepositOffer,
  GetDepositsResponse,
  GetClaimablesResponse,
  ClaimAmountParams,
  GetCurrentSupplyResponse
} from "src/apis/platformvm/interfaces"
import { ErrorResponseObject } from "src/utils/errors"
import { HttpResponse } from "jest-mock-axios/dist/lib/mock-axios-types"
import { Builder } from "src/apis/platformvm/builder"
import { GetBlockResponse, OutputOwners, SigIdx, ZeroBN } from "src/common"
import {
  BaseTx,
  ClaimAmount,
  ClaimTx,
  ClaimType,
  DepositTx,
  RegisterNodeTx,
  UnlockDepositTx
} from "src/apis/platformvm"

/**
 * @ignore
 */
const bintools: BinTools = BinTools.getInstance()
const serializer: Serialization = Serialization.getInstance()
const display: SerializedEncoding = "display"
const dumpSerialization: boolean = false
const defaultPK: string = `${PrivateKeyPrefix}${DefaultLocalGenesisPrivateKey}`
const defaultPK2: string = `${PrivateKeyPrefix}${DefaultLocalGenesisPrivateKey2}`
const txID: Buffer = Buffer.from(
  createHash("sha256")
    .update(bintools.fromBNToBuffer(new BN(1), 32))
    .digest()
)

const serialzeit = (aThing: Serializable, name: string): void => {
  if (dumpSerialization) {
    console.log(
      JSON.stringify(
        serializer.serialize(
          aThing,
          "platformvm",
          "hex",
          name + " -- Hex Encoded"
        )
      )
    )
    console.log(
      JSON.stringify(
        serializer.serialize(
          aThing,
          "platformvm",
          "display",
          name + " -- Human-Readable"
        )
      )
    )
  }
}

describe("PlatformVMAPI", (): void => {
  const networkID: number = 12345
  const blockchainID: string = DefaultPlatformChainID
  const ip: string = "127.0.0.1"
  const port: number = 9650
  const protocol: string = "https"

  const nodeID: string = "NodeID-B6D4v1VtPYLbiUvYXtW4Px8oE9imC2vGW"
  const startTime: BN = UnixNow().add(new BN(60 * 5))
  const endTime: BN = startTime.add(new BN(1209600))

  const username: string = "AvaLabs"
  const password: string = "password"

  const avalanche: Avalanche = new Avalanche(
    ip,
    port,
    protocol,
    networkID,
    undefined,
    undefined
  )
  let api: PlatformVMAPI
  let alias: string
  let assetID: Buffer
  const addrA: string =
    "P-" +
    bech32.bech32.encode(
      avalanche.getHRP(),
      bech32.bech32.toWords(
        bintools.cb58Decode("B6D4v1VtPYLbiUvYXtW4Px8oE9imC2vGW")
      )
    )
  const addrB: string =
    "P-" +
    bech32.bech32.encode(
      avalanche.getHRP(),
      bech32.bech32.toWords(
        bintools.cb58Decode("P5wdRuZeaDt28eHMP5S3w9ZdoBfo7wuzF")
      )
    )
  const addrC: string =
    "P-" +
    bech32.bech32.encode(
      avalanche.getHRP(),
      bech32.bech32.toWords(
        bintools.cb58Decode("6Y3kysjF9jnHnYkdS9yGAuoHyae2eNmeV")
      )
    )
  beforeAll(async () => {
    api = new PlatformVMAPI(avalanche, "/ext/bc/P")
    alias = api.getBlockchainAlias()
    assetID = await api.getAVAXAssetID()
  })

  afterEach((): void => {
    mockAxios.reset()
  })

  test("getCreateSubnetTxFee", async (): Promise<void> => {
    let pchain: PlatformVMAPI = new PlatformVMAPI(avalanche, "/ext/bc/P")
    const feeResponse: string = "1000000000"
    const fee: BN = pchain.getCreateSubnetTxFee()
    expect(fee.toString()).toBe(feeResponse)
  })

  test("getCreateChainTxFee", async (): Promise<void> => {
    let pchain: PlatformVMAPI = new PlatformVMAPI(avalanche, "/ext/bc/P")
    const feeResponse: string = "1000000000"
    const fee: BN = pchain.getCreateChainTxFee()
    expect(fee.toString()).toBe(feeResponse)
  })

  test("getCreateSubnetTxFee", async (): Promise<void> => {
    let pchain: PlatformVMAPI = new PlatformVMAPI(avalanche, "/ext/bc/P")
    const feeResponse: string = "1000000000"
    const fee: BN = pchain.getCreateSubnetTxFee()
    expect(fee.toString()).toBe(feeResponse)
  })

  test("getCreateChainTxFee", async (): Promise<void> => {
    let pchain: PlatformVMAPI = new PlatformVMAPI(avalanche, "/ext/bc/P")
    const feeResponse: string = "1000000000"
    const fee: BN = pchain.getCreateChainTxFee()
    expect(fee.toString()).toBe(feeResponse)
  })

  test("listAddresses", async (): Promise<void> => {
    const addresses: string[] = [addrA, addrB]

    const result: Promise<string[]> = api.listAddresses(username, password)
    const payload: object = {
      result: {
        addresses
      }
    }
    const responseObj: HttpResponse = {
      data: payload
    }

    mockAxios.mockResponse(responseObj)
    const response: string[] = await result

    expect(mockAxios.request).toHaveBeenCalledTimes(1)
    expect(response).toBe(addresses)
  })

  test("importKey", async (): Promise<void> => {
    const address: string = addrC

    const result: Promise<string | ErrorResponseObject> = api.importKey(
      username,
      password,
      "key"
    )
    const payload: object = {
      result: {
        address
      }
    }
    const responseObj: HttpResponse = {
      data: payload
    }

    mockAxios.mockResponse(responseObj)
    const response: string | ErrorResponseObject = await result

    expect(mockAxios.request).toHaveBeenCalledTimes(1)
    expect(response).toBe(address)
  })

  test("import bad key", async (): Promise<void> => {
    const address: string = addrC
    const message: string =
      'problem retrieving data: incorrect password for user "test"'
    const result: Promise<string | ErrorResponseObject> = api.importKey(
      username,
      "badpassword",
      "key"
    )
    const payload: object = {
      result: {
        code: -32000,
        message,
        data: null
      }
    }
    const responseObj: HttpResponse = {
      data: payload
    }

    mockAxios.mockResponse(responseObj)
    const response: string | ErrorResponseObject = await result

    expect(mockAxios.request).toHaveBeenCalledTimes(1)

    expect(response["code"]).toBe(-32000)
    expect(response["message"]).toBe(message)
  })

  test("getBalance", async (): Promise<void> => {
    const s100 = "100"
    const b100 = new BN("100", 10)
    const utxoIDs = [
      {
        txID: "LUriB3W919F84LwPMMw4sm2fZ4Y76Wgb6msaauEY7i1tFNmtv",
        outputIndex: 0
      }
    ]
    const expected: GetBalanceResponse = {
      balance: b100,
      unlocked: b100,
      lockedStakeable: b100,
      lockedNotStakeable: b100,
      utxoIDs: utxoIDs
    }
    const result: Promise<GetBalanceResponse> = api.getBalance([addrA])
    const payload: object = {
      result: {
        balance: s100,
        unlocked: s100,
        lockedStakeable: s100,
        lockedNotStakeable: s100,
        utxoIDs: utxoIDs
      }
    }
    const responseObj: HttpResponse = {
      data: payload
    }

    mockAxios.mockResponse(responseObj)
    const response: object = await result

    expect(mockAxios.request).toHaveBeenCalledTimes(1)
    expect(JSON.stringify(response)).toBe(JSON.stringify(expected))
  })

  test("getCurrentSupply", async (): Promise<void> => {
    const supply: BN = new BN("1000000000000", 10)
    const height = new BN("1000000000000", 10)

    const result: Promise<GetCurrentSupplyResponse> = api.getCurrentSupply()
    const payload: object = {
      result: {
        supply,
        height
      }
    }
    const responseObj: HttpResponse = {
      data: payload
    }

    mockAxios.mockResponse(responseObj)
    const response: GetCurrentSupplyResponse = await result

    expect(mockAxios.request).toHaveBeenCalledTimes(1)
    expect(response.supply.toString(10)).toBe(supply.toString(10))
    expect(response.height.toString(10)).toBe(height.toString(10))
  })

  test("getValidatorsAt", async (): Promise<void> => {
    const height: number = 0
    const subnetID: string = "11111111111111111111111111111111LpoYY"
    const result: Promise<GetValidatorsAtResponse> = api.getValidatorsAt(
      height,
      subnetID
    )
    const payload: object = {
      result: {
        validators: {
          "NodeID-7Xhw2mDxuDS44j42TCB6U5579esbSt3Lg": 2000000000000000,
          "NodeID-GWPcbFJZFfZreETSoWjPimr846mXEKCtu": 2000000000000000,
          "NodeID-MFrZFVCXPv5iCn6M9K6XduxGTYp891xXZ": 2000000000000000,
          "NodeID-NFBbbJ4qCmNaCzeW7sxErhvWqvEQMnYcN": 2000000000000000,
          "NodeID-P7oB2McjBGgW2NXXWVYjV8JEDFoW9xDE5": 2000000000000000
        }
      }
    }
    const responseObj: HttpResponse = {
      data: payload
    }

    mockAxios.mockResponse(responseObj)
    const response: GetValidatorsAtResponse = await result

    expect(mockAxios.request).toHaveBeenCalledTimes(1)
  })

  test("getBlockByHeight", async (): Promise<void> => {
    const height: number = 0
    const encoding: string = "hexnc"
    const result: Promise<GetBlockResponse> = api.getBlockByHeight(
      height,
      encoding
    )

    const block: string =
      "0x0000000000026e44093d690ef46df3d1409ab2ce3bdd28ee33c1391a412e5e758a500e4e50fb0000000000000000"
    const payload: object = {
      result: {
        block,
        encoding
      }
    }
    const responseObj: HttpResponse = {
      data: payload
    }
    mockAxios.mockResponse(responseObj)
    const response: GetBlockResponse = await result
    expect(mockAxios.request).toHaveBeenCalledTimes(1)
    expect(response.block).toBe(block)
  })
  test("getHeight", async (): Promise<void> => {
    const height: BN = new BN("100", 10)
    const result: Promise<BN> = api.getHeight()
    const payload: object = {
      result: {
        height
      }
    }
    const responseObj: HttpResponse = {
      data: payload
    }

    mockAxios.mockResponse(responseObj)
    const response: BN = await result

    expect(mockAxios.request).toHaveBeenCalledTimes(1)
    expect(response.toString(10)).toBe(height.toString(10))
  })

  test("getMinStake", async (): Promise<void> => {
    const minStake: BN = new BN("2000000000000", 10)
    const minDelegate: BN = new BN("25000000000", 10)
    const result: Promise<GetMinStakeResponse> = api.getMinStake()
    const payload: object = {
      result: {
        minValidatorStake: "2000000000000",
        minDelegatorStake: "25000000000"
      }
    }
    const responseObj: HttpResponse = {
      data: payload
    }

    mockAxios.mockResponse(responseObj)
    const response: GetMinStakeResponse = await result

    expect(mockAxios.request).toHaveBeenCalledTimes(1)
    expect(response["minValidatorStake"].toString(10)).toBe(
      minStake.toString(10)
    )
    expect(response["minDelegatorStake"].toString(10)).toBe(
      minDelegate.toString(10)
    )
  })

  test("getStake", async (): Promise<void> => {
    const staked: BN = new BN("100", 10)
    const stakedOutputs: string[] = [
      "0x000021e67317cbc4be2aeb00677ad6462778a8f52274b9d605df2591b23027a87dff000000160000000060bd6180000000070000000fb750430000000000000000000000000100000001e70060b7051a4838ebe8e29bcbe1403db9b88cc316895eb3",
      "0x000021e67317cbc4be2aeb00677ad6462778a8f52274b9d605df2591b23027a87dff000000160000000060bd618000000007000000d18c2e280000000000000000000000000100000001e70060b7051a4838ebe8e29bcbe1403db9b88cc3714de759",
      "0x000021e67317cbc4be2aeb00677ad6462778a8f52274b9d605df2591b23027a87dff000000160000000061340880000000070000000fb750430000000000000000000000000100000001e70060b7051a4838ebe8e29bcbe1403db9b88cc379b89461",
      "0x000021e67317cbc4be2aeb00677ad6462778a8f52274b9d605df2591b23027a87dff00000016000000006134088000000007000000d18c2e280000000000000000000000000100000001e70060b7051a4838ebe8e29bcbe1403db9b88cc3c7aa35d1",
      "0x000021e67317cbc4be2aeb00677ad6462778a8f52274b9d605df2591b23027a87dff00000016000000006134088000000007000001d1a94a200000000000000000000000000100000001e70060b7051a4838ebe8e29bcbe1403db9b88cc38fd232d8"
    ]
    const objs: TransferableOutput[] = stakedOutputs.map(
      (stakedOutput: string): TransferableOutput => {
        const transferableOutput: TransferableOutput = new TransferableOutput()
        let buf: Buffer = Buffer.from(stakedOutput.replace(/0x/g, ""), "hex")
        transferableOutput.fromBuffer(buf, 2)
        return transferableOutput
      }
    )
    const result: Promise<object> = api.getStake([addrA], "hex")
    const payload: object = {
      result: {
        staked,
        stakedOutputs
      }
    }
    const responseObj: HttpResponse = {
      data: payload
    }

    mockAxios.mockResponse(responseObj)
    const response: object = await result

    expect(mockAxios.request).toHaveBeenCalledTimes(1)
    expect(JSON.stringify(response["staked"])).toBe(JSON.stringify(staked))
    expect(JSON.stringify(response["stakedOutputs"])).toBe(JSON.stringify(objs))
  })

  test("addSubnetValidator 1", async (): Promise<void> => {
    const nodeID: string = "abcdef"
    const subnetID: string = "4R5p2RXDGLqaifZE4hHWH9owe34pfoBULn1DrQTWivjg8o4aH"
    const startTime: Date = new Date(1985, 5, 9, 12, 59, 43, 9)
    const endTime: Date = new Date(1982, 3, 1, 12, 58, 33, 7)
    const weight: number = 13
    const utx: string = "valid"
    const result: Promise<string | ErrorResponseObject> =
      api.addSubnetValidator(
        username,
        password,
        nodeID,
        subnetID,
        startTime,
        endTime,
        weight
      )
    const payload: object = {
      result: {
        txID: utx
      }
    }
    const responseObj: HttpResponse = {
      data: payload
    }

    mockAxios.mockResponse(responseObj)
    const response: string | ErrorResponseObject = await result

    expect(mockAxios.request).toHaveBeenCalledTimes(1)
    expect(response).toBe(utx)
  })

  test("addSubnetValidator", async (): Promise<void> => {
    const nodeID: string = "abcdef"
    const subnetID: Buffer = Buffer.from("abcdef", "hex")
    const startTime: Date = new Date(1985, 5, 9, 12, 59, 43, 9)
    const endTime: Date = new Date(1982, 3, 1, 12, 58, 33, 7)
    const weight: number = 13
    const utx: string = "valid"
    const result: Promise<string | ErrorResponseObject> =
      api.addSubnetValidator(
        username,
        password,
        nodeID,
        subnetID,
        startTime,
        endTime,
        weight
      )
    const payload: object = {
      result: {
        txID: utx
      }
    }
    const responseObj: HttpResponse = {
      data: payload
    }

    mockAxios.mockResponse(responseObj)
    const response: string | ErrorResponseObject = await result

    expect(mockAxios.request).toHaveBeenCalledTimes(1)
    expect(response).toBe(utx)
  })

  test("addDelegator 1", async (): Promise<void> => {
    const nodeID: string = "abcdef"
    const startTime = new Date(1985, 5, 9, 12, 59, 43, 9)
    const endTime: Date = new Date(1982, 3, 1, 12, 58, 33, 7)
    const stakeAmount: BN = new BN(13)
    const rewardAddress: string = "fedcba"
    const utx: string = "valid"
    const result: Promise<string> = api.addDelegator(
      username,
      password,
      nodeID,
      startTime,
      endTime,
      stakeAmount,
      rewardAddress
    )
    const payload: object = {
      result: {
        txID: utx
      }
    }
    const responseObj: HttpResponse = {
      data: payload
    }

    mockAxios.mockResponse(responseObj)
    const response: string = await result

    expect(mockAxios.request).toHaveBeenCalledTimes(1)
    expect(response).toBe(utx)
  })

  test("getBlockchains 1", async (): Promise<void> => {
    const resp: object[] = [
      {
        id: "nodeID",
        subnetID: "subnetID",
        vmID: "vmID"
      }
    ]
    const result: Promise<Blockchain[]> = api.getBlockchains()
    const payload: object = {
      result: {
        blockchains: resp
      }
    }
    const responseObj: HttpResponse = {
      data: payload
    }

    mockAxios.mockResponse(responseObj)
    const response: Blockchain[] = await result

    expect(mockAxios.request).toHaveBeenCalledTimes(1)
    expect(response).toBe(resp)
  })

  test("getSubnets 1", async (): Promise<void> => {
    const resp: object[] = [
      {
        id: "id",
        controlKeys: ["controlKeys"],
        threshold: "threshold"
      }
    ]
    const result: Promise<Subnet[]> = api.getSubnets()
    const payload: object = {
      result: {
        subnets: resp
      }
    }
    const responseObj: HttpResponse = {
      data: payload
    }

    mockAxios.mockResponse(responseObj)
    const response: object = await result

    expect(mockAxios.request).toHaveBeenCalledTimes(1)
    expect(response).toEqual(resp)
  })

  test("getCurrentValidators 1", async (): Promise<void> => {
    const validators: string[] = ["val1", "val2"]
    const result: Promise<object> = api.getCurrentValidators()
    const payload: object = {
      result: {
        validators
      }
    }
    const responseObj: HttpResponse = {
      data: payload
    }

    mockAxios.mockResponse(responseObj)
    const response: object = await result

    expect(mockAxios.request).toHaveBeenCalledTimes(1)
    expect(response).toStrictEqual({ validators })
  })

  test("getCurrentValidators 2", async (): Promise<void> => {
    const subnetID: string = "abcdef"
    const validators: string[] = ["val1", "val2"]
    const result: Promise<object> = api.getCurrentValidators(subnetID)
    const payload: object = {
      result: {
        validators
      }
    }
    const responseObj: HttpResponse = {
      data: payload
    }

    mockAxios.mockResponse(responseObj)
    const response: object = await result

    expect(mockAxios.request).toHaveBeenCalledTimes(1)
    expect(response).toStrictEqual({ validators })
  })

  test("getCurrentValidators 3", async (): Promise<void> => {
    const subnetID: Buffer = Buffer.from("abcdef", "hex")
    const validators: string[] = ["val1", "val2"]
    const result: Promise<object> = api.getCurrentValidators(subnetID)
    const payload: object = {
      result: {
        validators
      }
    }
    const responseObj: HttpResponse = {
      data: payload
    }

    mockAxios.mockResponse(responseObj)
    const response: object = await result

    expect(mockAxios.request).toHaveBeenCalledTimes(1)
    expect(response).toStrictEqual({ validators })
  })

  test("exportKey", async (): Promise<void> => {
    const key: string = "sdfglvlj2h3v45"

    const result: Promise<string | ErrorResponseObject> = api.exportKey(
      username,
      password,
      addrA
    )
    const payload: object = {
      result: {
        privateKey: key
      }
    }
    const responseObj: HttpResponse = {
      data: payload
    }

    mockAxios.mockResponse(responseObj)
    const response: string | ErrorResponseObject = await result

    expect(mockAxios.request).toHaveBeenCalledTimes(1)
    expect(response).toBe(key)
  })

  test("exportAVAX", async (): Promise<void> => {
    const amount: BN = new BN(100)
    const to: string = "abcdef"
    const username: string = "Robert"
    const password: string = "Paulson"
    const txID: string = "valid"
    const result: Promise<string | ErrorResponseObject> = api.exportAVAX(
      username,
      password,
      amount,
      to
    )
    const payload: object = {
      result: {
        txID: txID
      }
    }
    const responseObj: HttpResponse = {
      data: payload
    }

    mockAxios.mockResponse(responseObj)
    const response: string | ErrorResponseObject = await result

    expect(mockAxios.request).toHaveBeenCalledTimes(1)
    expect(response).toBe(txID)
  })

  test("importAVAX", async (): Promise<void> => {
    const to: string = "abcdef"
    const username: string = "Robert"
    const password = "Paulson"
    const txID = "valid"
    const result: Promise<string | ErrorResponseObject> = api.importAVAX(
      username,
      password,
      to,
      blockchainID
    )
    const payload: object = {
      result: {
        txID: txID
      }
    }
    const responseObj: HttpResponse = {
      data: payload
    }

    mockAxios.mockResponse(responseObj)
    const response: string | ErrorResponseObject = await result

    expect(mockAxios.request).toHaveBeenCalledTimes(1)
    expect(response).toBe(txID)
  })

  test("createBlockchain", async (): Promise<void> => {
    const blockchainID: string = "7sik3Pr6r1FeLrvK1oWwECBS8iJ5VPuSh"
    const vmID: string = "7sik3Pr6r1FeLrvK1oWwECBS8iJ5VPuSh"
    const name: string = "Some Blockchain"
    const genesis: string = '{ruh:"roh"}'
    const subnetID: Buffer = Buffer.from("abcdef", "hex")
    const result: Promise<string | ErrorResponseObject> = api.createBlockchain(
      username,
      password,
      subnetID,
      vmID,
      [1, 2, 3],
      name,
      genesis
    )
    const payload: object = {
      result: {
        txID: blockchainID
      }
    }
    const responseObj: HttpResponse = {
      data: payload
    }

    mockAxios.mockResponse(responseObj)
    const response: string | ErrorResponseObject = await result

    expect(mockAxios.request).toHaveBeenCalledTimes(1)
    expect(response).toBe(blockchainID)
  })

  test("getBlockchainStatus", async (): Promise<void> => {
    const blockchainID: string = "7sik3Pr6r1FeLrvK1oWwECBS8iJ5VPuSh"
    const result: Promise<string> = api.getBlockchainStatus(blockchainID)
    const payload: object = {
      result: {
        status: "Accepted"
      }
    }
    const responseObj: HttpResponse = {
      data: payload
    }

    mockAxios.mockResponse(responseObj)
    const response: string = await result

    expect(mockAxios.request).toHaveBeenCalledTimes(1)
    expect(response).toBe("Accepted")
  })

  test("createAddress", async (): Promise<void> => {
    const alias: string = "randomalias"

    const result: Promise<string> = api.createAddress(username, password)
    const payload: object = {
      result: {
        address: alias
      }
    }
    const responseObj: HttpResponse = {
      data: payload
    }

    mockAxios.mockResponse(responseObj)
    const response: string = await result

    expect(mockAxios.request).toHaveBeenCalledTimes(1)
    expect(response).toBe(alias)
  })

  test("createSubnet 1", async (): Promise<void> => {
    const controlKeys: string[] = ["abcdef"]
    const threshold: number = 13
    const utx: string = "valid"
    const result: Promise<string | ErrorResponseObject> = api.createSubnet(
      username,
      password,
      controlKeys,
      threshold
    )
    const payload: object = {
      result: {
        txID: utx
      }
    }
    const responseObj: HttpResponse = {
      data: payload
    }

    mockAxios.mockResponse(responseObj)
    const response: string | ErrorResponseObject = await result

    expect(mockAxios.request).toHaveBeenCalledTimes(1)
    expect(response).toBe(utx)
  })

  test("sampleValidators 1", async (): Promise<void> => {
    let subnetID
    const validators: string[] = ["val1", "val2"]
    const result: Promise<string[]> = api.sampleValidators(10, subnetID)
    const payload: object = {
      result: {
        validators
      }
    }
    const responseObj: HttpResponse = {
      data: payload
    }

    mockAxios.mockResponse(responseObj)
    const response: string[] = await result

    expect(mockAxios.request).toHaveBeenCalledTimes(1)
    expect(response).toBe(validators)
  })

  test("sampleValidators 2", async (): Promise<void> => {
    const subnetID: string = "abcdef"
    const validators: string[] = ["val1", "val2"]
    const result: Promise<string[]> = api.sampleValidators(10, subnetID)
    const payload: object = {
      result: {
        validators
      }
    }
    const responseObj: HttpResponse = {
      data: payload
    }

    mockAxios.mockResponse(responseObj)
    const response: string[] = await result

    expect(mockAxios.request).toHaveBeenCalledTimes(1)
    expect(response).toBe(validators)
  })

  test("sampleValidators 3", async (): Promise<void> => {
    const subnetID = Buffer.from("abcdef", "hex")
    const validators: string[] = ["val1", "val2"]
    const result: Promise<string[]> = api.sampleValidators(10, subnetID)
    const payload: object = {
      result: {
        validators
      }
    }
    const responseObj: HttpResponse = {
      data: payload
    }

    mockAxios.mockResponse(responseObj)
    const response: string[] = await result

    expect(mockAxios.request).toHaveBeenCalledTimes(1)
    expect(response).toBe(validators)
  })

  test("validatedBy 1", async (): Promise<void> => {
    const blockchainID: string = "abcdef"
    const resp: string = "valid"
    const result: Promise<string> = api.validatedBy(blockchainID)
    const payload: object = {
      result: {
        subnetID: resp
      }
    }
    const responseObj: HttpResponse = {
      data: payload
    }

    mockAxios.mockResponse(responseObj)
    const response: string = await result

    expect(mockAxios.request).toHaveBeenCalledTimes(1)
    expect(response).toBe(resp)
  })

  test("validates 1", async (): Promise<void> => {
    let subnetID
    const resp: string[] = ["valid"]
    const result: Promise<string[]> = api.validates(subnetID)
    const payload: object = {
      result: {
        blockchainIDs: resp
      }
    }
    const responseObj: HttpResponse = {
      data: payload
    }

    mockAxios.mockResponse(responseObj)
    const response: string[] = await result

    expect(mockAxios.request).toHaveBeenCalledTimes(1)
    expect(response).toBe(resp)
  })

  test("validates 2", async (): Promise<void> => {
    const subnetID: string = "deadbeef"
    const resp: string[] = ["valid"]
    const result: Promise<string[]> = api.validates(subnetID)
    const payload: object = {
      result: {
        blockchainIDs: resp
      }
    }
    const responseObj: HttpResponse = {
      data: payload
    }

    mockAxios.mockResponse(responseObj)
    const response: string[] = await result

    expect(mockAxios.request).toHaveBeenCalledTimes(1)
    expect(response).toBe(resp)
  })

  test("validates 3", async (): Promise<void> => {
    const subnetID = Buffer.from("abcdef", "hex")
    const resp: string[] = ["valid"]
    const result: Promise<string[]> = api.validates(subnetID)
    const payload: object = {
      result: {
        blockchainIDs: resp
      }
    }
    const responseObj: HttpResponse = {
      data: payload
    }

    mockAxios.mockResponse(responseObj)
    const response: string[] = await result

    expect(mockAxios.request).toHaveBeenCalledTimes(1)
    expect(response).toBe(resp)
  })

  test("getTx", async (): Promise<void> => {
    const txid: string =
      "f966750f438867c3c9828ddcdbe660e21ccdbb36a9276958f011ba472f75d4e7"

    const result: Promise<string | object> = api.getTx(txid)
    const payload: object = {
      result: {
        tx: "sometx"
      }
    }
    const responseObj: HttpResponse = {
      data: payload
    }

    mockAxios.mockResponse(responseObj)
    const response: string | object = await result

    expect(mockAxios.request).toHaveBeenCalledTimes(1)
    expect(response).toBe("sometx")
  })

  test("getTxStatus", async (): Promise<void> => {
    const txid: string =
      "f966750f438867c3c9828ddcdbe660e21ccdbb36a9276958f011ba472f75d4e7"

    const result: Promise<string | GetTxStatusResponse> = api.getTxStatus(txid)
    const payload: object = {
      result: "accepted"
    }
    const responseObj: HttpResponse = {
      data: payload
    }

    mockAxios.mockResponse(responseObj)
    const response: string | GetTxStatusResponse = await result

    expect(mockAxios.request).toHaveBeenCalledTimes(1)
    expect(response).toBe("accepted")
  })

  test("getUTXOs", async (): Promise<void> => {
    // Payment
    const OPUTXOstr1: string = bintools.cb58Encode(
      Buffer.from(
        "000038d1b9f1138672da6fb6c35125539276a9acc2a668d63bea6ba3c795e2edb0f5000000013e07e38e2f23121be8756412c18db7246a16d26ee9936f3cba28be149cfd3558000000070000000000004dd500000000000000000000000100000001a36fd0c2dbcab311731dde7ef1514bd26fcdc74d",
        "hex"
      )
    )
    const OPUTXOstr2: string = bintools.cb58Encode(
      Buffer.from(
        "0000c3e4823571587fe2bdfc502689f5a8238b9d0ea7f3277124d16af9de0d2d9911000000003e07e38e2f23121be8756412c18db7246a16d26ee9936f3cba28be149cfd355800000007000000000000001900000000000000000000000100000001e1b6b6a4bad94d2e3f20730379b9bcd6f176318e",
        "hex"
      )
    )
    const OPUTXOstr3: string = bintools.cb58Encode(
      Buffer.from(
        "0000f29dba61fda8d57a911e7f8810f935bde810d3f8d495404685bdb8d9d8545e86000000003e07e38e2f23121be8756412c18db7246a16d26ee9936f3cba28be149cfd355800000007000000000000001900000000000000000000000100000001e1b6b6a4bad94d2e3f20730379b9bcd6f176318e",
        "hex"
      )
    )

    const set: UTXOSet = new UTXOSet()
    set.add(OPUTXOstr1)
    set.addArray([OPUTXOstr2, OPUTXOstr3])

    const persistOpts: PersistanceOptions = new PersistanceOptions(
      "test",
      true,
      "union"
    )
    expect(persistOpts.getMergeRule()).toBe("union")
    let addresses: string[] = set
      .getAddresses()
      .map((a): string => api.addressFromBuffer(a))
    let result: Promise<GetUTXOsResponse> = api.getUTXOs(
      addresses,
      api.getBlockchainID(),
      0,
      undefined,
      persistOpts
    )
    const payload: object = {
      result: {
        numFetched: 3,
        utxos: [OPUTXOstr1, OPUTXOstr2, OPUTXOstr3],
        stopIndex: { address: "a", utxo: "b" }
      }
    }
    const responseObj: HttpResponse = {
      data: payload
    }

    mockAxios.mockResponse(responseObj)
    let response: UTXOSet = (await result).utxos

    expect(mockAxios.request).toHaveBeenCalledTimes(1)
    expect(JSON.stringify(response.getAllUTXOStrings().sort())).toBe(
      JSON.stringify(set.getAllUTXOStrings().sort())
    )

    addresses = set.getAddresses().map((a) => api.addressFromBuffer(a))
    result = api.getUTXOs(
      addresses,
      api.getBlockchainID(),
      0,
      undefined,
      persistOpts
    )

    mockAxios.mockResponse(responseObj)
    response = (await result).utxos

    expect(mockAxios.request).toHaveBeenCalledTimes(2)
    expect(JSON.stringify(response.getAllUTXOStrings().sort())).toBe(
      JSON.stringify(set.getAllUTXOStrings().sort())
    )
  })

  describe("Transactions", (): void => {
    let set: UTXOSet
    let lset: UTXOSet
    let builder: Builder
    let lbuilder: Builder
    let keymgr2: KeyChain
    let keymgr3: KeyChain
    let addrs1: string[]
    let addrs2: string[]
    let addrs3: string[]
    let addressbuffs: Buffer[] = []
    let addresses: string[] = []
    let utxos: UTXO[]
    let lutxos: UTXO[]
    let inputs: TransferableInput[]
    let outputs: TransferableOutput[]
    const amnt: number = 10000
    const assetID: Buffer = Buffer.from(
      createHash("sha256").update("mary had a little lamb").digest()
    )
    let secpbase1: SECPTransferOutput
    let secpbase2: SECPTransferOutput
    let secpbase3: SECPTransferOutput
    let fungutxoids: string[] = []
    let platformvm: PlatformVMAPI
    const fee: number = 10
    const name: string = "Mortycoin is the dumb as a sack of hammers."
    const symbol: string = "morT"
    const denomination: number = 8

    beforeEach(async (): Promise<void> => {
      platformvm = new PlatformVMAPI(avalanche, "/ext/bc/P")
      platformvm.setAVAXAssetID(assetID)
      set = new UTXOSet()
      lset = new UTXOSet()
      builder = new Builder(set, false)
      lbuilder = new Builder(lset, false)
      platformvm.newKeyChain()
      keymgr2 = new KeyChain(avalanche.getHRP(), alias)
      keymgr3 = new KeyChain(avalanche.getHRP(), alias)
      addrs1 = []
      addrs2 = []
      addrs3 = []
      utxos = []
      lutxos = []
      inputs = []
      outputs = []
      fungutxoids = []
      const pload: Buffer = Buffer.alloc(1024)
      pload.write(
        "All you Trekkies and TV addicts, Don't mean to diss don't mean to bring static.",
        0,
        1024,
        "utf8"
      )

      for (let i: number = 0; i < 3; i++) {
        addrs1.push(
          platformvm.addressFromBuffer(
            platformvm.keyChain().makeKey().getAddress()
          )
        )
        addrs2.push(
          platformvm.addressFromBuffer(keymgr2.makeKey().getAddress())
        )
        addrs3.push(
          platformvm.addressFromBuffer(keymgr3.makeKey().getAddress())
        )
      }
      const amount: BN = ONEAVAX.mul(new BN(amnt))
      addressbuffs = platformvm.keyChain().getAddresses()
      addresses = addressbuffs.map((a) => platformvm.addressFromBuffer(a))
      const locktime: BN = new BN(54321)
      const threshold: number = 3
      for (let i: number = 0; i < 5; i++) {
        let txid: Buffer = Buffer.from(
          createHash("sha256")
            .update(bintools.fromBNToBuffer(new BN(i), 32))
            .digest()
        )
        let txidx: Buffer = Buffer.alloc(4)
        txidx.writeUInt32BE(i, 0)

        const out: SECPTransferOutput = new SECPTransferOutput(
          amount,
          addressbuffs,
          locktime,
          threshold
        )
        const xferout: TransferableOutput = new TransferableOutput(assetID, out)
        outputs.push(xferout)

        const u: UTXO = new UTXO()
        u.fromBuffer(
          Buffer.concat([u.getCodecIDBuffer(), txid, txidx, xferout.toBuffer()])
        )
        fungutxoids.push(u.getUTXOID())
        utxos.push(u)

        txid = u.getTxID()
        txidx = u.getOutputIdx()
        const asset = u.getAssetID()

        const input: SECPTransferInput = new SECPTransferInput(amount)
        const xferinput: TransferableInput = new TransferableInput(
          txid,
          txidx,
          asset,
          input
        )
        inputs.push(xferinput)
      }
      set.addArray(utxos)
      for (let i: number = 0; i < 4; i++) {
        let txid: Buffer = Buffer.from(
          createHash("sha256")
            .update(bintools.fromBNToBuffer(new BN(i), 32))
            .digest()
        )
        let txidx: Buffer = Buffer.alloc(4)
        txidx.writeUInt32BE(i, 0)

        const out: SECPTransferOutput = new SECPTransferOutput(
          ONEAVAX.mul(new BN(5)),
          addressbuffs,
          locktime,
          1
        )
        const pout: ParseableOutput = new ParseableOutput(out)
        const lockout: StakeableLockOut = new StakeableLockOut(
          ONEAVAX.mul(new BN(5)),
          addressbuffs,
          locktime,
          1,
          locktime.add(new BN(86400)),
          pout
        )
        const xferout: TransferableOutput = new TransferableOutput(
          assetID,
          lockout
        )

        const u: UTXO = new UTXO()
        u.fromBuffer(
          Buffer.concat([u.getCodecIDBuffer(), txid, txidx, xferout.toBuffer()])
        )
        lutxos.push(u)
      }

      lset.addArray(lutxos)
      lset.addArray(set.getAllUTXOs())

      secpbase1 = new SECPTransferOutput(
        new BN(777),
        addrs3.map((a) => platformvm.parseAddress(a)),
        UnixNow(),
        1
      )
      secpbase2 = new SECPTransferOutput(
        new BN(888),
        addrs2.map((a) => platformvm.parseAddress(a)),
        UnixNow(),
        1
      )
      secpbase3 = new SECPTransferOutput(
        new BN(999),
        addrs2.map((a) => platformvm.parseAddress(a)),
        UnixNow(),
        1
      )
    })

    test("signTx", async (): Promise<void> => {
      const assetID: Buffer = await platformvm.getAVAXAssetID()
      const txu2: UnsignedTx = await builder.buildBaseTx(
        networkID,
        bintools.cb58Decode(blockchainID),
        new BN(amnt),
        assetID,
        addrs3.map((a): Buffer => platformvm.parseAddress(a)),
        {
          from: addrs1.map((a): Buffer => platformvm.parseAddress(a)),
          signer: []
        },
        addrs1.map((a): Buffer => platformvm.parseAddress(a)),
        platformvm.getTxFee(),
        assetID,
        undefined,
        UnixNow(),
        new BN(0),
        1
      )

      txu2.sign(platformvm.keyChain())
    })

    test("buildImportTx", async (): Promise<void> => {
      const locktime: BN = new BN(0)
      const threshold: number = 1
      platformvm.setTxFee(new BN(fee))
      const addrbuff1 = addrs1.map((a) => platformvm.parseAddress(a))
      const addrbuff2 = addrs2.map((a) => platformvm.parseAddress(a))
      const addrbuff3 = addrs3.map((a) => platformvm.parseAddress(a))
      const fungutxo: UTXO = set.getUTXO(fungutxoids[1])
      const fungutxostr: string = fungutxo.toString()

      const result: Promise<UnsignedTx> = platformvm.buildImportTx(
        set,
        addrs1,
        DefaultPlatformChainID,
        addrs3,
        addrs1,
        addrs2,
        new UTF8Payload("hello world"),
        UnixNow(),
        locktime,
        threshold
      )
      const payload: object = {
        result: {
          utxos: [fungutxostr]
        }
      }
      const responseObj: HttpResponse = {
        data: payload
      }

      mockAxios.mockResponse(responseObj)
      const txu1: UnsignedTx = await result

      const txu2: UnsignedTx = await builder.buildImportTx(
        networkID,
        bintools.cb58Decode(blockchainID),
        addrbuff3,
        { from: addrbuff1, signer: [] },
        addrbuff2,
        [fungutxo],
        bintools.cb58Decode(DefaultPlatformChainID),
        platformvm.getTxFee(),
        await platformvm.getAVAXAssetID(),
        new UTF8Payload("hello world").getPayload(),
        UnixNow(),
        locktime,
        threshold
      )

      expect(txu2.toBuffer().toString("hex")).toBe(
        txu1.toBuffer().toString("hex")
      )
      expect(txu2.toString()).toBe(txu1.toString())

      const tx1: Tx = txu1.sign(platformvm.keyChain())
      const checkTx: string = tx1.toBuffer().toString("hex")
      const tx1obj: object = tx1.serialize("hex")
      const tx1str: string = JSON.stringify(tx1obj)

      const tx2newobj: object = JSON.parse(tx1str)
      const tx2: Tx = new Tx()
      tx2.deserialize(tx2newobj, "hex")

      expect(tx2.toBuffer().toString("hex")).toBe(checkTx)

      const tx3: Tx = txu1.sign(platformvm.keyChain())
      const tx3obj: object = tx3.serialize(display)
      const tx3str: string = JSON.stringify(tx3obj)

      const tx4newobj: object = JSON.parse(tx3str)
      const tx4: Tx = new Tx()
      tx4.deserialize(tx4newobj, display)

      expect(tx4.toBuffer().toString("hex")).toBe(checkTx)

      serialzeit(tx1, "ImportTx")
    })

    test("buildExportTx", async (): Promise<void> => {
      platformvm.setTxFee(new BN(fee))
      const addrbuff1 = addrs1.map((a) => platformvm.parseAddress(a))
      const addrbuff2 = addrs2.map((a) => platformvm.parseAddress(a))
      const addrbuff3 = addrs3.map((a) => platformvm.parseAddress(a))
      const amount: BN = new BN(90)
      const type: SerializedType = "bech32"
      const txu1: UnsignedTx = await platformvm.buildExportTx(
        set,
        amount,
        bintools.cb58Decode(TestXBlockchainID),
        addrbuff3.map((a) =>
          serializer.bufferToType(a, type, avalanche.getHRP(), "P")
        ),
        addrs1,
        addrs2,
        new UTF8Payload("hello world"),
        UnixNow()
      )

      const txu2: UnsignedTx = await builder.buildExportTx(
        networkID,
        bintools.cb58Decode(blockchainID),
        amount,
        assetID,
        addrbuff3,
        { from: addrbuff1, signer: [] },
        bintools.cb58Decode(TestXBlockchainID),
        addrbuff2,
        platformvm.getTxFee(),
        assetID,
        new UTF8Payload("hello world").getPayload(),
        UnixNow()
      )

      expect(txu2.toBuffer().toString("hex")).toBe(
        txu1.toBuffer().toString("hex")
      )
      expect(txu2.toString()).toBe(txu1.toString())

      const txu3: UnsignedTx = await platformvm.buildExportTx(
        set,
        amount,
        bintools.cb58Decode(TestXBlockchainID),
        addrs3,
        addrs1,
        addrs2,
        new UTF8Payload("hello world"),
        UnixNow()
      )

      const txu4: UnsignedTx = await builder.buildExportTx(
        networkID,
        bintools.cb58Decode(blockchainID),
        amount,
        assetID,
        addrbuff3,
        { from: addrbuff1, signer: [] },
        undefined,
        addrbuff2,
        platformvm.getTxFee(),
        assetID,
        new UTF8Payload("hello world").getPayload(),
        UnixNow()
      )

      expect((): void => {
        txu4.toBuffer()
      }).toThrow()

      expect(txu2.toBuffer().toString("hex")).toBe(
        txu1.toBuffer().toString("hex")
      )
      expect(txu2.toString()).toBe(txu1.toString())

      const tx1: Tx = txu1.sign(platformvm.keyChain())
      const checkTx: string = tx1.toBuffer().toString("hex")
      const tx1obj: object = tx1.serialize("hex")
      const tx1str: string = JSON.stringify(tx1obj)

      const tx2newobj: object = JSON.parse(tx1str)
      const tx2: Tx = new Tx()
      tx2.deserialize(tx2newobj, "hex")

      expect(tx2.toBuffer().toString("hex")).toBe(checkTx)

      const tx3: Tx = txu1.sign(platformvm.keyChain())
      const tx3obj: object = tx3.serialize(display)
      const tx3str: string = JSON.stringify(tx3obj)

      const tx4newobj: object = JSON.parse(tx3str)
      const tx4: Tx = new Tx()
      tx4.deserialize(tx4newobj, display)

      expect(tx4.toBuffer().toString("hex")).toBe(checkTx)

      serialzeit(tx1, "ExportTx")
    })

    test("buildAddSubnetValidatorTx", async (): Promise<void> => {
      const subnetID = "2cXEvbdDaP6q6srB6x1T14raebpJaM4s2t9NE5kiXzLqLXQDWm"
      const addrbuff1 = addrs1.map((a) => platformvm.parseAddress(a))
      const addrbuff2 = addrs2.map((a) => platformvm.parseAddress(a))

      const txu1: UnsignedTx = await platformvm.buildAddSubnetValidatorTx(
        set,
        addrs1,
        addrs2,
        nodeID,
        startTime,
        endTime,
        avalanche.getNetwork().P.minStake,
        subnetID,
        new UTF8Payload("hello world"),
        UnixNow(),
        {
          addresses: addrbuff1,
          threshold: 1,
          signer: [[0, addrbuff1[0]]]
        }
      )

      const txu2: UnsignedTx = await builder.buildAddSubnetValidatorTx(
        networkID,
        bintools.cb58Decode(blockchainID),
        {
          from: addrbuff1,
          signer: []
        },
        addrbuff2,
        NodeIDStringToBuffer(nodeID),
        startTime,
        endTime,
        avalanche.getNetwork().P.minStake,
        subnetID,
        new BN(avalanche.getNetwork().P.txFee ?? 0),
        assetID,
        new UTF8Payload("hello world").getPayload(),
        UnixNow(),
        {
          addresses: addrbuff1,
          threshold: 1,
          signer: [[0, addrbuff1[0]]]
        }
      )
      expect(txu2.toBuffer().toString("hex")).toBe(
        txu1.toBuffer().toString("hex")
      )
      expect(txu2.toString()).toBe(txu1.toString())
    })

    test("buildAddDelegatorTx 1", async (): Promise<void> => {
      const addrbuff1 = addrs1.map((a) => platformvm.parseAddress(a))
      const addrbuff2 = addrs2.map((a) => platformvm.parseAddress(a))
      const addrbuff3 = addrs3.map((a) => platformvm.parseAddress(a))
      const amount: BN = avalanche.getNetwork().P.minDelegationStake

      const locktime: BN = new BN(54321)
      const threshold: number = 2

      platformvm.setMinStake(
        avalanche.getNetwork().P.minStake,
        avalanche.getNetwork().P.minDelegationStake
      )

      const txu1: UnsignedTx = await platformvm.buildAddDelegatorTx(
        set,
        addrs3,
        addrs1,
        addrs2,
        nodeID,
        startTime,
        endTime,
        amount,
        addrs3,
        locktime,
        threshold,
        new UTF8Payload("hello world"),
        UnixNow()
      )

      const txu2: UnsignedTx = await builder.buildAddDelegatorTx(
        networkID,
        bintools.cb58Decode(blockchainID),
        assetID,
        addrbuff3,
        { from: addrbuff1, signer: [] },
        addrbuff2,
        NodeIDStringToBuffer(nodeID),
        startTime,
        endTime,
        amount,
        locktime,
        threshold,
        addrbuff3,
        new BN(0),
        assetID,
        new UTF8Payload("hello world").getPayload(),
        UnixNow()
      )
      expect(txu2.toBuffer().toString("hex")).toBe(
        txu1.toBuffer().toString("hex")
      )
      expect(txu2.toString()).toBe(txu1.toString())

      const tx1: Tx = txu1.sign(platformvm.keyChain())
      const checkTx: string = tx1.toBuffer().toString("hex")
      const tx1obj: object = tx1.serialize("hex")
      const tx1str: string = JSON.stringify(tx1obj)

      const tx2newobj: object = JSON.parse(tx1str)
      const tx2: Tx = new Tx()
      tx2.deserialize(tx2newobj, "hex")

      expect(tx2.toBuffer().toString("hex")).toBe(checkTx)

      const tx3: Tx = txu1.sign(platformvm.keyChain())
      const tx3obj: object = tx3.serialize(display)
      const tx3str: string = JSON.stringify(tx3obj)

      const tx4newobj: object = JSON.parse(tx3str)
      const tx4: Tx = new Tx()
      tx4.deserialize(tx4newobj, display)

      expect(tx4.toBuffer().toString("hex")).toBe(checkTx)

      serialzeit(tx1, "AddDelegatorTx")
    })
    /*
   TODO: @VjeraTurk Change to buildAddCaminoValidatorTX
    test("buildAddValidatorTx sort StakeableLockOuts 1", async (): Promise<void> => {
      // two UTXO. The 1st has a lesser stakeablelocktime and a greater amount of AVAX. The 2nd has a greater stakeablelocktime and a lesser amount of AVAX.
      // We expect this test to only consume the 2nd UTXO since it has the greater locktime.
      const addrbuff1: Buffer[] = addrs1.map((a) => platformvm.parseAddress(a))
      const amount1: BN = new BN("20000000000000000")
      const amount2: BN = new BN("10000000000000000")
      const locktime1: BN = new BN(0)
      const threshold: number = 1

      const stakeableLockTime1: BN = new BN(1633824000)
      const secpTransferOutput1: SECPTransferOutput = new SECPTransferOutput(
        amount1,
        addrbuff1,
        locktime1,
        threshold
      )
      const parseableOutput1: ParseableOutput = new ParseableOutput(
        secpTransferOutput1
      )
      const stakeableLockOut1: StakeableLockOut = new StakeableLockOut(
        amount1,
        addrbuff1,
        locktime1,
        threshold,
        stakeableLockTime1,
        parseableOutput1
      )
      const stakeableLockTime2: BN = new BN(1733824000)
      const secpTransferOutput2: SECPTransferOutput = new SECPTransferOutput(
        amount2,
        addrbuff1,
        locktime1,
        threshold
      )
      const parseableOutput2: ParseableOutput = new ParseableOutput(
        secpTransferOutput2
      )
      const stakeableLockOut2: StakeableLockOut = new StakeableLockOut(
        amount2,
        addrbuff1,
        locktime1,
        threshold,
        stakeableLockTime2,
        parseableOutput2
      )
      const nodeID: string = "NodeID-36giFye5epwBTpGqPk7b4CCYe3hfyoFr1"
      const stakeAmount: BN = avalanche.getNetwork().P.minStake
      platformvm.setMinStake(
        stakeAmount,
        avalanche.getNetwork().P.minDelegationStake
      )
      const delegationFeeRate: number = new BN(2).toNumber()
      const codecID: number = 0
      const txid: Buffer = bintools.cb58Decode(
        "auhMFs24ffc2BRWKw6i7Qngcs8jSQUS9Ei2XwJsUpEq4sTVib"
      )
      const txid2: Buffer = bintools.cb58Decode(
        "2JwDfm3C7p88rJQ1Y1xWLkWNMA1nqPzqnaC2Hi4PDNKiPnXgGv"
      )
      const outputidx0: number = 0
      const outputidx1: number = 0
      const assetID = await platformvm.getAVAXAssetID()
      const assetID2 = await platformvm.getAVAXAssetID()
      const utxo1: UTXO = new UTXO(
        codecID,
        txid,
        outputidx0,
        assetID,
        stakeableLockOut1
      )
      const utxo2: UTXO = new UTXO(
        codecID,
        txid2,
        outputidx1,
        assetID2,
        stakeableLockOut2
      )
      const utxoSet: UTXOSet = new UTXOSet()
      utxoSet.add(utxo1)
      utxoSet.add(utxo2)
      const txu1: UnsignedTx = await platformvm.buildAddValidatorTx(
        utxoSet,
        addrs3,
        addrs1,
        addrs2,
        nodeID,
        startTime,
        endTime,
        stakeAmount,
        addrs3,
        delegationFeeRate
      )
      const tx = txu1.getTransaction() as AddValidatorTx
      const ins: TransferableInput[] = tx.getIns()
      // start test inputs
      // confirm only 1 input
      expect(ins.length).toBe(1)
      const input: TransferableInput = ins[0]
      const ai = input.getInput() as AmountInput
      const ao = stakeableLockOut2
        .getTransferableOutput()
        .getOutput() as AmountOutput
      const ao2 = stakeableLockOut1
        .getTransferableOutput()
        .getOutput() as AmountOutput
      // confirm input amount matches the output w/ the greater staekablelock time but lesser amount
      expect(ai.getAmount().toString()).toEqual(ao.getAmount().toString())
      // confirm input amount doesn't match the output w/ the lesser staekablelock time but greater amount
      expect(ai.getAmount().toString()).not.toEqual(ao2.getAmount().toString())

      const sli: StakeableLockIn = input.getInput() as StakeableLockIn
      // confirm input stakeablelock time matches the output w/ the greater stakeablelock time but lesser amount
      expect(sli.getStakeableLocktime().toString()).toEqual(
        stakeableLockOut2.getStakeableLocktime().toString()
      )
      // confirm input stakeablelock time doesn't match the output w/ the lesser stakeablelock time but greater amount
      expect(sli.getStakeableLocktime().toString()).not.toEqual(
        stakeableLockOut1.getStakeableLocktime().toString()
      )
      // stop test inputs

      // start test outputs
      const outs: TransferableOutput[] = tx.getOuts()
      // confirm only 1 output
      expect(outs.length).toBe(1)
      const output: TransferableOutput = outs[0]
      const ao3 = output.getOutput() as AmountOutput
      // confirm output amount matches the output w/ the greater stakeablelock time but lesser amount sans the stake amount
      expect(ao3.getAmount().toString()).toEqual(
        ao.getAmount().sub(stakeAmount).toString()
      )
      // confirm output amount doesn't match the output w/ the lesser stakeablelock time but greater amount
      expect(ao3.getAmount().toString()).not.toEqual(ao2.getAmount().toString())

      const slo: StakeableLockOut = output.getOutput() as StakeableLockOut
      // confirm output stakeablelock time matches the output w/ the greater stakeablelock time but lesser amount
      expect(slo.getStakeableLocktime().toString()).toEqual(
        stakeableLockOut2.getStakeableLocktime().toString()
      )
      // confirm output stakeablelock time doesn't match the output w/ the greater stakeablelock time but lesser amount
      expect(slo.getStakeableLocktime().toString()).not.toEqual(
        stakeableLockOut1.getStakeableLocktime().toString()
      )

      // confirm tx nodeID matches nodeID
      expect(tx.getNodeIDString()).toEqual(nodeID)
      // confirm tx starttime matches starttime
      expect(tx.getStartTime().toString()).toEqual(startTime.toString())
      // confirm tx endtime matches endtime
      expect(tx.getEndTime().toString()).toEqual(endTime.toString())
      // confirm tx stake amount matches stakeAmount
      expect(tx.getStakeAmount().toString()).toEqual(stakeAmount.toString())

      const stakeOuts: TransferableOutput[] = tx.getStakeOuts()
      // confirm only 1 stakeOut
      expect(stakeOuts.length).toBe(1)

      const stakeOut: TransferableOutput = stakeOuts[0]
      const slo2 = stakeOut.getOutput() as StakeableLockOut
      // confirm stakeOut stakeablelock time matches the output w/ the greater stakeablelock time but lesser amount
      expect(slo2.getStakeableLocktime().toString()).toEqual(
        stakeableLockOut2.getStakeableLocktime().toString()
      )
      // confirm stakeOut stakeablelock time doesn't match the output w/ the greater stakeablelock time but lesser amount
      expect(slo2.getStakeableLocktime().toString()).not.toEqual(
        stakeableLockOut1.getStakeableLocktime().toString()
      )
      slo2.getAmount()
      // confirm stakeOut stake amount matches stakeAmount
      expect(slo2.getAmount().toString()).toEqual(stakeAmount.toString())
    })

    test("buildAddValidatorTx sort StakeableLockOuts 2", async (): Promise<void> => {
      // TODO - debug test
      // two UTXO. The 1st has a lesser stakeablelocktime and a greater amount of AVAX. The 2nd has a greater stakeablelocktime and a lesser amount of AVAX.
      // this time we're staking a greater amount than is available in the 2nd UTXO.
      // We expect this test to consume the full 2nd UTXO and a fraction of the 1st UTXO..
      const addrbuff1: Buffer[] = addrs1.map(
        (a): Buffer => platformvm.parseAddress(a)
      )
      const amount1: BN = new BN("20000000000000000")
      const amount2: BN = new BN("10000000000000000")
      const locktime1: BN = new BN(0)
      const threshold: number = 1

      const stakeableLockTime1: BN = new BN(1633824000)
      const secpTransferOutput1: SECPTransferOutput = new SECPTransferOutput(
        amount1,
        addrbuff1,
        locktime1,
        threshold
      )
      const parseableOutput1: ParseableOutput = new ParseableOutput(
        secpTransferOutput1
      )
      const stakeableLockOut1: StakeableLockOut = new StakeableLockOut(
        amount1,
        addrbuff1,
        locktime1,
        threshold,
        stakeableLockTime1,
        parseableOutput1
      )
      const stakeableLockTime2: BN = new BN(1733824000)
      const secpTransferOutput2: SECPTransferOutput = new SECPTransferOutput(
        amount2,
        addrbuff1,
        locktime1,
        threshold
      )
      const parseableOutput2: ParseableOutput = new ParseableOutput(
        secpTransferOutput2
      )
      const stakeableLockOut2: StakeableLockOut = new StakeableLockOut(
        amount2,
        addrbuff1,
        locktime1,
        threshold,
        stakeableLockTime2,
        parseableOutput2
      )
      const nodeID: string = "NodeID-36giFye5epwBTpGqPk7b4CCYe3hfyoFr1"
      const stakeAmount: BN = new BN("10000003000000000")
      platformvm.setMinStake(
        stakeAmount,
        avalanche.getNetwork().P.minDelegationStake
      )
      const delegationFeeRate: number = new BN(2).toNumber()
      const codecID: number = 0
      const txid: Buffer = bintools.cb58Decode(
        "auhMFs24ffc2BRWKw6i7Qngcs8jSQUS9Ei2XwJsUpEq4sTVib"
      )
      const txid2: Buffer = bintools.cb58Decode(
        "2JwDfm3C7p88rJQ1Y1xWLkWNMA1nqPzqnaC2Hi4PDNKiPnXgGv"
      )
      const outputidx0: number = 0
      const outputidx1: number = 0
      const assetID: Buffer = await platformvm.getAVAXAssetID()
      const assetID2: Buffer = await platformvm.getAVAXAssetID()
      const utxo1: UTXO = new UTXO(
        codecID,
        txid,
        outputidx0,
        assetID,
        stakeableLockOut1
      )
      const utxo2: UTXO = new UTXO(
        codecID,
        txid2,
        outputidx1,
        assetID2,
        stakeableLockOut2
      )
      const utxoSet: UTXOSet = new UTXOSet()
      utxoSet.add(utxo1)
      utxoSet.add(utxo2)
      const txu1: UnsignedTx = await platformvm.buildAddValidatorTx(
        utxoSet,
        addrs3,
        addrs1,
        addrs2,
        nodeID,
        startTime,
        endTime,
        stakeAmount,
        addrs3,
        delegationFeeRate
      )
      const tx = txu1.getTransaction() as AddValidatorTx
      const ins: TransferableInput[] = tx.getIns()
      // start test inputs
      // confirm only 1 input
      expect(ins.length).toBe(2)
      const input1: TransferableInput = ins[0]
      const input2: TransferableInput = ins[1]
      const ai1 = input1.getInput() as AmountInput
      const ai2 = input2.getInput() as AmountInput
      const ao1 = stakeableLockOut2
        .getTransferableOutput()
        .getOutput() as AmountOutput
      const ao2 = stakeableLockOut1
        .getTransferableOutput()
        .getOutput() as AmountOutput
      // confirm each input amount matches the corresponding output
      expect(ai2.getAmount().toString()).toEqual(ao1.getAmount().toString())
      expect(ai1.getAmount().toString()).toEqual(ao2.getAmount().toString())

      const sli1 = input1.getInput() as StakeableLockIn
      const sli2 = input2.getInput() as StakeableLockIn
      // confirm input strakeablelock time matches the output w/ the greater staekablelock time but lesser amount
      // expect(sli1.getStakeableLocktime().toString()).toEqual(
      //   stakeableLockOut1.getStakeableLocktime().toString()
      // )
      expect(sli2.getStakeableLocktime().toString()).toEqual(
        stakeableLockOut2.getStakeableLocktime().toString()
      )
      // stop test inputs

      // start test outputs
      const outs: TransferableOutput[] = tx.getOuts()
      // confirm only 1 output
      expect(outs.length).toBe(1)
      const output: TransferableOutput = outs[0]
      const ao3 = output.getOutput() as AmountOutput
      // confirm output amount matches the output amount sans the 2nd utxo amount and the stake amount
      expect(ao3.getAmount().toString()).toEqual(
        ao2.getAmount().sub(stakeAmount.sub(ao1.getAmount())).toString()
      )

      const slo = output.getOutput() as StakeableLockOut
      // confirm output stakeablelock time matches the output w/ the lesser stakeablelock since the other was consumed
      // expect(slo.getStakeableLocktime().toString()).toEqual(
      //   stakeableLockOut1.getStakeableLocktime().toString()
      // )
      // confirm output stakeablelock time doesn't match the output w/ the greater stakeablelock time
      // expect(slo.getStakeableLocktime().toString()).not.toEqual(
      //   stakeableLockOut2.getStakeableLocktime().toString()
      // )

      // confirm tx nodeID matches nodeID
      expect(tx.getNodeIDString()).toEqual(nodeID)
      // confirm tx starttime matches starttime
      expect(tx.getStartTime().toString()).toEqual(startTime.toString())
      // confirm tx endtime matches endtime
      expect(tx.getEndTime().toString()).toEqual(endTime.toString())
      // confirm tx stake amount matches stakeAmount
      expect(tx.getStakeAmount().toString()).toEqual(stakeAmount.toString())

      let stakeOuts: TransferableOutput[] = tx.getStakeOuts()
      // confirm 2 stakeOuts
      expect(stakeOuts.length).toBe(2)

      let stakeOut1: TransferableOutput = stakeOuts[0]
      let stakeOut2: TransferableOutput = stakeOuts[1]
      let slo2 = stakeOut1.getOutput() as StakeableLockOut
      let slo3 = stakeOut2.getOutput() as StakeableLockOut
      // confirm both stakeOut strakeablelock times matche the corresponding output
      // expect(slo3.getStakeableLocktime().toString()).toEqual(
      //   stakeableLockOut1.getStakeableLocktime().toString()
      // )
      expect(slo2.getStakeableLocktime().toString()).toEqual(
        stakeableLockOut2.getStakeableLocktime().toString()
      )
    })

    test("buildAddValidatorTx sort StakeableLockOuts 3", async (): Promise<void> => {
      // TODO - debug test
      // three UTXO.
      // The 1st is a SecpTransferableOutput.
      // The 2nd has a lesser stakeablelocktime and a greater amount of AVAX.
      // The 3rd has a greater stakeablelocktime and a lesser amount of AVAX.
      //
      // this time we're staking a greater amount than is available in the 3rd UTXO.
      // We expect this test to consume the full 3rd UTXO and a fraction of the 2nd UTXO and not to consume the SecpTransferableOutput
      const addrbuff1: Buffer[] = addrs1.map((a) => platformvm.parseAddress(a))
      const amount1: BN = new BN("20000000000000000")
      const amount2: BN = new BN("10000000000000000")
      const locktime1: BN = new BN(0)
      const threshold: number = 1

      const stakeableLockTime1: BN = new BN(1633824000)
      const secpTransferOutput0: SECPTransferOutput = new SECPTransferOutput(
        amount1,
        addrbuff1,
        locktime1,
        threshold
      )
      const secpTransferOutput1: SECPTransferOutput = new SECPTransferOutput(
        amount1,
        addrbuff1,
        locktime1,
        threshold
      )
      const parseableOutput1: ParseableOutput = new ParseableOutput(
        secpTransferOutput1
      )
      const stakeableLockOut1: StakeableLockOut = new StakeableLockOut(
        amount1,
        addrbuff1,
        locktime1,
        threshold,
        stakeableLockTime1,
        parseableOutput1
      )
      const stakeableLockTime2: BN = new BN(1733824000)
      const secpTransferOutput2: SECPTransferOutput = new SECPTransferOutput(
        amount2,
        addrbuff1,
        locktime1,
        threshold
      )
      const parseableOutput2: ParseableOutput = new ParseableOutput(
        secpTransferOutput2
      )
      const stakeableLockOut2: StakeableLockOut = new StakeableLockOut(
        amount2,
        addrbuff1,
        locktime1,
        threshold,
        stakeableLockTime2,
        parseableOutput2
      )
      const nodeID: string = "NodeID-36giFye5epwBTpGqPk7b4CCYe3hfyoFr1"
      const stakeAmount: BN = new BN("10000003000000000")
      platformvm.setMinStake(
        stakeAmount,
        avalanche.getNetwork().P.minDelegationStake
      )
      const delegationFeeRate: number = new BN(2).toNumber()
      const codecID: number = 0
      const txid0: Buffer = bintools.cb58Decode(
        "auhMFs24ffc2BRWKw6i7Qngcs8jSQUS9Ei2XwJsUpEq4sTVib"
      )
      const txid1: Buffer = bintools.cb58Decode(
        "2jhyJit8kWA6SwkRwKxXepFnfhs971CEqaGkjJmiADM8H4g2LR"
      )
      const txid2: Buffer = bintools.cb58Decode(
        "2JwDfm3C7p88rJQ1Y1xWLkWNMA1nqPzqnaC2Hi4PDNKiPnXgGv"
      )
      const outputidx0: number = 0
      const outputidx1: number = 0
      const assetID: Buffer = await platformvm.getAVAXAssetID()
      const assetID2: Buffer = await platformvm.getAVAXAssetID()
      const utxo0: UTXO = new UTXO(
        codecID,
        txid0,
        outputidx0,
        assetID,
        secpTransferOutput0
      )
      const utxo1: UTXO = new UTXO(
        codecID,
        txid1,
        outputidx0,
        assetID,
        stakeableLockOut1
      )
      const utxo2: UTXO = new UTXO(
        codecID,
        txid2,
        outputidx1,
        assetID2,
        stakeableLockOut2
      )
      const utxoSet: UTXOSet = new UTXOSet()
      utxoSet.add(utxo0)
      utxoSet.add(utxo1)
      utxoSet.add(utxo2)
      const txu1: UnsignedTx = await platformvm.buildAddValidatorTx(
        utxoSet,
        addrs3,
        addrs1,
        addrs2,
        nodeID,
        startTime,
        endTime,
        stakeAmount,
        addrs3,
        delegationFeeRate
      )
      const tx = txu1.getTransaction() as AddValidatorTx
      const ins: TransferableInput[] = tx.getIns()
      // start test inputs
      // confirm only 1 input
      expect(ins.length).toBe(2)
      const input1: TransferableInput = ins[0]
      const input2: TransferableInput = ins[1]
      const ai1 = input1.getInput() as AmountInput
      const ai2 = input2.getInput() as AmountInput
      const ao1 = stakeableLockOut2
        .getTransferableOutput()
        .getOutput() as AmountOutput
      const ao2 = stakeableLockOut1
        .getTransferableOutput()
        .getOutput() as AmountOutput
      // confirm each input amount matches the corresponding output
      expect(ai2.getAmount().toString()).toEqual(ao2.getAmount().toString())
      expect(ai1.getAmount().toString()).toEqual(ao1.getAmount().toString())

      const sli1 = input1.getInput() as StakeableLockIn
      const sli2 = input2.getInput() as StakeableLockIn
      // confirm input strakeablelock time matches the output w/ the greater staekablelock time but lesser amount
      expect(sli1.getStakeableLocktime().toString()).toEqual(
        stakeableLockOut2.getStakeableLocktime().toString()
      )
      // expect(sli2.getStakeableLocktime().toString()).toEqual(
      //   stakeableLockOut1.getStakeableLocktime().toString()
      // )
      // stop test inputs

      // start test outputs
      const outs: TransferableOutput[] = tx.getOuts()
      // confirm only 1 output
      expect(outs.length).toBe(1)
      const output: TransferableOutput = outs[0]
      const ao3 = output.getOutput() as AmountOutput
      // confirm output amount matches the output amount sans the 2nd utxo amount and the stake amount
      expect(ao3.getAmount().toString()).toEqual(
        ao2.getAmount().sub(stakeAmount.sub(ao1.getAmount())).toString()
      )

      const slo = output.getOutput() as StakeableLockOut
      // confirm output stakeablelock time matches the output w/ the lesser stakeablelock since the other was consumed
      // expect(slo.getStakeableLocktime().toString()).toEqual(
      //   stakeableLockOut1.getStakeableLocktime().toString()
      // )
      // confirm output stakeablelock time doesn't match the output w/ the greater stakeablelock time
      // expect(slo.getStakeableLocktime().toString()).not.toEqual(
      //   stakeableLockOut2.getStakeableLocktime().toString()
      // )

      // confirm tx nodeID matches nodeID
      expect(tx.getNodeIDString()).toEqual(nodeID)
      // confirm tx starttime matches starttime
      expect(tx.getStartTime().toString()).toEqual(startTime.toString())
      // confirm tx endtime matches endtime
      expect(tx.getEndTime().toString()).toEqual(endTime.toString())
      // confirm tx stake amount matches stakeAmount
      expect(tx.getStakeAmount().toString()).toEqual(stakeAmount.toString())

      const stakeOuts: TransferableOutput[] = tx.getStakeOuts()
      // confirm 2 stakeOuts
      expect(stakeOuts.length).toBe(2)

      const stakeOut1: TransferableOutput = stakeOuts[0]
      const stakeOut2: TransferableOutput = stakeOuts[1]
      const slo2 = stakeOut1.getOutput() as StakeableLockOut
      const slo3 = stakeOut2.getOutput() as StakeableLockOut
      // confirm both stakeOut strakeablelock times matche the corresponding output
      // expect(slo3.getStakeableLocktime().toString()).toEqual(
      //   stakeableLockOut1.getStakeableLocktime().toString()
      // )
      expect(slo2.getStakeableLocktime().toString()).toEqual(
        stakeableLockOut2.getStakeableLocktime().toString()
      )
    })
*/
    test("buildAddValidatorTx 1", async (): Promise<void> => {
      const addrbuff1 = addrs1.map((a) => platformvm.parseAddress(a))
      const addrbuff2 = addrs2.map((a) => platformvm.parseAddress(a))
      const addrbuff3 = addrs3.map((a) => platformvm.parseAddress(a))
      const amount: BN = avalanche.getNetwork().P.minStake.add(new BN(fee))

      const locktime: BN = new BN(54321)
      const threshold: number = 2

      platformvm.setMinStake(
        avalanche.getNetwork().P.minStake,
        avalanche.getNetwork().P.minDelegationStake
      )

      const txu1: UnsignedTx = await platformvm.buildAddValidatorTx(
        set,
        addrs3,
        addrs1,
        addrs2,
        nodeID,
        startTime,
        endTime,
        amount,
        addrs3,
        0.1334556,
        locktime,
        threshold,
        new UTF8Payload("hello world"),
        UnixNow()
      )

      const txu2: UnsignedTx = await builder.buildAddValidatorTx(
        networkID,
        bintools.cb58Decode(blockchainID),
        addrbuff3,
        { from: addrbuff1, signer: [] },
        addrbuff2,
        NodeIDStringToBuffer(nodeID),
        startTime,
        endTime,
        amount,
        assetID,
        locktime,
        threshold,
        addrbuff3,
        0.1335,
        new BN(0),
        assetID,
        new UTF8Payload("hello world").getPayload(),
        UnixNow()
      )
      expect(txu2.toBuffer().toString("hex")).toBe(
        txu1.toBuffer().toString("hex")
      )
      expect(txu2.toString()).toBe(txu1.toString())

      const tx1: Tx = txu1.sign(platformvm.keyChain())
      const checkTx: string = tx1.toBuffer().toString("hex")
      const tx1obj: object = tx1.serialize("hex")
      const tx1str: string = JSON.stringify(tx1obj)

      const tx2newobj: object = JSON.parse(tx1str)
      const tx2: Tx = new Tx()
      tx2.deserialize(tx2newobj, "hex")

      expect(tx2.toBuffer().toString("hex")).toBe(checkTx)

      const tx3: Tx = txu1.sign(platformvm.keyChain())
      const tx3obj: object = tx3.serialize(display)
      const tx3str: string = JSON.stringify(tx3obj)

      const tx4newobj: object = JSON.parse(tx3str)
      const tx4: Tx = new Tx()
      tx4.deserialize(tx4newobj, display)

      expect(tx4.toBuffer().toString("hex")).toBe(checkTx)

      serialzeit(tx1, "AddValidatorTx")
    })

    test("buildAddDelegatorTx 2", async (): Promise<void> => {
      const addrbuff1 = addrs1.map((a) => platformvm.parseAddress(a))
      const addrbuff2 = addrs2.map((a) => platformvm.parseAddress(a))
      const addrbuff3 = addrs3.map((a) => platformvm.parseAddress(a))
      const amount: BN = avalanche.getNetwork().P.minDelegationStake
      const locktime: BN = new BN(54321)
      const threshold: number = 2

      platformvm.setMinStake(
        avalanche.getNetwork().P.minStake,
        avalanche.getNetwork().P.minDelegationStake
      )

      const txu1: UnsignedTx = await platformvm.buildAddDelegatorTx(
        lset,
        addrs3,
        addrs1,
        addrs2,
        nodeID,
        startTime,
        endTime,
        amount,
        addrs3,
        locktime,
        threshold,
        new UTF8Payload("hello world"),
        UnixNow()
      )

      const txu2: UnsignedTx = await lbuilder.buildAddDelegatorTx(
        networkID,
        bintools.cb58Decode(blockchainID),
        assetID,
        addrbuff3,
        { from: addrbuff1, signer: [] },
        addrbuff2,
        NodeIDStringToBuffer(nodeID),
        startTime,
        endTime,
        amount,
        locktime,
        threshold,
        addrbuff3,
        new BN(0),
        assetID,
        new UTF8Payload("hello world").getPayload(),
        UnixNow()
      )
      expect(txu2.toBuffer().toString("hex")).toBe(
        txu1.toBuffer().toString("hex")
      )
      expect(txu2.toString()).toBe(txu1.toString())

      const tx1: Tx = txu1.sign(platformvm.keyChain())
      const checkTx: string = tx1.toBuffer().toString("hex")
      const tx1obj: object = tx1.serialize("hex")
      const tx1str: string = JSON.stringify(tx1obj)

      const tx2newobj: object = JSON.parse(tx1str)
      const tx2: Tx = new Tx()
      tx2.deserialize(tx2newobj, "hex")

      expect(tx2.toBuffer().toString("hex")).toBe(checkTx)

      const tx3: Tx = txu1.sign(platformvm.keyChain())
      const tx3obj: object = tx3.serialize(display)
      const tx3str: string = JSON.stringify(tx3obj)

      const tx4newobj: object = JSON.parse(tx3str)
      const tx4: Tx = new Tx()
      tx4.deserialize(tx4newobj, display)

      expect(tx4.toBuffer().toString("hex")).toBe(checkTx)

      serialzeit(tx1, "AddDelegatorTx")
    })

    test("buildAddValidatorTx 2", async (): Promise<void> => {
      const addrbuff1 = addrs1.map((a) => platformvm.parseAddress(a))
      const addrbuff2 = addrs2.map((a) => platformvm.parseAddress(a))
      const addrbuff3 = addrs3.map((a) => platformvm.parseAddress(a))
      const amount: BN = ONEAVAX.mul(new BN(25))

      const locktime: BN = new BN(54321)
      const threshold: number = 2

      platformvm.setMinStake(ONEAVAX.mul(new BN(25)), ONEAVAX.mul(new BN(25)))

      const txu1: UnsignedTx = await platformvm.buildAddValidatorTx(
        lset,
        addrs3,
        addrs1,
        addrs2,
        nodeID,
        startTime,
        endTime,
        amount,
        addrs3,
        0.1334556,
        locktime,
        threshold,
        new UTF8Payload("hello world"),
        UnixNow()
      )

      const txu2: UnsignedTx = await lbuilder.buildAddValidatorTx(
        networkID,
        bintools.cb58Decode(blockchainID),
        addrbuff3,
        { from: addrbuff1, signer: [] },
        addrbuff2,
        NodeIDStringToBuffer(nodeID),
        startTime,
        endTime,
        amount,
        assetID,
        locktime,
        threshold,
        addrbuff3,
        0.1335,
        new BN(0),
        assetID,
        new UTF8Payload("hello world").getPayload(),
        UnixNow()
      )
      expect(txu2.toBuffer().toString("hex")).toBe(
        txu1.toBuffer().toString("hex")
      )
      expect(txu2.toString()).toBe(txu1.toString())

      const tx1: Tx = txu1.sign(platformvm.keyChain())
      const checkTx: string = tx1.toBuffer().toString("hex")
      const tx1obj: object = tx1.serialize("hex")
      const tx1str: string = JSON.stringify(tx1obj)

      const tx2newobj: object = JSON.parse(tx1str)
      const tx2: Tx = new Tx()
      tx2.deserialize(tx2newobj, "hex")

      expect(tx2.toBuffer().toString("hex")).toBe(checkTx)

      const tx3: Tx = txu1.sign(platformvm.keyChain())
      const tx3obj: object = tx3.serialize(display)
      const tx3str: string = JSON.stringify(tx3obj)

      const tx4newobj: object = JSON.parse(tx3str)
      const tx4: Tx = new Tx()
      tx4.deserialize(tx4newobj, display)

      expect(tx4.toBuffer().toString("hex")).toBe(checkTx)

      serialzeit(tx1, "AddValidatorTx")
    })

    test("buildAddValidatorTx 3", async (): Promise<void> => {
      const addrbuff1 = addrs1.map((a) => platformvm.parseAddress(a))
      const addrbuff2 = addrs2.map((a) => platformvm.parseAddress(a))
      const addrbuff3 = addrs3.map((a) => platformvm.parseAddress(a))
      const amount: BN = ONEAVAX.mul(new BN(3))

      const locktime: BN = new BN(54321)
      const threshold: number = 2

      platformvm.setMinStake(ONEAVAX.mul(new BN(3)), ONEAVAX.mul(new BN(3)))

      //2 utxos; one lockedstakeable; other unlocked; both utxos have 2 avax; stake 3 AVAX

      const dummySet: UTXOSet = new UTXOSet()

      const lockedBaseOut: SECPTransferOutput = new SECPTransferOutput(
        ONEAVAX.mul(new BN(2)),
        addrbuff1,
        locktime,
        1
      )
      const lockedBaseXOut: ParseableOutput = new ParseableOutput(lockedBaseOut)
      const lockedOut: StakeableLockOut = new StakeableLockOut(
        ONEAVAX.mul(new BN(2)),
        addrbuff1,
        locktime,
        1,
        locktime,
        lockedBaseXOut
      )

      const txidLocked: Buffer = Buffer.alloc(32)
      txidLocked.fill(1)
      const txidxLocked: Buffer = Buffer.alloc(4)
      txidxLocked.writeUInt32BE(1, 0)
      const lu: UTXO = new UTXO(0, txidLocked, txidxLocked, assetID, lockedOut)

      const txidUnlocked: Buffer = Buffer.alloc(32)
      txidUnlocked.fill(2)
      const txidxUnlocked: Buffer = Buffer.alloc(4)
      txidxUnlocked.writeUInt32BE(2, 0)
      const unlockedOut: SECPTransferOutput = new SECPTransferOutput(
        ONEAVAX.mul(new BN(2)),
        addrbuff1,
        locktime,
        1
      )
      const ulu: UTXO = new UTXO(
        0,
        txidUnlocked,
        txidxUnlocked,
        assetID,
        unlockedOut
      )

      dummySet.add(ulu)
      dummySet.add(lu)

      const txu1: UnsignedTx = await platformvm.buildAddValidatorTx(
        dummySet,
        addrs3,
        addrs1,
        addrs2,
        nodeID,
        startTime,
        endTime,
        amount,
        addrs3,
        0.1334556,
        locktime,
        threshold,
        new UTF8Payload("hello world"),
        UnixNow()
      )

      const txu1Ins: TransferableInput[] = (
        txu1.getTransaction() as AddValidatorTx
      ).getIns()
      const txu1Outs: TransferableOutput[] = (
        txu1.getTransaction() as AddValidatorTx
      ).getOuts()
      const txu1Stake: TransferableOutput[] = (
        txu1.getTransaction() as AddValidatorTx
      ).getStakeOuts()
      const txu1Total: TransferableOutput[] = (
        txu1.getTransaction() as AddValidatorTx
      ).getTotalOuts()

      let intotal: BN = new BN(0)

      for (let i: number = 0; i < txu1Ins.length; i++) {
        intotal = intotal.add(
          (txu1Ins[i].getInput() as AmountInput).getAmount()
        )
      }

      let outtotal: BN = new BN(0)

      for (let i: number = 0; i < txu1Outs.length; i++) {
        outtotal = outtotal.add(
          (txu1Outs[i].getOutput() as AmountOutput).getAmount()
        )
      }

      let staketotal: BN = new BN(0)

      for (let i: number = 0; i < txu1Stake.length; i++) {
        staketotal = staketotal.add(
          (txu1Stake[i].getOutput() as AmountOutput).getAmount()
        )
      }

      let totaltotal: BN = new BN(0)

      for (let i: number = 0; i < txu1Total.length; i++) {
        totaltotal = totaltotal.add(
          (txu1Total[i].getOutput() as AmountOutput).getAmount()
        )
      }

      expect(intotal.toString(10)).toBe("4000000000")
      expect(outtotal.toString(10)).toBe("1000000000")
      expect(staketotal.toString(10)).toBe("3000000000")
      expect(totaltotal.toString(10)).toBe("4000000000")
    })

    test("buildCreateSubnetTx1", async (): Promise<void> => {
      platformvm.setCreationTxFee(new BN(10))
      const addrbuff1: Buffer[] = addrs1.map(
        (a): Buffer => platformvm.parseAddress(a)
      )
      const addrbuff2: Buffer[] = addrs2.map(
        (a): Buffer => platformvm.parseAddress(a)
      )
      const addrbuff3: Buffer[] = addrs3.map(
        (a): Buffer => platformvm.parseAddress(a)
      )

      const txu1: UnsignedTx = await platformvm.buildCreateSubnetTx(
        set,
        addrs1,
        addrs2,
        [addrs1[0]],
        1,
        new UTF8Payload("hello world"),
        UnixNow()
      )

      const txu2: UnsignedTx = await builder.buildCreateSubnetTx(
        networkID,
        bintools.cb58Decode(blockchainID),
        { from: addrbuff1, signer: [] },
        addrbuff2,
        [addrbuff1[0]],
        1,
        platformvm.getCreateSubnetTxFee(),
        assetID,
        new UTF8Payload("hello world").getPayload(),
        UnixNow()
      )
      expect(txu2.toBuffer().toString("hex")).toBe(
        txu1.toBuffer().toString("hex")
      )
      expect(txu2.toString()).toBe(txu1.toString())

      const tx1: Tx = txu1.sign(platformvm.keyChain())
      const checkTx: string = tx1.toBuffer().toString("hex")
      const tx1obj: object = tx1.serialize("hex")
      const tx1str: string = JSON.stringify(tx1obj)

      const tx2newobj: object = JSON.parse(tx1str)
      const tx2: Tx = new Tx()
      tx2.deserialize(tx2newobj, "hex")

      expect(tx2.toBuffer().toString("hex")).toBe(checkTx)

      const tx3: Tx = txu1.sign(platformvm.keyChain())
      const tx3obj: object = tx3.serialize(display)
      const tx3str: string = JSON.stringify(tx3obj)

      const tx4newobj: object = JSON.parse(tx3str)
      const tx4: Tx = new Tx()
      tx4.deserialize(tx4newobj, display)

      expect(tx4.toBuffer().toString("hex")).toBe(checkTx)

      serialzeit(tx1, "CreateSubnetTx")
    })

    test("buildCreateSubnetTx2", async (): Promise<void> => {
      platformvm.setCreationTxFee(new BN(10))
      const addrbuff1: Buffer[] = addrs1.map((a: string) =>
        platformvm.parseAddress(a)
      )
      const addrbuff2: Buffer[] = addrs2.map((a: string) =>
        platformvm.parseAddress(a)
      )
      const addrbuff3: Buffer[] = addrs3.map((a: string) =>
        platformvm.parseAddress(a)
      )

      const txu1: UnsignedTx = await platformvm.buildCreateSubnetTx(
        lset,
        addrs1,
        addrs2,
        [addrs1[0]],
        1,
        new UTF8Payload("hello world"),
        UnixNow()
      )

      const txu2: UnsignedTx = await lbuilder.buildCreateSubnetTx(
        networkID,
        bintools.cb58Decode(blockchainID),
        { from: addrbuff1, signer: [] },
        addrbuff2,
        [addrbuff1[0]],
        1,
        platformvm.getCreateSubnetTxFee(),
        assetID,
        new UTF8Payload("hello world").getPayload(),
        UnixNow()
      )
      expect(txu2.toBuffer().toString("hex")).toBe(
        txu1.toBuffer().toString("hex")
      )
      expect(txu2.toString()).toBe(txu1.toString())
    })
  })

  test("getRewardUTXOs", async (): Promise<void> => {
    const txID: string = "7sik3Pr6r1FeLrvK1oWwECBS8iJ5VPuSh"
    const result: Promise<GetRewardUTXOsResponse> = api.getRewardUTXOs(txID)
    const payload: object = {
      result: { numFetched: "0", utxos: [], encoding: "cb58" }
    }
    const responseObj: HttpResponse = {
      data: payload
    }

    mockAxios.mockResponse(responseObj)
    const response: GetRewardUTXOsResponse = await result

    expect(mockAxios.request).toHaveBeenCalledTimes(1)
    expect(response).toBe(payload["result"])
  })

  test("getRegisteredShortIDLink", async (): Promise<void> => {
    const result: Promise<string> = api.getRegisteredShortIDLink(nodeID)
    const payload: object = {
      result: { address: addrA }
    }
    const responseObj: HttpResponse = {
      data: payload
    }

    mockAxios.mockResponse(responseObj)
    const response: string = await result

    expect(mockAxios.request).toHaveBeenCalledTimes(1)
    expect(response).toBe(addrA)
  })

  test("getAllDepositOffers", async (): Promise<void> => {
    const result: Promise<DepositOffer[]> = api.getAllDepositOffers()
    const payload: object = {
      result: {
        depositOffers: [
          {
            id: "1",
            interestRateNominator: "2",
            start: "3",
            end: "4",
            minAmount: "5",
            minDuration: 6,
            maxDuration: 7,
            unlockPeriodDuration: 8,
            noRewardsPeriodDuration: 9,
            memo: "memo",
            flags: 0
          },
          {
            id: "2",
            interestRateNominator: "2",
            start: "3",
            end: "4",
            minAmount: "5",
            minDuration: 6,
            maxDuration: 7,
            unlockPeriodDuration: 8,
            noRewardsPeriodDuration: 9,
            memo: "memo",
            flags: 1
          }
        ]
      }
    }
    const responseObj: HttpResponse = {
      data: payload
    }

    mockAxios.mockResponse(responseObj)
    const response: DepositOffer[] = await result

    expect(mockAxios.request).toHaveBeenCalledTimes(1)
    expect(response.length).toBe(2)
    expect(response[0].id).toBe("1")
    expect(response[0].interestRateNominator).toStrictEqual(new BN("2"))
    expect(response[0].start).toStrictEqual(new BN("3"))
    expect(response[0].end).toStrictEqual(new BN("4"))
    expect(response[0].minAmount).toStrictEqual(new BN("5"))
    expect(response[0].minDuration).toBe(6)
    expect(response[0].maxDuration).toBe(7)
    expect(response[0].unlockPeriodDuration).toBe(8)
    expect(response[0].noRewardsPeriodDuration).toBe(9)
    expect(response[0].memo).toBe("memo")
    expect(response[0].flags).toStrictEqual(new BN(0))
    expect(response[1].id).toBe("2")
    expect(response[1].flags).toStrictEqual(new BN(1))
  })

  test("getDeposits", async (): Promise<void> => {
    const result: Promise<GetDepositsResponse> = api.getDeposits(["1", "2"])
    const payload: object = {
      result: {
        deposits: [
          {
            depositTxID: "1",
            depositOfferID: "2",
            unlockedAmount: "3",
            claimedRewardAmount: "4",
            start: "5",
            duration: 6,
            amount: "7",
            unlockableAmount: "8",
            rewardOwner: {
              locktime: 0,
              threshold: 1,
              addresses: [addrA]
            }
          },
          {
            depositTxID: "2",
            depositOfferID: "2",
            unlockedAmount: "3",
            claimedRewardAmount: "4",
            start: "5",
            duration: 6,
            amount: "7",
            rewardOwner: {
              locktime: 0,
              threshold: 1,
              addresses: [addrA]
            }
          }
        ],
        availableRewards: ["9", "10"],
        timestamp: "11"
      }
    }
    const responseObj: HttpResponse = {
      data: payload
    }

    mockAxios.mockResponse(responseObj)
    const response: GetDepositsResponse = await result

    expect(mockAxios.request).toHaveBeenCalledTimes(1)
    expect(response.deposits.length).toBe(2)
    expect(response.deposits[0].depositTxID).toBe("1")
    expect(response.deposits[0].depositOfferID).toBe("2")
    expect(response.deposits[0].unlockedAmount).toStrictEqual(new BN("3"))
    expect(response.deposits[0].claimedRewardAmount).toStrictEqual(new BN("4"))
    expect(response.deposits[0].start).toStrictEqual(new BN("5"))
    expect(response.deposits[0].duration).toBe(6)
    expect(response.deposits[0].amount).toStrictEqual(new BN("7"))
    expect(response.deposits[0].unlockableAmount).toStrictEqual(new BN("8"))
    expect(response.deposits[0].rewardOwner.locktime).toStrictEqual(new BN("0"))
    expect(response.deposits[0].rewardOwner.threshold).toBe(1)
    expect(response.deposits[0].rewardOwner.addresses).toStrictEqual([addrA])
    expect(response.deposits[1].depositTxID).toBe("2")
    expect(response.availableRewards.length).toBe(2)
    expect(response.availableRewards[0]).toStrictEqual(new BN("9"))
    expect(response.availableRewards[1]).toStrictEqual(new BN("10"))
    expect(response.timestamp).toStrictEqual(new BN("11"))
  })

  test("getClaimables", async (): Promise<void> => {
    const result: Promise<GetClaimablesResponse> = api.getClaimables([])
    const payload: object = {
      result: {
        claimables: [
          {
            validatorRewards: "1",
            expiredDepositRewards: "2"
          }
        ]
      }
    }
    const responseObj: HttpResponse = {
      data: payload
    }

    mockAxios.mockResponse(responseObj)
    const response: GetClaimablesResponse = await result

    expect(mockAxios.request).toHaveBeenCalledTimes(1)
    expect(response.claimables[0].validatorRewards).toStrictEqual(new BN("1"))
    expect(response.claimables[0].expiredDepositRewards).toStrictEqual(
      new BN("2")
    )
  })

  test("buildBaseTx", async (): Promise<void> => {
    api.keyChain().importKey(defaultPK)

    const defaultAddr = api.keyChain().getAddressStrings()[0]
    const defaultAddrBuffer = api.keyChain().getAddresses()[0]
    avalanche.getNetwork().P.lockModeBondDeposit = true

    const secpTransferInput = new SECPTransferInput(new BN(1))
    secpTransferInput.addSignatureIdx(0, defaultAddrBuffer)
    const secpTransferOutput = new SECPTransferOutput(
      new BN(1),
      [defaultAddrBuffer],
      ZeroBN,
      1
    )
    const spendResponse = {
      ins: [
        new TransferableInput(
          txID,
          Buffer.from(bintools.fromBNToBuffer(new BN(0), 4)),
          assetID,
          secpTransferInput
        )
      ],
      out: [new TransferableOutput(assetID, secpTransferOutput)],
      owners: []
    }

    api.spend = jest.fn().mockReturnValue(spendResponse)

    const result = api.buildBaseTx(
      undefined,
      new BN(1),
      [defaultAddr],
      [defaultAddr],
      [defaultAddr],
      Buffer.from("memo"),
      ZeroBN,
      ZeroBN,
      1,
      1
    )

    const txu1 = await result
    const expectedBaseTx = new BaseTx(
      networkID,
      Buffer.alloc(32, 0),
      spendResponse.out,
      spendResponse.ins,
      Buffer.from("memo")
    )
    const expectedUnsignedBaseTx = new UnsignedTx(expectedBaseTx)
    expect(txu1.serialize()).toMatchObject(expectedUnsignedBaseTx.serialize())
  })

  test("buildDepositTx", async (): Promise<void> => {
    api.keyChain().importKey(defaultPK)

    const defaultAddr = api.keyChain().getAddressStrings()[0]
    const defaultAddrBuffer = api.keyChain().getAddresses()[0]
    avalanche.getNetwork().P.lockModeBondDeposit = true

    const secpTransferInput = new SECPTransferInput(new BN(1))
    secpTransferInput.addSignatureIdx(0, defaultAddrBuffer)
    const secpTransferOutput = new SECPTransferOutput(
      new BN(1),
      [defaultAddrBuffer],
      ZeroBN,
      1
    )
    const spendResponse = {
      ins: [
        new TransferableInput(
          txID,
          Buffer.from(bintools.fromBNToBuffer(new BN(0), 4)),
          assetID,
          secpTransferInput
        )
      ],
      out: [new TransferableOutput(assetID, secpTransferOutput)],
      owners: []
    }

    api.spend = jest.fn().mockReturnValue(spendResponse)

    const depositOfferID = "wVVZinZkN9x6e9dh3DNNfrmdXaHPPwKWt3Zerx2vD8Ccuo6E7"
    const depositDuration = 110376000
    const rewardsOwner = new OutputOwners([defaultAddrBuffer])
    const rewardOutputOwners = new SECPOwnerOutput(
      [defaultAddrBuffer],
      ZeroBN,
      1
    )
    const result = api.buildDepositTx(
      undefined,
      undefined,
      [defaultAddr],
      [defaultAddr],
      depositOfferID,
      depositDuration,
      rewardsOwner,
      undefined, // empty depositCreatorAddress
      [], // empty depositCreatorAuth
      undefined, // empty depositOfferOwnerSigs
      [], // empty depositOfferOwnerAuth
      Buffer.from("memo"),
      ZeroBN,
      new BN(1),
      1
    )

    const txu1 = await result
    const expectedDepositTx = new DepositTx(
      undefined,
      networkID,
      Buffer.alloc(32, 0),
      spendResponse.out,
      spendResponse.ins,
      Buffer.from("memo"),
      bintools.cb58Decode(depositOfferID),
      depositDuration,
      new ParseableOutput(rewardOutputOwners)
    )
    expectedDepositTx.setOutputOwners([new OutputOwners([defaultAddrBuffer])])
    const expectedUnsignedTx = new UnsignedTx(expectedDepositTx)
    expect(txu1.serialize()).toMatchObject(expectedUnsignedTx.serialize())
  })

  test("buildRegisterNodeTx", async (): Promise<void> => {
    const nodeID = "NodeID-AAFgkP7AVeQjmv4MSi2DaQbobg3wpZbFp"
    const nodePK =
      "PrivateKey-2DXzE36hZ3MSKxk1Un5mBHGwcV69CqkKvbVvSwFBhDRtnbFCDX"
    api.keyChain().importKey(defaultPK)
    api.keyChain().importKey(nodePK)

    const defaultAddr = api.keyChain().getAddressStrings()[0]
    const defaultAddrBuffer = api.keyChain().getAddresses()[0]
    const nodeAddrBuffer = api.keyChain().getAddresses()[1]
    avalanche.getNetwork().P.lockModeBondDeposit = true

    const secpTransferInput = new SECPTransferInput(new BN(1))
    secpTransferInput.addSignatureIdx(0, defaultAddrBuffer)
    const secpTransferOutput = new SECPTransferOutput(
      new BN(1),
      [defaultAddrBuffer],
      ZeroBN,
      1
    )
    const spendResponse = {
      ins: [
        new TransferableInput(
          txID,
          Buffer.from(bintools.fromBNToBuffer(new BN(0), 4)),
          assetID,
          secpTransferInput
        )
      ],
      out: [new TransferableOutput(assetID, secpTransferOutput)],
      owners: []
    }

    api.spend = jest.fn().mockReturnValue(spendResponse)

    const authCredentials: [number, Buffer][] = [[0, defaultAddrBuffer]]

    const result = api.buildRegisterNodeTx(
      undefined,
      [defaultAddr],
      [defaultAddr],
      undefined,
      nodeID,
      defaultAddr,
      authCredentials,
      Buffer.from("memo")
    )

    const txu1 = await result
    const expectedRegisterNodeTx = new RegisterNodeTx(
      networkID,
      Buffer.alloc(32, 0),
      spendResponse.out,
      spendResponse.ins,
      Buffer.from("memo"),
      undefined,
      NodeIDStringToBuffer(nodeID),
      defaultAddrBuffer
    )
    expectedRegisterNodeTx.setOutputOwners([
      new OutputOwners([nodeAddrBuffer]),
      new OutputOwners([defaultAddrBuffer])
    ])
    authCredentials.forEach((addressAuth) => {
      expectedRegisterNodeTx.addSignatureIdx(addressAuth[0], addressAuth[1])
    })
    const expectedUnsignedTx = new UnsignedTx(expectedRegisterNodeTx)
    expect(txu1.serialize()).toMatchObject(expectedUnsignedTx.serialize())
  })

  test("buildUnlockDepositTx", async (): Promise<void> => {
    api.keyChain().importKey(defaultPK)

    const defaultAddr = api.keyChain().getAddressStrings()[0]
    const defaultAddrBuffer = api.keyChain().getAddresses()[0]
    avalanche.getNetwork().P.lockModeBondDeposit = true

    const secpTransferInput = new SECPTransferInput(new BN(1))
    secpTransferInput.addSignatureIdx(0, defaultAddrBuffer)
    const secpTransferOutput = new SECPTransferOutput(
      new BN(1),
      [defaultAddrBuffer],
      ZeroBN,
      1
    )
    const spendResponse = {
      ins: [
        new TransferableInput(
          txID,
          Buffer.from(bintools.fromBNToBuffer(new BN(0), 4)),
          assetID,
          secpTransferInput
        )
      ],
      out: [new TransferableOutput(assetID, secpTransferOutput)],
      owners: []
    }

    api.spend = jest.fn().mockReturnValue(spendResponse)

    const result = api.buildUnlockDepositTx(
      undefined,
      [defaultAddr],
      [defaultAddr],
      Buffer.from("memo"),
      ZeroBN,
      new BN(1),
      1
    )

    const txu1 = await result
    const expectedUnlockDepositTx = new UnlockDepositTx(
      networkID,
      Buffer.alloc(32, 0),
      spendResponse.out,
      spendResponse.ins,
      Buffer.from("memo")
    )
    const expectedUnsignedTx = new UnsignedTx(expectedUnlockDepositTx)
    expect(txu1.serialize()).toMatchObject(expectedUnsignedTx.serialize())
  })

  test("buildClaimTx", async (): Promise<void> => {
    api.keyChain().importKey(defaultPK)
    api.keyChain().importKey(defaultPK2)

    const defaultAddr = api.keyChain().getAddressStrings()[0]
    const defaultAddrBuffer = api.keyChain().getAddresses()[0]
    const claimToAddrBuffer = api.keyChain().getAddresses()[1]
    const claimTo = new OutputOwners([claimToAddrBuffer])
    const sigidx = 0
    const inputAmount = new BN(20)
    const toClaimAmount = new BN(10)
    avalanche.getNetwork().P.lockModeBondDeposit = true

    const secpTransferInput = new SECPTransferInput(inputAmount)
    secpTransferInput.addSignatureIdx(0, defaultAddrBuffer)
    const secpTransferOutput = new SECPTransferOutput(
      new BN(10),
      [defaultAddrBuffer],
      ZeroBN,
      1
    )
    const secpTransferOutput2 = new SECPTransferOutput(
      inputAmount.sub(toClaimAmount),
      [claimToAddrBuffer],
      ZeroBN,
      1
    )

    const spendResponse = {
      ins: [
        new TransferableInput(
          txID,
          Buffer.from(bintools.fromBNToBuffer(inputAmount, 4)),
          assetID,
          secpTransferInput
        )
      ],
      out: [new TransferableOutput(assetID, secpTransferOutput)],
      owners: [claimTo]
    }

    api.spend = jest.fn().mockReturnValue(spendResponse)

    // number to buffer
    const sigidxbytes = Buffer.alloc(4)
    sigidxbytes.writeUInt32BE(sigidx, 0)
    const claimAmounts: ClaimAmount[] = [
      new ClaimAmount(
        Buffer.alloc(32, 1),
        ClaimType.VALIDATOR_REWARD,
        toClaimAmount,
        [sigidxbytes]
      )
    ]
    const claimAmountParams: ClaimAmountParams[] = [
      {
        id: Buffer.alloc(32, 1),
        claimType: ClaimType.VALIDATOR_REWARD,
        amount: toClaimAmount,
        owners: new OutputOwners([defaultAddrBuffer]),
        sigIdxs: [sigidx]
      }
    ]

    const result = api.buildClaimTx(
      undefined,
      [defaultAddr],
      [defaultAddr],
      Buffer.from("memo"),
      ZeroBN,
      1,
      claimAmountParams,
      claimTo
    )

    const expectedOutputs = spendResponse.out.concat(
      new TransferableOutput(assetID, secpTransferOutput2)
    )

    const txu1 = await result
    const expectedClaimTx = new ClaimTx(
      networkID,
      Buffer.alloc(32, 0),
      expectedOutputs,
      spendResponse.ins,
      Buffer.from("memo"),
      claimAmounts
    )
    expectedClaimTx.setOutputOwners([
      claimTo,
      new OutputOwners([defaultAddrBuffer])
    ])
    expectedClaimTx.addSigIdxs([new SigIdx(sigidx, defaultAddrBuffer)])
    const expectedUnsignedTx = new UnsignedTx(expectedClaimTx)
    expect(txu1.serialize()).toMatchObject(expectedUnsignedTx.serialize())
    expectedClaimTx["claimAmounts"] = []

    // error case - empty claimAmounts
    try {
      await api.buildClaimTx(
        undefined,
        [defaultAddr],
        [defaultAddr],
        Buffer.from("memo"),
        ZeroBN,
        1,
        [],
        claimTo
      )
    } catch (e: any) {
      expect(e).toMatchObject(
        new Error("Must provide at least one claimAmount")
      )
    }
  })
})

/**
 * @packageDocumentation
 * @module API-TouristicVM
 */
import { Buffer } from "buffer/"
import BN from "bn.js"
import { JRPCAPI, RequestResponseData, ZeroBN } from "../../common"

import BinTools from "../../utils/bintools"
import { ONEAVAX } from "../../utils/constants"
import { PayloadBase } from "../../utils/payload"
import { UnixNow } from "../../utils/helperfunctions"
import { UTXO, UTXOSet } from "./utxos"
import {
  AddressError,
  ChainIdError,
  GooseEggCheckError,
  TransactionError
} from "../../utils/errors"
import { PersistanceOptions, Serialization, SerializedType } from "../../utils"
import { Network } from "../../utils/networks"
import { KeyChain } from "./keychain"
import { Tx, UnsignedTx } from "caminojs/apis/touristicvm/tx"
import { TouristicVmConstants } from "caminojs/apis/touristicvm/constants"
import AvalancheCore from "caminojs/camino"
import {
  GetUTXOsParams,
  GetUTXOsResponse
} from "caminojs/apis/touristicvm/interfaces"

/**
 * @ignore
 */
const bintools: BinTools = BinTools.getInstance()
const serialization: Serialization = Serialization.getInstance()

const NanoBN = new BN(1000000000)
const rewardPercentDenom = 1000000

type FromType = String[] | String[][]
type NodeOwnerType = {
  address: string
  auth: [number, string][]
}

/**
 * Class for interacting with a node's TouristicVMAPI
 *
 * @category RPCAPIs
 *
 * @remarks This extends the [[JRPCAPI]] class. This class should not be directly called. Instead, use the [[Avalanche.addAPI]] function to register this interface with Avalanche.
 */
export class TouristicVMAPI extends JRPCAPI {
  /**
   * @ignore
   */
  protected keychain: KeyChain = new KeyChain("", "")

  protected blockchainID: string = ""

  protected blockchainAlias: string = undefined

  protected AVAXAssetID: Buffer = undefined

  protected txFee: BN = undefined

  protected creationTxFee: BN = undefined

  protected minValidatorStake: BN = undefined

  protected minDelegatorStake: BN = undefined

  constructor(core: AvalancheCore, baseURL: string = "/ext/bc/T") {
    super(core, baseURL)
    if (core.getNetwork()) {
      this.blockchainID = core.getNetwork().T.blockchainID
      this.keychain = new KeyChain(core.getHRP(), core.getNetwork().T.alias)
    }
  }

  /**
   * Gets the alias for the blockchainID if it exists, otherwise returns `undefined`.
   *
   * @returns The alias for the blockchainID
   */
  getBlockchainAlias = (): string => {
    return this.core.getNetwork().T.alias
  }

  /**
   * Gets the current network, fetched via avalanche.fetchNetworkSettings.
   *
   * @returns The current Network
   */
  getNetwork = (): Network => {
    return this.core.getNetwork()
  }

  /**
   * Gets the blockchainID and returns it.
   *
   * @returns The blockchainID
   */
  getBlockchainID = (): string => this.blockchainID

  addressFromBuffer = (address: Buffer): string => {
    const chainid: string = this.getBlockchainAlias()
      ? this.getBlockchainAlias()
      : this.getBlockchainID()
    const type: SerializedType = "bech32"
    return serialization.bufferToType(
      address,
      type,
      this.core.getHRP(),
      chainid
    )
  }

  /**
   * Fetches the AVAX AssetID and returns it in a Promise.
   *
   * @param refresh This function caches the response. Refresh = true will bust the cache.
   *
   * @returns The the provided string representing the AVAX AssetID
   */
  getAVAXAssetID = async (refresh: boolean = false): Promise<Buffer> => {
    if (typeof this.AVAXAssetID === "undefined" || refresh) {
      this.AVAXAssetID = bintools.cb58Decode(
        this.core.getNetwork().X.avaxAssetID
      )
    }
    return this.AVAXAssetID
  }

  /**
   * Overrides the defaults and sets the cache to a specific AVAX AssetID
   *
   * @param avaxAssetID A cb58 string or Buffer representing the AVAX AssetID
   *
   * @returns The the provided string representing the AVAX AssetID
   */
  setAVAXAssetID = (avaxAssetID: string | Buffer) => {
    if (typeof avaxAssetID === "string") {
      avaxAssetID = bintools.cb58Decode(avaxAssetID)
    }
    this.AVAXAssetID = avaxAssetID
  }

  /**
   * Gets the default tx fee for this chain.
   *
   * @returns The default tx fee as a {@link https://github.com/indutny/bn.js/|BN}
   */
  getDefaultTxFee = (): BN => {
    return new BN(this.core.getNetwork().T.txFee)
  }

  /**
   * Gets the tx fee for this chain.
   *
   * @returns The tx fee as a {@link https://github.com/indutny/bn.js/|BN}
   */
  getTxFee = (): BN => {
    if (typeof this.txFee === "undefined") {
      this.txFee = this.getDefaultTxFee()
    }
    return this.txFee
  }

  /**
   * Sets the tx fee for this chain.
   *
   * @param fee The tx fee amount to set as {@link https://github.com/indutny/bn.js/|BN}
   */
  setTxFee = (fee: BN) => {
    this.txFee = fee
  }

  /**
   * Gets a reference to the keychain for this class.
   *
   * @returns The instance of [[]] for this class
   */
  keyChain = (): KeyChain => this.keychain

  /**
   * @ignore
   */
  newKeyChain = (): KeyChain => {
    // warning, overwrites the old keychain
    const alias = this.getBlockchainAlias()
    if (alias) {
      this.keychain = new KeyChain(this.core.getHRP(), alias)
    } else {
      this.keychain = new KeyChain(this.core.getHRP(), this.blockchainID)
    }
    return this.keychain
  }

  /**
   * Helper function which determines if a tx is a goose egg transaction.
   *
   * @param utx An UnsignedTx
   *
   * @returns boolean true if passes goose egg test and false if fails.
   *
   * @remarks
   * A "Goose Egg Transaction" is when the fee far exceeds a reasonable amount
   */
  checkGooseEgg = async (
    utx: UnsignedTx,
    outTotal: BN = ZeroBN
  ): Promise<boolean> => {
    const avaxAssetID: Buffer = await this.getAVAXAssetID()
    let outputTotal: BN = outTotal.gt(ZeroBN)
      ? outTotal
      : utx.getOutputTotal(avaxAssetID)
    const fee: BN = utx.getBurn(avaxAssetID)
    if (fee.lte(ONEAVAX.mul(new BN(10))) || fee.lte(outputTotal)) {
      return true
    } else {
      return false
    }
  }

  /**
   * Helper function which creates an unsigned transaction. For more granular control, you may create your own
   * [[UnsignedTx]] manually (with their corresponding [[TransferableInput]]s, [[TransferableOutput]]s, and [[TransferOperation]]s).
   *
   * @param utxoset A set of UTXOs that the transaction is built on
   * @param amount The amount of AssetID to be spent in its smallest denomination, represented as {@link https://github.com/indutny/bn.js/|BN}.
   * @param assetID The assetID of the value being sent
   * @param toAddresses The addresses to send the funds
   * @param fromAddresses The addresses being used to send the funds from the UTXOs provided
   * @param changeAddresses The addresses that can spend the change remaining from the spent UTXOs
   * @param memo Optional CB58 Buffer or String which contains arbitrary bytes, up to 256 bytes
   * @param asOf Optional. The timestamp to verify the transaction against as a {@link https://github.com/indutny/bn.js/|BN}
   * @param locktime Optional. The locktime field created in the resulting outputs
   * @param toThreshold Optional. The number of signatures required to spend the funds in the resultant UTXO
   * @param changeThreshold Optional. The number of signatures required to spend the funds in the resultant change UTXO
   *
   * @returns An unsigned transaction ([[UnsignedTx]]) which contains a [[BaseTx]].
   *
   * @remarks
   * This helper exists because the endpoint API should be the primary point of entry for most functionality.
   */
  buildBaseTx = async (
    utxoset: UTXOSet,
    amount: BN,
    assetID: Buffer | string = undefined,
    toAddresses: string[],
    fromAddresses: string[],
    changeAddresses: string[],
    memo: PayloadBase | Buffer = undefined,
    asOf: BN = UnixNow(),
    locktime: BN = new BN(0),
    toThreshold: number = 1,
    changeThreshold: number = 1
  ): Promise<UnsignedTx> => {
    const caller: string = "buildBaseTx"
    const to: Buffer[] = this._cleanAddressArray(toAddresses, caller).map(
      (a: string): Buffer => bintools.stringToAddress(a)
    )
    const from: Buffer[] = this._cleanAddressArray(fromAddresses, caller).map(
      (a: string): Buffer => bintools.stringToAddress(a)
    )
    const change: Buffer[] = this._cleanAddressArray(
      changeAddresses,
      caller
    ).map((a: string): Buffer => bintools.stringToAddress(a))

    if (typeof assetID === "string") {
      assetID = bintools.cb58Decode(assetID)
    }

    if (memo instanceof PayloadBase) {
      memo = memo.getPayload()
    }

    const networkID: number = this.core.getNetworkID()
    const blockchainIDBuf: Buffer = bintools.cb58Decode(this.blockchainID)
    const fee: BN = this.getTxFee()
    const feeAssetID: Buffer = await this.getAVAXAssetID()
    const builtUnsignedTx: UnsignedTx = utxoset.buildBaseTx(
      networkID,
      blockchainIDBuf,
      amount,
      assetID,
      to,
      from,
      change,
      fee,
      feeAssetID,
      memo,
      asOf,
      locktime,
      toThreshold,
      changeThreshold
    )

    if (!(await this.checkGooseEgg(builtUnsignedTx))) {
      /* istanbul ignore next */
      throw new GooseEggCheckError(
        "Error - AVMAPI.buildBaseTx:Failed Goose Egg Check"
      )
    }

    return builtUnsignedTx
  }

  /**
   * Helper function which creates an unsigned Import Tx. For more granular control, you may create your own
   * [[UnsignedTx]] manually (with their corresponding [[TransferableInput]]s, [[TransferableOutput]]s, and [[TransferOperation]]s).
   *
   * @param utxoset A set of UTXOs that the transaction is built on
   * @param ownerAddresses The addresses being used to import
   * @param sourceChain The chainid for where the import is coming from.
   * @param toAddresses The addresses to send the funds
   * @param fromAddresses The addresses being used to send the funds from the UTXOs provided
   * @param changeAddresses The addresses that can spend the change remaining from the spent UTXOs
   * @param memo Optional contains arbitrary bytes, up to 256 bytes
   * @param asOf Optional. The timestamp to verify the transaction against as a {@link https://github.com/indutny/bn.js/|BN}
   * @param locktime Optional. The locktime field created in the resulting outputs
   * @param toThreshold Optional. The number of signatures required to spend the funds in the resultant UTXO
   * @param changeThreshold Optional. The number of signatures required to spend the funds in the resultant change UTXO
   *
   * @returns An unsigned transaction ([[UnsignedTx]]) which contains a [[ImportTx]].
   *
   * @remarks
   * This helper exists because the endpoint API should be the primary point of entry for most functionality.
   */
  buildImportTx = async (
    utxoset: UTXOSet,
    ownerAddresses: string[],
    sourceChain: Buffer | string,
    toAddresses: string[],
    fromAddresses: string[],
    changeAddresses: string[],
    memo: PayloadBase | Buffer = undefined,
    asOf: BN = ZeroBN,
    locktime: BN = ZeroBN,
    toThreshold: number = 1,
    changeThreshold: number = 1
  ): Promise<UnsignedTx> => {
    const caller = "buildImportTx"

    const to: Buffer[] = this._cleanAddressArray(toAddresses, caller).map(
      (a: string): Buffer => bintools.stringToAddress(a)
    )
    const from: Buffer[] = this._cleanAddressArray(fromAddresses, caller).map(
      (a: string): Buffer => bintools.stringToAddress(a)
    )
    const change: Buffer[] = this._cleanAddressArray(
      changeAddresses,
      caller
    ).map((a: string): Buffer => bintools.stringToAddress(a))

    let srcChain: string = undefined

    if (typeof sourceChain === "undefined") {
      throw new ChainIdError(
        "Error - TouristicVMAPI.buildImportTx: Source ChainID is undefined."
      )
    } else if (typeof sourceChain === "string") {
      srcChain = sourceChain
      sourceChain = bintools.cb58Decode(sourceChain)
    } else if (!(sourceChain instanceof Buffer)) {
      throw new ChainIdError(
        "Error - TouristicVMAPI.buildImportTx: Invalid destinationChain type: " +
          typeof sourceChain
      )
    }
    const atomicUTXOs: UTXOSet = await (
      await this.getUTXOs(ownerAddresses, srcChain, 0, undefined)
    ).utxos
    const avaxAssetID: Buffer = await this.getAVAXAssetID()

    if (memo instanceof PayloadBase) {
      memo = memo.getPayload()
    }

    const atomics: UTXO[] = atomicUTXOs.getAllUTXOs()

    const builtUnsignedTx: UnsignedTx = await utxoset.buildImportTx(
      this.core.getNetworkID(),
      bintools.cb58Decode(this.blockchainID),
      to,
      from,
      change,
      atomics,
      sourceChain,
      this.getTxFee(),
      avaxAssetID,
      memo,
      asOf,
      locktime,
      toThreshold,
      changeThreshold
    )

    if (!(await this.checkGooseEgg(builtUnsignedTx))) {
      /* istanbul ignore next */
      throw new GooseEggCheckError("Failed Goose Egg Check")
    }

    return builtUnsignedTx
  }

  /**
   * Calls the node's issueTx method from the API and returns the resulting transaction ID as a string.
   *
   * @param tx A string, {@link https://github.com/feross/buffer|Buffer}, or [[Tx]] representing a transaction
   *
   * @returns A Promise string representing the transaction ID of the posted transaction.
   */
  issueTx = async (tx: string | Buffer | Tx): Promise<string> => {
    let Transaction = ""
    if (typeof tx === "string") {
      Transaction = tx
    } else if (tx instanceof Buffer) {
      const txobj: Tx = new Tx()
      txobj.fromBuffer(tx)
      Transaction = txobj.toStringHex()
    } else if (tx instanceof Tx) {
      Transaction = tx.toStringHex()
    } else {
      /* istanbul ignore next */
      throw new TransactionError(
        "Error - touristicvm.issueTx: provided tx is not expected type of string, Buffer, or Tx"
      )
    }
    const params: any = {
      tx: Transaction.toString(),
      encoding: "hex"
    }
    const response: RequestResponseData = await this.callMethod(
      "touristicvm.issueTx",
      params
    )
    return response.data.result.txID
  }

  /**
   * Retrieves the UTXOs related to the addresses provided from the node's `getUTXOs` method.
   *
   * @param addresses An array of addresses as cb58 strings or addresses as {@link https://github.com/feross/buffer|Buffer}s
   * @param sourceChain A string for the chain to look for the UTXO's. Default is to use this chain, but if exported UTXOs exist from other chains, this can used to pull them instead.
   * @param limit Optional. Returns at most [limit] addresses. If [limit] == 0 or > [maxUTXOsToFetch], fetches up to [maxUTXOsToFetch].
   * @param startIndex Optional. [StartIndex] defines where to start fetching UTXOs (for pagination.)
   * UTXOs fetched are from addresses equal to or greater than [StartIndex.Address]
   * For address [StartIndex.Address], only UTXOs with IDs greater than [StartIndex.Utxo] will be returned.
   * @param persistOpts Options available to persist these UTXOs in local storage
   *
   * @remarks
   * persistOpts is optional and must be of type [[PersistanceOptions]]
   *
   */
  getUTXOs = async (
    addresses: string[] | string,
    sourceChain: string = undefined,
    limit: number = 0,
    startIndex: { address: string; utxo: string } = undefined,
    persistOpts: PersistanceOptions = undefined,
    encoding: string = "hex"
  ): Promise<GetUTXOsResponse> => {
    if (typeof addresses === "string") {
      addresses = [addresses]
    }

    const params: GetUTXOsParams = {
      addresses: addresses,
      limit,
      encoding
    }
    if (typeof startIndex !== "undefined" && startIndex) {
      params.startIndex = startIndex
    }

    if (typeof sourceChain !== "undefined") {
      params.sourceChain = sourceChain
    }

    const response: RequestResponseData = await this.callMethod(
      "touristicvm.getUTXOs",
      params
    )
    const utxos: UTXOSet = new UTXOSet()
    let data = response.data.result.utxos
    if (persistOpts && typeof persistOpts === "object") {
      if (this.db.has(persistOpts.getName())) {
        const selfArray: string[] = this.db.get(persistOpts.getName())
        if (Array.isArray(selfArray)) {
          utxos.addArray(data)
          const utxoSet: UTXOSet = new UTXOSet()
          utxoSet.addArray(selfArray)
          utxoSet.mergeByRule(utxos, persistOpts.getMergeRule())
          data = utxoSet.getAllUTXOStrings()
        }
      }
      this.db.set(persistOpts.getName(), data, persistOpts.getOverwrite())
    }
    if (data.length > 0 && data[0].substring(0, 2) === "0x") {
      const cb58Strs: string[] = []
      data.forEach((str: string): void => {
        cb58Strs.push(bintools.cb58Encode(Buffer.from(str.slice(2), "hex")))
      })

      utxos.addArray(cb58Strs, false)
    } else {
      utxos.addArray(data, false)
    }
    response.data.result.utxos = utxos
    return response.data.result
  }

  /**
   * @ignore
   */
  protected _cleanAddressArray(
    addresses: string[] | Buffer[],
    caller: string
  ): string[] {
    const addrs: string[] = []
    const chainid: string = this.getBlockchainAlias()
      ? this.getBlockchainAlias()
      : this.getBlockchainID()
    if (addresses && addresses.length > 0) {
      for (let i: number = 0; i < addresses.length; i++) {
        if (typeof addresses[`${i}`] === "string") {
          if (
            typeof this.parseAddress(addresses[`${i}`] as string) ===
            "undefined"
          ) {
            /* istanbul ignore next */
            throw new AddressError(`Error - Invalid address format (${caller})`)
          }
          addrs.push(addresses[`${i}`] as string)
        } else {
          const bech32: SerializedType = "bech32"
          addrs.push(
            serialization.bufferToType(
              addresses[`${i}`] as Buffer,
              bech32,
              this.core.getHRP(),
              chainid
            )
          )
        }
      }
    }
    return addrs
  }

  protected _cleanAddressArrayBuffer(
    addresses: string[] | Buffer[],
    caller: string
  ): Buffer[] {
    return this._cleanAddressArray(addresses, caller).map(
      (a: string): Buffer => {
        return typeof a === "undefined"
          ? undefined
          : bintools.stringToAddress(a)
      }
    )
  }
  /**
   * Takes an address string and returns its {@link https://github.com/feross/buffer|Buffer} representation if valid.
   *
   * @returns A {@link https://github.com/feross/buffer|Buffer} for the address if valid, undefined if not valid.
   */
  parseAddress = (addr: string): Buffer => {
    const alias: string = this.getBlockchainAlias()
    const blockchainID: string = this.getBlockchainID()
    console.log("parseAddress", addr, blockchainID, alias)
    return bintools.parseAddress(
      addr,
      blockchainID,
      alias,
      TouristicVmConstants.ADDRESSLENGTH
    )
  }
}

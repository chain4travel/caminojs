/**
 * @packageDocumentation
 * @module API-PlatformVM-Spender
 */

import BN from "bn.js"

import { AssetAmountDestination, TouristicVMAPI } from "."
import { FeeAssetError } from "../../utils/errors"
import { LockMode } from "./api"
export class Spender {
  touristicvmAPI: TouristicVMAPI

  constructor(touristicvmAPI: TouristicVMAPI) {
    this.touristicvmAPI = touristicvmAPI
  }

  getMinimumSpendable = async (
    aad: AssetAmountDestination,
    asOf: BN,
    lockTime: BN,
    lockMode: LockMode,
    agent?: string
  ): Promise<Error> => {
    if (aad.getAmounts().length !== 1) {
      return new FeeAssetError("spender -- multiple assets not yet supported")
    }

    const addr = aad
      .getSenders()
      .map((a) => this.touristicvmAPI.addressFromBuffer(a))

    const signer = aad
      .getSigners()
      .map((a) => this.touristicvmAPI.addressFromBuffer(a))

    const to = aad
      .getDestinations()
      .map((a) => this.touristicvmAPI.addressFromBuffer(a))

    const change = aad
      .getChangeAddresses()
      .map((a) => this.touristicvmAPI.addressFromBuffer(a))

    const aa = aad.getAmounts()[0]

    const result = await this.touristicvmAPI.spend(
      addr,
      signer,
      to,
      aad.getDestinationsThreshold(),
      lockTime,
      change,
      aad.getChangeAddressesThreshold(),
      lockMode,
      aa.getAmount(),
      aa.getBurn(),
      asOf,
      agent
    )

    result.ins.forEach((inp) => {
      aad.addInput(inp)
    })
    result.out.forEach((out) => {
      aad.addOutput(out)
    })
    aad.setOutputOwners(result.owners)
    return
  }
}

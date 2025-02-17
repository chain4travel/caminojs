/**
 * @packageDocumentation
 * @module API-PlatformVM-Undepositer
 */

import BN from "bn.js"

import { AssetAmountDestination, PlatformVMAPI } from "."
import { FeeAssetError } from "../../utils/errors"

export class Undepositer {
  platformAPI: PlatformVMAPI

  constructor(platformAPI: PlatformVMAPI) {
    this.platformAPI = platformAPI
  }
  // CAN BE THE SAME
  getUndepositable = async (
    aad: AssetAmountDestination,
    // asOf: BN,
    depositTxIDs: string[]
  ): Promise<Error> => {
    // TODO: does what spend does - change the logic to undeposit
    if (aad.getAmounts().length !== 1) {
      return new FeeAssetError("spender -- multiple assets not yet supported")
    }

    const addr = aad
      .getSenders()
      .map((a) => this.platformAPI.addressFromBuffer(a))

    const signer = aad
      .getSigners()
      .map((a) => this.platformAPI.addressFromBuffer(a))

    const to = aad
      .getDestinations()
      .map((a) => this.platformAPI.addressFromBuffer(a))

    const change = aad
      .getChangeAddresses()
      .map((a) => this.platformAPI.addressFromBuffer(a))

    const aa = aad.getAmounts()[0]

    const result = await this.platformAPI.undeposit(
      addr,
      signer,
      to,
      aad.getDestinationsThreshold(),
      change,
      aad.getChangeAddressesThreshold(),
      aa.getBurn(),
      depositTxIDs
    )

    result.ins.forEach((inp) => {
      aad.addInput(inp)
    })
    result.out.forEach((out) => {
      aad.addOutput(out)
    })
    aad.setOutputOwners(result.owners)
    // TODO: what do I do with signers?
    return
  }
}

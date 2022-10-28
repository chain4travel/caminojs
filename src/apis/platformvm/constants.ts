/**
 * @packageDocumentation
 * @module API-PlatformVM-Constants
 */

export class PlatformVMConstants {
  static LATESTCODEC: number = 0

  static SECPFXIDS: number[] = [0]

  static SECPXFEROUTPUTIDS: number[] = [7]

  static SUBNETAUTHIDS: number[] = [10]

  static SECPOWNEROUTPUTIDS: number[] = [11]

  static STAKEABLELOCKOUTIDS: number[] = [22]

  static SECPINPUTIDS: number[] = [5]

  static STAKEABLELOCKINIDS: number[] = [21]

  static BASETXS: number[] = [0]

  static SUBNETAUTHS: number[] = [10]

  static ADDVALIDATORTXS: number[] = [12, 12]

  static ADDSUBNETVALIDATORTXS: number[] = [13]

  static ADDDEPOSITTXS: number[] = [14]

  static CREATECHAINTXS: number[] = [15]

  static CREATESUBNETTXS: number[] = [16]

  static IMPORTTXS: number[] = [17]

  static EXPORTTXS: number[] = [18]

  static ADVANCETIMETXS: number[] = [19]

  static REWARDVALIDATORTXS: number[] = [20]

  static SECPCREDENTIALS: number[] = [9]

  static ASSETIDLEN: number = 32

  static BLOCKCHAINIDLEN: number = 32

  static SYMBOLMAXLEN: number = 4

  static ASSETNAMELEN: number = 128

  static ADDRESSLENGTH: number = 20

  // Get the latest possible version
  static Get(n: number[]): number {
    const v =
      PlatformVMConstants.LATESTCODEC < n.length
        ? PlatformVMConstants.LATESTCODEC
        : n.length - 1
    return n[v as number] | (v << 16)
  }

  // Check if id matches entries in n[], respecting version of id
  static Is(id: number, n: number[]): boolean {
    const v = (id >> 16) as number
    const res = v < n.length ? n[v as number] : n[n.length - 1]
    return res === id
  }
}

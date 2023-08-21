import { Buffer } from "buffer/"
import {
  PlatformVMConstants,
} from "src/apis/platformvm"
import { AddVoteTx } from "src/apis/platformvm/addvotetx"
import { BinTools } from "../../../src"
import { Serialization } from "../../../src/utils"

describe("AddProposalTx", (): void => {
  const bintools = BinTools.getInstance()
  const serialization = Serialization.getInstance()
  const addVoteTxHex: string =
    "000003ea0000000000000000000000000000000000000000000000000000000000000000000000015e21ded8a9e53a62f6c48ef045b37c938c5c5e9b25a14b4987db93682ca30f7600000007000000003b5dc100000000000000000000000001000000018805f06e12c59e33a9a5474adbe24aba987a9a7d00000001c55d7807c7c320ea9836d077f3d2d7c376b41847a9f3626a75c17b6ce11fd8d8000000005e21ded8a9e53a62f6c48ef045b37c938c5c5e9b25a14b4987db93682ca30f7600000005000000003b6d0340000000010000000000000000c55d7807c7c320ea9836d077f3d2d7c376b41847a9f3626a75c17b6ce11fd8d80000000a000000002015000000018805f06e12c59e33a9a5474adbe24aba987a9a7d0000000a0000000100000000000000020000000900000001c85c871901db4c4b4fbcb44f5dbadfad83ba66ac7117064eef127604bf0c5b8e215594894387806eee45c938ad38c8f7a88bc1b7d201173b5fb62eaeb9978fa5000000000900000001c85c871901db4c4b4fbcb44f5dbadfad83ba66ac7117064eef127604bf0c5b8e215594894387806eee45c938ad38c8f7a88bc1b7d201173b5fb62eaeb9978fa5003d61e1aa"
  const addVoteTxBuf: Buffer = Buffer.from(addVoteTxHex, "hex")
  const addVoteTx: AddVoteTx = new AddVoteTx()
  addVoteTx.fromBuffer(addVoteTxBuf)

  test("getTypeName", async (): Promise<void> => {
    const addVoteTxTypeName: string = addVoteTx.getTypeName()
    expect(addVoteTxTypeName).toBe("AddVoteTx")
  })

  test("getTypeID", async (): Promise<void> => {
    const addVoteTxTypeID: number = addVoteTx.getTypeID()
    expect(addVoteTxTypeID).toBe(PlatformVMConstants.ADDVOTETX)
  })

  test("getProposalID", async (): Promise<void> => {
    const proposalID: Buffer = addVoteTx.getProposalID()
    const expected = '2VvRm8ys4Xb7NnuEy6ZktarqD8bAdDAaP1X8MDzSddBBTsyyec'
    expect(bintools.cb58Encode(proposalID)).toBe(expected)
  })

  test("getVoterAddress", async (): Promise<void> => {
    const address: Buffer = addVoteTx.getVoterAddress()
    const expectedAddress: Buffer = bintools.stringToAddress(
      "P-kopernikus13qzlqmsjck0r82d9ga9dhcj2h2v84xna9mz2ja",
    )
    expect(address.toString()).toBe(expectedAddress.toString())
  })

  test("toBuffer and fromBuffer", async (): Promise<void> => {
    const buf: Buffer = addVoteTx.toBuffer()
    const asvTx: AddVoteTx = new AddVoteTx()
    asvTx.fromBuffer(buf)
    const buf2: Buffer = asvTx.toBuffer()
    expect(buf.toString("hex")).toBe(buf2.toString("hex"))
  })

  test("serialize", async (): Promise<void> => {
    const serializedAddressStateTx: object = addVoteTx.serialize()
    const networkIDBuff = Buffer.alloc(4)
    networkIDBuff.writeUInt32BE(1002, 0)

    const expectedJSON = {
      _codecID: null,
      _typeID: PlatformVMConstants.ADDVOTETX,
      _typeName: "AddVoteTx",
      networkID: serialization.encoder(
        networkIDBuff,
        'hex',
        'Buffer',
        'decimalString'
      ),
      blockchainID: serialization.encoder(
        Buffer.alloc(32, 0),
        "hex",
        "Buffer",
        "cb58"
      ),
      memo: serialization
        .typeToBuffer(bintools.cb58Encode(Buffer.from("")), "cb58")
        .toString("hex"),
      ins: [
        {
          _codecID: null,
          _typeID: null,
          _typeName: "TransferableInput",
          assetID: "5e21ded8a9e53a62f6c48ef045b37c938c5c5e9b25a14b4987db93682ca30f76",
          input: {
            _codecID: null,
            _typeID: 5,
            _typeName: "SECPTransferInput",
            amount: "000000003b6d0340",
            sigIdxs: [
              {
                _codecID: null,
                _typeID: null,
                _typeName: "SigIdx",
                bsize: "00000004",
                bytes: "00000000",
                source: "0000000000000000000000000000000000000000",
              },
            ],
          },
          outputidx: "00000000",
          txid: "c55d7807c7c320ea9836d077f3d2d7c376b41847a9f3626a75c17b6ce11fd8d8",
        }
      ],
      outs: [
        {
          _codecID: null,
          _typeID: null,
          _typeName: "TransferableOutput",
          assetID: "5e21ded8a9e53a62f6c48ef045b37c938c5c5e9b25a14b4987db93682ca30f76",
          output: {
            _codecID: null,
            _typeID: 7,
            _typeName: "SECPTransferOutput",
            addresses: [
              {
                _codecID: null,
                _typeID: null,
                _typeName: "Address",
                bsize: "00000014",
                bytes: "8805f06e12c59e33a9a5474adbe24aba987a9a7d",
              },
            ],
            amount: "000000003b5dc100",
            locktime: "0000000000000000",
            threshold: "00000001",
          },
        }
      ],
      votePayload: {
        vote: {
          optionIndex: "00000001",
        },
      },
      voterAddress: "8805f06e12c59e33a9a5474adbe24aba987a9a7d",
      voterAuth: {
        _codecID: null,
        _typeID: 10,
        _typeName: "SubnetAuth"
      }
    }
    expect(serializedAddressStateTx).toStrictEqual(expectedJSON)
  })
})

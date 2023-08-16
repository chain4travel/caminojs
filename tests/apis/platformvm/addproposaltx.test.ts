import { Buffer } from "buffer/"
import {
  PlatformVMConstants,
} from "src/apis/platformvm"
import { AddProposalTx } from "src/apis/platformvm/addproposaltx"
import { BinTools } from "../../../src"
import { Serialization } from "../../../src/utils"

describe("AddProposalTx", (): void => {
  const bintools = BinTools.getInstance()
  const serialization = Serialization.getInstance()
  const addProposalTxHex: string =
    "000003ea00000000000000000000000000000000000000000000000000000000000000000000000159eb48b8b3a928ca9d6b90a0f3492ab47ebf06e9edc553cfb6bcd2d3f38e319a00000007000003a35275bb800000000000000000000000010000000146a9c04f4bf783aa69daabd519dcf36978168b660000000180fd4deb2335bcf092116982d20d50baa97d7b3e33a20dbc52a61f43bd0a61280000000059eb48b8b3a928ca9d6b90a0f3492ab47ebf06e9edc553cfb6bcd2d3f38e319a00000005000003a35284fdc00000000100000000000000000000002200000000201300000001000000000000000a0000000064d627ca0000000064d6284246a9c04f4bf783aa69daabd519dcf36978168b660000000a0000000100000000000000020000000900000001f7730660fadedc723918ab53c71f74e3c49985e0aa5c2ed537743452155c7b0c455a643f3628916152824e47b0ae9e9a813525f154e3430e3051ce933c149b4c000000000900000001f7730660fadedc723918ab53c71f74e3c49985e0aa5c2ed537743452155c7b0c455a643f3628916152824e47b0ae9e9a813525f154e3430e3051ce933c149b4c0043e88329"
  const addProposalTxBuf: Buffer = Buffer.from(addProposalTxHex, "hex")
  const addProposalTx: AddProposalTx = new AddProposalTx()
  addProposalTx.fromBuffer(addProposalTxBuf)

  test("getTypeName", async (): Promise<void> => {
    const addProposalTxTypeName: string = addProposalTx.getTypeName()
    expect(addProposalTxTypeName).toBe("AddProposalTx")
  })

  test("getTypeID", async (): Promise<void> => {
    const addProposalTxTypeID: number = addProposalTx.getTypeID()
    expect(addProposalTxTypeID).toBe(PlatformVMConstants.ADDPROPOSALTX)
    console.log('addProposalTx decoded: ', addProposalTx)
  })

  test("getProposerAddress", async (): Promise<void> => {
    const expectedAddress: Buffer = bintools.stringToAddress(
      "P-local1g65uqn6t77p656w64023nh8nd9updzmxyymev2",
    )
    const address: Buffer = addProposalTx.getProposerAddress()
    expect(address.toString()).toBe(expectedAddress.toString())
  })

  test("toBuffer and fromBuffer", async (): Promise<void> => {
    const buf: Buffer = addProposalTx.toBuffer()
    console.log('buf: ', buf.toString('hex'))
    const asvTx: AddProposalTx = new AddProposalTx()
    asvTx.fromBuffer(buf)
    const buf2: Buffer = asvTx.toBuffer()
    expect(buf.toString("hex")).toBe(buf2.toString("hex"))
  })

  test("serialize", async (): Promise<void> => {
    const serializedAddressStateTx: object = addProposalTx.serialize()
    const networkIDBuff = Buffer.alloc(4)
    networkIDBuff.writeUInt32BE(1002, 0)

    const expectedJSON = {
      _codecID: null,
      _typeID: PlatformVMConstants.ADDPROPOSALTX,
      _typeName: "AddProposalTx",
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
          assetID: "59eb48b8b3a928ca9d6b90a0f3492ab47ebf06e9edc553cfb6bcd2d3f38e319a",
          input: {
            _codecID: null,
            _typeID: 5,
            _typeName: "SECPTransferInput",
            amount: "000003a35284fdc0",
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
          txid: "80fd4deb2335bcf092116982d20d50baa97d7b3e33a20dbc52a61f43bd0a6128",
        }
      ],
      outs: [
        {
          _codecID: null,
          _typeID: null,
          _typeName: "TransferableOutput",
          assetID: "59eb48b8b3a928ca9d6b90a0f3492ab47ebf06e9edc553cfb6bcd2d3f38e319a",
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
                bytes: "46a9c04f4bf783aa69daabd519dcf36978168b66",
              },
            ],
            amount: "000003a35275bb80",
            locktime: "0000000000000000",
            threshold: "00000001",
          },
        }
      ],
      proposalPayload: {
        proposal: {
          end: "0000000064d62842",
          options: [
            {
              _codecID: null,
              _typeID: null,
              _typeName: "VoteOption",
              bsize: "00000008",
              bytes: "000000000000000a",
            }
          ],
          start: "0000000064d627ca",
        },
      },
      proposerAddress: "46a9c04f4bf783aa69daabd519dcf36978168b66",
      proposerAuth: {
        _codecID: null,
        _typeID: 10,
        _typeName: "SubnetAuth"
      }
    }
    expect(serializedAddressStateTx).toStrictEqual(expectedJSON)
  })
})

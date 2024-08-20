import { Buffer } from "buffer/"
import { PlatformVMConstants } from "src/apis/platformvm"
import { AddProposalTx } from "src/apis/platformvm/addproposaltx"
import { BinTools } from "../../../src"
import { AdminProposal, UnsignedTx } from "../../../src/apis/platformvm"
import { Serialization } from "../../../src/utils"

describe("AddBaseFeeProposalTx", (): void => {
  const bintools = BinTools.getInstance()
  const serialization = Serialization.getInstance()
  const addProposalTxHex: string =
    "000000002010000003ea00000000000000000000000000000000000000000000000000000000000000000000000159eb48b8b3a928ca9d6b90a0f3492ab47ebf06e9edc553cfb6bcd2d3f38e319a00000007000002b55c7c83000000000000000000000000010000000146a9c04f4bf783aa69daabd519dcf36978168b66000000014c8fabc9807bdfb520f713ea3ea915e4b1201addfcfaef6925705522e92a3e3f0000000059eb48b8b3a928ca9d6b90a0f3492ab47ebf06e9edc553cfb6bcd2d3f38e319a00000005000002b55c8bc5400000000100000000000000000000001b3c703e70726f706f73616c206465736372697074696f6e3c2f703e000000220000000020130000000100000000000f424000000000665f9c7000000000666a286f46a9c04f4bf783aa69daabd519dcf36978168b660000000a00000001000000000000000200000009000000016b6a92bcffea16d1fb84188d94be4dee07cbda67841278b4afd869101833cdee3f7c6720639ac51ff73f3adeba8c64316168e1a170c27b030c3606026162e73a0100000009000000016b6a92bcffea16d1fb84188d94be4dee07cbda67841278b4afd869101833cdee3f7c6720639ac51ff73f3adeba8c64316168e1a170c27b030c3606026162e73a01afd79f9e"
  const unsignedTx = new UnsignedTx()
  unsignedTx.fromBuffer(Buffer.from(addProposalTxHex, "hex"))
  const addProposalTx = unsignedTx.getTransaction() as AddProposalTx
  test("getTypeName", async (): Promise<void> => {
    const addProposalTxTypeName: string = addProposalTx.getTypeName()
    expect(addProposalTxTypeName).toBe("AddProposalTx")
  })

  test("getTypeID", async (): Promise<void> => {
    const addProposalTxTypeID: number = addProposalTx.getTypeID()
    expect(addProposalTxTypeID).toBe(PlatformVMConstants.ADDPROPOSALTX)
  })

  test("getProposerAddress", async (): Promise<void> => {
    const expectedAddress: Buffer = bintools.stringToAddress(
      "P-local1g65uqn6t77p656w64023nh8nd9updzmxyymev2"
    )
    const address: Buffer = addProposalTx.getProposerAddress()
    expect(address.toString()).toBe(expectedAddress.toString())
  })

  test("toBuffer and fromBuffer", async (): Promise<void> => {
    const buf: Buffer = addProposalTx.toBuffer()
    const apTx: AddProposalTx = new AddProposalTx()
    apTx.fromBuffer(buf)
    const buf2: Buffer = apTx.toBuffer()
    expect(buf.toString("hex")).toBe(buf2.toString("hex"))
  })

  test("serialize", async (): Promise<void> => {
    const serializedAddProposalTx: object = addProposalTx.serialize()
    const networkIDBuff = Buffer.alloc(4)
    networkIDBuff.writeUInt32BE(1002, 0)

    const expectedJSON = {
      _codecID: null,
      _typeID: PlatformVMConstants.ADDPROPOSALTX,
      _typeName: "AddProposalTx",
      networkID: serialization.encoder(
        networkIDBuff,
        "hex",
        "Buffer",
        "decimalString"
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
          assetID:
            "59eb48b8b3a928ca9d6b90a0f3492ab47ebf06e9edc553cfb6bcd2d3f38e319a",
          input: {
            _codecID: null,
            _typeID: 5,
            _typeName: "SECPTransferInput",
            amount: "000002b55c8bc540",
            sigIdxs: [
              {
                _codecID: null,
                _typeID: null,
                _typeName: "SigIdx",
                bsize: "00000004",
                bytes: "00000000",
                source: "0000000000000000000000000000000000000000"
              }
            ]
          },
          outputidx: "00000000",
          txid: "4c8fabc9807bdfb520f713ea3ea915e4b1201addfcfaef6925705522e92a3e3f"
        }
      ],
      outs: [
        {
          _codecID: null,
          _typeID: null,
          _typeName: "TransferableOutput",
          assetID:
            "59eb48b8b3a928ca9d6b90a0f3492ab47ebf06e9edc553cfb6bcd2d3f38e319a",
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
                bytes: "46a9c04f4bf783aa69daabd519dcf36978168b66"
              }
            ],
            amount: "000002b55c7c8300",
            locktime: "0000000000000000",
            threshold: "00000001"
          }
        }
      ],
      proposalDescription: serialization.encoder(
        Buffer.from("<p>proposal description</p>"),
        "hex",
        "Buffer",
        "cb58"
      ),
      proposalPayload: {
        proposal: {
          end: "00000000666a286f",
          options: [
            {
              _codecID: null,
              _typeID: null,
              _typeName: "VoteOption",
              bsize: "00000008",
              bytes: "00000000000f4240"
            }
          ],
          start: "00000000665f9c70"
        }
      },
      proposerAddress: "46a9c04f4bf783aa69daabd519dcf36978168b66",
      proposerAuth: {
        _codecID: null,
        _typeID: 10,
        _typeName: "SubnetAuth"
      }
    }
    expect(serializedAddProposalTx).toStrictEqual(expectedJSON)
  })
})

describe("AddMemberProposalTx", (): void => {
  const bintools = BinTools.getInstance()
  const serialization = Serialization.getInstance()
  const addProposalTxHex: string =
    //"000000002010000003ea00000000000000000000000000000000000000000000000000000000000000000000000159eb48b8b3a928ca9d6b90a0f3492ab47ebf06e9edc553cfb6bcd2d3f38e319a00000007000002b55c7c83000000000000000000000000010000000146a9c04f4bf783aa69daabd519dcf36978168b66000000014c8fabc9807bdfb520f713ea3ea915e4b1201addfcfaef6925705522e92a3e3f0000000059eb48b8b3a928ca9d6b90a0f3492ab47ebf06e9edc553cfb6bcd2d3f38e319a00000005000002b55c8bc5400000000100000000000000000000001b3c703e70726f706f73616c206465736372697074696f6e3c2f703e0000002a00000000201659f116d65aceba6d22cc557e8f3ee17e22c7757d00000000665f9c700000000066aeb67046a9c04f4bf783aa69daabd519dcf36978168b660000000a00000001000000000000000200000009000000016f181711aa627ada6b026b0a5e10275a92b3985f5ef8d9db20faf659cc96f3e07b6cee8a9d2aab012c9244e8a642fdc2b4e8b685af059e312964892f8421a8700100000009000000016f181711aa627ada6b026b0a5e10275a92b3985f5ef8d9db20faf659cc96f3e07b6cee8a9d2aab012c9244e8a642fdc2b4e8b685af059e312964892f8421a87001115acab2"
    "000000002010000003ea00000000000000000000000000000000000000000000000000000000000000000000000159eb48b8b3a928ca9d6b90a0f3492ab47ebf06e9edc553cfb6bcd2d3f38e319a00000007000001d1e42dcf00000000000000000000000001000000013cb7d3842e8cee6a0ebd09f1fe884f6861e1b29c000000012202d10a4489024915422013a0d048b06ee7bda83e4777bc89c55f042d7a58420000000059eb48b8b3a928ca9d6b90a0f3492ab47ebf06e9edc553cfb6bcd2d3f38e319a00000005000001d1e43d1140000000010000000000000014000000000000000000000000000000000000000000000004010203040000002a0000000020163cb7d3842e8cee6a0ebd09f1fe884f6861e1b29c0000000066a127130000000066f041133cb7d3842e8cee6a0ebd09f1fe884f6861e1b29c0000000a00000001000000000000000200000009000000015dc2e6e24316c5fb453f758d22cf547aacc00b2fd30f901df0df879a46185f843da482623ee125db0f09612d9a66e15fbec0f316193e562ec8645c21204c1dd30000000009000000015dc2e6e24316c5fb453f758d22cf547aacc00b2fd30f901df0df879a46185f843da482623ee125db0f09612d9a66e15fbec0f316193e562ec8645c21204c1dd3001810f3a5"
  const unsignedTx = new UnsignedTx()
  unsignedTx.fromBuffer(Buffer.from(addProposalTxHex, "hex"))
  const addProposalTx = unsignedTx.getTransaction() as AddProposalTx

  test("getTypeName", async (): Promise<void> => {
    const addProposalTxTypeName: string = addProposalTx.getTypeName()
    expect(addProposalTxTypeName).toBe("AddProposalTx")
  })

  test("getTypeID", async (): Promise<void> => {
    const addProposalTxTypeID: number = addProposalTx.getTypeID()
    expect(addProposalTxTypeID).toBe(PlatformVMConstants.ADDPROPOSALTX)
  })

  test("getProposerAddress", async (): Promise<void> => {
    const expectedAddress: Buffer = bintools.stringToAddress(
      //"P-kopernikus1g65uqn6t77p656w64023nh8nd9updzmxh8ttv3"
      "P-kopernikus18jma8ppw3nhx5r4ap8clazz0dps7rv5uuvjh68"
    )
    const address: Buffer = addProposalTx.getProposerAddress()
    expect(address.toString()).toBe(expectedAddress.toString())
  })

  test("getProposalType", async (): Promise<void> => {
    const proposalTypeID = PlatformVMConstants.ADDMEMBERPORPOSAL_TYPE_ID
    const payload = addProposalTx.getProposalPayload()
    expect(payload.getProposalType()).toBe(proposalTypeID)
    const proposal = payload.getProposal()
    expect(proposal.getTypeID()).toBe(proposalTypeID)
  })

  test("getProposalDescription", async (): Promise<void> => {
    const description = addProposalTx.getProposalDescription()
    const proposalDescription = new Buffer([1, 2, 3, 4])
    expect(description).toStrictEqual(proposalDescription)
  })

  test("toBuffer and fromBuffer", async (): Promise<void> => {
    const buf: Buffer = addProposalTx.toBuffer()
    const apTx: AddProposalTx = new AddProposalTx()
    apTx.fromBuffer(buf)
    const buf2: Buffer = apTx.toBuffer()
    expect(buf.toString("hex")).toBe(buf2.toString("hex"))
  })

  test("serialize", async (): Promise<void> => {
    const addMemberProposalTx: object = addProposalTx.serialize()
    const networkIDBuff = Buffer.alloc(4)
    networkIDBuff.writeUInt32BE(1002, 0)

    const expectedJSON = {
      _typeID: PlatformVMConstants.ADDPROPOSALTX,
      _typeName: "AddProposalTx",
      assetID:
        "59eb48b8b3a928ca9d6b90a0f3492ab47ebf06e9edc553cfb6bcd2d3f38e319a",
      _codecID: null,
      networkID: serialization.encoder(
        networkIDBuff,
        "hex",
        "Buffer",
        "decimalString"
      ),
      blockchainID: serialization.encoder(
        Buffer.alloc(32, 0),
        "hex",
        "Buffer",
        "cb58"
      ),
      memo: serialization
        .typeToBuffer(bintools.cb58Encode(Buffer.alloc(20)), "cb58")
        .toString("hex"),
      ins: [
        {
          _codecID: null,
          _typeID: 8192,
          _typeName: "LockedIn",
          ids: {
            bondTxID:
              "0000000000000000000000000000000000000000000000000000000000000000",
            depositTxID:
              "4b302bccad2603281f321406a8bb3f8d70400943c5465e745d9c1a4634c367d0"
          },
          assetID:
            "59eb48b8b3a928ca9d6b90a0f3492ab47ebf06e9edc553cfb6bcd2d3f38e319a",

          input: {
            _codecID: null,
            _typeID: 5,
            _typeName: "SECPTransferInput",
            amount: "000001d1e43d1140",
            sigIdxs: [
              {
                _codecID: null,
                _typeID: null,
                _typeName: "SigIdx",
                bsize: "00000004",
                bytes: "00000000",
                source: "0000000000000000000000000000000000000000"
              }
            ]
          },
          outputidx: "00000000",
          txid: "2202d10a4489024915422013a0d048b06ee7bda83e4777bc89c55f042d7a5842"
        }
      ],
      outs: [
        {
          _codecID: null,
          _typeID: null,
          _typeName: "TransferableOutput",
          assetID:
            "59eb48b8b3a928ca9d6b90a0f3492ab47ebf06e9edc553cfb6bcd2d3f38e319a",
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
                bytes: "3cb7d3842e8cee6a0ebd09f1fe884f6861e1b29c"
              }
            ],
            amount: "000001d1e42dcf00",
            locktime: "0000000000000000",
            threshold: "00000001"
          }
        }
      ],
      proposalDescription: serialization.encoder(
        new Buffer([1, 2, 3, 4]),
        "hex",
        "Buffer",
        "hex"
      ),
      proposalPayload: {
        proposal: {
          applicantAddress: "3cb7d3842e8cee6a0ebd09f1fe884f6861e1b29c",
          end: "0000000066f04113",
          start: "0000000066a12713"
        }
      },
      proposerAddress: "3cb7d3842e8cee6a0ebd09f1fe884f6861e1b29c",
      proposerAuth: {
        _codecID: null,
        _typeID: 10,
        _typeName: "SubnetAuth"
      }
    }
    expect(addMemberProposalTx).toStrictEqual(expectedJSON)
  })
})

describe("ExcludeMemberProposalTx", (): void => {
  const bintools = BinTools.getInstance()
  const serialization = Serialization.getInstance()
  const addProposalTxHex: string =
    "000000002010000003ea00000000000000000000000000000000000000000000000000000000000000000000000159eb48b8b3a928ca9d6b90a0f3492ab47ebf06e9edc553cfb6bcd2d3f38e319a00000007000002b55c7c83000000000000000000000000010000000146a9c04f4bf783aa69daabd519dcf36978168b66000000014c8fabc9807bdfb520f713ea3ea915e4b1201addfcfaef6925705522e92a3e3f0000000059eb48b8b3a928ca9d6b90a0f3492ab47ebf06e9edc553cfb6bcd2d3f38e319a00000005000002b55c8bc5400000000100000000000000000000001b3c703e70726f706f73616c206465736372697074696f6e3c2f703e0000002a000000002018bb2cb7881c10341abc7938402971d9f68861da5400000000665f9c70000000006668d6f046a9c04f4bf783aa69daabd519dcf36978168b660000000a00000001000000000000000200000009000000015167a52921ad81892a32cf12570aa60e4bd480fb051ec13f7dac515daf66d55e682c09afb94eb0a05b5c66c667df6992c98aa2845c01ae16084a2b31d58cb3640000000009000000015167a52921ad81892a32cf12570aa60e4bd480fb051ec13f7dac515daf66d55e682c09afb94eb0a05b5c66c667df6992c98aa2845c01ae16084a2b31d58cb36400e10737ff"
  const unsignedTx = new UnsignedTx()
  unsignedTx.fromBuffer(Buffer.from(addProposalTxHex, "hex"))
  const addProposalTx = unsignedTx.getTransaction() as AddProposalTx

  test("getTypeName", async (): Promise<void> => {
    const addProposalTxTypeName: string = addProposalTx.getTypeName()
    expect(addProposalTxTypeName).toBe("AddProposalTx")
  })

  test("getTypeID", async (): Promise<void> => {
    const addProposalTxTypeID: number = addProposalTx.getTypeID()
    expect(addProposalTxTypeID).toBe(PlatformVMConstants.ADDPROPOSALTX)
  })

  test("getProposerAddress", async (): Promise<void> => {
    const expectedAddress: Buffer = bintools.stringToAddress(
      "P-kopernikus1g65uqn6t77p656w64023nh8nd9updzmxh8ttv3"
    )
    const address: Buffer = addProposalTx.getProposerAddress()
    expect(address.toString()).toBe(expectedAddress.toString())
  })

  test("getProposalType", async (): Promise<void> => {
    const proposalTypeID = PlatformVMConstants.EXCLUDEMEMBERPORPOSAL_TYPE_ID
    const payload = addProposalTx.getProposalPayload()
    expect(payload.getProposalType()).toBe(proposalTypeID)
    const proposal = payload.getProposal()
    expect(proposal.getTypeID()).toBe(proposalTypeID)
  })

  test("getProposalDescription", async (): Promise<void> => {
    const proposalDescription = "<p>proposal description</p>"
    const description = addProposalTx.getProposalDescription().toString()
    expect(description).toBe(proposalDescription)
  })

  test("toBuffer and fromBuffer", async (): Promise<void> => {
    const buf: Buffer = addProposalTx.toBuffer()
    const apTx: AddProposalTx = new AddProposalTx()
    apTx.fromBuffer(buf)
    const buf2: Buffer = apTx.toBuffer()
    expect(buf.toString("hex")).toBe(buf2.toString("hex"))
  })

  test("serialize", async (): Promise<void> => {
    const serializedAddProposalTx: object = addProposalTx.serialize()
    const networkIDBuff = Buffer.alloc(4)
    networkIDBuff.writeUInt32BE(1002, 0)

    const expectedJSON = {
      _codecID: null,
      _typeID: PlatformVMConstants.ADDPROPOSALTX,
      _typeName: "AddProposalTx",
      networkID: serialization.encoder(
        networkIDBuff,
        "hex",
        "Buffer",
        "decimalString"
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
          assetID:
            "59eb48b8b3a928ca9d6b90a0f3492ab47ebf06e9edc553cfb6bcd2d3f38e319a",
          input: {
            _codecID: null,
            _typeID: 5,
            _typeName: "SECPTransferInput",
            amount: "000002b55c8bc540",
            sigIdxs: [
              {
                _codecID: null,
                _typeID: null,
                _typeName: "SigIdx",
                bsize: "00000004",
                bytes: "00000000",
                source: "0000000000000000000000000000000000000000"
              }
            ]
          },
          outputidx: "00000000",
          txid: "4c8fabc9807bdfb520f713ea3ea915e4b1201addfcfaef6925705522e92a3e3f"
        }
      ],
      outs: [
        {
          _codecID: null,
          _typeID: null,
          _typeName: "TransferableOutput",
          assetID:
            "59eb48b8b3a928ca9d6b90a0f3492ab47ebf06e9edc553cfb6bcd2d3f38e319a",
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
                bytes: "46a9c04f4bf783aa69daabd519dcf36978168b66"
              }
            ],
            amount: "000002b55c7c8300",
            locktime: "0000000000000000",
            threshold: "00000001"
          }
        }
      ],
      proposalDescription: serialization.encoder(
        Buffer.from("<p>proposal description</p>"),
        "hex",
        "Buffer",
        "cb58"
      ),
      proposalPayload: {
        proposal: {
          memberAddress: "bb2cb7881c10341abc7938402971d9f68861da54",
          end: "000000006668d6f0",
          start: "00000000665f9c70"
        }
      },
      proposerAddress: "46a9c04f4bf783aa69daabd519dcf36978168b66",
      proposerAuth: {
        _codecID: null,
        _typeID: 10,
        _typeName: "SubnetAuth"
      }
    }
    expect(serializedAddProposalTx).toStrictEqual(expectedJSON)
  })
})

describe("AddMemberAdminProposal", (): void => {
  const bintools = BinTools.getInstance()
  const serialization = Serialization.getInstance()
  const addProposalTxHex: string =
    "000000002010000003ea00000000000000000000000000000000000000000000000000000000000000000000000159eb48b8b3a928ca9d6b90a0f3492ab47ebf06e9edc553cfb6bcd2d3f38e319a00000007000002b55c7c83000000000000000000000000010000000146a9c04f4bf783aa69daabd519dcf36978168b66000000014c8fabc9807bdfb520f713ea3ea915e4b1201addfcfaef6925705522e92a3e3f0000000059eb48b8b3a928ca9d6b90a0f3492ab47ebf06e9edc553cfb6bcd2d3f38e319a00000005000002b55c8bc5400000000100000000000000000000001b3c703e70726f706f73616c206465736372697074696f6e3c2f703e00000032000000002017000000000000201659f116d65aceba6d22cc557e8f3ee17e22c7757d00000000665f45940000000066ae5f9446a9c04f4bf783aa69daabd519dcf36978168b660000000a000000010000000000000002000000090000000175d14e821f5e45811308e12de7048404b12df9010df6825aed109e5809c5fcb437e4e0ae81e724493180506461d6e413eeb54515673b02dbd6d2fddeece1632000000000090000000175d14e821f5e45811308e12de7048404b12df9010df6825aed109e5809c5fcb437e4e0ae81e724493180506461d6e413eeb54515673b02dbd6d2fddeece1632000cd549b7c"
  const unsignedTx = new UnsignedTx()
  unsignedTx.fromBuffer(Buffer.from(addProposalTxHex, "hex"))
  const addProposalTx = unsignedTx.getTransaction() as AddProposalTx

  test("getTypeName", async (): Promise<void> => {
    const addProposalTxTypeName: string = addProposalTx.getTypeName()
    expect(addProposalTxTypeName).toBe("AddProposalTx")
  })

  test("getTypeID", async (): Promise<void> => {
    const addProposalTxTypeID: number = addProposalTx.getTypeID()
    expect(addProposalTxTypeID).toBe(PlatformVMConstants.ADDPROPOSALTX)
  })

  test("getProposerAddress", async (): Promise<void> => {
    const expectedAddress: Buffer = bintools.stringToAddress(
      "P-kopernikus1g65uqn6t77p656w64023nh8nd9updzmxh8ttv3"
    )
    const address: Buffer = addProposalTx.getProposerAddress()
    expect(address.toString()).toBe(expectedAddress.toString())
  })

  test("getProposalType", async (): Promise<void> => {
    const proposalTypeID = PlatformVMConstants.ADMINPROPOSAL_TYPE_ID
    const payload = addProposalTx.getProposalPayload()
    expect(payload.getProposalType()).toBe(proposalTypeID)
    const adminProposal = payload.getProposal()
    expect(adminProposal.getTypeID()).toBe(proposalTypeID)
    const execProposalTypeID = PlatformVMConstants.ADDMEMBERPORPOSAL_TYPE_ID
    const execProposal = (adminProposal as AdminProposal).getProposal()
    expect(execProposal.getTypeID()).toBe(execProposalTypeID)
  })

  test("toBuffer and fromBuffer", async (): Promise<void> => {
    const buf: Buffer = addProposalTx.toBuffer()
    const apTx: AddProposalTx = new AddProposalTx()
    apTx.fromBuffer(buf)
    const buf2: Buffer = apTx.toBuffer()
    expect(buf.toString("hex")).toBe(buf2.toString("hex"))
  })

  test("serialize", async (): Promise<void> => {
    const serializedAddProposalTx: object = addProposalTx.serialize()
    const networkIDBuff = Buffer.alloc(4)
    networkIDBuff.writeUInt32BE(1002, 0)

    const expectedJSON = {
      _codecID: null,
      _typeID: PlatformVMConstants.ADDPROPOSALTX,
      _typeName: "AddProposalTx",
      networkID: serialization.encoder(
        networkIDBuff,
        "hex",
        "Buffer",
        "decimalString"
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
          assetID:
            "59eb48b8b3a928ca9d6b90a0f3492ab47ebf06e9edc553cfb6bcd2d3f38e319a",
          input: {
            _codecID: null,
            _typeID: 5,
            _typeName: "SECPTransferInput",
            amount: "000002b55c8bc540",
            sigIdxs: [
              {
                _codecID: null,
                _typeID: null,
                _typeName: "SigIdx",
                bsize: "00000004",
                bytes: "00000000",
                source: "0000000000000000000000000000000000000000"
              }
            ]
          },
          outputidx: "00000000",
          txid: "4c8fabc9807bdfb520f713ea3ea915e4b1201addfcfaef6925705522e92a3e3f"
        }
      ],
      outs: [
        {
          _codecID: null,
          _typeID: null,
          _typeName: "TransferableOutput",
          assetID:
            "59eb48b8b3a928ca9d6b90a0f3492ab47ebf06e9edc553cfb6bcd2d3f38e319a",
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
                bytes: "46a9c04f4bf783aa69daabd519dcf36978168b66"
              }
            ],
            amount: "000002b55c7c8300",
            locktime: "0000000000000000",
            threshold: "00000001"
          }
        }
      ],
      proposalDescription: serialization.encoder(
        Buffer.from("<p>proposal description</p>"),
        "hex",
        "Buffer",
        "cb58"
      ),
      proposalPayload: {
        proposal: {
          optionIndex: "00000000",
          proposal: {
            applicantAddress: "59f116d65aceba6d22cc557e8f3ee17e22c7757d",
            end: "0000000066ae5f94",
            start: "00000000665f4594"
          }
        }
      },
      proposerAddress: "46a9c04f4bf783aa69daabd519dcf36978168b66",
      proposerAuth: {
        _codecID: null,
        _typeID: 10,
        _typeName: "SubnetAuth"
      }
    }
    expect(serializedAddProposalTx).toStrictEqual(expectedJSON)
  })
})

describe("ExcludeMemberAdminProposal", (): void => {
  const bintools = BinTools.getInstance()
  const serialization = Serialization.getInstance()
  const addProposalTxHex: string =
    "000000002010000003ea00000000000000000000000000000000000000000000000000000000000000000000000159eb48b8b3a928ca9d6b90a0f3492ab47ebf06e9edc553cfb6bcd2d3f38e319a00000007000002b55c7c83000000000000000000000000010000000146a9c04f4bf783aa69daabd519dcf36978168b66000000014c8fabc9807bdfb520f713ea3ea915e4b1201addfcfaef6925705522e92a3e3f0000000059eb48b8b3a928ca9d6b90a0f3492ab47ebf06e9edc553cfb6bcd2d3f38e319a00000005000002b55c8bc5400000000100000000000000000000001b3c703e70726f706f73616c206465736372697074696f6e3c2f703e0000003200000000201700000000000020183cb7d3842e8cee6a0ebd09f1fe884f6861e1b29c00000000665f475600000000666881d646a9c04f4bf783aa69daabd519dcf36978168b660000000a00000001000000000000000200000009000000012367c204d4421fbfd64e4b95d300cfdfaa5cf920b22b30242b263a836f9a0c1b7390b048f743b7fd0bf2cc49882523d8a5b7a22b4e7dbd85740483d23aa1a93c0100000009000000012367c204d4421fbfd64e4b95d300cfdfaa5cf920b22b30242b263a836f9a0c1b7390b048f743b7fd0bf2cc49882523d8a5b7a22b4e7dbd85740483d23aa1a93c01ba600e6e"
  const unsignedTx = new UnsignedTx()
  unsignedTx.fromBuffer(Buffer.from(addProposalTxHex, "hex"))
  const addProposalTx = unsignedTx.getTransaction() as AddProposalTx

  test("getTypeName", async (): Promise<void> => {
    const addProposalTxTypeName: string = addProposalTx.getTypeName()
    expect(addProposalTxTypeName).toBe("AddProposalTx")
  })

  test("getTypeID", async (): Promise<void> => {
    const addProposalTxTypeID: number = addProposalTx.getTypeID()
    expect(addProposalTxTypeID).toBe(PlatformVMConstants.ADDPROPOSALTX)
  })

  test("getProposerAddress", async (): Promise<void> => {
    const expectedAddress: Buffer = bintools.stringToAddress(
      "P-kopernikus1g65uqn6t77p656w64023nh8nd9updzmxh8ttv3"
    )
    const address: Buffer = addProposalTx.getProposerAddress()
    expect(address.toString()).toBe(expectedAddress.toString())
  })

  test("getProposalType", async (): Promise<void> => {
    const proposalTypeID = PlatformVMConstants.ADMINPROPOSAL_TYPE_ID
    const payload = addProposalTx.getProposalPayload()
    expect(payload.getProposalType()).toBe(proposalTypeID)
    const adminProposal = payload.getProposal()
    expect(adminProposal.getTypeID()).toBe(proposalTypeID)
    const execProposalTypeID = PlatformVMConstants.EXCLUDEMEMBERPORPOSAL_TYPE_ID
    const execProposal = (adminProposal as AdminProposal).getProposal()
    expect(execProposal.getTypeID()).toBe(execProposalTypeID)
  })

  test("toBuffer and fromBuffer", async (): Promise<void> => {
    const buf: Buffer = addProposalTx.toBuffer()
    const apTx: AddProposalTx = new AddProposalTx()
    apTx.fromBuffer(buf)
    const buf2: Buffer = apTx.toBuffer()
    expect(buf.toString("hex")).toBe(buf2.toString("hex"))
  })

  test("serialize", async (): Promise<void> => {
    const serializedAddProposalTx: object = addProposalTx.serialize()
    const networkIDBuff = Buffer.alloc(4)
    networkIDBuff.writeUInt32BE(1002, 0)

    const expectedJSON = {
      _codecID: null,
      _typeID: PlatformVMConstants.ADDPROPOSALTX,
      _typeName: "AddProposalTx",
      networkID: serialization.encoder(
        networkIDBuff,
        "hex",
        "Buffer",
        "decimalString"
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
          assetID:
            "59eb48b8b3a928ca9d6b90a0f3492ab47ebf06e9edc553cfb6bcd2d3f38e319a",
          input: {
            _codecID: null,
            _typeID: 5,
            _typeName: "SECPTransferInput",
            amount: "000002b55c8bc540",
            sigIdxs: [
              {
                _codecID: null,
                _typeID: null,
                _typeName: "SigIdx",
                bsize: "00000004",
                bytes: "00000000",
                source: "0000000000000000000000000000000000000000"
              }
            ]
          },
          outputidx: "00000000",
          txid: "4c8fabc9807bdfb520f713ea3ea915e4b1201addfcfaef6925705522e92a3e3f"
        }
      ],
      outs: [
        {
          _codecID: null,
          _typeID: null,
          _typeName: "TransferableOutput",
          assetID:
            "59eb48b8b3a928ca9d6b90a0f3492ab47ebf06e9edc553cfb6bcd2d3f38e319a",
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
                bytes: "46a9c04f4bf783aa69daabd519dcf36978168b66"
              }
            ],
            amount: "000002b55c7c8300",
            locktime: "0000000000000000",
            threshold: "00000001"
          }
        }
      ],
      proposalDescription: serialization.encoder(
        Buffer.from("<p>proposal description</p>"),
        "hex",
        "Buffer",
        "cb58"
      ),
      proposalPayload: {
        proposal: {
          optionIndex: "00000000",
          proposal: {
            memberAddress: "3cb7d3842e8cee6a0ebd09f1fe884f6861e1b29c",
            end: "00000000666881d6",
            start: "00000000665f4756"
          }
        }
      },
      proposerAddress: "46a9c04f4bf783aa69daabd519dcf36978168b66",
      proposerAuth: {
        _codecID: null,
        _typeID: 10,
        _typeName: "SubnetAuth"
      }
    }
    expect(serializedAddProposalTx).toStrictEqual(expectedJSON)
  })
})

describe("NewProposalTx", (): void => {
  const bintools = BinTools.getInstance()
  const serialization = Serialization.getInstance()
  const addProposalTxHex: string =
    "000000002010000003ea00000000000000000000000000000000000000000000000000000000000000000000000159eb48b8b3a928ca9d6b90a0f3492ab47ebf06e9edc553cfb6bcd2d3f38e319a00000007000001d1e42dcf00000000000000000000000001000000013cb7d3842e8cee6a0ebd09f1fe884f6861e1b29c000000012202d10a4489024915422013a0d048b06ee7bda83e4777bc89c55f042d7a58420000000059eb48b8b3a928ca9d6b90a0f3492ab47ebf06e9edc553cfb6bcd2d3f38e319a00000005000001d1e43d114000000001000000000000001400000000000000000000000000000000000000000000000d000b68656c6c6f20776f726c640000032d00000000201a000000035448495320535452494e4720495320323536204348415241435445525320787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878785448495320535452494e4720495320323536204348415241435445525320787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878785448495320535452494e47204953203235362043484152414354455253207878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787800000000669fb1cf0000000066eecbcf000000010000000000000002000000000001313cb7d3842e8cee6a0ebd09f1fe884f6861e1b29c0000000a0000000100000000000000020000000900000001e409db1c209a37dac27ea0b620ab0e25d84d6812cc3ca3e7d1c507c43532c2a923057dbe6322bac3753a961568a25ecb65ddf0fa072e539c7ce341b047965d3b000000000900000001e409db1c209a37dac27ea0b620ab0e25d84d6812cc3ca3e7d1c507c43532c2a923057dbe6322bac3753a961568a25ecb65ddf0fa072e539c7ce341b047965d3b0046392245"
  const unsignedTx = new UnsignedTx()
  unsignedTx.fromBuffer(Buffer.from(addProposalTxHex, "hex"))
  const addProposalTx = unsignedTx.getTransaction() as AddProposalTx

  test("getTypeName", async (): Promise<void> => {
    const addProposalTxTypeName: string = addProposalTx.getTypeName()
    expect(addProposalTxTypeName).toBe("AddProposalTx")
  })

  test("getTypeID", async (): Promise<void> => {
    const addProposalTxTypeID: number = addProposalTx.getTypeID()
    expect(addProposalTxTypeID).toBe(PlatformVMConstants.ADDPROPOSALTX)
  })

  test("getProposalDescription", async (): Promise<void> => {
    const proposalDescription = "<p>proposal description</p>"
    const description = addProposalTx.getProposalDescription().toString()
    expect(description).toBe(proposalDescription)
  })

  test("getProposerAddress", async (): Promise<void> => {
    const expectedAddress: Buffer = bintools.stringToAddress(
      "P-local1g65uqn6t77p656w64023nh8nd9updzmxyymev2"
    )
    const address: Buffer = addProposalTx.getProposerAddress()
    expect(address.toString()).toBe(expectedAddress.toString())
  })

  test("getProposalType", async (): Promise<void> => {
    const proposalTypeID = PlatformVMConstants.NEWPROPOSAL_TYPE_ID
    const payload = addProposalTx.getProposalPayload()
    expect(payload.getProposalType()).toBe(proposalTypeID)
    const proposal = payload.getProposal()
    expect(proposal.getTypeID()).toBe(proposalTypeID)
  })

  test("toBuffer and fromBuffer", async (): Promise<void> => {
    const buf: Buffer = addProposalTx.toBuffer()
    const apTx: AddProposalTx = new AddProposalTx()
    apTx.fromBuffer(buf)
    const buf2: Buffer = apTx.toBuffer()
    expect(buf.toString("hex")).toBe(buf2.toString("hex"))
  })
})
describe("GeneralProposal Playground", (): void => {
  const bintools = BinTools.getInstance()
  const serialization = Serialization.getInstance()
  const addProposalTxHex: string =
    // crooked:"000000002010000003ea00000000000000000000000000000000000000000000000000000000000000000000000159eb48b8b3a928ca9d6b90a0f3492ab47ebf06e9edc553cfb6bcd2d3f38e319a00000007000001d1e42dcf00000000000000000000000001000000013cb7d3842e8cee6a0ebd09f1fe884f6861e1b29c000000012202d10a4489024915422013a0d048b06ee7bda83e4777bc89c55f042d7a58420000000059eb48b8b3a928ca9d6b90a0f3492ab47ebf06e9edc553cfb6bcd2d3f38e319a00000005000001d1e43d1140000000010000000000000014000000000000000000000000000000000000000000000004010203040000032b000000002019000000030000000066a210500000000066f12a50000000010000000000000002000000000001305448495320535452494e4720495320323536204348415241435445525320787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878785448495320535452494e4720495320323536204348415241435445525320787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878785448495320535452494e472049532032353620434841524143544552532078787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878783cb7d3842e8cee6a0ebd09f1fe884f6861e1b29c0000000a00000001000000000000000200000009000000018780e57cb5ab8bdef3c4af7abfea8120a3d512aede20e3c3d340ad810736f4af5356ebf8c2693b22764cf31923a1c4b1e5bddf698aa3cc82dda2a06d3b104d540000000009000000018780e57cb5ab8bdef3c4af7abfea8120a3d512aede20e3c3d340ad810736f4af5356ebf8c2693b22764cf31923a1c4b1e5bddf698aa3cc82dda2a06d3b104d5400b68b37f5"

    // issued from playground - for reverse engineering:
    "000000002010000003ea00000000000000000000000000000000000000000000000000000000000000000000000459eb48b8b3a928ca9d6b90a0f3492ab47ebf06e9edc553cfb6bcd2d3f38e319a00000007000001d16d53c8800000000000000000000000010000000146a9c04f4bf783aa69daabd519dcf36978168b6659eb48b8b3a928ca9d6b90a0f3492ab47ebf06e9edc553cfb6bcd2d3f38e319a000020014b302bccad2603281f321406a8bb3f8d70400943c5465e745d9c1a4634c367d0000000000000000000000000000000000000000000000000000000000000000000000007002386f26fc100000000000000000000000000010000000146a9c04f4bf783aa69daabd519dcf36978168b6659eb48b8b3a928ca9d6b90a0f3492ab47ebf06e9edc553cfb6bcd2d3f38e319a00002001b61e1ebfa3c0207c1d44181321e82cd8be0e85674a1c4aed1c0102db394b5bf7000000000000000000000000000000000000000000000000000000000000000000000007000001ba60d338000000000000000000000000010000000146a9c04f4bf783aa69daabd519dcf36978168b6659eb48b8b3a928ca9d6b90a0f3492ab47ebf06e9edc553cfb6bcd2d3f38e319a00002001b61e1ebfa3c0207c1d44181321e82cd8be0e85674a1c4aed1c0102db394b5bf7746869732074782069640000000000000000000000000000000000000000000000000007000000174876e8000000000000000000000000010000000146a9c04f4bf783aa69daabd519dcf36978168b66000000034b302bccad2603281f321406a8bb3f8d70400943c5465e745d9c1a4634c367d00000000059eb48b8b3a928ca9d6b90a0f3492ab47ebf06e9edc553cfb6bcd2d3f38e319a000020004b302bccad2603281f321406a8bb3f8d70400943c5465e745d9c1a4634c367d0000000000000000000000000000000000000000000000000000000000000000000000005002386f26fc100000000000100000000b61e1ebfa3c0207c1d44181321e82cd8be0e85674a1c4aed1c0102db394b5bf70000000059eb48b8b3a928ca9d6b90a0f3492ab47ebf06e9edc553cfb6bcd2d3f38e319a00002000b61e1ebfa3c0207c1d44181321e82cd8be0e85674a1c4aed1c0102db394b5bf7000000000000000000000000000000000000000000000000000000000000000000000005000001d1a94a20000000000100000000eae3599c6b10d63a2021c58e606d64a7e6f5b41f74001066147e4254bbc031a40000000059eb48b8b3a928ca9d6b90a0f3492ab47ebf06e9edc553cfb6bcd2d3f38e319a00000005000001d16d630ac00000000100000000000000000000000b68656c6c6f20776f726c640000033700000000201900000003000001005448495320535452494e472049532032353620434841524143544552532078787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878000001005448495320535452494e472049532032353620434841524143544552532079787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878000001005448495320535452494e47204953203235362043484152414354455253207a7878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878780000000066a3b08d0000000066a5566d000000000000000100000000000000020146a9c04f4bf783aa69daabd519dcf36978168b660000000a00000001000000009eaa40a7"
  // "000000002010000003ea00000000000000000000000000000000000000000000000000000000000000000000000459eb48b8b3a928ca9d6b90a0f3492ab47ebf06e9edc553cfb6bcd2d3f38e319a00000007000001d16d53c8800000000000000000000000010000000146a9c04f4bf783aa69daabd519dcf36978168b6659eb48b8b3a928ca9d6b90a0f3492ab47ebf06e9edc553cfb6bcd2d3f38e319a000020014b302bccad2603281f321406a8bb3f8d70400943c5465e745d9c1a4634c367d0000000000000000000000000000000000000000000000000000000000000000000000007002386f26fc100000000000000000000000000010000000146a9c04f4bf783aa69daabd519dcf36978168b6659eb48b8b3a928ca9d6b90a0f3492ab47ebf06e9edc553cfb6bcd2d3f38e319a00002001b61e1ebfa3c0207c1d44181321e82cd8be0e85674a1c4aed1c0102db394b5bf7000000000000000000000000000000000000000000000000000000000000000000000007000001ba60d338000000000000000000000000010000000146a9c04f4bf783aa69daabd519dcf36978168b6659eb48b8b3a928ca9d6b90a0f3492ab47ebf06e9edc553cfb6bcd2d3f38e319a00002001b61e1ebfa3c0207c1d44181321e82cd8be0e85674a1c4aed1c0102db394b5bf7746869732074782069640000000000000000000000000000000000000000000000000007000000174876e8000000000000000000000000010000000146a9c04f4bf783aa69daabd519dcf36978168b66000000034b302bccad2603281f321406a8bb3f8d70400943c5465e745d9c1a4634c367d00000000059eb48b8b3a928ca9d6b90a0f3492ab47ebf06e9edc553cfb6bcd2d3f38e319a000020004b302bccad2603281f321406a8bb3f8d70400943c5465e745d9c1a4634c367d0000000000000000000000000000000000000000000000000000000000000000000000005002386f26fc100000000000100000000b61e1ebfa3c0207c1d44181321e82cd8be0e85674a1c4aed1c0102db394b5bf70000000059eb48b8b3a928ca9d6b90a0f3492ab47ebf06e9edc553cfb6bcd2d3f38e319a00002000b61e1ebfa3c0207c1d44181321e82cd8be0e85674a1c4aed1c0102db394b5bf7000000000000000000000000000000000000000000000000000000000000000000000005000001d1a94a20000000000100000000eae3599c6b10d63a2021c58e606d64a7e6f5b41f74001066147e4254bbc031a40000000059eb48b8b3a928ca9d6b90a0f3492ab47ebf06e9edc553cfb6bcd2d3f38e319a00000005000001d16d630ac00000000100000000000000000000000b68656c6c6f20776f726c640000033700000000201900000003000001005448495320535452494e472049532032353620434841524143544552532078787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878000001005448495320535452494e472049532032353620434841524143544552532079787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878000001005448495320535452494e47204953203235362043484152414354455253207a7878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878780000000066a3b0ef0000000066a556cf000000000000000100000000000000020146a9c04f4bf783aa69daabd519dcf36978168b660000000a0000000100000000000000040000000900000001993fe1b424c17e786fc1180ece401d4de24bae0ca45bc87f36bd27ccaf5474d71bd2346cf76d4002c88c7396f47213828d4b1eca4e713f1d2731c40ede7b789c000000000900000001993fe1b424c17e786fc1180ece401d4de24bae0ca45bc87f36bd27ccaf5474d71bd2346cf76d4002c88c7396f47213828d4b1eca4e713f1d2731c40ede7b789c000000000900000001993fe1b424c17e786fc1180ece401d4de24bae0ca45bc87f36bd27ccaf5474d71bd2346cf76d4002c88c7396f47213828d4b1eca4e713f1d2731c40ede7b789c000000000900000001993fe1b424c17e786fc1180ece401d4de24bae0ca45bc87f36bd27ccaf5474d71bd2346cf76d4002c88c7396f47213828d4b1eca4e713f1d2731c40ede7b789c00"
  const unsignedTx = new UnsignedTx()
  unsignedTx.fromBuffer(Buffer.from(addProposalTxHex, "hex"))
  const addProposalTx = unsignedTx.getTransaction() as AddProposalTx

  test("getTypeName", async (): Promise<void> => {
    const addProposalTxTypeName: string = addProposalTx.getTypeName()
    expect(addProposalTxTypeName).toBe("AddProposalTx")
  })

  test("getTypeID", async (): Promise<void> => {
    const addProposalTxTypeID: number = addProposalTx.getTypeID()
    expect(addProposalTxTypeID).toBe(PlatformVMConstants.ADDPROPOSALTX)
  })

  test("getProposerAddress", async (): Promise<void> => {
    const expectedAddress: Buffer = bintools.stringToAddress(
      "P-kopernikus1g65uqn6t77p656w64023nh8nd9updzmxh8ttv3"
      //"P-kopernikus18jma8ppw3nhx5r4ap8clazz0dps7rv5uuvjh68"
    )
    const address: Buffer = addProposalTx.getProposerAddress()
    expect(address.toString()).toBe(expectedAddress.toString())
  })

  test("getProposalType", async (): Promise<void> => {
    const proposalTypeID = PlatformVMConstants.GENERALPROPOSAL_TYPE_ID
    const payload = addProposalTx.getProposalPayload()
    expect(payload.getProposalType()).toBe(proposalTypeID)
    const proposal = payload.getProposal()
    expect(proposal.getTypeID()).toBe(proposalTypeID)
  })

  test("getProposalDescription", async (): Promise<void> => {
    const description = addProposalTx.getProposalDescription()
    const proposalDescription = new Buffer("hello world")
    expect(description).toStrictEqual(proposalDescription)
  })

  test("getAllowEarlyFinish", async (): Promise<void> => {
    const payload = addProposalTx.getProposalPayload()
    const proposal = payload.getProposal()
  })

  test("serialize", async (): Promise<void> => {
    const serializedAddProposalTx: object = addProposalTx.serialize()
    const networkIDBuff = Buffer.alloc(4)
    networkIDBuff.writeUInt32BE(1002, 0)

    const expectedJSON = {
      _typeName: "AddProposalTx",
      _typeID: PlatformVMConstants.ADDPROPOSALTX,
      _codecID: null,
      networkID: serialization.encoder(
        networkIDBuff,
        "hex",
        "Buffer",
        "decimalString"
      ),
      blockchainID: serialization.encoder(
        Buffer.alloc(32, 0),
        "hex",
        "Buffer",
        "cb58"
      ),
      outs: [
        {
          _typeName: "TransferableOutput",
          _typeID: null,
          _codecID: null,
          output: {
            _typeName: "SECPTransferOutput",
            _typeID: 7,
            _codecID: null,
            locktime: "0000000000000000",
            threshold: "00000001",
            addresses: [
              {
                _typeName: "Address",
                _typeID: null,
                _codecID: null,
                bsize: "00000014",
                bytes: "46a9c04f4bf783aa69daabd519dcf36978168b66"
              }
            ],
            amount: "000001d16d53c880"
          },
          assetID:
            "59eb48b8b3a928ca9d6b90a0f3492ab47ebf06e9edc553cfb6bcd2d3f38e319a"
        },
        {
          _typeName: "TransferableOutput",
          _typeID: null,
          _codecID: null,
          output: {
            _typeName: "LockedOut",
            _typeID: 8193,
            _codecID: null,
            output: {
              _typeName: "SECPTransferOutput",
              _typeID: 7,
              _codecID: null,
              locktime: "0000000000000000",
              threshold: "00000001",
              addresses: [
                {
                  _typeName: "Address",
                  _typeID: null,
                  _codecID: null,
                  bsize: "00000014",
                  bytes: "46a9c04f4bf783aa69daabd519dcf36978168b66"
                }
              ],
              amount: "002386f26fc10000"
            },
            ids: {
              depositTxID:
                "4b302bccad2603281f321406a8bb3f8d70400943c5465e745d9c1a4634c367d0",
              bondTxID:
                "0000000000000000000000000000000000000000000000000000000000000000"
            }
          },
          assetID:
            "59eb48b8b3a928ca9d6b90a0f3492ab47ebf06e9edc553cfb6bcd2d3f38e319a"
        },
        {
          _typeName: "TransferableOutput",
          _typeID: null,
          _codecID: null,
          output: {
            _typeName: "LockedOut",
            _typeID: 8193,
            _codecID: null,
            output: {
              _typeName: "SECPTransferOutput",
              _typeID: 7,
              _codecID: null,
              locktime: "0000000000000000",
              threshold: "00000001",
              addresses: [
                {
                  _typeName: "Address",
                  _typeID: null,
                  _codecID: null,
                  bsize: "00000014",
                  bytes: "46a9c04f4bf783aa69daabd519dcf36978168b66"
                }
              ],
              amount: "000001ba60d33800"
            },
            ids: {
              depositTxID:
                "b61e1ebfa3c0207c1d44181321e82cd8be0e85674a1c4aed1c0102db394b5bf7",
              bondTxID:
                "0000000000000000000000000000000000000000000000000000000000000000"
            }
          },
          assetID:
            "59eb48b8b3a928ca9d6b90a0f3492ab47ebf06e9edc553cfb6bcd2d3f38e319a"
        },
        {
          _typeName: "TransferableOutput",
          _typeID: null,
          _codecID: null,
          output: {
            _typeName: "LockedOut",
            _typeID: 8193,
            _codecID: null,
            output: {
              _typeName: "SECPTransferOutput",
              _typeID: 7,
              _codecID: null,
              locktime: "0000000000000000",
              threshold: "00000001",
              addresses: [
                {
                  _typeName: "Address",
                  _typeID: null,
                  _codecID: null,
                  bsize: "00000014",
                  bytes: "46a9c04f4bf783aa69daabd519dcf36978168b66"
                }
              ],
              amount: "000000174876e800"
            },
            ids: {
              depositTxID:
                "b61e1ebfa3c0207c1d44181321e82cd8be0e85674a1c4aed1c0102db394b5bf7",
              bondTxID:
                "7468697320747820696400000000000000000000000000000000000000000000"
            }
          },
          assetID:
            "59eb48b8b3a928ca9d6b90a0f3492ab47ebf06e9edc553cfb6bcd2d3f38e319a"
        }
      ],
      ins: [
        {
          _typeName: "TransferableInput",
          _typeID: null,
          _codecID: null,
          input: {
            _typeName: "LockedIn",
            _typeID: 8192,
            _codecID: null,
            input: {
              _typeName: "SECPTransferInput",
              _typeID: 5,
              _codecID: null,
              sigIdxs: [
                {
                  _typeName: "SigIdx",
                  _typeID: null,
                  _codecID: null,
                  bsize: "00000004",
                  bytes: "00000000",
                  source: "0000000000000000000000000000000000000000"
                }
              ],
              amount: "002386f26fc10000"
            },
            ids: {
              depositTxID:
                "4b302bccad2603281f321406a8bb3f8d70400943c5465e745d9c1a4634c367d0",
              bondTxID:
                "0000000000000000000000000000000000000000000000000000000000000000"
            }
          },
          txid: "4b302bccad2603281f321406a8bb3f8d70400943c5465e745d9c1a4634c367d0",
          outputidx: "00000000",
          assetID:
            "59eb48b8b3a928ca9d6b90a0f3492ab47ebf06e9edc553cfb6bcd2d3f38e319a"
        },
        {
          _typeName: "TransferableInput",
          _typeID: null,
          _codecID: null,
          input: {
            _typeName: "LockedIn",
            _typeID: 8192,
            _codecID: null,
            input: {
              _typeName: "SECPTransferInput",
              _typeID: 5,
              _codecID: null,
              sigIdxs: [
                {
                  _typeName: "SigIdx",
                  _typeID: null,
                  _codecID: null,
                  bsize: "00000004",
                  bytes: "00000000",
                  source: "0000000000000000000000000000000000000000"
                }
              ],
              amount: "000001d1a94a2000"
            },
            ids: {
              depositTxID:
                "b61e1ebfa3c0207c1d44181321e82cd8be0e85674a1c4aed1c0102db394b5bf7",
              bondTxID:
                "0000000000000000000000000000000000000000000000000000000000000000"
            }
          },
          txid: "b61e1ebfa3c0207c1d44181321e82cd8be0e85674a1c4aed1c0102db394b5bf7",
          outputidx: "00000000",
          assetID:
            "59eb48b8b3a928ca9d6b90a0f3492ab47ebf06e9edc553cfb6bcd2d3f38e319a"
        },
        {
          _typeName: "TransferableInput",
          _typeID: null,
          _codecID: null,
          input: {
            _typeName: "SECPTransferInput",
            _typeID: 5,
            _codecID: null,
            sigIdxs: [
              {
                _typeName: "SigIdx",
                _typeID: null,
                _codecID: null,
                bsize: "00000004",
                bytes: "00000000",
                source: "0000000000000000000000000000000000000000"
              }
            ],
            amount: "000001d16d630ac0"
          },
          txid: "eae3599c6b10d63a2021c58e606d64a7e6f5b41f74001066147e4254bbc031a4",
          outputidx: "00000000",
          assetID:
            "59eb48b8b3a928ca9d6b90a0f3492ab47ebf06e9edc553cfb6bcd2d3f38e319a"
        }
      ],
      memo: serialization
        .typeToBuffer(bintools.cb58Encode(new Buffer("")), "cb58")
        .toString("hex"),
      proposalDescription: serialization.encoder(
        new Buffer("hello world"),
        "hex",
        "Buffer",
        "hex"
      ),
      proposalPayload: {
        //optionIndex: "00000000",
        proposal: {
          end: "0000000066a5566d",
          start: "0000000066a3b08d",
          mostVotedThresholdNominator: "0000000000000002", //
          totalVotedThresholdNominator: "0000000000000001",
          allowEarlyFinish: true,
          options: [
            {
              //_codecID: null,
              //_typeID: null,
              //_typeName: "GeneralVoteOption",
              //assetID:
              //"59eb48b8b3a928ca9d6b90a0f3492ab47ebf06e9edc553cfb6bcd2d3f38e319a",
              option: serialization.encoder(
                Buffer.from(
                  "THIS STRING IS 256 CHARACTERS xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                ),
                "hex",
                "Buffer",
                "hex"
              )
            },
            {
              //_codecID: null,
              //_typeID: null,
              //_typeName: "GeneralVoteOption",
              option: serialization.encoder(
                Buffer.from(
                  "THIS STRING IS 256 CHARACTERS yxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                ),
                "hex",
                "Buffer",
                "hex"
              )
            },
            {
              //_codecID: null,
              //_typeID: null,
              //_typeName: "GeneralVoteOption",
              option: serialization.encoder(
                Buffer.from(
                  "THIS STRING IS 256 CHARACTERS zxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                ),
                "hex",
                "Buffer",
                "hex"
              )
            }
          ]
        }
      },
      proposerAddress: "46a9c04f4bf783aa69daabd519dcf36978168b66",
      proposerAuth: {
        _codecID: null,
        _typeID: 10,
        _typeName: "SubnetAuth"
      }
    }
    expect(serializedAddProposalTx).toStrictEqual(expectedJSON)
  })

  test("toBuffer and fromBuffer", async (): Promise<void> => {
    const buf: Buffer = addProposalTx.toBuffer()
    const adpTx: AddProposalTx = new AddProposalTx()
    adpTx.fromBuffer(buf)
    const buf2: Buffer = adpTx.toBuffer()

    //expect(buf).toStrictEqual(buf2)
    expect(buf.toString("hex")).toStrictEqual(buf2.toString("hex"))
  })
})

describe("GeneralProposal CaminoJs", (): void => {
  const bintools = BinTools.getInstance()
  const serialization = Serialization.getInstance()
  const addProposalTxHex: string =
    "000000002010000003ea00000000000000000000000000000000000000000000000000000000000000000000000159eb48b8b3a928ca9d6b90a0f3492ab47ebf06e9edc553cfb6bcd2d3f38e319a0000000700016bcc41d9bdc0000000000000000000000001000000013cb7d3842e8cee6a0ebd09f1fe884f6861e1b29c000000010903208c79e9d29ad5e5ea7caf771ecca4db7a218c44d7c3619deea62e6227640000000159eb48b8b3a928ca9d6b90a0f3492ab47ebf06e9edc553cfb6bcd2d3f38e319a0000000500016bcc41e9000000000001000000000000001400000000000000000000000000000000000000000000000d000b68656c6c6f20776f726c6400000337000000002019000000030000000066c5f81600000000671512160000000100000000000000020000000000000001005448495320535452494e472049532032353620434841524143544552532078787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878000001005448495320535452494e472049532032353620434841524143544552532079787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878000001005448495320535452494e47204953203235362043484152414354455253207a7878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878783cb7d3842e8cee6a0ebd09f1fe884f6861e1b29c0000000a00000001000000000000000200000009000000015383a2e7651c5c5763793964a3980840266448018b7473502bbc575335e832175900c554bd5284bf82aa749dc2c58692a37f3acb896866e3fddb43d586df5c340100000009000000015383a2e7651c5c5763793964a3980840266448018b7473502bbc575335e832175900c554bd5284bf82aa749dc2c58692a37f3acb896866e3fddb43d586df5c340103c77a89"

  const unsignedTx = new UnsignedTx()
  unsignedTx.fromBuffer(Buffer.from(addProposalTxHex, "hex"))
  const addProposalTx = unsignedTx.getTransaction() as AddProposalTx

  test("getTypeName", async (): Promise<void> => {
    const addProposalTxTypeName: string = addProposalTx.getTypeName()
    expect(addProposalTxTypeName).toBe("AddProposalTx")
  })

  test("getTypeID", async (): Promise<void> => {
    const addProposalTxTypeID: number = addProposalTx.getTypeID()
    expect(addProposalTxTypeID).toBe(PlatformVMConstants.ADDPROPOSALTX)
  })

  test("getProposerAddress", async (): Promise<void> => {
    const expectedAddress: Buffer = bintools.stringToAddress(
      //"P-kopernikus1g65uqn6t77p656w64023nh8nd9updzmxh8ttv3"
      "P-kopernikus18jma8ppw3nhx5r4ap8clazz0dps7rv5uuvjh68"
    )
    const address: Buffer = addProposalTx.getProposerAddress()
    expect(address.toString()).toBe(expectedAddress.toString())
  })

  test("getProposalType", async (): Promise<void> => {
    const proposalTypeID = PlatformVMConstants.GENERALPROPOSAL_TYPE_ID
    const payload = addProposalTx.getProposalPayload()
    expect(payload.getProposalType()).toBe(proposalTypeID)
    const proposal = payload.getProposal()
    expect(proposal.getTypeID()).toBe(proposalTypeID)
  })

  test("getProposalDescription", async (): Promise<void> => {
    const description = addProposalTx.getProposalDescription()
    const proposalDescription = new Buffer("hello world")
    console.log(description.toString())
    expect(description).toStrictEqual(proposalDescription)
  })

  test("getAllowEarlyFinish", async (): Promise<void> => {
    const payload = addProposalTx.getProposalPayload()
    const proposal = payload.getProposal()
  })

  test("serialize", async (): Promise<void> => {
    const serializedAddProposalTx: object = addProposalTx.serialize()
    const networkIDBuff = Buffer.alloc(4)
    networkIDBuff.writeUInt32BE(1002, 0)

    const expectedJSON = {
      _typeName: "AddProposalTx",
      _typeID: PlatformVMConstants.ADDPROPOSALTX,
      _codecID: null,
      networkID: serialization.encoder(
        networkIDBuff,
        "hex",
        "Buffer",
        "decimalString"
      ),
      blockchainID: serialization.encoder(
        Buffer.alloc(32, 0),
        "hex",
        "Buffer",
        "cb58"
      ),
      outs: [
        {
          _typeName: "TransferableOutput",
          _typeID: null,
          _codecID: null,
          output: {
            _typeName: "SECPTransferOutput",
            _typeID: 7,
            _codecID: null,
            locktime: "0000000000000000",
            threshold: "00000001",
            addresses: [
              {
                _typeName: "Address",
                _typeID: null,
                _codecID: null,
                bsize: "00000014",
                bytes: "3cb7d3842e8cee6a0ebd09f1fe884f6861e1b29c"
              }
            ],
            amount: "000001d16d53c880"
          },
          assetID:
            "59eb48b8b3a928ca9d6b90a0f3492ab47ebf06e9edc553cfb6bcd2d3f38e319a"
        },
        {
          _typeName: "TransferableOutput",
          _typeID: null,
          _codecID: null,
          output: {
            _typeName: "LockedOut",
            _typeID: 8193,
            _codecID: null,
            output: {
              _typeName: "SECPTransferOutput",
              _typeID: 7,
              _codecID: null,
              locktime: "0000000000000000",
              threshold: "00000001",
              addresses: [
                {
                  _typeName: "Address",
                  _typeID: null,
                  _codecID: null,
                  bsize: "00000014",
                  bytes: "46a9c04f4bf783aa69daabd519dcf36978168b66"
                }
              ],
              amount: "00016bcc41d9bdc0"
            },
            ids: {
              depositTxID:
                "4b302bccad2603281f321406a8bb3f8d70400943c5465e745d9c1a4634c367d0",
              bondTxID:
                "0000000000000000000000000000000000000000000000000000000000000000"
            }
          },
          assetID:
            "59eb48b8b3a928ca9d6b90a0f3492ab47ebf06e9edc553cfb6bcd2d3f38e319a"
        },
        {
          _typeName: "TransferableOutput",
          _typeID: null,
          _codecID: null,
          output: {
            _typeName: "LockedOut",
            _typeID: 8193,
            _codecID: null,
            output: {
              _typeName: "SECPTransferOutput",
              _typeID: 7,
              _codecID: null,
              locktime: "0000000000000000",
              threshold: "00000001",
              addresses: [
                {
                  _typeName: "Address",
                  _typeID: null,
                  _codecID: null,
                  bsize: "00000014",
                  bytes: "46a9c04f4bf783aa69daabd519dcf36978168b66"
                }
              ],
              amount: "000001ba60d33800"
            },
            ids: {
              depositTxID:
                "b61e1ebfa3c0207c1d44181321e82cd8be0e85674a1c4aed1c0102db394b5bf7",
              bondTxID:
                "0000000000000000000000000000000000000000000000000000000000000000"
            }
          },
          assetID:
            "59eb48b8b3a928ca9d6b90a0f3492ab47ebf06e9edc553cfb6bcd2d3f38e319a"
        },
        {
          _typeName: "TransferableOutput",
          _typeID: null,
          _codecID: null,
          output: {
            _typeName: "LockedOut",
            _typeID: 8193,
            _codecID: null,
            output: {
              _typeName: "SECPTransferOutput",
              _typeID: 7,
              _codecID: null,
              locktime: "0000000000000000",
              threshold: "00000001",
              addresses: [
                {
                  _typeName: "Address",
                  _typeID: null,
                  _codecID: null,
                  bsize: "00000014",
                  bytes: "46a9c04f4bf783aa69daabd519dcf36978168b66"
                }
              ],
              amount: "000000174876e800"
            },
            ids: {
              depositTxID:
                "b61e1ebfa3c0207c1d44181321e82cd8be0e85674a1c4aed1c0102db394b5bf7",
              bondTxID:
                "7468697320747820696400000000000000000000000000000000000000000000"
            }
          },
          assetID:
            "59eb48b8b3a928ca9d6b90a0f3492ab47ebf06e9edc553cfb6bcd2d3f38e319a"
        }
      ],
      ins: [
        {
          _typeName: "TransferableInput",
          _typeID: null,
          _codecID: null,
          input: {
            _typeName: "LockedIn",
            _typeID: 8192,
            _codecID: null,
            input: {
              _typeName: "SECPTransferInput",
              _typeID: 5,
              _codecID: null,
              sigIdxs: [
                {
                  _typeName: "SigIdx",
                  _typeID: null,
                  _codecID: null,
                  bsize: "00000004",
                  bytes: "00000000",
                  source: "0000000000000000000000000000000000000000"
                }
              ],
              amount: "00016bcc41e90000"
            },
            ids: {
              depositTxID:
                "4b302bccad2603281f321406a8bb3f8d70400943c5465e745d9c1a4634c367d0",
              bondTxID:
                "0000000000000000000000000000000000000000000000000000000000000000"
            }
          },
          txid: "0903208c79e9d29ad5e5ea7caf771ecca4db7a218c44d7c3619deea62e622764",
          outputidx: "00000001", //TODO: What is the difference betwwen ...000 an ...001
          assetID:
            "59eb48b8b3a928ca9d6b90a0f3492ab47ebf06e9edc553cfb6bcd2d3f38e319a"
        },
        {
          _typeName: "TransferableInput",
          _typeID: null,
          _codecID: null,
          input: {
            _typeName: "LockedIn",
            _typeID: 8192,
            _codecID: null,
            input: {
              _typeName: "SECPTransferInput",
              _typeID: 5,
              _codecID: null,
              sigIdxs: [
                {
                  _typeName: "SigIdx",
                  _typeID: null,
                  _codecID: null,
                  bsize: "00000004",
                  bytes: "00000000",
                  source: "0000000000000000000000000000000000000000"
                }
              ],
              amount: "000001d1a94a2000"
            },
            ids: {
              depositTxID:
                "b61e1ebfa3c0207c1d44181321e82cd8be0e85674a1c4aed1c0102db394b5bf7",
              bondTxID:
                "0000000000000000000000000000000000000000000000000000000000000000"
            }
          },
          txid: "b61e1ebfa3c0207c1d44181321e82cd8be0e85674a1c4aed1c0102db394b5bf7",
          outputidx: "00000000",
          assetID:
            "59eb48b8b3a928ca9d6b90a0f3492ab47ebf06e9edc553cfb6bcd2d3f38e319a"
        },
        {
          _typeName: "TransferableInput",
          _typeID: null,
          _codecID: null,
          input: {
            _typeName: "SECPTransferInput",
            _typeID: 5,
            _codecID: null,
            sigIdxs: [
              {
                _typeName: "SigIdx",
                _typeID: null,
                _codecID: null,
                bsize: "00000004",
                bytes: "00000000",
                source: "0000000000000000000000000000000000000000"
              }
            ],
            amount: "000001d16d630ac0"
          },
          txid: "eae3599c6b10d63a2021c58e606d64a7e6f5b41f74001066147e4254bbc031a4",
          outputidx: "00000000",
          assetID:
            "59eb48b8b3a928ca9d6b90a0f3492ab47ebf06e9edc553cfb6bcd2d3f38e319a"
        }
      ],
      memo: serialization
        .typeToBuffer(bintools.cb58Encode(Buffer.alloc(20)), "cb58")
        .toString("hex"),
      proposalDescription: serialization.encoder(
        new Buffer("hello world"),
        "hex",
        "Buffer",
        "hex"
      ),
      proposalPayload: {
        //optionIndex: "00000000",
        proposal: {
          end: "0000000066a5566d",
          start: "0000000066a3b08d",
          mostVotedThresholdNominator: "0000000000000002", //
          totalVotedThresholdNominator: "0000000000000001",
          allowEarlyFinish: true,
          options: [
            {
              //_codecID: null,
              //_typeID: null,
              //_typeName: "GeneralVoteOption",
              //assetID:
              //"59eb48b8b3a928ca9d6b90a0f3492ab47ebf06e9edc553cfb6bcd2d3f38e319a",
              option: serialization.encoder(
                Buffer.from(
                  "THIS STRING IS 256 CHARACTERS xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                ),
                "hex",
                "Buffer",
                "hex"
              )
            },
            {
              //_codecID: null,
              //_typeID: null,
              //_typeName: "GeneralVoteOption",
              option: serialization.encoder(
                Buffer.from(
                  "THIS STRING IS 256 CHARACTERS yxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                ),
                "hex",
                "Buffer",
                "hex"
              )
            },
            {
              //_codecID: null,
              //_typeID: null,
              //_typeName: "GeneralVoteOption",
              option: serialization.encoder(
                Buffer.from(
                  "THIS STRING IS 256 CHARACTERS zxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                ),
                "hex",
                "Buffer",
                "hex"
              )
            }
          ]
        }
      },
      proposerAddress: "46a9c04f4bf783aa69daabd519dcf36978168b66",
      proposerAuth: {
        _codecID: null,
        _typeID: 10,
        _typeName: "SubnetAuth"
      }
    }
    expect(serializedAddProposalTx).toStrictEqual(expectedJSON)
  })

  test("toBuffer and fromBuffer", async (): Promise<void> => {
    const buf: Buffer = addProposalTx.toBuffer()
    const adpTx: AddProposalTx = new AddProposalTx()
    adpTx.fromBuffer(buf)
    const buf2: Buffer = adpTx.toBuffer()

    //expect(buf).toStrictEqual(buf2)
    expect(buf.toString("hex")).toStrictEqual(buf2.toString("hex"))
  })
})

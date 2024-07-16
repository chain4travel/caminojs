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
    expect(serializedAddressStateTx).toStrictEqual(expectedJSON)
  })
})

describe("AddMemberProposalTx", (): void => {
  const bintools = BinTools.getInstance()
  const serialization = Serialization.getInstance()
  const addProposalTxHex: string =
    "000000002010000003ea00000000000000000000000000000000000000000000000000000000000000000000000159eb48b8b3a928ca9d6b90a0f3492ab47ebf06e9edc553cfb6bcd2d3f38e319a00000007000002b55c7c83000000000000000000000000010000000146a9c04f4bf783aa69daabd519dcf36978168b66000000014c8fabc9807bdfb520f713ea3ea915e4b1201addfcfaef6925705522e92a3e3f0000000059eb48b8b3a928ca9d6b90a0f3492ab47ebf06e9edc553cfb6bcd2d3f38e319a00000005000002b55c8bc5400000000100000000000000000000001b3c703e70726f706f73616c206465736372697074696f6e3c2f703e0000002a00000000201659f116d65aceba6d22cc557e8f3ee17e22c7757d00000000665f9c700000000066aeb67046a9c04f4bf783aa69daabd519dcf36978168b660000000a00000001000000000000000200000009000000016f181711aa627ada6b026b0a5e10275a92b3985f5ef8d9db20faf659cc96f3e07b6cee8a9d2aab012c9244e8a642fdc2b4e8b685af059e312964892f8421a8700100000009000000016f181711aa627ada6b026b0a5e10275a92b3985f5ef8d9db20faf659cc96f3e07b6cee8a9d2aab012c9244e8a642fdc2b4e8b685af059e312964892f8421a87001115acab2"
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
    const proposalTypeID = PlatformVMConstants.ADDMEMBERPORPOSAL_TYPE_ID
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
          applicantAddress: "59f116d65aceba6d22cc557e8f3ee17e22c7757d",
          end: "0000000066aeb670",
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
    expect(serializedAddressStateTx).toStrictEqual(expectedJSON)
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
    expect(serializedAddressStateTx).toStrictEqual(expectedJSON)
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
    expect(serializedAddressStateTx).toStrictEqual(expectedJSON)
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
    expect(serializedAddressStateTx).toStrictEqual(expectedJSON)
  })
})

describe("NewProposalTx", (): void => {
  const bintools = BinTools.getInstance()
  const serialization = Serialization.getInstance()
  const addProposalTxHex: string =
    //"000000002010000003ea00000000000000000000000000000000000000000000000000000000000000000000000159eb48b8b3a928ca9d6b90a0f3492ab47ebf06e9edc553cfb6bcd2d3f38e319a0000000700016bcc41ca7b80000000000000000000000001000000013cb7d3842e8cee6a0ebd09f1fe884f6861e1b29c0000000111a783ed74c16f2d70bf950b358b0e4e3175638c8a8c61d06682df9cd940640d0000000059eb48b8b3a928ca9d6b90a0f3492ab47ebf06e9edc553cfb6bcd2d3f38e319a0000000500016bcc41d9bdc000000001000000000000001400000000000000000000000000000000000000000000000d000b68656c6c6f20776f726c640000002100000000201a0001310000000000000000000000006697ab300000000066e6c5303cb7d3842e8cee6a0ebd09f1fe884f6861e1b29c0000000a000000010000000000000002000000090000000147c2c57deedfec35f79c4b3b6a5532bfeadde30a39829fd3a1ab3762635125f120da51845e03b693a83f212b1ac176cf91624cadfd89ea819898184822f6ba6c00000000090000000147c2c57deedfec35f79c4b3b6a5532bfeadde30a39829fd3a1ab3762635125f120da51845e03b693a83f212b1ac176cf91624cadfd89ea819898184822f6ba6c008960854d"
    //"000000002010000003ea00000000000000000000000000000000000000000000000000000000000000000000000159eb48b8b3a928ca9d6b90a0f3492ab47ebf06e9edc553cfb6bcd2d3f38e319a0000000700016bcc41ca7b80000000000000000000000001000000013cb7d3842e8cee6a0ebd09f1fe884f6861e1b29c0000000111a783ed74c16f2d70bf950b358b0e4e3175638c8a8c61d06682df9cd940640d0000000059eb48b8b3a928ca9d6b90a0f3492ab47ebf06e9edc553cfb6bcd2d3f38e319a0000000500016bcc41d9bdc000000001000000000000001400000000000000000000000000000000000000000000000d000b68656c6c6f20776f726c640000002100000000201a0001310000000000000000000000006697ba240000000066e6d4243cb7d3842e8cee6a0ebd09f1fe884f6861e1b29c0000000a00000001000000000000000200000009000000017b1015631576cbc04082d13136ed4793fe0e106aa9b4a13a737dfa2c351b94be445173db5bde35a2f57361edaa53827a0782ca89e3bb49b5a3f8e182432a94a40100000009000000017b1015631576cbc04082d13136ed4793fe0e106aa9b4a13a737dfa2c351b94be445173db5bde35a2f57361edaa53827a0782ca89e3bb49b5a3f8e182432a94a40119ba045d"
    //"000000002010000003ea00000000000000000000000000000000000000000000000000000000000000000000000159eb48b8b3a928ca9d6b90a0f3492ab47ebf06e9edc553cfb6bcd2d3f38e319a0000000700016bcc41ca7b80000000000000000000000001000000013cb7d3842e8cee6a0ebd09f1fe884f6861e1b29c0000000111a783ed74c16f2d70bf950b358b0e4e3175638c8a8c61d06682df9cd940640d0000000059eb48b8b3a928ca9d6b90a0f3492ab47ebf06e9edc553cfb6bcd2d3f38e319a0000000500016bcc41d9bdc000000001000000000000001400000000000000000000000000000000000000000000000d000b68656c6c6f20776f726c640000002100000000201a0001310000000000000000000000006697bb010000000066e6d5013cb7d3842e8cee6a0ebd09f1fe884f6861e1b29c0000000a00000001000000000000000200000009000000016f0468042183ee15baa46f5caf3915892a18226299b8cc2b88c90ecbf9bcc3f011e7b69324ac87b90cc998e6b1c7c0e16080e61b08302db7e30a77214194d9960100000009000000016f0468042183ee15baa46f5caf3915892a18226299b8cc2b88c90ecbf9bcc3f011e7b69324ac87b90cc998e6b1c7c0e16080e61b08302db7e30a77214194d9960111805377"
    //"000000002010000003ea00000000000000000000000000000000000000000000000000000000000000000000000159eb48b8b3a928ca9d6b90a0f3492ab47ebf06e9edc553cfb6bcd2d3f38e319a0000000700016bcc41ca7b80000000000000000000000001000000013cb7d3842e8cee6a0ebd09f1fe884f6861e1b29c0000000111a783ed74c16f2d70bf950b358b0e4e3175638c8a8c61d06682df9cd940640d0000000059eb48b8b3a928ca9d6b90a0f3492ab47ebf06e9edc553cfb6bcd2d3f38e319a0000000500016bcc41d9bdc000000001000000000000001400000000000000000000000000000000000000000000000d000b68656c6c6f20776f726c640000002100000000201a0001310000000000000000000000006697bbf60000000066e6d5f63cb7d3842e8cee6a0ebd09f1fe884f6861e1b29c0000000a00000001000000000000000200000009000000019555f38051121e261934dad5dcb9efa3039e2545d64d612fb17a305663933cb062ad7d2fba496a2e9a8529dfdcd756cb39280d2022913ad8b254c579990945cf0100000009000000019555f38051121e261934dad5dcb9efa3039e2545d64d612fb17a305663933cb062ad7d2fba496a2e9a8529dfdcd756cb39280d2022913ad8b254c579990945cf017b948ffb"
    //"000000002010000003ea00000000000000000000000000000000000000000000000000000000000000000000000159eb48b8b3a928ca9d6b90a0f3492ab47ebf06e9edc553cfb6bcd2d3f38e319a0000000700016bcc41ca7b80000000000000000000000001000000013cb7d3842e8cee6a0ebd09f1fe884f6861e1b29c0000000111a783ed74c16f2d70bf950b358b0e4e3175638c8a8c61d06682df9cd940640d0000000059eb48b8b3a928ca9d6b90a0f3492ab47ebf06e9edc553cfb6bcd2d3f38e319a0000000500016bcc41d9bdc000000001000000000000001400000000000000000000000000000000000000000000000d000b68656c6c6f20776f726c640000002100000000201a0001310000000000000000000000006697bf420000000066e6d9423cb7d3842e8cee6a0ebd09f1fe884f6861e1b29c0000000a0000000100000000000000020000000900000001034397b35f6f7ee467312cc293f6609341cc41d8c28d625b5e1ebc2c0f0b6901211b5155c8da7c82e6ac765c4b4316d4824238cfd56d4040ade98b7b5ec7d000000000000900000001034397b35f6f7ee467312cc293f6609341cc41d8c28d625b5e1ebc2c0f0b6901211b5155c8da7c82e6ac765c4b4316d4824238cfd56d4040ade98b7b5ec7d00000b2f2c0d1"
    "000000002010000003ea00000000000000000000000000000000000000000000000000000000000000000000000159eb48b8b3a928ca9d6b90a0f3492ab47ebf06e9edc553cfb6bcd2d3f38e319a0000000700016bcc41ca7b80000000000000000000000001000000013cb7d3842e8cee6a0ebd09f1fe884f6861e1b29c0000000111a783ed74c16f2d70bf950b358b0e4e3175638c8a8c61d06682df9cd940640d0000000059eb48b8b3a928ca9d6b90a0f3492ab47ebf06e9edc553cfb6bcd2d3f38e319a0000000500016bcc41d9bdc000000001000000000000001400000000000000000000000000000000000000000000000d000b68656c6c6f20776f726c640000001900000000201a000131000000006697cc670000000066e6e6673cb7d3842e8cee6a0ebd09f1fe884f6861e1b29c0000000a0000000100000000000000020000000900000001fa1c940ea4a3093579c9426ca0a3d86b97b9dd3ca0a53132a123d4a8c8e88b3871c486a55aaadca0759a8cfd24a1277c9f4bdc577db19754ffee4ab4ab26fbf1000000000900000001fa1c940ea4a3093579c9426ca0a3d86b97b9dd3ca0a53132a123d4a8c8e88b3871c486a55aaadca0759a8cfd24a1277c9f4bdc577db19754ffee4ab4ab26fbf100989cffae"
  const unsignedTx: UnsignedTx = new UnsignedTx()
  unsignedTx.fromBuffer(Buffer.from(addProposalTxHex, "hex"))
  console.log("end")
  /*const addProposalTx = unsignedTx.getTransaction() as AddProposalTx

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
      "P-kopernikus18jma8ppw3nhx5r4ap8clazz0dps7rv5uuvjh68"
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
    const asvTx: AddProposalTx = new AddProposalTx()
    asvTx.fromBuffer(buf)
    const buf2: Buffer = asvTx.toBuffer()
    expect(buf.toString("hex")).toBe(buf2.toString("hex"))
  })*/
})

/*
xdescribe("GeneralProposal", (): void => {
  const bintools = BinTools.getInstance()
  const serialization = Serialization.getInstance()
  const addProposalTxHex: string =
    "000003ea00000000000000000000000000000000000000000000000000000000000000000000000159eb48b8b3a928ca9d6b90a0f3492ab47ebf06e9edc553cfb6bcd2d3f38e319a0000000700016bcc41ca7b80000000000000000000000001000000013cb7d3842e8cee6a0ebd09f1fe884f6861e1b29c0000000111a783ed74c16f2d70bf950b358b0e4e3175638c8a8c61d06682df9cd940640d0000000059eb48b8b3a928ca9d6b90a0f3492ab47ebf06e9edc553cfb6bcd2d3f38e319a0000000500016bcc41d9bdc000000001000000000000001400000000000000000000000000000000000000000000000d000b68656c6c6f20776f726c6400000056000000002019000000000000201900000000669664280000000066e57e2800000001000000000000000100000000006c69206c61206c6f6c61206c69206c6f6c6f206c69206c616c61206c69206c30000000000000003cb7d3842e8cee6a0ebd09f1fe884f6861e1b29c0000000a00000001000000001a7941a1"
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
    const proposalTypeID = PlatformVMConstants.GENERALPROPOSAL_TYPE_ID
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
    const asvTx: AddProposalTx = new AddProposalTx()
    asvTx.fromBuffer(buf)
    const buf2: Buffer = asvTx.toBuffer()
    expect(buf.toString("hex")).toBe(buf2.toString("hex"))
  })

  test("serialize", async (): Promise<void> => {
    const serializedAddressStateTx: object = addProposalTx.serialize()
    const networkIDBuff = Buffer.alloc(4)
    networkIDBuff.writeUInt32BE(1002, 0)
    //WIP:
    /!*
    const expectedJSON = {
      _codecID: null,
      _typeID: PlatformVMConstants.GENERALPROPOSAL_TYPE_ID,
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
      ins: [],
      outs: [],
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
    expect(serializedAddressStateTx).toStrictEqual(expectedJSON)*!/
  })
})
*/

import { Buffer } from "buffer/"
import {
  PlatformVMConstants,
} from "src/apis/platformvm"
import { AddProposalTx } from "src/apis/platformvm/addproposaltx"
import { BinTools } from "../../../src"
import { Serialization } from "../../../src/utils"
import { AddMemberProposal, AdminProposal } from "../../../src/apis/platformvm"

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

describe("AddMemberProposalTx", (): void => {
  const bintools = BinTools.getInstance()
  const serialization = Serialization.getInstance()
  const addProposalTxHex: string =
    "000003ea0000000000000000000000000000000000000000000000000000000000000000000000015e21ded8a9e53a62f6c48ef045b37c938c5c5e9b25a14b4987db93682ca30f7600000007000000e8d495cdc0000000000000000000000001000000014ac77d43e4526f5b1c62ab9c1d3e52ab52d5a1460000000169f5f810578f25fb63926f30730c6d52a3c43f246978ffd8e3d9caf183c04114000000115e21ded8a9e53a62f6c48ef045b37c938c5c5e9b25a14b4987db93682ca30f7600000005000000e8d4a510000000000100000000000000000000002a00000000201646a9c04f4bf783aa69daabd519dcf36978168b660000000065572ee200000000656069624ac77d43e4526f5b1c62ab9c1d3e52ab52d5a1460000000a0000000100000000000000020000000900000001a9fb6553dcc623f3d5dc65319871357e4bcaa695b7f17bcb79a9e7a457007a03011b47baa8309125befa03bda3d4aeaf8525d04771c8b97dd2d19b3bcaaca911000000000900000001a9fb6553dcc623f3d5dc65319871357e4bcaa695b7f17bcb79a9e7a457007a03011b47baa8309125befa03bda3d4aeaf8525d04771c8b97dd2d19b3bcaaca91100a77ce851"
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
      "P-kopernikus1ftrh6sly2fh4k8rz4wwp60jj4dfdtg2xv3unrj",
    )
    const address: Buffer = addProposalTx.getProposerAddress()
    expect(address.toString()).toBe(expectedAddress.toString())
  })

  test("getProposalType", async (): Promise<void> => {
    const proposalTypeID = PlatformVMConstants.ADDMEMBERPORPOSAL_TYPE_ID;
    const payload = addProposalTx.getProposalPayload();
    expect(payload.getProposalType()).toBe(proposalTypeID)
    const proposal = payload.getProposal();
    expect(proposal.getTypeID()).toBe(proposalTypeID)
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
          assetID: "5e21ded8a9e53a62f6c48ef045b37c938c5c5e9b25a14b4987db93682ca30f76",
          input: {
            _codecID: null,
            _typeID: 5,
            _typeName: "SECPTransferInput",
            amount: "000000e8d4a51000",
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
          outputidx: "00000011",
          txid: "69f5f810578f25fb63926f30730c6d52a3c43f246978ffd8e3d9caf183c04114",
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
                bytes: "4ac77d43e4526f5b1c62ab9c1d3e52ab52d5a146",
              },
            ],
            amount: "000000e8d495cdc0",
            locktime: "0000000000000000",
            threshold: "00000001",
          },
        }
      ],
      proposalPayload: {
        proposal: {
          applicantAddress: "46a9c04f4bf783aa69daabd519dcf36978168b66",
          end: "0000000065606962",
          start: "0000000065572ee2",
        },
      },
      proposerAddress: "4ac77d43e4526f5b1c62ab9c1d3e52ab52d5a146",
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
    "000003ea0000000000000000000000000000000000000000000000000000000000000000000000015e21ded8a9e53a62f6c48ef045b37c938c5c5e9b25a14b4987db93682ca30f7600000007000000e8d495cdc0000000000000000000000001000000014ac77d43e4526f5b1c62ab9c1d3e52ab52d5a1460000000169f5f810578f25fb63926f30730c6d52a3c43f246978ffd8e3d9caf183c04114000000115e21ded8a9e53a62f6c48ef045b37c938c5c5e9b25a14b4987db93682ca30f7600000005000000e8d4a5100000000001000000000000000000000032000000002017000000000000201646a9c04f4bf783aa69daabd519dcf36978168b660000000065644d7a0000000065b3677a4ac77d43e4526f5b1c62ab9c1d3e52ab52d5a1460000000a0000000100000000000000020000000900000001a553fbd197cbee6e27812d11d81158bd4688b24ebb6f2c57a4c49eac40ee61de2a66b9fe15deb1aba5f4f3af4007365c08c1a70e6988f853dba3ded07cfcb451010000000900000001a553fbd197cbee6e27812d11d81158bd4688b24ebb6f2c57a4c49eac40ee61de2a66b9fe15deb1aba5f4f3af4007365c08c1a70e6988f853dba3ded07cfcb45101219121ff"
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
      "P-kopernikus1ftrh6sly2fh4k8rz4wwp60jj4dfdtg2xv3unrj",
    )
    const address: Buffer = addProposalTx.getProposerAddress()
    expect(address.toString()).toBe(expectedAddress.toString())
  })

  test("getProposalType", async (): Promise<void> => {
    const proposalTypeID = PlatformVMConstants.ADMINPROPOSAL_TYPE_ID;
    const payload = addProposalTx.getProposalPayload();
    expect(payload.getProposalType()).toBe(proposalTypeID)
    const adminProposal = payload.getProposal();
    expect(adminProposal.getTypeID()).toBe(proposalTypeID)
    console.log('adminProposal: ', adminProposal)
    const execProposalTypeID = PlatformVMConstants.ADDMEMBERPORPOSAL_TYPE_ID
    const execProposal = (adminProposal as AdminProposal).getProposal()
    expect(execProposal.getTypeID()).toBe(execProposalTypeID)
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
          assetID: "5e21ded8a9e53a62f6c48ef045b37c938c5c5e9b25a14b4987db93682ca30f76",
          input: {
            _codecID: null,
            _typeID: 5,
            _typeName: "SECPTransferInput",
            amount: "000000e8d4a51000",
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
          outputidx: "00000011",
          txid: "69f5f810578f25fb63926f30730c6d52a3c43f246978ffd8e3d9caf183c04114",
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
                bytes: "4ac77d43e4526f5b1c62ab9c1d3e52ab52d5a146",
              },
            ],
            amount: "000000e8d495cdc0",
            locktime: "0000000000000000",
            threshold: "00000001",
          },
        }
      ],
      proposalPayload: {
        proposal: {
          optionIndex: "00000000",
          proposal: {
            applicantAddress: "46a9c04f4bf783aa69daabd519dcf36978168b66",
            end: "0000000065b3677a",
            start: "0000000065644d7a",
          }
        },
      },
      proposerAddress: "4ac77d43e4526f5b1c62ab9c1d3e52ab52d5a146",
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
    "000003ea0000000000000000000000000000000000000000000000000000000000000000000000015e21ded8a9e53a62f6c48ef045b37c938c5c5e9b25a14b4987db93682ca30f7600000007000000e8d495cdc0000000000000000000000001000000014ac77d43e4526f5b1c62ab9c1d3e52ab52d5a1460000000169f5f810578f25fb63926f30730c6d52a3c43f246978ffd8e3d9caf183c04114000000115e21ded8a9e53a62f6c48ef045b37c938c5c5e9b25a14b4987db93682ca30f7600000005000000e8d4a5100000000001000000000000000000000032000000002017000000000000201846a9c04f4bf783aa69daabd519dcf36978168b660000000065644dd800000000656d88584ac77d43e4526f5b1c62ab9c1d3e52ab52d5a1460000000a000000010000000000000002000000090000000124496103c6d3624d9be5de0c84f0582a013c94d63142d9ba2aa9530b1a0a9fef7ca66c6a486c16277afd8a8e1a5f91f92acee334aa6347e44482065c6185b55401000000090000000124496103c6d3624d9be5de0c84f0582a013c94d63142d9ba2aa9530b1a0a9fef7ca66c6a486c16277afd8a8e1a5f91f92acee334aa6347e44482065c6185b554011ce13974"
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
      "P-kopernikus1ftrh6sly2fh4k8rz4wwp60jj4dfdtg2xv3unrj",
    )
    const address: Buffer = addProposalTx.getProposerAddress()
    expect(address.toString()).toBe(expectedAddress.toString())
  })

  test("getProposalType", async (): Promise<void> => {
    const proposalTypeID = PlatformVMConstants.ADMINPROPOSAL_TYPE_ID;
    const payload = addProposalTx.getProposalPayload();
    expect(payload.getProposalType()).toBe(proposalTypeID)
    const adminProposal = payload.getProposal();
    expect(adminProposal.getTypeID()).toBe(proposalTypeID)
    console.log('adminProposal: ', adminProposal)
    const execProposalTypeID = PlatformVMConstants.EXCLUDEMEMBERPORPOSAL_TYPE_ID
    const execProposal = (adminProposal as AdminProposal).getProposal()
    expect(execProposal.getTypeID()).toBe(execProposalTypeID)
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
          assetID: "5e21ded8a9e53a62f6c48ef045b37c938c5c5e9b25a14b4987db93682ca30f76",
          input: {
            _codecID: null,
            _typeID: 5,
            _typeName: "SECPTransferInput",
            amount: "000000e8d4a51000",
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
          outputidx: "00000011",
          txid: "69f5f810578f25fb63926f30730c6d52a3c43f246978ffd8e3d9caf183c04114",
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
                bytes: "4ac77d43e4526f5b1c62ab9c1d3e52ab52d5a146",
              },
            ],
            amount: "000000e8d495cdc0",
            locktime: "0000000000000000",
            threshold: "00000001",
          },
        }
      ],
      proposalPayload: {
        proposal: {
          optionIndex: "00000000",
          proposal: {
            memberAddress: "46a9c04f4bf783aa69daabd519dcf36978168b66",
            end: "00000000656d8858",
            start: "0000000065644dd8",
          }
        },
      },
      proposerAddress: "4ac77d43e4526f5b1c62ab9c1d3e52ab52d5a146",
      proposerAuth: {
        _codecID: null,
        _typeID: 10,
        _typeName: "SubnetAuth"
      }
    }
    expect(serializedAddressStateTx).toStrictEqual(expectedJSON)
  })
})
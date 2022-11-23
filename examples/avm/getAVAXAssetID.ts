import { Avalanche, Buffer } from "@c4tplatform/caminojs/dist"
import { AVMAPI } from "@c4tplatform/caminojs/dist/apis/avm"
import { ExamplesConfig } from "../common/examplesConfig"

const config: ExamplesConfig = require("../common/examplesConfig.json")
const avalanche: Avalanche = new Avalanche(
  config.host,
  config.port,
  config.protocol,
  config.networkID
)
const xchain: AVMAPI = avalanche.XChain()

const main = async (): Promise<any> => {
  const assetID: Buffer = await xchain.getAVAXAssetID()
  console.log(assetID)
}

main()

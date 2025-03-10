import { Avalanche } from "caminojs/index"
import { AdminAPI } from "caminojs/apis/admin"
import { ExamplesConfig } from "../common/examplesConfig"

const config: ExamplesConfig = require("../common/examplesConfig.json")
const avalanche: Avalanche = new Avalanche(
  config.host,
  config.port,
  config.protocol,
  config.networkID
)
const admin: AdminAPI = avalanche.Admin()

const main = async (): Promise<any> => {
  const blockchain: string = "X"
  const alias: string = "xchain"
  const successful: boolean = await admin.aliasChain(blockchain, alias)
  console.log(successful)
}

main()

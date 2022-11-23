import { Avalanche, BN } from "@c4tplatform/caminojs/dist"
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
  const defaultTxFee: BN = xchain.getDefaultTxFee()
  console.log(defaultTxFee.toString())
}

main()

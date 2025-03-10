import { Avalanche, BN } from "caminojs/index"
import { AVMAPI } from "caminojs/apis/avm"
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
  const txFee: BN = xchain.getDefaultCreationTxFee()
  console.log(txFee)
}

main()

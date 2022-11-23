import { Avalanche } from "@c4tplatform/caminojs/dist"
import { EVMAPI } from "@c4tplatform/caminojs/dist/apis/evm"
import { ExamplesConfig } from "../common/examplesConfig"

const config: ExamplesConfig = require("../common/examplesConfig.json")
const avalanche: Avalanche = new Avalanche(
  config.host,
  config.port,
  config.protocol,
  config.networkID
)
let cchain: EVMAPI

const InitAvalanche = async () => {
  await avalanche.fetchNetworkSettings()
  cchain = avalanche.CChain()
}

const main = async (): Promise<any> => {
  await InitAvalanche()
  const maxPriorityFeePerGas: string = await cchain.getMaxPriorityFeePerGas()
  console.log(maxPriorityFeePerGas)
}

main()

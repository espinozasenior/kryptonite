import _ from "lodash"
import { prismaClient } from "./../db";
// https://chainlist.org/chain/56

let NETWORKS = [
  {
    id: "clazehtoy0002p21p0zii6vrr",
    chainId: 5,
    name: "Goerli",
    symbol: "GoerliETH",
    rpc: "https://goerli.infura.io/v3/e0cc422e983d412d9f4d5982e15d11c4",
  },
  {
    id: "clazef6wl0000p21pj45efi1a",
    chainId: 1,
    name: "ethereum",
    symbol: "ETH",
    rpc: "https://mainnet.infura.io/v3/e0cc422e983d412d9f4d5982e15d11c4",
  },
  {
    id: "clazfexl70008p21ppyjnz2yn",
    chainId: 10,
    name: "optimism",
    symbol: "ETH",
    rpc: "https://mainnet.optimism.io",
  },
  {
    id: "clazeuf4k0004p21pb028fcup",
    chainId: 56,
    name: "bsc",
    symbol: "BNB",
    rpc: "https://bsc-dataseed2.ninicoin.io",
  },
  {
    id: "clazfbgfk0006p21p2h6hluqz",
    chainId: 137,
    name: "polygon",
    symbol: "MATIC",
    rpc: "https://rpc-mainnet.matic.network",
  },
  {
    id: "clazfgy2x000ap21pzpg9uecs",
    chainId: 42161,
    name: "arbitrum",
    symbol: "ETH",
    rpc: "https://arb1.arbitrum.io/rpc",
  },
]

export const UpdateNetowrks = async (): Promise<Array<any>> => {
  const prisma = await prismaClient();
  const networks = await prisma.network.findMany();
  NETWORKS = networks
  return networks
};

export const GetRpcURLByChainID = (chainID: number): string => {
  const network = _.find(NETWORKS, { 'chainId': chainID })
  return network?.rpc as string;
};

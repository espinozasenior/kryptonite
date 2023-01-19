import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const ethereum = await prisma.network.upsert({
    where: { chainId: 1 },
    update: {},
    create: {
      chainId: 1,
      name: 'ethereum',
      symbol: "ETH",
      rpc: "https://eth-mainnet.nodereal.io/v1/1659dfb40aa24bbb8153a677b98064d7"
    },
  })
  const optimism = await prisma.network.upsert({
    where: { chainId: 10 },
    update: {},
    create: {
      chainId: 10,
      name: 'optimism',
      symbol: "ETH",
      rpc: "https://mainnet.optimism.io"
    },
  })
  const bsc = await prisma.network.upsert({
    where: { chainId: 56 },
    update: {},
    create: {
      chainId: 56,
      name: 'bsc',
      symbol: "BNB",
      rpc: "https://rpc.ankr.com/bsc"
    },
  })
  const polygon = await prisma.network.upsert({
    where: { chainId: 137 },
    update: {},
    create: {
      chainId: 137,
      name: 'polygon',
      symbol: "MATIC",
      rpc: "https://rpc-mainnet.matic.network"
    },
  })
  const arbitrum = await prisma.network.upsert({
    where: { chainId: 42161 },
    update: {},
    create: {
      chainId: 42161,
      name: 'arbitrum',
      symbol: "ETH",
      rpc: "https://rpc.ankr.com/arbitrum"
    },
  })
  const espinozasenior = await prisma.user.upsert({
    where: { email: 'espinozasenior@gmail.com' },
    update: {},
    create: {
      email: 'espinozasenior@gmail.com',
      username: 'espinozasenior',
      tokens: {
        create: [
            {
                networkId: ethereum.id,
                name: "Yieldification",
                decimals: 18,
                symbol: "YDF",
                address: "0x30dcBa0405004cF124045793E1933C798Af9E66a",
                logoUri: "https://assets.coingecko.com/coins/images/26699/large/logo.png",
                buySlippage: 1,
                sellSlippage: 1
            },
            {
                networkId: ethereum.id,
                name: "Veracity",
                decimals: 18,
                symbol: "VRA",
                address: "0xF411903cbC70a74d22900a5DE66A2dda66507255",
                logoUri: "https://assets.coingecko.com/coins/images/14025/large/VRA.jpg",
                buySlippage: 1,
                sellSlippage: 1
            },
            {
                networkId: ethereum.id,
                name: "White Ethereum",
                decimals: 18,
                symbol: "WHITE_ETH",
                address: "0xFe4BEb9217cdDf2422d4bd65449b76d807b30fe1",
                logoUri: "https://assets.coingecko.com/coins/images/26667/large/IMG_2923.PNG",
                buySlippage: 4,
                sellSlippage: 4
            }    
        ]
      },
    },
  }) 
}
main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
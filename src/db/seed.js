"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const ethereum = yield prisma.network.upsert({
            where: { chainId: 1 },
            update: {},
            create: {
                chainId: 1,
                name: 'ethereum',
                symbol: "ETH",
                rpc: "https://eth-mainnet.nodereal.io/v1/1659dfb40aa24bbb8153a677b98064d7"
            },
        });
        const optimism = yield prisma.network.upsert({
            where: { chainId: 10 },
            update: {},
            create: {
                chainId: 10,
                name: 'optimism',
                symbol: "ETH",
                rpc: "https://mainnet.optimism.io"
            },
        });
        const bsc = yield prisma.network.upsert({
            where: { chainId: 56 },
            update: {},
            create: {
                chainId: 56,
                name: 'bsc',
                symbol: "BNB",
                rpc: "https://rpc.ankr.com/bsc"
            },
        });
        const polygon = yield prisma.network.upsert({
            where: { chainId: 137 },
            update: {},
            create: {
                chainId: 137,
                name: 'polygon',
                symbol: "MATIC",
                rpc: "https://rpc-mainnet.matic.network"
            },
        });
        const arbitrum = yield prisma.network.upsert({
            where: { chainId: 42161 },
            update: {},
            create: {
                chainId: 42161,
                name: 'arbitrum',
                symbol: "ETH",
                rpc: "https://rpc.ankr.com/arbitrum"
            },
        });
        const espinozasenior = yield prisma.user.upsert({
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
        });
    });
}
main()
    .then(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
}))
    .catch((e) => __awaiter(void 0, void 0, void 0, function* () {
    console.error(e);
    yield prisma.$disconnect();
    process.exit(1);
}));

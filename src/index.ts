require("dotenv").config();
import { Args } from "./utils/flags";
import Telegram from "./api/telegram";
import { Wait } from "./utils/wait";
import { UpdateNetowrks } from "./networks";
import { Wallet } from "./api/wallet";
import { Router } from "./api/oneinch";
import { InitNgRok } from "./utils/ngrok";
import { Alternative } from "./api/alternative";
import { DexScreener } from "./api/dexscreener";
import { Chain } from "./utils/chain";
import { Forever } from "./utils/forever";
import { PrepareForSwap } from "./utils/prepare";
import { prismaClient } from "./db";
import Web3 from "web3";
import _ from "lodash"
const ODT = require("operational-decision-tree");

process.on("uncaughtException", async (error) => {
  console.error(error);
  try {
    await Forever(async () => {
      await Telegram.SendMessage(
        Args.botToken,
        Args.chatId,
        "Uncaught Exception"
      );
    }, 2);
  } catch (error) {
    console.error(error);
  } finally {
    process.exit(1);
  }
});

process.on("unhandledRejection", async (error) => {
  console.error(error);
  try {
    await Forever(async () => {
      await Telegram.SendMessage(
        Args.botToken,
        Args.chatId,
        "Unhandled Rejection"
      );
    }, 2);
  } catch (error) {
    console.error(error);
  } finally {
    process.exit(1);
  }
});

const START_TIME = new Date().getTime();

(async () => {
  try {
    // ====== BEGIN (Main Steps) ======= //
    // Update network's sources
    const net = await UpdateNetowrks()
    
    let routerAddress = "";
    let tokens: any[] = [];
    let ngRokURL = "";
    let stableTokenBalance = Web3.utils.toBN(0);
    let targetTokenBalance = Web3.utils.toBN(0);
    let stableTokenCurrentPrice = 0;
    let targetTokenCurrentPrice = 0;
    let currentStatus = "";
    let signal = "";
    let chainName = "";
    let wbtcPrice = 0;

    const wallet = new Wallet(Args.publicKey, Args.privateKey, Args.chainId);
    const router = new Router(Args.chainId, Args.oneinchHostname);
    const db = await prismaClient();
    const myToken = await db.token.findUnique({
      where: {
        address: Args.targetTokenAddress
      },
      include: {
        orders: true,
      }
    })
    console.log(myToken?.symbol)
    await Forever(async () => {
      routerAddress = await router.GetContractAddress();
      tokens = await router.GetSupportedTokens();
    }, 2);

    await Forever(async () => {
      ngRokURL = await InitNgRok(Args.port);
      console.log(`ngrok tunnel running at: ${ngRokURL}`);
    }, 2);

    await Forever(async () => {
      await Telegram.SetWebhook(Args.botToken, ngRokURL);
    }, 2);

    const stableTokenContractAddress =
      tokens.find((token) => token.symbol === Args.stableToken)?.address || "";
    const stableTokenContractDecimals =
      tokens.find((token) => token.symbol === Args.stableToken)?.decimals || 0;
    // const targetTokenContractAddress =
    //   tokens.find((token) => token.symbol === Args.targetToken)?.address || "";
    const targetTokenContractAddress = Args.targetTokenAddress
    if (
      stableTokenContractAddress === "" ||
      targetTokenContractAddress === ""
    ) {
      throw "Token Contract Address cannot be empty";
    }

    await Forever(async () => {
      stableTokenBalance = await wallet.GetTokenBalance(
        stableTokenContractAddress
      );
      targetTokenBalance = await wallet.GetTokenBalance(
        targetTokenContractAddress
      );
    }, 2);

    await Forever(async () => {
      chainName = await Chain(Args.chainId)
    }, 2);


    // ====== END (Main Steps) ======= //

    // ====== BEGIN (Loop) ======= //
    while (true) {
      const start = new Date().getTime();
      console.log(`\n\n${new Date()}\n`);
      console.log(`Wallet Address: ${wallet.MaskedAddress}`);
      console.log(`Chain ID: ${wallet.ChainID}`);
      console.log(`Router Contract Address: ${routerAddress}`);
      console.log(
        `Stable Token Contract Address (${Args.stableToken}): ${stableTokenContractAddress}`
      );
      console.log(
        `Target Token Contract Address (${Args.targetToken}): ${targetTokenContractAddress}`
      );

      await Forever(async () => {
        const { fearGreedIndex, fearGreedIndexClassification } =
          await Alternative.GetCryptoFearIndex();
        console.log(
          `Current Fear/Greed Level: ${fearGreedIndexClassification} (${fearGreedIndex})`
        );
      }, 2);

      await Forever(async () => {
        const gasPrice = await wallet.GetGasPrice()
        console.log(`Current Gas Price (Rapid): ${gasPrice} (wei)`);
      }, 2);

      await Forever(async () => {
        stableTokenCurrentPrice = await DexScreener.GetCoinPrice(
          stableTokenContractAddress,
          chainName
        );
        console.log(`Stable current price ${stableTokenCurrentPrice}`);
        targetTokenCurrentPrice = await DexScreener.GetCoinPrice(
          targetTokenContractAddress,
          chainName
        );
        console.log(`Target current price ${targetTokenCurrentPrice}`);
        wbtcPrice = await DexScreener.GetCoinPrice(
          "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
          "ethereum"
        );
        console.log(`BTC current price ${wbtcPrice}`);
      }, 2);

      await Forever(async () => {
        stableTokenBalance = await wallet.GetTokenBalance(
          stableTokenContractAddress
        );
        targetTokenBalance = await wallet.GetTokenBalance(
          targetTokenContractAddress
        );
      }, 2);

      /** Implement here decition's tree */
      const order = await db.order.findUnique({
        where: {
          id: myToken?.orders[0].id
        }
      })

      const treeData = order?.strategy

      const orderBook = {
        stableTokenBalance: Number(stableTokenBalance) / Math.pow(10, stableTokenContractDecimals),
        targetTokenBalance: Number(targetTokenBalance) / Math.pow(10, myToken?.decimals as number),
        currentPrice: targetTokenCurrentPrice,
        targetTokenBagValue: (Number(targetTokenBalance) / Math.pow(10, myToken?.decimals as number)) * targetTokenCurrentPrice,
        breakeven: order?.breakeven,
        tp: order?.tp,
        sl: order?.sl,
        sellNow: order?.sellNow,
        buyNow: order?.buyNow,
        amount: order?.amount,
        active: order?.active
      }

      var conditionOpts = {
        populateFunctions: {
          pnl: function (node: any, comparisions: any, comparison: any, subjectData: any, cb: any) {
            if (subjectData.entryPrice === 0) cb(null, 0) // Not profit if doesnt exists entry price
            var pnl = ((subjectData.currentPrice - subjectData.entryPrice) / subjectData.entryPrice) * 100;
            cb(null, pnl)
          },
          goal: function (node: any, comparisions: any, comparison: any, subjectData: any, cb: any) {
            var goal = ((subjectData.tp - subjectData.currentPrice) / subjectData.currentPrice) * 100;
            cb(null, goal)
          },
          currentBalance: function (node: any, comparisions: any, comparison: any, subjectData: any, cb: any) {
            cb(null, subjectData.targetTokenBalance)
          },
          btcPrice: function (node: any, comparisions: any, comparison: any, subjectData: any, cb: any) {
            cb(null,  Number(wbtcPrice.toString()))
          }
        },
        runOnHit: {
          balance: function (node: any, subjectData: any) {
            console.log(`Current balance ${subjectData.currentBalance}`)
          },
          setSL: function (node: any, subjectData: any) {
            console.log(`Set SL from ${subjectData.sl} to breakeven`)
          },
          buyToken: function (node: any, subjectData: any) {
            console.log("Buying at: "+subjectData.currentPrice)
            signal = "BUY";
          },
          sellToken: function (node: any, subjectData: any) {
            console.log(`Selling ${subjectData.currentBalance} at ${subjectData.currentPrice}`)
            signal = "SELL";
          },
          sendTelegram: async function (node: any, subjectData: any, message: string) {
            await Telegram.SendMessage(
                  Args.botToken,
                  Args.chatId,
                  `${message}`
                );
          }
        }
      }

      var DecisionTree = new ODT(conditionOpts)
      let action:any

      DecisionTree.run(treeData, orderBook, {}, function (err: any, result: any, populated: any) {
        if (err) console.error("ERROR", err)
        console.log("RESULT", result)
        console.log("OrderBook", orderBook)
        console.log("POPULATED", populated)
        action = result
      })

      // Return array objet if there is match else return the strategy's json
      if (!_.has(action, 'branches')) {

        if (_.has(action[0], 'sellTokenPercent')) {
          let amount = Web3.utils.toBN(0)
          if (action[0].sellTokenPercent === 1) {
            amount = Web3.utils.toBN(targetTokenBalance.toString());
          } else {
            let result = (Number(targetTokenBalance) / Math.pow(10, myToken?.decimals as number) * (action[0].sellTokenPercent as number)) * Math.pow(10, myToken?.decimals as number)
            amount = Web3.utils.toBN(Math.trunc(result));
          }
          const slippage = myToken?.sellSlippage as number;
          await PrepareForSwap(
            router,
            wallet,
            targetTokenContractAddress,
            amount,
            stableTokenContractAddress,
            slippage
          );
          await Forever(async () => {
            const currentSoldTokenBalance = await wallet.GetTokenBalance(
              targetTokenContractAddress
            );

            if (currentSoldTokenBalance < Web3.utils.toBN(1)) {
              const orderUpdted = await db.order.update({
                where: {
                  id: order?.id,
                },
                data: {
                  active: false,
                },
              })
            }
          }, 2);
          await Forever(async () => {
            await Telegram.SendMessage(
              Args.botToken,
              Args.chatId,
              `Signal Received: sellTokenPercent ${action[0].sellTokenPercent} `
            );
          }, 2);

        } else if (_.has(action[0], 'buyStablePercent')) {
          const amount = Web3.utils.toBN(Math.round(Number(stableTokenBalance.toString()) * (action[0].buyStablePercent as number)));
          const slippage = myToken?.buySlippage as number;
          await PrepareForSwap(
            router,
            wallet,
            stableTokenContractAddress,
            amount,
            targetTokenContractAddress,
            slippage
          );
          await Forever(async () => {
            await Telegram.SendMessage(
              Args.botToken,
              Args.chatId,
              `Signal Received: buyStablePercent`
            );
          }, 2);
        } else if (_.has(action[0], 'buyStableAmount')) {
          const amount = Web3.utils.toBN(Math.round(Number(action[0].buyStableAmount)).toString() + '000000');
          const slippage = myToken?.buySlippage as number;
         
          await PrepareForSwap(
            router,
            wallet,
            stableTokenContractAddress,
            amount,
            targetTokenContractAddress,
            slippage
          );
          await Forever(async () => {
            await Telegram.SendMessage(
              Args.botToken,
              Args.chatId,
              `Signal Received: buyStableAmount`
            );
          }, 2);
        } else if (_.has(action[0], 'updateOrderProperty')) {
          if (action[0].updateOrderProperty === 'sl') {
            const updateUser = await db.order.update({
              where: {
                id: order?.id,
              },
              data: {
                sl: action[0].value,
              },
            })
            await Forever(async () => {
              await Telegram.SendMessage(
                Args.botToken,
                Args.chatId,
                `Updating SL to ${action[0].value}`
              );
            }, 2);
          }
        }

        // const trade = {
        //   date: new Date().getTime(),
        //   sold: Args.stableToken,
        //   soldAmount: stableTokenAmnt,
        //   soldValue: stableTokenAmnt * stableTokenCurrentPrice,
        //   bought: Args.targetToken,
        //   boughtAmount: balAmnt,
        //   boughtValue: balAmnt * targetTokenCurrentPrice,
        //   tradeLossPercent:
        //     ((balAmnt * targetTokenCurrentPrice -
        //       stableTokenAmnt * stableTokenCurrentPrice) *
        //       100) /
        //     (stableTokenAmnt * stableTokenCurrentPrice),
        // };

        // await Forever(async () => {
        //   await Telegram.SendMessage(
        //     Args.botToken,
        //     Args.chatId,
        //     JSON.stringify(trade, null, 2)
        //   );
        // }, 2);
        
      }
      
      // Here
      const end = new Date().getTime();
      console.log(`\nLoop Time: ${(end - start) / 1000} (sec)`);
      console.log(
        `Running For: ${Math.floor(
          (end - START_TIME) / (1000 * 60 * 60 * 24)
        )} (days)`
      );
      await Wait(10);
    }
    // ====== END (Loop) ======= //
  } catch (error) {
    console.error(error);
  } finally {
    process.exit(1);
  }
})();

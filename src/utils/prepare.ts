import { Router } from "../api/oneinch";
import Telegram from "../api/telegram";
import { Wallet } from "../api/wallet";
import { Approve } from "./approve";
import { Args } from "./flags";
import { Forever } from "./forever";
import { Swap } from "./swap";
import { Wait } from "./wait";
import BN from "bn.js";
import Web3 from "web3";

export const PrepareForSwap = async (
  router: Router,
  wallet: Wallet,
  fromTokenContractAddress: string,
  fromTokenBalance: BN,
  toTokenContractAddress: string,
  slippage: number
): Promise<void> => {
  let fromTokenAllowance = Web3.utils.toBN(0);

  await Forever(async () => {
    fromTokenAllowance = await router.GetApprovedAllowance(
      fromTokenContractAddress,
      Args.publicKey
    );
  }, 2);

  if (fromTokenAllowance.gte(fromTokenBalance)) {
    console.log(
      `Router is approved to spend the required amount of tokens for a swap`
    );
    const params = {
      fromTokenAddress: fromTokenContractAddress,
      toTokenAddress: toTokenContractAddress,
      amount: fromTokenBalance.toString(),
      fromAddress: wallet.Address,
      slippage: slippage,
      disableEstimate: false,
      allowPartialFill: false,
      compatibilityMode: slippage > 1 ? true : false, // Enabling to secure swap for tokens with internal commitions 
      gasLimit: 11500000
    };
    let swapTxHash = "";
    await Forever(async () => {
      swapTxHash = await Swap(wallet, router, params);
    }, 2);
    if (swapTxHash === "") {
      await Forever(async () => {
        await Telegram.SendMessage(
          Args.botToken,
          Args.chatId,
          `[STOPPING] Swap transaction for failed`
        );
      }, 2);
      process.exit(1);
    } else {
      await Forever(async () => {
        await Telegram.SendMessage(
          Args.botToken,
          Args.chatId,
          `[SUCCEEDED] Swap transaction done`
        );
      }, 2);
    }
    if (!Args.preAuth) {
      await Forever(async () => {
        await Approve(wallet, router, fromTokenContractAddress, "0");
      }, 2);
      while (true) {
        console.log(`Refreshing router token allowance`);
        let fromTokenAllowance = Web3.utils.toBN(0);
        await Forever(async () => {
          fromTokenAllowance = await router.GetApprovedAllowance(
            fromTokenContractAddress,
            Args.publicKey
          );
        }, 2);
        if (fromTokenAllowance.eq(Web3.utils.toBN(0))) {
          console.log("Router approval is revoked successfully");
          break;
        }
        await Wait(2);
      }
    }
  } else {
    let approveTxHash = "";
    await Forever(async () => {
      approveTxHash = await Approve(
        wallet,
        router,
        fromTokenContractAddress,
        fromTokenBalance.toString()
      );
    }, 2);
    if (approveTxHash === "") {
      console.error(`Approve transaction for ${Args.targetToken} failed`);
      await Forever(async () => {
        await Telegram.SendMessage(
          Args.botToken,
          Args.chatId,
          `[STOPPING] Approve transaction for ${Args.targetToken} failed`
        );
      }, 2);
      process.exit(1);
    } else {
      while (true) {
        let fromTokenAllowance = Web3.utils.toBN(0);
        await Forever(async () => {
          console.log(`Refreshing router token allowance`);
          fromTokenAllowance = await router.GetApprovedAllowance(
            fromTokenContractAddress,
            Args.publicKey
          );
        }, 2);
        if (fromTokenAllowance.gte(fromTokenBalance)) {
          console.log(`Router is now approved to spend the required tokens`);
          break;
        } else {
          await Wait(2);
        }
      }
    }
  }
};

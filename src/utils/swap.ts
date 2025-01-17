import { Router } from "../api/oneinch";
import Telegram from "../api/telegram";
import { Args } from "./flags";
import { Wallet } from "../api/wallet";
import { Forever } from "./forever";

export const Swap = async (
  wallet: Wallet,
  router: Router,
  params: any
): Promise<string> => {
  let swapTxWithGas: any = {};
  let signedSwapTxWithGasRaw: any = {};
  let swapTxHash = "";

  await Forever(async () => {
    console.log(`Initiating swapping the tokens`);
    const swapTx = await router.GetSwapTransactionData(params);
    // const gasPrice = await wallet.GetGasPrice();
    if (swapTx.gas > 0) {
      swapTxWithGas = {
        ...swapTx,
        gasPrice: undefined,
        // maxPriorityFeePerGas: gasPrice,
        // maxFeePerGas: gasPrice,
        gas: swapTx.gas + Math.ceil(0.10 * swapTx.gas),
      };
    } else {
      await Forever(async () => {
        await Telegram.SendMessage(
          Args.botToken,
          Args.chatId,
          `Imposifle efectuar swap para ${Args.targetToken}, 1inch responde gas = 0`
        );
      }, 2);
    }
  }, 2);

  await Forever(async () => {
    console.log(`Fetching nonce`);
    const nonce = await wallet.GetNonce();
    console.log(`Signing transaction`);
    const { rawTransaction, transactionHash } = await wallet.SignTransaction({
      ...swapTxWithGas,
      nonce: nonce.toString(),
    });
    signedSwapTxWithGasRaw = rawTransaction;
    swapTxHash = transactionHash;
  }, 2);

  console.log(
    `Attempting swap transaction ${swapTxHash} with Gas: ${swapTxWithGas.gas}, MaxPriorityFeePerGas: ${swapTxWithGas.maxPriorityFeePerGas}, MaxFeePerGas: ${swapTxWithGas.maxFeePerGas} (wei)`
  );

  await Forever(
    async () => {
      console.log(`Broadcasting transaction ${swapTxHash}`);
      await wallet.SendSignedTransaction(signedSwapTxWithGasRaw);
      console.log(`Token Swap Transaction has been sent: ${swapTxHash}`);
    },
    2,
    3
  );

  let success = false;
  await Forever(async () => {
    console.log("Querying transaction status");
    success = await wallet.GetTransactionReceipt(swapTxHash);
  }, 2);

  if (success) {
    console.log("Swap Transaction Succeeded");
    return swapTxHash;
  } else {
    console.error("Swap Transaction Failed");
    return "";
  }
};

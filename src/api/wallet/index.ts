import Web3 from "web3";
import { Wait } from "../../utils/wait";
import { Web3Client, GetWeb3ContractClient } from "../web3";
import BN from "bn.js";

const ERC20Abi: any = [
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    type: "function",
  },
];

export class Wallet {
  Address: string;
  MaskedAddress: string;
  Key: string;
  ChainID: number;

  constructor(address: string, key: string, chainId: number) {
    this.Address = address;
    this.MaskedAddress = address
      .split("")
      .map((c, idx) => {
        if (idx < 5 || idx > address.length - 6) {
          return c;
        } else {
          return "*";
        }
      })
      .join("");
    this.Key = key;
    this.ChainID = chainId;
  }

  async GetBalance(): Promise<BN> {
    const balance = await Web3Client.eth.getBalance(this.Address);
    return Web3.utils.toBN(balance);
  }

  async GetTokenBalance(tokenContractAddress: string): Promise<BN> {
    const contract = GetWeb3ContractClient(ERC20Abi, tokenContractAddress);
    const balance = await contract.methods.balanceOf(this.Address).call();
    return Web3.utils.toBN(balance);
  }

  async SignTransaction(transaction: any): Promise<any> {
    const tx: any = await Web3Client.eth.accounts.signTransaction(
      transaction,
      this.Key
    );
    const { rawTransaction, transactionHash } = tx;
    return { rawTransaction, transactionHash };
  }

  async SendSignedTransaction(transactionHash: string): Promise<any> {
    const tx: any = await Web3Client.eth.sendSignedTransaction(
      transactionHash
    )
    .on('error', error => console.log('SendSignedTransaction', error));
    return tx
  }

  /**
   * Transaction example
   * {
      blockHash: "0x9748cdebc70acd0126deb354152b66b99a11e6b05e08e366ffd324ce13f8f422",
      blockNumber: 16002737,
      contractAddress: null,
      cumulativeGasUsed: 942913,
      effectiveGasPrice: 80000000000,
      from: "0xa68316c9a22594caf0942fb07ff4d976927cedfa",
      gasUsed: 48561,
      logs: [
        {
          address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
          topics: [
            "0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925",
            "0x000000000000000000000000a68316c9a22594caf0942fb07ff4d976927cedfa",
            "0x0000000000000000000000001111111254eeb25477b68fb85ed929f73a960582",
          ],
          data: "0x0000000000000000000000000000000000000000000000000000000018c73697",
          blockNumber: 16002737,
          transactionHash: "0xed207ccaf8a5905e407cd59c6c501139ffe23974a6b2a4465b7e5ee48b5388cd",
          transactionIndex: 3,
          blockHash: "0x9748cdebc70acd0126deb354152b66b99a11e6b05e08e366ffd324ce13f8f422",
          logIndex: 29,
          removed: false,
          id: "log_9cec667b",
        },
      ],
      logsBloom: "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000200000000000000000080000000000000020000000000000000000000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000000000000000100000020000000000000000000080000004000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000010000000000000000400000000000000000000000000000000000000000000",
      status: true,
      to: "0xdac17f958d2ee523a2206206994597c13d831ec7",
      transactionHash: "0xed207ccaf8a5905e407cd59c6c501139ffe23974a6b2a4465b7e5ee48b5388cd",
      transactionIndex: 3,
      type: "0x2",
    }
   * 
   * @param transaction 
   * @returns 
   */
  async EstimateGas(transaction: any): Promise<number> {
    const gas: number = await Web3Client.eth.estimateGas({
      ...transaction,
      from: this.Address,
    });
    return gas;
  }


  /**
   * 
   * @returns 
   */
  async GasLimit(): Promise<any> {
    const { gasLimit } = await Web3Client.eth.getBlock("latest");
    return gasLimit;
  }

  async GetGasPrice(): Promise<any> {
    const gasPrice = await Web3Client.eth.getGasPrice();
    return gasPrice;
  }

  async GetGasPriceAveraged(): Promise<any> {
    let gasPrices = []
    let gases = []
    let pendingTransactions = await Web3Client.eth.getPendingTransactions()
    // for tx in pending_transactions["result"[:10]]:
    //   gas_prices.append(int((tx["gasPrice"]),16))
    //   gases.append(int((tx["gas"]),16))

    // print("Average:")
    // print("-"*80)
    // print("gasPrice: ", statistics.mean(gas_prices))
    // print(" ")
    // print("Median:")
    // print("-"*80)
    // print("gasPrice: ", statistics.median(gas_prices))
    return pendingTransactions;
  }

  async GetTransactionReceipt(txHash: string): Promise<boolean> {
    let retries = 0;
    while (retries < 50) {
      const receipt = await Web3Client.eth.getTransactionReceipt(txHash);
      if (receipt != null) {
        console.log(`Fetched transaction receipt for ${txHash}`);
        return receipt.status;
      } else {
        retries += 1;
        console.log(
          `Retrying (${retries}) to fetch transaction receipt for ${txHash}`
        );
        await Wait(5);
      }
    }
    return false;
  }

  async GetNonce() {
    const nonce = await Web3Client.eth.getTransactionCount(
      this.Address,
      "pending"
    );
    return nonce;
  }
}
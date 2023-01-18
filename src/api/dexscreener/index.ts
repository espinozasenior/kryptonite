import Axios from "axios";
import _ from "lodash";

/**
 * Find token pairs from tokenAddress and get price
 */
export class DexScreener
 {
  static GetCoinPrice = async (tokenAddress: string, chainName: string): Promise<number> => {
    if (chainName == "nil" || typeof chainName === undefined) return Promise.reject(new Error("Chain not supported"));

    return Axios.get<number>(`https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`, {
      timeout: 5000,
    })
      .then((response) => response.data)
      .then((response: any) => {
        if (response.error && response.error.length > 0) {
          return Promise.reject(response.error[0]);
        }
        return Number(_.find(response.pairs, { 'chainId': chainName }).priceUsd);
      })
      .catch((error) => {
        if (error.response && error.response.data) {
          return Promise.reject(error.response.data);
        } else {
          return Promise.reject(new Error("Request failed"));
        }
      });
  };
}

import Axios from "axios";
import Web3 from "web3";
import BN from "bn.js";
class Token {
  id: string = "";
  name: string = "";
  decimals: number = 0;
  symbol: string = "";
  address: string = "";
  constructor(token: Token) {
    this.id = token.id || "";
    this.name = token.name || "";
    this.symbol = token.symbol || "";
    this.address = token.address || "";
    this.decimals = token.decimals || 0;
  }
}

export class Router {
  ChainID: number;
  Hostname: string;

  constructor(chainId: number, hostname: string) {
    this.ChainID = chainId;
    this.Hostname = hostname
  }

  async GetSwapTransactionData(params: any): Promise<any> {
    return Axios.get<any>(`${this.Hostname}/${this.ChainID}/swap`, {
      params,
      timeout: 5000,
    })
      .then((response) => response.data)
      .then((response) => response.tx as any)
      .catch((error) => {
        if (error.response && error.response.data) {
          return Promise.reject(error.response.data);
        } else {
          return Promise.reject(new Error("Request failed"));
        }
      });
  }

  async GetQuote(params: any): Promise<any> {
    const { fromTokenAddress, toTokenAddress, amount } = params
    if (!fromTokenAddress) {
      return Promise.reject(new Error("fromTokenAddrss is required"));
    }
    if (!toTokenAddress) {
      return Promise.reject(new Error("toTokenAddress is required"));
    }
    if (!amount) {
      return Promise.reject(new Error("amount is required"));
    }
    return Axios.get<any>(`${this.Hostname}/${this.ChainID}/quote`, {
      params,
      timeout: 5000,
    })
      .then((response) => response.data)
      .catch((error) => {
        if (error.response && error.response.data) {
          return Promise.reject(error.response.data);
        } else {
          return Promise.reject(new Error("Request failed"));
        }
      });
  }

  async GetHealthStatus(): Promise<boolean> {
    return Axios.get<boolean>(
      `${this.Hostname}/${this.ChainID}/healthcheck`,
      {
        timeout: 5000,
      }
    )
      .then(() => {
        return Promise.resolve(true);
      })
      .catch((error) => {
        if (error.response && error.response.data) {
          return Promise.reject(error.response.data);
        } else {
          return Promise.reject(new Error("Request failed"));
        }
      });
  }

  async GetContractAddress(): Promise<string> {
    return Axios.get<string>(
      `${this.Hostname}/${this.ChainID}/approve/spender`,
      {
        timeout: 5000,
      }
    )
      .then((response) => response.data)
      .then((response: any) => response.address as string)
      .catch((error) => {
        if (error.response && error.response.data) {
          return Promise.reject(error.response.data);
        } else {
          return Promise.reject(new Error("Request failed"));
        }
      });
  }

  async GetSupportedTokens(): Promise<Token[]> {
    return Axios.get<Token[]>(
      `${this.Hostname}/${this.ChainID}/tokens`,
      {
        timeout: 5000,
      }
    )
      .then((response) => response.data)
      .then((response: any) => {
        let tokens: Token[] = [];
        for (let token of Object.keys(response.tokens as any)) {
          tokens.push(response.tokens[token] as Token);
        }
        let custom_tokens: any =  {
          "tokens": {
            "0xFe4BEb9217cdDf2422d4bd65449b76d807b30fe1": {
              "symbol": "WHITE_ETH",
              "name": "White Ethereum",
              "decimals": 18,
              "address": "0xFe4BEb9217cdDf2422d4bd65449b76d807b30fe1",
              "logoURI": "https://assets.coingecko.com/coins/images/26667/large/IMG_2923.PNG",
              "tags": [
                "tokens",
                "WHITE:WETH"
              ]
            },
            "0x30dcBa0405004cF124045793E1933C798Af9E66a": {
              "symbol": "YDF",
              "name": "Yieldification",
              "decimals": 18,
              "address": "0x30dcBa0405004cF124045793E1933C798Af9E66a",
              "logoURI": "https://assets.coingecko.com/coins/images/26699/large/logo.png",
              "tags": [
                "tokens",
                "YDF:WETH"
              ]
            },
            "0xF411903cbC70a74d22900a5DE66A2dda66507255": {
              "symbol": "VRA",
              "name": "Veracity",
              "decimals": 18,
              "address": "0xF411903cbC70a74d22900a5DE66A2dda66507255",
              "logoURI": "https://assets.coingecko.com/coins/images/14025/large/VRA.jpg",
              "tags": [
                "tokens"
              ]
            }
          }
        }
        for (let tkn of Object.keys(custom_tokens.tokens as any)) {
          tokens.push(custom_tokens.tokens[tkn] as Token);
        }
        return Promise.resolve(tokens.map((t) => new Token(t)));
      })
      .catch((error) => {
        if (error.response && error.response.data) {
          return Promise.reject(error.response.data);
        } else {
          return Promise.reject(new Error("Request failed"));
        }
      });
  }

  async GetApprovedAllowance(
    tokenAddress: string,
    walletAddress: string
  ): Promise<BN> {
    return Axios.get<BN>(
      `${this.Hostname}/${this.ChainID}/approve/allowance`,
      {
        params: {
          tokenAddress,
          walletAddress,
        },
        timeout: 5000,
      }
    )
      .then((response) => response.data)
      .then((response: any) => Web3.utils.toBN(response.allowance))
      .catch((error) => {
        if (error.response && error.response.data) {
          return Promise.reject(error.response.data);
        } else {
          return Promise.reject(new Error("Request failed"));
        }
      });
  }

  async GetApproveTransactionData(
    tokenAddress: string,
    amount: string
  ): Promise<any> {
    return Axios.get<any>(
      `${this.Hostname}/${this.ChainID}/approve/transaction`,
      {
        params: {
          tokenAddress,
          amount: amount === "-1" ? undefined : amount,
        },
        timeout: 5000,
      }
    )
      .then((response) => response.data as any)
      .catch((error) => {
        if (error.response && error.response.data) {
          return Promise.reject(error.response.data);
        } else {
          return Promise.reject(new Error("Request failed"));
        }
      });
  }
}

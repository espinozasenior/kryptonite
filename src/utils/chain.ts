export const Chain = async (chainId: number): Promise<string> => {
    return new Promise((resolve, _) => {
      switch (chainId) {
        case 1:
          resolve("ethereum");
          break;
        case 10:
          resolve("optimism");
          break;
        case 56:
          resolve("bsc");
          break;
        case 137:
          resolve("polygon")
          break;
        case 42161:
          resolve("arbitrum")
          break;
        default:
          resolve("nil")
          break;
      }
    });
  };
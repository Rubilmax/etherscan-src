import axios from "axios";
import { ethers } from "ethers";

import {
  getImplementationAddress,
  EIP1967ImplementationNotFound,
} from "@openzeppelin/upgrades-core";

import chainIds from "./constants/chainIds";
import rpcs from "./constants/rpcs.json";
import { getEtherscanUrl } from "./etherscan";
import {
  Config,
  EtherscanSourceCode,
  EtherscanSourceCodeResponse,
  isEtherscanError,
} from "./types";

export const fetchSourcesAt = async (
  address: string,
  { provider, rpcUrl, network, apiKey }: Config
) => {
  let chainId: number = 1;

  if (!provider && !rpcUrl) {
    network ??= "mainnet";

    chainId = ethers.utils.isHexString(network)
      ? parseInt(network, 16)
      : /^\d+$/.test(network)
      ? Number(network)
      : chainIds[network.toLowerCase()];

    // @ts-ignore
    rpcUrl ??= rpcs[chainId.toString()]?.rpcs[0];
  }

  if (provider || rpcUrl) {
    provider ??= new ethers.providers.JsonRpcBatchProvider(rpcUrl);

    try {
      address = await getImplementationAddress(provider, address);
    } catch (error: any) {
      if (!(error instanceof EIP1967ImplementationNotFound)) throw error;
    }

    chainId = provider.network.chainId;
  }

  const { data } = await axios.get<EtherscanSourceCodeResponse>(
    getEtherscanUrl(chainId, "contract", {
      action: "getsourcecode",
      address,
      apiKey,
    })
  );
  if (isEtherscanError(data)) throw new Error(data.result);

  try {
    return {
      name: data.result[0].ContractName,
      sources: (data.result[0].SourceCode.startsWith("{")
        ? JSON.parse(data.result[0].SourceCode.slice(1, data.result[0].SourceCode.length - 1))
        : {
            sources: {
              name: data.result[0].SourceCode,
            },
          }) as EtherscanSourceCode,
    };
  } catch {
    throw new Error(data.result[0].ABI);
  }
};

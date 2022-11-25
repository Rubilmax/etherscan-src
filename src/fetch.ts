import axios from "axios";
import { ethers } from "ethers";

import {
  getImplementationAddress,
  EIP1967ImplementationNotFound,
} from "@openzeppelin/upgrades-core";

import chainIds from "./constants/chainIds";
import rpcs from "./constants/rpcs.json";
import { FetchError } from "./errors";
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
    const rpcUrls = rpcs[chainId.toString()]?.rpcs ?? [];

    let rpcUrlIndex = 0;
    while (rpcUrlIndex < rpcUrls.length) {
      rpcUrl = rpcUrls[rpcUrlIndex];
      provider = new ethers.providers.JsonRpcProvider(rpcUrl);

      try {
        address = await getImplementationAddress(provider, address);
      } catch (error: any) {
        if (error instanceof EIP1967ImplementationNotFound) break;
      }

      rpcUrlIndex += 1;
    }
  } else {
    if (rpcUrl) provider = new ethers.providers.JsonRpcProvider(rpcUrl);

    try {
      address = await getImplementationAddress(provider!, address);
    } catch (error: any) {
      if (!(error instanceof EIP1967ImplementationNotFound)) throw error;
    }
  }

  const url = getEtherscanUrl((await provider!.detectNetwork()).chainId, "contract", {
    action: "getsourcecode",
    address,
    apiKey,
  });
  const { data } = await axios.get<EtherscanSourceCodeResponse>(url.toString());

  if (isEtherscanError(data)) throw new FetchError(data.result, chainId, url.hostname);
  if (!data.result[0]?.SourceCode)
    throw new FetchError(
      data.result[0]?.ABI ?? "Contract source code not verified",
      chainId,
      url.hostname
    );

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
    throw new FetchError("Cannot parse sources", chainId, url.hostname);
  }
};

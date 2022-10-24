#!/usr/bin/env node
import colors from "colors/safe";
import commandLineArgs from "command-line-args";
import commandLineUsage from "command-line-usage";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

import { fetchSourcesAt } from "./fetch";

dotenv.config();

const optionDefinitions = [
  {
    name: "help",
    alias: "h",
    type: Boolean,
    description: "Display this usage guide.",
  },
  {
    name: "contract",
    type: String,
    multiple: true,
    description: "The addresses of contract to fetch ABIs of.",
    typeLabel: "<address>",
    defaultOption: true,
    defaultValue: [],
  },
  {
    name: "target",
    alias: "t",
    type: String,
    description: "The path to the directory inside which to save ABIs.",
    typeLabel: "<path>",
    defaultValue: "sources",
  },
  {
    name: "network",
    alias: "n",
    type: String,
    description: "The network on which to fetch ABIs.",
    typeLabel: "<network>",
    defaultValue: "mainnet",
  },
  {
    name: "apiKey",
    alias: "k",
    type: String,
    description: "The Etherscan API Key to use to fetch ABIs.",
    typeLabel: "<string>",
    defaultValue: undefined,
  },
  {
    name: "rpcUrl",
    alias: "r",
    type: String,
    description:
      "The RPC URL to use to query for implementation address (only used in case of proxies).",
    typeLabel: "<url>",
    defaultValue: undefined,
  },
];

const options = commandLineArgs(optionDefinitions) as {
  help: boolean;
  contract: string[];
  target: string;
  network: string;
  apiKey: string;
  rpcUrl: string;
};

const help = commandLineUsage([
  {
    header: "Etherscan Sources Fetcher",
    content:
      "⏬🚀 Fetch the most up-to-date sources of verified Smart Contracts from Etherscan in seconds!",
  },
  {
    header: "Options",
    optionList: optionDefinitions,
  },
  {
    content: "Project home: {underline https://github.com/rubilmax/etherscan-src}",
  },
]);

const fetchSources = () => {
  const { contract, target, ...fetchConfig } = options;

  if (contract.length === 0) {
    console.error(colors.red("No contract address specified."));
    return console.log(help);
  }

  return Promise.all(
    contract.map(async (address) => {
      try {
        const { name, sources } = await fetchSourcesAt(address, fetchConfig);

        const targetPath = path.join(target, name);

        Object.entries(sources.sources).forEach(([filePath, sourceCode]) => {
          const srcPath = path.join(targetPath, filePath);

          fs.mkdirSync(path.dirname(srcPath), { recursive: true });
          fs.writeFileSync(path.join(targetPath, filePath), sourceCode.content);
        });

        console.log(
          colors.green(
            `Successfully saved sources for ${colors.bold(address)} at ${colors.bold(targetPath)}`
          )
        );
      } catch (error: any) {
        console.log(
          colors.red(
            `Error while fetching sources for ${colors.bold(address)}: ${colors.bold(
              error.message
            )}`
          )
        );
      }
    })
  );
};

if (options.help) console.log(help);
else void fetchSources();

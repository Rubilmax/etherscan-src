# etherscan-src

[![npm package][npm-img]][npm-url]
[![Build Status][build-img]][build-url]
[![Downloads][downloads-img]][downloads-url]
[![Issues][issues-img]][issues-url]
[![Commitizen Friendly][commitizen-img]][commitizen-url]
[![Semantic Release][semantic-release-img]][semantic-release-url]

> ⏬🚀 Fetch the most up-to-date sources of verified Smart Contracts (including proxy implementations) from Etherscan in seconds!

## Usage

### CLI

- Fetch the sources of a contract from an address and save it to `sources/ContractName/`:

```bash
npx etherscan-src 0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984
```

- Note that if a standard proxy is detected, the proxy's implementation sources will be fetched instead:

```bash
npx etherscan-src 0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9
```

- You can optionally provide a `target` directory path, an Etherscan `apiKey` (to bypass the default query rate limit), or specify a `network` on which to query the Smart Contract's source code (by [name or chainId, decimal or hexadecimal](./src/constants/chainIds.ts)):

```bash
npx etherscan-src --target sources/uniswap/ \
    --apiKey ... \
    --network polygon \
    0xb33EaAd8d922B1083446DC23f610c2567fB5180f
```

## Install

```bash
npm install etherscan-src
```

```bash
yarn add etherscan-src
```

[build-img]: https://github.com/rubilmax/etherscan-src/actions/workflows/release.yml/badge.svg
[build-url]: https://github.com/rubilmax/etherscan-src/actions/workflows/release.yml
[downloads-img]: https://img.shields.io/npm/dt/etherscan-src
[downloads-url]: https://www.npmtrends.com/etherscan-src
[npm-img]: https://img.shields.io/npm/v/etherscan-src
[npm-url]: https://www.npmjs.com/package/etherscan-src
[issues-img]: https://img.shields.io/github/issues/rubilmax/etherscan-src
[issues-url]: https://github.com/rubilmax/etherscan-src/issues
[codecov-img]: https://codecov.io/gh/rubilmax/etherscan-src/branch/main/graph/badge.svg
[codecov-url]: https://codecov.io/gh/rubilmax/etherscan-src
[semantic-release-img]: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
[semantic-release-url]: https://github.com/semantic-release/semantic-release
[commitizen-img]: https://img.shields.io/badge/commitizen-friendly-brightgreen.svg
[commitizen-url]: http://commitizen.github.io/cz-cli/

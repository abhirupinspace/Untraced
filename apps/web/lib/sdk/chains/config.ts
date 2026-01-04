/**
 * Supported chains for U-CCAP (UNTRACED Cross-Chain Attestation Protocol)
 * These chains are verified via Flare Network's Data Connector
 */

export interface SupportedChain {
  id: string;
  name: string;
  symbol: string;
  decimals: number;
  flareDataConnectorId: string;
  rpcUrl?: string;
  explorerUrl?: string;
  icon: string;
}

export const SUPPORTED_CHAINS = {
  ETH: {
    id: "eth",
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18,
    flareDataConnectorId: "ethereum",
    rpcUrl: "https://eth.llamarpc.com",
    explorerUrl: "https://etherscan.io",
    icon: "ethereum",
  },
  BSC: {
    id: "bsc",
    name: "BNB Smart Chain",
    symbol: "BNB",
    decimals: 18,
    flareDataConnectorId: "bnb",
    rpcUrl: "https://bsc-dataseed.binance.org",
    explorerUrl: "https://bscscan.com",
    icon: "bnb",
  },
  XRP: {
    id: "xrp",
    name: "XRP Ledger",
    symbol: "XRP",
    decimals: 6,
    flareDataConnectorId: "xrpl",
    explorerUrl: "https://xrpscan.com",
    icon: "xrp",
  },
  DOGE: {
    id: "doge",
    name: "Dogecoin",
    symbol: "DOGE",
    decimals: 8,
    flareDataConnectorId: "dogecoin",
    explorerUrl: "https://dogechain.info",
    icon: "doge",
  },
  LTC: {
    id: "ltc",
    name: "Litecoin",
    symbol: "LTC",
    decimals: 8,
    flareDataConnectorId: "litecoin",
    explorerUrl: "https://litecoinspace.org",
    icon: "ltc",
  },
  FLR: {
    id: "flr",
    name: "Flare",
    symbol: "FLR",
    decimals: 18,
    flareDataConnectorId: "flare",
    rpcUrl: "https://flare-api.flare.network/ext/C/rpc",
    explorerUrl: "https://flarescan.com",
    icon: "flare",
  },
  MNT: {
    id: "mnt",
    name: "Mantle",
    symbol: "MNT",
    decimals: 18,
    flareDataConnectorId: "mantle",
    rpcUrl: "https://rpc.mantle.xyz",
    explorerUrl: "https://mantlescan.xyz",
    icon: "mantle",
  },
} as const;

export type ChainId = keyof typeof SUPPORTED_CHAINS;

export const CHAIN_LIST = Object.values(SUPPORTED_CHAINS);

export function getChainById(id: string): SupportedChain | undefined {
  return CHAIN_LIST.find((chain) => chain.id === id.toLowerCase());
}

export function getChainBySymbol(symbol: ChainId): SupportedChain {
  return SUPPORTED_CHAINS[symbol];
}

export const chains = [
  {
    // id: 1,
    name: "Ethereum",
    chainId: 1,
    is_l1: true,
    is_testnet: false,
    is_sending_enabled: true,
    is_receiving_enabled: false,
    explorers: ["https://etherscan.io/"],
    token_id: 1,
  },
  {
    // id: 2,
    name: "Polygon",
    chainId: 137,
    is_l1: false,
    is_testnet: false,
    is_sending_enabled: true,
    is_receiving_enabled: true,
    explorers: ["https://polygonscan.com/"],
    token_id: 3,
  },
  {
    // id: 3,
    name: "Polygon Mumbai",
    chainId: 80001,
    is_l1: false,
    is_testnet: true,
    is_sending_enabled: false,
    is_receiving_enabled: true,
    explorers: ["https://mumbai.polygonscan.com/"],
    token_id: 3,
  },
  {
    // id: 4,
    name: "Goerli",
    chainId: 5,
    is_l1: true,
    is_testnet: true,
    is_sending_enabled: true,
    is_receiving_enabled: false,
    explorers: ["https://goerli.etherscan.io/"],
    token_id: 1,
  },
];

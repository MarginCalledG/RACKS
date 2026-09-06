// Generated from the Zap Foundry artifact. Do not edit by hand.
// Regenerate: jq '.abi' out/Zap.sol/Zap.json

export const zapAbi = [
  {
    "type": "constructor",
    "inputs": [
      {
        "name": "_swapper",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "_w",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "_racks",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "_usdg",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "_spy",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "_quoter",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "_spyUsdg",
        "type": "tuple",
        "internalType": "struct PoolKey",
        "components": [
          {
            "name": "currency0",
            "type": "address",
            "internalType": "Currency"
          },
          {
            "name": "currency1",
            "type": "address",
            "internalType": "Currency"
          },
          {
            "name": "fee",
            "type": "uint24",
            "internalType": "uint24"
          },
          {
            "name": "tickSpacing",
            "type": "int24",
            "internalType": "int24"
          },
          {
            "name": "hooks",
            "type": "address",
            "internalType": "address"
          }
        ]
      },
      {
        "name": "_wrSpy",
        "type": "tuple",
        "internalType": "struct PoolKey",
        "components": [
          {
            "name": "currency0",
            "type": "address",
            "internalType": "Currency"
          },
          {
            "name": "currency1",
            "type": "address",
            "internalType": "Currency"
          },
          {
            "name": "fee",
            "type": "uint24",
            "internalType": "uint24"
          },
          {
            "name": "tickSpacing",
            "type": "int24",
            "internalType": "int24"
          },
          {
            "name": "hooks",
            "type": "address",
            "internalType": "address"
          }
        ]
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "buyRacks",
    "inputs": [
      {
        "name": "usdgIn",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "minRacksOut",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "to",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "racksOut",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "quoter",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "contract IV4Quoter"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "racks",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "contract IERC20x"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "racksL",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "contract IRacksLaunch"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "sellRacks",
    "inputs": [
      {
        "name": "racksIn",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "minUsdgOut",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "to",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "usdgOut",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "spy",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "spyUsdg",
    "inputs": [],
    "outputs": [
      {
        "name": "currency0",
        "type": "address",
        "internalType": "Currency"
      },
      {
        "name": "currency1",
        "type": "address",
        "internalType": "Currency"
      },
      {
        "name": "fee",
        "type": "uint24",
        "internalType": "uint24"
      },
      {
        "name": "tickSpacing",
        "type": "int24",
        "internalType": "int24"
      },
      {
        "name": "hooks",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "swapper",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "contract V4Swap"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "usdg",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "w",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "contract IWR"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "wrSpy",
    "inputs": [],
    "outputs": [
      {
        "name": "currency0",
        "type": "address",
        "internalType": "Currency"
      },
      {
        "name": "currency1",
        "type": "address",
        "internalType": "Currency"
      },
      {
        "name": "fee",
        "type": "uint24",
        "internalType": "uint24"
      },
      {
        "name": "tickSpacing",
        "type": "int24",
        "internalType": "int24"
      },
      {
        "name": "hooks",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  }
] as const

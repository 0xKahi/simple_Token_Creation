const path = require("path");
require("dotenv").config({path: "./.env"});
const HDWalletProvider = require("@truffle/hdwallet-provider");
const AccountIndex = 0;
module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  contracts_build_directory: path.join(__dirname, "client/src/contracts"),
  networks: {
    develop: {
      port: 7545,
      host: "127.0.0.1",
      network_id: 5777
    },
    ganache_local:{
      provider: function(){
        return new HDWalletProvider(process.env.MENEMONIC,"http://127.0.0.1:7545",AccountIndex)
      },
      network_id: 5777
    },
    goerli_infura: {
      provider: function(){
        return new HDWalletProvider(process.env.MENEMONIC,"https://mainnet.infura.io/v3/8caed37592a841d986ca15fa0b3b6965",AccountIndex)
      },
      network_id: 5
    },
    ropsten_infura: {
      provider: function(){
        return new HDWalletProvider(process.env.MENEMONIC,"https://ropsten.infura.io/v3/8caed37592a841d986ca15fa0b3b6965",AccountIndex)
      },
      network_id: 3
    }
  },
  compilers: {
    solc: {
      version: "^0.8",    // Fetch exact version from solc-bin (default: truffle's version)
      // docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
      // settings: {          // See the solidity docs for advice about optimization and evmVersion
      //  optimizer: {
      //    enabled: false,
      //    runs: 200
      //  },
      //  evmVersion: "byzantium"
      // }
    }
  }
 
};

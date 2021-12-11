import * as dotenv from "dotenv";

import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-ganache";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";

dotenv.config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
    console.log(await account.getBalance());
  }
});

task("add_ethers", "Add ethers on Dispatcher")
    .addParam("contractAddress", "Contract address")
    .addParam("amount", "Token amount")
    .setAction(async function ({ contractAddress, amount }, { ethers }, runSuper) {
        const Dispatcher = await ethers.getContractFactory("Dispatcher")
        const dispatcher = Dispatcher.attach(contractAddress)
        const [owner] = await ethers.getSigners();
        const transactionHash = await owner.sendTransaction({
          to: dispatcher.address,
          value: ethers.utils.parseEther(amount), 
        });
        console.log(transactionHash);
    });

task("add_recipient", "Add a share holder on Dispatcher")
    .addParam("contractAddress", "Contract address")
    .addParam("recipientAddress", "Share holder address")
    .addParam("shares", "Shares")
    .setAction(async function ({ contractAddress, recipientAddress, shares }, { ethers }, runSuper) {
        const Dispatcher = await ethers.getContractFactory("Dispatcher");
        const dispatcher = Dispatcher.attach(contractAddress);
        await dispatcher.addShareHolder(recipientAddress, shares);
        console.log(await dispatcher.getShareHolderCount());
    });

task("dispatch", "Dispatch ethers from Dispatcher to share holders")
    .addParam("contractAddress", "Contract address")
    .setAction(async function ({ contractAddress }, { ethers }, runSuper) {
        const Dispatcher = await ethers.getContractFactory("Dispatcher");
        const dispatcher = Dispatcher.attach(contractAddress);
        console.log(await dispatcher.provider.getBalance(dispatcher.address));
        await dispatcher.dispatchBalance();
    });

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
  solidity: "0.8.4",
  networks: {
    ropsten: {
      url: process.env.ROPSTEN_URL || "",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};

export default config;

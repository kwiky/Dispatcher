import { expect } from "chai";
import { ethers } from "hardhat";
import { Signer } from "ethers";
import type { Dispatcher } from "../typechain/Dispatcher";

describe("Dispatcher", function () {

  let DispatcherContract;
  let dispatcher: Dispatcher;
  let signers: Signer[];
  let owner: Signer;
  let addr1: string;
  let addr2: string;
  let addr3: string;
  let addrs: string[];
  
  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    DispatcherContract = await ethers.getContractFactory("Dispatcher");
    signers = await ethers.getSigners();
    [owner] = signers;
    [addr1, addr2, addr3, ...addrs] = await Promise.all(signers.map(s => s.getAddress()));
  
    // To deploy our contract, we just have to call Token.deploy() and await
    // for it to be deployed(), which happens once its transaction has been
    // mined.
    dispatcher = await DispatcherContract.deploy();
  });
  
  it("Should add recipient", async function () {
    await dispatcher.addShareHolder(addr1, 50000);
    expect(await dispatcher.getShareHolderCount()).to.equal(1);

    await dispatcher.addShareHolder(addr2, 50000);
    expect(await dispatcher.getShareHolderCount()).to.equal(2);

    // Add already added address
    await dispatcher.addShareHolder(addr1, 50000);
    expect(await dispatcher.getShareHolderCount()).to.equal(2);
  });

  it("Should remove recipient", async function () {
    await dispatcher.addShareHolder(addr1, 50000)
    await dispatcher.addShareHolder(addr2, 50000)
    expect(await dispatcher.getShareHolderCount()).to.equal(2);

    await dispatcher.removeShareHolder(addr1);
    expect(await dispatcher.getShareHolderShares(addr1)).to.equal(0);

    // Remove unadded address
    await dispatcher.removeShareHolder(addr3);
    expect(await dispatcher.getShareHolderCount()).to.equal(2);
  });

  it("Should get total shares", async function () {
    await dispatcher.addShareHolder(addr1, 50000)
    await dispatcher.addShareHolder(addr2, 50000)

    expect(await dispatcher.getShareTotal()).to.equal(100000);

    await dispatcher.removeShareHolder(addr1);

    expect(await dispatcher.getShareTotal()).to.equal(50000);

    // Add already added address, but edit shares
    await dispatcher.addShareHolder(addr2, 30000);
    expect(await dispatcher.getShareTotal()).to.equal(30000);

    // Readd shareholder
    await dispatcher.addShareHolder(addr1, 50000);
    expect(await dispatcher.getShareTotal()).to.equal(80000);
  });

  it("Should get recipient shares", async function () {
    await dispatcher.addShareHolder(addr1, 50000);
    await dispatcher.addShareHolder(addr2, 50000);

    expect(await dispatcher.getShareHolderShares(addr1)).to.equal(50000);

    await dispatcher.removeShareHolder(addr1);

    expect(await dispatcher.getShareHolderShares(addr1)).to.equal(0);

    // Add already added address, but edit shares
    await dispatcher.addShareHolder(addr2, 30000);
    expect(await dispatcher.getShareHolderShares(addr2)).to.equal(30000);
  });

  it("Should dispatch ethers", async function () {
    await dispatcher.addShareHolder(addr2, 50000);
    await dispatcher.addShareHolder(addr3, 50000);
    
    const transactionHash = await owner.sendTransaction({
      to: dispatcher.address,
      value: ethers.utils.parseEther("2.0"), 
    });

    const balance = await dispatcher.getBalance();
    expect(balance).to.equal(ethers.utils.parseEther("2.0"));

    expect(await signers[1].getBalance()).to.equal(ethers.utils.parseEther("10000.00"));
    expect(await signers[2].getBalance()).to.equal(ethers.utils.parseEther("10000.00"));
    await dispatcher.dispatchBalance();
    
    expect(await signers[1].getBalance()).to.equal(ethers.utils.parseEther("10001.00"));
    expect(await signers[2].getBalance()).to.equal(ethers.utils.parseEther("10001.00"));
  });
});

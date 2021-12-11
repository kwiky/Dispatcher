# Dispatcher

This project is a study case to learn Solidity, OpenZepellin, Hardhat and other ethereum developer stuff.

## Documentation

Dispatcher is a smart contract which you can add share holders with a number of shares and dispatch ethers to those addresses

Example :
```typescript
  // Add a first share holder with 70 shares
  dispatcher.addShareHolder("0xdD2FD4581271e230360230F9337D5c0430Bf44C0", 70);

  // Add a second share holder with 30 shares
  dispatcher.addShareHolder("0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199", 30);

  // Send 70% of ethers to the first share holder
  // and 30% to the second one
  dispatcher.dispatchBalance();
```

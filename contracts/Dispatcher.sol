// contracts/Dispatcher.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Address.sol";

contract Dispatcher is Ownable {

  event Transfer(address indexed from, address indexed to, uint256 indexed amount);
  event Receive(address indexed from, uint256 indexed amount);

  using SafeMath for uint256;

  address[] public shareHolders;
  mapping(address => bool) public allShareHolders;
  mapping(address => uint256) public shareHolderShares;

  receive() external payable {
      emit Receive(msg.sender, msg.value);
  }

  /**
   * @dev Get balance on contract
   * @return The balance on contract
   */
  function getBalance() public view returns (uint) {
      return address(this).balance;
  }

  /**
   * @dev Add a share holder on contract
   * @param shareHolder The address of the new share holder
   * @param shares The amount of shares
   */
  function addShareHolder(address shareHolder, uint256 shares) public onlyOwner {
    if (!allShareHolders[shareHolder]) {
      shareHolders.push(shareHolder);
      allShareHolders[shareHolder] = true;
    }
    shareHolderShares[shareHolder] = shares;
  }

  /**
   * @dev Remove a share holder on contract
   * @param shareHolder The address of the share holder to delete
   */
  function removeShareHolder(address shareHolder) public onlyOwner {
    shareHolderShares[shareHolder] = 0;
  }

  /**
   * @dev Get the number of share holders
   * @return The number of share holders
   */
  function getShareHolderCount() public view returns (uint256) {
    return shareHolders.length;
  }

  /**
   * @dev Get total number of shares of all shareHolders
   * @return The total number of shares of all shareHolders
   */
  function getShareTotal() public view returns (uint256) {
    uint256 sharesTotal = 0;
    for (uint256 i = 0; i < shareHolders.length; i++) {
        address holder = shareHolders[i];
        sharesTotal += shareHolderShares[holder];
    }
    return sharesTotal;
  }

  /**
   * @dev Get number of shares of a shareholder
   * @param shareholder The address of shareholder
   * @return The number of shares of this shareHolder
   */
  function getShareHolderShares(address shareholder) public view returns (uint256) {
    return shareHolderShares[shareholder];
  }

  /**
   * @dev Dispatch all ethers on contract to share holders
   */
  function dispatchBalance() public onlyOwner {
    uint256 sum = getShareTotal();
    uint256 balance = getBalance();
    for (uint256 i = 0; i < shareHolders.length; i++) {
        address holder = shareHolders[i];
        uint256 amount = balance.mul(shareHolderShares[holder]).div(sum);
        _withdraw(payable(shareHolders[i]), amount);
    }
  }

  /**
   * @dev Send ethers to an address
   * @param recipient The address of recipient
   * @param amount Amount of ether to send
   */
  function _withdraw(address payable recipient, uint256 amount) private {
    Address.sendValue(recipient, amount);
    emit Transfer(address(this), recipient, amount);
  }
}

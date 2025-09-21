// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SimpleJetToken - Simple jet ownership token without bridge complexity
 * @dev Anyone can buy tokens with ETH - no roles required!
 */
contract SimpleJetToken is ERC20, Ownable {
    uint256 public tokenPriceWei = 0.01 ether; // 0.01 ETH per token (cheap for demo)
    
    event TokensPurchased(address indexed buyer, uint256 amount, uint256 ethPaid);
    
    constructor() ERC20("Simple Jet Token", "JET") Ownable(msg.sender) {
        // No complex roles - just simple ownership
    }
    
    /**
     * @dev Buy tokens with ETH - ANYONE CAN DO THIS!
     */
    function buyTokens() external payable {
        require(msg.value > 0, "Send ETH to buy tokens");
        
        // Calculate tokens (1 ETH = 100 tokens at 0.01 ETH per token)
        uint256 tokensToMint = (msg.value * 10**18) / tokenPriceWei;
        require(tokensToMint > 0, "Not enough ETH for 1 token");
        
        // Mint tokens directly to buyer - NO BRIDGE_ROLE NEEDED!
        _mint(msg.sender, tokensToMint);
        
        emit TokensPurchased(msg.sender, tokensToMint, msg.value);
    }
    
    /**
     * @dev Calculate how many tokens you get for X ETH
     */
    function calculateTokens(uint256 ethAmount) external view returns (uint256) {
        return (ethAmount * 10**18) / tokenPriceWei;
    }
    
    /**
     * @dev Update token price (owner only)
     */
    function setTokenPrice(uint256 _priceWei) external onlyOwner {
        tokenPriceWei = _priceWei;
    }
    
    /**
     * @dev Withdraw ETH from contract (owner only)
     */
    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}
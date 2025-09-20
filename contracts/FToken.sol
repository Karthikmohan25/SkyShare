// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title FToken (fSKY) - Fractional Sky Share Token
 * @dev ERC-20 token representing XRPL SKY-SHARE on Flare network
 * Enables fractional ownership of private jets with rental income distribution
 * 
 * MVP: Custodial bridge model (admin mint)
 * V1: Replace with FAssets trustless bridging protocol
 */
contract FToken is ERC20, AccessControl, ReentrancyGuard {
    bytes32 public constant BRIDGE_ROLE = keccak256("BRIDGE_ROLE");
    
    mapping(string => bool) public processedXrplTxs;
    uint256 public constant MAX_SUPPLY = 1000000 * 10**18; // 1M fSKY max
    
    event TokensMinted(address indexed to, uint256 amount, string xrplTxHash);
    event TokensBurned(address indexed from, uint256 amount, string xrplAddress);
    
    constructor() ERC20("Fractional Sky Share", "fSKY") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(BRIDGE_ROLE, msg.sender);
    }
    
    /**
     * @dev Mint fSKY tokens when XRPL SKY-SHARE is locked (custodial bridge)
     * TODO V1: Replace with FAssets trustless minting
     */
    function mint(
        address to,
        uint256 amount,
        string calldata xrplTxHash
    ) external onlyRole(BRIDGE_ROLE) nonReentrant {
        require(to != address(0), "FToken: mint to zero address");
        require(amount > 0, "FToken: amount must be positive");
        require(!processedXrplTxs[xrplTxHash], "FToken: tx already processed");
        require(totalSupply() + amount <= MAX_SUPPLY, "FToken: exceeds max supply");
        
        processedXrplTxs[xrplTxHash] = true;
        _mint(to, amount);
        emit TokensMinted(to, amount, xrplTxHash);
    }
    
    /**
     * @dev Burn fSKY to unlock XRPL SKY-SHARE (custodial bridge)
     * TODO V1: Replace with FAssets trustless burning
     */
    function burn(
        uint256 amount,
        string calldata xrplAddress
    ) external nonReentrant {
        require(amount > 0, "FToken: amount must be positive");
        require(bytes(xrplAddress).length > 0, "FToken: invalid XRPL address");
        
        _burn(msg.sender, amount);
        emit TokensBurned(msg.sender, amount, xrplAddress);
    }
    
    /**
     * @dev Add bridge operator (admin only)
     */
    function addBridgeOperator(address operator) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(BRIDGE_ROLE, operator);
    }
    
    /**
     * @dev Remove bridge operator (admin only)
     */
    function removeBridgeOperator(address operator) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(BRIDGE_ROLE, operator);
    }
    
    /**
     * @dev Check if XRPL transaction was processed
     */
    function isXrplTxProcessed(string calldata xrplTxHash) external view returns (bool) {
        return processedXrplTxs[xrplTxHash];
    }
}
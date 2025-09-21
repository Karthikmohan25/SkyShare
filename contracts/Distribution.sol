// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title Distribution
 * @dev Distributes rental payments to fSKY token holders pro-rata
 * Handles dust by leaving remainder in contract for next distribution
 * Uses scaled per-share math to prevent zero claimable amounts with small deposits
 * 
 * Production notes:
 * - Integrate with Flare's State Connector for automated rent collection
 * - Add oracle integration for real-time property valuations
 * - Implement governance for distribution parameters
 * - Add compliance checks for rent payment sources
 */
contract Distribution is Ownable, ReentrancyGuard {
    IERC20 public immutable fSkyToken;
    
    // Scaling factor to prevent integer division loss
    uint256 private constant ACC_SCALE = 1e18;
    
    struct DistributionRound {
        uint256 totalAmount;
        uint256 totalSupply;
        uint256 timestamp;
        uint256 dustRemaining;
        uint256 perShareScaled; // amount per token, scaled by ACC_SCALE
    }
    
    mapping(uint256 => DistributionRound) public distributions;
    mapping(address => mapping(uint256 => bool)) public claimed;
    
    uint256 public currentRound;
    uint256 public totalDustAccumulated;
    
    event RentDeposited(address indexed depositor, uint256 amount, uint256 round);
    event DistributionCalculated(uint256 indexed round, uint256 totalAmount, uint256 totalSupply, uint256 dust);
    event PaymentClaimed(address indexed holder, uint256 indexed round, uint256 amount);
    event DustWithdrawn(address indexed owner, uint256 amount);
    
    constructor(address _fSkyToken, address _owner) Ownable(_owner) {
        fSkyToken = IERC20(_fSkyToken);
    }
    
    /**
     * @dev Deposit rent payment for distribution
     * In production: This would be called by oracle/relayer from State Connector
     */
    function depositRent() external payable {
        require(msg.value > 0, "No rent to distribute");
        
        uint256 totalSupply = fSkyToken.totalSupply();
        require(totalSupply > 0, "No token holders");
        
        currentRound++;
        
        // Add any accumulated dust to this distribution
        uint256 totalToDistribute = msg.value + totalDustAccumulated;
        totalDustAccumulated = 0;
        
        // Use scaled per-share math to prevent integer division loss
        uint256 perShareScaled = (totalToDistribute * ACC_SCALE) / totalSupply;
        uint256 distributed = (perShareScaled * totalSupply) / ACC_SCALE;
        uint256 dust = totalToDistribute - distributed;
        
        distributions[currentRound] = DistributionRound({
            totalAmount: distributed,
            totalSupply: totalSupply,
            timestamp: block.timestamp,
            dustRemaining: dust,
            perShareScaled: perShareScaled
        });
        
        totalDustAccumulated += dust;
        
        emit RentDeposited(msg.sender, msg.value, currentRound);
        emit DistributionCalculated(currentRound, distributed, totalSupply, dust);
    }
    
    /**
     * @dev Calculate claimable amount for a holder in a specific round
     */
    function getClaimableAmount(address holder, uint256 round) public view returns (uint256) {
        if (round == 0 || round > currentRound || claimed[holder][round]) {
            return 0;
        }
        
        DistributionRound memory dist = distributions[round];
        uint256 holderBalance = fSkyToken.balanceOf(holder);
        
        if (holderBalance == 0 || dist.totalSupply == 0) {
            return 0;
        }
        
        // Use scaled per-share math for precise calculation
        return (holderBalance * dist.perShareScaled) / ACC_SCALE;
    }
    
    /**
     * @dev Claim payment for a specific round
     */
    function claimPayment(uint256 round) external {
        _claimPayment(round);
    }
    
    /**
     * @dev Claim payments for multiple rounds
     */
    function claimMultipleRounds(uint256[] calldata rounds) external {
        for (uint256 i = 0; i < rounds.length; i++) {
            if (!claimed[msg.sender][rounds[i]] && getClaimableAmount(msg.sender, rounds[i]) > 0) {
                _claimPayment(rounds[i]);
            }
        }
    }
    
    /**
     * @dev Internal claim payment function
     */
    function _claimPayment(uint256 round) internal nonReentrant {
        require(round > 0 && round <= currentRound, "Invalid round");
        require(!claimed[msg.sender][round], "Already claimed");
        
        uint256 amount = getClaimableAmount(msg.sender, round);
        require(amount > 0, "Nothing to claim");
        
        claimed[msg.sender][round] = true;
        
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Payment failed");
        
        emit PaymentClaimed(msg.sender, round, amount);
    }
    
    /**
     * @dev Get all unclaimed rounds for a holder
     */
    function getUnclaimedRounds(address holder) external view returns (uint256[] memory) {
        uint256[] memory unclaimed = new uint256[](currentRound);
        uint256 count = 0;
        
        for (uint256 i = 1; i <= currentRound; i++) {
            if (!claimed[holder][i] && getClaimableAmount(holder, i) > 0) {
                unclaimed[count] = i;
                count++;
            }
        }
        
        // Resize array
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = unclaimed[i];
        }
        
        return result;
    }
    
    /**
     * @dev Owner can withdraw accumulated dust (emergency function)
     */
    function withdrawDust() external onlyOwner {
        uint256 amount = totalDustAccumulated;
        require(amount > 0, "No dust to withdraw");
        
        totalDustAccumulated = 0;
        
        (bool success, ) = payable(owner()).call{value: amount}("");
        require(success, "Dust withdrawal failed");
        
        emit DustWithdrawn(owner(), amount);
    }
    
    /**
     * @dev Get contract balance
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
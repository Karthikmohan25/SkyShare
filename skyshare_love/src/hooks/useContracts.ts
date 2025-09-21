import { useState, useEffect, useRef } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '@/contexts/Web3Context';
import FTokenABI from '@/abi/FToken.json';
import DistributionABI from '@/abi/Distribution.json';

interface ContractAddresses {
  FToken: string;
  Distribution: string;
  network: string;
  deployer: string;
}

export interface ContractData {
  userFsky: string;
  totalSupply: string;
  currentRound: number;
  contractC2FLR: string;
  totalClaimable: string;
}

export const useContracts = () => {
  const { provider, signer, address, isCoston2 } = useWeb3();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addresses, setAddresses] = useState<ContractAddresses | null>(null);
  const contractsRef = useRef<{
    fToken: ethers.Contract | null;
    distribution: ethers.Contract | null;
  }>({ fToken: null, distribution: null });

  // Load contract addresses on mount
  useEffect(() => {
    const loadAddresses = async () => {
      try {
        const response = await fetch('/deployed-addresses.json');
        const data = await response.json();
        setAddresses(data);
        console.log('📋 Loaded contract addresses:', data);
      } catch (err) {
        console.error('❌ Failed to load contract addresses:', err);
      }
    };
    loadAddresses();
  }, []);

  // Initialize contracts when signer and addresses are available
  useEffect(() => {
    if (signer && addresses && isCoston2) {
      try {
        const fToken = new ethers.Contract(addresses.FToken, FTokenABI, signer);
        const distribution = new ethers.Contract(addresses.Distribution, DistributionABI, signer);
        
        contractsRef.current = { fToken, distribution };
        
        console.log('🔗 Contracts initialized:');
        console.log('  FToken:', addresses.FToken);
        console.log('  Distribution:', addresses.Distribution);
        console.log('  Explorer links:');
        console.log('    FToken: https://coston2-explorer.flare.network/address/' + addresses.FToken);
        console.log('    Distribution: https://coston2-explorer.flare.network/address/' + addresses.Distribution);
      } catch (err) {
        console.error('❌ Failed to initialize contracts:', err);
      }
    } else {
      contractsRef.current = { fToken: null, distribution: null };
    }
  }, [signer, addresses, isCoston2]);

  // Read all contract data
  const readAll = async (): Promise<ContractData> => {
    if (!signer || !address || !addresses || !isCoston2) {
      return {
        userFsky: '0',
        totalSupply: '0',
        currentRound: 0,
        contractC2FLR: '0',
        totalClaimable: '0'
      };
    }

    const { fToken, distribution } = contractsRef.current;
    if (!fToken || !distribution) {
      throw new Error('Contracts not initialized');
    }

    try {
      console.log('📊 Reading contract data...');
      
      const [userBal, total, round] = await Promise.all([
        fToken.balanceOf(address),
        fToken.totalSupply(),
        distribution.currentRound(),
      ]);

      const distBal = await provider!.getBalance(addresses.Distribution);

      // Calculate total claimable across all rounds
      let totalClaimable = 0n;
      const currentRoundNum = Number(round);
      
      if (currentRoundNum > 0) {
        // Check all rounds for claimable amounts
        for (let i = 1; i <= currentRoundNum; i++) {
          try {
            const claimable = await distribution.getClaimableAmount(address, i);
            if (claimable > 0n) {
              totalClaimable += claimable;
              console.log(`💰 Round ${i} claimable:`, ethers.formatEther(claimable), 'C2FLR');
            }
          } catch (err) {
            // Round might not exist or already claimed
            console.log(`No claimable amount for round ${i}`);
          }
        }
      }

      const result = {
        userFsky: ethers.formatEther(userBal),
        totalSupply: ethers.formatEther(total),
        currentRound: Number(round),
        contractC2FLR: ethers.formatEther(distBal),
        totalClaimable: ethers.formatEther(totalClaimable)
      };

      console.log('📊 Contract data:', result);
      console.log('🔢 Raw values (bigint):');
      console.log('  userBal:', userBal.toString());
      console.log('  total:', total.toString());
      console.log('  round:', round.toString());
      console.log('  distBal:', distBal.toString());

      return result;
    } catch (err) {
      console.error('❌ Error reading contract data:', err);
      throw err;
    }
  };

  // Deposit rent
  const depositRent = async (amountStr: string): Promise<string> => {
    if (!signer || !addresses || !isCoston2) {
      throw new Error('Wallet not connected or not on Coston2');
    }

    const { distribution } = contractsRef.current;
    if (!distribution) {
      throw new Error('Distribution contract not initialized');
    }

    setLoading(true);
    setError(null);

    try {
      console.log('💰 Depositing rent:', amountStr, 'C2FLR');
      
      const tx = await distribution.depositRent({ 
        value: ethers.parseEther(amountStr) 
      });
      
      console.log('📝 Transaction sent:', tx.hash);
      console.log('🔗 Explorer: https://coston2-explorer.flare.network/tx/' + tx.hash);
      
      await tx.wait();
      console.log('✅ Rent deposited successfully');
      
      return tx.hash;
    } catch (err: any) {
      console.error('❌ Error depositing rent:', err);
      setError(err.message || 'Failed to deposit rent');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Claim payment
  const claimPayment = async (): Promise<string> => {
    if (!signer || !addresses || !isCoston2) {
      throw new Error('Wallet not connected or not on Coston2');
    }

    const { distribution } = contractsRef.current;
    if (!distribution) {
      throw new Error('Distribution contract not initialized');
    }

    setLoading(true);
    setError(null);

    try {
      const userAddress = await signer.getAddress();
      
      // Get current round to claim
      const currentRound = await distribution.currentRound();
      const roundNum = Number(currentRound);
      
      if (roundNum === 0) {
        throw new Error('No distribution rounds available');
      }

      // Check if there's anything to claim
      const claimableAmount = await distribution.getClaimableAmount(userAddress, roundNum);
      console.log('💰 Claimable amount for round', roundNum, ':', ethers.formatEther(claimableAmount), 'C2FLR');
      
      if (claimableAmount === 0n) {
        throw new Error('No claimable amount available for current round');
      }

      console.log('💸 Claiming payment for round:', roundNum);
      
      const tx = await distribution.claimPayment(roundNum);
      
      console.log('📝 Transaction sent:', tx.hash);
      console.log('🔗 Explorer: https://coston2-explorer.flare.network/tx/' + tx.hash);
      
      await tx.wait();
      console.log('✅ Payment claimed successfully');
      
      return tx.hash;
    } catch (err: any) {
      console.error('❌ Error claiming payment:', err);
      setError(err.message || 'Failed to claim payment');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Check if user has bridge role (for mint button)
  const hasBridgeRole = async (userAddress: string): Promise<boolean> => {
    if (!addresses || !isCoston2) return false;

    const { fToken } = contractsRef.current;
    if (!fToken) return false;

    try {
      const BRIDGE_ROLE = ethers.keccak256(ethers.toUtf8Bytes("BRIDGE_ROLE"));
      const hasRole = await fToken.hasRole(BRIDGE_ROLE, userAddress);
      console.log('🔐 Bridge role check for', userAddress, ':', hasRole);
      return hasRole;
    } catch (err) {
      console.error('Error checking bridge role:', err);
      return false;
    }
  };

  // Mint demo tokens (only if user has BRIDGE_ROLE)
  const mintDemo = async (to: string, amountStr: string): Promise<string> => {
    if (!signer || !addresses || !isCoston2) {
      throw new Error('Wallet not connected or not on Coston2');
    }

    const { fToken } = contractsRef.current;
    if (!fToken) {
      throw new Error('FToken contract not initialized');
    }

    // Check bridge role first
    const signerAddress = await signer.getAddress();
    const canMint = await hasBridgeRole(signerAddress);
    if (!canMint) {
      throw new Error('Mint requires BRIDGE_ROLE. Grant role to this address first.');
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🪙 Minting tokens:', amountStr, 'to', to);
      
      const demoTxHash = `demo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const tx = await fToken.mint(to, ethers.parseEther(amountStr), demoTxHash);
      
      console.log('📝 Transaction sent:', tx.hash);
      console.log('🔗 Explorer: https://coston2-explorer.flare.network/tx/' + tx.hash);
      
      await tx.wait();
      console.log('✅ Tokens minted successfully');
      
      return tx.hash;
    } catch (err: any) {
      console.error('❌ Error minting tokens:', err);
      setError(err.message || 'Failed to mint tokens');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    addresses,
    readAll,
    depositRent,
    claimPayment,
    hasBridgeRole,
    mintDemo,
  };
};
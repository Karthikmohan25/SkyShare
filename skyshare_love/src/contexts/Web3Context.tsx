import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';

// Flare Coston2 Testnet configuration
const FLARE_COSTON2 = {
  chainId: '0x72', // 114 in hex
  chainName: 'Flare Testnet Coston2',
  nativeCurrency: {
    name: 'Coston2 Flare',
    symbol: 'C2FLR',
    decimals: 18,
  },
  rpcUrls: ['https://coston2-api.flare.network/ext/C/rpc'],
  blockExplorerUrls: ['https://coston2-explorer.flare.network/'],
};

interface Web3ContextType {
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  address: string | null;
  chainId: number | null;
  isCoston2: boolean;
  isConnected: boolean;
  isConnecting: boolean;
  balance: string;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const Web3Provider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [balance, setBalance] = useState('0');

  const isConnected = !!address;
  const isCoston2 = chainId === 114;

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask to use this application');
      return;
    }

    setIsConnecting(true);
    try {
      console.log('🔗 Connecting wallet...');
      
      // Create provider and request accounts
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      await browserProvider.send("eth_requestAccounts", []);
      
      // Get network info
      const network = await browserProvider.getNetwork();
      const currentChainId = Number(network.chainId);
      
      console.log('🌐 Current chainId:', currentChainId);
      
      // Switch to Coston2 if needed
      if (currentChainId !== 114) {
        console.log('🔄 Switching to Coston2...');
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0x72" }],
          });
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            // Network doesn't exist, add it
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [FLARE_COSTON2],
            });
          } else {
            throw switchError;
          }
        }
        // Refresh network info after switch
        const newNetwork = await browserProvider.getNetwork();
        setChainId(Number(newNetwork.chainId));
      } else {
        setChainId(currentChainId);
      }

      // Get signer and address
      const web3Signer = await browserProvider.getSigner();
      const userAddress = await web3Signer.getAddress();
      
      console.log('👤 Connected address:', userAddress);
      console.log('⛓️ Chain ID:', chainId || currentChainId);

      setProvider(browserProvider);
      setSigner(web3Signer);
      setAddress(userAddress);

      // Load balance
      await loadBalance(browserProvider, userAddress);

    } catch (error) {
      console.error('❌ Failed to connect wallet:', error);
      alert('Failed to connect wallet. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const loadBalance = async (
    browserProvider: ethers.BrowserProvider,
    userAddress: string
  ) => {
    try {
      const ethBalance = await browserProvider.getBalance(userAddress);
      const formattedBalance = ethers.formatEther(ethBalance);
      setBalance(formattedBalance);
      console.log('💰 C2FLR Balance:', formattedBalance);
    } catch (error) {
      console.error('Failed to load balance:', error);
    }
  };

  const disconnectWallet = () => {
    setProvider(null);
    setSigner(null);
    setAddress(null);
    setChainId(null);
    setBalance('0');
    console.log('🔌 Wallet disconnected');
  };

  // Listen for account and chain changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else if (accounts[0] !== address) {
          setAddress(accounts[0]);
          if (provider) {
            loadBalance(provider, accounts[0]);
          }
        }
      };

      const handleChainChanged = (newChainId: string) => {
        const numChainId = parseInt(newChainId, 16);
        setChainId(numChainId);
        console.log('🔄 Chain changed to:', numChainId);
        if (numChainId !== 114) {
          console.warn('⚠️ Not on Coston2! Please switch to Flare Testnet (Coston2)');
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [address, provider]);

  // Auto-connect if previously connected
  useEffect(() => {
    const autoConnect = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({
            method: 'eth_accounts',
          });
          if (accounts.length > 0) {
            await connectWallet();
          }
        } catch (error) {
          console.error('Auto-connect failed:', error);
        }
      }
    };

    autoConnect();
  }, []);

  const value: Web3ContextType = {
    provider,
    signer,
    address,
    chainId,
    isCoston2,
    isConnected,
    isConnecting,
    balance,
    connectWallet,
    disconnectWallet,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}
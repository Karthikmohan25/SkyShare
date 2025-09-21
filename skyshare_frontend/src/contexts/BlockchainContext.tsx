import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';

// Contract ABIs - Exact match with deployed contracts
const FTOKEN_ABI = [
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function mint(address to, uint256 amount, string xrplTxHash)",
  "function hasRole(bytes32 role, address account) view returns (bool)",
  "function BRIDGE_ROLE() view returns (bytes32)"
];

const DISTRIBUTION_ABI = [
  "function currentRound() view returns (uint256)",
  "function getClaimableAmount(address holder, uint256 round) view returns (uint256)",
  "function getUnclaimedRounds(address holder) view returns (uint256[])",
  "function claimPayment(uint256 round)",
  "function depositRent() payable",
  "function totalDustAccumulated() view returns (uint256)",
  "function getContractBalance() view returns (uint256)",
  "function distributions(uint256) view returns (uint256 totalAmount, uint256 totalSupply, uint256 timestamp, uint256 dustRemaining, uint256 perShareScaled)"
];

// Network configuration for Coston2
const COSTON2_CONFIG = {
  chainId: '0x72', // 114 in hex
  chainName: 'Flare Testnet Coston2',
  nativeCurrency: {
    name: 'Coston2 Flare',
    symbol: 'C2FLR',
    decimals: 18
  },
  rpcUrls: ['https://coston2-api.flare.network/ext/C/rpc'],
  blockExplorerUrls: ['https://coston2-explorer.flare.network/']
};

interface ContractAddresses {
  fToken: string;
  distribution: string;
  network: string;
}

interface BlockchainContextType {
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  account: string;
  fToken: ethers.Contract | null;
  distribution: ethers.Contract | null;
  balances: {
    eth: string;
    fSky: string;
    claimable: string;
  };
  contractInfo: {
    totalSupply: string;
    currentRound: string;
    totalDust: string;
    contractBalance: string;
  };
  isConnected: boolean;
  isLoading: boolean;
  connectWallet: () => Promise<void>;
  refreshBalances: () => Promise<void>;
  mintTokens: (amount: string) => Promise<string>;
  depositRent: (amount: string) => Promise<string>;
  claimPayment: () => Promise<string>;
  checkBridgeRole: () => Promise<boolean>;
}

const BlockchainContext = createContext<BlockchainContextType | undefined>(undefined);

export const useBlockchain = () => {
  const context = useContext(BlockchainContext);
  if (!context) {
    throw new Error('useBlockchain must be used within a BlockchainProvider');
  }
  return context;
};

interface BlockchainProviderProps {
  children: ReactNode;
}

export const BlockchainProvider: React.FC<BlockchainProviderProps> = ({ children }) => {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [account, setAccount] = useState<string>('');
  const [fToken, setFToken] = useState<ethers.Contract | null>(null);
  const [distribution, setDistribution] = useState<ethers.Contract | null>(null);
  const [contractAddresses, setContractAddresses] = useState<ContractAddresses>({
    fToken: '',
    distribution: '',
    network: ''
  });
  const [balances, setBalances] = useState({
    eth: '0',
    fSky: '0',
    claimable: '0'
  });
  const [contractInfo, setContractInfo] = useState({
    totalSupply: '0',
    currentRound: '0',
    totalDust: '0',
    contractBalance: '0'
  });
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load deployed addresses
  const loadDeployedAddresses = async (): Promise<ContractAddresses | null> => {
    try {
      const response = await fetch('/deployed-addresses.json');
      if (response.ok) {
        const addresses = await response.json();
        const newAddresses = {
          fToken: addresses.FToken,
          distribution: addresses.Distribution,
          network: addresses.network || 'coston2'
        };
        setContractAddresses(newAddresses);
        console.log('📄 Loaded deployed addresses:', addresses);
        return newAddresses;
      }
    } catch (error) {
      console.log('⚠️  Using default addresses (deployed-addresses.json not found)');
    }
    return null;
  };

  // Switch to Coston2 network
  const switchToCoston2 = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: COSTON2_CONFIG.chainId }],
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [COSTON2_CONFIG],
          });
        } catch (addError) {
          console.error('Failed to add Coston2 network:', addError);
        }
      } else {
        console.error('Failed to switch to Coston2 network:', switchError);
      }
    }
  };

  // Ensure Coston2 network
  const ensureCoston2 = async (provider: ethers.BrowserProvider): Promise<boolean> => {
    const network = await provider.getNetwork();
    console.log('🔗 Current Chain ID:', network.chainId.toString());
    
    if (network.chainId !== 114n) {
      console.log('❌ Wrong network detected. Expected Coston2 (114)');
      const switchNetwork = window.confirm("You're connected to the wrong network. Switch to Flare Testnet Coston2?");
      if (switchNetwork) {
        await switchToCoston2();
        return false; // Will reload
      } else {
        throw new Error("Wrong network - please switch to Coston2");
      }
    }
    return true;
  };

  // Initialize blockchain connection
  const initializeBlockchain = async (addresses: ContractAddresses) => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        
        // Ensure we're on Coston2
        const isCorrectNetwork = await ensureCoston2(provider);
        if (!isCorrectNetwork) {
          window.location.reload();
          return;
        }

        setProvider(provider);
        
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const signer = await provider.getSigner();
        setSigner(signer);
        
        const address = await signer.getAddress();
        setAccount(address);
        
        console.log('👤 Connected Address:', address);
        
        const fTokenContract = new ethers.Contract(addresses.fToken, FTOKEN_ABI, signer);
        const distributionContract = new ethers.Contract(addresses.distribution, DISTRIBUTION_ABI, signer);
        
        setFToken(fTokenContract);
        setDistribution(distributionContract);
        
        console.log('📋 Contracts initialized successfully');
        
        await loadBalances(address, fTokenContract, distributionContract, provider);
        await loadContractInfo(fTokenContract, distributionContract, provider);
        
        setIsConnected(true);
      } catch (error) {
        console.error('Failed to initialize blockchain:', error);
        throw error;
      }
    } else {
      throw new Error('Please install MetaMask to use this application.');
    }
  };

  // Load balances
  const loadBalances = async (
    address: string, 
    fTokenContract: ethers.Contract, 
    distributionContract: ethers.Contract, 
    provider: ethers.BrowserProvider
  ) => {
    try {
      console.log('💰 Loading balances for address:', address);
      
      const ethBalance = await provider.getBalance(address);
      const fSkyBalance = await fTokenContract.balanceOf(address);
      
      console.log('💎 Raw ETH balance:', ethBalance.toString());
      console.log('💎 Raw fSKY balance:', fSkyBalance.toString());
      
      const currentRound = await distributionContract.currentRound();
      console.log('🔄 Current round (raw):', currentRound.toString(), 'type:', typeof currentRound);
      
      let claimableAmount = '0';
      
      // Fix BigInt comparison
      if (Number(currentRound) > 0) {
        claimableAmount = await distributionContract.getClaimableAmount(address, currentRound);
        console.log('💰 Raw claimable amount:', claimableAmount.toString());
      }
      
      const newBalances = {
        eth: ethers.formatEther(ethBalance),
        fSky: ethers.formatEther(fSkyBalance),
        claimable: ethers.formatEther(claimableAmount)
      };
      
      console.log('📊 Formatted balances:', newBalances);
      setBalances(newBalances);
    } catch (error) {
      console.error('Failed to load balances:', error);
    }
  };

  // Load contract info
  const loadContractInfo = async (fTokenContract: ethers.Contract, distributionContract: ethers.Contract, provider: ethers.BrowserProvider) => {
    try {
      const totalSupply = await fTokenContract.totalSupply();
      const currentRound = await distributionContract.currentRound();
      const totalDust = await distributionContract.totalDustAccumulated();
      
      // Get contract balance directly from provider
      const contractBalance = await provider.getBalance(await distributionContract.getAddress());
      
      console.log('📈 Contract info (raw):', {
        totalSupply: totalSupply.toString(),
        currentRound: currentRound.toString(),
        totalDust: totalDust.toString(),
        contractBalance: contractBalance.toString()
      });
      
      const formattedInfo = {
        totalSupply: ethers.formatEther(totalSupply),
        currentRound: Number(currentRound).toString(), // Convert BigInt to number then string
        totalDust: ethers.formatEther(totalDust),
        contractBalance: ethers.formatEther(contractBalance)
      };
      
      console.log('📊 Formatted contract info:', formattedInfo);
      setContractInfo(formattedInfo);
    } catch (error) {
      console.error('Failed to load contract info:', error);
    }
  };

  // Connect wallet
  const connectWallet = async () => {
    setIsLoading(true);
    try {
      const addresses = await loadDeployedAddresses();
      if (addresses) {
        await initializeBlockchain(addresses);
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh balances
  const refreshBalances = async () => {
    if (fToken && distribution && account && provider) {
      await loadBalances(account, fToken, distribution, provider);
      await loadContractInfo(fToken, distribution, provider);
    }
  };

  // Check if user has bridge role
  const checkBridgeRole = async (): Promise<boolean> => {
    if (!fToken || !signer) return false;
    
    try {
      const signerAddress = await signer.getAddress();
      const bridgeRole = await fToken.BRIDGE_ROLE();
      const hasBridgeRole = await fToken.hasRole(bridgeRole, signerAddress);
      console.log('🔑 Bridge role check:', { signerAddress, hasBridgeRole });
      return hasBridgeRole;
    } catch (error) {
      console.error('Failed to check bridge role:', error);
      return false;
    }
  };

  // Mint tokens
  const mintTokens = async (amount: string): Promise<string> => {
    if (!fToken || !signer) throw new Error('Contracts not initialized');
    
    // Check bridge role first
    const hasBridgeRole = await checkBridgeRole();
    if (!hasBridgeRole) {
      throw new Error('Address does not have BRIDGE_ROLE. Only bridge operators can mint tokens.');
    }
    
    const signerAddress = await signer.getAddress();
    const amt = ethers.parseEther(amount);
    const att = ethers.hexlify(ethers.randomBytes(32));
    
    console.log('🪙 Minting tokens:', { to: signerAddress, amount: amt.toString(), attestation: att });
    
    const tx = await fToken.mint(signerAddress, amt, att);
    console.log('📤 Mint transaction submitted:', tx.hash);
    await tx.wait();
    
    await refreshBalances();
    return tx.hash;
  };

  // Deposit rent
  const depositRent = async (amount: string): Promise<string> => {
    if (!distribution) throw new Error('Distribution contract not initialized');
    
    const tx = await distribution.depositRent({ value: ethers.parseEther(amount) });
    await tx.wait();
    
    await refreshBalances();
    return tx.hash;
  };

  // Claim payment
  const claimPayment = async (): Promise<string> => {
    if (!distribution) throw new Error('Distribution contract not initialized');
    
    const currentRound = await distribution.currentRound();
    console.log('🎯 Claiming for round:', currentRound.toString(), 'type:', typeof currentRound);
    
    // Fix BigInt comparison - use Number() conversion
    if (Number(currentRound) === 0) {
      throw new Error('No distribution rounds available to claim.');
    }
    
    const tx = await distribution.claimPayment(currentRound);
    console.log('📤 Claim transaction submitted:', tx.hash);
    await tx.wait();
    
    await refreshBalances();
    return tx.hash;
  };

  // Initialize on mount and set up listeners
  useEffect(() => {
    const init = async () => {
      const addresses = await loadDeployedAddresses();
      if (addresses && window.ethereum) {
        // Check if already connected
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            await initializeBlockchain(addresses);
          }
        } catch (error) {
          console.log('Not connected to wallet');
        }

        // Set up event listeners
        const handleChainChanged = (chainId: string) => {
          console.log('🔄 Chain changed to:', parseInt(chainId, 16));
          window.location.reload();
        };

        const handleAccountsChanged = (accounts: string[]) => {
          console.log('👤 Accounts changed:', accounts);
          if (accounts.length === 0) {
            // Disconnected
            setIsConnected(false);
            setAccount('');
            setFToken(null);
            setDistribution(null);
          } else {
            // Account changed, reinitialize
            window.location.reload();
          }
        };

        window.ethereum.on('chainChanged', handleChainChanged);
        window.ethereum.on('accountsChanged', handleAccountsChanged);

        // Cleanup listeners
        return () => {
          if (window.ethereum.removeListener) {
            window.ethereum.removeListener('chainChanged', handleChainChanged);
            window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          }
        };
      }
    };
    
    init();
  }, []);

  const value: BlockchainContextType = {
    provider,
    signer,
    account,
    fToken,
    distribution,
    balances,
    contractInfo,
    isConnected,
    isLoading,
    connectWallet,
    refreshBalances,
    mintTokens,
    depositRent,
    claimPayment,
    checkBridgeRole
  };

  return (
    <BlockchainContext.Provider value={value}>
      {children}
    </BlockchainContext.Provider>
  );
};
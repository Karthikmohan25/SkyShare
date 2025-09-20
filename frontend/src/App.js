import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './App.css';

// Contract ABIs (simplified for demo)
const FTOKEN_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function balanceOf(address) view returns (uint256)",
  "function totalSupply() view returns (uint256)",
  "function mintFromBridge(address to, uint256 amount, string calldata xrplTxHash)",
  "function hasRole(bytes32 role, address account) view returns (bool)",
  "function BRIDGE_ROLE() view returns (bytes32)",
  "event TokensMinted(address indexed to, uint256 amount, string xrplTxHash)"
];

const DISTRIBUTION_ABI = [
  "function currentRound() view returns (uint256)",
  "function getClaimableAmount(address holder, uint256 round) view returns (uint256)",
  "function getUnclaimedRounds(address holder) view returns (uint256[])",
  "function claimPayment(uint256 round)",
  "function depositRent() payable",
  "function totalDustAccumulated() view returns (uint256)",
  "function getContractBalance() view returns (uint256)",
  "function distributions(uint256) view returns (uint256 totalAmount, uint256 totalSupply, uint256 timestamp, uint256 dustRemaining)",
  "event RentDeposited(address indexed depositor, uint256 amount, uint256 round)",
  "event PaymentClaimed(address indexed holder, uint256 indexed round, uint256 amount)"
];

function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState('');
  const [fToken, setFToken] = useState(null);
  const [distribution, setDistribution] = useState(null);
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
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [mintAmount, setMintAmount] = useState('100');
  const [rentAmount, setRentAmount] = useState('10');
  const [transactions, setTransactions] = useState([]);

  // Contract addresses (these would be loaded from deployment)
  const CONTRACT_ADDRESSES = {
    fToken: '0x5FbDB2315678afecb367f032d93F642f64180aa3', // Default Hardhat address
    distribution: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512' // Default Hardhat address
  };

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        setProvider(provider);
        
        // Request account access
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const signer = await provider.getSigner();
        setSigner(signer);
        
        const address = await signer.getAddress();
        setAccount(address);
        
        // Initialize contracts
        const fTokenContract = new ethers.Contract(CONTRACT_ADDRESSES.fToken, FTOKEN_ABI, signer);
        const distributionContract = new ethers.Contract(CONTRACT_ADDRESSES.distribution, DISTRIBUTION_ABI, signer);
        
        setFToken(fTokenContract);
        setDistribution(distributionContract);
        
        // Load initial data
        await loadBalances(address, fTokenContract, distributionContract, provider);
        await loadContractInfo(fTokenContract, distributionContract);
        
        setStatus({ type: 'success', message: 'Connected to wallet successfully!' });
      } catch (error) {
        console.error('Failed to initialize:', error);
        setStatus({ type: 'error', message: 'Failed to connect to wallet. Make sure you have MetaMask installed and are connected to the correct network.' });
      }
    } else {
      setStatus({ type: 'error', message: 'Please install MetaMask to use this application.' });
    }
  };

  const loadBalances = async (address, fTokenContract, distributionContract, provider) => {
    try {
      const ethBalance = await provider.getBalance(address);
      const fSkyBalance = await fTokenContract.balanceOf(address);
      
      // Get claimable amount for current round
      const currentRound = await distributionContract.currentRound();
      let claimableAmount = '0';
      if (currentRound > 0) {
        claimableAmount = await distributionContract.getClaimableAmount(address, currentRound);
      }
      
      setBalances({
        eth: ethers.formatEther(ethBalance),
        fSky: ethers.formatEther(fSkyBalance),
        claimable: ethers.formatEther(claimableAmount)
      });
    } catch (error) {
      console.error('Failed to load balances:', error);
    }
  };

  const loadContractInfo = async (fTokenContract, distributionContract) => {
    try {
      const totalSupply = await fTokenContract.totalSupply();
      const currentRound = await distributionContract.currentRound();
      const totalDust = await distributionContract.totalDustAccumulated();
      const contractBalance = await distributionContract.getContractBalance();
      
      setContractInfo({
        totalSupply: ethers.formatEther(totalSupply),
        currentRound: currentRound.toString(),
        totalDust: ethers.formatEther(totalDust),
        contractBalance: ethers.formatEther(contractBalance)
      });
    } catch (error) {
      console.error('Failed to load contract info:', error);
    }
  };

  const handleMint = async () => {
    if (!fToken || !mintAmount) return;
    
    setLoading(true);
    try {
      const amount = ethers.parseEther(mintAmount);
      const xrplTxHash = '0x' + Math.random().toString(16).substr(2, 64); // Simulate XRPL tx hash
      
      const tx = await fToken.mintFromBridge(account, amount, xrplTxHash);
      setStatus({ type: 'info', message: 'Minting transaction submitted...' });
      
      const receipt = await tx.wait();
      
      setTransactions(prev => [{
        type: 'Mint',
        hash: receipt.hash,
        amount: mintAmount + ' fSKY',
        timestamp: new Date().toLocaleTimeString()
      }, ...prev.slice(0, 9)]);
      
      await loadBalances(account, fToken, distribution, provider);
      await loadContractInfo(fToken, distribution);
      
      setStatus({ type: 'success', message: `Successfully minted ${mintAmount} fSKY tokens!` });
    } catch (error) {
      console.error('Mint failed:', error);
      setStatus({ type: 'error', message: 'Mint failed: ' + error.message });
    }
    setLoading(false);
  };

  const handleDepositRent = async () => {
    if (!distribution || !rentAmount) return;
    
    setLoading(true);
    try {
      const amount = ethers.parseEther(rentAmount);
      
      const tx = await distribution.depositRent({ value: amount });
      setStatus({ type: 'info', message: 'Rent deposit transaction submitted...' });
      
      const receipt = await tx.wait();
      
      setTransactions(prev => [{
        type: 'Rent Deposit',
        hash: receipt.hash,
        amount: rentAmount + ' ETH',
        timestamp: new Date().toLocaleTimeString()
      }, ...prev.slice(0, 9)]);
      
      await loadBalances(account, fToken, distribution, provider);
      await loadContractInfo(fToken, distribution);
      
      setStatus({ type: 'success', message: `Successfully deposited ${rentAmount} ETH for distribution!` });
    } catch (error) {
      console.error('Rent deposit failed:', error);
      setStatus({ type: 'error', message: 'Rent deposit failed: ' + error.message });
    }
    setLoading(false);
  };

  const handleClaimPayment = async () => {
    if (!distribution) return;
    
    setLoading(true);
    try {
      const currentRound = await distribution.currentRound();
      if (currentRound === 0n) {
        setStatus({ type: 'error', message: 'No distribution rounds available to claim.' });
        setLoading(false);
        return;
      }
      
      const tx = await distribution.claimPayment(currentRound);
      setStatus({ type: 'info', message: 'Claim transaction submitted...' });
      
      const receipt = await tx.wait();
      
      setTransactions(prev => [{
        type: 'Claim Payment',
        hash: receipt.hash,
        amount: balances.claimable + ' ETH',
        timestamp: new Date().toLocaleTimeString()
      }, ...prev.slice(0, 9)]);
      
      await loadBalances(account, fToken, distribution, provider);
      await loadContractInfo(fToken, distribution);
      
      setStatus({ type: 'success', message: 'Successfully claimed payment!' });
    } catch (error) {
      console.error('Claim failed:', error);
      setStatus({ type: 'error', message: 'Claim failed: ' + error.message });
    }
    setLoading(false);
  };

  const refreshData = async () => {
    if (fToken && distribution && account) {
      await loadBalances(account, fToken, distribution, provider);
      await loadContractInfo(fToken, distribution);
      setStatus({ type: 'success', message: 'Data refreshed!' });
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>🌉 SKY-SHARE Bridge</h1>
        <p>XRPL to Flare tokenization with rental distribution</p>
        {account && (
          <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>
            Connected: {account.slice(0, 6)}...{account.slice(-4)}
          </p>
        )}
      </div>

      {status.message && (
        <div className={`status ${status.type}`}>
          {status.message}
        </div>
      )}

      <div className="grid">
        {/* Balances Card */}
        <div className="card">
          <h2>💰 Your Balances</h2>
          <div className="balance-item">
            <span className="balance-label">ETH Balance:</span>
            <span className="balance-value">{parseFloat(balances.eth).toFixed(4)} ETH</span>
          </div>
          <div className="balance-item">
            <span className="balance-label">fSKY Balance:</span>
            <span className="balance-value">{parseFloat(balances.fSky).toFixed(2)} fSKY</span>
          </div>
          <div className="balance-item">
            <span className="balance-label">Claimable Rent:</span>
            <span className="balance-value">{parseFloat(balances.claimable).toFixed(6)} ETH</span>
          </div>
          <button className="button" onClick={refreshData} style={{ marginTop: '16px', width: '100%' }}>
            🔄 Refresh Balances
          </button>
        </div>

        {/* Contract Info Card */}
        <div className="card">
          <h2>📊 Contract Info</h2>
          <div className="balance-item">
            <span className="balance-label">Total fSKY Supply:</span>
            <span className="balance-value">{parseFloat(contractInfo.totalSupply).toFixed(2)} fSKY</span>
          </div>
          <div className="balance-item">
            <span className="balance-label">Current Round:</span>
            <span className="balance-value">{contractInfo.currentRound}</span>
          </div>
          <div className="balance-item">
            <span className="balance-label">Total Dust:</span>
            <span className="balance-value">{parseFloat(contractInfo.totalDust).toFixed(6)} ETH</span>
          </div>
          <div className="balance-item">
            <span className="balance-label">Contract Balance:</span>
            <span className="balance-value">{parseFloat(contractInfo.contractBalance).toFixed(6)} ETH</span>
          </div>
        </div>

        {/* Bridge Operations Card */}
        <div className="card">
          <h2>🌉 Bridge Operations</h2>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
              Mint fSKY (Simulate Bridge):
            </label>
            <input
              type="number"
              className="input"
              value={mintAmount}
              onChange={(e) => setMintAmount(e.target.value)}
              placeholder="Amount to mint"
            />
            <button 
              className="button" 
              onClick={handleMint} 
              disabled={loading || !mintAmount}
              style={{ width: '100%' }}
            >
              {loading ? <span className="loading"></span> : '🪙'} Mint fSKY
            </button>
          </div>
          <p style={{ fontSize: '0.9rem', color: '#666', margin: 0 }}>
            💡 In production, this would be triggered by XRPL attestations
          </p>
        </div>

        {/* Distribution Card */}
        <div className="card">
          <h2>💸 Rent Distribution</h2>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
              Deposit Rent (ETH):
            </label>
            <input
              type="number"
              className="input"
              value={rentAmount}
              onChange={(e) => setRentAmount(e.target.value)}
              placeholder="Rent amount in ETH"
              step="0.01"
            />
            <button 
              className="button" 
              onClick={handleDepositRent} 
              disabled={loading || !rentAmount}
              style={{ width: '100%', marginBottom: '12px' }}
            >
              {loading ? <span className="loading"></span> : '💰'} Deposit Rent
            </button>
          </div>
          
          <button 
            className="button" 
            onClick={handleClaimPayment} 
            disabled={loading || parseFloat(balances.claimable) === 0}
            style={{ width: '100%', backgroundColor: '#28a745' }}
          >
            {loading ? <span className="loading"></span> : '🎁'} Claim Payment
          </button>
          
          <p style={{ fontSize: '0.9rem', color: '#666', margin: '12px 0 0 0' }}>
            💡 In production, rent would be deposited automatically via oracles
          </p>
        </div>

        {/* Recent Transactions Card */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <h2>📋 Recent Transactions</h2>
          {transactions.length === 0 ? (
            <p style={{ color: '#666', fontStyle: 'italic' }}>No transactions yet</p>
          ) : (
            <div className="transaction-list">
              {transactions.map((tx, index) => (
                <div key={index} className="transaction-item">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <strong>{tx.type}</strong>
                    <span style={{ fontSize: '0.9rem', color: '#666' }}>{tx.timestamp}</span>
                  </div>
                  <div style={{ marginBottom: '4px' }}>Amount: {tx.amount}</div>
                  <div className="transaction-hash">Hash: {tx.hash}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', marginTop: '40px', color: 'white', opacity: 0.8 }}>
        <p>🚀 SKY-SHARE Bridge MVP - Connecting XRPL and Flare</p>
        <p style={{ fontSize: '0.9rem' }}>
          This is a demo application. In production, integrate with Flare's FAssets and State Connector.
        </p>
      </div>
    </div>
  );
}

export default App;
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Layout from "@/components/Layout";
import { useWeb3 } from "@/contexts/Web3Context";
import { useContracts, ContractData } from "@/hooks/useContracts";
import { toast } from "sonner";

const Dashboard = () => {
  const { isConnected, balance, address, isCoston2 } = useWeb3();
  const { 
    loading, 
    error, 
    addresses,
    readAll, 
    depositRent, 
    claimPayment,
    hasBridgeRole,
    mintDemo
  } = useContracts();
  
  const [contractData, setContractData] = useState<ContractData>({
    userFsky: '0',
    totalSupply: '0',
    currentRound: 0,
    contractC2FLR: '0',
    totalClaimable: '0'
  });
  const [refreshing, setRefreshing] = useState(false);
  const [depositAmount, setDepositAmount] = useState('1');
  const [mintAmount, setMintAmount] = useState('100');
  const [canMint, setCanMint] = useState(false);
  const [lastTxHashes, setLastTxHashes] = useState<string[]>([]);

  const loadDashboardData = async () => {
    if (!isConnected || !isCoston2) return;
    
    setRefreshing(true);
    try {
      const data = await readAll();
      setContractData(data);
      
      // Check bridge role for mint button
      if (address) {
        const bridgeRole = await hasBridgeRole(address);
        setCanMint(bridgeRole);
      }
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load contract data');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [isConnected, isCoston2, address]);

  const handleDepositRent = async () => {
    try {
      const txHash = await depositRent(depositAmount);
      setLastTxHashes(prev => [txHash, ...prev.slice(0, 4)]);
      toast.success(`Rent deposited! TX: ${txHash.slice(0, 10)}...`);
      
      // Wait for transaction to be mined, then refresh
      setTimeout(async () => {
        await loadDashboardData();
        toast.info("Data refreshed!");
      }, 3000);
    } catch (error: any) {
      toast.error(error.message || "Failed to deposit rent");
    }
  };

  const handleClaimPayment = async () => {
    try {
      const txHash = await claimPayment();
      setLastTxHashes(prev => [txHash, ...prev.slice(0, 4)]);
      toast.success(`Payment claimed! TX: ${txHash.slice(0, 10)}...`);
      
      // Wait for transaction to be mined, then refresh
      setTimeout(async () => {
        await loadDashboardData();
        toast.info("Data refreshed!");
      }, 3000);
    } catch (error: any) {
      toast.error(error.message || "Failed to claim payment");
    }
  };

  const handleMintDemo = async () => {
    if (!address) return;
    try {
      const txHash = await mintDemo(address, mintAmount);
      setLastTxHashes(prev => [txHash, ...prev.slice(0, 4)]);
      toast.success(`Tokens minted! TX: ${txHash.slice(0, 10)}...`);
      
      // Wait for transaction to be mined, then refresh
      setTimeout(async () => {
        await loadDashboardData();
        toast.info("Data refreshed!");
      }, 3000);
    } catch (error: any) {
      toast.error(error.message || "Failed to mint tokens");
    }
  };

  // Calculate estimated values
  const estimatedJetValue = parseFloat(contractData.userFsky) * 50; // Assuming $50 per token
  const accountValue = estimatedJetValue + parseFloat(contractData.totalClaimable);
  const jetsOwned = parseFloat(contractData.userFsky) > 0 ? 1 : 0;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold">Assets Overview</h2>
          <Button 
            variant="outline" 
            onClick={async () => {
              setRefreshing(true);
              try {
                await loadDashboardData();
                toast.success("Data refreshed!");
              } catch (error) {
                toast.error("Failed to refresh data");
              } finally {
                setRefreshing(false);
              }
            }}
            disabled={refreshing}
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
        
        {!isConnected ? (
          <Card className="p-8 text-center">
            <div className="max-w-2xl mx-auto space-y-4">
              <h3 className="text-xl font-semibold">
                Connect your wallet to view your SkyShare portfolio
              </h3>
              <p className="text-muted-foreground">
                Connect your MetaMask wallet to see your jet holdings, rental income, and more.
              </p>
            </div>
          </Card>
        ) : !isCoston2 ? (
          <Card className="p-8 text-center border-destructive">
            <div className="max-w-2xl mx-auto space-y-4">
              <h3 className="text-xl font-semibold text-destructive">
                ⚠️ Switch to Flare Testnet (Coston2)
              </h3>
              <p className="text-muted-foreground">
                This app requires Flare Testnet (Coston2) network. Please switch your MetaMask to Chain ID 114.
              </p>
            </div>
          </Card>
        ) : (
          <>
            {/* Account Value Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Account Value ⓘ</p>
                      <p className="text-4xl font-bold">${accountValue.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Available Balance ⓘ</p>
                      <p className="text-2xl font-semibold">{parseFloat(balance).toFixed(4)} C2FLR</p>
                    </div>
                  </div>
                  <div className="flex space-x-4">
                    <Button 
                      variant="hero" 
                      className="flex-1"
                      onClick={handleDepositRent}
                      disabled={loading || !depositAmount}
                    >
                      {loading ? 'Depositing...' : 'Deposit Rent'}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={handleClaimPayment}
                      disabled={loading || parseFloat(contractData.totalClaimable) === 0}
                    >
                      {loading ? 'Claiming...' : 
                       parseFloat(contractData.totalClaimable) === 0 ? 'No Rent to Claim' : 
                       'Claim Rent'}
                    </Button>
                  </div>
                </div>
              </Card>

              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4">
                  <p className="text-sm text-muted-foreground">Claimable Rent</p>
                  <p className="text-2xl font-bold">{parseFloat(contractData.totalClaimable).toFixed(4)} C2FLR</p>
                </Card>
                <Card className="p-4">
                  <p className="text-sm text-muted-foreground">Contract Balance</p>
                  <p className="text-2xl font-bold text-primary">
                    {parseFloat(contractData.contractC2FLR).toFixed(4)} C2FLR
                  </p>
                </Card>
                <Card className="p-4">
                  <p className="text-sm text-muted-foreground">fSKY Balance</p>
                  <p className="text-2xl font-bold">{parseFloat(contractData.userFsky).toFixed(2)}</p>
                </Card>
                <Card className="p-4">
                  <p className="text-sm text-muted-foreground">Total Supply</p>
                  <p className="text-2xl font-bold">{parseFloat(contractData.totalSupply).toFixed(2)}</p>
                </Card>
                <Card className="p-4">
                  <p className="text-sm text-muted-foreground">Current Round</p>
                  <p className="text-2xl font-bold text-primary">{contractData.currentRound}</p>
                </Card>
                <Card className="p-4">
                  <p className="text-sm text-muted-foreground">Est. Jet Value</p>
                  <p className="text-2xl font-bold">${estimatedJetValue.toFixed(2)}</p>
                </Card>
              </div>
            </div>

            {/* Contract Interaction Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">💰 Deposit Rent (Demo)</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="deposit-amount">Amount (C2FLR)</Label>
                    <Input
                      id="deposit-amount"
                      type="number"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      placeholder="1.0"
                      step="0.1"
                      min="0"
                    />
                  </div>
                  <Button 
                    onClick={handleDepositRent}
                    disabled={loading || !depositAmount}
                    className="w-full"
                  >
                    {loading ? 'Depositing...' : 'Deposit Rent'}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Deposits rent to be distributed among fSKY token holders
                  </p>
                </div>
              </Card>

              {canMint && (
                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-4">🪙 Mint fSKY (Bridge Role)</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="mint-amount">Amount (fSKY)</Label>
                      <Input
                        id="mint-amount"
                        type="number"
                        value={mintAmount}
                        onChange={(e) => setMintAmount(e.target.value)}
                        placeholder="100"
                        step="1"
                        min="0"
                      />
                    </div>
                    <Button 
                      onClick={handleMintDemo}
                      disabled={loading || !mintAmount}
                      className="w-full"
                      variant="secondary"
                    >
                      {loading ? 'Minting...' : 'Mint Demo Tokens'}
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Only available to addresses with BRIDGE_ROLE
                    </p>
                  </div>
                </Card>
              )}
            </div>

            {/* Contract Addresses & Explorer Links */}
            {addresses && (
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">📋 Contract Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">FToken:</span>
                    <a 
                      href={`https://coston2-explorer.flare.network/address/${addresses.FToken}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-sm"
                    >
                      {addresses.FToken}
                    </a>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Distribution:</span>
                    <a 
                      href={`https://coston2-explorer.flare.network/address/${addresses.Distribution}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-sm"
                    >
                      {addresses.Distribution}
                    </a>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Network:</span>
                    <span className="text-sm">{addresses.network} (Chain ID: 114)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Your Address:</span>
                    <span className="text-sm font-mono">{address?.slice(0, 10)}...{address?.slice(-6)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Debug:</span>
                    <span className="text-xs text-muted-foreground">
                      Round: {contractData.currentRound} | 
                      Claimable: {contractData.totalClaimable} | 
                      Contract: {contractData.contractC2FLR}
                    </span>
                  </div>
                </div>
              </Card>
            )}

            {/* Recent Transactions */}
            {lastTxHashes.length > 0 && (
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">📝 Recent Transactions</h3>
                <div className="space-y-2">
                  {lastTxHashes.map((hash, index) => (
                    <div key={hash} className="flex justify-between items-center p-2 bg-muted rounded">
                      <span className="text-sm font-mono">{hash.slice(0, 20)}...</span>
                      <a 
                        href={`https://coston2-explorer.flare.network/tx/${hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-sm"
                      >
                        View on Explorer
                      </a>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Instructions */}
            <Card className="p-6 bg-muted/50">
              <h3 className="text-lg font-semibold mb-3">🚀 How to Test the Integration</h3>
              <div className="space-y-2 text-sm">
                <p><strong>1. Mint Tokens:</strong> {canMint ? "Use the mint function above to create fSKY tokens" : "You need BRIDGE_ROLE to mint tokens"}</p>
                <p><strong>2. Deposit Rent:</strong> Use the deposit function to add C2FLR to the distribution contract</p>
                <p><strong>3. Claim Rent:</strong> After depositing, you can claim your share of the rent based on your fSKY balance</p>
                <p><strong>4. Check Explorer:</strong> Click on transaction links to verify on Coston2 explorer</p>
                {!canMint && (
                  <p className="text-muted-foreground mt-2">
                    <strong>Note:</strong> To get BRIDGE_ROLE, run: <code className="bg-background px-1 rounded">npx hardhat run scripts/grant_bridge_role.js --network coston2</code>
                  </p>
                )}
              </div>
            </Card>

            {/* Get Started Section */}
            {parseFloat(contractData.userFsky) === 0 && (
              <Card className="p-8 text-center">
                <div className="max-w-2xl mx-auto space-y-4">
                  <h3 className="text-xl font-semibold">
                    {canMint ? 
                      "You have bridge role! Mint some fSKY tokens to get started." :
                      "Get some fSKY tokens to participate in rental distributions"
                    }
                  </h3>
                  <p className="text-muted-foreground">
                    {canMint ?
                      "Use the mint function above to create demo tokens, then deposit rent to test distributions." :
                      "Contact the bridge operator to mint tokens, or visit the marketplace to invest in jets."
                    }
                  </p>
                  {!canMint && (
                    <Link to="/marketplace">
                      <Button variant="hero" size="lg" className="mt-6">
                        View Jets
                      </Button>
                    </Link>
                  )}
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
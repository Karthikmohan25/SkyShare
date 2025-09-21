import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Layout from "@/components/Layout";
import { useWeb3 } from "@/contexts/Web3Context";
import { useContracts } from "@/hooks/useContracts";
import { toast } from "sonner";

const Dashboard = () => {
  const { account, connect } = useWeb3();
  const { readAll, depositRent, claim, mint, fmt, parse } = useContracts();

  const [data, setData] = useState<any>();
  const [rent, setRent] = useState("2");
  const [mintAmount, setMintAmount] = useState("100");
  const [busy, setBusy] = useState(false);
  const [lastTxHashes, setLastTxHashes] = useState<string[]>([]);

  const refresh = async () => {
    try {
      const d = await readAll();
      setData(d);
    } catch (e) {
      console.error("refresh failed:", e);
    }
  };

  useEffect(() => { refresh(); }, [account]);

  const onDeposit = async () => {
    setBusy(true);
    try {
      const receipt = await depositRent(parse(rent));
      const txHash = receipt.transactionHash;
      setLastTxHashes(prev => [txHash, ...prev.slice(0, 4)]);
      toast.success(`Rent deposited! TX: ${txHash.slice(0, 10)}...`);
      console.log("Deposit receipt", txHash);
      await refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to deposit rent");
    } finally {
      setBusy(false);
    }
  };

  const onClaim = async () => {
    setBusy(true);
    try {
      const receipt = await claim();
      const txHash = receipt.transactionHash;
      setLastTxHashes(prev => [txHash, ...prev.slice(0, 4)]);
      toast.success(`Payment claimed! TX: ${txHash.slice(0, 10)}...`);
      console.log("Claim receipt", txHash);
      await refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to claim payment");
    } finally {
      setBusy(false);
    }
  };

  const onMint = async () => {
    setBusy(true);
    try {
      const receipt = await mint(parse(mintAmount));
      const txHash = receipt.transactionHash;
      setLastTxHashes(prev => [txHash, ...prev.slice(0, 4)]);
      toast.success(`Tokens minted! TX: ${txHash.slice(0, 10)}...`);
      console.log("Mint receipt", txHash);
      await refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to mint tokens");
    } finally {
      setBusy(false);
    }
  };

  // Calculate estimated values using ethers v5 BigNumber
  const estimatedJetValue = data ? parseFloat(fmt(data.my)) * 50 : 0;
  const accountValue = estimatedJetValue;
  const jetsOwned = data && data.my && !data.my.isZero() ? 1 : 0;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold">Assets Overview</h2>
          <Button variant="outline" onClick={refresh}>Refresh</Button>
        </div>
        
        {!account ? (
          <Card className="p-8 text-center">
            <div className="max-w-2xl mx-auto space-y-4">
              <h3 className="text-xl font-semibold">
                Connect your wallet to view your SkyShare portfolio
              </h3>
              <p className="text-muted-foreground">
                Connect your MetaMask wallet to see your jet holdings, rental income, and more.
              </p>
              <div className="space-y-2">
                <Button onClick={() => alert("Button click works!")}>Test Click</Button>
                <Button onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log("🖱️ Dashboard connect button clicked");
                  console.log("🔍 connect function:", typeof connect, connect);
                  connect().catch((err) => console.error("connect() failed:", err));
                }}>Connect Wallet</Button>
              </div>
            </div>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Account Value</p>
                      <p className="text-4xl font-bold">${accountValue.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Available Balance</p>
                      <p className="text-2xl font-semibold">Check MetaMask</p>
                    </div>
                  </div>
                  <div className="flex space-x-4">
                    <Button 
                      variant="hero" 
                      className="flex-1"
                      onClick={onDeposit}
                      disabled={busy}
                    >
                      {busy ? 'Depositing...' : 'Deposit Rent'}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={onClaim}
                      disabled={busy}
                    >
                      {busy ? 'Claiming...' : 'Claim Payment'}
                    </Button>
                  </div>
                </div>
              </Card>

              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4">
                  <p className="text-sm text-muted-foreground">Contract Balance</p>
                  <p className="text-2xl font-bold text-primary">
                    {data ? parseFloat(fmt(data.contractBal)).toFixed(4) : "…"} C2FLR
                  </p>
                </Card>
                <Card className="p-4">
                  <p className="text-sm text-muted-foreground">Current Round</p>
                  <p className="text-2xl font-bold text-primary">{data ? data.round.toString() : "…"}</p>
                </Card>
                <Card className="p-4">
                  <p className="text-sm text-muted-foreground">fSKY Balance</p>
                  <p className="text-2xl font-bold">{data ? parseFloat(fmt(data.my)).toFixed(2) : "…"}</p>
                </Card>
                <Card className="p-4">
                  <p className="text-sm text-muted-foreground">Total Supply</p>
                  <p className="text-2xl font-bold">{data ? parseFloat(fmt(data.totalSupply)).toFixed(2) : "…"}</p>
                </Card>
                <Card className="p-4">
                  <p className="text-sm text-muted-foreground">Claimable</p>
                  <p className="text-2xl font-bold text-primary">{data ? parseFloat(fmt(data.claimable)).toFixed(4) : "0"} C2FLR</p>
                </Card>
                <Card className="p-4">
                  <p className="text-sm text-muted-foreground">Jets Owned</p>
                  <p className="text-2xl font-bold">{jetsOwned}</p>
                </Card>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">💰 Deposit Rent (Demo)</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="deposit-amount">Amount (C2FLR)</Label>
                    <Input
                      id="deposit-amount"
                      type="number"
                      value={rent}
                      onChange={(e) => setRent(e.target.value)}
                      placeholder="2.0"
                      step="0.1"
                      min="0"
                    />
                  </div>
                  <Button 
                    onClick={onDeposit}
                    disabled={busy}
                    className="w-full"
                  >
                    {busy ? 'Depositing...' : 'Deposit Rent'}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Deposits rent to be distributed among fSKY token holders
                  </p>
                </div>
              </Card>

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
                    onClick={onMint}
                    disabled={busy}
                    className="w-full"
                    variant="secondary"
                  >
                    {busy ? 'Minting...' : 'Mint Demo Tokens'}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Only available to addresses with BRIDGE_ROLE
                  </p>
                </div>
              </Card>
            </div>

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

            {data && data.my && data.my.isZero() && (
              <Card className="p-8 text-center">
                <div className="max-w-2xl mx-auto space-y-4">
                  <h3 className="text-xl font-semibold">
                    Get some fSKY tokens to participate in rental distributions
                  </h3>
                  <p className="text-muted-foreground">
                    Use the mint function above to create demo tokens, then deposit rent to test distributions.
                  </p>
                  <Link to="/marketplace">
                    <Button variant="hero" size="lg" className="mt-6">
                      View Jets
                    </Button>
                  </Link>
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
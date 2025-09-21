import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { useBlockchain } from "@/contexts/BlockchainContext";

const Dashboard = () => {
  const { 
    balances, 
    contractInfo, 
    isConnected, 
    connectWallet, 
    refreshBalances, 
    mintTokens, 
    depositRent, 
    claimPayment,
    checkBridgeRole 
  } = useBlockchain();
  
  const { toast } = useToast();
  const [mintAmount, setMintAmount] = useState("1");
  const [rentAmount, setRentAmount] = useState("1");
  const [isLoading, setIsLoading] = useState(false);
  const [hasBridgeRole, setHasBridgeRole] = useState(false);

  // Check bridge role on connection
  useEffect(() => {
    const checkRole = async () => {
      if (isConnected) {
        const hasRole = await checkBridgeRole();
        setHasBridgeRole(hasRole);
      }
    };
    checkRole();
  }, [isConnected, checkBridgeRole]);

  const handleMint = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const txHash = await mintTokens(mintAmount);
      toast({
        title: "Tokens minted successfully!",
        description: `Transaction: ${txHash.slice(0, 10)}...`,
      });
      setMintAmount("1");
    } catch (error: any) {
      toast({
        title: "Minting failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDepositRent = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const txHash = await depositRent(rentAmount);
      toast({
        title: "Rent deposited successfully!",
        description: `Transaction: ${txHash.slice(0, 10)}...`,
      });
      setRentAmount("1");
    } catch (error: any) {
      toast({
        title: "Deposit failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaimPayment = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const txHash = await claimPayment();
      toast({
        title: "Payment claimed successfully!",
        description: `Transaction: ${txHash.slice(0, 10)}...`,
      });
    } catch (error: any) {
      toast({
        title: "Claim failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate estimated values (mock calculation for demo)
  const fSkyBalance = parseFloat(balances.fSky);
  const estimatedValue = fSkyBalance * 50; // Assume $50 per fSKY token
  const claimableValue = parseFloat(balances.claimable) * 2000; // Assume C2FLR to USD rate

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold">Assets Overview</h2>
          {!isConnected && (
            <Button onClick={connectWallet} variant="hero">
              Connect Wallet
            </Button>
          )}
        </div>
        
        {/* Account Value Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Account Value ⓘ</p>
                  <p className="text-4xl font-bold">${estimatedValue.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Available Balance ⓘ</p>
                  <p className="text-2xl font-semibold">{parseFloat(balances.eth).toFixed(4)} C2FLR</p>
                </div>
              </div>
              <div className="flex space-x-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="hero" className="flex-1">Deposit Rent</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Deposit Rent Payment</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="rentAmount">Amount (C2FLR)</Label>
                        <Input
                          id="rentAmount"
                          type="number"
                          value={rentAmount}
                          onChange={(e) => setRentAmount(e.target.value)}
                          placeholder="Enter amount"
                        />
                      </div>
                      <Button 
                        onClick={handleDepositRent} 
                        disabled={isLoading || !isConnected}
                        className="w-full"
                      >
                        {isLoading ? "Processing..." : "Deposit Rent"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={handleClaimPayment}
                  disabled={isLoading || !isConnected || parseFloat(balances.claimable) === 0}
                >
                  Claim Rent
                </Button>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">Rent Balance</p>
              <p className="text-2xl font-bold">${claimableValue.toFixed(2)}</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">Total Rent Earned</p>
              <p className="text-2xl font-bold text-primary">${claimableValue.toFixed(2)} <span className="text-sm text-muted-foreground">0.00%</span></p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">fSKY Tokens ⓘ</p>
              <p className="text-2xl font-bold">{parseFloat(balances.fSky).toFixed(2)}</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">Jets Owned ⓘ</p>
              <p className="text-2xl font-bold">{fSkyBalance > 0 ? "1" : "0"}</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">Current Round ⓘ</p>
              <p className="text-2xl font-bold text-primary">{contractInfo.currentRound}</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">Total Supply ⓘ</p>
              <p className="text-2xl font-bold text-primary">{parseFloat(contractInfo.totalSupply).toFixed(0)} <span className="text-sm text-muted-foreground">fSKY</span></p>
            </Card>
          </div>
        </div>

        {/* Blockchain Actions Section */}
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Blockchain Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {hasBridgeRole ? (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    Mint fSKY Tokens
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Mint fSKY Tokens</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="mintAmount">Amount (fSKY)</Label>
                      <Input
                        id="mintAmount"
                        type="number"
                        value={mintAmount}
                        onChange={(e) => setMintAmount(e.target.value)}
                        placeholder="Enter amount"
                      />
                    </div>
                    <Button 
                      onClick={handleMint} 
                      disabled={isLoading || !isConnected}
                      className="w-full"
                    >
                      {isLoading ? "Processing..." : "Mint Tokens"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            ) : (
              <Button variant="outline" className="w-full" disabled>
                Mint (Bridge Role Required)
              </Button>
            )}
            
            <Button 
              onClick={refreshBalances} 
              variant="outline"
              disabled={!isConnected}
            >
              🔄 Refresh Balances
            </Button>
            
            <Button 
              onClick={() => window.open(`https://coston2-explorer.flare.network/address/${contractInfo.totalSupply}`, '_blank')} 
              variant="outline"
            >
              View on Explorer
            </Button>
          </div>
        </Card>

        {/* Get Started Section */}
        {fSkyBalance === 0 && (
          <Card className="p-8 text-center">
            <div className="max-w-2xl mx-auto space-y-4">
              <h3 className="text-xl font-semibold">
                Invest in your first jet and then view your jet holdings, value, appreciation and rental income here.
              </h3>
              <p className="text-muted-foreground">
                You can also withdraw your rental income from this menu. Click below to get started.
              </p>
              <Link to="/marketplace">
                <Button variant="hero" size="lg" className="mt-6">
                  View Jets
                </Button>
              </Link>
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
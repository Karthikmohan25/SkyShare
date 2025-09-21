import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wallet as WalletIcon, Copy, ExternalLink, Coins, DollarSign } from "lucide-react";
import Layout from "@/components/Layout";
import { useBlockchain } from "@/contexts/BlockchainContext";
import { useToast } from "@/hooks/use-toast";

const Wallet = () => {
  const { 
    isConnected, 
    connectWallet, 
    account, 
    balances, 
    contractInfo 
  } = useBlockchain();
  const { toast } = useToast();

  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      toast({
        title: "Address Copied!",
        description: "Wallet address copied to clipboard",
      });
    }
  };

  const openInExplorer = () => {
    if (account) {
      window.open(`https://coston2-explorer.flare.network/address/${account}`, '_blank');
    }
  };

  if (!isConnected) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-4">
            <WalletIcon className="w-16 h-16 mx-auto text-muted-foreground" />
            <h1 className="text-3xl font-bold">Connect Your Wallet</h1>
            <p className="text-muted-foreground">
              Connect your wallet to view your balance and manage your assets
            </p>
            <Button onClick={connectWallet} size="lg">
              Connect Wallet
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">My Wallet</h1>
          <Badge variant="outline" className="text-green-600">
            Connected
          </Badge>
        </div>

        {/* Wallet Address Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <WalletIcon className="w-5 h-5" />
              Wallet Address
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="font-mono text-sm">{account}</span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyAddress}
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={openInExplorer}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              This is your wallet address on Flare Coston2 testnet
            </p>
          </CardContent>
        </Card>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* C2FLR Balance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-blue-500" />
                C2FLR Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-3xl font-bold">{parseFloat(balances.eth).toFixed(4)}</p>
                <p className="text-sm text-muted-foreground">Coston2 Flare (Testnet)</p>
                <div className="pt-2">
                  <Badge variant="secondary">Testnet Currency</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* JET Token Balance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-purple-500" />
                JET Tokens
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-3xl font-bold">{parseFloat(balances.jet || '0').toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">Jet Ownership Tokens</p>
                <div className="pt-2">
                  {parseFloat(balances.jet || '0') > 0 ? (
                    <Badge variant="default">Token Holder</Badge>
                  ) : (
                    <Badge variant="outline">No Tokens</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Portfolio Summary */}
        {parseFloat(balances.jet || '0') > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-2xl font-bold text-blue-500">
                    {parseFloat(balances.jet || '0').toFixed(1)}
                  </p>
                  <p className="text-sm text-muted-foreground">JET Tokens Owned</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-2xl font-bold text-green-500">
                    {contractInfo.totalSupply !== "0" 
                      ? ((parseFloat(balances.jet || '0') / parseFloat(contractInfo.totalSupply)) * 100).toFixed(2)
                      : "0"
                    }%
                  </p>
                  <p className="text-sm text-muted-foreground">Total Ownership</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-2xl font-bold text-purple-500">
                    ${(parseFloat(balances.jet || '0') * 70000).toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Estimated Value</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Wallet Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Wallet Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" className="w-full" onClick={openInExplorer}>
                <ExternalLink className="w-4 h-4 mr-2" />
                View on Explorer
              </Button>
              <Button variant="outline" className="w-full" onClick={copyAddress}>
                <Copy className="w-4 h-4 mr-2" />
                Copy Address
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Network Info */}
        <Card>
          <CardHeader>
            <CardTitle>Network Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Network:</span>
                <Badge>Flare Coston2 Testnet</Badge>
              </div>
              <div className="flex justify-between">
                <span>Chain ID:</span>
                <span className="font-mono">114</span>
              </div>
              <div className="flex justify-between">
                <span>Currency:</span>
                <span>C2FLR (Testnet)</span>
              </div>
              <div className="flex justify-between">
                <span>Explorer:</span>
                <a 
                  href="https://coston2-explorer.flare.network/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  coston2-explorer.flare.network
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Wallet;
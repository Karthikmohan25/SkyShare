import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  History, 
  ExternalLink, 
  Search, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Coins,
  Calendar,
  Hash,
  Loader2
} from "lucide-react";
import Layout from "@/components/Layout";
import { useBlockchain } from "@/contexts/BlockchainContext";
import { ethers } from "ethers";

interface Transaction {
  id: string;
  hash: string;
  type: 'buy' | 'claim' | 'deposit';
  amount: string;
  token: string;
  timestamp: string;
  status: 'confirmed' | 'pending' | 'failed';
  gasUsed?: string;
}

const Transactions = () => {
  const { isConnected, connectWallet, account, provider, fToken, distribution } = useBlockchain();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Fetch real transactions from the blockchain
  const fetchTransactions = async () => {
    if (!isConnected || !account || !provider || !fToken || !distribution) return;
    
    setIsLoading(true);
    try {
      console.log('🔍 Fetching transactions for:', account);
      
      const transactions: Transaction[] = [];
      
      // Get the current block number
      const currentBlock = await provider.getBlockNumber();
      const fromBlock = Math.max(0, currentBlock - 10000); // Look back 10k blocks
      
      // Fetch FToken events (mints/transfers)
      try {
        const mintFilter = fToken.filters.TokensMinted(account);
        const mintEvents = await fToken.queryFilter(mintFilter, fromBlock, currentBlock);
        
        for (const event of mintEvents) {
          const block = await provider.getBlock(event.blockNumber);
          const tx = await provider.getTransaction(event.transactionHash);
          
          transactions.push({
            id: event.transactionHash + '-mint',
            hash: event.transactionHash,
            type: 'buy',
            amount: ethers.formatEther(event.args?.amount || '0'),
            token: 'fSKY',
            timestamp: new Date(block!.timestamp * 1000).toLocaleString(),
            status: 'confirmed',
            gasUsed: tx?.gasLimit?.toString()
          });
        }
      } catch (error) {
        console.log('No mint events found or error fetching:', error);
      }
      
      // Fetch Distribution events (claims)
      try {
        const claimFilter = distribution.filters.PaymentClaimed(account);
        const claimEvents = await distribution.queryFilter(claimFilter, fromBlock, currentBlock);
        
        for (const event of claimEvents) {
          const block = await provider.getBlock(event.blockNumber);
          
          transactions.push({
            id: event.transactionHash + '-claim',
            hash: event.transactionHash,
            type: 'claim',
            amount: ethers.formatEther(event.args?.amount || '0'),
            token: 'C2FLR',
            timestamp: new Date(block!.timestamp * 1000).toLocaleString(),
            status: 'confirmed'
          });
        }
      } catch (error) {
        console.log('No claim events found or error fetching:', error);
      }
      
      // Fetch rent deposits (if user is admin)
      try {
        const depositFilter = distribution.filters.RentDeposited(account);
        const depositEvents = await distribution.queryFilter(depositFilter, fromBlock, currentBlock);
        
        for (const event of depositEvents) {
          const block = await provider.getBlock(event.blockNumber);
          
          transactions.push({
            id: event.transactionHash + '-deposit',
            hash: event.transactionHash,
            type: 'deposit',
            amount: ethers.formatEther(event.args?.amount || '0'),
            token: 'C2FLR',
            timestamp: new Date(block!.timestamp * 1000).toLocaleString(),
            status: 'confirmed'
          });
        }
      } catch (error) {
        console.log('No deposit events found or error fetching:', error);
      }
      
      // Sort by timestamp (newest first)
      transactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      console.log('📊 Found transactions:', transactions);
      setTransactions(transactions);
      
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected && account && provider && fToken && distribution) {
      fetchTransactions();
    }
  }, [isConnected, account, provider, fToken, distribution]);

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'buy':
        return <ArrowUpRight className="w-4 h-4 text-green-500" />;
      case 'claim':
        return <ArrowDownLeft className="w-4 h-4 text-blue-500" />;
      case 'deposit':
        return <Coins className="w-4 h-4 text-purple-500" />;
      default:
        return <History className="w-4 h-4" />;
    }
  };

  const getTransactionLabel = (type: string) => {
    switch (type) {
      case 'buy':
        return 'Token Purchase';
      case 'claim':
        return 'Rental Claim';
      case 'deposit':
        return 'Rental Deposit';
      default:
        return 'Transaction';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const openInExplorer = (hash: string) => {
    window.open(`https://coston2-explorer.flare.network/tx/${hash}`, '_blank');
  };

  const filteredTransactions = transactions.filter(tx =>
    tx.hash.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isConnected) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-4">
            <History className="w-16 h-16 mx-auto text-muted-foreground" />
            <h1 className="text-3xl font-bold">Transaction History</h1>
            <p className="text-muted-foreground">
              Connect your wallet to view your transaction history
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
          <h1 className="text-3xl font-bold">Transaction History</h1>
          <Badge variant="outline" className="text-green-600">
            Connected
          </Badge>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Search Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search by transaction hash or type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button 
                variant="outline" 
                onClick={fetchTransactions}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <History className="w-4 h-4 mr-2" />
                )}
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Transaction List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Recent Transactions
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12 space-y-4">
                <Loader2 className="w-8 h-8 mx-auto animate-spin text-muted-foreground" />
                <p className="text-muted-foreground">Loading your transactions...</p>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <History className="w-16 h-16 mx-auto text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-semibold">No Transaction History</h3>
                  <p className="text-muted-foreground">
                    You haven't made any transactions yet. Start by purchasing some jet tokens!
                  </p>
                </div>
                <Button variant="outline" onClick={() => window.location.href = '/marketplace'}>
                  Browse Jets
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-muted rounded-full">
                        {getTransactionIcon(tx.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{getTransactionLabel(tx.type)}</span>
                          {getStatusBadge(tx.status)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Hash className="w-3 h-3" />
                            {tx.hash.slice(0, 10)}...{tx.hash.slice(-8)}
                          </span>
                          <span>{tx.timestamp}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        {tx.amount} {tx.token}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openInExplorer(tx.hash)}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transaction Stats */}
        {transactions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <ArrowUpRight className="w-4 h-4 text-green-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Purchases</p>
                    <p className="text-lg font-bold">
                      {transactions.filter(tx => tx.type === 'buy').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <ArrowDownLeft className="w-4 h-4 text-blue-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Claims</p>
                    <p className="text-lg font-bold">
                      {transactions.filter(tx => tx.type === 'claim').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-purple-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Transactions</p>
                    <p className="text-lg font-bold">{transactions.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Help Section */}
        <Card>
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <p>
                <strong>Transaction Types:</strong>
              </p>
              <ul className="space-y-1 ml-4">
                <li>• <strong>Token Purchase:</strong> Buying JET tokens with C2FLR</li>
                <li>• <strong>Rental Claim:</strong> Claiming your share of rental income</li>
                <li>• <strong>Rental Deposit:</strong> Admin depositing rental income (if you're an admin)</li>
              </ul>
              <p className="pt-2">
                All transactions are recorded on the Flare Coston2 blockchain and can be verified 
                on the <a 
                  href="https://coston2-explorer.flare.network/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  Coston2 Explorer
                </a>.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Transactions;
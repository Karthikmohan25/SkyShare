import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Jet } from "@/data/mockJets";
import { useWeb3 } from "@/contexts/Web3Context";
import { useContracts } from "@/hooks/useContracts";
import { toast } from "sonner";

interface BuyOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  jet: Jet;
}

const BuyOrderModal = ({ isOpen, onClose, jet }: BuyOrderModalProps) => {
  const { isConnected, connectWallet, address, isCoston2 } = useWeb3();
  const { mintDemo, hasBridgeRole, loading } = useContracts();
  const [selectedTokens, setSelectedTokens] = useState(25);
  const [customAmount, setCustomAmount] = useState("25");
  const [orderType, setOrderType] = useState("limit");
  const [paymentMethod, setPaymentMethod] = useState("skyshare-wallet");
  const [paymentCurrency, setPaymentCurrency] = useState("C2FLR");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const tokenOptions = [
    { tokens: 1, price: jet.tokenPrice, label: "1 share" },
    { tokens: 10, price: jet.tokenPrice * 10, label: "10 shares" },
    { tokens: 25, price: jet.tokenPrice * 25, label: "25 shares", popular: true },
    { tokens: 50, price: jet.tokenPrice * 50, label: "50 shares" },
    { tokens: 100, price: jet.tokenPrice * 100, label: "100 shares" }
  ];

  const handleTokenSelection = (tokens: number) => {
    setSelectedTokens(tokens);
    setCustomAmount(tokens.toString());
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    const numValue = parseInt(value) || 0;
    setSelectedTokens(numValue);
  };

  const calculateTotal = () => {
    const tokens = parseInt(customAmount) || 0;
    return tokens * jet.tokenPrice;
  };

  const handlePlaceOrder = async () => {
    if (!isConnected) {
      await connectWallet();
      return;
    }

    if (!isCoston2) {
      toast.error("Please switch to Flare Testnet (Coston2)");
      return;
    }

    const tokens = parseInt(customAmount);
    if (tokens <= 0) {
      toast.error("Please enter a valid number of tokens");
      return;
    }

    if (tokens > jet.availableTokens) {
      toast.error("Not enough tokens available");
      return;
    }

    setIsPlacingOrder(true);
    
    try {
      if (!address) {
        throw new Error("No wallet address found");
      }

      // Check if user has bridge role to mint tokens (demo functionality)
      const canMint = await hasBridgeRole(address);
      
      if (canMint) {
        // If user has bridge role, mint the tokens directly (demo)
        console.log(`🪙 Minting ${tokens} fSKY tokens for investment demo`);
        const txHash = await mintDemo(address, tokens.toString());
        
        toast.success(
          <div>
            <p>Investment successful! Minted {tokens} fSKY tokens.</p>
            <a 
              href={`https://coston2-explorer.flare.network/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline text-sm"
            >
              View Transaction
            </a>
          </div>
        );
      } else {
        // Regular users would need to go through proper investment flow
        // For demo, we'll show a message about needing bridge role
        toast.info(
          <div>
            <p>Demo Investment Placed!</p>
            <p className="text-sm text-muted-foreground mt-1">
              In production, this would process payment and mint tokens via bridge.
              Currently requires BRIDGE_ROLE for demo minting.
            </p>
          </div>
        );
      }
      
      onClose();
    } catch (error: any) {
      console.error("Investment error:", error);
      toast.error(error.message || "Failed to place investment order");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Place Limit Buy Order</DialogTitle>
          <p className="text-muted-foreground">{jet.name} • {jet.location}</p>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
          {/* Left Column - Jet Details */}
          <div className="space-y-6">
            {/* Main Image */}
            <div className="aspect-video bg-muted rounded-lg overflow-hidden">
              <img 
                src={jet.image} 
                alt={jet.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Jet Information */}
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold">{jet.name}</h3>
                <p className="text-muted-foreground">{jet.model}</p>
              </div>
              
              <p className="text-sm">{jet.description}</p>
              
              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Rental Yield</p>
                  <p className="text-xl font-bold text-primary">{jet.rentalYield}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Projected Return</p>
                  <p className="text-xl font-bold text-primary">{jet.projectedReturn}%</p>
                </div>
              </div>

              {/* Features */}
              <div>
                <h4 className="font-semibold mb-2">Features</h4>
                <div className="flex flex-wrap gap-2">
                  {jet.features.map((feature, index) => (
                    <Badge key={index} variant="secondary">{feature}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Purchase Interface */}
          <div className="space-y-6">
            {/* Token Selection */}
            <div>
              <Label className="text-base font-semibold">Jet token quantity ⓘ</Label>
              <div className="grid grid-cols-1 gap-2 mt-3">
                {tokenOptions.map((option) => (
                  <Button
                    key={option.tokens}
                    variant={selectedTokens === option.tokens ? "default" : "outline"}
                    className="flex justify-between items-center h-auto py-3 px-4"
                    onClick={() => handleTokenSelection(option.tokens)}
                  >
                    <div className="flex items-center space-x-2">
                      <span>{option.label}</span>
                      {option.popular && (
                        <Badge variant="secondary" className="text-xs">MOST POPULAR</Badge>
                      )}
                    </div>
                    <span className="font-semibold">${option.price.toLocaleString()}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom Quantity */}
            <div>
              <Label htmlFor="custom-quantity">Custom quantity</Label>
              <Input
                id="custom-quantity"
                type="number"
                value={customAmount}
                onChange={(e) => handleCustomAmountChange(e.target.value)}
                placeholder="25"
                className="mt-1"
                min="1"
                max={jet.availableTokens}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Available: {jet.availableTokens.toLocaleString()} tokens
              </p>
            </div>

            {/* Order Type */}
            <div>
              <Label htmlFor="order-type">Order type</Label>
              <Select value={orderType} onValueChange={setOrderType}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="limit">Limit</SelectItem>
                  <SelectItem value="market">Market</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Payment Method */}
            <div>
              <Label htmlFor="payment-method">Payment method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="skyshare-wallet">SkyShare Wallet</SelectItem>
                  <SelectItem value="credit-card">Credit Card</SelectItem>
                  <SelectItem value="bank-account">Bank Account</SelectItem>
                  <SelectItem value="metamask">MetaMask</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Payment Currency */}
            <div>
              <div className="flex justify-between items-center">
                <Label>Payment currency</Label>
                <span className="text-sm text-muted-foreground">Available balance</span>
              </div>
              <Select value={paymentCurrency} onValueChange={setPaymentCurrency}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="C2FLR">C2FLR (Flare Testnet)</SelectItem>
                  <SelectItem value="USDC">USDC on Flare</SelectItem>
                  <SelectItem value="FLR">FLR (Flare)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Order Summary */}
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <h4 className="font-semibold">Order Summary</h4>
              <div className="flex justify-between text-sm">
                <span>Tokens:</span>
                <span>{customAmount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Price per token:</span>
                <span>${jet.tokenPrice}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Order type:</span>
                <span className="capitalize">{orderType}</span>
              </div>
              <div className="flex justify-between font-semibold border-t pt-2">
                <span>Total:</span>
                <span>${calculateTotal().toLocaleString()}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                variant="hero" 
                className="w-full" 
                size="lg"
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder || loading || parseInt(customAmount) <= 0 || !isCoston2}
              >
                {isPlacingOrder || loading ? 'Processing...' : 
                 !isConnected ? 'Connect Wallet to Place Order' : 
                 !isCoston2 ? 'Switch to Coston2' :
                 'Place Investment Order'}
              </Button>
              <Button variant="outline" className="w-full" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BuyOrderModal;
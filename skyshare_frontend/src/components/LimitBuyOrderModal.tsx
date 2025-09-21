import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
// import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useBlockchain } from "@/contexts/BlockchainContext";
import { ethers } from "ethers";

interface LimitBuyOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  jet: {
    id: string;
    name: string;
    location: string;
    image: string;
    tokenPrice: number;
    availableTokens: number;
  };
}

const LimitBuyOrderModal = ({ isOpen, onClose, jet }: LimitBuyOrderModalProps) => {
  const [quantity, setQuantity] = useState(1);
  const [orderType, setOrderType] = useState("market");
  const [paymentMethod, setPaymentMethod] = useState("metamask");
  const [paymentCurrency, setPaymentCurrency] = useState("C2FLR");
  const [isLoading, setIsLoading] = useState(false);
  
  const { fToken, isConnected } = useBlockchain();
  const { toast } = useToast();

  const presetQuantities = [
    { shares: 1, price: 0.01, label: "1 token" },
    { shares: 10, price: 0.1, label: "10 tokens" },
    { shares: 25, price: 0.25, label: "25 tokens", popular: true },
    { shares: 50, price: 0.5, label: "50 tokens" },
  ];

  const ethCost = quantity * 0.01; // 0.01 C2FLR per token

  const handlePresetClick = (shares: number) => {
    setQuantity(shares);
  };

  const explorerTx = (hash: string) => `https://coston2-explorer.flare.network/tx/${hash}`;

  const handlePlaceOrder = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first.",
        variant: "destructive"
      });
      return;
    }

    if (!fToken) {
      toast({
        title: "Contract not connected",
        description: "Please refresh the page and try again.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Buy tokens directly with ETH - NO BRIDGE_ROLE NEEDED!
      const tx = await fToken.buyTokens({ 
        value: ethers.parseEther(ethCost.toString()) 
      });
      const receipt = await tx.wait();
      
      toast({
        title: "Purchase successful!",
        description: (
          <div>
            <p>Bought {quantity} JET tokens for {ethCost.toFixed(3)} C2FLR</p>
            <a 
              href={explorerTx(receipt.hash)} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              🔗 View on Explorer
            </a>
          </div>
        ),
      });
      
      onClose();
    } catch (error: any) {
      console.error("Purchase error:", error);
      toast({
        title: "Purchase failed",
        description: error.message || error.reason || "Failed to purchase tokens.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl md:text-2xl">Buy Jet Tokens</DialogTitle>
          <div className="text-muted-foreground">
            <p className="font-semibold">{jet.name}</p>
            <p>{jet.location}</p>
          </div>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto pr-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            {/* Left side - Jet Image */}
            <div className="space-y-4">
              <div className="aspect-video rounded-lg overflow-hidden">
                <img 
                  src={jet.image} 
                  alt={jet.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Jet Details</h3>
                <p className="text-sm text-muted-foreground">
                  Luxurious private jet with premium amenities and professional crew.
                  Perfect for business travel and special occasions.
                </p>
              </div>
            </div>

            {/* Right side - Order Form */}
            <div className="space-y-6">
              {/* Quantity Selector */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Select Quantity</Label>
                <div className="grid grid-cols-2 gap-2">
                  {presetQuantities.map((preset) => (
                    <Button
                      key={preset.shares}
                      variant={quantity === preset.shares ? "default" : "outline"}
                      onClick={() => handlePresetClick(preset.shares)}
                      className="relative"
                      size="sm"
                    >
                      {preset.popular && (
                        <Badge className="absolute -top-2 -right-2 text-xs">
                          Popular
                        </Badge>
                      )}
                      <div className="text-center">
                        <div>{preset.label}</div>
                        <div className="text-xs text-muted-foreground">{preset.price} C2FLR</div>
                      </div>
                    </Button>
                  ))}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="custom-quantity">Custom Quantity</Label>
                  <Input
                    id="custom-quantity"
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    min={1}
                    max={10000}
                  />
                </div>
              </div>

              {/* Order Type */}
              <div className="space-y-2">
                <Label>Order Type</Label>
                <Select value={orderType} onValueChange={setOrderType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="market">Market Order (Instant)</SelectItem>
                    <SelectItem value="limit">Limit Order</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Payment Method */}
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="metamask">MetaMask</SelectItem>
                    <SelectItem value="wallet-connect">WalletConnect</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Payment Currency */}
              <div className="space-y-2">
                <Label>Payment Currency</Label>
                <Select value={paymentCurrency} onValueChange={setPaymentCurrency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="C2FLR">C2FLR (Coston2 Testnet)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Order Summary */}
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span>Quantity:</span>
                  <span>{quantity} JET tokens</span>
                </div>
                <div className="flex justify-between">
                  <span>Price per token:</span>
                  <span>0.01 C2FLR</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Total Cost:</span>
                  <span>{ethCost.toFixed(3)} C2FLR</span>
                </div>
              </div>

              {/* Place Order Button */}
              <Button 
                onClick={handlePlaceOrder}
                disabled={isLoading || !isConnected}
                className="w-full"
                size="lg"
              >
                {isLoading ? "Processing Purchase..." : `Buy ${quantity} Tokens - ${ethCost.toFixed(3)} C2FLR`}
              </Button>

              {!isConnected && (
                <p className="text-sm text-muted-foreground text-center">
                  Please connect your wallet to purchase tokens
                </p>
              )}

              {/* Info */}
              <div className="text-xs text-muted-foreground space-y-1">
                <p>• No bridge roles or complex permissions required</p>
                <p>• Instant token delivery upon payment</p>
                <p>• All transactions are recorded on Flare Coston2</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LimitBuyOrderModal;
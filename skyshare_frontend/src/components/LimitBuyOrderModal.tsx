import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useBlockchain } from "@/contexts/BlockchainContext";

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
  const [orderType, setOrderType] = useState("limit");
  const [paymentMethod, setPaymentMethod] = useState("skyshare-wallet");
  const [paymentCurrency, setPaymentCurrency] = useState("FLR");
  const [isLoading, setIsLoading] = useState(false);
  
  const { mintTokens, isConnected } = useBlockchain();
  const { toast } = useToast();

  const presetQuantities = [
    { shares: 1, price: 50, label: "1 share" },
    { shares: 10, price: 500, label: "10 shares" },
    { shares: 25, price: 1250, label: "25 shares", popular: true },
    { shares: 50, price: 2500, label: "50 shares" },
  ];

  const totalPrice = quantity * jet.tokenPrice;

  const handlePresetClick = (shares: number) => {
    setQuantity(shares);
  };

  const handlePlaceOrder = async () => {
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
      // For demo purposes, we'll mint the equivalent fSKY tokens
      const txHash = await mintTokens(quantity.toString());
      
      toast({
        title: "Order placed successfully!",
        description: `Purchased ${quantity} shares of ${jet.name}. Transaction: ${txHash.slice(0, 10)}...`,
      });
      
      onClose();
    } catch (error: any) {
      toast({
        title: "Order failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Place Limit Buy Order</DialogTitle>
          <div className="text-muted-foreground">
            <p className="font-semibold">{jet.name}</p>
            <p>{jet.location}</p>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                  >
                    {preset.popular && (
                      <Badge className="absolute -top-2 -right-2 text-xs">
                        Most Popular
                      </Badge>
                    )}
                    <div className="text-center">
                      <div>{preset.label}</div>
                      <div className="text-xs text-muted-foreground">${preset.price}</div>
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
                  max={jet.availableTokens}
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
                  <SelectItem value="limit">Limit Order</SelectItem>
                  <SelectItem value="market">Market Order</SelectItem>
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
                  <SelectItem value="skyshare-wallet">SkyShare Wallet</SelectItem>
                  <SelectItem value="credit-card">Credit Card</SelectItem>
                  <SelectItem value="bank-account">Bank Account</SelectItem>
                  <SelectItem value="metamask">MetaMask</SelectItem>
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
                  <SelectItem value="FLR">FLR (Flare)</SelectItem>
                  <SelectItem value="USDC">USDC on Flare</SelectItem>
                  <SelectItem value="C2FLR">C2FLR (Testnet)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Order Summary */}
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span>Quantity:</span>
                <span>{quantity} shares</span>
              </div>
              <div className="flex justify-between">
                <span>Price per share:</span>
                <span>${jet.tokenPrice}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Total:</span>
                <span>${totalPrice}</span>
              </div>
            </div>

            {/* Place Order Button */}
            <Button 
              onClick={handlePlaceOrder}
              disabled={isLoading || !isConnected}
              className="w-full"
              size="lg"
            >
              {isLoading ? "Processing Order..." : `Place Order - $${totalPrice}`}
            </Button>

            {!isConnected && (
              <p className="text-sm text-muted-foreground text-center">
                Please connect your wallet to place an order
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LimitBuyOrderModal;
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard, Building2, Wallet, Check } from "lucide-react";
import { useWeb3 } from "@/contexts/Web3Context";
import { toast } from "sonner";

interface AddWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddWalletModal = ({ isOpen, onClose }: AddWalletModalProps) => {
  const { isConnected, connectWallet, account } = useWeb3();
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    // Bank Account
    accountNumber: '',
    routingNumber: '',
    accountType: 'checking',
    // Credit Card
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
  });

  const paymentMethods = [
    {
      id: 'bank-account',
      title: 'Bank Account',
      description: 'Link your bank account for ACH transfers',
      icon: Building2,
      available: true
    },
    {
      id: 'credit-card',
      title: 'Credit Card',
      description: 'Add a credit or debit card',
      icon: CreditCard,
      available: true
    },
    {
      id: 'external-wallet',
      title: 'External Wallet',
      description: 'Connect MetaMask or other Web3 wallets',
      icon: Wallet,
      available: true
    }
  ];

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddPaymentMethod = async () => {
    if (!selectedMethod) return;

    setIsAdding(true);
    
    try {
      if (selectedMethod === 'external-wallet') {
        if (!isConnected) {
          await connectWallet();
        }
        toast.success("External wallet connected successfully!");
      } else {
        // Simulate adding payment method
        await new Promise(resolve => setTimeout(resolve, 2000));
        toast.success(`${paymentMethods.find(m => m.id === selectedMethod)?.title} added successfully!`);
      }
      
      onClose();
      setSelectedMethod(null);
      setFormData({
        accountNumber: '',
        routingNumber: '',
        accountType: 'checking',
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        cardholderName: '',
      });
    } catch (error) {
      toast.error("Failed to add payment method. Please try again.");
    } finally {
      setIsAdding(false);
    }
  };

  const renderMethodForm = () => {
    switch (selectedMethod) {
      case 'bank-account':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="account-number">Account Number</Label>
              <Input
                id="account-number"
                type="text"
                value={formData.accountNumber}
                onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                placeholder="Enter your account number"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="routing-number">Routing Number</Label>
              <Input
                id="routing-number"
                type="text"
                value={formData.routingNumber}
                onChange={(e) => handleInputChange('routingNumber', e.target.value)}
                placeholder="Enter your routing number"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="account-type">Account Type</Label>
              <select
                id="account-type"
                value={formData.accountType}
                onChange={(e) => handleInputChange('accountType', e.target.value)}
                className="mt-1 w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="checking">Checking</option>
                <option value="savings">Savings</option>
              </select>
            </div>
          </div>
        );

      case 'credit-card':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="cardholder-name">Cardholder Name</Label>
              <Input
                id="cardholder-name"
                type="text"
                value={formData.cardholderName}
                onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                placeholder="Enter cardholder name"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="card-number">Card Number</Label>
              <Input
                id="card-number"
                type="text"
                value={formData.cardNumber}
                onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                placeholder="1234 5678 9012 3456"
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiry-date">Expiry Date</Label>
                <Input
                  id="expiry-date"
                  type="text"
                  value={formData.expiryDate}
                  onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                  placeholder="MM/YY"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  type="text"
                  value={formData.cvv}
                  onChange={(e) => handleInputChange('cvv', e.target.value)}
                  placeholder="123"
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        );

      case 'external-wallet':
        return (
          <div className="space-y-4">
            <div className="text-center p-6 bg-muted rounded-lg">
              <Wallet className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="text-lg font-semibold mb-2">Connect External Wallet</h3>
              <p className="text-muted-foreground mb-4">
                Connect your MetaMask or other Web3 wallet to use with SkyShare
              </p>
              {isConnected ? (
                <div className="flex items-center justify-center space-x-2 text-green-600">
                  <Check className="w-5 h-5" />
                  <span>Connected: {account?.slice(0, 6)}...{account?.slice(-4)}</span>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Click "Add Payment Method" below to connect your wallet
                </p>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Add wallet or payment method</DialogTitle>
          <p className="text-muted-foreground">
            Choose how you'd like to fund your SkyShare investments
          </p>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {!selectedMethod ? (
            <div className="grid grid-cols-1 gap-4">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <Card 
                    key={method.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      !method.available ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    onClick={() => method.available && handleMethodSelect(method.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-primary/10 rounded-lg">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{method.title}</h3>
                          <p className="text-sm text-muted-foreground">{method.description}</p>
                        </div>
                        {!method.available && (
                          <span className="text-xs bg-muted px-2 py-1 rounded">Coming Soon</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center space-x-4 p-4 bg-muted rounded-lg">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedMethod(null)}
                >
                  ← Back
                </Button>
                <div>
                  <h3 className="font-semibold">
                    {paymentMethods.find(m => m.id === selectedMethod)?.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {paymentMethods.find(m => m.id === selectedMethod)?.description}
                  </p>
                </div>
              </div>

              {renderMethodForm()}

              <div className="flex space-x-4">
                <Button 
                  variant="hero" 
                  className="flex-1"
                  onClick={handleAddPaymentMethod}
                  disabled={isAdding}
                >
                  {isAdding ? 'Adding...' : 'Add Payment Method'}
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setSelectedMethod(null)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddWalletModal;
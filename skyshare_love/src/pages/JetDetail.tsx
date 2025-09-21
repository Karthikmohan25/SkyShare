import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Heart, Users, Gauge, Clock, Calendar } from "lucide-react";
import Layout from "@/components/Layout";
import { mockJets } from "@/data/mockJets";

const JetDetail = () => {
  const { id } = useParams();
  const jet = mockJets.find(j => j.id === id);
  const [selectedTokens, setSelectedTokens] = useState(25);
  const [customAmount, setCustomAmount] = useState("25");

  if (!jet) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">Jet not found</h2>
          <Link to="/marketplace">
            <Button className="mt-4">Back to Marketplace</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const tokenOptions = [
    { tokens: 1, price: 50 },
    { tokens: 10, price: 505 }, 
    { tokens: 25, price: 1262 },
    { tokens: 50, price: 2524 },
    { tokens: 100, price: 5047 }
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Link to="/marketplace">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Place Limit Buy Order</h1>
            <p className="text-muted-foreground">{jet.location}</p>
          </div>
          <Button variant="ghost" size="icon">
            <Heart className="w-5 h-5" />
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Jet Details */}
          <div className="space-y-6">
            {/* Main Image */}
            <Card>
              <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                <img 
                  src={jet.image} 
                  alt={jet.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </Card>

            {/* Jet Information */}
            <Card>
              <CardHeader>
                <CardTitle>{jet.name}</CardTitle>
                <p className="text-muted-foreground">{jet.model}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">{jet.description}</p>
                
                {/* Specifications */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{jet.specifications.maxPassengers} Passengers</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Gauge className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{jet.specifications.range} Range</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{jet.specifications.maxSpeed}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{jet.specifications.yearBuilt}</span>
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

                {/* Performance Metrics */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-muted-foreground">Rental Yield</p>
                    <p className="text-xl font-bold text-primary">{jet.rentalYield}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Projected Return</p>
                    <p className="text-xl font-bold text-primary">{jet.projectedReturn}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Purchase Interface */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Jet token quantity ⓘ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Token Selection */}
                <div className="grid grid-cols-5 gap-2">
                  {tokenOptions.map((option) => (
                    <Button
                      key={option.tokens}
                      variant={selectedTokens === option.tokens ? "default" : "outline"}
                      className="flex flex-col h-auto py-3"
                      onClick={() => {
                        setSelectedTokens(option.tokens);
                        setCustomAmount(option.tokens.toString());
                      }}
                    >
                      <span className="text-sm">{option.tokens} tokens</span>
                      <span className="text-xs text-muted-foreground">${option.price}</span>
                      {option.tokens === 25 && (
                        <Badge variant="secondary" className="mt-1 text-xs">MOST POPULAR</Badge>
                      )}
                    </Button>
                  ))}
                </div>

                {/* Custom Quantity */}
                <div>
                  <Label htmlFor="custom-quantity">Custom quantity</Label>
                  <Input
                    id="custom-quantity"
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="25"
                    className="mt-1"
                  />
                </div>

                {/* Order Type */}
                <div>
                  <Label htmlFor="order-type">Order type</Label>
                  <Select defaultValue="limit">
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
                  <Select defaultValue="lofty-wallet">
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lofty-wallet">Lofty Wallet</SelectItem>
                      <SelectItem value="credit-card">Credit Card</SelectItem>
                      <SelectItem value="bank-account">Bank Account</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Payment Currency */}
                <div className="flex justify-between items-center">
                  <Label>Payment currency</Label>
                  <span className="text-sm text-muted-foreground">0.000000 available</span>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button variant="hero" className="w-full" size="lg">
                    Place Order
                  </Button>
                  <Button variant="outline" className="w-full">
                    Add to Watchlist
                  </Button>
                </div>

                {/* Summary */}
                <div className="pt-4 border-t space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Tokens:</span>
                    <span>{customAmount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Price per token:</span>
                    <span>${jet.tokenPrice}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>${(parseInt(customAmount) * jet.tokenPrice).toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default JetDetail;
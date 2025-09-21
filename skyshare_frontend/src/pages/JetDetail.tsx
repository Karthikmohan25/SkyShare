import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Heart, Users, Gauge, Clock, Calendar } from "lucide-react";
import Layout from "@/components/Layout";
import LimitBuyOrderModal from "@/components/LimitBuyOrderModal";
import { mockJets } from "@/data/mockJets";
import { useBlockchain } from "@/contexts/BlockchainContext";

const JetDetail = () => {
  const { id } = useParams();
  const jet = mockJets.find(j => j.id === id);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const { isConnected, connectWallet } = useBlockchain();

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
                <CardTitle>Investment Opportunity</CardTitle>
                <p className="text-muted-foreground">
                  Own a fraction of this luxury jet and earn rental income
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-2xl font-bold text-primary">{jet.rentalYield}%</p>
                    <p className="text-sm text-muted-foreground">Rental Yield</p>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-2xl font-bold text-primary">{jet.projectedReturn}%</p>
                    <p className="text-sm text-muted-foreground">Projected Return</p>
                  </div>
                </div>

                {/* Availability */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Available Tokens:</span>
                    <span className="text-sm font-semibold">{jet.availableTokens.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Price per Token:</span>
                    <span className="text-sm font-semibold">${jet.tokenPrice}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  {isConnected ? (
                    <Button 
                      variant="hero" 
                      className="w-full" 
                      size="lg"
                      onClick={() => setIsOrderModalOpen(true)}
                    >
                      Place Limit Buy Order
                    </Button>
                  ) : (
                    <Button 
                      variant="hero" 
                      className="w-full" 
                      size="lg"
                      onClick={connectWallet}
                    >
                      Connect Wallet to Invest
                    </Button>
                  )}
                  
                  <Button variant="outline" className="w-full">
                    Add to Watchlist
                  </Button>
                </div>

                {/* Investment Info */}
                <div className="pt-4 border-t space-y-2 text-sm text-muted-foreground">
                  <p>• Fractional ownership backed by blockchain technology</p>
                  <p>• Earn rental income from charter flights</p>
                  <p>• Transparent and secure transactions on Flare Network</p>
                  <p>• Professional jet management and maintenance included</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Limit Buy Order Modal */}
        {jet && (
          <LimitBuyOrderModal
            isOpen={isOrderModalOpen}
            onClose={() => setIsOrderModalOpen(false)}
            jet={jet}
          />
        )}
      </div>
    </Layout>
  );
};

export default JetDetail;
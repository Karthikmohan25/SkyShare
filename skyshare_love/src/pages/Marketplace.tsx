import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import Layout from "@/components/Layout";
import { mockJets, Jet } from "@/data/mockJets";
import BuyOrderModal from "@/components/BuyOrderModal";
import AddWalletModal from "@/components/AddWalletModal";

const Marketplace = () => {
  const [likedJets, setLikedJets] = useState<Set<string>>(new Set());
  const [selectedJet, setSelectedJet] = useState<Jet | null>(null);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);

  const toggleLike = (jetId: string) => {
    const newLiked = new Set(likedJets);
    if (newLiked.has(jetId)) {
      newLiked.delete(jetId);
    } else {
      newLiked.add(jetId);
    }
    setLikedJets(newLiked);
  };

  const handleInvestClick = (jet: Jet) => {
    setSelectedJet(jet);
    setShowBuyModal(true);
  };

  const handleCloseBuyModal = () => {
    setShowBuyModal(false);
    setSelectedJet(null);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold">Jet Marketplace</h2>
            <p className="text-muted-foreground mt-1">Recent listings • Fractional jet ownership</p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={() => setShowWalletModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Payment Method
            </Button>
            <Button variant="outline">Filter & Sort</Button>
          </div>
        </div>

        {/* Jets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {mockJets.map((jet) => (
            <Card key={jet.id} className="group overflow-hidden">
              <div className="relative">
                <Badge className="absolute top-3 left-3 z-10 bg-primary/90">
                  RECENT LISTING
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-3 right-3 z-10 bg-background/80 hover:bg-background"
                  onClick={() => toggleLike(jet.id)}
                >
                  <Heart 
                    className={`w-4 h-4 ${likedJets.has(jet.id) ? 'fill-red-500 text-red-500' : ''}`}
                  />
                </Button>

                {/* Image Carousel */}
                <div className="relative aspect-video bg-muted flex items-center justify-center">
                  <img 
                    src={jet.image} 
                    alt={jet.name}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Carousel Controls */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>

                  {/* Dots Indicator */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-1">
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                    <div className="w-2 h-2 rounded-full bg-white/50"></div>
                    <div className="w-2 h-2 rounded-full bg-white/50"></div>
                  </div>
                </div>
              </div>

              <CardContent className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-lg">{jet.name}</h3>
                  <p className="text-sm text-muted-foreground">{jet.location}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm">
                    <span className="text-primary font-semibold">{jet.rentalYield}%</span> Rental Yield
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {jet.projectedReturn}% Projected Annual Return
                  </p>
                </div>

                <div className="space-y-2">
                  <Button 
                    variant="hero" 
                    className="w-full"
                    onClick={() => handleInvestClick(jet)}
                  >
                    Invest
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    {jet.availableTokens.toLocaleString()} tokens available at ${jet.tokenPrice} each
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Modals */}
        {selectedJet && (
          <BuyOrderModal
            isOpen={showBuyModal}
            onClose={handleCloseBuyModal}
            jet={selectedJet}
          />
        )}
        
        <AddWalletModal
          isOpen={showWalletModal}
          onClose={() => setShowWalletModal(false)}
        />
      </div>
    </Layout>
  );
};

export default Marketplace;
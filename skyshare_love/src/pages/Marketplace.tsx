import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, ChevronLeft, ChevronRight } from "lucide-react";
import Layout from "@/components/Layout";
import { mockJets } from "@/data/mockJets";

const Marketplace = () => {
  const [likedJets, setLikedJets] = useState<Set<string>>(new Set());

  const toggleLike = (jetId: string) => {
    const newLiked = new Set(likedJets);
    if (newLiked.has(jetId)) {
      newLiked.delete(jetId);
    } else {
      newLiked.add(jetId);
    }
    setLikedJets(newLiked);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold">Jet Marketplace</h2>
          <Button variant="outline">Filter & Sort</Button>
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

                <Link to={`/jet/${jet.id}`}>
                  <Button 
                    variant="hero" 
                    className="w-full"
                  >
                    Available: {jet.availableTokens.toLocaleString()} tokens at ${jet.tokenPrice}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Marketplace;
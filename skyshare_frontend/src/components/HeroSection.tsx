import { Button } from "@/components/ui/button";
import { ArrowRight, Plane } from "lucide-react";
import heroJet from "@/assets/hero-jet.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-hero-gradient">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
        style={{ backgroundImage: `url(${heroJet})` }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/40 to-background/80" />
      
      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        <div className="flex items-center justify-center mb-6">
          <Plane className="w-8 h-8 text-primary mr-3" />
          <span className="text-lg font-semibold text-muted-foreground tracking-wider uppercase">SkyShare</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-sky-gradient bg-clip-text text-transparent leading-tight">
          Own the Sky,<br />
          Share the Journey
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
          Revolutionary fractional private jet ownership powered by Flare blockchain. 
          Transparent revenue sharing, instant liquidity, and programmable ownership.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <a href="/marketplace">
            <Button variant="hero" size="xl" className="group">
              Start Your Journey
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </a>
          <a href="/dashboard">
            <Button variant="premium" size="xl">
              View Dashboard
            </Button>
          </a>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">$0</div>
            <div className="text-sm text-muted-foreground uppercase tracking-wide">Transaction Fees</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-accent mb-2">2.8s</div>
            <div className="text-sm text-muted-foreground uppercase tracking-wide">Settlement Time</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">100%</div>
            <div className="text-sm text-muted-foreground uppercase tracking-wide">Transparent</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
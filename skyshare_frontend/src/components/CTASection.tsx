import { Button } from "@/components/ui/button";
import { ArrowRight, Github, BookOpen } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-24 px-6 bg-hero-gradient relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-sky-gradient opacity-10"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
      
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-sky-gradient bg-clip-text text-transparent">
          Ready to Take Flight?
        </h2>
        <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
          Join the revolution in fractional aviation ownership. Experience transparent, liquid, and automated private jet investment on Flare.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
          <a href="/marketplace">
            <Button variant="hero" size="xl" className="group">
              Launch dApp
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </a>
          <Button variant="premium" size="xl" className="group">
            <Github className="mr-2 w-5 h-5" />
            View Source
          </Button>
          <Button variant="ghost" size="xl" className="group text-muted-foreground hover:text-foreground">
            <BookOpen className="mr-2 w-5 h-5" />
            Documentation
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary mb-2">Hackathon Winner</div>
            <div className="text-sm text-muted-foreground">Built on Flare</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-accent mb-2">Open Source</div>
            <div className="text-sm text-muted-foreground">MIT Licensed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary mb-2">Enterprise Ready</div>
            <div className="text-sm text-muted-foreground">Production Scaling</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
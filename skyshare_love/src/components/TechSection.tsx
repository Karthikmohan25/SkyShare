import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cpu, Database, Lock, Zap } from "lucide-react";

const techFeatures = [
  {
    icon: Database,
    title: "Flare FRC-20 Tokens",
    description: "Native blockchain assets with minimal overhead for representing jet ownership shares",
    benefits: ["Layer-1 security", "Low transaction costs", "Fast settlement"]
  },
  {
    icon: Cpu,
    title: "Smart Contract Automation",
    description: "Stateful applications handling revenue distribution with deterministic, auditable logic",
    benefits: ["Trustless execution", "Transparent operations", "Automated payouts"]
  },
  {
    icon: Zap,
    title: "Instant Finality",
    description: "2.8 second block times enable real-time settlement for micro-transactions",
    benefits: ["No confirmation delays", "Immediate liquidity", "Efficient operations"]
  },
  {
    icon: Lock,
    title: "Enterprise Security",
    description: "Bank-grade cryptographic security with optional compliance and governance features",
    benefits: ["Regulatory compliance", "Identity verification", "Transfer controls"]
  }
];

const TechSection = () => {
  return (
    <section className="py-24 px-6 bg-secondary/20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Badge variant="outline" className="text-primary border-primary/50 bg-primary/10 px-4 py-2 text-sm font-semibold">
              Powered by Flare
            </Badge>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-sky-gradient bg-clip-text text-transparent">
            Built for Scale & Security
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Enterprise-grade blockchain infrastructure designed for high-value asset tokenization and institutional compliance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {techFeatures.map((feature, index) => (
            <Card key={index} className="bg-card-gradient backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-smooth hover:shadow-glow-primary group">
              <CardHeader>
                <div className="w-14 h-14 bg-sky-gradient rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-bounce">
                  <feature.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
                <CardDescription className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {feature.benefits.map((benefit, benefitIndex) => (
                    <Badge key={benefitIndex} variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">
                      {benefit}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-card-gradient backdrop-blur-sm border-primary/30 shadow-glow-primary">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl mb-2">Why Flare?</CardTitle>
            <CardDescription className="text-muted-foreground">
              The blockchain built for data and connectivity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-primary mb-2">$0.001</div>
                <div className="text-sm text-muted-foreground">Transaction Fee</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-accent mb-2">2.8s</div>
                <div className="text-sm text-muted-foreground">Block Time</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">0%</div>
                <div className="text-sm text-muted-foreground">Carbon Footprint</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-accent mb-2">6M+</div>
                <div className="text-sm text-muted-foreground">TPS Capacity</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default TechSection;
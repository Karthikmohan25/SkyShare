import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins, Shield, TrendingUp, Users, Zap, Globe } from "lucide-react";

const features = [
  {
    icon: Coins,
    title: "Tokenized Ownership",
    description: "Private jets tokenized as Flare FRC-20 tokens with fractional shares trading seamlessly on-chain."
  },
  {
    icon: TrendingUp,
    title: "Automated Revenue Sharing",
    description: "Smart contracts automatically distribute charter rental income pro-rata to token holders with zero trust required."
  },
  {
    icon: Shield,
    title: "Transparent & Secure",
    description: "All transactions, ownership records, and payouts are publicly verifiable on Flare's secure blockchain."
  },
  {
    icon: Zap,
    title: "Instant Settlement",
    description: "Fast finality and low fees enable micro-payouts and frequent distributions without economic barriers."
  },
  {
    icon: Users,
    title: "Liquid Ownership",
    description: "Transfer or trade your jet shares instantly without complex paperwork or intermediary approval."
  },
  {
    icon: Globe,
    title: "Global Access",
    description: "Participate in premium aviation markets from anywhere in the world with just a Flare wallet."
  }
];

const FeaturesSection = () => {
  return (
    <section className="py-24 px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-sky-gradient bg-clip-text text-transparent">
            Revolutionary Features
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience the future of fractional aircraft ownership with blockchain-powered transparency and automation.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="bg-card-gradient backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-smooth hover:shadow-glow-primary group">
              <CardHeader>
                <div className="w-12 h-12 bg-sky-gradient rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-bounce">
                  <feature.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
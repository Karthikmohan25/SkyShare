import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import blockchainNetwork from "@/assets/blockchain-network.jpg";

const steps = [
  {
    step: "01",
    title: "Jet Tokenization",
    description: "A private jet is fractionalized into 1,000 fungible FRC-20 tokens on Flare blockchain, representing ownership shares.",
    details: ["FRC-20 token creation", "Smart contract deployment", "Ownership verification"]
  },
  {
    step: "02", 
    title: "Share Distribution",
    description: "Investors purchase FRC-20 tokens representing fractional ownership, with all transactions recorded on-chain.",
    details: ["Wallet integration", "Token purchase", "Ownership tracking"]
  },
  {
    step: "03",
    title: "Charter Operations",
    description: "Third-party charter companies rent the aircraft, with rental payments automatically flowing to the smart contract.",
    details: ["Charter bookings", "Payment processing", "Revenue collection"]
  },
  {
    step: "04",
    title: "Automated Distribution",
    description: "Smart contract reads token balances and distributes rental income pro-rata to current shareholders instantly.",
    details: ["Balance verification", "Pro-rata calculation", "Instant payouts"]
  }
];

const HowItWorksSection = () => {
  return (
    <section className="py-24 px-6 bg-secondary/20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-sky-gradient bg-clip-text text-transparent">
            How SkyShare Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A seamless four-step process that transforms traditional private aviation ownership into a transparent, liquid, and automated experience.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div className="space-y-8">
            {steps.map((step, index) => (
              <Card key={index} className="bg-card-gradient backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-smooth hover:shadow-glow-primary">
                <CardHeader>
                  <div className="flex items-center gap-4 mb-2">
                    <Badge variant="outline" className="text-primary border-primary bg-primary/10 font-bold text-lg px-3 py-1">
                      {step.step}
                    </Badge>
                    <CardTitle className="text-xl">{step.title}</CardTitle>
                  </div>
                  <CardDescription className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {step.details.map((detail, detailIndex) => (
                      <Badge key={detailIndex} variant="secondary" className="text-xs">
                        {detail}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="relative">
            <div className="rounded-2xl overflow-hidden shadow-glow-accent">
              <img 
                src={blockchainNetwork} 
                alt="Blockchain Network Visualization" 
                className="w-full h-auto"
              />
            </div>
            <div className="absolute inset-0 bg-sky-gradient opacity-20 rounded-2xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
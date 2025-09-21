import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Circle, Sparkles } from "lucide-react";

const roadmapItems = [
  {
    phase: "v0",
    title: "MVP Launch",
    status: "completed",
    description: "Core functionality for fractional ownership and revenue distribution",
    features: [
      "FRC-20 token creation and management",
      "Smart contract for revenue pooling",
      "Admin-triggered pro-rata distribution",
      "Basic wallet integration",
      "LocalNet demo environment"
    ]
  },
  {
    phase: "v1",
    title: "Enhanced Platform",
    status: "current",
    description: "Advanced features for operational efficiency and user experience",
    features: [
      "Multi-asset rent pools (USDC/FRC-20)",
      "Automated holder discovery system",
      "Event logs and payout receipts",
      "Charter booking API integration",
      "CSV export for tax reporting"
    ]
  },
  {
    phase: "v2",
    title: "Ecosystem Expansion", 
    status: "planned",
    description: "DAO governance and sustainability features",
    features: [
      "Decentralized governance for fee splits",
      "NFT Flight Passes for usage rights",
      "Carbon credit auto-offsetting",
      "Secondary market integration",
      "Cross-chain compatibility"
    ]
  }
];

const RoadmapSection = () => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-6 h-6 text-accent" />;
      case "current":
        return <Sparkles className="w-6 h-6 text-primary" />;
      default:
        return <Circle className="w-6 h-6 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-accent/20 text-accent border-accent/30">Completed</Badge>;
      case "current":
        return <Badge className="bg-primary/20 text-primary border-primary/30">In Progress</Badge>;
      default:
        return <Badge variant="outline" className="text-muted-foreground">Planned</Badge>;
    }
  };

  return (
    <section className="py-24 px-6 bg-background">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-sky-gradient bg-clip-text text-transparent">
            Development Roadmap
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our journey from MVP to a comprehensive decentralized aviation ecosystem on Flare.
          </p>
        </div>

        <div className="space-y-8">
          {roadmapItems.map((item, index) => (
            <Card key={index} className="bg-card-gradient backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-smooth hover:shadow-glow-primary">
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    {getStatusIcon(item.status)}
                    <div>
                      <CardTitle className="text-2xl flex items-center gap-3">
                        <span className="text-primary font-mono">{item.phase}</span>
                        {item.title}
                      </CardTitle>
                      <CardDescription className="text-muted-foreground mt-2">
                        {item.description}
                      </CardDescription>
                    </div>
                  </div>
                  {getStatusBadge(item.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {item.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0"></div>
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RoadmapSection;
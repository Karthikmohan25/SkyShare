import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Layout from "@/components/Layout";

const Dashboard = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <h2 className="text-3xl font-bold">Assets Overview</h2>
        
        {/* Account Value Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Account Value ⓘ</p>
                  <p className="text-4xl font-bold">$0.00</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Available Balance ⓘ</p>
                  <p className="text-2xl font-semibold">$0.00</p>
                </div>
              </div>
              <div className="flex space-x-4">
                <Button variant="hero" className="flex-1">Deposit</Button>
                <Button variant="outline" className="flex-1">Withdraw</Button>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">Rent Balance</p>
              <p className="text-2xl font-bold">$0.00</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">Total Rent Earned</p>
              <p className="text-2xl font-bold text-primary">$0.00 <span className="text-sm text-muted-foreground">0.00%</span></p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">Est. Jet Value ⓘ</p>
              <p className="text-2xl font-bold">$0.00</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">Jets Owned ⓘ</p>
              <p className="text-2xl font-bold">0</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">Total Account Return ⓘ</p>
              <p className="text-2xl font-bold text-primary">0.00%</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">Total Lending Rewards ⓘ</p>
              <p className="text-2xl font-bold text-primary">$0.00 <span className="text-sm text-muted-foreground">0.00%</span></p>
            </Card>
          </div>
        </div>

        {/* Get Started Section */}
        <Card className="p-8 text-center">
          <div className="max-w-2xl mx-auto space-y-4">
            <h3 className="text-xl font-semibold">
              Invest in your first jet and then view your jet holdings, value, appreciation and rental income here.
            </h3>
            <p className="text-muted-foreground">
              You can also withdraw your rental income from this menu. Click below to get started.
            </p>
            <Button variant="hero" size="lg" className="mt-6">
              View Jets
            </Button>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;
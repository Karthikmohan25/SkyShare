import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  Search, 
  Wallet, 
  Settings, 
  Star, 
  BarChart3, 
  CreditCard,
  FileText,
  Plane
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useBlockchain } from "@/contexts/BlockchainContext";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const { isConnected, account, connectWallet, balances } = useBlockchain();

  const navigation = [
    { name: "Assets Overview", href: "/dashboard", icon: Home },
    { name: "Marketplace", href: "/marketplace", icon: Search },
    { name: "Wallet", href: "/wallet", icon: Wallet },
    { name: "Transactions", href: "/transactions", icon: BarChart3 },
    { name: "Reviews", href: "/reviews", icon: Star },
    { name: "Refer and Earn", href: "/refer", icon: CreditCard },
    { name: "Taxes", href: "/taxes", icon: FileText },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className="w-64 bg-card border-r border-border flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <Link to="/" className="flex items-center space-x-2">
            <Plane className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold">SkyShare</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={cn(
                      "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
                      isActive 
                        ? "bg-primary text-primary-foreground" 
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Version */}
        <div className="p-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Version: 1.3.1.2-61-175832026S-prod
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-card border-b border-border p-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">
              Welcome {isConnected ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'to SkyShare'}!
            </h1>
            <p className="text-muted-foreground">
              {isConnected 
                ? `Balance: ${parseFloat(balances.fSky).toFixed(2)} fSKY | ${parseFloat(balances.eth).toFixed(4)} C2FLR`
                : 'Connect your wallet to start investing in jets.'
              }
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {isConnected ? (
              <>
                <Button variant="outline" size="sm">
                  Recent Updates <span className="ml-1 bg-destructive text-destructive-foreground rounded-full px-1 text-xs">3</span>
                </Button>
                <Button variant="outline" size="sm">
                  {account.slice(0, 6)}...{account.slice(-4)} ▼
                </Button>
              </>
            ) : (
              <Button onClick={connectWallet} variant="hero" size="sm">
                Connect Wallet
              </Button>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
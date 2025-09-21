import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Construction, 
  ArrowLeft, 
  Star, 
  Users, 
  Calculator, 
  Settings as SettingsIcon,
  Clock
} from "lucide-react";
import Layout from "@/components/Layout";
import { useNavigate, useLocation } from "react-router-dom";

const WorkInProgress = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getPageInfo = () => {
    const path = location.pathname;
    switch (path) {
      case '/reviews':
        return {
          title: 'Reviews & Ratings',
          icon: <Star className="w-16 h-16 text-yellow-500" />,
          description: 'Rate your jet experiences and read reviews from other owners',
          features: [
            'Rate jet performance and service',
            'Read reviews from other token holders',
            'View jet maintenance history',
            'Share your flight experiences'
          ]
        };
      case '/refer':
        return {
          title: 'Referral Program',
          icon: <Users className="w-16 h-16 text-blue-500" />,
          description: 'Invite friends and earn rewards for successful referrals',
          features: [
            'Earn bonus tokens for referrals',
            'Track your referral statistics',
            'Share personalized referral links',
            'View referral rewards history'
          ]
        };
      case '/taxes':
        return {
          title: 'Tax Center',
          icon: <Calculator className="w-16 h-16 text-green-500" />,
          description: 'Manage your tax reporting and download necessary documents',
          features: [
            'Download tax documents (1099, etc.)',
            'Track capital gains and losses',
            'Export transaction history',
            'Connect with tax professionals'
          ]
        };
      case '/settings':
        return {
          title: 'Account Settings',
          icon: <SettingsIcon className="w-16 h-16 text-purple-500" />,
          description: 'Customize your account preferences and security settings',
          features: [
            'Update profile information',
            'Manage notification preferences',
            'Security and privacy settings',
            'Connected wallet management'
          ]
        };
      default:
        return {
          title: 'Feature Coming Soon',
          icon: <Construction className="w-16 h-16 text-orange-500" />,
          description: 'This feature is currently under development',
          features: ['Coming soon...']
        };
    }
  };

  const pageInfo = getPageInfo();

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* Main Content */}
        <div className="text-center space-y-6">
          {pageInfo.icon}
          
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-3">
              <h1 className="text-4xl font-bold">{pageInfo.title}</h1>
              <Badge variant="outline" className="text-orange-600 border-orange-600">
                <Clock className="w-3 h-3 mr-1" />
                Coming Soon
              </Badge>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {pageInfo.description}
            </p>
          </div>

          {/* Work in Progress Card */}
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2">
                <Construction className="w-5 h-5 text-orange-500" />
                Work in Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                We're working hard to bring you this feature. Here's what you can expect:
              </p>
              
              <div className="space-y-2">
                {pageInfo.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-left">
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Want to be notified when this feature launches? 
                  <br />
                  Follow our updates or contact our team for more information.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </Button>
            <Button variant="outline" onClick={() => navigate('/marketplace')}>
              Browse Jets
            </Button>
          </div>

          {/* Timeline */}
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Development Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Badge className="bg-green-100 text-green-800">✓ Complete</Badge>
                  <span className="text-sm">Core platform and jet marketplace</span>
                </div>
                <div className="flex items-center gap-4">
                  <Badge className="bg-green-100 text-green-800">✓ Complete</Badge>
                  <span className="text-sm">Wallet integration and transactions</span>
                </div>
                <div className="flex items-center gap-4">
                  <Badge className="bg-yellow-100 text-yellow-800">🔄 In Progress</Badge>
                  <span className="text-sm">Advanced features ({pageInfo.title.toLowerCase()})</span>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant="outline">📅 Planned</Badge>
                  <span className="text-sm">Mobile app and additional integrations</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default WorkInProgress;
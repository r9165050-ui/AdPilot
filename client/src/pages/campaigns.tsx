import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Facebook, Instagram, Edit, Pause, Play, MoreHorizontal, Plus, CreditCard } from "lucide-react";
import type { Campaign } from "@shared/schema";
import { useState } from "react";
import { Link } from "wouter";
import CampaignWizard from "@/components/campaigns/campaign-wizard";

export default function Campaigns() {
  const [showWizard, setShowWizard] = useState(false);
  
  const { data: campaigns, isLoading } = useQuery<Campaign[]>({
    queryKey: ["/api/campaigns"],
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-64 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success bg-opacity-10 text-success';
      case 'paused':
        return 'bg-warning bg-opacity-10 text-warning';
      case 'draft':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getPlatformIcons = (platforms: string[]) => {
    return platforms.map((platform) => {
      if (platform === 'facebook') {
        return <Facebook key="facebook" className="text-fb-blue" size={16} />;
      }
      if (platform === 'instagram') {
        return <Instagram key="instagram" className="text-ig-pink" size={16} />;
      }
      return null;
    });
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-text-dark">All Campaigns</h2>
            <p className="text-gray-500 mt-1">Manage your Meta advertising campaigns</p>
          </div>
          <Button 
            onClick={() => setShowWizard(true)}
            className="bg-fb-blue text-white hover:bg-blue-600 mt-4 sm:mt-0"
          >
            <Plus className="mr-2" size={16} />
            Create Campaign
          </Button>
        </div>

        {campaigns?.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-gray-500">
                <p className="text-lg font-medium mb-2">No campaigns yet</p>
                <p className="text-sm mb-6">Create your first campaign to get started with Meta advertising</p>
                <Button 
                  onClick={() => setShowWizard(true)}
                  className="bg-fb-blue text-white hover:bg-blue-600"
                >
                  <Plus className="mr-2" size={16} />
                  Create Your First Campaign
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns?.map((campaign) => (
              <Link key={campaign.id} href={`/campaigns/${campaign.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg" />
                        <div>
                          <h3 className="font-semibold text-text-dark">{campaign.name}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            {getPlatformIcons(campaign.platforms)}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Badge className={`${getStatusColor(campaign.status)} border-0`}>
                          {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                        </Badge>
                        {campaign.paymentStatus === "pending" && (
                          <div className="flex items-center space-x-1">
                            <CreditCard className="text-warning" size={12} />
                            <span className="text-xs text-warning">Payment Required</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Daily Budget</p>
                        <p className="font-semibold">${campaign.dailyBudget}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Spent</p>
                        <p className="font-semibold">${campaign.spent}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Duration</p>
                        <p className="font-semibold">{campaign.duration} days</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Total Budget</p>
                        <p className="font-semibold text-fb-blue">
                          ${(parseFloat(campaign.dailyBudget) * campaign.duration).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-500">
                        Created {new Date(campaign.createdAt!).toLocaleDateString()}
                      </p>
                      <div className="flex items-center space-x-1">
                        {campaign.paymentStatus === "paid" && (
                          <Badge variant="secondary" className="text-xs bg-success bg-opacity-10 text-success">
                            Funded
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {showWizard && (
        <CampaignWizard onClose={() => setShowWizard(false)} />
      )}
    </>
  );
}

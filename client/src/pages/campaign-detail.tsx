import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Target, DollarSign, TrendingUp, Users } from "lucide-react";
import type { Campaign } from "@shared/schema";
import CampaignPayment from "@/components/payment/campaign-payment";

export default function CampaignDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();

  const { data: campaign, isLoading } = useQuery<Campaign>({
    queryKey: ['/api/campaigns', id],
    queryFn: async () => {
      const response = await fetch(`/api/campaigns/${id}`);
      if (!response.ok) {
        throw new Error('Campaign not found');
      }
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-64 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-96 bg-gray-100 rounded-lg animate-pulse" />
          <div className="h-96 bg-gray-100 rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-800">Campaign not found</h2>
        <p className="text-gray-600 mt-2">The campaign you're looking for doesn't exist.</p>
        <Button onClick={() => setLocation('/campaigns')} className="mt-4">
          Back to Campaigns
        </Button>
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

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-success bg-opacity-10 text-success';
      case 'pending':
        return 'bg-warning bg-opacity-10 text-warning';
      case 'failed':
        return 'bg-destructive bg-opacity-10 text-destructive';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const totalBudget = parseFloat(campaign.dailyBudget) * campaign.duration;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button 
          variant="ghost" 
          onClick={() => setLocation('/campaigns')}
          className="text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="mr-2" size={16} />
          Back to Campaigns
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-dark">{campaign.name}</h1>
          <div className="flex items-center space-x-3 mt-2">
            <Badge className={getStatusColor(campaign.status)}>
              {campaign.status}
            </Badge>
            <Badge className={getPaymentStatusColor(campaign.paymentStatus)}>
              Payment: {campaign.paymentStatus}
            </Badge>
            <span className="text-sm text-gray-500">
              {campaign.platforms.join(', ')}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Campaign Overview */}
        <Card className="border border-gray-200">
          <CardHeader className="border-b border-gray-100">
            <CardTitle>Campaign Overview</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Target size={16} />
                  <span>Objective</span>
                </div>
                <p className="font-medium capitalize">{campaign.objective.replace('_', ' ')}</p>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <DollarSign size={16} />
                  <span>Daily Budget</span>
                </div>
                <p className="font-medium">${campaign.dailyBudget}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar size={16} />
                  <span>Duration</span>
                </div>
                <p className="font-medium">{campaign.duration} days</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <TrendingUp size={16} />
                  <span>Total Budget</span>
                </div>
                <p className="font-medium text-fb-blue">${totalBudget.toFixed(2)}</p>
              </div>
            </div>

            {campaign.targetAudience && typeof campaign.targetAudience === 'object' && (
              <div className="border-t border-gray-100 pt-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
                  <Users size={16} />
                  <span>Target Audience</span>
                </div>
                <div className="space-y-2 text-sm">
                  {'ageRange' in campaign.targetAudience && campaign.targetAudience.ageRange && (
                    <div>
                      <span className="text-gray-600">Age Range:</span>
                      <span className="ml-2 font-medium">
                        {campaign.targetAudience.ageRange.min}-{campaign.targetAudience.ageRange.max} years
                      </span>
                    </div>
                  )}
                  {'location' in campaign.targetAudience && (
                    <div>
                      <span className="text-gray-600">Location:</span>
                      <span className="ml-2 font-medium">{campaign.targetAudience.location as string}</span>
                    </div>
                  )}
                  {'interests' in campaign.targetAudience && Array.isArray(campaign.targetAudience.interests) && campaign.targetAudience.interests.length > 0 && (
                    <div>
                      <span className="text-gray-600">Interests:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {campaign.targetAudience.interests.map((interest: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {campaign.adCreative && typeof campaign.adCreative === 'object' && (
              <div className="border-t border-gray-100 pt-4">
                <h4 className="font-medium text-gray-900 mb-3">Ad Creative</h4>
                <div className="space-y-2 text-sm">
                  {'headline' in campaign.adCreative && (
                    <div>
                      <span className="text-gray-600">Headline:</span>
                      <p className="font-medium mt-1">{campaign.adCreative.headline as string}</p>
                    </div>
                  )}
                  {'description' in campaign.adCreative && (
                    <div>
                      <span className="text-gray-600">Description:</span>
                      <p className="text-gray-800 mt-1">{campaign.adCreative.description as string}</p>
                    </div>
                  )}
                  {'callToAction' in campaign.adCreative && (
                    <div>
                      <span className="text-gray-600">Call to Action:</span>
                      <span className="ml-2 font-medium">{campaign.adCreative.callToAction as string}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Section */}
        <div className="space-y-6">
          <CampaignPayment 
            campaign={campaign}
            onPaymentSuccess={() => {
              // Refresh campaign data after successful payment
              window.location.reload();
            }}
          />

          {campaign.paymentStatus === 'paid' && (
            <Card className="border border-gray-200">
              <CardHeader className="border-b border-gray-100">
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-fb-blue">
                      ${parseFloat(campaign.spent || "0").toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">Spent</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-success">
                      ${(totalBudget - parseFloat(campaign.spent || "0")).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">Remaining</p>
                  </div>
                </div>
                <div className="mt-4 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-fb-blue h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.min((parseFloat(campaign.spent || "0") / totalBudget) * 100, 100)}%` 
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Budget utilization: {((parseFloat(campaign.spent || "0") / totalBudget) * 100).toFixed(1)}%
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
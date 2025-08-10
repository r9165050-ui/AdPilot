import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Calendar, Target, DollarSign, TrendingUp, Users, Zap, Facebook } from "lucide-react";
import type { Campaign } from "@shared/schema";
import CampaignPayment from "@/components/payment/campaign-payment";
import { OptimizationPanel } from "@/components/campaigns/OptimizationPanel";
import { FacebookIntegration } from "@/components/campaigns/FacebookIntegration";

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
                  {campaign.targetAudience && 'ageRange' in campaign.targetAudience && campaign.targetAudience.ageRange && typeof campaign.targetAudience.ageRange === 'object' && 'min' in campaign.targetAudience.ageRange && 'max' in campaign.targetAudience.ageRange && (
                    <div>
                      <span className="text-gray-600">Age Range:</span>
                      <span className="ml-2 font-medium">
                        {(campaign.targetAudience.ageRange as any).min}-{(campaign.targetAudience.ageRange as any).max} years
                      </span>
                    </div>
                  )}
                  {campaign.targetAudience && 'location' in campaign.targetAudience && (
                    <div>
                      <span className="text-gray-600">Location:</span>
                      <span className="ml-2 font-medium">{String(campaign.targetAudience.location)}</span>
                    </div>
                  )}
                  {campaign.targetAudience && 'interests' in campaign.targetAudience && Array.isArray(campaign.targetAudience.interests) && campaign.targetAudience.interests.length > 0 && (
                    <div>
                      <span className="text-gray-600">Interests:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(campaign.targetAudience.interests as string[]).map((interest: string, index: number) => (
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
                  {campaign.adCreative && 'headline' in campaign.adCreative && (
                    <div>
                      <span className="text-gray-600">Headline:</span>
                      <p className="font-medium mt-1">{String(campaign.adCreative.headline)}</p>
                    </div>
                  )}
                  {campaign.adCreative && 'description' in campaign.adCreative && (
                    <div>
                      <span className="text-gray-600">Description:</span>
                      <p className="text-gray-800 mt-1">{String(campaign.adCreative.description)}</p>
                    </div>
                  )}
                  {campaign.adCreative && 'callToAction' in campaign.adCreative && (
                    <div>
                      <span className="text-gray-600">Call to Action:</span>
                      <span className="ml-2 font-medium">{String(campaign.adCreative.callToAction)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Optimization & Integration Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Campaign Management</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="payment" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="payment" data-testid="tab-payment">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Payment
                </TabsTrigger>
                <TabsTrigger value="optimization" data-testid="tab-optimization">
                  <Zap className="h-4 w-4 mr-2" />
                  Optimization
                </TabsTrigger>
                <TabsTrigger value="facebook" data-testid="tab-facebook">
                  <Facebook className="h-4 w-4 mr-2" />
                  Facebook
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="payment" className="space-y-6">
                <CampaignPayment 
                  campaign={campaign}
                  onPaymentSuccess={() => {
                    // Refresh campaign data after successful payment
                    window.location.reload();
                  }}
                />
              </TabsContent>
              
              <TabsContent value="optimization" className="space-y-6">
                <OptimizationPanel 
                  campaignId={campaign.id}
                  onOptimizationApplied={() => {
                    // Could add toast notification here
                  }}
                />
              </TabsContent>
              
              <TabsContent value="facebook" className="space-y-6">
                <FacebookIntegration 
                  campaignId={campaign.id}
                  campaignName={campaign.name}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
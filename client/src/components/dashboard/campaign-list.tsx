import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Facebook, Instagram, Edit, Pause, Play, MoreHorizontal } from "lucide-react";
import type { Campaign } from "@shared/schema";

export default function CampaignList() {
  const { data: campaigns, isLoading } = useQuery<Campaign[]>({
    queryKey: ["/api/campaigns"],
  });

  if (isLoading) {
    return (
      <Card className="border border-gray-100 shadow-sm">
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-48 animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
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
    <Card className="border border-gray-100 shadow-sm">
      <CardHeader className="border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-text-dark">Recent Campaigns</h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-500">Filter:</label>
              <select className="border border-gray-200 rounded-lg px-3 py-1 text-sm">
                <option>All Campaigns</option>
                <option>Active</option>
                <option>Paused</option>
                <option>Draft</option>
              </select>
            </div>
            <Button variant="ghost" className="text-fb-blue hover:bg-fb-blue hover:bg-opacity-10">
              View All
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wide">
                Campaign
              </th>
              <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wide">
                Platform
              </th>
              <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wide">
                Status
              </th>
              <th className="text-right py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wide">
                Budget
              </th>
              <th className="text-right py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wide">
                Spent
              </th>
              <th className="text-right py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wide">
                Duration
              </th>
              <th className="text-right py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wide">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {campaigns?.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center">
                  <div className="text-gray-500">
                    <p className="text-lg font-medium">No campaigns yet</p>
                    <p className="text-sm">Create your first campaign to get started</p>
                  </div>
                </td>
              </tr>
            ) : (
              campaigns?.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg" />
                      <div>
                        <p className="font-medium text-text-dark">{campaign.name}</p>
                        <p className="text-sm text-gray-500">
                          Created {new Date(campaign.createdAt!).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      {getPlatformIcons(campaign.platforms)}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <Badge className={`${getStatusColor(campaign.status)} border-0`}>
                      <div className="w-1.5 h-1.5 bg-current rounded-full mr-2" />
                      {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                    </Badge>
                  </td>
                  <td className="py-4 px-6 text-right font-medium text-text-dark">
                    ${campaign.dailyBudget}
                  </td>
                  <td className="py-4 px-6 text-right text-gray-600">
                    ${campaign.spent}
                  </td>
                  <td className="py-4 px-6 text-right text-gray-600">
                    {campaign.duration} days
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button variant="ghost" size="sm" className="text-gray-400 hover:text-fb-blue">
                        <Edit size={14} />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-gray-400 hover:text-warning">
                        {campaign.status === 'active' ? <Pause size={14} /> : <Play size={14} />}
                      </Button>
                      <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600">
                        <MoreHorizontal size={14} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

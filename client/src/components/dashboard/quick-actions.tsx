import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Facebook, Instagram, Wand2 } from "lucide-react";
import { useState } from "react";
import CampaignWizard from "@/components/campaigns/campaign-wizard";
import { useQuery } from "@tanstack/react-query";
import type { DashboardStats } from "@/lib/types";

export default function QuickActions() {
  const [showWizard, setShowWizard] = useState(false);
  
  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="border border-gray-100 shadow-sm">
            <CardHeader className="border-b border-gray-100">
              <h3 className="text-lg font-semibold text-text-dark">Quick Campaign Creation</h3>
              <p className="text-gray-500 text-sm">Get your ads running in minutes with our automation</p>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button 
                  onClick={() => setShowWizard(true)}
                  className="p-4 border border-gray-200 rounded-lg hover:border-fb-blue hover:bg-fb-blue hover:bg-opacity-5 transition-all group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-fb-blue bg-opacity-10 rounded-lg flex items-center justify-center group-hover:bg-fb-blue group-hover:bg-opacity-20">
                      <Facebook className="text-fb-blue" size={20} />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-text-dark">Facebook Campaign</p>
                      <p className="text-sm text-gray-500">Launch Facebook ads quickly</p>
                    </div>
                  </div>
                </button>
                
                <button 
                  onClick={() => setShowWizard(true)}
                  className="p-4 border border-gray-200 rounded-lg hover:border-ig-pink hover:bg-ig-pink hover:bg-opacity-5 transition-all group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-ig-pink bg-opacity-10 rounded-lg flex items-center justify-center group-hover:bg-ig-pink group-hover:bg-opacity-20">
                      <Instagram className="text-ig-pink" size={20} />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-text-dark">Instagram Campaign</p>
                      <p className="text-sm text-gray-500">Create Instagram ads</p>
                    </div>
                  </div>
                </button>
              </div>
              
              <div className="pt-4 border-t border-gray-100">
                <Button 
                  onClick={() => setShowWizard(true)}
                  className="w-full bg-fb-blue text-white hover:bg-blue-600"
                >
                  <Wand2 className="mr-2" size={16} />
                  Start Smart Campaign Wizard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border border-gray-100 shadow-sm">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-text-dark mb-4">Today's Budget</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Spent</span>
                  <span className="font-semibold text-text-dark">
                    ${stats?.totalSpent.toFixed(0) || '0'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Remaining</span>
                  <span className="font-semibold text-success">
                    ${stats?.budgetRemaining.toFixed(0) || '0'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-fb-blue h-2 rounded-full" 
                    style={{ 
                      width: stats ? `${(stats.totalSpent / (stats.totalSpent + stats.budgetRemaining)) * 100}%` : '0%' 
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-100 shadow-sm">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-text-dark mb-4">Active Campaigns</h3>
              <div className="space-y-3">
                <div className="text-3xl font-bold text-success">
                  {stats?.activeCampaigns || 0}
                </div>
                <p className="text-gray-500 text-sm">Running campaigns</p>
                <div className="flex items-center text-sm text-success">
                  <span>3 new this week</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {showWizard && (
        <CampaignWizard onClose={() => setShowWizard(false)} />
      )}
    </>
  );
}

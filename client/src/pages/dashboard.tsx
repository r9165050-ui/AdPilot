import { Button } from "@/components/ui/button";
import StatsCards from "@/components/dashboard/stats-cards";
import QuickActions from "@/components/dashboard/quick-actions";
import CampaignList from "@/components/dashboard/campaign-list";
import { Download, Plus } from "lucide-react";
import { useState } from "react";
import CampaignWizard from "@/components/campaigns/campaign-wizard";

export default function Dashboard() {
  const [showWizard, setShowWizard] = useState(false);

  return (
    <>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-text-dark">Campaign Dashboard</h2>
            <p className="text-gray-500 mt-1">Monitor and optimize your Meta advertising campaigns</p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <Button variant="outline">
              <Download className="mr-2" size={16} />
              Export
            </Button>
            <Button 
              onClick={() => setShowWizard(true)}
              className="bg-fb-blue text-white hover:bg-blue-600"
            >
              <Plus className="mr-2" size={16} />
              New Campaign
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <StatsCards />

        {/* Quick Actions */}
        <QuickActions />

        {/* Campaign List */}
        <CampaignList />
      </div>

      {showWizard && (
        <CampaignWizard onClose={() => setShowWizard(false)} />
      )}
    </>
  );
}

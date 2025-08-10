import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link, useLocation } from "wouter";
import { Zap, Plus } from "lucide-react";
import { useState } from "react";
import CampaignWizard from "@/components/campaigns/campaign-wizard";

export default function Header() {
  const [location] = useLocation();
  const [showWizard, setShowWizard] = useState(false);

  const navItems = [
    { path: "/", label: "Dashboard" },
    { path: "/campaigns", label: "Campaigns" },
    { path: "/templates", label: "Templates" },
    { path: "/analytics", label: "Analytics" },
  ];

  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link href="/">
                <div className="flex items-center space-x-3 cursor-pointer">
                  <div className="w-8 h-8 bg-fb-blue rounded-lg flex items-center justify-center">
                    <Zap className="text-white" size={16} />
                  </div>
                  <h1 className="text-xl font-semibold text-text-dark">AdFlow Pro</h1>
                </div>
              </Link>
              <nav className="hidden md:flex space-x-6">
                {navItems.map((item) => (
                  <Link key={item.path} href={item.path}>
                    <a className={`pb-4 px-1 text-sm font-medium border-b-2 transition-colors ${
                      location === item.path
                        ? "text-fb-blue border-fb-blue"
                        : "text-gray-500 border-transparent hover:text-text-dark"
                    }`}>
                      {item.label}
                    </a>
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => setShowWizard(true)}
                className="bg-fb-blue text-white hover:bg-blue-600"
              >
                <Plus className="mr-2" size={16} />
                Create Campaign
              </Button>
              <Avatar>
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      {showWizard && (
        <CampaignWizard onClose={() => setShowWizard(false)} />
      )}
    </>
  );
}

import { Card, CardContent } from "@/components/ui/card";
import { Eye, MousePointer, Percent, DollarSign } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { DashboardStats } from "@/lib/types";

export default function StatsCards() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="pt-6">
              <div className="h-12 w-12 bg-gray-200 rounded-xl mb-4" />
              <div className="h-8 bg-gray-200 rounded mb-1" />
              <div className="h-4 bg-gray-200 rounded w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      title: "Impressions",
      value: `${(stats.totalImpressions / 1000000).toFixed(1)}M`,
      change: "+12%",
      icon: Eye,
      color: "bg-fb-blue",
    },
    {
      title: "Clicks",
      value: `${(stats.totalClicks / 1000).toFixed(1)}K`,
      change: "+8%",
      icon: MousePointer,
      color: "bg-ig-pink",
    },
    {
      title: "CTR",
      value: `${stats.avgCtr.toFixed(2)}%`,
      change: "+2.1%",
      icon: Percent,
      color: "bg-success",
    },
    {
      title: "Cost per Click",
      value: `$${stats.avgCpc.toFixed(2)}`,
      change: "-15%",
      icon: DollarSign,
      color: "bg-warning",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="border border-gray-100 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.color} bg-opacity-10 rounded-xl flex items-center justify-center`}>
                  <Icon className={`${stat.color === 'bg-fb-blue' ? 'text-fb-blue' : 
                    stat.color === 'bg-ig-pink' ? 'text-ig-pink' : 
                    stat.color === 'bg-success' ? 'text-success' : 'text-warning'}`} size={20} />
                </div>
                <span className="text-success text-sm font-medium">{stat.change}</span>
              </div>
              <h3 className="text-2xl font-bold text-text-dark mb-1">{stat.value}</h3>
              <p className="text-gray-500 text-sm">{stat.title}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

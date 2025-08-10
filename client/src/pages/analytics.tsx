import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { Download, TrendingUp, TrendingDown, Eye, MousePointer } from "lucide-react";
import type { DashboardStats } from "@/lib/types";

export default function Analytics() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  // Mock data for charts
  const performanceData = [
    { name: 'Mon', impressions: 45000, clicks: 1200, conversions: 45 },
    { name: 'Tue', impressions: 52000, clicks: 1400, conversions: 52 },
    { name: 'Wed', impressions: 48000, clicks: 1100, conversions: 38 },
    { name: 'Thu', impressions: 61000, clicks: 1600, conversions: 68 },
    { name: 'Fri', impressions: 55000, clicks: 1300, conversions: 55 },
    { name: 'Sat', impressions: 67000, clicks: 1800, conversions: 72 },
    { name: 'Sun', impressions: 43000, clicks: 900, conversions: 35 },
  ];

  const platformData = [
    { name: 'Facebook', value: 65, color: '#1877F2' },
    { name: 'Instagram', value: 35, color: '#E4405F' },
  ];

  const audienceData = [
    { age: '18-24', percentage: 25 },
    { age: '25-34', percentage: 35 },
    { age: '35-44', percentage: 20 },
    { age: '45-54', percentage: 15 },
    { age: '55+', percentage: 5 },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-64 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-text-dark">Analytics Dashboard</h2>
          <p className="text-gray-500 mt-1">Detailed insights into your campaign performance</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Button variant="outline">
            <Download className="mr-2" size={16} />
            Export Report
          </Button>
          <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Reach</p>
                <p className="text-2xl font-bold">{stats ? `${(stats.totalImpressions / 1000000).toFixed(1)}M` : '0'}</p>
              </div>
              <div className="w-12 h-12 bg-fb-blue bg-opacity-10 rounded-xl flex items-center justify-center">
                <Eye className="text-fb-blue" size={20} />
              </div>
            </div>
            <div className="flex items-center mt-2 text-sm">
              <TrendingUp className="text-success mr-1" size={14} />
              <span className="text-success">+12%</span>
              <span className="text-gray-500 ml-1">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Engagement Rate</p>
                <p className="text-2xl font-bold">3.2%</p>
              </div>
              <div className="w-12 h-12 bg-ig-pink bg-opacity-10 rounded-xl flex items-center justify-center">
                <MousePointer className="text-ig-pink" size={20} />
              </div>
            </div>
            <div className="flex items-center mt-2 text-sm">
              <TrendingUp className="text-success mr-1" size={14} />
              <span className="text-success">+5%</span>
              <span className="text-gray-500 ml-1">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold">4.1%</p>
              </div>
              <div className="w-12 h-12 bg-success bg-opacity-10 rounded-xl flex items-center justify-center">
                <TrendingUp className="text-success" size={20} />
              </div>
            </div>
            <div className="flex items-center mt-2 text-sm">
              <TrendingDown className="text-red-500 mr-1" size={14} />
              <span className="text-red-500">-2%</span>
              <span className="text-gray-500 ml-1">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">ROAS</p>
                <p className="text-2xl font-bold">3.8x</p>
              </div>
              <div className="w-12 h-12 bg-warning bg-opacity-10 rounded-xl flex items-center justify-center">
                <TrendingUp className="text-warning" size={20} />
              </div>
            </div>
            <div className="flex items-center mt-2 text-sm">
              <TrendingUp className="text-success mr-1" size={14} />
              <span className="text-success">+8%</span>
              <span className="text-gray-500 ml-1">vs last period</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="impressions" stroke="#1877F2" strokeWidth={2} />
                <Line type="monotone" dataKey="clicks" stroke="#E4405F" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Platform Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={platformData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {platformData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Audience Demographics</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={audienceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="age" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="percentage" fill="#1877F2" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Performing Campaigns</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-text-dark">Summer Sale 2024</p>
                  <p className="text-sm text-gray-600">CTR: 3.2% • Conv: 4.8%</p>
                </div>
                <Badge className="bg-success bg-opacity-10 text-success border-0">
                  Active
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-text-dark">Holiday Collection</p>
                  <p className="text-sm text-gray-600">CTR: 2.9% • Conv: 4.1%</p>
                </div>
                <Badge className="bg-success bg-opacity-10 text-success border-0">
                  Active
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-text-dark">Brand Awareness Q2</p>
                  <p className="text-sm text-gray-600">CTR: 2.1% • Conv: 3.2%</p>
                </div>
                <Badge className="bg-warning bg-opacity-10 text-warning border-0">
                  Paused
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  Users, 
  Zap,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

interface OptimizationInsights {
  totalCampaigns: number;
  needsOptimization: number;
  potentialSavings: number;
  topRecommendations: Array<{
    type: 'budget' | 'targeting' | 'creative' | 'bidding';
    priority: 'high' | 'medium' | 'low';
    action: string;
    impact: string;
    confidence: number;
  }>;
}

export default function OptimizationDashboard() {
  const { data: insights, isLoading, error } = useQuery<OptimizationInsights>({
    queryKey: ['/api/optimization/insights']
  });

  if (isLoading) {
    return (
      <div className="space-y-6" data-testid="optimization-dashboard-loading">
        <div className="space-y-2">
          <div className="h-8 bg-muted animate-pulse rounded w-96" />
          <div className="h-4 bg-muted animate-pulse rounded w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
        <div className="h-96 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  if (error || !insights) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Campaign Optimization</h1>
          <p className="text-muted-foreground">AI-powered insights to improve your campaign performance</p>
        </div>
        <Alert variant="destructive" data-testid="optimization-error">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Unable to load optimization insights. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const optimizationRate = insights.totalCampaigns > 0 
    ? ((insights.totalCampaigns - insights.needsOptimization) / insights.totalCampaigns) * 100 
    : 0;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'budget': return <DollarSign className="h-4 w-4" />;
      case 'targeting': return <Users className="h-4 w-4" />;
      case 'creative': return <Target className="h-4 w-4" />;
      case 'bidding': return <TrendingUp className="h-4 w-4" />;
      default: return <Zap className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6" data-testid="optimization-dashboard">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Campaign Optimization</h1>
        <p className="text-muted-foreground">
          AI-powered insights to improve your campaign performance and maximize ROI
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Optimization Score</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="optimization-score">
              {optimizationRate.toFixed(0)}%
            </div>
            <Progress value={optimizationRate} className="mt-3" />
            <p className="text-xs text-muted-foreground mt-2">
              {insights.totalCampaigns - insights.needsOptimization} of {insights.totalCampaigns} campaigns optimized
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Potential Savings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600" data-testid="potential-savings">
              ${insights.potentialSavings.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {insights.potentialSavings > 0 
                ? "Per month with optimizations" 
                : "No immediate savings identified"
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Campaigns Needing Optimization</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="campaigns-needing-optimization">
              {insights.needsOptimization}
            </div>
            <p className="text-xs text-muted-foreground">
              Out of {insights.totalCampaigns} total campaigns
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Top Optimization Recommendations</CardTitle>
          <CardDescription>
            High-priority actions to improve your campaign performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          {insights.topRecommendations.length === 0 ? (
            <div className="text-center py-12" data-testid="no-recommendations">
              <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">All Campaigns Optimized</h3>
              <p className="text-muted-foreground">
                Your campaigns are performing well. No immediate optimizations needed.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {insights.topRecommendations.map((rec, index) => (
                <div 
                  key={index} 
                  className="border rounded-lg p-6 space-y-4" 
                  data-testid={`top-recommendation-${index}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getTypeIcon(rec.type)}
                      <div>
                        <Badge variant={getPriorityColor(rec.priority)} className="capitalize">
                          {rec.priority} Priority
                        </Badge>
                        <span className="ml-2 text-sm text-muted-foreground capitalize">
                          {rec.type} Optimization
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {Math.round(rec.confidence * 100)}% Confidence
                      </div>
                      <Progress value={rec.confidence * 100} className="w-24 h-2 mt-1" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold">{rec.action}</h4>
                    <p className="text-muted-foreground">{rec.impact}</p>
                  </div>
                  
                  <div className="pt-2">
                    <Button size="sm" variant="outline">
                      Apply Optimization
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Optimization Impact</CardTitle>
            <CardDescription>Expected improvements with current recommendations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Click-through Rate</span>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">+25-40%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Cost per Click</span>
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">-15-30%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Conversion Rate</span>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">+40-60%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Return on Ad Spend</span>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">+20-50%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Optimization Categories</CardTitle>
            <CardDescription>Distribution of optimization opportunities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {['creative', 'targeting', 'bidding', 'budget'].map((category) => {
                const count = insights.topRecommendations.filter(r => r.type === category).length;
                const percentage = insights.topRecommendations.length > 0 
                  ? (count / insights.topRecommendations.length) * 100 
                  : 0;
                
                return (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(category)}
                        <span className="capitalize">{category}</span>
                      </div>
                      <span>{count} recommendations</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
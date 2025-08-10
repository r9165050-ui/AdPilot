import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Zap, Target, DollarSign, Users } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface OptimizationRecommendation {
  type: 'budget' | 'targeting' | 'creative' | 'bidding';
  priority: 'high' | 'medium' | 'low';
  action: string;
  impact: string;
  confidence: number;
}

interface CampaignPerformance {
  campaignId: string;
  ctr: number;
  cpc: number;
  conversionRate: number;
  roas: number;
  qualityScore: number;
  recommendations: OptimizationRecommendation[];
}

interface OptimizationPanelProps {
  campaignId: string;
  onOptimizationApplied?: () => void;
}

export function OptimizationPanel({ campaignId, onOptimizationApplied }: OptimizationPanelProps) {
  const queryClient = useQueryClient();
  const [isOptimizing, setIsOptimizing] = useState(false);

  const { data: performance, isLoading } = useQuery({
    queryKey: ['/api/campaigns', campaignId, 'optimization'],
    enabled: !!campaignId
  });

  const optimizeMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/campaigns/${campaignId}/optimize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to optimize');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/campaigns', campaignId, 'optimization'] });
      onOptimizationApplied?.();
    }
  });

  const handleAutoOptimize = async () => {
    setIsOptimizing(true);
    try {
      await optimizeMutation.mutateAsync();
    } finally {
      setIsOptimizing(false);
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'budget': return <DollarSign className="h-4 w-4" />;
      case 'targeting': return <Users className="h-4 w-4" />;
      case 'creative': return <Target className="h-4 w-4" />;
      case 'bidding': return <TrendingUp className="h-4 w-4" />;
      default: return <Zap className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <Card data-testid="optimization-loading">
        <CardHeader>
          <CardTitle>Campaign Optimization</CardTitle>
          <CardDescription>Analyzing performance...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 bg-muted animate-pulse rounded" />
            <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
            <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const performanceData = performance as CampaignPerformance;

  if (!performanceData) {
    return (
      <Alert data-testid="optimization-error">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Unable to load optimization data. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6" data-testid="optimization-panel">
      {/* Performance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Campaign Performance
            <Badge variant={performanceData.qualityScore >= 7 ? 'default' : 'destructive'}>
              Quality Score: {performanceData.qualityScore}/10
            </Badge>
          </CardTitle>
          <CardDescription>Real-time analysis of your campaign metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold" data-testid="metric-ctr">
                {(performanceData.ctr * 100).toFixed(2)}%
              </div>
              <div className="text-sm text-muted-foreground">Click-through Rate</div>
              {performanceData.ctr >= 0.02 ? (
                <TrendingUp className="h-4 w-4 mx-auto mt-1 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 mx-auto mt-1 text-red-500" />
              )}
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold" data-testid="metric-cpc">
                ${performanceData.cpc.toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">Cost per Click</div>
              {performanceData.cpc <= 2.0 ? (
                <TrendingUp className="h-4 w-4 mx-auto mt-1 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 mx-auto mt-1 text-red-500" />
              )}
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold" data-testid="metric-conversion">
                {(performanceData.conversionRate * 100).toFixed(2)}%
              </div>
              <div className="text-sm text-muted-foreground">Conversion Rate</div>
              {performanceData.conversionRate >= 0.05 ? (
                <TrendingUp className="h-4 w-4 mx-auto mt-1 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 mx-auto mt-1 text-red-500" />
              )}
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold" data-testid="metric-roas">
                {performanceData.roas.toFixed(1)}:1
              </div>
              <div className="text-sm text-muted-foreground">Return on Ad Spend</div>
              {performanceData.roas >= 3.0 ? (
                <TrendingUp className="h-4 w-4 mx-auto mt-1 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 mx-auto mt-1 text-red-500" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Optimization Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Optimization Recommendations
            {performanceData.recommendations.length > 0 && (
              <Button 
                onClick={handleAutoOptimize}
                disabled={isOptimizing || optimizeMutation.isPending}
                size="sm"
                data-testid="button-auto-optimize"
              >
                <Zap className="h-4 w-4 mr-2" />
                {isOptimizing ? 'Optimizing...' : 'Auto Optimize'}
              </Button>
            )}
          </CardTitle>
          <CardDescription>
            AI-powered suggestions to improve your campaign performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          {performanceData.recommendations.length === 0 ? (
            <div className="text-center py-8" data-testid="no-recommendations">
              <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Campaign is Well Optimized</h3>
              <p className="text-muted-foreground">
                Your campaign is performing well. No immediate optimizations needed.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {performanceData.recommendations.map((rec, index) => (
                <div key={index} className="border rounded-lg p-4" data-testid={`recommendation-${index}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(rec.type)}
                      <Badge variant={getPriorityColor(rec.priority)} className="capitalize">
                        {rec.priority} Priority
                      </Badge>
                      <span className="text-sm text-muted-foreground capitalize">
                        {rec.type} Optimization
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {Math.round(rec.confidence * 100)}% Confidence
                      </div>
                      <Progress value={rec.confidence * 100} className="w-20 h-2 mt-1" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="font-medium">{rec.action}</p>
                    <p className="text-sm text-muted-foreground">{rec.impact}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {optimizeMutation.isError && (
        <Alert variant="destructive" data-testid="optimization-error-alert">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to apply optimizations. Please try again.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
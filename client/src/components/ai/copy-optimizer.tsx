import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, RefreshCw, TrendingUp, Copy } from "lucide-react";

interface CopyOptimizerProps {
  initialCopy?: string;
  platform?: string;
  objective?: string;
  performanceData?: {
    ctr: number;
    conversions: number;
  };
}

export default function CopyOptimizer({ 
  initialCopy = "", 
  platform = "facebook", 
  objective = "conversions",
  performanceData 
}: CopyOptimizerProps) {
  const [originalCopy, setOriginalCopy] = useState(initialCopy);
  const [selectedPlatform, setSelectedPlatform] = useState(platform);
  const [selectedObjective, setSelectedObjective] = useState(objective);
  const [optimizedResult, setOptimizedResult] = useState<{
    optimizedCopy: string;
    suggestions: string[];
  } | null>(null);
  const { toast } = useToast();

  const optimizeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/ai/optimize-copy", {
        originalCopy,
        platform: selectedPlatform,
        objective: selectedObjective,
        performanceData,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setOptimizedResult(data);
      toast({
        title: "Copy Optimized",
        description: "Your ad copy has been optimized successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Optimization Failed",
        description: error.message?.includes("API key") 
          ? "OpenAI API key is not configured. Please add your API key to use AI features."
          : "Failed to optimize ad copy. Please try again.",
        variant: "destructive",
      });
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "The text has been copied to your clipboard.",
    });
  };

  const handleOptimize = () => {
    if (!originalCopy.trim()) {
      toast({
        title: "Missing Copy",
        description: "Please enter the ad copy you want to optimize.",
        variant: "destructive",
      });
      return;
    }
    optimizeMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <Card className="border border-gray-200">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="text-fb-blue" size={20} />
            <span>AI Copy Optimizer</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div>
            <Label htmlFor="originalCopy">Original Ad Copy</Label>
            <Textarea
              id="originalCopy"
              placeholder="Enter your current ad copy here..."
              value={originalCopy}
              onChange={(e) => setOriginalCopy(e.target.value)}
              className="h-32 mt-2"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="platform">Platform</Label>
              <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="both">Both Platforms</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="objective">Campaign Objective</Label>
              <Select value={selectedObjective} onValueChange={setSelectedObjective}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="brand_awareness">Brand Awareness</SelectItem>
                  <SelectItem value="traffic">Traffic</SelectItem>
                  <SelectItem value="conversions">Conversions</SelectItem>
                  <SelectItem value="lead_generation">Lead Generation</SelectItem>
                  <SelectItem value="engagement">Engagement</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {performanceData && (
            <Card className="bg-gray-50 border-0">
              <CardContent className="p-4">
                <h4 className="font-medium text-text-dark mb-3">Current Performance</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="text-fb-blue" size={16} />
                    <span className="text-gray-600">CTR:</span>
                    <span className="font-medium">{performanceData.ctr}%</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="text-success" size={16} />
                    <span className="text-gray-600">Conversions:</span>
                    <span className="font-medium">{performanceData.conversions}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Button
            onClick={handleOptimize}
            disabled={optimizeMutation.isPending || !originalCopy.trim()}
            className="w-full bg-fb-blue text-white hover:bg-blue-600"
          >
            {optimizeMutation.isPending ? (
              <>
                <RefreshCw className="mr-2 animate-spin" size={16} />
                Optimizing Copy...
              </>
            ) : (
              <>
                <Sparkles className="mr-2" size={16} />
                Optimize Ad Copy
              </>
            )}
          </Button>

          {optimizedResult && (
            <div className="space-y-6 pt-6 border-t border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-text-dark mb-4">Optimized Results</h3>
                
                <Card className="border border-success">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-success">Optimized Copy</CardTitle>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => copyToClipboard(optimizedResult.optimizedCopy)}
                      >
                        <Copy size={14} />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-text-dark leading-relaxed">
                      {optimizedResult.optimizedCopy}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div>
                <h4 className="font-medium text-text-dark mb-3">Improvement Suggestions</h4>
                <div className="space-y-3">
                  {optimizedResult.suggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Badge variant="secondary" className="mt-0.5">
                        {index + 1}
                      </Badge>
                      <p className="text-sm text-gray-700 flex-1">{suggestion}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h5 className="font-medium text-fb-blue mb-2">💡 Next Steps</h5>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• A/B test the original vs optimized copy</li>
                  <li>• Monitor performance metrics for 3-7 days</li>
                  <li>• Apply winning elements to similar campaigns</li>
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
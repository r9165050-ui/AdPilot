import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AdCopyGenerator from "@/components/ai/ad-copy-generator";
import CopyOptimizer from "@/components/ai/copy-optimizer";
import { Sparkles, Wand2, TrendingUp, Lightbulb } from "lucide-react";

export default function AITools() {
  const [activeTab, setActiveTab] = useState("generator");

  const features = [
    {
      icon: Wand2,
      title: "AI Copy Generation",
      description: "Generate compelling headlines, descriptions, and CTAs based on your campaign objectives and audience.",
      benefits: ["Platform-optimized copy", "Multiple variations", "Audience targeting", "Brand voice matching"]
    },
    {
      icon: TrendingUp,
      title: "Copy Optimization",
      description: "Improve existing ad copy using AI analysis of performance data and best practices.",
      benefits: ["Performance-based improvements", "A/B testing suggestions", "Platform compliance", "CTR optimization"]
    },
    {
      icon: Lightbulb,
      title: "Smart Recommendations",
      description: "Get intelligent suggestions for campaign improvements and optimization strategies.",
      benefits: ["Data-driven insights", "Automated suggestions", "Performance tracking", "ROI optimization"]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-text-dark">AI-Powered Tools</h2>
          <p className="text-gray-500 mt-1">Enhance your campaigns with artificial intelligence</p>
        </div>
      </div>

      {/* Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <Card key={index} className="border border-gray-200 hover:shadow-md transition-shadow">
              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 bg-fb-blue bg-opacity-10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="text-fb-blue" size={24} />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 text-sm text-center">{feature.description}</p>
                <div className="space-y-2">
                  {feature.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-center text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 bg-fb-blue rounded-full mr-2" />
                      {benefit}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* AI Tools Tabs */}
      <Card className="border border-gray-200">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="text-fb-blue" size={20} />
            <span>AI Tools Suite</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-50 m-6 mb-0">
              <TabsTrigger value="generator" className="flex items-center space-x-2">
                <Wand2 size={16} />
                <span>Copy Generator</span>
              </TabsTrigger>
              <TabsTrigger value="optimizer" className="flex items-center space-x-2">
                <TrendingUp size={16} />
                <span>Copy Optimizer</span>
              </TabsTrigger>
            </TabsList>

            <div className="p-6">
              <TabsContent value="generator" className="mt-0">
                <div className="space-y-4">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold text-text-dark mb-2">AI Ad Copy Generator</h3>
                    <p className="text-gray-500">Create high-converting ad copy in seconds</p>
                  </div>
                  <AdCopyGenerator />
                </div>
              </TabsContent>

              <TabsContent value="optimizer" className="mt-0">
                <div className="space-y-4">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold text-text-dark mb-2">AI Copy Optimizer</h3>
                    <p className="text-gray-500">Improve existing ad copy with AI insights</p>
                  </div>
                  <CopyOptimizer />
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* AI Best Practices */}
      <Card className="border border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-fb-blue">
            <Lightbulb size={20} />
            <span>AI Best Practices</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-text-dark mb-3">For Best Results:</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-fb-blue rounded-full mt-2" />
                  <span>Provide detailed audience information</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-fb-blue rounded-full mt-2" />
                  <span>Include specific product/service details</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-fb-blue rounded-full mt-2" />
                  <span>Test multiple AI-generated variations</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-fb-blue rounded-full mt-2" />
                  <span>Customize tone to match your brand</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-text-dark mb-3">Remember:</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-success rounded-full mt-2" />
                  <span>AI suggestions are starting points</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-success rounded-full mt-2" />
                  <span>Always review for brand compliance</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-success rounded-full mt-2" />
                  <span>Monitor performance and iterate</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-success rounded-full mt-2" />
                  <span>Combine AI insights with human creativity</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
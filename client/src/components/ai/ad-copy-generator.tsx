import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Wand2, Copy, RefreshCw, Sparkles, AlertCircle } from "lucide-react";

interface AdCopyGeneratorProps {
  campaignData?: {
    objective: string;
    platforms: string[];
    targetAudience: {
      ageRange: { min: number; max: number };
      location: string;
      interests: string[];
    };
  };
  onCopyGenerated?: (copy: GeneratedCopy) => void;
}

interface GeneratedCopy {
  headlines: string[];
  descriptions: string[];
  callToActions: string[];
  hashtags: string[];
}

export default function AdCopyGenerator({ campaignData, onCopyGenerated }: AdCopyGeneratorProps) {
  const [selectedCopy, setSelectedCopy] = useState<{
    headline?: string;
    description?: string;
    callToAction?: string;
  }>({});
  const [generatedCopy, setGeneratedCopy] = useState<GeneratedCopy | null>(null);
  const [formData, setFormData] = useState({
    industry: "",
    productService: "",
    tone: "professional",
    customPrompt: "",
  });
  const { toast } = useToast();

  const generateCopyMutation = useMutation({
    mutationFn: async () => {
      if (!campaignData) {
        throw new Error("Campaign data is required");
      }

      const response = await apiRequest("POST", "/api/ai/generate-copy", {
        objective: campaignData.objective,
        platform: campaignData.platforms,
        industry: formData.industry,
        productService: formData.productService,
        tone: formData.tone,
        targetAudience: campaignData.targetAudience,
      });
      return response.json();
    },
    onSuccess: (data: GeneratedCopy) => {
      setGeneratedCopy(data);
      onCopyGenerated?.(data);
      toast({
        title: "AI Copy Generated",
        description: "Your ad copy has been generated successfully!",
      });
    },
    onError: (error: any) => {
      console.error("Generation error:", error);
      toast({
        title: "Generation Failed",
        description: error.message?.includes("API key") 
          ? "OpenAI API key is not configured. Please add your API key to use AI features."
          : "Failed to generate ad copy. Please try again.",
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

  const handleGenerate = () => {
    if (!campaignData) {
      toast({
        title: "Missing Campaign Data",
        description: "Please complete the campaign setup first.",
        variant: "destructive",
      });
      return;
    }
    generateCopyMutation.mutate();
  };

  if (!campaignData) {
    return (
      <Card className="border border-gray-200">
        <CardContent className="p-8 text-center">
          <AlertCircle className="mx-auto mb-4 text-gray-400" size={48} />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Campaign Setup Required</h3>
          <p className="text-gray-500">Complete the campaign setup to generate AI-powered ad copy.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border border-gray-200">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="text-fb-blue" size={20} />
            <span>AI Ad Copy Generator</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <Label htmlFor="industry">Industry (Optional)</Label>
              <Input
                id="industry"
                placeholder="e.g., Fashion, Technology, Food"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="productService">Product/Service (Optional)</Label>
              <Input
                id="productService"
                placeholder="e.g., Wireless headphones, Online course"
                value={formData.productService}
                onChange={(e) => setFormData({ ...formData, productService: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <Label htmlFor="tone">Tone</Label>
              <Select value={formData.tone} onValueChange={(value) => setFormData({ ...formData, tone: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="casual">Casual & Friendly</SelectItem>
                  <SelectItem value="urgent">Urgent & Action-Oriented</SelectItem>
                  <SelectItem value="playful">Playful & Fun</SelectItem>
                  <SelectItem value="luxury">Luxury & Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mb-6">
            <Label htmlFor="customPrompt">Additional Instructions (Optional)</Label>
            <Textarea
              id="customPrompt"
              placeholder="Any specific requirements or brand voice guidelines..."
              value={formData.customPrompt}
              onChange={(e) => setFormData({ ...formData, customPrompt: e.target.value })}
              className="h-20"
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={generateCopyMutation.isPending}
            className="w-full bg-fb-blue text-white hover:bg-blue-600"
          >
            {generateCopyMutation.isPending ? (
              <>
                <RefreshCw className="mr-2 animate-spin" size={16} />
                Generating AI Copy...
              </>
            ) : (
              <>
                <Wand2 className="mr-2" size={16} />
                Generate AI Ad Copy
              </>
            )}
          </Button>

          {generatedCopy && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-text-dark mb-4">Generated Ad Copy</h3>
              
              <Tabs defaultValue="headlines" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="headlines">Headlines</TabsTrigger>
                  <TabsTrigger value="descriptions">Descriptions</TabsTrigger>
                  <TabsTrigger value="ctas">Call-to-Actions</TabsTrigger>
                  <TabsTrigger value="hashtags">Hashtags</TabsTrigger>
                </TabsList>

                <TabsContent value="headlines" className="space-y-3">
                  {generatedCopy.headlines.map((headline, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="flex-1 text-sm font-medium">{headline}</span>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedCopy({ ...selectedCopy, headline })}
                          className={selectedCopy.headline === headline ? "bg-fb-blue text-white" : ""}
                        >
                          Select
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => copyToClipboard(headline)}>
                          <Copy size={14} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="descriptions" className="space-y-3">
                  {generatedCopy.descriptions.map((description, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="flex-1 text-sm">{description}</span>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedCopy({ ...selectedCopy, description })}
                          className={selectedCopy.description === description ? "bg-fb-blue text-white" : ""}
                        >
                          Select
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => copyToClipboard(description)}>
                          <Copy size={14} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="ctas" className="space-y-3">
                  {generatedCopy.callToActions.map((cta, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="flex-1 text-sm font-medium">{cta}</span>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedCopy({ ...selectedCopy, callToAction: cta })}
                          className={selectedCopy.callToAction === cta ? "bg-fb-blue text-white" : ""}
                        >
                          Select
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => copyToClipboard(cta)}>
                          <Copy size={14} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="hashtags" className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {generatedCopy.hashtags.map((hashtag, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="cursor-pointer hover:bg-fb-blue hover:text-white transition-colors"
                        onClick={() => copyToClipboard(hashtag)}
                      >
                        {hashtag}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Click any hashtag to copy it</p>
                </TabsContent>
              </Tabs>

              {(selectedCopy.headline || selectedCopy.description || selectedCopy.callToAction) && (
                <Card className="mt-6 border border-fb-blue">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-fb-blue">Selected Ad Copy</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {selectedCopy.headline && (
                      <div>
                        <Label className="text-xs font-medium text-gray-600">Headline</Label>
                        <p className="font-semibold">{selectedCopy.headline}</p>
                      </div>
                    )}
                    {selectedCopy.description && (
                      <div>
                        <Label className="text-xs font-medium text-gray-600">Description</Label>
                        <p>{selectedCopy.description}</p>
                      </div>
                    )}
                    {selectedCopy.callToAction && (
                      <div>
                        <Label className="text-xs font-medium text-gray-600">Call-to-Action</Label>
                        <p className="font-medium">{selectedCopy.callToAction}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
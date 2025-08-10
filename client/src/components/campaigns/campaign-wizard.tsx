import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Facebook, Instagram, ArrowRight } from "lucide-react";
import ProgressIndicator from "@/components/ui/progress-indicator";
import type { CampaignFormData } from "@/lib/types";

const campaignSchema = z.object({
  name: z.string().min(1, "Campaign name is required"),
  objective: z.string().min(1, "Objective is required"),
  platforms: z.array(z.string()).min(1, "Select at least one platform"),
  dailyBudget: z.string().min(1, "Daily budget is required"),
  duration: z.number().min(1, "Duration must be at least 1 day"),
  targetAudience: z.object({
    ageRange: z.object({
      min: z.number().min(13).max(65),
      max: z.number().min(13).max(65),
    }),
    location: z.string().min(1, "Location is required"),
    interests: z.array(z.string()),
  }),
});

interface CampaignWizardProps {
  onClose: () => void;
}

export default function CampaignWizard({ onClose }: CampaignWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const steps = ["Campaign Setup", "Ad Creation", "Review & Launch"];

  const form = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      name: "",
      objective: "",
      platforms: [],
      dailyBudget: "",
      duration: 7,
      targetAudience: {
        ageRange: { min: 18, max: 65 },
        location: "United States",
        interests: [],
      },
    },
  });

  const createCampaignMutation = useMutation({
    mutationFn: async (data: CampaignFormData) => {
      const response = await apiRequest("POST", "/api/campaigns", {
        ...data,
        dailyBudget: parseFloat(data.dailyBudget),
        targetAudience: data.targetAudience,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Campaign Created Successfully",
        description: "Your campaign is now live and running",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create campaign. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CampaignFormData) => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      createCampaignMutation.mutate(data);
    }
  };

  const handlePlatformChange = (platform: string, checked: boolean) => {
    const currentPlatforms = form.getValues("platforms");
    if (checked) {
      form.setValue("platforms", [...currentPlatforms, platform]);
    } else {
      form.setValue("platforms", currentPlatforms.filter(p => p !== platform));
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b border-gray-200 pb-6">
          <DialogTitle className="text-xl font-semibold text-text-dark">
            Create New Campaign
          </DialogTitle>
          <div className="mt-6">
            <ProgressIndicator steps={steps} currentStep={currentStep} />
          </div>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6">
          {currentStep === 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name">Campaign Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter campaign name"
                    {...form.register("name")}
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="objective">Campaign Objective</Label>
                  <Select onValueChange={(value) => form.setValue("objective", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select objective" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="brand_awareness">Brand Awareness</SelectItem>
                      <SelectItem value="traffic">Traffic</SelectItem>
                      <SelectItem value="conversions">Conversions</SelectItem>
                      <SelectItem value="lead_generation">Lead Generation</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.objective && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.objective.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label>Platform Selection</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-fb-blue">
                    <Checkbox
                      onCheckedChange={(checked) => 
                        handlePlatformChange("facebook", checked as boolean)
                      }
                      className="mr-3"
                    />
                    <div className="flex items-center space-x-3">
                      <Facebook className="text-fb-blue" size={20} />
                      <div>
                        <p className="font-medium text-text-dark">Facebook</p>
                        <p className="text-sm text-gray-500">Reach broad audience</p>
                      </div>
                    </div>
                  </label>

                  <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-ig-pink">
                    <Checkbox
                      onCheckedChange={(checked) => 
                        handlePlatformChange("instagram", checked as boolean)
                      }
                      className="mr-3"
                    />
                    <div className="flex items-center space-x-3">
                      <Instagram className="text-ig-pink" size={20} />
                      <div>
                        <p className="font-medium text-text-dark">Instagram</p>
                        <p className="text-sm text-gray-500">Visual storytelling</p>
                      </div>
                    </div>
                  </label>
                </div>
                {form.formState.errors.platforms && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.platforms.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="dailyBudget">Daily Budget</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">$</span>
                    <Input
                      id="dailyBudget"
                      type="number"
                      placeholder="50"
                      className="pl-8"
                      {...form.register("dailyBudget")}
                    />
                  </div>
                  {form.formState.errors.dailyBudget && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.dailyBudget.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="duration">Campaign Duration</Label>
                  <Select onValueChange={(value) => form.setValue("duration", parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="14">14 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="90">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Target Audience</Label>
                <div className="bg-gray-50 rounded-lg p-4 mt-2">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-xs font-medium text-gray-600">Age Range</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Input
                          type="number"
                          placeholder="18"
                          className="text-sm"
                          {...form.register("targetAudience.ageRange.min", { valueAsNumber: true })}
                        />
                        <span className="text-gray-400">-</span>
                        <Input
                          type="number"
                          placeholder="65"
                          className="text-sm"
                          {...form.register("targetAudience.ageRange.max", { valueAsNumber: true })}
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs font-medium text-gray-600">Location</Label>
                      <Input
                        placeholder="United States"
                        className="text-sm mt-1"
                        {...form.register("targetAudience.location")}
                      />
                    </div>

                    <div>
                      <Label className="text-xs font-medium text-gray-600">Interests</Label>
                      <Input
                        placeholder="Fashion, Shopping"
                        className="text-sm mt-1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {currentStep === 1 && (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold text-text-dark mb-4">Ad Creation</h3>
              <p className="text-gray-500 mb-8">This step would include ad creative tools and templates</p>
              <div className="bg-gray-100 rounded-lg p-8 text-gray-500">
                Ad creation interface would be implemented here
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-text-dark">Review & Launch</h3>
              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Campaign Name</p>
                    <p className="font-medium">{form.getValues("name")}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Objective</p>
                    <p className="font-medium">{form.getValues("objective")}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Daily Budget</p>
                    <p className="font-medium">${form.getValues("dailyBudget")}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="font-medium">{form.getValues("duration")} days</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <div className="flex space-x-3">
              {currentStep > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(currentStep - 1)}
                >
                  Back
                </Button>
              )}
              <Button
                type="submit"
                className="bg-fb-blue text-white hover:bg-blue-600"
                disabled={createCampaignMutation.isPending}
              >
                {currentStep === steps.length - 1 ? "Launch Campaign" : "Next Step"}
                <ArrowRight className="ml-2" size={16} />
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

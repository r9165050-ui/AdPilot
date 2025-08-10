import { storage } from "./storage";
import type { Campaign, CampaignMetrics } from "@shared/schema";

export interface OptimizationRule {
  id: string;
  name: string;
  description: string;
  condition: (campaign: Campaign, metrics: CampaignMetrics[]) => boolean;
  action: (campaign: Campaign, metrics: CampaignMetrics[]) => OptimizationAction;
  priority: number; // 1-10, higher is more important
  enabled: boolean;
}

export interface OptimizationAction {
  type: 'budget_increase' | 'budget_decrease' | 'pause_campaign' | 'bid_adjustment' | 'audience_expansion' | 'creative_rotation';
  value?: number;
  reason: string;
  confidence: number; // 0-1
  estimatedImpact: string;
}

export interface OptimizationRecommendation {
  campaignId: string;
  rule: OptimizationRule;
  action: OptimizationAction;
  timestamp: Date;
  applied: boolean;
}

export class CampaignOptimizer {
  private rules: OptimizationRule[] = [];
  private recommendations: Map<string, OptimizationRecommendation[]> = new Map();

  constructor() {
    this.initializeDefaultRules();
  }

  private initializeDefaultRules() {
    this.rules = [
      {
        id: 'high-ctr-budget-increase',
        name: 'High CTR Budget Increase',
        description: 'Increase budget for campaigns with CTR > 3% and good conversion rate',
        condition: (campaign, metrics) => {
          const recentMetrics = metrics.slice(-7); // Last 7 days
          if (recentMetrics.length === 0) return false;
          const avgCtr = recentMetrics.reduce((sum, m) => sum + parseFloat(m.ctr || '0'), 0) / recentMetrics.length;
          const totalConversions = recentMetrics.reduce((sum, m) => sum + (m.conversions || 0), 0);
          return avgCtr > 3 && totalConversions > 5 && campaign.status === 'active';
        },
        action: (campaign, metrics) => ({
          type: 'budget_increase',
          value: 20, // 20% increase
          reason: 'High CTR (>3%) with good conversions indicates strong performance',
          confidence: 0.85,
          estimatedImpact: '+15-25% more conversions'
        }),
        priority: 8,
        enabled: true
      },
      {
        id: 'low-ctr-pause',
        name: 'Low CTR Campaign Pause',
        description: 'Pause campaigns with consistently low CTR < 0.5%',
        condition: (campaign, metrics) => {
          const recentMetrics = metrics.slice(-5); // Last 5 days
          if (recentMetrics.length < 3) return false;
          const avgCtr = recentMetrics.reduce((sum, m) => sum + parseFloat(m.ctr || '0'), 0) / recentMetrics.length;
          const totalImpressions = recentMetrics.reduce((sum, m) => sum + (m.impressions || 0), 0);
          return avgCtr < 0.5 && totalImpressions > 1000 && campaign.status === 'active';
        },
        action: (campaign, metrics) => ({
          type: 'pause_campaign',
          reason: 'Consistently low CTR (<0.5%) indicates poor ad relevance',
          confidence: 0.75,
          estimatedImpact: 'Save 80-100% of ad spend on underperforming campaign'
        }),
        priority: 9,
        enabled: true
      },
      {
        id: 'high-cpc-bid-reduction',
        name: 'High CPC Bid Reduction',
        description: 'Reduce bids for campaigns with CPC 50% above industry average',
        condition: (campaign, metrics) => {
          const recentMetrics = metrics.slice(-3); // Last 3 days
          if (recentMetrics.length === 0) return false;
          const avgCpc = recentMetrics.reduce((sum, m) => sum + parseFloat(m.cpc || '0'), 0) / recentMetrics.length;
          const industryAvgCpc = this.getIndustryAverageCpc(campaign);
          return avgCpc > industryAvgCpc * 1.5 && campaign.status === 'active';
        },
        action: (campaign, metrics) => ({
          type: 'bid_adjustment',
          value: -15, // 15% reduction
          reason: 'CPC significantly above industry average',
          confidence: 0.70,
          estimatedImpact: 'Reduce cost per click by 10-20%'
        }),
        priority: 6,
        enabled: true
      },
      {
        id: 'audience-fatigue',
        name: 'Audience Fatigue Detection',
        description: 'Expand audience when CTR declines significantly over time',
        condition: (campaign, metrics) => {
          if (metrics.length < 7) return false;
          const firstWeekCtr = metrics.slice(0, 3).reduce((sum, m) => sum + parseFloat(m.ctr || '0'), 0) / 3;
          const lastWeekCtr = metrics.slice(-3).reduce((sum, m) => sum + parseFloat(m.ctr || '0'), 0) / 3;
          return firstWeekCtr > 0 && lastWeekCtr < firstWeekCtr * 0.7 && campaign.status === 'active';
        },
        action: (campaign, metrics) => ({
          type: 'audience_expansion',
          value: 25, // 25% expansion
          reason: 'CTR declined by 30%+ indicating audience fatigue',
          confidence: 0.65,
          estimatedImpact: 'Refresh audience reach, potentially increase CTR by 15-30%'
        }),
        priority: 7,
        enabled: true
      },
      {
        id: 'creative-rotation',
        name: 'Creative Rotation',
        description: 'Suggest new creative when performance stagnates',
        condition: (campaign, metrics) => {
          const recentMetrics = metrics.slice(-10); // Last 10 days
          if (recentMetrics.length < 7) return false;
          const ctrVariance = this.calculateVariance(recentMetrics.map(m => parseFloat(m.ctr || '0')));
          return ctrVariance < 0.1 && campaign.status === 'active'; // Low variance indicates stagnation
        },
        action: (campaign, metrics) => ({
          type: 'creative_rotation',
          reason: 'Performance has plateaued - fresh creative may improve results',
          confidence: 0.60,
          estimatedImpact: 'Potential 10-40% improvement with new creative'
        }),
        priority: 5,
        enabled: true
      }
    ];
  }

  private getIndustryAverageCpc(campaign: Campaign): number {
    // Simplified industry averages - in real implementation, this would come from external data
    const industryAverages: { [key: string]: number } = {
      'brand_awareness': 0.75,
      'traffic': 0.85,
      'conversions': 1.25,
      'lead_generation': 1.50,
      'sales': 1.75,
      'app_installs': 0.95
    };
    return industryAverages[campaign.objective] || 1.00;
  }

  private calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return variance;
  }

  async optimizeCampaign(campaignId: string): Promise<OptimizationRecommendation[]> {
    const campaign = await storage.getCampaign(campaignId);
    if (!campaign) {
      throw new Error(`Campaign ${campaignId} not found`);
    }

    const metrics = await storage.getCampaignMetrics(campaignId);
    const recommendations: OptimizationRecommendation[] = [];

    // Sort rules by priority (higher priority first)
    const sortedRules = this.rules
      .filter(rule => rule.enabled)
      .sort((a, b) => b.priority - a.priority);

    for (const rule of sortedRules) {
      if (rule.condition(campaign, metrics)) {
        const action = rule.action(campaign, metrics);
        const recommendation: OptimizationRecommendation = {
          campaignId,
          rule,
          action,
          timestamp: new Date(),
          applied: false
        };
        recommendations.push(recommendation);
      }
    }

    // Store recommendations
    this.recommendations.set(campaignId, [
      ...(this.recommendations.get(campaignId) || []),
      ...recommendations
    ]);

    return recommendations;
  }

  async optimizeAllCampaigns(userId: string): Promise<Map<string, OptimizationRecommendation[]>> {
    const campaigns = await storage.getCampaigns(userId);
    const allRecommendations = new Map<string, OptimizationRecommendation[]>();

    for (const campaign of campaigns) {
      if (campaign.status === 'active') {
        const recommendations = await this.optimizeCampaign(campaign.id);
        if (recommendations.length > 0) {
          allRecommendations.set(campaign.id, recommendations);
        }
      }
    }

    return allRecommendations;
  }

  async applyRecommendation(campaignId: string, recommendationIndex: number): Promise<boolean> {
    const campaignRecommendations = this.recommendations.get(campaignId);
    if (!campaignRecommendations || !campaignRecommendations[recommendationIndex]) {
      return false;
    }

    const recommendation = campaignRecommendations[recommendationIndex];
    const campaign = await storage.getCampaign(campaignId);
    if (!campaign) return false;

    let updateData: Partial<Campaign> = {};

    switch (recommendation.action.type) {
      case 'budget_increase':
        const currentBudget = parseFloat(campaign.dailyBudget || '0');
        const increasePercent = recommendation.action.value || 20;
        updateData.dailyBudget = (currentBudget * (1 + increasePercent / 100)).toFixed(2);
        break;

      case 'budget_decrease':
        const currentBudgetDecrease = parseFloat(campaign.dailyBudget || '0');
        const decreasePercent = recommendation.action.value || 20;
        updateData.dailyBudget = (currentBudgetDecrease * (1 - decreasePercent / 100)).toFixed(2);
        break;

      case 'pause_campaign':
        updateData.status = 'paused';
        break;

      case 'bid_adjustment':
        // In a real implementation, this would adjust bid modifiers
        // For now, we'll adjust the daily budget as a proxy
        const bidAdjustment = recommendation.action.value || 0;
        const currentBudgetBid = parseFloat(campaign.dailyBudget || '0');
        updateData.dailyBudget = (currentBudgetBid * (1 + bidAdjustment / 100)).toFixed(2);
        break;

      default:
        // For audience_expansion and creative_rotation, we'll just mark as applied
        // In a real implementation, these would trigger specific platform API calls
        break;
    }

    if (Object.keys(updateData).length > 0) {
      await storage.updateCampaign(campaignId, updateData);
    }

    // Mark recommendation as applied
    recommendation.applied = true;
    return true;
  }

  getRecommendations(campaignId: string): OptimizationRecommendation[] {
    return this.recommendations.get(campaignId) || [];
  }

  getActiveRules(): OptimizationRule[] {
    return this.rules.filter(rule => rule.enabled);
  }

  updateRule(ruleId: string, updates: Partial<OptimizationRule>): boolean {
    const ruleIndex = this.rules.findIndex(rule => rule.id === ruleId);
    if (ruleIndex === -1) return false;

    this.rules[ruleIndex] = { ...this.rules[ruleIndex], ...updates };
    return true;
  }

  addCustomRule(rule: OptimizationRule): void {
    this.rules.push(rule);
  }

  removeRule(ruleId: string): boolean {
    const initialLength = this.rules.length;
    this.rules = this.rules.filter(rule => rule.id !== ruleId);
    return this.rules.length < initialLength;
  }
}

export const campaignOptimizer = new CampaignOptimizer();
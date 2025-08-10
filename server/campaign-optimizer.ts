import { type Campaign, type CampaignMetrics } from "@shared/schema";
import { storage } from "./storage";

export interface OptimizationRecommendation {
  type: 'budget' | 'targeting' | 'creative' | 'bidding';
  priority: 'high' | 'medium' | 'low';
  action: string;
  impact: string;
  confidence: number; // 0-1
}

export interface CampaignPerformance {
  campaignId: string;
  ctr: number;
  cpc: number;
  conversionRate: number;
  roas: number; // Return on Ad Spend
  qualityScore: number; // 1-10
  recommendations: OptimizationRecommendation[];
}

export class RealTimeOptimizer {
  private readonly CTR_THRESHOLD = 0.02; // 2%
  private readonly CPC_THRESHOLD = 2.0; // $2.00
  private readonly CONVERSION_RATE_THRESHOLD = 0.05; // 5%
  private readonly ROAS_THRESHOLD = 3.0; // 3:1 return

  async analyzeCampaignPerformance(campaignId: string): Promise<CampaignPerformance> {
    const campaign = await storage.getCampaign(campaignId);
    const metrics = await storage.getCampaignMetrics(campaignId);
    
    console.log(`Analyzing campaign ${campaignId}: found campaign=${!!campaign}, metrics=${metrics?.length || 0}`);

    if (!campaign || !metrics.length) {
      throw new Error('Campaign or metrics not found');
    }

    // Calculate aggregated metrics
    const totalImpressions = metrics.reduce((sum, m) => sum + (m.impressions || 0), 0);
    const totalClicks = metrics.reduce((sum, m) => sum + (m.clicks || 0), 0);
    const totalConversions = metrics.reduce((sum, m) => sum + (m.conversions || 0), 0);
    const totalCost = metrics.reduce((sum, m) => sum + parseFloat(m.cost?.toString() || '0'), 0);

    const ctr = totalImpressions > 0 ? totalClicks / totalImpressions : 0;
    const cpc = totalClicks > 0 ? totalCost / totalClicks : 0;
    const conversionRate = totalClicks > 0 ? totalConversions / totalClicks : 0;
    const roas = totalCost > 0 ? (totalConversions * 100) / totalCost : 0; // Assuming $100 per conversion

    const qualityScore = this.calculateQualityScore(ctr, cpc, conversionRate);
    const recommendations = this.generateRecommendations(campaign, { ctr, cpc, conversionRate, roas });

    return {
      campaignId,
      ctr,
      cpc,
      conversionRate,
      roas,
      qualityScore,
      recommendations
    };
  }

  private calculateQualityScore(ctr: number, cpc: number, conversionRate: number): number {
    let score = 5; // Base score

    // CTR impact
    if (ctr > 0.05) score += 2;
    else if (ctr > 0.03) score += 1;
    else if (ctr < 0.01) score -= 2;

    // CPC impact (lower is better)
    if (cpc < 1.0) score += 1;
    else if (cpc > 3.0) score -= 1;

    // Conversion rate impact
    if (conversionRate > 0.1) score += 2;
    else if (conversionRate > 0.05) score += 1;
    else if (conversionRate < 0.02) score -= 1;

    return Math.max(1, Math.min(10, score));
  }

  private generateRecommendations(
    campaign: Campaign,
    metrics: { ctr: number; cpc: number; conversionRate: number; roas: number }
  ): OptimizationRecommendation[] {
    const recommendations: OptimizationRecommendation[] = [];

    // Low CTR recommendations
    if (metrics.ctr < this.CTR_THRESHOLD) {
      recommendations.push({
        type: 'creative',
        priority: 'high',
        action: 'Test new ad creatives with more compelling headlines and visuals',
        impact: `Could increase CTR by 50-100%`,
        confidence: 0.8
      });

      recommendations.push({
        type: 'targeting',
        priority: 'medium',
        action: 'Refine audience targeting to focus on high-engagement segments',
        impact: 'May improve CTR by 25-40%',
        confidence: 0.7
      });
    }

    // High CPC recommendations
    if (metrics.cpc > this.CPC_THRESHOLD) {
      recommendations.push({
        type: 'bidding',
        priority: 'high',
        action: 'Adjust bidding strategy to automatic bid optimization',
        impact: 'Could reduce CPC by 20-30%',
        confidence: 0.75
      });

      recommendations.push({
        type: 'targeting',
        priority: 'medium',
        action: 'Expand targeting to less competitive audiences',
        impact: 'May reduce CPC by 15-25%',
        confidence: 0.65
      });
    }

    // Low conversion rate recommendations
    if (metrics.conversionRate < this.CONVERSION_RATE_THRESHOLD) {
      recommendations.push({
        type: 'creative',
        priority: 'high',
        action: 'Optimize landing page experience and call-to-action',
        impact: 'Could improve conversion rate by 40-60%',
        confidence: 0.8
      });
    }

    // Budget optimization
    const dailyBudget = parseFloat(campaign.dailyBudget?.toString() || '0');
    if (metrics.roas > this.ROAS_THRESHOLD && dailyBudget < 100) {
      recommendations.push({
        type: 'budget',
        priority: 'medium',
        action: `Increase daily budget from $${dailyBudget} to capture more profitable traffic`,
        impact: `Could scale profitable campaigns by 25-50%`,
        confidence: 0.7
      });
    } else if (metrics.roas < 2.0) {
      recommendations.push({
        type: 'budget',
        priority: 'high',
        action: 'Reduce budget or pause campaign until performance improves',
        impact: 'Prevent further budget waste',
        confidence: 0.9
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  async optimizeCampaignAutomatically(campaignId: string): Promise<{
    applied: OptimizationRecommendation[];
    pending: OptimizationRecommendation[];
  }> {
    const performance = await this.analyzeCampaignPerformance(campaignId);
    const campaign = await storage.getCampaign(campaignId);

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    const applied: OptimizationRecommendation[] = [];
    const pending: OptimizationRecommendation[] = [];

    for (const rec of performance.recommendations) {
      // Auto-apply high-confidence, low-risk optimizations
      if (rec.confidence > 0.8 && rec.type === 'bidding') {
        // Automatically optimize bidding strategy
        await storage.updateCampaign(campaignId, {
          updatedAt: new Date()
        });
        applied.push(rec);
      } else if (rec.confidence > 0.9 && rec.type === 'budget' && rec.action.includes('pause')) {
        // Auto-pause underperforming campaigns
        await storage.updateCampaign(campaignId, {
          status: 'paused',
          updatedAt: new Date()
        });
        applied.push(rec);
      } else {
        pending.push(rec);
      }
    }

    return { applied, pending };
  }

  async getOptimizationInsights(userId: string): Promise<{
    totalCampaigns: number;
    needsOptimization: number;
    potentialSavings: number;
    topRecommendations: OptimizationRecommendation[];
  }> {
    const campaigns = await storage.getCampaigns(userId);
    
    // Filter campaigns that have metrics data
    const campaignsWithMetrics = [];
    const insights = [];
    
    for (const campaign of campaigns) {
      try {
        const metrics = await storage.getCampaignMetrics(campaign.id);
        if (metrics.length > 0) {
          campaignsWithMetrics.push(campaign);
          const performance = await this.analyzeCampaignPerformance(campaign.id);
          insights.push(performance);
        }
      } catch (error) {
        // Skip campaigns without metrics
        console.log(`Skipping campaign ${campaign.id} - no metrics available`);
      }
    }

    const needsOptimization = insights.filter(i => i.recommendations.length > 0).length;
    const allRecommendations = insights.flatMap(i => i.recommendations);
    
    // Estimate potential savings based on recommendations
    const potentialSavings = campaignsWithMetrics.reduce((total, campaign) => {
      const dailyBudget = parseFloat(campaign.dailyBudget?.toString() || '0');
      const performance = insights.find(i => i.campaignId === campaign.id);
      
      if (performance && performance.roas < 2.0) {
        return total + (dailyBudget * 0.3); // 30% potential savings
      }
      return total;
    }, 0);

    const topRecommendations = allRecommendations
      .filter(r => r.priority === 'high')
      .slice(0, 5);

    return {
      totalCampaigns: campaignsWithMetrics.length,
      needsOptimization,
      potentialSavings,
      topRecommendations
    };
  }
}

export const optimizer = new RealTimeOptimizer();
import { type User, type InsertUser, type Campaign, type InsertCampaign, type AdTemplate, type InsertAdTemplate, type CampaignMetrics, type InsertCampaignMetrics } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Campaigns
  getCampaigns(userId: string): Promise<Campaign[]>;
  getCampaign(id: string): Promise<Campaign | undefined>;
  createCampaign(campaign: InsertCampaign & { userId: string }): Promise<Campaign>;
  updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign | undefined>;
  deleteCampaign(id: string): Promise<boolean>;
  
  // Ad Templates
  getAdTemplates(): Promise<AdTemplate[]>;
  getAdTemplate(id: string): Promise<AdTemplate | undefined>;
  createAdTemplate(template: InsertAdTemplate): Promise<AdTemplate>;
  
  // Campaign Metrics
  getCampaignMetrics(campaignId: string): Promise<CampaignMetrics[]>;
  createCampaignMetrics(metrics: InsertCampaignMetrics): Promise<CampaignMetrics>;
  
  // Dashboard Stats
  getDashboardStats(userId: string): Promise<{
    totalImpressions: number;
    totalClicks: number;
    avgCtr: number;
    avgCpc: number;
    activeCampaigns: number;
    totalSpent: number;
    budgetRemaining: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private campaigns: Map<string, Campaign>;
  private adTemplates: Map<string, AdTemplate>;
  private campaignMetrics: Map<string, CampaignMetrics>;

  constructor() {
    this.users = new Map();
    this.campaigns = new Map();
    this.adTemplates = new Map();
    this.campaignMetrics = new Map();
    
    // Initialize with some ad templates
    this.initializeAdTemplates();
  }

  private initializeAdTemplates() {
    const templates: AdTemplate[] = [
      {
        id: randomUUID(),
        name: "Summer Sale Banner",
        category: "promotion",
        platform: "both",
        thumbnail: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
        content: {
          headline: "Summer Sale - Up to 50% Off",
          description: "Don't miss out on our biggest sale of the year!",
          cta: "Shop Now"
        },
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "Brand Awareness",
        category: "branding",
        platform: "instagram",
        thumbnail: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
        content: {
          headline: "Discover Our Brand",
          description: "Quality products for modern lifestyle",
          cta: "Learn More"
        },
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "Holiday Collection",
        category: "seasonal",
        platform: "facebook",
        thumbnail: "https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
        content: {
          headline: "Holiday Collection 2024",
          description: "Perfect gifts for everyone on your list",
          cta: "Shop Collection"
        },
        isActive: true,
        createdAt: new Date(),
      }
    ];
    
    templates.forEach(template => {
      this.adTemplates.set(template.id, template);
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getCampaigns(userId: string): Promise<Campaign[]> {
    return Array.from(this.campaigns.values()).filter(
      campaign => campaign.userId === userId
    );
  }

  async getCampaign(id: string): Promise<Campaign | undefined> {
    return this.campaigns.get(id);
  }

  async createCampaign(campaignData: InsertCampaign & { userId: string }): Promise<Campaign> {
    const id = randomUUID();
    const now = new Date();
    const campaign: Campaign = {
      ...campaignData,
      id,
      spent: "0",
      metrics: {},
      createdAt: now,
      updatedAt: now,
    };
    this.campaigns.set(id, campaign);
    return campaign;
  }

  async updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign | undefined> {
    const campaign = this.campaigns.get(id);
    if (!campaign) return undefined;
    
    const updatedCampaign = {
      ...campaign,
      ...updates,
      updatedAt: new Date(),
    };
    this.campaigns.set(id, updatedCampaign);
    return updatedCampaign;
  }

  async deleteCampaign(id: string): Promise<boolean> {
    return this.campaigns.delete(id);
  }

  async getAdTemplates(): Promise<AdTemplate[]> {
    return Array.from(this.adTemplates.values()).filter(template => template.isActive);
  }

  async getAdTemplate(id: string): Promise<AdTemplate | undefined> {
    return this.adTemplates.get(id);
  }

  async createAdTemplate(templateData: InsertAdTemplate): Promise<AdTemplate> {
    const id = randomUUID();
    const template: AdTemplate = {
      ...templateData,
      id,
      createdAt: new Date(),
    };
    this.adTemplates.set(id, template);
    return template;
  }

  async getCampaignMetrics(campaignId: string): Promise<CampaignMetrics[]> {
    return Array.from(this.campaignMetrics.values()).filter(
      metrics => metrics.campaignId === campaignId
    );
  }

  async createCampaignMetrics(metricsData: InsertCampaignMetrics): Promise<CampaignMetrics> {
    const id = randomUUID();
    const metrics: CampaignMetrics = {
      ...metricsData,
      id,
    };
    this.campaignMetrics.set(id, metrics);
    return metrics;
  }

  async getDashboardStats(userId: string): Promise<{
    totalImpressions: number;
    totalClicks: number;
    avgCtr: number;
    avgCpc: number;
    activeCampaigns: number;
    totalSpent: number;
    budgetRemaining: number;
  }> {
    const userCampaigns = await this.getCampaigns(userId);
    const activeCampaigns = userCampaigns.filter(c => c.status === 'active').length;
    
    const totalSpent = userCampaigns.reduce((sum, campaign) => 
      sum + parseFloat(campaign.spent || "0"), 0
    );
    
    const totalBudget = userCampaigns.reduce((sum, campaign) => 
      sum + (campaign.totalBudget ? parseFloat(campaign.totalBudget) : parseFloat(campaign.dailyBudget) * campaign.duration), 0
    );
    
    // Mock metrics for demo purposes - in production these would come from real data
    return {
      totalImpressions: 2400000,
      totalClicks: 48200,
      avgCtr: 2.01,
      avgCpc: 0.84,
      activeCampaigns,
      totalSpent,
      budgetRemaining: totalBudget - totalSpent,
    };
  }
}

export const storage = new MemStorage();

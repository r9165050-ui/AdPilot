import { type User, type InsertUser, type Campaign, type InsertCampaign, type AdTemplate, type InsertAdTemplate, type CampaignMetrics, type InsertCampaignMetrics, type Payment, type InsertPayment } from "@shared/schema";
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

  // Payments
  getPaymentsByCampaign(campaignId: string): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePaymentByStripeId(stripePaymentIntentId: string, updates: Partial<Payment>): Promise<Payment | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private campaigns: Map<string, Campaign>;
  private adTemplates: Map<string, AdTemplate>;
  private campaignMetrics: Map<string, CampaignMetrics>;
  private payments: Map<string, Payment>;

  constructor() {
    this.users = new Map();
    this.campaigns = new Map();
    this.adTemplates = new Map();
    this.campaignMetrics = new Map();
    this.payments = new Map();
    
    // Initialize with some ad templates and sample campaigns
    this.initializeAdTemplates();
    this.initializeSampleCampaigns();
    this.initializeSampleMetrics();
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

  private initializeSampleCampaigns() {
    // Create a sample user first
    const sampleUser: User = {
      id: "sample-user",
      username: "demo@example.com",
      password: "hashed"
    };
    this.users.set(sampleUser.id, sampleUser);

    // Create sample campaigns with different payment statuses
    const sampleCampaigns: Campaign[] = [
      {
        id: "sample-campaign-1",
        name: "Holiday Sale Campaign",
        objective: "conversions",
        platforms: ["facebook", "instagram"],
        status: "draft",
        paymentStatus: "pending",
        dailyBudget: "50.00",
        totalBudget: "700.00",
        duration: 14,
        spent: "0.00",
        userId: "sample-user",
        stripePaymentIntentId: null,
        metrics: {},
        targetAudience: {
          ageRange: { min: 25, max: 45 },
          location: "United States",
          interests: ["shopping", "fashion", "lifestyle"]
        },
        adCreative: {
          headline: "Holiday Sale - 30% Off Everything",
          description: "Don't miss our biggest sale of the year. Shop now and save on all your favorite items.",
          callToAction: "Shop Now"
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "sample-campaign-2",
        name: "Brand Awareness Drive",
        objective: "brand_awareness",
        platforms: ["facebook"],
        status: "active",
        paymentStatus: "paid",
        dailyBudget: "25.00",
        totalBudget: "175.00",
        duration: 7,
        spent: "87.50",
        userId: "sample-user",
        stripePaymentIntentId: null,
        metrics: {},
        targetAudience: {
          ageRange: { min: 18, max: 65 },
          location: "North America",
          interests: ["technology", "innovation"]
        },
        adCreative: {
          headline: "Discover Innovation",
          description: "Leading the future with cutting-edge technology solutions.",
          callToAction: "Learn More"
        },
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      }
    ];

    sampleCampaigns.forEach(campaign => {
      this.campaigns.set(campaign.id, campaign);
    });
  }

  private initializeSampleMetrics() {
    // Create sample metrics for the campaigns
    const sampleMetrics: CampaignMetrics[] = [
      // Metrics for Holiday Sale Campaign (sample-campaign-1) - Poor performance
      {
        id: randomUUID(),
        campaignId: "sample-campaign-1",
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        impressions: 45000,
        clicks: 450,
        ctr: "1.00",
        cpc: "2.50",
        conversions: 18,
        cost: "1125.00"
      },
      {
        id: randomUUID(),
        campaignId: "sample-campaign-1",
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        impressions: 42000,
        clicks: 420,
        ctr: "1.00",
        cpc: "2.60",
        conversions: 15,
        cost: "1092.00"
      },
      {
        id: randomUUID(),
        campaignId: "sample-campaign-1",
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        impressions: 38000,
        clicks: 380,
        ctr: "1.00",
        cpc: "2.70",
        conversions: 12,
        cost: "1026.00"
      },
      
      // Metrics for Brand Awareness Drive (sample-campaign-2) - Good performance
      {
        id: randomUUID(),
        campaignId: "sample-campaign-2",
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        impressions: 125000,
        clicks: 3750,
        ctr: "3.00",
        cpc: "0.80",
        conversions: 225,
        cost: "3000.00"
      },
      {
        id: randomUUID(),
        campaignId: "sample-campaign-2",
        date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
        impressions: 130000,
        clicks: 4290,
        ctr: "3.30",
        cpc: "0.75",
        conversions: 257,
        cost: "3217.50"
      },
      {
        id: randomUUID(),
        campaignId: "sample-campaign-2",
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        impressions: 135000,
        clicks: 4725,
        ctr: "3.50",
        cpc: "0.70",
        conversions: 283,
        cost: "3307.50"
      },
      {
        id: randomUUID(),
        campaignId: "sample-campaign-2",
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        impressions: 128000,
        clicks: 4352,
        ctr: "3.40",
        cpc: "0.72",
        conversions: 261,
        cost: "3133.44"
      },
      {
        id: randomUUID(),
        campaignId: "sample-campaign-2",
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        impressions: 140000,
        clicks: 4900,
        ctr: "3.50",
        cpc: "0.68",
        conversions: 294,
        cost: "3332.00"
      }
    ];

    sampleMetrics.forEach(metric => {
      this.campaignMetrics.set(metric.id, metric);
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
      status: campaignData.status || "draft",
      totalBudget: campaignData.totalBudget || null,
      stripePaymentIntentId: null,
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

  async getPaymentsByCampaign(campaignId: string): Promise<Payment[]> {
    return Array.from(this.payments.values()).filter(
      payment => payment.campaignId === campaignId
    );
  }

  async createPayment(paymentData: InsertPayment): Promise<Payment> {
    const id = randomUUID();
    const payment: Payment = {
      ...paymentData,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.payments.set(id, payment);
    return payment;
  }

  async updatePaymentByStripeId(stripePaymentIntentId: string, updates: Partial<Payment>): Promise<Payment | undefined> {
    const payment = Array.from(this.payments.values()).find(
      p => p.stripePaymentIntentId === stripePaymentIntentId
    );
    
    if (!payment) {
      return undefined;
    }

    const updatedPayment: Payment = {
      ...payment,
      ...updates,
      updatedAt: new Date(),
    };
    
    this.payments.set(payment.id, updatedPayment);
    return updatedPayment;
  }
}

export const storage = new MemStorage();

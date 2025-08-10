import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCampaignSchema, insertAdTemplateSchema, insertPaymentSchema } from "@shared/schema";
import { z } from "zod";
import { generateAdCopy, optimizeAdCopy, type AdCopyRequest } from "./ai-copy-generator";
import { optimizer } from "./campaign-optimizer";
import { facebookAPI, type FacebookCampaignData } from "./facebook-integration";
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-07-30.basil",
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Get dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      // For demo purposes, using the sample user ID
      const userId = "sample-user";
      const stats = await storage.getDashboardStats(userId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Get campaigns
  app.get("/api/campaigns", async (req, res) => {
    try {
      // For demo purposes, using the sample user ID
      const userId = "sample-user";
      const campaigns = await storage.getCampaigns(userId);
      res.json(campaigns);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch campaigns" });
    }
  });

  // Get single campaign
  app.get("/api/campaigns/:id", async (req, res) => {
    try {
      const campaign = await storage.getCampaign(req.params.id);
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      res.json(campaign);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch campaign" });
    }
  });

  // Create campaign
  app.post("/api/campaigns", async (req, res) => {
    try {
      const validatedData = insertCampaignSchema.parse(req.body);
      // For demo purposes, using the sample user ID
      const userId = "sample-user";
      const campaign = await storage.createCampaign({ ...validatedData, userId });
      res.status(201).json(campaign);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create campaign" });
    }
  });

  // Update campaign
  app.patch("/api/campaigns/:id", async (req, res) => {
    try {
      const campaign = await storage.updateCampaign(req.params.id, req.body);
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      res.json(campaign);
    } catch (error) {
      res.status(500).json({ message: "Failed to update campaign" });
    }
  });

  // Delete campaign
  app.delete("/api/campaigns/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteCampaign(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete campaign" });
    }
  });

  // Get ad templates
  app.get("/api/templates", async (req, res) => {
    try {
      const templates = await storage.getAdTemplates();
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });

  // Create ad template
  app.post("/api/templates", async (req, res) => {
    try {
      const validatedData = insertAdTemplateSchema.parse(req.body);
      const template = await storage.createAdTemplate(validatedData);
      res.status(201).json(template);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create template" });
    }
  });

  // Get campaign metrics
  app.get("/api/campaigns/:id/metrics", async (req, res) => {
    try {
      const metrics = await storage.getCampaignMetrics(req.params.id);
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch campaign metrics" });
    }
  });

  // AI-powered ad copy generation
  app.post("/api/ai/generate-copy", async (req, res) => {
    try {
      const adCopyRequest: AdCopyRequest = req.body;
      const generatedCopy = await generateAdCopy(adCopyRequest);
      res.json(generatedCopy);
    } catch (error) {
      console.error("Error generating ad copy:", error);
      if (error instanceof Error && error.message.includes("API key not configured")) {
        return res.status(400).json({ 
          message: "OpenAI API key not configured. Please add OPENAI_API_KEY to your environment variables." 
        });
      }
      res.status(500).json({ message: "Failed to generate ad copy" });
    }
  });

  // AI-powered ad copy optimization
  app.post("/api/ai/optimize-copy", async (req, res) => {
    try {
      const { originalCopy, platform, objective, performanceData } = req.body;
      const optimizedResult = await optimizeAdCopy(originalCopy, platform, objective, performanceData);
      res.json(optimizedResult);
    } catch (error) {
      console.error("Error optimizing ad copy:", error);
      if (error instanceof Error && error.message.includes("API key not configured")) {
        return res.status(400).json({ 
          message: "OpenAI API key not configured. Please add OPENAI_API_KEY to your environment variables." 
        });
      }
      res.status(500).json({ message: "Failed to optimize ad copy" });
    }
  });

  // Payment processing routes
  app.post("/api/campaigns/:id/payment", async (req, res) => {
    try {
      const campaignId = req.params.id;
      const campaign = await storage.getCampaign(campaignId);
      
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }

      if (campaign.paymentStatus === "paid") {
        return res.status(400).json({ message: "Campaign already paid" });
      }

      // Calculate total campaign cost (daily budget * duration)
      const totalAmount = parseFloat(campaign.dailyBudget) * campaign.duration;
      
      // Create payment intent with Stripe
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(totalAmount * 100), // Convert to cents
        currency: "usd",
        metadata: {
          campaignId: campaign.id,
          campaignName: campaign.name,
        },
      });

      // Store payment record
      await storage.createPayment({
        campaignId: campaign.id,
        userId: campaign.userId,
        amount: totalAmount.toString(),
        currency: "usd",
        status: "pending",
        stripePaymentIntentId: paymentIntent.id,
        stripeClientSecret: paymentIntent.client_secret,
      });

      // Update campaign with payment intent ID
      await storage.updateCampaign(campaign.id, {
        stripePaymentIntentId: paymentIntent.id,
      });

      res.json({ 
        clientSecret: paymentIntent.client_secret,
        amount: totalAmount,
        campaignName: campaign.name
      });
    } catch (error: any) {
      console.error("Payment creation error:", error);
      res.status(500).json({ 
        message: "Failed to create payment intent",
        error: error.message 
      });
    }
  });

  // Confirm payment and activate campaign
  app.post("/api/campaigns/:id/confirm-payment", async (req, res) => {
    try {
      const campaignId = req.params.id;
      const { paymentIntentId } = req.body;

      // Retrieve payment intent from Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status === "succeeded") {
        // Update campaign status
        await storage.updateCampaign(campaignId, {
          paymentStatus: "paid",
          status: "active",
        });

        // Update payment record
        await storage.updatePaymentByStripeId(paymentIntentId, {
          status: "succeeded",
          paymentMethod: paymentIntent.payment_method ? 
            `${paymentIntent.payment_method}` : "card",
        });

        res.json({ 
          success: true, 
          message: "Campaign funded and activated successfully" 
        });
      } else {
        await storage.updateCampaign(campaignId, {
          paymentStatus: "failed",
        });

        await storage.updatePaymentByStripeId(paymentIntentId, {
          status: "failed",
        });

        res.status(400).json({ 
          success: false, 
          message: "Payment failed" 
        });
      }
    } catch (error: any) {
      console.error("Payment confirmation error:", error);
      res.status(500).json({ 
        message: "Failed to confirm payment",
        error: error.message 
      });
    }
  });

  // Get campaign payment status
  app.get("/api/campaigns/:id/payment-status", async (req, res) => {
    try {
      const campaignId = req.params.id;
      const campaign = await storage.getCampaign(campaignId);
      
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }

      const payments = await storage.getPaymentsByCampaign(campaignId);
      
      res.json({
        paymentStatus: campaign.paymentStatus,
        payments: payments,
        totalAmount: parseFloat(campaign.dailyBudget) * campaign.duration,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch payment status" });
    }
  });

  // Facebook Auth Routes
  app.get("/api/auth/facebook", async (req, res) => {
    try {
      const state = Math.random().toString(36).substring(2, 15);
      // In a real app, you'd store this state in session/redis
      const authUrl = facebookAPI.generateAuthUrl(state);
      res.json({ authUrl, state });
    } catch (error) {
      console.error("Facebook auth error:", error);
      res.status(500).json({ message: "Failed to initiate Facebook auth" });
    }
  });

  app.post("/api/auth/facebook/callback", async (req, res) => {
    try {
      const { code, state } = req.body;
      
      // Exchange code for access token
      const tokenData = await facebookAPI.exchangeCodeForToken(code);
      
      // Get user profile and ad accounts
      const userProfile = await facebookAPI.getUserProfile(tokenData.accessToken);
      
      res.json({
        success: true,
        user: userProfile,
        message: "Successfully connected to Facebook"
      });
    } catch (error: any) {
      console.error("Facebook callback error:", error);
      res.status(400).json({ 
        message: "Failed to authenticate with Facebook",
        error: error.message 
      });
    }
  });

  // Campaign Optimization Routes
  app.get("/api/campaigns/:id/optimization", async (req, res) => {
    try {
      const campaignId = req.params.id;
      const performance = await optimizer.analyzeCampaignPerformance(campaignId);
      res.json(performance);
    } catch (error: any) {
      console.error("Campaign optimization analysis error:", error);
      res.status(500).json({ 
        message: "Failed to analyze campaign performance",
        error: error.message 
      });
    }
  });

  app.post("/api/campaigns/:id/optimize", async (req, res) => {
    try {
      const campaignId = req.params.id;
      const result = await optimizer.optimizeCampaignAutomatically(campaignId);
      res.json(result);
    } catch (error: any) {
      console.error("Auto optimization error:", error);
      res.status(500).json({ 
        message: "Failed to optimize campaign",
        error: error.message 
      });
    }
  });

  app.get("/api/optimization/insights", async (req, res) => {
    try {
      // For demo purposes, using the sample user ID
      const userId = "sample-user";
      const insights = await optimizer.getOptimizationInsights(userId);
      res.json(insights);
    } catch (error: any) {
      console.error("Optimization insights error:", error);
      res.status(500).json({ 
        message: "Failed to get optimization insights",
        error: error.message 
      });
    }
  });

  // Facebook Campaign Publishing
  app.post("/api/campaigns/:id/publish-to-facebook", async (req, res) => {
    try {
      const campaignId = req.params.id;
      const { accessToken, adAccountId } = req.body;

      const campaign = await storage.getCampaign(campaignId);
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }

      // Map campaign data to Facebook format
      const facebookCampaignData: FacebookCampaignData = {
        name: campaign.name,
        objective: campaign.objective,
        status: campaign.status === 'active' ? 'active' : 'paused',
        dailyBudget: parseFloat(campaign.dailyBudget?.toString() || '0'),
        targetAudience: {
          ageMin: (campaign.targetAudience as any)?.ageRange?.min || 18,
          ageMax: (campaign.targetAudience as any)?.ageRange?.max || 65,
          genders: [1, 2], // All genders
          locations: [(campaign.targetAudience as any)?.location] || ['US'],
          interests: (campaign.targetAudience as any)?.interests || []
        },
        adCreative: {
          headline: (campaign.adCreative as any)?.headline || campaign.name,
          description: (campaign.adCreative as any)?.description || 'Discover our amazing products and services',
          callToAction: (campaign.adCreative as any)?.callToAction || 'LEARN_MORE',
          linkUrl: (campaign.adCreative as any)?.linkUrl
        }
      };

      const result = await facebookAPI.createCampaign(accessToken, adAccountId, facebookCampaignData);

      // Update campaign with Facebook campaign ID
      await storage.updateCampaign(campaignId, {
        updatedAt: new Date()
      });

      res.json({
        success: true,
        facebookCampaignId: result.id,
        status: result.status,
        message: "Campaign successfully published to Facebook"
      });
    } catch (error: any) {
      console.error("Facebook campaign publish error:", error);
      res.status(500).json({ 
        message: "Failed to publish campaign to Facebook",
        error: error.message 
      });
    }
  });

  // Get Facebook campaign insights
  app.get("/api/campaigns/:id/facebook-insights", async (req, res) => {
    try {
      const campaignId = req.params.id;
      const { accessToken, facebookCampaignId, dateRange } = req.query;

      if (!accessToken || !facebookCampaignId) {
        return res.status(400).json({ 
          message: "Access token and Facebook campaign ID required" 
        });
      }

      const insights = await facebookAPI.getCampaignInsights(
        accessToken as string,
        facebookCampaignId as string,
        dateRange as any || { 
          since: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          until: new Date().toISOString().split('T')[0]
        }
      );

      res.json(insights);
    } catch (error: any) {
      console.error("Facebook insights error:", error);
      res.status(500).json({ 
        message: "Failed to get Facebook campaign insights",
        error: error.message 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCampaignSchema, insertAdTemplateSchema } from "@shared/schema";
import { z } from "zod";
import { generateAdCopy, optimizeAdCopy, type AdCopyRequest } from "./ai-copy-generator";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      // For demo purposes, using a mock user ID
      const userId = "demo-user-id";
      const stats = await storage.getDashboardStats(userId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Get campaigns
  app.get("/api/campaigns", async (req, res) => {
    try {
      // For demo purposes, using a mock user ID
      const userId = "demo-user-id";
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
      // For demo purposes, using a mock user ID
      const userId = "demo-user-id";
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

  const httpServer = createServer(app);
  return httpServer;
}

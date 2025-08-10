export interface DashboardStats {
  totalImpressions: number;
  totalClicks: number;
  avgCtr: number;
  avgCpc: number;
  activeCampaigns: number;
  totalSpent: number;
  budgetRemaining: number;
}

export interface CampaignFormData {
  name: string;
  objective: string;
  platforms: string[];
  dailyBudget: string;
  duration: number;
  targetAudience: {
    ageRange: { min: number; max: number };
    location: string;
    interests: string[];
  };
}

export interface AdCreative {
  headline: string;
  description: string;
  cta: string;
  image?: string;
}

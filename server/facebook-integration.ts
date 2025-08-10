import { type Campaign } from "@shared/schema";

export interface FacebookAuthConfig {
  appId: string;
  appSecret: string;
  redirectUri: string;
}

export interface FacebookUser {
  id: string;
  name: string;
  email: string;
  accessToken: string;
  adAccounts: FacebookAdAccount[];
}

export interface FacebookAdAccount {
  id: string;
  name: string;
  accountStatus: number;
  currency: string;
  timezone: string;
}

export interface FacebookCampaignData {
  name: string;
  objective: string;
  status: string;
  dailyBudget: number;
  targetAudience: {
    ageMin: number;
    ageMax: number;
    genders: number[];
    locations: string[];
    interests: string[];
  };
  adCreative: {
    headline: string;
    description: string;
    imageUrl?: string;
    linkUrl?: string;
    callToAction: string;
  };
}

export class FacebookMarketingAPI {
  private readonly baseUrl = 'https://graph.facebook.com/v21.0';
  
  constructor(private config: FacebookAuthConfig) {}

  generateAuthUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.config.appId,
      redirect_uri: this.config.redirectUri,
      state,
      scope: 'ads_management,ads_read,business_management,pages_read_engagement,pages_manage_posts',
      response_type: 'code'
    });

    return `https://www.facebook.com/v21.0/dialog/oauth?${params.toString()}`;
  }

  async exchangeCodeForToken(code: string): Promise<{
    accessToken: string;
    tokenType: string;
    expiresIn: number;
  }> {
    const response = await fetch(`${this.baseUrl}/oauth/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: this.config.appId,
        client_secret: this.config.appSecret,
        redirect_uri: this.config.redirectUri,
        code
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to exchange code for token: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      accessToken: data.access_token,
      tokenType: data.token_type,
      expiresIn: data.expires_in
    };
  }

  async getUserProfile(accessToken: string): Promise<FacebookUser> {
    const response = await fetch(`${this.baseUrl}/me?fields=id,name,email&access_token=${accessToken}`);
    
    if (!response.ok) {
      throw new Error(`Failed to get user profile: ${response.statusText}`);
    }

    const userData = await response.json();
    const adAccounts = await this.getAdAccounts(accessToken);

    return {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      accessToken,
      adAccounts
    };
  }

  async getAdAccounts(accessToken: string): Promise<FacebookAdAccount[]> {
    const response = await fetch(
      `${this.baseUrl}/me/adaccounts?fields=id,name,account_status,currency,timezone&access_token=${accessToken}`
    );

    if (!response.ok) {
      throw new Error(`Failed to get ad accounts: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || [];
  }

  async createCampaign(
    accessToken: string,
    adAccountId: string,
    campaignData: FacebookCampaignData
  ): Promise<{ id: string; status: string }> {
    // Create campaign
    const campaignResponse = await fetch(`${this.baseUrl}/${adAccountId}/campaigns`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        name: campaignData.name,
        objective: this.mapObjectiveToFacebook(campaignData.objective),
        status: campaignData.status.toUpperCase(),
        special_ad_categories: []
      })
    });

    if (!campaignResponse.ok) {
      const error = await campaignResponse.json();
      throw new Error(`Failed to create campaign: ${error.error?.message || campaignResponse.statusText}`);
    }

    const campaign = await campaignResponse.json();

    // Create ad set
    const adSetId = await this.createAdSet(accessToken, adAccountId, campaign.id, campaignData);

    // Create ad creative
    const creativeId = await this.createAdCreative(accessToken, adAccountId, campaignData.adCreative);

    // Create ad
    await this.createAd(accessToken, adAccountId, adSetId, creativeId, campaignData.name);

    return { id: campaign.id, status: campaign.status };
  }

  private async createAdSet(
    accessToken: string,
    adAccountId: string,
    campaignId: string,
    campaignData: FacebookCampaignData
  ): Promise<string> {
    const targeting = {
      age_min: campaignData.targetAudience.ageMin,
      age_max: campaignData.targetAudience.ageMax,
      genders: campaignData.targetAudience.genders,
      geo_locations: {
        countries: campaignData.targetAudience.locations
      },
      interests: campaignData.targetAudience.interests.map(interest => ({
        id: interest,
        name: interest
      }))
    };

    const response = await fetch(`${this.baseUrl}/${adAccountId}/adsets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        name: `${campaignData.name} - Ad Set`,
        campaign_id: campaignId,
        daily_budget: Math.round(campaignData.dailyBudget * 100), // Convert to cents
        bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
        billing_event: 'IMPRESSIONS',
        optimization_goal: 'REACH',
        targeting,
        status: 'ACTIVE'
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to create ad set: ${error.error?.message || response.statusText}`);
    }

    const adSet = await response.json();
    return adSet.id;
  }

  private async createAdCreative(
    accessToken: string,
    adAccountId: string,
    creative: FacebookCampaignData['adCreative']
  ): Promise<string> {
    const objectStorySpec = {
      page_id: adAccountId, // This should be a page ID, simplified for demo
      link_data: {
        message: creative.description,
        name: creative.headline,
        link: creative.linkUrl || 'https://example.com',
        call_to_action: {
          type: creative.callToAction.toUpperCase()
        }
      }
    };

    if (creative.imageUrl) {
      // @ts-ignore - Facebook API accepts image_url
      objectStorySpec.link_data.image_url = creative.imageUrl;
    }

    const response = await fetch(`${this.baseUrl}/${adAccountId}/adcreatives`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        name: `${creative.headline} - Creative`,
        object_story_spec: objectStorySpec
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to create ad creative: ${error.error?.message || response.statusText}`);
    }

    const adCreative = await response.json();
    return adCreative.id;
  }

  private async createAd(
    accessToken: string,
    adAccountId: string,
    adSetId: string,
    creativeId: string,
    name: string
  ): Promise<string> {
    const response = await fetch(`${this.baseUrl}/${adAccountId}/ads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        name: `${name} - Ad`,
        adset_id: adSetId,
        creative: { creative_id: creativeId },
        status: 'ACTIVE'
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to create ad: ${error.error?.message || response.statusText}`);
    }

    const ad = await response.json();
    return ad.id;
  }

  private mapObjectiveToFacebook(objective: string): string {
    const objectiveMap: Record<string, string> = {
      'brand_awareness': 'BRAND_AWARENESS',
      'reach': 'REACH',
      'traffic': 'LINK_CLICKS',
      'engagement': 'ENGAGEMENT',
      'app_installs': 'APP_INSTALLS',
      'video_views': 'VIDEO_VIEWS',
      'lead_generation': 'LEAD_GENERATION',
      'messages': 'MESSAGES',
      'conversions': 'CONVERSIONS',
      'catalog_sales': 'PRODUCT_CATALOG_SALES',
      'store_visits': 'STORE_VISITS'
    };

    return objectiveMap[objective] || 'REACH';
  }

  async getCampaignInsights(
    accessToken: string,
    campaignId: string,
    dateRange: { since: string; until: string }
  ): Promise<{
    impressions: number;
    clicks: number;
    ctr: number;
    cpc: number;
    spend: number;
    conversions: number;
  }> {
    const fields = 'impressions,clicks,ctr,cpc,spend,conversions';
    const timeRange = `since=${dateRange.since}&until=${dateRange.until}`;
    
    const response = await fetch(
      `${this.baseUrl}/${campaignId}/insights?fields=${fields}&${timeRange}&access_token=${accessToken}`
    );

    if (!response.ok) {
      throw new Error(`Failed to get campaign insights: ${response.statusText}`);
    }

    const data = await response.json();
    const insights = data.data[0] || {};

    return {
      impressions: parseInt(insights.impressions || '0'),
      clicks: parseInt(insights.clicks || '0'),
      ctr: parseFloat(insights.ctr || '0'),
      cpc: parseFloat(insights.cpc || '0'),
      spend: parseFloat(insights.spend || '0'),
      conversions: parseInt(insights.conversions || '0')
    };
  }
}

// Initialize with environment variables
export const facebookAPI = new FacebookMarketingAPI({
  appId: process.env.FACEBOOK_APP_ID || '',
  appSecret: process.env.FACEBOOK_APP_SECRET || '',
  redirectUri: process.env.FACEBOOK_REDIRECT_URI || 'http://localhost:5000/api/auth/facebook/callback'
});
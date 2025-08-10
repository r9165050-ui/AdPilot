import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key not configured");
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

export interface AdCopyRequest {
  objective: string;
  platform: string[];
  industry?: string;
  targetAudience: {
    ageRange: { min: number; max: number };
    location: string;
    interests: string[];
  };
  productService?: string;
  tone?: string;
  callToAction?: string;
}

export interface AdCopyResponse {
  headlines: string[];
  descriptions: string[];
  callToActions: string[];
  hashtags: string[];
}

export async function generateAdCopy(request: AdCopyRequest): Promise<AdCopyResponse> {
  const platformText = request.platform.includes('facebook') && request.platform.includes('instagram') 
    ? 'Facebook and Instagram' 
    : request.platform.join(' and ');

  const audienceText = `${request.targetAudience.ageRange.min}-${request.targetAudience.ageRange.max} year olds in ${request.targetAudience.location}`;
  const interestsText = request.targetAudience.interests.length > 0 
    ? ` interested in ${request.targetAudience.interests.join(', ')}` 
    : '';

  const prompt = `Create compelling ad copy for a ${request.objective} campaign on ${platformText}.

Target Audience: ${audienceText}${interestsText}
${request.industry ? `Industry: ${request.industry}` : ''}
${request.productService ? `Product/Service: ${request.productService}` : ''}
${request.tone ? `Tone: ${request.tone}` : 'Tone: Professional but engaging'}

Generate:
- 5 compelling headlines (25-40 characters each)
- 5 engaging descriptions (90-125 characters each)
- 5 strong call-to-action phrases (10-20 characters each)
- 10 relevant hashtags for social media

Focus on:
- Clear value propositions
- Emotional triggers appropriate for the audience
- Platform-specific best practices
- Urgency and action-oriented language

Respond in JSON format with the structure:
{
  "headlines": ["headline1", "headline2", ...],
  "descriptions": ["description1", "description2", ...],
  "callToActions": ["cta1", "cta2", ...],
  "hashtags": ["hashtag1", "hashtag2", ...]
}`;

  try {
    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert Meta advertising copywriter with deep knowledge of Facebook and Instagram ad best practices. Create high-converting ad copy that follows platform guidelines and drives engagement."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.8,
      max_tokens: 1500,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      headlines: result.headlines || [],
      descriptions: result.descriptions || [],
      callToActions: result.callToActions || [],
      hashtags: result.hashtags || [],
    };
  } catch (error) {
    console.error('Error generating ad copy:', error);
    throw new Error('Failed to generate ad copy');
  }
}

export async function optimizeAdCopy(
  originalCopy: string,
  platform: string,
  objective: string,
  performanceData?: { ctr: number; conversions: number }
): Promise<{ optimizedCopy: string; suggestions: string[] }> {
  const performanceContext = performanceData 
    ? `Current performance: CTR ${performanceData.ctr}%, Conversions: ${performanceData.conversions}`
    : '';

  const prompt = `Optimize this ${platform} ad copy for a ${objective} campaign:

Original Copy: "${originalCopy}"
${performanceContext}

Provide:
1. An optimized version of the copy
2. 3-5 specific improvement suggestions

Focus on:
- Improving click-through rates
- Stronger emotional appeal
- Better call-to-action
- Platform-specific optimization
- A/B testing recommendations

Respond in JSON format:
{
  "optimizedCopy": "improved version",
  "suggestions": ["suggestion1", "suggestion2", ...]
}`;

  try {
    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert in Meta advertising optimization with proven track record of improving ad performance through copy optimization."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      optimizedCopy: result.optimizedCopy || originalCopy,
      suggestions: result.suggestions || [],
    };
  } catch (error) {
    console.error('Error optimizing ad copy:', error);
    throw new Error('Failed to optimize ad copy');
  }
}
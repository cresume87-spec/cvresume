import OpenAI from "openai";

// Centralized OpenAI client with env-based configuration
// Supports custom base URL/org for proxies or Azure-compatible endpoints

const defaultModel = process.env.OPENAI_MODEL || "gpt-4o-mini";

export function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set");

  const baseURL = process.env.OPENAI_BASE_URL || undefined;
  const organization = process.env.OPENAI_ORG || undefined;

  return new OpenAI({ apiKey, baseURL, organization });
}

export function getDefaultOpenAIModel(): string {
  return defaultModel;
}

export async function generateText(params: {
  prompt: string;
  system?: string;
  temperature?: number;
  model?: string;
}): Promise<string> {
  const { prompt, system, temperature = 0.7, model } = params;
  const client = getOpenAIClient();
  const modelToUse = model || getDefaultOpenAIModel();

  // Using Chat Completions for wide compatibility
  const response = await client.chat.completions.create({
    model: modelToUse,
    temperature,
    messages: [
      ...(system ? [{ role: "system" as const, content: system }] : []),
      { role: "user" as const, content: prompt },
    ],
  });

  const content = response.choices?.[0]?.message?.content || "";
  return content;
}



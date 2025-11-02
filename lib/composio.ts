import { Composio } from '@composio/core';
import { AnthropicProvider } from '@composio/anthropic';
import { Anthropic } from '@anthropic-ai/sdk';

const apiKey = process.env.COMPOSIO_API_KEY;

if (!apiKey) {
  throw new Error('Missing COMPOSIO_API_KEY');
}

// Single Anthropic client reused across requests
export const anthropicClient = new Anthropic();

export const composio = new Composio({
  apiKey,
  provider: new AnthropicProvider({
    anthropicClient,
    cacheTools: false,
  }),
});

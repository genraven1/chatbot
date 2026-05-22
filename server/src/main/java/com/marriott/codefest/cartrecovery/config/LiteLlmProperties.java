package com.marriott.codefest.cartrecovery.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Connection settings for the LiteLLM gateway (OpenAI-compatible chat completions API).
 * Bound from the {@code litellm.*} keys in application.yml / environment variables.
 */
@ConfigurationProperties("litellm")
public record LiteLlmProperties(String baseUrl, String apiKey, String model) {
}

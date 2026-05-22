package com.marriott.codefest.cartrecovery.model;

/**
 * One turn in the chatbot conversation. {@code role} is one of
 * {@code system}, {@code user}, {@code assistant} (OpenAI/LiteLLM convention).
 */
public record ChatMessage(String role, String content) {
}

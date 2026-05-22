package com.marriott.codefest.cartrecovery.service;

import com.marriott.codefest.cartrecovery.config.LiteLlmProperties;
import com.marriott.codefest.cartrecovery.model.ChatMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Component
public class LiteLlmClient {

    private static final Logger log = LoggerFactory.getLogger(LiteLlmClient.class);

    private final LiteLlmProperties props;
    private final RestClient http;

    public LiteLlmClient(LiteLlmProperties props) {
        this.props = props;
        this.http = RestClient.builder().baseUrl(props.baseUrl()).build();
    }

    /** True when a real LiteLLM key is present (vs. offline demo mode). */
    public boolean isConfigured() {
        return props.apiKey() != null && !props.apiKey().isBlank();
    }

    /**
     * Runs one chat completion. Returns the assistant's text, or {@code null} if
     * the gateway is not configured or the call fails.
     */
    public String complete(String systemPrompt, List<ChatMessage> history) {
        if (!isConfigured()) {
            return null;
        }
        try {
            List<Map<String, String>> messages = new ArrayList<>();
            messages.add(Map.of("role", "system", "content", systemPrompt));
            for (ChatMessage m : history) {
                messages.add(Map.of("role", m.role(), "content", m.content()));
            }
            Map<String, Object> body = Map.of(
                    "model", props.model(),
                    "messages", messages,
                    "temperature", 0.5,
                    "max_tokens", 320);

            Map<?, ?> response = http.post()
                    .uri("/chat/completions")
                    .header("Authorization", "Bearer " + props.apiKey())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(Map.class);

            List<?> choices = (List<?>) response.get("choices");
            Map<?, ?> message = (Map<?, ?>) ((Map<?, ?>) choices.get(0)).get("message");
            return ((String) message.get("content")).trim();
        } catch (Exception e) {
            log.warn("LiteLLM call failed, falling back to demo copy: {}", e.toString());
            return null;
        }
    }
}

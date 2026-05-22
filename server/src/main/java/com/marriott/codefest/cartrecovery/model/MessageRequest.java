package com.marriott.codefest.cartrecovery.model;

import java.util.List;

/** Request body for a free-text chat turn. */
public record MessageRequest(List<ChatMessage> history, String message) {
}

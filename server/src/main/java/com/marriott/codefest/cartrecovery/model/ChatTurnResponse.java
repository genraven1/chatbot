package com.marriott.codefest.cartrecovery.model;

import java.util.List;

/**
 * The chatbot's response for one turn.
 *
 * @param stage         CONFIRM_CONCERN, OFFER, OPEN_CHAT, RECOVERED or LOST
 * @param offer         present only when {@code stage == OFFER}
 * @param step          which concern prompt this is (1-based); 0 when not applicable
 * @param totalConcerns how many concern prompts exist in total
 */
public record ChatTurnResponse(String aiMessage,
                               ConcernType detectedConcern,
                               String concernLabel,
                               String signalReason,
                               List<String> quickReplies,
                               String stage,
                               Offer offer,
                               int step,
                               int totalConcerns) {
}

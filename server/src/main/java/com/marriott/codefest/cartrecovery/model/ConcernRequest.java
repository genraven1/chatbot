package com.marriott.codefest.cartrecovery.model;

/**
 * Request body for the guest's yes/no answer to a concern prompt.
 *
 * @param concern the {@link ConcernType} name of the prompt that was just shown
 * @param agreed  true if the guest confirmed that concern
 */
public record ConcernRequest(String concern, boolean agreed) {
}

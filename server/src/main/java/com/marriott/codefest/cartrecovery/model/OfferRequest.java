package com.marriott.codefest.cartrecovery.model;

/**
 * Request body for the guest's accept/decline answer to the recovery offer.
 *
 * @param concern  the {@link ConcernType} the offer addresses (so revenue is
 *                 attributed to the concern the guest actually confirmed)
 * @param accepted true if the guest accepted the offer
 */
public record OfferRequest(String concern, boolean accepted) {
}

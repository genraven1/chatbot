package com.marriott.codefest.cartrecovery.model;

/**
 * A recovery offer presented once the guest confirms their concern.
 * Every offer is {@code marginSafe} — value-adds, never price discounts —
 * so a recovered booking protects RevPAR and EBITDA.
 *
 * @param recoverableRevenue the cart total this offer stands to recover
 */
public record Offer(ConcernType concern,
                    String headline,
                    String detail,
                    String valueAdd,
                    boolean marginSafe,
                    double recoverableRevenue) {
}

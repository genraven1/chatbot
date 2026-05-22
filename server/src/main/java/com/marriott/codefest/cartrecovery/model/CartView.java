package com.marriott.codefest.cartrecovery.model;

/**
 * A cart enriched with its inferred concern and live timing, for the frontend.
 *
 * @param idleSeconds        seconds since the guest's last activity
 * @param nudgeAfterSeconds  idle threshold at which the popup arms
 * @param abandonAfterSeconds idle threshold at which the cart is lost
 */
public record CartView(Cart cart,
                       ConcernType detectedConcern,
                       String concernLabel,
                       String signalReason,
                       long idleSeconds,
                       int nudgeAfterSeconds,
                       int abandonAfterSeconds) {
}

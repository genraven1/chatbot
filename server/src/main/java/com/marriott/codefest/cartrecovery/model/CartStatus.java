package com.marriott.codefest.cartrecovery.model;

/**
 * Lifecycle of a booking cart.
 *
 * <pre>
 *   ACTIVE ──30s idle──▶ NUDGE_READY ──90s idle──▶ SAVED
 *      │                     │                       │
 *      │                     └─ guest engages ─▶ IN_CONVERSATION ─▶ RECOVERED (offer accepted)
 *      │                                                          └─▶ LOST     (offer declined)
 *      └─ guest finishes checkout ─▶ COMPLETED
 * </pre>
 *
 * <p>SAVED is not "lost": the cart is persisted on the Bonvoy account for up to
 * 30 days. When the member signs back in within that window the recovery popup
 * fires again, so the saved cart can still convert to a booking.
 */
public enum CartStatus {
    ACTIVE,
    NUDGE_READY,
    IN_CONVERSATION,
    RECOVERED,
    COMPLETED,
    SAVED,
    LOST
}

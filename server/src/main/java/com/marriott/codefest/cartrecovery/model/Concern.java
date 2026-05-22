package com.marriott.codefest.cartrecovery.model;

/**
 * Diagnosis produced by the ConcernEngine: the inferred concern plus a
 * human-readable explanation of the signals that led to it.
 */
public record Concern(ConcernType type, String signalReason) {
}

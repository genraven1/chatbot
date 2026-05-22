package com.marriott.codefest.cartrecovery.model;

import java.time.Instant;

public class Cart {

    public final String id;
    public final String guestName;
    public final String bonvoyId;
    public final String propertyName;
    public final String location;
    public final String roomType;
    public final String checkIn;
    public final String checkOut;
    public final int nights;
    public final double adrUsd;
    public final double totalUsd;
    public final String cancellationPolicy;
    public final double propertyReviewScore;
    public final double comparableReviewScore;
    public final double comparableAdrUsd;
    public final String channel;
    public final CartSignals signals;

    /** When the guest was last active. Idle time = now - lastActivityAt. */
    public Instant lastActivityAt = Instant.now();
    public CartStatus status = CartStatus.ACTIVE;
    /** True once the recovery popup has been shown for this cart (avoids double-counting). */
    public boolean nudgeShown = false;

    public Cart(String id, String guestName, String bonvoyId, String propertyName, String location,
                String roomType, String checkIn, String checkOut, int nights, double adrUsd,
                double totalUsd, String cancellationPolicy, double propertyReviewScore,
                double comparableReviewScore, double comparableAdrUsd, String channel,
                CartSignals signals) {
        this.id = id;
        this.guestName = guestName;
        this.bonvoyId = bonvoyId;
        this.propertyName = propertyName;
        this.location = location;
        this.roomType = roomType;
        this.checkIn = checkIn;
        this.checkOut = checkOut;
        this.nights = nights;
        this.adrUsd = adrUsd;
        this.totalUsd = totalUsd;
        this.cancellationPolicy = cancellationPolicy;
        this.propertyReviewScore = propertyReviewScore;
        this.comparableReviewScore = comparableReviewScore;
        this.comparableAdrUsd = comparableAdrUsd;
        this.channel = channel;
        this.signals = signals;
    }
}

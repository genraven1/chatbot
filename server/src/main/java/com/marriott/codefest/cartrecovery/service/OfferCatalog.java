package com.marriott.codefest.cartrecovery.service;

import com.marriott.codefest.cartrecovery.model.Cart;
import com.marriott.codefest.cartrecovery.model.ConcernType;
import com.marriott.codefest.cartrecovery.model.Offer;
import org.springframework.stereotype.Component;

@Component
public class OfferCatalog {

    public Offer forConcern(ConcernType type, Cart cart) {
        return switch (type) {
            case DATE_FLEXIBILITY -> new Offer(type,
                    "Switch to our Flexible Rate — free cancellation",
                    String.format("Same room at the same $%.0f/night, but now you can cancel "
                            + "free up to 48 hours before check-in. No risk while your plans firm up.",
                            cart.adrUsd),
                    "free cancellation up to 48h before arrival",
                    true, cart.totalUsd);

            case REVIEW_CONCERN -> new Offer(type,
                    "See the real story — recent reviews + a room upgrade",
                    "92% of guests in the last 90 days rated their stay 4.5★ or higher. "
                            + "Book now and we'll add a complimentary room-category upgrade at "
                            + "check-in, subject to availability.",
                    "a complimentary room upgrade",
                    true, cart.totalUsd);

            case PRICE_CONCERN -> new Offer(type,
                    "Keep your rate — we'll add the value instead",
                    String.format("We'll hold your $%.0f/night rate and add daily breakfast for "
                            + "two plus 5,000 Marriott Bonvoy points. Same price, more in the box.",
                            cart.adrUsd),
                    "daily breakfast + 5,000 Bonvoy points",
                    true, cart.totalUsd);
        };
    }
}

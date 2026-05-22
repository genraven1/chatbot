package com.marriott.codefest.cartrecovery.service;

import com.marriott.codefest.cartrecovery.model.Cart;
import com.marriott.codefest.cartrecovery.model.Concern;
import com.marriott.codefest.cartrecovery.model.ConcernType;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

/**
 * Diagnoses why a cart has not converted, using the behavioural signals already
 * captured in the Cart DB. Rule-based and deterministic so the conversion
 * metrics stay reliable; the LLM only handles conversational copy.
 *
 * <p>{@link #rank} returns all three concerns most-likely first — the chatbot
 * walks through them in that order until the guest confirms one.
 */
@Component
public class ConcernEngine {

    private record Scored(Concern concern, double score) {
    }

    /** The single most-likely concern. */
    public Concern detect(Cart c) {
        return rank(c).get(0);
    }

    /** All three concerns, ordered most-likely first. */
    public List<Concern> rank(Cart c) {
        List<Scored> scored = new ArrayList<>();
        scored.add(new Scored(dateConcern(c), dateScore(c)));
        scored.add(new Scored(reviewConcern(c), reviewScore(c)));
        scored.add(new Scored(priceConcern(c), priceScore(c)));
        scored.sort(Comparator.comparingDouble(Scored::score).reversed());
        return scored.stream().map(Scored::concern).toList();
    }

    // --- scoring ---------------------------------------------------------

    private double dateScore(Cart c) {
        return c.signals.dateSearchCount() * 2.0 + (isNonRefundable(c) ? 3 : 0);
    }

    private double reviewScore(Cart c) {
        return c.signals.reviewViewCount() * 2.0
                + (c.propertyReviewScore < c.comparableReviewScore ? 3 : 0);
    }

    private double priceScore(Cart c) {
        return c.signals.priceCompareCount() * 2.0 + (c.adrUsd > c.comparableAdrUsd ? 3 : 0);
    }

    // --- concern descriptions -------------------------------------------

    private Concern dateConcern(Cart c) {
        return new Concern(ConcernType.DATE_FLEXIBILITY, String.format(
                "Guest re-searched stay dates %d times and the selected rate is %s.",
                c.signals.dateSearchCount(), c.cancellationPolicy.toLowerCase()));
    }

    private Concern reviewConcern(Cart c) {
        return new Concern(ConcernType.REVIEW_CONCERN, String.format(
                "Guest opened the reviews tab %d times; this property rates %.1f/5 "
                        + "versus %.1f/5 for nearby comparables.",
                c.signals.reviewViewCount(), c.propertyReviewScore, c.comparableReviewScore));
    }

    private Concern priceConcern(Cart c) {
        return new Concern(ConcernType.PRICE_CONCERN, String.format(
                "Guest compared prices %d times; the $%.0f/night rate sits above "
                        + "the $%.0f area median.",
                c.signals.priceCompareCount(), c.adrUsd, c.comparableAdrUsd));
    }

    private boolean isNonRefundable(Cart c) {
        return c.cancellationPolicy != null
                && c.cancellationPolicy.toLowerCase().contains("non");
    }
}

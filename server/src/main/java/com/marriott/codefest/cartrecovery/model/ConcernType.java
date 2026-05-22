package com.marriott.codefest.cartrecovery.model;

/**
 * The hesitation a guest is most likely feeling, inferred from cart signals.
 * Each maps to one chatbot prompt and one non-discounting recovery offer.
 */
public enum ConcernType {

    DATE_FLEXIBILITY("Date flexibility"),
    REVIEW_CONCERN("Property reviews"),
    PRICE_CONCERN("Price");

    private final String label;

    ConcernType(String label) {
        this.label = label;
    }

    public String label() {
        return label;
    }
}

package com.marriott.codefest.cartrecovery.model;

/**
 * Behavioural signals captured while the guest was building the cart.
 * These drive the {@code ConcernEngine}'s diagnosis.
 *
 * @param dateSearchCount   times the guest re-searched stay dates
 * @param reviewViewCount   times the guest opened the reviews tab
 * @param priceCompareCount times the guest compared prices / rate plans
 * @param checkoutSecondsIdle seconds spent idle on the checkout page
 */
public record CartSignals(int dateSearchCount,
                          int reviewViewCount,
                          int priceCompareCount,
                          int checkoutSecondsIdle) {
}

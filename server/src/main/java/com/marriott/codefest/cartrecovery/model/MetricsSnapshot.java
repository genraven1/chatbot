package com.marriott.codefest.cartrecovery.model;

import java.util.List;

/**
 * Dashboard snapshot tying the demo to the business KPIs:
 * Net Rooms Growth, RevPAR, Digital Direct Share and EBITDA growth.
 *
 * @param savedCarts carts persisted for re-engagement within the 30-day window
 * @param aiLive     true when a real LiteLLM key is configured (vs. demo mode)
 */
public record MetricsSnapshot(int totalCarts,
                              int atRiskCarts,
                              int savedCarts,
                              int lostCarts,
                              int recoveredCarts,
                              int completedCarts,
                              double recoveryRate,
                              double recoveredRevenue,
                              int conversationsStarted,
                              boolean aiLive,
                              List<ConcernStat> concerns) {
}

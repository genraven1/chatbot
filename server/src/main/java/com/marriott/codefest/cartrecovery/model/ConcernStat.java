package com.marriott.codefest.cartrecovery.model;

/**
 * Per-concern conversion funnel — answers "which prompt earns the most yes's?".
 *
 * @param agreeRate fraction of shown prompts the guest agreed with (0..1)
 */
public record ConcernStat(String concern,
                          String label,
                          int promptsShown,
                          int agreed,
                          int declined,
                          double agreeRate,
                          int offersAccepted,
                          double recoveredRevenue) {
}

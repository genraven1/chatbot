package com.marriott.codefest.cartrecovery.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Cart lifecycle timing, bound from the {@code cart.*} keys.
 *
 * <ul>
 *   <li>{@code nudgeAfterSeconds} — idle time before the recovery chatbot popup arms.</li>
 *   <li>{@code abandonAfterSeconds} — idle time after which a cart is considered lost.</li>
 * </ul>
 */
@ConfigurationProperties("cart")
public record CartProperties(int nudgeAfterSeconds, int abandonAfterSeconds) {
}

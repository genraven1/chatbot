package com.marriott.codefest.cartrecovery.repository;

import com.marriott.codefest.cartrecovery.model.Cart;
import com.marriott.codefest.cartrecovery.model.CartSignals;
import com.marriott.codefest.cartrecovery.model.CartStatus;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Repository;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * In-memory stand-in for the production Cart DB. Holds one unfinished cart per
 * demo user; each cart's behavioural signals point clearly at one concern.
 *
 * <p>Idle time is measured from the guest's last activity. Signing in
 * {@link #touch(String)}es the cart so the 30s nudge countdown starts fresh.
 */
@Repository
public class CartRepository {

    private final Map<String, Cart> carts = new LinkedHashMap<>();

    public CartRepository() {
        reseed();
    }

    public synchronized List<Cart> findAll() {
        return new ArrayList<>(carts.values());
    }

    public synchronized Cart require(String id) {
        Cart c = carts.get(id);
        if (c == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Cart not found: " + id);
        }
        return c;
    }

    /** Resets a cart to ACTIVE with a fresh idle clock — a fresh sign-in visit. */
    public synchronized void touch(String id) {
        Cart c = require(id);
        c.lastActivityAt = Instant.now();
        c.status = CartStatus.ACTIVE;
        c.nudgeShown = false;
    }

    /**
     * A member signed back in to a SAVED cart within the 30-day window — arm the
     * recovery popup straight away rather than waiting out the idle countdown.
     */
    public synchronized void reactivateSaved(String id) {
        Cart c = require(id);
        c.lastActivityAt = Instant.now();
        c.status = CartStatus.NUDGE_READY;
        c.nudgeShown = false;
    }

    /** Rebuilds the seed carts. Used by the demo reset. */
    public synchronized void reseed() {
        carts.clear();
        Instant now = Instant.now();
        for (Cart c : buildSeedCarts()) {
            c.lastActivityAt = now;
            c.status = CartStatus.ACTIVE;
            c.nudgeShown = false;
            carts.put(c.id, c);
        }
    }

    /** Fast-forwards the demo clock for carts still ageing — skips the idle wait. */
    public synchronized void fastForward(int seconds) {
        for (Cart c : carts.values()) {
            if (c.status == CartStatus.ACTIVE || c.status == CartStatus.NUDGE_READY) {
                c.lastActivityAt = c.lastActivityAt.minusSeconds(seconds);
            }
        }
    }

    private List<Cart> buildSeedCarts() {
        List<Cart> list = new ArrayList<>();

        // Sarah Chen — date-flexibility concern: repeated date searches + non-refundable rate
        list.add(new Cart("cart-7741", "Sarah Chen", "BV-882104",
                "The Ritz-Carlton, Half Moon Bay", "Half Moon Bay, CA", "Ocean View King",
                "2026-07-18", "2026-07-22", 4, 695, 2780, "Non-refundable",
                4.7, 4.6, 660, "Brand.com Web",
                new CartSignals(6, 1, 1, 210)));

        // Marcus Johnson — review concern: many review-tab views, score below comparables
        list.add(new Cart("cart-7763", "Marcus Johnson", "BV-110473",
                "San Diego Marriott Marquis", "San Diego, CA", "City View Queen",
                "2026-08-01", "2026-08-04", 3, 289, 867, "Refundable",
                4.1, 4.6, 300, "Brand.com Web",
                new CartSignals(1, 7, 2, 300)));

        // Elena Rodriguez — price concern: many price comparisons, rate above area median
        list.add(new Cart("cart-7785", "Elena Rodriguez", "BV-998132",
                "The Westin Chicago River North", "Chicago, IL", "Premium River View",
                "2026-07-09", "2026-07-13", 4, 372, 1488, "Refundable",
                4.5, 4.5, 300, "Brand.com Web",
                new CartSignals(2, 1, 8, 420)));

        return list;
    }
}

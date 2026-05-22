package com.marriott.codefest.cartrecovery.service;

import com.marriott.codefest.cartrecovery.config.CartProperties;
import com.marriott.codefest.cartrecovery.model.Cart;
import com.marriott.codefest.cartrecovery.model.CartStatus;
import com.marriott.codefest.cartrecovery.repository.CartRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;

/**
 * Drives the cart lifecycle on a real clock. Every second it promotes ageing
 * carts: ACTIVE -> NUDGE_READY at the nudge threshold (popup arms), and
 * ACTIVE/NUDGE_READY -> SAVED at the timeout threshold. A SAVED cart is
 * persisted (not lost) and re-surfaces when the member signs back in.
 * Carts already in a conversation or a terminal state are left untouched.
 */
@Service
public class CartAgingService {

    private final CartRepository repo;
    private final CartProperties props;

    public CartAgingService(CartRepository repo, CartProperties props) {
        this.repo = repo;
        this.props = props;
    }

    @Scheduled(fixedRate = 1000)
    public void age() {
        Instant now = Instant.now();
        for (Cart c : repo.findAll()) {
            if (c.status != CartStatus.ACTIVE && c.status != CartStatus.NUDGE_READY) {
                continue;
            }
            long idle = Duration.between(c.lastActivityAt, now).getSeconds();
            if (idle >= props.abandonAfterSeconds()) {
                c.status = CartStatus.SAVED;
            } else if (idle >= props.nudgeAfterSeconds() && c.status == CartStatus.ACTIVE) {
                c.status = CartStatus.NUDGE_READY;
            }
        }
    }
}

package com.marriott.codefest.cartrecovery.service;

import com.marriott.codefest.cartrecovery.config.CartProperties;
import com.marriott.codefest.cartrecovery.model.Cart;
import com.marriott.codefest.cartrecovery.model.CartView;
import com.marriott.codefest.cartrecovery.model.Concern;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;

/** Builds the {@link CartView} DTO — a cart enriched with its concern and live timing. */
@Component
public class CartViewMapper {

    private final ConcernEngine concernEngine;
    private final CartProperties cartProps;

    public CartViewMapper(ConcernEngine concernEngine, CartProperties cartProps) {
        this.concernEngine = concernEngine;
        this.cartProps = cartProps;
    }

    public CartView toView(Cart c) {
        Concern concern = concernEngine.detect(c);
        long idle = Duration.between(c.lastActivityAt, Instant.now()).getSeconds();
        return new CartView(c, concern.type(), concern.type().label(), concern.signalReason(),
                Math.max(0, idle), cartProps.nudgeAfterSeconds(), cartProps.abandonAfterSeconds());
    }
}

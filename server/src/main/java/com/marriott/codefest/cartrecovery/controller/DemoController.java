package com.marriott.codefest.cartrecovery.controller;

import com.marriott.codefest.cartrecovery.repository.CartRepository;
import com.marriott.codefest.cartrecovery.service.MetricsService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/** Demo-control endpoints: reset the scenario and fast-forward the cart clock. */
@RestController
@RequestMapping("/api/demo")
public class DemoController {

    private final CartRepository repo;
    private final MetricsService metrics;

    public DemoController(CartRepository repo, MetricsService metrics) {
        this.repo = repo;
        this.metrics = metrics;
    }

    /** Re-seeds the carts and clears all metrics. */
    @PostMapping("/reset")
    public Map<String, String> reset() {
        repo.reseed();
        metrics.reset();
        return Map.of("status", "reset");
    }

    /** Ages every still-active cart by {@code seconds} (default 10) to speed up the demo. */
    @PostMapping("/fast-forward")
    public Map<String, Object> fastForward(@RequestParam(defaultValue = "10") int seconds) {
        repo.fastForward(seconds);
        return Map.of("status", "fast-forwarded", "seconds", seconds);
    }
}

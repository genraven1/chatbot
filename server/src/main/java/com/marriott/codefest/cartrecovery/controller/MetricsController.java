package com.marriott.codefest.cartrecovery.controller;

import com.marriott.codefest.cartrecovery.model.MetricsSnapshot;
import com.marriott.codefest.cartrecovery.service.MetricsService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Exposes the KPI dashboard snapshot. */
@RestController
@RequestMapping("/api/metrics")
public class MetricsController {

    private final MetricsService metrics;

    public MetricsController(MetricsService metrics) {
        this.metrics = metrics;
    }

    @GetMapping
    public MetricsSnapshot snapshot() {
        return metrics.snapshot();
    }
}

package com.marriott.codefest.cartrecovery.service;

import com.marriott.codefest.cartrecovery.model.Cart;
import com.marriott.codefest.cartrecovery.model.CartStatus;
import com.marriott.codefest.cartrecovery.model.ConcernStat;
import com.marriott.codefest.cartrecovery.model.ConcernType;
import com.marriott.codefest.cartrecovery.model.MetricsSnapshot;
import com.marriott.codefest.cartrecovery.repository.CartRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;

/**
 * Tracks the recovery funnel per concern — "which prompt earns the most yes's" —
 * and rolls it up into a KPI snapshot for the analytics dashboard.
 */
@Service
public class MetricsService {

    /** Mutable per-concern counters. */
    private static final class Counters {
        int promptsShown;
        int agreed;
        int declined;
        int offersAccepted;
        double recoveredRevenue;
    }

    private final CartRepository repo;
    private final LiteLlmClient llm;
    private final Map<ConcernType, Counters> stats = new EnumMap<>(ConcernType.class);
    private int conversationsStarted;

    public MetricsService(CartRepository repo, LiteLlmClient llm) {
        this.repo = repo;
        this.llm = llm;
        reset();
    }

    public synchronized void reset() {
        for (ConcernType t : ConcernType.values()) {
            stats.put(t, new Counters());
        }
        conversationsStarted = 0;
    }

    public synchronized void recordConversationStarted() {
        conversationsStarted++;
    }

    public synchronized void recordPromptShown(ConcernType t) {
        stats.get(t).promptsShown++;
    }

    public synchronized void recordAgreed(ConcernType t) {
        stats.get(t).agreed++;
    }

    public synchronized void recordDeclined(ConcernType t) {
        stats.get(t).declined++;
    }

    public synchronized void recordOfferAccepted(ConcernType t, double revenue) {
        Counters c = stats.get(t);
        c.offersAccepted++;
        c.recoveredRevenue += revenue;
    }

    public synchronized MetricsSnapshot snapshot() {
        List<Cart> all = repo.findAll();
        int atRisk = countStatus(all, CartStatus.ACTIVE) + countStatus(all, CartStatus.NUDGE_READY);
        int saved = countStatus(all, CartStatus.SAVED);
        int lost = countStatus(all, CartStatus.LOST);
        int recovered = countStatus(all, CartStatus.RECOVERED);
        int completed = countStatus(all, CartStatus.COMPLETED);

        List<ConcernStat> concerns = new ArrayList<>();
        double recoveredRevenue = 0;
        for (ConcernType t : ConcernType.values()) {
            Counters c = stats.get(t);
            double agreeRate = c.promptsShown == 0 ? 0.0 : (double) c.agreed / c.promptsShown;
            concerns.add(new ConcernStat(t.name(), t.label(), c.promptsShown, c.agreed,
                    c.declined, agreeRate, c.offersAccepted, c.recoveredRevenue));
            recoveredRevenue += c.recoveredRevenue;
        }
        double recoveryRate = all.isEmpty() ? 0.0 : (double) recovered / all.size();

        return new MetricsSnapshot(all.size(), atRisk, saved, lost, recovered, completed,
                recoveryRate, recoveredRevenue, conversationsStarted, llm.isConfigured(), concerns);
    }

    private int countStatus(List<Cart> carts, CartStatus status) {
        return (int) carts.stream().filter(c -> c.status == status).count();
    }
}

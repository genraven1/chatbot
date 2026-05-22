package com.marriott.codefest.cartrecovery.repository;

import com.marriott.codefest.cartrecovery.model.DemoUser;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Repository;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * The three demo Marriott Bonvoy members. Each owns one cart, and each cart's
 * signals point at a different concern so the demo covers all three paths.
 */
@Repository
public class UserRepository {

    private final Map<String, DemoUser> users = new LinkedHashMap<>();

    public UserRepository() {
        // Sarah — date-flexibility concern (cart-7741)
        add(new DemoUser("BV-882104", "Sarah", "Chen", "Gold Elite",
                "sarah.chen@example.com", "cart-7741"));
        // Marcus — review concern (cart-7763)
        add(new DemoUser("BV-110473", "Marcus", "Johnson", "Silver Elite",
                "marcus.johnson@example.com", "cart-7763"));
        // Elena — price concern (cart-7785)
        add(new DemoUser("BV-998132", "Elena", "Rodriguez", "Platinum Elite",
                "elena.rodriguez@example.com", "cart-7785"));
    }

    public List<DemoUser> findAll() {
        return new ArrayList<>(users.values());
    }

    public DemoUser require(String bonvoyId) {
        DemoUser u = users.get(bonvoyId);
        if (u == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "No Bonvoy account: " + bonvoyId);
        }
        return u;
    }

    private void add(DemoUser u) {
        users.put(u.bonvoyId, u);
    }
}

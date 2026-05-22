package com.marriott.codefest.cartrecovery.model;

/**
 * A demo Marriott Bonvoy member. Each user owns exactly one cart; signing in
 * shows only that member's cart.
 */
public class DemoUser {

    public final String bonvoyId;
    public final String firstName;
    public final String lastName;
    public final String tier;
    public final String email;
    public final String cartId;

    public DemoUser(String bonvoyId, String firstName, String lastName,
                    String tier, String email, String cartId) {
        this.bonvoyId = bonvoyId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.tier = tier;
        this.email = email;
        this.cartId = cartId;
    }

    public String getFullName() {
        return firstName + " " + lastName;
    }
}

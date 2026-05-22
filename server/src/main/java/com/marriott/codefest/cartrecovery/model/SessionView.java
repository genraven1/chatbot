package com.marriott.codefest.cartrecovery.model;

/** The signed-in member plus their single cart. */
public record SessionView(DemoUser user, CartView cart) {
}

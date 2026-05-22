package com.marriott.codefest.cartrecovery.controller;

import com.marriott.codefest.cartrecovery.model.Cart;
import com.marriott.codefest.cartrecovery.model.DemoUser;
import com.marriott.codefest.cartrecovery.model.LoginRequest;
import com.marriott.codefest.cartrecovery.model.SessionView;
import com.marriott.codefest.cartrecovery.repository.CartRepository;
import com.marriott.codefest.cartrecovery.repository.UserRepository;
import com.marriott.codefest.cartrecovery.service.CartViewMapper;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Demo Bonvoy sign-in: lists the demo members and starts a session. */
@RestController
@RequestMapping("/api")
public class AuthController {

    private final UserRepository users;
    private final CartRepository carts;
    private final CartViewMapper mapper;

    public AuthController(UserRepository users, CartRepository carts, CartViewMapper mapper) {
        this.users = users;
        this.carts = carts;
        this.mapper = mapper;
    }

    /** The three demo Bonvoy members shown on the sign-in screen. */
    @GetMapping("/users")
    public List<DemoUser> users() {
        return users.findAll();
    }

    /**
     * Signs in. A SAVED cart (member returning within the 30-day window) arms the
     * recovery popup immediately; an already-converted cart is left as-is;
     * otherwise the cart starts a fresh idle countdown.
     */
    @PostMapping("/login")
    public SessionView login(@RequestBody LoginRequest req) {
        DemoUser user = users.require(req.bonvoyId());
        Cart cart = carts.require(user.cartId);
        switch (cart.status) {
            case SAVED -> carts.reactivateSaved(user.cartId);
            case RECOVERED, COMPLETED, LOST -> { /* keep the converted outcome */ }
            default -> carts.touch(user.cartId);
        }
        return new SessionView(user, mapper.toView(carts.require(user.cartId)));
    }
}

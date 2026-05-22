package com.marriott.codefest.cartrecovery.controller;

import com.marriott.codefest.cartrecovery.model.Cart;
import com.marriott.codefest.cartrecovery.model.CartStatus;
import com.marriott.codefest.cartrecovery.model.CartView;
import com.marriott.codefest.cartrecovery.repository.CartRepository;
import com.marriott.codefest.cartrecovery.service.CartViewMapper;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Read API for a cart, plus the "complete booking" action. */
@RestController
@RequestMapping("/api/carts")
public class CartController {

    private final CartRepository repo;
    private final CartViewMapper mapper;

    public CartController(CartRepository repo, CartViewMapper mapper) {
        this.repo = repo;
        this.mapper = mapper;
    }

    @GetMapping("/{id}")
    public CartView one(@PathVariable String id) {
        return mapper.toView(repo.require(id));
    }

    /** Guest finished checkout from the cart page (not via the recovery chatbot). */
    @PostMapping("/{id}/complete")
    public CartView complete(@PathVariable String id) {
        Cart c = repo.require(id);
        if (c.status != CartStatus.RECOVERED && c.status != CartStatus.LOST) {
            c.status = CartStatus.COMPLETED;
        }
        return mapper.toView(c);
    }
}

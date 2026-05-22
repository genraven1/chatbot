package com.marriott.codefest.cartrecovery.controller;

import com.marriott.codefest.cartrecovery.model.ChatTurnResponse;
import com.marriott.codefest.cartrecovery.model.ConcernRequest;
import com.marriott.codefest.cartrecovery.model.MessageRequest;
import com.marriott.codefest.cartrecovery.model.OfferRequest;
import com.marriott.codefest.cartrecovery.service.ChatService;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Drives one recovery conversation per cart. */
@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chat;

    public ChatController(ChatService chat) {
        this.chat = chat;
    }

    /** Popup fired — greet the guest and probe the first concern. */
    @PostMapping("/{cartId}/open")
    public ChatTurnResponse open(@PathVariable String cartId) {
        return chat.open(cartId);
    }

    /** Guest's yes/no answer to the concern prompt that was shown. */
    @PostMapping("/{cartId}/concern")
    public ChatTurnResponse concern(@PathVariable String cartId, @RequestBody ConcernRequest req) {
        return chat.concern(cartId, req.concern(), req.agreed());
    }

    /** Guest's accept/decline answer to the recovery offer. */
    @PostMapping("/{cartId}/offer")
    public ChatTurnResponse offer(@PathVariable String cartId, @RequestBody OfferRequest req) {
        return chat.offer(cartId, req.concern(), req.accepted());
    }

    /** Free-text turn. */
    @PostMapping("/{cartId}/message")
    public ChatTurnResponse message(@PathVariable String cartId, @RequestBody MessageRequest req) {
        return chat.message(cartId, req);
    }
}

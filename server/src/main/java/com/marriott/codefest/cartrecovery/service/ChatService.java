package com.marriott.codefest.cartrecovery.service;

import com.marriott.codefest.cartrecovery.model.Cart;
import com.marriott.codefest.cartrecovery.model.CartStatus;
import com.marriott.codefest.cartrecovery.model.ChatMessage;
import com.marriott.codefest.cartrecovery.model.ChatTurnResponse;
import com.marriott.codefest.cartrecovery.model.Concern;
import com.marriott.codefest.cartrecovery.model.ConcernType;
import com.marriott.codefest.cartrecovery.model.MessageRequest;
import com.marriott.codefest.cartrecovery.model.Offer;
import com.marriott.codefest.cartrecovery.repository.CartRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Orchestrates the recovery conversation. The chatbot walks the guest through
 * the three concern prompts one at a time (most-likely first); each "no" moves
 * to the next prompt, and after all three a free-text turn lets the guest
 * describe the concern themselves. A "yes" jumps straight to a margin-safe offer.
 *
 * <p>The popup merely showing does not count as engagement — the cart can still
 * age to SAVED until the guest actually answers a prompt. A SAVED cart is
 * persisted and the popup fires again when the member next signs in.
 *
 * <p>The LLM (via LiteLLM) writes the conversational copy; concern ranking,
 * offer selection and metrics stay deterministic so the funnel is trustworthy.
 */
@Service
public class ChatService {

    private static final int TOTAL_CONCERNS = 3;

    private final CartRepository repo;
    private final ConcernEngine concernEngine;
    private final OfferCatalog offers;
    private final LiteLlmClient llm;
    private final MetricsService metrics;

    public ChatService(CartRepository repo, ConcernEngine concernEngine, OfferCatalog offers,
                       LiteLlmClient llm, MetricsService metrics) {
        this.repo = repo;
        this.concernEngine = concernEngine;
        this.offers = offers;
        this.llm = llm;
        this.metrics = metrics;
    }

    /** Popup fired: greet the guest and probe the first concern. */
    public ChatTurnResponse open(String cartId) {
        Cart cart = repo.require(cartId);
        markConversationStarted(cart);
        return greetFirstConcern(cart);
    }

    /** Guest answered a concern prompt yes/no. */
    public ChatTurnResponse concern(String cartId, String concernName, boolean agreed) {
        Cart cart = repo.require(cartId);
        engage(cart);
        List<Concern> rank = concernEngine.rank(cart);
        ConcernType asked = ConcernType.valueOf(concernName);
        int idx = indexOf(rank, asked);

        if (agreed) {
            metrics.recordAgreed(asked);
            Offer offer = offers.forConcern(asked, cart);
            String ai = llm.complete(offerSystemPrompt(cart, rank.get(idx), offer),
                    seed("Yes, that's my concern. What can you do?"));
            if (ai == null) {
                ai = fallbackOfferMessage(offer);
            }
            return turn(ai, rank.get(idx),
                    List.of("Complete my booking", "Maybe later"), "OFFER", offer, idx + 1);
        }

        metrics.recordDeclined(asked);

        if (idx + 1 < rank.size()) {
            // Move on to the next-most-likely concern prompt.
            Concern next = rank.get(idx + 1);
            metrics.recordPromptShown(next.type());
            String ai = llm.complete(followUpSystemPrompt(cart, next),
                    seed("No, that's not what's holding me back."));
            if (ai == null) {
                ai = fallbackFollowUp(next);
            }
            return turn(ai, next, List.of("Yes, that's it", "No"), "CONFIRM_CONCERN", null, idx + 2);
        }

        // All three prompts declined — hand over to free text.
        String ai = llm.complete(openQuestionSystemPrompt(cart),
                seed("None of those are quite it."));
        if (ai == null) {
            ai = "No problem at all — could you tell me in your own words what's making "
                    + "you pause on this booking?";
        }
        return turn(ai, rank.get(idx), List.of(), "OPEN_CHAT", null, TOTAL_CONCERNS + 1);
    }

    /** Guest accepted or declined the recovery offer — terminal turn. */
    public ChatTurnResponse offer(String cartId, String concernName, boolean accepted) {
        Cart cart = repo.require(cartId);
        List<Concern> rank = concernEngine.rank(cart);
        ConcernType type = concernName == null || concernName.isBlank()
                ? rank.get(0).type() : ConcernType.valueOf(concernName);
        Concern concern = rank.get(indexOf(rank, type));
        Offer offer = offers.forConcern(type, cart);

        if (accepted) {
            cart.status = CartStatus.RECOVERED;
            metrics.recordOfferAccepted(type, cart.totalUsd);
            return turn("Wonderful — your stay at " + cart.propertyName + " is confirmed, with "
                            + offer.valueAdd() + " added. A confirmation email is on its way. "
                            + "Thanks for booking direct!",
                    concern, List.of(), "RECOVERED", offer, 0);
        }

        cart.status = CartStatus.LOST;
        return turn("Totally understand. I'll keep your cart saved on your Bonvoy account "
                        + "for 30 days — sign in any time and we'll pick up right here.",
                concern, List.of(), "LOST", offer, 0);
    }

    /** Free-text turn — used after the guest declined all three concern prompts. */
    public ChatTurnResponse message(String cartId, MessageRequest req) {
        Cart cart = repo.require(cartId);
        engage(cart);
        Concern top = concernEngine.rank(cart).get(0);

        List<ChatMessage> history = new ArrayList<>();
        if (req.history() != null) {
            history.addAll(req.history());
        }
        history.add(new ChatMessage("user", req.message()));

        String ai = llm.complete(openQuestionSystemPrompt(cart), history);
        if (ai == null) {
            ai = "Thanks for sharing that. Booking direct always gets you our best available "
                    + "rate and flexible support — can I help you get this stay confirmed today?";
        }
        return turn(ai, top, List.of(), "OPEN_CHAT", null, TOTAL_CONCERNS + 1);
    }

    // --- conversation steps ---------------------------------------------

    private ChatTurnResponse greetFirstConcern(Cart cart) {
        Concern first = concernEngine.rank(cart).get(0);
        metrics.recordPromptShown(first.type());
        String ai = llm.complete(greetingSystemPrompt(cart, first),
                seed("I'm the guest who left this booking unfinished. Start the conversation."));
        if (ai == null) {
            ai = fallbackGreeting(cart, first);
        }
        return turn(ai, first, List.of("Yes, that's it", "No"), "CONFIRM_CONCERN", null, 1);
    }

    // --- helpers ---------------------------------------------------------

    private void markConversationStarted(Cart cart) {
        if (!cart.nudgeShown) {
            metrics.recordConversationStarted();
            cart.nudgeShown = true;
        }
    }

    /** The guest interacted, so freeze the idle clock. */
    private void engage(Cart cart) {
        if (cart.status != CartStatus.RECOVERED
                && cart.status != CartStatus.LOST
                && cart.status != CartStatus.COMPLETED) {
            cart.status = CartStatus.IN_CONVERSATION;
        }
    }

    private int indexOf(List<Concern> rank, ConcernType type) {
        for (int i = 0; i < rank.size(); i++) {
            if (rank.get(i).type() == type) {
                return i;
            }
        }
        return 0;
    }

    private List<ChatMessage> seed(String userText) {
        return List.of(new ChatMessage("user", userText));
    }

    private ChatTurnResponse turn(String ai, Concern concern, List<String> quickReplies,
                                  String stage, Offer offer, int step) {
        return new ChatTurnResponse(ai, concern.type(), concern.type().label(),
                concern.signalReason(), quickReplies, stage, offer, step, TOTAL_CONCERNS);
    }

    // --- prompt builders -------------------------------------------------

    private String cartSummary(Cart c) {
        return String.format(
                "Guest: %s (Bonvoy %s). Property: %s, %s. Room: %s. Stay: %s to %s (%d nights). "
                        + "Rate: $%.0f/night, total $%.0f, %s. Property review score %.1f/5. "
                        + "Booking channel: %s.",
                c.guestName, c.bonvoyId, c.propertyName, c.location, c.roomType, c.checkIn,
                c.checkOut, c.nights, c.adrUsd, c.totalUsd, c.cancellationPolicy,
                c.propertyReviewScore, c.channel);
    }

    private String greetingSystemPrompt(Cart c, Concern concern) {
        return """
                You are Aria, a warm and concise booking assistant on Marriott's direct booking website.
                A Bonvoy member has a saved reservation they did not finish. Internal cart-signal
                analysis suggests their main hesitation is: %s. Reason: %s

                Write a short opening message (2-3 sentences, no bullet points):
                - Greet the member by first name and gently note their trip is still saved.
                - Name the likely concern in a friendly, non-pushy way.
                - Ask ONE simple yes/no question to confirm whether that is their concern.
                Never reveal that you tracked their browsing. Never offer discounts.
                Never invent facts about the property. Plain text only.

                Cart details: %s
                """.formatted(concern.type().label(), concern.signalReason(), cartSummary(c));
    }

    private String followUpSystemPrompt(Cart c, Concern concern) {
        return """
                You are Aria, a warm, concise booking assistant on Marriott's direct booking website.
                The guest said your previous guess about their hesitation was wrong. Your next best
                guess is: %s. Reason: %s

                Write a short message (1-2 sentences): briefly acknowledge the previous guess was
                off, then gently ask ONE simple yes/no question to check if THIS is their concern.
                Never reveal that you tracked their browsing. Never offer discounts.
                Never invent property facts. Plain text only.

                Cart details: %s
                """.formatted(concern.type().label(), concern.signalReason(), cartSummary(c));
    }

    private String offerSystemPrompt(Cart c, Concern concern, Offer offer) {
        return """
                You are Aria, a warm booking assistant on Marriott's direct booking website.
                The guest confirmed their hesitation is about: %s.
                Present this offer in 2-3 short sentences, enthusiastic but not pushy:
                Headline: %s
                Details: %s
                Rules: emphasize that their room, property and nightly price do not change.
                This offer ADDS value, it is NOT a discount. Do not invent extra perks.
                End by inviting them to complete the booking. Plain text only.

                Cart details: %s
                """.formatted(concern.type().label(), offer.headline(), offer.detail(),
                cartSummary(c));
    }

    private String openQuestionSystemPrompt(Cart c) {
        return """
                You are Aria, a warm, concise booking assistant on Marriott's direct booking website.
                The guest left a reservation unfinished and none of the suspected concerns were right.
                Help uncover what is really holding them back and reassure them. Keep replies to
                2-3 sentences. Never offer discounts. Never invent property facts. Encourage them
                to complete the booking direct (best available rate, flexible support). Plain text only.

                Cart details: %s
                """.formatted(cartSummary(c));
    }

    // --- offline fallbacks ----------------------------------------------

    private String concernQuestion(ConcernType type) {
        return switch (type) {
            case DATE_FLEXIBILITY -> "Are you still weighing up your travel dates?";
            case REVIEW_CONCERN -> "Were you hoping to learn a little more about what other guests thought?";
            case PRICE_CONCERN -> "Were you hoping to find a bit more value for the price?";
        };
    }

    private String fallbackGreeting(Cart c, Concern concern) {
        return "Hi " + firstName(c) + " — your trip to " + c.propertyName
                + " is still saved. " + concernQuestion(concern.type());
    }

    private String fallbackFollowUp(Concern concern) {
        return "Thanks for letting me know. " + concernQuestion(concern.type());
    }

    private String fallbackOfferMessage(Offer offer) {
        return offer.headline() + ". " + offer.detail() + " Shall I lock this in for you?";
    }

    private String firstName(Cart c) {
        return c.guestName == null ? "there" : c.guestName.split(" ")[0];
    }
}

"use strict";

// --- helpers ------------------------------------------------------------
const $ = (s) => document.querySelector(s);
const api = async (p, o = {}) => {
    const r = await fetch(p, o);
    if (!r.ok) throw new Error(await r.text());
    return r.status === 204 ? null : r.json();
};
const jpost = (body) => ({
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
});
const money = (n) => "$" + Math.round(n).toLocaleString();
const mmss = (s) => {
    s = Math.max(0, Math.round(s));
    return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
};

// --- session state ------------------------------------------------------
const S = {
    user: null,
    cartId: null,
    poll: null,
    chat: { open: false, stage: null, asked: null, history: [] },
};

function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toast._t);
    toast._t = setTimeout(() => (t.hidden = true), 3600);
}

function show(screen) {
    ["login", "app", "analytics"].forEach((n) => {
        $("#" + n + "Screen").hidden = n !== screen;
    });
}

// ============ SIGN-IN ============
async function loadUsers() {
    const users = await api("/api/users");
    const box = $("#userList");
    box.innerHTML = "";
    users.forEach((u) => {
        const card = document.createElement("button");
        card.className = "user-card";
        card.innerHTML = `
            <span class="avatar">${u.firstName[0]}${u.lastName[0]}</span>
            <span class="user-info">
                <span class="user-name">${u.firstName} ${u.lastName}</span>
                <span class="user-tier">Marriott Bonvoy &middot; ${u.tier}</span>
                <span class="user-id">Member #${u.bonvoyId}</span>
            </span>
            <span class="signin-arrow">&rarr;</span>`;
        card.onclick = () => login(u.bonvoyId);
        box.appendChild(card);
    });
}

async function login(bonvoyId) {
    const sess = await api("/api/login", jpost({ bonvoyId }));
    S.user = sess.user;
    S.cartId = sess.cart.cart.id;
    S.chat = { open: false, stage: null, asked: null, history: [] };
    $("#chatWidget").hidden = true;
    $("#chatLauncher").hidden = true;
    $("#navMember").textContent = sess.user.firstName + " " + sess.user.lastName;
    renderCart(sess.cart);
    show("app");
    startPolling();
}

function signOut() {
    stopPolling();
    S.user = null;
    S.cartId = null;
    S.chat = { open: false, stage: null, asked: null, history: [] };
    $("#chatWidget").hidden = true;
    $("#chatLauncher").hidden = true;
    $("#chatLog").innerHTML = "";
    show("login");
}

// ============ CART PAGE ============
function renderCart(v) {
    const c = v.cart;
    $("#hotelBanner").textContent = c.propertyName;
    $("#hotelName").textContent = c.propertyName;
    $("#hotelLoc").textContent = c.location;
    $("#hotelRating").textContent = "★ " + c.propertyReviewScore.toFixed(1) + " / 5 guest rating";
    $("#stayDates").textContent = c.checkIn + "  →  " + c.checkOut;
    $("#stayNights").textContent = c.nights + " nights";
    $("#stayRoom").textContent = c.roomType;
    $("#stayGuest").textContent = S.user.firstName + " " + S.user.lastName + " · " + S.user.tier;
    $("#stayPolicy").textContent = c.cancellationPolicy;
    $("#priceLine").textContent = money(c.adrUsd) + " × " + c.nights + " nights";
    $("#priceRoom").textContent = money(c.totalUsd);
    $("#priceTotal").textContent = money(c.totalUsd);
    updateStatus(v);
}

function updateStatus(v) {
    const status = v.cart.status;
    const chip = $("#idleChip");
    const terminal = status === "RECOVERED" || status === "COMPLETED" || status === "SAVED";

    // Cart card: confirmation overlay only for terminal states, otherwise the
    // live cart. The else-branch clears any stale overlay from a previous user.
    if (terminal) {
        showOutcome(status === "SAVED" ? "saved" : "ok");
    } else {
        $("#cartConfirm").hidden = true;
        $("#cartActive").hidden = false;
    }

    // Idle chip.
    if (status === "ACTIVE") {
        chip.hidden = false;
        chip.className = "idle-chip";
        chip.textContent = "Idle " + mmss(v.idleSeconds) + " · assistant in "
            + mmss(v.nudgeAfterSeconds - v.idleSeconds);
    } else if (status === "NUDGE_READY" || status === "IN_CONVERSATION") {
        chip.hidden = false;
        chip.className = "idle-chip active";
        chip.textContent = "Booking assistant active";
    } else {
        chip.hidden = true;
    }

    // Auto-fire the chatbot popup once the cart hits the idle threshold.
    if (status === "NUDGE_READY" && !S.chat.open) {
        openChat();
    }
}

function showOutcome(kind) {
    $("#cartActive").hidden = true;
    const box = $("#cartConfirm");
    box.hidden = false;
    if (kind === "ok") {
        box.className = "cart-confirm ok";
        box.innerHTML = `<div class="confirm-icon">&#10003;</div>
            <h3>Booking confirmed</h3>
            <p>Your stay is reserved. A confirmation email is on its way.</p>`;
    } else {
        box.className = "cart-confirm saved";
        box.innerHTML = `<div class="confirm-icon">&#128190;</div>
            <h3>Your trip is saved</h3>
            <p>We'll hold this cart on your Marriott Bonvoy account for 30 days.
            Sign in again any time and Aria will help you finish.</p>
            <button id="savedSignOut" class="primary-btn">Sign out</button>`;
        $("#savedSignOut").onclick = signOut;
    }
}

// ============ POLLING ============
function startPolling() {
    stopPolling();
    S.poll = setInterval(refreshCart, 1000);
}
function stopPolling() {
    if (S.poll) {
        clearInterval(S.poll);
        S.poll = null;
    }
}
async function refreshCart() {
    if (!S.cartId) return;
    try {
        const v = await api("/api/carts/" + S.cartId);
        renderCart(v);
        const s = v.cart.status;
        if (s === "RECOVERED" || s === "COMPLETED" || s === "SAVED") stopPolling();
    } catch (e) {
        console.error("refresh failed", e);
    }
}

// ============ CHATBOT ============
function openChat() {
    if (S.chat.open) return;
    S.chat.open = true;
    const w = $("#chatWidget");
    w.hidden = false;
    w.classList.add("popin");
    $("#chatLauncher").hidden = true;
    $("#chatLog").innerHTML = "";
    toast("💬 Aria can help you finish your booking");
    api("/api/chat/" + S.cartId + "/open", { method: "POST" })
        .then(handleResp)
        .catch((e) => console.error(e));
}

function minimizeChat() {
    $("#chatWidget").hidden = true;
    $("#chatLauncher").hidden = false;
}
function restoreChat() {
    $("#chatWidget").hidden = false;
    $("#chatLauncher").hidden = true;
}

function addBubble(role, text) {
    const b = document.createElement("div");
    b.className = "bubble " + role;
    b.textContent = text;
    $("#chatLog").appendChild(b);
    $("#chatLog").scrollTop = $("#chatLog").scrollHeight;
}

function addOffer(offer) {
    const el = document.createElement("div");
    el.className = "offer-card";
    el.innerHTML = `
        <div class="offer-head">${offer.headline}</div>
        <div class="offer-detail">${offer.detail}</div>
        <div class="offer-safe">&#10003; Same room, same nightly rate &mdash; added value, not a discount.</div>`;
    $("#chatLog").appendChild(el);
    $("#chatLog").scrollTop = $("#chatLog").scrollHeight;
}

function setStep(step, total) {
    const badge = $("#stepBadge");
    if (step > 0 && step <= total) {
        badge.hidden = false;
        badge.textContent = "Concern check — question " + step + " of " + total;
    } else {
        badge.hidden = true;
    }
}

function renderQuick(labels) {
    const q = $("#chatQuick");
    q.innerHTML = "";
    (labels || []).forEach((label) => {
        const btn = document.createElement("button");
        btn.textContent = label;
        btn.onclick = () => quickAction(label);
        q.appendChild(btn);
    });
}

function setInput(enabled) {
    $("#chatInput").disabled = !enabled;
    $("#chatSend").disabled = !enabled;
}

function handleResp(r) {
    S.chat.stage = r.stage;
    if (r.stage === "CONFIRM_CONCERN" || r.stage === "OFFER") {
        S.chat.asked = r.detectedConcern;
    }
    if (r.stage === "CONFIRM_CONCERN") {
        setStep(r.step, r.totalConcerns);
    } else {
        setStep(0, 0);
    }
    addBubble("bot", r.aiMessage);
    S.chat.history.push({ role: "assistant", content: r.aiMessage });
    if (r.offer && r.stage === "OFFER") addOffer(r.offer);
    renderQuick(r.quickReplies);

    const terminal = r.stage === "RECOVERED" || r.stage === "LOST";
    setInput(r.stage === "OPEN_CHAT");
    if (terminal) {
        renderQuick([]);
        setInput(false);
        refreshCart();
    }
}

function quickAction(label) {
    if (S.chat.stage === "CONFIRM_CONCERN") {
        if (label === "Yes, that's it") return answerConcern(true);
        if (label === "No") return answerConcern(false);
    } else if (S.chat.stage === "OFFER") {
        if (label === "Complete my booking") return answerOffer(true);
        if (label === "Maybe later") return answerOffer(false);
    }
}

async function answerConcern(agreed) {
    addBubble("user", agreed ? "Yes, that's it" : "No");
    renderQuick([]);
    const r = await api("/api/chat/" + S.cartId + "/concern",
        jpost({ concern: S.chat.asked, agreed }));
    handleResp(r);
}

async function answerOffer(accepted) {
    addBubble("user", accepted ? "Complete my booking" : "Maybe later");
    renderQuick([]);
    const r = await api("/api/chat/" + S.cartId + "/offer",
        jpost({ concern: S.chat.asked, accepted }));
    handleResp(r);
}

async function sendFreeText(text) {
    text = (text || "").trim();
    if (!text || !S.cartId) return;
    addBubble("user", text);
    const r = await api("/api/chat/" + S.cartId + "/message",
        jpost({ history: S.chat.history, message: text }));
    S.chat.history.push({ role: "user", content: text });
    handleResp(r);
}

// ============ ANALYTICS ============
async function showAnalytics() {
    const m = await api("/api/metrics");
    $("#kpiAtRisk").textContent = m.atRiskCarts;
    $("#kpiConvos").textContent = m.conversationsStarted;
    $("#kpiRecovered").textContent = m.recoveredCarts;
    $("#kpiRevenue").textContent = money(m.recoveredRevenue);

    const badge = $("#aiBadge");
    badge.textContent = m.aiLive ? "AI: LiteLLM live" : "AI: demo mode";
    badge.className = "ai-badge " + (m.aiLive ? "live" : "demo");

    let bestIdx = -1, bestYes = 0;
    m.concerns.forEach((s, i) => {
        if (s.agreed > bestYes) { bestYes = s.agreed; bestIdx = i; }
    });

    const body = $("#metricsBody");
    body.innerHTML = "";
    m.concerns.forEach((s, i) => {
        const tr = document.createElement("tr");
        if (i === bestIdx) tr.className = "winner";
        tr.innerHTML = `
            <td><span class="concern-tag t-${s.concern}">${s.label}</span></td>
            <td>${s.promptsShown}</td>
            <td>${s.agreed}</td>
            <td>${(s.agreeRate * 100).toFixed(0)}%</td>
            <td>${s.offersAccepted}</td>
            <td>${money(s.recoveredRevenue)}</td>`;
        body.appendChild(tr);
    });
    show("analytics");
}

// ============ WIRING ============
$("#resetLink").onclick = async () => {
    await api("/api/demo/reset", { method: "POST" });
    toast("Demo data reset");
    loadUsers();
};
$("#signOutBtn").onclick = signOut;
$("#analyticsBtn").onclick = showAnalytics;
$("#backBtn").onclick = () => show("app");

$("#completeBtn").onclick = async () => {
    const v = await api("/api/carts/" + S.cartId + "/complete", { method: "POST" });
    renderCart(v);
    stopPolling();
};
$("#skipBtn").onclick = async () => {
    await api("/api/demo/fast-forward?seconds=25", { method: "POST" });
    refreshCart();
};

$("#chatMin").onclick = minimizeChat;
$("#chatLauncher").onclick = restoreChat;
$("#chatSend").onclick = () => {
    const input = $("#chatInput");
    sendFreeText(input.value);
    input.value = "";
};
$("#chatInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter") $("#chatSend").click();
});

loadUsers();
show("login");

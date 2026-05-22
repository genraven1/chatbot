# Cart Recovery AI &mdash; CodeFest

In production, **~80% of booking carts are abandoned**. This demo re-engages those
guests with an AI chatbot in a marriott.com-style booking flow:

1. **Guest signs in** with a Marriott Bonvoy account and sees only their own
   saved cart.
2. **Chatbot pops up at the 30s idle mark** (production: 10 min). If ignored,
   at 90s (production: 15 min) the cart becomes **SAVED** — persisted on the
   Bonvoy account for **30 days**, not lost.
3. **The popup re-fires on the next sign-in.** Whenever the member logs back in
   within the 30-day window, the saved cart loads and the recovery chatbot arms
   immediately — another chance to convert it to a booking.
4. **Walks through the concern prompts one at a time** &mdash; ranked most-likely
   first (Date flexibility / Property reviews / Price). Each "no" advances to the
   next prompt; after all three, the guest describes the concern in their own words.
5. **Counters with a non-discounting offer** &mdash; free cancellation, a room
   upgrade, or a value-add bundle. The room, property and nightly rate never
   change, so a recovered booking protects **RevPAR** and **EBITDA**.
6. **Reports which prompt earns the most "yes"** on the Recovery Analytics
   screen &mdash; data merchandising can act on.

### Demo users

Three Bonvoy members on the sign-in screen, one cart each:

| Member | Tier | Cart points at |
|--------|------|----------------|
| Sarah Chen | Gold Elite | Date-flexibility concern |
| Marcus Johnson | Silver Elite | Review concern |
| Elena Rodriguez | Platinum Elite | Price concern |

### KPIs covered
| KPI | How the demo moves it |
|-----|----------------------|
| Net Rooms Growth | Each recovered cart is an incremental booked room |
| Digital Direct Share | Carts recovered on direct vs. lost to OTAs |
| RevPAR | Recovered occupancy at full ADR (no discounting) |
| EBITDA Growth | Value-add offers protect margin while saving the sale |

## Run it

```bash
cd codefestcart
./run-live.sh          # loads .env, compiles, starts on port 8087
```

Open <http://localhost:8087>. Sign in as a demo member, wait ~30s on the cart
page (or click **Demo: skip the idle wait**) and the recovery chatbot pops up.
Ignore it and the cart becomes SAVED — **sign out and back in** to see the popup
re-fire on the persisted cart. **Recovery analytics** (top nav) shows the funnel;
**Reset demo data** on the sign-in screen restarts the scenario.

### Connect the real AI (LiteLLM)

Without a key the app runs in deterministic **demo mode**. To use a LiteLLM
gateway (OpenAI-compatible), copy the template and fill it in:

```bash
cp .env.example .env     # then edit .env with your base URL / key / model
./run-live.sh
```

`run-live.sh` loads `.env`, compiles, and starts the app (default port 8087).
`.env` is gitignored — never commit it. The AI badge in the UI shows
**"LiteLLM live"** vs **"demo mode"**.

### Tuning the timing

`src/main/resources/application.yml`:

```yaml
cart:
  nudge-after-seconds: 30    # popup arms (production: 600 = 10 min)
  abandon-after-seconds: 90  # cart becomes SAVED (production: 900 = 15 min)
```

## How it works

| Layer | Component |
|-------|-----------|
| Members | `UserRepository` &mdash; 3 demo Bonvoy users, one cart each |
| Cart DB | `CartRepository` &mdash; seeded carts with behavioural signals |
| Diagnosis | `ConcernEngine` &mdash; ranks all 3 concerns, deterministic |
| Lifecycle clock | `CartAgingService` &mdash; `@Scheduled`, ages carts every 1s |
| Conversation | `ChatService` + `LiteLlmClient` &mdash; steps prompts, LLM writes copy |
| Offers | `OfferCatalog` &mdash; margin-safe, one per concern |
| Funnel metrics | `MetricsService` &mdash; "which prompt earns the most yes" |

Stack: Java 21, Spring Boot 3.4 (web + actuator), vanilla-JS single page. No
database, no build step for the frontend. Health probes for Kubernetes are at
`/actuator/health/{liveness,readiness}`.

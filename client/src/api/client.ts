export interface DemoUser {
  bonvoyId: string;
  firstName: string;
  lastName: string;
  tier: string;
  email: string;
  cartId: string;
}

export interface Cart {
  id: string;
  guestName: string;
  bonvoyId: string;
  propertyName: string;
  location: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  adrUsd: number;
  totalUsd: number;
  cancellationPolicy: string;
  propertyReviewScore: number;
  comparableReviewScore: number;
  comparableAdrUsd: number;
  channel: string;
  status: CartStatus;
  nudgeShown: boolean;
}

export type CartStatus =
  | 'ACTIVE'
  | 'NUDGE_READY'
  | 'IN_CONVERSATION'
  | 'SAVED'
  | 'RECOVERED'
  | 'COMPLETED'
  | 'LOST';

export interface CartView {
  cart: Cart;
  detectedConcern: string;
  concernLabel: string;
  signalReason: string;
  idleSeconds: number;
  nudgeAfterSeconds: number;
  abandonAfterSeconds: number;
}

export interface SessionView {
  user: DemoUser;
  cart: CartView;
}

export interface Offer {
  concern: string;
  headline: string;
  detail: string;
  valueAdd: string;
  marginSafe: boolean;
  recoverableRevenue: number;
}

export interface ChatTurnResponse {
  aiMessage: string;
  detectedConcern: string;
  concernLabel: string;
  signalReason: string;
  quickReplies: string[];
  stage: string;
  offer: Offer | null;
  step: number;
  totalConcerns: number;
}

export interface ConcernStat {
  concern: string;
  label: string;
  promptsShown: number;
  agreed: number;
  declined: number;
  agreeRate: number;
  offersAccepted: number;
  recoveredRevenue: number;
}

export interface MetricsSnapshot {
  totalCarts: number;
  atRiskCarts: number;
  savedCarts: number;
  lostCarts: number;
  recoveredCarts: number;
  completedCarts: number;
  recoveryRate: number;
  recoveredRevenue: number;
  conversationsStarted: number;
  aiLive: boolean;
  concerns: ConcernStat[];
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, init);
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<T>;
}

const jsonPost = (body: unknown): RequestInit => ({
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

export const api = {
  getUsers: () => apiFetch<DemoUser[]>('/api/users'),
  login: (bonvoyId: string) =>
    apiFetch<SessionView>('/api/login', jsonPost({ bonvoyId })),
  getCart: (id: string) => apiFetch<CartView>(`/api/carts/${id}`),
  completeCart: (id: string) =>
    apiFetch<CartView>(`/api/carts/${id}/complete`, { method: 'POST' }),
  openChat: (cartId: string) =>
    apiFetch<ChatTurnResponse>(`/api/chat/${cartId}/open`, { method: 'POST' }),
  answerConcern: (cartId: string, concern: string, agreed: boolean) =>
    apiFetch<ChatTurnResponse>(`/api/chat/${cartId}/concern`, jsonPost({ concern, agreed })),
  answerOffer: (cartId: string, concern: string, accepted: boolean) =>
    apiFetch<ChatTurnResponse>(`/api/chat/${cartId}/offer`, jsonPost({ concern, accepted })),
  sendMessage: (cartId: string, message: string, history: { role: string; content: string }[]) =>
    apiFetch<ChatTurnResponse>(`/api/chat/${cartId}/message`, jsonPost({ message, history })),
  getMetrics: () => apiFetch<MetricsSnapshot>('/api/metrics'),
  resetDemo: () => apiFetch<{ status: string }>('/api/demo/reset', { method: 'POST' }),
  fastForward: (seconds = 25) =>
    apiFetch<{ status: string }>(`/api/demo/fast-forward?seconds=${seconds}`, { method: 'POST' }),
};

export const money = (n: number) => '$' + Math.round(n).toLocaleString();

export const mmss = (s: number) => {
  s = Math.max(0, Math.round(s));
  return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
};

export const TERMINAL_STATUSES: CartStatus[] = ['RECOVERED', 'COMPLETED', 'SAVED', 'LOST'];

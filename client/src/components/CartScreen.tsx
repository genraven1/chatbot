import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Snackbar,
} from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';
import LogoutIcon from '@mui/icons-material/Logout';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import { api, money, mmss, TERMINAL_STATUSES } from '../api/client';
import type { CartView, DemoUser } from '../api/client';
import AriaWidget from './AriaWidget';

interface Props {
  initialCartView: CartView;
  user: DemoUser;
  onSignOut: () => void;
  onAnalytics: () => void;
}

const NAV_BG = '#14233f';
const GOLD = '#9a6a2b';

const CartScreen: React.FC<Props> = ({ initialCartView, user, onSignOut, onAnalytics }) => {
  const [cartView, setCartView] = useState<CartView>(initialCartView);
  const [ariaOpen, setAriaOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const cart = cartView.cart;
  const status = cart.status;
  const isTerminal = TERMINAL_STATUSES.includes(status);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isTerminal) {
      stopPolling();
      return;
    }

    pollRef.current = setInterval(async () => {
      try {
        const v = await api.getCart(cart.id);
        setCartView(v);
        if (TERMINAL_STATUSES.includes(v.cart.status)) {
          stopPolling();
        }
        if (v.cart.status === 'NUDGE_READY' && !ariaOpen) {
          setAriaOpen(true);
          setToast('💬 Aria can help you finish your booking');
        }
      } catch {
        // ignore transient network errors
      }
    }, 1000);

    return stopPolling;
  }, [cart.id, ariaOpen, isTerminal, stopPolling]);

  async function handleComplete() {
    const v = await api.completeCart(cart.id);
    setCartView(v);
    stopPolling();
  }

  async function handleSkip() {
    await api.fastForward(25);
    const v = await api.getCart(cart.id);
    setCartView(v);
  }

  // When Aria finishes a terminal conversation, refresh the cart
  function handleAriaTerminal() {
    api.getCart(cart.id).then(setCartView).catch(console.error);
    stopPolling();
  }

  // ---- Idle chip content ----
  let chipText = '';
  let chipActive = false;
  if (status === 'ACTIVE') {
    chipText =
      'Idle ' +
      mmss(cartView.idleSeconds) +
      ' · assistant in ' +
      mmss(cartView.nudgeAfterSeconds - cartView.idleSeconds);
  } else if (status === 'NUDGE_READY' || status === 'IN_CONVERSATION') {
    chipText = 'Booking assistant active';
    chipActive = true;
  }

  // ---- Outcome overlay ----
  const showOutcome = status === 'RECOVERED' || status === 'COMPLETED' || status === 'SAVED' || status === 'LOST';

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f3f1ec' }}>
      {/* Nav */}
      <Box
        component="header"
        sx={{
          bgcolor: NAV_BG,
          color: '#fff',
          px: 3.5,
          py: 1.75,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography
          sx={{
            fontFamily: '"Times New Roman", Georgia, serif',
            fontStyle: 'italic',
            fontWeight: 800,
            fontSize: '1.15rem',
            color: '#fff',
            letterSpacing: 0.5,
          }}
        >
          Marriott <strong>Bonvoy</strong>®
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {chipText && (
            <Box
              sx={{
                fontSize: '0.76rem',
                fontFamily: 'ui-monospace, Menlo, monospace',
                bgcolor: chipActive ? GOLD : 'rgba(255,255,255,0.12)',
                color: '#fff',
                px: 1.25,
                py: 0.6,
                borderRadius: 10,
              }}
            >
              {chipText}
            </Box>
          )}
          <Button
            size="small"
            startIcon={<BarChartIcon sx={{ fontSize: '14px !important' }} />}
            onClick={onAnalytics}
            sx={{
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: 1.5,
              px: 1.5,
              py: 0.75,
              fontSize: '0.8rem',
              '&:hover': { borderColor: '#b5843f' },
            }}
          >
            Recovery analytics
          </Button>
          <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600 }}>
            {user.firstName} {user.lastName}
          </Typography>
          <Button
            size="small"
            startIcon={<LogoutIcon sx={{ fontSize: '14px !important' }} />}
            onClick={onSignOut}
            sx={{
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: 1.5,
              px: 1.5,
              py: 0.75,
              fontSize: '0.8rem',
              '&:hover': { borderColor: '#b5843f' },
            }}
          >
            Sign out
          </Button>
        </Box>
      </Box>

      {/* Main */}
      <Box
        component="main"
        sx={{ maxWidth: 940, mx: 'auto', px: 3.5, py: 4, pb: 10 }}
      >
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Review &amp; complete your booking
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
          Your trip is saved. Finish checkout to confirm your stay.
        </Typography>

        {/* Cart card */}
        <Box
          sx={{
            bgcolor: 'white',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: '0 10px 30px rgba(20,35,63,0.07)',
          }}
        >
          {/* Hotel banner */}
          <Box
            sx={{
              height: 150,
              background: 'linear-gradient(120deg, #14233f, #2f5f8f 60%, #1f6f8b)',
              color: 'rgba(255,255,255,0.95)',
              display: 'flex',
              alignItems: 'flex-end',
              px: 3,
              py: 2,
            }}
          >
            <Typography variant="h6" fontWeight={600} sx={{ letterSpacing: 0.3, color: '#fff' }}>
              {cart.propertyName}
            </Typography>
          </Box>

          {/* Cart body */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 290px' },
              gap: 3,
              p: 3,
            }}
          >
            {/* Stay details */}
            <Box>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                {cart.propertyName}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                {cart.location}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: GOLD, fontWeight: 600, mb: 1.5 }}
              >
                ★ {cart.propertyReviewScore.toFixed(1)} / 5 guest rating
              </Typography>

              <Box
                component="dl"
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '120px 1fr',
                  rowGap: 1,
                  fontSize: '0.9rem',
                  '& dt': { color: 'text.secondary' },
                  '& dd': { fontWeight: 600, m: 0 },
                }}
              >
                <dt>Dates</dt>
                <dd>
                  {cart.checkIn} → {cart.checkOut}
                </dd>
                <dt>Length</dt>
                <dd>{cart.nights} nights</dd>
                <dt>Room</dt>
                <dd>{cart.roomType}</dd>
                <dt>Guest</dt>
                <dd>
                  {user.firstName} {user.lastName} · {user.tier}
                </dd>
                <dt>Cancellation</dt>
                <dd>{cart.cancellationPolicy}</dd>
              </Box>
            </Box>

            {/* Price box */}
            <Box
              sx={{
                bgcolor: '#fbfaf7',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                p: 2,
                alignSelf: 'start',
              }}
            >
              {!showOutcome ? (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, fontSize: '0.88rem' }}>
                    <Typography variant="body2">
                      {money(cart.adrUsd)} × {cart.nights} nights
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {money(cart.totalUsd)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Taxes &amp; fees
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      calculated at property
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      borderTop: '1px solid',
                      borderColor: 'divider',
                      pt: 1,
                      mt: 1,
                    }}
                  >
                    <Typography variant="body2" fontWeight={700}>
                      Estimated total
                    </Typography>
                    <Typography variant="body2" fontWeight={700}>
                      {money(cart.totalUsd)}
                    </Typography>
                  </Box>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleComplete}
                    sx={{
                      mt: 1.5,
                      bgcolor: GOLD,
                      fontWeight: 700,
                      '&:hover': { bgcolor: '#b5843f' },
                    }}
                  >
                    Complete Booking
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={handleSkip}
                    sx={{
                      mt: 1,
                      borderStyle: 'dashed',
                      color: 'text.secondary',
                      borderColor: 'divider',
                      fontSize: '0.78rem',
                      '&:hover': { borderColor: GOLD, color: GOLD },
                    }}
                  >
                    ⏩ Demo: skip the idle wait
                  </Button>
                </>
              ) : (
                <OutcomeOverlay status={status} onSignOut={onSignOut} />
              )}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Aria chatbot widget */}
      <AriaWidget
        cartId={cart.id}
        shouldOpen={ariaOpen}
        onTerminal={handleAriaTerminal}
      />

      <Snackbar
        open={!!toast}
        autoHideDuration={3600}
        onClose={() => setToast(null)}
        message={toast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
};

// ---- Outcome overlay sub-component ----
interface OutcomeProps {
  status: string;
  onSignOut: () => void;
}

const OutcomeOverlay: React.FC<OutcomeProps> = ({ status, onSignOut }) => {
  if (status === 'RECOVERED' || status === 'COMPLETED') {
    return (
      <Box sx={{ textAlign: 'center', py: 1 }}>
        <CheckCircleOutlineIcon sx={{ fontSize: 48, color: '#2f7d52', mb: 1 }} />
        <Typography variant="subtitle1" fontWeight={700}>
          Booking confirmed
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Your stay is reserved. A confirmation email is on its way.
        </Typography>
      </Box>
    );
  }

  if (status === 'SAVED') {
    return (
      <Box sx={{ textAlign: 'center', py: 1 }}>
        <BookmarkIcon sx={{ fontSize: 48, color: '#1f6f8b', mb: 1 }} />
        <Typography variant="subtitle1" fontWeight={700}>
          Your trip is saved
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
          We'll hold this cart on your Marriott Bonvoy account for 30 days. Sign in
          again any time and Aria will help you finish.
        </Typography>
        <Button
          fullWidth
          variant="contained"
          onClick={onSignOut}
          sx={{ bgcolor: '#9a6a2b', '&:hover': { bgcolor: '#b5843f' } }}
        >
          Sign out
        </Button>
      </Box>
    );
  }

  // LOST
  return (
    <Box sx={{ textAlign: 'center', py: 1 }}>
      <Typography variant="subtitle1" fontWeight={700} color="text.secondary">
        Booking not completed
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
        Your cart has been kept on your Bonvoy account for 30 days.
      </Typography>
    </Box>
  );
};

export default CartScreen;

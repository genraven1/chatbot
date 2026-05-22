import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { api, money } from '../api/client';
import type { MetricsSnapshot } from '../api/client';

interface Props {
  onBack: () => void;
}

const NAV_BG = '#14233f';
const GOLD = '#9a6a2b';

const CONCERN_COLORS: Record<string, { bg: string; color: string }> = {
  DATE_FLEXIBILITY: { bg: 'rgba(47,95,143,0.13)', color: '#2f5f8f' },
  REVIEW_CONCERN: { bg: 'rgba(108,79,158,0.13)', color: '#6c4f9e' },
  PRICE_CONCERN: { bg: 'rgba(154,106,43,0.14)', color: '#9a6a2b' },
};

const AnalyticsScreen: React.FC<Props> = ({ onBack }) => {
  const [metrics, setMetrics] = useState<MetricsSnapshot | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    api
      .getMetrics()
      .then(setMetrics)
      .catch(() => setError(true));
  }, []);

  const bestIdx =
    metrics?.concerns.reduce(
      (best, s, i) => (s.agreed > (metrics.concerns[best]?.agreed ?? 0) ? i : best),
      0,
    ) ?? -1;

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
          }}
        >
          Recovery Analytics
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {metrics && (
            <Box
              sx={{
                fontSize: '0.75rem',
                fontWeight: 600,
                px: 1.5,
                py: 0.6,
                borderRadius: 10,
                bgcolor: metrics.aiLive ? '#2f7d52' : GOLD,
                color: '#fff',
              }}
            >
              {metrics.aiLive ? 'AI: LiteLLM live' : 'AI: demo mode'}
            </Box>
          )}
          <Button
            size="small"
            startIcon={<ArrowBackIcon sx={{ fontSize: '14px !important' }} />}
            onClick={onBack}
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
            Back
          </Button>
        </Box>
      </Box>

      {/* Main */}
      <Box component="main" sx={{ maxWidth: 1000, mx: 'auto', px: 3.5, py: 3.5 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            Could not load analytics. Is the server running?
          </Alert>
        )}

        {!metrics && !error && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        )}

        {metrics && (
          <>
            {/* KPI row */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 2,
                mb: 2.5,
              }}
            >
              {[
                {
                  val: metrics.atRiskCarts,
                  label: 'Carts at risk',
                  tag: 'Net Rooms Growth opportunity',
                },
                {
                  val: metrics.conversationsStarted,
                  label: 'Recovery chats started',
                  tag: 'Digital Direct engagement',
                },
                {
                  val: metrics.recoveredCarts,
                  label: 'Carts recovered',
                  tag: 'Net Rooms Growth',
                },
                {
                  val: money(metrics.recoveredRevenue),
                  label: 'Revenue recovered',
                  tag: 'EBITDA · RevPAR',
                },
              ].map((kpi) => (
                <Paper
                  key={kpi.label}
                  elevation={0}
                  sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: '15px 17px' }}
                >
                  <Typography
                    sx={{ fontSize: '1.8rem', fontWeight: 700, color: GOLD, lineHeight: 1.1 }}
                  >
                    {kpi.val}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {kpi.label}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      color: 'text.secondary',
                      textTransform: 'uppercase',
                      letterSpacing: 0.4,
                      mt: 0.5,
                      fontSize: '0.68rem',
                    }}
                  >
                    {kpi.tag}
                  </Typography>
                </Paper>
              ))}
            </Box>

            {/* Concern table */}
            <Paper
              elevation={0}
              sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: '18px 20px' }}
            >
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                Which prompt earns the most "yes"?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Per-concern recovery funnel — tells merchandising which hesitation to fix first.
              </Typography>

              <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
                <Box component="thead">
                  <Box component="tr">
                    {[
                      'Concern prompt',
                      'Shown',
                      'Said "yes"',
                      'Yes-rate',
                      'Bookings recovered',
                      'Revenue recovered',
                    ].map((h) => (
                      <Box
                        component="th"
                        key={h}
                        sx={{
                          textAlign: 'left',
                          p: '9px 11px',
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                          color: 'text.secondary',
                          fontSize: '0.72rem',
                          textTransform: 'uppercase',
                          letterSpacing: 0.4,
                          fontWeight: 600,
                        }}
                      >
                        {h}
                      </Box>
                    ))}
                  </Box>
                </Box>
                <Box component="tbody">
                  {metrics.concerns.map((s, i) => {
                    const isWinner = i === bestIdx && s.agreed > 0;
                    const colors = CONCERN_COLORS[s.concern] ?? { bg: '#f0f0f0', color: '#333' };
                    return (
                      <Box
                        component="tr"
                        key={s.concern}
                        sx={{ bgcolor: isWinner ? '#fbf6ec' : 'transparent' }}
                      >
                        <Box
                          component="td"
                          sx={{ p: '9px 11px', borderBottom: '1px solid', borderColor: 'divider' }}
                        >
                          <Box
                            component="span"
                            sx={{
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              px: 1.1,
                              py: 0.4,
                              borderRadius: 5,
                              bgcolor: colors.bg,
                              color: colors.color,
                            }}
                          >
                            {s.label}
                            {isWinner ? ' 🏆' : ''}
                          </Box>
                        </Box>
                        {[
                          s.promptsShown,
                          s.agreed,
                          (s.agreeRate * 100).toFixed(0) + '%',
                          s.offersAccepted,
                          money(s.recoveredRevenue),
                        ].map((val, j) => (
                          <Box
                            component="td"
                            key={j}
                            sx={{
                              p: '9px 11px',
                              borderBottom: '1px solid',
                              borderColor: 'divider',
                              fontSize: '0.86rem',
                            }}
                          >
                            {val}
                          </Box>
                        ))}
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            </Paper>
          </>
        )}
      </Box>
    </Box>
  );
};

export default AnalyticsScreen;

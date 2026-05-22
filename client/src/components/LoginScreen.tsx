import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
  Button,
} from '@mui/material';
import { api } from '../api/client';
import type { DemoUser, SessionView } from '../api/client';

interface Props {
  onLogin: (session: SessionView) => void;
}

const NAV_BG = '#14233f';

const LoginScreen: React.FC<Props> = ({ onLogin }) => {
  const [users, setUsers] = useState<DemoUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [signingIn, setSigningIn] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resetMsg, setResetMsg] = useState(false);

  useEffect(() => {
    api
      .getUsers()
      .then(setUsers)
      .catch(() => setError('Could not connect to the server. Is it running?'))
      .finally(() => setLoading(false));
  }, []);

  async function handleReset() {
    try {
      await api.resetDemo();
      const fresh = await api.getUsers();
      setUsers(fresh);
      setResetMsg(true);
    } catch {
      setError('Reset failed.');
    }
  }

  async function handleLogin(bonvoyId: string) {
    setSigningIn(bonvoyId);
    try {
      const sess = await api.login(bonvoyId);
      onLogin(sess);
    } catch {
      setError('Sign-in failed. Is the server running on port 8080?');
      setSigningIn(null);
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#f3f1ec',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        px: 3,
      }}
    >
      {/* Brand */}
      <Typography
        sx={{
          fontFamily: '"Times New Roman", Georgia, serif',
          fontStyle: 'italic',
          fontWeight: 800,
          fontSize: '1.9rem',
          color: NAV_BG,
          letterSpacing: 1,
        }}
      >
        Marriott <strong>Bonvoy</strong>®
      </Typography>

      {/* Sign-in card */}
      <Card
        elevation={4}
        sx={{ width: '100%', maxWidth: 440, p: '30px 32px', borderRadius: 3 }}
      >
        <Typography variant="h6" fontWeight={700} gutterBottom>
          Sign in to your account
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
          Choose a demo Bonvoy member to continue to your saved trip.
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={28} />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {users.map((u) => (
              <Box
                key={u.bonvoyId}
                component="button"
                onClick={() => handleLogin(u.bonvoyId)}
                disabled={signingIn !== null}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  bgcolor: '#fbfaf7',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  p: '13px 15px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  font: 'inherit',
                  color: 'inherit',
                  width: '100%',
                  transition: 'border-color 0.15s, transform 0.1s',
                  '&:hover:not(:disabled)': {
                    borderColor: 'secondary.main',
                    transform: 'translateY(-1px)',
                  },
                  '&:disabled': { opacity: 0.6, cursor: 'default' },
                }}
              >
                {/* Avatar */}
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: '50%',
                    bgcolor: NAV_BG,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    flexShrink: 0,
                  }}
                >
                  {signingIn === u.bonvoyId ? (
                    <CircularProgress size={18} sx={{ color: '#fff' }} />
                  ) : (
                    `${u.firstName[0]}${u.lastName[0]}`
                  )}
                </Box>

                {/* User info */}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" fontWeight={700}>
                    {u.firstName} {u.lastName}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: 'secondary.main', fontWeight: 600, display: 'block' }}
                  >
                    Marriott Bonvoy · {u.tier}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Member #{u.bonvoyId}
                  </Typography>
                </Box>

                <Typography sx={{ color: 'secondary.main', fontSize: '1.2rem' }}>
                  →
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </Card>

      <Button
        variant="text"
        size="small"
        sx={{ color: 'text.secondary', fontSize: '0.82rem', textDecoration: 'underline' }}
        onClick={handleReset}
      >
        ↺ Reset demo data
      </Button>

      <Snackbar
        open={resetMsg}
        autoHideDuration={3000}
        onClose={() => setResetMsg(false)}
        message="Demo data reset"
      />
      <Snackbar open={!!error} autoHideDuration={5000} onClose={() => setError(null)}>
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LoginScreen;

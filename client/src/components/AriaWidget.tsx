import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  TextField,
  Chip,
  Tooltip,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import RemoveIcon from '@mui/icons-material/Remove';
import { api } from '../api/client';
import type { ChatTurnResponse, Offer } from '../api/client';

type ChatEntry =
  | { type: 'bubble'; role: 'bot' | 'user'; text: string }
  | { type: 'offer'; headline: string; detail: string };

interface Props {
  cartId: string;
  /** Transitions to true when the cart hits NUDGE_READY — triggers the open API call. */
  shouldOpen: boolean;
  onTerminal: () => void;
}

const NAV_BG = '#14233f';
const GOLD = '#9a6a2b';

const AriaWidget: React.FC<Props> = ({ cartId, shouldOpen, onTerminal }) => {
  const [widgetVisible, setWidgetVisible] = useState(false);
  const [launcherVisible, setLauncherVisible] = useState(false);
  const [entries, setEntries] = useState<ChatEntry[]>([]);
  const [quickReplies, setQuickReplies] = useState<string[]>([]);
  const [stage, setStage] = useState<string | null>(null);
  const [askedConcern, setAskedConcern] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [totalConcerns, setTotalConcerns] = useState(0);
  const [inputEnabled, setInputEnabled] = useState(false);
  const [inputText, setInputText] = useState('');

  const historyRef = useRef<{ role: string; content: string }[]>([]);
  const initializedRef = useRef(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  const addEntry = useCallback((entry: ChatEntry) => {
    setEntries((prev) => [...prev, entry]);
  }, []);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries, quickReplies]);

  const handleResp = useCallback(
    (r: ChatTurnResponse) => {
      setStage(r.stage);

      if (r.stage === 'CONFIRM_CONCERN' || r.stage === 'OFFER') {
        setAskedConcern(r.detectedConcern);
      }
      if (r.stage === 'CONFIRM_CONCERN') {
        setStep(r.step);
        setTotalConcerns(r.totalConcerns);
      } else {
        setStep(0);
      }

      addEntry({ type: 'bubble', role: 'bot', text: r.aiMessage });
      historyRef.current = [
        ...historyRef.current,
        { role: 'assistant', content: r.aiMessage },
      ];

      if (r.offer && r.stage === 'OFFER') {
        addEntry({ type: 'offer', headline: r.offer.headline, detail: r.offer.detail });
      }

      setQuickReplies(r.quickReplies ?? []);

      const terminal = r.stage === 'RECOVERED' || r.stage === 'LOST';
      setInputEnabled(!terminal);

      if (terminal) {
        setQuickReplies([]);
        onTerminal();
      }
    },
    [addEntry, onTerminal],
  );

  // Open the chatbot when shouldOpen transitions to true
  useEffect(() => {
    if (!shouldOpen || initializedRef.current) return;
    initializedRef.current = true;
    setWidgetVisible(true);
    setLauncherVisible(false);
    api.openChat(cartId).then(handleResp).catch(console.error);
  }, [shouldOpen, cartId, handleResp]);

  async function handleQuickAction(label: string) {
    addEntry({ type: 'bubble', role: 'user', text: label });
    setQuickReplies([]);

    if (stage === 'CONFIRM_CONCERN') {
      const agreed = label === "Yes, that's it";
      const r = await api.answerConcern(cartId, askedConcern!, agreed);
      handleResp(r);
    } else if (stage === 'OFFER') {
      const accepted = label === 'Complete my booking';
      const r = await api.answerOffer(cartId, askedConcern!, accepted);
      handleResp(r);
    }
  }

  async function handleSend() {
    const text = inputText.trim();
    if (!text || !inputEnabled) return;
    setInputText('');
    addEntry({ type: 'bubble', role: 'user', text });
    historyRef.current = [...historyRef.current, { role: 'user', content: text }];
    const r = await api.sendMessage(cartId, text, historyRef.current);
    handleResp(r);
  }

  if (!widgetVisible && !launcherVisible) return null;

  return (
    <>
      {/* Launcher button (shown when minimized) */}
      {launcherVisible && !widgetVisible && (
        <Box
          component="button"
          onClick={() => { setWidgetVisible(true); setLauncherVisible(false); }}
          sx={{
            position: 'fixed',
            bottom: 22,
            right: 22,
            width: 56,
            height: 56,
            borderRadius: '50%',
            bgcolor: NAV_BG,
            color: '#fff',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            boxShadow: '0 8px 22px rgba(20,35,63,0.35)',
            zIndex: 1300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          💬
        </Box>
      )}

      {/* Chat window */}
      {widgetVisible && (
        <Paper
          elevation={8}
          sx={{
            position: 'fixed',
            bottom: 22,
            right: 22,
            width: 366,
            maxHeight: '78vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            borderRadius: 3,
            zIndex: 1300,
            animation: 'ariaPopin 0.3s ease',
            '@keyframes ariaPopin': {
              from: { transform: 'translateY(20px) scale(0.96)', opacity: 0 },
              to: { transform: 'none', opacity: 1 },
            },
          }}
        >
          {/* Header */}
          <Box
            sx={{
              bgcolor: NAV_BG,
              color: '#fff',
              px: 2,
              py: 1.5,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              flexShrink: 0,
            }}
          >
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                bgcolor: GOLD,
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '1rem',
                flexShrink: 0,
              }}
            >
              A
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" fontWeight={700} sx={{ color: '#fff', lineHeight: 1.2 }}>
                Aria
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.72rem' }}>
                Booking Assistant
              </Typography>
            </Box>
            <Tooltip title="Minimize">
              <IconButton
                size="small"
                sx={{ color: '#fff' }}
                onClick={() => { setWidgetVisible(false); setLauncherVisible(true); }}
              >
                <RemoveIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Step badge */}
          {step > 0 && step <= totalConcerns && (
            <Box
              sx={{
                bgcolor: '#fbf6ec',
                color: GOLD,
                fontSize: '0.74rem',
                fontWeight: 700,
                px: 2,
                py: 0.75,
                borderBottom: '1px solid',
                borderColor: 'divider',
              }}
            >
              Concern check — question {step} of {totalConcerns}
            </Box>
          )}

          {/* Chat log */}
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              p: 1.75,
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              minHeight: 180,
              bgcolor: '#fafaf8',
              '&::-webkit-scrollbar': { width: 4 },
              '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(0,0,0,0.15)', borderRadius: 2 },
            }}
          >
            {entries.map((entry, i) => {
              if (entry.type === 'offer') {
                return (
                  <Box
                    key={i}
                    sx={{
                      background: 'linear-gradient(135deg, #fbf3e3, #f5f7f9)',
                      border: '1px solid',
                      borderColor: GOLD,
                      borderRadius: 2,
                      p: 1.5,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 700, color: GOLD, display: 'block', mb: 0.5 }}
                    >
                      {entry.headline}
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block', fontSize: '0.84rem' }}>
                      {entry.detail}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ display: 'block', color: '#2f7d52', fontWeight: 600, mt: 0.75, fontSize: '0.72rem' }}
                    >
                      ✓ Same room, same nightly rate — added value, not a discount.
                    </Typography>
                  </Box>
                );
              }
              return (
                <Box
                  key={i}
                  sx={{
                    alignSelf: entry.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '84%',
                    px: 1.5,
                    py: 1,
                    borderRadius: entry.role === 'user' ? '13px 13px 3px 13px' : '13px 13px 13px 3px',
                    bgcolor: entry.role === 'user' ? NAV_BG : '#f1efe9',
                    color: entry.role === 'user' ? '#fff' : 'text.primary',
                    fontSize: '0.88rem',
                    lineHeight: 1.5,
                  }}
                >
                  {entry.text}
                </Box>
              );
            })}

            <div ref={logEndRef} />
          </Box>

          {/* Quick replies */}
          {quickReplies.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, px: 1.75, pb: 1 }}>
              {quickReplies.map((label) => (
                <Chip
                  key={label}
                  label={label}
                  onClick={() => handleQuickAction(label)}
                  sx={{
                    bgcolor: '#fff',
                    border: '1px solid',
                    borderColor: GOLD,
                    color: NAV_BG,
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: GOLD, color: '#fff' },
                  }}
                />
              ))}
            </Box>
          )}

          {/* Free-text input */}
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              px: 1.5,
              py: 1.25,
              borderTop: '1px solid',
              borderColor: 'divider',
              bgcolor: 'white',
            }}
          >
            <TextField
              fullWidth
              size="small"
              placeholder="Or type your own concern…"
              disabled={!inputEnabled}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
              sx={{
                '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: '0.86rem' },
                '& .MuiInputBase-input:disabled': { bgcolor: '#f5f4f0' },
              }}
            />
            <IconButton
              color="primary"
              onClick={handleSend}
              disabled={!inputEnabled || !inputText.trim()}
              sx={{
                bgcolor: GOLD,
                color: '#fff',
                '&:hover': { bgcolor: '#b5843f' },
                '&.Mui-disabled': { bgcolor: 'action.disabledBackground' },
              }}
            >
              <SendIcon fontSize="small" />
            </IconButton>
          </Box>
        </Paper>
      )}
    </>
  );
};

export default AriaWidget;

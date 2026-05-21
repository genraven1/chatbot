import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Badge,
  Collapse,
  Chip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import HotelIcon from '@mui/icons-material/Hotel';
import MinimizeIcon from '@mui/icons-material/Remove';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import TimerIcon from '@mui/icons-material/Timer';
import type { ChatMessage } from '../types/chat';
import { abandonedCartItems } from '../data/mockCartData';
import {
  getBotGreeting,
  getCartSelectionOptions,
  createCartItemMessage,
  createUserTextMessage,
  handleUserInput,
  getInitialState,
  createCartExpiryWarningMessage,
  createCartExpiredMessage,
  type RebookState,
} from '../utils/chatbotLogic';
import ChatBubble from './ChatBubble';
import ChatInput from './ChatInput';

const TYPING_DELAY_MS = 600;
/** Total cart lifetime in seconds (3 minutes for demo purposes). */
const CART_EXPIRY_SECONDS = 3 * 60;
/** Seconds before expiry at which to fire the proactive warning. */
const EXPIRY_WARNING_THRESHOLD = 90;

const ChatbotWidget: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [state, setState] = useState<RebookState>(getInitialState());
  const [optionsDisabled, setOptionsDisabled] = useState<Set<string>>(new Set());
  const [hasInitialized, setHasInitialized] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(CART_EXPIRY_SECONDS);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);
  const warningFired = useRef(false);
  const expiredFired = useRef(false);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  // Cart expiry countdown — stops once cart is booked or expired
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        const next = prev - 1;

        if (next <= EXPIRY_WARNING_THRESHOLD && !warningFired.current) {
          warningFired.current = true;
          // Auto-open the widget so the user sees the warning
          setOpen(true);
          setHasInitialized(true);
          const warningMsg = createCartExpiryWarningMessage();
          setMessages((msgs) => [...msgs, warningMsg]);
        }

        if (next <= 0 && !expiredFired.current) {
          expiredFired.current = true;
          setOpen(true);
          const expiredMsg = createCartExpiredMessage();
          setMessages((msgs) => [...msgs, expiredMsg]);
          clearInterval(interval);
          return 0;
        }

        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Stop the countdown once the booking is complete
  useEffect(() => {
    if (state.step === 'booked') {
      warningFired.current = true;
      expiredFired.current = true;
    }
  }, [state.step]);

  const enqueueBotMessages = useCallback(
    (newMessages: ChatMessage[], onDone?: () => void) => {
      if (newMessages.length === 0) {
        onDone?.();
        return;
      }

      setIsTyping(true);

      const enqueue = (index: number) => {
        if (index >= newMessages.length) {
          setIsTyping(false);
          onDone?.();
          return;
        }

        setTimeout(() => {
          setMessages((prev) => [...prev, newMessages[index]]);
          enqueue(index + 1);
        }, TYPING_DELAY_MS);
      };

      enqueue(0);
    },
    [],
  );

  useEffect(() => {
    if (open && !initialized.current) {
      initialized.current = true;
      setHasInitialized(true);

      const greetings = getBotGreeting(abandonedCartItems.length);
      const cartMessages = abandonedCartItems.map((item) =>
        createCartItemMessage(item),
      );
      const selectionMessage = getCartSelectionOptions(abandonedCartItems);

      const allMessages = [...greetings, ...cartMessages, selectionMessage];

      enqueueBotMessages(allMessages, () => {
        setState((prev) => ({ ...prev, step: 'show-cart' }));
      });
    }
  }, [open, enqueueBotMessages]);

  const handleOptionSelect = useCallback(
    (msgId: string, value: string) => {
      if (optionsDisabled.has(msgId)) return;

      setOptionsDisabled((prev) => new Set(prev).add(msgId));

      const userMsg = createUserTextMessage(
        messages.find((m) => m.id === msgId)?.options?.find((o) => o.value === value)
          ?.label ?? value,
      );
      setMessages((prev) => [...prev, userMsg]);

      const { messages: botMsgs, newState } = handleUserInput(
        value,
        state,
        abandonedCartItems,
      );

      setState(newState);
      enqueueBotMessages(botMsgs);
    },
    [messages, optionsDisabled, state, enqueueBotMessages],
  );

  const handleTextSend = useCallback(
    (text: string) => {
      const userMsg = createUserTextMessage(text);
      setMessages((prev) => [...prev, userMsg]);

      const { messages: botMsgs, newState } = handleUserInput(
        text,
        state,
        abandonedCartItems,
      );

      setState(newState);
      enqueueBotMessages(botMsgs);
    },
    [state, enqueueBotMessages],
  );

  const handleClose = () => setOpen(false);
  const handleOpen = () => setOpen(true);

  const unreadCount = !open && hasInitialized ? messages.length : 0;
  const isExpiringSoon = secondsLeft <= EXPIRY_WARNING_THRESHOLD && secondsLeft > 0;
  const isExpired = secondsLeft <= 0;

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return m > 0 ? `${m}:${String(s).padStart(2, '0')}` : `${s}s`;
  };

  return (
    <>
      {/* Floating Action Button */}
      {!open && (
        <Tooltip title="Chat with Marriott Assistant" placement="left">
          <Badge
            badgeContent={unreadCount > 0 ? unreadCount : undefined}
            color="error"
            sx={{
              position: 'fixed',
              bottom: 32,
              right: 32,
              zIndex: 1300,
            }}
          >
            <IconButton
              onClick={handleOpen}
              aria-label="Open Marriott chat"
              sx={{
                width: 60,
                height: 60,
                bgcolor: isExpiringSoon ? 'error.main' : 'primary.main',
                color: 'white',
                boxShadow: 4,
                animation: isExpiringSoon ? 'pulse 1.5s infinite' : 'none',
                '@keyframes pulse': {
                  '0%, 100%': { boxShadow: '0 0 0 0 rgba(211,47,47,0.4)' },
                  '50%': { boxShadow: '0 0 0 10px rgba(211,47,47,0)' },
                },
                '&:hover': {
                  bgcolor: isExpiringSoon ? 'error.dark' : 'primary.dark',
                  transform: 'scale(1.05)',
                },
                transition: 'background-color 0.3s ease, transform 0.2s ease',
              }}
            >
              {isExpiringSoon ? (
                <TimerIcon sx={{ fontSize: 26 }} />
              ) : (
                <ShoppingCartIcon sx={{ fontSize: 26 }} />
              )}
            </IconButton>
          </Badge>
        </Tooltip>
      )}

      {/* Chat Window */}
      <Collapse
        in={open}
        sx={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          zIndex: 1300,
        }}
      >
        <Paper
          elevation={8}
          sx={{
            width: 400,
            height: 620,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          {/* Header */}
          <Box
            sx={{
              bgcolor: isExpiringSoon ? 'error.dark' : 'primary.main',
              px: 2,
              py: 1.5,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              flexShrink: 0,
              transition: 'background-color 0.4s ease',
            }}
          >
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                bgcolor: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <HotelIcon sx={{ color: 'white', fontSize: 22 }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="subtitle1"
                sx={{
                  color: 'white',
                  fontWeight: 700,
                  fontFamily: '"Georgia", serif',
                  lineHeight: 1.2,
                }}
              >
                Marriott Assistant
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                {isTyping ? 'Typing…' : 'Online · Ready to help'}
              </Typography>
            </Box>
            {isExpiringSoon && !isExpired && (
              <Chip
                icon={<TimerIcon sx={{ fontSize: '14px !important', color: 'white !important' }} />}
                label={`Cart expires: ${formatCountdown(secondsLeft)}`}
                size="small"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '0.7rem',
                  border: '1px solid rgba(255,255,255,0.4)',
                  animation: 'blink 1s step-start infinite',
                  '@keyframes blink': {
                    '50%': { opacity: 0.6 },
                  },
                }}
              />
            )}
            {isExpired && (
              <Chip
                label="Cart Expired"
                size="small"
                sx={{
                  bgcolor: 'rgba(0,0,0,0.3)',
                  color: 'rgba(255,255,255,0.8)',
                  fontWeight: 700,
                  fontSize: '0.7rem',
                }}
              />
            )}
            <Tooltip title="Minimize">
              <IconButton size="small" onClick={handleClose} sx={{ color: 'white' }}>
                <MinimizeIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Close">
              <IconButton size="small" onClick={handleClose} sx={{ color: 'white' }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Messages Area */}
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              px: 2,
              py: 2,
              bgcolor: '#F8F8F6',
              '&::-webkit-scrollbar': { width: 4 },
              '&::-webkit-scrollbar-thumb': {
                bgcolor: 'rgba(0,0,0,0.15)',
                borderRadius: 2,
              },
            }}
          >
            {messages.length === 0 && !isTyping && (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  gap: 1,
                  color: 'text.secondary',
                }}
              >
                <HotelIcon sx={{ fontSize: 48, color: 'primary.light', opacity: 0.5 }} />
                <Typography variant="body2" align="center" color="text.secondary">
                  Your Marriott assistant is ready to help you rebook your stay.
                </Typography>
              </Box>
            )}

            {messages.map((msg) => (
              <ChatBubble
                key={msg.id}
                message={msg}
                onOptionSelect={
                  msg.type === 'options' && !optionsDisabled.has(msg.id)
                    ? (val) => handleOptionSelect(msg.id, val)
                    : undefined
                }
              />
            ))}

            {isTyping && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <HotelIcon sx={{ fontSize: 18, color: 'white' }} />
                </Box>
                <Paper
                  elevation={0}
                  sx={{
                    px: 2,
                    py: 1.25,
                    bgcolor: 'white',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: '4px 16px 16px 16px',
                  }}
                >
                  <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', height: 18 }}>
                    {[0, 1, 2].map((i) => (
                      <Box
                        key={i}
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          bgcolor: 'text.disabled',
                          animation: 'bounce 1.2s infinite',
                          animationDelay: `${i * 0.2}s`,
                          '@keyframes bounce': {
                            '0%, 80%, 100%': { transform: 'translateY(0)' },
                            '40%': { transform: 'translateY(-5px)' },
                          },
                        }}
                      />
                    ))}
                  </Box>
                </Paper>
              </Box>
            )}

            <div ref={messagesEndRef} />
          </Box>

          {/* Input Area */}
          <ChatInput
            onSend={handleTextSend}
            disabled={isTyping}
          />
        </Paper>
      </Collapse>
    </>
  );
};

export default ChatbotWidget;

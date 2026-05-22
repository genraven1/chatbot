import React from 'react';
import { Box, Paper, Typography, Chip } from '@mui/material';
import HotelIcon from '@mui/icons-material/Hotel';
import PersonIcon from '@mui/icons-material/Person';
import type { ChatMessage } from '../types/chat';
import CartCard from './CartCard';
import BookingConfirmationCard from './BookingConfirmationCard';

interface ChatBubbleProps {
  message: ChatMessage;
  onOptionSelect?: (value: string) => void;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, onOptionSelect }) => {
  const isBot = message.sender === 'bot';

  if (message.type === 'cart-item' && message.cartItem) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, maxWidth: '85%' }}>
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
              mt: 0.5,
            }}
          >
            <HotelIcon sx={{ fontSize: 18, color: 'white' }} />
          </Box>
          <CartCard cartItem={message.cartItem} />
        </Box>
      </Box>
    );
  }

  if (message.type === 'booking-confirmation' && message.bookingConfirmation) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, maxWidth: '85%' }}>
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
              mt: 0.5,
            }}
          >
            <HotelIcon sx={{ fontSize: 18, color: 'white' }} />
          </Box>
          <BookingConfirmationCard confirmation={message.bookingConfirmation} />
        </Box>
      </Box>
    );
  }

  const renderText = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) =>
      part.startsWith('**') && part.endsWith('**') ? (
        <strong key={i}>{part.slice(2, -2)}</strong>
      ) : (
        <React.Fragment key={i}>{part}</React.Fragment>
      ),
    );
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isBot ? 'flex-start' : 'flex-end',
        mb: 1.5,
        alignItems: 'flex-end',
        gap: 1,
      }}
    >
      {isBot && (
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
      )}

      <Box sx={{ maxWidth: '75%' }}>
        <Paper
          elevation={0}
          sx={{
            px: 2,
            py: 1.25,
            bgcolor: isBot ? 'white' : 'primary.main',
            color: isBot ? 'text.primary' : 'white',
            border: isBot ? '1px solid' : 'none',
            borderColor: 'divider',
            borderRadius: isBot
              ? '4px 16px 16px 16px'
              : '16px 4px 16px 16px',
          }}
        >
          <Typography variant="body2" sx={{ lineHeight: 1.6, whiteSpace: 'pre-line' }}>
            {renderText(message.text || '')}
          </Typography>
        </Paper>

        {message.type === 'options' && message.options && onOptionSelect && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 1 }}>
            {message.options.map((opt) => (
              <Chip
                key={opt.value}
                label={opt.label}
                onClick={() => onOptionSelect(opt.value)}
                sx={{
                  cursor: 'pointer',
                  bgcolor: 'white',
                  border: '1.5px solid',
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  '&:hover': {
                    bgcolor: 'primary.main',
                    color: 'white',
                  },
                  transition: 'all 0.15s ease',
                }}
              />
            ))}
          </Box>
        )}
      </Box>

      {!isBot && (
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            bgcolor: 'secondary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <PersonIcon sx={{ fontSize: 18, color: 'white' }} />
        </Box>
      )}
    </Box>
  );
};

export default ChatBubble;

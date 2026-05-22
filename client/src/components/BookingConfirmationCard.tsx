import React from 'react';
import { Box, Paper, Typography, Divider } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PeopleIcon from '@mui/icons-material/People';
import HotelIcon from '@mui/icons-material/Hotel';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import type { BookingConfirmation } from '../types/chat';
import { formatDate, calculateNights } from '../utils/chatbotLogic';

interface BookingConfirmationCardProps {
  confirmation: BookingConfirmation;
}

const BookingConfirmationCard: React.FC<BookingConfirmationCardProps> = ({
  confirmation,
}) => {
  const nights = calculateNights(confirmation.checkIn, confirmation.checkOut);

  return (
    <Paper
      elevation={3}
      sx={{
        width: 320,
        border: '2px solid',
        borderColor: 'secondary.main',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          bgcolor: 'primary.main',
          px: 2,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <CheckCircleIcon sx={{ color: 'white', fontSize: 22 }} />
        <Typography
          variant="subtitle1"
          sx={{ color: 'white', fontWeight: 700, fontFamily: '"Georgia", serif' }}
        >
          Booking Confirmed!
        </Typography>
      </Box>

      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            bgcolor: '#FFF8E1',
            border: '1px solid',
            borderColor: 'secondary.light',
            borderRadius: 1,
            px: 2,
            py: 1,
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <ConfirmationNumberIcon sx={{ color: 'secondary.main', fontSize: 18 }} />
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              Confirmation Number
            </Typography>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 700, color: 'secondary.dark', letterSpacing: 1 }}
            >
              {confirmation.confirmationNumber}
            </Typography>
          </Box>
        </Box>

        <Typography
          variant="subtitle2"
          sx={{ fontFamily: '"Georgia", serif', fontWeight: 700, mb: 1.5 }}
        >
          {confirmation.hotelName}
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarMonthIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {formatDate(confirmation.checkIn)} – {formatDate(confirmation.checkOut)}{' '}
              <strong>({nights} night{nights > 1 ? 's' : ''})</strong>
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PeopleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {confirmation.guests} Guest{confirmation.guests > 1 ? 's' : ''}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <HotelIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {confirmation.roomType}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 1.5 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <Typography variant="body2" color="text.secondary">
            Total Charged
          </Typography>
          <Typography
            variant="h6"
            sx={{ color: 'primary.main', fontWeight: 700 }}
          >
            ${confirmation.totalPrice.toLocaleString()}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default BookingConfirmationCard;

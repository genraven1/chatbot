import React from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Chip,
  Divider,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PeopleIcon from '@mui/icons-material/People';
import HotelIcon from '@mui/icons-material/Hotel';
import type { CartItem } from '../types/chat';
import { formatDate } from '../utils/chatbotLogic';

interface CartCardProps {
  cartItem: CartItem;
}

const CartCard: React.FC<CartCardProps> = ({ cartItem }) => {
  return (
    <Card
      elevation={2}
      sx={{
        width: 320,
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
      }}
    >
      <CardMedia
        component="img"
        height="160"
        image={cartItem.imageUrl}
        alt={cartItem.hotelName}
        sx={{ objectFit: 'cover' }}
      />
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Typography
          variant="h6"
          sx={{
            fontFamily: '"Georgia", serif',
            fontWeight: 700,
            fontSize: '1rem',
            color: 'text.primary',
            mb: 0.5,
          }}
        >
          {cartItem.hotelName}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
          <LocationOnIcon sx={{ fontSize: 14, color: 'primary.main' }} />
          <Typography variant="caption" color="text.secondary">
            {cartItem.location}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarMonthIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {formatDate(cartItem.checkIn)} – {formatDate(cartItem.checkOut)}{' '}
              <strong>({cartItem.nights} nights)</strong>
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PeopleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {cartItem.guests} Guest{cartItem.guests > 1 ? 's' : ''}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <HotelIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {cartItem.roomType}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.5 }}>
          {cartItem.amenities.map((amenity) => (
            <Chip
              key={amenity}
              label={amenity}
              size="small"
              sx={{
                fontSize: '0.65rem',
                height: 20,
                bgcolor: 'secondary.light',
                color: 'white',
              }}
            />
          ))}
        </Box>

        <Divider sx={{ mb: 1.5 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <Typography variant="caption" color="text.secondary">
            ${cartItem.pricePerNight}/night
          </Typography>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              Total
            </Typography>
            <Typography
              variant="h6"
              sx={{ color: 'primary.main', fontWeight: 700, lineHeight: 1.2 }}
            >
              ${cartItem.totalPrice.toLocaleString()}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CartCard;

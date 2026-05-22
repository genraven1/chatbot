import type { CartItem } from '../types/chat';

export const abandonedCartItems: CartItem[] = [
  {
    id: 'cart-001',
    hotelName: 'The Ritz-Carlton, South Beach',
    location: 'Miami Beach, Florida',
    imageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&h=250&fit=crop',
    checkIn: '2026-07-15',
    checkOut: '2026-07-18',
    nights: 3,
    guests: 2,
    roomType: 'Ocean View King Suite',
    pricePerNight: 689,
    totalPrice: 2067,
    amenities: ['Spa Access', 'Pool', 'Beachfront', 'Concierge'],
  },
  {
    id: 'cart-002',
    hotelName: 'JW Marriott Marquis Miami',
    location: 'Miami, Florida',
    imageUrl: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400&h=250&fit=crop',
    checkIn: '2026-08-01',
    checkOut: '2026-08-04',
    nights: 3,
    guests: 2,
    roomType: 'Deluxe City View Room',
    pricePerNight: 399,
    totalPrice: 1197,
    amenities: ['Fitness Center', 'Pool', 'Restaurant', 'Business Center'],
  },
];

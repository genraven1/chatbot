export type MessageSender = 'bot' | 'user';

export type MessageType = 'text' | 'cart-item' | 'options' | 'booking-confirmation';

export interface QuickOption {
  label: string;
  value: string;
}

export interface CartItem {
  id: string;
  hotelName: string;
  location: string;
  imageUrl: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  roomType: string;
  pricePerNight: number;
  totalPrice: number;
  amenities: string[];
}

export interface BookingConfirmation {
  confirmationNumber: string;
  hotelName: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  roomType: string;
  totalPrice: number;
}

export interface ChatMessage {
  id: string;
  sender: MessageSender;
  type: MessageType;
  text?: string;
  cartItem?: CartItem;
  options?: QuickOption[];
  bookingConfirmation?: BookingConfirmation;
  timestamp: Date;
}

export type ConversationStep =
  | 'greeting'
  | 'show-cart'
  | 'ask-rebook'
  | 'ask-dates'
  | 'ask-guests'
  | 'confirm-booking'
  | 'booked'
  | 'declined'
  | 'idle';

import type {
  CartItem,
  ChatMessage,
  ConversationStep,
  BookingConfirmation,
  QuickOption,
} from '../types/chat';

let messageCounter = 0;
const nextId = () => `msg-${++messageCounter}`;

export function createBotTextMessage(text: string): ChatMessage {
  return {
    id: nextId(),
    sender: 'bot',
    type: 'text',
    text,
    timestamp: new Date(),
  };
}

export function createUserTextMessage(text: string): ChatMessage {
  return {
    id: nextId(),
    sender: 'user',
    type: 'text',
    text,
    timestamp: new Date(),
  };
}

export function createCartItemMessage(cartItem: CartItem): ChatMessage {
  return {
    id: nextId(),
    sender: 'bot',
    type: 'cart-item',
    cartItem,
    timestamp: new Date(),
  };
}

export function createOptionsMessage(text: string, options: QuickOption[]): ChatMessage {
  return {
    id: nextId(),
    sender: 'bot',
    type: 'options',
    text,
    options,
    timestamp: new Date(),
  };
}

export function createBookingConfirmationMessage(
  confirmation: BookingConfirmation,
): ChatMessage {
  return {
    id: nextId(),
    sender: 'bot',
    type: 'booking-confirmation',
    text: 'Your booking is confirmed! Here are your details:',
    bookingConfirmation: confirmation,
    timestamp: new Date(),
  };
}

export function createCartExpiryWarningMessage(): ChatMessage {
  return createOptionsMessage(
    '⏰ **Your cart expires in 90 seconds!** Complete your booking now to secure your rate and room.',
    [
      { label: '🏨 Book Now', value: 'book-now' },
      { label: '⏭️ Remind Me Later', value: 'remind-later' },
    ],
  );
}

export function createCartExpiredMessage(): ChatMessage {
  return createBotTextMessage(
    '🚨 **Your cart has expired.** Your saved rates are no longer guaranteed. Start a new search to check current availability.',
  );
}

function generateConfirmationNumber(): string {
  return 'MRW' + Math.random().toString(36).toUpperCase().slice(2, 9);
}

export function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function parseDateInput(input: string): string | null {
  const formats = [
    /^(\d{4})-(\d{2})-(\d{2})$/,
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
    /^(\d{1,2})-(\d{1,2})-(\d{4})$/,
  ];

  for (const fmt of formats) {
    const m = input.trim().match(fmt);
    if (m) {
      if (fmt === formats[0]) {
        return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
      }
      return `${m[3]}-${m[1].padStart(2, '0')}-${m[2].padStart(2, '0')}`;
    }
  }

  const parsed = Date.parse(input);
  if (!isNaN(parsed)) {
    const d = new Date(parsed);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
  }

  return null;
}

export function calculateNights(checkIn: string, checkOut: string): number {
  const inDate = new Date(checkIn);
  const outDate = new Date(checkOut);
  const diff = outDate.getTime() - inDate.getTime();
  return Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)));
}

export interface RebookState {
  step: ConversationStep;
  selectedCartItem: CartItem | null;
  newCheckIn: string | null;
  newCheckOut: string | null;
  newGuests: number | null;
}

export function getInitialState(): RebookState {
  return {
    step: 'greeting',
    selectedCartItem: null,
    newCheckIn: null,
    newCheckOut: null,
    newGuests: null,
  };
}

export function getBotGreeting(cartCount: number): ChatMessage[] {
  return [
    createBotTextMessage(
      `Welcome back to Marriott! 🏨 I'm your personal booking assistant.`,
    ),
    createBotTextMessage(
      `I noticed you left ${cartCount === 1 ? 'a stay' : `${cartCount} stays`} in your cart without completing your reservation. I'd love to help you rebook!`,
    ),
  ];
}

export function getCartSelectionOptions(cartItems: CartItem[]): ChatMessage {
  const options: QuickOption[] = cartItems.map((item) => ({
    label: `${item.hotelName} — ${formatDate(item.checkIn)}`,
    value: item.id,
  }));
  options.push({ label: "No thanks, I'll browse later", value: 'decline' });

  return createOptionsMessage(
    'Which property would you like to rebook?',
    options,
  );
}

export function handleUserInput(
  userInput: string,
  state: RebookState,
  cartItems: CartItem[],
): { messages: ChatMessage[]; newState: RebookState } {
  const messages: ChatMessage[] = [];
  const newState = { ...state };
  const input = userInput.trim().toLowerCase();

  // Handle expiry-warning quick replies regardless of current step
  if (input === 'book-now') {
    if (state.step === 'show-cart' || state.step === 'greeting') {
      // Jump straight to cart selection
      messages.push(
        createBotTextMessage("Let's get you booked right away! Which property would you like?"),
        getCartSelectionOptions(cartItems),
      );
      newState.step = 'show-cart';
    } else {
      messages.push(
        createBotTextMessage("Let's keep going — you're almost there! 🏨"),
      );
    }
    return { messages, newState };
  }

  if (input === 'remind-later') {
    messages.push(
      createBotTextMessage(
        "No problem! Just be sure to complete your booking before your cart expires. I'll be here when you're ready. 😊",
      ),
    );
    return { messages, newState };
  }

  switch (state.step) {
    case 'show-cart': {
      const selected = cartItems.find((c) => c.id === userInput);
      if (selected) {
        newState.selectedCartItem = selected;
        newState.step = 'ask-dates';
        messages.push(
          createBotTextMessage(
            `Great choice! The **${selected.hotelName}** is an excellent property. 🌟`,
          ),
          createBotTextMessage(
            `Your original dates were **${formatDate(selected.checkIn)} – ${formatDate(selected.checkOut)}** for **${selected.guests} guest${selected.guests > 1 ? 's' : ''}**.`,
          ),
          createOptionsMessage(
            'Would you like to keep the same dates or choose new ones?',
            [
              { label: 'Keep same dates', value: 'same-dates' },
              { label: 'Choose new dates', value: 'new-dates' },
            ],
          ),
        );
      } else if (userInput === 'decline') {
        newState.step = 'declined';
        messages.push(
          createBotTextMessage(
            "No problem! Your cart is saved and ready whenever you are. Have a wonderful day! 😊",
          ),
        );
      } else {
        messages.push(
          createBotTextMessage(
            "I didn't quite catch that. Please select one of the options above.",
          ),
        );
      }
      break;
    }

    case 'ask-dates': {
      if (input === 'same-dates' && state.selectedCartItem) {
        newState.newCheckIn = state.selectedCartItem.checkIn;
        newState.newCheckOut = state.selectedCartItem.checkOut;
        newState.step = 'ask-guests';
        messages.push(
          createBotTextMessage(`Perfect! Keeping the original dates.`),
          createOptionsMessage(
            `How many guests will be staying? (Your previous booking was for ${state.selectedCartItem.guests})`,
            [
              { label: '1 Guest', value: '1' },
              { label: '2 Guests', value: '2' },
              { label: '3 Guests', value: '3' },
              { label: '4 Guests', value: '4' },
            ],
          ),
        );
      } else if (input === 'new-dates') {
        newState.step = 'ask-dates';
        newState.newCheckIn = null;
        messages.push(
          createBotTextMessage(
            "I'd love to help you find the perfect dates! Please enter your check-in date (e.g., 2026-08-10 or 08/10/2026):",
          ),
        );
        newState.step = 'ask-dates';
        newState.newCheckIn = '__awaiting-checkin__';
      } else if (newState.newCheckIn === '__awaiting-checkin__') {
        const checkIn = parseDateInput(userInput);
        if (checkIn) {
          newState.newCheckIn = checkIn;
          messages.push(
            createBotTextMessage(
              `Check-in set to **${formatDate(checkIn)}**. Now please enter your check-out date:`,
            ),
          );
        } else {
          messages.push(
            createBotTextMessage(
              "I couldn't understand that date. Please use a format like **2026-08-10** or **08/10/2026**.",
            ),
          );
        }
      } else if (newState.newCheckIn && newState.newCheckIn !== '__awaiting-checkin__' && !newState.newCheckOut) {
        const checkOut = parseDateInput(userInput);
        if (checkOut && checkOut > newState.newCheckIn) {
          newState.newCheckOut = checkOut;
          newState.step = 'ask-guests';
          const nights = calculateNights(newState.newCheckIn, checkOut);
          messages.push(
            createBotTextMessage(
              `Check-out set to **${formatDate(checkOut)}** — that's **${nights} night${nights > 1 ? 's' : ''}**! ✨`,
            ),
            createOptionsMessage(
              `How many guests will be staying?`,
              [
                { label: '1 Guest', value: '1' },
                { label: '2 Guests', value: '2' },
                { label: '3 Guests', value: '3' },
                { label: '4 Guests', value: '4' },
              ],
            ),
          );
        } else if (checkOut && checkOut <= newState.newCheckIn) {
          messages.push(
            createBotTextMessage(
              "Check-out must be after check-in. Please try again:",
            ),
          );
        } else {
          messages.push(
            createBotTextMessage(
              "I couldn't understand that date. Please use a format like **2026-08-10** or **08/10/2026**.",
            ),
          );
        }
      } else {
        messages.push(
          createBotTextMessage(
            "Please select whether to keep the same dates or choose new ones.",
          ),
        );
      }
      break;
    }

    case 'ask-guests': {
      const guestCount = parseInt(userInput, 10);
      if (guestCount >= 1 && guestCount <= 4 && state.selectedCartItem) {
        newState.newGuests = guestCount;
        newState.step = 'confirm-booking';

        const checkIn = newState.newCheckIn!;
        const checkOut = newState.newCheckOut!;
        const nights = calculateNights(checkIn, checkOut);
        const total = state.selectedCartItem.pricePerNight * nights;

        messages.push(
          createBotTextMessage(`Here's your booking summary:`),
          createOptionsMessage(
            `**${state.selectedCartItem.hotelName}**\n📅 ${formatDate(checkIn)} – ${formatDate(checkOut)} (${nights} night${nights > 1 ? 's' : ''})\n👥 ${guestCount} guest${guestCount > 1 ? 's' : ''}\n🛏 ${state.selectedCartItem.roomType}\n💰 $${state.selectedCartItem.pricePerNight}/night · Total: **$${total.toLocaleString()}**`,
            [
              { label: '✅ Confirm & Book Now', value: 'confirm' },
              { label: '✏️ Change Dates', value: 'change-dates' },
              { label: '❌ Cancel', value: 'cancel' },
            ],
          ),
        );
      } else {
        messages.push(
          createBotTextMessage(
            "Please select the number of guests from the options above.",
          ),
        );
      }
      break;
    }

    case 'confirm-booking': {
      if (input === 'confirm' && state.selectedCartItem) {
        const checkIn = newState.newCheckIn!;
        const checkOut = newState.newCheckOut!;
        const nights = calculateNights(checkIn, checkOut);
        const total = state.selectedCartItem.pricePerNight * nights;

        const confirmation: BookingConfirmation = {
          confirmationNumber: generateConfirmationNumber(),
          hotelName: state.selectedCartItem.hotelName,
          checkIn,
          checkOut,
          guests: newState.newGuests!,
          roomType: state.selectedCartItem.roomType,
          totalPrice: total,
        };

        newState.step = 'booked';
        messages.push(
          createBookingConfirmationMessage(confirmation),
          createBotTextMessage(
            "🎉 You're all set! A confirmation email has been sent to your registered Marriott Bonvoy account. We look forward to welcoming you! 🌟",
          ),
          createOptionsMessage(
            'Is there anything else I can help you with?',
            [
              { label: '🏨 Browse More Properties', value: 'browse' },
              { label: '✉️ Send Confirmation Email', value: 'email' },
              { label: '👋 Done for Now', value: 'done' },
            ],
          ),
        );
      } else if (input === 'change-dates' && state.selectedCartItem) {
        newState.step = 'ask-dates';
        newState.newCheckIn = null;
        newState.newCheckOut = null;
        messages.push(
          createBotTextMessage(
            "Let's update your dates! Please enter your new check-in date (e.g., 2026-08-10):",
          ),
        );
        newState.newCheckIn = '__awaiting-checkin__';
      } else if (input === 'cancel') {
        newState.step = 'declined';
        messages.push(
          createBotTextMessage(
            "No worries! Your cart has been saved. You can rebook any time. Have a great day! 😊",
          ),
        );
      } else {
        messages.push(
          createBotTextMessage(
            "Please select one of the options above to proceed.",
          ),
        );
      }
      break;
    }

    case 'booked': {
      if (input === 'browse') {
        messages.push(
          createBotTextMessage(
            "I'd love to help you explore more! Visit marriott.com/hotels to browse thousands of properties worldwide. 🌍",
          ),
        );
      } else if (input === 'email') {
        messages.push(
          createBotTextMessage(
            "✉️ A copy of your confirmation has been sent to your email on file with your Marriott Bonvoy account.",
          ),
        );
      } else {
        messages.push(
          createBotTextMessage(
            "Thank you for choosing Marriott! We look forward to making your stay exceptional. Safe travels! ✈️",
          ),
        );
        newState.step = 'idle';
      }
      break;
    }

    case 'declined':
    case 'idle': {
      messages.push(
        createBotTextMessage(
          "Is there anything else I can help you with today?",
        ),
      );
      break;
    }

    default:
      messages.push(
        createBotTextMessage("I'm not sure how to respond to that. Can you try again?"),
      );
  }

  return { messages, newState };
}

import { useState } from 'react'
import {
  ThemeProvider,
  CssBaseline,
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  TextField,
  MenuItem,
  Divider,
  IconButton,
  InputAdornment,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import PeopleIcon from '@mui/icons-material/People'
import FacebookIcon from '@mui/icons-material/Facebook'
import TwitterIcon from '@mui/icons-material/Twitter'
import InstagramIcon from '@mui/icons-material/Instagram'
import YouTubeIcon from '@mui/icons-material/YouTube'
import marriottTheme from './theme/marriottTheme'
import ChatbotWidget from './components/ChatbotWidget'

const deals = [
  {
    title: 'Members-Only Rate',
    subtitle: 'Save up to 10% when you sign in',
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&h=400&fit=crop',
    tag: 'EXCLUSIVE',
    tagColor: '#C8102E',
  },
  {
    title: 'Advance Purchase',
    subtitle: 'Book 21 days ahead and save up to 20%',
    image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=600&h=400&fit=crop',
    tag: 'DEAL',
    tagColor: '#1A5276',
  },
  {
    title: 'Points + Cash',
    subtitle: 'Use Marriott Bonvoy® points toward your stay',
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&h=400&fit=crop',
    tag: 'BONVOY',
    tagColor: '#B5975A',
  },
]

const destinations = [
  {
    name: 'New York City',
    country: 'USA',
    image: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=500&h=340&fit=crop',
    properties: 38,
  },
  {
    name: 'Paris',
    country: 'France',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=500&h=340&fit=crop',
    properties: 19,
  },
  {
    name: 'Dubai',
    country: 'UAE',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=500&h=340&fit=crop',
    properties: 27,
  },
  {
    name: 'Tokyo',
    country: 'Japan',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=500&h=340&fit=crop',
    properties: 15,
  },
  {
    name: 'Miami Beach',
    country: 'USA',
    image: 'https://images.unsplash.com/photo-1514214246283-d427a95c5d2f?w=500&h=340&fit=crop',
    properties: 24,
  },
  {
    name: 'London',
    country: 'UK',
    image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=500&h=340&fit=crop',
    properties: 31,
  },
]

const luxuryBrands = [
  { name: 'The Ritz-Carlton', tier: 'Luxury' },
  { name: 'St. Regis', tier: 'Luxury' },
  { name: 'W Hotels', tier: 'Luxury' },
  { name: 'The Luxury Collection', tier: 'Luxury' },
  { name: 'JW Marriott', tier: 'Luxury' },
  { name: 'EDITION', tier: 'Luxury' },
]

const premiumBrands = [
  { name: 'Marriott Hotels', tier: 'Premium' },
  { name: 'Sheraton', tier: 'Premium' },
  { name: 'Westin', tier: 'Premium' },
  { name: 'Renaissance', tier: 'Premium' },
  { name: 'Le Méridien', tier: 'Premium' },
  { name: 'Autograph Collection', tier: 'Premium' },
]

const selectBrands = [
  { name: 'Courtyard', tier: 'Select' },
  { name: 'Fairfield', tier: 'Select' },
  { name: 'Residence Inn', tier: 'Select' },
  { name: 'SpringHill Suites', tier: 'Select' },
  { name: 'AC Hotels', tier: 'Select' },
  { name: 'Moxy', tier: 'Select' },
]

const footerLinks = {
  Explore: ['Find a Hotel', 'Special Deals', 'Business Travel', 'Group Travel', 'Our Brands', 'Destinations'],
  'Marriott Bonvoy': ['Join for Free', 'Member Benefits', 'Points & Rewards', 'Redeem Points', 'Elite Status', 'Credit Cards'],
  'For Business': ['Business Travel', 'Groups & Events', 'Meetings & Conferences', 'Corporate Accounts', 'Marriott Bonvoy Business'],
  'About Marriott': ['Our Company', 'Investor Relations', 'Careers', 'Sustainability', 'News & Media', 'Contact Us'],
}

const navLinks = ['Find a Hotel', 'Destinations', 'Brands', 'Deals', 'For Business', 'Marriott Bonvoy']

function App() {
  const [destination, setDestination] = useState('')
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState('1 Room, 1 Guest')

  return (
    <ThemeProvider theme={marriottTheme}>
      <CssBaseline />

      {/* Utility Bar */}
      <Box
        sx={{
          bgcolor: '#3D3D3D',
          px: { xs: 2, md: 4 },
          py: 0.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 3,
        }}
      >
        {['English', 'Español', 'Français', 'Deutsch'].map((lang, i) => (
          <Typography
            key={lang}
            variant="caption"
            sx={{
              color: i === 0 ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.55)',
              cursor: 'pointer',
              fontFamily: 'Arial, sans-serif',
              fontSize: '11px',
              '&:hover': { color: 'white', textDecoration: 'underline' },
              display: { xs: 'none', sm: 'block' },
            }}
          >
            {lang}
          </Typography>
        ))}
        <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.3)', display: { xs: 'none', sm: 'block' } }} />
        <Typography
          variant="caption"
          sx={{
            color: 'rgba(255,255,255,0.8)',
            cursor: 'pointer',
            fontFamily: 'Arial, sans-serif',
            fontSize: '11px',
            '&:hover': { color: 'white', textDecoration: 'underline' },
          }}
        >
          Sign In
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: 'rgba(255,255,255,0.8)',
            cursor: 'pointer',
            fontFamily: 'Arial, sans-serif',
            fontSize: '11px',
            '&:hover': { color: 'white', textDecoration: 'underline' },
          }}
        >
          Join Marriott Bonvoy
        </Typography>
      </Box>

      {/* Main Navigation */}
      <Box
        component="nav"
        sx={{
          bgcolor: '#FFFFFF',
          borderBottom: '1px solid #E0E0E0',
          px: { xs: 2, md: 4 },
          py: 0,
          display: 'flex',
          alignItems: 'stretch',
          position: 'sticky',
          top: 0,
          zIndex: 1200,
          boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
        }}
      >
        {/* Logo */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            pr: 4,
            borderRight: '1px solid #E0E0E0',
            py: 1.5,
            mr: 2,
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1 }}>
            <Typography
              sx={{
                fontFamily: '"Times New Roman", Georgia, serif',
                fontWeight: 700,
                fontSize: '26px',
                color: '#C8102E',
                letterSpacing: '2px',
                lineHeight: 1,
                fontStyle: 'italic',
              }}
            >
              Marriott
            </Typography>
            <Typography
              sx={{
                fontFamily: 'Arial, sans-serif',
                fontSize: '7px',
                color: '#666',
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                mt: 0.3,
              }}
            >
              INTERNATIONAL
            </Typography>
          </Box>
        </Box>

        {/* Nav links */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'stretch', flex: 1 }}>
          {navLinks.map((link) => (
            <Box
              key={link}
              sx={{
                display: 'flex',
                alignItems: 'center',
                px: 2,
                py: 1.5,
                cursor: 'pointer',
                borderBottom: '3px solid transparent',
                '&:hover': {
                  borderBottomColor: '#C8102E',
                  '& .nav-link-text': { color: '#C8102E' },
                },
                transition: 'border-color 0.2s',
              }}
            >
              <Typography
                className="nav-link-text"
                sx={{
                  fontFamily: 'Arial, sans-serif',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#1A1A1A',
                  whiteSpace: 'nowrap',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  transition: 'color 0.2s',
                }}
              >
                {link}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Right side */}
        <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto', gap: 1 }}>
          <Button
            variant="contained"
            size="small"
            sx={{
              bgcolor: '#C8102E',
              color: 'white',
              fontFamily: 'Arial, sans-serif',
              fontSize: '12px',
              fontWeight: 700,
              px: 2,
              py: 0.75,
              borderRadius: '2px',
              '&:hover': { bgcolor: '#9B0B22' },
              display: { xs: 'none', sm: 'flex' },
            }}
          >
            Sign In
          </Button>
          <Button
            variant="outlined"
            size="small"
            sx={{
              borderColor: '#C8102E',
              color: '#C8102E',
              fontFamily: 'Arial, sans-serif',
              fontSize: '12px',
              fontWeight: 700,
              px: 2,
              py: 0.75,
              borderRadius: '2px',
              '&:hover': { bgcolor: 'rgba(200,16,46,0.05)', borderColor: '#9B0B22' },
              display: { xs: 'none', md: 'flex' },
            }}
          >
            Join Now
          </Button>
        </Box>
      </Box>

      {/* Hero + Search Section */}
      <Box sx={{ position: 'relative', bgcolor: '#000' }}>
        {/* Hero Image */}
        <Box
          sx={{
            width: '100%',
            height: { xs: 340, md: 520 },
            background: 'url(https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&h=700&fit=crop) center/cover no-repeat',
            opacity: 0.82,
          }}
        />

        {/* Hero Text Overlay */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pb: { xs: 8, md: 14 },
          }}
        >
          <Typography
            sx={{
              fontFamily: '"Times New Roman", Georgia, serif',
              fontSize: { xs: '28px', md: '52px' },
              fontWeight: 700,
              color: '#FFFFFF',
              textAlign: 'center',
              textShadow: '0 2px 8px rgba(0,0,0,0.5)',
              px: 2,
            }}
          >
            Where Will You Go Next?
          </Typography>
          <Typography
            sx={{
              fontFamily: 'Arial, sans-serif',
              fontSize: { xs: '14px', md: '18px' },
              color: 'rgba(255,255,255,0.9)',
              mt: 1.5,
              textShadow: '0 1px 4px rgba(0,0,0,0.5)',
              px: 2,
              textAlign: 'center',
            }}
          >
            Over 8,000 properties in 139 countries and territories
          </Typography>
        </Box>

        {/* Booking Widget — overlapping the hero bottom */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: { xs: '96%', lg: '90%' },
            maxWidth: 1100,
            mb: { xs: -8, md: -9 },
          }}
        >
          <Box
            sx={{
              bgcolor: '#FFFFFF',
              boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
              borderTop: '3px solid #C8102E',
            }}
          >
            {/* Booking Tabs */}
            <Box sx={{ display: 'flex', borderBottom: '1px solid #E0E0E0' }}>
              {['Hotels', 'Packages', 'Experiences'].map((tab, i) => (
                <Box
                  key={tab}
                  sx={{
                    px: 3,
                    py: 1.25,
                    cursor: 'pointer',
                    borderBottom: i === 0 ? '2px solid #C8102E' : '2px solid transparent',
                    mb: '-1px',
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: 'Arial, sans-serif',
                      fontSize: '13px',
                      fontWeight: i === 0 ? 700 : 500,
                      color: i === 0 ? '#C8102E' : '#5C5C5C',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    {tab}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* Search Form */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                alignItems: { xs: 'stretch', md: 'center' },
                p: 2,
                gap: 1,
              }}
            >
              {/* Destination */}
              <Box sx={{ flex: 2.5, minWidth: 0 }}>
                <Typography sx={{ fontFamily: 'Arial, sans-serif', fontSize: '10px', fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '0.8px', mb: 0.5 }}>
                  Where?
                </Typography>
                <TextField
                  variant="outlined"
                  size="small"
                  fullWidth
                  placeholder="City, hotel, landmark, or address"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationOnIcon sx={{ fontSize: 18, color: '#C8102E' }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '2px',
                      '& fieldset': { borderColor: '#CCCCCC' },
                      '&:hover fieldset': { borderColor: '#C8102E' },
                      '&.Mui-focused fieldset': { borderColor: '#C8102E' },
                    },
                    '& input': { fontFamily: 'Arial, sans-serif', fontSize: '13px' },
                  }}
                />
              </Box>

              {/* Check In */}
              <Box sx={{ flex: 1.4, minWidth: 0 }}>
                <Typography sx={{ fontFamily: 'Arial, sans-serif', fontSize: '10px', fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '0.8px', mb: 0.5 }}>
                  Check-In
                </Typography>
                <TextField
                  variant="outlined"
                  size="small"
                  fullWidth
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarTodayIcon sx={{ fontSize: 16, color: '#C8102E' }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '2px',
                      '& fieldset': { borderColor: '#CCCCCC' },
                      '&:hover fieldset': { borderColor: '#C8102E' },
                      '&.Mui-focused fieldset': { borderColor: '#C8102E' },
                    },
                    '& input': { fontFamily: 'Arial, sans-serif', fontSize: '13px' },
                  }}
                />
              </Box>

              {/* Check Out */}
              <Box sx={{ flex: 1.4, minWidth: 0 }}>
                <Typography sx={{ fontFamily: 'Arial, sans-serif', fontSize: '10px', fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '0.8px', mb: 0.5 }}>
                  Check-Out
                </Typography>
                <TextField
                  variant="outlined"
                  size="small"
                  fullWidth
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarTodayIcon sx={{ fontSize: 16, color: '#C8102E' }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '2px',
                      '& fieldset': { borderColor: '#CCCCCC' },
                      '&:hover fieldset': { borderColor: '#C8102E' },
                      '&.Mui-focused fieldset': { borderColor: '#C8102E' },
                    },
                    '& input': { fontFamily: 'Arial, sans-serif', fontSize: '13px' },
                  }}
                />
              </Box>

              {/* Rooms & Guests */}
              <Box sx={{ flex: 1.6, minWidth: 0 }}>
                <Typography sx={{ fontFamily: 'Arial, sans-serif', fontSize: '10px', fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '0.8px', mb: 0.5 }}>
                  Rooms &amp; Guests
                </Typography>
                <TextField
                  select
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <PeopleIcon sx={{ fontSize: 17, color: '#C8102E' }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '2px',
                      '& fieldset': { borderColor: '#CCCCCC' },
                      '&:hover fieldset': { borderColor: '#C8102E' },
                      '&.Mui-focused fieldset': { borderColor: '#C8102E' },
                    },
                    '& .MuiSelect-select': { fontFamily: 'Arial, sans-serif', fontSize: '13px' },
                  }}
                >
                  {['1 Room, 1 Guest', '1 Room, 2 Guests', '2 Rooms, 2 Guests', '2 Rooms, 4 Guests', '3+ Rooms'].map((opt) => (
                    <MenuItem key={opt} value={opt} sx={{ fontFamily: 'Arial, sans-serif', fontSize: '13px' }}>
                      {opt}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>

              {/* Search Button */}
              <Box sx={{ display: 'flex', alignItems: 'flex-end', pt: { xs: 0, md: 2.5 } }}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<SearchIcon />}
                  sx={{
                    bgcolor: '#C8102E',
                    color: 'white',
                    fontFamily: 'Arial, sans-serif',
                    fontSize: '14px',
                    fontWeight: 700,
                    px: 3,
                    py: 1,
                    borderRadius: '2px',
                    whiteSpace: 'nowrap',
                    '&:hover': { bgcolor: '#9B0B22' },
                    height: 40,
                    minWidth: { xs: '100%', md: 100 },
                  }}
                >
                  Find
                </Button>
              </Box>
            </Box>

            {/* Special rates link */}
            <Box sx={{ px: 2, pb: 1.5 }}>
              <Typography
                sx={{
                  fontFamily: 'Arial, sans-serif',
                  fontSize: '12px',
                  color: '#C8102E',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.5,
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                Special Rates, Redemptions &amp; Corporate Accounts <ExpandMoreIcon sx={{ fontSize: 16 }} />
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Spacer for booking widget overlap */}
      <Box sx={{ height: { xs: 64, md: 72 }, bgcolor: '#F8F8F8' }} />

      {/* Cart Reminder Banner */}
      <Box
        sx={{
          bgcolor: '#FFF8E1',
          borderBottom: '2px solid #B5975A',
          py: 1.25,
          px: { xs: 2, md: 4 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
        }}
      >
        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#B5975A' }} />
        <Typography variant="body2" sx={{ fontFamily: 'Arial, sans-serif', fontWeight: 600, color: '#3D3D3D', fontSize: '13px' }}>
          You have saved stays waiting — chat with our assistant to complete your booking
        </Typography>
        <Button
          size="small"
          variant="text"
          sx={{ color: '#C8102E', fontFamily: 'Arial, sans-serif', fontSize: '12px', fontWeight: 700, p: 0, minWidth: 'auto', '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' } }}
        >
          Resume →
        </Button>
      </Box>

      {/* Featured Deals */}
      <Box sx={{ bgcolor: '#FFFFFF', py: 6 }}>
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography
              sx={{
                fontFamily: '"Times New Roman", Georgia, serif',
                fontSize: { xs: '22px', md: '28px' },
                fontWeight: 700,
                color: '#1A1A1A',
              }}
            >
              Featured Deals &amp; Offers
            </Typography>
            <Typography
              sx={{
                fontFamily: 'Arial, sans-serif',
                fontSize: '13px',
                color: '#C8102E',
                cursor: 'pointer',
                fontWeight: 600,
                '&:hover': { textDecoration: 'underline' },
                display: { xs: 'none', sm: 'block' },
              }}
            >
              View All Deals →
            </Typography>
          </Box>
          <Grid container spacing={3}>
            {deals.map((deal) => (
              <Grid key={deal.title} size={{ xs: 12, sm: 4 }}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    borderRadius: '2px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    transition: 'box-shadow 0.2s, transform 0.2s',
                    '&:hover': { boxShadow: '0 6px 20px rgba(0,0,0,0.18)', transform: 'translateY(-3px)' },
                    overflow: 'hidden',
                  }}
                >
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia component="img" height="210" image={deal.image} alt={deal.title} />
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 12,
                        left: 12,
                        bgcolor: deal.tagColor,
                        color: 'white',
                        px: 1.25,
                        py: 0.35,
                        borderRadius: '1px',
                      }}
                    >
                      <Typography sx={{ fontFamily: 'Arial, sans-serif', fontSize: '10px', fontWeight: 700, letterSpacing: '1px' }}>
                        {deal.tag}
                      </Typography>
                    </Box>
                  </Box>
                  <CardContent sx={{ p: 2 }}>
                    <Typography
                      sx={{ fontFamily: '"Times New Roman", Georgia, serif', fontSize: '17px', fontWeight: 700, color: '#1A1A1A', mb: 0.5 }}
                    >
                      {deal.title}
                    </Typography>
                    <Typography sx={{ fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#5C5C5C', mb: 1.5 }}>
                      {deal.subtitle}
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: 'Arial, sans-serif',
                        fontSize: '12px',
                        color: '#C8102E',
                        fontWeight: 700,
                        cursor: 'pointer',
                        '&:hover': { textDecoration: 'underline' },
                      }}
                    >
                      Learn More →
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Destinations */}
      <Box sx={{ bgcolor: '#F5F5F5', py: 6 }}>
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography
              sx={{
                fontFamily: '"Times New Roman", Georgia, serif',
                fontSize: { xs: '22px', md: '28px' },
                fontWeight: 700,
                color: '#1A1A1A',
              }}
            >
              Explore Top Destinations
            </Typography>
            <Typography
              sx={{
                fontFamily: 'Arial, sans-serif',
                fontSize: '13px',
                color: '#C8102E',
                cursor: 'pointer',
                fontWeight: 600,
                '&:hover': { textDecoration: 'underline' },
                display: { xs: 'none', sm: 'block' },
              }}
            >
              View All Destinations →
            </Typography>
          </Box>
          <Grid container spacing={2}>
            {destinations.map((dest) => (
              <Grid key={dest.name} size={{ xs: 6, sm: 4, md: 2 }}>
                <Box
                  sx={{
                    position: 'relative',
                    borderRadius: '2px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    height: { xs: 160, md: 200 },
                    '&:hover .dest-overlay': { bgcolor: 'rgba(0,0,0,0.45)' },
                    '&:hover .dest-name': { letterSpacing: '1.5px' },
                  }}
                >
                  <Box
                    component="img"
                    src={dest.image}
                    alt={dest.name}
                    sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <Box
                    className="dest-overlay"
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      bgcolor: 'rgba(0,0,0,0.3)',
                      transition: 'background-color 0.3s',
                    }}
                  />
                  <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, p: 1.5 }}>
                    <Typography
                      className="dest-name"
                      sx={{
                        fontFamily: '"Times New Roman", Georgia, serif',
                        fontSize: { xs: '14px', md: '16px' },
                        fontWeight: 700,
                        color: 'white',
                        lineHeight: 1.2,
                        transition: 'letter-spacing 0.3s',
                      }}
                    >
                      {dest.name}
                    </Typography>
                    <Typography sx={{ fontFamily: 'Arial, sans-serif', fontSize: '11px', color: 'rgba(255,255,255,0.8)' }}>
                      {dest.properties} properties
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Marriott Bonvoy CTA */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 100%)',
          py: { xs: 6, md: 8 },
          px: 2,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'url(https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1600&h=500&fit=crop) center/cover',
            opacity: 0.15,
          }}
        />
        <Container maxWidth="md" sx={{ position: 'relative', textAlign: 'center' }}>
          <Typography
            sx={{
              fontFamily: 'Arial, sans-serif',
              fontSize: '11px',
              fontWeight: 700,
              color: '#B5975A',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              mb: 1.5,
            }}
          >
            Marriott Bonvoy®
          </Typography>
          <Typography
            sx={{
              fontFamily: '"Times New Roman", Georgia, serif',
              fontSize: { xs: '26px', md: '40px' },
              fontWeight: 700,
              color: '#FFFFFF',
              mb: 2,
            }}
          >
            Earn Points. Live the Journey.
          </Typography>
          <Typography
            sx={{
              fontFamily: 'Arial, sans-serif',
              fontSize: { xs: '14px', md: '16px' },
              color: 'rgba(255,255,255,0.75)',
              mb: 4,
              maxWidth: 560,
              mx: 'auto',
            }}
          >
            Join Marriott Bonvoy® and earn points on every stay. Redeem for free nights, flights,
            experiences, and more across 30+ extraordinary brands.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              sx={{
                bgcolor: '#C8102E',
                color: 'white',
                fontFamily: 'Arial, sans-serif',
                fontWeight: 700,
                fontSize: '14px',
                px: 4,
                py: 1.25,
                borderRadius: '2px',
                '&:hover': { bgcolor: '#9B0B22' },
              }}
            >
              Join for Free
            </Button>
            <Button
              variant="outlined"
              size="large"
              sx={{
                borderColor: 'rgba(255,255,255,0.5)',
                color: 'white',
                fontFamily: 'Arial, sans-serif',
                fontWeight: 700,
                fontSize: '14px',
                px: 4,
                py: 1.25,
                borderRadius: '2px',
                '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.08)' },
              }}
            >
              Sign In to Your Account
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Our Brands */}
      <Box sx={{ bgcolor: '#FFFFFF', py: 6 }}>
        <Container maxWidth="xl">
          <Typography
            sx={{
              fontFamily: '"Times New Roman", Georgia, serif',
              fontSize: { xs: '22px', md: '28px' },
              fontWeight: 700,
              color: '#1A1A1A',
              mb: 1,
            }}
          >
            Our Portfolio of Brands
          </Typography>
          <Typography sx={{ fontFamily: 'Arial, sans-serif', fontSize: '14px', color: '#5C5C5C', mb: 4 }}>
            30+ extraordinary hotel brands to match every travel style
          </Typography>

          {[
            { label: 'Luxury', brands: luxuryBrands },
            { label: 'Premium', brands: premiumBrands },
            { label: 'Select', brands: selectBrands },
          ].map(({ label, brands }) => (
            <Box key={label} sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Typography sx={{ fontFamily: 'Arial, sans-serif', fontSize: '11px', fontWeight: 700, color: '#666', letterSpacing: '2px', textTransform: 'uppercase' }}>
                  {label}
                </Typography>
                <Divider sx={{ flex: 1 }} />
              </Box>
              <Grid container spacing={1.5}>
                {brands.map((brand) => (
                  <Grid key={brand.name} size={{ xs: 6, sm: 4, md: 2 }}>
                    <Box
                      sx={{
                        border: '1px solid #E0E0E0',
                        p: 1.5,
                        textAlign: 'center',
                        cursor: 'pointer',
                        borderRadius: '2px',
                        transition: 'border-color 0.2s, box-shadow 0.2s',
                        '&:hover': { borderColor: '#C8102E', boxShadow: '0 2px 8px rgba(200,16,46,0.12)' },
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: '"Times New Roman", Georgia, serif',
                          fontSize: { xs: '12px', md: '13px' },
                          fontWeight: 700,
                          color: '#1A1A1A',
                          lineHeight: 1.3,
                        }}
                      >
                        {brand.name}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))}
        </Container>
      </Box>

      {/* Footer */}
      <Box component="footer" sx={{ bgcolor: '#1A1A1A', pt: 5, pb: 3 }}>
        <Container maxWidth="xl">
          {/* Footer logo + social */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 3 }}>
            <Box>
              <Typography
                sx={{
                  fontFamily: '"Times New Roman", Georgia, serif',
                  fontWeight: 700,
                  fontSize: '28px',
                  color: '#FFFFFF',
                  letterSpacing: '2px',
                  fontStyle: 'italic',
                  lineHeight: 1,
                }}
              >
                Marriott
              </Typography>
              <Typography sx={{ fontFamily: 'Arial, sans-serif', fontSize: '10px', color: 'rgba(255,255,255,0.4)', letterSpacing: '2px', textTransform: 'uppercase', mt: 0.5 }}>
                INTERNATIONAL
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {[FacebookIcon, TwitterIcon, InstagramIcon, YouTubeIcon].map((Icon, i) => (
                <IconButton
                  key={i}
                  size="small"
                  sx={{
                    color: 'rgba(255,255,255,0.5)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '2px',
                    width: 34,
                    height: 34,
                    '&:hover': { color: 'white', borderColor: 'rgba(255,255,255,0.6)', bgcolor: 'rgba(255,255,255,0.08)' },
                  }}
                >
                  <Icon sx={{ fontSize: 18 }} />
                </IconButton>
              ))}
            </Box>
          </Box>

          <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)', mb: 4 }} />

          {/* Footer columns */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {Object.entries(footerLinks).map(([heading, links]) => (
              <Grid key={heading} size={{ xs: 6, sm: 3 }}>
                <Typography
                  sx={{
                    fontFamily: 'Arial, sans-serif',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#FFFFFF',
                    letterSpacing: '1.5px',
                    textTransform: 'uppercase',
                    mb: 2,
                  }}
                >
                  {heading}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {links.map((link) => (
                    <Typography
                      key={link}
                      sx={{
                        fontFamily: 'Arial, sans-serif',
                        fontSize: '13px',
                        color: 'rgba(255,255,255,0.5)',
                        cursor: 'pointer',
                        '&:hover': { color: 'rgba(255,255,255,0.9)', textDecoration: 'underline' },
                      }}
                    >
                      {link}
                    </Typography>
                  ))}
                </Box>
              </Grid>
            ))}
          </Grid>

          <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)', mb: 2.5 }} />

          {/* Copyright + legal */}
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
            <Typography sx={{ fontFamily: 'Arial, sans-serif', fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>
              © 2026 Marriott International, Inc. All Rights Reserved. Marriott Proprietary Information
            </Typography>
            <Box sx={{ display: 'flex', gap: 2.5, flexWrap: 'wrap', justifyContent: 'center' }}>
              {['Privacy Center', 'Terms of Use', 'Cookie Preferences', 'Sitemap', 'Accessibility'].map((link) => (
                <Typography
                  key={link}
                  sx={{
                    fontFamily: 'Arial, sans-serif',
                    fontSize: '11px',
                    color: 'rgba(255,255,255,0.4)',
                    cursor: 'pointer',
                    '&:hover': { color: 'rgba(255,255,255,0.7)', textDecoration: 'underline' },
                  }}
                >
                  {link}
                </Typography>
              ))}
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Chatbot Widget */}
      <ChatbotWidget />
    </ThemeProvider>
  )
}

export default App

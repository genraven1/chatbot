import { ThemeProvider, CssBaseline, Box, Typography, Container, Grid, Card, CardContent, CardMedia, Button } from '@mui/material'
import HotelIcon from '@mui/icons-material/Hotel'
import StarIcon from '@mui/icons-material/Star'
import marriottTheme from './theme/marriottTheme'
import ChatbotWidget from './components/ChatbotWidget'

const featuredDestinations = [
  {
    name: 'Miami Beach',
    image: 'https://images.unsplash.com/photo-1514214246283-d427a95c5d2f?w=400&h=250&fit=crop',
    hotels: 24,
  },
  {
    name: 'New York City',
    image: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=400&h=250&fit=crop',
    hotels: 38,
  },
  {
    name: 'Paris, France',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&h=250&fit=crop',
    hotels: 19,
  },
]

function App() {
  return (
    <ThemeProvider theme={marriottTheme}>
      <CssBaseline />

      {/* Navigation */}
      <Box
        component="nav"
        sx={{
          bgcolor: 'primary.main',
          px: { xs: 2, md: 6 },
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <HotelIcon sx={{ color: 'white', fontSize: 28 }} />
          <Typography
            variant="h6"
            sx={{
              color: 'white',
              fontFamily: '"Georgia", serif',
              fontWeight: 700,
              letterSpacing: 1,
            }}
          >
            MARRIOTT
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 3 }}>
          {['Find a Hotel', 'Deals', 'Marriott Bonvoy', 'Sign In'].map((item) => (
            <Typography
              key={item}
              variant="body2"
              sx={{
                color: 'rgba(255,255,255,0.9)',
                cursor: 'pointer',
                '&:hover': { color: 'white', textDecoration: 'underline' },
                display: { xs: 'none', md: 'block' },
              }}
            >
              {item}
            </Typography>
          ))}
        </Box>
      </Box>

      {/* Hero Banner */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          py: { xs: 6, md: 10 },
          px: 2,
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background:
              'url(https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1400&h=600&fit=crop) center/cover',
            opacity: 0.2,
          }}
        />
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography
            variant="overline"
            sx={{ color: 'secondary.light', letterSpacing: 4, mb: 1, display: 'block' }}
          >
            MARRIOTT BONVOY
          </Typography>
          <Typography
            variant="h2"
            sx={{
              color: 'white',
              fontFamily: '"Georgia", serif',
              fontWeight: 700,
              fontSize: { xs: '2rem', md: '3.5rem' },
              mb: 2,
            }}
          >
            Where Will You Go Next?
          </Typography>
          <Typography
            variant="h6"
            sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 400, mb: 4 }}
          >
            Over 8,000 properties in 139 countries and territories
          </Typography>
          <Button
            variant="contained"
            size="large"
            sx={{
              bgcolor: 'secondary.main',
              color: 'white',
              px: 4,
              py: 1.5,
              fontSize: '1rem',
              '&:hover': { bgcolor: 'secondary.dark' },
            }}
          >
            Explore Destinations
          </Button>
        </Box>
      </Box>

      {/* Cart Reminder Banner */}
      <Box
        sx={{
          bgcolor: '#FFF8E1',
          borderBottom: '3px solid',
          borderColor: 'secondary.main',
          py: 1.5,
          px: { xs: 2, md: 6 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
        }}
      >
        <StarIcon sx={{ color: 'secondary.main', fontSize: 20 }} />
        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
          You have saved stays waiting! Chat with our assistant to rebook your experience.
        </Typography>
        <StarIcon sx={{ color: 'secondary.main', fontSize: 20 }} />
      </Box>

      {/* Featured Destinations */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography
          variant="h4"
          sx={{
            fontFamily: '"Georgia", serif',
            fontWeight: 700,
            mb: 1,
            textAlign: 'center',
          }}
        >
          Featured Destinations
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ textAlign: 'center', mb: 4 }}
        >
          Explore our top destinations handpicked for unforgettable experiences
        </Typography>

        <Grid container spacing={3}>
          {featuredDestinations.map((dest) => (
            <Grid key={dest.name} size={{ xs: 12, sm: 4 }}>
              <Card
                sx={{
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 },
                }}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={dest.image}
                  alt={dest.name}
                />
                <CardContent>
                  <Typography variant="h6" sx={{ fontFamily: '"Georgia", serif', fontWeight: 700 }}>
                    {dest.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {dest.hotels} properties available
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Bonvoy Promo */}
      <Box sx={{ bgcolor: 'primary.main', py: 6, px: 2, textAlign: 'center' }}>
        <Typography
          variant="h4"
          sx={{ color: 'white', fontFamily: '"Georgia", serif', fontWeight: 700, mb: 2 }}
        >
          Join Marriott Bonvoy
        </Typography>
        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.85)', mb: 3 }}>
          Earn points on every stay. Redeem for free nights, flights, and more.
        </Typography>
        <Button
          variant="outlined"
          size="large"
          sx={{
            color: 'white',
            borderColor: 'rgba(255,255,255,0.6)',
            px: 4,
            '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' },
          }}
        >
          Join for Free
        </Button>
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          bgcolor: '#1A1A1A',
          color: 'rgba(255,255,255,0.6)',
          py: 3,
          px: { xs: 2, md: 6 },
          textAlign: 'center',
        }}
      >
        <Typography variant="caption">
          © 2026 Marriott International, Inc. All Rights Reserved.
        </Typography>
      </Box>

      {/* Chatbot Widget */}
      <ChatbotWidget />
    </ThemeProvider>
  )
}

export default App

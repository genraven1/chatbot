import { useState } from 'react'
import { ThemeProvider, CssBaseline } from '@mui/material'
import marriottTheme from './theme/marriottTheme'
import type { SessionView } from './api/client'
import LoginScreen from './components/LoginScreen'
import CartScreen from './components/CartScreen'
import AnalyticsScreen from './components/AnalyticsScreen'

type Screen = 'login' | 'cart' | 'analytics'

function App() {
  const [screen, setScreen] = useState<Screen>('login')
  const [session, setSession] = useState<SessionView | null>(null)

  return (
    <ThemeProvider theme={marriottTheme}>
      <CssBaseline />
      {screen === 'login' && (
        <LoginScreen
          onLogin={(sess) => {
            setSession(sess)
            setScreen('cart')
          }}
        />
      )}
      {screen === 'cart' && session && (
        <CartScreen
          initialCartView={session.cart}
          user={session.user}
          onSignOut={() => {
            setSession(null)
            setScreen('login')
          }}
          onAnalytics={() => setScreen('analytics')}
        />
      )}
      {screen === 'analytics' && (
        <AnalyticsScreen onBack={() => setScreen('cart')} />
      )}
    </ThemeProvider>
  )
}

export default App

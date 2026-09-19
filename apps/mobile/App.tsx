import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StatusBar, Text, View } from 'react-native';
import { registerAuthTokenStore } from '@btc-chat/shared';
import { secureStoreTokenStore } from './src/secureStore';
import { checkAuth } from './src/api';
import { colors } from './src/theme';
import { LoginScreen } from './src/components/LoginScreen';
import { ChatScreen } from './src/components/ChatScreen';

// Register the platform token store so shared helpers persist/attach the
// session token on every request (web uses cookies instead).
registerAuthTokenStore(secureStoreTokenStore);

type AuthState = 'checking' | 'authenticated' | 'unauthenticated';

export default function App() {
  const [authState, setAuthState] = useState<AuthState>('checking');

  useEffect(() => {
    let cancelled = false;
    checkAuth().then((ok) => {
      if (!cancelled) setAuthState(ok ? 'authenticated' : 'unauthenticated');
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleAuthenticated = useCallback(() => setAuthState('authenticated'), []);
  const handleLogout = useCallback(() => setAuthState('unauthenticated'), []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      {authState === 'checking' ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={{ color: colors.textMuted, marginTop: 12, fontSize: 12 }}>
            Connecting to terminal…
          </Text>
        </View>
      ) : authState === 'authenticated' ? (
        <ChatScreen onLogout={handleLogout} />
      ) : (
        <LoginScreen onAuthenticated={handleAuthenticated} />
      )}
    </View>
  );
}

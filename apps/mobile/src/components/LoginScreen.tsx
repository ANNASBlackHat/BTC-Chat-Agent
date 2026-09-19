import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors } from '../theme';
import { login } from '../api';

interface LoginScreenProps {
  onAuthenticated: () => void;
}

export function LoginScreen({ onAuthenticated }: LoginScreenProps) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!password || loading) return;
    setLoading(true);
    setError(null);
    try {
      await login(password);
      onAuthenticated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{
        flex: 1,
        backgroundColor: colors.bg,
        justifyContent: 'center',
        padding: 24,
      }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View
        style={{
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.cardBorder,
          borderRadius: 20,
          padding: 24,
        }}
      >
        <View
          style={{
            alignSelf: 'center',
            width: 56,
            height: 56,
            borderRadius: 16,
            backgroundColor: colors.accentDim,
            borderWidth: 1,
            borderColor: colors.cardBorder,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
          }}
        >
          <Text style={{ fontSize: 24 }}>🛡️</Text>
        </View>

        <Text
          style={{
            color: colors.text,
            fontSize: 16,
            fontWeight: '800',
            letterSpacing: 2,
            textAlign: 'center',
            textTransform: 'uppercase',
          }}
        >
          BTC Chat Terminal
        </Text>
        <Text
          style={{
            color: colors.textMuted,
            fontSize: 11,
            fontWeight: '600',
            letterSpacing: 1.5,
            textAlign: 'center',
            marginTop: 6,
            textTransform: 'uppercase',
          }}
        >
          Secure Entry Required
        </Text>

        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Terminal password…"
          placeholderTextColor={colors.textMuted}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          onSubmitEditing={handleLogin}
          style={{
            marginTop: 24,
            backgroundColor: colors.bg,
            borderWidth: 1,
            borderColor: colors.cardBorder,
            borderRadius: 12,
            color: colors.text,
            paddingHorizontal: 14,
            paddingVertical: 12,
            fontSize: 14,
          }}
        />

        {error ? (
          <View
            style={{
              marginTop: 12,
              backgroundColor: 'rgba(244, 63, 94, 0.1)',
              borderWidth: 1,
              borderColor: 'rgba(244, 63, 94, 0.3)',
              borderRadius: 12,
              padding: 10,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.danger }} />
            <Text style={{ color: colors.danger, fontSize: 12, flex: 1 }}>{error}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          onPress={handleLogin}
          disabled={loading || !password}
          accessibilityRole="button"
          style={{
            marginTop: 16,
            backgroundColor: password ? colors.accent : colors.cardBorder,
            borderRadius: 12,
            height: 46,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
            gap: 8,
          }}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#04110b" />
          ) : (
            <Text
              style={{
                color: password ? '#04110b' : colors.textMuted,
                fontWeight: '800',
                fontSize: 13,
                letterSpacing: 1,
                textTransform: 'uppercase',
              }}
            >
              Access Terminal
            </Text>
          )}
        </TouchableOpacity>

        <Text
          style={{
            color: colors.textMuted,
            fontSize: 9,
            textAlign: 'center',
            marginTop: 20,
            letterSpacing: 1,
          }}
        >
          SECURE CONNECTION VIA WEB CRYPTO API
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

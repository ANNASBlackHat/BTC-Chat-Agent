import * as SecureStore from 'expo-secure-store';
import type { AuthTokenStore } from '@btc-chat/shared';

const TOKEN_KEY = 'btc_chat_session_token';

/** expo-secure-store-backed implementation of the shared auth token store. */
export const secureStoreTokenStore: AuthTokenStore = {
  async getToken() {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  async saveToken(token: string) {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  },
  async removeToken() {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  },
};

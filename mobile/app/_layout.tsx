import { useEffect } from 'react';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { TamaguiProvider } from 'tamagui';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  K2D_400Regular,
  K2D_500Medium,
  K2D_600SemiBold,
  K2D_700Bold,
} from '@expo-google-fonts/k2d';

import tamaguiConfig from '../tamagui.config';
import { useAuthStore } from '@/stores/auth.store';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

// Manter splash screen até carregar fontes e auth
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutos
    },
  },
});

export default function RootLayout() {
  const [loaded, error] = useFonts({
    K2D_400Regular,
    K2D_500Medium,
    K2D_600SemiBold,
    K2D_700Bold,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const { isAuthenticated, isLoading, loadStoredAuth } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  // Carregar auth salva no SecureStore
  useEffect(() => {
    loadStoredAuth();
  }, []);

  // Redirecionar baseado no estado de auth
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)/chat');
    }
  }, [isAuthenticated, segments, isLoading]);

  return (
    <QueryClientProvider client={queryClient}>
      <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
        <ThemeProvider value={DarkTheme}>
          <Stack>
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
        </ThemeProvider>
      </TamaguiProvider>
    </QueryClientProvider>
  );
}

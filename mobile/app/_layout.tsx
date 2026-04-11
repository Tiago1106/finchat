import { useEffect, useState, useRef } from 'react';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { TamaguiProvider } from 'tamagui';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

// Manter splash nativa visível até tudo estar pronto
SplashScreen.preventAutoHideAsync();

// Fade suave ao esconder a splash
SplashScreen.setOptions({
  duration: 500,
  fade: true,
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutos
    },
  },
});

export default function RootLayout() {
  const [fontsLoaded, fontsError] = useFonts({
    K2D_400Regular,
    K2D_500Medium,
    K2D_600SemiBold,
    K2D_700Bold,
  });

  const { isLoading: authLoading, loadStoredAuth } = useAuthStore();
  const [authChecked, setAuthChecked] = useState(false);
  const [onboardingSeen, setOnboardingSeen] = useState<boolean | null>(null);

  // Carregar auth e verificar onboarding em paralelo
  useEffect(() => {
    const init = async () => {
      const [, onboardingValue] = await Promise.all([
        loadStoredAuth(),
        AsyncStorage.getItem('hasSeenOnboarding'),
      ]);
      setOnboardingSeen(onboardingValue === 'true');
      setAuthChecked(true);
    };
    init();
  }, []);

  useEffect(() => {
    if (fontsError) throw fontsError;
  }, [fontsError]);

  // Só esconder splash quando fonts, auth E onboarding check estiverem prontos
  const appReady = fontsLoaded && authChecked && !authLoading && onboardingSeen !== null;

  useEffect(() => {
    if (appReady) {
      SplashScreen.hideAsync();
    }
  }, [appReady]);

  if (!appReady) {
    return null;
  }

  return <RootLayoutNav onboardingSeen={onboardingSeen} />;
}

interface RootLayoutNavProps {
  onboardingSeen: boolean;
}

function RootLayoutNav({ onboardingSeen }: RootLayoutNavProps) {
  const { isAuthenticated, needsBiometric } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const hasRedirectedToBiometric = useRef(false);

  // Redirecionar baseado no estado de auth, onboarding e biometria
  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';
    const inBiometric = segments[1] === 'biometric';

    if (!isAuthenticated && !inAuthGroup) {
      // Não autenticado — enviar para onboarding ou login
      hasRedirectedToBiometric.current = false;
      if (!onboardingSeen) {
        router.replace('/(auth)/onboarding');
      } else {
        router.replace('/(auth)/login');
      }
    } else if (isAuthenticated && needsBiometric && !inBiometric && !hasRedirectedToBiometric.current) {
      // Autenticado mas precisa desbloquear biometria
      hasRedirectedToBiometric.current = true;
      router.replace('/(auth)/biometric');
    } else if (isAuthenticated && !needsBiometric && inAuthGroup) {
      // Autenticado, biometria liberada, sair do auth group
      hasRedirectedToBiometric.current = false;
      router.replace('/(tabs)/chat');
    }
  }, [isAuthenticated, segments, needsBiometric]);

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

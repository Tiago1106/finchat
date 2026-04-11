import { useEffect, useState, useCallback } from 'react';
import { Alert, AppState } from 'react-native';
import { YStack, Text, XStack } from 'tamagui';
import * as LocalAuthentication from 'expo-local-authentication';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/auth.store';

// ============================================================
// Tela de Desbloqueio Biométrico — Adaptativa
// Face ID → scan icon | Fingerprint → finger-print icon | Fallback → keypad
// ============================================================

type BiometryInfo = {
  type: 'face' | 'fingerprint' | 'none';
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  hint: string;
};

function getBiometryInfo(types: LocalAuthentication.AuthenticationType[]): BiometryInfo {
  if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
    return {
      type: 'face',
      label: 'Face ID',
      icon: 'scan-outline',
      hint: 'Toque para desbloquear',
    };
  }
  if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
    return {
      type: 'fingerprint',
      label: 'impressão digital',
      icon: 'finger-print-outline',
      hint: 'Toque para desbloquear',
    };
  }
  return {
    type: 'none',
    label: 'senha do dispositivo',
    icon: 'keypad-outline',
    hint: 'Toque para desbloquear',
  };
}

export default function BiometricScreen() {
  const { clearBiometric, clearAuth } = useAuthStore();
  const [biometry, setBiometry] = useState<BiometryInfo | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Detectar tipo de biometria disponível
  useEffect(() => {
    const detect = async () => {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (hasHardware && isEnrolled) {
        const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
        setBiometry(getBiometryInfo(types));
      } else {
        // Sem biometria configurada — ir direto para o app
        setBiometry(getBiometryInfo([]));
      }
    };
    detect();
  }, []);

  const authenticate = useCallback(async () => {
    if (isAuthenticating) return;
    setIsAuthenticating(true);

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Desbloquear FinChat',
        cancelLabel: 'Cancelar',
        disableDeviceFallback: false,
        fallbackLabel: 'Usar senha',
      });

      if (result.success) {
        clearBiometric();
        // Navegação acontece automaticamente via root _layout (needsBiometric=false)
      } else if (result.error === 'user_cancel') {
        // Usuário cancelou — permitir tentar novamente
      } else {
        Alert.alert(
          'Falha na autenticação',
          'Não foi possível verificar sua identidade. Tente novamente.',
        );
      }
    } catch {
      Alert.alert('Erro', 'Ocorreu um erro ao tentar autenticar.');
    } finally {
      setIsAuthenticating(false);
    }
  }, [isAuthenticating, clearBiometric]);

  // Autenticar automaticamente ao montar
  useEffect(() => {
    if (biometry) {
      authenticate();
    }
  }, [biometry]);

  // Re-autenticar quando o app voltar ao foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active' && biometry && !isAuthenticating) {
        authenticate();
      }
    });
    return () => subscription.remove();
  }, [biometry, isAuthenticating, authenticate]);

  const handleFallback = async () => {
    await clearAuth();
    // clearAuth sets isAuthenticated=false, root _layout will redirect to login
  };

  if (!biometry) return null;

  return (
    <YStack
      flex={1}
      backgroundColor="$background"
      alignItems="center"
      justifyContent="center"
      paddingHorizontal={24}
      gap={32}
    >
      {/* Logo */}
      <Text
        fontFamily="$heading"
        fontSize={32}
        fontWeight="700"
        color="$accent"
      >
        FinChat
      </Text>

      {/* Subtítulo */}
      <Text
        fontFamily="$body"
        fontSize={16}
        color="$textSecondary"
      >
        Bem-vindo de volta!
      </Text>

      {/* Ícone biométrico */}
      <XStack
        pressStyle={{ opacity: 0.7 }}
        onPress={authenticate}
      >
        <YStack
          width={80}
          height={80}
          borderRadius={9999}
          backgroundColor="$surfaceElevated"
          borderColor="$borderSubtle"
          borderWidth={1}
          alignItems="center"
          justifyContent="center"
        >
          <Ionicons
            name={biometry.icon}
            size={40}
            color="#57F2BE"
          />
        </YStack>
      </XStack>

      {/* Hint */}
      <Text
        fontFamily="$body"
        fontSize={14}
        color="$textTertiary"
      >
        {biometry.hint}
      </Text>

      {/* Fallback — Entrar com senha */}
      <Text
        fontFamily="$body"
        fontSize={13}
        color="$accent"
        pressStyle={{ opacity: 0.7 }}
        onPress={handleFallback}
      >
        Entrar com senha
      </Text>
    </YStack>
  );
}

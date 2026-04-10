import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { YStack, Text, Input, XStack, Spinner } from 'tamagui';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/auth.store';
import { authService } from '@/services/auth';

export default function LoginScreen() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.login({
        email: email.trim().toLowerCase(),
        password,
      });

      await setAuth(response.user, response.access_token, response.refresh_token);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Email ou senha inválidos.';

      // Axios wraps the response error
      interface AxiosLikeError {
        response?: { data?: { message?: string } };
      }
      const axiosError = error as AxiosLikeError;
      const serverMessage = axiosError?.response?.data?.message;

      Alert.alert('Erro', serverMessage || message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#0F110E' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <YStack
        flex={1}
        backgroundColor="$background"
        paddingHorizontal={24}
        paddingTop={120}
        gap={24}
      >
        {/* Logo */}
        <YStack alignItems="center" gap={8}>
          <Text
            fontFamily="$heading"
            fontSize={32}
            fontWeight="700"
            color="$accent"
          >
            FinChat
          </Text>
          <Text
            fontFamily="$body"
            fontSize={14}
            color="$textSecondary"
          >
            Controle financeiro por conversa
          </Text>
        </YStack>

        {/* Formulário */}
        <YStack gap={16}>
          {/* E-mail */}
          <YStack gap={6}>
            <Text
              fontFamily="$body"
              fontSize={13}
              fontWeight="500"
              color="$textSecondary"
            >
              E-mail
            </Text>
            <Input
              value={email}
              onChangeText={setEmail}
              placeholder="seu@email.com"
              placeholderTextColor="$textTertiary"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              fontFamily="$body"
              fontSize={14}
              color="$textPrimary"
              backgroundColor="$surfaceElevated"
              borderColor="$borderSubtle"
              borderWidth={1}
              borderRadius={8}
              height={42}
              paddingHorizontal={14}
            />
          </YStack>

          {/* Senha */}
          <YStack gap={6}>
            <Text
              fontFamily="$body"
              fontSize={13}
              fontWeight="500"
              color="$textSecondary"
            >
              Senha
            </Text>
            <Input
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor="$textTertiary"
              secureTextEntry
              fontFamily="$body"
              fontSize={14}
              color="$textPrimary"
              backgroundColor="$surfaceElevated"
              borderColor="$borderSubtle"
              borderWidth={1}
              borderRadius={8}
              height={42}
              paddingHorizontal={14}
            />
          </YStack>
        </YStack>

        {/* Botão Entrar */}
        <XStack
          backgroundColor="$accent"
          borderRadius={6}
          height={44}
          alignItems="center"
          justifyContent="center"
          pressStyle={{ opacity: 0.85 }}
          onPress={isLoading ? undefined : handleLogin}
          opacity={isLoading ? 0.7 : 1}
        >
          {isLoading ? (
            <Spinner size="small" color="$textOnAccent" />
          ) : (
            <Text
              fontFamily="$body"
              fontSize={15}
              fontWeight="600"
              color="$textOnAccent"
            >
              Entrar
            </Text>
          )}
        </XStack>

        {/* Link Cadastro */}
        <Text
          fontFamily="$body"
          fontSize={13}
          color="$textTertiary"
          textAlign="center"
          pressStyle={{ opacity: 0.7 }}
          onPress={() => router.push('/(auth)/register')}
        >
          Não tem conta? Criar conta
        </Text>
      </YStack>
    </KeyboardAvoidingView>
  );
}

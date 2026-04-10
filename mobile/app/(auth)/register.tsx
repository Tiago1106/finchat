import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { YStack, Text, Input, XStack, Spinner } from 'tamagui';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/auth.store';
import { authService } from '@/services/auth';

export default function RegisterScreen() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Atenção', 'As senhas não coincidem.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Atenção', 'A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      await setAuth(response.user, response.access_token, response.refresh_token);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Não foi possível criar a conta.';

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
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <YStack
          flex={1}
          backgroundColor="$background"
          paddingHorizontal={24}
          paddingTop={100}
          paddingBottom={24}
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
              Crie sua conta gratuita
            </Text>
          </YStack>

          {/* Formulário */}
          <YStack gap={16}>
            {/* Nome */}
            <YStack gap={6}>
              <Text
                fontFamily="$body"
                fontSize={13}
                fontWeight="500"
                color="$textSecondary"
              >
                Nome
              </Text>
              <Input
                value={name}
                onChangeText={setName}
                placeholder="Seu nome"
                placeholderTextColor="$textTertiary"
                autoCapitalize="words"
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

            {/* Confirmar senha */}
            <YStack gap={6}>
              <Text
                fontFamily="$body"
                fontSize={13}
                fontWeight="500"
                color="$textSecondary"
              >
                Confirmar senha
              </Text>
              <Input
                value={confirmPassword}
                onChangeText={setConfirmPassword}
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

          {/* Botão Criar conta */}
          <XStack
            backgroundColor="$accent"
            borderRadius={6}
            height={44}
            alignItems="center"
            justifyContent="center"
            pressStyle={{ opacity: 0.85 }}
            onPress={isLoading ? undefined : handleRegister}
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
                Criar conta
              </Text>
            )}
          </XStack>

          {/* Link Login */}
          <Text
            fontFamily="$body"
            fontSize={13}
            color="$textTertiary"
            textAlign="center"
            pressStyle={{ opacity: 0.7 }}
            onPress={() => router.back()}
          >
            Já tem conta? Entrar
          </Text>
        </YStack>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

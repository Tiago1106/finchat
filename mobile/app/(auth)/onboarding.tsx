import { YStack, Text, XStack } from 'tamagui';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const ONBOARDING_KEY = 'hasSeenOnboarding';

export async function hasSeenOnboarding(): Promise<boolean> {
  const value = await AsyncStorage.getItem(ONBOARDING_KEY);
  return value === 'true';
}

export default function OnboardingScreen() {
  const router = useRouter();

  const handleStart = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    router.replace('/(auth)/register');
  };

  const handleLogin = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    router.replace('/(auth)/login');
  };

  return (
    <YStack
      flex={1}
      backgroundColor="$background"
    >
      {/* Conteúdo central */}
      <YStack
        flex={1}
        alignItems="center"
        justifyContent="center"
        gap={24}
        paddingHorizontal={32}
      >
        {/* Ícone */}
        <YStack
          width={100}
          height={100}
          borderRadius={9999}
          backgroundColor="$surfaceElevated"
          borderWidth={1}
          borderColor="$borderSubtle"
          alignItems="center"
          justifyContent="center"
        >
          <Ionicons name="chatbubble-outline" size={48} color="#57F2BE" />
        </YStack>

        {/* Título */}
        <Text
          fontFamily="$heading"
          fontSize={24}
          fontWeight="700"
          color="$textPrimary"
          textAlign="center"
        >
          {'Controle seus gastos\npor conversa'}
        </Text>

        {/* Descrição */}
        <Text
          fontFamily="$body"
          fontSize={14}
          color="$textSecondary"
          textAlign="center"
        >
          {'Diga quanto gastou em linguagem natural\ne o FinChat organiza tudo pra você.'}
        </Text>
      </YStack>

      {/* Botões no bottom */}
      <YStack
        alignItems="center"
        gap={16}
        paddingHorizontal={24}
        paddingBottom={48}
      >
        {/* Botão Começar */}
        <XStack
          backgroundColor="$accent"
          borderRadius={6}
          height={44}
          width="100%"
          alignItems="center"
          justifyContent="center"
          pressStyle={{ opacity: 0.85 }}
          onPress={handleStart}
        >
          <Text
            fontFamily="$body"
            fontSize={15}
            fontWeight="600"
            color="$textOnAccent"
          >
            Começar
          </Text>
        </XStack>

        {/* Link Já tenho conta */}
        <Text
          fontFamily="$body"
          fontSize={13}
          color="$accent"
          textAlign="center"
          pressStyle={{ opacity: 0.7 }}
          onPress={handleLogin}
        >
          Já tenho conta
        </Text>
      </YStack>
    </YStack>
  );
}

import { Stack, useRouter } from 'expo-router';
import { YStack, Text } from 'tamagui';

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <YStack
        flex={1}
        backgroundColor="$background"
        alignItems="center"
        justifyContent="center"
        padding={20}
      >
        <Text
          fontFamily="$body"
          fontSize={20}
          fontWeight="700"
          color="$textPrimary"
        >
          Tela não encontrada
        </Text>

        <Text
          fontFamily="$body"
          fontSize={14}
          color="$accent"
          marginTop={15}
          pressStyle={{ opacity: 0.7 }}
          onPress={() => router.replace('/(auth)/login')}
        >
          Voltar ao início
        </Text>
      </YStack>
    </>
  );
}

import { View, Text, StyleSheet } from 'react-native';

export default function LoginScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>FinChat</Text>
      <Text style={styles.subtitle}>Controle financeiro via chat com IA</Text>
      {/* TODO: Fase 4 — formulário de login */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F110E',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#57F2BE',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#B2B2B2',
  },
});

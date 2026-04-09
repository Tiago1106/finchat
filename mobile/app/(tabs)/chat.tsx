import { View, Text, StyleSheet } from 'react-native';

export default function ChatScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>FinChat</Text>
      </View>
      <View style={styles.chatArea}>
        <Text style={styles.welcome}>
          Olá! Sou o FinChat, seu assistente financeiro.
        </Text>
        <Text style={styles.hint}>
          Me diga seus gastos, como: "50 almoço débito" ou "300 ração 3x nubank"
        </Text>
      </View>
      {/* TODO: Fase 4 — chat input bar + mensagens */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F110E',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D2D',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  chatArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  welcome: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  hint: {
    fontSize: 14,
    color: '#777777',
    textAlign: 'center',
  },
});

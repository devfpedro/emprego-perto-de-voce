import { View, Text, StyleSheet, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tela de Login</Text>
      
      <View style={styles.buttonContainer}>
        <Button 
          title="Ir para Cadastro de Candidato" 
          onPress={() => router.push('/(auth)/cadastro-candidato')} 
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button 
          title="Ir para Cadastro de Empresa" 
          onPress={() => router.push('/(auth)/cadastro-empresa')} 
          color="#6c757d"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  buttonContainer: { width: '100%', marginVertical: 8 }
});
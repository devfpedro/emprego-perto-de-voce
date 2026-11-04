import { View, Text, StyleSheet, Button } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthService } from '../../service/api'; // <-- 1. Importa o serviço de API que criamos

export default function LoginScreen() {
  const router = useRouter();

  // <-- 2. Coloca a função aqui dentro do componente
  async function handleLogin() {
    try {
      const response = await AuthService.login('candidato@teste.com', '123456');
      console.log('Dados retornados com sucesso:', response.data);
      
      // Aqui você poderia redirecionar com base no tipo retornado:
      // if (response.data.user.tipo === 'candidato') router.push('/(candidato)/mapa');
    } catch (error) {
      console.error('Erro ao fazer login', error);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tela de Login</Text>
      
      {/* Botão novo para testar a chamada da API/Mock */}
      <View style={styles.buttonContainer}>
        <Button 
          title="Testar Login (Mock)" 
          onPress={handleLogin} 
          color="#28a745"
        />
      </View>

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
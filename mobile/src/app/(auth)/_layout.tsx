import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" options={{ title: 'Login' }} />
      <Stack.Screen name="cadastro-candidato" options={{ title: 'Cadastro de Candidato', headerShown: true }} />
      <Stack.Screen name="cadastro-empresa" options={{ title: 'Cadastro de Empresa', headerShown: true }} />
    </Stack>
  );
}
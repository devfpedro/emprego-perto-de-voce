import { Redirect } from 'expo-router';

export default function Index() {
  // Redireciona direto para o fluxo de autenticação (login) ao iniciar
  return <Redirect href="/(auth)/login" />;
}

// Esse arquivo serve como a primeira tela ou ponto de redirecionamento ao abrir o aplicativo. 
// Ele pode direcionar o  usuário para a tela de login ou verificar se já existe uma sessão ativa.
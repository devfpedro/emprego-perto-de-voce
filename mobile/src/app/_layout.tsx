
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const [carregando, setCarregando] = useState(true);

  const rotaAtual = segments[0];

  useEffect(() => {
    let ativo = true;

    async function verificarSessao() {
      try {
        const token = await AsyncStorage.getItem('@emprego_token');
        const perfil = await AsyncStorage.getItem('@emprego_perfil');

        if (!ativo || !rotaAtual) return;

        const emAreaAutenticada =
          rotaAtual === '(candidato)' || rotaAtual === '(empresa)';

        if (!token) {
          if (emAreaAutenticada) {
            router.replace('/(auth)/login' as any);
          }
          return;
        }

        if (perfil === 'empresa') {
          if (rotaAtual !== '(empresa)') {
            router.replace('/(empresa)/vagas' as any);
          }
          return;
        }

        if (perfil === 'candidato') {
          if (rotaAtual !== '(candidato)') {
            router.replace('/(candidato)/mapa' as any);
          }
          return;
        }

        await AsyncStorage.multiRemove([
          '@emprego_token',
          '@emprego_perfil',
          '@emprego_user_data',
        ]);

        router.replace('/(auth)/login' as any);
      } catch (erro) {
        console.error('Erro ao verificar sessão:', erro);
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    if (rotaAtual) {
      void verificarSessao();
    }

    return () => {
      ativo = false;
    };
  }, [rotaAtual, router]);

  return (
    <SafeAreaProvider>
      <View style={styles.appContainer}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(candidato)" />
          <Stack.Screen name="(empresa)" />
        </Stack>

        {carregando && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0b6643" />
          </View>
        )}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    zIndex: 1,
  },
});

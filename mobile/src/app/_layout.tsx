
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    verificarSessao();
  }, []);

  async function verificarSessao() {
    try {
      const token = await AsyncStorage.getItem('@emprego_token');
      const perfil = await AsyncStorage.getItem('@emprego_perfil');

      const emAreaAutenticada =
        segments[0] === '(candidato)' || segments[0] === '(empresa)';

      if (token) {
        if (segments[0] === '(auth)' || !segments[0]) {
          if (perfil === 'empresa') {
            router.replace('/(empresa)/vagas');
          } else {
            router.replace('/(candidato)/mapa');
          }
        }
      } else if (emAreaAutenticada) {
        router.replace('/(auth)/login' as any);
      }
    } catch (e) {
      console.error('Erro ao verificar sessão:', e);
    } finally {
      setCarregando(false);
    }
  }

  if (carregando) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0b6643" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(candidato)" />
        <Stack.Screen name="(empresa)" />
      </Stack>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
});

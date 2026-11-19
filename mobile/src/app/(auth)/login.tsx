
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthService, ApiError } from '../../service/api';

export default function LoginScreen() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'entrar' | 'criar'>('entrar');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [erroEmail, setErroEmail] = useState(false);
  const [erroSenha, setErroSenha] = useState(false);
  const [erroGeral, setErroGeral] = useState('');

  async function handleLogin() {
    setErroEmail(false);
    setErroSenha(false);
    setErroGeral('');

    let hasError = false;

    if (!email.trim() || !email.includes('@')) {
      setErroEmail(true);
      hasError = true;
    }

    if (!senha.trim()) {
      setErroSenha(true);
      hasError = true;
    }

    if (hasError) return;

    setLoading(true);

    try {
      const response = await AuthService.login(email.trim(), senha);
      const { token, perfil, usuario } = response.data;

      await AsyncStorage.setItem('@emprego_token', token);
      await AsyncStorage.setItem('@emprego_perfil', perfil);
      await AsyncStorage.setItem('@emprego_user_data', JSON.stringify(usuario));

      if (perfil === 'empresa') {
        router.replace('/(empresa)/vagas');
      } else {
        router.replace('/(candidato)/mapa');
      }
    } catch (error) {
      if (error instanceof ApiError) {
        setErroGeral(error.message);
      } else {
        setErroGeral('Não foi possível conectar ao servidor. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  }

  function handleTabSwitch(tab: 'entrar' | 'criar') {
    setActiveTab(tab);

    if (tab === 'criar') {
      router.push('/(auth)/cadastro-candidato');
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.headerContainer}>
        <View style={styles.brandBadge}>
          <Ionicons name="location-outline" size={20} color="#0b6643" />
        </View>
        <Text style={styles.brandSub}>Emprego Perto de Você</Text>
        <Text style={styles.title}>Vagas perto de onde você mora.</Text>
        <Text style={styles.subtitle}>
          Encontre empresas da sua região com vagas abertas, direto no mapa.
        </Text>
      </View>

      <View style={styles.cardContainer}>
        {erroGeral ? (
          <View style={styles.alertError}>
            <Text style={styles.alertErrorText}>{erroGeral}</Text>
          </View>
        ) : null}

        <View style={styles.segmentContainer}>
          <TouchableOpacity
            style={[styles.segmentButton, activeTab === 'entrar' && styles.segmentActive]}
            onPress={() => handleTabSwitch('entrar')}
          >
            <Text style={[styles.segmentText, activeTab === 'entrar' && styles.segmentTextActive]}>
              Entrar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segmentButton, activeTab === 'criar' && styles.segmentActive]}
            onPress={() => handleTabSwitch('criar')}
          >
            <Text style={[styles.segmentText, activeTab === 'criar' && styles.segmentTextActive]}>
              Criar conta
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={[styles.input, erroEmail && styles.inputError]}
            placeholder="voce@email.com"
            placeholderTextColor="#9ca3af"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          {erroEmail && <Text style={styles.errorText}>Informe um e-mail válido.</Text>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Senha</Text>
          <TextInput
            style={[styles.input, erroSenha && styles.inputError]}
            placeholder="Sua senha"
            placeholderTextColor="#9ca3af"
            secureTextEntry
            value={senha}
            onChangeText={setSenha}
          />
          {erroSenha && <Text style={styles.errorText}>Informe sua senha.</Text>}
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonLoading]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color="#ffffff" />
              <Text style={styles.submitButtonText}>Entrar</Text>
            </View>
          ) : (
            <Text style={styles.submitButtonText}>Entrar</Text>
          )}
        </TouchableOpacity>

        <View style={styles.privacyBox}>
          <Ionicons name="lock-closed-outline" size={18} color="#0b6643" style={styles.privacyIcon} />
          <Text style={styles.privacyText}>
            Seu endereço nunca é exibido. Usamos só a região aproximada para mostrar vagas.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#0b6643' },
  headerContainer: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 40, backgroundColor: '#0b6643' },
  brandBadge: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#ffffff', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  brandSub: { color: '#ffffff', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  title: { fontSize: 28, fontWeight: '800', color: '#ffffff', marginBottom: 12, lineHeight: 34 },
  subtitle: { fontSize: 14, color: '#e5e7eb', lineHeight: 20 },
  cardContainer: { flex: 1, backgroundColor: '#ffffff', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40, minHeight: 500 },
  alertError: { backgroundColor: '#fee2e2', padding: 12, borderRadius: 8, marginBottom: 16 },
  alertErrorText: { color: '#b91c1c', fontSize: 14, fontWeight: '500' },
  segmentContainer: { flexDirection: 'row', backgroundColor: '#f3f4f6', borderRadius: 12, padding: 4, marginBottom: 24 },
  segmentButton: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  segmentActive: { backgroundColor: '#ffffff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  segmentText: { fontSize: 14, color: '#6b7280', fontWeight: '600' },
  segmentTextActive: { color: '#111827' },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: { height: 48, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 12, paddingHorizontal: 16, fontSize: 14, color: '#111827', backgroundColor: '#ffffff' },
  inputError: { borderColor: '#ef4444' },
  errorText: { color: '#ef4444', fontSize: 12, marginTop: 4 },
  submitButton: { backgroundColor: '#0b6643', height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 8, marginBottom: 20 },
  submitButtonLoading: { opacity: 0.9 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  submitButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  privacyBox: { flexDirection: 'row', backgroundColor: '#e6f4ea', padding: 16, borderRadius: 12, alignItems: 'center' },
  privacyIcon: { marginRight: 12 },
  privacyText: { flex: 1, fontSize: 12, color: '#0b6643', lineHeight: 18 },
});

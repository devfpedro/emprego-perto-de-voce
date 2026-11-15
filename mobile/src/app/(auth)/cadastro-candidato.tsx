import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ApiService } from '../../service/api';

const AREAS = [
  { label: 'Alimentação', value: 'alimentacao' },
  { label: 'Comércio', value: 'comercio' },
  { label: 'Saúde', value: 'saude' },
  { label: 'Serviços Gerais', value: 'servicos_gerais' },
  { label: 'Educação', value: 'educacao' },
];

export default function CadastroCandidatoScreen() {
  const router = useRouter();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [areaInteresse, setAreaInteresse] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  const [localidades, setLocalidades] = useState<any[]>([]);
  const [cidadeId, setCidadeId] = useState<number | null>(null);
  const [bairroId, setBairroId] = useState<number | null>(null);

  const [loadingLocalidades, setLoadingLocalidades] = useState(true);
  const [loadingEnvio, setLoadingEnvio] = useState(false);
  const [erro, setErro] = useState('');
  const [campoComErro, setCampoComErro] = useState('');

  useEffect(() => {
    carregarLocalidades();
  }, []);

  async function carregarLocalidades() {
    try {
      setLoadingLocalidades(true);
      const response = await ApiService.get('/localidades');
      if (Array.isArray(response.data) && response.data.length > 0) {
        setLocalidades(response.data);
        setCidadeId(response.data[0].id);
        if (response.data[0].bairros && response.data[0].bairros.length > 0) {
          setBairroId(response.data[0].bairros[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingLocalidades(false);
    }
  }

  const cidadeAtual = localidades.find((c) => c.id === cidadeId);
  const bairrosDisponiveis = cidadeAtual?.bairros || [];

  async function handleCadastrar() {
    setErro('');
    setCampoComErro('');

    if (!nome.trim()) {
      setErro('Informe seu nome completo.');
      setCampoComErro('nome');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErro('Informe um e-mail válido.');
      setCampoComErro('email');
      return;
    }
    if (telefone.replace(/\D/g, '').length < 10) {
      setErro('Informe um telefone válido.');
      setCampoComErro('telefone');
      return;
    }
    if (!areaInteresse) {
      setErro('Selecione uma área de interesse.');
      setCampoComErro('areaInteresse');
      return;
    }
    if (senha.length < 8) {
      setErro('A senha deve ter no mínimo 8 caracteres.');
      setCampoComErro('senha');
      return;
    }
    if (senha !== confirmarSenha) {
      setErro('As senhas não coincidem.');
      setCampoComErro('confirmarSenha');
      return;
    }

    try {
      setLoadingEnvio(true);
      const payload = {
        perfil: 'candidato',
        nome,
        email,
        senha,
        telefone: telefone.replace(/\D/g, ''),
        whatsapp: whatsapp.replace(/\D/g, ''),
        areaInteresse,
        cidadeId,
        bairroId,
      };

      await ApiService.post('/auth/cadastro', payload);
      router.replace('/(candidato)/mapa' as any);
    } catch (err: any) {
      const mensagemErro = err?.response?.data?.erro || 'Erro ao realizar cadastro. Tente novamente.';
      setErro(mensagemErro);
    } finally {
      setLoadingEnvio(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Criar conta</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
          {/* Seletor de Tipo de Cadastro (Abas) */}
          <View style={styles.switchContainer}>
            <TouchableOpacity style={[styles.switchTab, styles.switchTabActive]} activeOpacity={1}>
              <Text style={[styles.switchText, styles.switchTextActive]}>Candidato</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.switchTab}
              onPress={() => router.replace('/(auth)/cadastro-empresa' as any)}
            >
              <Text style={styles.switchText}>Empresa</Text>
            </TouchableOpacity>
          </View>

          {erro ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{erro}</Text>
            </View>
          ) : null}

          {/* Card de Privacidade */}
          <View style={styles.privacyBox}>
            <Ionicons name="lock-closed-outline" size={18} color="#0b6643" style={styles.privacyIcon} />
            <Text style={styles.privacyText}>
              Seus dados ficam protegidos. Só mostramos a região aproximada.
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome completo</Text>
            <TextInput
              style={[styles.input, campoComErro === 'nome' && styles.inputError]}
              placeholder="Seu nome"
              placeholderTextColor="#9ca3af"
              value={nome}
              onChangeText={setNome}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>E-mail</Text>
            <TextInput
              style={[styles.input, campoComErro === 'email' && styles.inputError]}
              placeholder="voce@email.com"
              placeholderTextColor="#9ca3af"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Telefone</Text>
            <TextInput
              style={[styles.input, campoComErro === 'telefone' && styles.inputError]}
              placeholder="(83) 90000-0000"
              placeholderTextColor="#9ca3af"
              value={telefone}
              onChangeText={setTelefone}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>WhatsApp (opcional)</Text>
            <TextInput
              style={styles.input}
              placeholder="(83) 90000-0000"
              placeholderTextColor="#9ca3af"
              value={whatsapp}
              onChangeText={setWhatsapp}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Área de interesse</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
              {AREAS.map((a) => {
                const isSelected = areaInteresse === a.value;
                return (
                  <TouchableOpacity
                    key={a.value}
                    style={[
                      styles.chip,
                      isSelected && styles.chipActive,
                      campoComErro === 'areaInteresse' && !isSelected && styles.chipError,
                    ]}
                    onPress={() => setAreaInteresse(a.value)}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>{a.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Cidade</Text>
            {loadingLocalidades ? (
              <ActivityIndicator color="#0b6643" size="small" style={{ alignSelf: 'flex-start' }} />
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
                {localidades.map((loc) => {
                  const isSelected = cidadeId === loc.id;
                  return (
                    <TouchableOpacity
                      key={loc.id}
                      style={[styles.chip, isSelected && styles.chipActive]}
                      onPress={() => {
                        setCidadeId(loc.id);
                        setBairroId(loc.bairros && loc.bairros.length > 0 ? loc.bairros[0].id : null);
                      }}
                    >
                      <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>{loc.nome}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bairro</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
              {bairrosDisponiveis.map((b: any) => {
                const isSelected = bairroId === b.id;
                return (
                  <TouchableOpacity
                    key={b.id}
                    style={[styles.chip, isSelected && styles.chipActive]}
                    onPress={() => setBairroId(b.id)}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>{b.nome}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Senha</Text>
            <TextInput
              style={[styles.input, campoComErro === 'senha' && styles.inputError]}
              placeholder="Mínimo de 8 caracteres"
              placeholderTextColor="#9ca3af"
              value={senha}
              onChangeText={setSenha}
              secureTextEntry
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirmação de senha</Text>
            <TextInput
              style={[styles.input, campoComErro === 'confirmarSenha' && styles.inputError]}
              placeholder="Repita a senha"
              placeholderTextColor="#9ca3af"
              value={confirmarSenha}
              onChangeText={setConfirmarSenha}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loadingEnvio && { opacity: 0.8 }]}
            onPress={handleCadastrar}
            disabled={loadingEnvio}
          >
            {loadingEnvio ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>Cadastrar</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.termsText}>
            Ao cadastrar, você aceita os Termos de uso e a Política de privacidade.
          </Text>

          <TouchableOpacity
            style={styles.loginLinkButton}
            onPress={() => router.push('/(auth)/login' as any)}
          >
            <Text style={styles.loginLinkText}>
              Já tem uma conta? <Text style={styles.loginLinkHighlight}>Entrar</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  scrollBody: {
    padding: 20,
    paddingBottom: 40,
  },
  switchContainer: {
    flexDirection: 'row',
    backgroundColor: '#e2e8f0',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  switchTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  switchTabActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  switchText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  switchTextActive: {
    color: '#0b6643',
    fontWeight: '700',
  },
  errorBanner: {
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  errorBannerText: {
    color: '#b91c1c',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  privacyBox: {
    flexDirection: 'row',
    backgroundColor: '#e6f4ea',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  privacyIcon: {
    marginRight: 10,
  },
  privacyText: {
    flex: 1,
    fontSize: 12,
    color: '#0b6643',
    lineHeight: 18,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#111827',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  chipsRow: {
    gap: 8,
  },
  chip: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  chipActive: {
    backgroundColor: '#e6f4ea',
    borderColor: '#0b6643',
  },
  chipError: {
    borderColor: '#ef4444',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4b5563',
  },
  chipTextActive: {
    color: '#0b6643',
  },
  submitButton: {
    backgroundColor: '#0b6643',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  termsText: {
    fontSize: 11,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 16,
  },
  loginLinkButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  loginLinkText: {
    fontSize: 13,
    color: '#6b7280',
  },
  loginLinkHighlight: {
    color: '#0b6643',
    fontWeight: '700',
  },
});
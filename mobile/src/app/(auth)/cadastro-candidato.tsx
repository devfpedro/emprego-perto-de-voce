import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiService, AuthService, ApiError } from '../../service/api';

const AREAS = [
  { label: 'Alimentação', value: 'alimentacao' },
  { label: 'Comércio', value: 'comercio' },
  { label: 'Saúde', value: 'saude' },
  { label: 'Serviços Gerais', value: 'servicos_gerais' },
  { label: 'Educação', value: 'educacao' },
];

type Bairro = {
  id: number;
  nome: string;
  latitude: number;
  longitude: number;
};

type Cidade = {
  id: number;
  nome: string;
  bairros: Bairro[];
};

export default function CadastroCandidatoScreen() {
  const router = useRouter();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [areaInteresse, setAreaInteresse] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  const [localidades, setLocalidades] = useState<Cidade[]>([]);
  const [cidadeId, setCidadeId] = useState<number | null>(null);
  const [bairroId, setBairroId] = useState<number | null>(null);

  const [modalAberto, setModalAberto] = useState(false);
  const [tipoSelecao, setTipoSelecao] = useState<'area' | 'cidade' | 'bairro'>('area');

  const [loading, setLoading] = useState(false);
  const [loadingLocalidades, setLoadingLocalidades] = useState(true);
  const [erro, setErro] = useState('');
  const [erroEmail, setErroEmail] = useState(false);
  const [erroSenha, setErroSenha] = useState(false);
  const [erroConfirmacao, setErroConfirmacao] = useState(false);

  useEffect(() => {
    carregarLocalidades();
  }, []);

  async function carregarLocalidades() {
    try {
      const response = await ApiService.get('/localidades');

      if (Array.isArray(response.data)) {
        setLocalidades(response.data);

        if (response.data.length > 0) {
          const primeiraCidade = response.data[0];

          setCidadeId(primeiraCidade.id);
          setBairroId(primeiraCidade.bairros?.[0]?.id ?? null);
        }
      }
    } catch {
      setErro('Não foi possível carregar as cidades e bairros.');
    } finally {
      setLoadingLocalidades(false);
    }
  }

  const cidadeAtual = localidades.find((cidade) => cidade.id === cidadeId);
  const bairrosDisponiveis = cidadeAtual?.bairros ?? [];

  const areaSelecionada = AREAS.find(
    (area) => area.value === areaInteresse
  )?.label;

  const cidadeSelecionada = cidadeAtual?.nome;

  const bairroSelecionado = bairrosDisponiveis.find(
    (bairro) => bairro.id === bairroId
  )?.nome;

  function abrirSelecao(tipo: 'area' | 'cidade' | 'bairro') {
    setTipoSelecao(tipo);
    setModalAberto(true);
  }

  function selecionarOpcao(valor: any) {
    if (tipoSelecao === 'area') {
      setAreaInteresse(valor);
    }

    if (tipoSelecao === 'cidade') {
      const cidade = localidades.find((item) => item.id === valor);

      setCidadeId(valor);
      setBairroId(cidade?.bairros?.[0]?.id ?? null);
    }

    if (tipoSelecao === 'bairro') {
      setBairroId(valor);
    }

    setModalAberto(false);
  }

  function obterOpcoes() {
    if (tipoSelecao === 'area') {
      return AREAS.map((item) => ({
        label: item.label,
        value: item.value,
      }));
    }

    if (tipoSelecao === 'cidade') {
      return localidades.map((item) => ({
        label: item.nome,
        value: item.id,
      }));
    }

    return bairrosDisponiveis.map((item) => ({
      label: item.nome,
      value: item.id,
    }));
  }

  async function handleCadastro() {
    setErro('');
    setErroEmail(false);
    setErroSenha(false);
    setErroConfirmacao(false);

    let hasError = false;

    if (nome.trim().length < 3) {
      setErro('Informe seu nome completo.');
      hasError = true;
    }

    if (!email.trim() || !email.includes('@')) {
      setErroEmail(true);
      setErro('Informe um e-mail válido.');
      hasError = true;
    }

    if (telefone.replace(/\D/g, '').length < 10) {
      setErro('Informe um telefone com DDD.');
      hasError = true;
    }

    if (!areaInteresse) {
      setErro('Selecione sua área de interesse.');
      hasError = true;
    }

    if (!cidadeId || !bairroId) {
      setErro('Selecione sua cidade e seu bairro.');
      hasError = true;
    }

    if (senha.length < 8) {
      setErroSenha(true);
      setErro('A senha deve ter no mínimo 8 caracteres.');
      hasError = true;
    }

    if (senha !== confirmarSenha) {
      setErroConfirmacao(true);
      setErro('As senhas não coincidem.');
      hasError = true;
    }

    if (hasError) return;

    try {
      setLoading(true);

      const payload = {
        perfil: 'candidato',
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        senha,
        telefone: telefone.replace(/\D/g, ''),
        whatsapp: whatsapp.replace(/\D/g, '') || null,
        areaInteresse,
        cidadeId,
        bairroId,
      };

      await ApiService.post('/auth/cadastro', payload);

      const response = await AuthService.login(
        email.trim().toLowerCase(),
        senha
      );

      const { token, perfil, usuario } = response.data;

      await AsyncStorage.setItem('@emprego_token', token);
      await AsyncStorage.setItem('@emprego_perfil', perfil);
      await AsyncStorage.setItem(
        '@emprego_user_data',
        JSON.stringify(usuario)
      );

      router.replace('/(candidato)/mapa' as any);
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        setErroEmail(true);
        setErro('Este e-mail já está em uso');
      } else if (error instanceof ApiError) {
        setErro(error.message);
      } else {
        setErro('Não foi possível realizar o cadastro. Verifique sua conexão.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Criar conta</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.switchContainer}>
            <TouchableOpacity
              style={[styles.switchTab, styles.switchTabActive]}
              activeOpacity={1}
            >
              <Text style={[styles.switchText, styles.switchTextActive]}>
                Candidato
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchTab}
              onPress={() => router.replace('/(auth)/cadastro-empresa' as any)}
            >
              <Text style={styles.switchText}>Empresa</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.privacyBox}>
            <Ionicons
              name="lock-closed-outline"
              size={18}
              color="#0b6643"
              style={styles.privacyIcon}
            />
            <Text style={styles.privacyText}>
              Seus dados ficam protegidos. Só mostramos a região aproximada.
            </Text>
          </View>

          {erro ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{erro}</Text>
            </View>
          ) : null}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome completo</Text>
            <TextInput
              style={styles.input}
              placeholder="Seu nome"
              placeholderTextColor="#9ca3af"
              value={nome}
              onChangeText={setNome}
            />
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
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Telefone</Text>
            <TextInput
              style={styles.input}
              placeholder="(83) 90000-0000"
              placeholderTextColor="#9ca3af"
              keyboardType="phone-pad"
              value={telefone}
              onChangeText={setTelefone}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>WhatsApp (opcional)</Text>
            <TextInput
              style={styles.input}
              placeholder="(83) 90000-0000"
              placeholderTextColor="#9ca3af"
              keyboardType="phone-pad"
              value={whatsapp}
              onChangeText={setWhatsapp}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Área de interesse</Text>
            <TouchableOpacity
              style={styles.select}
              onPress={() => abrirSelecao('area')}
            >
              <Text style={areaSelecionada ? styles.selectText : styles.placeholder}>
                {areaSelecionada || 'Selecione uma área'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Cidade</Text>
            <TouchableOpacity
              style={styles.select}
              disabled={loadingLocalidades || localidades.length === 0}
              onPress={() => abrirSelecao('cidade')}
            >
              <Text style={cidadeSelecionada ? styles.selectText : styles.placeholder}>
                {loadingLocalidades
                  ? 'Carregando cidades...'
                  : cidadeSelecionada || 'Selecione a cidade'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bairro</Text>
            <TouchableOpacity
              style={styles.select}
              disabled={!cidadeId || bairrosDisponiveis.length === 0}
              onPress={() => abrirSelecao('bairro')}
            >
              <Text style={bairroSelecionado ? styles.selectText : styles.placeholder}>
                {bairroSelecionado || 'Selecione o bairro'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Senha</Text>
            <TextInput
              style={[styles.input, erroSenha && styles.inputError]}
              placeholder="Mínimo de 8 caracteres"
              placeholderTextColor="#9ca3af"
              secureTextEntry
              value={senha}
              onChangeText={setSenha}
            />
            {erroSenha && (
              <Text style={styles.errorText}>
                A senha deve ter no mínimo 8 caracteres.
              </Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirmação de senha</Text>
            <TextInput
              style={[styles.input, erroConfirmacao && styles.inputError]}
              placeholder="Repita a senha"
              placeholderTextColor="#9ca3af"
              secureTextEntry
              value={confirmarSenha}
              onChangeText={setConfirmarSenha}
            />
            {erroConfirmacao && (
              <Text style={styles.errorText}>
                As senhas não coincidem.
              </Text>
            )}
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonLoading]}
            onPress={handleCadastro}
            disabled={loading || loadingLocalidades}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.submitButtonText}>Cadastrar</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.footerLink}
            onPress={() => router.back()}
          >
            <Text style={styles.footerText}>
              Já tem uma conta?{' '}
              <Text style={styles.footerTextBold}>Entrar</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={modalAberto}
        transparent
        animationType="fade"
        onRequestClose={() => setModalAberto(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {tipoSelecao === 'area'
                  ? 'Selecione uma área'
                  : tipoSelecao === 'cidade'
                    ? 'Selecione uma cidade'
                    : 'Selecione um bairro'}
              </Text>
              <TouchableOpacity onPress={() => setModalAberto(false)}>
                <Ionicons name="close" size={24} color="#111827" />
              </TouchableOpacity>
            </View>

            <ScrollView>
              {obterOpcoes().map((opcao) => (
                <TouchableOpacity
                  key={opcao.value}
                  style={styles.option}
                  onPress={() => selecionarOpcao(opcao.value)}
                >
                  <Text style={styles.optionText}>{opcao.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
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
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
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
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#ffffff',
  },
  select: {
    height: 48,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectText: {
    fontSize: 14,
    color: '#111827',
  },
  placeholder: {
    fontSize: 14,
    color: '#9ca3af',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
  },
  errorBanner: {
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  errorBannerText: {
    color: '#b91c1c',
    fontSize: 13,
  },
  submitButton: {
    backgroundColor: '#0b6643',
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  submitButtonLoading: {
    opacity: 0.9,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  footerLink: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#4b5563',
  },
  footerTextBold: {
    color: '#0b6643',
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  option: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  optionText: {
    fontSize: 15,
    color: '#374151',
  },
});
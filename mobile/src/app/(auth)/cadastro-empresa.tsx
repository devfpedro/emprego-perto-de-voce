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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiError, ApiService, AuthService } from '../../service/api';

const SETORES = [
  { label: 'Alimentação', value: 'alimentacao' },
  { label: 'Comércio', value: 'comercio' },
  { label: 'Saúde', value: 'saude' },
  { label: 'Serviços Gerais', value: 'servicos_gerais' },
  { label: 'Educação', value: 'educacao' },
];

export default function CadastroEmpresaScreen() {
  const router = useRouter();

  const [nome, setNome] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [telefone, setTelefone] = useState('');
  const [descricao, setDescricao] = useState('');
  const [setor, setSetor] = useState('');
  const [site, setSite] = useState('');

  const [localidades, setLocalidades] = useState<any[]>([]);
  const [cidadeId, setCidadeId] = useState<number | null>(null);
  const [bairroId, setBairroId] = useState<number | null>(null);
  const [cidadeTexto, setCidadeTexto] = useState('');
  const [bairroTexto, setBairroTexto] = useState('');

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
      setErro('Informe o nome da empresa.');
      setCampoComErro('nome');
      return;
    }
    if (cnpj.replace(/\D/g, '').length !== 14) {
      setErro('CNPJ deve conter 14 dígitos válidos.');
      setCampoComErro('cnpj');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErro('Informe um e-mail válido.');
      setCampoComErro('email');
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
    if (!setor) {
      setErro('Selecione um setor.');
      setCampoComErro('setor');
      return;
    }
    if (site && !site.startsWith('http')) {
      setErro('Informe uma URL válida.');
      setCampoComErro('site');
      return;
    }
    if (localidades.length === 0 && !cidadeTexto.trim()) {
      setErro('Informe a cidade da empresa.');
      setCampoComErro('cidade');
      return;
    }
    if (localidades.length === 0 && !bairroTexto.trim()) {
      setErro('Informe o bairro da empresa.');
      setCampoComErro('bairro');
      return;
    }

    try {
      setLoadingEnvio(true);
      const payload = {
        perfil: 'empresa',
        nome,
        cnpj: cnpj.replace(/\D/g, ''),
        email,
        senha,
        telefone: telefone.replace(/\D/g, ''),
        descricao,
        setor,
        site,
        cidadeId,
        bairroId,
        cidade: cidadeTexto.trim(),
        bairro: bairroTexto.trim(),
      };

      
      const respostaLogin = await AuthService.login(email.trim(), senha);
      const { token, perfil, usuario } = respostaLogin.data;

      await AsyncStorage.setItem('@emprego_token', token);
      await AsyncStorage.setItem('@emprego_perfil', perfil);
      await AsyncStorage.setItem('@emprego_user_data', JSON.stringify(usuario));

      router.replace('/(empresa)/vagas' as any);
      } catch (err) {
      if (err instanceof ApiError) {
        setErro(err.message);
      } else if (err instanceof Error) {
        setErro(err.message);
      } else {
        setErro('Erro ao realizar cadastro. Tente novamente.');
      }
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
            <TouchableOpacity
              style={styles.switchTab}
              onPress={() => router.replace('/(auth)/cadastro-candidato' as any)}
            >
              <Text style={styles.switchText}>Candidato</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.switchTab, styles.switchTabActive]} activeOpacity={1}>
              <Text style={[styles.switchText, styles.switchTextActive]}>Empresa</Text>
            </TouchableOpacity>
          </View>

          {erro ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{erro}</Text>
            </View>
          ) : null}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome da Empresa</Text>
            <TextInput
              style={[styles.input, campoComErro === 'nome' && styles.inputError]}
              placeholder="Ex.: Padaria Pão Quente"
              placeholderTextColor="#9ca3af"
              value={nome}
              onChangeText={setNome}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>CNPJ</Text>
            <TextInput
              style={[styles.input, campoComErro === 'cnpj' && styles.inputError]}
              placeholder="00.000.000/0000-00"
              placeholderTextColor="#9ca3af"
              value={cnpj}
              onChangeText={setCnpj}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>E-mail Corporativo</Text>
            <TextInput
              style={[styles.input, campoComErro === 'email' && styles.inputError]}
              placeholder="contato@empresa.com"
              placeholderTextColor="#9ca3af"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
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
            <Text style={styles.label}>Confirmação de Senha</Text>
            <TextInput
              style={[styles.input, campoComErro === 'confirmarSenha' && styles.inputError]}
              placeholder="Repita a senha"
              placeholderTextColor="#9ca3af"
              value={confirmarSenha}
              onChangeText={setConfirmarSenha}
              secureTextEntry
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Telefone / WhatsApp</Text>
            <TextInput
              style={styles.input}
              placeholder="(83) 90000-0000"
              placeholderTextColor="#9ca3af"
              value={telefone}
              onChangeText={setTelefone}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Descrição (opcional)</Text>
            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: 'top', paddingTop: 10 }]}
              placeholder="Conte um pouco sobre a empresa"
              placeholderTextColor="#9ca3af"
              value={descricao}
              onChangeText={setDescricao}
              multiline
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Setor</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.setoresRow}>
              {SETORES.map((s) => {
                const isSelected = setor === s.value;
                return (
                  <TouchableOpacity
                    key={s.value}
                    style={[styles.setorChip, isSelected && styles.setorChipActive]}
                    onPress={() => setSetor(s.value)}
                  >
                    <Text style={[styles.setorChipText, isSelected && styles.setorChipTextActive]}>
                      {s.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Site (opcional)</Text>
            <TextInput
              style={[styles.input, campoComErro === 'site' && styles.inputError]}
              placeholder="https://suaempresa.com.br"
              placeholderTextColor="#9ca3af"
              value={site}
              onChangeText={setSite}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Cidade</Text>
            {loadingLocalidades ? (
              <ActivityIndicator color="#0b6643" size="small" style={{ alignSelf: 'flex-start' }} />
            ) : localidades.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.setoresRow}>
                {localidades.map((loc) => {
                  const isSelected = cidadeId === loc.id;
                  return (
                    <TouchableOpacity
                      key={loc.id}
                      style={[styles.setorChip, isSelected && styles.setorChipActive]}
                      onPress={() => {
                        setCidadeId(loc.id);
                        setBairroId(loc.bairros && loc.bairros.length > 0 ? loc.bairros[0].id : null);
                      }}
                    >
                      <Text style={[styles.setorChipText, isSelected && styles.setorChipTextActive]}>
                        {loc.nome}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            ) : (
              <TextInput
                style={[styles.input, campoComErro === 'cidade' && styles.inputError]}
                placeholder="Ex.: Guarabira"
                placeholderTextColor="#9ca3af"
                value={cidadeTexto}
                onChangeText={setCidadeTexto}
              />
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bairro</Text>
            {loadingLocalidades ? null : localidades.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.setoresRow}>
                {bairrosDisponiveis.map((b: any) => {
                  const isSelected = bairroId === b.id;
                  return (
                    <TouchableOpacity
                      key={b.id}
                      style={[styles.setorChip, isSelected && styles.setorChipActive]}
                      onPress={() => setBairroId(b.id)}
                    >
                      <Text style={[styles.setorChipText, isSelected && styles.setorChipTextActive]}>
                        {b.nome}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            ) : (
              <TextInput
                style={[styles.input, campoComErro === 'bairro' && styles.inputError]}
                placeholder="Ex.: Centro"
                placeholderTextColor="#9ca3af"
                value={bairroTexto}
                onChangeText={setBairroTexto}
              />
            )}
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loadingEnvio && { opacity: 0.8 }]}
            onPress={handleCadastrar}
            disabled={loadingEnvio}
          >
            {loadingEnvio ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>Cadastrar Empresa</Text>
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
  setoresRow: {
    gap: 8,
  },
  setorChip: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  setorChipActive: {
    backgroundColor: '#e6f4ea',
    borderColor: '#0b6643',
  },
  setorChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4b5563',
  },
  setorChipTextActive: {
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

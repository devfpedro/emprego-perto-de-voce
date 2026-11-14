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

export default function CadastroCandidatoScreen() {
  const router = useRouter();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [areaInteresse, setAreaInteresse] = useState('');
  const [cidade, setCidade] = useState('');
  const [bairro, setBairro] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  const [loading, setLoading] = useState(false);
  const [erroEmail, setErroEmail] = useState(false);
  const [msgErroEmail, setMsgErroEmail] = useState('');
  const [erroSenha, setErroSenha] = useState(false);
  const [erroConfirmacao, setErroConfirmacao] = useState(false);

  async function handleCadastro() {
    setErroEmail(false);
    setMsgErroEmail('');
    setErroSenha(false);
    setErroConfirmacao(false);

    let hasError = false;

    if (!email.trim() || !email.includes('@')) {
      setErroEmail(true);
      setMsgErroEmail('Informe um e-mail válido.');
      hasError = true;
    }

    if (senha.length < 8) {
      setErroSenha(true);
      hasError = true;
    }

    if (senha !== confirmarSenha) {
      setErroConfirmacao(true);
      hasError = true;
    }

    if (hasError) return;

    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log('Candidato cadastrado com sucesso!');
      
      router.replace('/(candidato)/mapa');
    } catch (error) {
      console.error('Erro ao cadastrar', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      
      {/* Botão de Voltar */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={20} color="#111827" />
      </TouchableOpacity>

      {/* Título */}
      <Text style={styles.title}>Cadastro de Candidato</Text>

      {/* Card de Privacidade */}
      <View style={styles.privacyBox}>
        <Ionicons name="lock-closed-outline" size={18} color="#0b6643" style={styles.privacyIcon} />
        <Text style={styles.privacyText}>
          Seus dados ficam protegidos. Só mostramos a região aproximada.
        </Text>
      </View>

      {/* Campo: Nome completo */}
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

      {/* Campo: E-mail */}
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
        {erroEmail && <Text style={styles.errorText}>{msgErroEmail}</Text>}
      </View>

      {/* Campo: Telefone */}
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

      {/* Campo: WhatsApp (opcional) */}
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

      {/* Campo: Área de interesse */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Área de interesse</Text>
        <TextInput 
          style={styles.input}
          placeholder="Selecione uma área"
          placeholderTextColor="#9ca3af"
          value={areaInteresse}
          onChangeText={setAreaInteresse}
        />
      </View>

      {/* Campo: Cidade */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Cidade</Text>
        <TextInput 
          style={styles.input}
          placeholder="Selecione a cidade"
          placeholderTextColor="#9ca3af"
          value={cidade}
          onChangeText={setCidade}
        />
      </View>

      {/* Campo: Bairro */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Bairro</Text>
        <TextInput 
          style={styles.input}
          placeholder="Selecione o bairro"
          placeholderTextColor="#9ca3af"
          value={bairro}
          onChangeText={setBairro}
        />
      </View>

      {/* Campo: Senha */}
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
        {erroSenha && <Text style={styles.errorText}>A senha deve ter no mínimo 8 caracteres.</Text>}
      </View>

      {/* Campo: Confirmação de senha */}
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
        {erroConfirmacao && <Text style={styles.errorText}>As senhas não coincidem.</Text>}
      </View>

      {/* Botão Cadastrar */}
      <TouchableOpacity 
        style={[styles.submitButton, loading && styles.submitButtonLoading]}
        onPress={handleCadastro}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <Text style={styles.submitButtonText}>Cadastrar</Text>
        )}
      </TouchableOpacity>

      {/* Link de Retorno ao Login */}
      <TouchableOpacity style={styles.footerLink} onPress={() => router.back()}>
        <Text style={styles.footerText}>Já tem uma conta? <Text style={styles.footerTextBold}>Entrar</Text></Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 16,
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
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
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
});
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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ApiService } from '../../../service/api';

const AREAS = [
  { label: 'Alimentação', value: 'Alimentação' },
  { label: 'Comércio', value: 'Comércio' },
  { label: 'Saúde', value: 'Saúde' },
  { label: 'Serviços', value: 'Serviços' },
];

const CONTRATOS = [
  { label: 'CLT', value: 'CLT' },
  { label: 'Temporário', value: 'Temporário' },
  { label: 'Estágio', value: 'Estágio' },
  { label: 'PJ', value: 'PJ' },
];

const REGIMES = [
  { label: 'Presencial', value: 'Presencial' },
  { label: 'Híbrido', value: 'Híbrido' },
  { label: 'Remoto', value: 'Remoto' },
];

const TURNOS = [
  { label: 'Manhã', value: 'Manhã' },
  { label: 'Tarde', value: 'Tarde' },
  { label: 'Noite', value: 'Noite' },
  { label: 'Integral', value: 'Integral' },
];

const STATUS_VAGA = [
  { label: 'Aberta', value: 'aberta' },
  { label: 'Pausada', value: 'pausada' },
  { label: 'Encerrada', value: 'encerrada' },
];

export default function EditarVagaScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [requisitos, setRequisitos] = useState('');
  const [area, setArea] = useState('Alimentação');
  const [contrato, setContrato] = useState('CLT');
  const [regime, setRegime] = useState('Presencial');
  const [turno, setTurno] = useState('Manhã');
  const [salario, setSalario] = useState('');
  const [status, setStatus] = useState('aberta');

  const [localidades, setLocalidades] = useState<any[]>([]);
  const [cidadeId, setCidadeId] = useState<number | null>(null);
  const [bairroId, setBairroId] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [loadingSalvar, setLoadingSalvar] = useState(false);
  const [erro, setErro] = useState('');
  const [campoComErro, setCampoComErro] = useState('');

  useEffect(() => {
    carregarDadosIniciais();
  }, [id]);

  async function carregarDadosIniciais() {
    try {
      setLoading(true);
      const [resLoc, resVaga] = await Promise.all([
        ApiService.get('/localidades'),
        ApiService.get(`/empresas/vagas/${id}`),
      ]);

      if (Array.isArray(resLoc.data)) {
        setLocalidades(resLoc.data);
      }

      const vaga = resVaga.data;
      if (vaga) {
        setTitulo(vaga.titulo || '');
        setDescricao(vaga.descricao || '');
        setRequisitos(vaga.requisitos || '');
        setArea(vaga.area || 'Alimentação');
        setContrato(vaga.contrato || 'CLT');
        setRegime(vaga.regime || 'Presencial');
        setTurno(vaga.turno || 'Manhã');
        setSalario(vaga.salario ? String(vaga.salario) : '');
        setStatus(vaga.status || 'aberta');
        setCidadeId(vaga.cidadeId || resLoc.data?.[0]?.id);
        setBairroId(vaga.bairroId || resLoc.data?.[0]?.bairros?.[0]?.id);
      }
    } catch (e) {
      console.error(e);
      setErro('Erro ao carregar dados da vaga.');
    } finally {
      setLoading(false);
    }
  }

  const cidadeAtual = localidades.find((c) => c.id === cidadeId);
  const bairrosDisponiveis = cidadeAtual?.bairros || [];

  async function handleSalvar() {
    setErro('');
    setCampoComErro('');

    if (!titulo.trim()) {
      setErro('Campo obrigatório.');
      setCampoComErro('titulo');
      return;
    }

    try {
      setLoadingSalvar(true);
      const payload = {
        titulo,
        descricao,
        requisitos,
        area,
        contrato,
        regime,
        turno,
        cidadeId,
        bairroId,
        salario: salario ? Number(salario.replace(/\D/g, '')) / 100 : null,
        status,
      };

      await ApiService.put(`/empresas/vagas/${id}`, payload);
      router.back();
    } catch (err: any) {
      setErro('Erro ao salvar alterações. Tente novamente.');
    } finally {
      setLoadingSalvar(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#0b6643" />
      </SafeAreaView>
    );
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
          <Text style={styles.headerTitle}>Editar vaga</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
          {erro ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{erro}</Text>
            </View>
          ) : null}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Título</Text>
            <TextInput
              style={[styles.input, campoComErro === 'titulo' && styles.inputError]}
              placeholder="Ex.: Atendente de balcão"
              placeholderTextColor="#9ca3af"
              value={titulo}
              onChangeText={setTitulo}
            />
            {campoComErro === 'titulo' && <Text style={styles.errorText}>Campo obrigatório.</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Descrição</Text>
            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: 'top', paddingTop: 10 }]}
              placeholder="Descreva as atividades da vaga"
              placeholderTextColor="#9ca3af"
              value={descricao}
              onChangeText={setDescricao}
              multiline
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Requisitos</Text>
            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: 'top', paddingTop: 10 }]}
              placeholder="Liste os requisitos"
              placeholderTextColor="#9ca3af"
              value={requisitos}
              onChangeText={setRequisitos}
              multiline
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Área</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
              {AREAS.map((a) => {
                const isSelected = area === a.value;
                return (
                  <TouchableOpacity
                    key={a.value}
                    style={[styles.chip, isSelected && styles.chipActive]}
                    onPress={() => setArea(a.value)}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                      {a.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contrato</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
              {CONTRATOS.map((c) => {
                const isSelected = contrato === c.value;
                return (
                  <TouchableOpacity
                    key={c.value}
                    style={[styles.chip, isSelected && styles.chipActive]}
                    onPress={() => setContrato(c.value)}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                      {c.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Regime</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
              {REGIMES.map((r) => {
                const isSelected = regime === r.value;
                return (
                  <TouchableOpacity
                    key={r.value}
                    style={[styles.chip, isSelected && styles.chipActive]}
                    onPress={() => setRegime(r.value)}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                      {r.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Turno</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
              {TURNOS.map((t) => {
                const isSelected = turno === t.value;
                return (
                  <TouchableOpacity
                    key={t.value}
                    style={[styles.chip, isSelected && styles.chipActive]}
                    onPress={() => setTurno(t.value)}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Cidade</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
              {localidades.map((loc) => {
                const isSelected = cidadeId === loc.id;
                return (
                  <TouchableOpacity
                    key={loc.id}
                    style={[styles.chip, isSelected && styles.chipActive]}
                    onPress={() => {
                      setCidadeId(loc.id);
                      if (loc.bairros && loc.bairros.length > 0) {
                        setBairroId(loc.bairros[0].id);
                      }
                    }}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                      {loc.nome}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
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
                    <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                      {b.nome}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Salário (R$, opcional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex.: 1500,00"
              placeholderTextColor="#9ca3af"
              value={salario}
              onChangeText={setSalario}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Status da vaga</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
              {STATUS_VAGA.map((s) => {
                const isSelected = status === s.value;
                return (
                  <TouchableOpacity
                    key={s.value}
                    style={[styles.chip, isSelected && styles.chipActive]}
                    onPress={() => setStatus(s.value)}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                      {s.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loadingSalvar && { opacity: 0.8 }]}
            onPress={handleSalvar}
            disabled={loadingSalvar}
          >
            {loadingSalvar ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>Salvar Alterações</Text>
            )}
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
  errorText: {
    fontSize: 11,
    color: '#ef4444',
    marginTop: 4,
    fontWeight: '500',
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
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});

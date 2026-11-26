
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ApiService } from '../../../service/api';

const AREAS = [
  { label: 'Alimentação', value: 'alimentacao' },
  { label: 'Comércio', value: 'comercio' },
  { label: 'Saúde', value: 'saude' },
  { label: 'Serviços gerais', value: 'servicos_gerais' },
  { label: 'Educação', value: 'educacao' },
];

const CONTRATOS = [
  { label: 'CLT', value: 'clt' },
  { label: 'Meio período', value: 'meio_periodo' },
  { label: 'Temporário', value: 'temporario' },
  { label: 'Estágio', value: 'estagio' },
];

const REGIMES = [
  { label: 'Presencial', value: 'presencial' },
  { label: 'Híbrido', value: 'hibrido' },
  { label: 'Remoto', value: 'remoto' },
];

const TURNOS = [
  { label: 'Integral', value: 'integral' },
  { label: 'Manhã', value: 'manha' },
  { label: 'Tarde', value: 'tarde' },
  { label: 'Noturno', value: 'noturno' },
];

const STATUS_VAGA = [
  { label: 'Aberta', value: 'aberta' },
  { label: 'Pausada', value: 'pausada' },
  { label: 'Encerrada', value: 'encerrada' },
];

function formatarSalario(valor: number | string) {
  const numero = Number(valor);

  if (!Number.isFinite(numero) || numero <= 0) {
    return '';
  }

  return numero.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function converterSalario(valor: string) {
  if (!valor.trim()) {
    return null;
  }

  const valorLimpo = valor.trim();

  let numero: number;

  if (valorLimpo.includes(',')) {
    numero = Number(
      valorLimpo.replace(/\./g, '').replace(',', '.')
    );
  } else {
    numero = Number(valorLimpo);
  }

  return Number.isFinite(numero) && numero > 0
    ? numero
    : null;
}

export default function EditarVagaScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [requisitos, setRequisitos] = useState('');
  const [area, setArea] = useState('alimentacao');
  const [contrato, setContrato] = useState('clt');
  const [regime, setRegime] = useState('presencial');
  const [turno, setTurno] = useState('manha');
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
      setErro('');

      const [resLoc, resVaga] = await Promise.all([
        ApiService.get('/localidades'),
        ApiService.get(`/vagas/${id}`),
      ]);

      const locais = Array.isArray(resLoc.data)
        ? resLoc.data
        : [];

      setLocalidades(locais);

      const vaga = resVaga.data;

      if (!vaga) {
        setErro('Vaga não encontrada.');
        return;
      }

      setTitulo(vaga.titulo || '');
      setDescricao(vaga.descricao || '');
      setRequisitos(vaga.requisitos || '');
      setArea(vaga.area || 'alimentacao');
      setContrato(vaga.contrato || 'clt');
      setRegime(vaga.regime || 'presencial');
      setTurno(vaga.turno || 'manha');
      setSalario(formatarSalario(vaga.salario));
      setStatus(vaga.status || 'aberta');

      const bairroEncontrado = locais
        .flatMap((cidade: any) =>
          (cidade.bairros || []).map((bairro: any) => ({
            ...bairro,
            cidadeId: cidade.id,
          }))
        )
        .find((bairro: any) => bairro.id === vaga.bairroId);

      const cidadeSelecionada =
        vaga.cidadeId ||
        bairroEncontrado?.cidadeId ||
        locais[0]?.id ||
        null;

      setCidadeId(cidadeSelecionada);

      setBairroId(
        vaga.bairroId ||
        locais.find(
          (cidade: any) => cidade.id === cidadeSelecionada
        )?.bairros?.[0]?.id ||
        null
      );
    } catch (e: any) {
      console.error('Erro ao carregar vaga:', e);
      setErro(e.message || 'Erro ao carregar dados da vaga.');
    } finally {
      setLoading(false);
    }
  }

  const cidadeAtual = localidades.find(
    (cidade) => cidade.id === cidadeId
  );

  const bairrosDisponiveis = cidadeAtual?.bairros || [];

  async function handleSalvar() {
    setErro('');
    setCampoComErro('');

    if (titulo.trim().length < 5) {
      setErro('O título deve possuir pelo menos 5 caracteres.');
      setCampoComErro('titulo');
      return;
    }

    if (descricao.trim().length < 20) {
      setErro('A descrição deve possuir pelo menos 20 caracteres.');
      setCampoComErro('descricao');
      return;
    }

    if (!requisitos.trim()) {
      setErro('Informe os requisitos da vaga.');
      setCampoComErro('requisitos');
      return;
    }

    if (!bairroId) {
      setErro('Selecione um bairro para a vaga.');
      setCampoComErro('bairro');
      return;
    }

    if (salario.trim() && converterSalario(salario) === null) {
      setErro('Informe um salário válido, maior que zero.');
      setCampoComErro('salario');
      return;
    }

    try {
      setLoadingSalvar(true);

      const payload = {
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        requisitos: requisitos.trim(),
        area,
        contrato,
        regime,
        turno,
        bairroId,
        salario: converterSalario(salario),
        status,
      };

      await ApiService.put(`/vagas/${id}`, payload);

      router.back();
    } catch (err: any) {
      console.error('Erro ao atualizar vaga:', err);

      setErro(
        err.message || 'Erro ao salvar alterações. Tente novamente.'
      );
    } finally {
      setLoadingSalvar(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0b6643" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color="#111827" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Editar vaga</Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollBody}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {erro ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{erro}</Text>
            </View>
          ) : null}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Título</Text>

            <TextInput
              style={[
                styles.input,
                campoComErro === 'titulo' && styles.inputError,
              ]}
              placeholder="Ex.: Atendente de balcão"
              placeholderTextColor="#9ca3af"
              value={titulo}
              onChangeText={setTitulo}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Descrição</Text>

            <TextInput
              style={[
                styles.input,
                styles.multilineInput,
                campoComErro === 'descricao' && styles.inputError,
              ]}
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
              style={[
                styles.input,
                styles.multilineInput,
                campoComErro === 'requisitos' && styles.inputError,
              ]}
              placeholder="Liste os requisitos"
              placeholderTextColor="#9ca3af"
              value={requisitos}
              onChangeText={setRequisitos}
              multiline
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Área</Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsRow}
            >
              {AREAS.map((a) => {
                const isSelected = area === a.value;

                return (
                  <TouchableOpacity
                    key={a.value}
                    style={[styles.chip, isSelected && styles.chipActive]}
                    onPress={() => setArea(a.value)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        isSelected && styles.chipTextActive,
                      ]}
                    >
                      {a.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contrato</Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsRow}
            >
              {CONTRATOS.map((c) => {
                const isSelected = contrato === c.value;

                return (
                  <TouchableOpacity
                    key={c.value}
                    style={[styles.chip, isSelected && styles.chipActive]}
                    onPress={() => setContrato(c.value)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        isSelected && styles.chipTextActive,
                      ]}
                    >
                      {c.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Regime</Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsRow}
            >
              {REGIMES.map((r) => {
                const isSelected = regime === r.value;

                return (
                  <TouchableOpacity
                    key={r.value}
                    style={[styles.chip, isSelected && styles.chipActive]}
                    onPress={() => setRegime(r.value)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        isSelected && styles.chipTextActive,
                      ]}
                    >
                      {r.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Turno</Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsRow}
            >
              {TURNOS.map((t) => {
                const isSelected = turno === t.value;

                return (
                  <TouchableOpacity
                    key={t.value}
                    style={[styles.chip, isSelected && styles.chipActive]}
                    onPress={() => setTurno(t.value)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        isSelected && styles.chipTextActive,
                      ]}
                    >
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Cidade</Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsRow}
            >
              {localidades.map((loc) => {
                const isSelected = cidadeId === loc.id;

                return (
                  <TouchableOpacity
                    key={loc.id}
                    style={[styles.chip, isSelected && styles.chipActive]}
                    onPress={() => {
                      setCidadeId(loc.id);

                      if (loc.bairros?.length > 0) {
                        setBairroId(loc.bairros[0].id);
                      } else {
                        setBairroId(null);
                      }
                    }}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        isSelected && styles.chipTextActive,
                      ]}
                    >
                      {loc.nome}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bairro</Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsRow}
            >
              {bairrosDisponiveis.map((b: any) => {
                const isSelected = bairroId === b.id;

                return (
                  <TouchableOpacity
                    key={b.id}
                    style={[styles.chip, isSelected && styles.chipActive]}
                    onPress={() => setBairroId(b.id)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        isSelected && styles.chipTextActive,
                      ]}
                    >
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
              style={[
                styles.input,
                campoComErro === 'salario' && styles.inputError,
              ]}
              placeholder="Ex.: 1.500,00"
              placeholderTextColor="#9ca3af"
              value={salario}
              onChangeText={setSalario}
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Status da vaga</Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsRow}
            >
              {STATUS_VAGA.map((s) => {
                const isSelected = status === s.value;

                return (
                  <TouchableOpacity
                    key={s.value}
                    style={[styles.chip, isSelected && styles.chipActive]}
                    onPress={() => setStatus(s.value)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        isSelected && styles.chipTextActive,
                      ]}
                    >
                      {s.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <TouchableOpacity
            style={[
              styles.submitButton,
              loadingSalvar && styles.submitButtonDisabled,
            ]}
            onPress={handleSalvar}
            disabled={loadingSalvar}
          >
            {loadingSalvar ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>
                Salvar alterações
              </Text>
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
    width: '100%',
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardContainer: {
    flex: 1,
    width: '100%',
  },
  header: {
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
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
    flexShrink: 0,
  },
  headerTitle: {
    flex: 1,
    minWidth: 0,
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollBody: {
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  errorBanner: {
    width: '100%',
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
    flexShrink: 1,
  },
  inputGroup: {
    width: '100%',
    minWidth: 0,
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    width: '100%',
    minWidth: 0,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#111827',
  },
  multilineInput: {
    height: 100,
    paddingTop: 10,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 4,
  },
  chip: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    flexShrink: 0,
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
    width: '100%',
    height: 50,
    backgroundColor: '#0b6643',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.8,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});

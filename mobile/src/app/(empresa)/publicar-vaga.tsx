
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
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ApiService } from '../../service/api';

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

export default function PublicarVagaScreen() {
  const router = useRouter();

  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [requisitos, setRequisitos] = useState('');
  const [area, setArea] = useState('alimentacao');
  const [contrato, setContrato] = useState('clt');
  const [regime, setRegime] = useState('presencial');
  const [turno, setTurno] = useState('manha');
  const [salario, setSalario] = useState('');

  const [localidades, setLocalidades] = useState<any[]>([]);
  const [cidadeId, setCidadeId] = useState<number | null>(null);
  const [bairroId, setBairroId] = useState<number | null>(null);

  const [loadingEnvio, setLoadingEnvio] = useState(false);
  const [erro, setErro] = useState('');
  const [campoComErro, setCampoComErro] = useState('');

  useEffect(() => {
    carregarLocalidades();
  }, []);

  async function carregarLocalidades() {
    try {
      const response = await ApiService.get('/localidades');
      const data = response.data;

      if (Array.isArray(data) && data.length > 0) {
        setLocalidades(data);
        setCidadeId(data[0].id);

        if (data[0].bairros && data[0].bairros.length > 0) {
          setBairroId(data[0].bairros[0].id);
        }
      }
    } catch (e) {
      console.error('Erro ao carregar localidades:', e);
    }
  }

  const cidadeAtual = localidades.find((c) => c.id === cidadeId);
  const bairrosDisponiveis = cidadeAtual?.bairros || [];

  async function handlePublicar() {
    setErro('');
    setCampoComErro('');

    if (!titulo.trim()) {
      setErro('Informe o título da vaga.');
      setCampoComErro('titulo');
      return;
    }

    if (titulo.trim().length < 5) {
      setErro('O título deve conter no mínimo 5 caracteres.');
      setCampoComErro('titulo');
      return;
    }

    if (!descricao.trim()) {
      setErro('Descreva as atividades da vaga.');
      setCampoComErro('descricao');
      return;
    }

    if (descricao.trim().length < 20) {
      setErro('A descrição deve conter no mínimo 20 caracteres.');
      setCampoComErro('descricao');
      return;
    }

    if (!requisitos.trim()) {
      setErro('Liste os requisitos da vaga.');
      setCampoComErro('requisitos');
      return;
    }

    if (bairroId === null) {
      setErro('Selecione um bairro para a vaga.');
      return;
    }

    try {
      setLoadingEnvio(true);

      const payload = {
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        requisitos: requisitos.trim(),
        area: area.toLowerCase(),
        contrato: contrato.toLowerCase(),
        regime: regime.toLowerCase(),
        turno: turno.toLowerCase(),
        bairroId,
        salario: salario.trim()
          ? Number(salario.replace(/\D/g, '')) / 100
          : null,
      };

      console.log('Payload da vaga:', payload);

      await ApiService.post('/vagas', payload);

      router.back();
    } catch (err: any) {
      console.error('Erro ao publicar vaga:', err);

      setErro(
        err.message ||
          'Erro ao publicar vaga. Verifique os dados e tente novamente.'
      );
    } finally {
      setLoadingEnvio(false);
    }
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

          <Text style={styles.headerTitle}>Publicar vaga</Text>
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

            {campoComErro === 'titulo' && (
              <Text style={styles.errorText}>Campo obrigatório.</Text>
            )}
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

            {campoComErro === 'descricao' && (
              <Text style={styles.errorText}>Campo obrigatório.</Text>
            )}
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

            {campoComErro === 'requisitos' && (
              <Text style={styles.errorText}>Campo obrigatório.</Text>
            )}
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

                      if (loc.bairros && loc.bairros.length > 0) {
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
              style={styles.input}
              placeholder="Ex.: 1500,00"
              placeholderTextColor="#9ca3af"
              value={salario}
              onChangeText={setSalario}
              keyboardType="numeric"
            />
          </View>

          <TouchableOpacity
            style={[
              styles.submitButton,
              loadingEnvio && styles.submitButtonDisabled,
            ]}
            onPress={handlePublicar}
            disabled={loadingEnvio}
          >
            {loadingEnvio ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>Publicar Vaga</Text>
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
  errorText: {
    fontSize: 11,
    color: '#ef4444',
    marginTop: 4,
    fontWeight: '500',
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


import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ApiService } from '../../../service/api';

export default function EmpresaCandidatosScreen() {
  const [loading, setLoading] = useState(true);
  const [candidaturas, setCandidaturas] = useState<any[]>([]);
  const [vagasDisponiveis, setVagasDisponiveis] = useState<any[]>([]);
  const [vagaSelecionada, setVagaSelecionada] = useState('todas');
  const [statusSelecionado, setStatusSelecionado] = useState('todos');

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      setLoading(true);

      const [resCandidaturas, resVagas] = await Promise.all([
        ApiService.get('/empresa/candidaturas'),
        ApiService.get('/empresa/vagas'),
      ]);

      setCandidaturas(
        Array.isArray(resCandidaturas.data)
          ? resCandidaturas.data
          : []
      );

      setVagasDisponiveis(
        Array.isArray(resVagas.data?.itens)
          ? resVagas.data.itens
          : []
      );
    } catch (error) {
      console.error('Erro ao carregar candidatos:', error);
    } finally {
      setLoading(false);
    }
  }

  async function atualizarStatus(
    candidaturaId: number,
    novoStatus: string
  ) {
    try {
      await ApiService.patch(
        `/candidaturas/${candidaturaId}/status`,
        {
          status: novoStatus,
        }
      );

      setCandidaturas((prev) =>
        prev.map((item) =>
          item.id === candidaturaId
            ? { ...item, status: novoStatus }
            : item
        )
      );
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  }

  function abrirCurriculo(url: string) {
    if (!url) return;

    const formattedUrl = url.startsWith('http')
      ? url
      : `https://${url}`;

    Linking.openURL(formattedUrl).catch((error) =>
      console.error('Erro ao abrir currículo:', error)
    );
  }

  const candidaturaVagaSelecionada = vagasDisponiveis.find(
    (vaga) => String(vaga.id) === String(vagaSelecionada)
  );

  const candidaturasFiltradas = candidaturas.filter((item) => {
    const matchVaga =
      vagaSelecionada === 'todas' ||
      item.cargoPretendido === candidaturaVagaSelecionada?.titulo;

    const matchStatus =
      statusSelecionado === 'todos' ||
      item.status === statusSelecionado;

    return matchVaga && matchStatus;
  });

  const semResultados =
    !loading && candidaturasFiltradas.length === 0;

  const statusDisponiveis = [
    { label: 'Todos', value: 'todos' },
    { label: 'Enviada', value: 'enviada' },
    { label: 'Em análise', value: 'em_analise' },
    { label: 'Entrevista', value: 'entrevista' },
    { label: 'Rejeitada', value: 'rejeitada' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Candidatos</Text>

        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Vaga</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            <TouchableOpacity
              style={[
                styles.filterChip,
                vagaSelecionada === 'todas' &&
                  styles.filterChipActive,
              ]}
              onPress={() => setVagaSelecionada('todas')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterChipText,
                  vagaSelecionada === 'todas' &&
                    styles.filterChipTextActive,
                ]}
              >
                Todas as vagas
              </Text>
            </TouchableOpacity>

            {vagasDisponiveis.map((vaga) => (
              <TouchableOpacity
                key={vaga.id}
                style={[
                  styles.filterChip,
                  String(vagaSelecionada) === String(vaga.id) &&
                    styles.filterChipActive,
                ]}
                onPress={() => setVagaSelecionada(String(vaga.id))}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    String(vagaSelecionada) === String(vaga.id) &&
                      styles.filterChipTextActive,
                  ]}
                  numberOfLines={1}
                >
                  {vaga.titulo}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>
            Status da candidatura
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            {statusDisponiveis.map((status) => (
              <TouchableOpacity
                key={status.value}
                style={[
                  styles.filterChip,
                  statusSelecionado === status.value &&
                    styles.filterChipActive,
                ]}
                onPress={() => setStatusSelecionado(status.value)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    statusSelecionado === status.value &&
                      styles.filterChipTextActive,
                  ]}
                >
                  {status.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollBody}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.skeletonList}>
            <View style={styles.skeletonCard} />
            <View style={styles.skeletonCard} />
          </View>
        ) : semResultados ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              Nenhum candidato inscrito para os filtros selecionados.
            </Text>
          </View>
        ) : (
          candidaturasFiltradas.map((item) => {
            const nomeCandidato =
              item.candidatoNome || 'Candidato';

            const iniciais = nomeCandidato
              .slice(0, 2)
              .toUpperCase();

            const tituloVaga =
              item.cargoPretendido || 'Vaga';

            const bairro =
              item.bairro || 'Bairro não informado';

            const dataStr = item.dataCandidatura
              ? new Date(item.dataCandidatura).toLocaleDateString(
                  'pt-BR'
                )
              : 'Data não informada';

            const curriculoUrl = item.urlCurriculoPdf;
            const temCurriculo = Boolean(curriculoUrl);

            return (
              <View key={item.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.avatarBox}>
                    <Text style={styles.avatarText}>
                      {iniciais}
                    </Text>
                  </View>

                  <View style={styles.candidatoInfo}>
                    <Text
                      style={styles.cardName}
                      numberOfLines={2}
                    >
                      {nomeCandidato}
                    </Text>

                    <Text style={styles.cardMeta}>
                      {tituloVaga} · {bairro} · {dataStr}
                    </Text>
                  </View>
                </View>

                <View style={styles.statusActionRow}>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.statusOptions}
                  >
                    {[
                      { label: 'Enviada', val: 'enviada' },
                      { label: 'Em análise', val: 'em_analise' },
                      { label: 'Entrevista', val: 'entrevista' },
                      { label: 'Rejeitada', val: 'rejeitada' },
                    ].map((status) => (
                      <TouchableOpacity
                        key={status.val}
                        style={[
                          styles.statusOptionChip,
                          item.status === status.val &&
                            styles.statusOptionChipActive,
                        ]}
                        onPress={() =>
                          atualizarStatus(item.id, status.val)
                        }
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.statusOptionText,
                            item.status === status.val &&
                              styles.statusOptionTextActive,
                          ]}
                        >
                          {status.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {temCurriculo ? (
                  <TouchableOpacity
                    style={styles.pdfButton}
                    onPress={() => abrirCurriculo(curriculoUrl)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.pdfButtonText}>
                      Ver PDF
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.semCurriculoBox}>
                    <Text style={styles.semCurriculoText}>
                      Sem currículo
                    </Text>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#f8fafc',
  },

  header: {
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
  },

  filterGroup: {
    width: '100%',
    marginBottom: 10,
  },

  filterLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 6,
  },

  filterRow: {
    gap: 8,
    paddingRight: 8,
  },

  filterChip: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    flexShrink: 0,
  },

  filterChipActive: {
    backgroundColor: '#e6f4ea',
    borderColor: '#0b6643',
  },

  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4b5563',
  },

  filterChipTextActive: {
    color: '#0b6643',
  },

  scroll: {
    flex: 1,
    width: '100%',
  },

  scrollBody: {
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    flexGrow: 1,
  },

  skeletonList: {
    width: '100%',
    gap: 12,
  },

  skeletonCard: {
    width: '100%',
    height: 140,
    borderRadius: 16,
    backgroundColor: '#e2e8f0',
  },

  emptyCard: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },

  emptyText: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 19,
  },

  card: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },

  cardHeader: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },

  avatarBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#e6f4ea',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    flexShrink: 0,
  },

  avatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0b6643',
  },

  candidatoInfo: {
    flex: 1,
    minWidth: 0,
  },

  cardName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 3,
    flexShrink: 1,
  },

  cardMeta: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 18,
  },

  statusActionRow: {
    width: '100%',
    marginBottom: 12,
  },

  statusOptions: {
    gap: 6,
    paddingRight: 4,
  },

  statusOptionChip: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexShrink: 0,
  },

  statusOptionChipActive: {
    backgroundColor: '#e6f4ea',
    borderColor: '#0b6643',
  },

  statusOptionText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },

  statusOptionTextActive: {
    color: '#0b6643',
  },

  pdfButton: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },

  pdfButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },

  semCurriculoBox: {
    width: '100%',
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
  },

  semCurriculoText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9ca3af',
  },
});

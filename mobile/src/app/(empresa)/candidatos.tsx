import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ApiService } from '../../service/api';

export default function EmpresaCandidatosScreen() {
  const router = useRouter();

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
        ApiService.get('/empresas/candidaturas'),
        ApiService.get('/empresas/vagas'),
      ]);
      setCandidaturas(Array.isArray(resCandidaturas.data) ? resCandidaturas.data : []);
      setVagasDisponiveis(Array.isArray(resVagas.data) ? resVagas.data : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function atualizarStatus(candidaturaId: number, novoStatus: string) {
    try {
      await ApiService.patch(`/empresas/candidaturas/${candidaturaId}/status`, {
        status: novoStatus,
      });
      setCandidaturas((prev) =>
        prev.map((item) => (item.id === candidaturaId ? { ...item, status: novoStatus } : item))
      );
    } catch (error) {
      console.error(error);
    }
  }

  function abrirCurriculo(url: string) {
    if (!url) return;
    const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
    Linking.openURL(formattedUrl);
  }

  const candidaturasFiltradas = candidaturas.filter((item) => {
    const matchVaga = vagaSelecionada === 'todas' || String(item.vagaId) === String(vagaSelecionada);
    const matchStatus = statusSelecionado === 'todos' || item.status === statusSelecionado;
    return matchVaga && matchStatus;
  });

  const semResultados = !loading && candidaturasFiltradas.length === 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Candidatos</Text>

        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Vaga</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            <TouchableOpacity
              style={[styles.filterChip, vagaSelecionada === 'todas' && styles.filterChipActive]}
              onPress={() => setVagaSelecionada('todas')}
            >
              <Text style={[styles.filterChipText, vagaSelecionada === 'todas' && styles.filterChipTextActive]}>
                Todas as vagas
              </Text>
            </TouchableOpacity>
            {vagasDisponiveis.map((v) => (
              <TouchableOpacity
                key={v.id}
                style={[styles.filterChip, String(vagaSelecionada) === String(v.id) && styles.filterChipActive]}
                onPress={() => setVagaSelecionada(v.id)}
              >
                <Text style={[styles.filterChipText, String(vagaSelecionada) === String(v.id) && styles.filterChipTextActive]}>
                  {v.titulo}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Status da candidatura</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            {[
              { label: 'Todos', value: 'todos' },
              { label: 'Enviada', value: 'enviada' },
              { label: 'Em análise', value: 'em_analise' },
              { label: 'Entrevista', value: 'entrevista' },
              { label: 'Rejeitada', value: 'rejeitada' },
            ].map((s) => (
              <TouchableOpacity
                key={s.value}
                style={[styles.filterChip, statusSelecionado === s.value && styles.filterChipActive]}
                onPress={() => setStatusSelecionado(s.value)}
              >
                <Text style={[styles.filterChipText, statusSelecionado === s.value && styles.filterChipTextActive]}>
                  {s.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
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
            const nomeCandidato = item.candidato?.nome || item.nomeCandidato || 'Candidato';
            const iniciais = nomeCandidato.slice(0, 2).toUpperCase();
            const tituloVaga = item.vaga?.titulo || item.tituloVaga || 'Vaga';
            const bairro = item.candidato?.bairro || item.bairro || 'Centro';
            const dataStr = item.data || '10/11/2026';
            const temCurriculo = Boolean(item.curriculoUrl || item.candidato?.curriculoUrl);

            return (
              <View key={item.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.avatarBox}>
                    <Text style={styles.avatarText}>{iniciais}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardName}>{nomeCandidato}</Text>
                    <Text style={styles.cardMeta}>
                      {tituloVaga} · {bairro} · {dataStr}
                    </Text>
                  </View>
                </View>

                <View style={styles.statusActionRow}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                    {[
                      { label: 'Enviada', val: 'enviada' },
                      { label: 'Em análise', val: 'em_analise' },
                      { label: 'Entrevista', val: 'entrevista' },
                    ].map((st) => (
                      <TouchableOpacity
                        key={st.val}
                        style={[
                          styles.statusOptionChip,
                          item.status === st.val && styles.statusOptionChipActive,
                        ]}
                        onPress={() => atualizarStatus(item.id, st.val)}
                      >
                        <Text
                          style={[
                            styles.statusOptionText,
                            item.status === st.val && styles.statusOptionTextActive,
                          ]}
                        >
                          {st.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {temCurriculo ? (
                  <TouchableOpacity
                    style={styles.pdfButton}
                    onPress={() => abrirCurriculo(item.curriculoUrl || item.candidato?.curriculoUrl)}
                  >
                    <Text style={styles.pdfButtonText}>Ver PDF</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.semCurriculoBox}>
                    <Text style={styles.semCurriculoText}>Sem currículo</Text>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push('/(empresa)/painel' as any)}
        >
          <Ionicons name="briefcase-outline" size={20} color="#6b7280" />
          <Text style={styles.navText}>Vagas</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="people" size={20} color="#0b6643" />
          <Text style={[styles.navText, styles.navTextActive]}>Candidatos</Text>
        </TouchableOpacity>
      </View>
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
    paddingBottom: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
  },
  filterGroup: {
    marginBottom: 10,
  },
  filterLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
  },
  filterRow: {
    gap: 8,
  },
  filterChip: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
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
  scrollBody: {
    padding: 20,
    paddingBottom: 90,
  },
  skeletonList: {
    gap: 12,
  },
  skeletonCard: {
    height: 140,
    borderRadius: 16,
    backgroundColor: '#e2e8f0',
  },
  emptyCard: {
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
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#e6f4ea',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0b6643',
  },
  cardName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  cardMeta: {
    fontSize: 12,
    color: '#6b7280',
  },
  statusActionRow: {
    marginBottom: 12,
  },
  statusOptionChip: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
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
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 64,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingHorizontal: 24,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 4,
    fontWeight: '500',
  },
  navTextActive: {
    color: '#0b6643',
    fontWeight: '700',
  },
});
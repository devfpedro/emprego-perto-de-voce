
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ApiService } from '../../service/api';

const ABAS = ['Todas', 'Em andamento', 'Encerradas'];

export default function MinhasCandidaturasScreen() {
  const [candidaturas, setCandidaturas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState('Todas');

  useEffect(() => {
    carregarCandidaturas();
  }, []);

  async function carregarCandidaturas() {
    try {
      setLoading(true);
      const response = await ApiService.get('/candidaturas/minhas');
      setCandidaturas(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const candidaturasFiltradas = candidaturas.filter((item) => {
    if (abaAtiva === 'Em andamento') {
      return [
        'enviada',
        'em_analise',
        'curriculo_visto',
        'entrevista',
      ].includes(item.status);
    }

    if (abaAtiva === 'Encerradas') {
      return ['encerrada', 'rejeitada'].includes(item.status);
    }

    return true;
  });

  function formatarStatus(status: string) {
    switch (status) {
      case 'enviada':
        return { label: 'Enviada', bg: '#e6f4ea', color: '#0b6643' };
      case 'em_analise':
        return { label: 'Em análise', bg: '#fef3c7', color: '#b45309' };
      case 'curriculo_visto':
        return { label: 'Visto', bg: '#e0f2fe', color: '#0369a1' };
      case 'entrevista':
        return { label: 'Entrevista', bg: '#ede9fe', color: '#6d28d9' };
      case 'rejeitada':
        return { label: 'Rejeitada', bg: '#fee2e2', color: '#b91c1c' };
      default:
        return { label: 'Encerrada', bg: '#f1f5f9', color: '#64748b' };
    }
  }

// D14: interpreta datas sem horário no fuso local para evitar exibir o dia anterior.
function formatarData(dataStr: string) {
  if (!dataStr) return '';

  try {
    const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dataStr);
    const data = partes
      ? new Date(
          Number(partes[1]),
          Number(partes[2]) - 1,
          Number(partes[3]),
        )
      : new Date(dataStr);

    if (Number.isNaN(data.getTime())) return '';

    return `Enviada em ${data.toLocaleDateString('pt-BR')}`;
  } catch {
    return '';
  }
}

  const semResultados = !loading && candidaturasFiltradas.length === 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Minhas candidaturas</Text>
          <Text style={styles.headerSub}>
            {loading
              ? 'Carregando...'
              : `${candidaturas.length} ${
                  candidaturas.length === 1
                    ? 'candidatura acompanhada'
                    : 'candidaturas acompanhadas'
                }`}
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContainer}
        >
          {ABAS.map((aba) => {
            const isActive = abaAtiva === aba;

            return (
              <TouchableOpacity
                key={aba}
                style={[styles.tabChip, isActive && styles.tabChipActive]}
                onPress={() => setAbaAtiva(aba)}
              >
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {aba}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
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
            <View style={styles.skeletonCard} />
          </View>
        ) : semResultados ? (
          <View style={styles.emptyCard}>
            <Ionicons
              name="document-text-outline"
              size={32}
              color="#9ca3af"
              style={{ marginBottom: 8 }}
            />
            <Text style={styles.emptyText}>
              Você ainda não se candidatou a nenhuma vaga. Explore o mapa!
            </Text>
          </View>
        ) : (
          candidaturasFiltradas.map((item) => {
            const badge = formatarStatus(item.status);
            const tituloVaga =
              item.vaga?.titulo || item.cargoPretendido || 'Vaga';
            const nomeEmpresa = item.empresa || 'Empresa';
            const nomeBairro = item.bairro || '';

            return (
              <View key={item.id} style={styles.candidaturaCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.avatarBox}>
                    <Text style={styles.avatarText}>
                      {String(nomeEmpresa).slice(0, 2).toUpperCase()}
                    </Text>
                  </View>

                  <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle}>{tituloVaga}</Text>
                    <Text style={styles.cardMeta}>
                      {nomeEmpresa} {nomeBairro ? `· ${nomeBairro}` : ''}
                    </Text>
                    <Text style={styles.cardDate}>
                      {formatarData(item.data || item.dataCandidatura)}
                    </Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: badge.bg },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusBadgeText,
                      { color: badge.color },
                    ]}
                  >
                    {badge.label}
                  </Text>
                </View>
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
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 4,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerContent: {
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 2,
  },
  headerSub: {
    fontSize: 13,
    color: '#6b7280',
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 10,
  },
  tabChip: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  tabChipActive: {
    backgroundColor: '#e6f4ea',
    borderColor: '#0b6643',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4b5563',
  },
  tabTextActive: {
    color: '#0b6643',
  },
  scroll: {
    flex: 1,
  },
  scrollBody: {
    padding: 20,
    paddingBottom: 28,
  },
  skeletonList: {
    gap: 12,
  },
  skeletonCard: {
    height: 88,
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
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  candidaturaCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  avatarBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#fef3c7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400e',
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  cardMeta: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  cardDate: {
    fontSize: 11,
    color: '#9ca3af',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
});

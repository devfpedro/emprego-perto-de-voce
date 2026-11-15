import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ApiService } from '../../service/api';

const ABAS = ['Todas', 'Em andamento', 'Encerradas'];

export default function MinhasCandidaturasScreen() {
  const router = useRouter();

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
      return ['enviada', 'em_analise', 'curriculo_visto', 'entrevista'].includes(item.status);
    }
    if (abaAtiva === 'Encerradas') {
      return ['encerrada', 'rejeitada'].includes(item.status);
    }
    return true;
  });

  function formatarStatus(status: string) {
    switch (status) {
      case 'enviada': return { label: 'Enviada', bg: '#e6f4ea', color: '#0b6643' };
      case 'em_analise': return { label: 'Em análise', bg: '#fef3c7', color: '#b45309' };
      case 'curriculo_visto': return { label: 'Visto', bg: '#e0f2fe', color: '#0369a1' };
      case 'entrevista': return { label: 'Entrevista', bg: '#ede9fe', color: '#6d28d9' };
      case 'rejeitada': return { label: 'Rejeitada', bg: '#fee2e2', color: '#b91c1c' };
      default: return { label: 'Encerrada', bg: '#f1f5f9', color: '#64748b' };
    }
  }

  function formatarData(dataStr: string) {
    if (!dataStr) return '';
    try {
      const data = new Date(dataStr);
      return `Enviada em ${data.toLocaleDateString('pt-BR')}`;
    } catch {
      return '';
    }
  }

  const semResultados = !loading && candidaturasFiltradas.length === 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Minhas candidaturas</Text>
        <Text style={styles.headerSub}>
          {loading ? 'Carregando...' : `${candidaturas.length} ${candidaturas.length === 1 ? 'candidatura acompanhada' : 'candidaturas acompanhadas'}`}
        </Text>

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

      <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.skeletonList}>
            <View style={styles.skeletonCard} />
            <View style={styles.skeletonCard} />
            <View style={styles.skeletonCard} />
          </View>
        ) : semResultados ? (
          <View style={styles.emptyCard}>
            <Ionicons name="document-text-outline" size={32} color="#9ca3af" style={{ marginBottom: 8 }} />
            <Text style={styles.emptyText}>
              Você ainda não se candidatou a nenhuma vaga. Explore o mapa!
            </Text>
          </View>
        ) : (
          candidaturasFiltradas.map((item) => {
            const badge = formatarStatus(item.status);
            const tituloVaga = item.vaga?.titulo || item.cargoPretendido || 'Vaga';
            const nomeEmpresa = item.empresa || 'Empresa';
            const nomeBairro = item.bairro || '';

            return (
              <View key={item.id} style={styles.candidaturaCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.avatarBox}>
                    <Text style={styles.avatarText}>{nomeEmpresa.slice(0, 2).toUpperCase()}</Text>
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle}>{tituloVaga}</Text>
                    <Text style={styles.cardMeta}>
                      {nomeEmpresa} {nomeBairro ? `· ${nomeBairro}` : ''}
                    </Text>
                    <Text style={styles.cardDate}>{formatarData(item.data || item.dataCandidatura)}</Text>
                  </View>
                </View>

                <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                  <Text style={[styles.statusBadgeText, { color: badge.color }]}>{badge.label}</Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(candidato)/mapa' as any)}>
          <Ionicons name="map-outline" size={20} color="#6b7280" />
          <Text style={styles.navText}>Mapa</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="checkbox" size={20} color="#0b6643" />
          <Text style={[styles.navText, styles.navTextActive]}>Candidaturas</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(candidato)/perfil' as any)}>
          <Ionicons name="person-outline" size={20} color="#6b7280" />
          <Text style={styles.navText}>Perfil</Text>
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
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 12,
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
  scrollBody: {
    padding: 20,
    paddingBottom: 90,
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
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

export default function EmpresaPainelScreen() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [dados, setDados] = useState<any>({
    vagasAbertas: 0,
    totalCandidaturas: 0,
    vagas: [],
  });

  useEffect(() => {
    carregarPainel();
  }, []);

  async function carregarPainel() {
    try {
      setLoading(true);
      const response = await ApiService.get('/empresas/painel');
      setDados(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  function formatarStatus(status: string) {
    switch (status) {
      case 'aberta':
        return { label: 'Aberta', bg: '#e6f4ea', color: '#0b6643' };
      case 'pausada':
        return { label: 'Pausada', bg: '#fef3c7', color: '#b45309' };
      case 'encerrada':
        return { label: 'Encerrada', bg: '#f1f5f9', color: '#64748b' };
      default:
        return { label: 'Aberta', bg: '#e6f4ea', color: '#0b6643' };
    }
  }

  const vagas = dados?.vagas || [];
  const semVagas = !loading && vagas.length === 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Painel</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.metricsRow}>
            <View style={[styles.metricCard, styles.skeletonBox]} />
            <View style={[styles.metricCard, styles.skeletonBox]} />
          </View>
        ) : (
          <View style={styles.metricsRow}>
            <View style={styles.metricCard}>
              <Text style={styles.metricNumber}>{dados.vagasAbertas || 0}</Text>
              <Text style={styles.metricLabel}>Vagas abertas</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricNumber}>{dados.totalCandidaturas || 0}</Text>
              <Text style={styles.metricLabel}>Candidaturas</Text>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={styles.pubButton}
          onPress={() => router.push('/(empresa)/publicar-vaga' as any)}
        >
          <Ionicons name="add" size={18} color="#ffffff" style={{ marginRight: 6 }} />
          <Text style={styles.pubButtonText}>Publicar nova vaga</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Minhas vagas</Text>

        {loading ? (
          <View style={styles.skeletonList}>
            <View style={styles.skeletonCardLarge} />
            <View style={styles.skeletonCardLarge} />
            <View style={styles.skeletonCardLarge} />
          </View>
        ) : semVagas ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              Sua empresa ainda não publicou nenhuma vaga. Clique em '+ Publicar nova vaga' para começar.
            </Text>
          </View>
        ) : (
          vagas.map((vaga: any) => {
            const statusInfo = formatarStatus(vaga.status);
            return (
              <TouchableOpacity
                key={vaga.id}
                style={styles.vagaCard}
                onPress={() => router.push(`/(empresa)/vaga/${vaga.id}` as any)}
              >
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.vagaTitle}>{vaga.titulo}</Text>
                  <Text style={styles.vagaMeta}>
                    {[vaga.contrato, vaga.turno, `${vaga.candidatosCount || 0} candidatos`]
                      .filter(Boolean)
                      .join(' · ')}
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
                  <Text style={[styles.statusText, { color: statusInfo.color }]}>
                    {statusInfo.label}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="briefcase" size={20} color="#0b6643" />
          <Text style={[styles.navText, styles.navTextActive]}>Vagas</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push('/(empresa)/candidatos' as any)}
        >
          <Ionicons name="people-outline" size={20} color="#6b7280" />
          <Text style={styles.navText}>Candidatos</Text>
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
  },
  scrollBody: {
    padding: 20,
    paddingBottom: 90,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  metricNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  pubButton: {
    backgroundColor: '#0b6643',
    height: 48,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  pubButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 36,
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
    lineHeight: 20,
  },
  vagaCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  vagaTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  vagaMeta: {
    fontSize: 12,
    color: '#6b7280',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  skeletonBox: {
    height: 76,
    backgroundColor: '#e2e8f0',
  },
  skeletonList: {
    gap: 10,
  },
  skeletonCardLarge: {
    height: 76,
    borderRadius: 16,
    backgroundColor: '#e2e8f0',
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
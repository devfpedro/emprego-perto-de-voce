import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ApiService } from '../../../service/api';

export default function DetalhesVagaScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [vaga, setVaga] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [candidatado, setCandidatado] = useState(false);

  useEffect(() => {
    if (id) {
      carregarDetalhesVaga();
    }
  }, [id]);

  async function carregarDetalhesVaga() {
    try {
      setLoading(true);
      const response = await ApiService.get(`/vagas/${id}`);
      setVaga(response.data);
      if (response.data?.candidatado || response.data?.minhaCandidatura) {
        setCandidatado(true);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCandidatar() {
    try {
      setEnviando(true);
      await ApiService.post(`/vagas/${id}/candidaturas`, {});
      setCandidatado(true);
    } catch (error) {
      console.error(error);
    } finally {
      setEnviando(false);
    }
  }

  const nomeBairro = typeof vaga?.bairro === 'object' ? vaga?.bairro?.nome : vaga?.bairro;
  const nomeEmpresa = typeof vaga?.empresa === 'object' ? vaga?.empresa?.nome : vaga?.empresaNome;
  const empresaId = typeof vaga?.empresa === 'object' ? vaga?.empresa?.id : vaga?.empresaId;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#111827" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
        {loading ? (
          <>
            <View style={styles.skeletonTitle} />
            <View style={styles.skeletonSub} />
            <View style={styles.skeletonCard} />
            <View style={styles.skeletonCardLarge} />
          </>
        ) : vaga ? (
          <>
            <Text style={styles.tituloVaga}>{vaga.titulo}</Text>
            
            <TouchableOpacity 
              style={styles.empresaLinkBox}
              onPress={() => empresaId && router.push(`/(candidato)/empresa/${empresaId}` as any)}
            >
              <View style={styles.avatarBox}>
                <Text style={styles.avatarText}>{vaga.empresaIniciais || nomeEmpresa?.slice(0, 2).toUpperCase() || 'EP'}</Text>
              </View>
              <View style={styles.empresaInfo}>
                <Text style={styles.empresaName}>{nomeEmpresa}</Text>
                <Text style={styles.empresaMeta}>
                  {nomeBairro} {vaga.empresaDistancia ? `· ${vaga.empresaDistancia}` : ''}
                </Text>
              </View>
            </TouchableOpacity>

            <View style={styles.chipsRow}>
              {vaga.area && <View style={styles.chip}><Text style={styles.chipText}>{vaga.area}</Text></View>}
              {(vaga.contrato || vaga.tipo_contrato) && <View style={styles.chip}><Text style={styles.chipText}>{vaga.contrato || vaga.tipo_contrato}</Text></View>}
              {vaga.regime && <View style={styles.chip}><Text style={styles.chipText}>{vaga.regime}</Text></View>}
              {vaga.turno && <View style={styles.chip}><Text style={styles.chipText}>{vaga.turno}</Text></View>}
            </View>

            <View style={styles.detalhesCard}>
              <View style={styles.detalheRow}>
                <Text style={styles.detalheLabel}>Salário</Text>
                <Text style={styles.detalheValue}>{vaga.salario ? `R$ ${vaga.salario}` : 'A combinar'}</Text>
              </View>
              <View style={styles.detalheRow}>
                <Text style={styles.detalheLabel}>Regime</Text>
                <Text style={styles.detalheValue}>{vaga.regime || 'Presencial'}</Text>
              </View>
              <View style={styles.detalheRow}>
                <Text style={styles.detalheLabel}>Turno</Text>
                <Text style={styles.detalheValue}>{vaga.turno || 'A combinar'}</Text>
              </View>
              <View style={styles.detalheRow}>
                <Text style={styles.detalheLabel}>Status</Text>
                <Text style={[styles.detalheValue, styles.statusAtivo]}>{vaga.status || 'Aberta'}</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Descrição</Text>
            <Text style={styles.sectionText}>{vaga.descricao}</Text>

            {vaga.requisitos ? (
              <>
                <Text style={styles.sectionTitle}>Requisitos</Text>
                <Text style={styles.sectionText}>{vaga.requisitos}</Text>
              </>
            ) : null}
          </>
        ) : null}
      </ScrollView>

      {!loading && vaga && (
        <View style={styles.footer}>
          {candidatado ? (
            <>
              <View style={styles.statusBadgeEnviada}>
                <Text style={styles.statusBadgeText}>Enviada</Text>
              </View>
              <TouchableOpacity style={styles.enviadaButton} disabled>
                <Text style={styles.enviadaButtonText}>Candidatura Enviada</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.minhasCandidaturasButton}
                onPress={() => router.push('/(candidato)/candidaturas' as any)}
              >
                <Text style={styles.minhasCandidaturasButtonText}>Ver em Minhas Candidaturas</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity 
              style={[styles.applyButton, enviando && styles.applyButtonDisabled]}
              onPress={handleCandidatar}
              disabled={enviando}
            >
              {enviando ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.applyButtonText}>Candidatar-me a esta vaga</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  headerRow: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  scrollBody: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  tituloVaga: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
  },
  empresaLinkBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#fef3c7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400e',
  },
  empresaInfo: {
    flex: 1,
  },
  empresaName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  empresaMeta: {
    fontSize: 12,
    color: '#6b7280',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  chip: {
    backgroundColor: '#e6f4ea',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0b6643',
  },
  detalhesCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  detalheRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  detalheLabel: {
    fontSize: 13,
    color: '#6b7280',
  },
  detalheValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  statusAtivo: {
    color: '#0b6643',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 22,
    marginBottom: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  applyButton: {
    backgroundColor: '#0b6643',
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyButtonDisabled: {
    opacity: 0.8,
  },
  applyButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  statusBadgeEnviada: {
    alignSelf: 'flex-start',
    backgroundColor: '#e6f4ea',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 8,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0b6643',
  },
  enviadaButton: {
    backgroundColor: '#f1f5f9',
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  enviadaButtonText: {
    color: '#64748b',
    fontSize: 15,
    fontWeight: '700',
  },
  minhasCandidaturasButton: {
    backgroundColor: 'transparent',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  minhasCandidaturasButtonText: {
    color: '#0b6643',
    fontSize: 14,
    fontWeight: '600',
  },
  skeletonTitle: {
    height: 26,
    width: '70%',
    backgroundColor: '#e2e8f0',
    borderRadius: 6,
    marginBottom: 16,
  },
  skeletonSub: {
    height: 40,
    width: '50%',
    backgroundColor: '#e2e8f0',
    borderRadius: 8,
    marginBottom: 20,
  },
  skeletonCard: {
    height: 150,
    backgroundColor: '#e2e8f0',
    borderRadius: 16,
    marginBottom: 24,
  },
  skeletonCardLarge: {
    height: 120,
    backgroundColor: '#e2e8f0',
    borderRadius: 16,
  },
});
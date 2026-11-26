
import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ApiService } from '../../../service/api';

export default function VagasScreen() {
  const router = useRouter();
  const [vagas, setVagas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      carregarVagasEmpresa();
    }, [])
  );

  async function carregarVagasEmpresa() {
    try {
      setLoading(true);

      const response = await ApiService.get('/empresa/vagas');

      setVagas(
        Array.isArray(response.data?.itens)
          ? response.data.itens
          : []
      );
    } catch (error) {
      console.error('Erro ao carregar vagas:', error);
    } finally {
      setLoading(false);
    }
  }

  function formatarStatus(status: string) {
    switch (status) {
      case 'aberta':
        return {
          label: 'Aberta',
          bg: '#e6f4ea',
          color: '#0b6643',
        };

      case 'pausada':
        return {
          label: 'Pausada',
          bg: '#fef3c7',
          color: '#b45309',
        };

      case 'encerrada':
        return {
          label: 'Encerrada',
          bg: '#f1f5f9',
          color: '#64748b',
        };

      case 'cancelada':
        return {
          label: 'Cancelada',
          bg: '#fee2e2',
          color: '#b91c1c',
        };

      default:
        return {
          label: status,
          bg: '#f1f5f9',
          color: '#64748b',
        };
    }
  }

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top']}
    >
      <View style={styles.header}>
        <Text style={styles.title}>
          Painel de Vagas da Empresa
        </Text>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() =>
            router.push('/(empresa)/publicar-vaga' as any)
          }
          activeOpacity={0.8}
        >
          <Ionicons
            name="add"
            size={20}
            color="#ffffff"
          />

          <Text style={styles.addButtonText}>
            Nova Vaga
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollBody}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator
              size="large"
              color="#0b6643"
            />
          </View>
        ) : vagas.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons
              name="briefcase-outline"
              size={36}
              color="#9ca3af"
              style={{ marginBottom: 8 }}
            />

            <Text style={styles.emptyText}>
              Nenhuma vaga cadastrada pela sua empresa ainda.
            </Text>
          </View>
        ) : (
          vagas.map((vaga) => {
            const statusInfo = formatarStatus(vaga.status);

            return (
              <TouchableOpacity
                key={vaga.id}
                style={styles.vagaCard}
                onPress={() =>
                  router.push(`/(empresa)/vaga/${vaga.id}` as any)
                }
                activeOpacity={0.7}
              >
                <View style={styles.vagaInfo}>
                  <Text
                    style={styles.vagaTitle}
                    numberOfLines={2}
                  >
                    {vaga.titulo}
                  </Text>

                  <Text
                    style={styles.vagaMeta}
                    numberOfLines={2}
                  >
                    {[
                      vaga.contrato,
                      vaga.turno,
                      vaga.salario
                        ? `R$ ${vaga.salario}`
                        : 'A combinar',
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </Text>
                </View>

                <View style={styles.cardRight}>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: statusInfo.bg },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: statusInfo.color },
                      ]}
                    >
                      {statusInfo.label}
                    </Text>
                  </View>

                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color="#9ca3af"
                  />
                </View>
              </TouchableOpacity>
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
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    flexShrink: 1,
  },
  addButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#0b6643',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 4,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  scroll: {
    flex: 1,
    width: '100%',
  },
  scrollBody: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    flexGrow: 1,
  },
  centered: {
    marginTop: 40,
    alignItems: 'center',
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
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  vagaCard: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  vagaInfo: {
    flex: 1,
    minWidth: 0,
    marginRight: 8,
  },
  vagaTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
    flexShrink: 1,
  },
  vagaMeta: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 17,
    flexShrink: 1,
  },
  cardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
});

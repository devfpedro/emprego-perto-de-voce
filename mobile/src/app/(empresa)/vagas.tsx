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
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ApiService } from '../../service/api';

export default function VagasScreen() {
  const router = useRouter();
  const [vagas, setVagas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarVagasEmpresa();
  }, []);

  async function carregarVagasEmpresa() {
    try {
      setLoading(true);
      const response = await ApiService.get('/empresa/vagas');
      setVagas(Array.isArray(response.data?.itens) ? response.data.itens : []);
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Painel de Vagas da Empresa</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/(empresa)/publicar-vaga' as any)}
        >
          <Ionicons name="add" size={20} color="#ffffff" />
          <Text style={styles.addButtonText}>Nova Vaga</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#0b6643" />
          </View>
        ) : vagas.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="briefcase-outline" size={36} color="#9ca3af" style={{ marginBottom: 8 }} />
            <Text style={styles.emptyText}>Nenhuma vaga cadastrada pela sua empresa ainda.</Text>
          </View>
        ) : (
          vagas.map((vaga) => {
            const statusInfo = formatarStatus(vaga.status);
            return (
              <View key={vaga.id} style={styles.vagaCard}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.vagaTitle}>{vaga.titulo}</Text>
                  <Text style={styles.vagaMeta}>
                    {[vaga.contrato, vaga.turno, vaga.salario ? `R$ ${vaga.salario}` : 'A combinar']
                      .filter(Boolean)
                      .join(' · ')}
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
                  <Text style={[styles.statusText, { color: statusInfo.color }]}>
                    {statusInfo.label}
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
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { 
    fontSize: 18, 
    fontWeight: '800', 
    color: '#111827', 
  },
  addButton: {
    backgroundColor: '#0b6643',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 4,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  scrollBody: {
    padding: 20,
  },
  centered: {
    marginTop: 40,
    alignItems: 'center',
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
  },
  vagaCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
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
});
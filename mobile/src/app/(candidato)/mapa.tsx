import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ModalFiltros from '../../components/ModalFiltros';
import { ApiService } from '../../service/api';

const CATEGORIAS = ['Todas', 'Alimentação', 'Comércio', 'Saúde'];

export default function MapaScreen() {
  const router = useRouter();

  const [busca, setBusca] = useState('');
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todas');
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [empresaSelecionada, setEmpresaSelecionada] = useState<any>(null);
  
  const [modalFiltrosVisible, setModalFiltrosVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [localizacaoNegada, setLocalizacaoNegada] = useState(false);

  useEffect(() => {
    carregarDadosMapa();
  }, []);

  async function carregarDadosMapa() {
    try {
      setLoading(true);
      const response = await ApiService.get('/empresas');
      setEmpresas(response.data);
      if (response.data && response.data.length > 0) {
        setEmpresaSelecionada(response.data[0]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const empresasFiltradas = empresas.filter((emp) => {
    const matchCategoria = categoriaAtiva === 'Todas' || emp.categoria === categoriaAtiva;
    const matchBusca =
      emp.nome.toLowerCase().includes(busca.toLowerCase()) ||
      emp.categoria.toLowerCase().includes(busca.toLowerCase());
    return matchCategoria && matchBusca;
  });

  const semResultados = !loading && empresasFiltradas.length === 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mapBackground}>
        <View style={styles.gridOverlay} />

        {!loading && !semResultados && (
          <View style={styles.userRadiusCircle}>
            <View style={styles.userDot} />
          </View>
        )}

        {!loading &&
          empresasFiltradas.map((emp) => {
            const isSelected = empresaSelecionada?.id === emp.id;
            return (
              <TouchableOpacity
                key={emp.id}
                style={[
                  styles.mapPin,
                  { top: emp.top || '40%', left: emp.left || '50%' },
                  isSelected && styles.mapPinSelected,
                ]}
                onPress={() => setEmpresaSelecionada(emp)}
              >
                <Ionicons
                  name="briefcase-outline"
                  size={13}
                  color={isSelected ? '#ffffff' : '#0b6643'}
                />
                <Text style={[styles.mapPinText, isSelected && styles.mapPinTextSelected]}>
                  {emp.vagasCount} {emp.vagasCount === 1 ? 'vaga' : 'vagas'}
                </Text>
              </TouchableOpacity>
            );
          })}
      </View>

      <View style={styles.topOverlay}>
        <View style={styles.searchRow}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search-outline" size={18} color="#6b7280" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar vagas, empresas ou área..."
              placeholderTextColor="#9ca3af"
              value={busca}
              onChangeText={setBusca}
            />
            {busca.length > 0 && (
              <TouchableOpacity onPress={() => setBusca('')}>
                <Ionicons name="close-circle" size={18} color="#9ca3af" />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setModalFiltrosVisible(true)}
          >
            <Ionicons name="options-outline" size={20} color="#0b6643" />
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {CATEGORIAS.map((cat) => {
            const isActive = categoriaAtiva === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryChip, isActive && styles.categoryChipActive]}
                onPress={() => setCategoriaAtiva(cat)}
              >
                <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {semResultados && (
          <View style={styles.alertError}>
            <Text style={styles.alertErrorText}>
              Nenhuma vaga encontrada nesta região ou busca.
            </Text>
          </View>
        )}

        {localizacaoNegada && !semResultados && (
          <View style={styles.alertInfo}>
            <Ionicons name="lock-closed-outline" size={16} color="#0b6643" />
            <Text style={styles.alertInfoText}>
              Acesso à localização negado. Mostrando o centro do bairro cadastrado no seu perfil.
            </Text>
          </View>
        )}
      </View>

      <View style={styles.bottomOverlay}>
        <View style={styles.locateButtonWrapper}>
          <TouchableOpacity
            style={styles.locateButton}
            onPress={() => setLocalizacaoNegada(!localizacaoNegada)}
          >
            <Ionicons name="locate-outline" size={20} color="#111827" />
          </TouchableOpacity>
        </View>

        {!loading && !semResultados && empresaSelecionada && (
          <View style={styles.companyCard}>
            <View style={styles.companyHeader}>
              <View style={styles.avatarBox}>
                <Text style={styles.avatarText}>{empresaSelecionada.iniciais}</Text>
              </View>

              <View style={styles.companyInfo}>
                <Text style={styles.companyName}>{empresaSelecionada.nome}</Text>
                <Text style={styles.companyMeta}>
                  {empresaSelecionada.categoria} · {empresaSelecionada.bairro?.nome || empresaSelecionada.bairro} · {empresaSelecionada.distancia || '0,4 km'}
                </Text>
              </View>
            </View>

            <View style={styles.phoneRow}>
              <Ionicons name="call-outline" size={14} color="#6b7280" />
              <Text style={styles.phoneText}>{empresaSelecionada.telefone}</Text>
            </View>

            <TouchableOpacity
              style={styles.detailsButton}
              onPress={() => router.push(`/(candidato)/empresa/${String(empresaSelecionada.id)}` as any)}
            >
              <Text style={styles.detailsButtonText}>Ver vagas e detalhes</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ModalFiltros
        visible={modalFiltrosVisible}
        onClose={() => setModalFiltrosVisible(false)}
        onApply={(filtrosAplicados) => {
          console.log(filtrosAplicados);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e5ebe7',
  },
  mapBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#dde3df',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.3,
  },
  userRadiusCircle: {
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(11, 102, 67, 0.12)',
    borderWidth: 1,
    borderColor: '#0b6643',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
  },
  userDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#1d4ed8',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  mapPin: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  mapPinSelected: {
    backgroundColor: '#0b6643',
  },
  mapPinText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
  },
  mapPinTextSelected: {
    color: '#ffffff',
  },
  topOverlay: {
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    height: 46,
    borderRadius: 14,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
  filterButton: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#e6f4ea',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  categoriesContainer: {
    paddingVertical: 12,
    gap: 8,
  },
  categoryChip: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d1d5db',
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#e6f4ea',
    borderColor: '#0b6643',
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  categoryTextActive: {
    color: '#0b6643',
  },
  alertError: {
    backgroundColor: '#fee2e2',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginTop: 4,
  },
  alertErrorText: {
    color: '#b91c1c',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  alertInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e6f4ea',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginTop: 4,
    gap: 8,
  },
  alertInfoText: {
    flex: 1,
    color: '#0b6643',
    fontSize: 12,
    lineHeight: 16,
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  locateButtonWrapper: {
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  locateButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 4,
  },
  companyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  companyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#fef3c7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#92400e',
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  companyMeta: {
    fontSize: 12,
    color: '#6b7280',
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
  },
  phoneText: {
    fontSize: 13,
    color: '#4b5563',
  },
  detailsButton: {
    backgroundColor: '#0b6643',
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
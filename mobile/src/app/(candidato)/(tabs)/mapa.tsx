
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import ModalFiltros from '../../../components/ModalFiltros';
import { ApiService } from '../../../service/api';

const CATEGORIAS = ['Todas', 'Alimentação', 'Comércio', 'Saúde'];

const AREAS: Record<string, string> = {
  Alimentação: 'alimentacao',
  Comércio: 'comercio',
  Saúde: 'saude',
  'Serviços Gerais': 'servicos_gerais',
  Educação: 'educacao',
};

const CONTRATOS: Record<string, string> = {
  CLT: 'clt',
  'Meio Período': 'meio_periodo',
  Temporário: 'temporario',
  Estágio: 'estagio',
};

const REGIAO_PADRAO: Region = {
  latitude: -6.8548,
  longitude: -35.4902,
  latitudeDelta: 0.06,
  longitudeDelta: 0.06,
};

type Coordenadas = {
  latitude: number;
  longitude: number;
};

type Vaga = {
  id: number;
  titulo: string;
  area: string;
  contrato: string;
  empresa: {
    id: number;
    nome: string;
  };
  bairro: {
    id: number;
    nome: string;
    latitude: number | string;
    longitude: number | string;
  };
  distanciaKm: number;
};

type GrupoVagas = {
  chave: string;
  latitude: number;
  longitude: number;
  vagas: Vaga[];
};

export default function MapaScreen() {
  const insets = useSafeAreaInsets();

  const [busca, setBusca] = useState('');
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todas');
  const [vagas, setVagas] = useState<Vaga[]>([]);
  const [vagaSelecionada, setVagaSelecionada] = useState<Vaga | null>(null);
  const [indiceVagaLocal, setIndiceVagaLocal] = useState(0);
  const [modalFiltrosVisible, setModalFiltrosVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [localizacaoNegada, setLocalizacaoNegada] = useState(false);
  const [localizacaoAtual, setLocalizacaoAtual] = useState<Coordenadas | null>(null);
  const [regiao, setRegiao] = useState<Region>(REGIAO_PADRAO);
  const [erro, setErro] = useState('');

  const [filtros, setFiltros] = useState({
    areasSelecionadas: [] as string[],
    contratosSelecionados: [] as string[],
    distancia: 10,
    tipoVisualizacao: 'Vagas',
  });

  const carregarVagas = useCallback(async (
    distancia = filtros.distancia,
    coordenadas: Coordenadas | null = localizacaoAtual,
  ) => {
    try {
      setLoading(true);
      setErro('');

      const parametros = [
        `raioKm=${encodeURIComponent(String(distancia))}`,
      ];

      if (coordenadas) {
        parametros.push(`lat=${encodeURIComponent(String(coordenadas.latitude))}`);
        parametros.push(`lng=${encodeURIComponent(String(coordenadas.longitude))}`);
      }

      const response = await ApiService.get(`/vagas?${parametros.join('&')}`);

      const itens = Array.isArray(response.data?.itens)
        ? response.data.itens
        : [];

      const vagasValidas = itens.filter((vaga: Vaga) => {
        const latitude = Number(vaga.bairro?.latitude);
        const longitude = Number(vaga.bairro?.longitude);

        return (
          Number.isFinite(latitude) &&
          Number.isFinite(longitude) &&
          latitude >= -90 &&
          latitude <= 90 &&
          longitude >= -180 &&
          longitude <= 180
        );
      });

      setVagas(vagasValidas);

      setVagaSelecionada((atual) => {
        if (atual) {
          const vagaAtualizada = vagasValidas.find(
            (vaga: Vaga) => vaga.id === atual.id,
          );

          if (vagaAtualizada) return vagaAtualizada;
        }

        return vagasValidas[0] || null;
      });

      if (vagasValidas.length > 0) {
        const primeiraVaga = vagasValidas[0];

        setRegiao((atual) => {
          if (coordenadas) {
            return {
              latitude: coordenadas.latitude,
              longitude: coordenadas.longitude,
              latitudeDelta: 0.04,
              longitudeDelta: 0.04,
            };
          }

          return {
            ...atual,
            latitude: Number(primeiraVaga.bairro.latitude),
            longitude: Number(primeiraVaga.bairro.longitude),
          };
        });
      }
    } catch (error) {
      console.error('Erro ao carregar vagas do mapa:', error);
      setErro('Não foi possível carregar as vagas. Verifique sua conexão.');
      setVagas([]);
      setVagaSelecionada(null);
    } finally {
      setLoading(false);
    }
  }, [filtros.distancia, localizacaoAtual]);

  const obterLocalizacao = useCallback(async () => {
    try {
      setLocalizacaoNegada(false);

      const permissao = await Location.requestForegroundPermissionsAsync();

      if (permissao.status !== 'granted') {
        setLocalizacaoNegada(true);
        setLocalizacaoAtual(null);
        await carregarVagas(filtros.distancia, null);
        return;
      }

      const posicaoAnterior = await Location.getLastKnownPositionAsync();

      if (posicaoAnterior) {
        const coordenadasAnteriores = {
          latitude: posicaoAnterior.coords.latitude,
          longitude: posicaoAnterior.coords.longitude,
        };

        setLocalizacaoAtual(coordenadasAnteriores);

        setRegiao({
          ...coordenadasAnteriores,
          latitudeDelta: 0.04,
          longitudeDelta: 0.04,
        });

        await carregarVagas(filtros.distancia, coordenadasAnteriores);
      } else {
        await carregarVagas(filtros.distancia, null);
      }

      Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      })
        .then((posicao) => {
          const coordenadas = {
            latitude: posicao.coords.latitude,
            longitude: posicao.coords.longitude,
          };

          setLocalizacaoAtual(coordenadas);

          setRegiao({
            ...coordenadas,
            latitudeDelta: 0.04,
            longitudeDelta: 0.04,
          });

          carregarVagas(filtros.distancia, coordenadas);
        })
        .catch((error) => {
          console.error('Não foi possível atualizar a localização:', error);
        });
    } catch (error) {
      console.error('Erro ao obter localização:', error);
      setLocalizacaoNegada(true);
      await carregarVagas(filtros.distancia, null);
    }
  }, [carregarVagas, filtros.distancia]);

  useEffect(() => {
    obterLocalizacao();
  }, []);

  const vagasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return vagas.filter((vaga) => {
      const area = String(vaga.area || '').toLowerCase();
      const contrato = String(vaga.contrato || '').toLowerCase();
      const nomeEmpresa = String(vaga.empresa?.nome || '').toLowerCase();
      const titulo = String(vaga.titulo || '').toLowerCase();
      const bairro = String(vaga.bairro?.nome || '').toLowerCase();

      const categoriaSelecionada = categoriaAtiva === 'Todas'
        || area === AREAS[categoriaAtiva];

      const areasSelecionadas = filtros.areasSelecionadas.map(
        (item) => AREAS[item] || item.toLowerCase(),
      );

      const contratosSelecionados = filtros.contratosSelecionados.map(
        (item) => CONTRATOS[item] || item.toLowerCase(),
      );

      const correspondeArea = areasSelecionadas.length === 0
        || areasSelecionadas.includes(area);

      const correspondeContrato = contratosSelecionados.length === 0
        || contratosSelecionados.includes(contrato);

      const correspondeBusca = !termo
        || titulo.includes(termo)
        || nomeEmpresa.includes(termo)
        || bairro.includes(termo)
        || area.includes(termo);

      return categoriaSelecionada
        && correspondeArea
        && correspondeContrato
        && correspondeBusca;
    });
  }, [vagas, busca, categoriaAtiva, filtros]);

  const gruposVagas = useMemo(() => {
    const grupos = new Map<string, GrupoVagas>();

    vagasFiltradas.forEach((vaga) => {
      const latitude = Number(vaga.bairro.latitude);
      const longitude = Number(vaga.bairro.longitude);
      const chave = `${latitude.toFixed(6)}_${longitude.toFixed(6)}`;

      if (!grupos.has(chave)) {
        grupos.set(chave, {
          chave,
          latitude,
          longitude,
          vagas: [],
        });
      }

      grupos.get(chave)!.vagas.push(vaga);
    });

    return Array.from(grupos.values());
  }, [vagasFiltradas]);

  const grupoSelecionado = useMemo(() => {
    if (!vagaSelecionada) return null;

    const chave = `${Number(vagaSelecionada.bairro.latitude).toFixed(6)}_${Number(vagaSelecionada.bairro.longitude).toFixed(6)}`;

    return gruposVagas.find((grupo) => grupo.chave === chave) || null;
  }, [vagaSelecionada, gruposVagas]);

  const selecionarGrupo = (grupo: GrupoVagas) => {
    setIndiceVagaLocal(0);
    setVagaSelecionada(grupo.vagas[0]);

    setRegiao((atual) => ({
      ...atual,
      latitude: grupo.latitude,
      longitude: grupo.longitude,
    }));
  };

  const navegarVagaLocal = () => {
    if (!grupoSelecionado || grupoSelecionado.vagas.length <= 1) return;

    const proximoIndice = (indiceVagaLocal + 1) % grupoSelecionado.vagas.length;

    setIndiceVagaLocal(proximoIndice);
    setVagaSelecionada(grupoSelecionado.vagas[proximoIndice]);
  };

  const aplicarFiltros = (filtrosAplicados: any) => {
    const novosFiltros = {
      areasSelecionadas: filtrosAplicados.areasSelecionadas || [],
      contratosSelecionados: filtrosAplicados.contratosSelecionados || [],
      distancia: Number(filtrosAplicados.distancia) || 10,
      tipoVisualizacao: filtrosAplicados.tipoVisualizacao || 'Vagas',
    };

    setFiltros(novosFiltros);
    setModalFiltrosVisible(false);
    carregarVagas(novosFiltros.distancia, localizacaoAtual);
  };

  const formatarDistancia = (distancia: number) => {
    const valor = Number(distancia);

    if (!Number.isFinite(valor)) return 'Distância indisponível';

    return `${valor.toFixed(1).replace('.', ',')} km`;
  };

  const nomeArea = (area: string) => {
    const encontrada = Object.entries(AREAS).find(
      ([, valor]) => valor === area,
    );

    return encontrada?.[0] || area;
  };

  const semResultados = !loading && vagasFiltradas.length === 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <MapView
        style={StyleSheet.absoluteFill}
        region={regiao}
        onRegionChangeComplete={setRegiao}
        showsUserLocation={!!localizacaoAtual}
        showsMyLocationButton={false}
        showsCompass
        loadingEnabled
      >
        {gruposVagas.map((grupo) => {
          const selecionado = grupoSelecionado?.chave === grupo.chave;

          return (
            <Marker
              key={grupo.chave}
              coordinate={{
                latitude: grupo.latitude,
                longitude: grupo.longitude,
              }}
              onPress={() => selecionarGrupo(grupo)}
              tracksViewChanges={false}
            >
              <View
                style={[
                  styles.mapMarker,
                  selecionado && styles.mapMarkerSelected,
                ]}
              >
                <Ionicons
                  name="briefcase"
                  size={15}
                  color={selecionado ? '#ffffff' : '#0b6643'}
                />
                <Text
                  style={[
                    styles.mapMarkerText,
                    selecionado && styles.mapMarkerTextSelected,
                  ]}
                >
                  {grupo.vagas.length}
                </Text>
              </View>
            </Marker>
          );
        })}
      </MapView>

      <View style={styles.topOverlay}>
        <View style={styles.searchRow}>
          <View style={styles.searchInputContainer}>
            <Ionicons
              name="search-outline"
              size={18}
              color="#6b7280"
              style={styles.searchIcon}
            />

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
          {CATEGORIAS.map((categoria) => {
            const ativa = categoriaAtiva === categoria;

            return (
              <TouchableOpacity
                key={categoria}
                style={[
                  styles.categoryChip,
                  ativa && styles.categoryChipActive,
                ]}
                onPress={() => setCategoriaAtiva(categoria)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    ativa && styles.categoryTextActive,
                  ]}
                >
                  {categoria}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {localizacaoNegada && (
          <View style={styles.alertInfo}>
            <Ionicons name="information-circle-outline" size={17} color="#0b6643" />
            <Text style={styles.alertInfoText}>
              Localização não autorizada. Usando o bairro cadastrado no seu perfil, quando disponível.
            </Text>
          </View>
        )}

        {erro !== '' && (
          <View style={styles.alertError}>
            <Text style={styles.alertErrorText}>{erro}</Text>
          </View>
        )}

        {semResultados && erro === '' && (
          <View style={styles.alertError}>
            <Text style={styles.alertErrorText}>
              Nenhuma vaga encontrada com os filtros selecionados.
            </Text>
          </View>
        )}
      </View>

      <View
        style={[
          styles.bottomOverlay,
          { bottom: Math.max(insets.bottom, 12) },
        ]}
      >
        <View style={styles.locateButtonWrapper}>
          <TouchableOpacity
            style={styles.locateButton}
            onPress={async () => {
              if (localizacaoNegada) {
                const permissao = await Location.getForegroundPermissionsAsync();

                if (permissao.status === 'denied' && !permissao.canAskAgain) {
                  Alert.alert(
                    'Permissão de localização',
                    'A localização está bloqueada. Você pode autorizá-la nas configurações do aplicativo.',
                    [
                      { text: 'Cancelar', style: 'cancel' },
                      {
                        text: 'Abrir configurações',
                        onPress: () => Linking.openSettings(),
                      },
                    ],
                  );
                  return;
                }
              }

              await obterLocalizacao();
            }}
          >
            <Ionicons name="locate-outline" size={21} color="#111827" />
          </TouchableOpacity>
        </View>

        {loading && (
          <View style={styles.loadingCard}>
            <ActivityIndicator size="small" color="#0b6643" />
            <Text style={styles.loadingText}>Carregando vagas...</Text>
          </View>
        )}

        {!loading && vagaSelecionada && (
          <View style={styles.companyCard}>
            <View style={styles.companyHeader}>
              <View style={styles.avatarBox}>
                <Ionicons name="briefcase-outline" size={22} color="#92400e" />
              </View>

              <View style={styles.companyInfo}>
                <Text style={styles.companyName} numberOfLines={1}>
                  {vagaSelecionada.titulo}
                </Text>

                <Text style={styles.companyMeta} numberOfLines={2}>
                  {vagaSelecionada.empresa.nome} · {vagaSelecionada.bairro.nome}
                </Text>
              </View>
            </View>

            <View style={styles.detailsInfo}>
              <View style={styles.infoItem}>
                <Ionicons name="pricetag-outline" size={14} color="#6b7280" />
                <Text style={styles.infoText}>
                  {nomeArea(vagaSelecionada.area)}
                </Text>
              </View>

              <View style={styles.infoItem}>
                <Ionicons name="location-outline" size={14} color="#6b7280" />
                <Text style={styles.infoText}>
                  {formatarDistancia(vagaSelecionada.distanciaKm)}
                </Text>
              </View>
            </View>

            {grupoSelecionado && grupoSelecionado.vagas.length > 1 && (
              <TouchableOpacity
                style={styles.nextVacancyButton}
                onPress={navegarVagaLocal}
              >
                <Ionicons name="swap-horizontal-outline" size={15} color="#0b6643" />
                <Text style={styles.nextVacancyText}>
                  Ver outra vaga neste local ({grupoSelecionado.vagas.length})
                </Text>
              </TouchableOpacity>
            )}

            <Link
              href={{
                pathname: '/(candidato)/empresa/[id]',
                params: { id: String(vagaSelecionada.id) },
              }}
              asChild
            >
              <TouchableOpacity style={styles.detailsButton}>
                <Text style={styles.detailsButtonText}>
                  Detalhar vaga
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        )}
      </View>

      <ModalFiltros
        visible={modalFiltrosVisible}
        onClose={() => setModalFiltrosVisible(false)}
        onApply={aplicarFiltros}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e5ebe7',
  },
  topOverlay: {
    paddingTop: 4,
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
  mapMarker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 2,
    borderColor: '#0b6643',
    elevation: 4,
  },
  mapMarkerSelected: {
    backgroundColor: '#0b6643',
    borderColor: '#ffffff',
  },
  mapMarkerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0b6643',
  },
  mapMarkerTextSelected: {
    color: '#ffffff',
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
    left: 16,
    right: 16,
    zIndex: 10,
    elevation: 10,
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
  loadingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 18,
    elevation: 5,
  },
  loadingText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '600',
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
    marginBottom: 12,
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
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 3,
  },
  companyMeta: {
    fontSize: 12,
    color: '#6b7280',
  },
  detailsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 14,
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  infoText: {
    fontSize: 12,
    color: '#4b5563',
  },
  nextVacancyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    marginBottom: 10,
    backgroundColor: '#e6f4ea',
    borderRadius: 10,
  },
  nextVacancyText: {
    color: '#0b6643',
    fontSize: 12,
    fontWeight: '600',
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

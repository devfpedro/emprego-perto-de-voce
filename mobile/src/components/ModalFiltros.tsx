import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ModalFiltrosProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filtros: any) => void;
}

const AREAS_ATUACAO = ['Alimentação', 'Comércio', 'Saúde', 'Serviços Gerais', 'Educação'];
const TIPOS_CONTRATO = ['CLT', 'Meio Período', 'Temporário', 'Estágio'];

export default function ModalFiltros({ visible, onClose, onApply }: ModalFiltrosProps) {
  const [tipoVisualizacao, setTipoVisualizacao] = useState<'Vagas' | 'Empresas'>('Vagas');
  const [areasSelecionadas, setAreasSelecionadas] = useState<string[]>(['Alimentação']);
  const [distancia, setDistancia] = useState(2); // em km
  const [contratosSelecionados, setContratosSelecionados] = useState<string[]>([]);
  
  const totalResultados = 12; 
  const temResultados = totalResultados > 0;

  function toggleArea(area: string) {
    if (areasSelecionadas.includes(area)) {
      setAreasSelecionadas(areasSelecionadas.filter(a => a !== area));
    } else {
      setAreasSelecionadas([...areasSelecionadas, area]);
    }
  }

  function toggleContrato(contrato: string) {
    if (contratosSelecionados.includes(contrato)) {
      setContratosSelecionados(contratosSelecionados.filter(c => c !== contrato));
    } else {
      setContratosSelecionados([...contratosSelecionados, contrato]);
    }
  }

  function handleLimpar() {
    setAreasSelecionadas([]);
    setDistancia(5);
    setContratosSelecionados([]);
  }

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          
          {/* Pílula indicadora de arraste */}
          <View style={styles.dragHandle} />

          {/* Cabeçalho */}
          <View style={styles.headerRow}>
            <Text style={styles.title}>Filtros</Text>
            <View style={styles.headerRight}>
              <TouchableOpacity onPress={handleLimpar}>
                <Text style={styles.clearText}>Limpar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Ionicons name="close" size={16} color="#111827" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            
            {/* Secção Mostrar (Vagas / Empresas) */}
            <Text style={styles.sectionLabel}>Mostrar</Text>
            <View style={styles.segmentContainer}>
              <TouchableOpacity 
                style={[styles.segmentBtn, tipoVisualizacao === 'Vagas' && styles.segmentActive]}
                onPress={() => setTipoVisualizacao('Vagas')}
              >
                <Text style={[styles.segmentText, tipoVisualizacao === 'Vagas' && styles.segmentTextActive]}>Vagas</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.segmentBtn, tipoVisualizacao === 'Empresas' && styles.segmentActive]}
                onPress={() => setTipoVisualizacao('Empresas')}
              >
                <Text style={[styles.segmentText, tipoVisualizacao === 'Empresas' && styles.segmentTextActive]}>Empresas</Text>
              </TouchableOpacity>
            </View>

            {/* Área de Atuação */}
            <Text style={styles.sectionLabel}>Área de atuação</Text>
            <View style={styles.chipsContainer}>
              {AREAS_ATUACAO.map(area => {
                const selected = areasSelecionadas.includes(area);
                return (
                  <TouchableOpacity
                    key={area}
                    style={[styles.chip, selected && styles.chipSelected]}
                    onPress={() => toggleArea(area)}
                  >
                    <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{area}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Distância Máxima */}
            <View style={styles.distanceHeader}>
              <Text style={styles.sectionLabel}>Distância máxima</Text>
              <Text style={styles.distanceValue}>até {distancia} km</Text>
            </View>
            <View style={styles.sliderTrack}>
              <View style={[styles.sliderFill, { width: `${(distancia / 10) * 100}%` }]} />
              <View style={[styles.sliderThumb, { left: `${(distancia / 10) * 100}%` }]} />
            </View>
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLimitText}>500 m</Text>
              <Text style={styles.sliderLimitText}>10 km</Text>
            </View>

            {/* Tipo de Contrato */}
            <Text style={styles.sectionLabel}>Tipo de contrato</Text>
            <View style={styles.chipsContainer}>
              {TIPOS_CONTRATO.map(contrato => {
                const selected = contratosSelecionados.includes(contrato);
                return (
                  <TouchableOpacity
                    key={contrato}
                    style={[styles.chip, selected && styles.chipSelected]}
                    onPress={() => toggleContrato(contrato)}
                  >
                    <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{contrato}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

          </ScrollView>

          {/* Botão de Aplicação Inferior */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.applyButton, !temResultados && styles.applyButtonDisabled]}
              disabled={!temResultados}
              onPress={() => {
                onApply({ tipoVisualizacao, areasSelecionadas, distancia, contratosSelecionados });
                onClose();
              }}
            >
              <Text style={[styles.applyButtonText, !temResultados && styles.applyButtonTextDisabled]}>
                {temResultados ? `Mostrar ${totalResultados} vagas` : 'Nenhuma vaga encontrada'}
              </Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    maxHeight: '85%',
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#cbd5e1',
    alignSelf: 'center',
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  clearText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0b6643',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollBody: {
    paddingBottom: 24,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: 10,
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  segmentActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
  },
  segmentTextActive: {
    color: '#111827',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
  },
  chipSelected: {
    backgroundColor: '#e6f4ea',
    borderColor: '#0b6643',
  },
  chipText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#0b6643',
    fontWeight: '600',
  },
  distanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  distanceValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0b6643',
  },
  sliderTrack: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    position: 'relative',
    justifyContent: 'center',
    marginBottom: 6,
  },
  sliderFill: {
    height: 6,
    backgroundColor: '#0b6643',
    borderRadius: 3,
  },
  sliderThumb: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#0b6643',
    position: 'absolute',
    marginLeft: -9,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  sliderLimitText: {
    fontSize: 11,
    color: '#9ca3af',
  },
  footer: {
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  applyButton: {
    backgroundColor: '#0b6643',
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyButtonDisabled: {
    backgroundColor: '#e5e7eb',
  },
  applyButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  applyButtonTextDisabled: {
    color: '#9ca3af',
  },
});
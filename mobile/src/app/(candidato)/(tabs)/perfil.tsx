
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PerfilScreen() {
  const router = useRouter();

  const [perfil, setPerfil] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progressoUpload, setProgressoUpload] = useState(0);
  const [erroUpload, setErroUpload] = useState('');
  const [curriculo, setCurriculo] = useState<any>(null);

  useEffect(() => {
    carregarPerfilLocal();
  }, []);

  async function carregarPerfilLocal() {
    try {
      setLoading(true);
      const dadosSalvos = await AsyncStorage.getItem('@emprego_user_data');

      setPerfil(dadosSalvos ? JSON.parse(dadosSalvos) : null);
    } catch {
      setPerfil(null);
    } finally {
      setLoading(false);
    }
  }

  async function sair() {
    try {
      await AsyncStorage.multiRemove([
        '@emprego_token',
        '@emprego_perfil',
        '@emprego_user_data',
      ]);

      router.replace('/(auth)/login' as any);
    } catch (erro) {
      console.error('Erro ao sair:', erro);
    }
  }

  async function selecionarPdf() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets.length > 0) {
        const file = result.assets[0];

        if (file.size && file.size > 5 * 1024 * 1024) {
          setErroUpload('Arquivo inválido. Envie um PDF de até 5 MB.');
          return;
        }

        setErroUpload('');
        simularUpload(file.name);
      }
    } catch {
      setErroUpload('Não foi possível selecionar o arquivo.');
    }
  }

  function simularUpload(nomeArquivo: string) {
    setUploading(true);
    setProgressoUpload(10);

    const interval = setInterval(() => {
      setProgressoUpload((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          setCurriculo({
            nome: nomeArquivo,
            data: 'Enviado hoje',
          });
          return 100;
        }

        return prev + 25;
      });
    }, 300);
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color="#111827" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Meu perfil</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollBody}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <Text style={styles.infoValue}>Carregando perfil...</Text>
        ) : perfil ? (
          <>
            <View style={styles.userCard}>
              <View style={styles.avatarBox}>
                <Text style={styles.avatarText}>
                  {perfil.nome ? perfil.nome.slice(0, 2).toUpperCase() : 'US'}
                </Text>
              </View>

              <View style={styles.userInfo}>
                <Text style={styles.userName}>
                  {perfil.nome || 'Nome não informado'}
                </Text>
                <Text style={styles.userEmail}>
                  {perfil.email || 'E-mail não informado'}
                </Text>
              </View>
            </View>

            <View style={styles.infoCard}>
              <View style={styles.infoGroup}>
                <Text style={styles.infoLabel}>Telefone</Text>
                <Text style={styles.infoValue}>
                  {perfil.telefone || 'Não informado'}
                </Text>
              </View>

              <View style={styles.infoGroup}>
                <Text style={styles.infoLabel}>Área de interesse</Text>
                <Text style={styles.infoValue}>
                  {perfil.areaInteresse || 'Não informado'}
                </Text>
              </View>

              <View style={styles.infoGroup}>
                <Text style={styles.infoLabel}>
                  Região cadastrada (cidade e bairro)
                </Text>
                <Text style={styles.infoValue}>
                  {[perfil.cidade, perfil.bairro].filter(Boolean).join(' · ') ||
                    'Não informado'}
                </Text>
              </View>
            </View>
          </>
        ) : (
          <Text style={styles.infoValue}>
            Não foi possível carregar os dados do perfil.
          </Text>
        )}


        <Text style={styles.sectionTitle}>Currículo (PDF, até 5 MB)</Text>

        <View style={styles.curriculoCard}>

          {erroUpload ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{erroUpload}</Text>
            </View>
          ) : null}

          {curriculo && !uploading ? (
            <>
              <View style={styles.fileRow}>
                <Ionicons
                  name="document-text-outline"
                  size={24}
                  color="#0b6643"
                />
                <View style={styles.fileInfo}>
                  <Text style={styles.fileName}>{curriculo.nome}</Text>
                  <Text style={styles.fileDate}>
                    {curriculo.data || 'Enviado recentemente'}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.outlineButton}
                onPress={selecionarPdf}
              >
                <Text style={styles.outlineButtonText}>Substituir PDF</Text>
              </TouchableOpacity>
            </>
          ) : uploading ? (
            <>
              <View style={styles.fileRow}>
                <Ionicons
                  name="document-text-outline"
                  size={24}
                  color="#6b7280"
                />
                <View style={styles.fileInfo}>
                  <Text style={styles.fileName}>curriculo.pdf</Text>
                  <Text style={styles.fileDate}>
                    Enviando... {progressoUpload}%
                  </Text>
                </View>
              </View>

              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${progressoUpload}%` },
                  ]}
                />
              </View>
            </>
          ) : (
            <TouchableOpacity
              style={styles.solidButton}
              onPress={selecionarPdf}
            >
              <Text style={styles.solidButtonText}>Enviar PDF</Text>
            </TouchableOpacity>
          )}
        </View>

<TouchableOpacity
  style={styles.logoutContainer}
  onPress={sair}
  activeOpacity={0.8}
>
  <Text style={styles.logoutText}>Sair</Text>
</TouchableOpacity>

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
    paddingBottom: 10,
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
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },
  scroll: {
    flex: 1,
  },
  scrollBody: {
    padding: 20,
    paddingBottom: 28,
  },
  userCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#e6f4ea',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0b6643',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 12,
    color: '#6b7280',
  },
  infoCard: {
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
  infoGroup: {
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 11,
    color: '#9ca3af',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  curriculoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  errorBanner: {
    backgroundColor: '#fee2e2',
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  errorBannerText: {
    color: '#b91c1c',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  fileInfo: {
    marginLeft: 10,
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  fileDate: {
    fontSize: 11,
    color: '#6b7280',
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outlineButtonText: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '600',
  },
  solidButton: {
    backgroundColor: '#0b6643',
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  solidButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#0b6643',
  },
logoutContainer: {
  alignSelf: 'center',
  marginTop: 180,
  padding: 4,
  borderRadius: 12,
},
logoutText: {
  color: '#ff0000',
  fontSize: 16,
  fontWeight: '700',
},
});

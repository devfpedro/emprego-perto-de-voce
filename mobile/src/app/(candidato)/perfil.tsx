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
      if (dadosSalvos) {
        setPerfil(JSON.parse(dadosSalvos));
      } else {
        setPerfil({
          nome: 'falha no carregamento',
          email: 'error@error.com',
          telefone: '(00) 00000-0000',
          areaInteresse: 'error',
          cidade: 'error',
          bairro: 'error',
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function selecionarPdf() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        
        if (file.size && file.size > 5 * 1024 * 1024) {
          setErroUpload('Arquivo inválido. Envie um PDF de até 5 MB.');
          return;
        }

        setErroUpload('');
        simularUpload(file.name);
      }
    } catch (error) {
      console.error(error);
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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meu perfil</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
        {perfil && (
          <>
            <View style={styles.userCard}>
              <View style={styles.avatarBox}>
                <Text style={styles.avatarText}>
                  {perfil.nome ? perfil.nome.slice(0, 2).toUpperCase() : 'PH'}
                </Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{perfil.nome}</Text>
                <Text style={styles.userEmail}>{perfil.email}</Text>
              </View>
            </View>

            <View style={styles.infoCard}>
              <View style={styles.infoGroup}>
                <Text style={styles.infoLabel}>Telefone</Text>
                <Text style={styles.infoValue}>{perfil.telefone}</Text>
              </View>
              <View style={styles.infoGroup}>
                <Text style={styles.infoLabel}>Área de interesse</Text>
                <Text style={styles.infoValue}>{perfil.areaInteresse}</Text>
              </View>
              <View style={styles.infoGroup}>
                <Text style={styles.infoLabel}>Região cadastrada (cidade e bairro)</Text>
                <Text style={styles.infoValue}>{perfil.cidade} · {perfil.bairro}</Text>
              </View>
            </View>
          </>
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
                <Ionicons name="document-text-outline" size={24} color="#0b6643" />
                <View style={{ marginLeft: 10, flex: 1 }}>
                  <Text style={styles.fileName}>{curriculo.nome}</Text>
                  <Text style={styles.fileDate}>{curriculo.data || 'Enviado recentemente'}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.outlineButton} onPress={selecionarPdf}>
                <Text style={styles.outlineButtonText}>Substituir PDF</Text>
              </TouchableOpacity>
            </>
          ) : uploading ? (
            <>
              <View style={styles.fileRow}>
                <Ionicons name="document-text-outline" size={24} color="#6b7280" />
                <View style={{ marginLeft: 10, flex: 1 }}>
                  <Text style={styles.fileName}>curriculo.pdf</Text>
                  <Text style={styles.fileDate}>Enviando... {progressoUpload}%</Text>
                </View>
              </View>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${progressoUpload}%` }]} />
              </View>
            </>
          ) : (
            <>
              <TouchableOpacity style={styles.solidButton} onPress={selecionarPdf}>
                <Text style={styles.solidButtonText}>Enviar PDF</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(candidato)/mapa' as any)}>
          <Ionicons name="map-outline" size={20} color="#6b7280" />
          <Text style={styles.navText}>Mapa</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(candidato)/candidaturas' as any)}>
          <Ionicons name="checkbox-outline" size={20} color="#6b7280" />
          <Text style={styles.navText}>Candidaturas</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="person" size={20} color="#0b6643" />
          <Text style={[styles.navText, styles.navTextActive]}>Perfil</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { paddingHorizontal: 20, paddingTop: 16, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingBottom: 16 },
  backButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#f8fafc', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#111827' },
  scrollBody: { padding: 20, paddingBottom: 90 },
  userCard: { backgroundColor: '#ffffff', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 },
  avatarBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#e6f4ea', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { fontSize: 15, fontWeight: '700', color: '#0b6643' },
  userInfo: { flex: 1 },
  userName: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 2 },
  userEmail: { fontSize: 12, color: '#6b7280' },
  infoCard: { backgroundColor: '#ffffff', borderRadius: 16, padding: 16, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 },
  infoGroup: { marginBottom: 12 },
  infoLabel: { fontSize: 11, color: '#9ca3af', marginBottom: 2 },
  infoValue: { fontSize: 14, fontWeight: '600', color: '#111827' },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 12 },
  curriculoCard: { backgroundColor: '#ffffff', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 },
  errorBanner: { backgroundColor: '#fee2e2', padding: 10, borderRadius: 10, marginBottom: 12 },
  errorBannerText: { color: '#b91c1c', fontSize: 12, fontWeight: '600', textAlign: 'center' },
  fileRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  fileName: { fontSize: 14, fontWeight: '700', color: '#111827' },
  fileDate: { fontSize: 11, color: '#6b7280' },
  outlineButton: { borderWidth: 1, borderColor: '#e2e8f0', height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  outlineButtonText: { color: '#111827', fontSize: 14, fontWeight: '600' },
  solidButton: { backgroundColor: '#0b6643', height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  solidButtonText: { color: '#ffffff', fontSize: 14, fontWeight: '700' },
  progressBarBg: { height: 6, backgroundColor: '#e2e8f0', borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#0b6643' },
  bottomNav: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 64, backgroundColor: '#ffffff', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingHorizontal: 24 },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  navText: { fontSize: 11, color: '#6b7280', marginTop: 4, fontWeight: '500' },
  navTextActive: { color: '#0b6643', fontWeight: '700' },
});
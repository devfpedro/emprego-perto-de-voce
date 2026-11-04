import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function EmpresaLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#28a745' }}>
      <Tabs.Screen
        name="vagas"
        options={{
          title: 'Vagas',
          headerTitle: 'Painel de Vagas',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="briefcase-outline" size={size} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="candidatos"
        options={{
          title: 'Candidatos',
          headerTitle: 'Candidatos Inscritos',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color as string} />
          ),
        }}
      />
    </Tabs>
  );
}
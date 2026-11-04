import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function CandidatoLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#007BFF' }}>
      <Tabs.Screen
        name="mapa"
        options={{
          title: 'Mapa',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map-outline" size={size} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="candidaturas"
        options={{
          title: 'Candidaturas',
          headerTitle: 'Minhas Candidaturas',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text-outline" size={size} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          headerTitle: 'Meu Perfil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color as string} />
          ),
        }}
      />
    </Tabs>
  );
}
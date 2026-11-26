import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function EmpresaTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#28a745',
      }}
    >
      <Tabs.Screen
        name="vagas"
        options={{
          title: 'Vagas',
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="briefcase-outline"
              size={size}
              color={color as string}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="candidatos"
        options={{
          title: 'Candidatos',
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="people-outline"
              size={size}
              color={color as string}
            />
          ),
        }}
      />
    </Tabs>
  );
}
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CandidatoTabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#0b6643',
        tabBarInactiveTintColor: '#6b7280',
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e2e8f0',
          height: 60 + insets.bottom,
          paddingBottom: Math.max(insets.bottom, 5),
          paddingTop: 5,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="mapa"
        options={{
          title: 'Mapa',
          tabBarIcon: ({ focused, size }) => (
            <Ionicons name="map-outline" size={size} color={focused ? '#0b6643' : '#6b7280'} />
          ),
        }}
      />
      <Tabs.Screen
        name="candidaturas"
        options={{
          title: 'Candidaturas',
          tabBarIcon: ({ focused, size }) => (
            <Ionicons name="document-text-outline" size={size} color={focused ? '#0b6643' : '#6b7280'} />
          ),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ focused, size }) => (
            <Ionicons name="person-outline" size={size} color={focused ? '#0b6643' : '#6b7280'} />
          ),
        }}
      />
    </Tabs>
  );
}

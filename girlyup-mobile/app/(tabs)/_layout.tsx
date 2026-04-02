import { Tabs } from 'expo-router'
import { Text } from 'react-native'

const Icon = ({ symbol, focused }: { symbol: string; focused: boolean }) => (
  <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.4 }}>{symbol}</Text>
)

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown:           false,
        tabBarShowLabel:       true,
        tabBarActiveTintColor:   '#a855f7',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          borderTopWidth: 0.5,
          borderTopColor: '#f3f4f6',
          paddingBottom:  8,
          height:         60,
        },
      }}
    >
      <Tabs.Screen name="swipe"    options={{ title: 'Explorer', tabBarIcon: ({ focused }) => <Icon symbol="♡" focused={focused} /> }} />
      <Tabs.Screen name="events"   options={{ title: 'Sorties',  tabBarIcon: ({ focused }) => <Icon symbol="◻" focused={focused} /> }} />
      <Tabs.Screen name="messages" options={{ title: 'Messages', tabBarIcon: ({ focused }) => <Icon symbol="✉" focused={focused} /> }} />
      <Tabs.Screen name="profile"  options={{ title: 'Profil',   tabBarIcon: ({ focused }) => <Icon symbol="◯" focused={focused} /> }} />
    </Tabs>
  )
}
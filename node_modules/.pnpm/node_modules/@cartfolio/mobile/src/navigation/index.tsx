import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import HomeScreen from "../screens/HomeScreen";
import OrderDetailScreen from "../screens/OrderDetailScreen";
import AddOrderScreen from "../screens/AddOrderScreen";
import SettingsScreen from "../screens/SettingsScreen";

export type RootStackParamList = {
  Tabs: undefined;
  OrderDetail: { orderId: string };
};

export type TabParamList = {
  Home: undefined;
  Add: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const BG = "#0f0f11";
const CARD = "#18181b";
const BORDER = "#27272a";
const ACCENT = "#6366f1";
const MUTED = "#52525b";

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: CARD },
        headerTitleStyle: { color: "#fafafa", fontWeight: "700" },
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: CARD,
          borderTopColor: BORDER,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: ACCENT,
        tabBarInactiveTintColor: MUTED,
        tabBarLabelStyle: { fontSize: 12, fontWeight: "600" },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: "Orders",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bag-outline" size={size} color={color} />
          ),
          headerTitle: "🛒 Cartfolio",
        }}
      />
      <Tab.Screen
        name="Add"
        component={AddOrderScreen}
        options={{
          title: "Add Order",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: CARD },
        headerTitleStyle: { color: "#fafafa", fontWeight: "700" },
        headerTintColor: ACCENT,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: BG },
      }}
    >
      <Stack.Screen
        name="Tabs"
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="OrderDetail"
        component={OrderDetailScreen}
        options={{ title: "Order Detail" }}
      />
    </Stack.Navigator>
  );
}

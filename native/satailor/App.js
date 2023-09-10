import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button } from 'react-native';
import Sidebar from './Sidebar';

export default function App() {
  const [sidebarVisible, setSidebarVisible] = React.useState(false);

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  return (
    <View style={styles.container}>
      <Text>SATailor</Text>
      <Button title="Toggle Sidebar" onPress={toggleSidebar} />
      <Sidebar visible={sidebarVisible} />
      <Text>Open up App.js to start working on your app!</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
    import { StatusBar } from 'expo-status-bar';
    import { StyleSheet, View } from 'react-native';
    import { NavigationContainer } from '@react-navigation/native';
    import NavBar from './components/NavBar';

    const App: React.FC = () => {
      return (
        <NavigationContainer>
          <View style={styles.container}>
            <NavBar />
            <StatusBar style="auto" />
          </View>
        </NavigationContainer>
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

    export default App;
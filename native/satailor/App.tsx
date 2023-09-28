import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { NativeRouter, Route } from 'react-router-native';
import GeneratePage from './pages/GeneratePage';
import ListPage from './pages/ListPage';

const App: React.FC = () => {
  return (
    <NativeRouter>
      <View style={styles.container}>
        <Route exact path="/" component={GeneratePage} />
        <Route path="/list" component={ListPage} />
        <StatusBar style="auto" />
      </View>
    </NativeRouter>
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
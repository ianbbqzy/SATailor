import React from "react";
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Home from './components/Home';
import Navbar from './components/Navbar'; // Import the Navbar component
import { UserProvider } from './context/user';

const Stack = createStackNavigator();

const App = () =>{
    return (
        <UserProvider>
            <NavigationContainer>
                <Stack.Navigator>
                    <Stack.Screen name="Home" component={Home} options={{ headerTitle: props => <Navbar {...props} /> }} />
                </Stack.Navigator>
            </NavigationContainer>
        </UserProvider>
    )
}

export default App;
import React, { useContext } from 'react';
import { View, Button, Text, Dimensions, Platform } from 'react-native';
import { UserContext } from '../context/user';
import { auth, googleProvider } from '../services/auth';
import { useNavigate } from 'react-router-dom';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Home from './Home';
import SavedSentences from './SavedSentences';

const Drawer = createDrawerNavigator();

const Navbar = () => {
    const user = useContext(UserContext);
    const navigate = useNavigate();
    const deviceWidth = Dimensions.get('window').width;

    const signInWithGoogle = () => {
        auth.signInWithPopup(googleProvider).catch((error: Error) => {
            console.error(error);
            alert('Failed to sign in. Please try again.');
        });
    };

    const signOut = () => {
        auth.signOut().catch((error: Error) => {
            console.error(error);
            alert('Failed to sign out. Please try again.');
        });
    };

    const goTo = (path: string) => {
        if (user) {
            navigate(path);
        } else {
            signInWithGoogle();
        }
    };

    if (Platform.OS === 'web') {
        return (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 10, backgroundColor: 'lightseagreen' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ marginRight: 20 }}>SATailor</Text>
                    <Button title="Generate" onPress={() => goTo('/')} />
                    <Button title="List" onPress={() => goTo('/saved')} />
                </View>
                {user ? (
                    <View>
                        <Text>{user.email}</Text>
                        <Button title="Sign Out" onPress={signOut} />
                    </View>
                ) : (
                    <Button title="Sign In with Google" onPress={signInWithGoogle} />
                )}
            </View>
        )
    } else {
        return (
            <Drawer.Navigator initialRouteName="Home">
                <Drawer.Screen name="Generate" component={Home} />
                <Drawer.Screen name="List" component={SavedSentences} />
            </Drawer.Navigator>
        )
    }
}

export default Navbar;
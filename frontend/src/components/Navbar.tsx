import React, { useContext } from 'react';
import { View, Text, Button } from 'react-native';
import { UserContext } from '../context/user';
import { auth, googleProvider } from '../services/auth';

const Navbar = () => {
    // ... existing code ...

    return (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: '10px', backgroundColor: 'lightseagreen' }}>
            <Text>SATailor</Text>
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
}

export default Navbar;
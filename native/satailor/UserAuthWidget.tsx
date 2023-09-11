import React from 'react';
import { Button, View } from 'react-native';
import { auth, googleProvider } from './services/auth';

export default function UserAuthWidget() {
    const [user, setUser] = React.useState(null);

    React.useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            setUser(user);
        });
        return () => unsubscribe();
    }, []);

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
    return (
        <View>
            {user ? (
                <Button title="Sign Out" onPress={signOut} />
            ) : (
                <Button title="Sign In with Google" onPress={signInWithGoogle} />
            )}
        </View>
    );
}
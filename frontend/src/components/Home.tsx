import React, { useContext } from 'react';
import { auth, googleProvider } from '../services/auth';
import { UserContext } from '../context/user';
import VocabFormComponent from './VocabForm';

const Home = () => {
    const user = useContext(UserContext);

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
        <div>
            <VocabFormComponent/>
        </div>
    )
}

export default Home;
import React, { useContext } from 'react';
import { auth, googleProvider } from '../services/auth';
import { UserContext } from '../context/user';
import FormComponent from './Form';
import VocabFormComponent from './VocabForm';

const Home = () => {
    const user = useContext(UserContext);

    const signInWithGoogle = () => {
        auth.signInWithPopup(googleProvider).catch((error) => {
            console.error(error);
            alert('Failed to sign in. Please try again.');
        });
    };

    const signOut = () => {
        auth.signOut().catch((error) => {
            console.error(error);
            alert('Failed to sign out. Please try again.');
        });
    };

    return (
        <div>
            <h1>Welcome to Home Page</h1>
            {user ? (
                <div>
                    <p>Signed in as {user.email}</p>
                    <button onClick={signOut}>Sign Out</button>
                </div>
            ) : (
                <button onClick={signInWithGoogle}>Sign In with Google</button>
            )}
            <VocabFormComponent/>
        </div>
    )
}

export default Home;
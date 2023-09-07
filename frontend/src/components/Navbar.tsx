import React, { useContext } from 'react';
import { UserContext } from '../context/user';
import { auth, googleProvider } from '../services/auth';

const Navbar = () => {
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
        <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', backgroundColor: 'lightseagreen' }}>
            <h1>SATailor</h1>
            {user ? (
                <div>
                    <p>{user.email}</p>
                    <button style={{ borderRadius: '5px' }} onClick={signOut}>Sign Out</button>
                </div>
            ) : (
                <button style={{ borderRadius: '5px' }} onClick={signInWithGoogle}>Sign In with Google</button>
            )}
        </nav>
    )
}

export default Navbar;
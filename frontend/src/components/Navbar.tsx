import React, { useContext } from 'react';
import { UserContext } from '../context/user';
import { auth, googleProvider } from '../services/auth';
import { useNavigate } from 'react-router-dom'; // Import the useNavigate hook

const Navbar = () => {
    const user = useContext(UserContext);
    const navigate = useNavigate(); // Instantiate the useNavigate hook

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

    return (
        <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', backgroundColor: 'lightseagreen' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <h1 style={{ marginRight: '20px' }}>SATailor</h1>
                <button style={{ borderRadius: '5px', marginRight: '10px' }} onClick={() => goTo('/')}>Generate</button>
                <button style={{ borderRadius: '5px', marginRight: '10px' }} onClick={() => goTo('/saved')}>List</button>
            </div>
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
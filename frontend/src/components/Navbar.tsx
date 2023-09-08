import React, { useContext } from 'react';
import { UserContext } from '../context/user';
import { auth, googleProvider } from '../services/auth';
import { useHistory } from 'react-router-dom'; // Import the useHistory hook

const Navbar = () => {
    const user = useContext(UserContext);
    const history = useHistory(); // Instantiate the useHistory hook

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

    const navigate = (path: string) => {
        if (user) {
            history.push(path);
        } else {
            signInWithGoogle();
        }
    };

    return (
        <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', backgroundColor: 'lightseagreen' }}>
            <h1>SATailor</h1>
            <div>
                <button style={{ borderRadius: '5px', marginRight: '10px' }} onClick={() => navigate('/')}>Generate</button>
                <button style={{ borderRadius: '5px', marginRight: '10px' }} onClick={() => navigate('/saved')}>List</button>
                {user ? (
                    <div>
                        <p>{user.email}</p>
                        <button style={{ borderRadius: '5px' }} onClick={signOut}>Sign Out</button>
                    </div>
                ) : (
                    <button style={{ borderRadius: '5px' }} onClick={signInWithGoogle}>Sign In with Google</button>
                )}
            </div>
        </nav>
    )
}

export default Navbar;
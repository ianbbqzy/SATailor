import React, { useContext } from 'react';
import { UserContext } from '../context/user';
import { auth, googleProvider } from '../services/auth';
import { useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, IconButton } from '@material-ui/core';

const Navbar = () => {
    const { user } = useContext(UserContext);
    const navigate = useNavigate();

    const signOut = () => {
        auth.signOut().catch((error: Error) => {
            console.error(error);
            alert('Failed to sign out. Please try again.');
        });
    };

    const goTo = (path: string) => {
        if (user) {
            navigate(path);
        }
    };

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" style={{ marginRight: '2rem' }}>
                    Seerlight
                </Typography>
                <div style={{ flexGrow: 1 }}>
                    <Button color="inherit" onClick={() => goTo('/')}>Feedback</Button>
                    <Button color="inherit" onClick={() => goTo('/vocab')}>Generate</Button>
                    <Button color="inherit" onClick={() => goTo('/saved')}>List</Button>
                    <Button color="inherit" onClick={() => goTo('/profile')}>Profile</Button>
                </div>
                <div>
                    {user && (
                        <div>
                            <Typography variant="body1">{user.email}</Typography>
                            <Button color="inherit" onClick={signOut} variant="outlined">Sign Out</Button>
                        </div>
                    )}
                </div>
            </Toolbar>
        </AppBar>
    )
}

export default Navbar;

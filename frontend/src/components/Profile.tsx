import React, { useState, useEffect, useContext } from 'react';
import { auth } from '../services/auth';
import { UserContext } from '../context/user';
import { TextField, Button } from '@material-ui/core';

const Profile = () => {
    const [resume, setResume] = useState<string>('');
    const user = useContext(UserContext);

    const handleSave = async () => {
        try {
            const token = await auth.currentUser?.getIdToken(true);
            const response = await fetch(`${process.env.BACKEND_URL}/resume`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    userId: user?.uid,
                    resume: resume
                })
            });
            if (!response.ok) {
                throw Error(`HTTP error! status: ${response.status}`);
            }
        } catch (error: any) {
            alert(`An error occurred: ${error.message}`);
        }
    };

    const fetchResume = async () => {
        try {
            const token = await auth.currentUser?.getIdToken(true);
            const response = await fetch(`${process.env.BACKEND_URL}/resume`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setResume(data.resume);
        } catch (error: any) {
            alert(`An error occurred: ${error.message}`);
        }
    };

    useEffect(() => {
        if (user) {
            fetchResume();
        }
    }, [user]);

    return (
        <div>
            <TextField
                multiline
                minRows={10}
                variant="outlined"
                fullWidth
                value={resume}
                onChange={(e) => setResume(e.target.value)}
            />
            <Button variant="contained" color="primary" onClick={handleSave} style={{ marginTop: '10px' }}>
                Save
            </Button>
        </div>
    )
}

export default Profile;
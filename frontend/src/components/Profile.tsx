import React, { useContext, useState, useEffect } from 'react';
import { UserContext } from '../context/user';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { navigate } from '@reach/router';

const Profile = () => {
    const user = useContext(UserContext);
    const [resumeText, setResumeText] = useState('');

    useEffect(() => {
        if (!user) {
            alert('You must be signed in to view this page');
            navigate('/signin');
        } else {
            // Fetch the user's saved text from the backend and set it in the state
        }
    }, [user]);

    const saveResumeText = () => {
        if (user) {
            // Call the backend API to save the resume text
        } else {
            alert('You must be signed in to save your resume');
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h4">Resume</Typography>
            <TextField
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                style={{ width: '60%' }}
                multiline
                rows={10}
            />
            <Button variant="contained" onClick={saveResumeText}>Save</Button>
            {/* Add future fields here */}
        </div>
    );
};

export default Profile;
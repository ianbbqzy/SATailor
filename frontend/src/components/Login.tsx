import React, { useState, ChangeEvent, useEffect } from 'react';
import { Button, TextField, Typography, Box } from "@material-ui/core";
import { Link, useNavigate } from "react-router-dom";
import { auth, googleProvider } from '../services/auth';

export default function Login() {

    const navigate = useNavigate();

  const signInWithGoogle = () => {
    auth.signInWithPopup(googleProvider)
      .then(() => {
        navigate('/');
      })
      .catch((error: Error) => {
        console.error(error);
        alert('Failed to sign in. Please try again.');
      });
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={12} px={4}>
      <Box maxWidth="md" width="100%" textAlign="center">
        <Typography variant="h3">
            Seerlight
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
            Your co-pilot for college applications
        </Typography>
        <Button variant="contained" color="primary" onClick={signInWithGoogle}>
            Sign In with Google
        </Button>
      </Box>
    </Box>
  );
}
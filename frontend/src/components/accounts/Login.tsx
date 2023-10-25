import React, { useState, ChangeEvent, useEffect } from 'react';
import { Button, TextField, Typography, Box } from "@material-ui/core";
import { Link } from "react-router-dom";

export default function Login() {
  return (
    <Box display="flex" alignItems="center" justifyContent="center" py={12} px={4}>
      <Box maxWidth="md" width="100%">
        <Typography variant="h3" align="center">
            Login to your account
        </Typography>
        <form>
          <Box my={2}>
            <TextField
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                fullWidth
                variant="outlined"
                placeholder="Email address"
            />
          </Box>
          <Box my={2}>
            <TextField
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                fullWidth
                variant="outlined"
                placeholder="Password"
            />
          </Box>
          <Box my={2}>
            <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
            >
                Login
            </Button>
          </Box>
          <Box my={2}>
            <Typography variant="body2" align="center">
              Don't have an account? 
              <Link to="/register">
                Register
              </Link>
            </Typography>
          </Box>
        </form>
      </Box>
    </Box>
  );
}

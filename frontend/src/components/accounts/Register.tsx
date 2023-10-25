
import { Link } from "react-router-dom";
import { Button, TextField, Typography, Box } from "@material-ui/core";
import React, { useState, ChangeEvent, useEffect } from 'react';
import { useAuth } from "../../context/user";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const { user, login, register } = useAuth();
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  async function handleFormSubmit(e: ChangeEvent<HTMLFormElement>) {
    e.preventDefault();

    // Here We will get form values and
    // invoke a function that will register the user
  }

  return (
    <Box display="flex" alignItems="center" justifyContent="center" py={12} px={4}>
      <Box maxWidth="md" width="100%">
        <Typography variant="h3" align="center">
            Register your account
        </Typography>
        <form onSubmit={handleFormSubmit}>
          <Box my={2}>
            <TextField
                id="email-address"
                onChange={(e) => setEmail(e.target.value)}
                name="email"
                type="email"
                autoComplete="email"
                required
                fullWidth
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
                placeholder="Password"
                onChange={(e) => setPassword(e.target.value)}
            />
          </Box>
          <Box my={2}>
            <TextField
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="current-password"
                required
                fullWidth
                placeholder="Confirm Password"
                onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </Box>
          <Box my={2}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
            >
              Register
            </Button>
          </Box>
          <Box display="flex" alignItems="center" justifyContent="between">
            <Typography variant="body2">
              <Link to="/login">
                Already have an account? Login
              </Link>
            </Typography>
          </Box>
        </form>
      </Box>
    </Box>
  );
}

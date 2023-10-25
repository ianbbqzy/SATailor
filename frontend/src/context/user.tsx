import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { UserCredential, User } from 'firebase/auth';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/auth';

interface UserContextProps {
  user: User | null;
  login: (email: string, password: string) => Promise<UserCredential>;
  register: (email: string, password: string) => Promise<UserCredential>;
}

export const UserContext = createContext<UserContextProps>({} as UserContextProps);

export function useAuth() {
  return useContext(UserContext);
}

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user as User);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  function register(email: string, password: string) {
    // If the new account was created, the user is signed in automatically.
    return createUserWithEmailAndPassword(auth, email, password);
  }
  
  function login(email: string, password: string) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  const value = {
    user,
    login,
    register,
  };
  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
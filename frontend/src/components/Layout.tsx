import React, { useContext } from 'react';
import { UserContext } from '../context/user';
import { Outlet } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import Navbar from './Navbar';
import { CircularProgress } from '@material-ui/core';

const Layout = () => {
  const { user, loading } = useContext(UserContext);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div>
      <Navbar />
      <Outlet />
    </div>
  );
};

export default Layout;
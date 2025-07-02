// src/components/navbar.js
import React from 'react';
import { useLocation } from 'react-router-dom';
import '../css/navbar.css';

const Navbar = () => {
  const location = useLocation();

  // Hide on /dashboard route
  if (location.pathname === '/dashboard') {
    return null;
  }

  return (
    <header className="navbar">
      <h1 className="navbar-heading">Data Visualizer</h1>
    </header>
  );
};

export default Navbar;

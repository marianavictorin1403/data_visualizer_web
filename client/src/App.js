// src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './components/login';
import SignUp from './components/signup';
import ForgotPassword from './components/forgotpassword';
import Navbar from './components/navbar';
import CSVVisualizer from './components/datavisualizer';
import indiaMap from './images/World Map.png';
import './css/login.css';

function AppWrapper() {
  const location = useLocation();
  const [view, setView] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [response, setResponse] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);

  return (
    <>
      {/* Show background only if not on /dashboard */}
      {location.pathname !== '/dashboard' && (
        <img src={indiaMap} alt='India Map Dotted' className='background-image' />
      )}

      {/* Show top-right "Log In >" button only on SignUp view */}
      {view === 'signup' && (
        <div className="top-right-login">
          <button className="login-switch-button" onClick={() => setView('login')}>
            Log In &gt;
          </button>
        </div>
      )}

      <Navbar />

      <div className="container">
        <Routes>
          <Route
            path="/"
            element={
              loggedIn ? (
                <Navigate to="/dashboard" />
              ) : view === 'signup' ? (
                <SignUp
                  setView={setView}
                  setResponse={setResponse}
                  email={email}
                  setEmail={setEmail}
                  password={password}
                  setPassword={setPassword}
                  name={name}
                  setName={setName}
                />
              ) : view === 'forgot' ? (
                <ForgotPassword
                  setView={setView}
                  setResponse={setResponse}
                  email={email}
                  setEmail={setEmail}
                />
              ) : (
                <Login
                  setView={setView}
                  setResponse={setResponse}
                  email={email}
                  setEmail={setEmail}
                  password={password}
                  setPassword={setPassword}
                  setLoggedIn={setLoggedIn}
                />
              )
            }
          />
          <Route path="/dashboard" element={<CSVVisualizer />} />
          
        </Routes>
      </div>
      <p>{response}</p>
    </>
  );
}

// Wrap AppWrapper in Router to use useLocation
function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}

export default App;

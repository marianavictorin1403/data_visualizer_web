import React from 'react';
import {signInWithEmailAndPassword} from 'firebase/auth';
import {auth} from '../firebase';
import '../css/login.css';

const Login = ({
  setView,
  setResponse,
  email,
  setEmail,
  password,
  setPassword,
  setLoggedIn
}) => {
  const login = async e => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      await userCredential.user.getIdToken();
      setLoggedIn(true);
      // const res = await fetch('http://localhost:5050/protected', {
      //   headers: {
      //     Authorization: `Bearer ${token}`,
      //     'Content-Type': 'application/json',
      //   },
      // });
      // const data = await res.json();
      // setResponse(data.message);
    } catch (error) {
      setResponse(`Error: ${error.message}`);
    }
  };

  return (
    <div className='login-form-container'>
      <h2
        style={{
          alignSelf: 'flex-start',
          marginTop: '-10px',
          fontWeight: 'normal',
          fontSize: '35px',
        }}
      >
        Sign In
      </h2>
      <div className="top-right-login">
  <button className="login-switch-button" onClick={() => setView('signup')}>
    Sign Up
  </button>
</div>
      <form className='form' onSubmit={login}>
        <div className='form-group'>
          <label className='label'>Email address*</label>
          <div className='input-line'>
            <span className='input-icon'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                height='20'
                width='20'
                viewBox='0 0 24 24'
                fill='none'
                stroke='black'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <path d='M4 4h16v16H4z' fill='none' />
                <polyline points='22,6 12,13 2,6' />
              </svg>
            </span>

            <input
              type='email'
              className='input-field'
              placeholder='Enter your email'
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className='form-group'>
          <label className='label1'>Password*</label>
          <div className='input-line'>
            <span className='input-icon'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                height='20'
                width='20'
                viewBox='0 0 24 24'
                fill='none'
                stroke='black'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <rect x='3' y='11' width='18' height='11' rx='2' ry='2' />
                <path d='M7 11V7a5 5 0 0 1 10 0v4' />
              </svg>
            </span>
            <input
              type='password'
              className='input-field'
              placeholder='Enter password'
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <button
          type='submit'
          className='submit-button'
          style={{marginTop: '30px'}}
        >
          Sign In <span className='arrow'>&gt;</span>
        </button>
      </form>

      <div className='form-links'>
        <span className='text-muted' onClick={() => setView('forgot')}>
          Forgot Password
        </span>
        <div style={{margin: '12px 0'}}></div>
        <span className='text-muted'>New to Data Visualizer? </span>
        <span
          style={{textDecoration: 'underline'}}
          className='link'
          onClick={() => setView('signup')}
        >
          Sign up
        </span>
      </div>
    </div>
  );
};

export default Login;

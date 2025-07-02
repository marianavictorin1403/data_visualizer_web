import React from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import '../css/login.css';

const SignUp = ({ setView, setResponse, email, setEmail, password, setPassword, name, setName }) => {
  const signup = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setResponse('User registered successfully!');
      setView('login');
    } catch (error) {
      setResponse(`Error: ${error.message}`);
    }
  };

  return (
  
    <div className="form-container">
      <h2 style={{ alignSelf: 'flex-start', marginTop: '-10px', fontWeight: 'normal', fontSize: '35px' }}>
        Sign Up
      </h2>
      <form className="form" onSubmit={signup}>
        <div className="form-group">
          <label className="label">Name</label>
         <div className='input-line'>

       <input
            type="text"
            className="input-field"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          </div>
        </div>

        <div className="form-group">
          <label className="label1">Email address*</label>
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

        <div className="form-group">
          <label className="label1">Password*</label>
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
              placeholder=' Create a password'
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <button type="submit" className="submit-button" style={{marginTop: '30px'}}>
          Sign up
        </button>
      </form>

      <div className="form-links">
        <span className="text-muted">Already have an account? </span>
        <span
          className="link"
          style={{ textDecoration: 'underline' }}
          onClick={() => setView('login')}
        >
          Login
        </span>
        <br></br>
      </div>
    </div>
  );
};

export default SignUp;

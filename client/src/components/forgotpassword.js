import React from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import '../css/login.css';

const ForgotPassword = ({ setView, setResponse, email, setEmail }) => {
  const handlePasswordReset = async e => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, email);
      setResponse('Password reset email sent successfully.');
    } catch (error) {
      setResponse(`Error: ${error.message}`);
    }
  };

  return (
    <div className='forgot-password-form-container'>
      <h2
        style={{
          alignSelf: 'flex-start',
          marginTop: '-10px',
          fontWeight: 'normal',
          fontSize: '30px',
        }}
      >
        Forgot Password
      </h2>
      <div className='top-right-login'>
        <button
          className='login-switch-button'
          onClick={() => setView('signup')}
        >
          Sign Up
        </button>
      </div>
      <form className='form' onSubmit={handlePasswordReset}>
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
        <button
          type='submit'
          className='submit-button'
          style={{ marginTop: '30px' }}
        >
          Send an email
        </button>
      </form>

      <div className='form-links'>
        {/* <span className='text-muted'>Already have an account? </span>
        <span className='link' style={{ textDecoration: 'underline' }} onClick={() => setView('login')}>
          Login
        </span> */}
        <span className='text-muted'>New to Data Visualizer? </span>
        <span
          style={{ textDecoration: 'underline' }}
          className='link'
          onClick={() => setView('signup')}
        >
          Sign up
        </span>
      </div>
    </div>
  );
};

export default ForgotPassword;

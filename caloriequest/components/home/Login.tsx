// use client for develoometnt 
"use client";

import React from 'react';
import { FaGoogle } from 'react-icons/fa';
import useAuthStatus from '@/hooks/useAuthStatus'; 
import styles from './Login.module.css'; 

// backend api link
const API_BASE_URL = 'http://localhost:8000';

const AuthDisplay = () => {
  const { user, isLoading, error } = useAuthStatus();

  const handleOAuthLogin = () => {
    // links to api google login
    window.location.href = `${API_BASE_URL}/auth/login`;
  };

  const handleLogout = () => {
    // link to api logout
    window.location.href = `${API_BASE_URL}/auth/logout`;
  };

// loading animation
  if (isLoading) {
    return (
      <div className={styles.authContainer}>
        <p>Checking login status...</p>
      </div>
    );
  }

  // error information
  if (error) {
    console.error("Authentication status error:", error);
    return (
      <div className={styles.authContainer}>
        <p className={styles.errorMessage}>Error: Could not verify login status.</p>
        <button onClick={handleOAuthLogin} className={styles.loginButton}>
          <FaGoogle />
          <span>Continue with Google</span>
        </button>
      </div>
    );
  }

  // if logged in
  if (user) {
    return (
      <div className={styles.authContainer}>
        <span className={styles.greeting}>Hello, {user.name}!</span>
        <button onClick={handleLogout} className={styles.logoutButton}>
          Logout
        </button>
      </div>
    );
  }

  // If not loggedi n show the login button
  return (
    <div className={styles.authContainer}>
      <button onClick={handleOAuthLogin} className={styles.loginButton}>
        <FaGoogle />
        <span>Continue with Google</span>
      </button>
    </div>
  );
};

export default AuthDisplay;
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navigation = ({ isAuthenticated, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (onLogout) onLogout();
    navigate('/login');
  };

  return (
    <nav style={{
      backgroundColor: '#2563eb',
      color: 'white',
      padding: '1rem 2rem',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Link to="/" style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: 'white',
          textDecoration: 'none'
        }}>
          TestRunner Pro
        </Link>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" style={{
                color: 'white',
                textDecoration: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                transition: 'background-color 0.2s'
              }}>
                Dashboard
              </Link>
              <Link to="/profile" style={{
                color: 'white',
                textDecoration: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem'
              }}>
                Profile
              </Link>
              <button
                onClick={handleLogout}
                style={{
                  color: 'white',
                  background: 'none',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={{
                color: 'white',
                textDecoration: 'none',
                padding: '0.5rem 1rem'
              }}>
                Login
              </Link>
              <Link to="/register" style={{
                color: 'white',
                textDecoration: 'none',
                padding: '0.5rem 1rem'
              }}>
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
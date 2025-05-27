import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Navigation() {
  const { currentUser, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!currentUser) {
    return null;
  }

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/dashboard" className="nav-brand">
          <img 
            src="https://getglobalroofing.com/wp-content/uploads/2025/05/Logo512.png" 
            alt="Global Roofing" 
            className="nav-logo"
          />
        </Link>
        
        <div className="nav-menu">
          <Link to="/dashboard" className="nav-link">
            Dashboard
          </Link>
          
          <Link to="/create-proposal" className="nav-link">
            Create Proposal
          </Link>
          
          {isAdmin() && (
            <Link to="/admin" className="nav-link">
              Admin
            </Link>
          )}
          
          <div className="nav-user">
            <span className="user-name">{currentUser.fullName}</span>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navigation; 
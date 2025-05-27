import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Login function
  const login = async (email, password) => {
    try {
      // Query users collection for matching email and password
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error('User not found');
      }
      
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      
      if (userData.password !== password) {
        throw new Error('Invalid password');
      }
      
      const user = {
        id: userDoc.id,
        email: userData.email,
        fullName: userData.fullName,
        role: userData.role
      };
      
      setCurrentUser(user);
      localStorage.setItem('loggedInUser', JSON.stringify(user));
      
      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Request password reset
  const requestPasswordReset = async (email) => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error('User not found');
      }

      // Generate a unique reset token
      const resetToken = Math.random().toString(36).substring(2, 15) + 
                        Math.random().toString(36).substring(2, 15);
      
      // Store the reset token with an expiration time (24 hours from now)
      const resetRequestsRef = collection(db, 'passwordResetRequests');
      await addDoc(resetRequestsRef, {
        email,
        token: resetToken,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        used: false
      });

      // In a real application, you would send an email with the reset link
      // For now, we'll just return the token for testing
      return resetToken;
    } catch (error) {
      console.error('Password reset request error:', error);
      throw error;
    }
  };

  // Verify reset token and update password
  const resetPassword = async (token, newPassword) => {
    try {
      const resetRequestsRef = collection(db, 'passwordResetRequests');
      const q = query(
        resetRequestsRef,
        where('token', '==', token),
        where('used', '==', false)
      );
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error('Invalid or expired reset token');
      }

      const resetRequest = querySnapshot.docs[0];
      const resetData = resetRequest.data();

      // Check if the token has expired
      if (new Date() > resetData.expiresAt.toDate()) {
        throw new Error('Reset token has expired');
      }

      // Find the user
      const usersRef = collection(db, 'users');
      const userQuery = query(usersRef, where('email', '==', resetData.email));
      const userSnapshot = await getDocs(userQuery);
      
      if (userSnapshot.empty) {
        throw new Error('User not found');
      }

      const userDoc = userSnapshot.docs[0];

      // Update the password
      await updateDoc(doc(db, 'users', userDoc.id), {
        password: newPassword
      });

      // Mark the reset token as used
      await updateDoc(doc(db, 'passwordResetRequests', resetRequest.id), {
        used: true
      });

      return true;
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('loggedInUser');
  };

  // Check if user is admin
  const isAdmin = () => {
    return currentUser && currentUser.role === 'admin';
  };

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('loggedInUser');
      }
    }
    setLoading(false);
  }, []);

  const value = {
    currentUser,
    login,
    logout,
    isAdmin,
    loading,
    requestPasswordReset,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 
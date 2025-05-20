import React, { createContext, useState, useContext, useEffect } from 'react';

// Create context
const UserContext = createContext();

export const UserProvider = ({ children }) => {
  // Initial user state - you would typically load this from your API/localStorage
  const [user, setUser] = useState({
    name: 'John Doe',
    role: 'Administrator',
    avatar: null, 
  });

  // Load user data from localStorage on component mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Failed to parse user data from localStorage', error);
      }
    }
  }, []);

  // Save user data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('user', JSON.stringify(user));
  }, [user]);

  // Function to update user avatar
  const updateAvatar = (newAvatar) => {
    setUser(prevUser => ({
      ...prevUser,
      avatar: newAvatar
    }));
  };

  // Function to update any user property
  const updateUser = (updates) => {
    setUser(prevUser => ({
      ...prevUser,
      ...updates
    }));
  };

  return (
    <UserContext.Provider value={{ user, updateAvatar, updateUser }}>
      {children}
    </UserContext.Provider>
  );
};


export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export default UserContext;
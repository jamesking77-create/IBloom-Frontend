import React, { createContext, useContext } from 'react';
import useGlobalNotifications from '../utils/hooks/useGlobalNotification';

const GlobalNotificationContext = createContext();

export const useGlobalNotificationContext = () => {
  const context = useContext(GlobalNotificationContext);
  if (!context) {
    throw new Error('useGlobalNotificationContext must be used within GlobalNotificationProvider');
  }
  return context;
};

export const GlobalNotificationProvider = ({ children, enabled = true }) => {
  const notificationState = useGlobalNotifications({
    enabled,
    onConnected: () => console.log('Global notifications connected'),
    onDisconnected: () => console.log('Global notifications disconnected'),
    onError: (error) => console.error('Global notifications error:', error)
  });

  return (
    <GlobalNotificationContext.Provider value={notificationState}>
      {children}
    </GlobalNotificationContext.Provider>
  );
};
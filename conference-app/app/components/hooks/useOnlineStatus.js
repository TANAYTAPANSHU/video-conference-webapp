"use client"

// components/hooks/useOnlineStatus.js

import { useState, useEffect } from 'react';

const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnlineStatusChange = () => {
      setIsOnline(window.navigator.onLine);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnlineStatusChange);
      window.addEventListener('offline', handleOnlineStatusChange);

      return () => {
        window.removeEventListener('online', handleOnlineStatusChange);
        window.removeEventListener('offline', handleOnlineStatusChange);
      };
    }
  }, []);

  return isOnline;
};

export default useOnlineStatus;


import { useState, useCallback } from 'react';

export const useAnnouncement = () => {
  const [announcement, setAnnouncement] = useState('');

  const announce = useCallback((message: string) => {
    setAnnouncement(message);
    // Clear after announcement to allow for repeated announcements
    setTimeout(() => setAnnouncement(''), 100);
  }, []);

  return { announcement, announce };
};
import { useState, useEffect } from 'react';

interface Location {
  latitude: number;
  longitude: number;
}

export function useGeolocation() {
  const [location, setLocation] = useState<Location | null>(null);
  const [language, setLanguage] = useState<string>('en');
  const [error, setError] = useState<string | null>(null);

  // Get browser language on mount
  useEffect(() => {
    const userLang = navigator.language || (navigator.languages && navigator.languages[0]) || 'en';
    setLanguage(userLang);

    // Store in localStorage
    localStorage.setItem('language', userLang);
  }, []);

  // Function to ask for location (call on button click)
  const askLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setLocation(loc);
        setError(null);

        // Store in localStorage
        localStorage.setItem('location', JSON.stringify(loc));
      },
      () => {
        setError('Permission denied or unavailable');
      }
    );
  };

  return { location, language, error, askLocation };
}

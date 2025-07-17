import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function OAuthSuccessPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('userId');
    if (userId) {
      axios.post('http://localhost:8000/api/auth/google/finalize',
        { userId },
        { withCredentials: true }
      )
      .then(() => {
        navigate('/'); // redirect to homepage
      })
      .catch(err => {
        console.error(err);
        navigate('/signin');
      });
    }
  }, []);

  return <p>Signing in...</p>;
}

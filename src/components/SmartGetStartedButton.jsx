import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { getCurrentUser } from '../services/authAPI';
import { setCurrentUser, clearAuth } from '../redux/slices/authSlice';

const SmartGetStartedButton = ({ className, children }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isChecking, setIsChecking] = useState(false);

  const handleGetStarted = async () => {
    setIsChecking(true);

    try {
      // Check if user has valid session/cookies
      const { data: user } = await getCurrentUser();
      
      if (user) {
        // User is authenticated, go to feed
        dispatch(setCurrentUser(user));
        navigate('/feed');
      } else {
        // No valid session, go to register
        navigate('/register');
      }
    } catch (error) {
      console.log('No existing session, redirecting to register');
      // No valid session/cookies, clear any stale state and go to register
      dispatch(clearAuth());
      navigate('/register');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <button
      onClick={handleGetStarted}
      disabled={isChecking}
      className={`${className} ${isChecking ? 'opacity-70 cursor-not-allowed' : ''}`}
    >
      {isChecking ? 'Checking...' : children}
    </button>
  );
};

export default SmartGetStartedButton;
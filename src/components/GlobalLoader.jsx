import React from 'react';
import { useSelector } from 'react-redux';
import '../index.css'

const GlobalLoader = () => {
  const isLoading = useSelector(state => state.auth.isLoading);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12"></div>
    </div>
  );
};

export default GlobalLoader;

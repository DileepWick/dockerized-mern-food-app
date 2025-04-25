// LoadingState.jsx
import { Loader2 } from 'lucide-react';

const LoadingState = () => {
  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-gray-50'>
      <Loader2 className='h-12 w-12 animate-spin text-primary' />
      <p className='mt-4 text-lg font-medium text-gray-700'>
        Loading your restaurant dashboard...
      </p>
    </div>
  );
};

export default LoadingState;

// components/state/ErrorState.jsx
import { AlertCircle } from 'lucide-react';

const ErrorState = ({ error, description, redirectTo, buttonText }) => {
  return (
    <div className='min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4'>
      <div className='bg-red-100 p-4 rounded-full mb-4'>
        <AlertCircle className='h-8 w-8 text-red-600' />
      </div>

      <h2 className='text-xl font-medium text-gray-800 mb-2'>
        {error || 'Something went wrong'}
      </h2>
      <p className='text-gray-600 text-center max-w-md mb-6'>
        {description ||
          'We encountered an error while processing your request. Please try again later.'}
      </p>

      {redirectTo && (
        <a
          href={redirectTo}
          className='bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors'
        >
          {buttonText || 'Go Back'}
        </a>
      )}
    </div>
  );
};

export default ErrorState;

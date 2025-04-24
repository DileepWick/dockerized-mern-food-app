// ErrorState.jsx
import { RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

const ErrorState = ({
  error,
  description,
  redirectTo = null,
  buttonText = 'Try Again',
  buttonAction = () => window.location.reload(),
}) => {
  const handleButtonClick = () => {
    if (redirectTo) {
      window.location.href = redirectTo;
    } else {
      buttonAction();
    }
  };

  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4'>
      <Card className='w-full max-w-2xl shadow-lg'>
        <CardHeader
          className={redirectTo ? '' : 'bg-red-50 border-b border-red-100'}
        >
          <CardTitle className={redirectTo ? '' : 'text-red-600'}>
            {error}
          </CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent className='pt-6'>
          {!description && <p className='text-center text-red-600'>{error}</p>}
        </CardContent>
        <CardFooter className='flex justify-center'>
          <Button onClick={handleButtonClick}>
            {!redirectTo && <RefreshCcw className='mr-2 h-4 w-4' />}{' '}
            {buttonText}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ErrorState;

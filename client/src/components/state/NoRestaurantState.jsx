// NoRestaurantState.jsx
import { Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const NoRestaurantState = ({ user }) => {
  return (
    <div className='bg-gray-50 min-h-screen'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='flex justify-between items-center mb-8'>
          <h1 className='text-3xl font-bold text-gray-900'>
            Restaurant Dashboard
          </h1>
          <div className='flex items-center gap-3'>
            <Avatar className='h-9 w-9'>
              <AvatarImage src={user?.profilePic} alt={user?.name} />
              <AvatarFallback className='bg-primary text-white'>
                {user?.name?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className='hidden md:block'>
              <p className='text-sm font-medium'>{user?.name || user?.email}</p>
              <Button
                variant='ghost'
                size='sm'
                className='p-0 h-auto text-gray-500 hover:text-gray-700 text-xs'
                onClick={() => (window.location.href = '/logout')}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>

        <Card className='shadow-lg border border-gray-200'>
          <CardHeader className='bg-white border-b border-gray-100'>
            <div className='flex items-center'>
              <Store className='h-8 w-8 text-primary mr-3' />
              <div>
                <CardTitle className='text-2xl'>No Restaurant Found</CardTitle>
                <CardDescription className='text-gray-500'>
                  You don't have a restaurant yet
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className='pt-6 pb-8'>
            <div className='text-center'>
              <p className='text-gray-600 mb-6'>
                Ready to start selling your delicious food? Create your
                restaurant profile to get started.
              </p>
              <Button
                size='lg'
                className='px-8'
                onClick={() => (window.location.href = '/restaurant/create')}
              >
                Create Restaurant
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NoRestaurantState;

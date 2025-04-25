// DashboardHeader.jsx
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const DashboardHeader = ({ restaurant, user }) => {
  return (
    <div className='bg-white border-b border-gray-200 sticky top-0 z-10'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-32'>
          <div className='flex items-center'>
            <h1 className='text-4xl font-bold text-gray-900 uppercase'>
              {restaurant.name}
            </h1>
          </div>
          <div className='flex items-center gap-4'>
            <Button variant='ghost' size='icon' className='relative'>
              <Bell className='h-5 w-5' />
              <span className='absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full'></span>
            </Button>
            <div className='flex items-center gap-3'>
              <Avatar className='h-9 w-9'>
                <AvatarImage src={user?.profilePic} alt={user?.name} />
                <AvatarFallback className='bg-primary text-white'>
                  {user?.name?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className='hidden md:block'>
                <p className='text-sm font-medium'>
                  {user?.name || user?.email}
                </p>
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
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;

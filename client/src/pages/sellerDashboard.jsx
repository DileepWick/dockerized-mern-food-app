import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Loader2, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getLoggedInUser, isAuthorized } from '../util/auth-utils';
import { restaurantService } from '../util/service-gateways';

const SellerDashboard = () => {
  const [user, setUser] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Get logged in user
        const userData = await getLoggedInUser();
        if (!userData) {
          setError('You must be logged in to view this page');
          setLoading(false);
          return;
        }

        if (!isAuthorized(userData, ['seller', 'admin'])) {
          setError('You are not authorized to access this page');
          setLoading(false);
          return;
        }

        setUser(userData);

        // Fetch the user's restaurant using the new endpoint
        try {
          const restaurantResponse = await restaurantService.get(
            `/restaurant/owner/${userData._id}`
          );
          setRestaurant(restaurantResponse.data);
        } catch (restaurantError) {
          console.error('Error fetching restaurant:', restaurantError);
          setError('Failed to load restaurant. Please try again later.');
        }

        setLoading(false);
      } catch (err) {
        console.error('Error loading dashboard:', err);
        setError('Failed to load dashboard. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className='flex flex-col items-center justify-center min-h-screen'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
        <p className='mt-4 text-lg'>Loading your restaurant dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex flex-col items-center justify-center min-h-screen'>
        <Card className='w-full max-w-2xl'>
          <CardHeader className='bg-red-50'>
            <CardTitle className='text-red-600'>Error</CardTitle>
          </CardHeader>
          <CardContent className='pt-6'>
            <p className='text-center text-red-600'>{error}</p>
          </CardContent>
          <CardFooter className='flex justify-center'>
            <Button onClick={() => window.location.reload()}>
              <RefreshCcw className='mr-2 h-4 w-4' /> Try Again
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className='flex flex-col items-center justify-center min-h-screen'>
        <Card className='w-full max-w-2xl'>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              You need to be logged in to access this page
            </CardDescription>
          </CardHeader>
          <CardFooter className='flex justify-center'>
            <Button onClick={() => (window.location.href = '/login')}>
              Go to Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // If no restaurant is found
  if (!restaurant) {
    return (
      <div className='container mx-auto px-4 py-6'>
        <div className='flex flex-col gap-6'>
          <div className='flex justify-between items-center'>
            <h1 className='text-3xl font-bold'>Restaurant Dashboard</h1>
            <div className='flex items-center gap-2'>
              <p className='text-gray-500'>
                Logged in as: {user?.email || 'user@example.com'}
              </p>
              <Button
                variant='outline'
                size='sm'
                onClick={() => (window.location.href = '/logout')}
              >
                Logout
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>No Restaurant Found</CardTitle>
              <CardDescription>
                You don&apos;t have a restaurant yet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Would you like to create a new restaurant?</p>
              <Button
                className='mt-4'
                onClick={() => (window.location.href = '/restaurant/create')}
              >
                Create Restaurant
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto px-4 py-6'>
      <div className='flex flex-col gap-6'>
        <div className='flex justify-between items-center'>
          <h1 className='text-3xl font-bold'>Restaurant Dashboard</h1>
          <div className='flex items-center gap-2'>
            <p className='text-gray-500'>
              Logged in as: {user?.email || 'user@example.com'}
            </p>
            <Button
              variant='outline'
              size='sm'
              onClick={() => (window.location.href = '/logout')}
            >
              Logout
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{restaurant.name}</CardTitle>
            <CardDescription>Restaurant Details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm font-medium text-gray-500'>Status</p>
                  <div className='flex items-center mt-1'>
                    <div
                      className={`w-3 h-3 rounded-full mr-2 ${
                        restaurant.is_active ? 'bg-green-500' : 'bg-red-500'
                      }`}
                    ></div>
                    <p>{restaurant.is_active ? 'Active' : 'Inactive'}</p>
                  </div>
                </div>
                <div>
                  <p className='text-sm font-medium text-gray-500'>
                    Restaurant ID
                  </p>
                  <p className='mt-1 text-sm font-mono'>{restaurant._id}</p>
                </div>
              </div>
              <div>
                <p className='text-sm font-medium text-gray-500'>Description</p>
                <p className='mt-1'>{restaurant.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SellerDashboard;

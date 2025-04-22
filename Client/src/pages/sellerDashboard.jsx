import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Loader2,
  RefreshCcw,
  Store,
  LineChart,
  ShoppingBag,
  Settings,
  Clock,
  ChevronRight,
  Users,
  Bell,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { getLoggedInUser, isAuthorized } from '../util/authUtils';
import { restaurantService } from '../util/axiosInstances';

const SellerDashboard = () => {
  const [user, setUser] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock data for the dashboard
  const mockOrders = [
    {
      id: '1234',
      customer: 'John Smith',
      items: 3,
      total: 42.5,
      status: 'preparing',
      time: '10 mins ago',
    },
    {
      id: '1235',
      customer: 'Amy Lee',
      items: 1,
      total: 15.75,
      status: 'ready',
      time: '15 mins ago',
    },
    {
      id: '1236',
      customer: 'Mark Johnson',
      items: 5,
      total: 76.2,
      status: 'delivered',
      time: '30 mins ago',
    },
  ];

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
      <div className='flex flex-col items-center justify-center min-h-screen bg-gray-50'>
        <Loader2 className='h-12 w-12 animate-spin text-primary' />
        <p className='mt-4 text-lg font-medium text-gray-700'>
          Loading your restaurant dashboard...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4'>
        <Card className='w-full max-w-2xl shadow-lg'>
          <CardHeader className='bg-red-50 border-b border-red-100'>
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
      <div className='flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4'>
        <Card className='w-full max-w-2xl shadow-lg'>
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

          <Card className='shadow-lg border border-gray-200'>
            <CardHeader className='bg-white border-b border-gray-100'>
              <div className='flex items-center'>
                <Store className='h-8 w-8 text-primary mr-3' />
                <div>
                  <CardTitle className='text-2xl'>
                    No Restaurant Found
                  </CardTitle>
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
  }

  return (
    <div className='bg-gray-50 min-h-screen poppins-regular'>
      {/* Top Navigation Bar */}
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

      {/* Main Content */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <Tabs defaultValue='overview' className='w-full'>
          <TabsList className='mb-6'>
            <TabsTrigger value='overview'>Overview</TabsTrigger>
            <TabsTrigger value='orders'>Orders</TabsTrigger>
            <TabsTrigger value='menu'>Menu</TabsTrigger>
            <TabsTrigger value='settings'>Settings</TabsTrigger>
          </TabsList>

          <TabsContent value='overview' className='space-y-6'>
            {/* Stats Row */}

            {/* Restaurant Status */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <Card className='shadow-sm'>
                <CardHeader className='flex flex-row items-center justify-between pb-2'>
                  <div>
                    <CardTitle>Restaurant Status</CardTitle>
                    <CardDescription>
                      Current restaurant visibility to customers
                    </CardDescription>
                  </div>
                  <Badge
                    variant={restaurant.is_active ? 'success' : 'destructive'}
                    className={
                      restaurant.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }
                  >
                    {restaurant.is_active ? 'OPEN' : 'CLOSED'}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className='text-sm text-gray-500 mb-4'>
                    {restaurant.is_active
                      ? 'Your restaurant is currently visible to customers and accepting orders.'
                      : 'Your restaurant is currently hidden from customers and not accepting orders.'}
                  </div>
                  <Button
                    variant={restaurant.is_active ? 'outline' : 'default'}
                  >
                    {restaurant.is_active ? 'Set as Closed' : 'Open Restaurant'}
                  </Button>
                </CardContent>
              </Card>

              <Card className='shadow-sm'>
                <CardHeader className='pb-2'>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Manage your restaurant</CardDescription>
                </CardHeader>
                <CardContent className='grid grid-cols-2 gap-4'>
                  <Button
                    variant='outline'
                    className='flex justify-start gap-2'
                  >
                    <ShoppingBag className='h-4 w-4' />
                    <span>Add Menu Item</span>
                  </Button>
                  <Button
                    variant='outline'
                    className='flex justify-start gap-2'
                  >
                    <Settings className='h-4 w-4' />
                    <span>Restaurant Settings</span>
                  </Button>
                  <Button
                    variant='outline'
                    className='flex justify-start gap-2'
                  >
                    <LineChart className='h-4 w-4' />
                    <span>View Reports</span>
                  </Button>
                  <Button
                    variant='outline'
                    className='flex justify-start gap-2'
                  >
                    <Users className='h-4 w-4' />
                    <span>Manage Staff</span>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Recent Orders */}
            <Card className='shadow-sm'>
              <CardHeader className='pb-2'>
                <div className='flex justify-between items-center'>
                  <div>
                    <CardTitle>Recent Orders</CardTitle>
                    <CardDescription>
                      Orders from the last 24 hours
                    </CardDescription>
                  </div>
                  <Button variant='ghost' size='sm' className='gap-1'>
                    See All <ChevronRight className='h-4 w-4' />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className='space-y-2'>
                  {mockOrders.map((order) => (
                    <div
                      key={order.id}
                      className='flex items-center justify-between p-3 bg-gray-50 rounded-md'
                    >
                      <div className='flex flex-col'>
                        <div className='flex items-center gap-2'>
                          <span className='font-medium'>#{order.id}</span>
                          <span className='text-sm text-gray-500'>
                            {order.customer}
                          </span>
                        </div>
                        <div className='text-sm text-gray-500'>
                          {order.items} items · ${order.total.toFixed(2)}
                        </div>
                      </div>
                      <div className='flex items-center gap-4'>
                        <Badge
                          variant={
                            order.status === 'preparing'
                              ? 'outline'
                              : order.status === 'ready'
                              ? 'secondary'
                              : 'default'
                          }
                          className='capitalize'
                        >
                          {order.status}
                        </Badge>
                        <span className='text-xs text-gray-400'>
                          {order.time}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='orders'>
            <Card className='shadow-sm'>
              <CardHeader>
                <CardTitle>Order Management</CardTitle>
                <CardDescription>
                  View and manage all your orders
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Order management interface would go here</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='menu'>
            <Card className='shadow-sm'>
              <CardHeader>
                <CardTitle>Menu Management</CardTitle>
                <CardDescription>
                  Update your restaurant&apos;s menu items
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Menu management interface would go here</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='settings'>
            <Card className='shadow-sm'>
              <CardHeader>
                <CardTitle>Restaurant Settings</CardTitle>
                <CardDescription>
                  Update your restaurant details, hours, and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div>
                    <h3 className='text-lg font-medium'>Basic Information</h3>
                    <p className='text-sm text-gray-500 mb-4'>
                      Update your restaurant&apos;s basic details
                    </p>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                          Restaurant Name
                        </label>
                        <input
                          type='text'
                          className='w-full border border-gray-300 rounded-md p-2'
                          defaultValue={restaurant.name}
                        />
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                          Restaurant ID
                        </label>
                        <input
                          type='text'
                          className='w-full border border-gray-300 rounded-md p-2 bg-gray-50'
                          defaultValue={restaurant._id}
                          disabled
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Description
                    </label>
                    <textarea
                      className='w-full border border-gray-300 rounded-md p-2 h-24'
                      defaultValue={restaurant.description}
                    />
                  </div>

                  <div className='pt-4'>
                    <Button>Save Changes</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SellerDashboard;

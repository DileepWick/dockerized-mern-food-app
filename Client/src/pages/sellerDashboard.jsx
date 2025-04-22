import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Loader2,
  ChevronUp,
  ChevronDown,
  Edit,
  Save,
  RefreshCcw,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getLoggedInUser, isAuthorized } from '../util/authUtils';
import { authService } from '../util/axiosInstances';

const SellerDashboard = () => {
  const [user, setUser] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: false,
  });
  const [activeTab, setActiveTab] = useState('overview');

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

        if (!isAuthorized(userData, ['restaurant_owner', 'admin'])) {
          setError('You are not authorized to access this page');
          setLoading(false);
          return;
        }

        setUser(userData);

        // Fetch the user's restaurant
        try {
          const restaurantResponse = await authService.get(
            '/api/restaurants/:id'
          );
          setRestaurant(restaurantResponse.data);
          setFormData({
            name: restaurantResponse.data.name,
            description: restaurantResponse.data.description,
            is_active: restaurantResponse.data.is_active,
          });
        } catch (restaurantError) {
          if (restaurantError.response?.status === 404) {
            // User doesn't have a restaurant yet
            setRestaurant(null);
          } else {
            throw restaurantError;
          }
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

  const handleCreateRestaurant = async () => {
    try {
      setLoading(true);
      const response = await authService.post('/api/restaurants', formData);
      setRestaurant(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error creating restaurant:', err);
      setError(err.response?.data?.message || 'Failed to create restaurant');
      setLoading(false);
    }
  };

  const handleUpdateRestaurant = async () => {
    try {
      setLoading(true);
      const response = await authService.put(
        `/api/restaurants/${restaurant._id}`,
        formData
      );
      setRestaurant(response.data);
      setEditing(false);
      setLoading(false);
    } catch (err) {
      console.error('Error updating restaurant:', err);
      setError(err.response?.data?.message || 'Failed to update restaurant');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSwitchChange = (checked) => {
    setFormData({
      ...formData,
      is_active: checked,
    });
  };

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

  return (
    <div className='container mx-auto px-4 py-6'>
      <div className='flex flex-col gap-6'>
        <div className='flex justify-between items-center'>
          <h1 className='text-3xl font-bold'>Restaurant Dashboard</h1>
          <div className='flex items-center gap-2'>
            <p className='text-gray-500'>Logged in as: {user.email}</p>
            <Button
              variant='outline'
              size='sm'
              onClick={() => (window.location.href = '/logout')}
            >
              Logout
            </Button>
          </div>
        </div>

        {!restaurant ? (
          <Card>
            <CardHeader>
              <CardTitle>Create Your Restaurant</CardTitle>
              <CardDescription>
                Get started by setting up your restaurant profile
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='name'>Restaurant Name</Label>
                  <Input
                    id='name'
                    name='name'
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your restaurant's name"
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='description'>Description</Label>
                  <Textarea
                    id='description'
                    name='description'
                    value={formData.description}
                    onChange={handleChange}
                    placeholder='Describe your restaurant'
                    rows={4}
                  />
                </div>
                <div className='flex items-center space-x-2'>
                  <Switch
                    id='is_active'
                    name='is_active'
                    checked={formData.is_active}
                    onCheckedChange={handleSwitchChange}
                  />
                  <Label htmlFor='is_active'>
                    Active (Ready to receive orders)
                  </Label>
                </div>
              </form>
            </CardContent>
            <CardFooter>
              <Button onClick={handleCreateRestaurant} disabled={loading}>
                {loading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                Create Restaurant
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Tabs
            defaultValue='overview'
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <TabsList className='grid w-full max-w-md grid-cols-3'>
              <TabsTrigger value='overview'>Overview</TabsTrigger>
              <TabsTrigger value='menu'>Menu</TabsTrigger>
              <TabsTrigger value='orders'>Orders</TabsTrigger>
            </TabsList>

            <TabsContent value='overview' className='mt-6'>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between'>
                  <div>
                    <CardTitle>{restaurant.name}</CardTitle>
                    <CardDescription>Restaurant Details</CardDescription>
                  </div>
                  {!editing ? (
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => setEditing(true)}
                    >
                      <Edit className='h-4 w-4 mr-2' /> Edit
                    </Button>
                  ) : (
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => {
                        setEditing(false);
                        setFormData({
                          name: restaurant.name,
                          description: restaurant.description,
                          is_active: restaurant.is_active,
                        });
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {editing ? (
                    <form className='space-y-4'>
                      <div className='space-y-2'>
                        <Label htmlFor='edit-name'>Restaurant Name</Label>
                        <Input
                          id='edit-name'
                          name='name'
                          value={formData.name}
                          onChange={handleChange}
                        />
                      </div>
                      <div className='space-y-2'>
                        <Label htmlFor='edit-description'>Description</Label>
                        <Textarea
                          id='edit-description'
                          name='description'
                          value={formData.description}
                          onChange={handleChange}
                          rows={4}
                        />
                      </div>
                      <div className='flex items-center space-x-2'>
                        <Switch
                          id='edit-is_active'
                          name='is_active'
                          checked={formData.is_active}
                          onCheckedChange={handleSwitchChange}
                        />
                        <Label htmlFor='edit-is_active'>
                          Active (Ready to receive orders)
                        </Label>
                      </div>
                    </form>
                  ) : (
                    <div className='space-y-4'>
                      <div className='grid grid-cols-2 gap-4'>
                        <div>
                          <p className='text-sm font-medium text-gray-500'>
                            Status
                          </p>
                          <div className='flex items-center mt-1'>
                            <div
                              className={`w-3 h-3 rounded-full mr-2 ${
                                restaurant.is_active
                                  ? 'bg-green-500'
                                  : 'bg-red-500'
                              }`}
                            ></div>
                            <p>
                              {restaurant.is_active ? 'Active' : 'Inactive'}
                            </p>
                          </div>
                        </div>
                        <div>
                          <p className='text-sm font-medium text-gray-500'>
                            Restaurant ID
                          </p>
                          <p className='mt-1 text-sm font-mono'>
                            {restaurant._id}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className='text-sm font-medium text-gray-500'>
                          Description
                        </p>
                        <p className='mt-1'>{restaurant.description}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
                {editing && (
                  <CardFooter>
                    <Button onClick={handleUpdateRestaurant} disabled={loading}>
                      {loading && (
                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      )}
                      <Save className='h-4 w-4 mr-2' /> Save Changes
                    </Button>
                  </CardFooter>
                )}
              </Card>

              <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mt-6'>
                <Card>
                  <CardHeader>
                    <CardTitle>Orders Today</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className='text-4xl font-bold'>0</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Total Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className='text-4xl font-bold'>$0.00</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Menu Items</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className='text-4xl font-bold'>0</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value='menu' className='mt-6'>
              <Card>
                <CardHeader>
                  <CardTitle>Menu Management</CardTitle>
                  <CardDescription>
                    Add or edit your restaurant's menu items
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='flex justify-between items-center mb-6'>
                    <p>No menu items available yet</p>
                    <Button size='sm'>Add Menu Item</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='orders' className='mt-6'>
              <Card>
                <CardHeader>
                  <CardTitle>Order Management</CardTitle>
                  <CardDescription>
                    View and manage your customer orders
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>No orders available yet</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default SellerDashboard;

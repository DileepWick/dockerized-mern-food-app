// Main Component: SellerDashboard.jsx
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { getLoggedInUser, isAuthorized } from '../util/auth-utils';
import { restaurantService } from '../util/service-gateways';

// Imported Components
import DashboardHeader from '../components/state/DashboardHeader';
import DashboardTabs from '../components/state/DashboardTabs';
import LoadingState from '../components/state/LoadingState';
import ErrorState from '../components/state/ErrorState';
import NoRestaurantState from '../components/state/NoRestaurantState';

const SellerDashboard = () => {
  const [user, setUser] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock data for the dashboard - in a real app, this would come from an API
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
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  if (!user) {
    return (
      <ErrorState
        error='Authentication Required'
        description='You need to be logged in to access this page'
        redirectTo='/login'
        buttonText='Go to Login'
      />
    );
  }

  // If no restaurant is found
  if (!restaurant) {
    return <NoRestaurantState user={user} />;
  }

  return (
    <div className='bg-gray-50 min-h-screen poppins-regular'>
      <DashboardHeader restaurant={restaurant} user={user} />
      <DashboardTabs restaurant={restaurant} mockOrders={mockOrders} />
    </div>
  );
};

export default SellerDashboard;

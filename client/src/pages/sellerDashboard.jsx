import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // import useNavigate
import { Loader2 } from 'lucide-react';
import { getLoggedInUser, isAuthorized } from '../util/auth-utils';
import { restaurantService } from '../util/service-gateways';

// Imported Components
import DashboardHeader from '../components/state/DashboardHeader';
import DashboardTabs from '../components/state/DashboardTabs';
import LoadingState from '../components/state/LoadingState';
import ErrorState from '../components/state/ErrorState';

const SellerDashboard = () => {
  const navigate = useNavigate(); // initialize navigate
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

        try {
          const restaurantResponse = await restaurantService.get(
            `/restaurant/owner/${userData._id}`
          );
          setRestaurant(restaurantResponse.data);
        } catch (restaurantError) {
          // 👇 Check if it's a 404 Restaurant not found
          if (
            restaurantError.response &&
            restaurantError.response.status === 404
          ) {
            navigate('/restaurantForm');
            return;
          }
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
  }, [navigate]);
  // add navigate to dependencies

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

  return (
    <div className='bg-gray-50 min-h-screen poppins-regular'>
      <DashboardHeader restaurant={restaurant} user={user} />
      <DashboardTabs restaurant={restaurant} mockOrders={mockOrders} />
    </div>
  );
};

export default SellerDashboard;

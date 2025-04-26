import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { getLoggedInUser, getUserById } from "../util/auth-utils";
import { getOrdersByPostalCode } from "../util/order-utils";
import { fetchRestaurantById } from "../util/restaurant-utils";

// Imported Components (assuming these would be created similar to the seller dashboard)
import DashboardHeader from '../components/state/DashboardHeader';
import LoadingState from '../components/state/LoadingState';
import ErrorState from '../components/state/ErrorState';

const DeliveryDriverDashboard = () => {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [restaurantDetails, setRestaurantDetails] = useState({});
  const [userDetails, setUserDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const loggedInUser = await getLoggedInUser();
        console.log("Logged in user fetched successfully:", loggedInUser);
        setUser(loggedInUser);

        const postalCode = loggedInUser.address?.postal_code;

        if (postalCode) {
          const fetchedOrders = await getOrdersByPostalCode(postalCode);
          console.log("Fetched orders:", fetchedOrders);
          setOrders(fetchedOrders || []);
          
          // Fetch restaurant details and user details for each order
          const restaurantData = {};
          const userData = {};
          
          for (const order of fetchedOrders || []) {
            // Fetch restaurant details
            if (order.restaurant_id && !restaurantData[order.restaurant_id]) {
              try {
                const restaurant = await fetchRestaurantById(order.restaurant_id);
                restaurantData[order.restaurant_id] = restaurant;
                
                // Fetch restaurant owner details
                if (restaurant.owner_id && !userData[restaurant.owner_id]) {
                  try {
                    const ownerData = await getUserById(restaurant.owner_id);
                    userData[restaurant.owner_id] = ownerData?.user || null;
                  } catch (ownerErr) {
                    console.error(`Error fetching restaurant owner ${restaurant.owner_id}:`, ownerErr);
                    userData[restaurant.owner_id] = null;
                  }
                }
              } catch (restaurantErr) {
                console.error(`Error fetching restaurant ${order.restaurant_id}:`, restaurantErr);
                restaurantData[order.restaurant_id] = null;
              }
            }
            
            // Fetch buyer details
            if (order.user_id && !userData[order.user_id]) {
              try {
                const buyerData = await getUserById(order.user_id);
                userData[order.user_id] = buyerData?.user || null;
              } catch (buyerErr) {
                console.error(`Error fetching buyer ${order.user_id}:`, buyerErr);
                userData[order.user_id] = null;
              }
            }
          }
          
          setRestaurantDetails(restaurantData);
          setUserDetails(userData);
        } else {
          console.log("No postal code found for user.");
        }
      } catch (err) {
        console.error("Error loading dashboard:", err.message);
        console.log("Full error object for dashboard load:", err);
        setError("Failed to load dashboard.");
      } finally {
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

  return (
    <div className="bg-gray-50 min-h-screen poppins-regular">
      {/* Custom header for driver dashboard */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-semibold text-gray-800">
            Driver Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome, {user?.first_name}! Service area: {user?.address?.postal_code}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-medium text-gray-800 mb-4">
            Available Deliveries
          </h2>
          
          {orders.length === 0 ? (
            <div className="py-12 text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
              <h3 className="mt-3 text-lg font-medium text-gray-900">No Deliveries Available</h3>
              <p className="mt-2 text-sm text-gray-500">
                There are currently no deliveries available in your postal code area.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => {
                const restaurant = restaurantDetails[order.restaurant_id];
                const buyer = userDetails[order.user_id];
                const restaurantOwner = restaurant?.owner_id ? userDetails[restaurant.owner_id] : null;
                
                return (
                  <div key={order._id} className="bg-gray-50 rounded-lg shadow p-6 border border-gray-200">
                    <div className="flex flex-col lg:flex-row lg:justify-between">
                      <div className="mb-6 lg:mb-0">
                        <div className="flex items-center mb-2">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            {order.status || "Processing"}
                          </span>
                          <span className="ml-2 text-sm text-gray-500">
                            Order ID: {order._id}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {/* Restaurant Details */}
                          <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-2">Restaurant</h3>
                            {restaurant ? (
                              <div className="text-gray-900">
                                <p className="font-medium">{restaurant.name}</p>
                                <p className="text-sm">{restaurant.address?.street}</p>
                                <p className="text-sm">{restaurant.address?.city}, {restaurant.address?.postal_code}</p>
                              </div>
                            ) : (
                              <div className="flex items-center text-sm text-gray-500">
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Loading details...
                              </div>
                            )}
                          </div>
                          
                          {/* Restaurant Owner */}
                          <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-2">Restaurant Contact</h3>
                            {restaurantOwner ? (
                              <div className="text-gray-900">
                                <p className="font-medium">{restaurantOwner.first_name} {restaurantOwner.last_name}</p>
                                <p className="text-sm">{restaurantOwner.phone_number}</p>
                                <p className="text-sm">{restaurantOwner.email}</p>
                              </div>
                            ) : (
                              <div className="flex items-center text-sm text-gray-500">
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Loading details...
                              </div>
                            )}
                          </div>
                          
                          {/* Customer Details */}
                          <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-2">Delivery To</h3>
                            {buyer ? (
                              <div className="text-gray-900">
                                <p className="font-medium">{buyer.first_name} {buyer.last_name}</p>
                                <p className="text-sm">{buyer.address?.street}</p>
                                <p className="text-sm">{buyer.address?.city}, {buyer.address?.postal_code}</p>
                                <p className="text-sm">{buyer.phone_number}</p>
                              </div>
                            ) : (
                              <div className="flex items-center text-sm text-gray-500">
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Loading details...
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                          Accept Delivery
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeliveryDriverDashboard;
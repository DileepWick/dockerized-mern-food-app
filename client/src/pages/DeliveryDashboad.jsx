import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { getLoggedInUser, getUserById } from "../util/auth-utils";
import { getOrdersByPostalCode, updateOrderStatusByDriver } from "../util/order-utils";
import { fetchRestaurantById } from "../util/restaurant-utils";
import { createDeliveryUtil, updateDeliveryStatusUtil } from "../util/delivery-utils";

// Imported Components
import LoadingState from '../components/state/LoadingState';
import ErrorState from '../components/state/ErrorState';

const DeliveryDriverDashboard = () => {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [restaurantDetails, setRestaurantDetails] = useState({});
  const [userDetails, setUserDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState(null);
  
  const statusOptions = [
    { value: null, label: 'All Orders' },
    { value: 'PREPARED', label: 'Prepared' },
    { value: 'ACCEPTED', label: 'Accepted' },
    { value: 'PICKED_UP', label: 'Picked Up' },
    { value: 'DELIVERED', label: 'Delivered' },
    { value: 'CANCELLED', label: 'Cancelled' }
  ];

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
                    userData[restaurant.owner_id] = {
                      first_name: "Restaurant",
                      last_name: "Staff",
                      phone_number: restaurant?.phone || "Not available"
                    };
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
                userData[order.user_id] = {
                  first_name: "Unknown",
                  last_name: "User",
                  address: order.delivery_address || {
                    street: "Address unavailable",
                    city: "Unknown",
                    postal_code: order.postal_code || "Unknown"
                  },
                  phone_number: "Not available"
                };
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

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Filter orders based on active filter
  const filteredOrders = activeFilter 
    ? orders.filter(order => order.status === activeFilter)
    : orders;

  const handleAcceptDelivery = async (orderId) => {
    try {
      console.log("Accepting delivery for order:", orderId);
      
      // Find the order in the current orders array
      const order = orders.find(o => o._id === orderId);
      if (!order) {
        throw new Error(`Order ${orderId} not found in state`);
      }
      
      // Get restaurant and buyer details
      const restaurant = restaurantDetails[order.restaurant_id];
      const buyer = userDetails[order.user_id];
      
      if (!restaurant) {
        throw new Error(`Restaurant details not found for order ${orderId}`);
      }
      
      // Prepare delivery data
      const deliveryData = {
        order_id: orderId,
        buyer_address: buyer?.address || order.delivery_address || {
          street: "Address unavailable",
          city: "Unknown",
          postal_code: order.postal_code || "Unknown"
        },
        restaurant_address: restaurant.address || {
          street: "Address unavailable", 
          city: "Unknown",
          postal_code: "Unknown"
        },
        items: order.items || [],
        driver_id: user?._id // Current logged-in driver
      };
      
      // Update order status to ACCEPTED
      await updateOrderStatusByDriver(orderId, 'ACCEPTED');
      
      // Call the createDeliveryUtil function to create the delivery
      await createDeliveryUtil(deliveryData);
      
      // Update local state to reflect the change
      setOrders(orders.map(o => 
        o._id === orderId ? { ...o, status: 'ACCEPTED' } : o
      ));
    } catch (error) {
      console.error("Error accepting delivery:", error);
      alert(`Failed to accept delivery: ${error.message}`);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      console.log(`Updating order ${orderId} to status ${newStatus}`);
      
      // Update order status
      await updateOrderStatusByDriver(orderId, newStatus);
      
      // Update local state to reflect the change
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (error) {
      console.error(`Error updating order status to ${newStatus}:`, error);
      alert(`Failed to update order status: ${error.message}`);
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  return (
    <div className="bg-gray-50 min-h-screen poppins-regular">
      {/* Dashboard Header */}
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
        {/* Status filter buttons */}
        <div className="bg-white shadow rounded-lg p-4 mb-6">
          <div className="flex overflow-x-auto pb-2 space-x-2">
            {statusOptions.map(option => (
              <button 
                key={option.value || 'all'} 
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                  activeFilter === option.value 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
                onClick={() => setActiveFilter(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
            <h3 className="mt-3 text-lg font-medium text-gray-900">No Deliveries Available</h3>
            <p className="mt-2 text-sm text-gray-500">
              There are currently no deliveries {activeFilter ? `with status "${activeFilter.replace('_', ' ').toLowerCase()}"` : ''} in your postal code area.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => {
              const restaurant = restaurantDetails[order.restaurant_id];
              const buyer = userDetails[order.user_id];
              
              return (
                <div key={order._id} className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
                  {/* Order Header */}
                  <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <div className="flex items-center">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{restaurant?.name || "Restaurant"}</h3>
                        <p className="text-sm text-gray-500">
                          Order #{order._id.substring(0, 8)} • {formatDate(order.created_at || new Date())}
                        </p>
                      </div>
                    </div>
                    <div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        order.status === 'PREPARED' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'ACCEPTED' ? 'bg-purple-100 text-purple-800' :
                        order.status === 'PICKED_UP' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {order.status?.replace('_', ' ') || "Processing"}
                      </span>
                    </div>
                  </div>
                  
                  {/* Order Details */}
                  <div className="p-4 border-b border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Locations */}
                      <div className="space-y-4">
                                                  {/* Restaurant Location */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-1">Pickup From</h4>
                          {restaurant ? (
                            <div className="text-gray-800">
                              <p className="font-medium">{restaurant.name}</p>
                              {restaurant.address?.street && <p className="text-sm">{restaurant.address.street}</p>}
                              {restaurant.address?.city && <p className="text-sm">{restaurant.address.city}{restaurant.address?.postal_code && `, ${restaurant.address.postal_code}`}</p>}
                              {restaurant.phone && <p className="text-sm">{restaurant.phone}</p>}
                            </div>
                          ) : (
                            <div className="flex items-center text-sm text-gray-500">
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Loading details...
                            </div>
                          )}
                        </div>
                        
                                                  {/* Customer Location */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-1">Deliver To</h4>
                          {buyer ? (
                            <div className="text-gray-800">
                              <p className="font-medium">{buyer.first_name} {buyer.last_name}{buyer.first_name === "Unknown" && " (User not found)"}</p>
                              {(buyer.address?.street || order.delivery_address?.street) && 
                                <p className="text-sm">{buyer.address?.street || order.delivery_address?.street}</p>
                              }
                              {(buyer.address?.city || order.delivery_address?.city || buyer.address?.postal_code || order.delivery_address?.postal_code || order.postal_code) && 
                                <p className="text-sm">
                                  {buyer.address?.city || order.delivery_address?.city || ""}
                                  {(buyer.address?.city || order.delivery_address?.city) && (buyer.address?.postal_code || order.delivery_address?.postal_code || order.postal_code) && ", "}
                                  {buyer.address?.postal_code || order.delivery_address?.postal_code || order.postal_code || ""}
                                </p>
                              }
                              {(buyer.phone_number || order.phone_number) && 
                                <p className="text-sm">{buyer.phone_number || order.phone_number}</p>
                              }
                            </div>
                          ) : (
                            <div className="flex items-center text-sm text-gray-500">
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Loading details...
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Order Summary */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Order Summary</h4>
                        <div className="bg-gray-50 rounded-md p-3">
                          {/* Order items would go here - mocked for now */}
                          <div className="space-y-2">
                            {(order.items || []).slice(0, 3).map((item, index) => (
                              <div key={index} className="flex justify-between text-sm">
                                <span className="text-gray-800">
                                  <span className="font-medium mr-1">{item?.quantity || 1}×</span>
                                  {item?.name || `Menu Item ${index + 1}`}
                                </span>
                                <span className="text-gray-800 font-medium">₹{item?.price || ((index + 1) * 100).toFixed(2)}</span>
                              </div>
                            ))}
                            {(order.items?.length || 0) > 3 && (
                              <div className="text-sm text-gray-500 italic">
                                +{(order.items?.length || 0) - 3} more items
                              </div>
                            )}
                            <div className="pt-2 mt-2 border-t border-gray-200 flex justify-between">
                              <span className="font-medium">Total</span>
                              <span className="font-bold">₹{order.total_amount?.toFixed(2) || '450.00'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="p-4 bg-gray-50 flex justify-end space-x-3">
                    {order.status === 'PREPARED' && (
                      <button 
                        onClick={() => handleAcceptDelivery(order._id)}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                      >
                        Accept Delivery
                      </button>
                    )}
                    
                    {order.status === 'ACCEPTED' && (
                      <button 
                        onClick={() => handleUpdateStatus(order._id, 'PICKED_UP')}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Mark Picked Up
                      </button>
                    )}
                    
                    {order.status === 'PICKED_UP' && (
                      <button 
                        onClick={() => handleUpdateStatus(order._id, 'DELIVERED')}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        Mark Delivered
                      </button>
                    )}
                    
                    {/* Removed "Mark Picked Up" button from PREPARED status section */}
                    
                    {/* Removed cancel button - drivers cannot cancel deliveries */}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryDriverDashboard;
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { getDeliveriesByDriverIdUtil, updateDeliveryStatusUtil } from "../util/delivery-utils";
import { getLoggedInUser, getUserById } from "../util/auth-utils";
import { fetchRestaurantById } from "../util/restaurant-utils";

// Imported Components
import LoadingState from '../components/state/LoadingState';
import ErrorState from '../components/state/ErrorState';

const AcceptedDeliveries = () => {
  const [user, setUser] = useState(null);
  const [deliveries, setDeliveries] = useState([]);
  const [restaurantDetails, setRestaurantDetails] = useState({});
  const [userDetails, setUserDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingDeliveryId, setProcessingDeliveryId] = useState(null);
  const [activeFilter, setActiveFilter] = useState(null);
  
  const statusOptions = [
    { value: null, label: 'All Deliveries' },
    { value: 'ACCEPTED', label: 'Accepted' },
    { value: 'PICKED_UP', label: 'Picked Up' },
    { value: 'DELIVERED', label: 'Delivered' },
    { value: 'CANCELLED', label: 'Cancelled' }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const loggedInUser = await getLoggedInUser();
        console.log("Logged in user fetched successfully:", loggedInUser);
        
        if (!loggedInUser || !loggedInUser._id) {
          throw new Error("Failed to get logged in user or user ID is missing");
        }
        
        setUser(loggedInUser);

        // Fetch all deliveries for the logged in driver
        const fetchedDeliveries = await getDeliveriesByDriverIdUtil(loggedInUser._id);
        console.log("Fetched deliveries:", fetchedDeliveries);
        setDeliveries(fetchedDeliveries || []);
        
        // Fetch restaurant details and user details for each delivery
        const restaurantData = {};
        const userData = {};
        
        for (const delivery of fetchedDeliveries || []) {
          // Handle both direct restaurant_id and nested order.restaurant_id
          const restaurantId = delivery.restaurant_id || (delivery.order_id && delivery.order_id.restaurant_id);
          const userId = delivery.order_id && delivery.order_id.user_id;
          
          // Fetch restaurant details if we have a restaurantId
          if (restaurantId && !restaurantData[restaurantId]) {
            try {
              const restaurant = await fetchRestaurantById(restaurantId);
              restaurantData[restaurantId] = restaurant;
            } catch (restaurantErr) {
              console.error(`Error fetching restaurant ${restaurantId}:`, restaurantErr);
              restaurantData[restaurantId] = null;
            }
          }
          
          // Fetch buyer details if we have a userId
          if (userId && !userData[userId]) {
            try {
              const buyerData = await getUserById(userId);
              userData[userId] = buyerData?.user || null;
            } catch (buyerErr) {
              console.error(`Error fetching buyer ${userId}:`, buyerErr);
              userData[userId] = null;
            }
          }
        }
        
        setRestaurantDetails(restaurantData);
        setUserDetails(userData);
      } catch (err) {
        console.error("Error loading accepted deliveries:", err.message);
        console.log("Full error object for accepted deliveries load:", err);
        setError("Failed to load accepted deliveries.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter deliveries based on active filter
  const filteredDeliveries = activeFilter 
    ? deliveries.filter(delivery => delivery.status === activeFilter)
    : deliveries;

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

  const handleStatusUpdate = async (delivery, newStatus) => {
    try {
      setProcessingDeliveryId(delivery._id);
      console.log(`Updating delivery ${delivery._id} status to ${newStatus}`);
      
      // Update delivery status
      const updatedDelivery = await updateDeliveryStatusUtil(delivery._id, newStatus);
      console.log("Delivery updated:", updatedDelivery);
      
      // Update local state to reflect the change
      setDeliveries(deliveries.map(d => 
        d._id === delivery._id ? { ...d, status: newStatus } : d
      ));
      
      console.log(`Successfully updated delivery ${delivery._id} to ${newStatus}`);
    } catch (error) {
      console.error("Error updating delivery status:", error);
      alert(`Failed to update delivery status: ${error.message}`);
    } finally {
      setProcessingDeliveryId(null);
    }
  };

  const navigateToDriverDash = () => {
    window.location.href = "http://localhost:5173/DriverDash";
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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">
                My Deliveries
              </h1>
              <p className="text-gray-600">
                Manage your accepted deliveries
              </p>
            </div>
            <button
              onClick={navigateToDriverDash}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back to Driver Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="max-w-7xl mx-auto mt-4 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-sm rounded-lg overflow-x-auto">
          <div className="flex p-1 space-x-1">
            {statusOptions.map(option => (
              <button 
                key={option.value || 'all'} 
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  activeFilter === option.value 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                } transition-colors duration-200`}
                onClick={() => setActiveFilter(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredDeliveries.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100">
              <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
            </div>
            <h3 className="mt-3 text-lg font-medium text-gray-900">No Deliveries Found</h3>
            <p className="mt-2 text-sm text-gray-500">
              {activeFilter 
                ? `You don't have any ${activeFilter.toLowerCase().replace('_', ' ')} deliveries.` 
                : "You don't have any deliveries at the moment."}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredDeliveries.map((delivery) => {
              // Get restaurant ID either directly from delivery or from the order
              const restaurantId = delivery.restaurant_id || 
                (delivery.order_id && typeof delivery.order_id === 'object' ? delivery.order_id.restaurant_id : null);
              
              // Get user ID from the order if it's an object
              const userId = delivery.order_id && typeof delivery.order_id === 'object' ? delivery.order_id.user_id : null;
              
              // Get the actual order ID value (might be an object or just the ID string)
              const orderId = typeof delivery.order_id === 'object' ? delivery.order_id._id : delivery.order_id;
              
              const restaurant = restaurantId ? restaurantDetails[restaurantId] : null;
              const buyer = userId ? userDetails[userId] : null;
              const isProcessing = processingDeliveryId === delivery._id;
              
              return (
                <div key={delivery._id} className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
                  {/* Delivery Header */}
                  <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <div className="flex items-center">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{restaurant?.name || "Restaurant"}</h3>
                        <div className="flex flex-col sm:flex-row sm:space-x-4">
                          <p className="text-sm text-gray-500">
                            Delivery #{delivery._id.substring(0, 8)} • {formatDate(delivery.assigned_at || delivery.createdAt || new Date())}
                          </p>
                          {orderId && (
                            <p className="text-sm text-gray-500">
                              Order ID: {typeof orderId === 'string' ? orderId.substring(0, 8) : 'N/A'}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        delivery.status === 'ACCEPTED' ? 'bg-purple-100 text-purple-800' :
                        delivery.status === 'PICKED_UP' ? 'bg-blue-100 text-blue-800' :
                        delivery.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                        delivery.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {delivery.status?.replace('_', ' ') || "Processing"}
                      </span>
                    </div>
                  </div>
                  
                  {/* Delivery Details */}
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
                              <p className="text-xs text-gray-500">Restaurant ID: {restaurantId?.substring(0, 8)}</p>
                              {delivery.restaurant_address?.street && <p className="text-sm">{delivery.restaurant_address.street}</p>}
                              {delivery.restaurant_address?.city && (
                                <p className="text-sm">
                                  {delivery.restaurant_address.city}
                                  {delivery.restaurant_address?.postal_code && `, ${delivery.restaurant_address.postal_code}`}
                                </p>
                              )}
                              {restaurant.phone && <p className="text-sm">{restaurant.phone}</p>}
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500">
                              {restaurantId && <p className="text-xs">Restaurant ID: {restaurantId?.substring(0, 8)}</p>}
                              {delivery.restaurant_address?.street && <p>{delivery.restaurant_address.street}</p>}
                              {delivery.restaurant_address?.city && (
                                <p>
                                  {delivery.restaurant_address.city}
                                  {delivery.restaurant_address?.postal_code && `, ${delivery.restaurant_address.postal_code}`}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                        
                        {/* Customer Location */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-1">Deliver To</h4>
                          {buyer ? (
                            <div className="text-gray-800">
                              <p className="font-medium">{buyer.first_name} {buyer.last_name}</p>
                              {delivery.buyer_address?.street && <p className="text-sm">{delivery.buyer_address.street}</p>}
                              {delivery.buyer_address?.city && (
                                <p className="text-sm">
                                  {delivery.buyer_address.city}
                                  {delivery.buyer_address?.postal_code && `, ${delivery.buyer_address.postal_code}`}
                                </p>
                              )}
                              {buyer.phone_number && <p className="text-sm">{buyer.phone_number}</p>}
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500">
                              {delivery.buyer_address?.street && <p>{delivery.buyer_address.street}</p>}
                              {delivery.buyer_address?.city && (
                                <p>
                                  {delivery.buyer_address.city}
                                  {delivery.buyer_address?.postal_code && `, ${delivery.buyer_address.postal_code}`}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Order Summary */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Order Summary</h4>
                        <div className="bg-gray-50 rounded-md p-3">
                          <div className="space-y-2">
                            {(delivery.items || []).slice(0, 3).map((item, index) => (
                              <div key={index} className="flex justify-between text-sm">
                                <span className="text-gray-800">
                                  <span className="font-medium mr-1">{item?.quantity || 1}×</span>
                                  {item?.name || `Item ${index + 1}`}
                                </span>
                                <span className="text-gray-800 font-medium">₹{item?.price || 0}</span>
                              </div>
                            ))}
                            {(delivery.items?.length || 0) > 3 && (
                              <div className="text-sm text-gray-500 italic">
                                +{(delivery.items?.length || 0) - 3} more items
                              </div>
                            )}
                            <div className="pt-2 mt-2 border-t border-gray-200 flex justify-between">
                              <span className="font-medium">Total</span>
                              <span className="font-bold">₹{
                                // Use the total_amount field if available, otherwise calculate from items
                                (delivery.total_amount ? 
                                  delivery.total_amount.toFixed(2) : 
                                  delivery.items?.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0).toFixed(2)) || '0.00'
                              }</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="p-4 bg-gray-50 flex justify-end space-x-3">
                    {delivery.status === 'ACCEPTED' && (
                      <button 
                        onClick={() => handleStatusUpdate(delivery, 'PICKED_UP')}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          'Mark as Picked Up'
                        )}
                      </button>
                    )}
                    
                    {delivery.status === 'PICKED_UP' && (
                      <button 
                        onClick={() => handleStatusUpdate(delivery, 'DELIVERED')}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          'Mark as Delivered'
                        )}
                      </button>
                    )}
                    
                    {(delivery.status === 'ACCEPTED' || delivery.status === 'PICKED_UP') && (
                      <button 
                        onClick={() => handleStatusUpdate(delivery, 'CANCELLED')}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        disabled={isProcessing}
                      >
                        Cancel
                      </button>
                    )}
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

export default AcceptedDeliveries;
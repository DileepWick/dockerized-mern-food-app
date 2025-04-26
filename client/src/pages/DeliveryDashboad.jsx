import { useEffect, useState } from 'react';
import { getLoggedInUser, getUserById } from "../util/auth-utils";
import { getOrdersByPostalCode } from "../util/order-utils";
import { fetchRestaurantById } from "../util/restaurant-utils";

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

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Welcome, {user?.first_name}!</h1>
      <h2 className="text-xl mb-2">
        Available Deliveries in {user?.address?.postal_code}
      </h2>
      {orders.length === 0 ? (
        <p>No available deliveries right now.</p>
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => {
            const restaurant = restaurantDetails[order.restaurant_id];
            const buyer = userDetails[order.user_id];
            const restaurantOwner = restaurant?.owner_id ? userDetails[restaurant.owner_id] : null;
            
            return (
              <li key={order._id} className="border p-4 rounded-lg shadow">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">Order Information</h3>
                  <p><strong>Order ID:</strong> {order._id}</p>
                  <p><strong>Status:</strong> {order.status || "Processing"}</p>
                </div>
                
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">Restaurant Details</h3>
                  {restaurant ? (
                    <>
                      <p><strong>Name:</strong> {restaurant.name}</p>
                      <p><strong>Address:</strong> {restaurant.address?.street}, {restaurant.address?.city}</p>
                      <p><strong>Postal Code:</strong> {restaurant.address?.postal_code}</p>
                    </>
                  ) : (
                    <p>Loading restaurant details...</p>
                  )}
                </div>
                
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">Restaurant Owner</h3>
                  {restaurantOwner ? (
                    <>
                      <p><strong>Name:</strong> {restaurantOwner.first_name} {restaurantOwner.last_name}</p>
                      <p><strong>Phone:</strong> {restaurantOwner.phone_number}</p>
                      <p><strong>Email:</strong> {restaurantOwner.email}</p>
                      <p><strong>Address:</strong> {restaurantOwner.address?.street}, {restaurantOwner.address?.city}</p>
                      <p><strong>Postal Code:</strong> {restaurantOwner.address?.postal_code}</p>
                    </>
                  ) : (
                    <p>Loading owner details...</p>
                  )}
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Customer Details</h3>
                  {buyer ? (
                    <>
                      <p><strong>Name:</strong> {buyer.first_name} {buyer.last_name}</p>
                      <p><strong>Phone:</strong> {buyer.phone_number}</p>
                      <p><strong>Address:</strong> {buyer.address?.street}, {buyer.address?.city}</p>
                      <p><strong>Postal Code:</strong> {buyer.address?.postal_code}</p>
                    </>
                  ) : (
                    <p>Loading customer details...</p>
                  )}
                </div>
                
                <button className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
                  Accept Delivery
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default DeliveryDriverDashboard;
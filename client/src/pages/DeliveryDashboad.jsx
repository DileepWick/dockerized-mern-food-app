import { useEffect, useState } from 'react';
import { getLoggedInUser } from "../util/auth-utils";
import { getOrdersByPostalCode } from "../util/order-utils";
import { fetchRestaurantById } from "../util/restaurant-utils";

const DeliveryDriverDashboard = () => {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [restaurantDetails, setRestaurantDetails] = useState({});
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
          
          // Fetch restaurant details for each order
          const restaurantData = {};
          for (const order of fetchedOrders || []) {
            if (order.restaurant_id && !restaurantData[order.restaurant_id]) {
              try {
                const restaurant = await fetchRestaurantById(order.restaurant_id);
                restaurantData[order.restaurant_id] = restaurant;
              } catch (restaurantErr) {
                console.error(`Error fetching restaurant ${order.restaurant_id}:`, restaurantErr);
                restaurantData[order.restaurant_id] = null;
              }
            }
          }
          setRestaurantDetails(restaurantData);
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
            return (
              <li key={order._id} className="border p-4 rounded-lg shadow">
                <p><strong>Order ID:</strong> {order._id}</p>
                <p><strong>Buyer ID:</strong> {order.user_id}</p>
                <p><strong>Restaurant ID:</strong> {order.restaurant_id}</p>
                {restaurant && (
                  <>
                    <p><strong>Restaurant Name:</strong> {restaurant.name}</p>
                    <p><strong>Restaurant Owner ID:</strong> {restaurant.owner_id}</p>
                  </>
                )}
                {!restaurant && <p>Loading restaurant details...</p>}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default DeliveryDriverDashboard;
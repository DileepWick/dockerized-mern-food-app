import { useEffect, useState } from 'react';
import { getLoggedInUser } from "../util/auth-utils";
import { getOrdersByPostalCode } from "../util/order-utils";
import { orderService } from "../util/service-gateways"; // Make sure you import this for accepting deliveries

const DeliveryDriverDashboard = () => {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accepting, setAccepting] = useState(null);

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

  const handleAcceptDelivery = async (orderId) => {
    try {
      setAccepting(orderId);
      console.log(`Attempting to accept order with ID: ${orderId}`);

      await orderService.patch(`/orders/${orderId}/assign-driver`, {
        driverId: user._id,
      });
      console.log(`Order ${orderId} successfully assigned to driver ${user._id}`);

      // After accepting, refetch the list of orders
      const updatedOrders = await getOrdersByPostalCode(user.address.postal_code);
      console.log("Updated orders after accepting delivery:", updatedOrders);
      setOrders(updatedOrders || []);
    } catch (err) {
      console.error("Error accepting delivery:", err.message);
      console.log("Full error object during accept delivery:", err);
      setError("Failed to accept delivery.");
    } finally {
      setAccepting(null);
    }
  };

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
          {orders.map((order) => (
            <li key={order._id} className="border p-4 rounded-lg shadow">
              <p><strong>Order ID:</strong> {order._id}</p>
              <p><strong>buyerID:</strong> {order.user_id}</p>
              <p><strong>Resturant ID:</strong> {order.restaurant_id}</p>
              <button
                onClick={() => handleAcceptDelivery(order._id)}
                className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                disabled={accepting === order._id}
              >
                {accepting === order._id ? 'Accepting...' : 'Accept Delivery'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DeliveryDriverDashboard;

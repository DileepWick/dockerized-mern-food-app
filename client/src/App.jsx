import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { getLoggedInUser } from './util/auth-utils';

import LoginPage from '../src/app/login/page';
import RegisterPage from '../src/app/register/register-page';
import Home from './pages/Home';
import RestaurantForm from './pages/RestaurantForm';
import UserPage from './pages/userPage';
import SellerDashboard from './pages/sellerDashboard';
import PaymentPage from './pages/PaymentPage';
import AcceptedDeliveries from './pages/AcceptedDeliveries';
import MyOrders from './pages/MyOrders';
import CartPage from './components/order_component/CartPage';
import DeliveryDriverDashboard from './pages/DeliveryDashboad';
import DriverRegistrationForm from './pages/DriverRegistration';
import AdminDashboard from './pages/AdminDashboard';

// Load Stripe (replace with your actual publishable key)
const stripePromise = loadStripe('pk_test_51RHOqvHQoMQTExGNrroYBPZTeRuB3RhRktcwiS3D9rjNCNzoiiKKSEHDdZOcmiPgBCB6L7AOOQgeBYR3NrZ0IpDA00a6jsybQS');

// Stripe-wrapped CartPage component
const StripeCartPage = () => (
  <Elements stripe={stripePromise}>
    <CartPage />
  </Elements>
);

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch logged-in user
  useEffect(() => {
    const fetchUser = async () => {
      const loggedInUser = await getLoggedInUser();
      setUser(loggedInUser);
      setLoading(false);
    };
    fetchUser();
  }, []);

  if (loading) return <p>Loading...</p>; // Prevents redirect before user data loads

  return user ? children : <Navigate to='/login' />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path='/login' element={<LoginPage />} />
        <Route path='/register' element={<RegisterPage />} />
        <Route path='/restaurantForm' element={<RestaurantForm />} />
        <Route path='/userPage' element={<UserPage />} />
        <Route path='/sellerDashboard' element={<SellerDashboard />} />
        <Route path='/paymentForm' element={<PaymentPage />} />
        <Route path='/myOrders' element={<MyOrders />} />
        
        {/* Cart route with Stripe */}
        <Route path="/cart" element={<StripeCartPage />} />
        
        <Route path='/DriverDash' element={<DeliveryDriverDashboard />} />
        <Route path='/DriverRegister' element={<DriverRegistrationForm />} />
        <Route path='/admin' element={<AdminDashboard />} />
        <Route path='/acceptedDeliveries' element={<AcceptedDeliveries />} />
        
        {/* Protected Route */}
        <Route
          path='/'
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        
        {/* Redirect unknown routes to login */}
        <Route path='*' element={<Navigate to='/login' />} />
      </Routes>
    </Router>
  );
}

export default App;
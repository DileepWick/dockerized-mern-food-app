import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getLoggedInUser } from './util/auth-utils';

import LoginPage from '../src/app/login/page';
import RegisterPage from '../src/app/register/register-page';
import Home from './pages/Home';;
import RestaurantForm from './pages/RestaurantForm';
import SellerDashboard from './pages/sellerDashboard';
import PaymentPage from './pages/PaymentPage';

// Protected Route
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
        {/* Public Route */}
        <Route path='/login' element={<LoginPage />} />
        <Route path='/register' element={<RegisterPage />} />
        <Route path='/register' element={<RegisterPage />} />
        <Route path='/restaurantForm' element={<RestaurantForm />} />
        <Route path='/sellerDashboard' element={<SellerDashboard />} />
        <Route path='/paymentForm' element={<PaymentPage/>}/>

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

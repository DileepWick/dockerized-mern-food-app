import { User, ShoppingBag, Menu } from 'lucide-react';
import { useState } from 'react';
import { Loader2, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../util/auth-utils';

const Header = ({ user, cartCount, onCartClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await logoutUser(); // Add this function to your auth-utils
      window.location.href = '/login'; // Redirect to login page after logout
    } catch (err) {
      console.error('Error logging out:', err);
      alert('Failed to log out. Please try again.');
      setLoggingOut(false);
    }
  };

  return (
    <header className='sticky bg-gray-50 pt-10 pb-3 top-0 z-10'>
      <div className='max-w-7xl mx-auto px-4 py-4 flex justify-between items-center'>
        <div className='flex items-center cursor-default'>
          <h1 className='text-xl font-bold text-black'>SnapByte</h1>
        </div>
        <div className='hidden md:flex items-center gap-10'>
          <nav className='flex items-center space-x-4'>
            <a
              href='/userPage'
              className='text-gray-700 hover:text-green-600 uppercase duration-500'
            >
              Home
            </a>
            <a
              href='/MyOrders'
              className='text-gray-700 hover:text-green-600 uppercase duration-500'
            >
              My Orders
            </a>
          </nav>
          <div className='flex items-center gap-4'>
            <button onClick={onCartClick} className='relative cursor-pointer'>
              <ShoppingBag className='h-6 w-6 text-gray-700' />
              {cartCount > 0 && (
                <span className='absolute -top-2 -right-2 bg-green-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full'>
                  {cartCount}
                </span>
              )}
            </button>
            <div>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className='inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              >
                {loggingOut ? (
                  <>
                    <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                    Logging out...
                  </>
                ) : (
                  <>
                    <LogOut className='h-4 w-4 mr-2' />
                    Logout
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
        {/* Mobile menu button */}
        <button
          className='md:hidden flex items-center'
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <Menu className='h-6 w-6 text-gray-700' />
        </button>
      </div>
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className='md:hidden bg-white border-t px-4 py-2'>
          <nav className='flex flex-col space-y-2'>
            <a href='/' className='py-2 text-gray-700 hover:text-blue-600'>
              Home
            </a>
            <a
              href='/restaurants'
              className='py-2 text-gray-700 hover:text-blue-600'
            >
              Restaurants
            </a>
            <a
              href='/MyOrders'
              className='py-2 text-gray-700 hover:text-blue-600'
            >
              My Orders
            </a>
            <button
              onClick={onCartClick}
              className='flex items-center py-2 text-gray-700 hover:text-blue-600'
            >
              <ShoppingBag className='h-5 w-5 mr-2' />
              Cart
              {cartCount > 0 && (
                <span className='ml-2 bg-blue-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full'>
                  {cartCount}
                </span>
              )}
            </button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;

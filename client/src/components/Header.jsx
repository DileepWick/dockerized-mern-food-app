// components/Header.jsx
import { User, ShoppingBag, Menu } from 'lucide-react';
import { useState } from 'react';

const Header = ({ user, cartCount }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className='bg-white shadow-sm sticky top-0 z-10'>
      <div className='max-w-7xl mx-auto px-4 py-4 flex justify-between items-center'>
        <div className='flex items-center'>
          <h1 className='text-xl font-bold text-blue-600'>SnapByte</h1>
        </div>

        <div className='flex items-center gap-10 py-8'>
          <nav className='flex items-center space-x-4'>
            <a href='/userPage' className='text-gray-700 hover:text-blue-600'>
              Home
            </a>
            <a
              href='/restaurants'
              className='text-gray-700 hover:text-blue-600'
            >
              Restaurants
            </a>
            <a href='/orders' className='text-gray-700 hover:text-blue-600'>
              My Orders
            </a>
          </nav>

          <div className='flex items-center gap-4'>
            <a href='/cart' className='relative'>
              <ShoppingBag className='h-6 w-6 text-gray-700' />
              {cartCount > 0 && (
                <span className='absolute -top-2 -right-2 bg-blue-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full'>
                  {cartCount}
                </span>
              )}
            </a>

            <div className='flex items-center'>
              <div className='bg-gray-200 p-1 rounded-full'>
                <User className='h-5 w-5 text-gray-700' />
              </div>
              <span className='ml-2 text-sm font-medium text-gray-700'>
                {user?.name || 'User'}
              </span>
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
              href='/orders'
              className='py-2 text-gray-700 hover:text-blue-600'
            >
              My Orders
            </a>
            <div className='flex items-center py-2'>
              <div className='bg-gray-200 p-1 rounded-full'>
                <User className='h-5 w-5 text-gray-700' />
              </div>
              <span className='ml-2 text-sm font-medium text-gray-700'>
                {user?.first_name || 'User'}
              </span>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;

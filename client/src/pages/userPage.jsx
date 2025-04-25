import { useState, useEffect } from 'react';
import { Loader2, Search, ShoppingBag } from 'lucide-react';
import { getLoggedInUser } from '../util/auth-utils';
import { restaurantService, menuService } from '../util/service-gateways';

// Imported Components
import Header from '../components/Header';
import RestaurantCard from '../components/RestaurantCard';
import MenuItemCard from '../components/MenuItemCard';
import LoadingState from '../components/state/LoadingState';
import ErrorState from '../components/state/ErrorState';

const UserPage = () => {
  const [user, setUser] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuLoading, setMenuLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const userData = await getLoggedInUser();
        if (!userData) {
          setError('You must be logged in to view this page');
          setLoading(false);
          return;
        }

        setUser(userData);

        try {
          const restaurantsResponse = await restaurantService.get(
            '/restaurant'
          );
          setRestaurants(restaurantsResponse.data);
        } catch (restaurantError) {
          console.error('Error fetching restaurants:', restaurantError);
          setError('Failed to load restaurants. Please try again later.');
        }

        setLoading(false);
      } catch (err) {
        console.error('Error loading page:', err);
        setError('Failed to load page. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleRestaurantSelect = async (restaurant) => {
    setSelectedRestaurant(restaurant);
    setMenuLoading(true);
    try {
      const menuResponse = await menuService.get(
        `menu-items/restaurant/${restaurant._id}`
      );
      setMenuItems(menuResponse.data);
    } catch (err) {
      console.error('Error fetching menu items:', err);
      setError('Failed to load menu items. Please try again later.');
    }
    setMenuLoading(false);
  };

  const addToCart = (item) => {
    const existingItem = cart.find((cartItem) => cartItem._id === item._id);

    if (existingItem) {
      setCart(
        cart.map((cartItem) =>
          cartItem._id === item._id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      );
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (itemId) => {
    const existingItem = cart.find((item) => item._id === itemId);

    if (existingItem && existingItem.quantity > 1) {
      setCart(
        cart.map((item) =>
          item._id === itemId ? { ...item, quantity: item.quantity - 1 } : item
        )
      );
    } else {
      setCart(cart.filter((item) => item._id !== itemId));
    }
  };

  const filteredRestaurants = searchQuery
    ? restaurants.filter(
        (restaurant) =>
          restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          restaurant.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
      )
    : restaurants;

  const filteredMenuItems =
    searchQuery && selectedRestaurant
      ? menuItems.filter(
          (item) =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            item.category.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : menuItems;

  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  if (!user) {
    return (
      <ErrorState
        error='Authentication Required'
        description='You need to be logged in to access this page'
        redirectTo='/login'
        buttonText='Go to Login'
      />
    );
  }

  return (
    <div className='bg-gray-50 min-h-screen poppins-regular'>
      <Header
        user={user}
        cartCount={cart.length}
        onCartClick={() => setIsCartOpen(true)}
      />

      <div className='max-w-7xl mx-auto px-4 py-6'>
        {/* Search Bar */}
        <div className='relative mb-6'>
          <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
            <Search className='w-5 h-5 text-gray-400' />
          </div>
          <input
            type='text'
            className='bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5'
            placeholder='Search restaurants or food...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className='flex flex-col'>
          <div className='w-full'>
            {selectedRestaurant ? (
              <div>
                <div className='flex justify-center items-center mb-4 gap-4'>
                  <h2 className='text-2xl font-bold'>
                    {selectedRestaurant.name}
                  </h2>
                  <button
                    onClick={() => setSelectedRestaurant(null)}
                    className='text-sm text-blue-600 hover:text-blue-800'
                  >
                    Back to restaurants
                  </button>
                </div>
                <p className='text-gray-600 mb-6'>
                  {selectedRestaurant.description}
                </p>

                {menuLoading ? (
                  <div className='flex justify-center py-12'>
                    <Loader2 className='h-8 w-8 animate-spin text-gray-500' />
                  </div>
                ) : (
                  <div>
                    {filteredMenuItems.length === 0 ? (
                      <p className='text-center py-12 text-gray-500'>
                        No menu items available
                      </p>
                    ) : (
                      <div>
                        {[
                          ...new Set(
                            filteredMenuItems.map((item) => item.category)
                          ),
                        ].map((category) => (
                          <div key={category} className='mb-8'>
                            <h3 className='text-xl font-semibold mb-4 border-b pb-2'>
                              {category}
                            </h3>
                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                              {filteredMenuItems
                                .filter((item) => item.category === category)
                                .map((item) => (
                                  <MenuItemCard
                                    key={item._id}
                                    item={item}
                                    onAddToCart={() => addToCart(item)}
                                  />
                                ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <h2 className='text-2xl font-bold mb-6'>
                  Restaurants Near You
                </h2>
                {filteredRestaurants.length === 0 ? (
                  <p className='text-center py-12 text-gray-500'>
                    No restaurants found
                  </p>
                ) : (
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    {filteredRestaurants.map((restaurant) => (
                      <RestaurantCard
                        key={restaurant._id}
                        restaurant={restaurant}
                        onSelect={() => handleRestaurantSelect(restaurant)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cart Modal */}
      {isCartOpen && (
        <div className='fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center'>
          <div className='bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative'>
            <button
              onClick={() => setIsCartOpen(false)}
              className='absolute top-2 right-2 text-gray-600 hover:text-gray-800 text-xl'
            >
              &times;
            </button>
            <h3 className='text-lg font-semibold mb-4 flex items-center gap-2'>
              <ShoppingBag className='w-5 h-5' />
              Your Cart
            </h3>
            {cart.length === 0 ? (
              <p className='text-gray-500'>Your cart is empty</p>
            ) : (
              <div className='space-y-4'>
                {cart.map((item) => (
                  <div
                    key={item._id}
                    className='flex justify-between items-center border-b pb-2'
                  >
                    <div>
                      <p className='font-medium'>{item.name}</p>
                      <p className='text-sm text-gray-500'>
                        {item.quantity} × ${item.price.toFixed(2)}
                      </p>
                    </div>
                    <div className='flex items-center gap-2'>
                      <button
                        className='text-red-500 hover:text-red-700'
                        onClick={() => removeFromCart(item._id)}
                      >
                        −
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        className='text-green-600 hover:text-green-800'
                        onClick={() => addToCart(item)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
                <div className='border-t pt-4 font-semibold text-right'>
                  Total: ${cartTotal.toFixed(2)}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserPage;

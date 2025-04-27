import { useState, useEffect, useRef } from 'react';
import {
  Loader2,
  Search,
  ShoppingBag,
  Coffee,
  MapPin,
  Star,
  Send,
  Instagram,
  Facebook,
  Twitter,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getLoggedInUser } from '../util/auth-utils';
import { restaurantService, menuService } from '../util/service-gateways';
import { createOrder, addOrderItem } from '../util/order-utils';
import gsap from 'gsap';

// Imported Components
import Header from '../components/Header';
import RestaurantCard from '../components/RestaurantCard';
import MenuItemCard from '../components/MenuItemCard';
import LoadingState from '../components/state/LoadingState';
import ErrorState from '../components/state/ErrorState';

// New Feature Components
const AnimatedBanner = () => {
  const bannerRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    const banner = bannerRef.current;
    const text = textRef.current;

    gsap.fromTo(
      banner,
      { opacity: 0, y: -50 },
      { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' }
    );

    gsap.fromTo(
      text,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 1, delay: 0.5, ease: 'back.out' }
    );
  }, []);

  return (
    <div
      ref={bannerRef}
      className='bg-gradient-to-r from-orange-400 to-red-500 text-white p-8 rounded-xl mb-10 shadow-lg relative overflow-hidden'
    >
      <div className='absolute right-0 top-0 h-full w-1/2 bg-white opacity-10 transform -skew-x-12'></div>
      <div ref={textRef} className='relative z-10'>
        <h1 className='text-3xl font-bold mb-2'>
          Hungry? We've got you covered!
        </h1>
        <p className='text-white/80'>
          Discover delicious food from restaurants in your neighborhood.
        </p>
      </div>
    </div>
  );
};

const FoodCategoryChips = ({ onCategorySelect, activeCategory }) => {
  const categories = [
    'All',
    'MAIN COURSES',
    'BEVERAGES',
    'SIDES',
    'APPETIZERS',
    'DESSERT',
  ];
  const chipContainerRef = useRef(null);

  useEffect(() => {
    const chips = chipContainerRef.current.children;
    gsap.fromTo(
      chips,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power2.out',
      }
    );
  }, []);

  return (
    <div
      ref={chipContainerRef}
      className='flex gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide'
    >
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onCategorySelect(category)}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
            activeCategory === category
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white text-gray-700 hover:bg-gray-100 border'
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
};

const FloatingCartButton = ({ count, onClick, total }) => {
  const buttonRef = useRef(null);

  useEffect(() => {
    if (count > 0) {
      gsap.fromTo(
        buttonRef.current,
        { scale: 0.8 },
        { scale: 1.1, duration: 0.3, yoyo: true, repeat: 1 }
      );
    }
  }, [count]);

  if (count === 0) return null;

  return (
    <button
      ref={buttonRef}
      onClick={onClick}
      className='fixed bottom-8 right-8 bg-blue-600 text-white p-4 rounded-full shadow-lg flex items-center gap-3 hover:bg-blue-700 transition-colors z-30'
    >
      <ShoppingBag className='w-6 h-6' />
      <div>
        <span className='font-bold'>{count} items</span>
        <p className='text-xs text-blue-100'>${total.toFixed(2)}</p>
      </div>
    </button>
  );
};

const Footer = () => {
  const footerRef = useRef(null);

  useEffect(() => {
    const footer = footerRef.current;

    const onScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.body.scrollHeight;

      // Check if user is near the bottom of the page
      if (scrollPosition > documentHeight - windowHeight - 200) {
        gsap.to(footer, {
          y: 0,
          opacity: 1,
          duration: 0.5,
          ease: 'power2.out',
        });
      }
    };

    window.addEventListener('scroll', onScroll);

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <footer
      ref={footerRef}
      className='bg-stone-900 text-white mt-20 py-12 opacity-0 transform translate-y-10'
    >
      <div className='max-w-7xl mx-auto px-4'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-10'>
          <div>
            <h3 className='text-xl font-bold mb-4'>SnapByte</h3>
            <p className='text-gray-400 mb-6'>
              "From hungry to happy in just a few clicks."
            </p>
            <div className='flex space-x-4'>
              <a
                href='#'
                className='text-gray-400 hover:text-white transition-colors'
              >
                <Instagram />
              </a>
              <a
                href='#'
                className='text-gray-400 hover:text-white transition-colors'
              >
                <Facebook />
              </a>
              <a
                href='#'
                className='text-gray-400 hover:text-white transition-colors'
              >
                <Twitter />
              </a>
            </div>
          </div>

          <div>
            <h3 className='text-lg font-semibold mb-4'>Quick Links</h3>
            <ul className='space-y-2'>
              <li>
                <a
                  href='#'
                  className='text-gray-400 hover:text-white transition-colors'
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href='#'
                  className='text-gray-400 hover:text-white transition-colors'
                >
                  Help & Support
                </a>
              </li>
              <li>
                <a
                  href='#'
                  className='text-gray-400 hover:text-white transition-colors'
                >
                  Become a Partner
                </a>
              </li>
              <li>
                <a
                  href='#'
                  className='text-gray-400 hover:text-white transition-colors'
                >
                  Careers
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className='text-lg font-semibold mb-4'>
              Subscribe to Our Newsletter
            </h3>
            <div className='flex'>
              <input
                type='email'
                placeholder='Your email'
                className='bg-stone-800 text-white px-4 py-2 rounded-l-md w-full focus:outline-none'
              />
              <button className='bg-stone-600 px-4 py-2 rounded-r-md hover:bg-stone-700 transition-colors'>
                <Send size={18} />
              </button>
            </div>
            <p className='text-gray-500 text-sm mt-2'>
              Get exclusive offers and updates.
            </p>
          </div>
        </div>

        <div className='border-t border-gray-800 mt-10 pt-6 text-center text-gray-500 text-sm'>
          <p>© {new Date().getFullYear()} FoodFinder. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

const RestaurantHighlight = ({ restaurant }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      containerRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }
    );
  }, []);

  if (!restaurant) return null;

  return (
    <div
      ref={containerRef}
      className='bg-white rounded-lg overflow-hidden shadow-lg mb-12 flex flex-col md:flex-row'
    >
      <div className='w-full md:w-2/5 bg-gray-300 h-64 relative'>
        <div className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6 text-white'>
          <h3 className='text-2xl font-bold'>{restaurant.name}</h3>
          <div className='flex items-center gap-2 text-yellow-300 mt-1'>
            <Star className='fill-current' size={16} />
            <Star className='fill-current' size={16} />
            <Star className='fill-current' size={16} />
            <Star className='fill-current' size={16} />
            <Star className='fill-current text-yellow-300/40' size={16} />
            <span className='text-white text-sm'>(120+ ratings)</span>
          </div>
        </div>
      </div>
      <div className='p-6 flex-1'>
        <div className='flex items-center text-sm text-gray-500 mb-3'>
          <MapPin size={16} className='mr-1' />
          <span>
            {restaurant.address?.street}, {restaurant.postal_code}
          </span>
        </div>
        <p className='text-gray-600 mb-4'>{restaurant.description}</p>
        <div className='flex gap-2 mb-4 flex-wrap'>
          {['Fast Delivery', 'Top Rated', 'Trending'].map((tag) => (
            <span
              key={tag}
              className='bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full'
            >
              {tag}
            </span>
          ))}
        </div>
        <div className='flex justify-end'>
          <button className='bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2'>
            <Coffee size={16} />
            View Menu
          </button>
        </div>
      </div>
    </div>
  );
};

const UserPage = () => {
  const navigate = useNavigate();
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
  const [currentOrder, setCurrentOrder] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [featuredRestaurant, setFeaturedRestaurant] = useState(null);

  // GSAP animation refs
  const pageContentRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    // Apply entrance animations when page loads
    if (pageContentRef.current) {
      gsap.fromTo(
        pageContentRef.current.children,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.15,
          ease: 'power2.out',
        }
      );
    }

    // Subtle animation for the search input
    if (searchRef.current) {
      gsap.fromTo(
        searchRef.current,
        { width: '80%', opacity: 0 },
        {
          width: '100%',
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          delay: 0.3,
        }
      );
    }
  }, [loading]);

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
          const allRestaurants = restaurantsResponse.data;

          // Filter restaurants based on postal code match
          const nearbyRestaurants = allRestaurants.filter(
            (restaurant) =>
              restaurant.postal_code === userData.address.postal_code
          );

          setRestaurants(nearbyRestaurants);

          // Set a featured restaurant
          if (nearbyRestaurants.length > 0) {
            setFeaturedRestaurant(
              nearbyRestaurants[
                Math.floor(Math.random() * nearbyRestaurants.length)
              ]
            );
          }
        } catch (restaurantError) {
          console.error('Error fetching restaurants:', restaurantError);
          setError('Failed to load restaurants. Please try again later.');
        }

        // Check if there's a current order/cart in localStorage
        const storedCart = localStorage.getItem('currentCart');
        const storedOrder = localStorage.getItem('currentOrder');

        if (storedCart && storedOrder) {
          setCart(JSON.parse(storedCart));
          setCurrentOrder(JSON.parse(storedOrder));
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

  const addToCart = async (item) => {
    try {
      if (!currentOrder) {
        // First click - Create new order
        const newOrder = await createOrder(selectedRestaurant._id, [
          { menu_item_id: item._id, quantity: 1 },
        ]);

        // Save the new order details
        setCurrentOrder(newOrder);

        // Add order_item_id to the cart item - This is crucial for future updates
        const orderItemId = newOrder.orderDetails.items[0].order_item_id;

        // Update cart state with the new item
        const newItem = {
          ...item,
          quantity: 1,
          order_item_id: orderItemId,
        };

        setCart([newItem]);

        // Store in localStorage
        localStorage.setItem('currentCart', JSON.stringify([newItem]));
        localStorage.setItem('currentOrder', JSON.stringify(newOrder));
      } else {
        // Check if item already exists in cart
        const existingItem = cart.find((cartItem) => cartItem._id === item._id);

        if (existingItem) {
          // Increase quantity if item already exists
          const response = await addOrderItem(
            currentOrder.orderDetails.order_id,
            item._id,
            1
          );

          // Find the index of the updated item in the response
          const updatedItemIndex = response.items.findIndex(
            (orderItem) => orderItem.menu_item_id === item._id
          );

          // Extract the order_item_id
          const orderItemId = response.items[updatedItemIndex].order_item_id;

          // Update the cart item with the new quantity and order_item_id
          const updatedCart = cart.map((cartItem) =>
            cartItem._id === item._id
              ? {
                  ...cartItem,
                  quantity: cartItem.quantity + 1,
                  order_item_id: orderItemId,
                }
              : cartItem
          );

          setCart(updatedCart);
          localStorage.setItem('currentCart', JSON.stringify(updatedCart));
        } else {
          // Add new item to cart
          const response = await addOrderItem(
            currentOrder.orderDetails.order_id,
            item._id,
            1
          );

          // Find the newly added item in the response
          const newItemIndex = response.items.findIndex(
            (orderItem) => orderItem.menu_item_id === item._id
          );

          // Extract the order_item_id
          const orderItemId = response.items[newItemIndex].order_item_id;

          // Add the new item with the order_item_id
          const newItem = {
            ...item,
            quantity: 1,
            order_item_id: orderItemId,
          };

          const updatedCart = [...cart, newItem];
          setCart(updatedCart);
          localStorage.setItem('currentCart', JSON.stringify(updatedCart));
        }
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      setError('Failed to add item to cart. Please try again.');
    }
  };

  const removeFromCart = (itemId) => {
    const existingItem = cart.find((item) => item._id === itemId);

    if (existingItem && existingItem.quantity > 1) {
      const updatedCart = cart.map((item) =>
        item._id === itemId ? { ...item, quantity: item.quantity - 1 } : item
      );
      setCart(updatedCart);
      localStorage.setItem('currentCart', JSON.stringify(updatedCart));
    } else {
      const updatedCart = cart.filter((item) => item._id !== itemId);
      setCart(updatedCart);
      localStorage.setItem('currentCart', JSON.stringify(updatedCart));
    }
  };

  const handleCartClick = () => {
    if (cart.length > 0) {
      localStorage.setItem('currentCart', JSON.stringify(cart));
      localStorage.setItem('currentOrder', JSON.stringify(currentOrder));
      navigate('/cart');
    } else {
      setIsCartOpen(true);
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
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

  const filteredMenuItems = menuItems.filter((item) => {
    // Apply both search query and category filter
    const matchesSearch = searchQuery
      ? item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    const matchesCategory =
      selectedCategory === 'All'
        ? true
        : item.category.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

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
        cartCount={cart.reduce((total, item) => total + item.quantity, 0)}
        onCartClick={handleCartClick}
      />

      <div className='max-w-7xl mx-auto px-4 py-6' ref={pageContentRef}>
        {/* Welcome Banner */}
        <AnimatedBanner />

        {/* Search Bar with Animation */}
        <div className='relative mb-10' ref={searchRef}>
          <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
            <Search className='w-5 h-5 text-gray-400' />
          </div>
          <input
            type='text'
            className='bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-4 shadow-sm'
            placeholder='Search restaurants or food...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className='flex flex-col'>
          <div className='w-full'>
            {selectedRestaurant ? (
              <div className='border p-10 rounded-2xl bg-white shadow-xl'>
                <div className='flex justify-between items-center mb-4 gap-4'>
                  <h2 className='text-3xl font-bold'>
                    {selectedRestaurant.name}
                  </h2>
                  <button
                    onClick={() => setSelectedRestaurant(null)}
                    className='text-sm text-white bg-black border px-5 py-3 rounded-full cursor-pointer hover:bg-white hover:text-black hover:border-black transition-all duration-300'
                  >
                    Back to restaurants
                  </button>
                </div>
                <p className='text-gray-600 mb-10'>
                  {selectedRestaurant.description}
                </p>

                {/* Category Filter Chips */}
                <FoodCategoryChips
                  onCategorySelect={handleCategorySelect}
                  activeCategory={selectedCategory}
                />

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
                          <div key={category} className='mb-10'>
                            <h3 className='text-xl font-semibold mb-10 border-b pb-2 uppercase'>
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

      {/* Floating Cart Button */}
      <FloatingCartButton
        count={cart.reduce((total, item) => total + item.quantity, 0)}
        onClick={handleCartClick}
        total={cartTotal}
      />

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
                        {item.quantity} × LKR {item.price.toFixed(2)}
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
                  Total: LKR {cartTotal.toFixed(2)}
                </div>
                <div className='flex justify-end'>
                  <button
                    className='bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700'
                    onClick={() => {
                      navigate('/cart');
                      setIsCartOpen(false);
                    }}
                  >
                    Checkout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer with Tagline */}
      <Footer />
    </div>
  );
};

export default UserPage;

import { Star, Clock, ChevronRight } from 'lucide-react';

const RestaurantCard = ({ restaurant, onSelect }) => {
  const isActive = restaurant.is_active;

  const handleSelect = () => {
    if (isActive) {
      onSelect(restaurant);
    }
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-md overflow-hidden transition-shadow ${
        isActive
          ? 'cursor-pointer hover:shadow-lg'
          : 'opacity-50 cursor-not-allowed'
      }`}
      onClick={handleSelect}
    >
      <div className='h-40 bg-gray-300 relative'>
        {restaurant.cover_image ? (
          <img
            src={restaurant.cover_image}
            alt={restaurant.name}
            className='w-full h-full object-cover'
          />
        ) : (
          <div className='w-full h-full bg-gray-300 flex items-center justify-center'>
            <span className='text-gray-500'>No Image</span>
          </div>
        )}
        {isActive ? (
          <span className='absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded'>
            Open
          </span>
        ) : (
          <span className='absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded'>
            Closed
          </span>
        )}
      </div>

      <div className='p-4'>
        <div className='flex justify-between items-start mb-2'>
          <h3 className='text-lg font-bold text-gray-900 truncate'>
            {restaurant.name}
          </h3>
        </div>

        <p className='text-gray-600 text-sm mb-4 line-clamp-2'>
          {restaurant.description}
        </p>

        <div className='flex justify-between items-center'>
          <div className='flex items-center text-sm text-gray-500'>
            <Clock className='h-4 w-4 mr-1' />
            <span>25-35 min</span>
          </div>

          <button
            className={`flex items-center text-sm duration-300 ${
              isActive
                ? 'text-green-600 hover:text-green-800 cursor-pointer'
                : 'text-gray-400 cursor-not-allowed'
            }`}
            disabled={!isActive}
          >
            View Menu <ChevronRight className='h-4 w-4 ml-1' />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RestaurantCard;

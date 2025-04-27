// components/RestaurantCard.jsx
import { Star, Clock, ChevronRight } from 'lucide-react';

const RestaurantCard = ({ restaurant, onSelect }) => {
  return (
    <div
      className='bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow'
      onClick={() => onSelect(restaurant)}
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
        {restaurant.is_active ? (
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
          <div className='flex items-center'>
            <Star className='h-4 w-4 text-yellow-500' fill='#EAB308' />
            <span className='text-sm ml-1'>4.8</span>
          </div>
        </div>

        <p className='text-gray-600 text-sm mb-4 line-clamp-2'>
          {restaurant.description}
        </p>

        <div className='flex justify-between items-center'>
          <div className='flex items-center text-sm text-gray-500'>
            <Clock className='h-4 w-4 mr-1' />
            <span>25-35 min</span>
          </div>

          <button className='text-green-600 flex items-center text-sm hover:text-green-800 duration-300 cursor-pointer'>
            View Menu <ChevronRight className='h-4 w-4 ml-1' />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RestaurantCard;

// components/MenuItemCard.jsx
import { Plus } from 'lucide-react';

const MenuItemCard = ({ item, onAddToCart }) => {
  return (
    <div className='bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 flex'>
      <div className='w-24 h-24 bg-gray-200 flex-shrink-0'>
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className='w-full h-full object-cover'
          />
        ) : (
          <div className='w-full h-full bg-gray-200 flex items-center justify-center'>
            <span className='text-gray-400 text-xs'>No Image</span>
          </div>
        )}
      </div>

      <div className='p-3 flex-1 flex flex-col justify-between'>
        <div>
          <h3 className='font-medium text-gray-900'>{item.name}</h3>
          <p className='text-sm text-gray-500 line-clamp-2'>
            {item.description}
          </p>
        </div>

        <div className='flex justify-between items-center mt-2'>
          <span className='font-semibold'>${item.price.toFixed(2)}</span>

          <button
            className='text-white bg-blue-600 rounded-full p-1 hover:bg-blue-700 transition-colors'
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart();
            }}
            disabled={!item.is_available}
          >
            <Plus className='h-4 w-4' />
          </button>
        </div>
      </div>

      {!item.is_available && (
        <div className='absolute inset-0 bg-gray-200 bg-opacity-50 flex items-center justify-center'>
          <span className='bg-gray-800 text-white px-2 py-1 rounded text-sm'>
            Out of Stock
          </span>
        </div>
      )}
    </div>
  );
};

export default MenuItemCard;

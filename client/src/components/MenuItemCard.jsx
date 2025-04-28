// components/MenuItemCard.jsx
import { Plus } from 'lucide-react';

const MenuItemCard = ({ item, onAddToCart }) => {
  return (
    <div className='bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 flex'>
      <div className='w-40 h-40 bg-gray-200 flex-shrink-0 rounded-lg'>
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
        <div className='flex flex-col gap-1'>
          <h3 className='font-semibold text-gray-900'>{item.name}</h3>
          <p className='font-light text-sm text-gray-600'>{item.description}</p>
        </div>

        <div className='flex justify-between items-center mt-2'>
          <span className='font-semibold'>LKR {item.price.toFixed(2)}</span>

          <button
            className='text-white bg-black rounded-full p-1 hover:bg-green-700 transition-colors'
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

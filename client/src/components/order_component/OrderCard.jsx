import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';

const OrderCard = ({ order }) => {
  const [expanded, setExpanded] = useState(false);

  // Format date
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Map status to badge color
  const getStatusColor = (status) => {
    const statusMap = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'CONFIRMED': 'bg-blue-100 text-blue-800',
      'APPROVED': 'bg-green-100 text-green-800',
      'PREPARED': 'bg-purple-100 text-purple-800',
      'PICKED_UP': 'bg-indigo-100 text-indigo-800',
      'DELIVERED': 'bg-green-100 text-green-800',
      'CANCELLED': 'bg-red-100 text-red-800'
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-bold text-lg">{order.restaurant?.name || "Restaurant"}</h3>
            <p className="text-sm text-gray-500">{formatDate(order.placed_at)}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
            {order.status}
          </span>
        </div>
        
        <div className="mb-3">
          <p className="font-medium">Order #{order.order_id.slice(-8)}</p>
          <p className="text-lg font-bold">${order.total_amount.toFixed(2)}</p>
        </div>
        
        <div className="flex justify-between items-center">
          <Link 
            to={`/orders/${order.order_id}`}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View Details
          </Link>
          
          <button 
            onClick={() => setExpanded(!expanded)}
            className="flex items-center text-gray-500 hover:text-gray-700"
          >
            {expanded ? (
              <>
                <span className="mr-1 text-sm">Hide Items</span>
                <ChevronUp size={16} />
              </>
            ) : (
              <>
                <span className="mr-1 text-sm">Show Items</span>
                <ChevronDown size={16} />
              </>
            )}
          </button>
        </div>

        {expanded && (
          <div className="mt-4 pt-3 border-t border-gray-200">
            <h4 className="font-medium mb-2">Order Items:</h4>
            <ul className="space-y-2">
              {order.items.map((item) => (
                <li key={item.order_item_id} className="flex justify-between text-sm">
                  <span>{item.quantity}x {item.menu_item_name || 'Item'}</span>
                  <span className="font-medium">${item.total_price.toFixed(2)}</span>
                </li>
              ))}
            </ul>
            
            {order.estimated_delivery_time && (
              <div className="mt-3 text-sm">
                <p className="font-medium">Estimated Delivery:</p>
                <p>{formatDate(order.estimated_delivery_time)}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderCard;
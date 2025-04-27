import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { getRestaurantOrders, updateOrderStatus } from '../../util/order-utils';

import { useToast } from '@/components/ui/toast';

const OrdersTab = ({ restaurant }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchOrders = async () => {
      if (!restaurant || !restaurant._id) return;
      
      try {
        setLoading(true);
        const filter = statusFilter !== 'all' ? statusFilter : null;
        const response = await getRestaurantOrders(restaurant._id, filter);
        
        // Check the structure of the response and extract the orders array
        const ordersData = response && response.orders ? response.orders : 
                          Array.isArray(response) ? response : [];
        
        console.log('Orders data received:', ordersData);
        setOrders(ordersData);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
        setError('Failed to load orders. Please try again.');
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [restaurant, statusFilter]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-indigo-100 text-indigo-800';
      case 'preparing':
        return 'bg-purple-100 text-purple-800';
      case 'prepared':
        return 'bg-teal-100 text-teal-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'delivered':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'No date available';
    
    try {
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Date error';
    }
  };

  const handleStatusChange = (value) => {
    setStatusFilter(value);
  };

  const renderOrderItems = (items) => {
    if (!items || !Array.isArray(items)) return <div className="text-sm text-gray-600">No items</div>;
    
    return items.map((item, index) => (
      <div key={index} className="text-sm text-gray-600">
        {item.quantity}x {item.menu_item?.name || 'Unknown Item'}
      </div>
    ));
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      setUpdatingOrderId(orderId);
      
      // Convert status to uppercase as the API expects
      const upperCaseStatus = newStatus.toUpperCase();
      await updateOrderStatus(orderId, upperCaseStatus);
      
      // Update the local state to reflect the change
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === orderId ? { ...order, status: newStatus.toLowerCase() } : order
        )
      );
      
      toast({
        title: "Status Updated",
        description: `Order #${orderId.substring(Math.max(0, orderId.length - 6))} status changed to ${newStatus}`,
        variant: "success",
      });
    } catch (err) {
      console.error('Error updating order status:', err);
      toast({
        title: "Update Failed",
        description: "Failed to update order status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const getAvailableActions = (order) => {
    if (!order || !order.status) return [];
    
    // Make sure we're working with lowercase status throughout the component
    const status = order.status.toLowerCase();
    
    switch (status) {
      case 'confirmed':
        return [{ label: 'Approve Order', status: 'approved' }];
      case 'approved':
        return [{ label: 'Mark as Prepared', status: 'prepared' }];
      case 'preparing':
        return [{ label: 'Mark as Prepared', status: 'prepared' }];
      // Removed 'prepared' case that had 'Mark as Ready' action
      case 'pending':
      case 'prepared': // Now 'prepared' is the final state with no further actions
      case 'ready':
      case 'delivered':
      case 'cancelled':
        return [];
      default:
        return [];
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
        <span className="ml-2">Loading orders...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
        <button 
          onClick={() => {
            setStatusFilter('all');
            setLoading(true);
          }}
          className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Ensure orders is always an array before mapping
  const ordersList = Array.isArray(orders) ? orders : [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Restaurant Orders</h2>
        <div className="w-48">
          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="prepared">Prepared</SelectItem>
              {/* Removed "Ready" status from the filter dropdown */}
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {ordersList.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No orders found.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {ordersList.map((order) => (
            <Card key={order._id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-4 border-b">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">
                      Order #{order._id ? order._id.substring(Math.max(0, order._id.length - 6)) : 'N/A'}
                    </h3>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1).toLowerCase() : 'Unknown'}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDateTime(order.created_at)}
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50">
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-700">Items:</p>
                    {renderOrderItems(order.items)}
                  </div>
                  
                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200">
                    <span className="font-medium">Total:</span>
                    <span className="font-bold">${(order.total_amount || 0).toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="p-4 bg-white border-t border-gray-200">
                  <div className="text-sm mb-3">
                    <div><span className="font-medium">Customer:</span> {order.user?.name || 'Anonymous'}</div>
                    {order.postal_code && <div><span className="font-medium">Postal code:</span> {order.postal_code}</div>}
                  </div>
                  
                  {/* Action buttons based on order status */}
                  <div className="flex flex-col space-y-2 mt-2">
                    {getAvailableActions(order).map((action, index) => (
                      <Button 
                        key={index}
                        onClick={() => handleUpdateStatus(order._id, action.status)}
                        disabled={updatingOrderId === order._id}
                        variant="outline"
                        className="w-full"
                      >
                        {updatingOrderId === order._id ? (
                          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...</>
                        ) : (
                          action.label
                        )}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersTab;
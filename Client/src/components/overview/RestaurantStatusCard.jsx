import { useState } from 'react';
import { restaurantService } from '../../util/axiosInstances'; // adjust path as needed
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const RestaurantStatusCard = ({ restaurant: initialRestaurant }) => {
  const [restaurant, setRestaurant] = useState(initialRestaurant);
  const [loading, setLoading] = useState(false);

  const toggleRestaurantStatus = async () => {
    setLoading(true);
    try {
      const response = await restaurantService.put(
        `/restaurant/${restaurant._id}`,
        {
          is_active: !restaurant.is_active,
        }
      );

      setRestaurant(response.data);
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className='shadow-sm'>
      <CardHeader className='flex flex-row items-center justify-between pb-2'>
        <div>
          <CardTitle>Restaurant Status</CardTitle>
          <CardDescription>
            Current restaurant visibility to customers
          </CardDescription>
        </div>
        <Badge
          variant={restaurant.is_active ? 'success' : 'destructive'}
          className={
            restaurant.is_active
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }
        >
          {restaurant.is_active ? 'OPEN' : 'CLOSED'}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className='text-sm text-gray-500 mb-4'>
          {restaurant.is_active
            ? 'Your restaurant is currently visible to customers and accepting orders.'
            : 'Your restaurant is currently hidden from customers and not accepting orders.'}
        </div>
        <Button
          variant={restaurant.is_active ? 'outline' : 'default'}
          onClick={toggleRestaurantStatus}
          disabled={loading}
        >
          {restaurant.is_active ? 'Set as Closed' : 'Open Restaurant'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default RestaurantStatusCard;

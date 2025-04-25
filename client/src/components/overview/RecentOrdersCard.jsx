// tabs/overview/RecentOrdersCard.jsx
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const RecentOrdersCard = ({ orders }) => {
  return (
    <Card className='shadow-sm'>
      <CardHeader className='pb-2'>
        <div className='flex justify-between items-center'>
          <div>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Orders from the last 24 hours</CardDescription>
          </div>
          <Button variant='ghost' size='sm' className='gap-1'>
            See All <ChevronRight className='h-4 w-4' />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className='space-y-2'>
          {orders.map((order) => (
            <div
              key={order.id}
              className='flex items-center justify-between p-3 bg-gray-50 rounded-md'
            >
              <div className='flex flex-col'>
                <div className='flex items-center gap-2'>
                  <span className='font-medium'>#{order.id}</span>
                  <span className='text-sm text-gray-500'>
                    {order.customer}
                  </span>
                </div>
                <div className='text-sm text-gray-500'>
                  {order.items} items · ${order.total.toFixed(2)}
                </div>
              </div>
              <div className='flex items-center gap-4'>
                <Badge
                  variant={
                    order.status === 'preparing'
                      ? 'outline'
                      : order.status === 'ready'
                      ? 'secondary'
                      : 'default'
                  }
                  className='capitalize'
                >
                  {order.status}
                </Badge>
                <span className='text-xs text-gray-400'>{order.time}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentOrdersCard;

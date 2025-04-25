// tabs/overview/QuickActionsCard.jsx
import { ShoppingBag, Settings, LineChart, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const QuickActionsCard = () => {
  return (
    <Card className='shadow-sm'>
      <CardHeader className='pb-2'>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Manage your restaurant</CardDescription>
      </CardHeader>
      <CardContent className='grid grid-cols-2 gap-4'>
        <Button variant='outline' className='flex justify-start gap-2'>
          <ShoppingBag className='h-4 w-4' />
          <span>Add Menu Item</span>
        </Button>
        <Button variant='outline' className='flex justify-start gap-2'>
          <Settings className='h-4 w-4' />
          <span>Restaurant Settings</span>
        </Button>
        <Button variant='outline' className='flex justify-start gap-2'>
          <LineChart className='h-4 w-4' />
          <span>View Reports</span>
        </Button>
        <Button variant='outline' className='flex justify-start gap-2'>
          <Users className='h-4 w-4' />
          <span>Manage Staff</span>
        </Button>
      </CardContent>
    </Card>
  );
};

export default QuickActionsCard;

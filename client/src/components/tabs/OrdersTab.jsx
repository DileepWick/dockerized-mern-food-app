// tabs/OrdersTab.jsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const OrdersTab = () => {
  return (
    <Card className='shadow-sm'>
      <CardHeader>
        <CardTitle>Order Management</CardTitle>
        <CardDescription>View and manage all your orders</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Order management interface would go here</p>
      </CardContent>
    </Card>
  );
};

export default OrdersTab;

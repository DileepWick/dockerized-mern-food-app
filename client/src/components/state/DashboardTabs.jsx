import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OverviewTab from '../tabs/OverviewTab';
import OrdersTab from '../tabs/OrdersTab';
import MenuTab from '../tabs/MenuTab';
import SettingsTab from '../tabs/SettingsTab';
import { ToastProvider, Toaster } from '@/components/ui/toast';

const DashboardTabs = ({ restaurant, mockOrders }) => {
  return (
    <ToastProvider>
      <Toaster />
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <Tabs defaultValue='overview' className='!h-20 w-full'>
          <TabsList className='mb-6 w-full'>
            <TabsTrigger value='overview'>Overview</TabsTrigger>
            <TabsTrigger value='orders'>Orders</TabsTrigger>
            <TabsTrigger value='menu'>Menu</TabsTrigger>
            <TabsTrigger value='settings'>Settings</TabsTrigger>
          </TabsList>

          <TabsContent value='overview'>
            <OverviewTab restaurant={restaurant} orders={mockOrders} />
          </TabsContent>

          <TabsContent value='orders'>
            <OrdersTab restaurant={restaurant} />
          </TabsContent>

          <TabsContent value='menu'>
            <MenuTab restaurantId={restaurant._id} />
          </TabsContent>

          <TabsContent value='settings'>
            <SettingsTab restaurant={restaurant} />
          </TabsContent>
        </Tabs>
      </div>
    </ToastProvider>
  );
};

export default DashboardTabs;
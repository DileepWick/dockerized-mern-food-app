// DashboardTabs.jsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OverviewTab from '../tabs/OverviewTab';
import OrdersTab from '../tabs/OrdersTab';
import MenuTab from '../tabs/MenuTab';
import SettingsTab from '../tabs/SettingsTab';

const DashboardTabs = ({ restaurant, mockOrders }) => {
  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      <Tabs defaultValue='overview' className='w-full'>
        <TabsList className='mb-6'>
          <TabsTrigger value='overview'>Overview</TabsTrigger>
          <TabsTrigger value='orders'>Orders</TabsTrigger>
          <TabsTrigger value='menu'>Menu</TabsTrigger>
          <TabsTrigger value='settings'>Settings</TabsTrigger>
        </TabsList>

        <TabsContent value='overview'>
          <OverviewTab restaurant={restaurant} orders={mockOrders} />
        </TabsContent>

        <TabsContent value='orders'>
          <OrdersTab />
        </TabsContent>

        <TabsContent value='menu'>
          <MenuTab />
        </TabsContent>

        <TabsContent value='settings'>
          <SettingsTab restaurant={restaurant} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardTabs;

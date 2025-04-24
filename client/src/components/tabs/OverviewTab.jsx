// tabs/OverviewTab.jsx
import RestaurantStatusCard from '../overview/RestaurantStatusCard';
import QuickActionsCard from '../overview/QuickActionsCard';
import RecentOrdersCard from '../overview/RecentOrdersCard';

const OverviewTab = ({ restaurant, orders }) => {
  return (
    <div className='space-y-6'>
      {/* Restaurant Status and Quick Actions */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <RestaurantStatusCard restaurant={restaurant} />
        <QuickActionsCard />
      </div>

      {/* Recent Orders */}
      <RecentOrdersCard orders={orders} />
    </div>
  );
};

export default OverviewTab;

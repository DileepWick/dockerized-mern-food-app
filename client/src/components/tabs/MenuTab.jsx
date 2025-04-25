import { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Loader2, Plus } from 'lucide-react';
import MenuItemForm from './MenuItemForm';
import MenuItemList from './MenuItemList';
import EditMenuItemModal from './EditMenuItemModal';
import { menuService } from '../../util/service-gateways';

const MenuTab = ({ restaurantId }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('list');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);

  useEffect(() => {
    fetchMenuItems();
  }, [restaurantId]);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const res = await menuService.get(
        `menu-items/restaurant/${restaurantId}`
      );
      setMenuItems(res.data);
      setError('');
    } catch (err) {
      console.error('Failed to fetch menu items:', err);
      setError('Failed to load menu items. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleItemAdded = (newItem) => {
    setMenuItems((prev) => [...prev, newItem]);
    setActiveTab('list');
  };

  const handleItemUpdated = (updatedItem) => {
    setMenuItems((prev) =>
      prev.map((item) => (item._id === updatedItem._id ? updatedItem : item))
    );
    setItemToEdit(null);
    setEditModalOpen(false);
  };

  const handleItemDeleted = (itemId) => {
    setMenuItems((prev) => prev.filter((item) => item._id !== itemId));
  };

  const handleEditItem = (item) => {
    setItemToEdit(item);
    setEditModalOpen(true);
  };

  const handleAddNewClick = () => {
    setActiveTab('add');
  };

  return (
    <Card className='shadow-md border-0'>
      <CardHeader className='bg-gray-50 rounded-t-lg'>
        <div className='flex justify-between items-center'>
          <div>
            <CardTitle className='text-xl font-semibold'>
              Menu Management
            </CardTitle>
            <CardDescription>
              Add, edit, and manage your restaurant menu items
            </CardDescription>
          </div>
          {activeTab === 'list' && (
            <Button
              onClick={handleAddNewClick}
              className='bg-black hover:bg-gray-800'
            >
              <Plus className='h-4 w-4 mr-2' />
              Add New Item
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className='pt-6'>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className='mb-6 hidden'>
            <TabsTrigger value='list'>Menu Items</TabsTrigger>
            <TabsTrigger value='add'>Add New Item</TabsTrigger>
          </TabsList>

          <TabsContent value='list'>
            {loading ? (
              <div className='flex justify-center my-8'>
                <Loader2 className='h-8 w-8 animate-spin text-gray-500' />
              </div>
            ) : error ? (
              <div className='text-red-500 text-center my-8'>{error}</div>
            ) : (
              <MenuItemList
                menuItems={menuItems}
                onEditItem={handleEditItem}
                onDeleteItem={handleItemDeleted}
                restaurantId={restaurantId}
              />
            )}
          </TabsContent>

          <TabsContent value='add'>
            <MenuItemForm
              restaurantId={restaurantId}
              onItemAdded={handleItemAdded}
              onCancel={() => setActiveTab('list')}
            />
          </TabsContent>
        </Tabs>
      </CardContent>

      <EditMenuItemModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        menuItem={itemToEdit}
        restaurantId={restaurantId}
        onItemUpdated={handleItemUpdated}
      />
    </Card>
  );
};

export default MenuTab;

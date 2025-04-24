// tabs/SettingsTab.jsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { restaurantService } from '../../util/service-gateways';

const SettingsTab = ({ restaurant }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: restaurant.name || '',
    description: restaurant.description || '',
    is_active: restaurant.is_active !== undefined ? restaurant.is_active : true,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleToggleChange = (e) => {
    const { name, checked } = e.target;
    setFormData({ ...formData, [name]: checked });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await restaurantService.put(`restaurant/${restaurant._id}`, formData);
      // Handle success - could add toast notification here
    } catch (error) {
      console.error('Failed to update restaurant:', error);
      // Handle error - could add error notification here
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className='shadow-sm'>
      <CardHeader>
        <CardTitle>Restaurant Settings</CardTitle>
        <CardDescription>Update your restaurant details</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* Basic Information */}
          <div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Restaurant Name
                </label>
                <input
                  type='text'
                  name='name'
                  className='w-full border border-gray-300 rounded-md p-2'
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Restaurant ID
                </label>
                <input
                  type='text'
                  className='w-full border border-gray-300 rounded-md p-2 bg-gray-50'
                  value={restaurant._id}
                  disabled
                />
              </div>
            </div>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Description
            </label>
            <textarea
              name='description'
              className='w-full border border-gray-300 rounded-md p-2 h-24'
              value={formData.description}
              onChange={handleInputChange}
            />
          </div>

          <div className='pt-4'>
            <Button type='submit' disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default SettingsTab;

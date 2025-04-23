// tabs/SettingsTab.jsx
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const SettingsTab = ({ restaurant }) => {
  return (
    <Card className='shadow-sm'>
      <CardHeader>
        <CardTitle>Restaurant Settings</CardTitle>
        <CardDescription>
          Update your restaurant details, hours, and preferences
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          <div>
            <h3 className='text-lg font-medium'>Basic Information</h3>
            <p className='text-sm text-gray-500 mb-4'>
              Update your restaurant&apos;s basic details
            </p>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Restaurant Name
                </label>
                <input
                  type='text'
                  className='w-full border border-gray-300 rounded-md p-2'
                  defaultValue={restaurant.name}
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Restaurant ID
                </label>
                <input
                  type='text'
                  className='w-full border border-gray-300 rounded-md p-2 bg-gray-50'
                  defaultValue={restaurant._id}
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
              className='w-full border border-gray-300 rounded-md p-2 h-24'
              defaultValue={restaurant.description}
            />
          </div>

          <div className='pt-4'>
            <Button>Save Changes</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SettingsTab;

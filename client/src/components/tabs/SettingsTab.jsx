import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2, ImagePlus } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { restaurantService } from '../../util/service-gateways';

const SettingsTab = ({ restaurant }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [formData, setFormData] = useState({
    name: restaurant.name || '',
    description: restaurant.description || '',
    is_active: restaurant.is_active !== undefined ? restaurant.is_active : true,
    cover_image: restaurant.cover_image || '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleToggleChange = (e) => {
    const { name, checked } = e.target;
    setFormData({ ...formData, [name]: checked });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    try {
      // Get Cloudinary signature from the backend
      const res = await restaurantService.get(
        'restaurant/cloudinary/signature'
      );
      const { timestamp, signature, apiKey, cloudName, folder } = res.data;

      // Create form data for Cloudinary upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp);
      formData.append('signature', signature);
      formData.append('folder', folder);

      // Upload image to Cloudinary
      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: 'POST', body: formData }
      );

      const data = await uploadRes.json();
      if (!data.secure_url) throw new Error('Image upload failed');

      // Update form data with the new image URL
      setFormData((prev) => ({ ...prev, cover_image: data.secure_url }));
    } catch (err) {
      console.error('Image upload failed:', err);
      setUploadError('Image upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
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

          {/* Cover Image Section */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Cover Image
            </label>
            <div className='flex flex-col sm:flex-row gap-4'>
              {/* Current Image Preview */}
              {formData.cover_image && (
                <div className='relative'>
                  <img
                    src={formData.cover_image}
                    alt='Restaurant cover'
                    className='w-full sm:w-40 h-32 object-cover rounded-md border'
                  />
                </div>
              )}

              {/* Upload Button */}
              <div className='flex items-center'>
                <div className='relative'>
                  <input
                    id='coverImage'
                    type='file'
                    accept='image/*'
                    onChange={handleImageUpload}
                    className='absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10'
                    disabled={uploading}
                  />
                  <Button
                    type='button'
                    variant='outline'
                    className='relative flex items-center gap-2'
                    disabled={uploading}
                  >
                    {uploading ? (
                      <>
                        <Loader2 className='h-4 w-4 animate-spin' />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <ImagePlus className='h-4 w-4' />
                        <span>
                          {formData.cover_image
                            ? 'Change Image'
                            : 'Upload Image'}
                        </span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {uploadError && (
              <p className='text-sm text-red-500 mt-2'>{uploadError}</p>
            )}

            <p className='text-xs text-gray-500 mt-2'>
              Upload an attractive image of your restaurant (recommended size:
              1280x720)
            </p>
          </div>

          <Separator className='my-4' />

          {/* Active Status Toggle */}
          <div className='flex items-center space-x-2 hidden'>
            <input
              type='checkbox'
              id='is_active'
              name='is_active'
              checked={formData.is_active}
              onChange={handleToggleChange}
              className='h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500'
            />
            <label htmlFor='is_active' className='text-sm text-gray-700'>
              Make restaurant active and visible to customers
            </label>
          </div>

          <div className='pt-4'>
            <Button
              type='submit'
              disabled={isLoading || uploading}
              className='bg-black hover:bg-gray-800 text-white'
            >
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

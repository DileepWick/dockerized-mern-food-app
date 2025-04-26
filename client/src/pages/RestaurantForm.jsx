import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { restaurantService } from '../util/service-gateways';
import { getLoggedInUser } from '../util/auth-utils';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Loader2, ImagePlus } from 'lucide-react';

export default function RestaurantForm({ className, ...props }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [coverImage, setCoverImage] = useState('');
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkRestaurant = async () => {
      try {
        const userData = await getLoggedInUser();
        if (!userData) {
          navigate('/login');
          return;
        }

        const restaurantResponse = await restaurantService.get(
          `/restaurant/owner/${userData._id}`
        );

        if (restaurantResponse.data) {
          // Restaurant exists → redirect
          navigate('/sellerDashboard');
        }
      } catch (err) {
        if (err.response && err.response.status === 404) {
          // No restaurant found → stay on the form
          return;
        }
        console.error('Error checking restaurant:', err);
        setError('Failed to check restaurant. Please try again later.');
      }
    };

    checkRestaurant();
  }, [navigate]);

  // Handle image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError(null);

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

      setCoverImage(data.secure_url);
    } catch (err) {
      console.error('Image upload failed:', err);
      setError('Image upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Handle form submission
  const handleCreateRestaurant = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const restaurantData = {
        name,
        description,
        is_active: isActive,
        cover_image: coverImage, // Add the cover image URL
      };

      const response = await restaurantService.post(
        '/restaurant',
        restaurantData,
        {
          withCredentials: true, // Send cookies (token) to backend
        }
      );

      if (response.status === 201) {
        // Redirect to the dashboard after successful creation
        navigate('/sellerDashboard');
      }
    } catch (err) {
      console.error('Error creating restaurant:', err);
      setError(err.response?.data?.message || 'Failed to create restaurant');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={cn(
        'flex w-full min-h-screen justify-center items-center bg-gradient-to-b from-[#ffd9a0] to-white py-6 px-4',
        className
      )}
      {...props}
    >
      <Card className='overflow-hidden p-0 border-2 poppins-regular w-full max-w-7xl'>
        <CardContent className='grid p-0 grid-cols-1 md:grid-cols-2'>
          {/* Image section - hidden on mobile, visible on tablet and above */}
          <div className='hidden md:block m-6 lg:m-10'>
            <div className='bg-[#ffe9c7] h-full w-full rounded-2xl'>
              <p className='relative top-0 left-0 p-5 text-[#b26b00] font-semibold'>
                SnapBite
              </p>
              <div className='items-center flex flex-col'>
                <img
                  src='https://res.cloudinary.com/dpdrfruja/image/upload/v1745311980/66996e14-9ad7-4280-a6f2-b5255a74f801_removalai_preview_idazzs.png'
                  alt='Restaurant setup'
                  className='w-full max-w-[300px] lg:max-w-[400px] relative bottom-[-30px]'
                />
              </div>
            </div>
          </div>

          {/* Small brand display for mobile only */}
          <div className='md:hidden p-6 pb-0'>
            <p className='text-[#b26b00] font-semibold text-xl text-center'>
              SnapBite
            </p>
          </div>

          {/* Form section */}
          <form
            className='px-6 py-6 md:px-10 lg:px-20 md:py-16'
            onSubmit={handleCreateRestaurant}
          >
            <div className='flex flex-col gap-6'>
              <div className='flex flex-col text-left'>
                <h1 className='text-3xl md:text-4xl lg:text-5xl font-bold'>
                  CREATE RESTAURANT
                </h1>
                <p className='text-muted-foreground mt-3 md:mt-5 text-sm md:text-base'>
                  &quot;Let&apos;s get your restaurant up and running with
                  SnapBite!&quot;
                </p>
              </div>

              <div className='grid gap-4'>
                <div className='grid gap-2'>
                  <Label htmlFor='name'>Restaurant Name</Label>
                  <Input
                    id='name'
                    type='text'
                    placeholder='Enter your restaurant name'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className='h-11'
                  />
                </div>
                <div className='grid gap-2'>
                  <Label htmlFor='description'>Description</Label>
                  <Textarea
                    id='description'
                    placeholder='Describe your restaurant'
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    className='min-h-24 w-full'
                  />
                </div>

                {/* Add Cover Image Upload Section */}
                <div className='grid gap-2'>
                  <Label htmlFor='coverImage'>Cover Image</Label>
                  <div className='flex items-center gap-4'>
                    <div className='relative'>
                      <Input
                        id='coverImage'
                        type='file'
                        accept='image/*'
                        onChange={handleImageUpload}
                        className='absolute inset-0 opacity-0 cursor-pointer z-10'
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
                            <span>Upload Image</span>
                          </>
                        )}
                      </Button>
                    </div>

                    {coverImage && (
                      <div className='relative'>
                        <img
                          src={coverImage}
                          alt='Restaurant cover preview'
                          className='w-24 h-24 object-cover rounded-md border'
                        />
                      </div>
                    )}
                  </div>
                  <p className='text-sm text-muted-foreground mt-1'>
                    Upload an attractive image of your restaurant (recommended
                    size: 1280x720)
                  </p>
                </div>

                <div className='flex items-center space-x-2 pt-2'>
                  <Switch
                    id='is-active'
                    checked={isActive}
                    onCheckedChange={setIsActive}
                  />
                  <Label htmlFor='is-active'>Make restaurant active</Label>
                </div>
              </div>

              {error && (
                <div className='rounded-md bg-destructive/15 p-3 text-sm text-destructive'>
                  {error}
                </div>
              )}

              <Button
                type='submit'
                className='w-full h-11'
                disabled={loading || uploading}
              >
                {loading ? (
                  <span className='flex items-center gap-2'>
                    <Loader2 className='h-4 w-4 animate-spin' />
                    Creating...
                  </span>
                ) : (
                  'Create Restaurant'
                )}
              </Button>

              {/* Navigation link - only show on mobile */}
              <div className='text-center text-sm md:hidden'>
                <Button
                  variant='link'
                  className='px-0 font-normal text-amber-700'
                  onClick={() => navigate('/sellerDashboard')}
                >
                  Go to Dashboard
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

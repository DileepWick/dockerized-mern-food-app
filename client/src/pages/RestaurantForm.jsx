import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { restaurantService } from '../util/service-gateways';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';

export default function RestaurantForm({ className, ...props }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
      };

      const response = await restaurantService.post('/', restaurantData, {
        withCredentials: true, // Send cookies (token) to backend
      });

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

              <Button type='submit' className='w-full h-11' disabled={loading}>
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

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { restaurantService, menuService } from '../../util/service-gateways';
import { Loader2, ImagePlus } from 'lucide-react';

const MENU_CATEGORIES = [
  { id: 'appetizers', name: 'Appetizers' },
  { id: 'main_courses', name: 'Main Courses' },
  { id: 'sides', name: 'Side Dishes' },
  { id: 'desserts', name: 'Desserts' },
  { id: 'beverages', name: 'Beverages' },
  { id: 'specials', name: 'Chef Specials' },
  { id: 'breakfast', name: 'Breakfast' },
  { id: 'kids_menu', name: 'Kids Menu' },
];

const EditMenuItemModal = ({
  isOpen,
  onClose,
  menuItem,
  restaurantId,
  onItemUpdated,
}) => {
  const [form, setForm] = useState({
    name: '',
    category: '',
    description: '',
    price: '',
    is_available: true,
    image_url: '',
  });

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (menuItem) {
      setForm({
        name: menuItem.name || '',
        category: menuItem.category || '',
        description: menuItem.description || '',
        price: menuItem.price ? menuItem.price.toString() : '',
        is_available:
          menuItem.is_available !== undefined ? menuItem.is_available : true,
        image_url: menuItem.image_url || '',
      });
    }
  }, [menuItem]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSelectChange = (value) => {
    setForm((prev) => ({
      ...prev,
      category: value,
    }));
  };

  const handleSwitchChange = (checked) => {
    setForm((prev) => ({
      ...prev,
      is_available: checked,
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      const res = await restaurantService.get(
        'restaurant/cloudinary/signature'
      );
      const { timestamp, signature, apiKey, cloudName, folder } = res.data;

      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp);
      formData.append('signature', signature);
      formData.append('folder', folder);

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: 'POST', body: formData }
      );

      const data = await uploadRes.json();
      if (!data.secure_url) throw new Error('Image upload failed');

      setForm((prev) => ({ ...prev, image_url: data.secure_url }));
    } catch (err) {
      console.error('Image upload failed:', err);
      setError('Image upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!menuItem) return;

    setError('');
    setIsSubmitting(true);

    const payload = {
      ...form,
      price: parseFloat(form.price),
      restaurant_id: restaurantId,
    };

    try {
      const res = await menuService.put(`menu-items/${menuItem._id}`, payload);
      console.log('Updated menu item:', res.data);
      onItemUpdated(res.data);
    } catch (err) {
      console.error('Menu item update failed:', err);
      setError(
        'Failed to update menu item. Please check all fields and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Edit Menu Item</DialogTitle>
          <DialogDescription>
            Make changes to your menu item and save when you're done.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4 py-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <Label htmlFor='name' className='text-sm font-medium'>
                Item Name
              </Label>
              <Input
                id='name'
                name='name'
                placeholder='e.g., Margherita Pizza'
                value={form.name}
                onChange={handleChange}
                className='mt-1'
                required
              />
            </div>

            <div>
              <Label htmlFor='category' className='text-sm font-medium'>
                Category
              </Label>
              <Select
                value={form.category}
                onValueChange={handleSelectChange}
                required
              >
                <SelectTrigger className='mt-1'>
                  <SelectValue placeholder='Select a category' />
                </SelectTrigger>
                <SelectContent>
                  {MENU_CATEGORIES.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor='description' className='text-sm font-medium'>
              Description
            </Label>
            <Textarea
              id='description'
              name='description'
              placeholder='Describe your menu item'
              value={form.description}
              onChange={handleChange}
              className='mt-1 resize-none'
              rows={3}
            />
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <Label htmlFor='price' className='text-sm font-medium'>
                Price (LKR)
              </Label>
              <Input
                id='price'
                name='price'
                type='number'
                step='0.01'
                placeholder='0.00'
                value={form.price}
                onChange={handleChange}
                className='mt-1'
                required
                min='0'
              />
            </div>

            <div className='flex items-center justify-between pt-4'>
              <Label htmlFor='is_available' className='text-sm font-medium'>
                Available on menu
              </Label>
              <Switch
                id='is_available'
                checked={form.is_available}
                onCheckedChange={handleSwitchChange}
              />
            </div>
          </div>

          <div>
            <Label htmlFor='image' className='text-sm font-medium block mb-2'>
              Item Image
            </Label>
            <div className='flex items-center gap-4'>
              <div className='relative'>
                <Input
                  id='image'
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

              {form.image_url && (
                <div className='relative'>
                  <img
                    src={form.image_url}
                    alt='Food item preview'
                    className='w-24 h-24 object-cover rounded-md border'
                  />
                </div>
              )}
            </div>
          </div>

          {error && (
            <Alert variant='destructive'>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </form>

        <DialogFooter>
          <Button variant='outline' onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className='bg-black hover:bg-gray-800'
            disabled={isSubmitting || uploading}
          >
            {isSubmitting ? (
              <>
                <Loader2 className='h-4 w-4 animate-spin mr-2' />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditMenuItemModal;

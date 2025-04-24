import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertCircle, Pencil, Trash2, Loader2 } from 'lucide-react';
import { restaurantService } from '../../util/service-gateways';

const CATEGORY_NAMES = {
  appetizers: 'Appetizers',
  main_courses: 'Main Courses',
  sides: 'Side Dishes',
  desserts: 'Desserts',
  beverages: 'Beverages',
  specials: 'Chef Specials',
  breakfast: 'Breakfast',
  kids_menu: 'Kids Menu',
};

const MenuItemList = ({
  menuItems,
  onEditItem,
  onDeleteItem,
  restaurantId,
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
    setDeleteError('');
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;

    setIsDeleting(true);
    setDeleteError('');

    try {
      await restaurantService.delete(
        `restaurant/menu-items/${itemToDelete._id}`
      );
      onDeleteItem(itemToDelete._id);
      setDeleteDialogOpen(false);
    } catch (err) {
      console.error('Failed to delete menu item:', err);
      setDeleteError('Failed to delete menu item. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatPrice = (price) => {
    return `LKR ${parseFloat(price).toFixed(2)}`;
  };

  if (menuItems.length === 0) {
    return (
      <div className='text-center py-10 bg-gray-50 rounded-lg'>
        <h3 className='text-lg font-medium text-gray-800'>
          No menu items found
        </h3>
        <p className='text-gray-600 mt-2'>
          Add your first menu item to get started!
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className='overflow-x-auto'>
        <Table className='w-full'>
          <TableHeader>
            <TableRow>
              <TableHead className='w-12'></TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className='text-right'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {menuItems.map((item) => (
              <TableRow key={item._id}>
                <TableCell>
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className='w-12 h-12 object-cover rounded-md'
                    />
                  ) : (
                    <div className='w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center'>
                      <span className='text-gray-400 text-xs'>No image</span>
                    </div>
                  )}
                </TableCell>
                <TableCell className='font-medium'>
                  <div>
                    <div>{item.name}</div>
                    {item.description && (
                      <div className='text-xs text-gray-500 mt-1 line-clamp-2'>
                        {item.description}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {CATEGORY_NAMES[item.category] || item.category}
                </TableCell>
                <TableCell>{formatPrice(item.price)}</TableCell>
                <TableCell>
                  {item.is_available ? (
                    <Badge className='bg-green-100 text-green-800 hover:bg-green-200'>
                      Available
                    </Badge>
                  ) : (
                    <Badge className='bg-gray-100 text-gray-800 hover:bg-gray-200'>
                      Not Available
                    </Badge>
                  )}
                </TableCell>
                <TableCell className='text-right'>
                  <div className='flex justify-end gap-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => onEditItem(item)}
                      className='h-8 w-8 p-0'
                    >
                      <Pencil className='h-4 w-4' />
                      <span className='sr-only'>Edit</span>
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handleDeleteClick(item)}
                      className='h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50'
                    >
                      <Trash2 className='h-4 w-4' />
                      <span className='sr-only'>Delete</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Menu Item</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{itemToDelete?.name}"? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {deleteError && (
            <div className='bg-red-50 p-3 rounded-md flex items-start gap-2 text-red-800'>
              <AlertCircle className='h-5 w-5 mt-0.5' />
              <p>{deleteError}</p>
            </div>
          )}

          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant='destructive'
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MenuItemList;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  AlertCircle,
  Check,
  X,
  Trash2,
  Shield,
  ShoppingBag,
  Truck,
  User as UserIcon,
  MoreHorizontal,
  RefreshCcw,
} from 'lucide-react';
import {
  fetchAllUsers,
  approveUser,
  deleteUser,
  getLoggedInUser,
  isAuthorized,
} from '../util/auth-utils';

// import { Toaster } from '@/components/ui/sonner';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import LoadingState from '../components/state/LoadingState';
import ErrorState from '../components/state/ErrorState';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Check authorization and load user data
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        const userData = await getLoggedInUser();

        if (!userData) {
          setError('You must be logged in to view this page');
          setLoading(false);
          return;
        }

        if (!isAuthorized(userData, ['admin'])) {
          setError('You are not authorized to access this page');
          setLoading(false);
          return;
        }

        setCurrentUser(userData);
        loadUsers();
      } catch (err) {
        console.error('Authorization error:', err);
        setError('Authorization failed. Please log in again.');
        setLoading(false);
      }
    };

    checkAuth();
  }, [refreshTrigger]);

  // Load all users
  const loadUsers = async () => {
    try {
      const allUsers = await fetchAllUsers();
      setUsers(allUsers);
      setLoading(false);
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Failed to load users. Please try again.');
      setLoading(false);
    }
  };

  // Filter users based on active tab and search query
  useEffect(() => {
    if (!users || users.length === 0) return;

    let filtered = [...users];

    // Filter by role
    if (activeTab === 'sellers') {
      filtered = filtered.filter((user) => user.role === 'seller');
    } else if (activeTab === 'drivers') {
      filtered = filtered.filter((user) => user.role === 'driver');
    } else if (activeTab === 'customers') {
      filtered = filtered.filter((user) => user.role === 'user');
    }

    // Filter by search query
    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.username?.toLowerCase().includes(lowerCaseQuery) ||
          user.email?.toLowerCase().includes(lowerCaseQuery) ||
          `${user.first_name || ''} ${user.last_name || ''}`
            .toLowerCase()
            .includes(lowerCaseQuery)
      );
    }

    setFilteredUsers(filtered);
  }, [users, activeTab, searchQuery]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle tab change
  const handleTabChange = (value) => {
    setActiveTab(value);
  };

  // Handle user verification/approval
  const handleVerifyUser = async (userId, currentStatus) => {
    try {
      await approveUser(userId);

      // Update local state
      setUsers(
        users.map((user) =>
          user._id === userId ? { ...user, is_verified: true } : user
        )
      );

      // Toaster('User approved', {
      //   description: 'User has been verified successfully.',
      // });
    } catch (error) {
      // Toaster('Error', {
      //   description: 'Failed to approve user. Please try again.',
      //   variant: 'destructive',
      // });
    }
  };

  // Handle user deletion
  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;

    try {
      const result = await deleteUser(selectedUser._id);
      if (result) {
        // Toaster('User deleted', {
        //   description: 'User was successfully removed from the system.',
        // });
        window.location.reload(); // <-- Simply reload the page
      } else {
        throw new Error('Failed to delete user');
      }
    } catch (error) {
      // Toaster('Error', {
      //   description: 'Failed to delete user. Please try again.',
      //   variant: 'destructive',
      // });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedUser(null);
    }
  };

  // Refresh data
  const handleRefresh = () => {
    setLoading(true);
    setRefreshTrigger((prev) => prev + 1);
    // Toaster('Refreshing', {
    //   description: 'Updating user data...',
    // });
  };

  // Get counts for dashboard overview
  const getCounts = () => {
    if (!users || users.length === 0)
      return { total: 0, sellers: 0, drivers: 0, customers: 0 };

    return {
      total: users.length,
      sellers: users.filter((user) => user.role === 'seller').length,
      drivers: users.filter((user) => user.role === 'driver').length,
      customers: users.filter((user) => user.role === 'user').length,
      pendingSellers: users.filter(
        (user) => user.role === 'seller' && !user.is_verified
      ).length,
      pendingDrivers: users.filter(
        (user) => user.role === 'driver' && !user.is_verified
      ).length,
    };
  };

  // Loading and error states
  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  const counts = getCounts();

  return (
    <div className='container mx-auto py-6 space-y-8 poppins-regular'>
      <div className='flex justify-between items-center'>
        <h1 className='text-3xl font-bold'>Admin Dashboard</h1>
        <Button
          onClick={handleRefresh}
          variant='outline'
          className='flex items-center gap-2'
        >
          <RefreshCcw className='h-4 w-4' />
          Refresh Data
        </Button>
      </div>

      {/* Dashboard Overview */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Users</CardTitle>
            <Users className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{counts.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Sellers</CardTitle>
            <ShoppingBag className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{counts.sellers}</div>
            {counts.pendingSellers > 0 && (
              <p className='text-xs text-amber-500'>
                {counts.pendingSellers} pending approval
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Drivers</CardTitle>
            <Truck className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{counts.drivers}</div>
            {counts.pendingDrivers > 0 && (
              <p className='text-xs text-amber-500'>
                {counts.pendingDrivers} pending approval
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Customers</CardTitle>
            <UserIcon className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{counts.customers}</div>
          </CardContent>
        </Card>
      </div>

      {/* User Management Section */}
      <Card className='mt-6'>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            Manage all users, sellers, and drivers in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <Input
                placeholder='Search users...'
                value={searchQuery}
                onChange={handleSearchChange}
                className='max-w-sm'
              />
            </div>

            <Tabs
              defaultValue='all'
              value={activeTab}
              onValueChange={handleTabChange}
            >
              <TabsList>
                <TabsTrigger value='all'>All Users</TabsTrigger>
                <TabsTrigger value='sellers'>Sellers</TabsTrigger>
                <TabsTrigger value='drivers'>Drivers</TabsTrigger>
                <TabsTrigger value='customers'>Customers</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className='mt-6'>
                {filteredUsers.length === 0 ? (
                  <div className='text-center py-8 text-muted-foreground'>
                    No users found
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className='text-right'>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user._id}>
                          <TableCell className='font-medium'>
                            {`${user.first_name || ''} ${user.last_name || ''}`}
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                user.role === 'admin'
                                  ? 'destructive'
                                  : user.role === 'seller'
                                  ? 'default'
                                  : user.role === 'driver'
                                  ? 'secondary'
                                  : 'outline'
                              }
                            >
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {user.is_verified ? (
                              <Badge
                                variant='default'
                                className='bg-green-500 text-white hover:bg-green-600'
                              >
                                Verified
                              </Badge>
                            ) : (
                              <Badge
                                variant='outline'
                                className='text-amber-500 border-amber-500'
                              >
                                Pending
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {new Date(user.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className='text-right'>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant='ghost' className='h-8 w-8 p-0'>
                                  <span className='sr-only'>Open menu</span>
                                  <MoreHorizontal className='h-4 w-4' />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align='end'>
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => navigate(`/users/${user._id}`)}
                                >
                                  View Details
                                </DropdownMenuItem>

                                {(user.role === 'seller' ||
                                  user.role === 'driver') &&
                                  !user.is_verified && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleVerifyUser(
                                          user._id,
                                          user.is_verified
                                        )
                                      }
                                    >
                                      Approve User
                                    </DropdownMenuItem>
                                  )}

                                <DropdownMenuItem
                                  onClick={() => handleDeleteClick(user)}
                                  className='text-red-600'
                                >
                                  Delete User
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className='py-4'>
              <p>
                <strong>Name:</strong>{' '}
                {`${selectedUser.first_name || ''} ${
                  selectedUser.last_name || ''
                }`}
              </p>
              <p>
                <strong>Email:</strong> {selectedUser.email}
              </p>
              <p>
                <strong>Role:</strong> {selectedUser.role}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant='destructive' onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;

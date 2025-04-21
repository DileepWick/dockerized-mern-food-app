import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../util/axiosInstance';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, ChevronLeft, ChevronRight } from 'lucide-react';

export function RegisterForm({ className, ...props }) {
  const [formData, setFormData] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    password: '',
    confirmPassword: '',
    street: '',
    city: '',
    postal_code: '',
    role: '', // Added role field
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRoleSelect = (role) => {
    setFormData((prev) => ({
      ...prev,
      role,
    }));
  };

  // Move to next form page
  const handleNext = () => {
    if (currentPage < 3) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Move to previous form page
  const handlePrevious = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Handle form submission
  async function handleRegister(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Password validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Role validation
    if (!formData.role) {
      setError('Please select a role');
      setLoading(false);
      return;
    }

    // Prepare data for API call
    const userData = {
      username: formData.username,
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      phone_number: formData.phone_number,
      password: formData.password,
      role: formData.role,
      address: {
        street: formData.street,
        city: formData.city,
        postal_code: formData.postal_code,
      },
    };

    try {
      const response = await api.post('/auth/register', userData);

      if (response.status === 201) {
        // Redirect to login page
        navigate('/login');
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Registration failed. Please try again.'
      );
      console.log(err);
    } finally {
      setLoading(false);
    }
  }

  // Form pages content
  const formPages = [
    // Page 0: Role selection
    <div className='grid gap-6' key='role-selection'>
      <div className='flex flex-col text-left py-10'>
        <h1 className='text-5xl font-bold text-center'>I WANT TO</h1>
        <p className='text-muted-foreground mt-5 text-center'>
          Select your account type
        </p>
      </div>

      <div className='flex gap-4 my-4'>
        <div
          className={`flex-1 p-6 cursor-pointer flex flex-col items-center justify-center rounded-xl border-2 hover:border-red-600 ${
            formData.role === 'user'
              ? 'border-red-600 bg-[#FFEBE0]'
              : 'border-gray-200'
          }`}
          onClick={() => handleRoleSelect('user')}
        >
          <h3 className='font-bold text-2xl text-center'>EAT</h3>
        </div>

        <div
          className={`flex-1 p-6 cursor-pointer flex flex-col items-center justify-center rounded-xl border-2 hover:border-red-600 ${
            formData.role === 'seller'
              ? 'border-red-600 bg-[#FFEBE0]'
              : 'border-gray-200'
          }`}
          onClick={() => handleRoleSelect('seller')}
        >
          <h3 className='font-bold text-2xl  text-center'>SELL</h3>
        </div>
      </div>
    </div>,

    // Page 1: Account information
    <div className='grid gap-4' key='account-info'>
      <div className='flex flex-col text-left mb-4'>
        <h1 className='text-3xl font-bold'>Account Details</h1>
        <p className='text-muted-foreground mt-2'>
          Create your account credentials
        </p>
      </div>

      <div className='grid gap-4'>
        <div className='grid gap-2'>
          <Label htmlFor='username'>Username</Label>
          <Input
            id='username'
            name='username'
            value={formData.username}
            onChange={handleChange}
            required
            className='h-11'
          />
        </div>
        <div className='grid gap-2'>
          <Label htmlFor='email'>Email</Label>
          <Input
            id='email'
            name='email'
            type='email'
            placeholder='name@example.com'
            value={formData.email}
            onChange={handleChange}
            required
            className='h-11'
          />
        </div>
        <div className='grid gap-2'>
          <div className='flex items-center justify-between'>
            <Label htmlFor='password'>Password</Label>
            <Button
              variant='ghost'
              size='sm'
              className='px-0 font-normal'
              onClick={() => setShowPassword(!showPassword)}
              type='button'
            >
              {showPassword ? 'Hide' : 'Show'}
            </Button>
          </div>
          <div className='relative'>
            <Input
              id='password'
              name='password'
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              required
              className='h-11 pr-10'
            />
            <Button
              type='button'
              variant='ghost'
              size='sm'
              className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </Button>
          </div>
        </div>
        <div className='grid gap-2'>
          <div className='flex items-center justify-between'>
            <Label htmlFor='confirmPassword'>Confirm Password</Label>
            <Button
              variant='ghost'
              size='sm'
              className='px-0 font-normal'
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              type='button'
            >
              {showConfirmPassword ? 'Hide' : 'Show'}
            </Button>
          </div>
          <div className='relative'>
            <Input
              id='confirmPassword'
              name='confirmPassword'
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className='h-11 pr-10'
            />
            <Button
              type='button'
              variant='ghost'
              size='sm'
              className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </Button>
          </div>
        </div>
      </div>
    </div>,

    // Page 2: Personal information
    <div className='grid gap-4' key='personal-info'>
      <div className='flex flex-col text-left mb-4'>
        <h1 className='text-3xl font-bold'>Personal Details</h1>
        <p className='text-muted-foreground mt-2'>Tell us about yourself</p>
      </div>

      <div className='grid grid-cols-2 gap-4'>
        <div className='grid gap-2'>
          <Label htmlFor='first_name'>First Name</Label>
          <Input
            id='first_name'
            name='first_name'
            value={formData.first_name}
            onChange={handleChange}
            required
            className='h-11'
          />
        </div>
        <div className='grid gap-2'>
          <Label htmlFor='last_name'>Last Name</Label>
          <Input
            id='last_name'
            name='last_name'
            value={formData.last_name}
            onChange={handleChange}
            required
            className='h-11'
          />
        </div>
      </div>
      <div className='grid gap-2'>
        <Label htmlFor='phone_number'>Phone Number</Label>
        <Input
          id='phone_number'
          name='phone_number'
          type='tel'
          value={formData.phone_number}
          onChange={handleChange}
          required
          className='h-11'
        />
      </div>
    </div>,

    // Page 3: Address information
    <div className='grid gap-4' key='address-info'>
      <div className='flex flex-col text-left mb-4'>
        <h1 className='text-3xl font-bold'>Address</h1>
        <p className='text-muted-foreground mt-2'>Where are you?</p>
      </div>

      <div className='grid gap-2'>
        <Label htmlFor='street'>Street</Label>
        <Input
          id='street'
          name='street'
          value={formData.street}
          onChange={handleChange}
          className='h-11'
        />
      </div>
      <div className='grid grid-cols-2 gap-4'>
        <div className='grid gap-2'>
          <Label htmlFor='city'>City</Label>
          <Input
            id='city'
            name='city'
            value={formData.city}
            onChange={handleChange}
            className='h-11'
          />
        </div>
        <div className='grid gap-2'>
          <Label htmlFor='postal_code'>Postal Code</Label>
          <Input
            id='postal_code'
            name='postal_code'
            value={formData.postal_code}
            onChange={handleChange}
            className='h-11'
          />
        </div>
      </div>

      <div className='flex items-center space-x-2 my-4'>
        <input
          type='checkbox'
          id='terms'
          className='h-4 w-4 rounded border-gray-300'
          required
        />
        <Label htmlFor='terms' className='text-sm'>
          I agree to the Terms of Service and Privacy Policy
        </Label>
      </div>
    </div>,
  ];

  // Navigation buttons
  const navigationButtons = (
    <div className='flex justify-between mt-6'>
      {currentPage > 0 && (
        <Button
          type='button'
          variant='outline'
          onClick={handlePrevious}
          className='flex w-44 items-center'
        >
          <ChevronLeft className='mr-2 h-4 w-4' /> Back
        </Button>
      )}

      {currentPage < formPages.length - 1 ? (
        <Button
          type='button'
          onClick={handleNext}
          className={`flex w-44 items-center ${
            currentPage === 0 ? 'ml-auto' : ''
          }`}
        >
          Next <ChevronRight className='ml-2 h-4 w-4' />
        </Button>
      ) : (
        <Button type='submit' className='flex items-center' disabled={loading}>
          {loading ? 'Creating account...' : 'Complete Registration'}
        </Button>
      )}
    </div>
  );

  // Progress indicator
  const progressIndicator = (
    <div className='flex justify-center mt-4 mb-6'>
      {[0, 1, 2, 3].map((pageNum) => (
        <div
          key={`progress-${pageNum}`}
          className={`mx-1 h-2 rounded-full ${
            pageNum === currentPage
              ? 'bg-red-600 w-8'
              : pageNum < currentPage
              ? 'bg-red-400 w-6'
              : 'bg-gray-300 w-6'
          }`}
        />
      ))}
    </div>
  );

  return (
    <div
      className={cn(
        'flex items-center h-screen justify-center py-10 items-center bg-gradient-to-b from-[#FFD5BD] to-white',
        className
      )}
      {...props}
    >
      <Card className='overflow-hidden p-0 border-2 poppins-regular w-full max-w-4xl'>
        <CardContent className='grid p-0 md:grid-cols-2'>
          <div className='m-10'>
            <div className='bg-[#FFEBE0] h-full w-full rounded-2xl flex flex-col justify-between'>
              <p className='p-5 text-[#D0530E] font-semibold'>SnapBite</p>
              <div className='p-5'>
                <h2 className='text-2xl font-bold text-[#D0530E]'>
                  {currentPage === 0 && 'Join the SnapBite Community'}
                  {currentPage === 1 && 'Create Your Account'}
                  {currentPage === 2 && 'Tell Us About You'}
                  {currentPage === 3 && 'Almost There!'}
                </h2>
                <p className='mt-2 text-[#D0530E]'>
                  {currentPage === 0 && 'Select your role to get started'}
                  {currentPage === 1 && 'Set up your login credentials'}
                  {currentPage === 2 && 'Help us personalize your experience'}
                  {currentPage === 3 && 'Provide your delivery details'}
                </p>
              </div>
            </div>
          </div>
          <form className='px-10 py-10' onSubmit={handleRegister}>
            {progressIndicator}

            {formPages[currentPage]}

            {error && (
              <div className='rounded-md bg-destructive/15 p-3 text-sm text-destructive mt-4'>
                {error}
              </div>
            )}

            {navigationButtons}

            {currentPage === 1 && (
              <div className='text-center text-sm mt-4'>
                Already have an account?{' '}
                <Button
                  variant='link'
                  className='px-0 font-normal text-red-600'
                  onClick={() => navigate('/login')}
                  type='button'
                >
                  Sign in
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

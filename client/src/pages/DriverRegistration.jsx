import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from "../util/auth-utils";
import { createVehicle } from '@/util/delivery-utils';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, EyeOff, ChevronLeft, ChevronRight } from 'lucide-react';

function DriverRegistrationForm({ className, ...props }) {
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
    state: '',
    postal_code: '',
    country: '',
    vehicleType: 'car',
    licensePlate: ''
  });
  
  const [error, setError] = useState(null);
  const [loading, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registrationState, setRegistrationState] = useState({
    userRegistered: false,
    vehicleRegistered: false
  });
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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
    setIsSubmitting(true);

    // Password validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsSubmitting(false);
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
      role: 'driver',
      address: {
        street: formData.street,
        city: formData.city,
        state: formData.state,
        postal_code: formData.postal_code,
        country: formData.country
      },
    };

    try {
      // Step 1: Register User
      const userResponse = await registerUser(userData);

      if (!userResponse || !userResponse.user || !userResponse.user.id) {
        throw new Error('User registration failed - Invalid response structure');
      }

      const userId = userResponse.user.id;
      setRegistrationState(prev => ({ ...prev, userRegistered: true }));

      // Step 2: Register Vehicle
      const vehicleResponse = await createVehicle(
        userId,
        formData.vehicleType,
        formData.licensePlate
      );

      if (!vehicleResponse) {
        throw new Error('Vehicle registration failed - No response from server');
      }

      setRegistrationState(prev => ({ ...prev, vehicleRegistered: true }));
      setRegistrationSuccess(true);
      navigate('/login');
      
    } catch (err) {
      // Handle case where user was created but vehicle failed
      if (registrationState.userRegistered && !registrationState.vehicleRegistered) {
        setError('Account created but vehicle registration failed. Please visit your profile to complete vehicle registration.');
        setRegistrationSuccess(true); // Still show success but with warning
      } else {
        setError(
          err.message || 'Registration failed. Please try again.'
        );
      }
      console.log(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Form success message
  if (registrationSuccess) {
    return (
      <div className={cn(
        'flex items-center h-screen justify-center py-10 items-center bg-gradient-to-b from-[#BDE4FF] to-white',
        className
      )}>
        <Card className="w-full max-w-md p-6 border-2 border-blue-200">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-blue-700 mb-4">Registration Successful!</h2>
            <p className="text-gray-700 mb-4">Your driver account has been created successfully.</p>
            
            {registrationState.userRegistered && !registrationState.vehicleRegistered && (
              <div className="p-4 bg-yellow-50 border border-yellow-300 rounded-md mb-6">
                <p className="text-yellow-700">We couldn't register your vehicle. Please visit your profile to complete this step.</p>
              </div>
            )}
            
            <Button 
              onClick={() => navigate('/login')}
              className="bg-blue-600 hover:bg-blue-700 text-white w-full"
            >
              Go to Login
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Form pages content
  const formPages = [
    // Page 0: Account information
    <div className='grid gap-4' key='account-info'>
      <div className='flex flex-col text-left mb-4'>
        <h1 className='text-3xl font-bold'>Account Details</h1>
        <p className='text-muted-foreground mt-2'>
          Create your driver account credentials
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

    // Page 1: Personal information
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

    // Page 2: Address information
    <div className='grid gap-4' key='address-info'>
      <div className='flex flex-col text-left mb-4'>
        <h1 className='text-3xl font-bold'>Address</h1>
        <p className='text-muted-foreground mt-2'>Where are you based?</p>
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
          <Label htmlFor='state'>State</Label>
          <Input
            id='state'
            name='state'
            value={formData.state}
            onChange={handleChange}
            className='h-11'
          />
        </div>
      </div>
      <div className='grid grid-cols-2 gap-4'>
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
        <div className='grid gap-2'>
          <Label htmlFor='country'>Country</Label>
          <Input
            id='country'
            name='country'
            value={formData.country}
            onChange={handleChange}
            className='h-11'
          />
        </div>
      </div>
    </div>,

    // Page 3: Vehicle information
    <div className='grid gap-4' key='vehicle-info'>
      <div className='flex flex-col text-left mb-4'>
        <h1 className='text-3xl font-bold'>Vehicle Information</h1>
        <p className='text-muted-foreground mt-2'>Tell us about your vehicle</p>
      </div>

      <div className='grid gap-4'>
        <div className='grid gap-2'>
          <Label htmlFor='vehicleType'>Vehicle Type</Label>
          <Select name='vehicleType' value={formData.vehicleType} onValueChange={(value) => handleSelectChange('vehicleType', value)}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Select vehicle type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="car">Car</SelectItem>
              <SelectItem value="motorcycle">Motorcycle</SelectItem>
              <SelectItem value="van">Van</SelectItem>
              <SelectItem value="truck">Truck</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className='grid gap-2'>
          <Label htmlFor='licensePlate'>License Plate</Label>
          <Input
            id='licensePlate'
            name='licensePlate'
            value={formData.licensePlate}
            onChange={handleChange}
            required
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
          className={`flex w-44 items-center bg-blue-600 hover:bg-blue-700 ${
            currentPage === 0 ? 'ml-auto' : ''
          }`}
        >
          Next <ChevronRight className='ml-2 h-4 w-4' />
        </Button>
      ) : (
        <Button 
          type='submit' 
          className='flex items-center bg-blue-600 hover:bg-blue-700' 
          disabled={loading}
        >
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
              ? 'bg-blue-600 w-8'
              : pageNum < currentPage
              ? 'bg-blue-400 w-6'
              : 'bg-gray-300 w-6'
          }`}
        />
      ))}
    </div>
  );

  return (
    <div
      className={cn(
        'flex items-center h-screen justify-center py-10 items-center bg-gradient-to-b from-[#BDE4FF] to-white',
        className
      )}
      {...props}
    >
      <Card className='overflow-hidden p-0 border-2 border-blue-200 w-full max-w-4xl'>
        <CardContent className='grid p-0 md:grid-cols-2'>
          <div className='m-10'>
            <div className='bg-[#E0F2FF] h-full w-full rounded-2xl flex flex-col justify-between'>
              <p className='p-5 text-blue-700 font-semibold'>SnapBite</p>
              <div className='p-5'>
                <h2 className='text-2xl font-bold text-blue-700'>
                  {currentPage === 0 && 'Create Your Driver Account'}
                  {currentPage === 1 && 'Personal Information'}
                  {currentPage === 2 && 'Location Details'}
                  {currentPage === 3 && 'Vehicle Information'}
                </h2>
                <p className='mt-2 text-blue-700'>
                  {currentPage === 0 && 'Set up your login credentials'}
                  {currentPage === 1 && 'Help us get to know you better'}
                  {currentPage === 2 && 'Where will you be driving from?'}
                  {currentPage === 3 && 'Tell us about your vehicle'}
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

            {currentPage === 0 && (
              <div className='text-center text-sm mt-4'>
                Already have an account?{' '}
                <Button
                  variant='link'
                  className='px-0 font-normal text-blue-600'
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

export default DriverRegistrationForm;
import React, { useState } from 'react';
import { registerUser } from "../util/auth-utils";
import { createVehicle } from '@/util/delivery-utils';

const DriverRegistrationForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    password: '',
    confirmPassword: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    vehicle: {
      vehicleType: 'car',
      licensePlate: ''
    }
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registrationState, setRegistrationState] = useState({
    userRegistered: false,
    vehicleRegistered: false
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    // Basic field validation
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
    
    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please provide a valid email address';
    }
    
    // Phone validation
    if (!formData.phone_number.trim()) {
      newErrors.phone_number = 'Phone number is required';
    } else if (!/^\d{10,15}$/.test(formData.phone_number.replace(/[^\d]/g, ''))) {
      newErrors.phone_number = 'Please provide a valid phone number (10-15 digits)';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }
    
    // Password match validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    // Vehicle validation
    if (!formData.vehicle.licensePlate.trim()) {
      newErrors['vehicle.licensePlate'] = 'License plate is required';
    }
    
    return newErrors;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submission initiated');
    
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      console.log('Form validation errors:', formErrors);
      setErrors(formErrors);
      return;
    }
  
    setErrors({});
    setIsSubmitting(true);
    setRegistrationState({ userRegistered: false, vehicleRegistered: false });
  
    try {
      // Prepare user data
      const userData = {
        username: formData.username,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone_number: formData.phone_number,
        password: formData.password,
        role: 'driver',
        address: formData.address
      };
      
      console.log('Attempting user registration with data:', userData);
  
      // Step 1: Register User
      const userResponse = await registerUser(userData);
      console.log('User registration response:', userResponse);
  
      // Updated response check
      if (!userResponse || !userResponse.user || !userResponse.user.id) {
        console.error('Invalid user response structure:', userResponse);
        throw new Error('User registration failed - Invalid response structure');
      }
  
      const userId = userResponse.user.id;
      setRegistrationState(prev => ({ ...prev, userRegistered: true }));
      console.log('User successfully registered with ID:', userId);
  
      // Step 2: Register Vehicle
      const vehicleData = {
        driver_id: userId,
        vehicle_type: formData.vehicle.vehicleType,
        license_plate: formData.vehicle.licensePlate
      };
      
      console.log('Attempting vehicle registration with data:', vehicleData);
      const vehicleResponse = await createVehicle(
        userId,
        formData.vehicle.vehicleType,
        formData.vehicle.licensePlate
      );
      console.log('Vehicle registration response:', vehicleResponse);
  
      if (!vehicleResponse) {
        throw new Error('Vehicle registration failed - No response from server');
      }
  
      setRegistrationState(prev => ({ ...prev, vehicleRegistered: true }));
      console.log('Vehicle successfully registered');
  
      // Final success
      setRegistrationSuccess(true);
      console.log('Registration process completed successfully');
  
    } catch (error) {
      console.error('Registration process error:', error);
      
      let errorMessage = error.message || 'Registration failed. Please try again.';
  
      // Handle case where user was created but vehicle failed
      if (registrationState.userRegistered && !registrationState.vehicleRegistered) {
        errorMessage = 'Account created but vehicle registration failed. Please visit your profile to complete vehicle registration.';
        console.warn('Partial registration - User created but vehicle failed');
        setRegistrationSuccess(true); // Still show success but with warning
      }
  
      setErrors({ submit: errorMessage });
    } finally {
      setIsSubmitting(false);
      console.log('Submission process completed');
    }
  };
  
  if (registrationSuccess) {
    return (
      <div className="registration-success">
        <h2>Registration Successful!</h2>
        <p>Your driver account has been created successfully.</p>
        {registrationState.userRegistered && !registrationState.vehicleRegistered && (
          <div className="warning-message">
            <p>We couldn't register your vehicle. Please visit your profile to complete this step.</p>
          </div>
        )}
        <button 
          onClick={() => window.location.href = '/login'}
          className="button primary-button"
        >
          Go to Login
        </button>
      </div>
    );
  }
  
  return (
    <div className="registration-form-container">
      <h2>Register as a Driver</h2>
      <form onSubmit={handleSubmit} className="registration-form">
        {errors.submit && (
          <div className="error-message">
            <strong>Error:</strong> {errors.submit}
          </div>
        )}
        
        <div className="form-section">
          <h3>Personal Information</h3>
          <div className="form-group">
            <label htmlFor="username">Username*</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={errors.username ? 'error' : ''}
            />
            {errors.username && <div className="error-message">{errors.username}</div>}
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="first_name">First Name*</label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className={errors.first_name ? 'error' : ''}
              />
              {errors.first_name && <div className="error-message">{errors.first_name}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="last_name">Last Name*</label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className={errors.last_name ? 'error' : ''}
              />
              {errors.last_name && <div className="error-message">{errors.last_name}</div>}
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email*</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <div className="error-message">{errors.email}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="phone_number">Phone Number*</label>
            <input
              type="tel"
              id="phone_number"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              className={errors.phone_number ? 'error' : ''}
              placeholder="10-15 digits without spaces"
            />
            {errors.phone_number && <div className="error-message">{errors.phone_number}</div>}
          </div>
        </div>
        
        <div className="form-section">
          <h3>Security Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Password*</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? 'error' : ''}
              />
              {errors.password && <div className="error-message">{errors.password}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password*</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={errors.confirmPassword ? 'error' : ''}
              />
              {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
            </div>
          </div>
        </div>
        
        <div className="form-section">
          <h3>Address Information</h3>
          <div className="form-group">
            <label htmlFor="address.street">Street Address</label>
            <input
              type="text"
              id="address.street"
              name="address.street"
              value={formData.address.street}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="address.city">City</label>
              <input
                type="text"
                id="address.city"
                name="address.city"
                value={formData.address.city}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="address.state">State</label>
              <input
                type="text"
                id="address.state"
                name="address.state"
                value={formData.address.state}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="address.zipCode">Zip Code</label>
              <input
                type="text"
                id="address.zipCode"
                name="address.zipCode"
                value={formData.address.zipCode}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="address.country">Country</label>
              <input
                type="text"
                id="address.country"
                name="address.country"
                value={formData.address.country}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>
        
        <div className="form-section">
          <h3>Vehicle Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="vehicle.vehicleType">Vehicle Type*</label>
              <select
                id="vehicle.vehicleType"
                name="vehicle.vehicleType"
                value={formData.vehicle.vehicleType}
                onChange={handleChange}
              >
                <option value="car">Car</option>
                <option value="motorcycle">Motorcycle</option>
                <option value="van">Van</option>
                <option value="truck">Truck</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="vehicle.licensePlate">License Plate*</label>
              <input
                type="text"
                id="vehicle.licensePlate"
                name="vehicle.licensePlate"
                value={formData.vehicle.licensePlate}
                onChange={handleChange}
                className={errors['vehicle.licensePlate'] ? 'error' : ''}
              />
              {errors['vehicle.licensePlate'] && (
                <div className="error-message">{errors['vehicle.licensePlate']}</div>
              )}
            </div>
          </div>
        </div>
        
        <div className="form-actions">
          <button 
            type="submit" 
            className="button primary-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner"></span>
                Processing...
              </>
            ) : (
              'Register as Driver'
            )}
          </button>
        </div>
        
        <div className="form-footer">
          <p>Already have an account? <a href="/login">Login here</a></p>
          <p className="required-hint">* indicates required field</p>
        </div>
      </form>
    </div>
  );
};

export default DriverRegistrationForm;
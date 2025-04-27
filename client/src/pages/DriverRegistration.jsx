import React, { useState } from 'react';
import { registerUser } from "../util/auth-utils";

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
    }
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      // Handle nested address fields
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    // Required fields validation
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone_number.trim()) newErrors.phone_number = 'Phone number is required';
    if (!formData.password) newErrors.password = 'Password is required';
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please provide a valid email address';
    }
    
    // Phone validation
    const phoneRegex = /^\d{10,15}$/;
    if (formData.phone_number && !phoneRegex.test(formData.phone_number.replace(/[^\d]/g, ''))) {
      newErrors.phone_number = 'Please provide a valid phone number';
    }
    
    // Password confirmation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    // Password strength
    if (formData.password && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }
    
    return newErrors;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formErrors = validateForm();
    setErrors(formErrors);
    
    if (Object.keys(formErrors).length === 0) {
      try {
        setIsSubmitting(true);
        
        // Prepare data for API call
        const userData = {
          username: formData.username,
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          phone_number: formData.phone_number,
          password: formData.password,
          role: 'driver', // Setting role to driver
          address: formData.address
        };
        
        const result = await registerUser(userData);
        
        setRegistrationSuccess(true);
        // Reset form or redirect based on your app's flow
        console.log('Registration successful', result);
        
      } catch (error) {
        setErrors({ submit: error.message || 'Registration failed' });
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  if (registrationSuccess) {
    return (
      <div className="registration-success">
        <h2>Registration Successful!</h2>
        <p>Your account has been created successfully. You can now sign in to your account.</p>
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
        {errors.submit && <div className="error-message">{errors.submit}</div>}
        
        <div className="form-group">
          <label htmlFor="username">Username</label>
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
            <label htmlFor="first_name">First Name</label>
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
            <label htmlFor="last_name">Last Name</label>
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
          <label htmlFor="email">Email</label>
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
          <label htmlFor="phone_number">Phone Number</label>
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
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="password">Password</label>
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
            <label htmlFor="confirmPassword">Confirm Password</label>
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
        
        <div className="form-actions">
          <button 
            type="submit" 
            className="button primary-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Registering...' : 'Register as Driver'}
          </button>
        </div>
        
        <div className="login-link">
          Already have an account? <a href="/login">Login here</a>
        </div>
      </form>
    </div>
  );
};

export default DriverRegistrationForm;
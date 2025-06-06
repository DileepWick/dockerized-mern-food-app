import { paymentService } from "./service-gateways";

export const createPaymentIntent = async (paymentData) => {
  try {
    console.log('Creating payment intent with data:', paymentData);
    const response = await paymentService.post('/create-payment-intent', paymentData);
    console.log('Payment intent creation response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    // Return a standardized error format
    return { 
      success: false, 
      message: error.response?.data?.message || error.message || 'Failed to create payment intent'
    };
  }
};

export const updatePaymentStatus = async (paymentId, status) => {
  try {
    // Add validation to prevent requests with null payment IDs
    if (!paymentId) {
      console.error('Cannot update payment status: payment ID is missing');
      return { 
        success: false, 
        error: 'Payment ID is required to update status' 
      };
    }
    
    console.log(`Updating payment ${paymentId} to status: ${status}`);
    const response = await paymentService.put(`/${paymentId}/status`, { status });
    console.log('Payment status update response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating payment status:', error);
    return { 
      success: false, 
      error: error.response?.data?.message || error.message || 'Failed to update payment status'
    };
  }
};

export const getPaymentById = async (paymentId) => {
  try {
    if (!paymentId) {
      console.error('Cannot fetch payment: payment ID is missing');
      return { success: false, error: 'Payment ID is required' };
    }
    
    const response = await paymentService.get(`/${paymentId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching payment:', error);
    return { success: false, error: error.response?.data || error.message };
  }
};

export const getCustomerPayments = async (customerId) => {
  try {
    if (!customerId) {
      console.error('Cannot fetch customer payments: customer ID is missing');
      return { success: false, error: 'Customer ID is required' };
    }
    
    const response = await paymentService.get(`/customer/${customerId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching customer payments:', error);
    return { success: false, error: error.response?.data || error.message };
  }
};

export const getOrderPayments = async (orderId) => {
  try {
    if (!orderId) {
      console.error('Cannot fetch order payments: order ID is missing');
      return { success: false, error: 'Order ID is required' };
    }
    
    const response = await paymentService.get(`/order/${orderId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching order payments:', error);
    return { success: false, error: error.response?.data || error.message };
  }
};

export const processRefund = async (paymentId) => {
  try {
    if (!paymentId) {
      console.error('Cannot process refund: payment ID is missing');
      return { success: false, error: 'Payment ID is required for refund' };
    }
    
    const response = await paymentService.post(`/refund/${paymentId}`);
    return response.data;
  } catch (error) {
    console.error('Error processing refund:', error);
    return { success: false, error: error.response?.data || error.message };
  }
};

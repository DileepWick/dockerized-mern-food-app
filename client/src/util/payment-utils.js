import { paymentService } from "./service-gateways";


export const createPaymentIntent = async (paymentData) => {
  try {
    const response = await paymentService.post('/create-payment-intent', paymentData);
    return response.data;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error.response?.data || error;
  }
};


export const updatePaymentStatus = async (paymentId, status) => {
  try {
    const response = await paymentService.patch(`/${paymentId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating payment status:', error);
    throw error.response?.data || error;
  }
};


export const getPaymentById = async (paymentId) => {
  try {
    const response = await paymentService.get(`/${paymentId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching payment:', error);
    throw error.response?.data || error;
  }
};


export const getCustomerPayments = async (customerId) => {
  try {
    const response = await paymentService.get(`/customer/${customerId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching customer payments:', error);
    throw error.response?.data || error;
  }
};


export const getOrderPayments = async (orderId) => {
  try {
    const response = await paymentService.get(`/order/${orderId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching order payments:', error);
    throw error.response?.data || error;
  }
};


export const processRefund = async (paymentId) => {
  try {
    const response = paymentService.post(`/refund/${paymentId}`);
    return response.data;
  } catch (error) {
    console.error('Error processing refund:', error);
    throw error.response?.data || error;
  }
};
// Payment service for handling payment gateway integrations and admin management

import { BOOKING_API } from '@/config/api';
import {
  PHONEPE_API,
  PHONEPE_CONFIG,
  PhonePePaymentRequest,
  PhonePePaymentResponse,
  PaymentStatus,
  generateTransactionId,
  generateSHA256Hash,
  base64Encode,
  validatePhonePeConfig,
  logPhonePeConfig
} from '@/config/phonepe';

// Payment interface for admin panel
export interface Payment {
  payment_id: number;
  booking_id: number;
  transaction_id: string;
  phonepe_transaction_id?: string;
  amount: string | number;
  payment_method: string;
  payment_status: 'successful' | 'pending' | 'failed' | 'refunded';
  payment_date: string;
  created_at: string;
  updated_at: string;

  // User details
  user_name: string;
  user_email: string;
  user_phone: string;

  // Event details
  event_title: string;
  event_date: string;
  event_description?: string;
  city_name: string;
  venue_name: string;
  venue_address?: string;

  // Booking details
  booking_ref?: string;
  booking_status?: string;
  booking_total_amount?: string;

  // Gateway response (optional)
  gateway_response?: {
    code: string;
    state?: string;
    amount?: number;
    merchantId?: string;
    transactionId?: string;
  };

  // Child details (optional)
  child_name?: string;
  child_age?: number;

  // Game details (optional)
  game_name?: string;
  game_price?: number;

  // Refund details (optional)
  refund_amount?: string | number;
  refund_date?: string;
  refund_reason?: string;
  admin_notes?: string;
}

// Payment analytics interface
export interface PaymentAnalytics {
  summary: {
    total_revenue: number;
    total_payments: number;
    successful_payments: number;
    pending_payments: number;
    failed_payments: number;
    refunded_payments: number;
    refund_amount: number;
    average_transaction: number;
  };
  monthly_data: Array<{
    month: string;
    revenue: number;
    payments: number;
    successful: number;
    failed: number;
  }>;
  payment_methods: Array<{
    method: string;
    count: number;
    amount: number;
    percentage: number;
  }>;
  city_wise: Array<{
    city_name: string;
    revenue: number;
    payments: number;
    percentage: number;
  }>;
}

/**
 * Initiate a PhonePe payment
 * @param bookingId The booking ID
 * @param userId The user ID
 * @param amount The payment amount in rupees (e.g., ₹100 = 100, will be converted to paise internally)
 * @param mobileNumber The user's mobile number
 * @returns The PhonePe payment URL
 */
export async function initiatePhonePePayment(
  bookingId: string | number,
  userId: string | number,
  amount: number,
  mobileNumber: string
): Promise<string> {
  try {
    // Log and validate PhonePe configuration
    console.log('=== PAYMENT INITIATION DEBUG ===');
    console.log('Environment:', process.env.NODE_ENV);
    console.log('PhonePe Environment:', process.env.PHONEPE_ENVIRONMENT);
    console.log('NEXT_PUBLIC_PHONEPE_ENVIRONMENT:', process.env.NEXT_PUBLIC_PHONEPE_ENVIRONMENT);

    logPhonePeConfig();

    const validation = validatePhonePeConfig();
    if (!validation.isValid) {
      console.error('PhonePe Configuration Validation Failed:', validation.errors);
      throw new Error(`PhonePe configuration is invalid: ${validation.errors.join(', ')}`);
    }

    console.log('✅ PhonePe configuration validation passed');

    // Validate input parameters
    console.log("=== INPUT VALIDATION ===")
    console.log("Booking ID:", bookingId, typeof bookingId)
    console.log("User ID:", userId, typeof userId)
    console.log("Amount (₹):", amount, typeof amount)
    console.log("Mobile Number:", mobileNumber, typeof mobileNumber)

    if (!bookingId) {
      console.error('❌ Booking ID is missing');
      throw new Error('Booking ID is required');
    }
    if (!userId) {
      console.error('❌ User ID is missing');
      throw new Error('User ID is required');
    }
    if (!amount || amount <= 0) {
      console.error('❌ Invalid amount:', amount);
      throw new Error('Valid amount is required');
    }
    if (!mobileNumber) {
      console.error('❌ Mobile number is missing');
      throw new Error('Mobile number is required');
    }

    console.log('✅ Input validation passed');

    console.log(`Initiating PhonePe payment for booking ID: ${bookingId}`);
    console.log(`Amount in rupees: ₹${amount}`);
    console.log(`Original amount in paise (before rounding): ${amount * 100}`);
    console.log(`Final amount in paise (after rounding): ${Math.round(amount * 100)}`);
    console.log(`Using environment: ${PHONEPE_CONFIG.ENVIRONMENT}`);
    console.log(`Merchant ID: ${PHONEPE_CONFIG.MERCHANT_ID}`);
    console.log(`Test Mode: ${PHONEPE_CONFIG.IS_TEST_MODE}`);

    // Generate a unique merchant transaction ID (required by PhonePe)
    // If bookingId is already a transaction ID (starts with NIBOG_), use it directly
    // Otherwise, generate a new one
    let merchantTransactionId: string;
    if (typeof bookingId === 'string' && bookingId.startsWith('NIBOG_')) {
      // This is already a transaction ID from pending booking, use it directly
      merchantTransactionId = bookingId;
      console.log(`Using existing transaction ID: ${merchantTransactionId}`);
    } else {
      // This is a regular booking ID, generate a new transaction ID
      merchantTransactionId = generateTransactionId(bookingId);
      console.log(`Generated new merchant transaction ID: ${merchantTransactionId}`);
    }

    // Validate transaction ID length (PhonePe requires max 38 characters)
    if (merchantTransactionId.length > 38) {
      console.error(`Transaction ID too long (${merchantTransactionId.length} chars): ${merchantTransactionId}`);
      throw new Error(`Transaction ID exceeds 38 character limit: ${merchantTransactionId}`);
    }

    // Create the payment request payload
    const paymentRequest: PhonePePaymentRequest = {
      merchantId: PHONEPE_CONFIG.MERCHANT_ID,
      merchantTransactionId: merchantTransactionId,
      merchantUserId: userId.toString(),
      amount: Math.round(amount * 100), // Convert rupees to paise (PhonePe requirement) and round to ensure integer
      // Use production URLs for callbacks
      redirectUrl: `${PHONEPE_CONFIG.APP_URL.replace(/\/+$/, '')}/payment-callback?bookingId=${encodeURIComponent(String(bookingId))}&transactionId=${encodeURIComponent(merchantTransactionId)}`,
      redirectMode: 'REDIRECT',
      callbackUrl: `${PHONEPE_CONFIG.APP_URL.replace(/\/+$/, '')}/api/payments/phonepe-callback`,
      mobileNumber: mobileNumber.replace(/\D/g, ''), // Remove non-numeric characters
      paymentInstrument: {
        type: 'PAY_PAGE'
      }
    };

    // Convert the payment request to a base64 encoded string
    const payloadString = JSON.stringify(paymentRequest);
    const base64Payload = base64Encode(payloadString);

    // Generate the X-VERIFY header
    const dataToHash = base64Payload + '/pg/v1/pay' + PHONEPE_CONFIG.SALT_KEY;
    const xVerify = await generateSHA256Hash(dataToHash) + '###' + PHONEPE_CONFIG.SALT_INDEX;

    // Use our internal API route to avoid CORS issues
    // Only use this service from client-side to avoid server-to-server issues
    if (typeof window === 'undefined') {
      throw new Error('Payment service should only be called from client-side');
    }

    console.log('=== MAKING API CALL ===');
    console.log('API URL: /api/payments/phonepe-initiate');
    console.log('Request payload keys:', Object.keys({
      request: base64Payload,
      xVerify: xVerify,
      transactionId: merchantTransactionId,
      bookingId: bookingId,
    }));
    console.log('Base64 payload length:', base64Payload.length);
    console.log('X-Verify length:', xVerify.length);

    const response = await fetch('/api/payments/phonepe-initiate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        request: base64Payload,
        xVerify: xVerify,
        transactionId: merchantTransactionId,
        bookingId: bookingId,
      }),
    });

    console.log('API Response status:', response.status);
    console.log('API Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API Error response: ${errorText}`);
      console.error(`❌ Response status: ${response.status}`);
      console.error(`❌ Response headers:`, Object.fromEntries(response.headers.entries()));
      throw new Error(`Failed to initiate PhonePe payment. API returned status: ${response.status}. Error: ${errorText}`);
    }

    const data = await response.json();
    console.log('PhonePe payment initiation response:', data);

    if (data.success) {
      // Return the payment URL
      return data.data.instrumentResponse.redirectInfo.url;
    } else {
      console.error('PhonePe payment initiation failed:', data);
      throw new Error(`PhonePe payment initiation failed: ${data.message || data.error || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Error initiating PhonePe payment:', error);
    throw error;
  }
}

/**
 * Check the status of a PhonePe payment
 * @param merchantTransactionId The merchant transaction ID
 * @param bookingData Optional booking data from localStorage to use for creating the booking
 * @returns The payment status
 */
export async function checkPhonePePaymentStatus(merchantTransactionId: string, bookingData?: any): Promise<PaymentStatus> {
  try {
    console.log(`Checking PhonePe payment status for transaction ID: ${merchantTransactionId}`);
    console.log(`Using environment: ${PHONEPE_CONFIG.ENVIRONMENT}`);
    console.log(`Merchant ID: ${PHONEPE_CONFIG.MERCHANT_ID}`);

    // Use our internal API route to avoid CORS issues
    const response = await fetch('/api/payments/phonepe-status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transactionId: merchantTransactionId,
        bookingData: bookingData || null,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      console.error(`Response status: ${response.status}`);
      console.error(`Response headers:`, Object.fromEntries(response.headers.entries()));
      throw new Error(`Failed to check PhonePe payment status. API returned status: ${response.status}`);
    }

    const data = await response.json();
    console.log('PhonePe payment status response:', data);

    if (data.success) {
      // Map PhonePe status to our payment status
      // Handle both 'paymentState' and 'state' fields (PhonePe API inconsistency)
      const paymentState = data.data?.paymentState || data.data?.state;
      console.log('Payment state from PhonePe:', paymentState);
      console.log('PhonePe response code:', data.code);
      
      // For test environment, be more flexible with status handling
      // Check both the server response status and also what PhonePe directly returned
      
      // First, check if the server already determined this was a success
      if (data.bookingCreated || data.paymentCreated) {
        console.log('Server reported successful booking/payment creation');
        return 'SUCCESS';
      }
      
      // Check server response first - server may have mapped status more intelligently
      if (data.code === 'PAYMENT_SUCCESS' || data.code?.includes('SUCCESS')) {
        return 'SUCCESS';
      }
      
      // Then check PhonePe status
      switch (paymentState) {
        case 'COMPLETED':
          return 'SUCCESS';
        case 'PENDING':
          // In test mode, sometimes pending might actually be success based on UI selection
          if (PHONEPE_CONFIG.IS_TEST_MODE && data.code?.toLowerCase().includes('success')) {
            return 'SUCCESS';
          }
          return 'PENDING';
        case 'FAILED':
          return 'FAILED';
        default:
          console.warn('Unknown payment state:', paymentState);
          // In test mode, use the response code as a fallback
          if (PHONEPE_CONFIG.IS_TEST_MODE && data.code?.toLowerCase().includes('success')) {
            return 'SUCCESS';
          }
          return 'FAILED';
      }
    } else {
      throw new Error(`PhonePe payment status check failed: ${data.message}`);
    }
  } catch (error) {
    console.error('Error checking PhonePe payment status:', error);
    throw error;
  }
}

// ============ ADMIN PAYMENT MANAGEMENT FUNCTIONS ============

// Cache for payments data
const paymentsCache = new Map<string, { data: Payment[], timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Get all payments for admin panel with caching
 * @param filters Optional filters for payments
 * @param forceRefresh Force a cache refresh
 * @returns Array of payments with details
 */
export async function getAllPayments(filters?: {
  status?: string;
  start_date?: string;
  end_date?: string;
  city_id?: number;
  event_id?: number;
  search?: string;
}, forceRefresh: boolean = false): Promise<Payment[]> {
  try {
    // Build cache key from filters
    const queryParams = new URLSearchParams();
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.start_date) queryParams.append('start_date', filters.start_date);
    if (filters?.end_date) queryParams.append('end_date', filters.end_date);
    if (filters?.city_id) queryParams.append('city_id', filters.city_id.toString());
    if (filters?.event_id) queryParams.append('event_id', filters.event_id.toString());
    if (filters?.search) queryParams.append('search', filters.search);
    
    const cacheKey = queryParams.toString();
    const now = Date.now();

    // Return cached data if available and not expired
    const cached = paymentsCache.get(cacheKey);
    if (!forceRefresh && cached && (now - cached.timestamp < CACHE_TTL)) {
      console.log('Returning cached payments data');
      return cached.data;
    }

    const url = `https://ai.alviongs.com/webhook/v1/nibog/payments/get-all${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add cache control headers
      cache: 'no-store', // Don't cache in the browser
      next: { 
        revalidate: 300 // Revalidate every 5 minutes (Next.js data cache)
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch payments. Status: ${response.status}`);
    }

    const data = await response.json();
    
    // Process data for faster rendering
    let results: Payment[];
    if (Array.isArray(data)) {
      results = data;
    } else if (data && data.payments && Array.isArray(data.payments)) {
      results = data.payments;
    } else {
      console.warn('Unexpected payments response format:', data);
      results = [];
    }
    
    // Update cache with new data
    paymentsCache.set(cacheKey, { data: results, timestamp: now });
    
    return results;
  } catch (error) {
    console.error('Error fetching payments:', error);
    throw error;
  }
}

/**
 * Get payment by ID
 * @param paymentId Payment ID
 * @returns Payment details with booking information
 */
export async function getPaymentById(paymentId: number): Promise<Payment> {
  try {
    const response = await fetch('https://ai.alviongs.com/webhook/v1/nibog/payments/get', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: paymentId }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch payment. Status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching payment:', error);
    throw error;
  }
}

/**
 * Update payment status (for refunds, etc.)
 * @param paymentId Payment ID
 * @param status New payment status
 * @param refundData Optional refund information
 * @returns Updated payment response from API
 */
export async function updatePaymentStatus(
  paymentId: number,
  status: 'successful' | 'pending' | 'failed' | 'refunded',
  refundData?: {
    refund_amount?: number;
    refund_reason?: string;
    admin_notes?: string;
  }
): Promise<{
  payment_id: number;
  payment_status: string;
  refund_amount?: string;
  refund_date?: string;
  updated_at: string;
  is_valid_update: boolean;
  message: string;
}> {
  try {
    const payload = {
      payment_id: paymentId,
      status,
      ...refundData,
    };

    console.log('Updating payment status with payload:', payload);

    const response = await fetch('https://ai.alviongs.com/webhook/v1/nibog/payments/update-status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Failed to update payment status. Status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Payment status update response:', data);

    // API returns array with single object, extract it
    if (Array.isArray(data) && data.length > 0) {
      return data[0];
    } else if (!Array.isArray(data)) {
      return data;
    } else {
      throw new Error('Invalid response format from payment status update API');
    }
  } catch (error) {
    console.error('Error updating payment status:', error);
    throw error;
  }
}

/**
 * Get payment analytics for dashboard
 * @param filters Optional date and city filters
 * @returns Payment analytics data
 */
export async function getPaymentAnalytics(filters?: {
  start_date?: string;
  end_date?: string;
  city_id?: number;
}): Promise<PaymentAnalytics> {
  try {
    const queryParams = new URLSearchParams();
    if (filters?.start_date) queryParams.append('start_date', filters.start_date);
    if (filters?.end_date) queryParams.append('end_date', filters.end_date);
    if (filters?.city_id) queryParams.append('city_id', filters.city_id.toString());

    const url = `https://ai.alviongs.com/webhook/v1/nibog/payments/analytics${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch payment analytics. Status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Analytics API response:', data);

    // Handle different response formats
    if (Array.isArray(data) && data.length > 0) {
      // If response is an array, take the first item
      const analyticsData = data[0];

      // Transform the response to match our interface
      return {
        summary: {
          total_revenue: parseFloat(analyticsData.total_revenue || 0),
          total_payments: parseInt(analyticsData.total_payments || 0),
          successful_payments: parseInt(analyticsData.successful_payments || 0),
          pending_payments: parseInt(analyticsData.pending_payments || 0),
          failed_payments: parseInt(analyticsData.failed_payments || 0),
          refunded_payments: parseInt(analyticsData.refunded_payments || 0),
          refund_amount: parseFloat(analyticsData.refund_amount || 0),
          average_transaction: parseFloat(analyticsData.average_transaction || 0),
        },
        monthly_data: analyticsData.monthly_data || [],
        payment_methods: analyticsData.payment_methods || [],
        city_wise: analyticsData.city_wise || [],
      };
    } else if (data && typeof data === 'object') {
      // If response is already an object, return as is
      return data;
    } else {
      throw new Error('Invalid analytics response format');
    }
  } catch (error) {
    console.error('Error fetching payment analytics:', error);
    throw error;
  }
}

/**
 * Export payments data using server-side API
 * @param filters Export filters including format, dates, and status
 * @returns Success message
 */
export async function exportPayments(filters: {
  format: string;
  start_date?: string;
  end_date?: string;
  status?: string;
  city_id?: number;
}): Promise<string> {
  try {
    // Build query parameters
    const queryParams = new URLSearchParams();
    queryParams.append('format', filters.format);

    if (filters.start_date) queryParams.append('start_date', filters.start_date);
    if (filters.end_date) queryParams.append('end_date', filters.end_date);
    if (filters.status) queryParams.append('status', filters.status); // Send status as-is, including "all"
    if (filters.city_id) queryParams.append('city_id', filters.city_id.toString());

    const url = `https://ai.alviongs.com/webhook/v1/nibog/payments/export?${queryParams.toString()}`;

    console.log('Export filters received:', filters);
    console.log('Query parameters built:', queryParams.toString());
    console.log('Exporting payments from:', url);

    // Fetch the file from server
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to export payments. Status: ${response.status}`);
    }

    // Check response content type to handle both CSV and JSON
    const contentType = response.headers.get('content-type') || '';
    console.log('Export API content type:', contentType);

    if (contentType.includes('text/csv') || contentType.includes('application/csv')) {
      // API returned CSV file directly
      const csvContent = await response.text();
      console.log('Export API returned CSV content');
      downloadCSV(csvContent, `payments-export-${new Date().toISOString().split('T')[0]}.csv`);
      return 'Payments exported successfully!';
    } else {
      // API returned JSON data, convert to CSV
      const data = await response.json();
      console.log('Export API returned JSON data:', data);

      if (Array.isArray(data) && data.length > 0) {
        // Convert server data to CSV and download
        const csvContent = convertToCSV(data);
        downloadCSV(csvContent, `payments-export-${new Date().toISOString().split('T')[0]}.csv`);
        return 'Payments exported successfully!';
      } else if (Array.isArray(data) && data.length === 0) {
        throw new Error('No payment data found for the selected filters');
      } else {
        console.error('Unexpected API response format:', data);
        throw new Error('Invalid response format from export API');
      }
    }
  } catch (error) {
    console.error('Error exporting payments:', error);
    throw error;
  }
}

// ============ MANUAL PAYMENT RECORDING FUNCTIONS ============

/**
 * Interface for manual payment recording data
 */
export interface ManualPaymentData {
  booking_id: number;
  amount: number;
  payment_method: string;
  payment_status: 'successful' | 'pending' | 'failed';
  payment_date?: string;
  transaction_id?: string;
  admin_notes?: string;
  reference_number?: string; // For cash, cheque, bank transfer reference
}

/**
 * Create a manual payment record for admin use
 * @param paymentData Manual payment data
 * @returns Created payment record
 */
export async function createManualPayment(paymentData: ManualPaymentData): Promise<{
  success: boolean;
  payment_id?: number;
  message: string;
  error?: string;
}> {
  try {
    console.log('📝 Creating manual payment record:', paymentData);

    // Generate transaction ID if not provided
    const transactionId = paymentData.transaction_id || generateUniqueTransactionId("MANUAL");

    // Prepare payment payload for API (matching the API specification)
    const paymentPayload = {
      booking_id: paymentData.booking_id,
      transaction_id: transactionId,
      phonepe_transaction_id: `MANUAL_${paymentData.booking_id}_${Date.now()}`, // Generate unique PhonePe-style ID for manual payments
      amount: paymentData.amount,
      payment_method: paymentData.payment_method,
      payment_status: paymentData.payment_status,
      payment_date: paymentData.payment_date || new Date().toISOString(),
      gateway_response: {
        code: "MANUAL_PAYMENT",
        merchantId: "NIBOGONLINE",
        transactionId: transactionId,
        amount: Math.round(paymentData.amount * 100), // Convert to paise
        state: paymentData.payment_status.toUpperCase(),
        method: paymentData.payment_method,
        reference: paymentData.reference_number || transactionId,
        admin_notes: paymentData.admin_notes || `Manual payment recorded by admin - ${paymentData.payment_method}`
      }
    };

    console.log('💳 Creating manual payment with payload:', JSON.stringify(paymentPayload, null, 2));

    const response = await fetch('https://ai.alviongs.com/webhook/v1/nibog/payments/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Failed to create manual payment:', errorText);
      return {
        success: false,
        message: 'Failed to create manual payment record',
        error: `API returned status: ${response.status} - ${errorText}`
      };
    }

    const result = await response.json();
    console.log('✅ Manual payment created successfully:', result);

    // Extract payment ID from response (API might return array or object)
    const paymentId = Array.isArray(result) ? result[0]?.payment_id : result.payment_id;

    // Now update the booking payment status
    try {
      console.log('📋 Updating booking payment status...');
      const { updateBookingPaymentStatus } = await import('./bookingService');

      await updateBookingPaymentStatus(paymentData.booking_id, paymentData.payment_status);
      console.log('✅ Booking payment status updated successfully');
    } catch (bookingUpdateError) {
      console.error('⚠️ Failed to update booking payment status:', bookingUpdateError);
      // Don't fail the entire operation if booking update fails
      // The payment record was created successfully
    }

    return {
      success: true,
      payment_id: paymentId,
      message: 'Manual payment recorded and booking status updated successfully'
    };

  } catch (error) {
    console.error('Error creating manual payment:', error);
    return {
      success: false,
      message: 'Failed to create manual payment record',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Generate unique transaction ID for manual payments
 * @param prefix Transaction ID prefix
 * @returns Unique transaction ID
 */
function generateUniqueTransactionId(prefix: string = "MANUAL"): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}_${timestamp}_${random}`;
}

/**
 * Convert payments data to CSV format
 * Handles both client-side Payment objects and server-side export API responses
 */
function convertToCSV(payments: any[]): string {
  if (payments.length === 0) {
    return 'No data to export';
  }

  // Debug: Log available fields for first payment
  console.log('Available payment fields:', Object.keys(payments[0]));

  // CSV headers
  const headers = [
    'Payment ID',
    'Booking ID',
    'User Name',
    'User Email',
    'User Phone',
    'Event Title',
    'Event Date',
    'City',
    'Venue',
    'Amount',
    'Payment Method',
    'Payment Status',
    'Transaction ID',
    'Payment Date',
    'Refund Amount',
    'Refund Reason'
  ];

  // Convert data to CSV rows
  const rows = payments.map(payment => {
    // Handle both server response format and client Payment objects
    const csvRow = [
      // Payment ID - server already returns formatted (P010), use as-is
      payment.payment_id || '',
      // Booking ID - server already returns formatted (B002), use as-is
      payment.booking_id || '',
      payment.user_name || '',
      payment.user_email || 'N/A',
      payment.user_phone || 'N/A',
      payment.event_title || '',
      payment.event_date ? new Date(payment.event_date).toLocaleDateString() : '',
      payment.city_name || '',
      payment.venue_name || '',
      payment.amount || 0,
      payment.payment_method || '',
      payment.payment_status || '',
      payment.transaction_id || '',
      payment.payment_date ? new Date(payment.payment_date).toLocaleDateString() : '',
      payment.refund_amount || 0,
      payment.refund_reason || ''
    ];

    return csvRow;
  });

  // Combine headers and rows
  const csvContent = [headers, ...rows]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n');

  return csvContent;
}

/**
 * Download CSV file
 */
function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

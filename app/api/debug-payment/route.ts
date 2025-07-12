import { NextResponse } from 'next/server';
import { PHONEPE_CONFIG, validatePhonePeConfig, logPhonePeConfig, generateSHA256Hash, base64Encode } from '@/config/phonepe';

export async function POST(request: Request) {
  try {
    console.log('=== PAYMENT DEBUG ENDPOINT ===');
    
    // Parse request body
    const { bookingId, userId, amount, mobileNumber } = await request.json();
    
    console.log('Debug input:', { bookingId, userId, amount, mobileNumber });
    
    // Step 1: Check PhonePe configuration
    console.log('Step 1: Checking PhonePe configuration...');
    logPhonePeConfig();
    
    const validation = validatePhonePeConfig();
    if (!validation.isValid) {
      return NextResponse.json({
        success: false,
        step: 'configuration',
        error: 'PhonePe configuration is invalid',
        details: validation.errors
      });
    }
    
    // Step 2: Generate transaction ID
    console.log('Step 2: Generating transaction ID...');
    const timestamp = new Date().getTime();
    const prefix = 'NIBOG_';
    const merchantTransactionId = `${prefix}${bookingId}_${timestamp}`;
    
    console.log('Generated transaction ID:', merchantTransactionId);
    
    // Step 3: Create payment request payload
    console.log('Step 3: Creating payment request payload...');
    const paymentRequest = {
      merchantId: PHONEPE_CONFIG.MERCHANT_ID,
      merchantTransactionId: merchantTransactionId,
      merchantUserId: userId.toString(),
      amount: Math.round(amount * 100), // Convert to paise
      redirectUrl: `${PHONEPE_CONFIG.APP_URL.replace(/\/+$/, '')}/payment-callback?bookingId=${encodeURIComponent(String(bookingId))}&transactionId=${encodeURIComponent(merchantTransactionId)}`,
      redirectMode: 'REDIRECT',
      callbackUrl: `${PHONEPE_CONFIG.APP_URL.replace(/\/+$/, '')}/api/payments/phonepe-callback`,
      mobileNumber: mobileNumber.replace(/\D/g, ''),
      paymentInstrument: {
        type: 'PAY_PAGE'
      }
    };
    
    console.log('Payment request payload:', paymentRequest);
    
    // Step 4: Convert to base64
    console.log('Step 4: Converting to base64...');
    const payloadString = JSON.stringify(paymentRequest);
    const base64Payload = base64Encode(payloadString);
    
    console.log('Payload string length:', payloadString.length);
    console.log('Base64 payload length:', base64Payload.length);
    
    // Step 5: Generate X-VERIFY
    console.log('Step 5: Generating X-VERIFY...');
    const dataToHash = base64Payload + '/pg/v1/pay' + PHONEPE_CONFIG.SALT_KEY;
    const hash = await generateSHA256Hash(dataToHash);
    const xVerify = hash + '###' + PHONEPE_CONFIG.SALT_INDEX;
    
    console.log('Data to hash length:', dataToHash.length);
    console.log('Generated hash:', hash.substring(0, 20) + '...');
    console.log('X-VERIFY:', xVerify.substring(0, 30) + '...');
    
    // Return debug information
    return NextResponse.json({
      success: true,
      debug: {
        configuration: {
          environment: PHONEPE_CONFIG.ENVIRONMENT,
          merchantId: PHONEPE_CONFIG.MERCHANT_ID,
          saltKeySet: !!PHONEPE_CONFIG.SALT_KEY,
          saltIndex: PHONEPE_CONFIG.SALT_INDEX,
          appUrl: PHONEPE_CONFIG.APP_URL,
          isTestMode: PHONEPE_CONFIG.IS_TEST_MODE
        },
        transactionId: merchantTransactionId,
        paymentRequest: paymentRequest,
        base64PayloadLength: base64Payload.length,
        xVerifyLength: xVerify.length,
        validation: validation
      }
    });
    
  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Payment debug endpoint - use POST with payment data',
    requiredFields: ['bookingId', 'userId', 'amount', 'mobileNumber']
  });
}

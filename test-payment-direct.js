// Test the payment initiation endpoint directly
const crypto = require('crypto');

const testPaymentDirect = async () => {
  try {
    console.log('Testing payment initiation endpoint directly...');
    
    const testData = {
      bookingId: 'TEST_' + Date.now(),
      userId: 'test_user_123',
      amount: 100,
      mobileNumber: '9876543210'
    };
    
    console.log('Test data:', testData);
    
    // Create the payment request payload (same as in the service)
    const merchantTransactionId = `NIBOG_${testData.bookingId}_${Date.now()}`;
    
    const paymentRequest = {
      merchantId: 'M11BWXEAW0AJ',
      merchantTransactionId: merchantTransactionId,
      merchantUserId: testData.userId.toString(),
      amount: Math.round(testData.amount * 100),
      redirectUrl: `https://nibog-latest.vercel.app/payment-callback?bookingId=${encodeURIComponent(String(testData.bookingId))}&transactionId=${encodeURIComponent(merchantTransactionId)}`,
      redirectMode: 'REDIRECT',
      callbackUrl: `https://nibog-latest.vercel.app/api/payments/phonepe-callback`,
      mobileNumber: testData.mobileNumber.replace(/\D/g, ''),
      paymentInstrument: {
        type: 'PAY_PAGE'
      }
    };
    
    console.log('Payment request:', paymentRequest);
    
    // Convert to base64
    const payloadString = JSON.stringify(paymentRequest);
    const base64Payload = Buffer.from(payloadString).toString('base64');
    
    // Generate X-VERIFY
    const saltKey = '63542457-2eb4-4ed4-83f2-da9eaed9fcca';
    const saltIndex = '2';
    const dataToHash = base64Payload + '/pg/v1/pay' + saltKey;
    const hash = crypto.createHash('sha256').update(dataToHash).digest('hex');
    const xVerify = hash + '###' + saltIndex;
    
    console.log('Base64 payload length:', base64Payload.length);
    console.log('X-VERIFY length:', xVerify.length);
    
    // Test the payment initiation API
    const response = await fetch('https://nibog-latest.vercel.app/api/payments/phonepe-initiate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        request: base64Payload,
        xVerify: xVerify,
        transactionId: merchantTransactionId,
        bookingId: testData.bookingId,
      }),
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('Response text:', responseText);
    
    if (response.ok) {
      try {
        const responseData = JSON.parse(responseText);
        console.log('✅ Payment initiation successful!');
        console.log('Response data:', JSON.stringify(responseData, null, 2));
        
        if (responseData.data && responseData.data.instrumentResponse && responseData.data.instrumentResponse.redirectInfo) {
          console.log('✅ Payment URL:', responseData.data.instrumentResponse.redirectInfo.url);
        }
      } catch (parseError) {
        console.error('❌ Failed to parse response as JSON:', parseError);
      }
    } else {
      console.log('❌ Payment initiation failed');
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
};

testPaymentDirect();

// Test the debug endpoint
const testDebugEndpoint = async () => {
  try {
    console.log('Testing debug endpoint...');
    
    const testData = {
      bookingId: 'TEST_' + Date.now(),
      userId: 'test_user_123',
      amount: 100,
      mobileNumber: '9876543210'
    };
    
    console.log('Test data:', testData);
    
    const response = await fetch('https://nibog-latest.vercel.app/api/debug-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });
    
    console.log('Response status:', response.status);
    
    const responseData = await response.json();
    console.log('Response data:', JSON.stringify(responseData, null, 2));
    
  } catch (error) {
    console.error('Test failed:', error);
  }
};

testDebugEndpoint();

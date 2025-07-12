'use client';

import { useState } from 'react';
import { initiatePhonePePayment } from '@/services/paymentService';

export default function TestPaymentPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');

  const testPayment = async () => {
    setIsLoading(true);
    setResult('');
    setError('');

    try {
      console.log('=== TESTING PAYMENT INITIATION ===');
      
      const testData = {
        bookingId: 'TEST_' + Date.now(),
        userId: 'test_user_123',
        amount: 100,
        mobileNumber: '9876543210'
      };

      console.log('Test data:', testData);

      const paymentUrl = await initiatePhonePePayment(
        testData.bookingId,
        testData.userId,
        testData.amount,
        testData.mobileNumber
      );

      console.log('Payment URL received:', paymentUrl);
      setResult(`Success! Payment URL: ${paymentUrl}`);

    } catch (error: any) {
      console.error('Payment test failed:', error);
      setError(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Payment Test Page</h1>
      
      <div className="space-y-4">
        <button
          onClick={testPayment}
          disabled={isLoading}
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? 'Testing...' : 'Test Payment Initiation'}
        </button>

        {result && (
          <div className="p-4 bg-green-100 border border-green-400 rounded">
            <h3 className="font-bold text-green-800">Success:</h3>
            <p className="text-green-700">{result}</p>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-100 border border-red-400 rounded">
            <h3 className="font-bold text-red-800">Error:</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="mt-8 p-4 bg-gray-100 rounded">
          <h3 className="font-bold mb-2">Instructions:</h3>
          <ol className="list-decimal list-inside space-y-1">
            <li>Open browser developer tools (F12)</li>
            <li>Go to Console tab</li>
            <li>Click "Test Payment Initiation" button</li>
            <li>Check console logs for detailed debugging information</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

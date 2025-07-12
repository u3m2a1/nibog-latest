import { NextResponse } from 'next/server';
import { PHONEPE_CONFIG, validatePhonePeConfig, logPhonePeConfig } from '@/config/phonepe';

export async function GET() {
  try {
    console.log('=== PHONEPE CONFIGURATION TEST ===');
    
    // Log the configuration
    logPhonePeConfig();
    
    // Validate the configuration
    const validation = validatePhonePeConfig();
    
    // Return detailed configuration status
    return NextResponse.json({
      success: true,
      environment: PHONEPE_CONFIG.ENVIRONMENT,
      isTestMode: PHONEPE_CONFIG.IS_TEST_MODE,
      merchantId: PHONEPE_CONFIG.MERCHANT_ID ? 'Set' : 'Missing',
      saltKey: PHONEPE_CONFIG.SALT_KEY ? 'Set' : 'Missing',
      saltIndex: PHONEPE_CONFIG.SALT_INDEX ? 'Set' : 'Missing',
      appUrl: PHONEPE_CONFIG.APP_URL,
      validation: validation,
      environmentVariables: {
        NODE_ENV: process.env.NODE_ENV,
        PHONEPE_ENVIRONMENT: process.env.PHONEPE_ENVIRONMENT,
        NEXT_PUBLIC_PHONEPE_ENVIRONMENT: process.env.NEXT_PUBLIC_PHONEPE_ENVIRONMENT,
        VERCEL_ENV: process.env.VERCEL_ENV,
        VERCEL_URL: process.env.VERCEL_URL,
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL
      }
    });
  } catch (error) {
    console.error('PhonePe configuration test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}

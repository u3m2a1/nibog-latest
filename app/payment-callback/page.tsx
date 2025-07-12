"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import { convertBookingRefFormat } from "@/services/bookingService"
import { checkPhonePePaymentStatus } from "@/services/paymentService"
import { sendBookingConfirmationFromClient } from "@/services/emailNotificationService"
import { generateConsistentBookingRef } from "@/utils/bookingReference"

function PaymentCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [isLoading, setIsLoading] = useState(true)
  const [paymentStatus, setPaymentStatus] = useState<'SUCCESS' | 'FAILED' | 'PENDING' | 'CANCELLED' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [bookingRef, setBookingRef] = useState<string | null>(null)
  const [transactionId, setTransactionId] = useState<string | null>(null)
  const [processingBooking, setProcessingBooking] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [isRetrying, setIsRetrying] = useState(false)

  useEffect(() => {
    const checkPaymentStatus = async (currentRetryCount = 0) => {
      try {
        setIsLoading(true)
        if (currentRetryCount > 0) {
          setIsRetrying(true)
        }

        // Get the transaction ID from the URL
        // In the new workflow, bookingId in URL is actually a temp transaction ID
        const txnId = searchParams.get('transactionId')
        const tempId = searchParams.get('bookingId') // This is the temp ID we passed

        if (!txnId || !tempId) {
          throw new Error("Missing transaction ID or temporary ID")
        }

        setTransactionId(txnId)

        // Check the payment status
        console.log(`Checking payment status (attempt ${currentRetryCount + 1})...`)
        
        // Retrieve booking data from localStorage to send to API
        let bookingDataFromStorage = null;
        try {
          const storedData = localStorage.getItem('nibog_booking_data');
          if (storedData) {
            bookingDataFromStorage = JSON.parse(storedData);
            console.log('Retrieved booking data from localStorage for payment verification:', bookingDataFromStorage);
          } else {
            console.warn('No booking data found in localStorage for payment verification');
          }
        } catch (storageError) {
          console.error('Error retrieving booking data from localStorage:', storageError);
        }
        
        // Pass the booking data to the payment status check
        const status = await checkPhonePePaymentStatus(txnId, bookingDataFromStorage)
        console.log(`Payment status received: ${status}`)
        setPaymentStatus(status)

        // Handle different payment statuses
        if (status === 'SUCCESS') {
          console.log('✅ Payment successful - checking if booking was created by server callback')

          try {
            // In the server-first approach, the booking should already be created by the server callback
            // We just need to verify and show success, plus send backup email if needed

            if (txnId) {
              // Get booking data from localStorage and call the payment status API to create the booking
              try {
                console.log(`📋 Getting booking data and creating booking for transaction: ${txnId}`);

                // Retrieve booking data from localStorage
                let bookingDataFromStorage = null;
                try {
                  const storedData = localStorage.getItem('nibog_booking_data');
                  if (storedData) {
                    bookingDataFromStorage = JSON.parse(storedData);
                    console.log('Retrieved booking data from localStorage for booking creation:', bookingDataFromStorage);
                  }
                } catch (error) {
                  console.error('Error retrieving booking data from localStorage:', error);
                }

                const statusResponse = await fetch('/api/payments/phonepe-status', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    transactionId: txnId,
                    bookingData: bookingDataFromStorage,
                  }),
                });

                const statusData = await statusResponse.json();
                console.log('Payment status response:', statusData);
                console.log('Status data bookingCreated:', statusData.bookingCreated);
                console.log('Status data bookingData:', statusData.bookingData);
                console.log('Status data bookingData.booking_ref:', statusData.bookingData?.booking_ref);

                // Extract the actual booking reference from the response
                let actualBookingRef = null;
                if (statusData.bookingCreated && statusData.bookingData && statusData.bookingData.booking_ref) {
                  actualBookingRef = statusData.bookingData.booking_ref;
                  console.log(`📋 Found actual booking reference from database: ${actualBookingRef}`);
                } else {
                  // Fallback: generate consistent booking reference from transaction ID
                  actualBookingRef = generateConsistentBookingRef(txnId);
                  console.log(`📋 Generated fallback booking reference: ${actualBookingRef}`);
                  console.log(`📋 Fallback reason - bookingCreated: ${statusData.bookingCreated}, bookingData exists: ${!!statusData.bookingData}, booking_ref exists: ${!!statusData.bookingData?.booking_ref}`);
                }

                // Update state with the actual booking reference
                setBookingRef(actualBookingRef);
                setTransactionId(txnId);

                // Store the reference for later use
                localStorage.setItem('lastBookingRef', actualBookingRef);

                // Redirect to booking confirmation with the actual booking reference
                router.push(`/booking-confirmation?ref=${encodeURIComponent(actualBookingRef)}`);
                return;
              } catch (error) {
                console.error('Error getting actual booking reference:', error);
                // Fallback to using transaction ID if API call fails
                const bookingRef = txnId;
                setBookingRef(bookingRef);
                setTransactionId(bookingRef);
                localStorage.setItem('lastBookingRef', bookingRef);
                router.push(`/booking-confirmation?ref=${encodeURIComponent(bookingRef)}`);
                return;
              }
            }

            // Retrieve booking data from localStorage
            try {
              console.log('🔍 Retrieving booking data from localStorage...')
              const storedData = localStorage.getItem('nibog_booking_data')
              
              if (storedData) {
                const bookingData = JSON.parse(storedData)
                console.log('✅ Retrieved booking data from localStorage:', JSON.stringify(bookingData, null, 2))
                
                if (bookingRef) {
                  console.log('📧 Preparing to send confirmation email with complete data...');
                  
                  // Use the booking reference from state
                  const emailBookingRef = bookingRef;
                  console.log(`📧 Using booking reference for email: ${emailBookingRef}`);
                  
                  // Store the reference in localStorage for consistency
                  try {
                    localStorage.setItem('lastBookingRef', emailBookingRef);
                  } catch (error) {
                    console.error('Error storing booking reference in localStorage:', error);
                  }
                  
                  // Verify booking exists via API
                  try {
                    const bookingVerifyResponse = await fetch(`/api/booking/verify?bookingRef=${emailBookingRef}`)
                    
                    if (bookingVerifyResponse.ok) {
                      const bookingVerifyData = await bookingVerifyResponse.json()
                      console.log('✅ Booking verification successful:', bookingVerifyData)
                      
                      // Send confirmation email as backup (server should have already sent it)
                      console.log('📧 Sending backup confirmation email from client...');
                      try {
                        await sendBookingConfirmationFromClient({
                          ...bookingData,
                          bookingRef: emailBookingRef
                        })
                        console.log('📧 Backup confirmation email sent successfully from client')
                      } catch (emailError) {
                        console.error('📧 Failed to send backup confirmation email:', emailError)
                        // Don't fail the process if backup email fails
                      }
                      
                      // Update the booking reference in state
                      setBookingRef(emailBookingRef)
                      
                      // Redirect to booking confirmation page after a short delay
                      setTimeout(() => {
                        router.push(`/booking-confirmation?ref=${emailBookingRef}`)
                      }, 2000)
                    } else {
                      console.error('❌ Booking verification failed')
                      setError('Unable to verify your booking. Please contact support.')
                    }
                  } catch (error) {
                    console.error('Error verifying booking:', error)
                    setError('An error occurred while verifying your booking. Please contact support.')
                  }
                } else {
                  console.log('⚠️ No booking ID available for email')
                }
                
                // Clear localStorage after successful payment and email
                try {
                  localStorage.removeItem('nibog_booking_data')
                } catch (error) {
                  console.error('Error clearing booking data from localStorage:', error);
                }
                console.log('🧹 Cleared booking data from localStorage')
              } else {
                console.log('⚠️ No booking data found in localStorage')
                
                // Fall back to minimal email if needed
                if (bookingRef) {
                  console.log('📧 Sending minimal confirmation email...')
                  // Create booking reference in B0000123 format
                  const minimalBookingRef = `B${String(bookingRef).padStart(7, '0')}`;
                  console.log(`📝 Generated minimal booking reference: ${minimalBookingRef}`);
                  
                  const minimalEmailResult = await sendBookingConfirmationFromClient({
                    bookingId: parseInt(bookingRef),
                    bookingRef: minimalBookingRef,
                    parentName: 'Valued Customer',
                    parentEmail: '',
                    childName: '',
                    eventTitle: 'Your Booking',
                    eventDate: 'TBD',
                    eventVenue: 'TBD',
                    totalAmount: 0,
                    paymentMethod: 'PhonePe',
                    transactionId: txnId,
                    gameDetails: [],
                    addOns: []
                  })
                  
                  if (minimalEmailResult.success) {
                    console.log('✅ Minimal confirmation email sent successfully')
                  } else {
                    console.error('❌ Failed to send minimal confirmation email:', minimalEmailResult.error)
                  }
                }
              }
            } catch (emailError) {
              console.error('❌ Error sending confirmation email:', emailError)
              // Don't fail the entire process if email fails
            }

            // Clear any remaining session storage data
            try {
              sessionStorage.removeItem('pendingBookingData')
              sessionStorage.removeItem('registrationData')
              sessionStorage.removeItem('selectedAddOns')
            } catch (error) {
              console.error('Error clearing session storage:', error);
            }

            // Redirect to booking confirmation page
            setTimeout(() => {
              // Try to get the booking reference from verified API data first
              let bookingRefForRedirect = bookingRef;
              
              try {
                // Use the booking reference from state (which should be the correct database reference)
                if (bookingRef) {
                  bookingRefForRedirect = bookingRef;
                  console.log(`Using booking reference from state for redirect: ${bookingRefForRedirect}`);
                } else if (txnId) {
                  // Only use transaction ID as last resort if no booking reference is available
                  console.log(`No booking reference in state, using transaction ID as fallback: ${txnId}`);
                  bookingRefForRedirect = txnId;
                }
              } catch (e) {
                console.error('Error processing booking reference:', e);
              }
              
              // Fallback if we still don't have a booking reference
              if (!bookingRefForRedirect) {
                // If we have a booking reference in state, use that
                if (bookingRef) {
                  bookingRefForRedirect = bookingRef;
                  console.log(`Using booking reference from state for redirect: ${bookingRefForRedirect}`);
                } else {
                  // Last resort: generate a timestamp-based reference
                  const timestamp = Date.now().toString();
                  bookingRefForRedirect = `TEMP${timestamp}`;
                  console.warn(`Generated temporary booking reference: ${bookingRefForRedirect}`);
                }
              }
              
              // Always store the booking reference and ID in localStorage as plain strings (not as JSON)
              // This helps with retrieving booking details if redirect fails
              if (bookingRefForRedirect) {
                console.log(`Storing booking reference in localStorage: ${bookingRefForRedirect}`);
                try {
                  localStorage.setItem('lastBookingRef', bookingRefForRedirect); // Store as plain string, not JSON
                } catch (error) {
                  console.error('Error storing booking reference in localStorage:', error);
                }
                
                // Store the booking reference in localStorage for future reference
                try {
                  localStorage.setItem('lastBookingRef', bookingRefForRedirect);
                } catch (error) {
                  console.error('Error storing booking reference in localStorage:', error);
                }
                
                // Make one final API check to verify the booking exists
                try {
                  fetch('https://ai.alviongs.com/webhook/v1/nibog/tickect/booking_ref/details', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                      booking_ref_id: bookingRefForRedirect
                    })
                  }).then(response => {
                    if (response.ok) {
                      return response.json().then(data => {
                        if (data && data.length > 0) {
                          console.log('✅ Final API check successful - booking found:', data);
                          // Store complete booking data for the confirmation page
                          try {
                            localStorage.setItem('verifiedBookingData', JSON.stringify(data));
                          } catch (error) {
                            console.error('Error storing verified booking data in localStorage:', error);
                          }
                        } else {
                          console.warn('⚠️ Final API check - empty result');
                        }
                      });
                    } else {
                      console.error('❌ Final API check failed:', response.status);
                    }
                  }).catch(error => {
                    console.error('❌ Final API check error:', error);
                  });
                } catch (apiError) {
                  console.error('❌ Exception in final API check:', apiError);
                  // We don't fail the whole process if this check fails
                }
              }
              
              if (bookingRefForRedirect) {
                console.log(`Redirecting to booking confirmation: /booking-confirmation?ref=${bookingRefForRedirect}`);
                router.push(`/booking-confirmation?ref=${bookingRefForRedirect}`);
              } else {
                console.error('No booking reference available for redirect');
                // If all else fails, go to homepage
                router.push('/');
              }
            }, 3000)

          } catch (error: any) {
            console.error("Error in payment success handling:", error)
            setError("Payment was successful but there was an issue processing your booking. Please contact support.")
          } finally {
            setProcessingBooking(false)
          }
        } else if (status === 'PENDING') {
          // Handle pending payments with retry logic
          const maxRetries = 6 // Maximum 6 retries (about 30 seconds total)
          if (currentRetryCount < maxRetries) {
            console.log(`Payment is pending, retrying in 5 seconds... (${currentRetryCount + 1}/${maxRetries})`)
            setRetryCount(currentRetryCount + 1)

            // Retry after 5 seconds
            setTimeout(() => {
              checkPaymentStatus(currentRetryCount + 1)
            }, 5000)
            return // Don't set loading to false yet
          } else {
            // Max retries reached, show pending status
            console.log('Max retries reached, payment still pending')
            setError('Payment is taking longer than expected. Please check your payment status or contact support.')
          }
        }
        // For FAILED, CANCELLED, or other statuses, just show the status
      } catch (error: any) {
        console.error("Error checking payment status:", error)
        setError(error.message || "Failed to check payment status")
        setPaymentStatus('FAILED')
      } finally {
        setIsLoading(false)
        setIsRetrying(false)
      }
    }

    checkPaymentStatus()
  }, [searchParams, router])

  return (
    <div className="container max-w-md mx-auto py-10">
      <Card className="border-2 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Payment {getStatusText()}</CardTitle>
          <CardDescription>
            {isLoading ? "Processing your payment..." : getStatusDescription()}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-10">
          {isLoading || isRetrying ? (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-16 w-16 text-primary animate-spin" />
              <p className="text-muted-foreground">
                {isRetrying
                  ? `Checking payment status... (Attempt ${retryCount + 1}/6)`
                  : "Please wait while we verify your payment..."
                }
              </p>
              {isRetrying && (
                <p className="text-sm text-muted-foreground">
                  Payment is being processed by PhonePe. This may take a few moments.
                </p>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              {paymentStatus === 'SUCCESS' && !processingBooking && (
                <CheckCircle className="h-16 w-16 text-green-500" />
              )}
              {paymentStatus === 'SUCCESS' && processingBooking && (
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="h-16 w-16 text-green-500 animate-spin" />
                  <p className="text-muted-foreground">Processing your booking...</p>
                </div>
              )}
              {paymentStatus === 'FAILED' && (
                <XCircle className="h-16 w-16 text-red-500" />
              )}
              {paymentStatus === 'PENDING' && (
                <div className="flex flex-col items-center gap-4">
                  <AlertTriangle className="h-16 w-16 text-amber-500" />
                  <p className="text-muted-foreground">Payment is still being processed...</p>
                </div>
              )}
              {paymentStatus === 'CANCELLED' && (
                <XCircle className="h-16 w-16 text-gray-500" />
              )}

              {bookingRef && (
                <>
                  {bookingRef && (
                    <p className="text-sm text-muted-foreground">
                      Booking Reference: <span className="font-medium">{bookingRef}</span>
                    </p>
                  )}
                  {bookingRef && (
                    <p className="text-sm mt-2">
                      <Link 
                        href={`/booking-confirmation?ref=${encodeURIComponent(bookingRef)}`}
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        Click here to view your booking confirmation
                      </Link>
                    </p>
                  )}
                </>
              )}

              {transactionId && (
                <p className="text-sm text-muted-foreground">
                  Transaction ID: <span className="font-medium">{transactionId}</span>
                </p>
              )}

              {error && (
                <p className="text-sm text-red-500 mt-2">{error}</p>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          {paymentStatus === 'SUCCESS' ? (
            <Button
              className="w-full"
              onClick={() => bookingRef && router.push(`/booking-confirmation?ref=${encodeURIComponent(bookingRef)}`)}
            >
              View Booking Details
            </Button>
          ) : paymentStatus === 'FAILED' || paymentStatus === 'CANCELLED' ? (
            <Button
              className="w-full"
              variant="outline"
              onClick={() => router.push('/register-event')}
            >
              Try Again
            </Button>
          ) : paymentStatus === 'PENDING' && !isRetrying ? (
            <div className="w-full space-y-2">
              <Button
                className="w-full"
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Check Status Again
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                If payment was successful, it may take a few minutes to reflect
              </p>
            </div>
          ) : null}
        </CardFooter>
      </Card>
    </div>
  )

  function getStatusText() {
    if (isLoading) return "Processing"
    switch (paymentStatus) {
      case 'SUCCESS': return "Successful"
      case 'FAILED': return "Failed"
      case 'PENDING': return "Pending"
      case 'CANCELLED': return "Cancelled"
      default: return "Status"
    }
  }

  function getStatusDescription() {
    if (error) return error;

    switch (paymentStatus) {
      case 'SUCCESS':
        return processingBooking
          ? "Payment successful! We're finalizing your booking..."
          : "Your payment was successful. You will be redirected to the booking confirmation page."
      case 'FAILED':
        return "Your payment was not successful. Please try again."
      case 'PENDING':
        return isRetrying
          ? "Payment is being verified with PhonePe. Please wait while we confirm your payment status."
          : "Your payment is being processed. This may take a few moments to complete."
      case 'CANCELLED':
        return "Your payment was cancelled. Please try again if you wish to complete the booking."
      default:
        return "We're having trouble determining your payment status."
    }
  }
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading payment status...</div>}>
      <PaymentCallbackContent />
    </Suspense>
  )
}

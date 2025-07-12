"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calendar, Clock, MapPin, User, Baby, CreditCard, Download, ArrowLeft, AlertTriangle } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

// Mock data - in a real app, this would come from an API
const bookings = [
  {
    id: "B001",
    eventName: "Baby Sensory Play",
    description: "Engage your baby's senses with various textures, sounds, and colors. This interactive session is designed to stimulate your baby's development through sensory exploration.",
    venue: {
      name: "Little Explorers Center",
      address: "123 Play Street, Andheri West",
      city: "Mumbai",
    },
    date: "2025-04-15",
    time: "10:00 AM - 11:30 AM",
    child: {
      name: "Aryan",
      dob: "2023-02-15",
      ageAtEvent: "14 months",
    },
    status: "confirmed",
    price: 799,
    discount: 0,
    totalAmount: 799,
    bookingDate: "2025-03-10",
    paymentStatus: "paid",
    paymentMethod: "Credit Card",
    paymentId: "pay_123456789",
    image: "/placeholder.svg?height=200&width=300",
    instructions: "Please arrive 15 minutes before the event starts. Parents must stay with their children throughout the event. Wear comfortable clothes.",
  },
]

type Props = {
  params: { id: string }
}

export default function BookingDetailPage({ params }: Props) {
  const router = useRouter()
  const booking = bookings.find((b) => b.id === params.id)

  // Handle booking cancellation
  const handleCancelBooking = () => {
    // In a real app, this would be an API call to cancel the booking
    console.log("Cancel booking:", params.id)
    
    // Redirect to bookings page
    router.push("/dashboard/bookings")
  }

  if (!booking) {
    return (
      <div className="container flex h-[400px] items-center justify-center py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Booking Not Found</h2>
          <p className="text-muted-foreground">The booking you're looking for doesn't exist or has been removed.</p>
          <Button className="mt-4" asChild>
            <Link href="/dashboard/bookings">Back to Bookings</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="mb-6 flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/bookings">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Booking Details</h1>
          <p className="text-muted-foreground">
            Booking ID: {booking.id} | {booking.eventName}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Event Information</CardTitle>
                <div>
                  {booking.status === "confirmed" && (
                    <Badge className="bg-green-500 hover:bg-green-600">Confirmed</Badge>
                  )}
                  {booking.status === "pending" && (
                    <Badge variant="outline">Pending</Badge>
                  )}
                  {booking.status === "cancelled" && (
                    <Badge className="bg-red-500 hover:bg-red-600">Cancelled</Badge>
                  )}
                  {booking.status === "completed" && (
                    <Badge className="bg-blue-500 hover:bg-blue-600">Completed</Badge>
                  )}
                  {booking.status === "no_show" && (
                    <Badge className="bg-amber-500 hover:bg-amber-600">No Show</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="relative h-48 w-full overflow-hidden rounded-lg">
                <Image
                  src={booking.image}
                  alt={booking.eventName}
                  fill
                  className="object-cover"
                />
              </div>

              <div>
                <h2 className="text-xl font-semibold">{booking.eventName}</h2>
                <p className="mt-2 text-muted-foreground">{booking.description}</p>
              </div>

              <div className="grid gap-4 rounded-lg border p-4 sm:grid-cols-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Date</p>
                    <p className="text-sm text-muted-foreground">{booking.date}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Time</p>
                    <p className="text-sm text-muted-foreground">{booking.time}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Venue</p>
                    <p className="text-sm text-muted-foreground">{booking.venue.name}</p>
                    <p className="text-xs text-muted-foreground">{booking.venue.address}</p>
                    <p className="text-xs text-muted-foreground">{booking.venue.city}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Baby className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Child</p>
                    <p className="text-sm text-muted-foreground">{booking.child.name}</p>
                    <p className="text-xs text-muted-foreground">Age at event: {booking.child.ageAtEvent}</p>
                  </div>
                </div>
              </div>

              {booking.instructions && (
                <div className="rounded-md bg-muted p-4">
                  <h3 className="mb-2 font-medium">Important Information</h3>
                  <p className="text-sm text-muted-foreground">{booking.instructions}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-medium">Payment Status</p>
                  <p className="text-sm">
                    {booking.paymentStatus === "paid" && (
                      <span className="text-green-600">Paid</span>
                    )}
                    {booking.paymentStatus === "pending" && (
                      <span className="text-amber-600">Pending</span>
                    )}
                    {booking.paymentStatus === "refunded" && (
                      <span className="text-blue-600">Refunded</span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Payment Method</p>
                  <p className="text-sm text-muted-foreground">{booking.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Payment ID</p>
                  <p className="text-sm text-muted-foreground">{booking.paymentId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Booking Date</p>
                  <p className="text-sm text-muted-foreground">{booking.bookingDate}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <p>Event Price</p>
                  <p>₹{booking.price}</p>
                </div>
                {booking.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <p>Discount</p>
                    <p>-₹{booking.discount}</p>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-medium">
                  <p>Total Amount</p>
                  <p>₹{booking.totalAmount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full" variant="outline" asChild>
                <Link href={`/dashboard/bookings/${booking.id}/ticket`}>
                  <Download className="mr-2 h-4 w-4" />
                  Download Ticket
                </Link>
              </Button>

              {booking.status === "confirmed" && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      className="w-full text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20"
                      variant="outline"
                    >
                      <AlertTriangle className="mr-2 h-4 w-4" />
                      Cancel Booking
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
                      <AlertDialogDescription>
                        <p>
                          Are you sure you want to cancel this booking? This action cannot be undone.
                        </p>
                        <div className="mt-4 rounded-md bg-muted p-3">
                          <p className="font-medium">{booking.eventName}</p>
                          <p className="text-sm text-muted-foreground">
                            {booking.date} | {booking.time}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {booking.venue.name}, {booking.venue.city}
                          </p>
                        </div>
                        <Separator className="my-4" />
                        <p className="text-sm text-muted-foreground">
                          <strong>Cancellation Policy:</strong> Full refund if cancelled at least 24 hours before the event. No refund for cancellations within 24 hours of the event.
                        </p>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-500 hover:bg-red-600"
                        onClick={handleCancelBooking}
                      >
                        Yes, Cancel Booking
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}

              {booking.status === "completed" && (
                <Button className="w-full" variant="outline" asChild>
                  <Link href={`/dashboard/bookings/${booking.id}/review`}>
                    Write Review
                  </Link>
                </Button>
              )}
            </CardContent>
            <CardFooter>
              <Button className="w-full" asChild>
                <Link href="/events">Browse More Events</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}

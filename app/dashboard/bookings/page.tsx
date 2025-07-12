"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Calendar, Search, Eye, Download, AlertTriangle, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
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
import { useAuth } from "@/contexts/auth-context"
import { useUserBookings, UserBooking } from "@/lib/swr-hooks"

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState("upcoming")
  const [searchQuery, setSearchQuery] = useState("")
  const { user } = useAuth()

  // Fetch user bookings
  const { userBookings, isLoading, isError } = useUserBookings(user?.user_id || null)

  // Process and categorize bookings
  const { upcomingBookings, pastBookings } = useMemo(() => {
    if (!userBookings?.bookings || !Array.isArray(userBookings.bookings)) {
      return { upcomingBookings: [], pastBookings: [] }
    }

    const now = new Date()
    const upcoming: UserBooking[] = []
    const past: UserBooking[] = []

    userBookings.bookings.forEach((booking) => {
      const eventDate = new Date(booking.event.event_date)
      if (eventDate >= now) {
        upcoming.push(booking)
      } else {
        past.push(booking)
      }
    })

    return { upcomingBookings: upcoming, pastBookings: past }
  }, [userBookings])

  // Filter bookings based on search query
  const filteredUpcomingBookings = upcomingBookings.filter((booking) => {
    if (!searchQuery) return true

    const query = searchQuery.toLowerCase()
    return (
      booking.event.title.toLowerCase().includes(query) ||
      booking.booking_ref.toLowerCase().includes(query) ||
      (booking.games && booking.games.some(game => game.game_name.toLowerCase().includes(query)))
    )
  })

  const filteredPastBookings = pastBookings.filter((booking) => {
    if (!searchQuery) return true

    const query = searchQuery.toLowerCase()
    return (
      booking.event.title.toLowerCase().includes(query) ||
      booking.booking_ref.toLowerCase().includes(query) ||
      (booking.games && booking.games.some(game => game.game_name.toLowerCase().includes(query)))
    )
  })



  // Handle booking cancellation
  const handleCancelBooking = (bookingId: number) => {
    // In a real app, this would be an API call to cancel the booking
    console.log("Cancel booking:", bookingId)
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Format time for display
  const formatTime = (game: any) => {
    if (game?.slot_info?.start_time && game?.slot_info?.end_time) {
      return `${game.slot_info.start_time} - ${game.slot_info.end_time}`
    }
    return "Time TBD"
  }

  // Get game display info with proper fallbacks
  const getGameDisplayInfo = (game: any) => {
    // If slot_info exists and has the required fields, use it
    if (game?.slot_info && game.slot_info.custom_title && game.slot_info.custom_description) {
      return {
        title: game.slot_info.custom_title,
        description: game.slot_info.custom_description,
        price: game.slot_info.slot_price || game.slot_info.custom_price || null
      }
    }

    // Fallback to game data
    return {
      title: game?.game_name || 'Game',
      description: game?.description || 'No description available',
      price: null // No fallback price from total_amount as it includes multiple items
    }
  }

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">My Bookings</h1>
          <p className="text-muted-foreground">View and manage your event bookings</p>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading your bookings...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="container py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">My Bookings</h1>
          <p className="text-muted-foreground">View and manage your event bookings</p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Failed to Load Bookings</h3>
            <p className="text-muted-foreground mb-4">
              We couldn't load your bookings. Please try again later.
            </p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">My Bookings</h1>
        <p className="text-muted-foreground">View and manage your event bookings</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <CardTitle>Bookings</CardTitle>
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search bookings..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="past">Past</TabsTrigger>
            </TabsList>
            <TabsContent value="upcoming" className="pt-6">
              {filteredUpcomingBookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No Upcoming Bookings</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {searchQuery
                      ? "No bookings match your search criteria."
                      : "You don't have any upcoming events booked."}
                  </p>
                  {!searchQuery && (
                    <Button className="mt-4" asChild>
                      <Link href="/events">Browse Events</Link>
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredUpcomingBookings.map((booking) => (
                    <div key={booking.booking_id} className="rounded-lg border p-6">
                      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl font-semibold">{booking.event.title}</h3>
                            {booking.status.toLowerCase() === "confirmed" && (
                              <Badge className="bg-green-500 hover:bg-green-600">Confirmed</Badge>
                            )}
                            {booking.status.toLowerCase() === "pending" && (
                              <Badge variant="outline">Pending</Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline">{formatDate(booking.event.event_date)}</Badge>
                            <Badge variant="outline">₹{booking.total_amount}</Badge>
                          </div>

                          {/* Display Games */}
                          <div className="space-y-2">
                            <p className="text-sm font-medium">Games:</p>
                            {booking.games && booking.games.length > 0 ? (
                              booking.games.map((game, index) => {
                                const gameInfo = getGameDisplayInfo(game)
                                return (
                                  <div key={index} className="ml-4 space-y-1">
                                    <p className="text-sm font-medium">{gameInfo.title}</p>
                                    <p className="text-xs text-muted-foreground">{gameInfo.description}</p>
                                    <div className="flex gap-2">
                                      <Badge variant="outline" className="text-xs">
                                        {formatTime(game)}
                                      </Badge>
                                      {gameInfo.price && (
                                        <Badge variant="outline" className="text-xs">
                                          ₹{gameInfo.price}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                )
                              })
                            ) : (
                              <p className="ml-4 text-xs text-muted-foreground">No games available</p>
                            )}
                          </div>

                          {/* Display Add-ons */}
                          {booking.addons && booking.addons.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-sm font-medium">Add-ons:</p>
                              {booking.addons.map((addon, index) => (
                                <div key={index} className="ml-4 space-y-1">
                                  <p className="text-sm">{addon.name} (Qty: {addon.quantity})</p>
                                  <p className="text-xs text-muted-foreground">{addon.description}</p>
                                  <Badge variant="outline" className="text-xs">₹{addon.price}</Badge>
                                </div>
                              ))}
                            </div>
                          )}

                          <p className="text-sm">
                            <span className="font-medium">Booking Reference:</span> {booking.booking_ref}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Booked on:</span> {formatDate(booking.created_at)}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Payment:</span>{" "}
                            {booking.payment_status.toLowerCase() === "paid" ? (
                              <span className="text-green-600">Paid</span>
                            ) : booking.payment_status.toLowerCase() === "pending" ? (
                              <span className="text-amber-600">Pending</span>
                            ) : (
                              <span className="text-gray-600">{booking.payment_status}</span>
                            )}
                          </p>
                        </div>
                        <div className="flex flex-row gap-2 sm:flex-col">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/dashboard/bookings/${booking.booking_id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/dashboard/bookings/${booking.booking_id}/ticket`}>
                              <Download className="mr-2 h-4 w-4" />
                              Download Ticket
                            </Link>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20"
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
                                    <p className="font-medium">{booking.event.title}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {formatDate(booking.event.event_date)}
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
                                  onClick={() => handleCancelBooking(booking.booking_id)}
                                >
                                  Yes, Cancel Booking
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            <TabsContent value="past" className="pt-6">
              {filteredPastBookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No Past Bookings</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {searchQuery
                      ? "No bookings match your search criteria."
                      : "You don't have any past events."}
                  </p>
                  {!searchQuery && (
                    <Button className="mt-4" asChild>
                      <Link href="/events">Browse Events</Link>
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredPastBookings.map((booking) => (
                    <div key={booking.booking_id} className="rounded-lg border p-6">
                      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl font-semibold">{booking.event.title}</h3>
                            {booking.status.toLowerCase() === "confirmed" && (
                              <Badge className="bg-blue-500 hover:bg-blue-600">Completed</Badge>
                            )}
                            {booking.status.toLowerCase() === "cancelled" && (
                              <Badge className="bg-red-500 hover:bg-red-600">Cancelled</Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline">{formatDate(booking.event.event_date)}</Badge>
                            <Badge variant="outline">₹{booking.total_amount}</Badge>
                          </div>

                          {/* Display Games */}
                          <div className="space-y-2">
                            <p className="text-sm font-medium">Games:</p>
                            {booking.games && booking.games.length > 0 ? (
                              booking.games.map((game, index) => {
                                const gameInfo = getGameDisplayInfo(game)
                                return (
                                  <div key={index} className="ml-4 space-y-1">
                                    <p className="text-sm font-medium">{gameInfo.title}</p>
                                    <p className="text-xs text-muted-foreground">{gameInfo.description}</p>
                                    <div className="flex gap-2">
                                      <Badge variant="outline" className="text-xs">
                                        {formatTime(game)}
                                      </Badge>
                                      {gameInfo.price && (
                                        <Badge variant="outline" className="text-xs">
                                          ₹{gameInfo.price}
                                        </Badge>
                                      )}
                                      <Badge variant="outline" className="text-xs">
                                        {game?.attendance_status || 'Unknown'}
                                      </Badge>
                                    </div>
                                  </div>
                                )
                              })
                            ) : (
                              <p className="ml-4 text-xs text-muted-foreground">No games available</p>
                            )}
                          </div>

                          {/* Display Add-ons */}
                          {booking.addons && booking.addons.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-sm font-medium">Add-ons:</p>
                              {booking.addons.map((addon, index) => (
                                <div key={index} className="ml-4 space-y-1">
                                  <p className="text-sm">{addon.name} (Qty: {addon.quantity})</p>
                                  <p className="text-xs text-muted-foreground">{addon.description}</p>
                                  <Badge variant="outline" className="text-xs">₹{addon.price}</Badge>
                                </div>
                              ))}
                            </div>
                          )}

                          <p className="text-sm">
                            <span className="font-medium">Booking Reference:</span> {booking.booking_ref}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Booked on:</span> {formatDate(booking.created_at)}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Payment:</span>{" "}
                            {booking.payment_status.toLowerCase() === "paid" ? (
                              <span className="text-green-600">Paid</span>
                            ) : booking.payment_status.toLowerCase() === "refunded" ? (
                              <span className="text-blue-600">Refunded</span>
                            ) : booking.payment_status.toLowerCase() === "pending" ? (
                              <span className="text-amber-600">Pending</span>
                            ) : (
                              <span className="text-gray-600">{booking.payment_status}</span>
                            )}
                          </p>
                        </div>
                        <div className="flex flex-row gap-2 sm:flex-col">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/dashboard/bookings/${booking.booking_id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </Link>
                          </Button>
                          {booking.status.toLowerCase() === "confirmed" && (
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/dashboard/bookings/${booking.booking_id}/review`}>
                                Write Review
                              </Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

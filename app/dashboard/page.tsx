"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Baby, CreditCard, MapPin, User, Mail, Phone, Edit, Eye } from "lucide-react"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatAge } from "@/lib/age-calculation"

// Mock data - in a real app, this would come from an API
const user = {
  id: "u1",
  name: "Priya Sharma",
  email: "priya@example.com",
  phone: "+91 9876543210",
  defaultCity: "Mumbai",
  emailVerified: true,
  phoneVerified: true,
  createdAt: "2023-01-15",
}

const children = [
  {
    id: "1",
    name: "Aryan",
    dob: "2023-02-15",
    ageInMonths: 14,
  },
  {
    id: "2",
    name: "Zara",
    dob: "2023-06-10",
    ageInMonths: 10,
  },
]

const upcomingBookings = [
  {
    id: "B001",
    eventName: "Baby Sensory Play",
    venue: "Little Explorers Center",
    city: "Mumbai",
    date: "2025-04-15",
    time: "10:00 AM - 11:30 AM",
    child: "Aryan",
    status: "confirmed",
  },
  {
    id: "B003",
    eventName: "Toddler Music & Movement",
    venue: "Rhythm Studio",
    city: "Delhi",
    date: "2025-04-16",
    time: "11:00 AM - 12:30 PM",
    child: "Zara",
    status: "confirmed",
  },
]

const cities = [
  { id: "1", name: "Mumbai" },
  { id: "2", name: "Delhi" },
  { id: "3", name: "Bangalore" },
  { id: "4", name: "Chennai" },
  { id: "5", name: "Hyderabad" },
  { id: "6", name: "Pune" },
]

export default function DashboardPage() {
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)
  const [phone, setPhone] = useState(user.phone)
  const [defaultCity, setDefaultCity] = useState(user.defaultCity)

  // Handle profile update
  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault()
    
    // In a real app, this would be an API call to update the profile
    console.log({
      name,
      email,
      phone,
      defaultCity,
    })
    
    setIsEditing(false)
  }

  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">My Dashboard</h1>
        <p className="text-muted-foreground">Manage your profile and view your bookings</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Profile</CardTitle>
                {!isEditing && (
                  <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <form onSubmit={handleUpdateProfile}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="defaultCity">Default City</Label>
                      <Select value={defaultCity} onValueChange={setDefaultCity}>
                        <SelectTrigger id="defaultCity">
                          <SelectValue placeholder="Select your city" />
                        </SelectTrigger>
                        <SelectContent>
                          {cities.map((city) => (
                            <SelectItem key={city.id} value={city.name}>
                              {city.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">Save Changes</Button>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src="https://ui-avatars.com/api/?name=PS&background=random&color=fff&size=128" alt={user.name} />
                      <AvatarFallback>PS</AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{user.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{user.email}</span>
                      {user.emailVerified && (
                        <Badge variant="outline" className="ml-auto text-xs text-green-500">
                          Verified
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{user.phone}</span>
                      {user.phoneVerified && (
                        <Badge variant="outline" className="ml-auto text-xs text-green-500">
                          Verified
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{user.defaultCity}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>My Children</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/dashboard/children">
                    <Edit className="mr-2 h-4 w-4" />
                    Manage
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {children.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <Baby className="h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">No children added yet</p>
                  <Button className="mt-4" size="sm" asChild>
                    <Link href="/dashboard/children">Add Child</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {children.map((child) => (
                    <div key={child.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{child.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(child.dob), "PPP")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatAge(child.ageInMonths)}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/dashboard/children?edit=${child.id}`}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant="outline" asChild>
                <Link href="/dashboard/children">
                  <Baby className="mr-2 h-4 w-4" />
                  {children.length > 0 ? "Manage Children" : "Add Child"}
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>My Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="upcoming" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                  <TabsTrigger value="past">Past</TabsTrigger>
                </TabsList>
                <TabsContent value="upcoming" className="pt-4">
                  {upcomingBookings.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Calendar className="h-12 w-12 text-muted-foreground" />
                      <h3 className="mt-4 text-lg font-semibold">No Upcoming Bookings</h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        You don't have any upcoming events booked.
                      </p>
                      <Button className="mt-4" asChild>
                        <Link href="/events">Browse Events</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {upcomingBookings.map((booking) => (
                        <div key={booking.id} className="rounded-lg border p-4">
                          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                            <div>
                              <h3 className="font-semibold">{booking.eventName}</h3>
                              <p className="text-sm text-muted-foreground">
                                {booking.venue}, {booking.city}
                              </p>
                              <div className="mt-1 flex items-center gap-2">
                                <Badge variant="outline">{booking.date}</Badge>
                                <Badge variant="outline">{booking.time}</Badge>
                              </div>
                              <p className="mt-2 text-sm">
                                <span className="font-medium">Child:</span> {booking.child}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              {booking.status === "confirmed" && (
                                <Badge className="bg-green-500 hover:bg-green-600">Confirmed</Badge>
                              )}
                              {booking.status === "pending" && (
                                <Badge variant="outline">Pending</Badge>
                              )}
                              {booking.status === "cancelled" && (
                                <Badge className="bg-red-500 hover:bg-red-600">Cancelled</Badge>
                              )}
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/dashboard/bookings/${booking.id}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="past" className="pt-4">
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Calendar className="h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">No Past Bookings</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      You don't have any past events.
                    </p>
                    <Button className="mt-4" asChild>
                      <Link href="/events">Browse Events</Link>
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" asChild>
                <Link href="/dashboard/bookings">
                  <Calendar className="mr-2 h-4 w-4" />
                  View All Bookings
                </Link>
              </Button>
              <Button asChild>
                <Link href="/events">
                  Browse Events
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CreditCard className="h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No Payment Methods</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  You haven't added any payment methods yet.
                </p>
                <Button className="mt-4" asChild>
                  <Link href="/dashboard/payments">Add Payment Method</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

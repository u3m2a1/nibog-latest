"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save, Star } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

// Define interfaces to match API response
interface Event {
  id: number;
  title: string;
  description: string;
  city_id: number;
  venue_id: number;
  event_date: string;
  status: string;
}

interface City {
  id: number;
  city_name: string;
  state: string;
  is_active: boolean;
}

export default function NewTestimonialPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [selectedCityName, setSelectedCityName] = useState("")
  const [selectedCityId, setSelectedCityId] = useState<number | null>(null)
  const [selectedEventId, setSelectedEventId] = useState("")
  const [rating, setRating] = useState("5")
  const [testimonialText, setTestimonialText] = useState("")
  const [date, setDate] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isDataLoading, setIsDataLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [cities, setCities] = useState<City[]>([])

  // Fetch games and cities data
  useEffect(() => {
    const fetchData = async () => {
      setIsDataLoading(true)
      try {
        setError(null)
        console.log('Fetching data...')
        
        // Fetch events from API
        const eventsResponse = await fetch('https://ai.alviongs.com/webhook/v1/nibog/event/get-all')
        if (!eventsResponse.ok) {
          throw new Error('Failed to fetch events')
        }
        const eventsData = await eventsResponse.json()
        console.log('Events data:', eventsData)
        setEvents(eventsData)

        // Fetch cities from cities API
        const citiesResponse = await fetch('https://ai.alviongs.com/webhook/v1/nibog/city/get-all')
        if (!citiesResponse.ok) {
          throw new Error('Failed to fetch cities')
        }
        const citiesData = await citiesResponse.json()
        console.log('Cities data:', citiesData)
        setCities(citiesData)

      } catch (error) {
        console.error('Error fetching data:', error)
        const errorMessage = error instanceof Error ? error.message : 'Failed to load required data'
        console.error('Error details:', error)
        setError(errorMessage)
      } finally {
        setIsDataLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      setError(null)

      // Validate required fields
      if (!selectedEventId) {
        throw new Error('Please select an event')
      }
      if (!selectedCityName || !selectedCityId) {
        throw new Error('Please select a city')
      }

      // Format date to match API requirement (YYYY-MM-DD)
      const formattedDate = new Date(date).toISOString().split('T')[0];

      // Prepare payload exactly as per API documentation
      const payload = {
        name: name.trim(),
        city_id: selectedCityName.trim(), // Include city ID to ensure proper association
        event_id: parseInt(selectedEventId),
        rating: parseInt(rating),
        testimonial: testimonialText.trim(),
        date: formattedDate,
        status: "Published"
      }

      // Extensive debug logging
      console.log('Form Data:', {
        name,
        selectedCityName,
        selectedEventId,
        rating,
        testimonialText,
        date
      });
      
      console.log('Payload for API:', payload);

      // Make API call to create testimonial
      const response = await fetch('https://ai.alviongs.com/webhook/v1/nibog/testimonials/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.text();
        console.error('API error response:', errorData);
        throw new Error('Failed to create testimonial: ' + errorData);
      }

      const data = await response.json()
      
      setIsLoading(false)
      
      // Redirect to the testimonials list on success
      router.push("/admin/testimonials")

    } catch (error) {
      console.error('Error creating testimonial:', error)
      setIsLoading(false)
      setError(error instanceof Error ? error.message : 'An error occurred while creating the testimonial')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/testimonials">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Add New Testimonial</h1>
            <p className="text-muted-foreground">Create a new customer testimonial</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Testimonial Information</CardTitle>
            <CardDescription>Enter the details for the new testimonial</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Customer Name</Label>
              <Input 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Enter customer name"
                required
              />
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Select
                  value={selectedCityName}
                  onValueChange={(cityName) => {
                    console.log('Selected city name:', cityName);
                    setSelectedCityName(cityName);
                    
                    // Find the corresponding city ID for the selected city name
                    const selectedCity = cities.find(c => c.city_name === cityName);
                    if (selectedCity) {
                      console.log('Found city ID:', selectedCity.id);
                      setSelectedCityId(selectedCity.id);
                    } else {
                      console.log('City ID not found for:', cityName);
                      setSelectedCityId(null);
                    }
                  }}
                  required
                  disabled={isDataLoading}
                >
                  <SelectTrigger id="city">
                    <SelectValue placeholder={isDataLoading ? "Loading cities..." : "Select city"} />
                  </SelectTrigger>
                  <SelectContent>
                    {cities && cities.length > 0 ? (
                      cities.map((c) => (
                        <SelectItem
                          key={c.id}
                          value={c.city_name}
                        >
                          {c.city_name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="_empty" disabled>
                        {isDataLoading ? "Loading..." : "No cities available"}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {error && <p className="text-sm text-red-500">{error}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="event">Event</Label>
                <Select value={selectedEventId} onValueChange={setSelectedEventId} required disabled={isDataLoading}>
                  <SelectTrigger id="event">
                    <SelectValue placeholder={isDataLoading ? "Loading events..." : "Select event"} />
                  </SelectTrigger>
                  <SelectContent>
                    {events && events.length > 0 ? (
                      events.map((event) => (
                        <SelectItem key={event.id} value={event.id.toString()}>
                          {event.title}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="_empty" disabled>
                        {isDataLoading ? "Loading..." : "No events available"}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="rating">Rating</Label>
              <RadioGroup 
                id="rating" 
                value={rating} 
                onValueChange={setRating}
                className="flex space-x-2"
              >
                {[1, 2, 3, 4, 5].map((value) => (
                  <div key={value} className="flex flex-col items-center space-y-1">
                    <RadioGroupItem 
                      value={value.toString()} 
                      id={`rating-${value}`} 
                      className="sr-only" 
                    />
                    <label 
                      htmlFor={`rating-${value}`}
                      className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-full ${
                        parseInt(rating) >= value 
                          ? "bg-yellow-100 text-yellow-500 dark:bg-yellow-900/20" 
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Star className={`h-6 w-6 ${parseInt(rating) >= value ? "fill-yellow-500" : ""}`} />
                    </label>
                    <span className="text-xs">{value}</span>
                  </div>
                ))}
              </RadioGroup>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="testimonialText">Testimonial</Label>
              <Textarea 
                id="testimonialText" 
                value={testimonialText} 
                onChange={(e) => setTestimonialText(e.target.value)} 
                placeholder="Enter testimonial text"
                rows={5}
                required
              />
              <p className="text-sm text-muted-foreground">
                Enter the customer's testimonial about their experience with NIBOG events.
              </p>
            </div>
            
            <Separator className="my-4" />
            
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input 
                id="date" 
                type="date"
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
                required
              />
              <p className="text-sm text-muted-foreground">
                The date when this testimonial was received.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" asChild>
              <Link href="/admin/testimonials">
                Cancel
              </Link>
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                "Creating..."
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Create Testimonial
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}

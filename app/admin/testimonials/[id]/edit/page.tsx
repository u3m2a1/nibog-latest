"use client"

import { useState, useEffect, use } from "react"
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

// Testimonial statuses
const statuses = [
  { id: "1", name: "published", label: "Published" },
  { id: "2", name: "pending", label: "Pending" },
  { id: "3", name: "rejected", label: "Rejected" },
]

type Props = {
  params: {
    id: string;
  }
}

export default function EditTestimonialPage({ params }: Props) {
  const router = useRouter()
  const testimonialId = params.id
  
  const [testimonial, setTestimonial] = useState<any>(null)
  const [name, setName] = useState("")
  const [city, setCity] = useState("")
  const [event, setEvent] = useState("")
  const [rating, setRating] = useState("")
  const [testimonialText, setTestimonialText] = useState("")
  const [status, setStatus] = useState("")
  const [date, setDate] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cities, setCities] = useState<Array<{id: number, city_name: string}>>([])
  const [events, setEvents] = useState<Array<{id: number, title: string}>>([])

  useEffect(() => {
    // Fetch cities
    const fetchCities = async () => {
      try {
        const response = await fetch('https://ai.alviongs.com/webhook/v1/nibog/city/get-all')
        if (!response.ok) {
          throw new Error('Failed to fetch cities')
        }
        const data = await response.json()
        setCities(data)
      } catch (error) {
        console.error('Error fetching cities:', error)
      }
    }
    
    // Fetch events
    const fetchEvents = async () => {
      try {
        const response = await fetch('https://ai.alviongs.com/webhook/v1/nibog/event/get-all')
        if (!response.ok) {
          throw new Error('Failed to fetch events')
        }
        const data = await response.json()
        setEvents(data)
      } catch (error) {
        console.error('Error fetching events:', error)
      }
    }
    
    fetchCities()
    fetchEvents()
  }, [])

  useEffect(() => {
    const fetchTestimonial = async () => {
      try {
        const response = await fetch('https://ai.alviongs.com/webhook/v1/nibog/testimonials/get', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: parseInt(testimonialId)
          })
        })

        if (!response.ok) {
          throw new Error('Failed to fetch testimonial')
        }

        const data = await response.json()
        if (data && data.length > 0) {
          const testimonialData = data[0]
          
          // Find event name from event_id
          let eventName = ''
          if (events.length > 0) {
            const matchedEvent = events.find(e => e.id === testimonialData.event_id)
            eventName = matchedEvent ? matchedEvent.title : ''
          }

          setTestimonial(testimonialData)
          setName(testimonialData.name)
          setCity(testimonialData.city)
          setEvent(eventName)
          setRating(testimonialData.rating.toString())
          setTestimonialText(testimonialData.testimonial)
          setStatus(testimonialData.status.toLowerCase()) // Convert to lowercase for frontend
          setDate(testimonialData.submitted_at.split('T')[0]) // Extract date from ISO string
        }
      } catch (error) {
        console.error('Error fetching testimonial:', error)
        setError('Failed to fetch testimonial data')
      }
    }

    if (testimonialId && events.length > 0) {
      fetchTestimonial()
    }
  }, [testimonialId, events])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Find event ID from event title
      const selectedEvent = events.find(e => e.title === event)
      if (!selectedEvent) {
        throw new Error('Invalid event selected')
      }

      // Prepare update data
      const updateData = {
        id: parseInt(testimonialId),
        name,
        city,
        event_id: parseInt(selectedEvent.id),
        rating: parseInt(rating),
        testimonial: testimonialText,
        date,
        status: status.charAt(0).toUpperCase() + status.slice(1) // Capitalize first letter
      }

      console.log('Submitting update with data:', updateData)

      const response = await fetch('https://ai.alviongs.com/webhook/v1/nibog/testimonials/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      })

      const responseData = await response.text();
      let parsedData;
      try {
        parsedData = JSON.parse(responseData);
      } catch (e) {
        console.error('Response is not JSON:', responseData);
        throw new Error('Invalid response from server');
      }

      if (!response.ok) {
        console.error('Error response:', parsedData);
        throw new Error(parsedData.message || 'Failed to update testimonial');
      }

      setIsLoading(false)
      setIsSaved(true)

      // Reset the saved state after 1.5 seconds
      setTimeout(() => {
        setIsSaved(false)
        // Redirect to the testimonial details page
        router.push(`/admin/testimonials/${testimonialId}`)
      }, 1500)

    } catch (error) {
      console.error('Error updating testimonial:', error)
      setIsLoading(false)
      setError(error instanceof Error ? error.message : 'An error occurred while updating the testimonial')
    }
  }

  const renderError = () => {
    if (error) {
      return (
        <div className="mb-4 p-4 text-sm text-red-800 bg-red-50 rounded-lg">
          {error}
        </div>
      )
    }
    return null
  }

  if (!testimonial) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Testimonial not found</h2>
          <p className="text-muted-foreground">The testimonial you are looking for does not exist.</p>
          <Button className="mt-4" onClick={() => router.push("/admin/testimonials")}>
            Back to Testimonials
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/admin/testimonials/${testimonialId}`}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Testimonial</h1>
            <p className="text-muted-foreground">Update testimonial from {testimonial.name}</p>
          </div>
        </div>
      </div>

      {renderError()}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Testimonial Information</CardTitle>
            <CardDescription>Update the testimonial details below</CardDescription>
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
                <Select value={city} onValueChange={setCity} required>
                  <SelectTrigger id="city">
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((c) => (
                      <SelectItem key={c.id} value={c.city_name}>
                        {c.city_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="event">Event</Label>
                <Select value={event} onValueChange={setEvent} required>
                  <SelectTrigger id="event">
                    <SelectValue placeholder="Select event" />
                  </SelectTrigger>
                  <SelectContent>
                    {events.map((e) => (
                      <SelectItem key={e.id} value={e.title}>
                        {e.title}
                      </SelectItem>
                    ))}
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
            </div>
            
            <Separator className="my-4" />
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={setStatus} required>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((s) => (
                      <SelectItem key={s.id} value={s.name}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input 
                  id="date" 
                  type="date"
                  value={date} 
                  onChange={(e) => setDate(e.target.value)} 
                  required
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" asChild>
              <Link href={`/admin/testimonials/${testimonialId}`}>
                Cancel
              </Link>
            </Button>
            <Button type="submit" disabled={isLoading || isSaved}>
              {isLoading ? (
                "Saving..."
              ) : isSaved ? (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Saved
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}

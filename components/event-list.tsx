"use client"

import Link from "next/link"
import Image from "next/image"
import { memo, useMemo, useState, useCallback, useEffect } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, Heart } from "lucide-react"
import { formatPrice } from "@/lib/utils"
import { useSearchParams } from "next/navigation"
import { useEvents } from "@/lib/swr-hooks"

// For backup fallback only in case API fails
const fallbackEvents = [
  {
    id: "1",
    title: "Baby Crawling",
    description: "Let your little crawler compete in a fun and safe environment.",
    minAgeMonths: 5,
    maxAgeMonths: 13,
    date: "2025-10-26",
    time: "9:00 AM - 8:00 PM",
    venue: "Gachibowli Indoor Stadium",
    city: "Hyderabad",
    price: 1800,
    image: "/images/baby-crawling.jpg",
    spotsLeft: 5,
    totalSpots: 12,
    isOlympics: true,
  },
  {
    id: "2",
    title: "Baby Walker",
    description: "Fun-filled baby walker race in a safe environment.",
    minAgeMonths: 5,
    maxAgeMonths: 13,
    date: "2025-10-26",
    time: "9:00 AM - 8:00 PM",
    venue: "Gachibowli Indoor Stadium",
    city: "Hyderabad",
    price: 1800,
    image: "/images/baby-walker.jpg",
    spotsLeft: 8,
    totalSpots: 15,
    isOlympics: true,
  },
  {
    id: "3",
    title: "Running Race",
    description: "Exciting running race for toddlers in a fun and safe environment.",
    minAgeMonths: 13,
    maxAgeMonths: 84,
    date: "2025-10-26",
    time: "9:00 AM - 8:00 PM",
    venue: "Gachibowli Indoor Stadium",
    city: "Hyderabad",
    price: 1800,
    image: "/images/running-race.jpg",
    spotsLeft: 3,
    totalSpots: 10,
    isOlympics: true,
  },
  {
    id: "4",
    title: "Hurdle Toddle",
    description: "Fun hurdle race for toddlers to develop coordination and balance.",
    minAgeMonths: 13,
    maxAgeMonths: 84,
    date: "2025-03-16",
    time: "9:00 AM - 8:00 PM",
    venue: "Indoor Stadium",
    city: "Chennai",
    price: 1800,
    image: "/images/hurdle-toddle.jpg",
    spotsLeft: 12,
    totalSpots: 20,
    isOlympics: true,
  },
  {
    id: "5",
    title: "Cycle Race",
    description: "Exciting cycle race for children to showcase their skills.",
    minAgeMonths: 13,
    maxAgeMonths: 84,
    date: "2025-08-15",
    time: "9:00 AM - 8:00 PM",
    venue: "Sports Complex",
    city: "Vizag",
    price: 1800,
    image: "/images/cycle-race.jpg",
    spotsLeft: 6,
    totalSpots: 12,
    isOlympics: true,
  },
  {
    id: "6",
    title: "Ring Holding",
    description: "Fun ring holding game to develop hand-eye coordination.",
    minAgeMonths: 13,
    maxAgeMonths: 84,
    date: "2025-10-12",
    time: "9:00 AM - 8:00 PM",
    venue: "Indoor Stadium",
    city: "Bangalore",
    price: 1800,
    image: "/images/ring-holding.jpg",
    spotsLeft: 8,
    totalSpots: 15,
    isOlympics: true,
  },
  {
    id: "7",
    title: "Ball Throw",
    description: "Develop throwing skills and hand-eye coordination in a fun competitive environment.",
    minAgeMonths: 13,
    maxAgeMonths: 84,
    date: "2025-09-18",
    time: "9:00 AM - 8:00 PM",
    venue: "Indoor Stadium",
    city: "Mumbai",
    price: 1800,
    image: "/images/ball-throw.jpg",
    spotsLeft: 12,
    totalSpots: 15,
    isOlympics: true,
  },
  {
    id: "8",
    title: "Balancing Beam",
    description: "Fun balancing activities to develop coordination and confidence.",
    minAgeMonths: 13,
    maxAgeMonths: 84,
    date: "2025-11-15",
    time: "9:00 AM - 8:00 PM",
    venue: "Sports Complex",
    city: "Delhi",
    price: 1800,
    image: "/images/balancing-beam.jpg",
    spotsLeft: 8,
    totalSpots: 12,
    isOlympics: true,
  },
  {
    id: "9",
    title: "Frog Jump",
    description: "Exciting jumping competition for toddlers in a fun and safe environment.",
    minAgeMonths: 13,
    maxAgeMonths: 84,
    date: "2025-12-10",
    time: "9:00 AM - 8:00 PM",
    venue: "Indoor Stadium",
    city: "Kolkata",
    price: 1800,
    image: "/images/frog-jump.jpg",
    spotsLeft: 10,
    totalSpots: 15,
    isOlympics: true,
  },
]

// Import EventListItem type for proper typing
import { EventListItem } from "@/types"

// Memoized EventCard component to prevent unnecessary re-renders
const EventCard = memo(({ event }: { event: EventListItem }) => {
  return (
    <Card className="group overflow-hidden transition-all hover:shadow-md">
      <div className="relative h-48">
        <Image 
          src={event.image || "/placeholder.svg"} 
          alt={event.title} 
          fill 
          className="object-cover" 
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          loading="lazy"
          placeholder="blur"
          blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZWVlZWVlIi8+PC9zdmc+"
        />
        <div className="absolute right-2 top-2 flex gap-2">
          {event.isOlympics && <Badge className="bg-yellow-500 hover:bg-yellow-600">NIBOG Olympics</Badge>}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 h-8 w-8 rounded-full bg-background/80 opacity-0 transition-opacity group-hover:opacity-100"
          aria-label="Save event"
        >
          <Heart className="h-4 w-4" />
        </Button>
      </div>
      <CardContent className="p-4">
        <div className="space-y-2">
          <h3 className="font-semibold group-hover:text-primary">{event.title}</h3>
          <p className="line-clamp-2 text-sm text-muted-foreground">{event.description}</p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{event.date}</span>
            <Clock className="ml-2 h-3 w-3" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span>
              {event.venue}, {event.city}
            </span>
          </div>

        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t bg-muted/50 p-4">
        <div className="text-xs text-muted-foreground">
          <span className={event.spotsLeft <= 3 ? "text-red-500 font-medium" : ""}>
            {event.spotsLeft} spots left
          </span>
          <div className="mt-1 h-1.5 w-16 rounded-full bg-muted">
            <div
              className={`h-full rounded-full ${event.spotsLeft <= 3 ? "bg-red-500" : "bg-primary"}`}
              style={{ width: `${(event.spotsLeft / event.totalSpots) * 100}%` }}
            />
          </div>
        </div>
        <Button size="sm" asChild>
          <Link href={`/register-event?city=${event.city}`}>Register Now</Link>
        </Button>
      </CardFooter>
    </Card>
  )
});

EventCard.displayName = 'EventCard';

export default function EventList() {
  const searchParams = useSearchParams();
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  // Use SWR hook to fetch events data with caching
  const { events, isLoading, isError } = useEvents(fallbackEvents);
  
  // Filter events based on URL params
  const filteredEvents = useMemo(() => {
    const city = searchParams.get('city');
    const minAge = searchParams.get('minAge');
    const maxAge = searchParams.get('maxAge');
    const date = searchParams.get('date');

    return events.filter((event) => {
      if (city && event.city.toLowerCase() !== city.toLowerCase()) return false;
      if (minAge && event.minAgeMonths < parseInt(minAge)) return false;
      if (maxAge && event.maxAgeMonths > parseInt(maxAge)) return false;
      if (date && event.date !== date) return false;
      return true;
    });
  }, [searchParams, events]);

  // Calculate pagination logic
  const totalPages = Math.ceil(filteredEvents.length / ITEMS_PER_PAGE);
  
  // Get paginated events based on current page
  const visibleEvents = useMemo(() => {
    return filteredEvents.slice(0, page * ITEMS_PER_PAGE);
  }, [filteredEvents, page]);

  // Handler for load more button
  const handleLoadMore = useCallback(() => {
    setPage(prevPage => prevPage + 1);
  }, []);
  
  // Reset pagination when filters change
  useEffect(() => {
    setPage(1);
  }, [searchParams]);

  return (
    <div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visibleEvents.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>

      {visibleEvents.length < filteredEvents.length && (
        <div className="mt-8 flex justify-center">
          <Button onClick={handleLoadMore} variant="outline">
            Load More Events
          </Button>
        </div>
      )}

      {filteredEvents.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">No events found matching your criteria.</p>
          <Button variant="outline" className="mt-4" asChild>
            <Link href="/events">Clear Filters</Link>
          </Button>
        </div>
      )}
    </div>
  )
}

"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import EnhancedDataTable, { Column, TableAction } from "@/components/admin/enhanced-data-table"
import { createEventExportColumns } from "@/lib/export-utils"
import { Badge } from "@/components/ui/badge"
import { Calendar as CalendarIcon, Plus, Search, Filter, Eye, Edit, Copy, Pause, Play, X, MapPin, Building, Trash2, ChevronLeft, ChevronRight, Clock, Users } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths, getDay, startOfWeek, endOfWeek } from "date-fns"
import { cn } from "@/lib/utils"
import { deleteEvent, updateEvent } from "@/services/eventService"
import { getAllCities, City } from "@/services/cityService"
import { getVenuesByCity } from "@/services/venueService"
import { getAllBabyGames, BabyGame } from "@/services/babyGameService"
import { useToast } from "@/hooks/use-toast"
import { TruncatedText } from "@/components/ui/truncated-text"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"



export default function EventsPage() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCity, setSelectedCity] = useState("")
  const [selectedVenue, setSelectedVenue] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [apiEvents, setApiEvents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeletingEvent, setIsDeletingEvent] = useState(false)
  const [eventToDelete, setEventToDelete] = useState<string | null>(null)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [eventToUpdate, setEventToUpdate] = useState<string | null>(null)

  // Calendar view state
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDayEvents, setSelectedDayEvents] = useState<any[]>([])
  const [isEventModalOpen, setIsEventModalOpen] = useState(false)

  // State for filter data from APIs
  const [cities, setCities] = useState<City[]>([])
  const [venues, setVenues] = useState<any[]>([]) // Venues with city details
  const [gameTemplates, setGameTemplates] = useState<BabyGame[]>([])
  const [isLoadingFilters, setIsLoadingFilters] = useState(true)

  // Function to fetch events with complete information
  const fetchEventsWithGames = async () => {
    const response = await fetch('/api/events/get-all-with-games')
    if (!response.ok) {
      throw new Error(`Failed to fetch events: ${response.status}`)
    }
    return response.json()
  }

  // Fetch events from API when component mounts
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch events from the API with complete information
        const eventsData = await fetchEventsWithGames()

        if (eventsData.length === 0) {
          toast({
            title: "No Events Found",
            description: "There are no events in the database. You can create a new event using the 'Create New Event' button.",
            variant: "default",
          })
        }

        setApiEvents(eventsData)
      } catch (err: any) {
        setError(err.message || "Failed to load events")
        toast({
          title: "Error",
          description: err.message || "Failed to load events",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvents()
  }, [])

  // Fetch filter data (cities, venues, game templates) from APIs
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        setIsLoadingFilters(true)

        // Fetch cities and games first
        const [citiesData, gamesData] = await Promise.all([
          getAllCities(),
          getAllBabyGames()
        ])

        setCities(citiesData)
        setGameTemplates(gamesData)

        // Fetch venues for each city using get-by-city API
        try {
          const allVenues: any[] = []

          // Fetch venues for each city
          for (const city of citiesData) {
            if (city.id) {
              try {
                const cityVenues = await getVenuesByCity(city.id)
                // Add city name to each venue
                const venuesWithCityName = cityVenues.map(venue => ({
                  ...venue,
                  city_name: city.city_name
                }))
                allVenues.push(...venuesWithCityName)
              } catch (cityVenueError) {
                // If fetching venues for a specific city fails, continue with other cities
                console.warn(`Failed to fetch venues for city ${city.city_name}:`, cityVenueError)
              }
            }
          }

          setVenues(allVenues)
        } catch (venueError) {
          // If venue fetching fails completely, set empty array
          setVenues([])
        }
      } catch (err: any) {
        toast({
          title: "Warning",
          description: "Some filter options may not be available due to a loading error.",
          variant: "default",
        })
      } finally {
        setIsLoadingFilters(false)
      }
    }

    fetchFilterData()
  }, [])

  // Track if we have any valid events in the database
  const [hasValidEvents, setHasValidEvents] = useState<boolean>(false);

  // Convert API events to the format expected by the UI and filter out invalid events
  const convertedEvents = useMemo(() => {
    if (!apiEvents || !Array.isArray(apiEvents)) return [];
    
    const validEvents = apiEvents
      .map((apiEvent: any) => {
        // Skip events that are completely empty or invalid
        if (!apiEvent || !apiEvent.event_id) return null;
        
        // Extract games from the nested structure
        const games = apiEvent.games || [];
        const gameNames = games.map((game: any) => game.custom_title || game.game_title);
        const uniqueGameNames = [...new Set(gameNames.filter(Boolean))]; // Remove duplicates and empty values

        // Create the event object
        const event = {
          id: apiEvent.event_id.toString(),
          title: apiEvent.event_title || "Untitled Event",
          gameTemplate: uniqueGameNames.length > 0 ? uniqueGameNames.join(", ") : "No games",
          venue: apiEvent.venue?.venue_name,
          venueId: apiEvent.venue?.venue_id?.toString(),
          city: apiEvent.city?.city_name,
          date: apiEvent.event_date ? apiEvent.event_date.split('T')[0] : null, // Format date to YYYY-MM-DD
          slots: games.map((game: any, index: number) => ({
            id: `${apiEvent.event_id}-${game.game_id || 'unknown'}-${index}`,
            time: game.start_time && game.end_time ? `${game.start_time} - ${game.end_time}` : null,
            capacity: game.max_participants || 0,
            booked: 0, // API doesn't provide this information
            status: "active" // Default status
          })).filter((slot: any) => slot.time !== null), // Only keep slots with valid times
          status: apiEvent.event_status ? apiEvent.event_status.toLowerCase() : "draft",
          _isValid: true // Flag to indicate this is a valid event
        };

        // Check if this is a valid event (has at least some valid data)
        const isValidEvent = 
          event.title !== "Untitled Event" ||
          event.venue ||
          event.city ||
          event.date ||
          (event.slots && event.slots.length > 0);

        return isValidEvent ? event : null;
      })
      .filter(Boolean); // Remove any null entries (invalid events)

    return validEvents;
  }, [apiEvents]);

  // Update hasValidEvents when apiEvents changes
  useEffect(() => {
    if (apiEvents && Array.isArray(apiEvents)) {
      // Check if we have any valid events (not just empty or invalid ones)
      const hasAnyValidEvents = apiEvents.some(apiEvent => {
        if (!apiEvent || !apiEvent.event_id) return false;
        return (
          apiEvent.event_title ||
          apiEvent.venue?.venue_name ||
          apiEvent.city?.city_name ||
          apiEvent.event_date ||
          (apiEvent.games && apiEvent.games.length > 0)
        );
      });
      setHasValidEvents(hasAnyValidEvents);
    } else {
      setHasValidEvents(false);
    }
  }, [apiEvents]);

  // Use the processed events
  const eventsToUse = convertedEvents;

  // Filter events based on search and filters
  const filteredEvents = eventsToUse.filter((event) => {
    // Search query filter
    if (
      searchQuery &&
      !event.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !event.gameTemplate.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !event.venue.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !event.city.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false
    }

    // City filter
    if (selectedCity && event.city !== selectedCity) {
      return false
    }

    // Venue filter
    if (selectedVenue && event.venue !== selectedVenue) {
      return false
    }

    // Game template filter
    if (selectedTemplate && event.gameTemplate !== selectedTemplate) {
      return false
    }

    // Status filter
    if (selectedStatus && event.status !== selectedStatus) {
      return false
    }

    // Date filter
    if (selectedDate && event.date !== format(selectedDate, "yyyy-MM-dd")) {
      return false
    }

    return true
  })

  // Define table columns for EnhancedDataTable
  const columns: Column<any>[] = [
    {
      key: 'title',
      label: 'Event',
      sortable: true,
      render: (value) => (
        <TruncatedText
          text={value}
          maxLength={50}
          showTooltip={true}
        />
      )
    },
    {
      key: 'gameTemplate',
      label: 'Games',
      sortable: true,
      render: (value) => (
        <div className="max-w-[200px]">
          {value && typeof value === 'string' ?
            value.split(", ").map((game, index) => (
              <Badge key={index} variant="outline" className="mr-1 mb-1">
                {game}
              </Badge>
            )) : (
              <Badge variant="outline">Unknown</Badge>
            )
          }
        </div>
      )
    },
    {
      key: 'venue',
      label: 'Venue',
      sortable: true,
      render: (value, row) => (
        <Link
          href={`/admin/events/venues/${row.venueId}`}
          className="flex items-center hover:underline"
        >
          <Building className="mr-1 h-3 w-3 text-muted-foreground" />
          {value}
        </Link>
      )
    },
    {
      key: 'city',
      label: 'City',
      sortable: true,
      render: (value) => (
        <Link
          href={`/admin/events/cities/${encodeURIComponent(value)}`}
          className="flex items-center hover:underline"
        >
          <MapPin className="mr-1 h-3 w-3 text-muted-foreground" />
          {value}
        </Link>
      )
    },
    {
      key: 'date',
      label: 'Date',
      sortable: true
    },
    {
      key: 'slots',
      label: 'Slots',
      render: (value) => (
        <div className="flex flex-col gap-1">
          {value && Array.isArray(value) && value.length > 0 ?
            value.map((slot: any) => (
              <div key={slot.id} className="flex items-center gap-2 text-xs">
                <Badge
                  variant="outline"
                  className={cn(
                    "h-1.5 w-1.5 rounded-full p-0",
                    slot.status === "active" && "bg-green-500",
                    slot.status === "paused" && "bg-amber-500",
                    slot.status === "cancelled" && "bg-red-500"
                  )}
                />
                <span>
                  {slot.time} ({slot.booked}/{slot.capacity})
                </span>
              </div>
            )) : (
              <span className="text-xs text-muted-foreground">No slots</span>
            )
          }
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => {
        const statusColors = {
          published: 'bg-green-500 hover:bg-green-600',
          draft: 'outline',
          paused: 'bg-amber-500 hover:bg-amber-600',
          cancelled: 'bg-red-500 hover:bg-red-600',
          completed: 'bg-blue-500 hover:bg-blue-600'
        }
        const variant = value === 'draft' ? 'outline' : undefined
        const className = statusColors[value as keyof typeof statusColors] || ''

        return (
          <Badge variant={variant} className={variant ? undefined : className}>
            {value.charAt(0).toUpperCase() + value.slice(1)}
          </Badge>
        )
      }
    }
  ]

  // Define table actions
  const actions: TableAction<any>[] = [
    {
      label: "View",
      icon: <Eye className="h-4 w-4" />,
      onClick: (event) => {
        window.location.href = `/admin/events/${event.id}`
      }
    },
    {
      label: "Edit",
      icon: <Edit className="h-4 w-4" />,
      onClick: (event) => {
        window.location.href = `/admin/events/${event.id}/edit`
      }
    },

    {
      label: event => event.status === "published" ? "Pause" : "Resume",
      icon: event => event.status === "published" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />,
      onClick: (event) => handleToggleEventStatus(event.id, event.status),
      disabled: (event) => isUpdatingStatus && eventToUpdate === event.id
    },
    {
      label: "Cancel",
      icon: <X className="h-4 w-4" />,
      onClick: (event) => handleCancelEvent(event.id),
      disabled: (event) => isUpdatingStatus && eventToUpdate === event.id,
      variant: 'destructive'
    },
    {
      label: "Delete",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (event) => handleDeleteEvent(event.id),
      disabled: (event) => isDeletingEvent && eventToDelete === event.id,
      variant: 'destructive'
    }
  ]

  // Handle event deletion
  const handleDeleteEvent = async (eventId: string) => {
    if (!eventId) return;

    try {
      setIsDeletingEvent(true);
      setEventToDelete(eventId);

      // Call the API to delete the event
      const result = await deleteEvent(Number(eventId));

      // Check if the result indicates success (either directly or as an array with success property)
      const isSuccess = (result && typeof result === 'object' && 'success' in result && result.success) ||
                        (Array.isArray(result) && result[0]?.success === true);

      if (isSuccess) {
        toast({
          title: "Success",
          description: "Event deleted successfully",
        });

        // Remove the deleted event from the state
        setApiEvents(prevEvents => {
          const filteredEvents = (prevEvents || []).filter(event => event.event_id.toString() !== eventId);
          return filteredEvents;
        });

        // Reset the event to delete
        setEventToDelete(null);
      } else {
        throw new Error("Failed to delete event. Please try again.");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete event. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeletingEvent(false);
      setEventToDelete(null);
    }
  };

  // Handle pause/resume event
  const handleToggleEventStatus = async (eventId: string, currentStatus: string) => {
    try {
      setIsUpdatingStatus(true);
      setEventToUpdate(eventId);

      // Find the event in the current data
      const eventToUpdate = apiEvents.find(event => event.event_id.toString() === eventId);
      if (!eventToUpdate) {
        throw new Error("Event not found");
      }

      // Determine the new status
      const newStatus = currentStatus.toLowerCase() === "published" ? "Paused" : "Published";

      // Prepare the update data with all required fields
      const updateData = {
        id: Number(eventId),
        title: eventToUpdate.event_title,
        description: eventToUpdate.event_description,
        city_id: eventToUpdate.city?.city_id || eventToUpdate.city_id,
        venue_id: eventToUpdate.venue?.venue_id || eventToUpdate.venue_id,
        event_date: eventToUpdate.event_date.split('T')[0], // Format as YYYY-MM-DD
        status: newStatus,
        updated_at: new Date().toISOString(),
        games: eventToUpdate.games || []
      };

      // Call the API to update the event status
      const result = await updateEvent(updateData);

      // Check if the result indicates success
      const isSuccess = (result && typeof result === 'object' && 'success' in result && result.success) ||
                        (Array.isArray(result) && result[0]?.success === true);

      if (isSuccess) {
        toast({
          title: "Success",
          description: `Event ${newStatus.toLowerCase()} successfully`,
        });

        // Update the event status in the state
        setApiEvents(prevEvents => {
          return prevEvents.map(event =>
            event.event_id.toString() === eventId
              ? { ...event, event_status: newStatus }
              : event
          );
        });
      } else {
        throw new Error(`Failed to ${newStatus.toLowerCase()} event. Please try again.`);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to update event status. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsUpdatingStatus(false);
      setEventToUpdate(null);
    }
  };

  // Handle cancel event
  const handleCancelEvent = async (eventId: string) => {
    try {
      setIsUpdatingStatus(true);
      setEventToUpdate(eventId);

      // Find the event in the current data
      const eventToCancel = apiEvents.find(event => event.event_id.toString() === eventId);
      if (!eventToCancel) {
        throw new Error("Event not found");
      }

      // Prepare the update data with all required fields
      const updateData = {
        id: Number(eventId),
        title: eventToCancel.event_title,
        description: eventToCancel.event_description,
        city_id: eventToCancel.city?.city_id || eventToCancel.city_id,
        venue_id: eventToCancel.venue?.venue_id || eventToCancel.venue_id,
        event_date: eventToCancel.event_date.split('T')[0], // Format as YYYY-MM-DD
        status: "Cancelled",
        updated_at: new Date().toISOString(),
        games: eventToCancel.games || []
      };

      // Call the API to cancel the event
      const result = await updateEvent(updateData);

      // Check if the result indicates success
      const isSuccess = (result && typeof result === 'object' && 'success' in result && result.success) ||
                        (Array.isArray(result) && result[0]?.success === true);

      if (isSuccess) {
        toast({
          title: "Success",
          description: "Event cancelled successfully",
        });

        // Update the event status in the state
        setApiEvents(prevEvents => {
          return prevEvents.map(event =>
            event.event_id.toString() === eventId
              ? { ...event, event_status: "Cancelled" }
              : event
          );
        });
      } else {
        throw new Error("Failed to cancel event. Please try again.");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel event. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingStatus(false);
      setEventToUpdate(null);
    }
  };

  // Get filtered venues based on selected city
  const filteredVenues = selectedCity
    ? venues.filter((venue) => venue.city_name === selectedCity)
    : venues

  // Calendar helper functions
  const generateCalendarDays = (month: Date) => {
    const start = startOfWeek(startOfMonth(month))
    const end = endOfWeek(endOfMonth(month))
    return eachDayOfInterval({ start, end })
  }

  const getEventsForDay = (day: Date) => {
    const dayString = format(day, "yyyy-MM-dd")
    return filteredEvents.filter(event => event.date === dayString)
  }

  const handleDayClick = (day: Date) => {
    const dayEvents = getEventsForDay(day)
    setSelectedDayEvents(dayEvents)
    setIsEventModalOpen(true)
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1))
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'published': return 'bg-green-500'
      case 'paused': return 'bg-amber-500'
      case 'cancelled': return 'bg-red-500'
      case 'draft': return 'bg-gray-500'
      case 'completed': return 'bg-blue-500'
      default: return 'bg-gray-400'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">NIBOG Events</h1>
          <p className="text-muted-foreground">Manage NIBOG baby games events across 21 cities</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/events/cities">
              <MapPin className="mr-2 h-4 w-4" />
              Browse by City
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/events/new">
              <Plus className="mr-2 h-4 w-4" />
              Create New Event
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="list" className="space-y-4">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <TabsList>
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          </TabsList>

          <div className="flex flex-1 items-center gap-2 sm:justify-end">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                  <span className="sr-only">Filter</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                  <h4 className="font-medium">Filter Events</h4>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Select value={selectedCity} onValueChange={setSelectedCity}>
                      <SelectTrigger id="city">
                        <SelectValue placeholder="All Cities" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Cities</SelectItem>
                        {cities.map((city) => (
                          <SelectItem key={city.id} value={city.city_name}>
                            {city.city_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="venue">Venue</Label>
                    <Select value={selectedVenue} onValueChange={setSelectedVenue}>
                      <SelectTrigger id="venue">
                        <SelectValue placeholder="All Venues" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Venues</SelectItem>
                        {filteredVenues.map((venue) => (
                          <SelectItem key={venue.id} value={venue.venue_name}>
                            {venue.venue_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="template">Game Template</Label>
                    <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                      <SelectTrigger id="template">
                        <SelectValue placeholder="All Templates" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Templates</SelectItem>
                        {gameTemplates.map((template) => (
                          <SelectItem key={template.id} value={template.game_name}>
                            {template.game_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger id="status">
                        <SelectValue placeholder="All Statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Statuses</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="paused">Paused</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !selectedDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchQuery("")
                        setSelectedCity("")
                        setSelectedVenue("")
                        setSelectedTemplate("")
                        setSelectedStatus("")
                        setSelectedDate(undefined)
                      }}
                    >
                      Reset Filters
                    </Button>
                    <Button>Apply Filters</Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <TabsContent value="list" className="space-y-4">
          <EnhancedDataTable
            data={filteredEvents}
            columns={columns}
            actions={actions}
            loading={isLoading}
            searchable={false} // We have custom search above
            filterable={false} // We have custom filters above
            exportable={true}
            selectable={false}
            pagination={true}
            pageSize={25}
            exportColumns={createEventExportColumns()}
            exportTitle="NIBOG Events Report"
            exportFilename="nibog-events"
            emptyMessage={!hasValidEvents ? "No events found. Get started by creating your first event." : "No matching events. Try adjusting your search or filter criteria."}
            className="min-h-[400px]"
          />
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              {isLoading ? (
                <div className="flex h-[400px] items-center justify-center">
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    <span className="ml-2">Loading events...</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Calendar Header */}
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">
                      {format(currentMonth, "MMMM yyyy")}
                    </h2>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => navigateMonth('prev')}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => navigateMonth('next')}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {/* Day headers */}
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                        {day}
                      </div>
                    ))}

                    {/* Calendar days */}
                    {generateCalendarDays(currentMonth).map((day, index) => {
                      const dayEvents = getEventsForDay(day)
                      const isCurrentMonth = format(day, 'M') === format(currentMonth, 'M')
                      const isCurrentDay = isToday(day)

                      return (
                        <div
                          key={index}
                          className={cn(
                            "min-h-[100px] p-1 border border-border cursor-pointer hover:bg-muted/50 transition-colors",
                            !isCurrentMonth && "bg-muted/20 text-muted-foreground",
                            isCurrentDay && "bg-primary/10 border-primary"
                          )}
                          onClick={() => handleDayClick(day)}
                        >
                          <div className="flex flex-col h-full">
                            <div className={cn(
                              "text-sm font-medium mb-1",
                              isCurrentDay && "text-primary font-bold"
                            )}>
                              {format(day, 'd')}
                            </div>

                            <div className="flex-1 space-y-1">
                              {dayEvents.slice(0, 3).map((event, eventIndex) => (
                                <div
                                  key={eventIndex}
                                  className={cn(
                                    "text-xs p-1 rounded text-white truncate",
                                    getStatusColor(event.status)
                                  )}
                                  title={`${event.title} - ${event.status}`}
                                >
                                  {event.title}
                                </div>
                              ))}

                              {dayEvents.length > 3 && (
                                <div className="text-xs text-muted-foreground">
                                  +{dayEvents.length - 3} more
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Legend */}
                  <div className="flex flex-wrap gap-4 pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-green-500"></div>
                      <span className="text-sm">Published</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-amber-500"></div>
                      <span className="text-sm">Paused</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-red-500"></div>
                      <span className="text-sm">Cancelled</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-gray-500"></div>
                      <span className="text-sm">Draft</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-blue-500"></div>
                      <span className="text-sm">Completed</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Event Details Modal */}
      <Dialog open={isEventModalOpen} onOpenChange={setIsEventModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Events for {selectedDayEvents.length > 0 && format(new Date(selectedDayEvents[0].date), "MMMM d, yyyy")}
            </DialogTitle>
            <DialogDescription>
              {selectedDayEvents.length} event{selectedDayEvents.length !== 1 ? 's' : ''} scheduled for this day
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {selectedDayEvents.length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No events scheduled for this day</p>
              </div>
            ) : (
              selectedDayEvents.map((event) => (
                <Card key={event.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold">
                          <TruncatedText
                            text={event.title}
                            maxLength={60}
                            showTooltip={true}
                          />
                        </h3>
                        {event.status === "published" && (
                          <Badge className="bg-green-500 hover:bg-green-600">Published</Badge>
                        )}
                        {event.status === "draft" && (
                          <Badge variant="outline">Draft</Badge>
                        )}
                        {event.status === "paused" && (
                          <Badge className="bg-amber-500 hover:bg-amber-600">Paused</Badge>
                        )}
                        {event.status === "cancelled" && (
                          <Badge className="bg-red-500 hover:bg-red-600">Cancelled</Badge>
                        )}
                        {event.status === "completed" && (
                          <Badge className="bg-blue-500 hover:bg-blue-600">Completed</Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{event.city}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <span>{event.venue}</span>
                        </div>
                      </div>

                      <div className="mt-3">
                        <div className="text-sm font-medium mb-2">Games:</div>
                        <div className="flex flex-wrap gap-1">
                          {event.gameTemplate && typeof event.gameTemplate === 'string' ?
                            event.gameTemplate.split(", ").map((game: string, index: number) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {game}
                              </Badge>
                            )) : (
                              <Badge variant="outline" className="text-xs">Unknown</Badge>
                            )
                          }
                        </div>
                      </div>

                      {event.slots && event.slots.length > 0 && (
                        <div className="mt-3">
                          <div className="text-sm font-medium mb-2">Time Slots:</div>
                          <div className="space-y-1">
                            {event.slots.map((slot: any) => (
                              <div key={slot.id} className="flex items-center gap-2 text-sm">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                <span>{slot.time}</span>
                                <Users className="h-3 w-3 text-muted-foreground ml-2" />
                                <span>{slot.booked}/{slot.capacity}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/events/${event.id}`}>
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View details</span>
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/events/${event.id}/edit`}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit event</span>
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/events/clone/${event.id}`}>
                          <Copy className="h-4 w-4" />
                          <span className="sr-only">Clone event</span>
                        </Link>
                      </Button>

                      {/* Action buttons with same functionality as table view */}
                      {event.status === "published" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleEventStatus(event.id, event.status)}
                          disabled={isUpdatingStatus && eventToUpdate === event.id}
                        >
                          {isUpdatingStatus && eventToUpdate === event.id ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                          ) : (
                            <Pause className="h-4 w-4" />
                          )}
                          <span className="sr-only">Pause event</span>
                        </Button>
                      )}
                      {event.status === "paused" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleEventStatus(event.id, event.status)}
                          disabled={isUpdatingStatus && eventToUpdate === event.id}
                        >
                          {isUpdatingStatus && eventToUpdate === event.id ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                          <span className="sr-only">Resume event</span>
                        </Button>
                      )}
                      {(event.status === "published" || event.status === "paused" || event.status === "draft") && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <X className="h-4 w-4" />
                              <span className="sr-only">Cancel event</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Cancel Event</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to cancel this event? This will prevent any new bookings, but existing bookings will be maintained. This action can be reversed by editing the event status.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleCancelEvent(event.id)}
                                disabled={isUpdatingStatus && eventToUpdate === event.id}
                                className="bg-orange-500 hover:bg-orange-600"
                              >
                                {isUpdatingStatus && eventToUpdate === event.id ? (
                                  <>
                                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                    Cancelling...
                                  </>
                                ) : (
                                  "Cancel Event"
                                )}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4 text-red-500" />
                            <span className="sr-only">Delete event</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Event</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this event? This action cannot be undone.
                              All registrations and data associated with this event will be permanently removed.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteEvent(event.id)}
                              disabled={isDeletingEvent && eventToDelete === event.id}
                              className="bg-red-500 hover:bg-red-600"
                            >
                              {isDeletingEvent && eventToDelete === event.id ? (
                                <>
                                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                  Deleting...
                                </>
                              ) : (
                                "Delete Event"
                              )}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

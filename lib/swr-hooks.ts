"use client"

import useSWR from 'swr'
import { EventListItem } from '@/types'
import { getAllEvents as fetchAllEvents } from '@/services/eventService'
import { getAllPayments as fetchAllPayments } from '@/services/paymentService'
import { getAllEventsWithGames } from '@/services/eventGameService'

// Types for user bookings
export interface UserBookingGame {
  game_id: number;
  game_name: string;
  description: string;
  duration_minutes: number;
  child_id: number;
  attendance_status: string;
  slot_info: {
    slot_id: number;
    custom_title: string;
    custom_description: string;
    custom_price: number;
    slot_price: number;
    start_time: string;
    end_time: string;
    max_participants: number;
  } | null;
}

export interface UserBookingAddon {
  addon_id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  has_variants: boolean;
  quantity: number;
}

export interface UserBookingEvent {
  event_id: number;
  title: string;
  description: string;
  event_date: string;
  status: string;
}

export interface UserBooking {
  booking_id: number;
  booking_ref: string;
  status: string;
  total_amount: number;
  payment_status: string;
  created_at: string;
  event: UserBookingEvent;
  games: UserBookingGame[] | null;
  addons: UserBookingAddon[] | null;
}

export interface UserBookingsResponse {
  user_id: number;
  full_name: string;
  email: string;
  phone: string;
  city_id: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  bookings: UserBooking[];
}

// Global fetcher function for SWR
const fetcher = async (url: string) => {
  const res = await fetch(url)
  
  // If the status code is not in the range 200-299, throw an error
  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.')
    throw error
  }
  
  return res.json()
}

// Transform API response to EventListItem format expected by UI
function transformEventsData(apiEvents: any[]): EventListItem[] {
  return apiEvents.map((event: any) => {
    // Calculate age range from games if available
    let minAgeMonths = 6; // default
    let maxAgeMonths = 84; // default
    let price = 799; // default
    let totalSpots = 20; // default
    let spotsLeft = 15; // default

    // Extract information from games if available
    if (event.games && event.games.length > 0) {
      const prices = event.games.map((game: any) => game.custom_price || game.slot_price || 799);
      price = Math.min(...prices); // Use lowest price

      const maxParticipants = event.games.map((game: any) => game.max_participants || 20);
      totalSpots = Math.max(...maxParticipants); // Use highest capacity
      spotsLeft = Math.floor(totalSpots * 0.75); // Assume 75% availability
    }

    // Format date and time
    const eventDate = new Date(event.event_date);
    const formattedDate = eventDate.toISOString().split('T')[0]; // YYYY-MM-DD format
    const formattedTime = "9:00 AM - 8:00 PM"; // Default time range

    return {
      id: event.event_id?.toString() || Math.random().toString(),
      title: event.event_title || 'Baby Game Event',
      description: event.event_description || 'Fun baby games event',
      minAgeMonths,
      maxAgeMonths,
      date: formattedDate,
      time: formattedTime,
      venue: event.venue?.venue_name || 'Indoor Stadium',
      city: event.city?.city_name || 'Unknown City',
      price,
      image: '/images/baby-crawling.jpg', // Default image
      spotsLeft,
      totalSpots,
      isOlympics: true, // Default to Olympics event
    };
  });
}

/**
 * Hook to fetch all events with SWR caching and revalidation
 * @param initialData Optional initial data
 * @returns Events data and loading/error states
 */
export function useEvents(initialData?: EventListItem[]) {
  const { data, error, isLoading, mutate } = useSWR<EventListItem[]>(
    'api/events',
    // Use the comprehensive events API that includes games, cities, and venues
    async () => {
      try {
        const apiEvents = await getAllEventsWithGames();
        return transformEventsData(apiEvents);
      } catch (err) {
        console.error('Failed to fetch events with games, falling back to basic events:', err);
        // Fallback to basic events API if comprehensive API fails
        const basicEvents = await fetchAllEvents();
        // Transform basic events to expected format (they have different structure)
        return basicEvents.map((event: any) => ({
          id: event.event_id?.toString() || Math.random().toString(),
          title: event.event_title || 'Baby Game Event',
          description: event.event_description || 'Fun baby games event',
          minAgeMonths: 6,
          maxAgeMonths: 84,
          date: new Date(event.event_date).toISOString().split('T')[0],
          time: "9:00 AM - 8:00 PM",
          venue: event.venue_name || 'Indoor Stadium',
          city: event.city_name || 'Unknown City',
          price: 799,
          image: '/images/baby-crawling.jpg',
          spotsLeft: 15,
          totalSpots: 20,
          isOlympics: true,
        }));
      }
    },
    {
      fallbackData: initialData,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 300000, // 5 minutes
    }
  )

  return {
    events: data || [],
    isLoading,
    isError: !!error,
    mutate,
  }
}

/**
 * Hook to fetch all payments with SWR caching and revalidation
 */
export function usePayments() {
  const { data, error, isLoading, mutate } = useSWR(
    'api/payments',
    // Use the existing getAllPayments function to maintain compatibility
    () => fetchAllPayments(),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 300000, // 5 minutes
    }
  )

  return {
    payments: data || [],
    isLoading,
    isError: !!error,
    mutate,
  }
}

/**
 * Hook to fetch user bookings with SWR caching and revalidation
 * @param userId The user ID to fetch bookings for
 */
export function useUserBookings(userId: number | null) {
  const { data, error, isLoading, mutate } = useSWR<UserBookingsResponse>(
    userId ? `api/bookings/user/${userId}` : null,
    async () => {
      if (!userId) {
        return null;
      }

      const response = await fetch('/api/bookings/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user bookings: ${response.status}`);
      }

      const result = await response.json();

      // The API returns an array with one object containing user data and bookings
      if (Array.isArray(result) && result.length > 0) {
        return result[0];
      }

      return result;
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 300000, // 5 minutes
    }
  );

  return {
    userBookings: data,
    isLoading,
    isError: !!error,
    mutate,
  };
}

/**
 * Generic hook to fetch data from any API endpoint with SWR
 * @param url API endpoint URL
 * @param options SWR options
 */
export function useApi<T>(url: string | null, options = {}) {
  const { data, error, isLoading, mutate } = useSWR<T>(
    url,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000, // 1 minute
      ...options,
    }
  )

  return {
    data,
    isLoading,
    isError: !!error,
    mutate,
  }
}

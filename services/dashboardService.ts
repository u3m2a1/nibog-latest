// Dashboard service for fetching real-time admin dashboard data
import { getAllBookings } from './bookingService'
import { getAllEvents } from './eventService'
import { getAllUsers } from './userService'
import { getAllPayments } from './paymentService'

export interface DashboardMetrics {
  totalRevenue: number
  totalBookings: number
  confirmedBookings: number
  pendingBookings: number
  cancelledBookings: number
  completedBookings: number
  totalUsers: number
  activeUsers: number
  totalEvents: number
  upcomingEvents: number
  completedEvents: number
  averageTicketPrice: number
  monthlyGrowth: {
    revenue: number
    bookings: number
    users: number
  }
}

export interface RevenueData {
  month: string
  revenue: number
  bookings: number
  events: number
  avgTicketPrice: number
}

export interface RecentActivity {
  id: string
  type: 'booking' | 'payment' | 'user' | 'event' | 'system'
  title: string
  description: string
  timestamp: Date
  metadata?: Record<string, any>
}

// Cache for dashboard data
let dashboardCache: {
  metrics?: { data: DashboardMetrics; timestamp: number }
  revenueData?: { data: RevenueData[]; timestamp: number }
  recentActivity?: { data: RecentActivity[]; timestamp: number }
} = {}

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const cacheKey = 'metrics'
  const now = Date.now()
  
  // Check cache first
  if (dashboardCache.metrics && (now - dashboardCache.metrics.timestamp) < CACHE_DURATION) {
    return dashboardCache.metrics.data
  }

  try {
    // Fetch all required data in parallel
    const [bookings, events, users, payments] = await Promise.all([
      getAllBookings(),
      getAllEvents(),
      getAllUsers(),
      getAllPayments()
    ])

    // Calculate metrics from real data
    const totalBookings = bookings.length
    const confirmedBookings = bookings.filter(b => b.booking_status?.toLowerCase() === 'confirmed').length
    const pendingBookings = bookings.filter(b => b.booking_status?.toLowerCase() === 'pending').length
    const cancelledBookings = bookings.filter(b => b.booking_status?.toLowerCase() === 'cancelled').length
    const completedBookings = bookings.filter(b => b.booking_status?.toLowerCase() === 'completed').length

    const totalRevenue = bookings
      .filter(b => ['confirmed', 'completed'].includes(b.booking_status?.toLowerCase() || ''))
      .reduce((sum, b) => sum + parseFloat(b.total_amount || '0'), 0)

    const totalUsers = users.length
    const activeUsers = users.filter(u => u.is_active).length

    const totalEvents = events.length
    const now = new Date()
    const upcomingEvents = events.filter(e => new Date(e.event_date) > now).length
    const completedEvents = events.filter(e => new Date(e.event_date) <= now).length

    const averageTicketPrice = totalBookings > 0 ? totalRevenue / totalBookings : 0

    // Calculate monthly growth (simplified - comparing last 30 days vs previous 30 days)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

    const recentBookings = bookings.filter(b => new Date(b.booking_created_at) > thirtyDaysAgo)
    const previousBookings = bookings.filter(b => {
      const date = new Date(b.booking_created_at)
      return date > sixtyDaysAgo && date <= thirtyDaysAgo
    })

    const recentRevenue = recentBookings
      .filter(b => ['confirmed', 'completed'].includes(b.booking_status?.toLowerCase() || ''))
      .reduce((sum, b) => sum + parseFloat(b.total_amount || '0'), 0)
    
    const previousRevenue = previousBookings
      .filter(b => ['confirmed', 'completed'].includes(b.booking_status?.toLowerCase() || ''))
      .reduce((sum, b) => sum + parseFloat(b.total_amount || '0'), 0)

    const recentUsers = users.filter(u => new Date(u.created_at) > thirtyDaysAgo)
    const previousUsers = users.filter(u => {
      const date = new Date(u.created_at)
      return date > sixtyDaysAgo && date <= thirtyDaysAgo
    })

    const metrics: DashboardMetrics = {
      totalRevenue,
      totalBookings,
      confirmedBookings,
      pendingBookings,
      cancelledBookings,
      completedBookings,
      totalUsers,
      activeUsers,
      totalEvents,
      upcomingEvents,
      completedEvents,
      averageTicketPrice,
      monthlyGrowth: {
        revenue: previousRevenue > 0 ? ((recentRevenue - previousRevenue) / previousRevenue) * 100 : 0,
        bookings: previousBookings.length > 0 ? ((recentBookings.length - previousBookings.length) / previousBookings.length) * 100 : 0,
        users: previousUsers.length > 0 ? ((recentUsers.length - previousUsers.length) / previousUsers.length) * 100 : 0,
      }
    }

    // Cache the result
    dashboardCache.metrics = { data: metrics, timestamp: now }
    
    return metrics
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error)
    throw error
  }
}

export async function getRevenueData(): Promise<RevenueData[]> {
  const cacheKey = 'revenueData'
  const now = Date.now()
  
  // Check cache first
  if (dashboardCache.revenueData && (now - dashboardCache.revenueData.timestamp) < CACHE_DURATION) {
    return dashboardCache.revenueData.data
  }

  try {
    const [bookings, events] = await Promise.all([
      getAllBookings(),
      getAllEvents()
    ])

    // Group bookings by month for the last 12 months
    const monthlyData: Record<string, {
      revenue: number
      bookings: number
      events: Set<number>
    }> = {}

    const twelveMonthsAgo = new Date()
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)

    // Initialize last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthKey = date.toISOString().slice(0, 7) // YYYY-MM format
      monthlyData[monthKey] = {
        revenue: 0,
        bookings: 0,
        events: new Set()
      }
    }

    // Process bookings
    bookings.forEach(booking => {
      const bookingDate = new Date(booking.booking_created_at)
      if (bookingDate > twelveMonthsAgo) {
        const monthKey = bookingDate.toISOString().slice(0, 7)
        if (monthlyData[monthKey]) {
          monthlyData[monthKey].bookings++
          if (['confirmed', 'completed'].includes(booking.booking_status?.toLowerCase() || '')) {
            monthlyData[monthKey].revenue += parseFloat(booking.total_amount || '0')
          }
          if (booking.event_id) {
            monthlyData[monthKey].events.add(booking.event_id)
          }
        }
      }
    })

    // Convert to array format
    const revenueData: RevenueData[] = Object.entries(monthlyData).map(([month, data]) => {
      const avgTicketPrice = data.bookings > 0 ? data.revenue / data.bookings : 0
      return {
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short' }),
        revenue: data.revenue,
        bookings: data.bookings,
        events: data.events.size,
        avgTicketPrice
      }
    })

    // Cache the result
    dashboardCache.revenueData = { data: revenueData, timestamp: now }
    
    return revenueData
  } catch (error) {
    console.error('Error fetching revenue data:', error)
    throw error
  }
}

export async function getRecentActivity(): Promise<RecentActivity[]> {
  const cacheKey = 'recentActivity'
  const now = Date.now()
  
  // Check cache first
  if (dashboardCache.recentActivity && (now - dashboardCache.recentActivity.timestamp) < CACHE_DURATION) {
    return dashboardCache.recentActivity.data
  }

  try {
    const [bookings, users, payments] = await Promise.all([
      getAllBookings(),
      getAllUsers(),
      getAllPayments()
    ])

    const activities: RecentActivity[] = []

    // Recent bookings (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    
    bookings
      .filter(b => new Date(b.booking_created_at) > oneDayAgo)
      .slice(0, 5)
      .forEach(booking => {
        activities.push({
          id: `booking-${booking.booking_id}`,
          type: 'booking',
          title: 'New Booking Received',
          description: `${booking.event_title} - ${booking.parent_name}`,
          timestamp: new Date(booking.booking_created_at),
          metadata: { bookingId: booking.booking_id, status: booking.booking_status }
        })
      })

    // Recent users (last 24 hours)
    users
      .filter(u => new Date(u.created_at) > oneDayAgo)
      .slice(0, 3)
      .forEach(user => {
        activities.push({
          id: `user-${user.user_id}`,
          type: 'user',
          title: 'New User Registration',
          description: `${user.full_name} from ${user.city_name}`,
          timestamp: new Date(user.created_at),
          metadata: { userId: user.user_id }
        })
      })

    // Recent payments (last 24 hours)
    payments
      .filter(p => new Date(p.payment_date) > oneDayAgo)
      .slice(0, 5)
      .forEach(payment => {
        activities.push({
          id: `payment-${payment.payment_id}`,
          type: 'payment',
          title: 'Payment Confirmed',
          description: `₹${payment.amount} - ${payment.payment_method}`,
          timestamp: new Date(payment.payment_date),
          metadata: { paymentId: payment.payment_id, amount: payment.amount }
        })
      })

    // Sort by timestamp (most recent first) and limit to 10
    const sortedActivities = activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10)

    // Cache the result
    dashboardCache.recentActivity = { data: sortedActivities, timestamp: now }
    
    return sortedActivities
  } catch (error) {
    console.error('Error fetching recent activity:', error)
    throw error
  }
}

// Clear cache function for manual refresh
export function clearDashboardCache() {
  dashboardCache = {}
}

// Auto-refresh function
export function setupAutoRefresh(intervalMs: number = 5 * 60 * 1000) {
  setInterval(() => {
    clearDashboardCache()
  }, intervalMs)
}

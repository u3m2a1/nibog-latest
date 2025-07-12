"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Eye, Edit, Check, X, AlertTriangle, Loader2, RefreshCw, CheckCircle, Mail, Phone } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getAllBookings, getPaginatedBookings, updateBookingStatus, Booking, PaginatedBookingsResponse } from "@/services/bookingService"
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
import EnhancedDataTable, { Column, TableAction, BulkAction } from "@/components/admin/enhanced-data-table"
import { createBookingExportColumns } from "@/lib/export-utils"
import { EmptyBookings, EmptyError } from "@/components/ui/empty-state"
import { SkeletonTable } from "@/components/ui/skeleton-loader"

// Booking statuses for filtering
const statusOptions = [
  { id: "1", name: "Confirmed", value: "confirmed" },
  { id: "2", name: "Pending", value: "pending" },
  { id: "3", name: "Cancelled", value: "cancelled" },
  { id: "4", name: "Completed", value: "completed" },
  { id: "5", name: "No Show", value: "no show" },
  { id: "6", name: "Refunded", value: "refunded" },
]

// Booking statuses
const statuses = [
  { id: "1", name: "Confirmed" },
  { id: "2", name: "Pending" },
  { id: "3", name: "Cancelled" },
  { id: "4", name: "Completed" },
  { id: "5", name: "No Show" },
  { id: "6", name: "Refunded" },
]

const getStatusBadge = (status: string) => {
  switch (status.toLowerCase()) {
    case "confirmed":
      return <Badge className="bg-green-500 hover:bg-green-600">Confirmed</Badge>
    case "pending":
      return <Badge className="bg-yellow-500 hover:bg-yellow-600">Pending</Badge>
    case "cancelled":
      return <Badge className="bg-red-500 hover:bg-red-600">Cancelled</Badge>
    case "completed":
      return <Badge className="bg-blue-500 hover:bg-blue-600">Completed</Badge>
    case "no show":
      return <Badge className="bg-gray-500 hover:bg-gray-600">No Show</Badge>
    case "refunded":
      return <Badge className="bg-purple-500 hover:bg-purple-600">Refunded</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export default function BookingsPage() {
  const { toast } = useToast()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState<number | null>(null)

  // Fetch bookings from API
  const fetchBookings = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await getPaginatedBookings({ page: 1, limit: 1000 })
      // Filter out empty booking objects
      const validBookings = (response.data || []).filter(booking => {
        return booking && Object.keys(booking).length > 0 &&
          Object.values(booking).some(value => value !== null && value !== undefined && value !== '')
      })
      setBookings(validBookings)
    } catch (error: any) {
      console.error("Failed to fetch bookings:", error)
      setError(error.message || "Failed to load bookings. Please try again.")
      toast({
        title: "Error",
        description: "Failed to load bookings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [])

  // Define table columns
  const columns: Column<Booking>[] = [
    {
      key: 'booking_id',
      label: 'Booking ID',
      sortable: true,
      width: '100px',
      render: (value) => <span className="font-mono text-sm">#{value}</span>
    },
    {
      key: 'parent_name',
      label: 'Parent',
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-xs text-muted-foreground">{row.parent_email}</div>
          {row.parent_additional_phone && (
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Phone className="h-3 w-3" />
              {row.parent_additional_phone}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'child_full_name',
      label: 'Child',
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium">{value}</div>
          {row.child_age && (
            <div className="text-xs text-muted-foreground">Age: {row.child_age}</div>
          )}
        </div>
      )
    },
    {
      key: 'event_title',
      label: 'Event',
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-xs text-muted-foreground">{row.city_name}</div>
          <div className="text-xs text-muted-foreground">{row.venue_name}</div>
        </div>
      )
    },
    {
      key: 'total_amount',
      label: 'Amount',
      sortable: true,
      align: 'right',
      width: '100px',
      render: (value) => <span className="font-medium">₹{value}</span>
    },
    {
      key: 'booking_status',
      label: 'Status',
      sortable: true,
      width: '120px',
      render: (value) => getStatusBadge(value)
    },
    {
      key: 'booking_created_at',
      label: 'Booking Date',
      sortable: true,
      width: '120px',
      render: (value) => new Date(value).toLocaleDateString()
    },
  ]

  // Handle confirm booking
  const handleConfirmBooking = async (booking: Booking) => {
    try {
      setIsProcessing(booking.booking_id)
      await updateBookingStatus(booking.booking_id, "Confirmed")

      setBookings(bookings.map(b =>
        b.booking_id === booking.booking_id ? { ...b, booking_status: "Confirmed" } : b
      ))

      toast({
        title: "Success",
        description: `Booking #${booking.booking_id} has been confirmed.`,
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to confirm booking.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(null)
    }
  }

  // Handle cancel booking
  const handleCancelBooking = async (booking: Booking) => {
    try {
      setIsProcessing(booking.booking_id)
      await updateBookingStatus(booking.booking_id, "Cancelled")

      setBookings(bookings.map(b =>
        b.booking_id === booking.booking_id ? { ...b, booking_status: "Cancelled" } : b
      ))

      toast({
        title: "Success",
        description: `Booking #${booking.booking_id} has been cancelled.`,
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel booking.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(null)
    }
  }

  // Define table actions
  const actions: TableAction<Booking>[] = [
    {
      label: "View Details",
      icon: <Eye className="h-4 w-4 mr-2" />,
      onClick: (booking) => window.open(`/admin/bookings/${booking.booking_id}`, '_blank'),
    },
    {
      label: "Edit",
      icon: <Edit className="h-4 w-4 mr-2" />,
      onClick: (booking) => window.open(`/admin/bookings/${booking.booking_id}/edit`, '_blank'),
    },
    {
      label: "Confirm",
      icon: <Check className="h-4 w-4 mr-2" />,
      onClick: handleConfirmBooking,
      disabled: (booking) => booking.booking_status?.toLowerCase() !== 'pending',
    },
    {
      label: "Cancel",
      icon: <X className="h-4 w-4 mr-2" />,
      onClick: handleCancelBooking,
      variant: "destructive",
      disabled: (booking) => !['pending', 'confirmed'].includes(booking.booking_status?.toLowerCase() || ''),
    },
  ]

  // Define bulk actions
  const bulkActions: BulkAction<Booking>[] = [
    {
      label: "Confirm Selected",
      icon: <CheckCircle className="h-4 w-4 mr-2" />,
      onClick: async (selectedBookings) => {
        const pendingBookings = selectedBookings.filter(b => b.booking_status?.toLowerCase() === 'pending')
        if (pendingBookings.length === 0) {
          toast({
            title: "No Action Needed",
            description: "No pending bookings selected.",
          })
          return
        }

        try {
          await Promise.all(pendingBookings.map(booking =>
            updateBookingStatus(booking.booking_id, "Confirmed")
          ))

          setBookings(bookings.map(booking =>
            pendingBookings.some(pb => pb.booking_id === booking.booking_id)
              ? { ...booking, booking_status: "Confirmed" }
              : booking
          ))

          toast({
            title: "Success",
            description: `${pendingBookings.length} bookings confirmed.`,
          })
        } catch (error: any) {
          toast({
            title: "Error",
            description: "Failed to confirm some bookings.",
            variant: "destructive",
          })
        }
      },
    },
    {
      label: "Send Email",
      icon: <Mail className="h-4 w-4 mr-2" />,
      onClick: (selectedBookings) => {
        // Implement bulk email functionality
        toast({
          title: "Feature Coming Soon",
          description: "Bulk email functionality will be available soon.",
        })
      },
    },
  ]



  // Calculate summary statistics
  const confirmedBookings = bookings.filter(b => b.booking_status?.toLowerCase() === 'confirmed').length
  const pendingBookings = bookings.filter(b => b.booking_status?.toLowerCase() === 'pending').length
  const cancelledBookings = bookings.filter(b => b.booking_status?.toLowerCase() === 'cancelled').length
  const completedBookings = bookings.filter(b => b.booking_status?.toLowerCase() === 'completed').length
  const totalRevenue = bookings
    .filter(b => ['confirmed', 'completed'].includes(b.booking_status?.toLowerCase() || ''))
    .reduce((sum, b) => sum + parseFloat(b.total_amount || '0'), 0)

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Bookings</h1>
            <p className="text-muted-foreground">Manage NIBOG event bookings</p>
          </div>
        </div>
        <EmptyError onRetry={fetchBookings} error={error} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bookings</h1>
          <p className="text-muted-foreground">Manage NIBOG event bookings</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={fetchBookings}
            disabled={isLoading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button asChild>
            <Link href="/admin/bookings/new">
              <Eye className="mr-2 h-4 w-4" />
              Create New Booking
            </Link>
          </Button>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{bookings.length}</div>
            <p className="text-xs text-muted-foreground">Total Bookings</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{confirmedBookings}</div>
            <p className="text-xs text-muted-foreground">Confirmed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">{pendingBookings}</div>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">{cancelledBookings}</div>
            <p className="text-xs text-muted-foreground">Cancelled</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total Revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Data Table */}
      <EnhancedDataTable
        data={bookings}
        columns={columns}
        actions={actions}
        bulkActions={bulkActions}
        loading={isLoading}
        searchable={true}
        filterable={true}
        exportable={true}
        selectable={true}
        pagination={true}
        pageSize={25}
        exportColumns={createBookingExportColumns()}
        exportTitle="NIBOG Bookings Report"
        exportFilename="nibog-bookings"
        emptyMessage="No bookings found"
        onRefresh={fetchBookings}
        className="min-h-[400px]"
      />
    </div>
  )
}

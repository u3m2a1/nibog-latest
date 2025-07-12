"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, Eye, Download, RefreshCw, AlertCircle, Edit, Plus } from "lucide-react"
import EnhancedDataTable, { Column, TableAction, BulkAction } from "@/components/admin/enhanced-data-table"
import { createPaymentExportColumns } from "@/lib/export-utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import {
  getAllPayments,
  getPaymentAnalytics,
  exportPayments,
  Payment,
  PaymentAnalytics
} from "@/services/paymentService"
import { getAllEvents } from "@/services/eventService"
import { ExportPaymentsModal, ExportFilters } from "@/components/admin/ExportPaymentsModal"
import { PaymentStatusEditDialog } from "@/components/admin/PaymentStatusEditDialog"

// Payment status mapping
const getStatusBadge = (status: string) => {
  switch (status) {
    case "successful":
      return <Badge className="bg-green-500 hover:bg-green-600">Successful</Badge>
    case "pending":
      return <Badge className="bg-yellow-500 hover:bg-yellow-600">Pending</Badge>
    case "failed":
      return <Badge className="bg-red-500 hover:bg-red-600">Failed</Badge>
    case "refunded":
      return <Badge className="bg-blue-500 hover:bg-blue-600">Refunded</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

// Payment methods and statuses
const paymentMethods = [
  { id: "1", name: "PhonePe" },
  { id: "2", name: "Credit Card" },
  { id: "3", name: "Debit Card" },
  { id: "4", name: "UPI" },
  { id: "5", name: "Net Banking" },
  { id: "6", name: "Wallet" },
]

const statuses = [
  { id: "1", name: "successful" },
  { id: "2", name: "pending" },
  { id: "3", name: "failed" },
  { id: "4", name: "refunded" },
]

export default function PaymentsPage() {
  // State management
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMethod, setSelectedMethod] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedEvent, setSelectedEvent] = useState("all")
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [payments, setPayments] = useState<Payment[]>([])
  const [analytics, setAnalytics] = useState<PaymentAnalytics | null>(null)
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [exportModalOpen, setExportModalOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [statusEditDialogOpen, setStatusEditDialogOpen] = useState(false)
  const [selectedPaymentForEdit, setSelectedPaymentForEdit] = useState<Payment | null>(null)

  // Fetch events data
  const fetchEvents = async () => {
    try {
      const eventsData = await getAllEvents()
      setEvents(eventsData)
    } catch (error) {
      console.error("Error fetching events:", error)
      // Don't show error toast for events as it's not critical
    }
  }

  // Fetch payments data
  const fetchPayments = async () => {
    try {
      setLoading(true)
      const filters = {
        status: selectedStatus !== "all" ? selectedStatus : undefined,
        event_id: selectedEvent !== "all" ? parseInt(selectedEvent) : undefined,
        start_date: selectedDate ? format(selectedDate, "yyyy-MM-dd") : undefined,
        end_date: selectedDate ? format(selectedDate, "yyyy-MM-dd") : undefined,
        search: searchQuery || undefined,
      }

      // Fetch payments first
      const paymentsData = await getAllPayments(filters)
      setPayments(paymentsData)

      // Try to fetch analytics, but don't fail if it doesn't work
      try {
        const analyticsData = await getPaymentAnalytics(filters)
        setAnalytics(analyticsData)
      } catch (analyticsError) {
        console.error("Error fetching analytics:", analyticsError)
        // Set analytics to null so we fall back to calculated values
        setAnalytics(null)
      }

    } catch (error) {
      console.error("Error fetching payments:", error)
      toast.error("Failed to fetch payments data")
    } finally {
      setLoading(false)
    }
  }

  // Refresh data
  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchPayments()
    setRefreshing(false)
    toast.success("Payments data refreshed")
  }

  // Handle export payments with modal
  const handleExportPayments = async (exportFilters: ExportFilters) => {
    try {
      setIsExporting(true)

      const result = await exportPayments(exportFilters)
      toast.success(result)
      setExportModalOpen(false)
    } catch (error) {
      console.error("Error exporting payments:", error)
      toast.error("Failed to export payments")
    } finally {
      setIsExporting(false)
    }
  }

  // Open export modal
  const openExportModal = () => {
    setExportModalOpen(true)
  }

  // Handle clear date filter
  const handleClearDate = () => {
    setSelectedDate(undefined)
  }

  // Handle event name click to filter by event
  const handleEventClick = (eventTitle: string) => {
    const event = events.find(e => e.event_title === eventTitle)
    if (event) {
      setSelectedEvent(event.event_id.toString())
    }
  }

  // Handle edit status
  const handleEditStatus = (payment: Payment) => {
    setSelectedPaymentForEdit(payment)
    setStatusEditDialogOpen(true)
  }

  // Handle status update
  const handleStatusUpdate = (updatedPayment: Payment) => {
    // Update the payment in the list
    setPayments(prev => prev.map(p =>
      p.payment_id === updatedPayment.payment_id ? updatedPayment : p
    ))

    // Show success message
    const isRefund = updatedPayment.payment_status === 'refunded'
    toast.success(
      isRefund
        ? `Refund processed successfully for ₹${updatedPayment.amount}`
        : `Payment status updated to ${updatedPayment.payment_status}`
    )
  }

  // Check if edit status should be disabled
  const isEditStatusDisabled = (status: string) => {
    return status === 'refunded' || status === 'failed'
  }

  // Load events on component mount
  useEffect(() => {
    fetchEvents()
  }, [])

  // Load data on component mount and when filters change
  useEffect(() => {
    fetchPayments()
  }, [selectedStatus, selectedMethod, selectedEvent, selectedDate, searchQuery])

  // Filter payments based on search and filters (client-side filtering for better UX)
  const filteredPayments = payments.filter((payment) => {
    if (!payment) return false; // Skip if payment is undefined
    
    // Search query filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        (payment.payment_id?.toString()?.toLowerCase() || '').includes(searchLower) ||
        (payment.booking_id?.toString()?.toLowerCase() || '').includes(searchLower) ||
        (payment.user_name?.toLowerCase() || '').includes(searchLower) ||
        (payment.event_title?.toLowerCase() || '').includes(searchLower) ||
        (payment.transaction_id?.toLowerCase() || '').includes(searchLower);
      
      if (!matchesSearch) {
        return false;
      }
    }

    // Payment method filter
    if (selectedMethod !== "all" && payment.payment_method !== selectedMethod) {
      return false;
    }

    // Payment status filter
    if (selectedStatus !== "all" && payment.payment_status !== selectedStatus) {
      return false;
    }

    // Event filter
    if (selectedEvent !== "all" && payment.event_title) {
      const eventId = events.find(event => event.event_title === payment.event_title)?.event_id?.toString();
      if (eventId !== selectedEvent) {
        return false;
      }
    }

    return true;
  })

  // Use analytics data for summary or calculate from filtered payments
  const totalAmount = analytics?.summary?.total_revenue || filteredPayments.reduce((sum, payment) => {
    if (payment.payment_status === "successful") {
      const amount = typeof payment.amount === 'string' ? parseFloat(payment.amount) : payment.amount
      return sum + amount
    }
    return sum
  }, 0)

  const successfulCount = analytics?.summary?.successful_payments || filteredPayments.filter(p => p.payment_status === "successful").length
  const pendingCount = analytics?.summary?.pending_payments || filteredPayments.filter(p => p.payment_status === "pending").length
  const refundedCount = analytics?.summary?.refunded_payments || filteredPayments.filter(p => p.payment_status === "refunded").length

  // Define table columns for EnhancedDataTable
  const columns: Column<any>[] = [
    {
      key: 'transaction_id',
      label: 'Transaction ID',
      sortable: true,
    },
    {
      key: 'user_name',
      label: 'Customer',
      sortable: true,
    },
    {
      key: 'event_title',
      label: 'Event',
      sortable: true,
    },
    {
      key: 'amount',
      label: 'Amount',
      sortable: true,
      render: (value) => `₹${value?.toLocaleString() || '0'}`
    },
    {
      key: 'payment_method',
      label: 'Method',
      sortable: true,
      render: (value) => (
        <Badge variant="outline">
          {value || 'Unknown'}
        </Badge>
      )
    },
    {
      key: 'payment_status',
      label: 'Status',
      sortable: true,
      render: (value) => {
        const statusColors = {
          successful: 'bg-green-500 hover:bg-green-600',
          pending: 'bg-yellow-500 hover:bg-yellow-600',
          failed: 'bg-red-500 hover:bg-red-600',
          refunded: 'bg-blue-500 hover:bg-blue-600'
        }
        return (
          <Badge className={statusColors[value as keyof typeof statusColors] || 'bg-gray-500'}>
            {value || 'Unknown'}
          </Badge>
        )
      }
    },
    {
      key: 'created_at',
      label: 'Date',
      sortable: true,
      render: (value) => value ? new Date(value).toLocaleDateString() : 'N/A'
    }
  ]

  // Define table actions
  const actions: TableAction<any>[] = [
    {
      label: "View Details",
      icon: <Eye className="h-4 w-4" />,
      onClick: (payment) => {
        window.location.href = `/admin/payments/${payment.id}`
      }
    }
  ]

  // Define bulk actions
  const bulkActions: BulkAction<any>[] = []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
          <p className="text-muted-foreground">Manage NIBOG event payments</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={cn("mr-2 h-4 w-4", refreshing && "animate-spin")} />
            Refresh
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/payments/record">
              <Plus className="mr-2 h-4 w-4" />
              Record Payment
            </Link>
          </Button>
          <Button onClick={openExportModal}>
            <Download className="mr-2 h-4 w-4" />
            Export Payments
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            {loading ? (
              <div className="text-2xl font-bold">Loading...</div>
            ) : (
              <div className="text-2xl font-bold">₹{(totalAmount || 0).toLocaleString()}</div>
            )}
            <p className="text-sm text-muted-foreground">Total Revenue</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            {loading ? (
              <div className="text-2xl font-bold">-</div>
            ) : (
              <div className="text-2xl font-bold">{successfulCount || 0}</div>
            )}
            <p className="text-sm text-muted-foreground">Successful Payments</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            {loading ? (
              <div className="text-2xl font-bold">-</div>
            ) : (
              <div className="text-2xl font-bold">{pendingCount || 0}</div>
            )}
            <p className="text-sm text-muted-foreground">Pending Payments</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            {loading ? (
              <div className="text-2xl font-bold">-</div>
            ) : (
              <div className="text-2xl font-bold">{refundedCount || 0}</div>
            )}
            <p className="text-sm text-muted-foreground">Refunded Payments</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search payments..."
                className="h-9 w-full md:w-[300px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={selectedMethod} onValueChange={setSelectedMethod}>
                <SelectTrigger className="h-9 w-full md:w-[180px]">
                  <SelectValue placeholder="All Payment Methods" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payment Methods</SelectItem>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.id} value={method.name}>
                      {method.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="h-9 w-full md:w-[150px]">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {statuses.map((status) => (
                    <SelectItem key={status.id} value={status.name}>
                      {status.name.charAt(0).toUpperCase() + status.name.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                <SelectTrigger className="h-9 w-full md:w-[180px]">
                  <SelectValue placeholder="All Events" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  {events
                    .filter(event => event?.event_id != null) // Filter out events without an ID
                    .map((event) => (
                      <SelectItem 
                        key={event.event_id} 
                        value={event.event_id.toString()}
                      >
                        {event.event_title || 'Untitled Event'}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "h-9 w-full justify-start text-left font-normal md:w-[150px]",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    {selectedDate ? format(selectedDate, "PPP") : "Select Date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                  />
                  {selectedDate && (
                    <div className="p-2 border-t border-border">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-center text-xs"
                        onClick={handleClearDate}
                      >
                        Clear Date
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      <EnhancedDataTable
        data={filteredPayments}
        columns={columns}
        actions={actions}
        bulkActions={bulkActions}
        loading={loading}
        searchable={false} // We have custom search above
        filterable={false} // We have custom filters above
        exportable={true}
        selectable={true}
        pagination={true}
        pageSize={25}
        exportColumns={createPaymentExportColumns()}
        exportTitle="NIBOG Payments Report"
        exportFilename="nibog-payments"
        emptyMessage="No payments found"
        className="min-h-[400px]"
      />

      {/* Export Modal */}
      <ExportPaymentsModal
        open={exportModalOpen}
        onOpenChange={setExportModalOpen}
        onExport={handleExportPayments}
        isExporting={isExporting}
      />

      {/* Payment Status Edit Dialog */}
      {selectedPaymentForEdit && (
        <PaymentStatusEditDialog
          open={statusEditDialogOpen}
          onOpenChange={setStatusEditDialogOpen}
          payment={selectedPaymentForEdit}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  )
}

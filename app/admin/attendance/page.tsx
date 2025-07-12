"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import AdminAttendanceAnalytics from "@/components/admin/admin-attendance-analytics"

export default function AttendanceAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attendance Analytics</h1>
          <p className="text-muted-foreground">
            Detailed analytics for event attendance and no-shows
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/events">
              View Events
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/bookings">
              View Bookings
            </Link>
          </Button>
        </div>
      </div>
      
      <AdminAttendanceAnalytics />
    </div>
  )
}

"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import {
  Bell,
  Search,
  Settings,
  User,
  LogOut,
  ChevronRight,
  Home,
  Command,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { useState } from "react"
import NotificationCenter from "./notification-center"
import GlobalSearch from "./global-search"

// Route mapping for breadcrumbs
const routeMap: Record<string, { label: string; parent?: string }> = {
  "/admin": { label: "Dashboard" },
  "/admin/events": { label: "NIBOG Events", parent: "/admin" },
  "/admin/events/new": { label: "New Event", parent: "/admin/events" },
  "/admin/bookings": { label: "Bookings", parent: "/admin" },
  "/admin/bookings/new": { label: "New Booking", parent: "/admin/bookings" },
  "/admin/users": { label: "Users", parent: "/admin" },
  "/admin/payments": { label: "Payments", parent: "/admin" },
  "/admin/cities": { label: "Cities", parent: "/admin" },
  "/admin/venues": { label: "Venues", parent: "/admin" },
  "/admin/games": { label: "Baby Games", parent: "/admin" },
  "/admin/promo-codes": { label: "Promo Codes", parent: "/admin" },
  "/admin/add-ons": { label: "Add-ons", parent: "/admin" },
  "/admin/certificate-templates": { label: "Certificate Templates", parent: "/admin" },
  "/admin/certificates": { label: "Generated Certificates", parent: "/admin" },
  "/admin/attendance": { label: "Attendance", parent: "/admin" },
  "/admin/testimonials": { label: "Testimonials", parent: "/admin" },
  "/admin/settings": { label: "Settings", parent: "/admin" },
  "/admin/home": { label: "Home Section", parent: "/admin" },
  "/admin/email": { label: "Email Sending", parent: "/admin" },
  "/admin/completed-events": { label: "Completed Events", parent: "/admin" },
}

function generateBreadcrumbs(pathname: string) {
  const breadcrumbs = []
  let currentPath = pathname

  // Handle dynamic routes (with IDs)
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length > 2 && /^\d+$/.test(segments[segments.length - 1])) {
    // If last segment is a number (ID), use parent route
    currentPath = segments.slice(0, -1).join('/')
    currentPath = currentPath.startsWith('/') ? currentPath : '/' + currentPath
  }

  while (currentPath && routeMap[currentPath]) {
    const route = routeMap[currentPath]
    breadcrumbs.unshift({
      label: route.label,
      href: currentPath,
      isLast: currentPath === pathname || (pathname.includes(currentPath) && breadcrumbs.length === 0)
    })
    currentPath = route.parent || ""
  }

  return breadcrumbs
}

interface AdminHeaderProps {
  title?: string
  description?: string
}

export default function AdminHeader({ title, description }: AdminHeaderProps) {
  const pathname = usePathname()
  const [searchOpen, setSearchOpen] = useState(false)
  const breadcrumbs = generateBreadcrumbs(pathname)

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
      localStorage.removeItem('superadmin')
      window.location.href = '/superadmin/login'
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center gap-4 px-6">
        {/* Breadcrumbs */}
        <div className="flex-1">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/admin" className="flex items-center gap-1">
                    <Home className="h-4 w-4" />
                    <span className="sr-only">Dashboard</span>
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              {breadcrumbs.length > 1 && (
                <>
                  <BreadcrumbSeparator />
                  {breadcrumbs.slice(1).map((breadcrumb, index) => (
                    <div key={breadcrumb.href} className="flex items-center gap-2">
                      <BreadcrumbItem>
                        {breadcrumb.isLast ? (
                          <BreadcrumbPage className="font-medium">
                            {title || breadcrumb.label}
                          </BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink asChild>
                            <Link href={breadcrumb.href}>{breadcrumb.label}</Link>
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                      {index < breadcrumbs.slice(1).length - 1 && <BreadcrumbSeparator />}
                    </div>
                  ))}
                </>
              )}
            </BreadcrumbList>
          </Breadcrumb>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>

        {/* Search */}
        <div className="flex items-center gap-2">
          <GlobalSearch />
        </div>

        {/* Notifications */}
        <NotificationCenter />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <User className="h-4 w-4" />
              <span className="sr-only">User menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Admin Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/admin/settings" className="flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

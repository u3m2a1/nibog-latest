import { Suspense } from "react"
import type { Metadata } from "next"
import EventFilters from "@/components/event-filters"
import EventList from "@/components/event-list"
import EventsLoading from "./loading"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarRange, Grid3X3 } from "lucide-react"
import { AnimatedBackground } from "@/components/animated-background"

export const metadata: Metadata = {
  title: "Baby Games | NIBOG",
  description: "Browse and book NIBOG baby games events across 21 cities in India",
}

export default function EventsPage() {
  return (
    <AnimatedBackground variant="events">
      <div className="container py-8">
        <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">NIBOG Baby Games</h1>
          <p className="text-muted-foreground">Browse and register for baby games across 21 cities in India</p>
        </div>

        <EventFilters />

        <Tabs defaultValue="grid" className="w-full">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing <span className="font-medium">16</span> baby games
            </div>
            <TabsList>
              <TabsTrigger value="grid">
                <Grid3X3 className="mr-2 h-4 w-4" />
                Grid View
              </TabsTrigger>
              <TabsTrigger value="calendar">
                <CalendarRange className="mr-2 h-4 w-4" />
                Calendar View
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="grid" className="mt-6">
            <Suspense fallback={<EventsLoading />}>
              <EventList />
            </Suspense>
          </TabsContent>
          <TabsContent value="calendar" className="mt-6">
            <div className="flex h-[400px] items-center justify-center rounded-lg border border-dashed p-8 text-center">
              <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
                <CalendarRange className="h-10 w-10 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Calendar View</h3>
                <p className="mb-4 mt-2 text-sm text-muted-foreground">
                  View events organized by date in a calendar format. Coming soon!
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </AnimatedBackground>
  )
}

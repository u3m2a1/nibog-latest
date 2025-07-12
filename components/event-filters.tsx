"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Search, Filter, X } from "lucide-react"
import { cn, formatAge } from "@/lib/utils"
import { Badge } from "./ui/badge"
import { Separator } from "./ui/separator"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Checkbox } from "./ui/checkbox"

export default function EventFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Initialize state from URL params or defaults
  const [city, setCity] = useState(searchParams.get("city") || "")
  const [ageRange, setAgeRange] = useState<[number, number]>([
    Number.parseInt(searchParams.get("minAge") || "5"),
    Number.parseInt(searchParams.get("maxAge") || "144"),
  ])
  const [date, setDate] = useState<Date | undefined>(
    searchParams.get("date") ? new Date(searchParams.get("date")!) : undefined,
  )
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "")
  const [categories, setCategories] = useState<string[]>([])
  const [venues, setVenues] = useState<string[]>([])

  // Mock data - in a real app, this would come from an API
  const cities = [
    { value: "hyderabad", label: "Hyderabad" },
    { value: "bangalore", label: "Bangalore" },
    { value: "chennai", label: "Chennai" },
    { value: "vizag", label: "Vizag" },
    { value: "patna", label: "Patna" },
    { value: "ranchi", label: "Ranchi" },
    { value: "nagpur", label: "Nagpur" },
    { value: "kochi", label: "Kochi" },
    { value: "mumbai", label: "Mumbai" },
    { value: "indore", label: "Indore" },
    { value: "lucknow", label: "Lucknow" },
    { value: "chandigarh", label: "Chandigarh" },
    { value: "kolkata", label: "Kolkata" },
    { value: "gurgaon", label: "Gurgaon" },
    { value: "delhi", label: "Delhi" },
    { value: "jaipur", label: "Jaipur" },
    { value: "ahmedabad", label: "Ahmedabad" },
    { value: "bhubaneswar", label: "Bhubaneswar" },
    { value: "pune", label: "Pune" },
    { value: "raipur", label: "Raipur" },
    { value: "gandhinagar", label: "Gandhi Nagar" },
  ]

  const categoryOptions = [
    { id: "crawling", label: "Baby Crawling" },
    { id: "walker", label: "Baby Walker" },
    { id: "running", label: "Running Race" },
    { id: "hurdle", label: "Hurdle Toddle" },
    { id: "cycle", label: "Cycle Race" },
    { id: "ring", label: "Ring Holding" },
    { id: "ball", label: "Ball Throw" },
    { id: "balance", label: "Balancing Beam" },
    { id: "jump", label: "Frog Jump" },
    { id: "olympics", label: "NIBOG Olympics" },
  ]

  const venueOptions = [
    { id: "gachibowli", label: "Gachibowli Indoor Stadium" },
    { id: "chennai-stadium", label: "Indoor Stadium, Chennai" },
    { id: "bangalore-stadium", label: "Indoor Stadium, Bangalore" },
    { id: "vizag-complex", label: "Sports Complex, Vizag" },
    { id: "mumbai-stadium", label: "Indoor Stadium, Mumbai" },
    { id: "delhi-complex", label: "Sports Complex, Delhi" },
    { id: "kolkata-stadium", label: "Indoor Stadium, Kolkata" },
  ]

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (city) params.set("city", city)
    if (ageRange[0] > 5) params.set("minAge", ageRange[0].toString())
    if (ageRange[1] < 144) params.set("maxAge", ageRange[1].toString())
    if (date) params.set("date", format(date, "yyyy-MM-dd"))
    if (searchQuery) params.set("q", searchQuery)
    if (categories.length > 0) params.set("categories", categories.join(","))
    if (venues.length > 0) params.set("venues", venues.join(","))

    router.push(`/events?${params.toString()}`)
  }

  const handleReset = () => {
    setCity("")
    setAgeRange([5, 144])
    setDate(undefined)
    setSearchQuery("")
    setCategories([])
    setVenues([])
    router.push("/events")
  }

  // Count active filters
  const activeFilterCount = [
    city,
    ageRange[0] > 5 || ageRange[1] < 144,
    date,
    categories.length > 0,
    venues.length > 0,
  ].filter(Boolean).length

  return (
    <div className="space-y-4">
      {/* Desktop Filters */}
      <div className="hidden rounded-lg border bg-card p-6 shadow-sm md:block">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Select value={city} onValueChange={setCity}>
              <SelectTrigger id="city">
                <SelectValue placeholder="Select city" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {cities.map((city) => (
                  <SelectItem key={city.value} value={city.value}>
                    {city.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Age Range (months)</Label>
            <div className="pt-2">
              <Slider
                value={ageRange}
                min={5}
                max={144}
                step={1}
                onValueChange={(value) => setAgeRange(value as [number, number])}
                className="py-4"
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{formatAge(ageRange[0])}</span>
                <span>{formatAge(ageRange[1])}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="search">Search</Label>
            <div className="flex gap-2">
              <Input
                id="search"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button size="icon" onClick={handleSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Categories</Label>
            <div className="flex flex-wrap gap-2">
              {categoryOptions.map((category) => (
                <Badge
                  key={category.id}
                  variant={categories.includes(category.id) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => {
                    if (categories.includes(category.id)) {
                      setCategories(categories.filter((c) => c !== category.id))
                    } else {
                      setCategories([...categories, category.id])
                    }
                  }}
                >
                  {category.label}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Venues</Label>
            <div className="flex flex-wrap gap-2">
              {venueOptions.slice(0, 6).map((venue) => (
                <Badge
                  key={venue.id}
                  variant={venues.includes(venue.id) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => {
                    if (venues.includes(venue.id)) {
                      setVenues(venues.filter((v) => v !== venue.id))
                    } else {
                      setVenues([...venues, venue.id])
                    }
                  }}
                >
                  {venue.label}
                </Badge>
              ))}
              {venueOptions.length > 6 && <Badge variant="outline">+{venueOptions.length - 6} more</Badge>}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={handleReset}>
            Reset
          </Button>
          <Button onClick={handleSearch}>Apply Filters</Button>
        </div>
      </div>

      {/* Mobile Filters */}
      <div className="md:hidden">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="relative">
                <Filter className="h-4 w-4" />
                {activeFilterCount > 0 && (
                  <Badge className="absolute -right-1 -top-1 h-5 w-5 p-0 flex items-center justify-center">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
                <SheetDescription>Filter events by city, age, date, and more</SheetDescription>
              </SheetHeader>
              <div className="py-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="mobile-city">City</Label>
                    <Select value={city} onValueChange={setCity}>
                      <SelectTrigger id="mobile-city">
                        <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Cities</SelectItem>
                        {cities.map((city) => (
                          <SelectItem key={city.value} value={city.value}>
                            {city.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Age Range (months)</Label>
                    <div className="pt-2">
                      <Slider
                        value={ageRange}
                        min={5}
                        max={144}
                        step={1}
                        onValueChange={(value) => setAgeRange(value as [number, number])}
                        className="py-4"
                      />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{formatAge(ageRange[0])}</span>
                        <span>{formatAge(ageRange[1])}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          initialFocus
                          disabled={(date) => date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label>Categories</Label>
                    <div className="space-y-2">
                      {categoryOptions.map((category) => (
                        <div key={category.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`category-${category.id}`}
                            checked={categories.includes(category.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setCategories([...categories, category.id])
                              } else {
                                setCategories(categories.filter((c) => c !== category.id))
                              }
                            }}
                          />
                          <Label htmlFor={`category-${category.id}`} className="font-normal">
                            {category.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label>Venues</Label>
                    <div className="space-y-2">
                      {venueOptions.map((venue) => (
                        <div key={venue.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`venue-${venue.id}`}
                            checked={venues.includes(venue.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setVenues([...venues, venue.id])
                              } else {
                                setVenues(venues.filter((v) => v !== venue.id))
                              }
                            }}
                          />
                          <Label htmlFor={`venue-${venue.id}`} className="font-normal">
                            {venue.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <SheetFooter>
                <Button variant="outline" onClick={handleReset} className="w-full">
                  Reset Filters
                </Button>
                <SheetClose asChild>
                  <Button onClick={handleSearch} className="w-full">
                    Apply Filters
                  </Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>

        {/* Active Filters */}
        {activeFilterCount > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {city && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {cities.find((c) => c.value === city)?.label || city}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setCity("")} />
              </Badge>
            )}
            {(ageRange[0] > 5 || ageRange[1] < 144) && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {formatAge(ageRange[0])} - {formatAge(ageRange[1])}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setAgeRange([5, 144])} />
              </Badge>
            )}
            {date && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {format(date, "PP")}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setDate(undefined)} />
              </Badge>
            )}
            {categories.length > 0 && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {categories.length} {categories.length === 1 ? "category" : "categories"}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setCategories([])} />
              </Badge>
            )}
            {venues.length > 0 && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {venues.length} {venues.length === 1 ? "venue" : "venues"}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setVenues([])} />
              </Badge>
            )}
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={handleReset}>
              Clear all
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

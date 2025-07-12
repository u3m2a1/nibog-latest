"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Plus, Loader2 } from "lucide-react"
import { getEventWithGames, createEventGameSlot } from "@/services/eventService"
import { getAllBabyGames, type BabyGame } from "@/services/babyGameService"
import { useToast } from "@/hooks/use-toast"
import { TruncatedText } from "@/components/ui/truncated-text"

type Props = {
  params: { id: string }
}

export default function NewSlotPage({ params }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const eventId = params.id

  // State for event and games data
  const [event, setEvent] = useState<any>(null)
  const [availableGames, setAvailableGames] = useState<BabyGame[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    gameId: "",
    customTitle: "",
    customDescription: "",
    customPrice: "",
    startTime: "",
    endTime: "",
    slotPrice: "",
    maxParticipants: "12"
  })

  // Fetch event and games data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const [eventData, gamesData] = await Promise.all([
          getEventWithGames(eventId),
          getAllBabyGames()
        ])

        setEvent(eventData)
        setAvailableGames(gamesData)
      } catch (err: any) {
        setError(err.message || "Failed to load data")
        toast({
          title: "Error",
          description: err.message || "Failed to load data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [eventId, toast])

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error || !event) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Error</h2>
          <p className="text-muted-foreground">
            {error || "Failed to load event data"}
          </p>
          <Button className="mt-4" asChild>
            <Link href={`/admin/events/${eventId}/slots`}>Back to Slots</Link>
          </Button>
        </div>
      </div>
    )
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation
    if (!formData.gameId || !formData.startTime || !formData.endTime || !formData.maxParticipants) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    // Validate time
    if (formData.startTime >= formData.endTime) {
      toast({
        title: "Validation Error",
        description: "End time must be after start time",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Prepare the slot data for the API
      const slotData = {
        event_id: Number(eventId),
        game_id: Number(formData.gameId),
        custom_title: formData.customTitle || "",
        custom_description: formData.customDescription || "",
        custom_price: formData.customPrice ? Number(formData.customPrice) : 0,
        start_time: formData.startTime + ":00", // Add seconds format
        end_time: formData.endTime + ":00", // Add seconds format
        slot_price: formData.slotPrice ? Number(formData.slotPrice) : 0,
        max_participants: Number(formData.maxParticipants)
      }

      console.log("Creating slot with data:", slotData)

      // Call the API to create the slot
      const result = await createEventGameSlot(slotData)

      console.log("Slot created successfully:", result)

      toast({
        title: "Success",
        description: "Game slot created successfully",
      })

      // Navigate back to slots page
      router.push(`/admin/events/${eventId}/slots`)
    } catch (err: any) {
      console.error("Error creating slot:", err)
      toast({
        title: "Error",
        description: err.message || "Failed to create slot",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/admin/events/${eventId}/slots`}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Game Slot</h1>
          <p className="text-muted-foreground">
            {event.event_title} | {event.venue?.venue_name}, {event.city?.city_name}
          </p>
          {event.event_description && (
            <div className="mt-1">
              <TruncatedText
                text={event.event_description}
                maxLength={120}
                className="text-sm text-muted-foreground"
                showTooltip={true}
              />
            </div>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Game Slot Details</CardTitle>
          <CardDescription>Configure the game and time slot settings</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="gameId">Game Template *</Label>
                <Select value={formData.gameId} onValueChange={(value) => setFormData(prev => ({ ...prev, gameId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a game template" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableGames.map((game) => (
                      <SelectItem key={game.id || game.game_name} value={game.id?.toString() || ""}>
                        {game.game_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxParticipants">Max Participants *</Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  min="1"
                  value={formData.maxParticipants}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxParticipants: e.target.value }))}
                  placeholder="e.g., 12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time *</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime">End Time *</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slotPrice">Slot Price (₹)</Label>
                <Input
                  id="slotPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.slotPrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, slotPrice: e.target.value }))}
                  placeholder="e.g., 799"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customPrice">Custom Price (₹)</Label>
                <Input
                  id="customPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.customPrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, customPrice: e.target.value }))}
                  placeholder="e.g., 799"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customTitle">Custom Title</Label>
              <Input
                id="customTitle"
                value={formData.customTitle}
                onChange={(e) => setFormData(prev => ({ ...prev, customTitle: e.target.value }))}
                placeholder="Override the default game title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customDescription">Custom Description</Label>
              <Textarea
                id="customDescription"
                value={formData.customDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, customDescription: e.target.value }))}
                placeholder="Override the default game description"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" asChild>
                <Link href={`/admin/events/${eventId}/slots`}>Cancel</Link>
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Slot
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

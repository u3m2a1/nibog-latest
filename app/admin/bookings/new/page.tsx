"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"


import { ArrowLeft, Save, Loader2, CreditCard, CheckCircle, Mail, MessageCircle, ExternalLink } from "lucide-react"
import { format } from "date-fns"

import { useToast } from "@/hooks/use-toast"
import { BOOKING_API, PAYMENT_API } from "@/config/api"
import { getAllCities, City } from "@/services/cityService"
import { getAllAddOns, AddOn, AddOnVariant } from "@/services/addOnService"
import { generateConsistentBookingRef } from "@/utils/bookingReference"
// Promo code functionality simplified for admin panel
import { getEventsByCityId, getGamesByAgeAndEvent } from "@/services/eventService"
import { differenceInMonths } from "date-fns"
import { initiatePhonePePayment, createManualPayment, ManualPaymentData } from "@/services/paymentService"
import { sendPaymentLinkEmail, generateWhatsAppMessage, PaymentLinkEmailData } from "@/services/paymentLinkEmailService"



// Interface for selected addon
interface SelectedAddon {
  addon: AddOn;
  variant?: AddOnVariant;
  quantity: number;
}

// Interface for event from API (matching user panel structure)
interface EventListItem {
  event_id: number;
  event_title: string;
  event_description: string;
  event_date: string;
  event_status: string;
  city_id: number;
  venue_id: number;
}

// Interface for game from API (matching user panel structure)
interface EligibleGame {
  id: string; // This will be slot_id as string for unique identification
  title: string;
  description: string;
  price: number;
  start_time: string;
  end_time: string;
  custom_title: string;
  custom_description: string;
  max_participants: number;
  slot_id: number;
  game_id: number; // Store game_id separately for API calls
}

// Generate unique transaction ID
const generateUniqueTransactionId = (prefix: string = "TXN") => {
  const timestamp = Date.now()
  const randomPart = Math.random().toString(36).substring(2, 11)
  const extraRandom = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `${prefix}${timestamp}_${randomPart}_${extraRandom}`
}

export default function NewBookingPage() {
  const router = useRouter()
  const { toast } = useToast()

  // Generate PhonePe payment link for the created booking
  const handleGeneratePaymentLink = async () => {
    if (!createdBookingId || !createdBookingAmount || !createdBookingPhone) {
      toast({
        title: "Error",
        description: "Missing booking information for payment link generation",
        variant: "destructive"
      })
      return
    }

    setIsGeneratingPaymentLink(true)

    try {
      console.log("Generating payment link for booking:", {
        bookingId: createdBookingId,
        amount: createdBookingAmount,
        phone: createdBookingPhone
      })

      // Use admin user ID (4) for payment link generation
      const paymentUrl = await initiatePhonePePayment(
        createdBookingId,
        4, // Admin user ID
        createdBookingAmount,
        createdBookingPhone
      )

      setPaymentLinkGenerated(paymentUrl)

      toast({
        title: "Success",
        description: "Payment link generated successfully! You can now share it with the customer.",
      })

    } catch (error) {
      console.error("Error generating payment link:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate payment link",
        variant: "destructive"
      })
    } finally {
      setIsGeneratingPaymentLink(false)
    }
  }

  // Send payment link via email
  const handleSendPaymentEmail = async () => {
    if (!paymentLinkGenerated || !createdBookingEmail || !createdBookingParentName) {
      toast({
        title: "Error",
        description: "Payment link not generated or missing customer information",
        variant: "destructive"
      })
      return
    }

    setIsSendingEmail(true)

    try {
      const emailData: PaymentLinkEmailData = {
        parentName: createdBookingParentName,
        parentEmail: createdBookingEmail,
        childName: createdBookingChildName,
        bookingId: createdBookingId!,
        bookingRef: createdBookingRef,
        totalAmount: createdBookingAmount,
        paymentLink: paymentLinkGenerated,
        expiryHours: 24 // Payment link expires in 24 hours
      }

      const result = await sendPaymentLinkEmail(emailData)

      if (result.success) {
        setEmailSent(true)
        toast({
          title: "Success",
          description: `Payment link sent successfully to ${createdBookingEmail}`,
        })
      } else {
        throw new Error(result.error || "Failed to send email")
      }

    } catch (error) {
      console.error("Error sending payment link email:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send payment link email",
        variant: "destructive"
      })
    } finally {
      setIsSendingEmail(false)
    }
  }





  // Parent Information
  const [parentName, setParentName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")

  // Child Information
  const [childName, setChildName] = useState("")
  const [childDateOfBirth, setChildDateOfBirth] = useState("")
  const [childGender, setChildGender] = useState("")
  const [schoolName, setSchoolName] = useState("")

  // Selection State (matching user panel structure)
  const [selectedCityId, setSelectedCityId] = useState<string | number>("")
  const [selectedEventType, setSelectedEventType] = useState("")
  const [selectedGames, setSelectedGames] = useState<string[]>([])
  const [childAgeMonths, setChildAgeMonths] = useState<number | null>(null)

  // Data state (matching user panel structure)
  const [cities, setCities] = useState<{ id: string | number; name: string }[]>([])
  const [apiEvents, setApiEvents] = useState<EventListItem[]>([])
  const [eligibleGames, setEligibleGames] = useState<EligibleGame[]>([])
  const [addOns, setAddOns] = useState<AddOn[]>([])
  const [selectedAddOns, setSelectedAddOns] = useState<{ addOn: AddOn; quantity: number; variantId?: string }[]>([])

  // Loading states
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [isLoadingCities, setIsLoadingCities] = useState(false)
  const [isLoadingEvents, setIsLoadingEvents] = useState(false)
  const [isLoadingGames, setIsLoadingGames] = useState(false)
  const [cityError, setCityError] = useState<string | null>(null)
  const [eventError, setEventError] = useState<string | null>(null)
  const [gameError, setGameError] = useState<string | null>(null)

  // Phase 2: Payment Management States
  const [bookingCreated, setBookingCreated] = useState(false)
  const [createdBookingId, setCreatedBookingId] = useState<number | null>(null)
  const [createdBookingRef, setCreatedBookingRef] = useState<string>("")
  const [createdBookingAmount, setCreatedBookingAmount] = useState<number>(0)
  const [createdBookingPhone, setCreatedBookingPhone] = useState<string>("")
  const [createdBookingEmail, setCreatedBookingEmail] = useState<string>("")
  const [createdBookingParentName, setCreatedBookingParentName] = useState<string>("")
  const [createdBookingChildName, setCreatedBookingChildName] = useState<string>("")
  const [isGeneratingPaymentLink, setIsGeneratingPaymentLink] = useState(false)
  const [paymentLinkGenerated, setPaymentLinkGenerated] = useState<string>("")
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const [emailSent, setEmailSent] = useState(false)



  // Promo code state (matching user panel structure)
  const [appliedPromoCode, setAppliedPromoCode] = useState<string>("")
  const [discountAmount, setDiscountAmount] = useState<number>(0)
  const [promoCodeInput, setPromoCodeInput] = useState("")
  const [isValidatingPromoCode, setIsValidatingPromoCode] = useState(false)

  // Calculate child's age based on current date (matching user panel logic)
  const calculateAge = (birthDate: Date) => {
    const currentDate = new Date()
    const ageInMonths = differenceInMonths(currentDate, birthDate)
    return ageInMonths
  }

  // Handle DOB change (matching user panel logic)
  const handleDobChange = (dateString: string) => {
    setChildDateOfBirth(dateString)

    if (dateString) {
      const date = new Date(dateString)
      // Calculate child's age in months based on the current date
      const ageInMonths = calculateAge(date)
      setChildAgeMonths(ageInMonths)

      console.log(`Child's age: ${ageInMonths} months`)

      // If an event is already selected, fetch games for this age
      if (selectedEventType) {
        const selectedApiEvent = apiEvents.find(event => event.event_title === selectedEventType);
        if (selectedApiEvent) {
          fetchGamesByEventAndAge(selectedApiEvent.event_id, ageInMonths);
        }
      }
    } else {
      // Reset age if DOB is cleared
      setChildAgeMonths(null)
    }
  }

  // Calculate games total (matching user panel logic)
  const calculateGamesTotal = () => {
    let total = 0;

    for (const gameId of selectedGames) {
      const game = eligibleGames.find(g => g.id === gameId);
      if (game) {
        total += game.price;
      }
    }

    return total;
  }

  // Calculate add-ons subtotal (matching user panel logic)
  const calculateAddOnsTotal = () => {
    const total = selectedAddOns.reduce((sum, item) => {
      let price = parseFloat(item.addOn.price.toString()) || 0;

      // Check if this is a variant with a different price
      if (item.variantId && item.addOn.has_variants && item.addOn.variants) {
        const variant = item.addOn.variants.find(v => v.id === item.variantId);
        if (variant && variant.price_modifier) {
          const modifier = parseFloat(variant.price_modifier.toString());
          price = parseFloat(item.addOn.price.toString()) + modifier;
        }
      }

      // Round to 2 decimal places for each item's total
      const itemTotal = price * item.quantity;
      return sum + parseFloat(itemTotal.toFixed(2));
    }, 0);

    // Round final total to 2 decimal places
    return parseFloat(total.toFixed(2));
  }

  // Calculate total price including add-ons, GST, and promocode discount (matching user panel logic)
  const calculateTotalPrice = () => {
    const gamesTotal = calculateGamesTotal();
    const addOnsTotal = calculateAddOnsTotal();
    const subtotal = gamesTotal + addOnsTotal;

    // Apply promocode discount if available
    let discountedSubtotal = subtotal;
    if (appliedPromoCode) {
      discountedSubtotal = subtotal - discountAmount;
    }

    const gst = parseFloat((discountedSubtotal * 0.18).toFixed(2));
    const total = discountedSubtotal + gst;

    // Ensure final total is rounded to 2 decimal places
    return parseFloat(total.toFixed(2));
  }

  // Calculate GST amount (matching user panel logic)
  const calculateGST = () => {
    const gamesTotal = calculateGamesTotal();
    const addOnsTotal = calculateAddOnsTotal();
    const subtotal = gamesTotal + addOnsTotal;

    // Apply promocode discount if available
    let discountedSubtotal = subtotal;
    if (appliedPromoCode) {
      discountedSubtotal = subtotal - discountAmount;
    }

    const gst = discountedSubtotal * 0.18;

    // Round to 2 decimal places
    return parseFloat(gst.toFixed(2));
  }

  // Fetch cities from API when component mounts (matching user panel logic)
  useEffect(() => {
    const fetchCities = async () => {
      try {
        setIsLoadingCities(true)
        setCityError(null)

        console.log("Fetching cities from API...")
        const citiesData = await getAllCities()
        console.log("Cities data from API:", citiesData)

        // Map the API response to the format expected by the dropdown
        const formattedCities = citiesData.map(city => ({
          id: city.id || 0,
          name: city.city_name
        }))

        console.log("Formatted cities for dropdown:", formattedCities)
        setCities(formattedCities)
      } catch (error: any) {
        console.error("Failed to fetch cities:", error)
        setCityError("Failed to load cities. Please try again.")
      } finally {
        setIsLoadingCities(false)
      }
    }

    fetchCities()
  }, [])

  // Fetch add-ons from external API (matching user panel logic)
  useEffect(() => {
    async function loadAddOns() {
      setIsLoadingData(true);
      try {
        const addOnData = await getAllAddOns();
        console.log('Fetched add-ons from external API:', addOnData);
        setAddOns(addOnData.filter(addon => addon.is_active));
      } catch (error) {
        console.error('Failed to load add-ons:', error);
        toast({
          title: "Error",
          description: "Failed to load add-ons. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingData(false);
      }
    }

    loadAddOns();
  }, [])

  // Handle city change and fetch events for the selected city (matching user panel logic)
  const handleCityChange = async (cityId: string) => {
    setSelectedCityId(cityId)
    setSelectedEventType("") // Reset event type when city changes
    setSelectedGames([]) // Reset selected games
    setEligibleGames([]) // Reset eligible games

    if (!cityId) return

    // Fetch events for the selected city
    try {
      setIsLoadingEvents(true);
      setEventError(null);

      console.log(`Fetching events for city ID: ${cityId}`);
      const eventsData = await getEventsByCityId(Number(cityId));
      console.log("Events data from API:", eventsData);

      setApiEvents(eventsData);

      // No need to filter events by age anymore - games will be fetched separately
      // when both event and DOB are selected

    } catch (error: any) {
      console.error(`Failed to fetch events for city ID ${cityId}:`, error);
      setEventError("Failed to load events. Please try again.");

      // Clear events on error
      setApiEvents([]);
    } finally {
      setIsLoadingEvents(false);
    }
  }

  // Handle event type selection (matching user panel logic)
  const handleEventTypeChange = (eventType: string) => {
    setSelectedEventType(eventType)
    setSelectedGames([]) // Reset selected games
    setEligibleGames([]) // Reset eligible games

    // Find the selected event from API events
    const selectedApiEvent = apiEvents.find(event => event.event_title === eventType);

    if (selectedApiEvent) {
      console.log("Selected event:", selectedApiEvent);

      // If DOB is set, use the already calculated age (based on current date)
      if (childDateOfBirth && childAgeMonths !== null) {
        // Fetch games for this event and child age
        fetchGamesByEventAndAge(selectedApiEvent.event_id, childAgeMonths);
      }
    } else {
      // If no matching event found, clear eligible games
      setEligibleGames([]);
    }
  }

  // Fetch games based on event ID and child age (matching user panel logic)
  const fetchGamesByEventAndAge = async (eventId: number, childAge: number) => {
    if (!eventId || childAge === null) return;

    setIsLoadingGames(true);
    setGameError("");

    try {
      console.log(`Fetching games for event ID: ${eventId} and child age: ${childAge} months`);

      // Call the new API to get games by age and event
      const gamesData = await getGamesByAgeAndEvent(eventId, childAge);

      if (gamesData && gamesData.length > 0) {
        console.log(`Found ${gamesData.length} games for event ${eventId} and age ${childAge} months`);
        console.log('Game data from API:', gamesData);

        // Format games data to match the expected structure (using slot_id as unique identifier)
        const formattedGames: EligibleGame[] = gamesData.map((game: any) => ({
          id: String(game.slot_id || game.id), // Use slot_id as unique identifier
          title: game.title || game.game_title || game.name || '',
          description: game.description || game.game_description || '',
          price: parseFloat(game.price || game.slot_price || '0'),
          start_time: game.start_time || '',
          end_time: game.end_time || '',
          custom_title: game.title || '',
          custom_description: game.description || '',
          max_participants: game.max_participants || 0,
          // Store both slot_id and game_id for reference
          slot_id: Number(game.slot_id || 0),
          game_id: Number(game.game_id || game.id || 0)
        }));

        // Set the formatted games (this is separate from eligibleEvents which contains event details)
        setEligibleGames(formattedGames);
      } else {
        console.log(`No games found for event ${eventId} and age ${childAge} months`);
        setEligibleGames([]);
      }
    } catch (error) {
      console.error('Error fetching games:', error);
      setGameError("Failed to load games. Please try again.");
      setEligibleGames([]);
    } finally {
      setIsLoadingGames(false);
    }
  }

  // Handle game selection (matching user panel logic)
  const handleGameToggle = (gameId: string) => {
    const newSelectedGames = selectedGames.includes(gameId)
      ? selectedGames.filter(id => id !== gameId)
      : [...selectedGames, gameId]

    setSelectedGames(newSelectedGames)

    // Find the selected game objects to show both slot_id and game_id in logs
    const selectedGamesObj = eligibleGames.filter(game => newSelectedGames.includes(game.id))
    console.log("Selected games (slot_ids):", newSelectedGames)
    console.log("Selected games details:", selectedGamesObj.map(game => ({
      slot_id: game.slot_id,
      game_id: game.game_id,
      title: game.title
    })))
  }

  // Handle promo code input change (matching user panel logic)
  const handlePromoCodeInputChange = (value: string) => {
    setPromoCodeInput(value)
    if (!value.trim()) {
      setAppliedPromoCode("")
      setDiscountAmount(0)
    }
  }

  // Handle promo code validation (simplified for admin panel)
  const handlePromoCodeValidation = async () => {
    if (!promoCodeInput.trim()) {
      setAppliedPromoCode("")
      setDiscountAmount(0)
      return
    }

    // For admin panel, we'll implement a simple validation
    // In a real scenario, you'd call the promo code validation API
    setIsValidatingPromoCode(true)

    try {
      // Simulate API call - replace with actual validation
      await new Promise(resolve => setTimeout(resolve, 1000))

      // For demo purposes, apply a 10% discount for code "ADMIN10"
      if (promoCodeInput.trim().toUpperCase() === "ADMIN10") {
        const subtotal = calculateGamesTotal() + calculateAddOnsTotal()
        const discount = subtotal * 0.1
        setAppliedPromoCode(promoCodeInput.trim())
        setDiscountAmount(discount)
        toast({
          title: "Promo Code Applied",
          description: `10% discount applied: ₹${discount.toFixed(2)}`,
        })
      } else {
        setAppliedPromoCode("")
        setDiscountAmount(0)
        toast({
          title: "Invalid Promo Code",
          description: "Please enter a valid promo code",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error validating promo code:", error)
      toast({
        title: "Validation Error",
        description: "Failed to validate promo code",
        variant: "destructive",
      })
    } finally {
      setIsValidatingPromoCode(false)
    }
  }

  // Handle add-on selection (matching user panel logic)
  const handleAddOnChange = (addOn: AddOn, quantity: number, variantId?: string) => {
    const existingIndex = selectedAddOns.findIndex(item =>
      item.addOn.id === addOn.id && item.variantId === variantId
    )

    if (quantity === 0) {
      // Remove the add-on
      if (existingIndex !== -1) {
        setSelectedAddOns(prev => prev.filter((_, index) => index !== existingIndex))
      }
    } else {
      // Add or update the add-on
      const newItem = { addOn, quantity, variantId }

      if (existingIndex !== -1) {
        // Update existing
        setSelectedAddOns(prev => prev.map((item, index) =>
          index === existingIndex ? newItem : item
        ))
      } else {
        // Add new
        setSelectedAddOns(prev => [...prev, newItem])
      }
    }
  }





  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate required fields
      if (!parentName || !email || !phone || !childName || !childDateOfBirth || !childGender) {
        throw new Error("Please fill in all required fields")
      }

      if (!selectedEventType || selectedGames.length === 0) {
        throw new Error("Please complete the event and game selection")
      }

      if (!childAgeMonths) {
        throw new Error("Please enter child's date of birth")
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        throw new Error("Please enter a valid email address")
      }

      // Validate date of birth
      const birthDate = new Date(childDateOfBirth)
      const today = new Date()
      if (birthDate >= today) {
        throw new Error("Date of birth must be in the past")
      }

      // Find the selected event from API events
      const selectedApiEvent = apiEvents.find(event => event.event_title === selectedEventType)
      if (!selectedApiEvent) {
        throw new Error("Selected event not found")
      }

      // Get selected games objects (using slot_id for selection)
      const selectedGamesObj = eligibleGames.filter(game => selectedGames.includes(game.id))
      if (selectedGamesObj.length !== selectedGames.length) {
        console.warn(`⚠️ Warning: ${selectedGames.length} games selected but only ${selectedGamesObj.length} found in eligible games`)
      }

      // Calculate total amount using frontend logic
      const totalAmount = calculateTotalPrice()

      // Generate unique booking reference using consistent format
      const generateBookingRef = () => {
        const timestamp = Date.now().toString()
        return generateConsistentBookingRef(timestamp)
      }

      // Process booking_addons according to API structure
      const processedAddons: any[] = []
      if (selectedAddOns.length > 0) {
        // Group addons by addon_id to handle multiple variants of the same addon
        const addonGroups = new Map<number, any>()

        selectedAddOns.forEach(item => {
          const addonId = Number(item.addOn.id)

          if (item.addOn.has_variants && item.variantId) {
            // For addons with variants, group by addon_id and collect variants
            if (!addonGroups.has(addonId)) {
              addonGroups.set(addonId, {
                addon_id: addonId,
                variants: []
              })
            }
            addonGroups.get(addonId).variants.push({
              variant_id: Number(item.variantId),
              quantity: item.quantity
            })
          } else if (!item.addOn.has_variants) {
            // For addons without variants, simple structure
            addonGroups.set(addonId, {
              addon_id: addonId,
              quantity: item.quantity
            })
          }
        })

        // Convert map to array
        processedAddons.push(...Array.from(addonGroups.values()))
      }

      // Create booking data matching the expected API structure
      const bookingData = {
        user_id: 4, // Admin user ID
        parent: {
          parent_name: parentName,
          email: email,
          additional_phone: phone.startsWith('+') ? phone : `+91${phone}`
        },
        child: {
          full_name: childName,
          date_of_birth: childDateOfBirth, // Keep as YYYY-MM-DD format
          school_name: schoolName || "Not Specified",
          gender: childGender
        },
        booking: {
          booking_ref: generateBookingRef(),
          event_id: selectedApiEvent.event_id,
          status: "Confirmed",
          total_amount: totalAmount,
          payment_method: "Admin Created",
          payment_status: "pending", // Admin bookings start as pending
          terms_accepted: true
        },
        booking_games: selectedGamesObj.map(game => ({
          game_id: game.game_id, // Use actual game_id for the API
          game_price: game.price,
          slot_id: game.slot_id // Add slot_id for proper game details lookup
        })),
        booking_addons: processedAddons,
        ...(appliedPromoCode && { promo_code: appliedPromoCode })
      }

      console.log("Creating booking with data:", bookingData)

      // Call the booking creation API (using the same endpoint as user panel)
      const response = await fetch('https://ai.alviongs.com/webhook/v1/nibog/bookingsevents/create', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Booking creation failed:", errorText)
        throw new Error(`Failed to create booking: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      console.log("Booking created successfully:", result)

      // Extract booking ID from the response (webhook returns an array)
      const bookingId = Array.isArray(result) ? result[0]?.booking_id : result.booking_id
      if (!bookingId) {
        throw new Error("Booking created but no booking ID returned")
      }

      // Create payment record with pending status for admin management
      const paymentData = {
        booking_id: bookingId,
        transaction_id: generateUniqueTransactionId("ADMIN_TXN"),
        amount: totalAmount,
        payment_method: "Admin Created",
        payment_status: "pending",
        created_by_admin: true,
        notes: "Created by admin - pending manual processing"
      }

      console.log("Creating payment record:", paymentData)

      // Create payment record
      const paymentResponse = await fetch(PAYMENT_API.CREATE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentData),
      })

      if (!paymentResponse.ok) {
        console.warn("Payment record creation failed, but booking was created successfully")
        // Don't throw error here as booking was successful
      } else {
        const paymentResult = await paymentResponse.json()
        console.log("Payment record created:", paymentResult)
      }

      // Store booking details for payment management
      setCreatedBookingId(bookingId)
      setCreatedBookingRef(bookingData.booking.booking_ref)
      setCreatedBookingAmount(totalAmount)
      setCreatedBookingPhone(phone.startsWith('+') ? phone : `+91${phone}`)
      setCreatedBookingEmail(email)
      setCreatedBookingParentName(parentName)
      setCreatedBookingChildName(childName)
      setBookingCreated(true)

      toast({
        title: "Success",
        description: "Booking created successfully! You can now generate a payment link.",
      })

      // Don't redirect immediately - show payment management options


    } catch (error: any) {
      console.error("Error creating booking:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to create booking. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" asChild>
              <Link href="/admin/bookings">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Create New Booking</h1>
              <p className="text-muted-foreground">Add a new booking for a NIBOG event</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading events and venues...</span>
          </div>
        </div>
      </div>
    )
  }

  // Show payment management UI after booking creation
  if (bookingCreated) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" asChild>
              <Link href="/admin/bookings">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back to Bookings</span>
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Booking Created Successfully</h1>
              <p className="text-muted-foreground">Manage payment for booking {createdBookingRef}</p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Payment Management</CardTitle>
            <p className="text-sm text-muted-foreground">
              Booking has been created with pending payment status. Generate a payment link to send to the customer.
            </p>
            <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
              💡 <strong>Testing Tip:</strong> In sandbox mode, avoid entering real UPI details. Look for "Test Payment" or "Simulate Success" buttons on the PhonePe page, or use test card details instead.
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Booking ID</label>
                <p className="text-lg font-mono">{createdBookingId}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Booking Reference</label>
                <p className="text-lg font-mono">{createdBookingRef}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Amount</label>
                <p className="text-lg font-semibold">₹{createdBookingAmount.toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Customer Phone</label>
                <p className="text-lg">{createdBookingPhone}</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Payment Options</h3>

              {/* Payment Link Generation */}
              <div className="space-y-2">
                <Button
                  onClick={handleGeneratePaymentLink}
                  disabled={isGeneratingPaymentLink}
                  className="w-full"
                >
                  {isGeneratingPaymentLink ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Payment Link...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Generate PhonePe Payment Link
                    </>
                  )}
                </Button>

                {paymentLinkGenerated && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg space-y-3">
                    <p className="text-sm font-medium text-green-800">Payment Link Generated Successfully!</p>

                    <div className="flex gap-2">
                      <Input
                        value={paymentLinkGenerated}
                        readOnly
                        className="font-mono text-xs"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(paymentLinkGenerated)
                          toast({ title: "Copied!", description: "Payment link copied to clipboard" })
                        }}
                      >
                        Copy
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <Button
                        onClick={handleSendPaymentEmail}
                        disabled={isSendingEmail || emailSent}
                        size="sm"
                        className="w-full"
                      >
                        {isSendingEmail ? (
                          <>
                            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                            Sending...
                          </>
                        ) : emailSent ? (
                          <>
                            <CheckCircle className="mr-2 h-3 w-3" />
                            Email Sent
                          </>
                        ) : (
                          <>
                            <Mail className="mr-2 h-3 w-3" />
                            Send via Email
                          </>
                        )}
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const whatsappMessage = generateWhatsAppMessage({
                            parentName: createdBookingParentName,
                            parentEmail: createdBookingEmail,
                            childName: createdBookingChildName,
                            bookingId: createdBookingId!,
                            bookingRef: createdBookingRef,
                            totalAmount: createdBookingAmount,
                            paymentLink: paymentLinkGenerated
                          })
                          const whatsappUrl = `https://wa.me/${createdBookingPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(whatsappMessage)}`
                          window.open(whatsappUrl, '_blank')
                        }}
                        className="w-full"
                      >
                        <MessageCircle className="mr-2 h-3 w-3" />
                        WhatsApp
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(paymentLinkGenerated, '_blank')}
                        className="w-full"
                      >
                        <ExternalLink className="mr-2 h-3 w-3" />
                        Open Link
                      </Button>
                    </div>

                    {emailSent && (
                      <div className="p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
                        ✅ Payment link sent to {createdBookingEmail}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Manual Payment Recording */}
              <div className="space-y-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    // Navigate to manual payment page
                    router.push(`/admin/bookings/payment/${createdBookingId}?amount=${createdBookingAmount}`)
                  }}
                  className="w-full"
                  disabled={!createdBookingId}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Record Manual Payment
                </Button>
              </div>
            </div>

            <Separator />

            <div className="flex justify-end gap-2">
              <Button variant="outline" asChild>
                <Link href="/admin/bookings">
                  View All Bookings
                </Link>
              </Button>
              <Button asChild>
                <Link href="/admin/bookings/new">
                  Create Another Booking
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">


      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/bookings">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create New Booking</h1>
            <p className="text-muted-foreground">Add a new booking for a NIBOG event</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Parent Information</CardTitle>
              <CardDescription>Enter the parent details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="parentName">Parent Name</Label>
                <Input
                  id="parentName"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  placeholder="Enter parent name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter phone number"
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Child Information</CardTitle>
              <CardDescription>Enter the child details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="childName">Child Name</Label>
                <Input
                  id="childName"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  placeholder="Enter child name"
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="childDateOfBirth">Date of Birth</Label>
                  <Input
                    id="childDateOfBirth"
                    type="date"
                    value={childDateOfBirth}
                    onChange={(e) => handleDobChange(e.target.value)}
                    required
                  />
                  {childAgeMonths !== null && (
                    <p className="text-sm text-muted-foreground">
                      Child's age: {childAgeMonths} months
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="childGender">Gender</Label>
                  <Select value={childGender} onValueChange={setChildGender} required>
                    <SelectTrigger id="childGender">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="schoolName">School Name (Optional)</Label>
                <Input
                  id="schoolName"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  placeholder="Enter school name"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Event Information</CardTitle>
              <CardDescription>Select city, event, game, date and time slot in order</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Select value={selectedCityId.toString()} onValueChange={handleCityChange} required>
                  <SelectTrigger id="city">
                    <SelectValue placeholder={
                      isLoadingCities
                        ? "Loading cities..."
                        : cityError
                          ? "Error loading cities"
                          : "Select city"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingCities ? (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading cities...
                      </div>
                    ) : cityError ? (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">
                        {cityError}
                      </div>
                    ) : cities.length === 0 ? (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">
                        No cities available
                      </div>
                    ) : (
                      cities.map((city) => (
                        <SelectItem key={city.id} value={city.id.toString()}>
                          {city.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="event">Event</Label>
                <Select
                  value={selectedEventType}
                  onValueChange={handleEventTypeChange}
                  required
                  disabled={!selectedCityId || isLoadingEvents}
                >
                  <SelectTrigger id="event">
                    <SelectValue placeholder={
                      !selectedCityId
                        ? "Select city first"
                        : isLoadingEvents
                          ? "Loading events..."
                          : eventError
                            ? "Error loading events"
                            : apiEvents.length === 0
                              ? "No events available"
                              : "Select event"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingEvents ? (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading events...
                      </div>
                    ) : eventError ? (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">
                        {eventError}
                      </div>
                    ) : apiEvents.length === 0 ? (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">
                        No events available for this city
                      </div>
                    ) : (
                      apiEvents.map((event) => (
                        <SelectItem key={event.event_id} value={event.event_title}>
                          {event.event_title}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Games (Select multiple based on child's age)</Label>
                {!selectedEventType ? (
                  <p className="text-sm text-muted-foreground">Select event first</p>
                ) : !childDateOfBirth ? (
                  <p className="text-sm text-muted-foreground">Enter child's date of birth first</p>
                ) : isLoadingGames ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Loading games...</span>
                  </div>
                ) : gameError ? (
                  <p className="text-sm text-muted-foreground text-red-600">{gameError}</p>
                ) : eligibleGames.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No games available for this event and child's age</p>
                ) : (
                  <div className="space-y-3">
                    {eligibleGames.map((game) => {
                      const isSelected = selectedGames.includes(game.id)

                      return (
                        <div key={game.id} className="flex items-start space-x-3 p-3 border rounded-lg border-green-200 bg-green-50">
                          <input
                            type="checkbox"
                            id={`game-${game.id}`}
                            checked={isSelected}
                            onChange={() => handleGameToggle(game.id)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <label
                              htmlFor={`game-${game.id}`}
                              className="block text-sm font-medium cursor-pointer text-gray-900"
                            >
                              {game.title}
                            </label>
                            <p className="text-xs text-gray-600">
                              Price: ₹{game.price}
                              {game.start_time && game.end_time && (
                                <span className="ml-2">
                                  Time: {game.start_time} - {game.end_time}
                                </span>
                              )}
                            </p>
                            {game.description && (
                              <p className="text-xs mt-1 text-gray-500">
                                {game.description}
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                    {selectedGames.length > 0 && (
                      <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded">
                        <p className="text-sm text-blue-800">
                          Selected {selectedGames.length} game{selectedGames.length > 1 ? 's' : ''}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>


            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Add-ons Selection</CardTitle>
              <CardDescription>Select optional add-ons for your booking</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingData ? (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>Loading add-ons...</span>
                  </div>
                </div>
              ) : addOns.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No add-ons available
                </div>
              ) : (
                <div className="space-y-4">
                  {addOns.map((addon) => (
                    <div key={addon.id} className="border rounded-lg p-4">
                      <div className="flex items-start gap-4">
                        <div className="relative h-16 w-16 overflow-hidden rounded-md bg-muted">
                          {addon.images && addon.images.length > 0 ? (
                            <img
                              src={addon.images[0]}
                              alt={addon.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                              <span className="text-xs">No image</span>
                            </div>
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium">{addon.name}</h4>
                              <p className="text-sm text-muted-foreground">{addon.description}</p>
                              <div className="mt-1 flex items-center gap-2">
                                <span className="text-sm font-medium">₹{parseFloat(addon.price).toLocaleString()}</span>
                                <span className="text-xs text-muted-foreground capitalize">• {addon.category}</span>
                              </div>
                            </div>
                          </div>

                          {addon.has_variants ? (
                            <div className="mt-3 space-y-2">
                              <p className="text-sm font-medium">Variants:</p>
                              {addon.variants?.map((variant) => {
                                const finalPrice = parseFloat(addon.price) + variant.price_modifier
                                const selectedItem = selectedAddOns.find(item =>
                                  item.addOn.id === addon.id && item.variantId === variant.id
                                )
                                const currentQuantity = selectedItem?.quantity || 0

                                return (
                                  <div key={variant.id} className="flex items-center justify-between p-2 border rounded">
                                    <div className="flex-1">
                                      <span className="text-sm font-medium">{variant.name}</span>
                                      <div className="text-xs text-muted-foreground">
                                        ₹{finalPrice.toLocaleString()}
                                        {variant.price_modifier !== 0 && (
                                          <span className={variant.price_modifier > 0 ? "text-green-600" : "text-red-600"}>
                                            {" "}({variant.price_modifier > 0 ? "+" : ""}₹{variant.price_modifier})
                                          </span>
                                        )}
                                        {" "}• Stock: {variant.stock_quantity}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleAddOnChange(addon, Math.max(0, currentQuantity - 1), variant.id?.toString())}
                                        disabled={currentQuantity === 0}
                                      >
                                        -
                                      </Button>
                                      <span className="w-8 text-center text-sm">{currentQuantity}</span>
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleAddOnChange(addon, currentQuantity + 1, variant.id?.toString())}
                                        disabled={currentQuantity >= variant.stock_quantity}
                                      >
                                        +
                                      </Button>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          ) : (
                            <div className="mt-3">
                              {(() => {
                                const selectedItem = selectedAddOns.find(item =>
                                  item.addOn.id === addon.id && !item.variantId
                                )
                                const currentQuantity = selectedItem?.quantity || 0

                                return (
                                  <div className="flex items-center justify-between">
                                    <div className="text-sm text-muted-foreground">
                                      Stock: {addon.stock_quantity} units
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleAddOnChange(addon, Math.max(0, currentQuantity - 1))}
                                        disabled={currentQuantity === 0}
                                      >
                                        -
                                      </Button>
                                      <span className="w-8 text-center text-sm">{currentQuantity}</span>
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleAddOnChange(addon, currentQuantity + 1)}
                                        disabled={currentQuantity >= addon.stock_quantity}
                                      >
                                        +
                                      </Button>
                                    </div>
                                  </div>
                                )
                              })()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pricing Summary */}
              {(selectedGames.length > 0 || selectedAddOns.length > 0) && (
                <div className="mt-6 p-4 bg-muted/50 rounded-md">
                  <h4 className="font-medium mb-3">Booking Summary:</h4>
                  <div className="space-y-2">
                    {/* Games */}
                    {selectedGames.length > 0 && (
                      <>
                        <div className="text-sm font-medium">Games:</div>
                        {selectedGames.map((gameId) => {
                          const game = eligibleGames.find(g => g.id === gameId)
                          return game ? (
                            <div key={gameId} className="flex justify-between text-sm ml-4">
                              <span>{game.title}</span>
                              <span>₹{game.price.toLocaleString()}</span>
                            </div>
                          ) : null
                        })}
                        <div className="flex justify-between text-sm font-medium ml-4">
                          <span>Games Subtotal:</span>
                          <span>₹{calculateGamesTotal().toLocaleString()}</span>
                        </div>
                      </>
                    )}

                    {/* Add-ons */}
                    {selectedAddOns.length > 0 && (
                      <>
                        <div className="text-sm font-medium mt-3">Add-ons:</div>
                        {selectedAddOns.map((item, index) => {
                          let price = parseFloat(item.addOn.price.toString()) || 0;

                          // Check if this is a variant with a different price
                          if (item.variantId && item.addOn.has_variants && item.addOn.variants) {
                            const variant = item.addOn.variants.find(v => v.id === item.variantId);
                            if (variant && variant.price_modifier) {
                              const modifier = parseFloat(variant.price_modifier.toString());
                              price = parseFloat(item.addOn.price.toString()) + modifier;
                            }
                          }

                          const totalPrice = price * item.quantity;

                          return (
                            <div key={index} className="flex justify-between text-sm ml-4">
                              <span>
                                {item.addOn.name}
                                {item.variantId && item.addOn.variants && (
                                  ` - ${item.addOn.variants.find(v => v.id === item.variantId)?.name || ''}`
                                )}
                                {" "}× {item.quantity}
                              </span>
                              <span>₹{totalPrice.toLocaleString()}</span>
                            </div>
                          )
                        })}
                        <div className="flex justify-between text-sm font-medium ml-4">
                          <span>Add-ons Subtotal:</span>
                          <span>₹{calculateAddOnsTotal().toLocaleString()}</span>
                        </div>
                      </>
                    )}

                    <Separator className="my-2" />

                    {/* Subtotal */}
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>₹{(calculateGamesTotal() + calculateAddOnsTotal()).toLocaleString()}</span>
                    </div>

                    {/* Promo Code Discount */}
                    {appliedPromoCode && discountAmount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Promo Discount ({appliedPromoCode}):</span>
                        <span>-₹{discountAmount.toLocaleString()}</span>
                      </div>
                    )}

                    {/* GST */}
                    <div className="flex justify-between text-sm">
                      <span>GST (18%):</span>
                      <span>₹{calculateGST().toLocaleString()}</span>
                    </div>

                    <Separator className="my-2" />

                    {/* Total */}
                    <div className="flex justify-between font-medium text-lg">
                      <span>Total Amount:</span>
                      <span>₹{calculateTotalPrice().toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Promo Code Section */}
          {selectedEventType && selectedGames.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Promo Code (Optional)</CardTitle>
                <CardDescription>Enter a promo code to get discount on your booking</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="promoCodeInput">Promo Code</Label>
                  <div className="flex gap-2">
                    <Input
                      id="promoCodeInput"
                      value={promoCodeInput}
                      onChange={(e) => handlePromoCodeInputChange(e.target.value)}
                      placeholder="Enter promo code"
                      disabled={isValidatingPromoCode}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePromoCodeValidation}
                      disabled={!promoCodeInput.trim() || isValidatingPromoCode}
                    >
                      {isValidatingPromoCode ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Validating...
                        </>
                      ) : (
                        "Apply"
                      )}
                    </Button>
                  </div>
                </div>

                {/* Show applied promo code */}
                {appliedPromoCode && discountAmount > 0 && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Promo Code Applied:</span>
                        <span className="font-medium">{appliedPromoCode}</span>
                      </div>
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Discount:</span>
                        <span>-₹{discountAmount.toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-green-600 mt-2">Promo code applied successfully!</p>
                    </div>
                  </div>
                )}

                {/* Promo code hint */}
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Tip:</strong> Try "ADMIN10" for a 10% discount on your booking.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end gap-4">
            <Button variant="outline" type="button" asChild>
              <Link href="/admin/bookings">
                Cancel
              </Link>
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Create Booking
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>

  )
}

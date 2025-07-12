"use client"

import Link from "next/link"
import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { NibogLogo } from "@/components/nibog-logo"


// Image slideshow component
function ImageSlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const images = [
    '/images/ball-throw.jpg',
    '/images/cycle-race.jpg',
    '/images/running-race.jpg',
    '/images/hurdle-toddle.jpg',
  ];
  
  // Auto advance slides
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 4000); // Change slide every 4 seconds
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden rounded-lg">
      {images.map((image, index) => (
        <div 
          key={image}
          className={`absolute inset-0 transition-opacity duration-1000 ${index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
        >
          <Image 
            src={image} 
            alt={`NIBOG Games Activity ${index + 1}`}
            fill
            priority={index === 0}
            className="object-cover object-center"
            sizes="(max-width: 768px) 0vw, 50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent">
            <div className="absolute bottom-8 left-8 right-8 text-white">
              <h3 className="text-2xl font-bold mb-2 drop-shadow-md">
                {index === 0 && "Ball Throwing Competition"}
                {index === 1 && "Exciting Cycle Race"}
                {index === 2 && "Fun Running Race"}
                {index === 3 && "Hurdle Toddle Challenge"}
              </h3>
              <p className="text-sm md:text-base drop-shadow-md">
                Join us for exciting kids' events at NIBOG Games!
              </p>
            </div>
          </div>
        </div>
      ))}
      
      {/* Slide indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
        {images.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-all ${index === currentIndex ? 'bg-white w-6' : 'bg-white/50'}`}
            onClick={() => setCurrentIndex(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  // Get the callback URL from the query parameters
  const callbackUrl = searchParams.get("callbackUrl") || "/"
  const returnUrl = searchParams.get("returnUrl") || "/"

  // Handle login form submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Validate form
    if (!email || !password) {
      setError("Please enter both email and password")
      setIsLoading(false)
      return
    }

    try {
      // Get browser and device info
      const deviceInfo = {
        device_id: `web-${Math.random().toString(36).substring(2, 15)}`,
        os: navigator.userAgent.includes('Win') ? 'Windows' :
            navigator.userAgent.includes('Mac') ? 'MacOS' :
            navigator.userAgent.includes('Linux') ? 'Linux' :
            navigator.userAgent.includes('Android') ? 'Android' :
            navigator.userAgent.includes('iOS') ? 'iOS' : 'Unknown',
        os_version: navigator.userAgent,
        browser: navigator.userAgent.includes('Chrome') ? 'Chrome' :
                 navigator.userAgent.includes('Firefox') ? 'Firefox' :
                 navigator.userAgent.includes('Safari') ? 'Safari' :
                 navigator.userAgent.includes('Edge') ? 'Edge' : 'Unknown',
        ip_address: "0.0.0.0" // This will be set by the server
      }

      console.log('Sending login request with:', { email, device_info: deviceInfo });
      
      // Call our API route
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          device_info: deviceInfo
        }),
      })
      
      console.log('Login response status:', response.status);

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }
      
      // The data structure from our login API should be: { success: true, data: userData, token: jwtToken }
      if (!data || !data.success) {
        console.error('Login failed:', data?.error || 'Unknown error');
        throw new Error(data?.error || 'Login failed')
      }

      // Get user data and token from response
      const userData = data.data;
      const token = data.token;
      
      console.log('Login successful, userData:', userData)

      // Check if user is active
      if (!userData.is_active) {
        throw new Error('Account is deactivated');
      }

      // Check if user is locked
      if (userData.is_locked) {
        const lockedUntil = userData.locked_until ? new Date(userData.locked_until) : null;
        if (lockedUntil && lockedUntil > new Date()) {
          throw new Error(`Account is locked until ${lockedUntil.toLocaleString()}`);
        }
      }

      // Store user data in localStorage
      const userDataForStorage = {
        user_id: userData.user_id,
        full_name: userData.full_name,
        email: userData.email,
        email_verified: userData.email_verified,
        phone: userData.phone,
        phone_verified: userData.phone_verified,
        city_id: userData.city_id,
        accepted_terms: userData.accepted_terms,
        terms_accepted_at: userData.terms_accepted_at,
        is_active: userData.is_active,
        is_locked: userData.is_locked,
        locked_until: userData.locked_until,
        deactivated_at: userData.deactivated_at,
        created_at: userData.created_at,
        updated_at: userData.updated_at,
        last_login_at: userData.last_login_at
      };
      localStorage.setItem('nibog-user', JSON.stringify(userDataForStorage));

      // Login successful
      toast({
        title: "Login successful",
        description: "Welcome back " + userData.full_name,
      });

      // Store user data in auth context
      login(userDataForStorage, token);

      // Redirect to the callback URL or return URL after successful login
      router.push(callbackUrl || returnUrl);
      router.refresh(); // Refresh to update the layout with the new auth state

    } catch (error: any) {
      setError(error.message || 'An error occurred during login')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] w-full overflow-hidden bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 dark:from-blue-800/70 dark:via-purple-800/70 dark:to-pink-800/70 py-0 md:py-8 px-0 md:px-4">
      {/* Add animated shapes in the background - visible only on mobile */}
      <div className="absolute inset-0 overflow-hidden z-0 opacity-20 md:hidden">
        <div className="animate-float absolute top-1/4 left-1/5 w-24 h-24 rounded-full bg-yellow-200 dark:bg-yellow-400"></div>
        <div className="animate-float-delayed absolute top-1/3 right-1/4 w-32 h-32 rounded-full bg-pink-200 dark:bg-pink-400"></div>
        <div className="animate-float-slow absolute bottom-1/4 left-1/3 w-40 h-40 rounded-full bg-blue-200 dark:bg-blue-400"></div>
        <div className="animate-spin-slow absolute top-1/2 right-1/3 w-16 h-16 bg-green-200 dark:bg-green-400 rotate-45"></div>
      </div>
      
      <div className="container relative z-10 mx-auto flex flex-col md:flex-row h-[calc(100vh-4rem)] items-center justify-between max-w-6xl">
        {/* Left side with slideshow - visible only on md and up */}
        <div className="hidden md:block md:w-1/2 relative h-full">
          <div className="absolute inset-0 rounded-2xl overflow-hidden m-4 bg-gradient-to-br from-blue-300 via-purple-300 to-pink-300 dark:from-blue-700 dark:via-purple-700 dark:to-pink-700">
            <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,190,255,0.6),rgba(255,182,193,0.6))] rounded-2xl"></div>
            <div className="absolute inset-0 z-10">
              <ImageSlideshow />
            </div>
          </div>
        </div>
        
        {/* Right side with login card */}
        <div className="w-full md:w-1/2 flex justify-center items-center py-8 md:py-0 md:px-8 md:h-full">
          <div className="w-full max-w-md p-2 rounded-2xl" style={{animation: 'pulse-slow 3s ease-in-out infinite'}}>
            <Card className="w-full rounded-xl shadow-xl bg-white/90 dark:bg-gray-900/90 border-2 border-pink-300 dark:border-pink-700 overflow-hidden transition-all hover:shadow-inner transform hover:-translate-y-1">
              <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500"></div>
            
            <CardHeader className="space-y-1 pb-4">
              <div className="flex justify-center">
                <NibogLogo className="h-16 w-auto transform transition-transform hover:scale-105" />
              </div>
              <CardDescription className="text-center text-blue-600 dark:text-blue-300 mt-4 text-2xl font-bold tracking-wider">
                Login
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4 px-6">
              {error && (
                <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-500 dark:bg-red-950/50 dark:text-red-400 border border-red-200 dark:border-red-800 animate-pulse">
                  <span className="mr-2">⚠️</span> {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-purple-700 dark:text-purple-300 font-medium">Your Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="rounded-xl border-2 border-blue-200 dark:border-blue-800 focus:border-purple-400 dark:focus:border-purple-600 transition-all"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-purple-700 dark:text-purple-300 font-medium">Password</Label>
                    <Link href="/forgot-password" className="text-xs text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 transition-colors">
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="rounded-xl border-2 border-blue-200 dark:border-blue-800 focus:border-purple-400 dark:focus:border-purple-600 transition-all"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    className="data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
                  />
                  <Label
                    htmlFor="remember"
                    className="text-sm font-normal leading-none text-blue-700 dark:text-blue-300 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Remember me
                  </Label>
                </div>

                <Button 
                  className="w-full rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-medium py-2 px-4 transition-all duration-300 transform hover:scale-105 hover:shadow-lg" 
                  type="submit" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Entering the portal...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <span className="mr-2">🚀</span> Let's Go!
                    </span>
                  )}
                </Button>
              </form>
              {/* Commented out Google and Phone OTP login options */}
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-2 pb-6 border-t border-purple-100 dark:border-purple-900 pt-4">
              <div className="text-center text-sm text-purple-600 dark:text-purple-400">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="text-pink-600 dark:text-pink-400 font-medium underline-offset-4 hover:underline hover:text-pink-700 dark:hover:text-pink-300 transition-colors">
                  Sign up
                </Link>
              </div>

              {returnUrl && returnUrl !== "/" && (
                <div className="mt-2 text-center text-xs text-blue-600 dark:text-blue-400">
                  You'll be redirected back to complete your journey after login.
                </div>
              )}
            </CardFooter>
          </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading login...</div>}>
      <LoginContent />
    </Suspense>
  )
}

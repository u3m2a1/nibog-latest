'use client';

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"

// Dynamic Home Hero Slider
function HomeHeroSlider() {
  const [sliderImages, setSliderImages] = useState<string[]>([])

  useEffect(() => {
    fetch("https://ai.alviongs.com/webhook/v1/nibog/homesection/get")
      .then(res => res.json())
      .then((data) => {
        const imgs = Array.isArray(data)
          ? data
              .filter((img: any) => img.status === "active")
              .map((img: any) => {
                const rel = img.image_path.replace(/^public/, "")
                return rel.startsWith("/") ? rel : "/" + rel
              })
          : []
        setSliderImages(imgs)
      })
  }, [])

  // Duplicate images for seamless loop
  const loopImages = sliderImages.length > 0
    ? [...sliderImages, sliderImages[0]]
    : []

  return (
    <div className="absolute inset-y-0 left-0 flex w-[400%] animate-slide-slow">
      {loopImages.map((src, i) => (
        <div key={`heroimg-${i}`} className="flex-none w-[25%] h-full">
          <img
            src={src}
            alt="Home Hero"
            className="w-full h-full object-cover opacity-40 dark:opacity-25"
            loading="lazy"
          />
        </div>
      ))}
    </div>
  )
}
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import CitySelector from "@/components/city-selector"
import AgeSelector from "@/components/age-selector"
import { AnimatedTestimonials } from "@/components/animated-testimonials"
import { ArrowRight, Star, Shield, Award, Sparkles, MapPin, Plus, Minus } from "lucide-react"
import { AnimatedBackground } from "@/components/animated-background"

export default function Home() {
  return (
    <AnimatedBackground variant="home">
      <div className="flex flex-col gap-12 pb-8">
      {/* Hero Section */}
      <section className="relative">
        {/* Semi-transparent overlay - adjusted for better balance */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-white/20 dark:from-black/50 dark:to-black/30 -z-10" />
        
        {/* Background image overlay */}
        <div className="absolute inset-0 overflow-hidden -z-20">
          <div className="absolute inset-0 w-full h-full overflow-hidden">
            
            <HomeHeroSlider />
            
          </div>
        </div>
        <div className="container relative z-10 flex flex-col items-center justify-center gap-6 py-16 text-center md:py-24 lg:py-32">
          <Badge className="px-3.5 py-1.5 text-sm font-medium" variant="secondary">
            New India Baby Olympics Games
          </Badge>

          <div className="relative z-20">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
              NIBOG -{" "}
              <span className="relative">
                <span 
                  className="relative z-10 font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 dark:from-purple-400 dark:via-pink-300 dark:to-purple-400 bg-[length:200%_auto] animate-gradient"
                  style={{
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  From Crawling to Racing
                </span>
                <span className="absolute inset-0 z-0 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-300 to-purple-400 dark:from-purple-600 dark:via-pink-500 dark:to-purple-600 bg-[length:200%_auto] animate-gradient opacity-70 blur-sm">
                  From Crawling to Racing
                </span>
              </span>
            </h1>
          </div>
          
          <p className="max-w-[700px] text-muted-foreground md:text-xl">
            India's biggest baby Olympic games, executing in 21 cities of India. Join us for exciting baby games including crawling races, baby walker, running race, and more for children aged 5-84 months.
          </p>
          <div className="w-full max-w-md space-y-4">
            <div className="flex flex-col gap-4">
              <Button 
                size="lg" 
                className="w-full py-6 text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg transform transition-all hover:scale-105"
                asChild
              >
                <Link href="/register-event">
                  Register Now for NIBOG 2025
                </Link>
              </Button>
              
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="container">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Upcoming NIBOG Events</h2>
              <Button variant="link" asChild className="gap-1">
                <Link href="/events">
                  View All <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <p className="text-muted-foreground dark:text-gray-700">Join us for these exciting events featuring multiple baby games in cities across India</p>
          </div>
        </div>
      </section>

      {/* Age Categories Section */}
      <section className="bg-muted/50 py-12">
        <div className="container">
          <div className="flex flex-col gap-6 text-center">
            <div>
              <h2 className="text-2xl font-bold tracking-tight md:text-3xl">NIBOG Games by Age Group</h2>
              <p className="mt-2 text-muted-foreground">
                Age-appropriate Olympic games for babies and young children
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Link href="/events?minAge=5&maxAge=13" className="group">
                <Card className="overflow-hidden transition-all hover:shadow-md">
                  <div className="relative h-40">
                    <Image
                      src="/images/baby-crawling.jpg"
                      alt="Crawling Babies (5-13 months)"
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-4">
                      <h3 className="text-lg font-semibold text-white">Baby Crawling</h3>
                      <p className="text-sm text-white/80">5-13 months</p>
                    </div>
                  </div>
                </Card>
              </Link>
              <Link href="/events?minAge=5&maxAge=13" className="group">
                <Card className="overflow-hidden transition-all hover:shadow-md">
                  <div className="relative h-40">
                    <Image
                      src="/images/baby-walker.jpg"
                      alt="Baby Walker (5-13 months)"
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-4">
                      <h3 className="text-lg font-semibold text-white">Baby Walker</h3>
                      <p className="text-sm text-white/80">5-13 months</p>
                    </div>
                  </div>
                </Card>
              </Link>
              <Link href="/events?minAge=13&maxAge=84" className="group">
                <Card className="overflow-hidden transition-all hover:shadow-md">
                  <div className="relative h-40">
                    <Image
                      src="/images/running-race.jpg"
                      alt="Running Race (13-84 months)"
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-4">
                      <h3 className="text-lg font-semibold text-white">Running Race</h3>
                      <p className="text-sm text-white/80">13-84 months</p>
                    </div>
                  </div>
                </Card>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose NIBOG Section */}
      <section className="bg-muted/50 py-12">
        <div className="container">
          <div className="flex flex-col gap-6 text-center">
            <div>
              <h2 className="text-2xl font-bold tracking-tight md:text-3xl">WHY SPORTS ARE IMPORTANT TO CHILDREN</h2>
              <p className="mx-auto mt-2 max-w-[700px] text-muted-foreground">
                The Child Olympic Games are a wonderful opportunity to get kids excited about sport, national pride and counting medals
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardContent className="flex flex-col items-center gap-4 pt-6">
                  <div className="rounded-full bg-primary/10 p-3">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Physical Development</h3>
                  <p className="text-center text-muted-foreground">
                    Physical activity stimulates growth and leads to improved physical and emotional health.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex flex-col items-center gap-4 pt-6">
                  <div className="rounded-full bg-primary/10 p-3">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Learning Resilience</h3>
                  <p className="text-center text-muted-foreground">
                    Exposing kids to situations where they can fail is actually something beneficial parents can do.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex flex-col items-center gap-4 pt-6">
                  <div className="rounded-full bg-primary/10 p-3">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Creativity & Imagination</h3>
                  <p className="text-center text-muted-foreground">
                    Sport allows children to use their creativity while developing their imagination, dexterity, and physical, cognitive, and emotional strength.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="container">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2 text-center">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Children's Parents Speak for Us</h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground">
              Hear what parents have to say about NIBOG events
            </p>
          </div>
          <AnimatedTestimonials
            testimonials={[
              {
                quote: "The annual NIBOG game has been a huge hit with my kids. They love competing in different challenges and games, and it's been great for their confidence and self-esteem. I love that they're learning important life skills like perseverance and determination while they're having fun.",
                name: "Harikrishna",
                location: "Hyderabad",
                src: "/images/baby-crawling.jpg",
                event: "NIBOG Baby Olympics"
              },
              {
                quote: "New India Baby Olympic games has been a great experience for my kids. They love competing with other kids and showing off their skills, and it's been great for their hand-eye coordination and fine motor skills. I love that they're learning important life skills like teamwork and sportsmanship while they're having fun.",
                name: "Durga Prasad",
                location: "Bangalore",
                src: "/images/baby-walker.jpg",
                event: "NIBOG Baby Olympics"
              },
              {
                quote: "My kids love participating in games. It's been great for their problem-solving skills, as they get to tackle different challenges and puzzles. They've also developed their critical thinking skills and made new friends from different schools.",
                name: "Srujana",
                location: "Vizag",
                src: "/images/running-race.jpg",
                event: "NIBOG Baby Olympics"
              },
              {
                quote: "The organization of the event was flawless. From registration to the actual games, everything was well-planned. The staff was friendly and helpful, making it a stress-free experience for parents and an exciting day for the children.",
                name: "Rajesh Kumar",
                location: "Chennai",
                src: "/images/hurdle-toddle.jpg",
                event: "Chennai Little Champions"
              },
              {
                quote: "What I appreciate most about NIBOG is how they make every child feel like a winner. The focus is on participation and having fun, not just winning. My daughter came home with a medal and the biggest smile I've ever seen!",
                name: "Priya Sharma",
                location: "Mumbai",
                src: "/images/ball-throw.jpg",
                event: "Mumbai Mini Olympics"
              }
            ]}
            className="py-8"
          />
        </div>
      </section>

      {/* Cities Section */}
      <section className="bg-muted/50 py-12">
        <div className="container">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2 text-center">
              <h2 className="text-2xl font-bold tracking-tight md:text-3xl">NIBOG Events Across India</h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground">Find NIBOG events in 21 cities across India</p>
            </div>
            
            <div className="w-full">
              {(() => {
                const cities = [
                  "Hyderabad",
                  "Bangalore",
                  "Chennai",
                  "Vizag",
                  "Patna",
                  "Ranchi",
                  "Nagpur",
                  "Kochi",
                  "Mumbai",
                  "Indore",
                  "Lucknow",
                  "Chandigarh",
                  "Kolkata",
                  "Gurgaon",
                  "Delhi",
                  "Jaipur",
                  "Ahmedabad",
                  "Bhubaneswar",
                  "Pune",
                  "Raipur",
                  "Gandhi Nagar",
                ];
                
                const [showAllCities, setShowAllCities] = useState(false);
                const [visibleCount, setVisibleCount] = useState(6); // Start with 6 cities
                
                // Calculate number of cities to show based on screen size
                const calculateVisibleCount = () => {
                  if (typeof window === 'undefined') return 6;
                  if (window.innerWidth >= 1024) return 11; // Show 11 + 1 (Show More) = 12 (2 rows of 6)
                  if (window.innerWidth >= 768) return 7;   // Show 7 + 1 = 8 (2 rows of 4)
                  if (window.innerWidth >= 640) return 5;   // Show 5 + 1 = 6 (2 rows of 3)
                  return 3;                                 // Show 3 + 1 = 4 (2 rows of 2)
                };
                
                // Set initial visible count
                useEffect(() => {
                  setVisibleCount(calculateVisibleCount());
                }, []);
                
                // Handle window resize
                useEffect(() => {
                  const handleResize = () => {
                    if (!showAllCities) {
                      setVisibleCount(calculateVisibleCount());
                    }
                  };
                  
                  window.addEventListener('resize', handleResize);
                  return () => window.removeEventListener('resize', handleResize);
                }, [showAllCities]);
                
                // Toggle between showing all cities and initial count
                const toggleShowAll = () => {
                  setShowAllCities(!showAllCities);
                };
                
                // Determine which cities to show
                const displayCities = showAllCities ? cities : cities.slice(0, visibleCount);
                
                return (
                  <div className="relative">
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                      {displayCities.map((city) => (
                        <Link key={city} href={`/events?city=${city.toLowerCase()}`}>
                          <Card className="group h-full flex flex-col justify-center transition-all hover:border-primary hover:shadow-sm dark:bg-slate-800/90 dark:hover:border-primary">
                            <CardContent className="flex flex-col items-center justify-center p-4 text-center h-full">
                              <MapPin className="mb-2 h-6 w-6 text-muted-foreground group-hover:text-primary" />
                              <span className="text-lg font-medium group-hover:text-primary dark:text-white">{city}</span>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                      
                      {/* Show More/Less Button - always visible as the last item */}
                      <div 
                        onClick={toggleShowAll}
                        className="flex items-center justify-center cursor-pointer group"
                      >
                        <Card className="h-full w-full flex items-center justify-center transition-all hover:border-primary hover:shadow-sm dark:bg-slate-800/90 dark:hover:border-primary group-hover:bg-primary/5">
                          <CardContent className="flex flex-col items-center justify-center p-4 text-center">
                            <div className="w-8 h-8 mb-2 flex items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 dark:bg-primary/20 dark:group-hover:bg-primary/30">
                              {showAllCities ? (
                                <Minus className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                              ) : (
                                <Plus className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                              )}
                            </div>
                            <span className="font-medium text-primary">
                              {showAllCities ? 'Show Less' : 'Show More'}
                            </span>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </section>



      {/* Stats Section */}
      <section className="bg-primary/10 py-12">
        <div className="container">
          <div className="grid gap-6 text-center sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <h3 className="text-4xl font-bold">1500+</h3>
              <p className="text-muted-foreground">Registrations</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-4xl font-bold">16</h3>
              <p className="text-muted-foreground">Games</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-4xl font-bold">21</h3>
              <p className="text-muted-foreground">Cities</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container">
        <div className="rounded-lg bg-gradient-to-r from-primary/20 via-purple-400/10 to-primary/5 p-8 text-center md:p-12">
          <h2 className="mb-4 text-2xl font-bold tracking-tight md:text-3xl">NIBOG 2025</h2>
          <p className="mx-auto mb-6 max-w-[600px] text-muted-foreground">
            Vizag, Hyderabad, Bangalore, Mumbai and Delhi Registrations Open
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" asChild>
              <Link href="/register-event">Register Now</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/events">Browse Events</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
    </AnimatedBackground>
  )
}

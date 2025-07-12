import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { CheckCircle2, Users, Trophy, Calendar, MapPin, Heart, ChevronLeft, ChevronRight } from "lucide-react"
import type { Metadata } from "next"
import { AnimatedBackground } from "@/components/animated-background"
import { ImageSlideshow } from "@/components/image-slideshow"
import { TestimonialCarousel } from "@/components/testimonial-carousel"

export const metadata: Metadata = {
  title: "About NIBOG | New India Baby Olympic Games",
  description: "Learn about NIBOG - India's biggest baby Olympic games, our mission, vision, and the team behind it.",
}

export default function AboutPage() {
  return (
    <AnimatedBackground variant="about">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white py-16 dark:from-blue-950/20 dark:to-background md:py-24">
        <div className="container relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">About NIBOG</h1>
            <p className="mt-4 text-xl text-muted-foreground">
              India's biggest baby Olympic games, celebrating the joy of childhood through play and competition
            </p>
          </div>
        </div>
        <div className="absolute inset-0 z-0 opacity-20">
          <Image
            src="/images/about/pattern-bg.jpg"
            alt="Background pattern"
            fill
            className="object-cover"
            priority
          />
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="grid gap-12 md:grid-cols-2">
            <div className="space-y-4">
              <div className="inline-block rounded-lg bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                Our Mission
              </div>
              <h2 className="text-3xl font-bold tracking-tight">Nurturing India's Future Champions</h2>
              <p className="text-muted-foreground">
                At NIBOG, our mission is to create a platform that celebrates the natural abilities and
                enthusiasm of children through age-appropriate competitive events. We believe in fostering
                physical activity, social skills, and confidence in children from an early age.
              </p>
              <ul className="space-y-2">
                {[
                  "Promote physical activity and healthy competition",
                  "Build confidence and social skills in children",
                  "Create memorable experiences for families",
                  "Celebrate childhood achievements",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-1 h-5 w-5 flex-shrink-0 text-green-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <ImageSlideshow
              images={[
                {
                  src: "/images/about/children/children-1.jpg",
                  alt: "Children playing together happily"
                },
                {
                  src: "/images/about/children/children-2.jpg",
                  alt: "Kids participating in fun activities"
                },
                {
                  src: "/images/about/children/children-3.jpg",
                  alt: "Children laughing and having fun"
                },
                {
                  src: "/images/about/children/children-4.jpg",
                  alt: "Kids playing outdoor games"
                },
                {
                  src: "/images/about/children/children-5.jpg",
                  alt: "Children celebrating together"
                }
              ]}
              interval={4000}
            />
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="bg-slate-50 py-16 dark:bg-slate-900/30 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-block rounded-lg bg-orange-100 px-3 py-1 text-sm font-medium text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
              Our Story
            </div>
            <h2 className="mt-4 text-3xl font-bold tracking-tight">The NIBOG Journey</h2>
            <p className="mt-4 text-muted-foreground">
              NIBOG was founded with a simple idea: to create a platform where children can showcase their
              natural abilities in a fun, supportive environment. What started as a small event in one city
              has now grown into India's largest baby Olympic games.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                  <Calendar className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Founded in 2018</h3>
                <p className="mt-2 text-muted-foreground">
                  NIBOG was established with our first event in Hyderabad, featuring just 100 participants.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300">
                  <MapPin className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">21 Cities and Growing</h3>
                <p className="mt-2 text-muted-foreground">
                  Today, NIBOG events are held in 21 cities across India, bringing joy to thousands of families.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">50,000+ Participants</h3>
                <p className="mt-2 text-muted-foreground">
                  We've welcomed over 50,000 young participants to our events, creating countless memories.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Image Gallery */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-block rounded-lg bg-pink-100 px-3 py-1 text-sm font-medium text-pink-800 dark:bg-pink-900/30 dark:text-pink-300">
              Gallery
            </div>
            <h2 className="mt-4 text-3xl font-bold tracking-tight">Moments of Joy</h2>
            <p className="mt-4 text-muted-foreground">
              Capturing the excitement, determination, and pure joy of our little champions
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {[
              {
                src: "/images/about/gallery-1.jpg",
                alt: "Baby crawling competition",
              },
              {
                src: "/images/about/gallery-2.jpg",
                alt: "Children in a running race",
              },
              {
                src: "/images/about/gallery-3.jpg",
                alt: "Baby walker event",
              },
              {
                src: "/images/about/gallery-4.jpg",
                alt: "Child receiving medal",
              },
              {
                src: "/images/about/gallery-5.jpg",
                alt: "Parents cheering for their children",
              },
              {
                src: "/images/about/gallery-6.jpg",
                alt: "Children playing together",
              },
              {
                src: "/images/about/gallery-7.jpg",
                alt: "Baby smiling during event",
              },
              {
                src: "/images/about/gallery-8.jpg",
                alt: "Group photo of participants",
              },
            ].map((image, i) => (
              <div key={i} className="relative aspect-square overflow-hidden rounded-lg">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section className="bg-slate-50 py-16 dark:bg-slate-900/30 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-block rounded-lg bg-green-100 px-3 py-1 text-sm font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300">
              Our Team
            </div>
            <h2 className="mt-4 text-3xl font-bold tracking-tight">The People Behind NIBOG</h2>
            <p className="mt-4 text-muted-foreground">
              Meet our dedicated team of professionals who work tirelessly to create magical experiences for children
            </p>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {[
              {
                name: "Rajesh Kumar",
                role: "Founder & CEO",
                image: "/images/about/team-1.jpg",
              },
              {
                name: "Priya Sharma",
                role: "Event Director",
                image: "/images/about/team-2.jpg",
              },
              {
                name: "Vikram Singh",
                role: "Operations Manager",
                image: "/images/about/team-3.jpg",
              },
              {
                name: "Ananya Patel",
                role: "Child Development Specialist",
                image: "/images/about/team-4.jpg",
              },
            ].map((member, i) => (
              <div key={i} className="group">
                <div className="relative aspect-square overflow-hidden rounded-xl">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <h3 className="mt-4 text-xl font-bold">{member.name}</h3>
                <p className="text-muted-foreground">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-block rounded-lg bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
              Testimonials
            </div>
            <h2 className="mt-4 text-3xl font-bold tracking-tight">What Parents Say</h2>
            <p className="mt-4 text-muted-foreground">
              Hear from the parents whose children have participated in NIBOG events
            </p>
          </div>

          <div className="mt-12">
            <TestimonialCarousel
              testimonials={[
                {
                  quote: "NIBOG has been a wonderful experience for my son. He's gained so much confidence and made new friends. The events are well-organized and the staff is amazing!",
                  name: "Meera Reddy",
                  location: "Hyderabad",
                },
                {
                  quote: "My daughter looks forward to NIBOG events every year. It's become a family tradition for us. The joy on her face when she participates is priceless.",
                  name: "Arjun Malhotra",
                  location: "Bangalore",
                },
                {
                  quote: "The way NIBOG organizes age-appropriate competitions is commendable. My twins have developed healthy competitive spirit while having fun.",
                  name: "Lakshmi Nair",
                  location: "Chennai",
                },
                {
                  quote: "We traveled from Mumbai just for this event, and it was worth every mile! The organization was flawless.",
                  name: "Rahul Verma",
                  location: "Mumbai",
                },
                {
                  quote: "My child was quite shy before joining NIBOG. Now, he's more confident and loves participating in events. Thank you for this platform!",
                  name: "Priya Singh",
                  location: "Delhi",
                },
                {
                  quote: "The safety measures and care taken for the children are exceptional. We always feel comfortable at NIBOG events.",
                  name: "Ananya Gupta",
                  location: "Kolkata",
                },
              ]}
              autoPlayInterval={5000}
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 py-16 text-white dark:bg-blue-900 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
              Join the NIBOG Family
            </h2>
            <p className="mt-4 text-xl text-blue-100">
              Register your child for our upcoming events and be part of India's biggest baby Olympic games
            </p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/register-event">Register Now</Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent text-white hover:bg-white/10" asChild>
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </AnimatedBackground>
  )
}

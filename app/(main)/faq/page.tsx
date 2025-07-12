import { Metadata } from "next"
import Link from "next/link"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const metadata: Metadata = {
  title: "Frequently Asked Questions | NIBOG - New India Baby Olympic Games",
  description: "Find answers to common questions about NIBOG events, registration, rules, and more.",
}

export default function FAQPage() {
  return (
    <div className="container py-12 md:py-16 lg:py-24">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Frequently Asked Questions</h1>
          <p className="text-xl text-muted-foreground">
            Find answers to common questions about NIBOG events
          </p>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="registration">Registration</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="rules">Rules</TabsTrigger>
            <TabsTrigger value="prizes">Prizes & Certificates</TabsTrigger>
          </TabsList>
          
          {/* General FAQs */}
          <TabsContent value="general" className="mt-6">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>What is NIBOG?</AccordionTrigger>
                <AccordionContent>
                  NIBOG (New India Baby Olympic Games) is India's biggest baby Olympic games platform, focused exclusively on conducting baby games for children aged 5 months to 12 years. We organize competitive events in 21 cities across India, providing a platform for children to showcase their abilities, build confidence, and have fun.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-2">
                <AccordionTrigger>What age groups can participate in NIBOG events?</AccordionTrigger>
                <AccordionContent>
                  NIBOG events are designed for children aged 5 months to 12 years. Different events have specific age categories, and children can only participate in events appropriate for their age group. The age of the child on the event date will be considered for determining eligibility.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-3">
                <AccordionTrigger>Where are NIBOG events held?</AccordionTrigger>
                <AccordionContent>
                  NIBOG events are currently held in 21 cities across India, including Hyderabad, Bangalore, Mumbai, Delhi, Chennai, Kolkata, Pune, Ahmedabad, and more. Events are typically held in indoor stadiums, sports complexes, or large event venues to ensure comfort and safety for all participants.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-4">
                <AccordionTrigger>How often are NIBOG events organized?</AccordionTrigger>
                <AccordionContent>
                  NIBOG organizes events throughout the year. Major events are typically held quarterly in each city, with special events during school holidays and festive seasons. Check our Events page for upcoming events in your city.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-5">
                <AccordionTrigger>Who can I contact for more information?</AccordionTrigger>
                <AccordionContent>
                  You can contact our customer support team at info@nibog.in or call us at +91 98765 43210. Our office hours are Monday to Friday, 9:00 AM to 6:00 PM, and Saturday, 10:00 AM to 2:00 PM. You can also visit our Contact page for more information.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>
          
          {/* Registration FAQs */}
          <TabsContent value="registration" className="mt-6">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>How do I register my child for a NIBOG event?</AccordionTrigger>
                <AccordionContent>
                  You can register your child through our website by visiting the Events page, selecting an event in your city, and following the registration process. You'll need to provide your child's details and make the registration payment online. Registration is complete only after full payment.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-2">
                <AccordionTrigger>What information do I need to provide during registration?</AccordionTrigger>
                <AccordionContent>
                  During registration, you'll need to provide:
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Parent/guardian contact information (name, email, phone)</li>
                    <li>Child's full name, date of birth, and gender</li>
                    <li>Events you wish to register for</li>
                    <li>Any special requirements or health information</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-3">
                <AccordionTrigger>What is the registration fee?</AccordionTrigger>
                <AccordionContent>
                  Registration fees vary depending on the event, age category, and city. Basic registration starts at ₹500 per event, with discounts available for multiple event registrations. The exact fee will be displayed during the registration process.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-4">
                <AccordionTrigger>Can I register for multiple events?</AccordionTrigger>
                <AccordionContent>
                  Yes, you can register your child for multiple events as long as they meet the age requirements for each event and the event schedules don't conflict. We offer discounts for multiple event registrations.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-5">
                <AccordionTrigger>What is your cancellation and refund policy?</AccordionTrigger>
                <AccordionContent>
                  Our refund policy depends on when you cancel:
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>More than 30 days before: Full refund minus ₹200 processing fee</li>
                    <li>15-30 days before: 75% refund</li>
                    <li>7-14 days before: 50% refund</li>
                    <li>Less than 7 days before: No refund</li>
                  </ul>
                  Please see our <Link href="/refund" className="text-primary hover:underline">Refund Policy</Link> for complete details.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>
          
          {/* Events FAQs */}
          <TabsContent value="events" className="mt-6">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>What types of events does NIBOG offer?</AccordionTrigger>
                <AccordionContent>
                  NIBOG offers a variety of age-appropriate events, including:
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Baby Crawling (5-12 months)</li>
                    <li>Baby Walker (10-18 months)</li>
                    <li>Running Race (2-12 years, with age categories)</li>
                    <li>Hurdle Toddle (2-5 years)</li>
                    <li>Cycle Race (3-12 years, with age categories)</li>
                    <li>Ring Holding (2-6 years)</li>
                    <li>And many more specialized events</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-2">
                <AccordionTrigger>How long do the events last?</AccordionTrigger>
                <AccordionContent>
                  Individual events typically last 1-5 minutes per participant, depending on the event type. The entire event day may last 4-6 hours, with different age categories scheduled at different times. You will receive a detailed schedule before the event with your child's reporting time.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-3">
                <AccordionTrigger>What should my child wear to the event?</AccordionTrigger>
                <AccordionContent>
                  Children should wear comfortable clothing that allows for easy movement. Sports attire is recommended. For crawling events, knee pads are optional but recommended. Shoes should be comfortable and appropriate for the event (e.g., sports shoes for running events).
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-4">
                <AccordionTrigger>Can parents accompany their children during the events?</AccordionTrigger>
                <AccordionContent>
                  Yes, parents can accompany very young children (especially in the baby crawling and baby walker categories). For older children, parents will be seated in the designated viewing area. One parent/guardian must be present at the venue throughout the event.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-5">
                <AccordionTrigger>What happens if my child doesn't want to participate on the day?</AccordionTrigger>
                <AccordionContent>
                  We understand that young children may sometimes feel uncomfortable in new environments. Our staff will try to make your child comfortable, but we never force participation. Unfortunately, registration fees are non-refundable in such cases, as mentioned in our refund policy.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>
          
          {/* Rules FAQs */}
          <TabsContent value="rules" className="mt-6">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>What are the rules for the Baby Crawling event?</AccordionTrigger>
                <AccordionContent>
                  For Baby Crawling (5-12 months):
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Babies must crawl on all fours (hands and knees)</li>
                    <li>Parents can encourage from the finish line but cannot touch the baby</li>
                    <li>The track is 5 meters long with soft mats</li>
                    <li>Fastest time wins</li>
                    <li>Maximum time allowed is 3 minutes</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-2">
                <AccordionTrigger>What are the rules for the Running Race?</AccordionTrigger>
                <AccordionContent>
                  For Running Race (varies by age category):
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>2-3 years: 20 meter race</li>
                    <li>4-5 years: 30 meter race</li>
                    <li>6-8 years: 50 meter race</li>
                    <li>9-12 years: 100 meter race</li>
                    <li>Participants must stay in their lanes</li>
                    <li>False starts result in a warning; second false start is disqualification</li>
                    <li>Fastest time wins</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-3">
                <AccordionTrigger>How are winners determined?</AccordionTrigger>
                <AccordionContent>
                  Winners are determined based on the specific rules of each event. For races, the fastest time wins. For other events, judges evaluate based on predetermined criteria appropriate for the age group and activity. All decisions by the judges are final.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-4">
                <AccordionTrigger>Are there any disqualification rules?</AccordionTrigger>
                <AccordionContent>
                  Yes, participants may be disqualified for:
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Not following the specific event rules</li>
                    <li>Parental interference beyond what's allowed</li>
                    <li>Unsportsmanlike conduct</li>
                    <li>Age misrepresentation</li>
                    <li>Multiple false starts (for racing events)</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-5">
                <AccordionTrigger>Can I appeal a judge's decision?</AccordionTrigger>
                <AccordionContent>
                  Appeals must be made in writing to the event director within 15 minutes of the event's conclusion. The appeal will be reviewed by a panel of judges, and their decision will be final. Please note that video evidence from parents is not considered for appeals.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>
          
          {/* Prizes FAQs */}
          <TabsContent value="prizes" className="mt-6">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>What prizes do winners receive?</AccordionTrigger>
                <AccordionContent>
                  Prizes vary by event and age category, but typically include:
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>1st Place: Gold medal, certificate, and trophy</li>
                    <li>2nd Place: Silver medal and certificate</li>
                    <li>3rd Place: Bronze medal and certificate</li>
                    <li>Special prizes from sponsors may also be awarded</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-2">
                <AccordionTrigger>Do all participants receive certificates?</AccordionTrigger>
                <AccordionContent>
                  Yes, all participants receive a participation certificate regardless of their performance. We believe in recognizing every child's effort and courage to participate.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-3">
                <AccordionTrigger>When are prizes and certificates distributed?</AccordionTrigger>
                <AccordionContent>
                  Medals and trophies are typically awarded during a ceremony at the end of each event category. Participation certificates are distributed as participants exit the event area. If you need to leave early, please inform the registration desk to collect your child's certificate.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-4">
                <AccordionTrigger>What if my child's name is misspelled on the certificate?</AccordionTrigger>
                <AccordionContent>
                  Please check your child's name carefully during registration. If there is a mistake on the certificate, please inform the registration desk on the event day, and we will arrange for a corrected certificate to be sent to you within 7-10 business days.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-5">
                <AccordionTrigger>Are there any cash prizes?</AccordionTrigger>
                <AccordionContent>
                  For standard events, we do not offer cash prizes. However, for special championship events or national finals, there may be scholarships or cash prizes. Details for such events will be clearly mentioned in the event description.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>
        </Tabs>

        <div className="mt-12 space-y-6">
          <h2 className="text-2xl font-bold text-center">Still have questions?</h2>
          
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <h3 className="text-xl font-medium">Contact Our Support Team</h3>
                  <p className="text-muted-foreground">
                    Our customer support team is available to answer any questions you may have about NIBOG events.
                  </p>
                  <Button className="w-full" asChild>
                    <Link href="/contact">Contact Us</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <h3 className="text-xl font-medium">Read Our Policies</h3>
                  <p className="text-muted-foreground">
                    For detailed information about our terms, privacy, and refund policies.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/terms">Terms & Conditions</Link>
                    </Button>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/refund">Refund Policy</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

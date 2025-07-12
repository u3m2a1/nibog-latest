import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms & Conditions | NIBOG - New India Baby Olympic Games",
  description: "Read the terms and conditions for participating in NIBOG events and using our platform.",
}

export default function TermsPage() {
  return (
    <div className="container py-12 md:py-16 lg:py-24">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Terms & Conditions</h1>
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>

        <div className="space-y-6">
          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">1. Acceptance of Terms</h2>
            <p>
              By accessing and using the NIBOG (New India Baby Olympic Games) website and services, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, please do not use our services.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">2. Registration and Participation</h2>
            <p>
              2.1. All participants must be registered by their parent or legal guardian.
            </p>
            <p>
              2.2. The age of the child on the event date will be considered for determining eligibility for specific events.
            </p>
            <p>
              2.3. Registration is complete only after full payment of the registration fee.
            </p>
            <p>
              2.4. NIBOG reserves the right to refuse registration or participation without providing a reason.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">3. Event Rules and Conduct</h2>
            <p>
              3.1. Participants and their guardians must follow all rules specific to each event.
            </p>
            <p>
              3.2. NIBOG reserves the right to disqualify any participant who does not follow the rules or whose behavior is deemed inappropriate.
            </p>
            <p>
              3.3. The decision of the judges and event officials is final.
            </p>
            <p>
              3.4. Parents/guardians are responsible for the safety and behavior of their children at all times during the event.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">4. Photography and Media</h2>
            <p>
              4.1. By participating in NIBOG events, you grant NIBOG the right to take photographs and videos of participants and use them for promotional purposes.
            </p>
            <p>
              4.2. If you do not wish for your child to be photographed, you must notify the event organizers in writing before the event.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">5. Health and Safety</h2>
            <p>
              5.1. Parents/guardians are responsible for ensuring their child is in good health to participate in the events.
            </p>
            <p>
              5.2. NIBOG will take reasonable precautions to ensure the safety of all participants, but is not responsible for any injuries that may occur during the events.
            </p>
            <p>
              5.3. In case of emergency, NIBOG staff may seek medical assistance for a child, and the parent/guardian will be responsible for any medical expenses.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">6. Cancellation and Rescheduling</h2>
            <p>
              6.1. NIBOG reserves the right to cancel or reschedule events due to unforeseen circumstances, including but not limited to weather conditions, venue issues, or insufficient participation.
            </p>
            <p>
              6.2. In case of cancellation by NIBOG, participants will be offered a refund or the option to participate in a rescheduled event.
            </p>
            <p>
              6.3. Please refer to our Refund Policy for details on cancellations by participants.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">7. Limitation of Liability</h2>
            <p>
              7.1. NIBOG, its employees, volunteers, and partners shall not be liable for any direct, indirect, incidental, special, or consequential damages resulting from participation in our events or use of our website.
            </p>
            <p>
              7.2. By registering for NIBOG events, parents/guardians acknowledge and accept these limitations of liability.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">8. Changes to Terms</h2>
            <p>
              8.1. NIBOG reserves the right to modify these Terms and Conditions at any time.
            </p>
            <p>
              8.2. Changes will be effective immediately upon posting on our website.
            </p>
            <p>
              8.3. Continued use of our services after changes constitutes acceptance of the modified terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">9. Governing Law</h2>
            <p>
              These Terms and Conditions shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law principles.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">10. Contact Information</h2>
            <p>
              For questions or concerns regarding these Terms and Conditions, please contact us at:
            </p>
            <p>
              Email: legal@nibog.in<br />
              Phone: +91 98765 43210<br />
              Address: Gachibowli Indoor Stadium, Hyderabad, Telangana 500032
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

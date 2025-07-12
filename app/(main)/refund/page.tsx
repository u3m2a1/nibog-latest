import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Refund Policy | NIBOG - New India Baby Olympic Games",
  description: "Learn about NIBOG's refund policy for event registrations and cancellations.",
}

export default function RefundPolicyPage() {
  return (
    <div className="container py-12 md:py-16 lg:py-24">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Refund Policy</h1>
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>

        <div className="space-y-6">
          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">1. Registration Fees</h2>
            <p>
              NIBOG (New India Baby Olympic Games) charges registration fees for participation in our events. These fees cover the cost of organizing the event, venue, equipment, staff, certificates, medals, and other operational expenses.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">2. Cancellation by Participant</h2>
            <p>
              If you need to cancel your registration, the following refund policy applies:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>More than 30 days before the event:</strong> Full refund minus a ₹200 processing fee</li>
              <li><strong>15-30 days before the event:</strong> 75% refund of the registration fee</li>
              <li><strong>7-14 days before the event:</strong> 50% refund of the registration fee</li>
              <li><strong>Less than 7 days before the event:</strong> No refund</li>
            </ul>
            <p>
              All cancellation requests must be submitted in writing to refunds@nibog.in.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">3. No-Shows</h2>
            <p>
              If a registered participant does not attend the event without prior cancellation notice, no refund will be provided.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">4. Event Rescheduling</h2>
            <p>
              If NIBOG reschedules an event:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Your registration will automatically be transferred to the new date</li>
              <li>If you cannot attend the rescheduled date, you may request a full refund within 7 days of the rescheduling announcement</li>
              <li>After 7 days, our standard cancellation policy (as outlined in section 2) will apply</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">5. Event Cancellation by NIBOG</h2>
            <p>
              If NIBOG cancels an event entirely:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>All participants will receive a full refund of their registration fees</li>
              <li>Refunds will be processed within 10-15 business days</li>
              <li>NIBOG is not responsible for any other expenses incurred by participants (such as travel or accommodation)</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">6. Refund Process</h2>
            <p>
              Refunds will be processed using the original payment method:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Credit/debit card payments will be refunded to the same card</li>
              <li>Bank transfers will be refunded to the originating account</li>
              <li>UPI payments will be refunded to the same UPI ID</li>
            </ul>
            <p>
              Please allow 7-10 business days for the refund to be processed and an additional 3-5 business days for the amount to reflect in your account.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">7. Registration Transfers</h2>
            <p>
              If you are unable to attend an event, you may transfer your registration to another child in the same age category at no additional cost. Transfer requests must be submitted at least 3 days before the event by emailing transfers@nibog.in with details of both the original registrant and the new participant.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">8. Special Circumstances</h2>
            <p>
              In case of special circumstances such as medical emergencies or family emergencies, NIBOG may consider exceptions to this refund policy on a case-by-case basis. Supporting documentation may be required.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">9. Changes to This Policy</h2>
            <p>
              NIBOG reserves the right to modify this refund policy at any time. Changes will be effective immediately upon posting on our website. The policy that was in effect at the time of registration will apply to that registration.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">10. Contact Information</h2>
            <p>
              For questions or concerns regarding our refund policy, please contact us at:
            </p>
            <p>
              Email: refunds@nibog.in<br />
              Phone: +91 98765 43210<br />
              Address: Gachibowli Indoor Stadium, Hyderabad, Telangana 500032
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

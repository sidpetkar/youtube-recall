import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Terms of Service — Recall",
  description: "Terms of Service for Recall - YouTube Video Organizer",
}

export default function TermsPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8">
        <Link 
          href="/" 
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to Recall
        </Link>
      </div>
      
      <h1 className="text-4xl font-bold mb-2">Terms of Service — Recall</h1>
      <p className="text-muted-foreground mb-8">Last updated: January 28, 2026</p>

      <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
        <p>
          These Terms of Service ("Terms") govern your access to and use of Recall ("the Service"). By using the Service, you agree to these Terms.
        </p>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">1) The Service</h2>
          <p>
            Recall lets you sign in with Google and organize YouTube videos into folders. Some features require connecting your Google/YouTube account permissions.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">2) Eligibility</h2>
          <p>
            You must be legally able to form a contract and comply with applicable laws to use the Service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">3) Your account</h2>
          <p>
            You are responsible for maintaining the security of your account. You agree not to misuse the Service or attempt unauthorized access.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">4) Permissions and third-party services</h2>
          <p>
            The Service uses Google Sign-In and YouTube Data API. Your use of Google services is also governed by Google's terms and policies. You can revoke Recall's access at any time from your Google Account settings.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">5) Acceptable use</h2>
          <p>You agree not to:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Use the Service for unlawful purposes</li>
            <li>Attempt to disrupt or compromise the Service</li>
            <li>Reverse engineer or abuse the Service</li>
            <li>Use automated means to overload the system</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">6) Content and ownership</h2>
          <p>
            You retain ownership of your content. The Service may store references to videos (e.g., video IDs) and folder organization data to provide functionality. We do not claim ownership over your YouTube content.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">7) Availability and changes</h2>
          <p>
            We may modify, suspend, or discontinue parts of the Service at any time. We try to keep the Service available but do not guarantee uninterrupted operation.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">8) Disclaimers</h2>
          <p>
            The Service is provided "as is" without warranties of any kind. We do not guarantee the accuracy or availability of third-party data (such as YouTube API responses).
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">9) Limitation of liability</h2>
          <p>
            To the maximum extent permitted by law, Recall will not be liable for indirect, incidental, special, consequential, or punitive damages arising from your use of the Service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">10) Termination</h2>
          <p>
            We may suspend or terminate access if you violate these Terms. You may stop using the Service at any time. You may request data deletion by contacting: <a href="mailto:siddhantpetkar@gmail.com" className="text-primary hover:underline">siddhantpetkar@gmail.com</a>.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">11) Changes to these Terms</h2>
          <p>
            We may update these Terms from time to time. Continued use of the Service after updates means you accept the updated Terms.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">12) Contact</h2>
          <p>For questions, contact:</p>
          <p>
            <strong>Email:</strong> <a href="mailto:siddhantpetkar@gmail.com" className="text-primary hover:underline">siddhantpetkar@gmail.com</a>
          </p>
        </section>
      </div>
    </div>
  )
}

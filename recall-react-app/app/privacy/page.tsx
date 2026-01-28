import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Privacy Policy — Recall",
  description: "Privacy Policy for Recall - YouTube Video Organizer",
}

export default function PrivacyPage() {
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
      
      <h1 className="text-4xl font-bold mb-2">Privacy Policy — Recall</h1>
      <p className="text-muted-foreground mb-8">Last updated: January 28, 2026</p>

      <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
        <p>
          Recall ("we", "our", "us") helps users organize YouTube videos into folders. This Privacy Policy explains what data we collect, how we use it, and your choices.
        </p>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">1) Information we collect</h2>
          
          <h3 className="text-xl font-semibold mt-6 mb-2">Google Account Information (via Google Sign-In):</h3>
          <p>
            When you sign in with Google, we may receive basic profile information such as your name, email address, and profile picture.
          </p>
          
          <h3 className="text-xl font-semibold mt-6 mb-2">YouTube Data (via YouTube Data API):</h3>
          <p>
            With your permission, we access limited YouTube data to enable the core functionality of the app. This may include reading a list of videos such as "Liked videos" and related video metadata (e.g., video ID, title, thumbnail, channel name).
          </p>
          <p>
            We do not access your Google Drive data.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">2) How we use your information</h2>
          <p>We use the information to:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Authenticate you and maintain your session</li>
            <li>Display your YouTube videos inside the app</li>
            <li>Allow you to organize videos into folders</li>
            <li>Save your folder structure and video associations for your account</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">3) Data storage and security</h2>
          <p>
            We store app data (such as folder names and the video IDs you organize) in our database provider (Supabase). We take reasonable steps to protect data using industry-standard security practices. No method of transmission or storage is 100% secure, but we work to protect your data.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">4) Data sharing</h2>
          <p>We do not sell your personal information.</p>
          <p>We do not share your data with third parties except:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Service providers required to operate the app (e.g., hosting, database)</li>
            <li>When required by law</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">5) Data retention</h2>
          <p>
            We retain your data for as long as your account is active or as needed to provide the service. You may request deletion (see Section 7).
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">6) Your choices and control</h2>
          <p>You can control or revoke access at any time:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>
              <strong>Google Account Permissions:</strong> You can remove Recall's access from your Google Account security settings.
            </li>
            <li>Revoking access may limit or stop the app from fetching YouTube data.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">7) Account deletion / data deletion requests</h2>
          <p>You may request deletion of your account and associated stored data by contacting:</p>
          <p>
            <strong>Email:</strong> <a href="mailto:siddhantpetkar@gmail.com" className="text-primary hover:underline">siddhantpetkar@gmail.com</a>
          </p>
          <p>
            Upon request, we will delete stored app data (folders, saved video references) associated with your account, subject to legal or operational requirements.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">8) Children's privacy</h2>
          <p>
            Recall is not intended for children under 13 (or the age required in your country). We do not knowingly collect data from children.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">9) Changes to this policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will update the "Last updated" date at the top.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">10) Contact</h2>
          <p>If you have questions about this policy, contact us at:</p>
          <p>
            <strong>Email:</strong> <a href="mailto:siddhantpetkar@gmail.com" className="text-primary hover:underline">siddhantpetkar@gmail.com</a>
          </p>
        </section>
      </div>
    </div>
  )
}

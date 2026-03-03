import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Planny',
  description: 'How Planny collects, uses, and protects your personal data.',
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <main style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fff0f8 0%, #fce7f3 50%, #ede9fe 100%)', display: 'flex', justifyContent: 'center', padding: '60px 20px' }}>
      <div style={{ maxWidth: '720px', width: '100%', background: 'white', borderRadius: '32px', padding: '60px 48px', boxShadow: '0 12px 40px rgba(45,27,46,0.06)', fontFamily: "'Inter', -apple-system, sans-serif", color: '#2d1b2e', lineHeight: '1.7' }}>

        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <img src="/planny-logo.png" alt="Planny" style={{ width: '64px', height: '64px', borderRadius: '16px', marginBottom: '20px' }} />
          <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: '0 0 8px', letterSpacing: '-0.02em' }}>Privacy Policy</h1>
          <p style={{ color: '#64748b', margin: 0 }}>Last updated: March 2025</p>
        </div>

        <section style={{ marginBottom: '36px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#f472b6', marginBottom: '12px' }}>1. Who We Are</h2>
          <p style={{ margin: 0, color: '#475569' }}>Planny ("we", "our", "us") is an AI-powered daily scheduling service. We help you plan your day through email reminders and task management. Our website is <strong>planny-mu.vercel.app</strong>.</p>
        </section>

        <section style={{ marginBottom: '36px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#f472b6', marginBottom: '12px' }}>2. What We Collect</h2>
          <ul style={{ color: '#475569', paddingLeft: '20px', margin: 0 }}>
            <li><strong>Email address</strong> — to send you daily digests and reminders.</li>
            <li><strong>Name</strong> (optional) — to personalise your emails.</li>
            <li><strong>Tasks you add</strong> — stored securely to power your digest.</li>
            <li><strong>Timezone</strong> — to send emails at the right local time.</li>
            <li><strong>Usage data</strong> — basic analytics via Vercel to improve performance.</li>
          </ul>
        </section>

        <section style={{ marginBottom: '36px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#f472b6', marginBottom: '12px' }}>3. How We Use Your Data</h2>
          <ul style={{ color: '#475569', paddingLeft: '20px', margin: 0 }}>
            <li>Send your 7 AM morning digest and 10 PM evening check-in.</li>
            <li>Show your task list on the Plan page.</li>
            <li>Process payments securely via Razorpay.</li>
            <li>Improve Planny's features and reliability.</li>
          </ul>
          <p style={{ marginTop: '12px', color: '#475569' }}>We <strong>never sell your data</strong> to third parties.</p>
        </section>

        <section style={{ marginBottom: '36px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#f472b6', marginBottom: '12px' }}>4. Third-Party Services</h2>
          <ul style={{ color: '#475569', paddingLeft: '20px', margin: 0 }}>
            <li><strong>Google OAuth</strong> — for sign-in. Governed by Google's Privacy Policy.</li>
            <li><strong>Prisma/PostgreSQL</strong> — our database provider.</li>
            <li><strong>Vercel</strong> — hosting and serverless functions.</li>
            <li><strong>Razorpay</strong> — payment processing. We never store your card details.</li>
            <li><strong>Groq AI</strong> — generates motivational quotes in your morning digest.</li>
          </ul>
        </section>

        <section style={{ marginBottom: '36px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#f472b6', marginBottom: '12px' }}>5. Data Retention</h2>
          <p style={{ margin: 0, color: '#475569' }}>We keep your data for as long as your account is active. You can request deletion at any time by emailing us. Tasks older than 90 days may be periodically archived.</p>
        </section>

        <section style={{ marginBottom: '36px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#f472b6', marginBottom: '12px' }}>6. Your Rights</h2>
          <p style={{ color: '#475569', margin: '0 0 8px' }}>You have the right to:</p>
          <ul style={{ color: '#475569', paddingLeft: '20px', margin: 0 }}>
            <li>Access the data we hold about you.</li>
            <li>Request correction or deletion of your data.</li>
            <li>Unsubscribe from emails at any time by emailing us.</li>
          </ul>
        </section>

        <section style={{ marginBottom: '48px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#f472b6', marginBottom: '12px' }}>7. Contact</h2>
          <p style={{ margin: 0, color: '#475569' }}>Questions? Email us at <a href="mailto:cartoonworldd24x7@gmail.com" style={{ color: '#f472b6', fontWeight: '600' }}>cartoonworldd24x7@gmail.com</a></p>
        </section>

        <div style={{ textAlign: 'center' }}>
          <a href="/" style={{ color: '#f472b6', fontWeight: '700', textDecoration: 'none', fontSize: '1rem' }}>&larr; Back to Planny</a>
        </div>
      </div>
    </main>
  );
}

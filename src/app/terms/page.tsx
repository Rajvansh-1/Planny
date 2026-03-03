import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | Planny',
  description: 'Terms and conditions for using the Planny AI daily scheduler.',
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <main style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fff0f8 0%, #fce7f3 50%, #ede9fe 100%)', display: 'flex', justifyContent: 'center', padding: '60px 20px' }}>
      <div style={{ maxWidth: '720px', width: '100%', background: 'white', borderRadius: '32px', padding: '60px 48px', boxShadow: '0 12px 40px rgba(45,27,46,0.06)', fontFamily: "'Inter', -apple-system, sans-serif", color: '#2d1b2e', lineHeight: '1.7' }}>

        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <img src="/planny-logo.png" alt="Planny" style={{ width: '64px', height: '64px', borderRadius: '16px', marginBottom: '20px' }} />
          <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: '0 0 8px', letterSpacing: '-0.02em' }}>Terms of Service</h1>
          <p style={{ color: '#64748b', margin: 0 }}>Last updated: March 2025</p>
        </div>

        <section style={{ marginBottom: '36px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#f472b6', marginBottom: '12px' }}>1. Acceptance</h2>
          <p style={{ margin: 0, color: '#475569' }}>By using Planny, you agree to these Terms. If you don't agree, please don't use the service.</p>
        </section>

        <section style={{ marginBottom: '36px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#f472b6', marginBottom: '12px' }}>2. What Planny Is</h2>
          <p style={{ margin: 0, color: '#475569' }}>Planny is a productivity tool that sends AI-powered daily email digests and task reminders. We offer a <strong>20-day free trial</strong>, after which a subscription fee applies.</p>
        </section>

        <section style={{ marginBottom: '36px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#f472b6', marginBottom: '12px' }}>3. Account & Access</h2>
          <ul style={{ color: '#475569', paddingLeft: '20px', margin: 0 }}>
            <li>You must provide a valid email address to use Planny.</li>
            <li>You are responsible for keeping your account secure.</li>
            <li>You may not use Planny for illegal or harmful purposes.</li>
          </ul>
        </section>

        <section style={{ marginBottom: '36px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#f472b6', marginBottom: '12px' }}>4. Subscriptions & Payments</h2>
          <ul style={{ color: '#475569', paddingLeft: '20px', margin: 0 }}>
            <li>Planny offers a 20-day free trial with no credit card required.</li>
            <li>After the trial, a subscription fee applies (₹19/month or as displayed).</li>
            <li>Payments are handled by Razorpay. We do not store card details.</li>
            <li>Subscriptions are non-refundable after access has been granted.</li>
          </ul>
        </section>

        <section style={{ marginBottom: '36px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#f472b6', marginBottom: '12px' }}>5. Email Communications</h2>
          <p style={{ margin: 0, color: '#475569' }}>By signing up, you consent to receive daily digest emails and check-in prompts. You may request to stop these at any time by emailing us.</p>
        </section>

        <section style={{ marginBottom: '36px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#f472b6', marginBottom: '12px' }}>6. Limitations</h2>
          <p style={{ margin: 0, color: '#475569' }}>Planny is provided "as is". We are not liable for missed emails, AI-generated content, or data loss. We make best efforts to maintain 99% uptime.</p>
        </section>

        <section style={{ marginBottom: '36px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#f472b6', marginBottom: '12px' }}>7. Changes</h2>
          <p style={{ margin: 0, color: '#475569' }}>We may update these Terms. Continued use after changes constitutes acceptance.</p>
        </section>

        <section style={{ marginBottom: '48px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#f472b6', marginBottom: '12px' }}>8. Contact</h2>
          <p style={{ margin: 0, color: '#475569' }}>Questions? Email <a href="mailto:cartoonworldd24x7@gmail.com" style={{ color: '#f472b6', fontWeight: '600' }}>cartoonworldd24x7@gmail.com</a></p>
        </section>

        <div style={{ textAlign: 'center' }}>
          <a href="/" style={{ color: '#f472b6', fontWeight: '700', textDecoration: 'none', fontSize: '1rem' }}>&larr; Back to Planny</a>
        </div>
      </div>
    </main>
  );
}

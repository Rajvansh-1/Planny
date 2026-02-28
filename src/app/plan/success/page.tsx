import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function SuccessPage() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div className="glass-panel fade-up" style={{ maxWidth: '500px', width: '100%', textAlign: 'center' }}>
        <CheckCircle2 size={64} style={{ color: '#fbcfe8', margin: '0 auto 20px' }} />
        <h1 style={{ fontSize: '2rem', color: '#1f2937', marginBottom: '10px' }}>Day Planned! 🎉</h1>
        <p style={{ color: '#6b7280', fontSize: '1.1rem', marginBottom: '30px' }}>
          Planny safely stored your goals. Rest well, and expect a magical email at 7 AM to kickstart your day. 🐾✨
        </p>
        <Link href="/" className="btn">Back Home 🌸</Link>
      </div>
    </main>
  );
}

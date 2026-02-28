"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sparkles, ArrowRight } from 'lucide-react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

function PaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get('email');

  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');

  // Load Razorpay SDK
  useEffect(() => {
    if (!email) {
      router.push('/');
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }, [email, router]);

  const handlePayment = async () => {
    try {
      setLoading(true);
      setError('');

      // 1. Create Order
      const res = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (data.admin || data.isPaid) {
        // User is already paid or an admin, redirect to plan
        router.push(`/plan?email=${encodeURIComponent(email!)}`);
        return;
      }

      if (!data.success || !data.order) {
        throw new Error(data.error || 'Failed to initialize payment');
      }

      // 2. Open Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Use public key from env
        amount: data.order.amount,
        currency: data.order.currency,
        name: "Planny Pro",
        description: "Monthly Subscription",
        image: "/planny-logo.png",
        order_id: data.order.id,
        handler: async function (response: any) {
          // 3. Verify Payment
          try {
            setVerifying(true);
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                email
              }),
            });
            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              // Success! Redirect to plan
              router.push(`/plan?email=${encodeURIComponent(email!)}`);
            } else {
              setError('Payment verification failed. Please contact support.');
            }
          } catch (err) {
            setError('Error verifying payment.');
          } finally {
            setVerifying(false);
          }
        },
        prefill: { email: email },
        theme: { color: "#f9a8d4" },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        setError(response.error.description || 'Payment failed');
      });
      rzp.open();

    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (!email) return null;

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div className="glass-panel fade-up" style={{ maxWidth: '450px', width: '100%', textAlign: 'center' }}>

        <img src="/planny-logo.png" alt="Planny" style={{ width: '80px', height: '80px', marginBottom: '16px', filter: 'drop-shadow(0 4px 12px rgba(249,168,212,0.4))' }} />

        <h1 style={{ fontSize: '2rem', color: '#1f2937', marginBottom: '8px' }}>Planny Pro 🐾</h1>
        <p style={{ color: '#6b7280', marginBottom: '24px' }}>
          Your AI daily planner is ready. Subscribe to activate your account.
        </p>

        <div style={{ background: 'rgba(255,255,255,0.8)', padding: '24px', borderRadius: '16px', border: '2px solid #fbcfe8', marginBottom: '24px', textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', marginBottom: '16px', justifyContent: 'center' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1f2937', lineHeight: '1' }}>₹19</span>
            <span style={{ color: '#6b7280', fontSize: '1rem', paddingBottom: '4px' }}>/ month</span>
          </div>

          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#374151' }}>
              <span style={{ color: '#34d399', fontSize: '1.2rem' }}>✓</span> 10 PM daily check-in email
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#374151' }}>
              <span style={{ color: '#34d399', fontSize: '1.2rem' }}>✓</span> 7 AM AI morning digest
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#374151' }}>
              <span style={{ color: '#34d399', fontSize: '1.2rem' }}>✓</span> Interactive daily planner
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#374151' }}>
              <span style={{ color: '#34d399', fontSize: '1.2rem' }}>✓</span> Unlimited task tracking
            </li>
          </ul>
        </div>

        {error && <p style={{ color: '#ef4444', marginBottom: '16px', fontSize: '14px' }}>{error}</p>}

        <button
          onClick={handlePayment}
          disabled={loading || verifying}
          className="btn"
          style={{ width: '100%', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '16px', borderRadius: '14px' }}
        >
          {verifying ? 'Activating account... ✨' : loading ? 'Loading...' : (
            <>Get Planny Pro <ArrowRight size={18} /></>
          )}
        </button>

        <p style={{ color: '#9ca3af', fontSize: '12px', marginTop: '16px' }}>
          Secure payment powered by Razorpay. Cancel anytime.
        </p>

      </div>
    </main>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>}>
      <PaymentContent />
    </Suspense>
  );
}

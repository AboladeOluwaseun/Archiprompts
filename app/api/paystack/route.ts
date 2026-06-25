import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getSupabaseServer } from '@/lib/supabase';

/**
 * Paystack Webhook Handler
 *
 * Paystack sends a POST to this endpoint after every payment event.
 * We verify the HMAC-SHA512 signature, then upsert the user's profile in Supabase.
 *
 * Setup:
 *   1. In your Paystack dashboard → Settings → API Keys → Webhooks
 *   2. Set webhook URL to: https://your-domain.com/api/paystack
 *   3. Set PAYSTACK_SECRET_KEY in .env.local
 */

export async function POST(req: NextRequest) {
  const secret = process.env.PAYSTACK_SECRET_KEY;

  if (!secret) {
    console.warn('[Paystack Webhook] PAYSTACK_SECRET_KEY not set — skipping.');
    return NextResponse.json(
      { error: 'Webhook not configured' },
      { status: 503 }
    );
  }

  // ── Verify Signature ────────────────────────────────────────
  const body = await req.text();
  const signature = req.headers.get('x-paystack-signature') || '';

  const hash = crypto
    .createHmac('sha512', secret)
    .update(body)
    .digest('hex');

  if (hash !== signature) {
    console.warn('[Paystack Webhook] Invalid signature.');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  // ── Parse Event ─────────────────────────────────────────────
  let event: Record<string, unknown>;
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (event.event !== 'charge.success') {
    return NextResponse.json({ received: true });
  }

  const data = event.data as Record<string, unknown>;
  const customer = data.customer as Record<string, unknown>;
  const email = customer?.email as string;
  const customerCode = customer?.customer_code as string;
  const reference = data.reference as string;
  const amount = data.amount as number; // in kobo
  const currency = (data.currency as string) || 'NGN';
  const plan = amount >= 2500000 ? 'lifetime' : 'monthly'; // ₦25,000 = lifetime

  if (!email || !reference) {
    return NextResponse.json({ error: 'Missing data' }, { status: 400 });
  }

  // ── Persist to Supabase ─────────────────────────────────────
  const supabase = getSupabaseServer();

  if (!supabase) {
    console.warn('[Paystack Webhook] Supabase not configured — demo mode.');
    return NextResponse.json({ received: true, demo: true });
  }

  // Calculate plan expiry for monthly
  const planExpiresAt = plan === 'monthly'
    ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    : null;

  // Upsert profile (match by email — user may or may not have auth account yet)
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert(
      {
        email,
        plan,
        plan_expires_at: planExpiresAt,
        paystack_customer_code: customerCode || null,
      },
      { onConflict: 'email' }
    );

  if (profileError) {
    console.error('[Paystack Webhook] Profile upsert failed:', profileError);
    // The user may not have an auth account yet — profile.id must match auth.users.id
    // In this case, we still log the payment with user_id = null
  }

  // Get profile ID for payment log
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single();

  // Log payment
  await supabase.from('payments').insert({
    user_id: profile?.id || null,
    paystack_ref: reference,
    amount,
    currency,
    plan,
    status: 'success',
    metadata: data,
  });

  console.log(`[Paystack Webhook] ✅ ${email} → ${plan} (${reference})`);
  return NextResponse.json({ received: true });
}

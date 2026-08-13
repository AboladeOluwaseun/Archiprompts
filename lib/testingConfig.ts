/**
 * Temporary tester-mode switch. While true, any signed-in user is
 * treated as Pro (unlimited prompts, Render Preview, Refine) — no
 * payment required. Asking testers to pay (or hand over card details)
 * for a beta is a bad ask; this removes that friction.
 *
 * Flip to false (or delete this file and its two call sites in
 * lib/renderAccess.ts and app/builder/page.tsx) to restore the real
 * paywall before going live. Payment/plan logic itself is untouched —
 * this only bypasses the plan check, so turning it back off requires
 * no other changes.
 */
export const TESTERS_GET_PRO_FREE = true;

# Frontend Integration using Stripe Checkout

This document explains how to integrate your Next.js frontend application with this Stripe server.

## Prerequisites
Ensure your backend server is running and configured with your Stripe API keys.
1. Copy `.env.example` to `.env`
2. Update `.env` with your actual `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`
3. Set your `FRONTEND_URL` in `.env` (e.g., `http://localhost:3001` if your Next.js app runs on port 3001, or `http://localhost:3000` if Next.js is on 3000 and the backend is on a different port. Note: By default, both Next.js and this backend use port 3000, so you should run this backend on a different port like 3001 by changing `app.listen(3001)` in `server.js` if necessary).
4. Run `npm start`

## 1. Checkout Process (Next.js Client Component)

To initiate a Stripe Checkout session, your Next.js frontend needs to make a POST request to the `/create-checkout-session` endpoint on this server with the items to purchase.

Create a client component for your checkout button (e.g., in `components/CheckoutButton.tsx`):

```tsx
"use client";

import React, { useState } from "react";

export default function CheckoutButton() {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      // Send the items to purchase to your backend
      // Replace localhost:3000 with your actual backend URL if different
      const res = await fetch("http://localhost:3000/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [
            { name: "Premium HoodX Subscription", price: 20, quantity: 1 }
          ]
        })
      });

      const data = await res.json();
      
      if (data.url) {
        // Redirect to Stripe checkout page
        window.location.href = data.url;
      } else {
        console.error("No checkout URL returned from the server.");
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleCheckout} 
      disabled={loading}
      style={{
        padding: "10px 20px",
        backgroundColor: loading ? "#ccc" : "#0070f3",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: loading ? "not-allowed" : "pointer"
      }}
    >
      {loading ? "Processing..." : "Pay Now"}
    </button>
  );
}
```

Then, import and use this component on any of your Next.js pages.

## 2. Success and Cancel Pages

In `server.js`, the `success_url` and `cancel_url` are configured to route users back to your frontend based on the `FRONTEND_URL` environment variable.

In your Next.js application, you should create these pages using the App Router:
- **Success Page:** Create `app/success/page.tsx`
- **Cancel Page:** Create `app/cancel/page.tsx`

*(Note: The backend has been updated to redirect to `/success` and `/cancel` instead of `/success.html` and `/cancel.html` to match standard Next.js clean routing.)*

## 3. Local Webhook Testing (Important)
To test webhooks locally, you must use the [Stripe CLI](https://stripe.com/docs/stripe-cli).

1. Login to the Stripe CLI:
   ```bash
   stripe login
   ```
2. Forward events to your local backend server:
   ```bash
   stripe listen --forward-to localhost:3000/webhook
   ```
3. Look at the output of the `stripe listen` command. It will print a webhook secret that looks like `whsec_...`. Copy this value and add it to your backend's `.env` file as `STRIPE_WEBHOOK_SECRET`.
4. Trigger a test event in another terminal window:
   ```bash
   stripe trigger checkout.session.completed
   ```
5. Check your backend Node.js console. You should see `Payment successful for session ID: ...` printed!

/* eslint-disable  @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { serverConfig } from '../../../settings';

type Handler = (event: any) => Promise<NextResponse>;

/**
 * Higher-order function to wrap Stripe webhook handler with authentication.
 * Validates the Stripe signature and constructs the event.
 */
export const withStripeAuth =
  (handler: Handler) =>
  async (request: NextRequest): Promise<NextResponse> => {
    const signature = request.headers.get('stripe-signature');

    if (!signature || signature === null) {
      console.error('Missing Stripe signature header');
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }

    if (!serverConfig.Stripe.webhookSecret) {
      console.log('SECRET', serverConfig.Stripe.webhookSecret);
      console.error('Stripe webhook secret is not configured');
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }

    let event;
    try {
      event = Stripe.webhooks.constructEvent(
        await request.text(),
        signature,
        serverConfig.Stripe.webhookSecret
      );
    } catch (error) {
      console.error('Error constructing Stripe webhook event:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }

    if (event) {
      return await handler(event);
    }

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  };

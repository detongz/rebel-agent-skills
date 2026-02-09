import { NextRequest, NextResponse } from 'next/server';

// Service pricing configuration (in USDC, smallest unit is 6 decimals)
const SERVICE_PRICES: Record<string, number> = {
  'skill-access': 1000,      // $0.001 USDC = 1000 units (6 decimals)
  'bounty-post': 10000,      // $0.01 USDC = 10000 units
  'audit-submit': 5000,      // $0.005 USDC = 5000 units
  'priority-listing': 50000, // $0.05 USDC = 50000 units
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ service: string }> }
) {
  try {
    const { service } = await params;
    const price = SERVICE_PRICES[service];

    if (!price) {
      return NextResponse.json(
        { error: 'Unknown service' },
        { status: 400 }
      );
    }

    // Get the x402 payment headers
    const paymentHeader = request.headers.get('x402-payment');
    const paymentSignature = request.headers.get('x402-signature');

    if (!paymentHeader || !paymentSignature) {
      return NextResponse.json(
        {
          error: 'Payment required',
          price: price,
          currency: 'USDC',
          network: 'eip155:10143',
          facilitator: 'https://x402-facilitator.molandak.org'
        },
        {
          status: 402,
          headers: {
            'x402-price': price.toString(),
            'x402-currency': 'USDC',
            'x402-network': 'eip155:10143',
            'x402-facilitator': 'https://x402-facilitator.molandak.org',
          }
        }
      );
    }

    // In a real implementation, you would verify the payment signature here
    // For demo purposes, we'll accept any payment header
    console.log('Payment received:', {
      service,
      paymentHeader,
      paymentSignature,
    });

    // Return success response
    return NextResponse.json({
      success: true,
      service,
      message: `Successfully unlocked ${service}`,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Payment processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

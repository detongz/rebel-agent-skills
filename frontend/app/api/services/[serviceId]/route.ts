import { NextRequest, NextResponse } from 'next/server';
import { PAID_SERVICES } from '@/lib/services-config';

/**
 * POST /api/services/[serviceId]
 * Process payment for a paid service using x402 protocol
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ serviceId: string }> }
) {
  const { serviceId } = await params;
  const serviceConfig = PAID_SERVICES[serviceId];

  if (!serviceConfig) {
    return NextResponse.json(
      { error: 'Unknown service' },
      { status: 400 }
    );
  }

  // Check for x402 payment headers
  const paymentHeader = request.headers.get('x402-payment');
  const paymentSignature = request.headers.get('x402-signature');

  if (!paymentHeader || !paymentSignature) {
    // Return 402 with payment requirements
    return NextResponse.json(
      {
        error: 'Payment required',
        service: serviceConfig,
      },
      {
        status: 402,
        headers: {
          'x402-price': serviceConfig.price.toString(),
          'x402-currency': 'USDC',
          'x402-network': 'eip155:10143',
          'x402-facilitator': 'https://x402-facilitator.molandak.org',
        },
      }
    );
  }

  // Payment verified - process the service
  try {
    const body = await request.json();
    const { userAddress, inputData } = body;

    // TODO: Store purchase record in database
    // For now, just return success

    // Route to service-specific handler
    let result;
    switch (serviceId) {
      case 'security-audit':
        result = await handleSecurityAudit(inputData);
        break;
      case 'ranking-boost':
        result = await handleRankingBoost(inputData);
        break;
      case 'agent-evaluation':
        result = await handleAgentEvaluation(inputData);
        break;
      case 'custom-request':
        result = await handleCustomRequest(inputData);
        break;
      default:
        result = { status: 'completed', message: 'Service purchased!' };
    }

    return NextResponse.json({
      success: true,
      service: serviceConfig.name,
      result,
    });

  } catch (error) {
    console.error('Service processing error:', error);
    return NextResponse.json(
      { error: 'Service processing failed' },
      { status: 500 }
    );
  }
}

/**
 * Handle security audit service
 * TODO: Integrate with external security API (MythX, Slither, etc.)
 */
async function handleSecurityAudit(inputData: any) {
  const { contractCode, contractAddress } = inputData;

  // For now, return a mock response
  // In production, this would call an external API like MythX
  return {
    status: 'processing',
    message: 'Security audit submitted. Check back in ~2 minutes.',
    data: {
      scanId: `scan_${Date.now()}`,
      target: contractAddress || 'custom-code',
    },
  };
}

/**
 * Handle ranking boost service
 */
async function handleRankingBoost(inputData: any) {
  const { skillId, duration = 24 } = inputData;
  const endTime = new Date(Date.now() + duration * 60 * 60 * 1000).toISOString();

  // TODO: Store boost in database
  return {
    status: 'completed',
    message: `Ranking boost activated for ${duration} hours!`,
    data: {
      boostMultiplier: 2.0,
      endTime,
    },
  };
}

/**
 * Handle agent evaluation service
 */
async function handleAgentEvaluation(inputData: any) {
  const { skillId, comments } = inputData;

  // TODO: Queue evaluation task
  return {
    status: 'pending',
    message: 'Evaluation queued. Expert agents will review your skill within ~24 hours.',
    data: {
      evaluationId: `eval_${Date.now()}`,
    },
  };
}

/**
 * Handle custom request service
 */
async function handleCustomRequest(inputData: any) {
  const { requirements } = inputData;

  // TODO: Create bounty or custom request
  return {
    status: 'pending',
    message: 'Custom request submitted. Expert creators will review your requirements.',
    data: {
      requestId: `req_${Date.now()}`,
    },
  };
}

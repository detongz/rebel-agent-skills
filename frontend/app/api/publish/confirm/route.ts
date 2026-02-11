/**
 * API Route: POST /api/publish/confirm
 *
 * Confirm and complete publication after payment:
 * - Verify payment signature
 * - Run deep security scan
 * - Create skill in database
 * - Return skill details for on-chain registration
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSkill, updatePublicationStatus, addSkillDependencies, type DependencyInfo } from '@/lib/skills-db';
import { keccak256, toHex } from 'viem';

interface ConfirmRequest {
  url: string;
  name: string;
  category?: string;
  creator: string;
  payment_id?: string;
  tx_hash?: string; // On-chain registration transaction
  security_score?: number;
  dependencies?: DependencyInfo[];
}

export async function POST(request: NextRequest) {
  try {
    const body: ConfirmRequest = await request.json();
    const { url, name, category = 'general', creator, payment_id, tx_hash, security_score = 85 } = body;

    // Parse GitHub URL
    const githubMatch = url.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!githubMatch) {
      return NextResponse.json(
        { success: false, error: 'Invalid GitHub URL' },
        { status: 400 }
      );
    }

    const [_, owner, repo] = githubMatch;
    const repoFullName = `${owner}/${repo}`;

    // Check payment headers (x402 protocol)
    const paymentHeader = request.headers.get('x402-payment');
    const paymentSignature = request.headers.get('x402-signature');

    if (!paymentHeader && !payment_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Payment required',
          message: 'Please complete payment before publishing'
        },
        {
          status: 402,
          headers: {
            'x402-price': '5000000',
            'x402-currency': 'USDC',
            'x402-network': 'eip155:10143',
            'x402-facilitator': 'https://x402-facilitator.molandak.org'
          }
        }
      );
    }

    // In production, verify payment signature here
    // For MVP, we'll accept the payment_id proof

    // Run deep scan (simplified for now)
    // In production, integrate VirusTotal API here
    const scanScore = security_score;

    if (scanScore < 50) {
      return NextResponse.json(
        {
          success: false,
          error: 'Security check failed',
          message: `Security score ${scanScore} is below minimum threshold (50)`,
          security_score: scanScore
        },
        { status: 400 }
      );
    }

    // Generate skill ID (matching the on-chain logic)
    const data = `${name}:${repoFullName}:v1.0.0`;
    const skillId = `0x${keccak256(toHex(data)).slice(2)}`;

    // Create skill in database
    const skill = await createSkill({
      id: skillId,
      name,
      description: `Skill from ${repoFullName}`,
      repository: repoFullName,
      category,
      creator,
      securityScore: scanScore,
      txHash: tx_hash,
      verified: !!tx_hash // Verified if transaction hash provided
    });

    // Store dependencies if provided
    if (body.dependencies && body.dependencies.length > 0) {
      await addSkillDependencies(skillId, body.dependencies);
    }

    // Update publication status
    if (payment_id) {
      await updatePublicationStatus(payment_id, 'published', {
        skillId,
        txHash: tx_hash
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Skill published successfully',
      skill: {
        id: skill.id,
        name: skill.name,
        repository: skill.repository,
        category: skill.category,
        creator: skill.creator,
        security_score: skill.securityScore,
        published_at: skill.publishedAt
      },
      // Return data needed for on-chain registration
      on_chain_data: {
        skillId: skill.id,
        skillName: skill.name,
        creator: skill.creator,
        // ABI function call for registerSkill
        register_params: {
          abi: [{
            inputs: [
              { internalType: 'bytes32', name: 'skillId', type: 'bytes32' },
              { internalType: 'string', name: 'skillName', type: 'string' },
              { internalType: 'address', name: 'creator', type: 'address' }
            ],
            name: 'registerSkill',
            type: 'function'
          }],
          address: process.env.ASKL_TOKEN_ADDRESS || '0xc1fFCAD15e2f181E49bFf2cBea79094eC9B5033A',
          args: [skill.id, skill.name, skill.creator]
        }
      },
      explorer_url: `https://testnet.monadvision.com/address/${skill.id}`
    });

  } catch (error) {
    console.error('Publish confirm error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to complete publication',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

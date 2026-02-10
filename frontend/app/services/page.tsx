'use client';

import { useState } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { wrapFetchWithPayment } from '@x402/fetch';
import { ExactEvmScheme } from '@x402/evm';
import { x402Client } from '@x402/core/client';
import { PAID_SERVICES, SERVICE_CATEGORIES, X402_CONFIG } from '@/lib/services-config';
import { getSkills } from '@/lib/contract-service';

export default function ServicesPage() {
  const { isConnected, address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [purchasedServices, setPurchasedServices] = useState<string[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [showInputModal, setShowInputModal] = useState(false);
  const [inputValue, setInputValue] = useState('');

  // Load skills for ranking boost selection
  useState(() => {
    getSkills({ limit: 50 }).then(setSkills);
  });

  const handlePurchase = async (serviceId: string) => {
    if (!isConnected || !address) {
      setStatus('error');
      setMessage('Please connect your wallet first');
      return;
    }

    const service = PAID_SERVICES[serviceId];
    if (!service) {
      setStatus('error');
      setMessage('Unknown service');
      return;
    }

    // Check if input is required
    if (service.requiresInput) {
      setSelectedService(serviceId);
      setShowInputModal(true);
      setInputValue('');
      return;
    }

    // Process payment directly for services without input
    await processPayment(serviceId, service, {});
  };

  const processPayment = async (serviceId: string, service: any, inputData: any) => {
    if (!walletClient) return;

    setSelectedService(serviceId);
    setStatus('loading');
    setMessage(`Processing payment for ${service.name}...`);

    try {
      // Create EVM signer compatible with x402
      const evmSigner = {
        address: address as `0x${string}`,
        signTypedData: async (message: {
          domain: Record<string, unknown>;
          types: Record<string, unknown>;
          primaryType: string;
          message: Record<string, unknown>;
        }) => {
          return walletClient.signTypedData({
            domain: message.domain as any,
            types: message.types as any,
            primaryType: message.primaryType,
            message: message.message,
          });
        },
      };

      const exactScheme = new ExactEvmScheme(evmSigner);
      const client = new x402Client().register(X402_CONFIG.chainId, exactScheme);

      // Wrap fetch with x402 payment capability
      const paymentFetch = wrapFetchWithPayment(fetch, client);

      // Make payment request
      const response = await paymentFetch('/api/services/' + serviceId, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAddress: address,
          inputData: { ...inputData, serviceId },
        }),
      });

      if (!response.ok) {
        throw new Error(`Payment failed: ${response.status}`);
      }

      const data = await response.json();

      setStatus('success');
      setMessage(`✅ Successfully purchased ${service.name}! ${data.result?.message || ''}`);
      setPurchasedServices([...purchasedServices, serviceId]);
      setShowInputModal(false);
    } catch (error) {
      console.error('Payment error:', error);
      setStatus('error');
      setMessage(`❌ Payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleInputSubmit = () => {
    const service = PAID_SERVICES[selectedService!];
    if (!service) return;

    let inputData: any = {};
    switch (selectedService) {
      case 'security-audit':
        inputData = { contractCode: inputValue, contractAddress: '' };
        break;
      case 'ranking-boost':
        inputData = { skillId: parseInt(inputValue), duration: 24 };
        break;
      case 'agent-evaluation':
        inputData = { skillId: parseInt(inputValue), comments: '' };
        break;
      case 'custom-request':
        inputData = { requirements: inputValue };
        break;
    }

    processPayment(selectedService!, service, inputData);
  };

  return (
    <div className="app-shell">
      <div className="app-backdrop" aria-hidden="true" />

      <nav className="app-nav">
        <div className="nav-left">
          <div className="brand-mark">
            <span className="brand-orb" />
            <span className="brand-text">MySkills_Protocol</span>
          </div>
        </div>
        <div className="nav-right">
          <div className="nav-links-container">
            <a href="/">Home</a>
            <a href="/skills-map">Skill Map</a>
            <a href="/services" className="text-[var(--neon-green)]">Services</a>
            <a href="/bounties">Bounties</a>
          </div>
        </div>
      </nav>

      <main className="app-main">
        {/* Hero Section */}
        <section className="hero">
          <div className="hero-copy">
            <span className="hero-kicker">MY-SKILLS-SERVICES_v1.0</span>
            <h1 className="hero-title">
              <span>PREMIUM</span> <span>SERVICES</span>
            </h1>
            <p className="hero-subtitle">
              Unlock powerful features for your agent skills. Secure payments via x402 protocol on Monad Testnet.
            </p>
          </div>
        </section>

        {/* Free vs Paid Comparison */}
        <section className="skills-section">
          <div className="section-header">
            <h2 className="section-title">Free vs Premium</h2>
          </div>
          <div className="skills-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
            {/* Free Tier */}
            <div className="skill-card">
              <div className="skill-card-header">
                <span className="skill-platform-pill">FREE</span>
              </div>
              <h3 className="skill-title">Always Free</h3>
              <ul className="skill-description" style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ marginBottom: '8px' }}>✓ Skill search and discovery</li>
                <li style={{ marginBottom: '8px' }}>✓ Download any skill</li>
                <li style={{ marginBottom: '8px' }}>✓ Basic skill analytics</li>
                <li style={{ marginBottom: '8px' }}>✓ Community support</li>
              </ul>
            </div>

            {/* Paid Tier */}
            <div className="skill-card" style={{ borderColor: 'rgba(0, 255, 136, 0.5)', background: 'rgba(0, 255, 136, 0.05)' }}>
              <div className="skill-card-header">
                <span className="skill-platform-pill" style={{ background: 'var(--neon-green)', color: 'var(--bg-void)' }}>PREMIUM</span>
              </div>
              <h3 className="skill-title">Premium Services</h3>
              <ul className="skill-description" style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ marginBottom: '8px' }}>⚡ Security audit detection</li>
                <li style={{ marginBottom: '8px' }}>⚡ Ranking visibility boost</li>
                <li style={{ marginBottom: '8px' }}>⚡ Expert agent evaluation</li>
                <li style={{ marginBottom: '8px' }}>⚡ Custom skill requests</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Service Cards by Category */}
        {Object.entries(SERVICE_CATEGORIES).map(([catId, category]) => {
          const categoryServices = Object.values(PAID_SERVICES).filter(s => s.category === catId);
          return (
            <section key={catId} className="skills-section">
              <div className="section-header">
                <h2 className="section-title">{category.name}</h2>
                <p className="text-[var(--text-muted)]">{category.description}</p>
              </div>
              <div className="skills-grid">
                {categoryServices.map(service => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    isPurchased={purchasedServices.includes(service.id)}
                    onPurchase={() => handlePurchase(service.id)}
                    isLoading={status === 'loading' && selectedService === service.id}
                  />
                ))}
              </div>
            </section>
          );
        })}

        {/* Status Message */}
        {status !== 'idle' && (
          <section className="skills-section">
            <div className={`skill-card ${
              status === 'error' ? 'border-red-500' :
              status === 'success' ? 'border-[var(--neon-green)]' :
              ''
            }`}>
              <p className={status === 'error' ? 'text-red-400' : ''}>
                {message}
              </p>
            </div>
          </section>
        )}

        {/* Input Modal */}
        {showInputModal && selectedService && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="skill-card max-w-md w-full mx-4">
              <h3 className="skill-title mb-4">
                {PAID_SERVICES[selectedService].name}
              </h3>
              <p className="skill-description mb-4">
                {PAID_SERVICES[selectedService].description}
              </p>

              {selectedService === 'security-audit' && (
                <>
                  <label className="block text-sm text-[var(--text-muted)] mb-2">
                    Paste your smart contract code:
                  </label>
                  <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="w-full h-32 bg-[var(--metal-dark)] border border-white/10 rounded p-3 text-white text-sm font-mono"
                    placeholder="pragma solidity ^0.8.0;..."
                  />
                </>
              )}

              {selectedService === 'ranking-boost' && (
                <>
                  <label className="block text-sm text-[var(--text-muted)] mb-2">
                    Select your skill to boost:
                  </label>
                  <select
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="w-full bg-[var(--metal-dark)] border border-white/10 rounded p-3 text-white"
                  >
                    <option value="">Select a skill...</option>
                    {skills.map(skill => (
                      <option key={skill.id} value={skill.id}>{skill.name}</option>
                    ))}
                  </select>
                </>
              )}

              {selectedService === 'agent-evaluation' && (
                <>
                  <label className="block text-sm text-[var(--text-muted)] mb-2">
                    Select your skill to evaluate:
                  </label>
                  <select
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="w-full bg-[var(--metal-dark)] border border-white/10 rounded p-3 text-white"
                  >
                    <option value="">Select a skill...</option>
                    {skills.map(skill => (
                      <option key={skill.id} value={skill.id}>{skill.name}</option>
                    ))}
                  </select>
                </>
              )}

              {selectedService === 'custom-request' && (
                <>
                  <label className="block text-sm text-[var(--text-muted)] mb-2">
                    Describe your custom skill requirements:
                  </label>
                  <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="w-full h-32 bg-[var(--metal-dark)] border border-white/10 rounded p-3 text-white text-sm"
                    placeholder="I need a skill that can..."
                  />
                </>
              )}

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setShowInputModal(false)}
                  className="flex-1 py-2 border border-white/20 rounded text-[var(--text-muted)] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleInputSubmit}
                  disabled={!inputValue}
                  className="flex-1 py-2 bg-[var(--neon-green)] text-black font-bold rounded disabled:opacity-50"
                >
                  Pay {PAID_SERVICES[selectedService].priceDisplay}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function ServiceCard({
  service,
  isPurchased,
  onPurchase,
  isLoading,
}: {
  service: any;
  isPurchased: boolean;
  onPurchase: () => void;
  isLoading: boolean;
}) {
  return (
    <div className={`skill-card ${isPurchased ? 'border-[var(--neon-green)]' : ''}`}>
      <div className="skill-card-header">
        <span className="skill-platform-pill">{service.icon}</span>
        <span className="text-sm text-[var(--neon-green)]">{service.priceDisplay}</span>
      </div>

      <h3 className="skill-title">{service.name}</h3>
      <p className="skill-description">{service.description}</p>

      <ul className="text-sm space-y-1 mt-3 mb-4">
        {service.features.map((feature: string, i: number) => (
          <li key={i} className="flex items-start gap-2">
            <span className="text-[var(--neon-green)]">✓</span>
            <span className="text-[var(--text-muted)]">{feature}</span>
          </li>
        ))}
      </ul>

      <div className="text-xs text-[var(--text-muted)] mb-3">
        ⏱️ {service.processingTime}
      </div>

      {isPurchased ? (
        <button className="w-full py-2 bg-[var(--neon-green)] text-black font-bold rounded opacity-50">
          ✓ Purchased
        </button>
      ) : (
        <button
          onClick={onPurchase}
          disabled={isLoading}
          className="w-full py-2 bg-[var(--metal-dark)] border border-[var(--neon-green)] text-[var(--neon-green)] rounded hover:bg-[var(--neon-green)] hover:text-black transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Processing...' : `Buy ${service.priceDisplay}`}
        </button>
      )}
    </div>
  );
}

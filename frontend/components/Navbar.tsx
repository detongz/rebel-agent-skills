'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'HOME', active: pathname === '/' },
    { href: '/skill', label: 'SECURITY SCAN', active: pathname?.includes('/skill') },
    { href: '/leaderboard', label: 'LEADERBOARD', active: pathname?.includes('/leaderboard') },
    { href: '/bounties', label: 'BOUNTIES', active: pathname?.includes('/bounties') },
  ];

  return (
    <nav className="app-nav">
      <div className="nav-left">
        <Link href="/" className="brand-mark">
          <span className="brand-orb" />
          <span className="brand-text">MySkills_Protocol</span>
        </Link>
      </div>
      <div className="nav-right">
        <div className="nav-links-container">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-link ${link.active ? 'nav-link-active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
          <a
            href="https://discord.gg/TfzSeSRZ"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-link nav-link-discord"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="inline-block mr-1">
              <path d="M13.5452 2.8906C12.5363 2.40527 11.4497 2.04932 10.3159 1.84473C10.2876 1.83936 10.2593 1.87744C10.0747 2.17236 9.88623 2.90576 10.2446 2.89648 10.2688 2.90576C10.10693 11.2422 3.30054 11.4058 3.82715 11.103 11.4839C11.1416 11.5122 11.2314 11.5742 11.0376 12.2085 11.2207 10.7778 11.4839C11.14016 11.0718 10.5964 11.4137 12.0317 12.0015C11.5981 12.2085 10.7236 11.9427 12.3398 12.0176 14.5737 12.3213C14.5869 12.0317 14.0625 10.7988 11.4058 11.3247 11.103 11.4839C11.1416 11.5122 11.5742 11.0952 11.5981C10.6172 11.8774 10.1167 12.2085 10.6182 14.2222 5.55078 13.5752 2.91748 13.5586 2.8999 13.5452 2.8906ZM5.02783 9.96045C4.55127 8.56299 5.16211 8.46094 5.54443 8.02637 5.90039 8.46094 5.44443 8.99316C5.44443 8.46094 4.16211 8.99316C5.44443 8.46094 4.16211 9.52588 5.89355 9.53076 10.8086 9.54736 12.0317 13.6572 4.10498 14.0376C10.5581 14.0615 10.6182 14.0718 10.54 14.0376C14.5869 12.3398 14.5964 12.0015 15.2515 8.53223 13.5283 10.8086 9.96045 11.103 11.2422C10.8965 11.3247 10.9995 11.4058 11.103 11.4839C11.1416 11.5122 11.5742 11.0952 11.5981C10.749 11.2207 10.7778 11.2246 10.94287 9.52588 11.17383 13.6572 4.10498 14.0376C10.5581 14.0615 10.6182 14.0718 10.2446 2.8906C11.2928 11.6812 8.46094 11.6743 9.52588 10.7236 11.6812 8.46094 11.2928 9.96045 11.4058 11.103 11.4839C9.94287 8.46094 10.3252 8.02637 11.6812 8.99316C11.6812 8.46094 11.2928 9.96045ZM10.8086 9.96045C10.3329 9.94287 10.5581 14.0615 10.6182 14.0718 10.2446 2.8906C11.2928 11.6812 8.46094 11.6743 9.52588 10.7236 11.6812 8.46094 11.99316C11.6743 9.54736 12.4243 9.94287 9.52588 11.2422C10.8965 11.3247 11.4058 11.103 11.4839C11.1416 11.5122 11.5742 11.0952 11.5981C10.749 11.2207 10.7778 11.2246 11.5742 11.0952 11.5981C10.8086 9.96045 10.3252 8.02637 11.6812 8.46094 11.2928 9.96045Z" />
            </svg>
            DISCORD
          </a>
          <a
            href="https://github.com/detongz/rebel-agent-skills"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-link"
          >
            GITHUB
          </a>
        </div>
      </div>
    </nav>
  );
}

export default function SkillPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-semibold text-white">Skill Security Scan</h1>
          <a
            href="https://skill-security-scan.vercel.app/scan"
            target="_blank"
            rel="noreferrer"
            className="text-sm text-[var(--neon-blue)] hover:underline"
          >
            Open in new tab
          </a>
        </div>
        <iframe
          src="https://skill-security-scan.vercel.app/scan"
          title="Skill Security Scan"
          className="w-full h-[calc(100vh-120px)] rounded-lg border border-[var(--border-card)] bg-black"
          allow="clipboard-read; clipboard-write"
        />
      </div>
    </div>
  );
}

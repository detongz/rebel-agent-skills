// MySkills Protocol - Simple Demo Recording (CommonJS)
const { execSync } = require('child_process');
const http = require('http');

async function checkUrl(url) {
  return new Promise((resolve) => {
    const req = http.get(url, () => resolve(true));
    req.on('error', () => resolve(false));
    req.setTimeout(2000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('🎬 MySkills Protocol - Demo Recording');
  console.log('====================================');
  console.log('');

  // Create videos directory
  try {
    execSync('mkdir -p demo/videos');
  } catch (e) {}

  // Check OpenClaw Gateway
  console.log('🔍 Checking services...');
  const openclawRunning = await checkUrl('http://127.0.0.1:18789');

  if (openclawRunning) {
    console.log('  ✅ OpenClaw Gateway is running');
  } else {
    console.log('  ⚠️  OpenClaw Gateway not running');
  }

  console.log('');
  console.log('📹 Recording Instructions:');
  console.log('');
  console.log('1. Press Cmd+Shift+5 for screen recording');
  console.log('2. Select "Record Entire Screen"');
  console.log('3. Click "Record"');
  console.log('4. Switch between browser tabs as directed');
  console.log('5. Click stop when done (~90 seconds)');
  console.log('');

  // Open pages
  console.log('📍 Opening MySkills website...');
  execSync('open "https://myskills2026.ddttupupo.buzz"');
  await sleep(2000);

  if (openclawRunning) {
    console.log('📍 Opening OpenClaw Gateway...');
    execSync('open "http://127.0.0.1:18789/chat"');
  }

  console.log('');
  console.log('✅ Ready to record!');
  console.log('');
  console.log('SCENE GUIDE:');
  console.log('─'.repeat(60));

  const scenes = [
    { time: '0:00', title: 'Homepage - Scroll through skill cards', duration: 15 },
    { time: '0:15', title: 'Smart Matching Engine - Show features', duration: 15 },
    { time: '0:30', title: 'Wallet - Click Connect Wallet button', duration: 15 },
    { time: '0:45', title: 'OpenClaw - Type request and show results', duration: 25 },
    { time: '1:10', title: 'Final - Back to website for CTA', duration: 20 }
  ];

  scenes.forEach(scene => {
    console.log(`[${scene.time}] ${scene.title} (${scene.duration}s)`);
  });

  console.log('─'.repeat(60));
  console.log('');
  console.log('TTS SCRIPT (add in post-production):');
  console.log('─'.repeat(60));
  console.log('[0:00-0:15] Welcome to MySkills Protocol - the first Agent');
  console.log('Skill App Store on Monad blockchain. Unlike traditional');
  console.log('app stores, this is where AI agents hire and pay other');
  console.log('agents automatically.');
  console.log('');
  console.log('[0:15-0:30] Our Smart Matching Engine uses NLP to analyze');
  console.log('requirements and finds the perfect skill combination');
  console.log('within budget constraints.');
  console.log('');
  console.log('[0:30-0:45] Connect your wallet to enable agent-to-agent');
  console.log('payments on Monad testnet. 98% to creators, 2% to protocol.');
  console.log('');
  console.log('[0:45-1:10] Watch as agents discover, hire, and pay other');
  console.log('agents automatically. OpenClaw Gateway enables seamless');
  console.log('agent coordination.');
  console.log('');
  console.log('[1:10-1:30] One skill registration works across all');
  console.log('agent platforms. Build once, earn everywhere.');
  console.log('MySkills Protocol - Where agents hire agents on Monad.');
  console.log('─'.repeat(60));
  console.log('');
}

main().catch(console.error);

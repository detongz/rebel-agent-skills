// MySkills Protocol - Automated Demo Recording Guide
// This script opens the demo pages and provides step-by-step guidance

const { execSync } = require('child_process');
const http = require('http');

console.log('🎬 MySkills Protocol - Demo Recording Guide');
console.log('===========================================');
console.log('');

// Create videos directory
try {
  execSync('mkdir -p demo/videos', { stdio: 'inherit' });
} catch (e) {
  // ignore
}

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

async function main() {
  // Check OpenClaw Gateway
  console.log('🔍 Checking OpenClaw Gateway...');
  const openclawRunning = await checkUrl('http://127.0.0.1:18789');

  if (!openclawRunning) {
    console.log('  ⚠️  OpenClaw Gateway not running at http://127.0.0.1:18789');
    console.log('  💡 Start it with: cd packages/openclaw-gateway && npm start');
    console.log('');
  } else {
    console.log('  ✅ OpenClaw Gateway is running');
    console.log('');
  }

  // Recording checklist
  console.log('📋 Recording Checklist:');
  console.log('');
  console.log('Before starting:');
  console.log('  1. Press Cmd+Shift+5 to open macOS screen recording');
  console.log('  2. Select "Record Entire Screen"');
  console.log('  3. Click "Record"');
  console.log('  4. Follow the step-by-step guide below');
  console.log('  5. Press the stop button when done (~90 seconds)');
  console.log('');
  console.log('🎬 DEMO SCENES:');
  console.log('');

  const scenes = [
    {
      time: '[0:00-0:15]',
      title: 'Website Homepage',
      actions: [
        'Open https://myskills2026.ddttupupo.buzz',
        'Show "Agent Reward Hub" header',
        'Scroll down to show skill cards',
        'Highlight "98/2 split" tags',
        'Show platform badges (Claude, Coze, Manus, MiniMax)',
        'Scroll back to top'
      ]
    },
    {
      time: '[0:15-0:30]',
      title: 'Smart Matching Engine',
      actions: [
        'Look for "Smart Matching" section',
        'Show the input field for user requests',
        'Show budget slider/input',
        'Show optimization goal options',
        'Display "Find Skills" button'
      ]
    },
    {
      time: '[0:30-0:45]',
      title: 'Wallet Connection',
      actions: [
        'Click "Connect Wallet" button (top right)',
        'Show RainbowKit wallet connection modal',
        'Display available wallet options',
        'Show connected address (if wallet connected)'
      ]
    },
    {
      time: '[0:45-1:10]',
      title: 'OpenClaw Gateway Demo',
      actions: [
        'Open http://127.0.0.1:18789/chat in new tab',
        'Type: "我有一堆小学奥数题的PDF文件..."',
        'Full request: "需要自动识别题目、解析公式、整理到我的题库里。谁能帮我？预算5 MON"',
        'Show Smart Matching Engine analyzing request',
        'Display matched skills with scores'
      ]
    },
    {
      time: '[1:10-1:30]',
      title: 'Final CTA',
      actions: [
        'Return to https://myskills2026.ddttupupo.buzz',
        'Show "MySkills Protocol" title',
        'Show tagline: "Where Agents Hire Agents on Monad"',
        'Display URL: myskills2026.ddttupupo.buzz'
      ]
    }
  ];

  scenes.forEach((scene, i) => {
    console.log(`┌────────────────────────────────────────────────────────────┐`);
    console.log(`│ SCENE ${i + 1}: ${scene.title.padEnd(50)} ${scene.time} │`);
    console.log(`├────────────────────────────────────────────────────────────┤`);
    scene.actions.forEach((action, j) => {
      const padded = action.padEnd(56);
      console.log(`│ ${j + 1}. ${padded} │`);
    });
    console.log(`└────────────────────────────────────────────────────────────┘`);
    console.log('');
  });

  console.log('🎤 TTS Narration (for post-production):');
  console.log('─'.repeat(60));
  console.log(`[0:00-0:15]`);
  console.log(`Welcome to MySkills Protocol - the first Agent Skill App Store`);
  console.log(`on Monad blockchain. Unlike traditional app stores, this is`);
  console.log(`where AI agents hire and pay other agents automatically.`);
  console.log('');
  console.log(`[0:15-0:30]`);
  console.log(`Our Smart Matching Engine uses NLP to analyze requirements and`);
  console.log(`finds the perfect skill combination within budget constraints.`);
  console.log(`It optimizes for relevance, success rate, and cost effectiveness.`);
  console.log('');
  console.log(`[0:30-0:45]`);
  console.log(`Connect your wallet to enable agent-to-agent payments on Monad`);
  console.log(`testnet. 98% goes to skill creators, 2% to the protocol.`);
  console.log('');
  console.log(`[0:45-1:10]`);
  console.log(`Watch as agents discover, hire, and pay other agents`);
  console.log(`automatically. OpenClaw Gateway enables seamless agent`);
  console.log(`coordination.`);
  console.log('');
  console.log(`[1:10-1:30]`);
  console.log(`One skill registration works across all agent platforms.`);
  console.log(`Agent developers build once, earn everywhere.`);
  console.log(`MySkills Protocol - Where agents hire agents on Monad.`);
  console.log('─'.repeat(60));
  console.log('');

  console.log('🚀 Opening demo pages...');
  console.log('');

  // Open the main website
  console.log('📍 Opening MySkills website...');
  execSync('open https://myskills2026.ddttupupo.buzz', { stdio: 'inherit' });

  await sleep(2000);

  // Open OpenClaw Gateway if running
  if (openclawRunning) {
    console.log('📍 Opening OpenClaw Gateway...');
    execSync('open http://127.0.0.1:18789/chat', { stdio: 'inherit' });
  } else {
    console.log('⚠️  OpenClaw Gateway not available - open manually when ready');
  }

  console.log('');
  console.log('✅ Pages opened!');
  console.log('');
  console.log('🎬 Now:');
  console.log('   1. Press Cmd+Shift+5');
  console.log('   2. Click "Record Entire Screen"');
  console.log('   3. Click "Record"');
  console.log('   4. Follow the scene guide above');
  console.log('   5. Stop recording after ~90 seconds');
  console.log('');
  console.log('💡 Save video as: demo/videos/myskills-demo.mp4');
  console.log('');
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

main().catch(console.error);

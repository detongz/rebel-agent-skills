// MySkills Demo Walkthrough - Automate OpenClaw interaction
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('🎬 MySkills Demo Walkthrough');
  console.log('============================');
  console.log('');

  // Create screenshots directory
  const screenshotsDir = path.join(__dirname, 'demo', 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  console.log('📍 Step 1: Opening OpenClaw Gateway...');
  execSync('open "http://127.0.0.1:18789/#token=511ce9ce2abf5ec3faacc1b5d2c58a7f29bf6d26efcc2ab98f5f8d9da32723c2"');
  await sleep(3000);

  console.log('📍 Step 2: Opening MySkills website...');
  execSync('open "https://myskills2026.ddttupupo.buzz"');
  await sleep(2000);

  console.log('');
  console.log('✅ All pages opened!');
  console.log('');
  console.log('📋 Demo Script (follow this manually):');
  console.log('');

  const steps = [
    {
      time: '0:00-0:10',
      title: 'Scene 1: OpenClaw Gateway',
      action: 'Show OpenClaw Chat UI is connected and ready'
    },
    {
      time: '0:10-0:20',
      title: 'Scene 2: 张老师 Request',
      action: 'Type: "我有一堆小学奥数题的PDF文件，需要自动识别题目、解析公式、整理到我的题库里。谁能帮我？预算5 MON"'
    },
    {
      time: '0:20-0:40',
      title: 'Scene 3: Smart Matching',
      action: 'Wait for MySkills plugin response showing 3 skills (LaTeX 96%, PDF 88%, Layout 75%)'
    },
    {
      time: '0:40-0:55',
      title: 'Scene 4: Agents Working',
      action: 'Show agent execution: 15 problems, 96% accuracy, 30 seconds'
    },
    {
      time: '0:55-1:10',
      title: 'Scene 5: MySkills Website',
      action: 'Switch to myskills2026.ddttupupo.buzz, show 98/2 split, platform badges'
    },
    {
      time: '1:10-1:30',
      title: 'Scene 6: Final CTA',
      action: 'Show "Where Agents Hire Agents on Monad" and URL'
    }
  ];

  steps.forEach((step, i) => {
    console.log(`┌─────────────────────────────────────────────────────────────────┐`);
    console.log(`│ ${step.time.padEnd(12)} ${step.title.padEnd(30) } │`);
    console.log(`├─────────────────────────────────────────────────────────────────┤`);
    console.log(`│ ${step.action.padEnd(73)}│`);
    console.log(`└─────────────────────────────────────────────────────────────────┘`);
    console.log('');
  });

  console.log('🎬 To record:');
  console.log('   1. Press Cmd+Shift+5');
  console.log('   2. Select "Record Entire Screen"');
  console.log('   3. Click "Record"');
  console.log('   4. Follow the steps above (~90 seconds)');
  console.log('   5. Click "Stop"');
  console.log('');
  console.log('💾 Save as: demo/videos/myskills-openclaw-demo.mp4');
  console.log('');
}

main().catch(console.error);

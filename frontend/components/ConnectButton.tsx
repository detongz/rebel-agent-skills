// components/ConnectButton.tsx - 钱包连接按钮
'use client';

import { ConnectButton as RainbowConnectButton } from '@rainbow-me/rainbowkit';

export default function ConnectButton() {
  return (
    <RainbowConnectButton
      accountStatus={{
        smallScreen: 'avatar',
        largeScreen: 'full',
      }}
      showBalance={{
        smallScreen: false,
        largeScreen: true,
      }}
    />
  );
}

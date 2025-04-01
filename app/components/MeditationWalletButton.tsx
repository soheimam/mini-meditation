'use client';

import React, { useEffect } from 'react';
import { 
  Wallet, 
  ConnectWallet, 
  ConnectWalletText 
} from '@coinbase/onchainkit/wallet';
import { useAccount } from 'wagmi';

interface MeditationWalletButtonProps {
  onStart: () => void;
}

const MeditationWalletButton: React.FC<MeditationWalletButtonProps> = ({ onStart }) => {
  const { isConnected } = useAccount();

  useEffect(() => {
    // Start meditation automatically when wallet is connected
    if (isConnected) {
      onStart();
    }
  }, [isConnected, onStart]);

  return (
    <div>
      {!isConnected && (
        <Wallet>
          <ConnectWallet className="bg-white hover:bg-gray-100 py-3 px-6 rounded-full transition-colors duration-200 shadow-lg">
            <ConnectWalletText className="text-blue-600 font-semibold">Connect Wallet to Meditate</ConnectWalletText>
          </ConnectWallet>
        </Wallet>
      )}
    </div>
  );
};

export default MeditationWalletButton; 
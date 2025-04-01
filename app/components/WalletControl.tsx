'use client';

import React, { useState } from 'react';
import { 
  Wallet, 
  ConnectWallet, 
  ConnectWalletText,
  WalletDropdown,
  WalletDropdownDisconnect
} from '@coinbase/onchainkit/wallet';
import { 
  Name, 
  Identity, 
  EthBalance, 
  Address, 
  Avatar 
} from "@coinbase/onchainkit/identity";
import Image from 'next/image';

const CustomAvatar: React.FC = () => {
  const [hasError, setHasError] = useState(false);
  
  if (hasError) {
    return <Image src="/yogi.png" alt="Fallback Avatar" width={40} height={40} className="rounded-full" />;
  }
  
  return <Avatar onError={() => setHasError(true)} />;
};

const WalletControl: React.FC = () => {
  return (
    <div className="absolute top-4 left-4">
      <Wallet>
        <ConnectWallet className="w-12 h-12 bg-white rounded-full hover:bg-gray-100 focus:bg-gray-100 cursor-pointer select-none transition-all duration-150 border-[1px] border-blue-600 min-w-12 [box-shadow:0_5px_0_0_#2563eb,0_8px_0_0_#3b82f633]">
          <ConnectWalletText>{''}</ConnectWalletText>
        </ConnectWallet>
        <WalletDropdown>
          <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
            <CustomAvatar />
            <Name />
            <Address />
            <EthBalance />
          </Identity>
          <WalletDropdownDisconnect />
        </WalletDropdown>
      </Wallet>
    </div>
  );
};

export default WalletControl; 
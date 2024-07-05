import { Wallet } from "@prisma/client";
import { useEffect, useState } from "react";

// Define a new type that includes all the fields within Wallet
// as well as _count which is the number of transactions corresponding to a wallet
type WalletWithTxnsCount = Wallet & {
  _count: {
    transactions: number;
  };
};

export default function WalletList({ address }: { address: string }) {
  // Declare a state variable wallets which keeps track of WalletWithTxnxCount for a given EOA address
  const [wallets, setWallets] = useState<WalletWithTxnsCount[]>([]);

  // Use useEffect to call the fetch-wallets API endpoint and set the wallets
  useEffect(() => {
    fetch(`/api/fetch-wallets?address=${address}`)
      .then((response) => response.json())
      .then((data) => setWallets(data));
  }, [address]);
}
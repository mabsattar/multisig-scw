import { getUserOpForETHTransfer } from "@/utils/getUserOpForETHTransfer";
import { parseEther } from "ethers/lib/utils";
import { useState } from "react";

// Define the WalletPage component
export default function WalletPage({
  params: { walletAddress },
}: {
  params: { walletAddress: string };
}) {
  // Define state variables
  const [amount, setAmount] = useState<number>(0);
  const [toAddress, setToAddress] = useState("");

  // Define an asynchronous function to fetch the user operation for an ETH transfer
  const fetchUserOp = async () => {
    try {
      // Fetch wallet data
      const response = await fetch(
        `/api/fetch-wallet?walletAddress=${walletAddress}`
      );
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      // Convert the amount to a big integer
      const amountBigInt = parseEther(amount.toString());

      // Get the user operation for the ETH transfer
      const userOp = await getUserOpForETHTransfer(
        walletAddress,
        data.signers,
        data.salt,
        toAddress,
        amountBigInt,
        data.isDeployed
      );

      // Throw an error if the user operation could not be retrieved
      if (!userOp) throw new Error("Could not get user operation");

      // Return the user operation
      return userOp;
    } catch (e: any) {
      window.alert(e.message);
      throw new Error(e.message);
    }
  };
}
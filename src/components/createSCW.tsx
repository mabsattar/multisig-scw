"use client";
import { useEffect, useRef, useState } from "react";
import { useAccount } from "wagmi";
import { isAddress } from "ethers/lib/utils";
import { useRouter } from "next/navigation";

export default function CreateSCW() {
  const [signers, setSigners] = useState<string[]>([]);
  const { address } = useAccount();
  const lastInput = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setSigners([address as string]);
  }, [address]);

  useEffect(() => {
    if (lastInput.current) {
      lastInput.current.focus();
    }
  }, [signers]);

  function addNewSigner() {
    setSigners((signers) => [...signers, ""]);
  }

  function removeSigner(index: number) {
    if (signers[index] === undefined) return;
    if (signers.length <= 1) return;
    if (signers[index].length > 0) return;
    const newSigners = [...signers];
    newSigners.splice(index, 1);
    setSigners(newSigners);
  }

  const onCreateSCW = async () => {
    try {
      // Set loading state to true at the start of the function execution
      setLoading(true);
  
      // Iterate over each signer
      signers.forEach((signer) => {
        // Check if the signer is a valid Ethereum address
        if (isAddress(signer) === false) {
          // If not, throw an error
          throw new Error(`Invalid address: ${signer}`);
        }
      });
  
      // Make a POST request to the create-wallet endpoint we made earlier with the signers as the body
      const response = await fetch("/api/create-wallet", {
        method: "POST",
        body: JSON.stringify({ signers }),
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      // Parse the response as JSON
      const data = await response.json();
  
      // If the response contains an error, throw it
      if (data.error) {
        throw new Error(data.error);
      }
  
      // If the wallet is successfully created, alert the user with the wallet address
      window.alert(`Wallet created: ${data.address}`);
  
      // Navigate the user to the homepage
      router.push(`/`);
    } catch (error) {
      // Log any errors to the console
      console.error(error);
  
      // If the error is an instance of Error, alert the user with the error message
      if (error instanceof Error) {
        window.alert(error.message);
      }
    } finally {
      // Set loading state to false at the end of the function execution
      setLoading(false);
    }
  };

  return null;
}
import { BUNDLER_RPC_URL, WALLET_FACTORY_ADDRESS } from "../utils/constants";
import {
  entryPointContract,
  getWalletContract,
  provider,
  walletFactoryContract,
} from "../utils/getContracts";
import { BigNumber } from "ethers";
import { concat } from "ethers/lib/utils";
import { Client, Presets } from "userop";
import { getUserOperationBuilder } from "./getUserOperationBuilder";

export async function getUserOpForETHTransfer(
  walletAddress: string,
  owners: string[],
  salt: string,
  toAddress: string,
  value: BigNumber,
  isDeployed?: boolean
) {
  try {
    let initCode = Uint8Array.from([]);
    if (!isDeployed) {
      // Encode the function data for creating a new account
      const data = walletFactoryContract.interface.encodeFunctionData(
        "createAccount",
        [owners, salt]
      );
      // Initialize the initCode which will be used to deploy a new wallet
      initCode = concat([WALLET_FACTORY_ADDRESS, data]);
    }

    // Get the nonce for the wallet address with a key of 0
    const nonce: BigNumber = await entryPointContract.getNonce(
      walletAddress,
      0
    );

    // Get the wallet contract instance
    const walletContract = getWalletContract(walletAddress);
    // Encode the call data for the execute method
    const encodedCallData = walletContract.interface.encodeFunctionData(
      "execute",
      [toAddress, value, initCode]
    );

    // Get the user operation builder with the necessary parameters
    const builder = await getUserOperationBuilder(
      walletContract.address,
      nonce,
      initCode,
      encodedCallData,
      []
    );

    // Use middleware to set the current gas prices
    builder.useMiddleware(Presets.Middleware.getGasPrice(provider));

    // Initialize a client to connect to the Bundler
    const client = await Client.init(BUNDLER_RPC_URL);
    // Build the user operation using the builder
    await client.buildUserOperation(builder);
    // Retrieve the user operation
    const userOp = builder.getOp();

    // Return the final user operation
    return userOp;
  } catch (e) {
    console.error(e);
    if (e instanceof Error) {
      window.alert(e.message);
    }
  }
}
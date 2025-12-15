// Signature verification utilities - placeholder for now

export const verifySignature = async (
  message: string,
  signature: string,
  address: string
): Promise<boolean> => {
  // TODO: Implement with ethers.js in task 2.1
  console.log('Verifying signature:', { message, signature, address });
  return true;
};

export const generateMessage = (challengeId: string, timestamp: number): string => {
  // TODO: Implement SIWE-style message generation
  return `DeCap verification for challenge ${challengeId} at ${timestamp}`;
};
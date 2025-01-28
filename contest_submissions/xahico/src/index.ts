import {
  Client,
  Wallet,
  Invoke,
  Payment,
  SetHookFlags,
  TransactionMetadata,
} from "@transia/xrpl";
import {
  createHookPayload,
  setHooksV3,
  SetHookParams,
  Xrpld,
  ExecutionUtility,
  iHookParamEntry,
  iHookParamName,
  iHookParamValue,
} from "@transia/hooks-toolkit";
import "dotenv/config";

export async function main(): Promise<void> {
  const client = new Client(process.env.XRPLD_WSS || "");
  await client.connect();
  client.networkID = await client.getNetworkID();

  const icoWallet = Wallet.fromSeed(process.env.ICO_WALLET_SEED || "");

  const currency = new iHookParamEntry(new iHookParamName('currency'), new iHookParamValue(String(process.env.ICO_CURRENCY_SYMBOL), false));
  const issuer = new iHookParamEntry(new iHookParamName('issuer'), new iHookParamValue(String(process.env.ICO_CURRENCY_ISSUER), false));
  const ratio = new iHookParamEntry(new iHookParamName('currency_value_in_xah'), new iHookParamValue(String(process.env.ICO_CURRENCY_RATIO), false));

  const hook = createHookPayload({
    version: 1,
    createFile: "ico",
    namespace: "ico",
    flags: SetHookFlags.hsfOverride,
    hookOnArray: ["Payment"],
    fee: "100000",
    hookParams: [currency.toXrpl(), issuer.toXrpl(), ratio.toXrpl()]
  });

  await setHooksV3({
    client: client,
    seed: icoWallet.seed,
    hooks: [{ Hook: hook }],
  } as SetHookParams);

  // const builtTx: Payment = {
  //   TransactionType: "Payment",
  //   Account: icoWallet.classicAddress,
  // };
  // const result = await Xrpld.submit(client, {
  //   wallet: icoWallet,
  //   tx: builtTx,
  //   debugStream: true,
  // });

  // const hookExecutions = await ExecutionUtility.getHookExecutionsFromMeta(
  //   client,
  //   result.meta as TransactionMetadata
  // );
  // console.log(hookExecutions.executions[0].HookReturnString);
  await client.disconnect();
}

main();

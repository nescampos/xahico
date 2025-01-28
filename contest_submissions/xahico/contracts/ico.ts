import { SUCCESS, encodeString, decodeJson,  } from "jshooks-api";
import { Transaction,Payment } from '@transia/xahau-models';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Hook = (arg: number) => {


  const txn = otxn_json() as Transaction;

  if(txn.TransactionType == "Payment") {

    const hook_accid = hook_account();

    if (typeof txn.Amount === "object") {
      rollback('You need to send XAH/XRP only, no other tokens', 0)
    }
    if(txn.Amount === "0") {
      rollback('You need to send more than 0 XAH/XRP to buy tokens', -1);
    }

    const currency : string = hook_param("currency");
    const issuer : string= hook_param("issuer");
    const currency_value_in_xah : string = hook_param("currency_value_in_xah");
    const amount_to_buy = BigInt(txn.Amount.toString()) / BigInt(currency_value_in_xah);

    const prepared = prepare({
      TransactionType: "Payment",
      "Account": hook_accid,
      Amount: {
        currency: currency,
        issuer: issuer,
        value: String(amount_to_buy),
      },
    });

    const emitted = emit(prepared as Transaction);

    if(typeof emitted === "number") {
      trace("Tx id:", emitted, false);
      accept("ICO tx executed successfully.", SUCCESS);
    } else {
      trace("Error: ", emitted, false);
      rollback('Rollback: Error in the transaction', 0)
    }

    
  } else {
    trace("Error", "This account accept payment transactions only.", false);
    rollback('Rollback: Error in the transaction', 0)
  }
};

export { Hook };

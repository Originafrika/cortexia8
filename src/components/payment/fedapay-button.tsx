import { FedaCheckoutButton } from "fedapay-reactjs";

declare global {
  interface Window {
    FedaPay?: { DIALOG_DISMISSED: string };
  }
}

export type FedaPayTransactionResult = {
  id?: number;
  token?: string;
  status?: string;
  amount?: number;
  currency?: string;
  description?: string;
};

type FedaPayButtonProps = {
  amount: number;
  description?: string;
  public_key: string;
  onComplete?: (transaction: FedaPayTransactionResult) => void;
  onError?: (error: unknown) => void;
};

export function FedaPayCheckoutButton({
  amount,
  description = "Recharge de crédits",
  public_key,
  onComplete,
  onError,
}: FedaPayButtonProps) {
  const options = {
    public_key,
    transaction: {
      amount,
      description,
    },
    currency: {
      iso: "XOF" as const,
    },
    button: {
      class: "fedapay-btn",
      text: `Payer ${amount} XOF`,
    },
    onComplete(resp: { reason?: string; transaction?: FedaPayTransactionResult }) {
      const FedaPay = window.FedaPay;
      if (FedaPay && resp.reason === FedaPay.DIALOG_DISMISSED) {
        return;
      }
      if (resp.transaction) {
        onComplete?.(resp.transaction);
      }
    },
  };

  return (
    <FedaCheckoutButton
      options={options as any}
    />
  );
}

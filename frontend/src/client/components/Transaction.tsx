import React from "react";
import { useSendTransaction } from "wagmi";
import metadata from "../../abis/rental.json";

const Transaction = ({ txnType, rental }: { txnType: string; rental: any }) => {
  console.log("Inside Transaction");

  const { data, isLoading, isSuccess, sendTransaction } = useSendTransaction({
    request: {
      data: metadata.bytecode.object,
      value: [
        rental.lenderAddress,
        rental.borrowerAddress,
        rental.get("listing").attributes.nftSpecification.collection,
        rental.get("listing").attributes.nftSpecification.id,
        rental.dueDate,
        rental.rentalPayment,
        rental.collateral,
        rental.collateralPayoutPeriod,
        0,
      ],
    },
  });

  sendTransaction?.();

  if (isSuccess) {
    console.log("Data is: ", data);
  }

  return <div>dfd</div>;
};

export default Transaction;

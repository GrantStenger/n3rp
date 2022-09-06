import React from "react";

const contracts = [
  {
    image: "",
    role: "Lender",
    counterparty: "jackson.eth",
    status: "Active",
    expiration: "7 days",
    address: "0x12341234",
  },
  {
    image: "",
    role: "Borrower",
    counterparty: "grant.eth",
    status: "Active",
    expiration: "4 hours",
    address: "0x23452345",
  },
  {
    image: "",
    role: "Lender",
    counterparty: "jackson.eth",
    status: "Late",
    expiration: "3 days",
    address: "0x34563456",
  },
  {
    image: "",
    role: "Lender",
    counterparty: "grace.eth",
    status: "Active",
    expiration: "32 minutes",
    address: "0x45674567",
  },
];

export const ContractsTable = () => {
  return (
    <div>
      <h1 className="font-bold text-slate-800 text-l lg:text-3xl text-center my-4">0xUserAddress</h1>
      <div className="flex flex-col">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      NFT
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Role
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Counterparty
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Expiration
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Interact</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {contracts.map(contract => (
                    <tr key={contract.address}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <img src={contract.image} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>{contract.role}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>{contract.counterparty}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {contract.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>{contract.expiration}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <a href="#">
                          <button className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-full">
                            Interact
                          </button>
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export interface RentContract {
    lenderAddress: string;
    borrowerAddress: string;
    nftCollection: string;
    nftId: string;
    startDate: Date;
    dueDate: Date
    rentalPayment: number;
    collateral: number;
    collateralPayoutPeriod: number;
}

export interface AvaliableDates {
    startDate: Date;
    endDate: Date;
}

export interface Listing {
    nftListingName: string;
    nftListingDescription: string;    
    datesForRent: AvaliableDates[];
}

export interface Nft {
    contract?: RentContract;
    listing: Listing;
}

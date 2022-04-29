// declare modules here

export interface NftSpecification {
    nftCollection: string;
    nftId: string;
}

export interface RentContract {
    lenderAddress: string;
    borrowerAddress: string;
    startDate: Date;
    dueDate: Date
    rentalPayment: number;
    collateralPayoutPeriod: number;
}

export interface AvaliableDates {
    startDate: Date;
    endDate: Date;
}

export interface Listing {
    name: string;
    description: string;
    datesForRent: AvaliableDates[];
    pricePerDay: number;
    collateral: number;
}

export interface Nft {
    contract?: RentContract;
    listing: Listing;
    nftSpecification: NftSpecification;
}

export enum AvaliabilityStatus {
    Avaliabile,
    Unavaliabile,
    Rented,
    Upcoming,
}
export interface Avaliability {
    status: AvaliabilityStatus;
    AvaliabiltyDate?: Date;
}

export interface Attribute {
    traitType: string,
    value: string,
}

export interface NftWithMetadata {
    nft: Nft;
    image: string;
    avaliability: Avaliability;
    attributes: Attribute[];
}
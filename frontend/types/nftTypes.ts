// declare modules here

export interface NftSpecification {
  collection: string;
  id: string;
}

export interface RentContract {
  lenderAddress: string;
  borrowerAddress: string;
  startDate: Date;
  dueDate: Date;
  rentalPayment: number;
  collateralPayoutPeriod: number;
}

export interface AvaliableDates {
  startDate: Date;
  endDate: Date;
}

export interface Listing {
  owner: string;
  description: string;
  datesForRent: AvaliableDates[];
  pricePerDay: number;
  collateral: number;
}

export interface Nft {
  contract?: RentContract;
  listing: Listing;
  specification: NftSpecification;
  objectId: string;
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
  traitType: string;
  value: string;
}

export interface NftWithMetadata {
  nft: Nft;
  name: string;
  image: string;
  avaliability: Avaliability;
  attributes: Attribute[];
}

/*
MODULE_CONTRACT: Define the stable public offer entity contract for widget and feature consumers.
SCOPE: Offer entity shape and sortable offer keys only.
DEPENDS: none
LINKS: [OfferEntity][types][BLOCK_DEFINE_OFFER_TYPES]

MODULE_MAP:
- OFFER_SORT_VALUES - Public export declared in this module.
- OfferSellerSummary - Public export declared in this module.
- OfferMoney - Public export declared in this module.
- Offer - Public export declared in this module.
- OfferSort - Public export declared in this module.
CONTRACT:
PURPOSE: Define the stable type or ambient declaration surface described by MODULE_CONTRACT.
INPUTS: none.
OUTPUTS: TypeScript types, interfaces, or ambient module declarations only.
SIDE_EFFECTS: none.
START_BLOCK_DEFINE_OFFER_TYPES
Stable contract for the offer slice.
END_BLOCK_DEFINE_OFFER_TYPES
CHANGE_SUMMARY: Introduces a structural offer entity contract and a safe sort surface.
*/
export const OFFER_SORT_VALUES = ['price', 'delivery_date'] as const;

export type OfferSort = (typeof OFFER_SORT_VALUES)[number];

export interface OfferSellerSummary {
  id: string;
  name: string;
  rating: number;
}

export interface OfferMoney {
  amount: number;
  currency: string;
}

export interface Offer {
  id: string;
  seller: OfferSellerSummary;
  price: OfferMoney;
  delivery_date: string | null;
}

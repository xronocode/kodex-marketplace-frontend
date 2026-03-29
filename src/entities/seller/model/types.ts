/*
MODULE_CONTRACT: Define the stable public seller entity contract for offers and admin rendering consumers.
SCOPE: Seller entity shape only.
DEPENDS: none
LINKS: [SellerEntity][types][BLOCK_DEFINE_SELLER_TYPES]

MODULE_MAP:
- Seller - Public export declared in this module.
CONTRACT:
PURPOSE: Define the stable type or ambient declaration surface described by MODULE_CONTRACT.
INPUTS: none.
OUTPUTS: TypeScript types, interfaces, or ambient module declarations only.
SIDE_EFFECTS: none.
START_BLOCK_DEFINE_SELLER_TYPES
Stable contract for the seller slice.
END_BLOCK_DEFINE_SELLER_TYPES
CHANGE_SUMMARY: Introduces a structural seller entity contract with no transport or shared API coupling.
*/
export interface Seller {
  id: string;
  name: string;
  rating: number;
}

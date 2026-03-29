/*
MODULE_CONTRACT: Define typed product contracts for catalog, detail, and admin API consumers.
SCOPE: Local product money, attribute, list/detail, admin, and payload helper types only.
DEPENDS: none
LINKS: [ProductEntityApi][types][BLOCK_DEFINE_PRODUCT_TYPES]

MODULE_MAP:
- Money - Public export declared in this module.
- ProductAttribute - Public export declared in this module.
- ProductListItem - Public export declared in this module.
- ProductListResponse - Public export declared in this module.
- ProductDetailsOfferSeller - Public export declared in this module.
- ProductDetailsOffer - Public export declared in this module.
- ProductDetails - Public export declared in this module.
- AdminProduct - Public export declared in this module.
- AdminProductCreatePayload - Public export declared in this module.
- AdminProductUpdatePayload - Public export declared in this module.
- AdminProductImageUploadResponse - Public export declared in this module.
- ProductOfferSort - Public export declared in this module.
CONTRACT:
PURPOSE: Define the stable type or ambient declaration surface described by MODULE_CONTRACT.
INPUTS: none.
OUTPUTS: TypeScript types, interfaces, or ambient module declarations only.
SIDE_EFFECTS: none.
START_BLOCK_DEFINE_PRODUCT_TYPES
Self-contained product contracts that avoid cross-slice imports.
END_BLOCK_DEFINE_PRODUCT_TYPES
CHANGE_SUMMARY: Introduces backend-aligned product DTOs and request payload helpers without cross-slice imports.
*/
export interface Money {
  amount: number;
  currency: string;
}

export interface ProductAttribute {
  key: string;
  value: string;
}

export interface ProductListItem {
  id: string;
  name: string;
  thumbnail_url: string | null;
  price: Money;
  stock: number;
  nearest_delivery_date: string | null;
}

export interface ProductListResponse {
  items: ProductListItem[];
  next_cursor: string | null;
}

export type ProductOfferSort = 'price' | 'delivery_date';

export interface ProductDetailsOfferSeller {
  name: string;
  rating: number;
}

export interface ProductDetailsOffer {
  id: string;
  seller: ProductDetailsOfferSeller;
  price: Money;
  delivery_date: string;
}

export interface ProductDetails {
  id: string;
  name: string;
  image_url: string | null;
  attributes: ProductAttribute[];
  offers: ProductDetailsOffer[];
}

export interface AdminProduct {
  id: string;
  name: string;
  price: Money;
  stock: number;
  image_url: string | null;
  thumbnail_url: string | null;
  attributes: ProductAttribute[];
}

export interface AdminProductCreatePayload {
  name: string;
  price: Money;
  stock: number;
  attributes: ProductAttribute[];
}

export interface AdminProductUpdatePayload {
  name?: string;
  price?: Money;
  stock?: number;
  attributes?: ProductAttribute[];
}

export interface AdminProductImageUploadResponse {
  image_url: string;
  thumbnail_url: string;
}

export interface Seller {
  id: string;
  name: string;
  rating: number;
}

export interface Offer {
  id: string;
  product_id: string;
  seller_id: string;
  seller_name: string;
  price: Money;
  delivery_date: string;
  stock: number;
}

export interface SellerCreatePayload {
  name: string;
  rating: number;
}

export interface OfferCreatePayload {
  product_id: string;
  seller_id: string;
  price: Money;
  delivery_date: string;
  stock: number;
}

export interface OfferUpdatePayload {
  price?: Money;
  delivery_date?: string;
  stock?: number;
}

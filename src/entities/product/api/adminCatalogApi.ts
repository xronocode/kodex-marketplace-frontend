/*
MODULE_CONTRACT: Provide admin seller and offer API adapters for catalog management.
SCOPE: Admin CRUD helpers for sellers and offers.
DEPENDS: @/shared/api, ../model/types
LINKS: [AdminCatalogApi][BLOCK_DEFINE_ADMIN_API]

MODULE_MAP:
- adminListSellers - Public export declared in this module.
- adminCreateSeller - Public export declared in this module.
- adminCreateOffer - Public export declared in this module.
- adminUpdateOffer - Public export declared in this module.
- adminDeleteOffer - Public export declared in this module.
CONTRACT:
PURPOSE: Execute the typed transport behavior described by MODULE_CONTRACT.
INPUTS: Function parameters passed to the exported API helpers in this module.
OUTPUTS: Typed Promise results or transport metadata returned by the exported helpers.
SIDE_EFFECTS: HTTP requests through the shared client.
START_BLOCK_MODULE
Admin seller and offer API helpers for catalog management.
END_BLOCK_MODULE
CHANGE_SUMMARY: Adds typed admin catalog helpers for seller and offer management.
*/
import { client } from '@/shared/api';

import type {
  Money,
  Seller,
  Offer,
  SellerCreatePayload,
  OfferCreatePayload,
  OfferUpdatePayload,
} from '../model/types';

const ADMIN_SELLERS_PATH = '/v1/admin/sellers';
const ADMIN_OFFERS_PATH = '/v1/admin/offers';
const DEFAULT_CURRENCY = 'RUB';

interface SellerApiItem {
  id: string;
  name: string;
  rating: number;
}

interface OfferApiItem {
  id: string;
  product_id: string;
  seller_id: string;
  seller_name: string;
  price: number | string | Money;
  delivery_date: string;
  stock: number;
}

function toMoney(value: number | string | Money): Money {
  if (typeof value === 'number' || typeof value === 'string') {
    return {
      amount: Number(value),
      currency: DEFAULT_CURRENCY,
    };
  }

  return value;
}

function toSeller(item: SellerApiItem): Seller {
  return {
    id: item.id,
    name: item.name,
    rating: item.rating,
  };
}

function toOffer(item: OfferApiItem): Offer {
  return {
    id: item.id,
    product_id: item.product_id,
    seller_id: item.seller_id,
    seller_name: item.seller_name,
    price: toMoney(item.price),
    delivery_date: item.delivery_date,
    stock: item.stock,
  };
}

export async function adminListSellers(): Promise<Seller[]> {
  const response = await client.get<SellerApiItem[]>(ADMIN_SELLERS_PATH);
  return response.data.map(toSeller);
}

export async function adminCreateSeller(payload: SellerCreatePayload): Promise<Seller> {
  const response = await client.post<SellerApiItem>(ADMIN_SELLERS_PATH, payload);
  return toSeller(response.data);
}

export async function adminCreateOffer(payload: OfferCreatePayload): Promise<Offer> {
  const request = {
    ...payload,
    price: payload.price.amount,
  };
  const response = await client.post<OfferApiItem>(ADMIN_OFFERS_PATH, request);
  return toOffer(response.data);
}

export async function adminUpdateOffer(id: string, payload: OfferUpdatePayload): Promise<Offer> {
  const request: Record<string, unknown> = {};
  if (payload.price) {
    request.price = payload.price.amount;
  }
  if (payload.delivery_date) {
    request.delivery_date = payload.delivery_date;
  }
  if (payload.stock !== undefined) {
    request.stock = payload.stock;
  }

  const response = await client.put<OfferApiItem>(`${ADMIN_OFFERS_PATH}/${id}`, request);
  return toOffer(response.data);
}

export async function adminDeleteOffer(id: string): Promise<void> {
  await client.delete(`${ADMIN_OFFERS_PATH}/${id}`);
}

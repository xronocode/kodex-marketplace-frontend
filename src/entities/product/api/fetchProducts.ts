/*
MODULE_CONTRACT: Fetch the public product catalog with cursor pagination and total count metadata.
SCOPE: Public list request helper, cursor/limit forwarding, and X-Total-Count parsing.
DEPENDS: @/shared/api, ../model/types
LINKS: [ProductEntityApi][fetchProducts][BLOCK_REQUEST_PRODUCTS]

MODULE_MAP:
- fetchProducts - Public export declared in this module.
CONTRACT:
PURPOSE: Execute the typed transport behavior described by MODULE_CONTRACT.
INPUTS: Function parameters passed to the exported API helpers in this module.
OUTPUTS: Typed Promise results or transport metadata returned by the exported helpers.
SIDE_EFFECTS: HTTP requests through the shared client or mocked adapters in tests.
START_BLOCK_REQUEST_PRODUCTS
[ProductEntityApi][fetchProducts][BLOCK_REQUEST_PRODUCTS] Public catalog list request helper.
END_BLOCK_REQUEST_PRODUCTS
CHANGE_SUMMARY: Adds a typed public catalog fetcher that preserves cursor semantics and parses the total-count header.
*/
import { client } from '@/shared/api';

import type { Money, ProductListItem, ProductListResponse } from '../model/types';

const PRODUCT_LIST_PATH = '/v1/public/products';
const DEFAULT_CURRENCY = 'RUB';

type ProductListRequestParams = {
  cursor?: string;
  limit: number;
};

interface ProductListItemApi {
  id: string;
  name: string;
  price: number | string | Money;
  stock: number;
  thumbnail_url?: string | null;
  nearest_delivery_date?: string | null;
}

interface ProductListResponseApi {
  items: ProductListItemApi[];
  next_cursor: string | null;
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

function toProductListItem(item: ProductListItemApi): ProductListItem {
  return {
    id: item.id,
    name: item.name,
    thumbnail_url: item.thumbnail_url ?? null,
    price: toMoney(item.price),
    stock: item.stock,
    nearest_delivery_date: item.nearest_delivery_date ?? null,
  };
}

function readHeaderValue(headers: unknown, key: string): unknown {
  if (!headers || typeof headers !== 'object') {
    return undefined;
  }

  const headerBag = headers as Record<string, unknown> & {
    get?: (header: string) => unknown;
  };

  if (typeof headerBag.get === 'function') {
    const value = headerBag.get(key);
    if (value !== undefined) {
      return value;
    }
  }

  return headerBag[key] ?? headerBag[key.toLowerCase()] ?? headerBag[key.toUpperCase()];
}

function normalizeHeaderValue(value: unknown): string | number | null {
  if (typeof value === 'string' || typeof value === 'number') {
    return value;
  }

  if (Array.isArray(value)) {
    const first = value[0];
    return typeof first === 'string' || typeof first === 'number' ? first : null;
  }

  return null;
}

function parseTotalCount(headers: unknown): number {
  const value = normalizeHeaderValue(readHeaderValue(headers, 'x-total-count'));
  const totalCount = Number(value);

  return Number.isFinite(totalCount) ? totalCount : 0;
}

export async function fetchProducts(
  cursor?: string,
  limit = 20,
): Promise<{ data: ProductListResponse; totalCount: number }> {
  // [ProductEntityApi][fetchProducts][BLOCK_REQUEST_PRODUCTS]
  const params: ProductListRequestParams = cursor === undefined
    ? { limit }
    : { cursor, limit };

  const response = await client.get<ProductListResponseApi>(PRODUCT_LIST_PATH, {
    params,
  });

  return {
    data: {
      items: response.data.items.map(toProductListItem),
      next_cursor: response.data.next_cursor,
    },
    totalCount: parseTotalCount(response.headers),
  };
}

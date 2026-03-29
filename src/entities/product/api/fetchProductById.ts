/*
MODULE_CONTRACT: Fetch a public product detail payload with the requested offer sort key.
SCOPE: Product detail request helper and offers_sort forwarding.
DEPENDS: @/shared/api, ../model/types
LINKS: [ProductEntityApi][fetchProductById][BLOCK_REQUEST_PRODUCT_DETAIL]

MODULE_MAP:
- fetchProductById - Public export declared in this module.
CONTRACT:
PURPOSE: Execute the typed transport behavior described by MODULE_CONTRACT.
INPUTS: Function parameters passed to the exported API helpers in this module.
OUTPUTS: Typed Promise results or transport metadata returned by the exported helpers.
SIDE_EFFECTS: HTTP requests through the shared client or mocked adapters in tests.
START_BLOCK_REQUEST_PRODUCT_DETAIL
[ProductEntityApi][fetchProductById][BLOCK_REQUEST_PRODUCT_DETAIL] Public product detail request helper.
END_BLOCK_REQUEST_PRODUCT_DETAIL
CHANGE_SUMMARY: Adds a typed public product detail fetcher with explicit offers_sort forwarding.
*/
import { client } from '@/shared/api';

import type {
  Money,
  ProductAttribute,
  ProductDetails,
  ProductDetailsOffer,
  ProductOfferSort,
} from '../model/types';

const PRODUCT_DETAIL_PATH = (id: string): string => `/v1/public/products/${id}`;
const DEFAULT_CURRENCY = 'RUB';

interface ProductDetailsOfferApi {
  id: string;
  seller_name?: string;
  seller?: {
    name?: string;
    rating?: number;
  };
  price: number | string | Money;
  delivery_date: string;
}

interface ProductDetailsApi {
  id: string;
  name: string;
  image_url: string | null;
  attributes: ProductAttribute[];
  offers: ProductDetailsOfferApi[];
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

function toOffer(offer: ProductDetailsOfferApi): ProductDetailsOffer {
  return {
    id: offer.id,
    seller: {
      name: offer.seller?.name ?? offer.seller_name ?? '',
      rating: offer.seller?.rating ?? 0,
    },
    price: toMoney(offer.price),
    delivery_date: offer.delivery_date,
  };
}

export async function fetchProductById(
  id: string,
  offersSort: ProductOfferSort = 'price',
): Promise<ProductDetails> {
  // [ProductEntityApi][fetchProductById][BLOCK_REQUEST_PRODUCT_DETAIL]
  const response = await client.get<ProductDetailsApi>(PRODUCT_DETAIL_PATH(id), {
    params: {
      offers_sort: offersSort,
    },
  });

  return {
    id: response.data.id,
    name: response.data.name,
    image_url: response.data.image_url,
    attributes: response.data.attributes,
    offers: response.data.offers.map(toOffer),
  };
}

/*
MODULE_CONTRACT: Provide the admin product API adapter surface for catalog mutations and image uploads.
SCOPE: Admin list/create/update/delete helpers plus multipart image upload support.
DEPENDS: @/shared/api, ../model/types
LINKS: [AdminProductApi][uploadImage][BLOCK_UPLOAD_IMAGE_FORM]

MODULE_MAP:
- adminListProducts - Public export declared in this module.
- adminCreateProduct - Public export declared in this module.
- adminUpdateProduct - Public export declared in this module.
- adminDeleteProduct - Public export declared in this module.
- adminUploadImage - Public export declared in this module.
CONTRACT:
PURPOSE: Execute the typed transport behavior described by MODULE_CONTRACT.
INPUTS: Function parameters passed to the exported API helpers in this module.
OUTPUTS: Typed Promise results or transport metadata returned by the exported helpers.
SIDE_EFFECTS: HTTP requests through the shared client or mocked adapters in tests.
START_BLOCK_UPLOAD_IMAGE_FORM
[AdminProductApi][uploadImage][BLOCK_UPLOAD_IMAGE_FORM] Multipart product image upload helper.
END_BLOCK_UPLOAD_IMAGE_FORM
CHANGE_SUMMARY: Adds typed admin catalog helpers and multipart upload handling for product image management.
*/
import { client } from '@/shared/api';

import type {
  Money,
  AdminProduct,
  AdminProductCreatePayload,
  AdminProductImageUploadResponse,
  AdminProductUpdatePayload,
  ProductAttribute,
} from '../model/types';

const ADMIN_PRODUCTS_PATH = '/v1/admin/products';
const DEFAULT_CURRENCY = 'RUB';

interface AdminProductApiItem {
  id: string;
  name: string;
  price: number | string | Money;
  stock: number;
  image_url: string | null;
  thumbnail_url: string | null;
  attributes: ProductAttribute[];
}

interface AdminProductApiResponse {
  id: string;
  name: string;
  price: number | string | Money;
  stock: number;
  image_url: string | null;
  thumbnail_url: string | null;
  attributes: ProductAttribute[];
}

interface AdminProductListEnvelope {
  items: AdminProductApiItem[];
}

interface AdminProductCreateRequest {
  name: string;
  price: number;
  stock: number;
  attributes: ProductAttribute[];
}

interface AdminProductUpdateRequest {
  name?: string;
  price?: number;
  stock?: number;
  attributes?: ProductAttribute[];
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

function toAdminProduct(item: AdminProductApiItem | AdminProductApiResponse): AdminProduct {
  return {
    id: item.id,
    name: item.name,
    price: toMoney(item.price),
    stock: item.stock,
    image_url: item.image_url,
    thumbnail_url: item.thumbnail_url,
    attributes: item.attributes ?? [],
  };
}

function toCreateRequest(payload: AdminProductCreatePayload): AdminProductCreateRequest {
  return {
    name: payload.name,
    price: payload.price.amount,
    stock: payload.stock,
    attributes: payload.attributes,
  };
}

function toUpdateRequest(payload: AdminProductUpdatePayload): AdminProductUpdateRequest {
  return {
    name: payload.name,
    price: payload.price?.amount,
    stock: payload.stock,
    attributes: payload.attributes,
  };
}

export async function adminListProducts(): Promise<AdminProduct[]> {
  const response = await client.get<AdminProductListEnvelope>(ADMIN_PRODUCTS_PATH);
  return response.data.items.map(toAdminProduct);
}

export async function adminCreateProduct(
  payload: AdminProductCreatePayload,
): Promise<AdminProduct> {
  const response = await client.post<AdminProductApiResponse>(
    ADMIN_PRODUCTS_PATH,
    toCreateRequest(payload),
  );
  return toAdminProduct(response.data);
}

export async function adminUpdateProduct(
  id: string,
  payload: AdminProductUpdatePayload,
): Promise<AdminProduct> {
  const response = await client.put<AdminProductApiResponse>(
    `${ADMIN_PRODUCTS_PATH}/${id}`,
    toUpdateRequest(payload),
  );
  return toAdminProduct(response.data);
}

export async function adminDeleteProduct(id: string): Promise<void> {
  await client.delete(`${ADMIN_PRODUCTS_PATH}/${id}`);
}

export async function adminUploadImage(
  id: string,
  file: File,
): Promise<AdminProductImageUploadResponse> {
  // [AdminProductApi][uploadImage][BLOCK_UPLOAD_IMAGE_FORM]
  const formData = new FormData();
  formData.append('file', file);

  const response = await client.post<AdminProductImageUploadResponse>(
    `${ADMIN_PRODUCTS_PATH}/${id}/image`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );

  return response.data;
}

/*
MODULE_CONTRACT: Verify the admin product API adapter contract.
SCOPE: Admin list/create/update/delete helpers and multipart image upload behavior.
DEPENDS: vitest, @/shared/api, ./adminProductApi
LINKS: [AdminProductApi][uploadImage][BLOCK_UPLOAD_IMAGE_FORM]

MODULE_MAP:
- spec-suite - Module-local Vitest specification surface.
TEST_CONTRACT:
PURPOSE: Verify the governed behavior described by MODULE_CONTRACT.
INPUTS: Mocked module state, props, events, or transport data defined in this spec.
OUTPUTS: Deterministic pass/fail assertions over the governed behavior.
SIDE_EFFECTS: Local mock mutation and test-only environment setup.
START_BLOCK_UPLOAD_IMAGE_FORM_TEST
Module-local coverage for the admin catalog mutation helpers.
END_BLOCK_UPLOAD_IMAGE_FORM_TEST
CHANGE_SUMMARY: Adds coverage for admin product mutations and multipart image upload requests.
*/
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { client } from '@/shared/api';

import {
  adminCreateProduct,
  adminDeleteProduct,
  adminListProducts,
  adminUpdateProduct,
  adminUploadImage,
} from './adminProductApi';

type AdapterResponse = {
  data: unknown;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: unknown;
  request: unknown;
};

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('adminProductApi', () => {
  it('returns the items array from the list envelope', async () => {
    const observedRequests: Array<{ url?: string }> = [];

    const adapterTarget = client.defaults as any;
    adapterTarget.adapter = async (config: any): Promise<AdapterResponse> => {
      observedRequests.push({
        url: config.url,
      });

      return {
        data: {
          items: [
            {
              id: 'product-1',
              name: 'Alpha',
              price: {
                amount: 2500,
                currency: 'RUB',
              },
              stock: 8,
              image_url: null,
              thumbnail_url: null,
              attributes: [
                { key: 'material', value: 'steel' },
              ],
            },
          ],
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
        request: {},
      };
    };

    const result = await adminListProducts();

    expect(observedRequests).toEqual([
      { url: '/v1/admin/products' },
    ]);
    expect(result).toEqual([
      {
        id: 'product-1',
        name: 'Alpha',
        price: {
          amount: 2500,
          currency: 'RUB',
        },
        stock: 8,
        image_url: null,
        thumbnail_url: null,
        attributes: [
          { key: 'material', value: 'steel' },
        ],
      },
    ]);
  });

  it('passes create, update, and delete payloads through to the backend', async () => {
    const observedRequests: Array<{
      method?: string;
      url?: string;
      data?: unknown;
    }> = [];

    const adapterTarget = client.defaults as any;
    adapterTarget.adapter = async (config: any): Promise<AdapterResponse> => {
      observedRequests.push({
        method: config.method,
        url: config.url,
        data: config.data,
      });

      return {
        data: config.method === 'post' || config.method === 'put'
          ? {
              id: 'product-1',
              name: config.method === 'post' ? 'Gamma' : 'Beta',
              price: {
                amount: config.method === 'post' ? 1800 : 3200,
                currency: 'RUB',
              },
              stock: config.method === 'post' ? 9 : 4,
              image_url: 'https://cdn.test/image.jpg',
              thumbnail_url: 'https://cdn.test/thumb.jpg',
              attributes: config.method === 'post'
                ? [
                    { key: 'material', value: 'steel' },
                  ]
                : [
                    { key: 'material', value: 'aluminum' },
                  ],
            }
          : undefined,
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
        request: {},
      };
    };

    const created = await adminCreateProduct({
      name: 'Gamma',
      price: {
        amount: 1800,
        currency: 'RUB',
      },
      stock: 9,
      attributes: [
        { key: 'material', value: 'steel' },
      ],
    });
    const updated = await adminUpdateProduct('product-1', {
      name: 'Beta',
      price: {
        amount: 3200,
        currency: 'RUB',
      },
      attributes: [
        { key: 'material', value: 'aluminum' },
      ],
    });
    const deleted = await adminDeleteProduct('product-1');

    expect(created).toMatchObject({
      name: 'Gamma',
      price: {
        amount: 1800,
        currency: 'RUB',
      },
      stock: 9,
      attributes: [
        { key: 'material', value: 'steel' },
      ],
    });
    expect(updated).toMatchObject({
      id: 'product-1',
      name: 'Beta',
      price: {
        amount: 3200,
        currency: 'RUB',
      },
      stock: 4,
      attributes: [
        { key: 'material', value: 'aluminum' },
      ],
    });
    expect(deleted).toBeUndefined();
    expect(observedRequests).toEqual([
      {
        method: 'post',
        url: '/v1/admin/products',
        data: JSON.stringify({
          name: 'Gamma',
          price: 1800,
          stock: 9,
          attributes: [
            { key: 'material', value: 'steel' },
          ],
        }),
      },
      {
        method: 'put',
        url: '/v1/admin/products/product-1',
        data: JSON.stringify({
          name: 'Beta',
          price: 3200,
          attributes: [
            { key: 'material', value: 'aluminum' },
          ],
        }),
      },
      {
        method: 'delete',
        url: '/v1/admin/products/product-1',
        data: undefined,
      },
    ]);
  });

  it('uploads product images as multipart form data', async () => {
    const file = new File(['image-bytes'], 'product.jpg', { type: 'image/jpeg' });
    let observedFormData: FormData | null = null;
    let observedHeaders: unknown = null;

    const adapterTarget = client.defaults as any;
    adapterTarget.adapter = async (config: any): Promise<AdapterResponse> => {
      observedFormData = config.data as FormData;
      observedHeaders = config.headers;

      return {
        data: {
          image_url: 'https://cdn.test/image.jpg',
          thumbnail_url: 'https://cdn.test/thumb.jpg',
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
        request: {},
      };
    };

    const result = await adminUploadImage('product-1', file);

    expect(result).toEqual({
      image_url: 'https://cdn.test/image.jpg',
      thumbnail_url: 'https://cdn.test/thumb.jpg',
    });
    expect(observedFormData).toBeInstanceOf(FormData);
    const uploadedFile = (observedFormData as any)?.get('file') ?? null;
    expect(uploadedFile).toBe(file);

    const headerBag = observedHeaders as any;
    const contentType = typeof headerBag.get === 'function'
      ? headerBag.get('Content-Type')
      : headerBag['Content-Type'] ?? headerBag['content-type'];

    expect(String(contentType)).toContain('multipart/form-data');
  });
});

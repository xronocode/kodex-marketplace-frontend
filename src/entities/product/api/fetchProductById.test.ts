/*
MODULE_CONTRACT: Verify the public product detail fetch helper contract.
SCOPE: Detail request path and offers_sort forwarding.
DEPENDS: vitest, @/shared/api, ./fetchProductById
LINKS: [ProductEntityApi][fetchProductById][BLOCK_REQUEST_PRODUCT_DETAIL]

MODULE_MAP:
- spec-suite - Module-local Vitest specification surface.
TEST_CONTRACT:
PURPOSE: Verify the governed behavior described by MODULE_CONTRACT.
INPUTS: Mocked module state, props, events, or transport data defined in this spec.
OUTPUTS: Deterministic pass/fail assertions over the governed behavior.
SIDE_EFFECTS: Local mock mutation and test-only environment setup.
START_BLOCK_REQUEST_PRODUCT_DETAIL_TEST
Module-local coverage for the public product detail adapter.
END_BLOCK_REQUEST_PRODUCT_DETAIL_TEST
CHANGE_SUMMARY: Adds coverage for product detail request routing and offer sort propagation.
*/
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { client } from '@/shared/api';

import { fetchProductById } from './fetchProductById';

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

describe('fetchProductById', () => {
  it('forwards offers_sort and returns the backend detail payload', async () => {
    const observedRequests: Array<{
      url?: string;
      params?: unknown;
    }> = [];

    const adapterTarget = client.defaults as any;
    adapterTarget.adapter = async (config: any): Promise<AdapterResponse> => {
      observedRequests.push({
        url: config.url,
        params: config.params,
      });

      return {
        data: {
          id: 'product-1',
          name: 'Alpha',
          image_url: 'https://cdn.test/image.jpg',
          attributes: [
            { key: 'material', value: 'steel' },
          ],
          offers: [
            {
              id: 'offer-1',
              seller: {
                name: 'Seller One',
                rating: 4.8,
              },
              price: {
                amount: 1899,
                currency: 'RUB',
              },
              delivery_date: '2026-04-05',
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

    const result = await fetchProductById('product-1', 'delivery_date');

    expect(observedRequests).toEqual([
      {
        url: '/v1/public/products/product-1',
        params: {
          offers_sort: 'delivery_date',
        },
      },
    ]);
    expect(result).toEqual({
      id: 'product-1',
      name: 'Alpha',
      image_url: 'https://cdn.test/image.jpg',
      attributes: [
        { key: 'material', value: 'steel' },
      ],
      offers: [
        {
          id: 'offer-1',
          seller: {
            name: 'Seller One',
            rating: 4.8,
          },
          price: {
            amount: 1899,
            currency: 'RUB',
          },
          delivery_date: '2026-04-05',
        },
      ],
    });
  });
});

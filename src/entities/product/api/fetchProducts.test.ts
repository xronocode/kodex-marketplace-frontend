/*
MODULE_CONTRACT: Verify the public product list fetch helper contract.
SCOPE: Cursor and limit forwarding plus X-Total-Count parsing.
DEPENDS: vitest, @/shared/api, ./fetchProducts
LINKS: [ProductEntityApi][fetchProducts][BLOCK_REQUEST_PRODUCTS]

MODULE_MAP:
- spec-suite - Module-local Vitest specification surface.
TEST_CONTRACT:
PURPOSE: Verify the governed behavior described by MODULE_CONTRACT.
INPUTS: Mocked module state, props, events, or transport data defined in this spec.
OUTPUTS: Deterministic pass/fail assertions over the governed behavior.
SIDE_EFFECTS: Local mock mutation and test-only environment setup.
START_BLOCK_REQUEST_PRODUCTS_TEST
Module-local coverage for the public catalog list adapter.
END_BLOCK_REQUEST_PRODUCTS_TEST
CHANGE_SUMMARY: Adds coverage for catalog list cursor forwarding and count header parsing.
*/
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { client } from '@/shared/api';

import { fetchProducts } from './fetchProducts';

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

describe('fetchProducts', () => {
  it('parses X-Total-Count and forwards cursor and limit', async () => {
    const observedRequests: Array<{
      url?: string;
      params?: unknown;
      method?: string;
    }> = [];

    const adapterTarget = client.defaults as any;
    adapterTarget.adapter = async (config: any): Promise<AdapterResponse> => {
      observedRequests.push({
        url: config.url,
        params: config.params,
        method: config.method,
      });

      return {
        data: {
          items: [
            {
              id: 'product-1',
              name: 'Alpha',
              price: {
                amount: 1499.5,
                currency: 'RUB',
              },
              stock: 3,
              thumbnail_url: 'https://cdn.test/thumb.jpg',
              nearest_delivery_date: '2026-04-01',
            },
          ],
          next_cursor: 'cursor-2',
        },
        status: 200,
        statusText: 'OK',
        headers: {
          'x-total-count': '37',
        },
        config,
        request: {},
      };
    };

    const result = await fetchProducts('cursor-1', 15);

    expect(observedRequests).toEqual([
      {
        url: '/v1/public/products',
        params: {
          cursor: 'cursor-1',
          limit: 15,
        },
        method: 'get',
      },
    ]);
    expect(result.totalCount).toBe(37);
    expect(result.data).toEqual({
      items: [
        {
          id: 'product-1',
          name: 'Alpha',
          price: {
            amount: 1499.5,
            currency: 'RUB',
          },
          stock: 3,
          thumbnail_url: 'https://cdn.test/thumb.jpg',
          nearest_delivery_date: '2026-04-01',
        },
      ],
      next_cursor: 'cursor-2',
    });
  });

  it('omits cursor when it is not provided', async () => {
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
          items: [],
          next_cursor: null,
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
        request: {},
      };
    };

    const result = await fetchProducts();

    expect(observedRequests).toEqual([
      {
        url: '/v1/public/products',
        params: {
          limit: 20,
        },
      },
    ]);
    expect(result.totalCount).toBe(0);
  });
});

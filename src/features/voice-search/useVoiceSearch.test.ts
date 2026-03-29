/*
MODULE_CONTRACT: Verify the voice-search composable support fallback, typed search dispatch, and recognition cleanup.
SCOPE: Browser support checks, search result assignment, and error-free recognition teardown only.
DEPENDS: ./useVoiceSearch, @/shared/api, vitest
LINKS: [VoiceSearch][support][BLOCK_SUPPORT_CHECK], [VoiceSearch][recognition][BLOCK_RECOGNITION_SETUP], [VoiceSearch][agentSearch][BLOCK_AGENT_SEARCH]

MODULE_MAP:
- spec-suite - Module-local Vitest specification surface.
TEST_CONTRACT:
PURPOSE: Verify the governed behavior described by MODULE_CONTRACT.
INPUTS: Mocked module state, props, events, or transport data defined in this spec.
OUTPUTS: Deterministic pass/fail assertions over the governed behavior.
SIDE_EFFECTS: Local mock mutation and test-only environment setup.
START_BLOCK_MODULE
Module-local tests for the voice-search composable.
END_BLOCK_MODULE
START_BLOCK_SUPPORT_CHECK
[VoiceSearch][support][BLOCK_SUPPORT_CHECK] Assert unsupported browsers do not throw and leave the feature disabled.
END_BLOCK_SUPPORT_CHECK
START_BLOCK_RECOGNITION_SETUP
[VoiceSearch][recognition][BLOCK_RECOGNITION_SETUP] Assert recognition errors stop listening without surfacing runtime exceptions.
END_BLOCK_RECOGNITION_SETUP
START_BLOCK_AGENT_SEARCH
[VoiceSearch][agentSearch][BLOCK_AGENT_SEARCH] Assert typed agent search results and interpreted intent are stored.
END_BLOCK_AGENT_SEARCH
CHANGE_SUMMARY: Adds coverage for unsupported-browser fallback, text search, and recognition cleanup.
*/
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ProductListResponse } from '@/entities/product';

type AgentSearchMock = ReturnType<typeof vi.fn>;

const mockAgentSearch: AgentSearchMock = vi.fn();

vi.mock('@/shared/api', () => ({
  agentSearch: mockAgentSearch,
}));

async function loadVoiceSearch() {
  vi.resetModules();
  return import('./useVoiceSearch');
}

beforeEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  mockAgentSearch.mockReset();
});

describe('useVoiceSearch', () => {
  it('keeps support disabled and allows text search when speech recognition is unavailable', async () => {
    const { useVoiceSearch } = await loadVoiceSearch();

    mockAgentSearch.mockResolvedValue({
      data: {
        items: [
          { id: 'p-1', name: 'Alpha', thumbnail_url: null, price: { amount: 1, currency: 'RUB' }, stock: 1, nearest_delivery_date: null },
        ],
        next_cursor: null,
      } satisfies ProductListResponse,
      interpretedIntent: 'interpreted alpha',
    });

    const voiceSearch = useVoiceSearch();

    expect(voiceSearch.isSupported.value).toBe(false);

    voiceSearch.start();
    voiceSearch.stop();
    await voiceSearch.search('alpha shoes');

    expect(mockAgentSearch).toHaveBeenCalledWith('alpha shoes');
    expect(voiceSearch.results.value).toEqual([
      { id: 'p-1', name: 'Alpha', thumbnail_url: null, price: { amount: 1, currency: 'RUB' }, stock: 1, nearest_delivery_date: null },
    ]);
    expect(voiceSearch.interpretedIntent.value).toBe('interpreted alpha');
    expect(voiceSearch.error.value).toBeNull();
  });

  it('stores typed search results from the agent search response', async () => {
    const { useVoiceSearch } = await loadVoiceSearch();

    mockAgentSearch.mockResolvedValue({
      data: {
        items: [
          { id: 'p-2', name: 'Beta', thumbnail_url: null, price: { amount: 2, currency: 'RUB' }, stock: 3, nearest_delivery_date: null },
        ],
        next_cursor: null,
      } satisfies ProductListResponse,
      interpretedIntent: 'interpreted beta',
    });

    const voiceSearch = useVoiceSearch();
    await voiceSearch.search('beta');

    expect(voiceSearch.results.value[0]).toEqual({
      id: 'p-2',
      name: 'Beta',
      thumbnail_url: null,
      price: { amount: 2, currency: 'RUB' },
      stock: 3,
      nearest_delivery_date: null,
    });
    expect(voiceSearch.interpretedIntent.value).toBe('interpreted beta');
    expect(voiceSearch.isLoading.value).toBe(false);
  });

  it('starts a search after a final spoken result is captured', async () => {
    type MockTranscriptAlternative = { confidence: number; transcript: string };
    type MockTranscriptResult = {
      0: MockTranscriptAlternative;
      isFinal: boolean;
      item(index: number): MockTranscriptAlternative | undefined;
      length: number;
    };

    class MockRecognition {
      static lastInstance: MockRecognition | null = null;

      continuous = false;
      interimResults = false;
      lang = '';
      maxAlternatives = 0;
      onend: (() => void) | null = null;
      onerror: ((event: { error: string; message?: string }) => void) | null = null;
      onresult: ((event: { resultIndex: number; results: ArrayLike<MockTranscriptResult> }) => void) | null = null;

      constructor() {
        MockRecognition.lastInstance = this;
      }

      start() {}

      stop() {}
    }

    vi.stubGlobal('SpeechRecognition', MockRecognition);

    const { useVoiceSearch } = await loadVoiceSearch();

    mockAgentSearch.mockResolvedValue({
      data: {
        items: [
          { id: 'p-3', name: 'Gamma', thumbnail_url: null, price: { amount: 3, currency: 'RUB' }, stock: 5, nearest_delivery_date: null },
        ],
        next_cursor: null,
      } satisfies ProductListResponse,
      interpretedIntent: 'interpreted gamma',
    });

    const voiceSearch = useVoiceSearch();
    voiceSearch.start();

    const result: MockTranscriptResult = {
      0: {
        confidence: 0.98,
        transcript: 'gamma',
      },
      isFinal: true,
      item(index: number) {
        return index === 0 ? this[0] : undefined;
      },
      length: 1,
    };

    MockRecognition.lastInstance?.onresult?.({
      resultIndex: 0,
      results: [result],
    });

    await Promise.resolve();

    expect(mockAgentSearch).toHaveBeenCalledWith('gamma');
    expect(voiceSearch.transcript.value).toBe('gamma');
    expect(voiceSearch.results.value[0]?.id).toBe('p-3');
    expect(voiceSearch.interpretedIntent.value).toBe('interpreted gamma');
    expect(voiceSearch.isLoading.value).toBe(false);
  });

  it('stops listening cleanly when recognition reports an error', async () => {
    class MockRecognition {
      static lastInstance: MockRecognition | null = null;

      continuous = false;
      interimResults = false;
      lang = '';
      maxAlternatives = 0;
      onend: (() => void) | null = null;
      onerror: ((event: { error: string; message?: string }) => void) | null = null;
      onresult: ((event: { resultIndex: number; results: ArrayLike<{ item(index: number): { transcript: string } | undefined; [index: number]: { transcript: string } | undefined }> }) => void) | null = null;

      constructor() {
        MockRecognition.lastInstance = this;
      }

      start() {}

      stop() {}
    }

    vi.stubGlobal('SpeechRecognition', MockRecognition);

    const { useVoiceSearch } = await loadVoiceSearch();
    const voiceSearch = useVoiceSearch();

    voiceSearch.start();
    expect(voiceSearch.isListening.value).toBe(true);

    MockRecognition.lastInstance?.onerror?.({ error: 'network' });

    expect(voiceSearch.isListening.value).toBe(false);
    expect(() => voiceSearch.stop()).not.toThrow();
  });
});

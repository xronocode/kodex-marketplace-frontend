/*
MODULE_CONTRACT: Implement browser voice capture, graceful fallback, and typed agent-search integration for voice search.
SCOPE: SpeechRecognition feature detection, transcript/listening state, typed product search dispatch, and error suppression on recognition teardown.
DEPENDS: @/shared/api, @/entities/product, vue
LINKS: [VoiceSearch][support][BLOCK_SUPPORT_CHECK], [VoiceSearch][recognition][BLOCK_RECOGNITION_SETUP], [VoiceSearch][agentSearch][BLOCK_AGENT_SEARCH]

MODULE_MAP:
- useVoiceSearch - Public export declared in this module.
CONTRACT:
PURPOSE: Execute the composable behavior described by MODULE_CONTRACT.
INPUTS: Function parameters plus reactive, browser, or transport dependencies declared in this module.
OUTPUTS: Reactive state objects and helper functions returned by the composable.
SIDE_EFFECTS: Reactive state mutation, browser API access, and optional HTTP calls.
START_BLOCK_MODULE
Voice-search composable that manages browser support detection, speech capture, and typed product search results.
END_BLOCK_MODULE
START_BLOCK_SUPPORT_CHECK
[VoiceSearch][support][BLOCK_SUPPORT_CHECK] Detect Web Speech API availability without throwing in unsupported browsers.
END_BLOCK_SUPPORT_CHECK
START_BLOCK_RECOGNITION_SETUP
[VoiceSearch][recognition][BLOCK_RECOGNITION_SETUP] Configure recognition lifecycle handlers for transcript updates and silent cleanup.
END_BLOCK_RECOGNITION_SETUP
START_BLOCK_AGENT_SEARCH
[VoiceSearch][agentSearch][BLOCK_AGENT_SEARCH] Dispatch typed product search requests and preserve interpreted intent metadata.
END_BLOCK_AGENT_SEARCH
CHANGE_SUMMARY: Adds a support-aware voice search composable with typed product search integration and non-throwing recognition cleanup.
*/
import { computed, ref } from 'vue';

import { agentSearch } from '@/shared/api';
import type { ProductListItem, ProductListResponse } from '@/entities/product';

interface SpeechRecognitionAlternativeLike {
  confidence: number;
  transcript: string;
}

interface SpeechRecognitionResultLike extends ArrayLike<SpeechRecognitionAlternativeLike> {
  isFinal?: boolean;
  item(index: number): SpeechRecognitionAlternativeLike | undefined;
}

interface SpeechRecognitionResultEventLike {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
}

interface SpeechRecognitionErrorEventLike {
  error: string;
  message?: string;
}

interface SpeechRecognitionInstanceLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onresult: ((event: SpeechRecognitionResultEventLike) => void) | null;
  start(): void;
  stop(): void;
}

interface SpeechRecognitionConstructorLike {
  new (): SpeechRecognitionInstanceLike;
}

interface SpeechRecognitionGlobalLike {
  SpeechRecognition?: SpeechRecognitionConstructorLike;
  webkitSpeechRecognition?: SpeechRecognitionConstructorLike;
}

type VoiceSearchError = string | null;

const DEFAULT_LANGUAGE = 'ru-RU';
const FALLBACK_SEARCH_ERROR = 'Поиск недоступен';

function getSpeechRecognitionConstructor(): SpeechRecognitionConstructorLike | null {
  const speechWindow = globalThis as typeof globalThis & SpeechRecognitionGlobalLike;

  return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition ?? null;
}

function readBestTranscript(results: ArrayLike<SpeechRecognitionResultLike>): string {
  const parts: string[] = [];

  for (let index = 0; index < results.length; index += 1) {
    const result = results[index];
    const alternative = result.item(0) ?? result[0];

    if (alternative) {
      parts.push(alternative.transcript);
    }
  }

  return parts.join(' ').trim();
}

function normalizeErrorMessage(): string {
  return FALLBACK_SEARCH_ERROR;
}

export function useVoiceSearch() {
  const isSupported = computed(() => getSpeechRecognitionConstructor() !== null);
  const isListening = ref(false);
  const transcript = ref('');
  const results = ref<ProductListItem[] | null>(null);
  const interpretedIntent = ref<string | null>(null);
  const isLoading = ref(false);
  const error = ref<VoiceSearchError>(null);

  let recognition: SpeechRecognitionInstanceLike | null = null;

  function stopListening() {
    if (recognition === null) {
      isListening.value = false;
      return;
    }

    try {
      recognition.stop();
    } catch {
      // Recognition cleanup must not surface browser-specific exceptions.
    } finally {
      isListening.value = false;
    }
  }

  function handleResult(event: SpeechRecognitionResultEventLike) {
    transcript.value = readBestTranscript(event.results);

    const latestResult = event.results[event.results.length - 1];

    if (latestResult?.isFinal === true && transcript.value.length > 0) {
      void search(transcript.value);
    }
  }

  function handleRecognitionError() {
    isListening.value = false;
    isLoading.value = false;
  }

  function handleRecognitionEnd() {
    isListening.value = false;
  }

  function setupRecognition() {
    const Recognition = getSpeechRecognitionConstructor();

    if (Recognition === null) {
      recognition = null;
      return null;
    }

    const instance = new Recognition();
    instance.continuous = false;
    instance.interimResults = true;
    instance.lang = DEFAULT_LANGUAGE;
    instance.maxAlternatives = 1;
    instance.onresult = handleResult;
    instance.onerror = handleRecognitionError;
    instance.onend = handleRecognitionEnd;
    recognition = instance;

    return instance;
  }

  function start() {
    if (!isSupported.value) {
      return;
    }

    if (recognition === null) {
      setupRecognition();
    }

    if (recognition === null) {
      return;
    }

    error.value = null;
    transcript.value = '';
    isListening.value = true;

    try {
      recognition.start();
    } catch {
      isListening.value = false;
    }
  }

  async function search(query: string = transcript.value): Promise<void> {
    const normalizedQuery = query.trim();

    if (normalizedQuery.length === 0) {
      return;
    }

    isLoading.value = true;
    error.value = null;

    try {
      stopListening();
      const response = await agentSearch<ProductListItem[]>(normalizedQuery);

      results.value = response.data.map((item: any) => ({
        ...item,
        price: typeof item.price === 'number' || typeof item.price === 'string'
          ? { amount: Number(item.price), currency: 'RUB' }
          : item.price
      }));
      interpretedIntent.value = response.interpretedIntent;
    } catch {
      error.value = normalizeErrorMessage();
    } finally {
      isLoading.value = false;
    }
  }

  return {
    error,
    interpretedIntent,
    isListening,
    isSupported,
    isLoading,
    results,
    search,
    start,
    stop: stopListening,
    transcript,
  };
}

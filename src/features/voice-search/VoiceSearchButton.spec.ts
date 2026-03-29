/*
MODULE_CONTRACT: Verify the voice-search trigger hides when unsupported and forwards click events when rendered.
SCOPE: Support gating and event emission only.
DEPENDS: ./VoiceSearchButton.vue, vitest, @vue/test-utils
LINKS: [VoiceSearch][support][BLOCK_SUPPORT_CHECK]

MODULE_MAP:
- spec-suite - Module-local Vitest specification surface.
TEST_CONTRACT:
PURPOSE: Verify the governed behavior described by MODULE_CONTRACT.
INPUTS: Mocked module state, props, events, or transport data defined in this spec.
OUTPUTS: Deterministic pass/fail assertions over the governed behavior.
SIDE_EFFECTS: Local mock mutation and test-only environment setup.
START_BLOCK_MODULE
Module-local tests for the voice-search trigger button.
END_BLOCK_MODULE
START_BLOCK_SUPPORT_CHECK
[VoiceSearch][support][BLOCK_SUPPORT_CHECK] Assert the trigger is hidden without browser speech recognition support.
END_BLOCK_SUPPORT_CHECK
CHANGE_SUMMARY: Adds coverage for support-aware rendering and click event emission.
*/
import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import VoiceSearchButton from './VoiceSearchButton.vue';

beforeEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('VoiceSearchButton', () => {
  it('hides itself when speech recognition is unavailable', () => {
    const wrapper = mount(VoiceSearchButton);

    expect(wrapper.find('button').exists()).toBe(false);
  });

  it('emits click when support is available', async () => {
    class MockRecognition {
      continuous = false;
      interimResults = false;
      lang = '';
      maxAlternatives = 0;
      onend: (() => void) | null = null;
      onerror: ((event: { error: string; message?: string }) => void) | null = null;
      onresult: ((event: { resultIndex: number; results: ArrayLike<{ item(index: number): { transcript: string } | undefined; [index: number]: { transcript: string } | undefined }> }) => void) | null = null;

      start() {}

      stop() {}
    }

    vi.stubGlobal('SpeechRecognition', MockRecognition);

    const wrapper = mount(VoiceSearchButton);

    await wrapper.find('button').trigger('click');

    expect(wrapper.emitted('click')).toHaveLength(1);
  });
});

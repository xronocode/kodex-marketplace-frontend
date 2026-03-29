/*
MODULE_CONTRACT: Expose the public voice-search feature surface for frontend consumers.
SCOPE: Re-export the voice-search composable and trigger button only.
DEPENDS: ./useVoiceSearch, ./VoiceSearchButton.vue
LINKS: [VoiceSearch][support][BLOCK_SUPPORT_CHECK]

MODULE_MAP:
- VoiceSearchButton - Public export declared in this module.
- useVoiceSearch - Public export declared in this module.
CONTRACT:
PURPOSE: Re-export the governed public surface for this slice or layer.
INPUTS: Internal exports referenced by the barrel statements below.
OUTPUTS: Stable named exports for upstream consumers.
SIDE_EFFECTS: none.
START_BLOCK_MODULE
Public entrypoint for the voice-search feature slice.
END_BLOCK_MODULE
CHANGE_SUMMARY: Adds a narrow public API for the voice-search feature.
*/
export { default as VoiceSearchButton } from './VoiceSearchButton.vue';
export { useVoiceSearch } from './useVoiceSearch';

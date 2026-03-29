/*
MODULE_CONTRACT: Define the public export surface for shared frontend UI primitives.
SCOPE: Button, Badge, Spinner component exports only.
DEPENDS: ./Button.vue, ./Badge.vue, ./Spinner.vue
LINKS: [FrontendSharedUi][render][BLOCK_RENDER_SHARED_UI]

MODULE_MAP:
- Badge - Public export declared in this module.
- Button - Public export declared in this module.
- Spinner - Public export declared in this module.
CONTRACT:
PURPOSE: Re-export the governed public surface for this slice or layer.
INPUTS: Internal exports referenced by the barrel statements below.
OUTPUTS: Stable named exports for upstream consumers.
SIDE_EFFECTS: none.
START_BLOCK_RENDER_SHARED_UI
Re-export the shared UI primitives as the module public API.
END_BLOCK_RENDER_SHARED_UI
CHANGE_SUMMARY: Adds a narrow public API for shared UI primitives without app-specific logic.
*/
export { default as Badge } from './Badge.vue';
export { default as Button } from './Button.vue';
export { default as Spinner } from './Spinner.vue';

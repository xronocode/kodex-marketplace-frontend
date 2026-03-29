/*
MODULE_CONTRACT: Expose the public shared API surface for frontend transport helpers.
SCOPE: Re-export the shared client and agent transport helper only.
DEPENDS: ./client, ./agentApi
LINKS: [M-FE-SHARED-API][shared-api][BLOCK_DEFINE_INDEX]

MODULE_MAP:
- client - Public export declared in this module.
- agentSearch - Public export declared in this module.
CONTRACT:
PURPOSE: Re-export the governed public surface for this slice or layer.
INPUTS: Internal exports referenced by the barrel statements below.
OUTPUTS: Stable named exports for upstream consumers.
SIDE_EFFECTS: none.
START_BLOCK_MODULE
Public API boundary for the frontend shared transport layer.
END_BLOCK_MODULE
CHANGE_SUMMARY: Initial module index exposing only transport helpers.
*/
export { client } from './client';
export { agentSearch } from './agentApi';
export type { AgentSearchResult } from './agentApi';
